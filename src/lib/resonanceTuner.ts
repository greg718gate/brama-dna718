/**
 * Resonance Tuner - Kalibracja częstotliwości do zer Riemanna
 * Skanuje zakres wokół 718 Hz aby znaleźć optymalne dopasowanie
 */

import { riemannZeta, complexAbs, H_BAR } from './bramaUnificationEngine';

// Długość referencyjnego mtDNA (rCRS)
export const R_CRS_MTDNA_LENGTH = 16569;

// Domyślne pozycje 18 Bram DNA w mtDNA rCRS
export const DEFAULT_GATE_POSITIONS = [
  1, 740, 951, 1227, 2996, 3424, 4166, 4832, 6393,
  7756, 8415, 10059, 11200, 11336, 11915, 13703, 14784, 16179
];

export interface ScanResult {
  optimalFreq: number;
  minZetaValue: number;
  success: boolean;
  scanRange: { min: number; max: number };
  iterations: number;
}

export interface TunedAnalysisResult {
  isAligned: boolean;
  distanceToZero: number;
  coherence: number;
  energy: number;
  gateIndex: number;
}

/**
 * Skanuje zakres częstotliwości szukając minimum średniej |ζ(s)| dla WSZYSTKICH pozycji
 * "Rezonans Hybrydowy" - agreguje wyniki z całego zestawu bram
 */
export const findOptimalResonance = (
  gatcaPositions: number[] = DEFAULT_GATE_POSITIONS,
  options: {
    minFreq?: number;
    maxFreq?: number;
    step?: number;
  } = {}
): ScanResult => {
  const {
    minFreq = 717.5,
    maxFreq = 718.5,
    step = 0.001,
  } = options;

  let bestFreq = 718.0;
  let minAvgZeta = Infinity;
  let iterations = 0;

  // Używamy wszystkich pozycji, nie tylko pierwszej
  const positions = gatcaPositions.length > 0 ? gatcaPositions : DEFAULT_GATE_POSITIONS;

  for (let f = minFreq; f <= maxFreq; f += step) {
    iterations++;
    
    // Oblicz średnią |ζ(s)| dla WSZYSTKICH pozycji przy tej częstotliwości
    let totalZeta = 0;
    for (const position of positions) {
      const t = position * f; // t = position * freq (uproszczone, H_BAR się skraca)
      const s = { re: 0.5, im: t };
      const zetaValue = riemannZeta(s, 15); // Niższa precyzja dla szybkości przy wielu pozycjach
      totalZeta += complexAbs(zetaValue);
    }
    
    const avgZeta = totalZeta / positions.length;

    if (avgZeta < minAvgZeta) {
      minAvgZeta = avgZeta;
      bestFreq = f;
    }
  }

  return {
    optimalFreq: bestFreq,
    minZetaValue: minAvgZeta,
    success: minAvgZeta < 0.5, // Łagodniejszy próg dla średniej
    scanRange: { min: minFreq, max: maxFreq },
    iterations,
  };
};

/**
 * Precyzyjne skanowanie w dwóch fazach:
 * 1. Grube skanowanie (krok 0.01)
 * 2. Dokładne skanowanie wokół najlepszego wyniku (krok 0.0001)
 */
export const findOptimalResonancePrecise = (
  gatcaPositions: number[] = DEFAULT_GATE_POSITIONS
): ScanResult => {
  // Faza 1: Grube skanowanie (wszystkie pozycje)
  const coarseResult = findOptimalResonance(gatcaPositions, {
    minFreq: 717.0,
    maxFreq: 719.0,
    step: 0.01,
  });

  // Faza 2: Precyzyjne skanowanie wokół najlepszego wyniku
  const fineResult = findOptimalResonance(gatcaPositions, {
    minFreq: coarseResult.optimalFreq - 0.05,
    maxFreq: coarseResult.optimalFreq + 0.05,
    step: 0.0001,
  });

  return {
    ...fineResult,
    iterations: coarseResult.iterations + fineResult.iterations,
  };
};

/**
 * Analizuje punkt w czasie z dostrojoną częstotliwością
 */
export const analyzeAtTimeWithFreq = (
  time: number,
  freq: number,
  gatePositions: number[] = DEFAULT_GATE_POSITIONS
): TunedAnalysisResult => {
  // Określ aktualną bramę na podstawie czasu
  const gateDuration = 7.2; // ~7.2s na bramę w symfonii
  const gateIndex = Math.min(
    Math.floor(time / gateDuration),
    gatePositions.length - 1
  );
  
  // Energia z dostrojoną częstotliwością
  const energy = time * freq * H_BAR;
  const t = energy / H_BAR;
  
  // Obliczenie ζ(1/2 + it)
  const s = { re: 0.5, im: t };
  const zetaValue = riemannZeta(s, 25);
  const magnitude = complexAbs(zetaValue);

  return {
    isAligned: magnitude < 0.1,
    distanceToZero: magnitude,
    coherence: Math.max(0, Math.min(1, 1 - magnitude / 15)), // Skalowanie 0-1
    energy,
    gateIndex: gateIndex + 1, // Bramy numerowane od 1
  };
};

/**
 * Pełna analiza wszystkich 18 Bram z dostrojoną częstotliwością
 */
export const analyzeAllGatesWithFreq = (
  freq: number,
  gatePositions: number[] = DEFAULT_GATE_POSITIONS
): TunedAnalysisResult[] => {
  return gatePositions.map((position, index) => {
    const energy = position * freq * H_BAR;
    const t = energy / H_BAR;
    
    const s = { re: 0.5, im: t };
    const zetaValue = riemannZeta(s, 30);
    const magnitude = complexAbs(zetaValue);

    return {
      isAligned: magnitude < 0.1,
      distanceToZero: magnitude,
      coherence: Math.max(0, Math.min(1, 1 - magnitude / 15)),
      energy,
      gateIndex: index + 1,
    };
  });
};
