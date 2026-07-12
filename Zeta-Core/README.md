# Zeta-Core Industrial Diagnostic Engine

### Phase-Coherence Analytics for High-End Predictive Maintenance

Official repository for the Zeta-Core DSP Engine, developed as an independent component under the Brama-DNA718 platform. Designed for white-label licensing and direct integration into Industrial IoT sensor systems, SCADA platforms, and condition monitoring networks.

## Technical Overview

Unlike standard FFT analysis, which detects mechanical issues only after a significant rise in vibration amplitude or temperature, Zeta-Core operates on the micro-radian phase level.

By utilizing the Hilbert transform to extract instantaneous phase and benchmarking it against a mathematically pure 1.0 coherence baseline, the engine calculates:

* *Topological Friction ($T_f$)* – Identifying structural phase de-coherence before physical damage occurs.
* *Fault Condensation Index ($M_c$)* – Delivering a dimensionless metric (0.0 to 1.0) optimized for real-time SCADA operator dashboards.

## Release Tiers

The engine ships in three clearly separated maturity tiers. Each tier lives in its own folder and targets a different deployment scenario:

### `v1.0-standard-core/` — Standard Core (Laboratory Baseline)
Clean, lightweight phase algorithm intended for **ideal laboratory conditions** and reference benchmarking. This is the original sealed evaluation package.
* `ZETA_ENGINE.pyc` — compiled reference engine
* `ZETA_INTEGRATION_README.txt` — integration guide
* `ZETA_FORENSIC_REPORT.txt` — validation logs

### `v1.1-adaptive-engine/` — Production / Adaptive Engine (Live Single-Axis Workhorse)
Noise-resistant production build for **live single-axis sensors**. Adds a stateful narrow-band Butterworth pre-filter (`sosfilt` with persistent `zi` state, no edge artefacts on streaming windows) and adaptive RPM drift tracking that locks the reference wave to the instantaneous median frequency within a ±5 Hz mechanical tolerance band.
* `ZETA-CORE_v1.1.txt` — protected text-only source listing for `ZetaDiagnosticEngine`

### `v2.0-spatial-multi-axis/` — Spatial Multi-Axis (X, Y, Z Vectorized)
Vectorized 3-axis (X, Y, Z) spatial-coherence tracking with **zero-loop vectorization** for advanced multi-dimensional asset diagnostics. Runs Hilbert along `axis=-1` on a `(3, n_samples)` matrix and reports per-axis coherence plus the Euclidean-norm global spatial friction.
* `ZETA-CORE_v2.0.txt` — protected text-only source listing for `ZetaMultiAxisEngine`

## Licensing & Contact

This technology is available for proprietary white-label integration. For laboratory access keys, full source code review under NDA, or benchmarking support, please contact the developer directly via LinkedIn.
