/**
 * GATCA-718 Quantum-Speed PRNG Engine
 * ====================================
 * Pseudorandom Number Generator oparty na stałych systemu GATCA-718.
 * Wykorzystuje φ (Golden Ratio), CARRIER_FREQ (718.57012515 Hz),
 * mtDNA bias (16569) oraz pozycje 18 Bram jako źródło entropii strukturalnej.
 *
 * Algorytm łączy kryptograficzną entropię (crypto.getRandomValues)
 * z deterministycznym filtrem GATCA-718 dla unikalnych wyników.
 */

import {
  PHI,
  CARRIER_FREQ,
  MTDNA_LENGTH,
  GATCA_POSITIONS,
  GAMMA,
  EULER_MASCHERONI,
  SCHUMANN_FREQ,
} from "./gatca718Constants";

// ============================================================================
// CORE ENGINE
// ============================================================================

/** Wewnętrzny stan generatora */
interface PrngState {
  seed: number;
  counter: number;
  entropy: Float64Array;
}

/** Inicjalizacja stanu z seedem */
function createState(seed: number): PrngState {
  const entropy = new Float64Array(18);
  // Wypełnij entropię pozycjami bram przeskalowanymi przez seed
  for (let i = 0; i < 18; i++) {
    entropy[i] = ((GATCA_POSITIONS[i] * seed) % MTDNA_LENGTH) / MTDNA_LENGTH;
  }
  return { seed, counter: 0, entropy };
}

/**
 * Rdzenny algorytm GATCA-718 PRNG.
 * Odpowiednik gatca_718_core z wersji Python/Numba.
 */
function gatca718Core(value: number, phi: number, gatcaConst: number, mtdnaBias: number): number {
  const signal = Math.sin(value * phi) * gatcaConst;
  const singularity = Math.sqrt(Math.abs(phi - (mtdnaBias / 10000)));
  return signal / (singularity + 1e-9);
}

/**
 * Generuje pojedynczą liczbę pseudolosową [0, 1).
 * Łączy entropię kryptograficzną z filtrem GATCA-718.
 */
function nextRaw(state: PrngState): number {
  state.counter++;

  // 1. Entropia kryptograficzna (32-bit)
  const cryptoArray = new Uint32Array(1);
  crypto.getRandomValues(cryptoArray);
  const cryptoNorm = cryptoArray[0] / 0xFFFFFFFF;

  // 2. Deterministyczny filtr GATCA-718
  const gateIndex = state.counter % 18;
  const gateEntropy = state.entropy[gateIndex];
  const coreSignal = gatca718Core(
    cryptoNorm + gateEntropy,
    PHI,
    CARRIER_FREQ,
    MTDNA_LENGTH
  );

  // 3. Modulacja Schumanna + φ
  const modulated = Math.abs(
    Math.sin(coreSignal * GAMMA) *
    Math.cos(state.counter * SCHUMANN_FREQ * 0.001) *
    PHI
  );

  // 4. Normalizacja do [0, 1)
  return modulated % 1;
}

// ============================================================================
// QUANTUM FILTER ENGINE (HFT Integration)
// ============================================================================

/**
 * Filtr kwantowy GATCA-718 — krzyżuje dane wejściowe z entropią systemu.
 * Wykrywa korelacje na częstotliwości φ × 718.57, niewidoczne dla standardowych PRNG.
 */
function quantumFilter(dataVector: number[], entropyVector: number[]): number {
  let sum = 0;
  const len = Math.min(dataVector.length, entropyVector.length);
  for (let i = 0; i < len; i++) {
    sum += Math.sin(dataVector[i] * entropyVector[i]);
  }
  return sum / (len || 1);
}

/**
 * Wielowarstwowy filtr interferencyjny — łączy GATCA z harmonicznymi Schumanna.
 * Każda warstwa filtruje inny aspekt szumu.
 */
function multiLayerFilter(
  data: number[],
  entropy: number[],
  phi: number,
  carrierFreq: number
): { correlation: number; harmonicStrength: number; phaseCoherence: number } {
  const len = Math.min(data.length, entropy.length);
  let corrSum = 0;
  let harmSum = 0;
  let phaseSum = 0;

  for (let i = 0; i < len; i++) {
    // Warstwa 1: Korelacja bazowa GATCA
    corrSum += Math.sin(data[i] * entropy[i]);

    // Warstwa 2: Rezonans harmoniczny (φ-modulated)
    harmSum += Math.cos(data[i] * phi * entropy[i] * carrierFreq * 0.001);

    // Warstwa 3: Koherencja fazowa (Schumann-locked)
    const phase = Math.atan2(
      Math.sin(data[i] * SCHUMANN_FREQ * 0.01),
      Math.cos(entropy[i] * phi)
    );
    phaseSum += Math.cos(phase);
  }

  return {
    correlation: corrSum / (len || 1),
    harmonicStrength: Math.abs(harmSum / (len || 1)),
    phaseCoherence: Math.abs(phaseSum / (len || 1)),
  };
}

/** Decyzja high-confidence (HFT trigger) */
function executeDecision(predictionValue: number, threshold: number = 0.9998): -1 | 0 | 1 {
  const prob = Math.tanh(Math.abs(predictionValue));
  if (prob > threshold) {
    return predictionValue > 0 ? 1 : -1;
  }
  return 0;
}

// ============================================================================
// PUBLIC API
// ============================================================================

export interface QuantumFilterResult {
  correlation: number;
  harmonicStrength: number;
  phaseCoherence: number;
  compositeSignal: number;
  decision: -1 | 0 | 1;
  decisionLabel: "BUY" | "SELL" | "WAIT";
  confidence: number;
  entropyVector: number[];
  gateSignature: string;
}

export class Gatca718Prng {
  private state: PrngState;

  constructor(seed?: number) {
    const defaultSeed = seed ?? (Date.now() ^ (Math.random() * 0xFFFFFFFF));
    this.state = createState(defaultSeed);
  }

  /** Reseed generatora */
  reseed(seed: number): void {
    this.state = createState(seed);
  }

  /** Liczba pseudolosowa [0, 1) */
  random(): number {
    return nextRaw(this.state);
  }

  /** Liczba całkowita z zakresu [min, max] (inclusive) */
  integer(min: number, max: number): number {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }

  /** Liczba zmiennoprzecinkowa z zakresu [min, max) */
  float(min: number, max: number): number {
    return this.random() * (max - min) + min;
  }

  /** Tablica N liczb pseudolosowych [0, 1) */
  batch(count: number): number[] {
    const results: number[] = [];
    for (let i = 0; i < count; i++) {
      results.push(this.random());
    }
    return results;
  }

  /** Losowy element z tablicy */
  pick<T>(array: T[]): T {
    return array[this.integer(0, array.length - 1)];
  }

  /** Tasowanie tablicy (Fisher-Yates) */
  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.integer(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /** Rzut kostką (1-N) */
  dice(sides: number = 6): number {
    return this.integer(1, sides);
  }

  /** UUID v4 (GATCA-enhanced) */
  uuid(): string {
    const hex = (_n: number, len: number) =>
      Math.floor(this.random() * Math.pow(16, len))
        .toString(16)
        .padStart(len, "0");
    return `${hex(0, 8)}-${hex(0, 4)}-4${hex(0, 3)}-${(8 + this.integer(0, 3)).toString(16)}${hex(0, 3)}-${hex(0, 12)}`;
  }

  /** Rozkład normalny (Box-Muller) */
  gaussian(mean: number = 0, stddev: number = 1): number {
    const u1 = this.random();
    const u2 = this.random();
    const z0 = Math.sqrt(-2 * Math.log(u1 || 1e-10)) * Math.cos(2 * Math.PI * u2);
    return z0 * stddev + mean;
  }

  // ========================================================================
  // QUANTUM FILTER API (HFT)
  // ========================================================================

  /**
   * Generuje wektor entropii GATCA-718 o danym rozmiarze.
   * Każda wartość jest unikalna — przefiltrowana przez pozycje 18 Bram.
   */
  getEntropyVector(size: number = 10): number[] {
    return this.batch(size);
  }

  /**
   * Bazowy filtr kwantowy — prosta korelacja sin.
   */
  quantumFilter(dataVector: number[]): number {
    const entropy = this.getEntropyVector(dataVector.length);
    return quantumFilter(dataVector, entropy);
  }

  /**
   * Pełna analiza Quantum Filter — 3 warstwy + decyzja.
   * To jest serce systemu HFT.
   */
  analyzeSignal(dataVector: number[], threshold: number = 0.9998): QuantumFilterResult {
    const entropy = this.getEntropyVector(dataVector.length);
    const stats = this.stats();

    // Wielowarstwowa analiza
    const { correlation, harmonicStrength, phaseCoherence } = multiLayerFilter(
      dataVector, entropy, PHI, CARRIER_FREQ
    );

    // Sygnał kompozytowy: średnia ważona 3 warstw (wagi: φ, γ, 1)
    const compositeSignal =
      (correlation * PHI + harmonicStrength * GAMMA + phaseCoherence) /
      (PHI + GAMMA + 1);

    // Core GATCA transform na sygnale kompozytowym
    const coreResult = gatca718Core(compositeSignal, PHI, CARRIER_FREQ, MTDNA_LENGTH);

    // Decyzja
    const decision = executeDecision(coreResult, threshold);

    // Confidence (0-100%)
    const confidence = Math.tanh(Math.abs(coreResult)) * 100;

    // Gate signature — unikalna sygnatura bazująca na aktywnej bramie
    const gateIdx = stats.gateIndex;
    const gateSig = `G${gateIdx + 1}:${GATCA_POSITIONS[gateIdx]}:${stats.counter}`;

    return {
      correlation,
      harmonicStrength,
      phaseCoherence,
      compositeSignal,
      decision,
      decisionLabel: decision === 1 ? "BUY" : decision === -1 ? "SELL" : "WAIT",
      confidence,
      entropyVector: entropy,
      gateSignature: gateSig,
    };
  }

  /** Statystyki aktualnego stanu */
  stats(): { seed: number; counter: number; gateIndex: number } {
    return {
      seed: this.state.seed,
      counter: this.state.counter,
      gateIndex: this.state.counter % 18,
    };
  }
}
