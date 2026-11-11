"""
automation/instagram.py
Instagram 게시물/릴스 자동 업로드 자동화
SM-F711N (Galaxy Z Flip3) 1080x2640 기준
"""
from .base import (
    tap, swipe, wait, force_stop, am_start, send_text,
    tap_element, wait_for_element, push_image, push_video, key_event
)

PACKAGE = "com.instagram.android"

COORDS = {
    "new_post_btn":    (540, 2555),   # 하단 + 버튼
    "first_media":     (180, 450),    # 갤러리 첫 번째 미디어
    "next_btn":        (990, 140),    # 다음 (우상단)
    "caption_field":   (540, 400),    # 캡션 입력 필드
    "share_btn":       (540, 300),    # 공유 버튼
    "reels_tab":       (540, 600),    # 릴스 탭
}

async def run(serial: str, campaign: dict) -> dict:
    """
    Instagram 게시물 또는 릴스 업로드 자동화
    campaign: {caption, hashtags, media_bytes, media_filename, post_type}
    post_type: 'post'(기본) | 'reels'
    """
    caption = campaign.get("caption", "")
    hashtags = campaign.get("hashtags", "")
    media_bytes = campaign.get("media_bytes", b"")
    media_filename = campaign.get("media_filename", "media.jpg")
    post_type = campaign.get("post_type", "post")  # 'post' or 'reels'
    full_caption = f"{caption}\n.\n.\n.\n{hashtags}".strip() if hashtags else caption

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

        # 2. Instagram 실행
        log.append("Instagram 실행...")
        await am_start(serial, f"-n {PACKAGE}/.activity.MainTabActivity")
        await wait(4)

        # 3. + (새 게시물) 버튼 탭
        log.append("새 게시물 버튼 탭...")
        found = await tap_element(serial, content_desc="게시물 추가", retries=3)
        if not found:
            found = await tap_element(serial, content_desc="New Post", retries=3)
        if not found:
            await tap(serial, *COORDS["new_post_btn"])
        await wait(2)

        # 4. 릴스 모드 선택 (동영상인 경우)
        if post_type == "reels":
            log.append("릴스 탭 선택...")
            found = await tap_element(serial, text="릴스", retries=3)
            if not found:
                await tap_element(serial, text="Reels", retries=3)
            await wait(1.5)

        # 5. 갤러리에서 첫 번째 미디어 선택
        log.append("갤러리에서 미디어 선택...")
        await tap(serial, *COORDS["first_media"])
        await wait(1.5)

        # 6. "다음" 버튼 (선택 확인)
        log.append("다음 버튼 탭...")
        found = await tap_element(serial, text="다음", retries=4, delay=1)
        if not found:
            await tap_element(serial, text="Next", retries=4, delay=1)
        await wait(2)

        # 7. 필터 화면 → "다음" (릴스는 편집 화면)
        log.append("편집/필터 통과...")
        found = await tap_element(serial, text="다음", retries=3, delay=1.5)
        if not found:
            await tap_element(serial, text="Next", retries=3, delay=1.5)
        await wait(2)

        # 8. 캡션 입력
        if full_caption:
            log.append("캡션 입력...")
            found = await tap_element(serial, text="문구를 작성하거나 설문을 추가하세요...", retries=3)
            if not found:
                found = await tap_element(serial, text="Write a caption...", retries=3)
            if not found:
                await tap(serial, *COORDS["caption_field"])
            await wait(1)
            await send_text(serial, full_caption)
            await wait(1)

        # 9. 공유(게시) 버튼 탭
        log.append("게시 버튼 탭...")
        found = await tap_element(serial, text="공유", retries=4, delay=1.5)
        if not found:
            found = await tap_element(serial, text="Share", retries=4, delay=1.5)
        if not found:
            await tap(serial, *COORDS["share_btn"])
        await wait(3)

        log.append("✅ Instagram 게시 완료!")
        return {"ok": True, "log": log}

    except Exception as e:
        log.append(f"❌ 오류: {str(e)}")
        return {"ok": False, "log": log, "error": str(e)}
