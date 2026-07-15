# ADR-003: Public ABI for `run_zeta_temporal` (v2.1)

Status: **Proposed** — targeting Zeta-Core v2.1.
Date: 2026-07-15.
Supersedes: none. Extends: ADR-001 (biquad DSP core), v2.0 spatial ABI.

## Context

v2.0 answers the question *"how healthy is this asset right now, across
three axes?"*. It is a snapshot engine — every call is independent and there
is no memory between windows.

Predictive maintenance requires the orthogonal question *"is this asset
getting worse, and how fast?"*. Answering it needs state that persists
across calls: a rolling window of past spatial-friction values, a
per-asset baseline, and a drift classifier.

Two designs were considered.

### Option A — Caller-managed history buffer (stateless engine)

```c
int run_zeta_temporal(
    const double* input,           // interleaved xyz, current window
    const double* history_tf,      // previous N Tf values, caller-owned
    int           history_len,
    double*       output,          // >= 16 doubles
    int           n_samples,
    int           sample_rate,
    double        target_freq,
    const char*   license_key
);
```

Pros: engine remains stateless, trivially thread-safe, no allocator inside
the `.so`, easy to snapshot / migrate across nodes.

Cons: caller must maintain the ring buffer correctly; every integrator
re-implements the same aggregation logic; the baseline (mean/std over N
past windows) leaks into user code where it will drift from the reference
implementation.

### Option B — Opaque engine state (chosen)

```c
typedef struct zeta_temporal_state zeta_temporal_state;

zeta_temporal_state* zeta_temporal_state_new(
    int    history_window_samples,  // e.g. 10 min * fs / block_size
    double baseline_alpha,          // EWMA factor for baseline, 0..1
    const char* license_key
);

void zeta_temporal_state_free(zeta_temporal_state* s);

int run_zeta_temporal(
    const double*         input,        // interleaved xyz
    double*               output,       // >= 16 doubles
    int                   n_samples,
    int                   sample_rate,
    double                target_freq,
    zeta_temporal_state*  state,        // opaque, owned by caller
    const char*           license_key
);

int zeta_temporal_state_reset(zeta_temporal_state* s);
int zeta_temporal_state_serialize(
    const zeta_temporal_state* s,
    unsigned char* out, int out_cap, int* out_len);
int zeta_temporal_state_deserialize(
    zeta_temporal_state* s,
    const unsigned char* in, int in_len);
```

Pros: aggregation, baseline and drift classifier live inside the engine, so
every integrator gets identical semantics; state can be persisted and
restored across restarts via serialize/deserialize; upgrades to the
classifier ship with the `.so` without touching client code.

Cons: engine owns a small heap allocation; callers must remember to call
`_free`; state format is versioned and bumped on any change (see
`state_serialize` header byte).

## Decision

Adopt **Option B**. It keeps the client integration surface identical in
shape to v2.0 (one call per window, one `output[]`), while moving the
aggregation logic — the actual product value of v2.1 — inside the licensed
binary where it belongs.

## Output layout (16 doubles)

| Index | Field                                | Units      |
|-------|--------------------------------------|------------|
| 0..2  | per-axis coherence (x, y, z)         | 0..1       |
| 3..5  | per-axis Tf (x, y, z)                | 0..1       |
| 6     | global spatial friction (v2.0 parity)| 0..1       |
| 7     | tracked frequency                    | Hz         |
| 8     | trend slope of global Tf             | 1/s        |
| 9     | drift class (0 stable, 1 linear, 2 exponential, 3 step) | enum |
| 10    | anomaly z-score vs baseline          | σ          |
| 11    | baseline mean of global Tf           | 0..1       |
| 12    | baseline std of global Tf            | 0..1       |
| 13    | rolling-window fill ratio            | 0..1       |
| 14    | estimated lead time to CRITICAL      | hours (-1 if not applicable) |
| 15    | reserved (0.0)                       | —          |

Indices 0..7 are byte-for-byte identical to the v2.0 layout so a v2.0
client wrapper reading the first 8 slots continues to work.

## State-file format

`ZT1\0` magic + `uint16` version + little-endian packed doubles for
history ring buffer, baseline EWMA, and drift-classifier internals.
Version byte is bumped on any semantic change; the engine rejects
mismatched versions with `-8 STATE_VERSION_MISMATCH` (new return code).

## Overlap strategy (referenced from user review)

`run_zeta_temporal` operates on **non-overlapping** windows internally —
one call, one aggregation step. If the caller wants finer temporal
resolution, they call more often with shorter blocks; overlap is a
scheduling decision above the engine, not inside it. This keeps CPU cost
predictable and matches the Performance Budget targets.

## Consequences

- Adds a new license feature flag `TEMPORAL (0x0004)` on top of `CORE`
  and `SPATIAL`.
- Adds return code `-8 STATE_VERSION_MISMATCH`.
- v2.0 wrappers keep working unchanged.
- The Python reference client will grow a `ZetaTemporal` class that owns
  the opaque handle via `ctypes` and exposes `analyze()` / `reset()` /
  `save_state()` / `load_state()`.

## §4.3 Memory ownership

The `output[]` buffer is **caller-allocated, caller-owned**. Contract:

- The caller allocates at least `16 * sizeof(double)` bytes and passes
  the pointer in. The engine writes 16 doubles and returns.
- The engine performs **no allocation on the output path**, no
  `malloc`, no thread-local scratch that outlives the call. Slot 15 is
  reserved and written as `0.0` — never left uninitialised.
- The engine reads `input[]` and does not retain the pointer after the
  call returns. The caller may free or reuse `input[]` immediately.

The `zeta_temporal_state*` handle is the only heap object the engine
owns. Its lifecycle is explicit and single-owner:

```text
zeta_temporal_state_new()   ─►   caller receives non-NULL handle
                                 ─►   any number of run_zeta_temporal()
                                 ─►   optional serialize()/deserialize()
zeta_temporal_state_free()  ─►   handle invalidated, must not be reused
```

Calling `_free()` twice on the same handle is undefined. Passing
`NULL` to `_free()` is a no-op. Passing a state allocated by one
engine version to a `.so` of a different major version is rejected
with `-8 STATE_VERSION_MISMATCH` — never dereferenced blindly.

Thread-safety: a single `zeta_temporal_state*` is **not** safe to use
from multiple threads concurrently. Each asset gets its own state.
The engine itself carries no global mutable state, so N assets on N
threads with N handles is fully supported.

Rejected alternative: returning a `zeta_temporal_result_t*` that the
caller must `free()`. That doubles the ownership rules the integrator
has to remember (one for state, one for every result), for zero
benefit — the result is fixed-size and the caller already owns a
stack buffer for it.
