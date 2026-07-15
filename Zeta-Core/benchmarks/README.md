# Zeta-Core Benchmarks

This directory holds reproducible benchmark harnesses used to substantiate
the numbers claimed in `docs/PERFORMANCE_BUDGET.md` and marketing
materials. Nothing here is a substitute for a customer running the
engine on their own line — these are reference conditions.

## Layout

```
benchmarks/
  README.md                     — this file
  latency/
    run_latency.txt             — reference script (rename .txt → .py)
    latency_report.md           — recorded numbers per platform / engine
  datasets/
    cwru/                       — Case Western Reserve Bearing Data
    mfpt/                       — Machinery Fault Prevention Technology
    nasa_ims/                   — NASA Prognostics Center IMS
    README.md                   — where to download, how to cite
```

Public datasets are **not** committed to this repo. Follow
`datasets/README.md` (added on request) to fetch them locally under a
signed evaluation license.

## Methodology

- Fresh boot, no other CPU-bound processes, governor pinned to
  `performance`.
- 1 000 warm-up windows discarded, next 10 000 windows measured.
- Latency reported as median and P99 in milliseconds per window.
- CPU % measured with `psutil.Process().cpu_percent(interval=1.0)` on the
  worker thread only.
- Signal length fixed to 4 096 samples per axis, sample rate 44 100 Hz
  unless the row says otherwise.

## Fault-detection benchmarks (target for v1.1.1 release)

| Dataset                     | Fault class            | v1.0 recall | v1.1 recall | v1.1.1 recall | Notes |
|-----------------------------|------------------------|-------------|-------------|---------------|-------|
| CWRU 12k Drive End          | outer-race, 0.007"     | (tbd)       | (tbd)       | (tbd)         | reference baseline |
| CWRU 12k Drive End          | inner-race, 0.014"     | (tbd)       | (tbd)       | (tbd)         |       |
| MFPT baseline vs outer race | outer race, 25 Hz shaft| (tbd)       | (tbd)       | (tbd)         |       |
| NASA IMS Bearing 1          | run-to-failure         | (tbd)       | (tbd)       | (tbd)         | lead time in hours |

Rows are populated as the run harness lands and are frozen with a Git
tag per release (e.g. `benchmarks-v1.1.1`).

## Latency snapshot template (`latency/latency_report.md`)

| Engine | Platform            | Signal len | Latency P50 (ms) | Latency P99 (ms) | CPU % |
|--------|---------------------|------------|------------------|------------------|-------|
| v1.0   | Raspberry Pi 4 (4G) | 4 096      | (tbd)            | (tbd)            | (tbd) |
| v1.1   | Raspberry Pi 4 (4G) | 4 096      | (tbd)            | (tbd)            | (tbd) |
| v2.0   | x86_64 / Xeon E-2276G | 4 096    | (tbd)            | (tbd)            | (tbd) |

Numbers marked *(tbd)* are filled in from a licensed run — they are not
guesses and are not shipped until measured.
