# Zeta-Core Changelog

All notable changes to the public C ABI and shipped binaries are recorded here.
Format follows Keep-a-Changelog; versions correspond to the engine folders.

## [Unreleased]

### Added
- Reference Python bindings (`bindings/zeta_client.txt`) wrapping the single-gate
  C ABI with dataclass-based structured / JSON output and a `HEALTHY / WATCH /
  DEGRADED / CRITICAL` status classifier.
- `ROADMAP.md`, `CHANGELOG.md`, `docs/adr/`, `docs/PERFORMANCE_BUDGET.md`.

### Planned
- v2.1 Temporal Coherence (`run_zeta_temporal`, additive ABI).
- Fixed-point `v2.0-embedded` variant for PLC / MCU targets.

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
