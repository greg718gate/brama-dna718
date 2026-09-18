import {
  CARRIER_FREQ,
  GAMMA,
  GATCA_POSITIONS,
  H_BAR,
  MOON_MOD_FREQ,
  MTDNA_LENGTH,
  PHI,
  SCHUMANN_FREQ,
  type GATCASequence,
  type UnificationResult,
} from "@/lib/bramaUnificationEngine";
import { runBramaUnification } from "@/lib/bramaUnificationEngine";

export type ComplexValue = { re: number; im: number };
export type IntentionVectorInput = { amplitude: number; duration: number; frequency: number; samplesPerSecond?: number };
export type IntentionVectorOutput = { value: number; chart: Array<{ t: number; psi: number }> };
export type RrSpectrumOutput = { peakFrequency: number; phaseError: number; coherence: number; beats: number; windowSeconds: number; bpm: number | null } | null;
export type HamiltonianEvolutionOutput = { matrix: number[][]; probabilities: number[]; psi: ComplexValue[] };

export function computeIntentionVector(input: IntentionVectorInput): IntentionVectorOutput {
  const samplesPerSecond = input.samplesPerSecond ?? 200;
  const points = Math.max(1, Math.round(input.duration * samplesPerSecond));
  const dt = input.duration / points;
  const chart: Array<{ t: number; psi: number }> = [];
  let integral = 0;
  for (let i = 0; i <= points; i += 1) {
    const t = (i / points) * input.duration;
    const psi = input.amplitude * Math.cos(input.frequency * t) * Math.cos(SCHUMANN_FREQ * t) * Math.sin(MOON_MOD_FREQ * t) * PHI ** 2;
    integral += (i === 0 || i === points ? 0.5 : 1) * psi;
    if (i % 2 === 0) chart.push({ t: Math.round(t * 1000) / 1000, psi: Math.round(psi * 10000) / 10000 });
  }
  return { value: Math.round(integral * dt * 10000) / 10000, chart };
}

export function computeWavefunction(t: number, x: number, energy = CARRIER_FREQ * H_BAR, terms = 50) {
  let zr = 0;
  let zi = 0;
  const zetaT = energy / H_BAR;
  for (let n = 1; n <= terms; n += 1) {
    const magnitude = n ** -0.5;
    const angle = -zetaT * Math.log(n);
    zr += magnitude * Math.cos(angle);
    zi += magnitude * Math.sin(angle);
  }
  const carrierAngle = CARRIER_FREQ * t - (2 * Math.PI / CARRIER_FREQ) * x;
  const cr = Math.cos(carrierAngle);
  const ci = Math.sin(carrierAngle);
  const re = (cr * zr - ci * zi) * GAMMA;
  const im = (cr * zi + ci * zr) * GAMMA;
  return { re, im, magnitude: Math.hypot(re, im), phase: Math.atan2(im, re) };
}

export function buildHamiltonianAndEvolve(time: number): HamiltonianEvolutionOutput {
  const size = GATCA_POSITIONS.length;
  const matrix = Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => {
      if (row === col) return CARRIER_FREQ * (1 + GATCA_POSITIONS[row] / MTDNA_LENGTH);
      const distance = Math.abs(row - col);
      return GAMMA ** distance * Math.cos((GATCA_POSITIONS[row] - GATCA_POSITIONS[col]) / MTDNA_LENGTH * Math.PI);
    }),
  );
  const amplitude = 1 / Math.sqrt(size);
  const psi = matrix.map((row) => {
    let re = 0;
    let im = 0;
    row.forEach((energy, col) => {
      const phase = -energy * time / CARRIER_FREQ;
      re += amplitude * Math.cos(phase + col * PHI);
      im += amplitude * Math.sin(phase + col * PHI);
    });
    return { re: re / size, im: im / size };
  });
  const raw = psi.map((value) => value.re ** 2 + value.im ** 2);
  const norm = raw.reduce((sum, value) => sum + value, 0) || 1;
  return { matrix, psi, probabilities: raw.map((value) => value / norm) };
}

export function analyzeRrSpectrum(rr: number[], breathDuration: number): RrSpectrumOutput {
  const times: number[] = [];
  let elapsed = 0;
  for (const value of rr) { elapsed += value; times.push(elapsed); }
  if (elapsed < 40 || times.length < 2) return null;
  const series: number[] = [];
  for (let t = times[0]; t < times[times.length - 1]; t += 0.25) {
    let j = 1;
    while (j < times.length - 1 && times[j] < t) j += 1;
    const span = times[j] - times[j - 1];
    const weight = span === 0 ? 0 : (t - times[j - 1]) / span;
    series.push(rr[j - 1] + weight * (rr[j] - rr[j - 1]));
  }
  if (series.length < 32) return null;
  const mean = series.reduce((sum, value) => sum + value, 0) / series.length;
  const signal = series.map((value, index) => (value - mean) * (0.5 - 0.5 * Math.cos((2 * Math.PI * index) / (series.length - 1))));
  let peakFrequency = 0;
  let peakPower = -1;
  let totalPower = 0;
  const spectrum: Array<{ frequency: number; power: number }> = [];
  for (let k = 1; k <= Math.floor(signal.length / 2); k += 1) {
    let re = 0;
    let im = 0;
    for (let i = 0; i < signal.length; i += 1) {
      const angle = (-2 * Math.PI * k * i) / signal.length;
      re += signal[i] * Math.cos(angle);
      im += signal[i] * Math.sin(angle);
    }
    const frequency = (k * 4) / signal.length;
    const power = (re * re + im * im) / signal.length;
    spectrum.push({ frequency, power });
    if (frequency <= 0.4) totalPower += power;
    if (frequency >= 0.04 && frequency <= 0.15 && power > peakPower) { peakPower = power; peakFrequency = frequency; }
  }
  if (peakFrequency === 0) return null;
  const narrowPower = spectrum.reduce((sum, bin) => bin.frequency >= peakFrequency - 0.015 && bin.frequency <= peakFrequency + 0.015 ? sum + bin.power : sum, 0);
  return {
    peakFrequency,
    phaseError: 2 * Math.PI * (peakFrequency - 1 / (breathDuration * 2)),
    coherence: totalPower > 0 ? Math.min(1, (narrowPower / totalPower) * 1.4) : 0,
    beats: rr.length,
    windowSeconds: elapsed,
    bpm: rr.length ? Math.round(60 / (elapsed / rr.length)) : null,
  };
}

export function computeUnification(sequences: GATCASequence[], t: number, x: number): UnificationResult {
  return runBramaUnification(sequences, t, x);
}
