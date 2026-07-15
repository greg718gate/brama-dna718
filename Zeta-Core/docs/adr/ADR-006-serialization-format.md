# ADR-006: Serialization Format for Temporal State

Status: **Accepted** — targeting Zeta-Core v2.1.
Date: 2026-07-15.
Related: ADR-003 (Temporal ABI), ADR-007 (State migration).

## Context

`zeta_temporal_state_serialize/deserialize` (ADR-003) need a concrete
wire format. Candidates:

| Format          | Size    | Speed | Schema evolution | Debuggability |
|-----------------|---------|-------|------------------|---------------|
| JSON            | large   | slow  | manual           | excellent     |
| Protocol Buffers| compact | fast  | native (field tags) | needs `.proto` |
| FlatBuffers     | compact | zero-copy | native       | needs schema  |
| MessagePack     | compact | fast  | manual (versioned envelope) | ok |
| Custom binary   | smallest| fastest | manual        | poor          |

Constraints specific to this project:

- The engine is a stripped C `.so` with **no external dependencies**.
  Pulling protobuf/flatbuffers runtime into the binary would bloat it
  and add attack surface.
- State is small — a ring buffer (≤ a few thousand doubles) plus a
  handful of scalars — so wire size differences between formats are
  negligible in absolute bytes.
- The **only** producers and consumers are this engine, across
  versions. There is no third-party interop story.

## Decision

**Custom versioned binary envelope**, little-endian, with a strict
header. Rationale: the two things that matter here — no runtime
dependency, and a version byte we control byte-for-byte — both point at
the same answer. FlatBuffers/protobuf solve a problem (multi-language
interop with third parties) we do not have.

### Envelope layout

```text
offset  size  field
------  ----  -----------------------------------------------------
0       4     magic          = "ZT1\0" (0x5A 0x54 0x31 0x00)
4       2     format_version = uint16 LE   (current: 1)
6       2     engine_version = uint16 LE   (packed: major*256 + minor)
8       4     payload_len    = uint32 LE   (bytes that follow)
12      N     payload        = versioned body (see below)
12+N    32    hmac_sha256    = HMAC(state_secret, header || payload)
```

### Payload v1 (engine v2.1)

```text
offset  size  field
------  ----  -----------------------------------------------------
0       4     history_capacity     = uint32 LE  (samples)
4       4     history_len          = uint32 LE  (0 .. capacity)
8       8*L   history_ring         = float64[L] LE   (L = history_len)
...     8     baseline_mean        = float64 LE
...     8     baseline_var         = float64 LE
...     8     baseline_alpha       = float64 LE
...     8     last_target_freq_hz  = float64 LE
...     4     drift_class          = uint32 LE   (0..3, matches ABI enum)
...     4     samples_seen         = uint32 LE
```

Padding: none. Alignment: none required — engine reads via
`memcpy`, not typed pointer casts.

### Why an HMAC on the state?

A serialized state file that a customer emails to support could
otherwise be tampered with to trigger paths the fuzzer never saw.
Signing the envelope with the same rotating pad used elsewhere in the
binary means a hand-edited state deserializes to `-8
STATE_VERSION_MISMATCH` (reused as "integrity failed"). Cheap
defensive layer; no cost to legitimate users.

## Consequences

- No new runtime dependencies inside the `.so`.
- Format is documented byte-for-byte; a future Rust or Go client can
  parse it from this ADR alone.
- Bumping `format_version` is the only supported way to change the
  payload shape (see ADR-007 for migration mechanics).
- Human-readable dumps are provided by a separate CLI helper
  (`zeta-state-dump`, private tool), not by the format itself.
