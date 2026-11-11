"""
automation/twitter_x.py
X (구 Twitter) 트윗/미디어 게시 자동화
SM-F711N (Galaxy Z Flip3) 1080x2640 기준
"""
from .base import (
    tap, swipe, wait, force_stop, am_start, send_text,
    tap_element, wait_for_element, push_image, push_video, key_event
)

PACKAGE = "com.twitter.android"

COORDS = {
    "compose_btn":  (990, 2490),  # 작성 버튼 (우하단 FAB)
    "tweet_field":  (540, 400),   # 트윗 입력 필드
    "media_btn":    (90,  2430),  # 미디어 첨부 버튼
    "first_media":  (180, 450),   # 갤러리 첫 번째 미디어
    "tweet_btn":    (990, 140),   # 트윗(게시) 버튼 (우상단)
}

async def run(serial: str, campaign: dict) -> dict:
    """
    X(Twitter) 트윗 게시 자동화
    campaign: {caption, hashtags, media_bytes, media_filename}
    """
    caption = campaign.get("caption", "")
    hashtags = campaign.get("hashtags", "")
    media_bytes = campaign.get("media_bytes", b"")
    media_filename = campaign.get("media_filename", "media.jpg")
    full_text = f"{caption}\n{hashtags}".strip() if hashtags else caption

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

        # 2. X(Twitter) 실행
        log.append("X(Twitter) 실행...")
        await am_start(serial, f"-n {PACKAGE}/.StartActivity")
        await wait(4)

        # 3. 작성(Compose) 버튼 탭
        log.append("작성 버튼 탭...")
        found = await tap_element(serial, content_desc="새 트윗 작성", retries=3)
        if not found:
            found = await tap_element(serial, content_desc="Compose tweet", retries=3)
        if not found:
            await tap(serial, *COORDS["compose_btn"])
        await wait(2)

        # 4. 미디어 첨부
        if media_bytes:
            log.append("미디어 첨부...")
            found = await tap_element(serial, content_desc="미디어", retries=3)
            if not found:
                found = await tap_element(serial, content_desc="Media", retries=3)
            if not found:
                await tap(serial, *COORDS["media_btn"])
            await wait(2)
            await tap(serial, *COORDS["first_media"])
            await wait(2)

        # 5. 트윗 텍스트 입력
        if full_text:
            log.append("트윗 텍스트 입력...")
            found = await tap_element(serial, text="무슨 일이 일어나고 있나요?", retries=3)
            if not found:
                found = await tap_element(serial, text="What's happening?", retries=3)
            if not found:
                await tap(serial, *COORDS["tweet_field"])
            await wait(1)
            await send_text(serial, full_text)
            await wait(1)

        # 6. 트윗(게시) 버튼 탭
        log.append("게시 버튼 탭...")
        found = await tap_element(serial, text="트윗", retries=4, delay=1.5)
        if not found:
            found = await tap_element(serial, text="Tweet", retries=4, delay=1.5)
        if not found:
            found = await tap_element(serial, text="Post", retries=4, delay=1.5)
        if not found:
            await tap(serial, *COORDS["tweet_btn"])
        await wait(3)

        log.append("✅ X(Twitter) 게시 완료!")
        return {"ok": True, "log": log}

    except Exception as e:
        log.append(f"❌ 오류: {str(e)}")
        return {"ok": False, "log": log, "error": str(e)}
