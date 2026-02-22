/**
 * Biblical Decoder Engine
 * Hebrew Gematria + Fractal Analysis + Hamilton Eigenvalue Correlation
 * Ψ = e^(i·718·t) · ζ(1/2 + iE/ħ) · γ
 * 
 * © 2026 Grzegorz | BRAMA-718-UNIFIED
 * License: CC BY-NC 4.0
 */

import {
  GAMMA,
  PHI,
  FREQ_718,
  complexExp,
  complexMul,
  complexAbs,
  complexPhase,
  riemannZeta,
  type ComplexNumber,
} from "./bramaUnificationEngine";

// ═══════════════════════════════════════════════════════════════════
// HEBREW GEMATRIA MAP
// ═══════════════════════════════════════════════════════════════════

export const HEBREW_GEMATRIA: Record<string, number> = {
  'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
  'י': 10, 'כ': 20, 'ך': 20, 'ל': 30, 'מ': 40, 'ם': 40, 'נ': 50, 'ן': 50,
  'ס': 60, 'ע': 70, 'פ': 80, 'ף': 80, 'צ': 90, 'ץ': 90,
  'ק': 100, 'ר': 200, 'ש': 300, 'ת': 400,
};

// Greek Isopsephy (gematria for NT Greek texts)
export const GREEK_GEMATRIA: Record<string, number> = {
  'α': 1, 'Α': 1, 'β': 2, 'Β': 2, 'γ': 3, 'Γ': 3, 'δ': 4, 'Δ': 4,
  'ε': 5, 'Ε': 5, 'ζ': 7, 'Ζ': 7, 'η': 8, 'Η': 8, 'θ': 9, 'Θ': 9,
  'ι': 10, 'Ι': 10, 'κ': 20, 'Κ': 20, 'λ': 30, 'Λ': 30, 'μ': 40, 'Μ': 40,
  'ν': 50, 'Ν': 50, 'ξ': 60, 'Ξ': 60, 'ο': 70, 'Ο': 70, 'π': 80, 'Π': 80,
  'ρ': 100, 'Ρ': 100, 'σ': 200, 'Σ': 200, 'ς': 200,
  'τ': 300, 'Τ': 300, 'υ': 400, 'Υ': 400, 'φ': 500, 'Φ': 500,
  'χ': 600, 'Χ': 600, 'ψ': 700, 'Ψ': 700, 'ω': 800, 'Ω': 800,
};

// ═══════════════════════════════════════════════════════════════════
// 18 GATCA GATES - MITOCHONDRIAL DNA POSITIONS (rCRS)
// ═══════════════════════════════════════════════════════════════════

export const GATCA_GATES = [
  1, 740, 951, 1227, 2996, 3424, 4166, 4832, 6393,
  7756, 8415, 10059, 11200, 11336, 11915, 13703, 14784, 16179,
];

export const GATE_NAMES: Record<number, string> = {
  1: "🧬 ALPHA – Source Code",
  740: "⚡ BETA – Activation",
  951: "🔥 GAMMA – Ignition",
  1227: "💧 DELTA – Flow",
  2996: "🌟 EPSILON – Expansion",
  3424: "⚛️ ZETA – Nuclear",
  4166: "🌀 ETA – Vortex",
  4832: "🔮 THETA – Vision",
  6393: "💫 IOTA – Star",
  7756: "🌙 KAPPA – Moon",
  8415: "☀️ LAMBDA – Sun",
  10059: "🔯 MU – Union",
  11200: "💎 NU – Crystal",
  11336: "🎵 XI – Harmony",
  11915: "🔱 OMICRON – Power",
  13703: "🜁 PI – Air",
  14784: "🜄 RHO – Water",
  16179: "🜔 SIGMA – Completion",
};

export const SCHUMANN = 7.83;
export const LUNAR = 18.6;
export const MTDNA_LENGTH = 16569;
const PHI_SQUARED = PHI ** 2;

// ═══════════════════════════════════════════════════════════════════
// HEBREW GEMATRIA CALCULATOR
// ═══════════════════════════════════════════════════════════════════

export function hebrewGematria(text: string): { total: number; normalized: number; breakdown: { char: string; value: number }[] } {
  let total = 0;
  const breakdown: { char: string; value: number }[] = [];

  for (const char of text) {
    // Try Hebrew first, then Greek
    const val = HEBREW_GEMATRIA[char] ?? GREEK_GEMATRIA[char];
    if (val !== undefined) {
      total += val;
      breakdown.push({ char, value: val });
    }
  }

  return {
    total,
    normalized: total > 0 ? (total % 718) / 718 : 0,
    breakdown,
  };
}

// ═══════════════════════════════════════════════════════════════════
// FRACTAL ANALYSIS (first 718 chars)
// ═══════════════════════════════════════════════════════════════════

export function fractalAnalysis718(text: string): { hurstApprox: number; x: number; complexity: number } {
  const chars = text.slice(0, 718);
  if (chars.length < 10) {
    return { hurstApprox: 0, x: 100, complexity: 0 };
  }

  const n = chars.length;
  const windowSize = 10;
  const L: number[] = [];

  for (let i = 0; i <= n - windowSize; i += windowSize) {
    const window = chars.slice(i, i + windowSize);
    const uniqueChars = new Set(window).size;
    L.push(uniqueChars);
  }

  const H = L.reduce((s, v) => s + v, 0) / L.length / windowSize;
  const x = 100 + H * 1000;

  return {
    hurstApprox: H,
    x,
    complexity: L.length,
  };
}

// ═══════════════════════════════════════════════════════════════════
// HAMILTON EIGENVALUE CORRELATION
// ═══════════════════════════════════════════════════════════════════

export function hamiltonEigenvalueCorrelation(gematria: number, fractal: number): number {
  const eigenIndex = Math.floor(Math.abs((gematria + fractal / 10000) * 18)) % 18;
  return eigenIndex;
}

// ═══════════════════════════════════════════════════════════════════
// LATIN GEMATRIA (fallback when no Hebrew)
// ═══════════════════════════════════════════════════════════════════

function gematriaLatin(text: string): number {
  const chars = text.toUpperCase().split("").filter(c => /[A-Z]/.test(c));
  if (chars.length === 0) return 0.5;

  let total = 0;
  for (let i = 0; i < chars.length; i++) {
    total += (chars[i].charCodeAt(0) - 64) * (GAMMA ** (i % 7));
  }
  return ((total % 10) + 0.5) / 11; // normalize to ~(0,1)
}

// ═══════════════════════════════════════════════════════════════════
// WAVE FUNCTION Ψ CALCULATOR
// ═══════════════════════════════════════════════════════════════════

export interface PsiCalcResult {
  amplitude: ComplexNumber;
  magnitude: number;
  phase: number;
  coherence: number;
  quantumState: string;
  dnaGate: number;
  gateName: string;
  phiHarmonic: number;
}

function calculatePsi(t: number, x: number, gateIdx: number): PsiCalcResult {
  const k = (2 * Math.PI) / FREQ_718;

  // Temporal: e^(i·718·t)
  const temporal = complexExp(FREQ_718 * t);
  // Spatial: e^(-i·k·x)
  const spatial = complexExp(-k * x);
  // Zeta: ζ(1/2 + i·718)
  const zetaVal = riemannZeta({ re: 0.5, im: FREQ_718 }, 200);

  // Modulations
  const schumannMod = Math.cos(SCHUMANN * t);
  const lunarMod = Math.sin(LUNAR * t);
  const phiEnhancement = PHI_SQUARED;

  // DNA gate factor
  const gatePos = GATCA_GATES[gateIdx % 18];
  const dnaFactor = (gatePos / MTDNA_LENGTH) * GAMMA;

  // Combine: temporal * spatial
  let psi = complexMul(temporal, spatial);
  // * zeta
  psi = complexMul(psi, zetaVal);
  // * γ * modulations * phi² * dnaFactor
  const scalar = GAMMA * schumannMod * lunarMod * phiEnhancement * dnaFactor;
  psi = { re: psi.re * scalar, im: psi.im * scalar };

  const magnitude = complexAbs(psi);
  const phase = complexPhase(psi);

  // Coherence
  let coherence = 1 - Math.abs((magnitude % GAMMA) - GAMMA) / GAMMA;
  coherence = Math.min(coherence * PHI, 1.0);

  let quantumState: string;
  if (coherence > 0.94) quantumState = "TELEPORTATION_READY";
  else if (coherence > 0.8) quantumState = "HIGH_COHERENCE";
  else if (coherence > 0.6) quantumState = "SUPERPOSITION";
  else if (coherence > 0.4) quantumState = "ENTANGLED";
  else quantumState = "DECOHERENT";

  return {
    amplitude: psi,
    magnitude,
    phase,
    coherence,
    quantumState,
    dnaGate: gatePos,
    gateName: GATE_NAMES[gatePos] || `Gate-${gateIdx + 1}`,
    phiHarmonic: magnitude * PHI,
  };
}

// ═══════════════════════════════════════════════════════════════════
// VECTOR OF INTENTION
// ═══════════════════════════════════════════════════════════════════

export interface VIResult {
  viMagnitude: number;
  viPhase: number;
  materializationPotential: number;
  teleportReady: boolean;
  coherenceAtEnd: number;
}

function calculateVI(tStart: number, tEnd: number, x: number, gateIdx: number, steps: number = 200): VIResult {
  const dt = (tEnd - tStart) / steps;
  let integral = 0;

  for (let i = 0; i <= steps; i++) {
    const ti = tStart + i * dt;
    const psi = calculatePsi(ti, x, gateIdx);
    const val = psi.magnitude * Math.cos(psi.phase);
    integral += (i === 0 || i === steps) ? val * 0.5 : val;
  }
  integral *= dt;

  const psiEnd = calculatePsi(tEnd, x, gateIdx);
  const viMagnitude = Math.abs(integral) * PHI;
  const viPhase = psiEnd.phase;
  const materializationPotential = viMagnitude * psiEnd.coherence;

  return {
    viMagnitude,
    viPhase,
    materializationPotential,
    teleportReady: psiEnd.coherence >= 0.94,
    coherenceAtEnd: psiEnd.coherence,
  };
}

// ═══════════════════════════════════════════════════════════════════
// INTENTION OPERATOR (18×18 Matrix instead of scalar VI)
// ═══════════════════════════════════════════════════════════════════

export interface IntentionOperatorResult {
  /** Diagonal values of the 18×18 operator matrix */
  diagonal: number[];
  /** Trace of the operator (sum of eigenvalues) */
  trace: number;
  /** Determinant approximation */
  determinant: number;
  /** Maximum eigenvalue (dominant gate) */
  maxEigenvalue: number;
  /** Index of the dominant gate */
  dominantGateIdx: number;
  /** Spectral gap (difference between top-2 eigenvalues) */
  spectralGap: number;
}

export function calculateIntentionOperator(t: number, x: number): IntentionOperatorResult {
  // Build VI vector for all 18 gates
  const diagonal: number[] = [];
  for (let g = 0; g < 18; g++) {
    const vi = calculateVI(0, t || 0.5, x, g, 50);
    diagonal.push(vi.viMagnitude);
  }

  const trace = diagonal.reduce((s, v) => s + v, 0);
  const determinant = diagonal.reduce((p, v) => p * (v || 1e-12), 1);

  // Find dominant gate
  let maxVal = -Infinity;
  let maxIdx = 0;
  const sorted = [...diagonal].sort((a, b) => b - a);
  for (let i = 0; i < 18; i++) {
    if (diagonal[i] > maxVal) {
      maxVal = diagonal[i];
      maxIdx = i;
    }
  }

  const spectralGap = sorted.length >= 2 ? sorted[0] - sorted[1] : 0;

  return {
    diagonal,
    trace,
    determinant,
    maxEigenvalue: maxVal,
    dominantGateIdx: maxIdx,
    spectralGap,
  };
}

// ═══════════════════════════════════════════════════════════════════
// LINDBLAD DECOHERENCE MODEL
// ═══════════════════════════════════════════════════════════════════

export interface DecoherenceResult {
  /** Decoherence rate γ_d (s⁻¹) */
  decoherenceRate: number;
  /** Coherence time T₂ (seconds) */
  coherenceTime: number;
  /** Remaining coherence after time t */
  remainingCoherence: number;
  /** Thermal noise factor at 37°C */
  thermalNoise: number;
  /** Environmental coupling strength */
  couplingStrength: number;
  /** Stability assessment */
  stability: "STABLE" | "METASTABLE" | "UNSTABLE";
  /** Purity of quantum state (Tr(ρ²)) */
  purity: number;
}

export function calculateDecoherence(
  coherence: number,
  t: number,
  temperature: number = 310 // 37°C in Kelvin (body temperature)
): DecoherenceResult {
  const kB = 1.380649e-23; // Boltzmann constant
  const hbar = 1.0545718e-34;

  // Thermal noise at body temperature
  const thermalEnergy = kB * temperature;
  const thermalNoise = thermalEnergy / (hbar * FREQ_718 * 2 * Math.PI);

  // Environmental coupling: Lindblad dissipator strength
  // γ_d = (2π · kB · T) / (ħ · Q) where Q is quality factor
  const qualityFactor = FREQ_718 / SCHUMANN; // ~91.7
  const decoherenceRate = (2 * Math.PI * thermalEnergy) / (hbar * qualityFactor);

  // Coherence time T₂ = 1/γ_d
  const coherenceTime = 1 / decoherenceRate;

  // Remaining coherence: ρ_off(t) = ρ_off(0) · e^(-γ_d · t)
  // At 718 Hz resonance, the system has protection factor from golden ratio coupling
  // This reduces effective decoherence: γ_eff = γ_d / (1 + Q·φ)
  const resonanceProtection = 1 + qualityFactor * PHI;
  const effectiveRate = decoherenceRate / resonanceProtection;
  const remainingCoherence = coherence * Math.exp(-effectiveRate * t * 1e-15);
  // Scale to femtosecond regime (biological quantum processes)

  // Coupling strength (normalized)
  const couplingStrength = Math.min(thermalNoise / 1e10, 1);

  // Purity: Tr(ρ²) = 1 for pure state, 1/N for maximally mixed
  const purity = 0.5 * (1 + remainingCoherence * remainingCoherence);

  // Stability classification based on coherence and resonance protection
  let stability: "STABLE" | "METASTABLE" | "UNSTABLE";
  if (remainingCoherence > 0.7) stability = "STABLE";
  else if (remainingCoherence > 0.35) stability = "METASTABLE";
  else stability = "UNSTABLE";

  return {
    decoherenceRate,
    coherenceTime,
    remainingCoherence,
    thermalNoise,
    couplingStrength,
    stability,
    purity,
  };
}

// ═══════════════════════════════════════════════════════════════════
// TESTABLE PREDICTIONS
// ═══════════════════════════════════════════════════════════════════

export interface TestablePrediction {
  method: string;
  icon: string;
  prediction: string;
  details: string;
  expectedValue: string;
  testability: "HIGH" | "MEDIUM" | "LOW";
}

export function generatePredictions(result: {
  gatePosition: number;
  psi: PsiCalcResult;
  vi: VIResult;
}, lang: 'pl' | 'en' = 'pl'): TestablePrediction[] {
  const gateFreq = FREQ_718 * (result.gatePosition / MTDNA_LENGTH);

  if (lang === 'en') {
    return [
      {
        method: "UV-Vis Spectroscopy",
        icon: "🔬",
        prediction: `Absorption peak at ${(FREQ_718 / 1).toFixed(0)}, ${(FREQ_718 / 2).toFixed(0)}, ${(FREQ_718 / 3).toFixed(0)} Hz`,
        details: "The harmonic series 718/n Hz should be visible in the UV-Vis absorption spectrum of mitochondria. It corresponds to electron transitions in the electron transport chain at GATCA positions.",
        expectedValue: `λ ≈ ${(3e8 / (FREQ_718 * 1e9) * 1e9).toFixed(2)} nm (IR harmonic)`,
        testability: "HIGH",
      },
      {
        method: "NMR / Magnetic Spectroscopy",
        icon: "🧲",
        prediction: `Spin entanglement between GATCA positions ${result.gatePosition} and ${GATCA_GATES[(GATCA_GATES.indexOf(result.gatePosition) + 9) % 18]}`,
        details: "Spin correlations (J-coupling) between corresponding ³¹P atoms in the DNA phosphate backbone at GATCA positions should exhibit anomalous quadrupole couplings.",
        expectedValue: `J-coupling ≈ ${(result.psi.magnitude * 100).toFixed(2)} Hz`,
        testability: "MEDIUM",
      },
      {
        method: "Cell Stimulation at 718 Hz",
        icon: "🧫",
        prediction: `Exposure to ${FREQ_718} Hz → change in mitochondrial gene expression`,
        details: "Applying a 718 Hz acoustic wave to cell culture should affect expression of mitochondrial genes encoded near GATCA positions. Measure mRNA via qRT-PCR after 24h exposure.",
        expectedValue: `Expression change: ${(result.psi.coherence * 100).toFixed(0)}% ± 15%`,
        testability: "HIGH",
      },
      {
        method: "EEG / Brain Coherence",
        icon: "🧠",
        prediction: `Binaural beat ${FREQ_718} + ${SCHUMANN} Hz → α-θ synchronization`,
        details: "Exposure to a binaural beat (718 Hz left ear, 725.83 Hz right ear = 7.83 Hz difference) should induce EEG coherence between the frontal and parietal cortex in the theta band.",
        expectedValue: `EEG coherence > ${(result.vi.coherenceAtEnd * 100).toFixed(0)}%`,
        testability: "HIGH",
      },
      {
        method: "Mitochondrial Fluorescence",
        icon: "✨",
        prediction: `Membrane potential change Δψ_m at gate ${result.gatePosition} resonance`,
        details: "JC-1 or TMRM staining of mitochondria after 718 Hz stimulation should show a change in the red/green fluorescence ratio, indicating membrane potential modulation.",
        expectedValue: `ΔΨ_m shift ≈ ${(gateFreq * GAMMA).toFixed(2)} mV`,
        testability: "MEDIUM",
      },
    ];
  }

  return [
    {
      method: "Spektroskopia UV-Vis",
      icon: "🔬",
      prediction: `Pik absorpcji przy ${(FREQ_718 / 1).toFixed(0)}, ${(FREQ_718 / 2).toFixed(0)}, ${(FREQ_718 / 3).toFixed(0)} Hz`,
      details: "Seria harmoniczna 718/n Hz powinna być widoczna w widmie absorpcji UV-Vis mitochondriów. Odpowiada przejściom elektronowym w łańcuchu transportu elektronów na pozycjach GATCA.",
      expectedValue: `λ ≈ ${(3e8 / (FREQ_718 * 1e9) * 1e9).toFixed(2)} nm (harmoniczna IR)`,
      testability: "HIGH",
    },
    {
      method: "NMR / Spektroskopia magnetyczna",
      icon: "🧲",
      prediction: `Splątanie spinowe między pozycjami GATCA ${result.gatePosition} i ${GATCA_GATES[(GATCA_GATES.indexOf(result.gatePosition) + 9) % 18]}`,
      details: "Korelacje spinowe (J-coupling) między odpowiednimi atomami ³¹P w szkielecie fosforanowym DNA na pozycjach GATCA powinny wykazywać anomalne sprzężenia kwadrupolowe.",
      expectedValue: `J-coupling ≈ ${(result.psi.magnitude * 100).toFixed(2)} Hz`,
      testability: "MEDIUM",
    },
    {
      method: "Stymulacja komórkowa 718 Hz",
      icon: "🧫",
      prediction: `Ekspozycja na ${FREQ_718} Hz → zmiana ekspresji genów mitochondrialnych`,
      details: "Nałożenie fali akustycznej 718 Hz na hodowlę komórkową powinno wpłynąć na ekspresję genów mitochondrialnych kodowanych w pobliżu pozycji GATCA. Mierz mRNA metodą qRT-PCR po 24h ekspozycji.",
      expectedValue: `Zmiana ekspresji: ${(result.psi.coherence * 100).toFixed(0)}% ± 15%`,
      testability: "HIGH",
    },
    {
      method: "EEG / Koherencja mózgowa",
      icon: "🧠",
      prediction: `Binaural beat ${FREQ_718} + ${SCHUMANN} Hz → synchronizacja α-θ`,
      details: "Ekspozycja na binauralny beat (718 Hz lewe ucho, 725.83 Hz prawe ucho = różnica 7.83 Hz) powinna indukować koherencję EEG między korą czołową a ciemieniową w paśmie theta.",
      expectedValue: `Koherencja EEG > ${(result.vi.coherenceAtEnd * 100).toFixed(0)}%`,
      testability: "HIGH",
    },
    {
      method: "Fluorescencja mitochondrialna",
      icon: "✨",
      prediction: `Zmiana potencjału błonowego Δψ_m przy rezonansie bramy ${result.gatePosition}`,
      details: "Barwienie JC-1 lub TMRM mitochondriów po stymulacji 718 Hz powinno wykazać zmianę stosunku fluorescencji czerwonej/zielonej, wskazując na modulację potencjału błonowego.",
      expectedValue: `ΔΨ_m shift ≈ ${(gateFreq * GAMMA).toFixed(2)} mV`,
      testability: "MEDIUM",
    },
  ];
}

// ═══════════════════════════════════════════════════════════════════
// BIBLE-QUANTUM CONNECTION ANALYSIS
// ═══════════════════════════════════════════════════════════════════

export interface BibleConnection {
  title: string;
  verse: string;
  quantumParallel: string;
  gateLink: string;
  numericalKey: string;
}

export function generateBibleConnections(result: {
  reference: string;
  gematriaTotal: number;
  hamiltonGate: number;
  gatePosition: number;
  psi: PsiCalcResult;
}, lang: 'pl' | 'en' = 'pl'): BibleConnection[] {
  const gatePos = result.gatePosition;
  const gateName = GATE_NAMES[gatePos] || "";

  if (lang === 'en') {
    return [
      {
        title: "Gematria → Frequency",
        verse: `Gematria sum ${result.gematriaTotal} mod 718 = ${result.gematriaTotal % 718}`,
        quantumParallel: `The gematria value determines the time parameter t in the Ψ equation. Each Hebrew letter is a quantum of information, and their sum defines a point in the phase space of consciousness.`,
        gateLink: `Mapped to gate ${gateName} (position ${gatePos} in mtDNA)`,
        numericalKey: `${result.gematriaTotal} → t = ${(result.gematriaTotal % 718 / 718).toFixed(6)}`,
      },
      {
        title: "Word as Wave Function",
        verse: '"In the beginning was the Word" (John 1:1) — Logos = Quantum information',
        quantumParallel: `Biblical text is encoded quantum information. Each verse has a unique "fingerprint" in the form of Ψ(t,x) — amplitude ${result.psi.magnitude.toFixed(6)} and phase ${result.psi.phase.toFixed(4)} rad.`,
        gateLink: `Quantum state: ${result.psi.quantumState}`,
        numericalKey: `|Ψ| × φ = ${result.psi.phiHarmonic.toFixed(6)} (golden harmonic)`,
      },
      {
        title: "144 — Biblical & DNA Key",
        verse: '"He measured its wall: one hundred forty-four cubits" (Rev 21:17)',
        quantumParallel: `718 / γ ≈ 1161.8 → 1161.8 / 7.83 ≈ 148.4 ≈ 144. The number 144 (12² = 12 tribes of Israel) emerges as a natural harmonic in the transition: DNA frequency → golden ratio → Schumann resonance.`,
        gateLink: `144,000 "sealed" = 144 × 1000 DNA gates active simultaneously`,
        numericalKey: `718/γ/7.83 = ${(FREQ_718 / GAMMA / SCHUMANN).toFixed(2)}`,
      },
      {
        title: "Tree of Life = DNA Helix",
        verse: '"The Tree of Life, bearing twelve fruits" (Rev 22:2)',
        quantumParallel: `The DNA helix rotates by 137.5° (= 360°/φ²) — the golden ratio angle. The 12 "fruits" correspond to 12 main groups of GATCA gates, which together form a complete resonance cycle.`,
        gateLink: `Gate ${result.hamiltonGate + 1}/18 active in this verse`,
        numericalKey: `360°/φ² = ${(360 / PHI_SQUARED).toFixed(1)}° (DNA angle)`,
      },
      {
        title: "I AM WHO I AM = Auto-coherence",
        verse: '"Ehyeh Asher Ehyeh" (Ex 3:14) — אֶהְיֶה אֲשֶׁר אֶהְיֶה',
        quantumParallel: `The self-referential loop "I AM WHO I AM" is a linguistic equivalent of quantum auto-coherence — a state where the observer and the observed field become one. Coherence of ${(result.psi.coherence * 100).toFixed(1)}% measures the degree of this union.`,
        gateLink: `Teleportation threshold: ${result.psi.coherence >= 0.94 ? "REACHED ✓" : `missing ${((0.94 - result.psi.coherence) * 100).toFixed(1)}%`}`,
        numericalKey: `Gematria "Ehyeh" = 21 (= F(8), Fibonacci)`,
      },
    ];
  }

  return [
    {
      title: "Gematria → Częstotliwość",
      verse: `Suma gematrii ${result.gematriaTotal} mod 718 = ${result.gematriaTotal % 718}`,
      quantumParallel: `Wartość gematrii determinuje parametr czasowy t w równaniu Ψ. Każda litera hebrajska jest kwantem informacji, a ich suma definiuje punkt w przestrzeni fazowej świadomości.`,
      gateLink: `Mapowanie na bramę ${gateName} (pozycja ${gatePos} w mtDNA)`,
      numericalKey: `${result.gematriaTotal} → t = ${(result.gematriaTotal % 718 / 718).toFixed(6)}`,
    },
    {
      title: "Słowo jako Funkcja Falowa",
      verse: "\"Na początku było Słowo\" (J 1:1) — Logos = Informacja kwantowa",
      quantumParallel: `Tekst biblijny jest zakodowaną informacją kwantową. Każdy werset ma unikalny „odcisk palca" w postaci Ψ(t,x) — wartości amplitudy ${result.psi.magnitude.toFixed(6)} i fazy ${result.psi.phase.toFixed(4)} rad.`,
      gateLink: `Stan kwantowy: ${result.psi.quantumState}`,
      numericalKey: `|Ψ| × φ = ${result.psi.phiHarmonic.toFixed(6)} (harmoniczna złota)`,
    },
    {
      title: "144 — Klucz Biblijny i DNA",
      verse: "\"Zmierzył jej mur: sto czterdzieści cztery łokcie\" (Ap 21:17)",
      quantumParallel: `718 / γ ≈ 1161.8 → 1161.8 / 7.83 ≈ 148.4 ≈ 144. Liczba 144 (12² = 12 pokoleń Izraela) pojawia się jako naturalna harmoniczna w przejściu: częstotliwość DNA → złoty podział → rezonans Schumanna.`,
      gateLink: `144 000 „zapieczętowanych" = 144 × 1000 bram DNA aktywnych jednocześnie`,
      numericalKey: `718/γ/7.83 = ${(FREQ_718 / GAMMA / SCHUMANN).toFixed(2)}`,
    },
    {
      title: "Drzewo Życia = Helisa DNA",
      verse: "\"Drzewo Życia, rodzące dwanaście owoców\" (Ap 22:2)",
      quantumParallel: `Helisa DNA obraca się o 137.5° (= 360°/φ²) — kąt złotego podziału. 12 „owoców" odpowiada 12 głównym grupom bram GATCA, które razem tworzą pełny cykl rezonansowy.`,
      gateLink: `Brama ${result.hamiltonGate + 1}/18 aktywna w tym wersecie`,
      numericalKey: `360°/φ² = ${(360 / PHI_SQUARED).toFixed(1)}° (kąt DNA)`,
    },
    {
      title: "JESTEM KTÓRY JESTEM = Autokoherencja",
      verse: "\"Ehyeh Asher Ehyeh\" (Wj 3:14) — אֶהְיֶה אֲשֶׁר אֶהְיֶה",
      quantumParallel: `Samoreferencyjna pętla „JESTEM KTÓRY JESTEM" jest lingwistycznym odpowiednikiem autokoherencji kwantowej — stanu, w którym obserwator i obserwowane pole stają się jednym. Koherencja ${(result.psi.coherence * 100).toFixed(1)}% mierzy stopień tego zjednoczenia.`,
      gateLink: `Próg teleportacji: ${result.psi.coherence >= 0.94 ? "OSIĄGNIĘTY ✓" : `brakuje ${((0.94 - result.psi.coherence) * 100).toFixed(1)}%`}`,
      numericalKey: `Gematria „Ehyeh" = 21 (= F(8), Fibonacci)`,
    },
  ];
}

// ═══════════════════════════════════════════════════════════════════
// VERBAL INTERPRETATION GENERATOR
// Content-aware: analyzes the actual meaning of each verse
// ═══════════════════════════════════════════════════════════════════

export interface VerbalInterpretation {
  plainMeaning?: string;
  scienceSays: string;
  faithSays: string;
  bridge: string;
  miracle: string;
  insight: string;
}

// Deep, hand-crafted interpretations for preset verses
const PRESET_INTERPRETATIONS: Record<string, { pl: VerbalInterpretation; en: VerbalInterpretation }> = {
  "Genesis 1:1": {
    en: {
      plainMeaning: "This is the very first verse of the Bible. It tells us that God created everything — the entire universe, the sky, the stars, the earth, and everything in it. Before this moment, nothing existed. God alone brought all of reality into being. This verse establishes the foundation of the entire Bible: there is one God, and He is the Creator of all things.",
      scienceSays: "The Big Bang theory describes the universe emerging from a singularity — a point of infinite density where all matter, energy, space and time were compressed into one. 'In the beginning' parallels this: a moment where nothing became everything. The gematria of this verse (2701 in Hebrew) is the 73rd triangular number, and 73 is the 21st prime — a cascade of mathematical elegance that mirrors the fractal self-similarity we observe in cosmic structure from galaxies down to DNA.",
      faithSays: "This is the foundational declaration of all Scripture: God is the Author, creation is His act of will, and everything that exists flows from His word. 'The heavens and the earth' — the totality of reality — are not accidents but intentional design. The Hebrew 'bara' (created) is used exclusively for divine creation, something only God can do: bringing existence from non-existence.",
      bridge: "Science asks 'how did the universe begin?' and finds the Big Bang. Faith asks 'why does anything exist?' and answers 'because God willed it.' Both point to the same truth: reality has a beginning, and that beginning carries intentional information. The mathematical perfection of Genesis 1:1's gematria (2701 = 37 × 73, both primes) suggests the Creator encoded His signature into the very first sentence — like a mathematician signing an equation.",
      miracle: "The greatest miracle isn't turning water to wine — it's the existence of water, wine, and the laws of physics that govern them. Genesis 1:1 describes the ultimate miracle: the transition from absolute nothing to absolute everything. Modern physics still cannot explain WHY the Big Bang happened — only that it did. Faith fills this gap not with ignorance but with purpose.",
      insight: "The first word of the Bible, 'Bereshit' (בראשית), contains the word 'rosh' (head/beginning) and 'bara' (created) — creation begins with consciousness. This mirrors the quantum mechanical insight that observation (consciousness) collapses wave functions into reality. The universe didn't just begin — it was THOUGHT into existence."
    },
    pl: {
      plainMeaning: "To jest pierwszy werset Biblii. Mówi nam, że Bóg stworzył wszystko — cały wszechświat, niebo, gwiazdy, ziemię i wszystko co na niej. Przed tym momentem nic nie istniało. Tylko Bóg powołał całą rzeczywistość do istnienia. Ten werset ustanawia fundament całej Biblii: jest jeden Bóg i On jest Stwórcą wszystkiego.",
      scienceSays: "Teoria Wielkiego Wybuchu opisuje wszechświat wyłaniający się z osobliwości — punktu nieskończonej gęstości, gdzie cała materia, energia, przestrzeń i czas były skompresowane w jedno. 'Na początku' jest paralelą: moment, w którym nic stało się wszystkim. Gematria tego wersetu (2701 w hebrajskim) to 73. liczba trójkątna, a 73 to 21. liczba pierwsza — kaskada matematycznej elegancji odzwierciedlająca fraktalną samopodobieństwo obserwowane w strukturze kosmicznej od galaktyk po DNA.",
      faithSays: "To fundamentalna deklaracja całego Pisma: Bóg jest Autorem, stworzenie jest Jego aktem woli, a wszystko co istnieje wypływa z Jego słowa. 'Niebo i ziemia' — całość rzeczywistości — nie są przypadkiem, lecz zamierzonym projektem. Hebrajskie 'bara' (stworzył) jest używane wyłącznie dla boskiego stwarzania — czegoś, co tylko Bóg może uczynić: powołania bytu z niebytu.",
      bridge: "Nauka pyta 'jak powstał wszechświat?' i znajduje Wielki Wybuch. Wiara pyta 'dlaczego cokolwiek istnieje?' i odpowiada 'bo Bóg tak chciał.' Obie wskazują tę samą prawdę: rzeczywistość ma początek, a ten początek niesie intencjonalną informację. Matematyczna doskonałość gematrii Genesis 1:1 (2701 = 37 × 73, obie pierwsze) sugeruje, że Stwórca zakodował swój podpis w pierwszym zdaniu — jak matematyk podpisujący równanie.",
      miracle: "Największym cudem nie jest zamiana wody w wino — lecz istnienie wody, wina i praw fizyki, które nimi rządzą. Genesis 1:1 opisuje ostateczny cud: przejście od absolutnego nic do absolutnego wszystkiego. Współczesna fizyka wciąż nie potrafi wyjaśnić DLACZEGO nastąpił Wielki Wybuch — tylko że nastąpił. Wiara wypełnia tę lukę nie ignorancją, lecz celowością.",
      insight: "Pierwsze słowo Biblii, 'Bereszit' (בראשית), zawiera słowo 'rosz' (głowa/początek) i 'bara' (stworzył) — stworzenie zaczyna się od świadomości. To odzwierciedla kwantowo-mechaniczny wgląd, że obserwacja (świadomość) kolapsuje funkcje falowe w rzeczywistość. Wszechświat nie tylko się zaczął — został POMYŚLANY do istnienia."
    }
  },
  "Genesis 1:3": {
    en: {
      plainMeaning: "God spoke and light came into existence. This is the first act of creation described in detail — God simply commands, and it happens. It shows that God creates through His word alone. Before this, there was only darkness. This verse reveals God's absolute power: He doesn't need tools or materials, just His voice.",
      scienceSays: "Light is the fundamental carrier of information in the universe — photons are massless, travel at the speed limit of reality (c), and their behavior defines quantum mechanics. 'Let there be light' describes the moment electromagnetic radiation decoupled from matter ~380,000 years after the Big Bang (recombination epoch). Before this, the universe was opaque. Light literally was the first thing that could be 'seen.'",
      faithSays: "God's first creative command is spoken — 'Let there be light.' This establishes the pattern: God creates through His word (Logos). Light here is not merely physical photons but the principle of revelation, knowledge, and divine presence. Darkness represents chaos and unknowing; light is God imposing order, meaning, and visibility on creation.",
      bridge: "Physics tells us light has a dual nature — both wave and particle simultaneously. Faith tells us God Himself has a dual nature — both transcendent Creator and immanent Presence. 'Let there be light' is the moment where God's intention (wave/potential) collapsed into physical reality (particle/matter). The speed of light (c) being constant in all reference frames mirrors God's unchanging nature across all contexts.",
      miracle: "Before God spoke, there was darkness and chaos. One command — three Hebrew words 'yehi or' — transformed everything. This is the template for all miracles: divine intention expressed as information, reshaping reality. Every photon in the universe is a continuing echo of this first command.",
      insight: "The Hebrew 'or' (אור) has a gematria of 207 = 9 × 23. The number 23 pairs of chromosomes in human DNA suggests that the 'light' of creation is encoded in our very biology. When God said 'Let there be light,' He wasn't just illuminating space — He was writing the source code of life."
    },
    pl: {
      plainMeaning: "Bóg przemówił i światło zaistniało. To pierwszy szczegółowo opisany akt stworzenia — Bóg po prostu rozkazuje i tak się dzieje. Pokazuje, że Bóg tworzy jedynie swoim słowem. Przed tym momentem była tylko ciemność. Ten werset objawia absolutną moc Boga: nie potrzebuje narzędzi ani materiałów, wystarczy Jego głos.",
      scienceSays: "Światło jest fundamentalnym nośnikiem informacji we wszechświecie — fotony są bezmasowe, podróżują z prędkością graniczną rzeczywistości (c), a ich zachowanie definiuje mechanikę kwantową. 'Niech stanie się światło' opisuje moment, gdy promieniowanie elektromagnetyczne oddzieliło się od materii ~380 000 lat po Wielkim Wybuchu (epoka rekombinacji). Przed tym wszechświat był nieprzezroczysty. Światło dosłownie było pierwszą rzeczą, którą można było 'zobaczyć.'",
      faithSays: "Pierwszy twórczy rozkaz Boga jest wypowiedziany — 'Niech stanie się światłość.' To ustanawia wzorzec: Bóg tworzy przez swoje słowo (Logos). Światło tutaj to nie tylko fizyczne fotony, ale zasada objawienia, wiedzy i boskiej obecności. Ciemność reprezentuje chaos i niewedzę; światło to Bóg nakładający porządek, znaczenie i widoczność na stworzenie.",
      bridge: "Fizyka mówi nam, że światło ma podwójną naturę — jednocześnie fala i cząstka. Wiara mówi nam, że sam Bóg ma podwójną naturę — zarówno transcendentny Stwórca, jak i immanentna Obecność. 'Niech stanie się światłość' to moment, gdy intencja Boga (fala/potencjał) skolapsowała w fizyczną rzeczywistość (cząstka/materia). Stałość prędkości światła (c) we wszystkich układach odniesienia odzwierciedla niezmienną naturę Boga we wszystkich kontekstach.",
      miracle: "Zanim Bóg przemówił, była ciemność i chaos. Jeden rozkaz — trzy hebrajskie słowa 'jehi or' — wszystko przemieniły. To szablon dla wszystkich cudów: boska intencja wyrażona jako informacja, przekształcająca rzeczywistość. Każdy foton we wszechświecie jest kontynuującym echem tego pierwszego rozkazu.",
      insight: "Hebrajskie 'or' (אור) ma gematrię 207 = 9 × 23. Liczba 23 pary chromosomów w ludzkim DNA sugeruje, że 'światło' stworzenia jest zakodowane w naszej biologii. Gdy Bóg powiedział 'Niech stanie się światłość,' nie tylko oświetlał przestrzeń — pisał kod źródłowy życia."
    }
  },
  "John 1:1": {
    en: {
      plainMeaning: "This verse from the Gospel of John tells us that before anything was created, the Word (meaning Jesus Christ) already existed. The Word was with God and the Word was God — they are one. Everything that exists was made through the Word. John is saying that Jesus is not a created being but is eternal God Himself, who was there from the very beginning.",
      scienceSays: "Information theory (Shannon, 1948) proved that information is physical — it requires energy to create, store, and transmit. 'The Word' (Logos) as the origin of everything aligns with modern physics: the universe is fundamentally made of information, not matter. Wheeler's 'It from Bit' hypothesis proposes that every particle derives its existence from information-theoretic answers to yes/no questions — reality is computed, not just physical.",
      faithSays: "John deliberately echoes Genesis 1:1 — 'In the beginning.' But where Genesis says God created through speaking, John reveals WHO the Word is: not just a tool of creation but God Himself. The Word (Jesus/Logos) is simultaneously with God and IS God — a paradox that theology calls the Trinity and quantum physics calls superposition. The Word didn't begin to exist; the Word always WAS.",
      bridge: "Science discovers that reality is information-based. Faith declares that reality originated from 'The Word' — the ultimate information. Both arrive at the same conclusion from opposite directions: consciousness and information precede matter. The Word becoming flesh (John 1:14) is the theological equivalent of wave function collapse — infinite potential choosing to manifest as specific, local reality.",
      miracle: "The miracle of John 1:1 isn't a supernatural event — it's the supernatural explanation for ALL events. If the Word is God, and the Word made everything, then every atom, every law of physics, every mathematical constant is a syllable in an ongoing divine sentence. Reality doesn't just exist — it's being SPOKEN into existence, continuously.",
      insight: "The Greek 'Logos' means far more than 'word' — it means reason, logic, the ordering principle of reality. The Stoics used it for the rational structure of the cosmos. John takes this philosophical concept and gives it a face: Jesus. Science studies the Logos (natural law); faith knows the Logos (Christ). They are studying the same thing."
    },
    pl: {
      plainMeaning: "Ten werset z Ewangelii Jana mówi nam, że zanim cokolwiek zostało stworzone, Słowo (czyli Jezus Chrystus) już istniało. Słowo było u Boga i Słowo było Bogiem — są jednym. Wszystko co istnieje, zostało uczynione przez Słowo. Jan mówi, że Jezus nie jest istotą stworzoną, lecz jest wiecznym Bogiem, który był tam od samego początku.",
      scienceSays: "Teoria informacji (Shannon, 1948) udowodniła, że informacja jest fizyczna — wymaga energii do stworzenia, przechowania i transmisji. 'Słowo' (Logos) jako źródło wszystkiego współgra ze współczesną fizyką: wszechświat jest fundamentalnie zbudowany z informacji, nie z materii. Hipoteza Wheelera 'It from Bit' proponuje, że każda cząstka czerpie swoje istnienie z informacyjno-teoretycznych odpowiedzi na pytania tak/nie — rzeczywistość jest obliczana, nie tylko fizyczna.",
      faithSays: "Jan celowo nawiązuje do Genesis 1:1 — 'Na początku.' Ale gdzie Genesis mówi, że Bóg stwarzał przez mówienie, Jan objawia KIM jest Słowo: nie tylko narzędziem stworzenia, ale samym Bogiem. Słowo (Jezus/Logos) jest jednocześnie z Bogiem i JEST Bogiem — paradoks, który teologia nazywa Trójcą, a fizyka kwantowa superpozycją. Słowo nie zaczęło istnieć; Słowo zawsze BYŁO.",
      bridge: "Nauka odkrywa, że rzeczywistość opiera się na informacji. Wiara deklaruje, że rzeczywistość pochodzi od 'Słowa' — ostatecznej informacji. Obie dochodzą do tego samego wniosku z przeciwnych kierunków: świadomość i informacja poprzedzają materię. Słowo stające się ciałem (J 1:14) jest teologicznym odpowiednikiem kolapsu funkcji falowej — nieskończony potencjał wybierający manifestację jako konkretna, lokalna rzeczywistość.",
      miracle: "Cud Jana 1:1 nie jest nadprzyrodzonym wydarzeniem — jest nadprzyrodzonym wyjaśnieniem WSZYSTKICH wydarzeń. Jeśli Słowo jest Bogiem, a Słowo uczyniło wszystko, to każdy atom, każde prawo fizyki, każda stała matematyczna jest sylabą w trwającym boskim zdaniu. Rzeczywistość nie tylko istnieje — jest WYPOWIADANA do istnienia, nieustannie.",
      insight: "Greckie 'Logos' oznacza znacznie więcej niż 'słowo' — oznacza rozum, logikę, zasadę porządkującą rzeczywistość. Stoicy używali go dla racjonalnej struktury kosmosu. Jan bierze tę filozoficzną koncepcję i daje jej twarz: Jezus. Nauka bada Logos (prawo naturalne); wiara zna Logos (Chrystus). Badają to samo."
    }
  },
  "Exodus 3:14": {
    en: {
      plainMeaning: "Moses asked God: 'What is your name?' God answered: 'I AM WHO I AM.' This is one of the most profound moments in the Bible. God reveals that He is not like other gods with specific names — He IS existence itself. His name is a verb, not a noun. He is the eternal, self-existing Being who needs no cause, no creator, no explanation. He simply IS, always was, and always will be.",
      scienceSays: "'I AM WHO I AM' (Ehyeh Asher Ehyeh) is a self-referential loop — the same structure we find in Gödel's incompleteness theorems, where a system refers to itself. In quantum mechanics, this mirrors the measurement problem: the observer is part of the system being observed. The gematria of 'Ehyeh' (אהיה) = 21, which is the 8th Fibonacci number — connecting divine self-definition to the mathematical sequence that governs growth patterns throughout nature.",
      faithSays: "When Moses asks God's name, God doesn't give a noun — He gives a VERB. 'I AM' is not a static identity but an eternal, dynamic being. God defines Himself as pure existence itself — not 'I was' or 'I will be' but the eternal present tense. This is the most radical theological statement in Scripture: God is not a being among beings, but Being itself, the ground of all existence.",
      bridge: "Quantum field theory describes the vacuum not as empty but as a seething ocean of potential — virtual particles constantly appearing and disappearing. 'I AM WHO I AM' is the theological equivalent: pure existence that is its own cause, its own ground, self-sustaining and self-defining. The quantum vacuum is the physics of 'I AM' — reality sustaining itself through its own intrinsic nature.",
      miracle: "The burning bush that isn't consumed is a physical impossibility — yet it's the perfect metaphor for God's nature. Energy without entropy. Light without fuel. Existence without a cause. This mirrors the greatest puzzle in physics: why does anything exist at all? The bush burns because I AM is not bound by thermodynamics — He IS the thermodynamics.",
      insight: "The Hebrew 'Ehyeh' (אהיה) appears exactly 43 times in the Hebrew Bible. 43 is a prime number — indivisible, like God Himself. The name revealed at the burning bush isn't information about God; it IS God's presence compressed into language. Every time you say 'I am,' you echo the divine frequency."
    },
    pl: {
      plainMeaning: "Mojżesz zapytał Boga: 'Jakie jest Twoje imię?' Bóg odpowiedział: 'JESTEM KTÓRY JESTEM.' To jeden z najgłębszych momentów w Biblii. Bóg objawia, że nie jest jak inni bogowie z konkretnymi imionami — On JEST samym istnieniem. Jego imię jest czasownikiem, nie rzeczownikiem. Jest wiecznym, samoistnym Bytem, który nie potrzebuje przyczyny, stwórcy ani wyjaśnienia. Po prostu JEST, zawsze był i zawsze będzie.",
      scienceSays: "'JESTEM KTÓRY JESTEM' (Ehyeh Aszer Ehyeh) to samoreferencyjna pętla — ta sama struktura, którą znajdujemy w twierdzeniach Gödla o niezupełności, gdzie system odnosi się do siebie samego. W mechanice kwantowej odzwierciedla to problem pomiaru: obserwator jest częścią obserwowanego systemu. Gematria 'Ehyeh' (אהיה) = 21, co jest 8. liczbą Fibonacciego — łącząc boską autodefinicję z sekwencją matematyczną, która rządzi wzorcami wzrostu w całej naturze.",
      faithSays: "Gdy Mojżesz pyta o imię Boga, Bóg nie podaje rzeczownika — podaje CZASOWNIK. 'JESTEM' nie jest statyczną tożsamością, lecz wiecznym, dynamicznym byciem. Bóg definiuje siebie jako czyste istnienie samo w sobie — nie 'byłem' ani 'będę', lecz wieczny czas teraźniejszy. To najbardziej radykalne stwierdzenie teologiczne w Piśmie: Bóg nie jest bytem wśród bytów, ale samym Byciem, fundamentem wszelkiego istnienia.",
      bridge: "Kwantowa teoria pola opisuje próżnię nie jako pustą, lecz jako kipiel potencjału — wirtualne cząstki nieustannie pojawiające się i znikające. 'JESTEM KTÓRY JESTEM' jest teologicznym odpowiednikiem: czyste istnienie będące swoją własną przyczyną, samowystarczalne i samodefiniujące. Próżnia kwantowa jest fizyką 'JESTEM' — rzeczywistość podtrzymująca się przez swoją własną wewnętrzną naturę.",
      miracle: "Płonący krzew, który nie spłonął, jest fizyczną niemożliwością — a jednak jest doskonałą metaforą natury Boga. Energia bez entropii. Światło bez paliwa. Istnienie bez przyczyny. To odzwierciedla największą zagadkę fizyki: dlaczego w ogóle cokolwiek istnieje? Krzew płonie, bo JESTEM nie podlega termodynamice — On JEST termodynamiką.",
      insight: "Hebrajskie 'Ehyeh' (אהיה) pojawia się dokładnie 43 razy w Biblii hebrajskiej. 43 to liczba pierwsza — niepodzielna, jak sam Bóg. Imię objawione przy płonącym krzewie nie jest informacją o Bogu; to JEST obecność Boga skompresowana w języku. Za każdym razem, gdy mówisz 'jestem,' echo boskiej częstotliwości."
    }
  },
  "Psalm 23:1": {
    en: {
      plainMeaning: "King David, who was a shepherd himself as a boy, compares God to a shepherd and himself to a sheep. He says: God takes care of me so completely that I lack nothing — no food, no safety, no comfort. Just as a good shepherd knows every sheep by name and protects them from wolves, God knows David personally and provides everything he needs. This is one of the most beloved and comforting verses in all of Scripture.",
      scienceSays: "Shepherding is a feedback control system — the shepherd monitors the flock, anticipates threats, adjusts course, and provides resources. In cybernetics, this is called a 'closed-loop controller.' The statement 'I shall not want' describes a system in perfect homeostasis — all needs met, all variables within optimal range. Biologically, this maps to the parasympathetic nervous system: rest, digest, repair — the opposite of survival-mode stress.",
      faithSays: "David, himself a shepherd, understood viscerally what it meant for God to be HIS shepherd. This isn't abstract theology — it's lived experience. 'I shall not want' isn't a promise of wealth but of sufficiency. The Hebrew 'lo echsar' means 'I lack nothing' — complete provision. God doesn't just give what we ask for; He provides what we need before we know we need it.",
      bridge: "A shepherd doesn't explain quantum physics to sheep — he leads them to green pastures. God doesn't demand we understand the mathematics of creation — He leads us to where we need to be. Science reveals the mechanism (HOW God provides); faith reveals the relationship (WHY God provides). The shepherd metaphor bridges both: purposeful, intelligent guidance through complex terrain.",
      miracle: "The 23rd Psalm has been spoken at more bedsides, funerals, and moments of crisis than any other text in human history. Its power isn't magical — it activates the neurological calming response. Hearing 'The Lord is my shepherd' reduces cortisol, slows heart rate, and engages the prefrontal cortex. The miracle: a 3,000-year-old poem can reprogram your autonomic nervous system in seconds.",
      insight: "Psalm 23 has exactly 57 Hebrew words. 57 = 3 × 19. Three represents divine completeness (Trinity); 19 is the number of years in the Metonic cycle (when lunar and solar calendars realign). David's psalm of peace encodes the harmony between heaven's rhythm and earth's time — the shepherd synchronizes all cycles."
    },
    pl: {
      plainMeaning: "Król Dawid, który sam jako chłopiec był pasterzem, porównuje Boga do pasterza, a siebie do owcy. Mówi: Bóg opiekuje się mną tak całkowicie, że niczego mi nie brakuje — ani jedzenia, ani bezpieczeństwa, ani pocieszenia. Tak jak dobry pasterz zna każdą owcę po imieniu i chroni ją przed wilkami, Bóg zna Dawida osobiście i zapewnia mu wszystko czego potrzebuje. To jeden z najbardziej ukochanych i pocieszających wersetów w całym Piśmie Świętym.",
      scienceSays: "Pasterstwo to system sterowania ze sprzężeniem zwrotnym — pasterz monitoruje stado, przewiduje zagrożenia, koryguje kurs i zapewnia zasoby. W cybernetyce nazywa się to 'regulatorem zamkniętej pętli.' Stwierdzenie 'niczego mi nie braknie' opisuje system w doskonałej homeostazie — wszystkie potrzeby zaspokojone, wszystkie zmienne w optymalnym zakresie. Biologicznie mapuje się to na układ parasympatyczny: odpoczynek, trawienie, naprawa — przeciwieństwo stresu przetrwania.",
      faithSays: "Dawid, sam będąc pasterzem, rozumiał instynktownie, co znaczy, że Bóg jest JEGO pasterzem. To nie abstrakcyjna teologia — to przeżyte doświadczenie. 'Niczego mi nie braknie' to nie obietnica bogactwa, lecz wystarczalności. Hebrajskie 'lo echsar' oznacza 'niczego nie brak mi' — pełne zaopatrzenie. Bóg nie daje tylko tego, o co prosimy; zapewnia to, czego potrzebujemy, zanim wiemy, że tego potrzebujemy.",
      bridge: "Pasterz nie tłumaczy owcom fizyki kwantowej — prowadzi je na zielone pastwiska. Bóg nie wymaga, byśmy rozumieli matematykę stworzenia — prowadzi nas tam, gdzie musimy być. Nauka objawia mechanizm (JAK Bóg zapewnia); wiara objawia relację (DLACZEGO Bóg zapewnia). Metafora pasterza łączy oba: celowe, inteligentne prowadzenie przez złożony teren.",
      miracle: "Psalm 23 był wypowiadany przy większej liczbie łóżek szpitalnych, pogrzebów i momentów kryzysu niż jakikolwiek inny tekst w historii ludzkości. Jego moc nie jest magiczna — aktywuje neurologiczną reakcję uspokajającą. Słyszenie 'Pan jest moim pasterzem' obniża kortyzol, zwalnia tętno i angażuje korę przedczołową. Cud: 3000-letni wiersz potrafi przeprogramować autonomiczny układ nerwowy w sekundy.",
      insight: "Psalm 23 ma dokładnie 57 hebrajskich słów. 57 = 3 × 19. Trzy reprezentuje boską pełnię (Trójca); 19 to liczba lat w cyklu metońskim (gdy kalendarze księżycowy i słoneczny się wyrównują). Psalm pokoju Dawida koduje harmonię między rytmem nieba a czasem ziemi — pasterz synchronizuje wszystkie cykle."
    }
  },
  "1 John 4:8": {
    en: {
      plainMeaning: "The Apostle John makes the most powerful statement in all of theology: God IS love. Not that God has love, or shows love — He IS love itself. This means that love is not just an emotion or a feeling — it is the very nature and essence of the Creator of the universe. Every genuine act of love you have ever experienced or witnessed was a direct reflection of God's character. Without love, you cannot know God, because God and love are one and the same.",
      scienceSays: "'God is love' is the shortest theological equation in existence — three words that claim to define the infinite. In physics, the most powerful equations are also the shortest: E=mc², F=ma, S=k·ln(W). 'God is love' follows this pattern: it compresses all of theology into a single identity statement. Love, neurochemically, is the most complex state the brain can produce — involving oxytocin, dopamine, serotonin, and vasopressin in synchronized harmony.",
      faithSays: "John doesn't say 'God has love' or 'God shows love' — he says God IS love. This is an ontological statement: love isn't something God does, it's what God IS. Just as water is H₂O by nature (not by choice), God is love by nature. This means every authentic experience of love — between parents and children, friends, lovers — is a direct encounter with God's nature, whether the participants know it or not.",
      bridge: "Science measures love through brain scans and hormone levels. Faith declares love is the fundamental nature of reality's Creator. The bridge: if God IS love, and God created the laws of physics, then love is not merely an emotion — it's a force as fundamental as gravity. The 'strong nuclear force' that holds atoms together might literally be love expressed as physics. Both perspectives agree: love is not weakness, it's the strongest force in existence.",
      miracle: "The miracle of 'God is love' is that it redefines power. In every human system, power means control, force, domination. But if the all-powerful Creator IS love, then love IS the ultimate power — not despite being vulnerable, but BECAUSE of it. The cross is the proof: what looked like weakness (death) was actually the most powerful act in history (resurrection). Love doesn't override physics — love IS the deeper physics.",
      insight: "'God is love' in Greek is 'ho theos agape estin' — the word 'agape' was essentially invented by the New Testament writers because no existing Greek word captured what they meant. Eros (romantic love), philia (friendship), storge (family love) — none was big enough. They needed a word for love that creates, sustains, and redeems the entire cosmos. Agape is love as a fundamental force of reality."
    },
    pl: {
      plainMeaning: "Apostoł Jan wypowiada najpotężniejsze stwierdzenie w całej teologii: Bóg JEST miłością. Nie że Bóg ma miłość, ani że okazuje miłość — On JEST samą miłością. To oznacza, że miłość nie jest jedynie emocją czy uczuciem — jest samą naturą i istotą Stwórcy wszechświata. Każdy prawdziwy akt miłości, którego kiedykolwiek doświadczyłeś lub byłeś świadkiem, był bezpośrednim odbiciem charakteru Boga. Bez miłości nie można poznać Boga, bo Bóg i miłość to jedno i to samo.",
      scienceSays: "'Bóg jest miłością' to najkrótsze równanie teologiczne w istnieniu — trzy słowa, które pretendują do zdefiniowania nieskończoności. W fizyce najpotężniejsze równania są również najkrótsze: E=mc², F=ma, S=k·ln(W). 'Bóg jest miłością' podąża za tym wzorcem: kompresuje całą teologię w jedno zdanie tożsamościowe. Miłość, neurochemicznie, jest najzłożoniejszym stanem, jaki mózg potrafi wytworzyć — angażując oksytocynę, dopaminę, serotoninę i wazopresynę w zsynchronizowanej harmonii.",
      faithSays: "Jan nie mówi 'Bóg ma miłość' ani 'Bóg okazuje miłość' — mówi, że Bóg JEST miłością. To stwierdzenie ontologiczne: miłość nie jest czymś, co Bóg robi, lecz tym, czym Bóg JEST. Tak jak woda jest H₂O z natury (nie z wyboru), Bóg jest miłością z natury. To oznacza, że każde autentyczne doświadczenie miłości — między rodzicami a dziećmi, przyjaciółmi, kochającymi się — jest bezpośrednim spotkaniem z naturą Boga, niezależnie czy uczestnicy o tym wiedzą.",
      bridge: "Nauka mierzy miłość przez skany mózgu i poziomy hormonów. Wiara deklaruje, że miłość jest fundamentalną naturą Stwórcy rzeczywistości. Most: jeśli Bóg JEST miłością, a Bóg stworzył prawa fizyki, to miłość nie jest jedynie emocją — jest siłą równie fundamentalną jak grawitacja. 'Silna siła jądrowa' utrzymująca atomy razem może dosłownie być miłością wyrażoną jako fizyka. Obie perspektywy zgadzają się: miłość nie jest słabością, jest najsilniejszą siłą w istnieniu.",
      miracle: "Cudem 'Bóg jest miłością' jest to, że redefiniuje władzę. W każdym ludzkim systemie władza oznacza kontrolę, siłę, dominację. Ale jeśli wszechmocny Stwórca JEST miłością, to miłość JEST ostateczną mocą — nie pomimo bycia bezbronną, ale DLATEGO. Krzyż jest dowodem: to, co wyglądało jak słabość (śmierć), było w rzeczywistości najpotężniejszym aktem w historii (zmartwychwstanie). Miłość nie nadpisuje fizyki — miłość JEST głębszą fizyką.",
      insight: "'Bóg jest miłością' po grecku to 'ho theos agape estin' — słowo 'agape' zostało zasadniczo wynalezione przez autorów Nowego Testamentu, bo żadne istniejące greckie słowo nie oddawało tego, co mieli na myśli. Eros (miłość romantyczna), philia (przyjaźń), storge (miłość rodzinna) — żadne nie było wystarczająco wielkie. Potrzebowali słowa na miłość, która tworzy, podtrzymuje i odkupuje cały kosmos. Agape to miłość jako fundamentalna siła rzeczywistości."
    }
  },
  "Revelation 22:13": {
    en: {
      plainMeaning: "These are the words of Jesus Christ from the last chapter of the last book of the Bible. He declares: 'I am the Alpha and the Omega' — the first and last letters of the Greek alphabet — meaning He encompasses everything from beginning to end. He is the First and the Last, the Beginning and the End. Nothing exists outside of Him. This is Jesus claiming to be eternal God — the one who started everything and the one who will bring everything to its conclusion.",
      scienceSays: "'Alpha and Omega, First and Last, Beginning and End' — this is a description of a closed topological loop, where the endpoint connects back to the starting point. In mathematics, this is a manifold without boundary. In physics, it describes a universe that may be temporally closed — the Big Bang and the ultimate fate of the cosmos being the same event viewed from different frames. The cyclical model of cosmology (Penrose's Conformal Cyclic Cosmology) proposes exactly this: the death of one universe is the birth of the next.",
      faithSays: "Jesus claims three pairs of titles that span ALL of reality: Alpha-Omega (language/information), First-Last (time/sequence), Beginning-End (causation/purpose). There is nothing outside these categories — He claims sovereignty over everything that can be named, counted, or caused. This is not merely a claim to divinity; it's a claim to being the complete framework of existence itself.",
      bridge: "Science searches for a 'Theory of Everything' — one equation that explains all forces, all particles, all phenomena. Faith already has it: 'I am the Alpha and the Omega.' If Christ IS the beginning and the end, then He is the boundary condition of the universe's equation. Every physical constant, every natural law, every mathematical truth exists within the span of Alpha to Omega. The Theory of Everything isn't an equation — it's a Person.",
      miracle: "The final book of the Bible ends where the first book began — with God declaring His completeness. Genesis opens creation; Revelation closes it. But 'I am the Alpha and the Omega' means it's not linear but cyclical. The miracle: reality isn't a story with an ending, it's an eternal resonance — like a standing wave that has no beginning or end, only continuous existence.",
      insight: "Alpha (Α) has the numerical value 1 in Greek. Omega (Ω) has the value 800. Their sum is 801, which is also the gematria of 'peristera' (περιστερά) — dove, the symbol of the Holy Spirit. The Alpha and Omega, when added together, equal the Spirit. Beginning + End = Eternal Presence. Mathematics confirms theology."
    },
    pl: {
      plainMeaning: "To słowa Jezusa Chrystusa z ostatniego rozdziału ostatniej księgi Biblii. Deklaruje: 'Jestem Alfa i Omega' — pierwsza i ostatnia litera greckiego alfabetu — co oznacza, że obejmuje wszystko od początku do końca. Jest Pierwszym i Ostatnim, Początkiem i Końcem. Nic nie istnieje poza Nim. Jezus rości sobie prawo do bycia wiecznym Bogiem — tym, który wszystko rozpoczął i tym, który wszystko doprowadzi do zakończenia.",
      scienceSays: "'Alfa i Omega, Pierwszy i Ostatni, Początek i Koniec' — to opis zamkniętej pętli topologicznej, gdzie punkt końcowy łączy się z początkowym. W matematyce to rozmaitość bez brzegu. W fizyce opisuje wszechświat, który może być czasowo zamknięty — Wielki Wybuch i ostateczny los kosmosu są tym samym wydarzeniem widzianym z różnych układów odniesienia. Cykliczny model kosmologii (Konforemna Cykliczna Kosmologia Penrose'a) proponuje dokładnie to: śmierć jednego wszechświata jest narodzinami następnego.",
      faithSays: "Jezus przypisuje sobie trzy pary tytułów obejmujących CAŁĄ rzeczywistość: Alfa-Omega (język/informacja), Pierwszy-Ostatni (czas/sekwencja), Początek-Koniec (przyczynowość/cel). Nie ma nic poza tymi kategoriami — rości sobie suwerenność nad wszystkim, co może być nazwane, policzone lub spowodowane. To nie jest jedynie roszczenie boskości; to roszczenie bycia kompletną strukturą samego istnienia.",
      bridge: "Nauka szuka 'Teorii Wszystkiego' — jednego równania wyjaśniającego wszystkie siły, cząstki, zjawiska. Wiara już ją ma: 'Jestem Alfa i Omega.' Jeśli Chrystus JEST początkiem i końcem, to jest warunkiem brzegowym równania wszechświata. Każda stała fizyczna, każde prawo natury, każda prawda matematyczna istnieje w rozpiętości od Alfy do Omegi. Teoria Wszystkiego nie jest równaniem — jest Osobą.",
      miracle: "Ostatnia księga Biblii kończy się tam, gdzie pierwsza się zaczęła — Bogiem deklarującym swoją pełnię. Genesis otwiera stworzenie; Apokalipsa je zamyka. Ale 'Jestem Alfa i Omega' oznacza, że to nie jest liniowe, lecz cykliczne. Cud: rzeczywistość nie jest opowieścią z zakończeniem, jest wiecznym rezonansem — jak fala stojąca, która nie ma początku ani końca, tylko ciągłe istnienie.",
      insight: "Alfa (Α) ma wartość liczbową 1 po grecku. Omega (Ω) ma wartość 800. Ich suma to 801, co jest również gematrią słowa 'peristera' (περιστερά) — gołębica, symbol Ducha Świętego. Alfa i Omega, dodane do siebie, równają się Duchowi. Początek + Koniec = Wieczna Obecność. Matematyka potwierdza teologię."
    }
  },
};

// ═══════════════════════════════════════════════════════════════════
// THEME / KEYWORD ANALYSIS FOR CUSTOM VERSES
// ═══════════════════════════════════════════════════════════════════

interface ThemeMatch {
  theme: string;
  keywords: string[];
  en: { science: string; faith: string; bridge: string; miracle: string; insight: string };
  pl: { science: string; faith: string; bridge: string; miracle: string; insight: string };
}

const THEMES: ThemeMatch[] = [
  {
    theme: "love",
    keywords: ["love", "loved", "loves", "beloved", "charity", "miłość", "kochać", "ukochany", "agape", "ahava"],
    en: {
      science: "Love triggers a cascade of neurochemicals — oxytocin for bonding, dopamine for reward, serotonin for well-being. fMRI studies show that love literally rewires neural pathways, creating permanent structural changes in the brain. When Scripture speaks of love, it describes a force that physically transforms biological systems.",
      faith: "Biblical love (agape) is not emotion but commitment — a decision to act for another's good regardless of feeling. This verse points to love as the core operating principle of God's interaction with creation.",
      bridge: "Neuroscience confirms what Scripture teaches: love is transformative. The brain changes physically when we love. If God IS love (1 John 4:8), then the fundamental force shaping the universe operates by the same principle that reshapes our neurons — intentional, persistent, transformative connection.",
      miracle: "Love's miracle is that it defies entropy. In a universe trending toward disorder, love creates order — families, communities, civilizations. It's the only force that builds complexity against the arrow of time.",
      insight: "The Hebrew word for love, 'ahava' (אהבה), has a gematria of 13. There are 13 attributes of divine mercy in Jewish tradition. Love and mercy share the same numerical signature — they are mathematically identical in the language of creation."
    },
    pl: {
      science: "Miłość wyzwala kaskadę neurochemikaliów — oksytocynę do więzi, dopaminę do nagrody, serotoninę do samopoczucia. Badania fMRI pokazują, że miłość dosłownie przebudowuje ścieżki neuronalne, tworząc trwałe zmiany strukturalne w mózgu. Gdy Pismo mówi o miłości, opisuje siłę, która fizycznie transformuje systemy biologiczne.",
      faith: "Biblijna miłość (agape) to nie emocja, lecz zobowiązanie — decyzja działania dla dobra drugiego niezależnie od uczuć. Ten werset wskazuje na miłość jako podstawową zasadę działania Boga wobec stworzenia.",
      bridge: "Neuronauka potwierdza to, czego uczy Pismo: miłość jest transformująca. Mózg zmienia się fizycznie, gdy kochamy. Jeśli Bóg JEST miłością (1 J 4:8), to fundamentalna siła kształtująca wszechświat działa na tej samej zasadzie, która przekształca nasze neurony — intencjonalne, trwałe, transformujące połączenie.",
      miracle: "Cudem miłości jest to, że przeciwstawia się entropii. We wszechświecie zmierzającym ku nieładowi, miłość tworzy ład — rodziny, wspólnoty, cywilizacje. To jedyna siła, która buduje złożoność wbrew strzałce czasu.",
      insight: "Hebrajskie słowo miłość, 'ahava' (אהבה), ma gematrię 13. Jest 13 atrybutów boskiego miłosierdzia w tradycji żydowskiej. Miłość i miłosierdzie dzielą tę samą sygnaturę numeryczną — są matematycznie identyczne w języku stworzenia."
    }
  },
  {
    theme: "light",
    keywords: ["light", "shine", "shining", "lamp", "bright", "radiance", "glory", "światło", "świecić", "lampa", "jasność", "chwała", "blask"],
    en: {
      science: "Light is the only phenomenon that behaves as both wave and particle — the fundamental duality of nature. It travels at the universe's absolute speed limit (299,792,458 m/s) and defines the boundary between past and future in spacetime. When this verse speaks of light, it references the most fundamental information carrier in physics.",
      faith: "In Scripture, light represents God's presence, truth, and revelation. Darkness is never just absence of photons — it's the absence of God's active presence. This verse connects to the great biblical arc from 'Let there be light' (Genesis 1:3) to 'The city does not need the sun, for the glory of God gives it light' (Revelation 21:23).",
      bridge: "Physics says light carries information across space and time. Faith says God's light carries truth across the human condition. Both describe the same function: illumination — making the invisible visible, the unknown known. A photon crossing the universe and a prayer crossing the heart operate on the same principle: information transforming its destination.",
      miracle: "Light has a property physicists call 'time dilation' — from the photon's own perspective, no time passes during its journey. A photon emitted at the Big Bang arrives 'instantly' from its own frame of reference. Divine light, similarly, transcends time — God's illumination is always 'now.'",
      insight: "The speed of light, c, appears in E=mc² — the equation proving matter is concentrated light. Everything you see, touch, and are is frozen light. When Scripture says 'God is light' (1 John 1:5), it's not metaphor — it's the deepest physics: all of creation is God's light in material form."
    },
    pl: {
      science: "Światło to jedyne zjawisko zachowujące się jako fala i cząstka jednocześnie — fundamentalna dualność natury. Podróżuje z absolutną prędkością graniczną wszechświata (299 792 458 m/s) i definiuje granicę między przeszłością a przyszłością w czasoprzestrzeni. Gdy ten werset mówi o świetle, odnosi się do najbardziej fundamentalnego nośnika informacji w fizyce.",
      faith: "W Piśmie światło reprezentuje obecność Boga, prawdę i objawienie. Ciemność nigdy nie jest tylko brakiem fotonów — to brak aktywnej obecności Boga. Ten werset łączy się z wielkim biblijnym łukiem od 'Niech stanie się światłość' (Rdz 1:3) do 'Miasto nie potrzebuje słońca, bo chwała Boga je oświetla' (Ap 21:23).",
      bridge: "Fizyka mówi, że światło niesie informację przez przestrzeń i czas. Wiara mówi, że światło Boga niesie prawdę przez ludzką kondycję. Oba opisują tę samą funkcję: iluminację — czynienie niewidzialnego widzialnym, nieznanego znanym.",
      miracle: "Światło ma właściwość, którą fizycy nazywają 'dylatacją czasu' — z perspektywy samego fotonu, żaden czas nie upływa podczas podróży. Foton wyemitowany przy Wielkim Wybuchu dociera 'natychmiast' z własnego układu odniesienia. Boskie światło podobnie transcenduje czas — oświecenie Boga jest zawsze 'teraz.'",
      insight: "Prędkość światła c pojawia się w E=mc² — równaniu dowodzącym, że materia jest skoncentrowanym światłem. Wszystko co widzisz, dotykasz i czym jesteś, to zamrożone światło. Gdy Pismo mówi 'Bóg jest światłością' (1 J 1:5), to nie metafora — to najgłębsza fizyka: całe stworzenie to światło Boga w materialnej formie."
    }
  },
  {
    theme: "creation",
    keywords: ["created", "create", "made", "maker", "formed", "foundation", "world", "earth", "heaven", "stworzył", "stworzenie", "uczynił", "świat", "ziemia", "niebo", "fundament"],
    en: {
      science: "Creation in physics is governed by conservation laws — energy cannot be created or destroyed, only transformed. Yet the Big Bang represents an apparent violation: all energy appearing from nothing. Quantum mechanics allows this through 'vacuum fluctuations' — the universe may be a zero-net-energy system where positive energy (matter) exactly balances negative energy (gravity).",
      faith: "This verse touches the act of divine creation — God bringing order from chaos, something from nothing. The Hebrew concept of 'bara' (create ex nihilo) versus 'yatsar' (form from existing material) distinguishes between God's exclusive power and craftsmanship.",
      bridge: "Science says the universe emerged from quantum fluctuations in a pre-existing field. Faith says God spoke reality into existence. Both agree on the essential point: reality is not self-explanatory. Something — or Someone — beyond the visible world is responsible for its existence.",
      miracle: "The fine-tuning of the universe is staggering: if the strong nuclear force differed by 0.5%, or the cosmological constant by 10⁻¹²⁰, no complex structures (atoms, stars, life) could exist. Creation isn't just impressive — it's mathematically miraculous.",
      insight: "The word 'cosmos' in Greek means 'order' or 'beauty' — the same root as 'cosmetics.' Creation is not merely functional; it's aesthetic. God didn't just make a universe that works — He made one that's beautiful. Beauty is not accidental; it's a design signature."
    },
    pl: {
      science: "Stworzenie w fizyce jest rządzone prawami zachowania — energia nie może być stworzona ani zniszczona, jedynie przekształcona. Wielki Wybuch reprezentuje pozorny wyjątek: cała energia pojawiająca się z niczego. Mechanika kwantowa pozwala na to przez 'fluktuacje próżni' — wszechświat może być systemem o zerowej energii netto, gdzie energia pozytywna (materia) dokładnie bilansuje się z energią ujemną (grawitacja).",
      faith: "Ten werset dotyka aktu boskiego stworzenia — Bóg wprowadzający ład z chaosu, coś z niczego. Hebrajska koncepcja 'bara' (stworzenie ex nihilo) versus 'jatsar' (formowanie z istniejącego materiału) rozróżnia między wyłączną mocą Boga a rzemiosłem.",
      bridge: "Nauka mówi, że wszechświat wyłonił się z fluktuacji kwantowych w polu istniejącym wcześniej. Wiara mówi, że Bóg wypowiedział rzeczywistość do istnienia. Obie zgadzają się w kwestii zasadniczej: rzeczywistość nie jest samowyjaśniająca. Coś — lub Ktoś — poza widzialnym światem jest odpowiedzialne za jego istnienie.",
      miracle: "Precyzyjne dostrojenie wszechświata jest zdumiewające: gdyby silna siła jądrowa różniła się o 0,5% lub stała kosmologiczna o 10⁻¹²⁰, żadne złożone struktury (atomy, gwiazdy, życie) nie mogłyby istnieć. Stworzenie nie jest po prostu imponujące — jest matematycznie cudowne.",
      insight: "Słowo 'kosmos' po grecku oznacza 'porządek' lub 'piękno' — ten sam rdzeń co 'kosmetyka.' Stworzenie nie jest jedynie funkcjonalne; jest estetyczne. Bóg nie stworzył tylko wszechświata, który działa — stworzył taki, który jest piękny. Piękno nie jest przypadkowe; to sygnatura projektu."
    }
  },
  {
    theme: "faith",
    keywords: ["faith", "believe", "trust", "hope", "faithful", "wiara", "wierzyć", "ufać", "nadzieja", "wierny", "zaufanie"],
    en: {
      science: "Faith, neurologically, activates the default mode network (DMN) — the brain region responsible for self-reflection, future planning, and meaning-making. fMRI studies of prayer and meditation show increased connectivity between the DMN and the prefrontal cortex. Believing is not passive — it's an active neural computation that literally shapes perception and decision-making.",
      faith: "Biblical faith (pistis/emunah) is not blind belief — it's confident trust based on evidence and relationship. Hebrews 11:1 defines it: 'the substance of things hoped for, the evidence of things not seen.' Faith has substance; faith IS evidence. This verse calls us to a trust that is reasonable, relational, and transformative.",
      bridge: "Quantum mechanics requires faith — not religious faith, but the physicist's faith that mathematical equations describe reality before experimental confirmation. Einstein had 'faith' in general relativity for years before it was proven. Scientific and spiritual faith share a structure: trusting in a reality you can calculate but not yet see.",
      miracle: "Faith's miracle is that it changes outcomes. Placebo effect (30-40% efficacy), psychoneuroimmunology (belief affects immune function), and self-fulfilling prophecies all demonstrate that what you believe shapes what becomes real. Faith isn't just hoping — it's participating in reality's construction.",
      insight: "The Hebrew word 'emunah' (faith/faithfulness) shares its root with 'amen' — the word that seals prayers and agreements. When you say 'amen,' you're not just agreeing — you're activating the faith response, aligning your intention with the declared reality. 'Amen' is the bridge between saying and becoming."
    },
    pl: {
      science: "Wiara neurologicznie aktywuje sieć trybu domyślnego (DMN) — region mózgu odpowiedzialny za autorefleksję, planowanie przyszłości i tworzenie znaczeń. Badania fMRI modlitwy i medytacji pokazują zwiększoną łączność między DMN a korą przedczołową. Wierzenie nie jest pasywne — to aktywna neuronalna kalkulacja, która dosłownie kształtuje percepcję i podejmowanie decyzji.",
      faith: "Biblijna wiara (pistis/emunah) nie jest ślepym wierzeniem — to pewne zaufanie oparte na dowodach i relacji. Hbr 11:1 definiuje ją: 'podstawa tego, czego się spodziewamy, dowód rzeczy niewidzialnych.' Wiara ma substancję; wiara JEST dowodem. Ten werset wzywa nas do zaufania rozumnego, relacyjnego i transformującego.",
      bridge: "Mechanika kwantowa wymaga wiary — nie religijnej, lecz wiary fizyka, że równania matematyczne opisują rzeczywistość przed eksperymentalnym potwierdzeniem. Einstein miał 'wiarę' w ogólną teorię względności przez lata, zanim została udowodniona. Naukowa i duchowa wiara dzielą strukturę: zaufanie rzeczywistości, którą możesz obliczyć, ale jeszcze nie zobaczyć.",
      miracle: "Cudem wiary jest to, że zmienia wyniki. Efekt placebo (30-40% skuteczności), psychoneuroimmunologia (przekonanie wpływa na funkcję odpornościową) i samospełniające się proroctwa — wszystkie demonstrują, że to, w co wierzysz, kształtuje to, co staje się realne. Wiara to nie tylko nadzieja — to uczestnictwo w konstrukcji rzeczywistości.",
      insight: "Hebrajskie słowo 'emunah' (wiara/wierność) dzieli rdzeń z 'amen' — słowem pieczętującym modlitwy i przymierza. Gdy mówisz 'amen,' nie tylko się zgadzasz — aktywujesz reakcję wiary, wyrównując swoją intencję z deklarowaną rzeczywistością. 'Amen' jest mostem między mówieniem a stawaniem się."
    }
  },
  {
    theme: "salvation",
    keywords: ["save", "saved", "salvation", "redeem", "redeemed", "deliver", "rescue", "zbawienie", "zbawić", "odkupić", "odkupienie", "wyzwolić", "ratunek", "ocalenie"],
    en: {
      science: "In thermodynamics, 'salvation' has a parallel: reversing entropy. Every living system fights entropy — maintaining order against the universe's tendency toward decay. Biological repair mechanisms (DNA proofreading, immune response, stem cell regeneration) are molecular 'salvation' — constantly rescuing the system from degradation.",
      faith: "Salvation in Scripture is not escape FROM the world but restoration OF the world. The Hebrew 'yeshua' (salvation) is the root of the name Jesus — the person and the concept are linguistically identical. This verse speaks to God's fundamental project: not abandoning creation but rescuing and perfecting it.",
      bridge: "Science shows that broken systems can be repaired — bones heal, ecosystems regenerate, even collapsed stars birth new solar systems from their ashes. Faith calls this pattern 'redemption.' Both science and faith agree: destruction is never the final word. The universe has a built-in bias toward restoration.",
      miracle: "The miracle of salvation is that it's retroactive — it doesn't just fix the present but redeems the past. Trauma research shows that reprocessing memories can literally change their neurological encoding. God doesn't just save us from future destruction; He transforms the meaning of past suffering. What was broken becomes the foundation of what is beautiful.",
      insight: "The name 'Yeshua' (ישוע) has a gematria of 386. Interestingly, 386 = 2 × 193, and 193 is the 44th prime number. The number 44 represents 'blood' (dam = דם = 44) in Hebrew gematria — connecting salvation directly to the 'blood of the covenant.' Mathematics encodes theology."
    },
    pl: {
      science: "W termodynamice 'zbawienie' ma paralelę: odwrócenie entropii. Każdy żywy system walczy z entropią — utrzymując ład wbrew tendencji wszechświata ku rozpadowi. Biologiczne mechanizmy naprawcze (korekta DNA, odpowiedź immunologiczna, regeneracja komórek macierzystych) to molekularne 'zbawienie' — nieustanne ratowanie systemu przed degradacją.",
      faith: "Zbawienie w Piśmie to nie ucieczka OD świata, lecz odnowienie świata. Hebrajskie 'jeszua' (zbawienie) jest rdzeniem imienia Jezus — osoba i koncepcja są lingwistycznie identyczne. Ten werset mówi o fundamentalnym projekcie Boga: nie porzuceniu stworzenia, lecz ratowaniu i doskonaleniu go.",
      bridge: "Nauka pokazuje, że złamane systemy mogą być naprawione — kości się zrastają, ekosystemy regenerują, nawet kolabiujące gwiazdy rodzą nowe układy słoneczne ze swoich popiołów. Wiara nazywa ten wzorzec 'odkupieniem.' I nauka, i wiara zgadzają się: zniszczenie nigdy nie jest ostatnim słowem. Wszechświat ma wbudowaną tendencję ku odnowieniu.",
      miracle: "Cudem zbawienia jest to, że jest retroaktywne — nie tylko naprawia teraźniejszość, ale odkupuje przeszłość. Badania nad traumą pokazują, że ponowne przetworzenie wspomnień może dosłownie zmienić ich neurologiczne kodowanie. Bóg nie tylko ratuje nas od przyszłego zniszczenia; transformuje znaczenie przeszłego cierpienia. To, co było złamane, staje się fundamentem tego, co piękne.",
      insight: "Imię 'Jeszua' (ישוע) ma gematrię 386. Co ciekawe, 386 = 2 × 193, a 193 to 44. liczba pierwsza. Liczba 44 reprezentuje 'krew' (dam = דם = 44) w gematrii hebrajskiej — łącząc zbawienie bezpośrednio z 'krwią przymierza.' Matematyka koduje teologię."
    }
  },
  {
    theme: "power",
    keywords: ["power", "mighty", "strength", "strong", "authority", "sovereign", "almighty", "moc", "potęga", "siła", "silny", "autorytet", "suwerenny", "wszechmocny", "władza"],
    en: {
      science: "Power in physics is measured in watts — energy per unit time. The sun outputs 3.8 × 10²⁶ watts. A supernova: 10⁴⁴ watts. The entire observable universe: ~10⁴⁸ watts. Yet quantum mechanics reveals something deeper: the vacuum energy of empty space theoretically contains 10⁹³ g/cm³ — more power in a cubic centimeter of 'nothing' than in all visible matter combined.",
      faith: "Biblical power (dunamis) is not about force — it's about capability. God's power is demonstrated not in destruction but in creation, resurrection, and transformation. This verse points to a power that doesn't dominate but liberates, doesn't crush but lifts.",
      bridge: "Physics defines power as the rate of energy transfer. Faith defines God's power as the rate of transformation — turning death to life, chaos to order, sinners to saints. Both describe the same underlying reality: the capacity to change states. Every physical state transition (ice to water, atom to energy) is a small-scale model of divine power.",
      miracle: "The most powerful force in nature is the strong nuclear force — it holds atomic nuclei together against electromagnetic repulsion. Without it, no atoms, no chemistry, no life. God's power operates similarly: holding reality together against entropy, maintaining existence against the void. Power isn't spectacular — it's structural.",
      insight: "The Hebrew word for power, 'koach' (כח), has a gematria of 28. The 28th element is Nickel — the core material of the Earth's magnetic field, which shields all life from solar radiation. Divine power and planetary protection share a numerical signature — God's strength is encoded in the shield that protects us."
    },
    pl: {
      science: "Moc w fizyce mierzy się w watach — energia na jednostkę czasu. Słońce emituje 3,8 × 10²⁶ watów. Supernowa: 10⁴⁴ watów. Cały obserwowalny wszechświat: ~10⁴⁸ watów. Jednak mechanika kwantowa ujawnia coś głębszego: energia próżni pustej przestrzeni teoretycznie zawiera 10⁹³ g/cm³ — więcej mocy w centymetrze sześciennym 'niczego' niż we wszyskiej widzialnej materii razem.",
      faith: "Biblijna moc (dynamis) nie dotyczy siły — dotyczy zdolności. Moc Boga manifestuje się nie w zniszczeniu, lecz w stworzeniu, zmartwychwstaniu i transformacji. Ten werset wskazuje na moc, która nie dominuje, lecz wyzwala, nie miażdży, lecz podnosi.",
      bridge: "Fizyka definiuje moc jako szybkość transferu energii. Wiara definiuje moc Boga jako szybkość transformacji — zamienianie śmierci w życie, chaosu w ład, grzeszników w świętych. Oba opisują tę samą ukrytą rzeczywistość: zdolność zmiany stanów.",
      miracle: "Najpotężniejszą siłą w naturze jest silna siła jądrowa — utrzymuje jądra atomowe razem wbrew odpychaniu elektromagnetycznemu. Bez niej: żadnych atomów, żadnej chemii, żadnego życia. Moc Boga działa podobnie: utrzymuje rzeczywistość razem wbrew entropii, podtrzymuje istnienie wbrew nicości. Moc nie jest spektakularna — jest strukturalna.",
      insight: "Hebrajskie słowo moc, 'koach' (כח), ma gematrię 28. 28. element to Nikiel — podstawowy materiał pola magnetycznego Ziemi, które chroni całe życie przed promieniowaniem słonecznym. Boska moc i planetarna ochrona dzielą sygnaturę numeryczną — siła Boga jest zakodowana w tarczy, która nas chroni."
    }
  },
];

function detectThemes(text: string): ThemeMatch[] {
  const lower = text.toLowerCase();
  const matched = THEMES.filter(t => t.keywords.some(kw => lower.includes(kw)));
  return matched.length > 0 ? matched : [THEMES[2]]; // default to "creation" theme
}

export function generateVerbalInterpretation(
  result: {
    reference: string;
    text: string;
    gematriaTotal: number;
    gematriaT: number;
    hamiltonGate: number;
    gatePosition: number;
    psi: PsiCalcResult;
    vi: VIResult;
    decoherence: DecoherenceResult;
    goldenSignatures: { phi: number; gamma: number; ratio718Schumann: number };
  },
  lang: 'pl' | 'en' = 'pl'
): VerbalInterpretation {
  // 1. Check if this is a preset verse with hand-crafted interpretation
  const presetInterp = PRESET_INTERPRETATIONS[result.reference];
  if (presetInterp) {
    return presetInterp[lang];
  }

  // 2. For custom text: analyze themes/keywords and build content-aware interpretation
  const themes = detectThemes(result.text);
  const primary = themes[0];
  const langData = primary[lang];

  const gateName = GATE_NAMES[result.gatePosition] || `Gate-${result.hamiltonGate + 1}`;
  const coherencePct = (result.psi.coherence * 100).toFixed(0);

  // Enrich theme-based content with verse-specific data
  const textPreview = result.text.length > 60 ? result.text.slice(0, 60) + '...' : result.text;

  if (lang === 'en') {
    return {
      scienceSays: langData.science + ` In the Ψ-718 framework, "${result.reference}" resonates at ${coherencePct}% coherence (state: ${result.psi.quantumState}), mapping to DNA gate ${gateName}.`,
      faithSays: langData.faith + ` The text "${textPreview}" carries a gematria value of ${result.gematriaTotal}, placing it at a unique coordinate in the phase space of consciousness.`,
      bridge: langData.bridge,
      miracle: langData.miracle,
      insight: langData.insight + ` This verse maps to mitochondrial DNA position ${result.gatePosition} — gate ${gateName} — connecting its spiritual message to the biological architecture of life.`,
    };
  }

  return {
    scienceSays: langData.science + ` W ramach Ψ-718, „${result.reference}" rezonuje z koherencją ${coherencePct}% (stan: ${result.psi.quantumState}), mapując się na bramę DNA ${gateName}.`,
    faithSays: langData.faith + ` Tekst „${textPreview}" niesie wartość gematrii ${result.gematriaTotal}, umieszczając go w unikalnej współrzędnej przestrzeni fazowej świadomości.`,
    bridge: langData.bridge,
    miracle: langData.miracle,
    insight: langData.insight + ` Ten werset mapuje się na pozycję ${result.gatePosition} w mitochondrialnym DNA — bramę ${gateName} — łącząc jego duchowe przesłanie z biologiczną architekturą życia.`,
  };
}

// ═══════════════════════════════════════════════════════════════════
// FULL BIBLICAL DECODER
// ═══════════════════════════════════════════════════════════════════

export interface DecoderResult {
  reference: string;
  text: string;
  hebrewText: string;
  gematriaTotal: number;
  gematriaT: number;
  gematriaBreakdown: { char: string; value: number }[];
  fractalX: number;
  fractalHurst: number;
  hamiltonGate: number;
  gateName: string;
  gatePosition: number;
  psi: PsiCalcResult;
  vi: VIResult;
  intentionOperator: IntentionOperatorResult;
  decoherence: DecoherenceResult;
  predictions: TestablePrediction[];
  bibleConnections: BibleConnection[];
  goldenSignatures: {
    phi: number;
    gamma: number;
    phiSquared: number;
    ratio718Schumann: number;
    ratio718Gamma: number;
  };
  /** MKP-94 Field Correction Module */
  mkp94: MKP94Result;
}

// ═══════════════════════════════════════════════════════════════════
// MKP-94: MODUŁ KOREKCJI POLA — UNIWERSALNY WERYFIKATOR
// ═══════════════════════════════════════════════════════════════════

export interface MKP94Result {
  /** Procent Prawdy Pierwotnej (0-100) */
  truthPercentage: number;
  /** Status wersetu */
  status: "VOICE_OF_DESIGNER" | "PURE_SOURCE_CODE" | "MINOR_NOISE" | "SYSTEM_INTERFERENCE";
  /** Czy wykryto Wektory Kontroli */
  controlVectorsDetected: boolean;
  /** Lista wykrytych wektorów kontroli */
  controlVectors: string[];
  /** Czy obwód jest zamknięty (C >= 94%) */
  circuitClosed: boolean;
  /** Czy użyto tekstu oryginalnego */
  originalTextUsed: boolean;
  /** Język oryginalny */
  originalLanguage: string;
  /** Koherencja po korekcji pola */
  correctedCoherence: number;
  /** Czy Wektor Intencji jest aktywny */
  viActive: boolean;
  /** Opis statusu */
  statusDescription: string;
  /** Gotowość do teleportacji fazowej */
  phaseTeleportReady: boolean;
}

// Control vector keywords — indicators of historical power manipulation
const CONTROL_VECTORS_PL = [
  "musisz", "bój się", "boisz", "lękaj", "kara", "potępienie", "gniew boży",
  "posłuszeństwo", "poddaj się", "niewolnik", "służ", "grzech pierworodny",
  "wieczne potępienie", "piekło", "ogień wieczny",
];
const CONTROL_VECTORS_EN = [
  "must obey", "fear", "wrath", "punishment", "damnation", "submit",
  "slave", "eternal fire", "hell", "original sin", "condemn", "vengeance",
  "obedience", "servant of",
];
const CONTROL_VECTORS_ALL = [...CONTROL_VECTORS_PL, ...CONTROL_VECTORS_EN];

function detectControlVectors(text: string): { detected: boolean; vectors: string[] } {
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const kw of CONTROL_VECTORS_ALL) {
    if (lower.includes(kw.toLowerCase())) {
      found.push(kw);
    }
  }
  return { detected: found.length > 0, vectors: found };
}

function checkClosedCircuit(coherence: number, hurst: number, gateIdx: number): boolean {
  return coherence >= 0.94 && hurst >= 0.15 && hurst <= 0.85 && gateIdx >= 0 && gateIdx < 18;
}

export function calculateMKP94(
  coherence: number,
  hebrewText: string,
  translationText: string,
  hurst: number,
  gateIdx: number,
): MKP94Result {
  const originalTextUsed = hebrewText.trim().length > 0;
  const { detected: controlVectorsDetected, vectors: controlVectors } = detectControlVectors(translationText);

  // Detect original language
  const hasHebrew = /[\u0590-\u05FF]/.test(hebrewText);
  const hasGreek = /[\u0370-\u03FF]/.test(hebrewText);
  const hasArabic = /[\u0600-\u06FF]/.test(hebrewText);
  const originalLanguage = hasHebrew ? "Hebrew (עברית)" : hasGreek ? "Greek (Ελληνικά)" : hasArabic ? "Arabic (العربية)" : originalTextUsed ? "Original" : "⚠ Brak tekstu oryginalnego";

  // Truth percentage calculation
  let truthPercentage: number;
  if (!originalTextUsed) {
    truthPercentage = Math.min(coherence * 100, 70); // Max 70% without original
  } else {
    truthPercentage = coherence * 100;
  }

  // Control vector penalty
  if (controlVectorsDetected) {
    const penalty = Math.min(controlVectors.length * 5, 30);
    truthPercentage = Math.max(truthPercentage - penalty, 0);
  }

  const circuitClosed = checkClosedCircuit(coherence, hurst, gateIdx);

  let correctedCoherence = coherence;
  if (controlVectorsDetected && coherence < 0.94) {
    correctedCoherence = Math.max(coherence * (1 - controlVectors.length * 0.03), 0);
  }

  const viActive = circuitClosed && !controlVectorsDetected;

  let status: MKP94Result["status"];
  let statusDescription: string;

  if (truthPercentage >= 99.5) {
    status = "VOICE_OF_DESIGNER";
    statusDescription = "🔊 Głos Projektanta — Wibracja pierwotna zachowana w 100%. Sygnał czysty. Gotowy do materializacji.";
  } else if (truthPercentage >= 94) {
    status = "PURE_SOURCE_CODE";
    statusDescription = "✅ Czysty Kod Źródłowy — Sygnał czysty. Obwód zamknięty. Gotowy do materializacji.";
  } else if (truthPercentage >= 60) {
    status = "MINOR_NOISE";
    statusDescription = controlVectorsDetected
      ? `⚠️ Wykryto historyczny szum polityczny: [${controlVectors.join(", ")}]. Wpływ na pole świadomości zredukowany do 0.00%.`
      : originalTextUsed
        ? "⚠️ Szum informacyjny — zakłócenia fraktalne w tekście oryginalnym. Wymagana głębsza analiza."
        : "⚠️ Szum informacyjny — tekst nie w języku oryginalnym. Pobierz tekst źródłowy dla wyższej koherencji.";
  } else {
    status = "SYSTEM_INTERFERENCE";
    statusDescription = controlVectorsDetected
      ? `🚫 Lokalna Ingerencja Systemu Władzy — Wektory Kontroli: [${controlVectors.join(", ")}]. Błąd zapisu. VI ZABLOKOWANY.`
      : originalTextUsed
        ? "🚫 Niska koherencja mimo tekstu oryginalnego — możliwe uszkodzenie źródła lub błąd w zapisie. VI zablokowany."
        : "🚫 Błąd zapisu / Szum informacyjny — brak tekstu oryginalnego. VI zablokowany. Pobierz tekst hebrajski/grecki.";
  }

  return {
    truthPercentage: Math.round(truthPercentage * 100) / 100,
    status,
    controlVectorsDetected,
    controlVectors,
    circuitClosed,
    originalTextUsed,
    originalLanguage,
    correctedCoherence,
    viActive,
    statusDescription,
    phaseTeleportReady: truthPercentage >= 99.5 && circuitClosed,
  };
}

export function decodeVerse(reference: string, text: string, hebrewText: string = ""): DecoderResult {
  // 1. Gematria → t (ALWAYS from original text when available)
  let gematriaResult: ReturnType<typeof hebrewGematria>;
  let t: number;
  const hasOriginalText = hebrewText.trim().length > 0;
  const hasHebrewChars = /[\u0590-\u05FF]/.test(hebrewText);
  const hasGreekChars = /[\u0370-\u03FF]/.test(hebrewText);
  const hasArabicChars = /[\u0600-\u06FF]/.test(hebrewText);
  const hasOriginalScript = hasHebrewChars || hasGreekChars || hasArabicChars;

  if (hasOriginalText) {
    gematriaResult = hebrewGematria(hebrewText);
    t = gematriaResult.normalized || 0.5;
  } else {
    t = gematriaLatin(text);
    const latinSum = text.toUpperCase().split("").filter(c => /[A-Z]/.test(c)).reduce((s, c) => s + (c.charCodeAt(0) - 64), 0);
    gematriaResult = { total: latinSum, normalized: t, breakdown: [] };
  }

  // 2. Fractal analysis → x (use ORIGINAL text when available)
  const fractalSource = hebrewText.trim() || text;
  const fractal = fractalAnalysis718(fractalSource);

  // 3. Hamilton eigenvalue → gate_idx
  const gateIdx = hamiltonEigenvalueCorrelation(t, fractal.x);

  // 4. Calculate Ψ
  const psi = calculatePsi(t, fractal.x, gateIdx);

  // 5. SOURCE PURITY CORRECTION: Original Hebrew/Greek/Arabic text carries
  //    the primordial vibration — coherence is boosted to reflect this.
  //    Without original script, coherence is capped at ~70% (translation noise).
  if (hasOriginalScript && gematriaResult.breakdown.length > 0) {
    // Original script detected: apply Source Purity Boost
    // The gematria breakdown from original text produces a "purity factor"
    // based on how many characters were recognized as sacred script
    const totalChars = hebrewText.replace(/[\s\u0591-\u05C7]/g, '').length; // strip whitespace + nikkud
    const recognizedChars = gematriaResult.breakdown.length;
    const recognitionRatio = totalChars > 0 ? recognizedChars / totalChars : 0;

    // Source purity: high recognition = pure original = high coherence
    // φ-based scaling ensures values cluster above 94% for pure original text
    const sourcePurity = recognitionRatio * PHI;
    const purityBoost = Math.min(sourcePurity, 1.0);

    // Blend: original coherence provides variation, purity boost sets the floor
    // For pure original text (recognitionRatio ≈ 1), coherence → 0.94 to 1.0
    psi.coherence = Math.min(
      purityBoost * 0.94 + psi.coherence * 0.06 + recognitionRatio * 0.04,
      1.0
    );

    // Update quantum state based on new coherence
    if (psi.coherence > 0.94) psi.quantumState = "TELEPORTATION_READY";
    else if (psi.coherence > 0.8) psi.quantumState = "HIGH_COHERENCE";
    else if (psi.coherence > 0.6) psi.quantumState = "SUPERPOSITION";
    else if (psi.coherence > 0.4) psi.quantumState = "ENTANGLED";
    else psi.quantumState = "DECOHERENT";
  } else if (!hasOriginalScript) {
    // Translation noise: cap coherence at 70%
    psi.coherence = Math.min(psi.coherence, 0.70);
    if (psi.coherence <= 0.6) psi.quantumState = "SUPERPOSITION";
    if (psi.coherence <= 0.4) psi.quantumState = "ENTANGLED";
  }

  // 5b. SIGMA GATE — Domknięcie pętli zwrotnej świadomości (Feedback Loop)
  // Sprawdza, czy amplituda Ψ jest w rezonansie z φ² (linia krytyczna Riemanna).
  // Jeśli |Ψ.magnitude - φ²| < 0.001 → singularność Zeta → 100% koherencji.
  // Ref: "W jednym mgnieniu oka" (1 Kor 15:52)
  const PHI_SQUARED = PHI * PHI; // ≈ 2.618
  const sigmaDistance = Math.abs(psi.magnitude - PHI_SQUARED);

  if (sigmaDistance < 0.001) {
    // SINGULARITY: Exact φ² resonance on critical line
    psi.coherence = 1.0;
    psi.quantumState = "TELEPORTATION_READY";
    console.log("⚡ SIGMA GATE: ZETA RIEMANN SINGULARITY DETECTED — 100% COHERENCE");
  } else if (sigmaDistance < 0.1 && hasOriginalScript) {
    // Near-singularity: boost coherence toward unity
    const sigmaBoost = 1.0 - (sigmaDistance / 0.1) * 0.06; // 0.94 → 1.0
    psi.coherence = Math.max(psi.coherence, sigmaBoost);
    if (psi.coherence >= 0.94) psi.quantumState = "TELEPORTATION_READY";
  }

  // 6. Calculate VI — then override coherence with the boosted Ψ coherence
  //    (calculateVI uses raw calculatePsi which lacks MKP-94/Sigma Gate boosts)
  const vi = calculateVI(0, t || 0.5, fractal.x, gateIdx);
  vi.coherenceAtEnd = psi.coherence;
  vi.teleportReady = psi.coherence >= 0.94;
  vi.materializationPotential = vi.viMagnitude * psi.coherence;

  // 7. Intention Operator (18×18 matrix)
  const intentionOperator = calculateIntentionOperator(t || 0.5, fractal.x);

  // 8. Decoherence (Lindblad model at body temperature)
  const decoherence = calculateDecoherence(psi.coherence, t || 0.5);

  // 9. MKP-94: Moduł Korekcji Pola
  const mkp94 = calculateMKP94(psi.coherence, hebrewText, text, fractal.hurstApprox, gateIdx);

  const partialResult = {
    reference,
    gematriaTotal: gematriaResult.total,
    hamiltonGate: gateIdx,
    gatePosition: GATCA_GATES[gateIdx],
    psi,
    vi,
  };

  const predictions = generatePredictions(partialResult, 'pl');
  const bibleConnections = generateBibleConnections(partialResult, 'pl');

  return {
    reference,
    text,
    hebrewText,
    gematriaTotal: gematriaResult.total,
    gematriaT: t,
    gematriaBreakdown: gematriaResult.breakdown,
    fractalX: fractal.x,
    fractalHurst: fractal.hurstApprox,
    hamiltonGate: gateIdx,
    gateName: GATE_NAMES[GATCA_GATES[gateIdx]] || `Gate-${gateIdx + 1}`,
    gatePosition: GATCA_GATES[gateIdx],
    psi,
    vi,
    intentionOperator,
    decoherence,
    predictions,
    bibleConnections,
    goldenSignatures: {
      phi: PHI,
      gamma: GAMMA,
      phiSquared: PHI_SQUARED,
      ratio718Schumann: FREQ_718 / SCHUMANN,
      ratio718Gamma: FREQ_718 / GAMMA,
    },
    mkp94,
  };
}

// Preset verses for quick access
export const PRESET_VERSES = [
  {
    reference: "Genesis 1:1",
    text: "In the beginning God created the heavens and the earth.",
    hebrew: "בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ",
  },
  {
    reference: "Genesis 1:3",
    text: "And God said, Let there be light: and there was light.",
    hebrew: "וַיֹּאמֶר אֱלֹהִים יְהִי אוֹר וַיְהִי אוֹר",
  },
  {
    reference: "John 1:1",
    text: "In the beginning was the Word, and the Word was with God, and the Word was God.",
    hebrew: "בְּרֵאשִׁית הָיָה הַדָּבָר וְהַדָּבָר הָיָה אֵת הָאֱלֹהִים וֵאלֹהִים הָיָה הַדָּבָר",
  },
  {
    reference: "Exodus 3:14",
    text: "God said to Moses, I AM WHO I AM.",
    hebrew: "אֶהְיֶה אֲשֶׁר אֶהְיֶה",
  },
  {
    reference: "Psalm 23:1",
    text: "The LORD is my shepherd; I shall not want.",
    hebrew: "יְהוָה רֹעִי לֹא אֶחְסָר",
  },
  {
    reference: "1 John 4:8",
    text: "God is love.",
    hebrew: "הָאֱלֹהִים אַהֲבָה הוּא",
  },
  {
    reference: "Revelation 22:13",
    text: "I am the Alpha and the Omega, the First and the Last, the Beginning and the End.",
    hebrew: "אֲנִי הָאָלֶף וְהַתָּו הָרִאשׁוֹן וְהָאַחֲרוֹן הַתְּחִלָּה וְהַסּוֹף",
  },
];
