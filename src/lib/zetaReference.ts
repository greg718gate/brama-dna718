// Zeta-Core reference DSP library — pure functions used by tests.
// Mirrors the math contract of supabase/functions/zeta-analyze/index.ts
// so we can validate engine behaviour on synthetic signals without a live backend.

export type HealthStatus = "HEALTHY" | "WATCH" | "DEGRADED" | "CRITICAL";

export function mean(a: ArrayLike<number>): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i];
  return s / Math.max(1, a.length);
}

export function std(a: ArrayLike<number>): number {
  const m = mean(a);
  let s = 0;
  for (let i = 0; i < a.length; i++) s += (a[i] - m) ** 2;
  return Math.sqrt(s / Math.max(1, a.length));
}

export function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

export function statusFrom(tf: number, mc: number, coherence: number): HealthStatus {
  let s: HealthStatus;
  if (tf < 0.35) s = "HEALTHY";
  else if (tf < 0.55) s = "WATCH";
  else if (tf < 0.75) s = "DEGRADED";
  else s = "CRITICAL";
  if (mc > 0.45 && s === "HEALTHY") s = "WATCH";
  if (mc > 0.65 && s === "WATCH") s = "DEGRADED";
  if (mc > 0.82 || coherence < 0.35) s = "CRITICAL";
  return s;
}

/** Phase coherence against a reference sinusoid at f0. Returns 0..1. */
export function phaseCoherence(signal: ArrayLike<number>, sampleRate: number, f0: number): number {
  const n = signal.length;
  let sumR = 0, sumI = 0, mag = 0;
  const w = 2 * Math.PI * f0 / sampleRate;
  for (let i = 0; i < n; i++) {
    const s = signal[i];
    sumR += s * Math.cos(w * i);
    sumI += s * Math.sin(w * i);
    mag += Math.abs(s);
  }
  const amp = Math.sqrt(sumR * sumR + sumI * sumI) / n;
  const norm = mag / n;
  if (norm < 1e-12) return 0;
  return clamp01(amp / norm);
}

/** Generate a pure sinusoid. */
export function sinewave(n: number, sampleRate: number, freq: number, amp = 1): Float64Array {
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) out[i] = amp * Math.sin(2 * Math.PI * freq * i / sampleRate);
  return out;
}

/** Generate white noise via a small deterministic LCG (test-repeatable). */
export function noise(n: number, seed = 1): Float64Array {
  const out = new Float64Array(n);
  let s = seed >>> 0;
  for (let i = 0; i < n; i++) {
    s = (s * 1664525 + 1013904223) >>> 0;
    out[i] = (s / 4294967295) * 2 - 1;
  }
  return out;
}

export function add(a: Float64Array, b: Float64Array, scale = 1): Float64Array {
  const out = new Float64Array(a.length);
  for (let i = 0; i < a.length; i++) out[i] = a[i] + scale * b[i];
  return out;
}

export type ZetaEngineVersion = "v1.0" | "v1.1" | "v2.0";
export type ZetaAxisSamples = { x: number[]; y: number[]; z: number[] };
export type ZetaAnalysisInput = {
  samples: number[];
  axes?: ZetaAxisSamples;
  sampleRate: number;
  targetFreq?: number;
  filename: string;
  engineVersion: ZetaEngineVersion;
};

function nextPow2(n: number) { let p = 1; while (p < n) p <<= 1; return p; }

function magSpectrum(segment: Float64Array): Float64Array {
  const n = nextPow2(segment.length);
  const re = new Float64Array(n);
  const im = new Float64Array(n);
  const dc = mean(segment);
  for (let i = 0; i < segment.length; i += 1) {
    const window = segment.length === 1 ? 1 : 0.5 * (1 - Math.cos((2 * Math.PI * i) / (segment.length - 1)));
    re[i] = (segment[i] - dc) * window;
  }
  for (let i = 1, j = 0; i < n; i += 1) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const angle = (-2 * Math.PI) / len;
    const stepRe = Math.cos(angle);
    const stepIm = Math.sin(angle);
    for (let i = 0; i < n; i += len) {
      let curRe = 1;
      let curIm = 0;
      for (let k = 0; k < len / 2; k += 1) {
        const aRe = re[i + k], aIm = im[i + k];
        const bRe = re[i + k + len / 2] * curRe - im[i + k + len / 2] * curIm;
        const bIm = re[i + k + len / 2] * curIm + im[i + k + len / 2] * curRe;
        re[i + k] = aRe + bRe; im[i + k] = aIm + bIm;
        re[i + k + len / 2] = aRe - bRe; im[i + k + len / 2] = aIm - bIm;
        const nextRe = curRe * stepRe - curIm * stepIm;
        curIm = curRe * stepIm + curIm * stepRe; curRe = nextRe;
      }
    }
  }
  return Float64Array.from({ length: n >> 1 }, (_, i) => Math.hypot(re[i], im[i]));
}

function peakBin(mag: Float64Array, sampleRate: number, targetFreq?: number, ratio = 0.25) {
  const n = mag.length * 2;
  let from = Math.max(1, Math.round((5 * n) / sampleRate));
  let to = mag.length;
  if (targetFreq && targetFreq > 0) {
    const center = Math.round((targetFreq * n) / sampleRate);
    from = Math.max(1, Math.round(center * (1 - ratio)));
    to = Math.min(mag.length, Math.round(center * (1 + ratio)) + 1);
  }
  let best = Math.min(from, to - 1);
  for (let i = best + 1; i < to; i += 1) if (mag[i] > mag[best]) best = i;
  return best;
}

function spectralEntropy(mag: Float64Array) {
  let total = 0;
  for (let i = 1; i < mag.length; i += 1) total += mag[i];
  if (total <= 0) return 1;
  let entropy = 0;
  for (let i = 1; i < mag.length; i += 1) { const p = mag[i] / total; if (p > 0) entropy -= p * Math.log2(p); }
  return clamp01(entropy / Math.log2(Math.max(2, mag.length - 1)));
}

function sidebandRatio(mag: Float64Array, bin: number) {
  let side = 0;
  for (let i = Math.max(1, Math.round(bin * 0.82)); i < Math.max(1, Math.round(bin * 0.95)); i += 1) side += mag[i];
  for (let i = Math.min(mag.length, Math.round(bin * 1.05)); i < Math.min(mag.length, Math.round(bin * 1.18)); i += 1) side += mag[i];
  return clamp01(side / ((mag[Math.min(mag.length - 1, Math.max(1, bin))] || 1e-9) * 16));
}

function summarise(signal: Float64Array, sampleRate: number, targetFreq: number | undefined, windows: number, ratio: number) {
  const length = Math.floor(signal.length / windows);
  if (length < 64) throw new Error(`Signal too short for ${windows} windows`);
  const frequencies: number[] = [];
  let spectrum: Float64Array | null = null;
  for (let w = 0; w < windows; w += 1) {
    const mag = magSpectrum(signal.subarray(w * length, (w + 1) * length));
    if (!spectrum) spectrum = new Float64Array(mag.length);
    for (let i = 0; i < mag.length; i += 1) spectrum[i] += mag[i];
    frequencies.push((peakBin(mag, sampleRate, targetFreq, ratio) * sampleRate) / (mag.length * 2));
  }
  const frequency = mean(frequencies);
  const coherence = clamp01(1 - (std(frequencies) / Math.max(1e-6, frequency)) * 5);
  const friction = spectralEntropy(spectrum!);
  const bin = Math.round((frequency * spectrum!.length * 2) / sampleRate);
  return { frequencies, spectrum: spectrum!, frequency, coherence, friction, condensation: sidebandRatio(spectrum!, bin) };
}

function chartSpectrum(spectrum: Float64Array, sampleRate: number) {
  const step = Math.max(1, Math.floor(spectrum.length / 256));
  const values: number[] = [];
  for (let i = 0; i < spectrum.length; i += step) values.push(spectrum[i]);
  const max = Math.max(...values, 1e-9);
  return { spectrum: values.map((value) => value / max), freqAxis: values.map((_, i) => (i * step * sampleRate) / (spectrum.length * 2)) };
}

export function analyzeZetaSignal(input: ZetaAnalysisInput) {
  const started = performance.now();
  if (!Number.isFinite(input.sampleRate) || input.sampleRate < 100) throw new Error("Invalid sample rate");
  const mono = Float64Array.from(input.samples);
  if (mono.length < 512 || mono.some((value) => !Number.isFinite(value))) throw new Error("Signal must contain at least 512 finite samples");
  const windows = input.engineVersion === "v1.0" ? 4 : 8;
  const ratio = input.engineVersion === "v1.0" ? 0.12 : input.engineVersion === "v2.0" ? 0.3 : 0.25;
  const axisInputs = input.engineVersion === "v2.0" && input.axes
    ? [Float64Array.from(input.axes.x), Float64Array.from(input.axes.y), Float64Array.from(input.axes.z)]
    : [mono, mono, mono];
  const summaries = axisInputs.map((axis) => summarise(axis, input.sampleRate, input.targetFreq, windows, ratio));
  const base = summaries[0];
  const drift = std(base.frequencies) / Math.max(1e-6, mean(base.frequencies));
  const adaptivePenalty = clamp01(drift * 2);
  const spatial = input.engineVersion === "v2.0";
  const coherence = spatial ? clamp01(mean(summaries.map((item) => item.coherence))) : input.engineVersion === "v1.1" ? clamp01(base.coherence * 0.96 + (1 - adaptivePenalty) * 0.04) : base.coherence;
  const friction = spatial ? clamp01(Math.hypot(...summaries.map((item) => item.friction)) / Math.sqrt(3)) : input.engineVersion === "v1.1" ? clamp01(base.friction * 0.9 + adaptivePenalty * 0.1) : base.friction;
  const condensation = spatial ? clamp01(Math.hypot(...summaries.map((item) => item.condensation)) / Math.sqrt(3)) : base.condensation;
  const frequency = spatial ? mean(summaries.map((item) => item.frequency)) : base.frequency;
  const chart = chartSpectrum(spatial ? Float64Array.from(base.spectrum, (_, i) => mean(summaries.map((item) => item.spectrum[i]))) : base.spectrum, input.sampleRate);
  return {
    phaseCoherence: coherence, topologicalFriction: friction, faultCondensation: condensation,
    trackedFrequencyHz: frequency, sampleRateHz: input.sampleRate, nSamples: mono.length,
    status: statusFrom(friction, condensation, coherence), ...chart,
    latencyMs: performance.now() - started, filename: input.filename, timestampUtc: new Date().toISOString(),
    engine: `ZETA-CORE ${input.engineVersion} ${input.engineVersion === "v1.0" ? "Standard Core" : input.engineVersion === "v1.1" ? "Adaptive Engine" : "Spatial Multi-Axis"}`,
    engineVersion: input.engineVersion,
    spatial: spatial ? {
      axisCoherence: { x: summaries[0].coherence, y: summaries[1].coherence, z: summaries[2].coherence },
      axisTf: { x: summaries[0].friction, y: summaries[1].friction, z: summaries[2].friction },
      axisMc: { x: summaries[0].condensation, y: summaries[1].condensation, z: summaries[2].condensation },
      axisFrequencyHz: { x: summaries[0].frequency, y: summaries[1].frequency, z: summaries[2].frequency },
      globalSpatialFriction: friction,
    } : null,
  };
}
