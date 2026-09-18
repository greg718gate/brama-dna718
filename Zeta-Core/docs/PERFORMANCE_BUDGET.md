# Zeta-Core Performance Budget

The active `test_phase` implementation runs in a dedicated browser Web Worker.
The table below defines regression targets rather than native-binary benchmarks.

| Engine                          | Input          | CPU / 1s window | Peak RAM | Latency (first output) | Streaming state |
|---------------------------------|----------------|-----------------|----------|------------------------|-----------------|
| v1.0-standard-core              | mono, 44100 Hz | measured in browser profiler | bounded by one analysis window | asynchronous Worker response | stateless |
| v1.1-adaptive-engine            | mono, 44100 Hz | measured in browser profiler | bounded by one analysis window | asynchronous Worker response | adaptive windows |
| v2.0-spatial-multi-axis         | XYZ, 44100 Hz  | measured in browser profiler | three analysis windows | asynchronous Worker response | XYZ aggregation |

Notes

- **CPU / 1s window** is profiled in the browser against the public TypeScript source.
- **Peak RAM** is bounded by the current signal window and FFT work buffers.
- **Access** is open and free during `test_phase`; no binary licence check is present.
- **Determinism.** No RNG, no time-dependent branches in the DSP path. Output
  is bit-reproducible for a given input, sample rate and target frequency.
- **Thread safety.** The typed Worker serialises requests and isolates heavy work from UI rendering.

Targets we hold ourselves to

- No analysis task may freeze the main interface thread.
- Long recordings are processed as bounded windows.
- Numerical changes must pass the public regression suite.

Performance is measured per browser and device; regressions block a test-phase release.
