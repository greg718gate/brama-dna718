# ADR-004: Threshold Re-baseline and Migration Guide (v1.1 → v1.1.1)

Status: **Accepted**.
Date: 2026-07-15.
Related: ADR-002 (numerical fixes).

## Context

ADR-002 documents that removing the arbitrary initial-phase offset and
normalising `fault_condensation` changes the *distribution* of the two
key numbers operators watch: `phase_coherence` and `Tf`. Coherence is
typically higher, Tf is typically lower for the same underlying signal.

Any site that inherited thresholds from v1.1.0 logs — for example a
maintenance SOP saying *"raise a ticket when coherence < 0.85"* — will
under-alarm after upgrading to v1.1.1. This ADR is the migration guide.

## Reference re-baseline (synthetic fixtures)

Measured on the reference numerical implementation
(`bindings/zeta_reference_engine.txt`) over 200 windows of 4096 samples
at 44.1 kHz, target 150 Hz, seed fixed.

| Fixture                          | v1.1.0 coherence (mean) | v1.1.1 coherence (mean) | v1.1.0 Tf (mean) | v1.1.1 Tf (mean) |
|----------------------------------|-------------------------|-------------------------|------------------|------------------|
| clean sine, SNR 40 dB            | 0.86                    | 0.98                    | 0.14             | 0.02             |
| sine + 5% white noise            | 0.71                    | 0.91                    | 0.29             | 0.09             |
| bearing outer-race fault (synth) | 0.42                    | 0.55                    | 0.58             | 0.45             |
| broadband failure                | 0.18                    | 0.22                    | 0.82             | 0.78             |

The gap is largest on healthy signals (arbitrary offset no longer
punished) and smallest on already-failing signals (dominated by real
de-coherence, not phase offset).

## Suggested new operator thresholds

Status band mapping in the reference Python bindings uses **Tf**, so the
migration is straightforward:

| Band     | v1.1.0 Tf | v1.1.1 Tf (new) |
|----------|-----------|-----------------|
| HEALTHY  | < 0.15    | < 0.10          |
| WATCH    | 0.15–0.35 | 0.10–0.30       |
| DEGRADED | 0.35–0.65 | 0.30–0.60       |
| CRITICAL | ≥ 0.65    | ≥ 0.60          |

If a site uses **coherence** thresholds instead:

| Rule (v1.1.0)      | Recommended v1.1.1 rule |
|--------------------|-------------------------|
| coherence < 0.85 → WATCH  | coherence < 0.94 → WATCH  |
| coherence < 0.70 → ALERT  | coherence < 0.80 → ALERT  |
| coherence < 0.40 → STOP   | coherence < 0.50 → STOP   |

These are **starting points** — every site should re-baseline against
its own last 30 days of "known healthy" logs before wiring them into a
CMMS trigger.

## Migration procedure

1. Pin v1.1.0 in production. Do not delete logs.
2. Deploy v1.1.1 as a shadow reader on the same stream for at least 7
   days.
3. Compute per-asset mean and 3σ of Tf on the shadow stream.
4. Set the new thresholds to `mean + 2σ` (WATCH), `mean + 4σ`
   (DEGRADED), `mean + 6σ` (CRITICAL), clamped to the table above.
5. Cut over. Keep a rollback plan to v1.1.0 for one release cycle.

## Consequences

- No ABI change; drop-in binary swap.
- Sites that ignore this ADR will see fewer alerts on real faults after
  upgrade. Communicate the re-baseline requirement in every release
  note that ships v1.1.1.
