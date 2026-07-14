# Zeta-Core Changelog

All notable changes to the public C ABI and shipped binaries are recorded here.
Format follows Keep-a-Changelog; versions correspond to the engine folders.

## [Unreleased]

### Added
- Reference Python bindings (`bindings/zeta_client.txt`) wrapping the single-gate
  C ABI with dataclass-based structured / JSON output and a `HEALTHY / WATCH /
  DEGRADED / CRITICAL` status classifier.
- Reference numerical spec (`bindings/zeta_reference_engine.txt`) mirroring
  the DSP contract implemented in the compiled `.so` binaries.
- `ROADMAP.md`, `CHANGELOG.md`, `docs/adr/`, `docs/PERFORMANCE_BUDGET.md`.

### Planned
- v2.1 Temporal Coherence (`run_zeta_temporal`, additive ABI).
- Fixed-point `v2.0-embedded` variant for PLC / MCU targets.

## [v1.1.1-adaptive-engine] — Numerical hardening pass

No ABI break. Same entry symbol, same argument layout, same 8-double output.

### Fixed
- `inst_freq` length now equals `n_samples` (was `n-1`), removing off-by-one
  alignment against the `t` axis and any downstream per-sample diagnostics.
- Biquad state `zi_bp` is reset on kernel re-design so reconfiguring to a
  new `target_freq` no longer emits a transient artefact on the first window.
- Reference wave is seeded with the measured signal's initial phase
  (`ref_phase = 2π·f·t + phase[0]`), so `phase_error` reflects drift rather
  than an arbitrary constant offset.
- Mean phase error no longer wraps `% 2π`; systematic drift is now visible
  instead of folded to a small residue.
- `fault_condensation` is dimensionless (0..1), independent of window size —
  scores are now comparable across chunk lengths and sensors.

### Changed
- Adaptive tracker switched from global buffer median to a rolling median
  over the last 50 samples; robust to single-sample impulses on short
  streaming windows.
- Input validation extended: rejects empty / NaN / Inf signals,
  `sample_rate ≤ 0`, `target_freq` above Nyquist, and degenerate bandpass
  edges.

### Notes
- See `docs/adr/ADR-002-numerical-fixes.md` for full rationale.
- Coherence values for a given signal are typically higher than under v1.1.0
  (arbitrary initial offset is no longer punished). Re-baseline site-specific
  operator thresholds if you inherited them from v1.1.0 logs.

## [v2.0-spatial-multi-axis] — Spatial Multi-Axis

### Added
- New public entry `run_zeta_spatial` (single exported symbol).
- Vectorised 3-axis (X, Y, Z) phase-coherence tracking, zero-loop core.
- Output buffer layout extended to 8 doubles: per-axis coherence, per-axis Tf,
  global spatial friction `||Tf||₂ / √3`, tracked frequency.
- License feature flag `SPATIAL (0x0002)` required in addition to `CORE`.

### Breaking
- Not ABI-compatible with v1.x: different entry symbol and interleaved
  `[x,y,z]` input layout. Clients must switch wrapper.

## [v1.1-adaptive-engine] — Production / Adaptive Engine

### Added
- Stateful narrow-band biquad bandpass replaces the v1.0 FIR block filter —
  no edge artefacts on streaming windows, filter state is preserved across
  contiguous chunks.
- Adaptive RPM drift tracker: reference wave locks to the instantaneous median
  frequency within a ±5 Hz mechanical tolerance band.
- Output slot `output[3]` now reports the adaptive tracked frequency (Hz)
  instead of a fixed echo of `target_freq`.

### Changed
- Compiled with `-O2 -fPIC -fvisibility=hidden -flto`, stripped with
  `--strip-all` and a linker version script — only `run_zeta_diagnostic` is
  externally visible.

### Notes
- ABI-compatible with v1.0 (same entry symbol and argument layout); wrappers
  written for v1.0 continue to work.

## [v1.0-standard-core] — Laboratory Baseline

### Added
- Initial public release.
- Single entry `run_zeta_diagnostic` — clean phase-coherence algorithm for
  ideal laboratory conditions, reference benchmarking baseline.
- Output buffer: coherence, topological friction Tf, fault condensation Mc,
  echoed target frequency.
- HMAC-SHA256 license verification (`ZC1.<payload>.<sig>` token format) with
  optional machine binding, time-boxing, and feature flags.
