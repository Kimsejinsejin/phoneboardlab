"""
automation/threads.py
Threads 게시물 자동 업로드 자동화
SM-F711N (Galaxy Z Flip3) 1080x2640 기준
"""
from .base import (
    tap, swipe, wait, force_stop, am_start, send_text,
    tap_element, wait_for_element, push_image, push_video
)

PACKAGE = "com.instagram.barcelona"

COORDS = {
    "compose_btn":   (540, 2555),   # 하단 작성 버튼
    "text_field":    (540, 600),    # 텍스트 입력 필드
    "attach_media":  (80, 1800),    # 미디어 첨부 아이콘
    "first_media":   (180, 450),    # 갤러리 첫 번째 미디어
    "post_btn":      (950, 140),    # 게시 버튼 (우상단)
}

async def run(serial: str, campaign: dict) -> dict:
    """
    Threads 게시물 업로드 자동화
    campaign: {caption, hashtags, media_bytes, media_filename}
    """
    caption = campaign.get("caption", "")
    hashtags = campaign.get("hashtags", "")
    media_bytes = campaign.get("media_bytes", b"")
    media_filename = campaign.get("media_filename", "")
    full_text = f"{caption}\n{hashtags}".strip() if hashtags else caption

    log = []
    try:
        # 1. 앱 종료 및 파일 전송
        log.append("앱 종료 중...")
        await force_stop(serial, PACKAGE)
        await wait(1)

        if media_bytes and media_filename:
            is_video = media_filename.lower().endswith((".mp4", ".mov", ".avi"))
            if is_video:
                log.append(f"동영상 전송 중: {media_filename}")
                await push_video(serial, media_bytes, media_filename)
            else:
                log.append(f"이미지 전송 중: {media_filename}")
                await push_image(serial, media_bytes, media_filename)

        # 2. Threads 앱 실행
        log.append("Threads 실행...")
        await am_start(serial, f"-n {PACKAGE}/.activity.MainTabActivity")
        await wait(4)

        # 3. 새 스레드 작성 버튼 탭
        log.append("새 게시물 작성 버튼 탭...")
        found = await tap_element(serial, content_desc="새 스레드", retries=3)
        if not found:
            found = await tap_element(serial, content_desc="New thread", retries=3)
        if not found:
            found = await tap_element(serial, text="스레드 시작하기...", retries=3)
        if not found:
            await tap(serial, *COORDS["compose_btn"])
        await wait(2)

        # 4. 텍스트 입력
        if full_text:
            log.append("텍스트 입력...")
            found = await tap_element(serial, text="스레드 시작하기...", retries=3)
            if not found:
                found = await tap_element(serial, text="Start a thread...", retries=3)
            if not found:
                await tap(serial, *COORDS["text_field"])
            await wait(1)
            await send_text(serial, full_text)
            await wait(1)

        # 5. 미디어 첨부 (있을 경우)
        if media_bytes and media_filename:
            log.append("미디어 첨부...")
            # 사진/동영상 아이콘 탭
            found = await tap_element(serial, content_desc="사진 및 동영상", retries=3)
            if not found:
                found = await tap_element(serial, content_desc="Photos and videos", retries=3)
            if not found:
                await tap(serial, *COORDS["attach_media"])
            await wait(2)
            
            # 갤러리에서 첫 번째 미디어 선택
            await tap(serial, *COORDS["first_media"])
            await wait(1.5)
            
            # 확인/추가 버튼
            await tap_element(serial, text="추가", retries=3)
            await wait(1)

        # 6. 게시 버튼 탭
        log.append("게시 버튼 탭...")
        found = await tap_element(serial, text="게시", retries=4, delay=1.5)
        if not found:
            found = await tap_element(serial, text="Post", retries=4, delay=1.5)
        if not found:
            await tap(serial, *COORDS["post_btn"])
        await wait(3)

        log.append("✅ Threads 게시 완료!")
        return {"ok": True, "log": log}

    except Exception as e:
        log.append(f"❌ 오류: {str(e)}")
        return {"ok": False, "log": log, "error": str(e)}
