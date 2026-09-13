@echo off
title SENTINEL-718 v3.0 - Spectral Scanner (secure launcher)
setlocal

set S718_URL=https://brama-dna718.com/downloads/sentinel_718_engine.bin
set S718_KEY=3i8NU58T7qXdg5Gy7SMvXEPx1lqREbd592FJIhV+WpA=
set S718_SHA=0852b4c54a292f031613c172f7ee74dc0c671eb8cb3ba84b5810e61c3024c02b
set WORKDIR=%LOCALAPPDATA%\Sentinel718
if not exist "%WORKDIR%" mkdir "%WORKDIR%"

echo ==========================================================
echo   SENTINEL-718 v3.0 - SPECTRAL SCANNER
echo   Encrypted engine - AES-256-GCM + SHA-256 verification
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
echo [2/3] Preparing secure components...
python -m pip install --quiet --disable-pip-version-check --no-cache-dir bleak numpy scipy cryptography
if errorlevel 1 (
  echo [ERROR] Could not prepare components. Check your internet connection.
  pause
  exit /b 1
)

set LOADER=%WORKDIR%\loader.py
echo import os,base64,hashlib,urllib.request> "%LOADER%"
echo from cryptography.hazmat.primitives.ciphers.aead import AESGCM>> "%LOADER%"
echo url=os.environ["S718_URL"]>> "%LOADER%"
echo key=base64.b64decode(os.environ["S718_KEY"])>> "%LOADER%"
echo dig=os.environ["S718_SHA"]>> "%LOADER%"
echo blob=urllib.request.urlopen(url,timeout=60).read()>> "%LOADER%"
echo if hashlib.sha256(blob).hexdigest() != dig: raise SystemExit("INTEGRITY CHECK FAILED - engine rejected")>> "%LOADER%"
echo raw=base64.b64decode(blob)>> "%LOADER%"
echo if raw[:4] != b"S718": raise SystemExit("BAD ENGINE HEADER - engine rejected")>> "%LOADER%"
echo src=AESGCM(key).decrypt(raw[4:16],raw[16:],b"SENTINEL-718-v3")>> "%LOADER%"
echo print("[OK] Signature and integrity verified. Starting scanner...")>> "%LOADER%"
echo exec(compile(src,"sentinel_718_scanner","exec"),{"__name__":"__main__"})>> "%LOADER%"

echo [3/3] Verifying and starting encrypted engine...
echo.
python "%LOADER%"
pause
