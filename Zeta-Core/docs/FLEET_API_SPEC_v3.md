# Zeta-Core Fleet API Specification — v3.0 (stub)

Status: **Draft / stub**. The v3.0 native fleet aggregator is not shipped.
This document is the contract that dashboard, backend, and DevOps teams
build against **now**, using the Python-side aggregator in
`examples/03_fleet_aggregation.txt`. When the native aggregator lands,
the wire format and endpoint shapes below do not change — only the
implementation behind them.

Date: 2026-07-15.
Related: ADR-003 (Temporal ABI), ADR-006 (Serialization),
ADR-007 (State migration), `examples/03_fleet_aggregation.txt`.

---

## 1. Architecture

```text
┌──────────────────┐   binary/JSON    ┌──────────────────┐   REST/WS   ┌──────────────────┐
│  Edge node       │  Edge Report     │  Fleet Gateway   │             │  Dashboard /     │
│  (asset-local)   │ ───────────────► │  (aggregator +   │ ──────────► │  Alerting /      │
│  ZETA-CORE v2.1  │                  │   REST + WS API) │             │  Ops tooling     │
│  .so + wrapper   │                  │                  │             │                  │
└──────────────────┘                  │        │         │             └──────────────────┘
                                      │        │         │
                                      │        ▼         │
                                      │  PostgreSQL      │  ← asset metadata, alert history
                                      │  InfluxDB        │  ← time-series (Tf, coherence, Mc)
                                      │  (blob store)    │  ← optional: engine state snapshots
                                      └──────────────────┘
```

- **Edge node**: one process per asset. Runs the v2.1 `.so` via the
  Python wrapper, produces one **Edge Report** per analysis window,
  persists engine state locally (ADR-006 envelope).
- **Fleet Gateway**: stateless HTTP + WebSocket service. Aggregates
  reports across assets, writes to time-series DB, evaluates alert
  rules, serves dashboards.
- **Dashboard / alerting**: any client that speaks the REST + WS
  contract below.

Transport between edge and gateway is deliberately unspecified at v3.0
stub level (see §Open questions Q1). The **payload** is fixed.

---

## 2. Data model

### 2.1 Edge Report (edge → gateway, one per window)

```json
{
  "schema": "zeta.edge.report/v1",
  "asset_id": "PUMP-01",
  "site_id": "ABZ-DIST-01",
  "engine": "v2.1-temporal",
  "engine_state_version": 1,
  "window": {
    "started_at": "2026-07-15T10:00:00Z",
    "ended_at":   "2026-07-15T10:00:01Z",
    "sample_rate_hz": 44100,
    "n_samples": 44100,
    "target_freq_hz": 150.0
  },
  "diagnostic": {
    "phase_coherence": 0.87,
    "topological_friction": 0.12,
    "fault_condensation": 0.08,
    "tracked_frequency_hz": 149.7
  },
  "spatial": {
    "per_axis_coherence": {"x": 0.87, "y": 0.85, "z": 0.83},
    "per_axis_friction":  {"x": 0.12, "y": 0.14, "z": 0.16},
    "global_spatial_friction": 0.14
  },
  "temporal": {
    "trend_slope_per_hour": 0.003,
    "drift_class": "linear",
    "anomaly_zscore": 1.4,
    "baseline_mean_tf": 0.10,
    "baseline_std_tf": 0.02,
    "lead_time_hours_to_critical": 42.5
  },
  "status": "WATCH",
  "latency_ms": 0.9
}
```

Fields `spatial` and `temporal` are omitted when the engine variant does
not produce them. `status` is derived per ADR-004 thresholds.

### 2.2 Fleet Aggregator State (gateway-internal)

```json
{
  "schema": "zeta.fleet.state/v1",
  "site_id": "ABZ-DIST-01",
  "as_of": "2026-07-15T10:00:01Z",
  "assets_total": 42,
  "assets_reporting": 41,
  "assets_by_status": {"HEALTHY": 33, "WATCH": 6, "DEGRADED": 2, "CRITICAL": 0},
  "assets_drifting": {"linear": 4, "exponential": 1, "step": 0},
  "fleet_mean_tf": 0.11,
  "worst_lead_time_hours": 18.0,
  "worst_asset_id": "FAN-07"
}
```

---

## 3. REST endpoints (12)

Base path: `/api/v1`. All responses `application/json`. All requests
authenticated with a bearer token scoped to a site or fleet.

| # | Method | Path                                         | Purpose |
|---|--------|----------------------------------------------|---------|
| 1 | POST   | `/reports`                                   | Edge node submits one Edge Report. |
| 2 | GET    | `/assets`                                    | List assets with last-known status. Query: `site_id`, `status`. |
| 3 | GET    | `/assets/{asset_id}`                         | Asset metadata + latest report. |
| 4 | GET    | `/assets/{asset_id}/history`                 | Time-series for one asset. Query: `from`, `to`, `metric`. |
| 5 | GET    | `/assets/{asset_id}/state`                   | Download last-known engine state (ADR-006 blob). |
| 6 | PUT    | `/assets/{asset_id}/state`                   | Upload engine state (disaster recovery). |
| 7 | GET    | `/fleet/health`                              | Fleet Aggregator State (see §2.2). |
| 8 | GET    | `/fleet/correlations`                        | Cross-asset Tf correlations over a time window. |
| 9 | GET    | `/alerts`                                    | Active + recent alerts. Query: `severity`, `since`. |
| 10| POST   | `/alerts/{alert_id}/ack`                     | Acknowledge an alert (ops workflow). |
| 11| GET    | `/rules`                                     | List active alerting rules. |
| 12| PUT    | `/rules/{rule_id}`                           | Update an alerting rule (drift-class, Tf threshold, dwell time). |

Errors follow RFC 7807 (`application/problem+json`).

---

## 4. WebSocket protocol

Endpoint: `/api/v1/stream`. Client authenticates with the same bearer
token as REST. Three message kinds:

### 4.1 Subscribe (client → server)

```json
{"type": "subscribe", "channels": ["fleet.health", "alerts", "asset.PUMP-01"]}
```

### 4.2 Update (server → client)

```json
{
  "type": "update",
  "channel": "asset.PUMP-01",
  "at": "2026-07-15T10:00:01Z",
  "payload": { /* Edge Report as in §2.1 */ }
}
```

### 4.3 Alert (server → client)

```json
{
  "type": "alert",
  "alert_id": "a_9f3c",
  "severity": "DEGRADED",
  "asset_id": "FAN-07",
  "rule_id": "r_tf_linear_drift",
  "triggered_at": "2026-07-15T10:00:01Z",
  "reason": "drift_class=linear for 6 consecutive windows; lead_time_hours=18.0",
  "snapshot": { /* last Edge Report */ }
}
```

Reconnect policy: exponential backoff, resume with a `since` cursor
provided in the last received `update.at`.

---

## 5. Stub implementation

The Python `FleetAggregator` class in
`examples/03_fleet_aggregation.txt` implements §7 (`GET /fleet/health`)
against a list of assets that each carry a v2.1 engine + local state
file. Dashboard developers can point their UI at a thin HTTP shim
around that class today; when the native v3.0 aggregator lands, only
the shim is replaced. See the header of that file for the exact class
surface and the docstring for expected output shape.

---

## 6. Database schema

### 6.1 PostgreSQL — metadata (append-only where possible)

```sql
CREATE TABLE sites (
  site_id       TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  timezone      TEXT NOT NULL
);

CREATE TABLE assets (
  asset_id      TEXT PRIMARY KEY,
  site_id       TEXT NOT NULL REFERENCES sites(site_id),
  kind          TEXT NOT NULL,      -- pump | fan | motor | ...
  target_freq_hz DOUBLE PRECISION NOT NULL,
  engine_variant TEXT NOT NULL,     -- v1.1 | v2.0 | v2.1
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE alerts (
  alert_id      TEXT PRIMARY KEY,
  asset_id      TEXT NOT NULL REFERENCES assets(asset_id),
  rule_id       TEXT NOT NULL,
  severity      TEXT NOT NULL,      -- WATCH | DEGRADED | CRITICAL
  triggered_at  TIMESTAMPTZ NOT NULL,
  acked_at      TIMESTAMPTZ,
  reason        TEXT NOT NULL,
  snapshot      JSONB NOT NULL
);

CREATE TABLE rules (
  rule_id       TEXT PRIMARY KEY,
  expression    JSONB NOT NULL,     -- drift_class, tf threshold, dwell windows
  enabled       BOOLEAN NOT NULL DEFAULT true,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 6.2 InfluxDB — time-series (one measurement per metric)

- Measurement `zeta_tf`, tags: `asset_id`, `site_id`, fields:
  `tf`, `coherence`, `mc`, `tracked_hz`.
- Measurement `zeta_spatial`, tags: same, fields per axis.
- Measurement `zeta_temporal`, tags: same, fields: `slope`,
  `drift_class` (as tag: yes — low cardinality), `zscore`, `lead_h`.

Retention policy suggestion: 30 days at 1 s resolution, 2 years
downsampled to 1 min. See §Open questions Q4.

### 6.3 Blob store — engine state snapshots (optional)

One object per (`asset_id`, ISO date). Content is the ADR-006 envelope
byte-for-byte. Enables cold restart and postmortem replay.

---

## 7. Migration path

| Phase | State | What is real | What is stubbed |
|-------|-------|--------------|-----------------|
| **Now** (v1.1.1) | Pre-revenue | Edge engine (v1.1, v2.0, v2.1), Python wrapper, license, signatures | Everything gateway-side; use `examples/03_fleet_aggregation.txt` |
| **Pilot** (first customer) | Manual gateway | A minimal HTTP shim around `FleetAggregator`, PostgreSQL only, no WS | Correlations, rule engine, WS streaming |
| **GA** (v3.0) | Native gateway | All 12 REST endpoints, WS protocol, Influx, rule engine | Multi-region, RBAC beyond bearer-per-site |
| **Scale** (v3.x) | Multi-site | Multi-region gateway, tenant isolation, SLA telemetry | (open) |

Client contracts (REST + WS + payloads) do **not** change between
phases. Only the implementation behind them does.

---

## 8. Open questions (to close with first pilot customer)

1. **Edge → gateway transport.** MQTT (SCADA-friendly, QoS 1), plain
   HTTPS POST (simplest), or gRPC (best throughput)? Default proposal:
   HTTPS POST with a small local buffer for offline windows.
2. **Dashboard.** Do we ship a reference dashboard (Grafana + Influx
   datasource + prebuilt panels) or does the customer bring their own
   (Power BI, Ignition, Tableau)? Default proposal: ship Grafana JSON,
   let customer swap.
3. **Alerting sinks.** Email, Slack, PagerDuty, Microsoft Teams,
   SCADA-native? Default proposal: webhook out, customer wires their
   own sink.
4. **Retention.** How long do we keep 1 s resolution before downsampling?
   Default proposal: 30 days hot, 2 years cold — tune per customer
   storage budget.

Answers land in this document (not a side channel), and the answers
become the v3.0 defaults.
