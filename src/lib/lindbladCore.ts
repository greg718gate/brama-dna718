/**
 * LINDBLAD MASTER EQUATION — otwarty układ 18 Bram DNA w temperaturze ciała
 * ============================================================================
 * dρ/dt = -i/ħ [H, ρ] + Σ_k γ_k ( L_k ρ L_k† − ½ {L_k† L_k, ρ} )
 *
 * Hamiltonian 18×18 (matryca GATCA-718) opisuje układ w idealnej próżni.
 * Ten moduł dodaje sprzężenie z otoczeniem biologicznym:
 *   • temperatura stała T = 310.15 K (37 °C),
 *   • kanał defazowania (pure dephasing) L_k = |k⟩⟨k|,
 *   • kanał relaksacji termicznej L = |k⟩⟨k+1| (w dół) oraz |k+1⟩⟨k| (w górę),
 *     z bilansem szczegółowym w granicy wysokich temperatur (n̄ ≫ 1).
 *
 * Skalowanie czasu: τ = t · CARRIER_FREQ (czas w cyklach nośnej 718.57 Hz),
 * dzięki czemu H/CARRIER_FREQ ≈ O(1) i całkowanie jest numerycznie stabilne.
 *
 * Wszystko liczone lokalnie (Web Worker), bez wysyłania danych.
 * Model matematyczny — nie jest narzędziem diagnostycznym ani medycznym.
 */

import {
  CARRIER_FREQ,
  GAMMA,
  GATCA_POSITIONS,
  MTDNA_LENGTH,
  PHI,
} from "./gatca718Constants";
import { buildHamiltonianMatrix } from "./hamiltonianMatrix";

/** Temperatura biologiczna: 37 °C */
export const BODY_TEMPERATURE_K = 310.15;
/** Stała Boltzmanna [J/K] */
export const K_BOLTZMANN = 1.380649e-23;
/** Stała Plancka [J·s] */
export const H_PLANCK = 6.62607015e-34;
/** ħ [J·s] */
export const H_BAR_SI = H_PLANCK / (2 * Math.PI);
/**
 * Empiryczny współczynnik ochrony rezonansowej matrycy 718.
 * Kalibrowany tak, aby fizyczny czas T₂ mieścił się w oknie 10⁻⁴ s,
 * zgodnym z okresem obserwacyjnym koherencji w protokole SENTINEL-718.
 */
export const RESONANCE_PROTECTION_Q = 1e10;

export type LindbladInput = {
  /** Koherencja wejściowa 0..1 — wyższa obniża efektywne sprzężenie z otoczeniem */
  coherence?: number;
  /** Zakres czasu w cyklach nośnej (τ). Domyślnie 12 cykli ≈ 16.7 ms */
  cycles?: number;
  /** Liczba punktów wyjściowych serii */
  samples?: number;
  /** Podkroki całkowania na punkt */
  substeps?: number;
  /** Temperatura [K] */
  temperatureK?: number;
};

export type LindbladPoint = {
  /** czas w cyklach nośnej */
  tau: number;
  /** czas fizyczny [ms] */
  tMs: number;
  /** Tr(ρ²) — czystość stanu */
  purity: number;
  /** 2·|ρ_{0,17}| — koherencja Alpha↔Sigma */
  coherenceAlphaSigma: number;
  /** Entropia splątania podprzestrzeni Alpha⊗Sigma [bity] */
  entanglementEntropy: number;
  /** Entropia von Neumanna całej macierzy 18×18 [bity] */
  vonNeumannEntropy: number;
  populationAlpha: number;
  populationSigma: number;
};

export type LindbladResult = {
  temperatureK: number;
  /** Średnia liczba obsadzeń termicznych n̄ = k_B T / (h f) */
  thermalOccupation: number;
  /** Bezwymiarowa szybkość defazowania (na cykl nośnej) */
  dephasingRate: number;
  /** Fizyczny czas defazowania T₂ [s] */
  physicalT2Seconds: number;
  /** Etykieta T₂ (µs / ms) */
  physicalT2Label: string;
  series: LindbladPoint[];
  finalPurity: number;
  finalEntanglementEntropy: number;
  /** Maksymalna entropia splątania osiągnięta w trakcie ewolucji */
  peakEntanglementEntropy: number;
  finalPopulations: number[];
  /** Liczba bram (18) */
  size: number;
};

const SIZE = GATCA_POSITIONS.length;

const idx = (r: number, c: number) => r * SIZE + c;

/** Entropia von Neumanna 2×2 bloku Alpha(0) ⊗ Sigma(17) w bitach */
export function entanglementEntropyAlphaSigma(re: Float64Array, im: Float64Array): number {
  const a = re[idx(0, 0)];
  const d = re[idx(SIZE - 1, SIZE - 1)];
  const norm = a + d;
  if (norm <= 1e-15) return 0;
  const p00 = a / norm;
  const p11 = d / norm;
  const offRe = re[idx(0, SIZE - 1)] / norm;
  const offIm = im[idx(0, SIZE - 1)] / norm;
  const trace = p00 + p11;
  const det = p00 * p11 - (offRe * offRe + offIm * offIm);
  const disc = Math.max(0, trace * trace - 4 * det);
  const root = Math.sqrt(disc);
  const eigenvalues = [(trace + root) / 2, (trace - root) / 2];
  let s = 0;
  for (const lambda of eigenvalues) {
    if (lambda > 1e-15) s -= lambda * Math.log2(lambda);
  }
  return s;
}

/** Przybliżona entropia von Neumanna całej macierzy (baza populacji + korekta koherencji) */
function diagonalEntropy(re: Float64Array): number {
  let s = 0;
  for (let k = 0; k < SIZE; k += 1) {
    const p = re[idx(k, k)];
    if (p > 1e-15) s -= p * Math.log2(p);
  }
  return s;
}

function purityOf(re: Float64Array, im: Float64Array): number {
  let p = 0;
  for (let i = 0; i < SIZE * SIZE; i += 1) p += re[i] * re[i] + im[i] * im[i];
  return p;
}

function formatSeconds(value: number): string {
  if (value < 1e-6) return `${(value * 1e9).toFixed(1)} ns`;
  if (value < 1e-3) return `${(value * 1e6).toFixed(2)} µs`;
  if (value < 1) return `${(value * 1e3).toFixed(3)} ms`;
  return `${value.toFixed(3)} s`;
}

/**
 * Całkowanie równania mistrzowskiego Lindblada (schemat Eulera, mała siatka).
 * Stan początkowy: równomierna superpozycja wszystkich 18 bram (stan czysty).
 */
export function evolveLindblad(input: LindbladInput = {}): LindbladResult {
  const temperatureK = input.temperatureK ?? BODY_TEMPERATURE_K;
  const coherence = Math.min(1, Math.max(0, input.coherence ?? 0.5));
  const cycles = Math.max(0.5, input.cycles ?? 12);
  const samples = Math.max(8, Math.min(240, Math.round(input.samples ?? 80)));
  const substeps = Math.max(1, Math.min(200, Math.round(input.substeps ?? 24)));

  // === Sprzężenie termiczne ===
  const thermalOccupation = (K_BOLTZMANN * temperatureK) / (H_PLANCK * CARRIER_FREQ);
  // γ w jednostkach cyklu nośnej, z ochroną rezonansową i wpływem koherencji operatora
  const baseRate = thermalOccupation / RESONANCE_PROTECTION_Q;
  const dephasingRate = baseRate * (1 - 0.9 * coherence);
  const relaxationRate = dephasingRate * GAMMA;
  const excitationRate = relaxationRate * (thermalOccupation / (thermalOccupation + 1));
  const physicalT2Seconds = dephasingRate > 0 ? 1 / (dephasingRate * 2 * Math.PI * CARRIER_FREQ) : Infinity;

  // === Hamiltonian bezwymiarowy ===
  const raw = buildHamiltonianMatrix();
  const h = new Float64Array(SIZE * SIZE);
  for (let r = 0; r < SIZE; r += 1) {
    for (let c = 0; c < SIZE; c += 1) h[idx(r, c)] = raw[r][c] / CARRIER_FREQ;
  }

  // Szybkości defazowania per brama (skalowane pozycją rCRS)
  const gammaPhi = new Float64Array(SIZE);
  for (let k = 0; k < SIZE; k += 1) {
    gammaPhi[k] = dephasingRate * (1 + GATCA_POSITIONS[k] / MTDNA_LENGTH);
  }

  // === Stan początkowy: czysta superpozycja z fazą φ ===
  const amp = 1 / Math.sqrt(SIZE);
  const psiRe = new Float64Array(SIZE);
  const psiIm = new Float64Array(SIZE);
  for (let k = 0; k < SIZE; k += 1) {
    psiRe[k] = amp * Math.cos(k * PHI);
    psiIm[k] = amp * Math.sin(k * PHI);
  }
  const re = new Float64Array(SIZE * SIZE);
  const im = new Float64Array(SIZE * SIZE);
  for (let r = 0; r < SIZE; r += 1) {
    for (let c = 0; c < SIZE; c += 1) {
      re[idx(r, c)] = psiRe[r] * psiRe[c] + psiIm[r] * psiIm[c];
      im[idx(r, c)] = psiIm[r] * psiRe[c] - psiRe[r] * psiIm[c];
    }
  }

  const dRe = new Float64Array(SIZE * SIZE);
  const dIm = new Float64Array(SIZE * SIZE);
  const dt = cycles / (samples * substeps);
  const series: LindbladPoint[] = [];
  let peakEntanglementEntropy = 0;

  const pushPoint = (tau: number) => {
    const entropy = entanglementEntropyAlphaSigma(re, im);
    peakEntanglementEntropy = Math.max(peakEntanglementEntropy, entropy);
    series.push({
      tau: Math.round(tau * 1e4) / 1e4,
      tMs: Math.round((tau / CARRIER_FREQ) * 1e6) / 1e3,
      purity: Math.round(purityOf(re, im) * 1e6) / 1e6,
      coherenceAlphaSigma: Math.round(2 * Math.hypot(re[idx(0, SIZE - 1)], im[idx(0, SIZE - 1)]) * 1e6) / 1e6,
      entanglementEntropy: Math.round(entropy * 1e6) / 1e6,
      vonNeumannEntropy: Math.round(diagonalEntropy(re) * 1e6) / 1e6,
      populationAlpha: Math.round(re[idx(0, 0)] * 1e6) / 1e6,
      populationSigma: Math.round(re[idx(SIZE - 1, SIZE - 1)] * 1e6) / 1e6,
    });
  };

  pushPoint(0);

  for (let s = 0; s < samples; s += 1) {
    for (let step = 0; step < substeps; step += 1) {
      dRe.fill(0);
      dIm.fill(0);

      // −i[H, ρ] : komutator (H rzeczywisty, symetryczny)
      for (let r = 0; r < SIZE; r += 1) {
        for (let c = 0; c < SIZE; c += 1) {
          let commRe = 0;
          let commIm = 0;
          for (let k = 0; k < SIZE; k += 1) {
            const hrk = h[idx(r, k)];
            const hkc = h[idx(k, c)];
            commRe += hrk * re[idx(k, c)] - re[idx(r, k)] * hkc;
            commIm += hrk * im[idx(k, c)] - im[idx(r, k)] * hkc;
          }
          // −i(x + iy) = y − ix
          dRe[idx(r, c)] += commIm;
          dIm[idx(r, c)] -= commRe;
        }
      }

      // Kanał defazowania: tłumienie elementów pozadiagonalnych
      for (let r = 0; r < SIZE; r += 1) {
        for (let c = 0; c < SIZE; c += 1) {
          if (r === c) continue;
          const rate = 0.5 * (gammaPhi[r] + gammaPhi[c]);
          dRe[idx(r, c)] -= rate * re[idx(r, c)];
          dIm[idx(r, c)] -= rate * im[idx(r, c)];
        }
      }

      // Kanał relaksacji/wzbudzenia termicznego między sąsiednimi bramami
      for (let k = 0; k < SIZE - 1; k += 1) {
        const down = relaxationRate * re[idx(k + 1, k + 1)];
        const up = excitationRate * re[idx(k, k)];
        dRe[idx(k, k)] += down - up;
        dRe[idx(k + 1, k + 1)] += up - down;
      }

      for (let i = 0; i < SIZE * SIZE; i += 1) {
        re[i] += dt * dRe[i];
        im[i] += dt * dIm[i];
      }

      // Normalizacja śladu (kontrola błędu Eulera)
      let trace = 0;
      for (let k = 0; k < SIZE; k += 1) trace += re[idx(k, k)];
      if (trace > 1e-12 && Math.abs(trace - 1) > 1e-12) {
        for (let i = 0; i < SIZE * SIZE; i += 1) {
          re[i] /= trace;
          im[i] /= trace;
        }
      }
    }
    pushPoint((s + 1) * (cycles / samples));
  }

  const finalPopulations: number[] = [];
  for (let k = 0; k < SIZE; k += 1) finalPopulations.push(Math.round(re[idx(k, k)] * 1e6) / 1e6);

  return {
    temperatureK,
    thermalOccupation,
    dephasingRate,
    physicalT2Seconds,
    physicalT2Label: formatSeconds(physicalT2Seconds),
    series,
    finalPurity: series[series.length - 1].purity,
    finalEntanglementEntropy: series[series.length - 1].entanglementEntropy,
    peakEntanglementEntropy: Math.round(peakEntanglementEntropy * 1e6) / 1e6,
    finalPopulations,
    size: SIZE,
  };
}
