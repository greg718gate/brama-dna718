# Zeta-Core Performance Budget

Reference numbers per engine. Measured on an x86-64 laptop-class CPU
(single core, no SIMD auto-vectorisation beyond `-O2`) with a 1-second window
at 44100 Hz. Treat these as *ceilings* for capacity planning; embedded targets
are covered in the roadmap `v2.0-embedded` line.

| Engine                          | Input          | CPU / 1s window | Peak RAM | Latency (first output) | Streaming state |
|---------------------------------|----------------|-----------------|----------|------------------------|-----------------|
| v1.0-standard-core              | mono, 44100 Hz | ~1.8 ms         | ~64 KB   | 1 window (~22.7 ms buffer) | stateless (block FIR) |
| v1.1-adaptive-engine            | mono, 44100 Hz | ~2.4 ms         | ~72 KB   | ~1 ms after first samples  | stateful (biquad + RPM tracker) |
| v2.0-spatial-multi-axis         | XYZ, 44100 Hz  | ~5.6 ms         | ~160 KB  | ~1 ms after first samples  | 3× v1.1 filter state |

Notes

- **CPU / 1s window** is wall-clock time for a single `run_zeta_*` call over
  44 100 samples per axis. Scales linearly in `n_samples`.
- **Peak RAM** is process-attributed heap during the call; the engines do not
  allocate per-sample and never call back into libc allocation on the hot path.
- **License verification** adds a fixed ~15–25 µs (SHA-256 + HMAC + base64url)
  on the first call; subsequent calls in the same process reuse the verified
  token cache and pay <1 µs.
- **Determinism.** No RNG, no time-dependent branches in the DSP path. Output
  is bit-reproducible for a given input, sample rate and target frequency.
- **Thread safety.** Filter state is per-process. Call each engine from a
  single thread per stream; use one loaded `.so` per stream if you need
  parallel channels beyond the built-in XYZ path.

Targets we hold ourselves to

- v1.1 must sustain **≥ 40× real-time** on Raspberry Pi 4 (Cortex-A72) at
  44100 Hz mono — validated in the internal benchmark suite.
- v2.0 must sustain **≥ 10× real-time** on the same target at 44100 Hz XYZ.
- No engine may exceed **256 KB resident** during normal analysis.

Anything worse than the numbers above on a release binary is a regression
and blocks the release.
