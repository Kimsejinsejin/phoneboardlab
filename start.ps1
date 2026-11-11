# AutoBoard Pro - Dev Server Launcher (start.ps1)
# Usage: Right-click -> "Run with PowerShell"  OR  double-click AutoBoard_Pro.bat

$ROOT     = Split-Path -Parent $MyInvocation.MyCommand.Path
$BACKEND  = Join-Path $ROOT "backend"
$FRONTEND = Join-Path $ROOT "frontend"
$PYTHON   = Join-Path $BACKEND "venv\Scripts\python.exe"
$PIP      = Join-Path $BACKEND "venv\Scripts\pip.exe"
$NPM      = "npm"

# ── Banner ──────────────────────────────────────────────────────
Clear-Host
Write-Host ""
Write-Host "  +======================================+" -ForegroundColor DarkCyan
Write-Host "  |      AutoBoard Pro  Launcher         |" -ForegroundColor Cyan
Write-Host "  +======================================+" -ForegroundColor DarkCyan
Write-Host ""

# ── 1. Python venv check ────────────────────────────────────────
Write-Host "[1/5] Checking Python virtual environment..." -ForegroundColor Cyan
if (-not (Test-Path $PYTHON)) {
    Write-Host "      venv not found. Creating..." -ForegroundColor Yellow
    python -m venv "$BACKEND\venv"
    Write-Host "      venv created!" -ForegroundColor Green
} else {
    Write-Host "      venv OK" -ForegroundColor Green
}

# ── 2. Backend packages ─────────────────────────────────────────
Write-Host "[2/5] Installing backend packages..." -ForegroundColor Cyan
$REQFILE = Join-Path $BACKEND "requirements.txt"
if (Test-Path $REQFILE) {
    & $PIP install -r $REQFILE --quiet 2>&1 | Out-Null
    Write-Host "      packages OK" -ForegroundColor Green
}

# ── 3. node_modules check ───────────────────────────────────────
Write-Host "[3/5] Checking frontend packages..." -ForegroundColor Cyan
if (-not (Test-Path (Join-Path $FRONTEND "node_modules"))) {
    Write-Host "      node_modules not found. Running npm install..." -ForegroundColor Yellow
    Push-Location $FRONTEND
    & $NPM install --silent
    Pop-Location
    Write-Host "      npm install done!" -ForegroundColor Green
} else {
    Write-Host "      node_modules OK" -ForegroundColor Green
}

# ── 4. Kill existing processes on ports 8000, 15173 ─────────────
Write-Host "[4/5] Clearing ports 8000 / 15173..." -ForegroundColor Cyan
@(8000, 15173) | ForEach-Object {
    $port = $_
    $lines = netstat -ano 2>$null | Select-String ":$port\s"
    foreach ($line in $lines) {
        $parts = ($line.ToString().Trim() -split '\s+')
        $pid_ = $parts[-1]
        if ($pid_ -match '^\d+$' -and [int]$pid_ -gt 0) {
            try { Stop-Process -Id ([int]$pid_) -Force -ErrorAction SilentlyContinue } catch {}
        }
    }
}
Write-Host "      ports cleared" -ForegroundColor Green
Start-Sleep -Milliseconds 500

# ── 5. Start servers ────────────────────────────────────────────
Write-Host "[5/5] Starting servers..." -ForegroundColor Cyan

# Backend (new window)
$backendScript = @"
Set-Location '$BACKEND'
Write-Host '=============================' -ForegroundColor DarkCyan
Write-Host '  AutoBoard Pro - BACKEND    ' -ForegroundColor Cyan
Write-Host '  http://localhost:8000      ' -ForegroundColor Green
Write-Host '=============================' -ForegroundColor DarkCyan
Write-Host ''
& '$PYTHON' -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
"@
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript -WindowStyle Normal

Start-Sleep -Seconds 2

# Frontend (new window)
$frontendScript = @"
Set-Location '$FRONTEND'
Write-Host '=============================' -ForegroundColor DarkMagenta
Write-Host '  AutoBoard Pro - FRONTEND   ' -ForegroundColor Magenta
Write-Host '  http://localhost:15173     ' -ForegroundColor Green
Write-Host '=============================' -ForegroundColor DarkMagenta
Write-Host ''
& npm run dev
"@
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendScript -WindowStyle Normal

Start-Sleep -Seconds 3

# Open browser
Write-Host ""
Write-Host "  Opening browser..." -ForegroundColor Magenta
Start-Process "http://localhost:15173"

# Done
Write-Host ""
Write-Host "  +======================================+" -ForegroundColor DarkGreen
Write-Host "  |   AutoBoard Pro is now running!      |" -ForegroundColor Green
Write-Host "  |                                      |" -ForegroundColor Green
Write-Host "  |  Backend  : http://localhost:8000    |" -ForegroundColor DarkCyan
Write-Host "  |  Frontend : http://localhost:15173   |" -ForegroundColor DarkMagenta
Write-Host "  +======================================+" -ForegroundColor DarkGreen
Write-Host ""
Write-Host "  Close the two PowerShell windows to stop the servers." -ForegroundColor DarkGray
Write-Host "  This window can be closed." -ForegroundColor DarkGray
Write-Host ""
Read-Host "Press Enter to close this window"
