# ADR-002 — Numerical review fixes (v1.1.1 hardening pass)

Status: Accepted (folded into v1.1-adaptive-engine and mirrored in v2.0 spatial core).

## Context

External review of the reference engine flagged eight issues across three
severity tiers. Two were correctness bugs, four were numerical / algorithmic
weaknesses, two were architectural. This ADR records the resolution of each
so future contributors don't reintroduce them.

## Decision

Adopt every fix listed below. The reference Python spec that these fixes are
validated against lives in `bindings/zeta_reference_engine.txt`. The
compiled `.so` binaries implement the same numerical contract in C.

### 🔴 Critical

1. **`np.diff` sample loss.** `inst_freq = np.diff(phase)` returns `n-1`
   samples and desynchronises from the `t` axis. Fixed by using
   `np.diff(phase, prepend=phase[0])` (C side: shift-and-subtract with a
   duplicated first sample) so `len(inst_freq) == n`.

2. **Stale biquad state on reconfigure.** Previously, calling the engine with
   a new `target_freq` re-designed the SOS kernel but kept the old `zi_bp`,
   producing a transient artefact on the first window after retune. Fixed by
   resetting `zi_bp = sosfilt_zi(sos)` inside `configure()` whenever the
   kernel changes.

3. **Input validation.** Added explicit checks: `sample_rate > 0`,
   `target_freq < Nyquist`, `bandwidth ∈ (0, Nyquist)`, signal is 1-D,
   contains no NaN/Inf, and has ≥ 64 samples. C side returns `-1
   INVALID_ARGS` for any of these.

### 🟡 Numerical / algorithmic

4. **Robust adaptive tracker.** Global median of the entire window is
   sensitive to single impulses on short buffers. Replaced with a **rolling
   median over the last N samples** (default N = 50). Cheap, no allocation
   per sample in C.

5. **Phase-synchronised reference wave.** The reference started at phase 0
   while the measured signal has an arbitrary initial phase, so
   `phase_error` was dominated by that constant offset rather than actual
   drift. Fixed by seeding the reference with `phase[0]`:
   `ref_phase = 2π·f·t + phase[0]`.

6. **No modulo on mean phase error.** `mean_error % (2π)` masks systematic
   drift — a linearly growing error would fold back to a small residue.
   Fixed by taking a plain mean of the unwrapped `|phase_error|`. Coherence
   is then `exp(-mean_error)`.

7. **Window-invariant fault condensation.** The old
   `Mc = n_samples · Tf` made scores incomparable across window sizes.
   `Mc` is now defined as the dimensionless `Tf` itself (0..1), matching
   the ABI documented in the integration READMEs.

### 🟢 Architectural

8. **Setup vs. process split.** The reference engine now exposes
   `configure(target_freq, bandwidth)` (design filter once) and
   `process(window)` (streaming call). The C ABI already only *designs*
   once — the shared object caches the kernel between calls on the same
   handle — but the Python reference now expresses this contract
   explicitly so integrators build correct wrappers.

9. **Overlap-add guidance.** The engine has no window-boundary artefacts
   because biquad state is preserved, so the correct streaming pattern is
   *contiguous, non-overlapping* chunks. When downstream smoothing is
   desired, aggregate the per-window scalar results (helper
   `aggregate_windows` in the reference file), not the raw DSP.

## Consequences

- Phase-error magnitudes reported by v1.1.1 are numerically smaller than
  v1.1.0 for the same signal (offset is no longer folded in). Existing
  operator thresholds (`HEALTHY / WATCH / DEGRADED / CRITICAL`) are
  unchanged in *meaning* but should be re-checked against site baselines.
- `Mc` is no longer proportional to window length — downstream dashboards
  that previously summed `Mc` across windows must switch to averaging.
- No ABI break: same entry symbol, same argument layout, same 8-double
  output buffer.

## Related

- `bindings/zeta_reference_engine.txt` — reference Python spec.
- `docs/adr/ADR-001-biquad-vs-stft.md` — why the front-end is a biquad.
- `CHANGELOG.md` — v1.1.1 entry.
