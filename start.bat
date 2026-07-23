@echo off
setlocal EnableExtensions
cd /d "%~dp0"

set "VENV_PY=%~dp0.venv\Scripts\python.exe"
set "URL=http://127.0.0.1:5042/"

where uv >nul 2>&1
if errorlevel 1 (
  echo [WARN] uv not found. Trying existing .venv only.
) else (
  if not exist "%VENV_PY%" (
    echo [setup] Creating .venv ...
    uv venv
  )
  echo [setup] Installing requirements ...
  uv pip install -r requirements.txt
)

if not exist "%VENV_PY%" (
  echo ERROR: %VENV_PY% not found.
  pause
  exit /b 1
)

echo Starting web-tools-100x on %URL%
start "web-tools-100x" "%VENV_PY%" "%~dp0main.py"
timeout /t 2 >nul
start "" "%URL%"
endlocal
