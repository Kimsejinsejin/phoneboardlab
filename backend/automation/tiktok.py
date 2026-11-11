"""
automation/tiktok.py
TikTok 동영상 자동 업로드 자동화
SM-F711N (Galaxy Z Flip3) 1080x2640 기준
"""
from .base import (
    tap, swipe, wait, force_stop, am_start, send_text,
    tap_element, wait_for_element, push_video
)

PACKAGE = "com.zhiliaoapp.musically"

COORDS = {
    "create_btn":    (540, 2555),   # 하단 + 버튼
    "upload_tab":    (270, 350),    # "업로드" 탭
    "first_video":   (180, 450),    # 갤러리 첫 번째 동영상
    "next_btn":      (990, 140),    # 다음 버튼
    "caption_field": (540, 500),    # 캡션 입력 필드
    "post_btn":      (540, 2200),   # 게시 버튼
}

async def run(serial: str, campaign: dict) -> dict:
    """
    TikTok 동영상 업로드 자동화
    campaign: {title, caption, hashtags, media_bytes, media_filename}
    """
    caption = campaign.get("caption", "")
    hashtags = campaign.get("hashtags", "")
    media_bytes = campaign.get("media_bytes", b"")
    media_filename = campaign.get("media_filename", "video.mp4")
    full_caption = f"{caption} {hashtags}".strip()

    log = []
    try:
        # 1. 앱 종료 및 파일 전송
        log.append("앱 종료 중...")
        await force_stop(serial, PACKAGE)
        await wait(1)

        if media_bytes:
            log.append(f"동영상 전송 중: {media_filename}")
            await push_video(serial, media_bytes, media_filename)

        # 2. TikTok 앱 실행
        log.append("TikTok 실행...")
        await am_start(serial, f"-n {PACKAGE}/com.zhiliaoapp.musically.main.MainActivity")
        await wait(4)

        # 3. + (만들기) 버튼 탭
        log.append("만들기 버튼 탭...")
        found = await tap_element(serial, content_desc="만들기", retries=3)
        if not found:
            found = await tap_element(serial, content_desc="Create", retries=3)
        if not found:
            await tap(serial, *COORDS["create_btn"])
        await wait(2)

        # 4. "업로드" 탭 선택 (카메라 → 업로드)
        log.append("업로드 탭 선택...")
        found = await tap_element(serial, text="업로드", retries=3, delay=1)
        if not found:
            found = await tap_element(serial, text="Upload", retries=3, delay=1)
        if not found:
            await tap(serial, *COORDS["upload_tab"])
        await wait(2)

        # 5. 갤러리에서 첫 번째 동영상 선택
        log.append("동영상 선택...")
        await tap(serial, *COORDS["first_video"])
        await wait(1.5)

        # 6. 선택 완료 버튼 (있을 경우)
        await tap_element(serial, text="선택 완료", retries=2, delay=1)
        await wait(1)

        # 7. 다음 버튼 (편집 단계들 통과)
        log.append("편집 단계 통과...")
        for _ in range(3):
            found = await tap_element(serial, text="다음", retries=2, delay=1)
            if not found:
                await tap_element(serial, text="Next", retries=2, delay=1)
            await wait(2)

        # 8. 캡션 및 해시태그 입력
        if full_caption:
            log.append("캡션 입력...")
            found = await tap_element(serial, text="내용을 입력하고 @를 사용해 친구를 언급하거나", retries=3)
            if not found:
                found = await tap_element(serial, text="Describe your video", retries=3)
            if not found:
                await tap(serial, *COORDS["caption_field"])
            await wait(1)
            await send_text(serial, full_caption)
            await wait(1)
            # 키보드 닫기
            from .base import key_event
            await key_event(serial, 4)  # 뒤로가기 (키보드 닫기)
            await wait(0.5)

        # 9. 게시 버튼 탭
        log.append("게시 버튼 탭...")
        found = await tap_element(serial, text="게시", retries=4, delay=2)
        if not found:
            found = await tap_element(serial, text="Post", retries=4, delay=2)
        if not found:
            await tap(serial, *COORDS["post_btn"])
        await wait(3)

        log.append("✅ TikTok 업로드 완료!")
        return {"ok": True, "log": log}

    except Exception as e:
        log.append(f"❌ 오류: {str(e)}")
        return {"ok": False, "log": log, "error": str(e)}
