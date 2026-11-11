"""
automation/linkedin.py
LinkedIn 게시물 자동화
SM-F711N (Galaxy Z Flip3) 1080x2640 기준
"""
from .base import (
    tap, swipe, wait, force_stop, am_start, send_text,
    tap_element, wait_for_element, push_image, push_video, key_event
)

PACKAGE = "com.linkedin.android"

COORDS = {
    "compose_btn": (540, 2555),   # 하단 + 게시 버튼
    "post_field":  (540, 500),    # 게시물 텍스트 입력 필드
    "photo_btn":   (90,  2430),   # 사진 첨부 버튼
    "first_media": (180, 450),    # 갤러리 첫 번째 미디어
    "next_btn":    (990, 140),    # 다음 버튼
    "post_btn":    (990, 140),    # 게시 버튼 (우상단)
}

async def run(serial: str, campaign: dict) -> dict:
    """
    LinkedIn 게시물 자동화
    campaign: {caption, hashtags, media_bytes, media_filename}
    """
    caption = campaign.get("caption", "")
    hashtags = campaign.get("hashtags", "")
    media_bytes = campaign.get("media_bytes", b"")
    media_filename = campaign.get("media_filename", "media.jpg")
    full_text = f"{caption}\n\n{hashtags}".strip() if hashtags else caption

    log = []
    try:
        # 1. 앱 종료 및 파일 전송
        log.append("앱 종료 중...")
        await force_stop(serial, PACKAGE)
        await wait(1)

        if media_bytes:
            is_video = media_filename.lower().endswith((".mp4", ".mov", ".avi"))
            if is_video:
                log.append(f"동영상 전송 중: {media_filename}")
                await push_video(serial, media_bytes, media_filename)
            else:
                log.append(f"이미지 전송 중: {media_filename}")
                await push_image(serial, media_bytes, media_filename)

        # 2. LinkedIn 실행
        log.append("LinkedIn 실행...")
        await am_start(serial, f"-n {PACKAGE}/.MainActivity")
        await wait(5)

        # 3. 게시물 작성 버튼 탭
        log.append("게시물 작성 버튼 탭...")
        found = await tap_element(serial, content_desc="게시", retries=3)
        if not found:
            found = await tap_element(serial, content_desc="Post", retries=3)
        if not found:
            await tap(serial, *COORDS["compose_btn"])
        await wait(2)

        # 4. 미디어 첨부 (있는 경우)
        if media_bytes:
            log.append("미디어 첨부...")
            found = await tap_element(serial, content_desc="사진 추가", retries=3)
            if not found:
                found = await tap_element(serial, content_desc="Add a photo", retries=3)
            if not found:
                await tap(serial, *COORDS["photo_btn"])
            await wait(2)
            await tap(serial, *COORDS["first_media"])
            await wait(2)

            # 다음 버튼
            found = await tap_element(serial, text="다음", retries=4, delay=1)
            if not found:
                await tap_element(serial, text="Next", retries=4, delay=1)
            await wait(2)

        # 5. 게시물 텍스트 입력
        if full_text:
            log.append("게시물 텍스트 입력...")
            found = await tap_element(serial, text="무슨 생각을 공유하고 싶으세요?", retries=3)
            if not found:
                found = await tap_element(serial, text="What do you want to talk about?", retries=3)
            if not found:
                await tap(serial, *COORDS["post_field"])
            await wait(1)
            await send_text(serial, full_text)
            await wait(1)

        # 6. 게시 버튼 탭
        log.append("게시 버튼 탭...")
        found = await tap_element(serial, text="게시", retries=4, delay=1.5)
        if not found:
            found = await tap_element(serial, text="Post", retries=4, delay=1.5)
        if not found:
            await tap(serial, *COORDS["post_btn"])
        await wait(3)

        log.append("✅ LinkedIn 게시 완료!")
        return {"ok": True, "log": log}

    except Exception as e:
        log.append(f"❌ 오류: {str(e)}")
        return {"ok": False, "log": log, "error": str(e)}
