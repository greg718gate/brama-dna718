#!/bin/bash
# SENTINEL-718 v3.0 - Spectral Scanner secure launcher (macOS / Linux)
# Double-click on macOS. If blocked: right-click > Open.
# The engine is delivered encrypted (AES-256-GCM) and verified by SHA-256
# before a single line of it is executed. Nothing is stored in plain text.

export S718_URL="https://brama-dna718.com/downloads/sentinel_718_engine.bin"
export S718_KEY="3i8NU58T7qXdg5Gy7SMvXEPx1lqREbd592FJIhV+WpA="
export S718_SHA="0852b4c54a292f031613c172f7ee74dc0c671eb8cb3ba84b5810e61c3024c02b"
WORKDIR="$HOME/.sentinel718"
mkdir -p "$WORKDIR"

echo "=========================================================="
echo "  SENTINEL-718 v3.0 - SPECTRAL SCANNER"
echo "  Encrypted engine - AES-256-GCM + SHA-256 verification"
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
echo "[2/3] Preparing secure components..."
"$PY" -m pip install --quiet --disable-pip-version-check --no-cache-dir bleak numpy scipy cryptography || {
  echo "[ERROR] Could not prepare components. Check your internet connection."
  read -r -p "Press ENTER to close..."
  exit 1
}

cat > "$WORKDIR/loader.py" <<'LOADER'
import os, base64, hashlib, urllib.request
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

url = os.environ["S718_URL"]
key = base64.b64decode(os.environ["S718_KEY"])
dig = os.environ["S718_SHA"]

blob = urllib.request.urlopen(url, timeout=60).read()
if hashlib.sha256(blob).hexdigest() != dig:
    raise SystemExit("INTEGRITY CHECK FAILED - engine rejected")

raw = base64.b64decode(blob)
if raw[:4] != b"S718":
    raise SystemExit("BAD ENGINE HEADER - engine rejected")

src = AESGCM(key).decrypt(raw[4:16], raw[16:], b"SENTINEL-718-v3")
print("[OK] Signature and integrity verified. Starting scanner...")
exec(compile(src, "sentinel_718_scanner", "exec"), {"__name__": "__main__"})
LOADER

echo "[3/3] Verifying and starting encrypted engine..."
echo
"$PY" "$WORKDIR/loader.py"
read -r -p "Press ENTER to close..."
