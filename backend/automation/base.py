"""
automation/base.py
Moclou API를 통한 공통 기기 제어 함수 모음
SM-F711N (Galaxy Z Flip3) 기준: 1080 x 2640 portrait
"""
import httpx
import asyncio
import re
import os
from dotenv import load_dotenv

load_dotenv()

MOCLOU_API_KEY = os.getenv("MOCLOU_API_KEY", "")
MOCLOU_BASE_URL = os.getenv("MOCLOU_BASE_URL", "https://moclou.com:8443/api/v1")

def _headers():
    return {"Authorization": f"Bearer {MOCLOU_API_KEY}"}

# ─── 기본 명령 ────────────────────────────────────────────────

async def adb_shell(serial: str, cmd: str) -> dict:
    """ADB 셸 명령 전송 (출력 없음)"""
    async with httpx.AsyncClient(timeout=30.0) as c:
        r = await c.post(
            f"{MOCLOU_BASE_URL}/commands",
            headers=_headers(),
            json={"Serial": serial, "Action": "ADB_SHELL", "Cmd": cmd}
        )
        r.raise_for_status()
        return r.json()

async def shell_read(serial: str, cmd: str) -> str:
    """ADB 셸 명령 실행 후 출력 반환"""
    async with httpx.AsyncClient(timeout=20.0) as c:
        r = await c.post(
            f"{MOCLOU_BASE_URL}/commands",
            headers=_headers(),
            json={"Serial": serial, "Action": "SHELL_READ", "Cmd": cmd}
        )
        r.raise_for_status()
        return r.json().get("Message", "")

async def send_text(serial: str, text: str) -> dict:
    """텍스트 입력 (한글/특수문자 포함, ADBKeyboard 경유)"""
    async with httpx.AsyncClient(timeout=15.0) as c:
        r = await c.post(
            f"{MOCLOU_BASE_URL}/commands",
            headers=_headers(),
            json={"Serial": serial, "Action": "TEXT", "Text": text}
        )
        r.raise_for_status()
        return r.json()

async def push_file(serial: str, file_bytes: bytes, filename: str, target_path: str) -> dict:
    """파일을 기기로 전송"""
    async with httpx.AsyncClient(timeout=600.0) as c:
        files = {"file": (filename, file_bytes, "application/octet-stream")}
        data = {"serial": serial, "targetPath": target_path}
        r = await c.post(
            f"{MOCLOU_BASE_URL}/commands/file-upload",
            headers=_headers(), data=data, files=files
        )
        r.raise_for_status()
        return r.json()

# ─── UI 조작 ─────────────────────────────────────────────────

async def tap(serial: str, x: int, y: int):
    await adb_shell(serial, f"input tap {x} {y}")

async def swipe(serial: str, x1: int, y1: int, x2: int, y2: int, duration: int = 300):
    await adb_shell(serial, f"input swipe {x1} {y1} {x2} {y2} {duration}")

async def key_event(serial: str, keycode: int):
    """keyevent 전송 (3=홈, 4=뒤로, 66=엔터, 187=최근앱)"""
    await adb_shell(serial, f"input keyevent {keycode}")

async def wait(seconds: float):
    await asyncio.sleep(seconds)

# ─── 앱 제어 ─────────────────────────────────────────────────

async def launch_app(serial: str, package: str):
    """앱 실행"""
    await adb_shell(serial, f"monkey -p {package} 1")

async def force_stop(serial: str, package: str):
    """앱 강제 종료"""
    await adb_shell(serial, f"am force-stop {package}")

async def am_start(serial: str, intent: str):
    """am start로 특정 Activity/Intent 실행"""
    await adb_shell(serial, f"am start {intent}")

# ─── UI 자동화 (uiautomator dump) ────────────────────────────

async def dump_ui(serial: str) -> str:
    """현재 화면 UI 구조 dump"""
    return await shell_read(serial, "uiautomator dump /sdcard/ui_dump.xml && cat /sdcard/ui_dump.xml")

async def find_element(serial: str, text: str = None, content_desc: str = None) -> tuple[int, int] | None:
    """
    텍스트 또는 content-desc로 UI 요소를 찾아 중심 좌표 반환
    bounds="[x1,y1][x2,y2]" 형식에서 중심 좌표 계산
    """
    xml = await dump_ui(serial)
    
    # 검색 패턴들
    search_terms = []
    if text:
        search_terms.append(f'text="{re.escape(text)}"')
    if content_desc:
        search_terms.append(f'content-desc="{re.escape(content_desc)}"')
    
    for term in search_terms:
        # 같은 노드에서 bounds 찾기
        pattern = rf'{term}[^/]*?bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"'
        match = re.search(pattern, xml)
        if not match:
            # 역순으로도 찾기
            pattern2 = rf'bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"[^/]*?{term}'
            match = re.search(pattern2, xml)
        
        if match:
            x1, y1, x2, y2 = int(match.group(1)), int(match.group(2)), int(match.group(3)), int(match.group(4))
            cx, cy = (x1 + x2) // 2, (y1 + y2) // 2
            return (cx, cy)
    
    return None

async def tap_element(serial: str, text: str = None, content_desc: str = None,
                       retries: int = 5, delay: float = 1.5) -> bool:
    """
    텍스트/content-desc로 요소를 찾아 탭.
    retries 횟수만큼 재시도.
    """
    for i in range(retries):
        coords = await find_element(serial, text=text, content_desc=content_desc)
        if coords:
            await tap(serial, coords[0], coords[1])
            return True
        print(f"[{serial}] '{text or content_desc}' 요소 못 찾음 ({i+1}/{retries}), 재시도...")
        await wait(delay)
    return False

async def wait_for_element(serial: str, text: str = None, content_desc: str = None,
                            timeout: int = 15) -> bool:
    """요소가 나타날 때까지 대기"""
    for _ in range(timeout):
        coords = await find_element(serial, text=text, content_desc=content_desc)
        if coords:
            return True
        await wait(1)
    return False

# ─── 미디어 관련 ──────────────────────────────────────────────

async def media_scan(serial: str, file_path: str):
    """기기 갤러리 미디어 스캔 요청"""
    await adb_shell(serial, f"am broadcast -a android.intent.action.MEDIA_SCANNER_SCAN_FILE -d file://{file_path}")

async def push_video(serial: str, file_bytes: bytes, filename: str) -> str:
    """동영상 파일을 기기 Movies 폴더로 전송하고 경로 반환"""
    target = f"/sdcard/Movies/{filename}"
    await push_file(serial, file_bytes, filename, target)
    await media_scan(serial, target)
    await wait(2)  # 갤러리 인덱싱 대기
    return target

async def push_image(serial: str, file_bytes: bytes, filename: str) -> str:
    """이미지 파일을 기기 Pictures 폴더로 전송하고 경로 반환"""
    target = f"/sdcard/Pictures/{filename}"
    await push_file(serial, file_bytes, filename, target)
    await media_scan(serial, target)
    await wait(2)
    return target
