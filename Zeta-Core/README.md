# Zeta-Core Industrial Diagnostic Engine

### Phase-Coherence Analytics for High-End Predictive Maintenance

Official repository for the Zeta-Core DSP Engine, developed as an independent component under the Brama-DNA718 platform. Designed for white-label licensing and direct integration into Industrial IoT sensor systems, SCADA platforms, and condition monitoring networks.

## Technical Overview

Unlike standard FFT analysis, which detects mechanical issues only after a significant rise in vibration amplitude or temperature, Zeta-Core operates on the micro-radian phase level.

By utilizing phase-coherence tracking against a mathematically pure reference wave, the engine calculates:

* *Topological Friction ($T_f$)* – Identifying structural phase de-coherence before physical damage occurs.
* *Fault Condensation Index ($M_c$)* – Dimensionless metric (0.0 to 1.0) optimized for real-time SCADA operator dashboards.

## Release Tiers

Three separated maturity tiers, each in its own folder. All engines are shipped as **stripped native ELF shared objects** (`.so`) compiled from C with GCC (`-O2 -fPIC -fvisibility=hidden -Wl,--strip-all -Wl,--gc-sections`). Only two symbols are exported globally via linker version scripts — everything else, including the license verifier and internal DSP routines, is fully hidden.

### `v1.0-standard-core/` — Standard Core (Laboratory Baseline)
Clean, lightweight phase algorithm for **ideal laboratory conditions** and reference benchmarking.
* `ZETA_ENGINE.so` — stripped ELF, single exported symbol `run_zeta_diagnostic`
* `ZETA_INTEGRATION_README.txt` — integration guide
* `ZETA_FORENSIC_REPORT.txt` — validation logs

### `v1.1-adaptive-engine/` — Production / Adaptive Engine (Live Single-Axis Workhorse)
Noise-resistant production build for **live single-axis sensors**. Stateful narrow-band biquad bandpass (no edge artefacts on streaming windows) plus adaptive RPM drift tracking that locks the reference wave to the instantaneous median frequency within a ±5 Hz mechanical tolerance band.
* `ZETA-CORE_v1.1.so` — stripped ELF, exports `run_zeta_diagnostic` only

### `v2.0-spatial-multi-axis/` — Spatial Multi-Axis (X, Y, Z Vectorized)
Vectorized 3-axis (X, Y, Z) spatial-coherence tracking for multi-dimensional asset diagnostics. Per-axis coherence plus Euclidean-norm global spatial friction.
* `ZETA-CORE_v2.0.so` — stripped ELF, exports `run_zeta_spatial` only

ZETA-CORE v2.0 now supports native 3-axis (X, Y, Z) spatial coherence tracking with zero-loop vectorization for advanced multi-dimensional asset diagnostics.

## Public C ABI (Single Gate)

Only these two symbols are visible to any client wrapper. Every other function — SHA-256, HMAC, base64url, license verifier, filter kernel, RPM tracker, per-axis coherence — is `local` in the linker version script and cannot be called externally.

```c
int run_zeta_diagnostic(
    const double* input,        // raw time-series (mono, PCM double)
    double*       output,       // caller-allocated, >=8 doubles
    int           length,       // number of samples
    int           sample_rate,  // Hz
    double        target_freq,  // Hz (nominal rotational / carrier freq)
    const char*   license_key   // signed license token, see below
);

int run_zeta_spatial(
    const double* input,        // interleaved [x0,y0,z0, x1,y1,z1, ...]
    double*       output,       // caller-allocated, >=8 doubles
    int           n_samples,    // per axis
    int           sample_rate,
    double        target_freq,
    const char*   license_key
);
```

**Return codes** — 0 on success, negative on error:

| Code | Meaning |
|------|---------|
|  0 | OK |
| -1 | Invalid arguments |
| -2 | Malformed license token |
| -3 | Signature mismatch (token tampered or wrong secret) |
| -4 | License expired (`not_after` passed) |
| -5 | Machine binding failed (machine-hash mismatch) |
| -6 | Wrong product (e.g. v1.0 token used against v2.0 binary) |
| -7 | Required feature bit not licensed |

## License Model

The engine will not process any signal without a valid signed license token.

Token wire format (ASCII, safe to email, ~120 chars):

```
ZC1.<base64url_payload>.<base64url_hmac_sha256>
```

Binding options:
- **Perpetual & floating** — no expiry, works on any machine.
- **Time-boxed** — `not_after` unix timestamp; hard cut-off, no grace period.
- **Machine-locked** — bound to SHA-256 of `/etc/machine-id` + first non-loopback MAC. Copying the `.so` to another factory will not activate.
- **Feature-flagged** — bitmask; e.g. v2.0 SPATIAL analytics is a separate flag (`0x0002`) on top of CORE (`0x0001`).

The HMAC-SHA256 signing secret is stored inside each binary in XOR-scrambled form (two-round XOR with a rotating pad). Reassembled in RAM only during verification and wiped after use. There is no way to forge tokens without breaking the binary.

Full integration workflow, token-issuing procedure, and hand-off checklist for factories: **[INSTRUKCJA_ZETA-CORE.md](./INSTRUKCJA_ZETA-CORE.md)**.

## Source Protection

The `.so` files are compiled machine code, stripped of all debug information and internal symbol names. GitHub renders them as *"binary file not shown"*. Verification:

```
$ file ZETA_ENGINE.so
ELF 64-bit LSB shared object, x86-64, version 1 (SYSV), dynamically linked, stripped

$ nm -D --defined-only ZETA_ENGINE.so
0000000000001XX0 T run_zeta_diagnostic
```

No `.py`, `.pyc`, `.c`, `.h`, or plaintext source of the engine internals is committed to this repo.

## Licensing & Contact

This technology is available for proprietary white-label integration. For laboratory access keys, full source code review under NDA, or benchmarking support, contact **bramadna718@gmail.com**.
