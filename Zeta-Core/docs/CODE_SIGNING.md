# SENTINEL-718 / Zeta-Core — Code Signing Runbook (Windows Authenticode + Apple Developer ID)

Status: binaries are in the certification pipeline. Until the certificates are issued, the
distributed launchers are unsigned and the only integrity anchor is the published SHA-256 digest.

## 0. Artefacts

| File | Platform | Signing tool |
| --- | --- | --- |
| `SENTINEL_718.exe` | Windows x64 | `signtool` (Authenticode) |
| `SENTINEL_718.app` | macOS arm64/x64 | `codesign` + `notarytool` |
| `sentinel_718_engine.bin` | both | AES-256-GCM payload, SHA-256 published |

## 1. Windows — Authenticode

Requirements: EV or OV code-signing certificate (token or Azure Key Vault), Windows SDK
(`signtool.exe`), timestamp authority URL.

```powershell
# scripts/sign_windows.ps1
param(
  [string]$File = ".\dist\SENTINEL_718.exe",
  [string]$Thumbprint = $env:SENTINEL_CERT_THUMBPRINT,   # cert in CurrentUser\My
  [string]$Timestamp  = "http://timestamp.digicert.com"
)

signtool sign `
  /sha1 $Thumbprint `
  /fd SHA256 /td SHA256 /tr $Timestamp `
  /d "SENTINEL-718 Spectral Coherence Engine" `
  /du "https://brama-dna718.com" `
  $File

signtool verify /pa /v $File
Get-FileHash $File -Algorithm SHA256
```

Azure Key Vault variant (no physical token):

```powershell
AzureSignTool sign -kvu $env:AZ_VAULT_URL -kvc $env:AZ_CERT_NAME `
  -kvi $env:AZ_CLIENT_ID -kvs $env:AZ_CLIENT_SECRET -kvt $env:AZ_TENANT_ID `
  -tr http://timestamp.digicert.com -td sha256 -fd sha256 .\dist\SENTINEL_718.exe
```

## 2. macOS — Developer ID + notarisation

Requirements: Apple Developer Program membership, `Developer ID Application` certificate in the
login keychain, app-specific password stored as a keychain profile:

```bash
xcrun notarytool store-credentials sentinel-notary \
  --apple-id "$APPLE_ID" --team-id "$APPLE_TEAM_ID" --password "$APPLE_APP_PASSWORD"
```

```bash
#!/usr/bin/env bash
# scripts/sign_macos.sh
set -euo pipefail
APP="${1:-dist/SENTINEL_718.app}"
IDENTITY="${SENTINEL_MAC_IDENTITY:?Developer ID Application: ... required}"

# 1. Deep sign with hardened runtime (required for notarisation)
codesign --force --deep --timestamp --options runtime \
  --entitlements build/entitlements.plist \
  --sign "$IDENTITY" "$APP"

codesign --verify --deep --strict --verbose=2 "$APP"

# 2. Notarise (notarytool replaces the deprecated altool workflow)
ditto -c -k --keepParent "$APP" dist/SENTINEL_718.zip
xcrun notarytool submit dist/SENTINEL_718.zip \
  --keychain-profile sentinel-notary --wait

# Legacy equivalent, kept for reference only:
# xcrun altool --notarize-app --primary-bundle-id com.bramadna718.sentinel \
#   --username "$APPLE_ID" --password "$APPLE_APP_PASSWORD" --file dist/SENTINEL_718.zip

# 3. Staple + verify Gatekeeper acceptance
xcrun stapler staple "$APP"
spctl --assess --type execute --verbose=4 "$APP"
shasum -a 256 dist/SENTINEL_718.zip
```

Minimal `build/entitlements.plist` (Bluetooth belt access):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>com.apple.security.device.bluetooth</key><true/>
  <key>com.apple.security.cs.allow-jit</key><true/>
</dict></plist>
```

## 3. Publish step (both platforms)

```bash
# recompute and publish the digest that the launcher and the website display
shasum -a 256 public/downloads/sentinel_718_engine.bin \
  | awk '{print $1}' > public/downloads/sentinel_718_engine.bin.sha256
```

Then update the digest shown in the SENTINEL-718 download panel so the value users verify
matches the shipped blob.

## 4. Release checklist

- [ ] Build artefacts reproducibly (`-O2 -fvisibility=hidden`, `strip --strip-all`).
- [ ] Sign + timestamp Windows binary; `signtool verify /pa` passes.
- [ ] Sign, notarise, staple macOS bundle; `spctl --assess` passes.
- [ ] Regenerate and publish SHA-256 digests.
- [ ] Clean-VM install test (Windows 11, macOS current) with no developer tools present.
- [ ] AES key never shipped in the artefact — issued to RAM after license-token authorisation.
