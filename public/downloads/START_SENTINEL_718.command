#!/bin/bash
# SENTINEL-718 v3.0 - Spectral Scanner launcher (macOS / Linux)
# Double-click on macOS. If blocked: right-click > Open.

ENGINE_URL="https://brama-dna718.com/downloads/sentinel_718_scanner.py"
WORKDIR="$HOME/.sentinel718"
mkdir -p "$WORKDIR"

echo "=========================================================="
echo "  SENTINEL-718 v3.0 - SPECTRAL SCANNER"
echo "=========================================================="
echo

PY=""
for candidate in python3 python; do
  if command -v "$candidate" >/dev/null 2>&1; then PY="$candidate"; break; fi
done

if [ -z "$PY" ]; then
  echo "[1/3] Python not found. Opening python.org - install Python, then run this file again."
  open "https://www.python.org/downloads/" 2>/dev/null || true
  read -r -p "Press ENTER to close..."
  exit 1
fi

echo "[1/3] Python detected ($PY)."
echo "[2/3] Preparing engine components..."
"$PY" -m pip install --quiet --disable-pip-version-check --no-cache-dir bleak numpy scipy || {
  echo "[ERROR] Could not prepare components. Check your internet connection."
  read -r -p "Press ENTER to close..."
  exit 1
}

echo "[3/3] Downloading engine and starting scanner..."
curl -L -s -o "$WORKDIR/sentinel_718_scanner.py" "$ENGINE_URL" || {
  echo "[ERROR] Engine download failed."
  read -r -p "Press ENTER to close..."
  exit 1
}

echo
"$PY" "$WORKDIR/sentinel_718_scanner.py"
read -r -p "Press ENTER to close..."
