# Zeta-Core — Open Browser Analytics

Zeta-Core is the open-source signal-analysis layer maintained by NovaStream88 Ltd. The active test release runs entirely inside the browser: no `.exe`, `.app`, `.so`, launcher, terminal command, or native installation is distributed.

Public source: https://github.com/greg718gate/brama-dna718

## Test-phase architecture

- **Status:** `test_phase` — open access, no payment.
- **Runtime:** browser sandbox only.
- **Background calculations:** typed Web Worker modules keep numerical workloads away from the interface thread.
- **Input privacy:** signal buffers stay in browser memory. Only a completed session summary is stored when a signed-in operator deliberately runs a session.
- **Auditability:** every computational source line can be reviewed before use.

## Mathematical modules

The browser worker covers:

1. 18×18 Hamiltonian matrix construction and time evolution.
2. Wavefunction Ψ calculations using the critical-line Riemann ζ approximation.
3. Numerical integration of the VI Intention Vector.
4. RR resampling, Hann-windowed spectrum estimation and DPLL phase mapping.

Canonical constants remain unchanged:

- carrier / 448th Riemann-zero reference: `718.57012515426885574359120304128340312332181477461 Hz`
- Schumann model frequency: `7.83 Hz`
- lunar model frequency: `18.6 Hz`
- golden ratio: `φ = (1 + √5) / 2`
- 18 rCRS coordinates: `1, 740, 951, 1227, 2996, 3424, 4166, 4832, 6393, 7756, 8415, 10059, 11200, 11336, 11915, 13703, 14784, 16179`

JavaScript executes arithmetic as IEEE-754 doubles. The complete decimal notation of the 718.570125… reference remains in source for traceability; this does not imply 75-decimal runtime precision in the browser.

## Scope statement

“DNA Gates”, “Photon Geometry”, “Lenses” and “Ritual” are terms in an interactive mathematical-linguistic model and artistic scientific visualisation. They are not medical, clinical, cardiology or diagnostic tools.

SENTINEL-718/SCIENCE.GOD operates in an open test phase. Its data and visualisations are mathematical mappings of a signal and do not constitute medical analysis or a clinical assessment of health.

## Verification

The numerical regression suite lives alongside the TypeScript source and includes the Gate 18 reference `VI = 1.1628`, matrix dimensions and wavefunction finite-value checks. Architecture decisions and performance notes remain under `docs/`.

## Licence and contact

The project is published for transparent source review under the repository's stated licence. Contact: **contact@zeta-core-dsp.com**.
