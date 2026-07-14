# Zeta-Core Roadmap

Development plan for the Zeta-Core Industrial Diagnostic Engine, prioritised by
integration value vs implementation effort.

## Priority matrix

| Priority | Track                              | Rationale                                                 |
|----------|------------------------------------|-----------------------------------------------------------|
| 🔴 High  | Python bindings + structured JSON  | Unblocks integration with the rest of the analytics stack |
| 🟡 Med   | v2.1 Temporal Coherence            | Largest business-value jump: predictive vs snapshot        |
| 🟢 Low   | v3.0 Fleet Aggregation             | Only meaningful once >1 node runs in production            |

## 🔴 Tier 1 — Integration surface (in progress)

- **Python bindings** — reference wrapper published under `bindings/zeta_client.txt`.
  Wraps the single-gate C ABI with `ctypes`, returns dataclass results and JSON.
- **Structured JSON output** — `ZetaDiagnosticResult` / `ZetaSpatialResult`
  serialise to a stable schema (engine tag, per-axis metrics, status band,
  latency, ISO-8601 timestamp).
- **Status classification** — dimensionless Tf thresholds mapped to
  `HEALTHY / WATCH / DEGRADED / CRITICAL` for direct SCADA/dashboard consumption.
- **Docker reference image** — planned; will bundle a licensed `.so` plus the
  Python bindings for on-prem deployment behind an internal REST endpoint.

## 🟡 Tier 2 — v2.1 Temporal Coherence

Add time-series memory on top of the v2.0 spatial engine:

- Rolling-window trend analysis (default 10-minute window, configurable).
- Drift detection: linear vs exponential vs step-change classification of Tf.
- Anomaly scoring against a per-asset historical baseline.
- New output fields: `trend_slope`, `drift_class`, `anomaly_z_score`,
  `lead_time_estimate_h`.

Public ABI extension (planned, additive — v2.0 remains untouched):

```
int run_zeta_temporal(
    const double* input,      // interleaved xyz
    double*       output,     // >= 16 doubles (spatial 0..7 + temporal 8..15)
    int           n_samples,
    int           sample_rate,
    double        target_freq,
    void*         state,      // opaque, allocated by zeta_temporal_state_new()
    const char*   license_key
);
```

## 🟢 Tier 3 — v3.0 Fleet Aggregation

- Fleet-wide dashboard aggregation across many nodes.
- Cross-asset correlation (does machine A leak into machine B?).
- Hierarchical alerting: machine → line → hall → plant.
- Requires a persistent metrics store (TimescaleDB / InfluxDB reference).

## Cross-cutting

- **Validation & benchmarks** — reproducible suite against IEEE PHM Challenge
  datasets; publish per-engine metrics (latency, FPR, detection lead time)
  as `docs/BENCHMARKS.md`.
- **Edge deployment** — `v2.0-embedded` variant with fixed-point arithmetic for
  PLC / Raspberry Pi / Cortex-M targets.
- **Documentation** — Architecture Decision Records under `docs/adr/`, a
  version-to-version `CHANGELOG.md`, and a per-engine `PERFORMANCE_BUDGET.md`.
