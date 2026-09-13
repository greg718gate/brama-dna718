#!/bin/bash
# SENTINEL-718 v3.0 - Spectral Scanner secure launcher (macOS / Linux)
# Double-click on macOS. If blocked: right-click > Open.
# The engine is delivered encrypted (AES-256-GCM). The decryption key is NOT
# stored in this file: it is issued in RAM only after your license token is
# verified by the SENTINEL-718 authorization service.

export S718_URL="https://brama-dna718.com/downloads/sentinel_718_engine.bin"
export S718_API="https://merbqqbjeauqafflfcja.supabase.co/functions/v1/sentinel-license"
export S718_SHA="0852b4c54a292f031613c172f7ee74dc0c671eb8cb3ba84b5810e61c3024c02b"
WORKDIR="$HOME/.sentinel718"
mkdir -p "$WORKDIR"

echo "=========================================================="
echo "  SENTINEL-718 v3.0 - SPECTRAL SCANNER"
echo "  Encrypted engine - token authorization + SHA-256"
echo "=========================================================="
echo

PY=""
for candidate in python3 python; do
  if command -v "$candidate" >/dev/null 2>&1; then PY="$candidate"; break; fi
done

if [ -z "$PY" ]; then
  echo "[1/4] Python not found. Opening python.org - install Python, then run this file again."
  open "https://www.python.org/downloads/" 2>/dev/null || true
  read -r -p "Press ENTER to close..."
  exit 1
fi

echo "[1/4] Python detected ($PY)."
echo "[2/4] Preparing secure components..."
"$PY" -m pip install --quiet --disable-pip-version-check --no-cache-dir bleak numpy scipy cryptography || {
  echo "[ERROR] Could not prepare components. Check your internet connection."
  read -r -p "Press ENTER to close..."
  exit 1
}

cat > "$WORKDIR/loader.py" <<'LOADER'
import os, base64, hashlib, json, urllib.request, urllib.error
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

api = os.environ["S718_API"]
url = os.environ["S718_URL"]
dig = os.environ["S718_SHA"]

token = input("Paste your engine authorization token: ").strip().upper()
if not token:
    raise SystemExit("NO TOKEN - engine not authorized")

payload = json.dumps({"license_token": token, "action": "authorize"}).encode()
req = urllib.request.Request(api, data=payload, headers={"Content-Type": "application/json"})
try:
    res = json.loads(urllib.request.urlopen(req, timeout=60).read())
except urllib.error.HTTPError as err:
    raise SystemExit("AUTHORIZATION REJECTED - invalid or inactive token")
except Exception:
    raise SystemExit("NO CONNECTION to the authorization service")

if not res.get("authorized") or not res.get("engine_key"):
    raise SystemExit("AUTHORIZATION REJECTED - " + str(res.get("reason", "no key issued")))

key = base64.b64decode(res["engine_key"])
print("[OK] Token authorized. Subscription:", res.get("subscription_status", "unknown"))

blob = urllib.request.urlopen(url, timeout=60).read()
if hashlib.sha256(blob).hexdigest() != dig:
    raise SystemExit("INTEGRITY CHECK FAILED - engine rejected")

raw = base64.b64decode(blob)
if raw[:4] != b"S718":
    raise SystemExit("BAD ENGINE HEADER - engine rejected")

src = AESGCM(key).decrypt(raw[4:16], raw[16:], b"SENTINEL-718-v3")
del key
print("[OK] Integrity verified. Starting scanner...")
os.environ["S718_TOKEN"] = token
exec(compile(src, "sentinel_718_scanner", "exec"), {"__name__": "__main__"})
LOADER

echo "[3/4] Authorizing your license token..."
echo "[4/4] Verifying and starting encrypted engine..."
echo
"$PY" "$WORKDIR/loader.py"
read -r -p "Press ENTER to close..."
