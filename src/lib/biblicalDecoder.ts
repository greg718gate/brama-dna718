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
    const val = HEBREW_GEMATRIA[char];
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
  // Trapezoidal integration of |Ψ(t)| · cos(phase)
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
  goldenSignatures: {
    phi: number;
    gamma: number;
    phiSquared: number;
    ratio718Schumann: number;
    ratio718Gamma: number;
  };
}

export function decodeVerse(reference: string, text: string, hebrewText: string = ""): DecoderResult {
  // 1. Gematria → t
  let gematriaResult: ReturnType<typeof hebrewGematria>;
  let t: number;

  if (hebrewText.trim()) {
    gematriaResult = hebrewGematria(hebrewText);
    t = gematriaResult.normalized || 0.5;
  } else {
    gematriaResult = { total: 0, normalized: 0, breakdown: [] };
    t = gematriaLatin(text);
  }

  // 2. Fractal analysis → x
  const fractal = fractalAnalysis718(text);

  // 3. Hamilton eigenvalue → gate_idx
  const gateIdx = hamiltonEigenvalueCorrelation(t, fractal.x);

  // 4. Calculate Ψ
  const psi = calculatePsi(t, fractal.x, gateIdx);

  // 5. Calculate VI
  const vi = calculateVI(0, t, fractal.x, gateIdx);

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
    goldenSignatures: {
      phi: PHI,
      gamma: GAMMA,
      phiSquared: PHI_SQUARED,
      ratio718Schumann: FREQ_718 / SCHUMANN,
      ratio718Gamma: FREQ_718 / GAMMA,
    },
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
    hebrew: "",
  },
  {
    reference: "Exodus 3:14",
    text: "God said to Moses, I AM WHO I AM.",
    hebrew: "אֶהְיֶה אֲשֶׁר אֶהְיֶה",
  },
  {
    reference: "1 John 4:8",
    text: "God is love.",
    hebrew: "",
  },
  {
    reference: "Revelation 22:13",
    text: "I am the Alpha and the Omega, the First and the Last, the Beginning and the End.",
    hebrew: "",
  },
];
