# ADR-005: Binary Authentication & License Token Strategy

Status: **Accepted** — targeting Zeta-Core v1.2.0.
Date: 2026-07-15.
Related: ADR-003 (Temporal ABI), SECURITY.md.

## Context

A technical reviewer will ask three questions before signing:

1. What does the HMAC in the `.so` actually protect — the **license** or
   the **binary integrity**?
2. Where does the shared secret live? A symmetric secret embedded in the
   `.so` is recoverable by a determined reverse engineer.
3. Does the client wrapper verify the `.so` **before** `ctypes.CDLL(...)`
   loads it? If not, a swapped `.so` bypasses everything downstream.

This ADR pins the answers.

## Decision — two-layer authentication

**Layer A: license token (symmetric, HMAC-SHA256).**
Protects *who is allowed to run this binary and until when*. Signed with
a per-product HMAC key. The key sits inside the binary, XOR-obfuscated
with a two-round rotating pad, reassembled in RAM only during
verification, and wiped after use. We accept that a determined attacker
with local access can recover it — a symmetric scheme cannot prevent
that. Its job is to raise the cost above "run `strings`", not above
"resist a nation-state".

**Layer B: binary signature (asymmetric, ECDSA P-256).**
Protects *is this the binary I shipped, unmodified?*. Every released
`.so` is signed offline with a **private key that never leaves the
owner's air-gapped machine**. The matching **public key is embedded in
the Python client wrapper** (`bindings/zeta_client.txt`). The wrapper
verifies the signature **before** calling `ctypes.CDLL(...)`. A modified
`.so` fails signature check and is never loaded — the license check
inside the binary is never even reached.

Because the private key is not distributed, an attacker who tampers
with a `.so` cannot re-sign it. This is the property Layer A alone
cannot give us.

## Threat model

| Threat | Mitigation | Residual risk |
|--------|------------|---------------|
| Attacker copies `.so` to another machine | Machine-bound token → `-5 MACHINE_BINDING_FAILED` | Low |
| Attacker back-dates the system clock | Token `not_after` compared against monotonic clock + build epoch | Low |
| Attacker patches `.so` to skip license check | ECDSA signature check in wrapper fails; `.so` never loaded | Low if the customer uses our wrapper |
| Customer bypasses our wrapper and calls `.so` directly | Layer A still runs inside the `.so`; forged token → `-3 SIGNATURE_MISMATCH` | Medium — degrades to symmetric-only |
| Attacker extracts HMAC secret from `.so` and forges tokens | XOR-obfuscation + machine binding + short `not_after` | Accepted — symmetric scheme's known limit |
| Attacker extracts ECDSA private key | Key is offline, air-gapped | Very low — physical access to owner's machine required |

## Data flow

```text
                       [owner, offline air-gapped machine]
                       ECDSA-P256 private key  (never leaves this box)
                                │
                                │  sign(.so)
                                ▼
[release/.so]  +  [release/.so.sig]
                                │
                                │  ship to customer
                                ▼
        ┌──────────────────  customer host  ──────────────────┐
        │                                                     │
        │  bindings/zeta_client.py                            │
        │    embedded ECDSA-P256 PUBLIC key                   │
        │      │                                              │
        │      │  1. verify_signature(.so, .so.sig, pubkey)   │
        │      │     └── fail → refuse to load, raise         │
        │      │                                              │
        │      ▼                                              │
        │  ctypes.CDLL("./ZETA-CORE_vX.Y.so")                 │
        │      │                                              │
        │      │  2. call run_zeta_diagnostic(..., token)     │
        │      ▼                                              │
        │  inside .so:                                        │
        │    reassemble HMAC secret from XOR pad              │
        │    verify token signature (HMAC-SHA256)             │
        │    check not_after, machine hash, feature bitmask   │
        │    wipe secret from RAM                             │
        │    run DSP                                          │
        └─────────────────────────────────────────────────────┘
```

## Client-side verification (contract for `zeta_client.py`)

```python
def _verify_binary(so_path: Path, sig_path: Path) -> None:
    """Must be called BEFORE ctypes.CDLL(...). Raises on mismatch."""
    pubkey = _load_embedded_pubkey()          # DER-encoded, in-module bytes
    payload = so_path.read_bytes()
    sig = sig_path.read_bytes()
    ecdsa_p256_verify(pubkey, payload, sig)   # cryptography.hazmat
    # If this returns without raising, the .so is authentic.
```

`_verify_binary` runs on every process start. There is no cache, no
opt-out flag. A wrapper that ships without this call is not a Zeta-Core
wrapper — it is a fork.

## Key management

- **ECDSA private key** — generated once on the owner's air-gapped
  machine, stored on two encrypted USB sticks (primary + backup) in
  separate physical locations. Never touches a networked host. Loss
  means every future release must be signed with a rotated key and
  every client wrapper must ship with the new embedded public key —
  painful but recoverable.
- **HMAC secret** — see SECURITY.md and STATUS_REPORT §3 Layer 2. In
  the owner's password manager. Loss means every field token is
  orphaned and every binary must be rebuilt.
- **Rotation policy** — HMAC on any suspected leak; ECDSA on suspected
  private-key exposure only (very rare event). Rotations are announced
  in `CHANGELOG.md` under a `[Security]` heading.

## Consequences

- Adds an offline signing step to the release process (see §Data flow).
- Adds a `.so.sig` sidecar to every shipped binary.
- Adds `cryptography` (or equivalent) as a client-side dependency;
  documented in the wrapper header.
- No change to the C ABI. This is a wrapper-level and build-level
  concern.
- Reviewer question #1 ("why is the HMAC not enough?") now has a
  written answer that fits on one page.
