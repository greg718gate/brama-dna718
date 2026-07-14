# ADR-001 — Narrow-band biquad instead of STFT for the v1.1 front-end

Status: Accepted (shipped in v1.1-adaptive-engine).

## Context

The v1.0 baseline used a block FIR bandpass around `target_freq`. It worked in
the lab but showed two failure modes on live single-axis sensors:

1. **Edge artefacts on streaming windows.** Every new chunk restarted the FIR
   convolution, producing a coherence dip at every window boundary.
2. **Rigid centre frequency.** Real rotating assets drift by ±3–4 Hz during a
   shift (thermal expansion, load changes). A fixed-centre bandpass silently
   attenuated the very component we needed to phase-track.

The obvious alternative was a short-time Fourier transform: pick the strongest
bin near `target_freq` and phase-track that. We rejected it.

## Decision

Use a **stateful narrow-band biquad** (direct-form II transposed, Q ≈ 30) whose
state is preserved between calls, combined with an adaptive tracker that pulls
the biquad centre toward the instantaneous median frequency inside a ±5 Hz
mechanical tolerance band.

## Consequences

Pros
- No edge artefacts across streaming windows — biquad state carries continuity.
- ~O(N) with a handful of multiplies per sample: fits Raspberry-Pi-class edge
  hardware and leaves headroom for the v2.0 three-axis path.
- Adaptive tracker survives normal RPM drift without operator retuning.
- Deterministic latency (no FFT window to fill before first output).

Cons / limits
- Fixed Q means the passband is narrower than an STFT bin at low sample rates;
  intentional — off-band harmonics must not leak into the phase estimator.
- The ±5 Hz clamp is a *mechanical* prior. Assets that legitimately swing wider
  (VFD ramps, soft-start) need `v2.1` temporal mode, which relaxes the clamp
  under a monotonic-drift detector.

## Alternatives considered

- **STFT / Goertzel bin tracking.** Rejected: window latency, bin quantisation,
  and worse behaviour under partial harmonics.
- **Kalman phase-locked loop.** Considered for v2.x; overkill for a single-axis
  workhorse and adds a covariance state that complicates the license-gated
  single-gate ABI.

## Related

- `v1.1-adaptive-engine/` — implementation.
- `ROADMAP.md` — v2.1 relaxes the ±5 Hz clamp under drift detection.
