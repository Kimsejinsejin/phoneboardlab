"""
automation/youtube.py
YouTube Shorts 자동 업로드 자동화
SM-F711N (Galaxy Z Flip3) 1080x2640 기준
"""
from .base import (
    tap, swipe, wait, force_stop, am_start, send_text,
    tap_element, wait_for_element, push_video, key_event
)

PACKAGE = "com.google.android.youtube"

# SM-F711N 기준 폴백 좌표 (uiautomator dump 실패 시)
COORDS = {
    "create_btn":   (540, 2555),   # 하단 + (만들기) 버튼
    "upload_video": (540, 2350),   # "동영상 업로드" 옵션
    "first_video":  (180, 500),    # 갤러리 첫 번째 동영상
    "next_btn":     (990, 120),    # 다음 버튼 (우상단)
    "title_field":  (540, 700),    # 제목 입력 필드
    "upload_btn":   (540, 1800),   # 업로드 버튼
    "shorts_tab":   (270, 600),    # "Short 만들기" 탭
}

async def run(serial: str, campaign: dict) -> dict:
    """
    YouTube Shorts 업로드 자동화
    campaign: {title, caption, hashtags, media_bytes, media_filename}
    """
    title = campaign.get("title", "")
    caption = campaign.get("caption", "")
    hashtags = campaign.get("hashtags", "")
    media_bytes = campaign.get("media_bytes", b"")
    media_filename = campaign.get("media_filename", "video.mp4")
    full_desc = f"{caption}\n{hashtags}".strip()

    log = []
    try:
        # 1. 앱 종료 후 미디어 파일 전송
        log.append("앱 종료 중...")
        await force_stop(serial, PACKAGE)
        await wait(1)

        if media_bytes:
            log.append(f"동영상 전송 중: {media_filename}")
            await push_video(serial, media_bytes, media_filename)

        # 2. YouTube 앱 실행
        log.append("YouTube 실행...")
        await am_start(serial, f"-n {PACKAGE}/.app.honeycomb.Shell$HomeActivity")
        await wait(4)

        # 3. 만들기(+) 버튼 탭
        log.append("만들기 버튼 탭...")
        found = await tap_element(serial, content_desc="만들기", retries=3, delay=1.5)
        if not found:
            found = await tap_element(serial, content_desc="Create", retries=3, delay=1.5)
        if not found:
            await tap(serial, *COORDS["create_btn"])
        await wait(2)

        # 4. "동영상 업로드" 선택
        log.append("동영상 업로드 선택...")
        found = await tap_element(serial, text="동영상 업로드", retries=3)
        if not found:
            found = await tap_element(serial, text="Upload a video", retries=3)
        if not found:
            await tap(serial, *COORDS["upload_video"])
        await wait(2)

        # 5. 갤러리에서 첫 번째 동영상 선택
        log.append("갤러리에서 동영상 선택...")
        await tap(serial, *COORDS["first_video"])
        await wait(2)

        # 6. "Short으로 공유" 선택 (Shorts 옵션이 있을 경우)
        await tap_element(serial, text="Short으로 공유", retries=2, delay=1)
        await wait(1)

        # 7. 다음 버튼 (편집 단계 통과)
        log.append("다음 단계 진행...")
        for _ in range(3):
            found = await tap_element(serial, text="다음", retries=2, delay=1)
            if not found:
                await tap_element(serial, text="Next", retries=2, delay=1)
            await wait(1.5)

        # 8. 제목 입력
        if title:
            log.append(f"제목 입력: {title}")
            found = await tap_element(serial, text="제목 추가", retries=3)
            if not found:
                await tap(serial, *COORDS["title_field"])
            await wait(1)
            await send_text(serial, title)
            await wait(1)

        # 9. 설명 입력
        if full_desc:
            log.append("설명 입력...")
            await tap_element(serial, text="설명 추가", retries=2)
            await wait(0.5)
            await send_text(serial, full_desc)
            await wait(1)

        # 10. 업로드 버튼 탭
        log.append("업로드 버튼 탭...")
        found = await tap_element(serial, text="업로드", retries=4, delay=1.5)
        if not found:
            found = await tap_element(serial, text="Upload", retries=4, delay=1.5)
        if not found:
            await tap(serial, *COORDS["upload_btn"])
        await wait(3)

        log.append("✅ YouTube Shorts 업로드 완료!")
        return {"ok": True, "log": log}

    except Exception as e:
        log.append(f"❌ 오류: {str(e)}")
        return {"ok": False, "log": log, "error": str(e)}
