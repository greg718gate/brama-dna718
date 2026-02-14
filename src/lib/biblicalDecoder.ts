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
  const remainingCoherence = coherence * Math.exp(-decoherenceRate * t * 1e-12);
  // Note: t is in the equation's units, we scale to realistic timescales

  // Coupling strength (normalized)
  const couplingStrength = Math.min(thermalNoise / 1e10, 1);

  // Purity: Tr(ρ²) = 1 for pure state, 1/N for maximally mixed
  const purity = 0.5 * (1 + remainingCoherence * remainingCoherence);

  // Stability classification
  let stability: "STABLE" | "METASTABLE" | "UNSTABLE";
  if (remainingCoherence > 0.8) stability = "STABLE";
  else if (remainingCoherence > 0.4) stability = "METASTABLE";
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
}): TestablePrediction[] {
  const gateFreq = FREQ_718 * (result.gatePosition / MTDNA_LENGTH);

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
}): BibleConnection[] {
  const gatePos = result.gatePosition;
  const gateName = GATE_NAMES[gatePos] || "";

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
  const vi = calculateVI(0, t || 0.5, fractal.x, gateIdx);

  // 6. Intention Operator (18×18 matrix)
  const intentionOperator = calculateIntentionOperator(t || 0.5, fractal.x);

  // 7. Decoherence (Lindblad model at body temperature)
  const decoherence = calculateDecoherence(psi.coherence, t || 0.5);

  const partialResult = {
    reference,
    gematriaTotal: gematriaResult.total,
    hamiltonGate: gateIdx,
    gatePosition: GATCA_GATES[gateIdx],
    psi,
    vi,
  };

  // 8. Testable predictions
  const predictions = generatePredictions(partialResult);

  // 9. Bible connections
  const bibleConnections = generateBibleConnections(partialResult);

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
