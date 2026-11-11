"""
main.py — AutoBoard Pro Backend
Moclou API 연동 + Campaign 스케줄러
"""
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime
import os, uuid, asyncio, io, base64
import httpx
from PIL import Image
from dotenv import load_dotenv
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.date import DateTrigger

load_dotenv()

MOCLOU_API_KEY  = os.getenv("MOCLOU_API_KEY", "")
MOCLOU_BASE_URL = os.getenv("MOCLOU_BASE_URL", "https://moclou.com:8443/api/v1")

app = FastAPI(title="AutoBoard Pro Backend")
scheduler = AsyncIOScheduler()

# ─── 인메모리 저장소 ─────────────────────────────────────────
campaigns_db: dict[str, dict] = {}   # campaign_id → campaign data
media_store:  dict[str, bytes] = {}  # campaign_id → file bytes

def moclou_headers():
    return {"Authorization": f"Bearer {MOCLOU_API_KEY}"}

# ─── 앱 생명주기 ─────────────────────────────────────────────
@app.on_event("startup")
async def startup():
    scheduler.start()

@app.on_event("shutdown")
async def shutdown():
    scheduler.shutdown()

# ═══════════════════════════════════════════════════════════════
# 기기 목록 조회 (Moclou API)
# ═══════════════════════════════════════════════════════════════
@app.get("/api/devices")
async def list_devices():
    try:
        async with httpx.AsyncClient(timeout=10.0) as c:
            r = await c.get(f"{MOCLOU_BASE_URL}/devices", headers=moclou_headers())
            r.raise_for_status()
            data = r.json()
            raw = data if isinstance(data, list) else data.get("value", [])
            devices = [
                {
                    "serial":        d["Serial"],
                    "state":         "device" if d["Status"] in ("Online", "InUse") else "offline",
                    "nickname":      d.get("Nickname", ""),
                    "model":         d.get("Model", ""),
                    "status":        d["Status"],
                    "assignment_id": d.get("AssignmentId"),
                }
                for d in raw
            ]
            return {"status": "success", "devices": devices}
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=e.response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ═══════════════════════════════════════════════════════════════
# ADB 명령 전송 (Moclou API)
# ═══════════════════════════════════════════════════════════════
class CommandRequest(BaseModel):
    serial: Any   # str 또는 list[str]
    action: str = "ADB_SHELL"
    cmd: Optional[str] = None
    text: Optional[str] = None
    package_name: Optional[str] = None
    remote_path: Optional[str] = None
    paste: Optional[bool] = False

@app.post("/api/command")
async def send_command(req: CommandRequest):
    body: dict = {"Serial": req.serial, "Action": req.action.upper()}
    if req.cmd:           body["Cmd"]         = req.cmd
    if req.text:          body["Text"]         = req.text
    if req.package_name:  body["PackageName"]  = req.package_name
    if req.remote_path:   body["RemotePath"]   = req.remote_path
    if req.paste:         body["Paste"]        = req.paste

    try:
        async with httpx.AsyncClient(timeout=30.0) as c:
            r = await c.post(f"{MOCLOU_BASE_URL}/commands", headers=moclou_headers(), json=body)
            r.raise_for_status()
            return r.json()
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=e.response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# SHELL_READ
class ShellReadRequest(BaseModel):
    serial: Any
    cmd: str

@app.post("/api/shell-read")
async def shell_read(req: ShellReadRequest):
    body = {"Serial": req.serial, "Action": "SHELL_READ", "Cmd": req.cmd}
    try:
        async with httpx.AsyncClient(timeout=20.0) as c:
            r = await c.post(f"{MOCLOU_BASE_URL}/commands", headers=moclou_headers(), json=body)
            r.raise_for_status()
            return r.json()
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=e.response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 파일 업로드 (PC → 기기)
@app.post("/api/file-upload")
async def file_upload(serial: str = Form(...), target_path: Optional[str] = Form(None), file: UploadFile = File(...)):
    try:
        fb = await file.read()
        async with httpx.AsyncClient(timeout=600.0) as c:
            files = {"file": (file.filename, fb, file.content_type or "application/octet-stream")}
            data = {"serial": serial}
            if target_path:
                data["targetPath"] = target_path
            r = await c.post(f"{MOCLOU_BASE_URL}/commands/file-upload", headers=moclou_headers(), data=data, files=files)
            r.raise_for_status()
            return r.json()
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=e.response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 파일 다운로드 (기기 → PC)
class FileDownloadRequest(BaseModel):
    serial: Any
    remote_path: str

@app.post("/api/file-download")
async def file_download(req: FileDownloadRequest):
    body = {"Serial": req.serial, "Action": "FILE_DOWNLOAD", "RemotePath": req.remote_path}
    try:
        async with httpx.AsyncClient(timeout=600.0) as c:
            r = await c.post(f"{MOCLOU_BASE_URL}/commands", headers=moclou_headers(), json=body)
            r.raise_for_status()
            ct = r.headers.get("content-type", "application/octet-stream")
            fn = req.remote_path.split("/")[-1]
            return StreamingResponse(io.BytesIO(r.content), media_type=ct,
                                     headers={"Content-Disposition": f"attachment; filename={fn}"})
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=e.response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# APK 설치
@app.post("/api/apk-install")
async def apk_install(serial: str = Form(...), reinstall: Optional[bool] = Form(False), file: UploadFile = File(...)):
    try:
        fb = await file.read()
        async with httpx.AsyncClient(timeout=600.0) as c:
            files = {"file": (file.filename, fb, "application/vnd.android.package-archive")}
            data = {"serial": serial, "reinstall": str(reinstall).lower()}
            r = await c.post(f"{MOCLOU_BASE_URL}/commands/apk-install", headers=moclou_headers(), data=data, files=files)
            r.raise_for_status()
            return r.json()
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=e.response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 기기 닉네임 변경
class NicknameRequest(BaseModel):
    nickname: str

@app.patch("/api/devices/{serial}/nickname")
async def update_nickname(serial: str, req: NicknameRequest):
    try:
        async with httpx.AsyncClient(timeout=10.0) as c:
            r = await c.patch(f"{MOCLOU_BASE_URL}/devices/{serial}/nickname",
                              headers=moclou_headers(), json={"Nickname": req.nickname})
            r.raise_for_status()
            return r.json()
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=e.response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════════════
# Campaign API
# ═══════════════════════════════════════════════════════════════

PLATFORM_RUNNERS = {
    "youtube":   "automation.youtube",
    "instagram": "automation.instagram",
    "threads":   "automation.threads",
    "tiktok":    "automation.tiktok",
}

async def _execute_campaign(campaign_id: str):
    """스케줄러가 호출하는 캠페인 실행 함수"""
    campaign = campaigns_db.get(campaign_id)
    if not campaign:
        return

    campaigns_db[campaign_id]["status"] = "running"
    campaigns_db[campaign_id]["started_at"] = datetime.now().isoformat()

    platform = campaign["platform"]
    serials   = campaign["serials"]
    media_bytes = media_store.get(campaign_id, b"")

    # 자동화 모듈 동적 import
    module_name = PLATFORM_RUNNERS.get(platform)
    if not module_name:
        campaigns_db[campaign_id]["status"] = "failed"
        campaigns_db[campaign_id]["results"] = [{"error": f"Unknown platform: {platform}"}]
        return

    import importlib
    mod = importlib.import_module(module_name)

    results = []
    for serial in serials:
        try:
            result = await mod.run(serial, {**campaign, "media_bytes": media_bytes})
            results.append({"serial": serial, **result})
        except Exception as e:
            results.append({"serial": serial, "ok": False, "error": str(e), "log": []})

    all_ok = all(r.get("ok") for r in results)
    campaigns_db[campaign_id]["status"]       = "completed" if all_ok else "failed"
    campaigns_db[campaign_id]["results"]      = results
    campaigns_db[campaign_id]["completed_at"] = datetime.now().isoformat()


# 캠페인 목록 조회
@app.get("/api/campaigns")
async def list_campaigns():
    items = []
    for cid, c in campaigns_db.items():
        items.append({
            "id":             cid,
            "platform":       c["platform"],
            "serials":        c["serials"],
            "device_count":   len(c["serials"]),
            "title":          c.get("title", ""),
            "caption":        c.get("caption", ""),
            "hashtags":       c.get("hashtags", ""),
            "media_filename": c.get("media_filename", ""),
            "scheduled_at":   c.get("scheduled_at", ""),
            "status":         c.get("status", "pending"),
            "results":        c.get("results", []),
            "created_at":     c.get("created_at", ""),
        })
    return {"campaigns": sorted(items, key=lambda x: x["created_at"], reverse=True)}


# 기기별 캠페인 목록 조회
@app.get("/api/devices/{serial}/campaigns")
async def list_device_campaigns(serial: str):
    """특정 기기에 할당된 캠페인 목록 반환"""
    items = []
    for cid, c in campaigns_db.items():
        if serial in c.get("serials", []):
            # 이 기기의 결과만 추출
            device_result = next(
                (r for r in c.get("results", []) if r.get("serial") == serial),
                None
            )
            items.append({
                "id":             cid,
                "platform":       c["platform"],
                "title":          c.get("title", ""),
                "caption":        c.get("caption", ""),
                "scheduled_at":   c.get("scheduled_at", ""),
                "status":         c.get("status", "pending"),
                "device_result":  device_result,
                "created_at":     c.get("created_at", ""),
            })
    return {
        "serial": serial,
        "campaigns": sorted(items, key=lambda x: x["scheduled_at"] or x["created_at"])
    }


# 캠페인 생성
@app.post("/api/campaigns")
async def create_campaign(
    platform:       str           = Form(...),
    serials:        str           = Form(...),   # JSON array string
    title:          Optional[str] = Form(""),
    caption:        Optional[str] = Form(""),
    hashtags:       Optional[str] = Form(""),
    scheduled_at:   Optional[str] = Form(None),  # ISO datetime string or None
    post_type:      Optional[str] = Form("post"),
    file: Optional[UploadFile]    = File(None),
):
    import json
    serial_list = json.loads(serials) if serials.startswith("[") else [s.strip() for s in serials.split(",")]

    campaign_id = str(uuid.uuid4())
    media_filename = ""
    if file and file.filename:
        media_filename = file.filename
        media_store[campaign_id] = await file.read()

    campaign = {
        "id":             campaign_id,
        "platform":       platform,
        "serials":        serial_list,
        "title":          title or "",
        "caption":        caption or "",
        "hashtags":       hashtags or "",
        "media_filename": media_filename,
        "scheduled_at":   scheduled_at or "",
        "post_type":      post_type or "post",
        "status":         "pending",
        "results":        [],
        "created_at":     datetime.now().isoformat(),
    }
    campaigns_db[campaign_id] = campaign

    # 스케줄 등록
    if scheduled_at:
        try:
            run_time = datetime.fromisoformat(scheduled_at)
            scheduler.add_job(
                _execute_campaign,
                trigger=DateTrigger(run_date=run_time),
                args=[campaign_id],
                id=campaign_id,
                replace_existing=True,
            )
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid scheduled_at: {e}")
    else:
        # 즉시 실행
        asyncio.create_task(_execute_campaign(campaign_id))

    return {"status": "success", "campaign_id": campaign_id, "campaign": campaign}


# 캠페인 즉시 실행
@app.post("/api/campaigns/{campaign_id}/run")
async def run_campaign_now(campaign_id: str):
    if campaign_id not in campaigns_db:
        raise HTTPException(status_code=404, detail="Campaign not found")
    asyncio.create_task(_execute_campaign(campaign_id))
    return {"status": "started", "campaign_id": campaign_id}


# 캠페인 삭제
@app.delete("/api/campaigns/{campaign_id}")
async def delete_campaign(campaign_id: str):
    if campaign_id not in campaigns_db:
        raise HTTPException(status_code=404, detail="Campaign not found")
    campaigns_db.pop(campaign_id, None)
    media_store.pop(campaign_id, None)
    try:
        scheduler.remove_job(campaign_id)
    except:
        pass
    return {"status": "deleted"}


# ═══════════════════════════════════════════════════════════════
# 화면 스트리밍 WebSocket (로컬 ADB - Moclou 미지원)
# ═══════════════════════════════════════════════════════════════
from fastapi import WebSocket, WebSocketDisconnect

@app.websocket("/api/stream/{device_id}")
async def stream_device(websocket: WebSocket, device_id: str):
    await websocket.accept()
    try:
        while True:
            try:
                proc = await asyncio.create_subprocess_exec(
                    "adb", "-s", device_id, "exec-out", "screencap", "-p",
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE
                )
                try:
                    stdout, _ = await asyncio.wait_for(proc.communicate(), timeout=4.0)
                except asyncio.TimeoutError:
                    try: proc.kill()
                    except: pass
                    continue

                if stdout:
                    try:
                        img = Image.open(io.BytesIO(stdout))
                        img.thumbnail((480, 800))
                        buf = io.BytesIO()
                        img.convert("RGB").save(buf, format="JPEG", quality=50)
                        b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
                        await websocket.send_text(f'{{"type":"frame","device_id":"{device_id}","data":"{b64}"}}')
                    except Exception as e:
                        print(f"Image error: {e}")
            except Exception as e:
                print(f"Capture error: {e}")
            await asyncio.sleep(0.5)
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"Stream error: {e}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
