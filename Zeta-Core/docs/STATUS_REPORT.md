# Zeta-Core — Full Project Status Report

Snapshot: 2026-07-15. Repository: `Zeta-Core/` under
`greg718gate/brama-dna718`.

This is the single document that answers *"what do we have, how is it
protected, and what is still open?"* — meant for the project owner, not
for a customer.

---

## 1. Product tree — what actually ships

```
Zeta-Core/
├── LICENSE                                   proprietary, eval-only
├── README.md                                 public overview + C ABI
├── ROADMAP.md                                🔴 / 🟡 / 🟢 priority matrix
├── CHANGELOG.md                              ABI-level changes per version
├── SECURITY.md                               vulnerability reporting policy
│
├── v1.0-standard-core/                       LAB baseline (frozen)
│   ├── ZETA_ENGINE.so                        stripped ELF, 1 symbol
│   ├── ZETA_INTEGRATION_README.txt
│   └── ZETA_FORENSIC_REPORT.txt
│
├── v1.1-adaptive-engine/                     PRODUCTION single-axis
│   ├── ZETA-CORE_v1.1.so                     stripped ELF, 1 symbol
│   └── ZETA_INTEGRATION_README.txt
│
├── v2.0-spatial-multi-axis/                  X/Y/Z spatial (frozen ABI)
│   ├── ZETA-CORE_v2.0.so                     stripped ELF, 1 symbol
│   └── ZETA_INTEGRATION_README.txt
│
├── bindings/
│   ├── zeta_client.txt                       ctypes wrapper (rename → .py)
│   └── zeta_reference_engine.txt             pure-Python DSP contract
│
├── tests/
│   ├── README.md                             how to run locally
│   └── unit/test_reference_engine.txt        regression suite (.txt)
│
├── benchmarks/
│   └── README.md                             CWRU / MFPT / NASA IMS plan
│
└── docs/
    ├── PERFORMANCE_BUDGET.md                 CPU / RAM / latency budgets
    └── adr/
        ├── ADR-001-biquad-vs-stft.md
        ├── ADR-002-numerical-fixes.md        v1.1.1 numerical hardening
        ├── ADR-003-temporal-abi.md           v2.1 opaque-state design
        └── ADR-004-threshold-rebaseline.md   v1.1.0 → v1.1.1 migration
```

Everything below tracks against this tree.

---

## 2. Public C ABI — the single gate

Only **two** symbols are externally visible across the whole product.

| Engine | Exported symbol      | Output slots | License feature flag |
|--------|----------------------|--------------|----------------------|
| v1.0   | `run_zeta_diagnostic`| 4 doubles    | `CORE` (0x0001)      |
| v1.1   | `run_zeta_diagnostic`| 4 doubles (slot 3 = adaptive freq) | `CORE` (0x0001) |
| v2.0   | `run_zeta_spatial`   | 8 doubles    | `CORE` + `SPATIAL` (0x0002) |
| v2.1 (planned) | `run_zeta_temporal` + `zeta_temporal_state_*` | 16 doubles | `CORE` + `SPATIAL` + `TEMPORAL` (0x0004) |

Return-code table (identical across all engines):

| Code | Meaning                                       |
|------|-----------------------------------------------|
|  0   | OK                                            |
| -1   | INVALID_ARGS (empty / NaN / Inf / Nyquist)    |
| -2   | MALFORMED_LICENSE                             |
| -3   | SIGNATURE_MISMATCH (token tampered)           |
| -4   | LICENSE_EXPIRED                               |
| -5   | MACHINE_BINDING_FAILED                        |
| -6   | PRODUCT_MISMATCH (v1.0 token on v2.0 binary)  |
| -7   | FEATURE_NOT_LICENSED                          |
| -8   | STATE_VERSION_MISMATCH (v2.1 opaque state)    |

---

## 3. Security posture — layer by layer

**Layer 1 — Binary compilation.**
- Written in C, compiled with `gcc -O2 -fPIC -fvisibility=hidden -flto`.
- Linker version scripts (`.map`) mark every internal function `local`.
- `strip --strip-all` and `--gc-sections` remove all debug symbols and
  unused sections.
- Verified with `nm -D --defined-only` — only `run_zeta_diagnostic` or
  `run_zeta_spatial` is visible; SHA-256, HMAC, filter kernels, RPM
  tracker, per-axis coherence, license verifier are all invisible.

**Layer 2 — License tokens (`ZC1.<payload>.<signature>`).**
- HMAC-SHA256 over a base64url payload containing product ID,
  `not_after`, machine hash and feature bitmask.
- Signing secret is stored inside each binary in **XOR-obfuscated form
  with a two-round rotating pad**, reassembled in RAM only during
  verification and wiped after use.
- Binding modes: perpetual/floating, time-boxed (hard cut-off), machine-
  locked (SHA-256 of `/etc/machine-id` + first non-loopback MAC),
  feature-flagged.
- The secret is **NOT** in the public repo. It lives only in the
  owner's password manager (Google Keep / Bitwarden entry named
  "ZETA-CORE HMAC").

**Layer 3 — Distribution controls.**
- No `.py` sources of the engine in the repo. Reference wrapper and
  reference numerical engine are `.txt` — deliberate friction against
  accidental execution / drive-by copy.
- `LICENSE` is **proprietary, eval-only** — not MIT / not BSD. Any
  runtime use requires a signed commercial agreement.
- `SECURITY.md` names a single reporting address and a 90-day
  coordinated-disclosure window.

**Layer 4 — Operational hygiene.**
- The `INSTRUKCJA_ZETA-CORE.md` full technical manual is **NOT** in the
  public repo. It is delivered as a private artifact under NDA.
- `ZETA-CORE_INSTRUKCJA_PROSTA_DLA_POCZATKUJACYCH.pdf` is the owner's
  private plain-language playbook, delivered as an artifact, kept off
  GitHub.
- `issue_token.py` (token-issuing tool used by the owner) is a
  private artifact — never committed.

**What an attacker cloning the public repo actually gets.**
Stripped ELFs, a README, a proprietary license, tests against the
reference engine (not the licensed one), documentation. No secret,
no `.py` source of the engine, no way to forge tokens without
breaking the binary itself.

---

## 4. Numerical contract — what is guaranteed

Anchored by **ADR-002** and covered by
`tests/unit/test_reference_engine.txt`.

- `inst_freq` length equals input length (uses `np.diff(..., prepend=...)`).
- Biquad state `zi_bp` is reset on every `configure()` — no artefacts
  when retuning to a new `target_freq`.
- Reference wave seeded with the measured signal's initial phase, so
  `phase_error` reflects real drift, not a fixed offset.
- Mean phase error not wrapped modulo 2π — systematic drift is visible.
- `fault_condensation` normalised to 0..1, window-size invariant.
- Adaptive tracker uses a rolling median over the last 50 samples
  (robust to single-sample impulses on short streaming windows).
- Explicit rejection of empty / NaN / Inf inputs, `sample_rate ≤ 0`,
  `target_freq` above Nyquist, degenerate bandpass edges.

Migration story from v1.1.0 to v1.1.1 lives in **ADR-004**, including
a numeric table of the coherence / Tf distribution shift and the
recommended new operator thresholds.

---

## 5. Testing & CI — current reality

| Layer          | Status  | Notes |
|----------------|---------|-------|
| Reference-engine unit tests | ✅ shipped as `.txt`, 8 cases | Regression coverage for every ADR-002 fix and for input validation. Ran locally, not in public CI. |
| Licensed `.so` integration tests | 🔒 private | Live in the build toolchain outside the public repo. Require a valid `ZETA_LICENSE` and matching architecture. |
| Fault-detection benchmarks (CWRU / MFPT / NASA IMS) | 🟡 harness planned | `benchmarks/README.md` defines the layout and reporting template; numbers are marked *(tbd)* until measured on-license. |
| Public GitHub Actions CI | ❌ intentionally not added | The public repo does not ship runnable `.py` sources — a CI job would either run nothing or force publishing sources. Reviewed and rejected. |

Trade-off, explicit: the reviewer flagged *"no CI = red flag."* We
accept that flag in exchange for the *"no `.py` source on public
GitHub"* rule the owner set. When a customer asks under NDA, we
send the private test bundle.

---

## 6. Documentation surface

- **`README.md`** — public technical overview, C ABI, license model.
- **`ROADMAP.md`** — 🔴 bindings/JSON (done), 🟡 v2.1 Temporal
  (ABI designed in ADR-003), 🟢 v3.0 Fleet Aggregation.
- **`CHANGELOG.md`** — v1.0 → v1.1 → v1.1.1 → v2.0, ABI-level.
- **`SECURITY.md`** — reporting, scope, hardening notes.
- **`docs/PERFORMANCE_BUDGET.md`** — CPU / RAM / latency ceilings.
- **`docs/adr/ADR-001`** — biquad vs STFT (why).
- **`docs/adr/ADR-002`** — numerical hardening (v1.1.1 fixes).
- **`docs/adr/ADR-003`** — v2.1 opaque-state ABI design.
- **`docs/adr/ADR-004`** — threshold re-baseline / migration guide.
- **`bindings/zeta_client.txt`** — `ctypes` wrapper, dataclass + JSON,
  `HEALTHY / WATCH / DEGRADED / CRITICAL` classifier.
- **`bindings/zeta_reference_engine.txt`** — pure-Python DSP contract,
  the same object the unit tests exercise.

---

## 7. What is still open

| Item | Priority | Owner | Note |
|------|----------|-------|------|
| Recompile all three `.so` with the persistent HMAC secret from the owner's password manager | 🔴 | owner triggers, agent rebuilds | Current binaries were built with a session-scoped secret that no longer exists. Any token issued now will fail `-3 SIGNATURE_MISMATCH`. Ship-blocker for first sale. |
| Deliver `issue_token.py` privately to the owner | 🔴 | agent | Never committed. Sent as artifact only. |
| Populate `benchmarks/latency/latency_report.md` from a real x86_64 or RPi4 run | 🟡 | agent + license | Numbers currently *(tbd)*. Needed before enterprise pitches. |
| Populate CWRU / MFPT / NASA IMS recall rows | 🟡 | agent + license | Same. Golden marketing evidence. |
| Implement v2.1 Temporal per ADR-003 | 🟡 | agent | ABI frozen in ADR, no code yet. |
| Private integration test suite for the licensed `.so` | 🟢 | agent | Currently only the reference engine is tested publicly. |

---

## 8. Sales-readiness checklist (reviewer's table, updated)

| # | Element                                | Status |
|---|----------------------------------------|--------|
| 1 | `LICENSE` (proprietary, eval-only)     | ✅ shipped |
| 2 | `tests/` with pytest + fixtures        | ✅ reference-engine layer; 🔒 licensed layer private |
| 3 | `src/` (C source) or documented build  | 🔒 build documented in ADR-001; source held under NDA (intentional) |
| 4 | Benchmarks on CWRU/MFPT/NASA IMS       | 🟡 harness in place, numbers pending on-license run |
| 5 | `pyproject.toml` / installable client  | ❌ intentionally deferred — bindings shipped as `.txt` per owner policy |
| 6 | GitHub Actions CI                      | ❌ intentionally deferred (see §5) |
| 7 | `benchmarks/latency_report.md`         | 🟡 template ready, numbers pending |
| 8 | `SECURITY.md`                          | ✅ shipped |
| 9 | `docs/api/` (pdoc)                     | 🟢 defer to first customer request |
| 10 | `.py` vs `.txt`                       | ✅ `.txt` is the deliberate policy, documented here |

Green = ready to send. Yellow = ready but needs one licensed run.
Red = blocker before revenue.

---

## 9. Owner's operational cheat-sheet

- HMAC secret lives **only** in the owner's password manager. If it is
  lost, every token in the field is orphaned and every binary must be
  rebuilt.
- To issue a token: run `issue_token.py` locally with
  `--product`, `--days`, and optionally `--machine-hash`. Send only the
  resulting `ZC1.…` string to the customer — never send the script.
- To ship a binary to a customer: attach the matching `.so` from
  `v*.*-*/`, the `README.md`, the `LICENSE`, and the private
  `INSTRUKCJA_ZETA-CORE.md` under NDA. Do **not** attach the reference
  numerical engine or the test suite unless the NDA specifically covers
  algorithmic disclosure.
- If a customer reports `-5 MACHINE_BINDING_FAILED`, re-issue a token
  bound to the new machine hash — do **not** disable machine binding on
  the binary.

---

*End of report.*
