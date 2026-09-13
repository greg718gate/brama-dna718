@echo off
title SENTINEL-718 v3.0 - Spectral Scanner
setlocal

set ENGINE_URL=https://brama-dna718.com/downloads/sentinel_718_scanner.py
set WORKDIR=%LOCALAPPDATA%\Sentinel718
if not exist "%WORKDIR%" mkdir "%WORKDIR%"

echo ==========================================================
echo   SENTINEL-718 v3.0 - SPECTRAL SCANNER
echo ==========================================================
echo.

where python >nul 2>nul
if errorlevel 1 (
  echo [1/3] Python not found. Opening python.org - install Python,
  echo       tick "Add python.exe to PATH", then run this file again.
  start https://www.python.org/downloads/
  pause
  exit /b 1
)

echo [1/3] Python detected.
echo [2/3] Preparing engine components...
python -m pip install --quiet --disable-pip-version-check --no-cache-dir bleak numpy scipy
if errorlevel 1 (
  echo [ERROR] Could not prepare components. Check your internet connection.
  pause
  exit /b 1
)

echo [3/3] Downloading engine and starting scanner...
curl -L -s -o "%WORKDIR%\sentinel_718_scanner.py" "%ENGINE_URL%"
if not exist "%WORKDIR%\sentinel_718_scanner.py" (
  echo [ERROR] Engine download failed. Check your internet connection.
  pause
  exit /b 1
)

echo.
python "%WORKDIR%\sentinel_718_scanner.py"
pause
