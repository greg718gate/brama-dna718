# Zeta-Core — Examples

Three self-contained scripts illustrating the value proposition. Kept
as `.txt` per repo policy (see `tests/README.md`); rename to `.py` to
run against a licensed `.so`.

| Script | Shows |
|--------|-------|
| `01_basic_usage.txt` | Single-window diagnostic on one axis (v1.1). |
| `02_temporal_trend.txt` | Rolling temporal baseline + drift detection (v2.1). |
| `03_fleet_aggregation.txt` | Stub for v3.0 fleet-level roll-up (not licensed). |

All three require:

- `bindings/zeta_client.py` (rename from `.txt`).
- `ZETA_LICENSE` in the environment with the appropriate feature flags.
- The matching `.so` under `v*.*-*/`.
