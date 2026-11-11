"""
automation/facebook.py
Facebook 게시물/릴스 자동 업로드 자동화
SM-F711N (Galaxy Z Flip3) 1080x2640 기준
"""
from .base import (
    tap, swipe, wait, force_stop, am_start, send_text,
    tap_element, wait_for_element, push_image, push_video, key_event
)

PACKAGE = "com.facebook.katana"

COORDS = {
    "whats_on_mind":  (540, 260),   # "무슨 생각을 하고 계세요?" 입력 필드
    "photo_btn":      (180, 370),   # 사진/동영상 버튼
    "first_media":    (180, 450),   # 갤러리 첫 번째 미디어
    "next_btn":       (990, 140),   # 다음 (우상단)
    "post_btn":       (540, 200),   # 게시 버튼
    "reels_btn":      (540, 450),   # 릴스 버튼
}

async def run(serial: str, campaign: dict) -> dict:
    """
    Facebook 게시물 또는 릴스 업로드 자동화
    campaign: {caption, hashtags, media_bytes, media_filename, post_type}
    post_type: 'post'(기본) | 'reels'
    """
    caption = campaign.get("caption", "")
    hashtags = campaign.get("hashtags", "")
    media_bytes = campaign.get("media_bytes", b"")
    media_filename = campaign.get("media_filename", "media.jpg")
    post_type = campaign.get("post_type", "post")
    full_caption = f"{caption}\n{hashtags}".strip() if hashtags else caption

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

        # 2. Facebook 실행
        log.append("Facebook 실행...")
        await am_start(serial, f"-n {PACKAGE}/.katana.main.MainActivity")
        await wait(5)

        # 3. 릴스 선택 or 일반 게시물
        if post_type == "reels":
            log.append("릴스 버튼 탭...")
            found = await tap_element(serial, text="릴스", retries=3)
            if not found:
                await tap_element(serial, text="Reels", retries=3)
            await wait(2)

            # 갤러리에서 미디어 선택
            found = await tap_element(serial, text="갤러리", retries=3)
            if not found:
                await tap_element(serial, text="Gallery", retries=3)
            await wait(1.5)
            await tap(serial, *COORDS["first_media"])
            await wait(1.5)

            # 다음 버튼
            found = await tap_element(serial, text="다음", retries=4, delay=1)
            if not found:
                await tap_element(serial, text="Next", retries=4, delay=1)
            await wait(2)

        else:
            # 일반 게시물 — "무슨 생각을 하고 계세요?" 탭
            log.append("새 게시물 작성...")
            found = await tap_element(serial, text="무슨 생각을 하고 계세요?", retries=3)
            if not found:
                found = await tap_element(serial, text="What's on your mind?", retries=3)
            if not found:
                await tap(serial, *COORDS["whats_on_mind"])
            await wait(2)

            # 사진/동영상 첨부
            if media_bytes:
                log.append("미디어 첨부...")
                found = await tap_element(serial, text="사진/동영상", retries=3)
                if not found:
                    await tap_element(serial, text="Photo/Video", retries=3)
                await wait(1.5)
                await tap(serial, *COORDS["first_media"])
                await wait(2)

        # 4. 캡션(텍스트) 입력
        if full_caption:
            log.append("캡션 입력...")
            found = await tap_element(serial, text="무슨 생각을 하고 계세요?", retries=3)
            if not found:
                found = await tap_element(serial, text="What's on your mind?", retries=3)
            if not found:
                await tap(serial, *COORDS["whats_on_mind"])
            await wait(1)
            await send_text(serial, full_caption)
            await wait(1)

        # 5. 게시 버튼 탭
        log.append("게시 버튼 탭...")
        found = await tap_element(serial, text="게시", retries=4, delay=1.5)
        if not found:
            found = await tap_element(serial, text="Post", retries=4, delay=1.5)
        if not found:
            await tap(serial, *COORDS["post_btn"])
        await wait(3)

        log.append("✅ Facebook 게시 완료!")
        return {"ok": True, "log": log}

    except Exception as e:
        log.append(f"❌ 오류: {str(e)}")
        return {"ok": False, "log": log, "error": str(e)}
