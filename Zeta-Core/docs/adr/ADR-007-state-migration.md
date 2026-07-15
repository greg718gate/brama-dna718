# ADR-007: Temporal State Migration Between Engine Versions

Status: **Accepted** — targeting Zeta-Core v2.1 and forward.
Date: 2026-07-15.
Related: ADR-003 (Temporal ABI), ADR-006 (Serialization format).

## Context

Once v2.1 ships, customers will accumulate `zeta_temporal_state` files —
serialized rolling baselines representing weeks or months of an asset's
history. If v2.2 adds new fields (say, a second-order drift estimator),
a straight `deserialize` on the old state must not throw those weeks of
observation away and must not silently produce corrupt output.

Two mechanisms are needed:

1. A **version check** that fails closed on unknown formats.
2. A **migration path** that upgrades old payloads in place.

## Decision

### Version handling

`zeta_temporal_state_deserialize` inspects `format_version` in the
envelope (ADR-006).

- If `format_version == current`: normal load.
- If `format_version < current` and a migration exists: run migration,
  load, mark the state as "migrated from vN".
- If `format_version < current` and no migration exists: return `-8
  STATE_VERSION_MISMATCH`. **No silent zero-fill of missing fields.**
- If `format_version > current`: return `-8`. Newer engine wrote it,
  this one cannot promise correct semantics.

### Migration API

```c
/* Upgrade an in-memory state from an older payload version to the
 * engine's current version. Returns 0 on success, -8 on unsupported
 * jump. Migrations are chained internally (v1 -> v2 -> v3), not
 * requested pairwise by the caller. */
int zeta_temporal_state_migrate(
    zeta_temporal_state* state,
    uint16_t from_version,
    uint16_t to_version
);
```

Callers rarely invoke this directly — `_deserialize` calls it
internally when it detects an older payload. The symbol is exported
mainly for tooling (offline batch upgraders) and for unit tests.

### Migration rules

Every migration step (`vN -> vN+1`) obeys three rules:

1. **Additive only.** New fields get a documented default derived from
   existing fields — never an arbitrary constant. Example: a new
   `baseline_skewness` field defaults to `0.0` (symmetric assumption)
   and the state is flagged as "skewness estimator warming up" for the
   first M windows.
2. **No field removal in a minor bump.** Removing a field requires a
   `format_version` major bump and a hard cutover; customers get
   notice in `CHANGELOG.md` under `[Breaking]`.
3. **Idempotent.** Running the same migration twice must produce the
   same result — enforced by a test in
   `tests/unit/test_state_migration.txt`.

### Rejected alternatives

- **Zero-fill missing fields on load.** Rejected — masks corruption
  and produces subtly wrong drift-class output for weeks before the
  baseline reconverges.
- **Force customers to reset state on every upgrade.** Rejected —
  destroys the exact asset history the product is sold to accumulate.
- **Version-per-field schema (protobuf-style).** Rejected — the
  wire format (ADR-006) already gives us a single monotonic version
  byte; per-field tags would be over-engineering for a
  single-producer, single-consumer format.

## Upgrade compatibility matrix

| From \ To    | v2.1 | v2.2 | v3.0 |
|--------------|------|------|------|
| v2.1         | —    | auto | auto (v2.1→v2.2→v3.0) |
| v2.2         | ✗    | —    | auto |
| v3.0         | ✗    | ✗    | —    |

`✗` = intentional. A newer state cannot be loaded by an older engine;
downgrade is a rollback event handled by keeping the previous state
file, not by lossy conversion.

## Consequences

- Every new engine version ships a migration function `v(N-1) -> vN`,
  or explicitly documents itself as a hard cutover in `CHANGELOG.md`
  under `[Breaking]`.
- `tests/unit/test_state_migration.txt` gets one new case per version
  bump, checking round-trip and idempotency.
- Customers get an unbroken upgrade path from their first v2.1 state
  file onward — the core sales promise of a *baseline that accrues
  value over months*.
