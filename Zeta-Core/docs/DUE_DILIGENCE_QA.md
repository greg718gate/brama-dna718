# Zeta-Core — Due Diligence Q&A

Version: v1.1.1-final
Date: 2026-07-15
Audience: technical reviewers, pilot customers, prospective investors.
Owner: Zeta-Core maintainer (single-owner project, Aberdeen, Scotland).

This document exists so the first ten questions a serious reviewer will ask
have a written, evidenced answer — before the meeting, not during it.
Every answer points at a concrete artefact in this repository. Nothing here
is aspirational; where a claim is not yet met, it is labelled as an open
pre-revenue blocker.

---

## Q1. What does Zeta-Core actually do, in one paragraph?

Zeta-Core is a phase-coherence diagnostic engine for rotating and vibrating
industrial equipment. It ingests a raw single-axis (v1.x) or three-axis
(v2.0) vibration signal plus a target mechanical frequency and returns four
scalar health indicators — phase coherence, topological friction (Tf), fault
condensation (Mc), and the adaptively tracked frequency — in a fixed
sub-millisecond latency budget per window. The v2.1 Temporal engine adds
trend, drift classification, and lead time to a CRITICAL threshold.

Evidence: `README.md`, `docs/STATUS_REPORT.md` §1, `CHANGELOG.md`.

---

## Q2. What is the numerical contract? How do I know the output is stable
across releases?

The DSP path is specified in a reference Python engine
(`bindings/zeta_reference_engine.txt`) that mirrors the compiled `.so`
bit-for-bit within a documented tolerance. Every ABI slot has a fixed
semantic (see ADR-002, ADR-004). Backward compatibility is enforced by a
dedicated integration test (`tests/integration/test_backward_compat.txt`)
that feeds v2.0 and v2.1 the same input and asserts slots 0..7 are
bit-identical.

Evidence: `docs/adr/ADR-002-numerical-fixes.md`,
`docs/adr/ADR-004-threshold-rebaseline.md`,
`tests/integration/test_backward_compat.txt`.

---

## Q3. What about false positives? Vibration diagnostics is famous for them.

Three mitigations, layered:

1. **Adaptive tracking (v1.1+).** The reference wave locks to the measured
   instantaneous median frequency within ±5 Hz. Ambient RPM drift no longer
   registers as a fault.
2. **Rolling-median tracker (v1.1.1).** A single-sample impulse cannot
   pull the tracked frequency; you need a sustained shift.
3. **Temporal drift classification (v2.1).** A single elevated Tf window is
   not an alert. `run_zeta_temporal` classifies the *trajectory* over the
   history window as `stable / linear / exponential / step / noisy` and
   only escalates on the first three.

Reference datasets we benchmark against: CWRU bearing dataset, MFPT
bearing dataset, NASA IMS bearing dataset. Layout in
`benchmarks/README.md`.

Pilot offer: first customer receives a free 2-week shadow deployment
(their historian, our engine, no actionable alerting) so their reliability
team can measure our FP rate on their own equipment before signing.

---

## Q4. How is the intellectual property protected?

Five layers. Status is the current, honest state — two layers have open
pre-revenue work (see §Pre-revenue blockers at end).

| # | Layer | Mechanism | Status |
|---|-------|-----------|--------|
| 1 | Source | No source ships. Only stripped `.so` with `-fvisibility=hidden` and a linker version script. Verified with `nm`: one public symbol per binary. | ✅ Done |
| 2 | License | HMAC-SHA256 token (`ZC1.<payload>.<sig>`) verified inside the `.so`. Feature-flagged (`CORE`, `SPATIAL`, `TEMPORAL`), machine-bound, time-boxed. Secret XOR-obfuscated at rest, reassembled in RAM, wiped after use. | 🟡 Blocker #1 — rebuild with persistent secret |
| 3 | Binary integrity | ECDSA-P256 signature (`.so.sig`), verified by the Python wrapper **before** `ctypes.CDLL(...)`. Private key is offline / air-gapped. | 🔴 Blocker #2 — keygen + sign |
| 4 | Legal | Proprietary evaluation-only license (`LICENSE`), disclosure policy (`SECURITY.md`). | ✅ Done |
| 5 | Operational | HMAC secret and ECDSA private key not in repo, in owner's password manager and on encrypted offline media respectively. | ✅ Done (secret) / 🔴 (ECDSA — see #3) |

Evidence: `docs/adr/ADR-005-binary-auth.md`, `LICENSE`, `SECURITY.md`,
`docs/STATUS_REPORT.md` §3.

**Known limitation (v1.2.0 hardening target).** The ECDSA public key is
embedded in the Python wrapper (`bindings/zeta_client.txt`). A customer
who renames the file to `.py` can, in principle, replace the pubkey to
bypass signature verification — but doing so gains them nothing: the
license check inside the `.so` still runs and still rejects a forged
token. The residual risk is that they load a **modified `.so`** without
detection. Planned v1.2.0 mitigations: (a) obfuscate the embedded pubkey
(XOR pad + split), and/or (b) move signature verification inside the
`.so` and ship the pubkey as a separate signed `.pem` the `.so` reads.
Tracked in `docs/STATUS_REPORT.md` Appendix C.

---

## Q5. What is the key rotation strategy?

**HMAC (Layer 2).** Rotated on any suspected leak. Rotation invalidates
all field tokens; every deployed binary must be rebuilt and every
customer re-issued a token. Announced in `CHANGELOG.md` under
`[Security]`. Playbook in `SECURITY.md`.

**ECDSA (Layer 3).** Rotated only on suspected private-key exposure —
expected to be very rare because the key lives on encrypted offline
media on the owner's air-gapped machine. Rotation requires a new
wrapper release with the new embedded public key. Baseline cadence:
every 12 months or on incident, whichever comes first. Private key is
one-time generated and stored offline; no online copy exists.

Evidence: `docs/adr/ADR-005-binary-auth.md` §Key management,
`SECURITY.md`.

---

## Q6. What is the ABI stability guarantee?

- **Slots 0..7** are frozen across v2.0 and v2.1 (same semantics, same
  ordering, same units). Enforced by
  `tests/integration/test_backward_compat.txt`.
- **New slots are additive** (8..15 in v2.1). Old wrappers that read only
  the first 8 doubles continue to work.
- **Entry symbols are versioned** (`run_zeta_diagnostic`,
  `run_zeta_spatial`, `run_zeta_temporal`). Adding a capability never
  changes an existing symbol.
- **Feature flags** (`CORE 0x0001`, `SPATIAL 0x0002`, `TEMPORAL 0x0004`)
  gate capabilities at the license layer, not the ABI layer.
- **State format is envelope-versioned** (see ADR-006, ADR-007) so v2.1
  state produced today loads under any future minor version.

Evidence: `docs/adr/ADR-003-temporal-abi.md`,
`docs/adr/ADR-006-serialization-format.md`,
`docs/adr/ADR-007-state-migration.md`.

---

## Q7. What is the performance envelope?

Documented per platform in `docs/PERFORMANCE_BUDGET.md`. Headline
numbers for a 1-second window at 44.1 kHz on commodity x86_64:

- `run_zeta_diagnostic` (v1.1): well under 1 ms per window.
- `run_zeta_spatial` (v2.0): ~3× that budget (three axes, vectorised).
- `run_zeta_temporal` (v2.1): diagnostic cost + O(history_window) update.

The engine is single-threaded and allocation-free on the hot path.
Latency measurement is included in the reference wrapper
(`bindings/zeta_client.txt` → `latency_ms`).

---

## Q8. Why is there no CI/CD pipeline yet?

Because CI/CD is a *distribution* concern, not a *correctness* concern,
and Zeta-Core is currently a single-owner, single-machine project with
zero paying customers. The compiled `.so` and its signature are produced
on one air-gapped machine and shipped by hand. Correctness is enforced
by the test suite (`tests/`), not by a green tick in a web UI.

Concrete plan: CI/CD moves from "🟢 Deferred" to "🟡 In progress" the
day after the second paying customer signs — when manual release
becomes a bottleneck. Until then, adding GitHub Actions would leak the
build environment (compiler flags, symbol map, obfuscation pad seed) to
a third party for no operational gain.

Evidence: `docs/STATUS_REPORT.md` Appendix B.

---

## Q9. What is the test coverage?

Current suite:

- `tests/unit/test_reference_engine.txt` — 8 tests, all pass. Locks
  ADR-002 numerical fixes and input-validation contract.
- `tests/integration/test_backward_compat.txt` — bit-for-bit ABI slot
  parity between v2.0 and v2.1, plus state serialize/deserialize
  round-trip.

Coverage headline: **87 % on the reference engine**. The 13 % gap is
concentrated in C-wrapper error-handling paths (specifically the
`-1 INVALID_ARGS` branches for degenerate bandpass edges and Nyquist
overflow). These are exercised on the C side by `test_reference_engine`
input-validation cases but not counted by `pytest --cov` because
`pytest` cannot instrument the compiled `.so`. Closing the gap is a
v1.2.0 task (add a small C-level test harness with `gcov`).

Evidence: `tests/README.md`, `docs/STATUS_REPORT.md` Appendix A.

---

## Q10. Why should I trust a one-person project?

Because every non-trivial decision is written down before it is
implemented, and every implementation is testable against a public
reference. That is not typical of one-person projects; it is typical of
projects that expect to be audited.

- **Seven ADRs** (`docs/adr/ADR-001..ADR-007`) covering filter design,
  numerical fixes, temporal ABI, threshold re-baseline, binary auth,
  serialization format, and state migration. Each has a Context /
  Decision / Consequences / Rejected alternatives structure.
- **A single-page status report** (`docs/STATUS_REPORT.md`) that names
  every open blocker instead of hiding it.
- **A reference engine** (`bindings/zeta_reference_engine.txt`) so any
  reviewer can reproduce a compiled-binary output in Python and
  independently verify the numerical contract.
- **Named residual risks** in this document (Q4 known limitation, Q9
  C-wrapper coverage gap, pre-revenue blockers below) rather than
  polished silence.

A reviewer's real question is *"if this maintainer disappears, can
another engineer maintain the product?"*. The answer is yes: the ADR
trail plus the reference engine plus the test suite are sufficient to
rebuild the shipped `.so` from scratch.

---

## Pre-revenue blockers (must close before first paid deployment)

| # | Blocker | Owner | Deadline | Steps | Verification |
|---|---------|-------|----------|-------|--------------|
| 1 | Rebuild `.so` with persistent HMAC secret (currently dev secret in Keep) | Maintainer | Before first customer PO | (1) fetch secret from Keep, (2) XOR-obfuscate with fresh pad, (3) recompile v1.0/v1.1/v2.0 with `-O2 -fvisibility=hidden -flto`, (4) `strip --strip-all`, (5) verify with `nm` that only the entry symbol is public | `issue_token.py` mints a token that the fresh `.so` accepts; a token minted with the old dev secret is rejected with `-3 SIGNATURE_MISMATCH` |
| 2 | Generate ECDSA-P256 signing key and sign every shipped `.so` | Maintainer | Same milestone as #1 | (1) air-gap machine setup (offline laptop, no network hardware), (2) `openssl ecparam -genkey -name prime256v1`, (3) store private key on two encrypted USB sticks (primary + backup, separate physical locations), (4) embed public key (DER bytes) in `bindings/zeta_client.txt`, (5) sign each `.so` producing `.so.sig` sidecar, (6) destroy any online copy of the private key | Signature verifies on a clean VM with only the wrapper + `.so` + `.so.sig`; a byte-flipped `.so` is refused by the wrapper before `ctypes.CDLL(...)` |

Both blockers are operational, not architectural. The design is frozen.

---

## Appendix — Quick Reference Card for a customer integrator

Five steps to a working integration:

1. **Obtain artefacts.** Receive from Zeta-Core: (a) the versioned `.so`
   for your platform, (b) the matching `.so.sig`, (c) a license token
   (`ZC1.<payload>.<sig>`) bound to your machine hash and expiry.
2. **Install the wrapper.** Copy `bindings/zeta_client.txt` to your
   integration host, rename to `zeta_client.py`, `pip install numpy
   cryptography`. Do not modify the embedded public key.
3. **Verify + load.** `ZetaDiagnostic(so_path=..., license_key=...)`
   internally runs `_verify_binary(.so, .so.sig)` **before**
   `ctypes.CDLL`. A tampered `.so` raises before the license check even
   runs.
4. **Feed a window.** `eng.analyze(signal, sample_rate, target_freq)`
   returns a `ZetaDiagnosticResult` with the four scalars and a
   `HEALTHY / WATCH / DEGRADED / CRITICAL` status derived from Tf via
   ADR-004 thresholds.
5. **Wire to your historian / SCADA.** The result object is JSON-safe
   (`.to_json()`). Push to your time-series DB and alerting layer of
   choice. For a fleet view, see `examples/03_fleet_aggregation.txt`
   and the Fleet API spec (`docs/FLEET_API_SPEC_v3.md`).

If step 3 fails with `ZetaLicenseError`, the token is the problem
(expired, wrong machine, wrong product, missing feature flag). If it
fails with a signature-verification error, the `.so` is the problem
(corrupt download or tampered). If it fails with `ZetaEngineError`,
the input is the problem (empty / NaN / Inf, `sample_rate ≤ 0`,
`target_freq` above Nyquist).
