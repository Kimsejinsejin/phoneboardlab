# AutoBoard Pro - .exe 패키징 자동화 스크립트 (build.ps1)
# 이 스크립트는 프론트엔드 UI를 빌드하고, 백엔드와 합쳐서 하나의 .exe 파일로 만들어줍니다.

Write-Host "1. 프론트엔드 UI(대시보드) 빌드 중..." -ForegroundColor Cyan
cd frontend
npm install
npm run build
cd ..

Write-Host "2. 백엔드 패키징 도구(PyInstaller) 설치 중..." -ForegroundColor Cyan
cd backend
pip install pyinstaller

Write-Host "3. 하나의 .exe 파일로 압축 병합 중..." -ForegroundColor Cyan
# --onefile: 단일 exe 파일로 생성
# --add-data: 프론트엔드 빌드 결과물을 exe 안에 포함
pyinstaller --noconfirm --onefile --windowed --add-data "../frontend/dist;frontend/dist" --name "AutoBoard_Pro" main.py

Write-Host "✅ 빌드 완료! backend/dist/ 폴더 안에 AutoBoard_Pro.exe 파일이 생성되었습니다." -ForegroundColor Green
Write-Host "이제 이 exe 파일만 복사해서 다른 컴퓨터에서 실행하시면 됩니다." -ForegroundColor Yellow
cd ..
