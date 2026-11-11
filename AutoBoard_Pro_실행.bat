@echo off
:: AutoBoard Pro — 서버 실행 런처
:: 이 파일을 더블클릭하면 자동으로 실행됩니다.

title AutoBoard Pro Launcher

powershell -ExecutionPolicy Bypass -File "%~dp0start.ps1"
