// Zeta-Core Industrial Diagnostic Engine — server-side runtime
// Engines: v1.0 Standard, v1.1 Adaptive, v2.0 Spatial Multi-Axis

type EngineVersion = "v1.0" | "v1.1" | "v2.0";
type HealthStatus = "HEALTHY" | "WATCH" | "DEGRADED" | "CRITICAL";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-zeta-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ACCESS_CODE = "ZETA-2026";

// ---------- basic helpers ----------
function ok(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function bad(error: string, status = 400) {
  return ok({ error }, status);
}

function finiteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function assertSignal(samples: unknown, field: string): Float64Array {
  if (!Array.isArray(samples) || samples.length < 512) {
    throw new Error(`${field} must be an array of at least 512 numbers`);
  }
  const out = new Float64Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    const v = samples[i];
    if (!finiteNumber(v)) throw new Error(`${field}[${i}] is not a finite number`);
    out[i] = v;
  }
  return out;
}

function mean(a: ArrayLike<number>) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i];
  return s / Math.max(1, a.length);
}

function std(a: ArrayLike<number>) {
  const m = mean(a);
  let s = 0;
  for (let i = 0; i < a.length; i++) s += (a[i] - m) ** 2;
  return Math.sqrt(s / Math.max(1, a.length));
}

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function nextPow2(n: number) {
  let p = 1;
  while (p < n) p <<= 1;
  return p;
}

function statusFrom(tf: number, mc: number, coherence: number): HealthStatus {
  let status: HealthStatus;
  if (tf < 0.35) status = "HEALTHY";
  else if (tf < 0.55) status = "WATCH";
  else if (tf < 0.75) status = "DEGRADED";
  else status = "CRITICAL";

  if (mc > 0.45 && status === "HEALTHY") status = "WATCH";
  if (mc > 0.65 && status === "WATCH") status = "DEGRADED";
  if (mc > 0.82 || coherence < 0.35) status = "CRITICAL";
  return status;
}

// ---------- FFT / spectrum ----------
function fftRadix2(re: Float64Array, im: Float64Array) {
  const n = re.length;
  if (n <= 1) return;

  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      const tr = re[i]; re[i] = re[j]; re[j] = tr;
      const ti = im[i]; im[i] = im[j]; im[j] = ti;
    }
  }

  for (let len = 2; len <= n; len <<= 1) {
    const ang = -2 * Math.PI / len;
    const wRe = Math.cos(ang);
    const wIm = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let curRe = 1;
      let curIm = 0;
      for (let k = 0; k < len / 2; k++) {
        const aRe = re[i + k], aIm = im[i + k];
        const bRe = re[i + k + len / 2] * curRe - im[i + k + len / 2] * curIm;
        const bIm = re[i + k + len / 2] * curIm + im[i + k + len / 2] * curRe;
        re[i + k] = aRe + bRe;
        im[i + k] = aIm + bIm;
        re[i + k + len / 2] = aRe - bRe;
        im[i + k + len / 2] = aIm - bIm;
        const nRe = curRe * wRe - curIm * wIm;
        curIm = curRe * wIm + curIm * wRe;
        curRe = nRe;
      }
    }
  }
}

function hann(n: number) {
  const w = new Float64Array(n);
  if (n === 1) {
    w[0] = 1;
    return w;
  }
  for (let i = 0; i < n; i++) w[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (n - 1)));
  return w;
}

function magSpectrum(segment: Float64Array): Float64Array {
  const n = nextPow2(segment.length);
  const re = new Float64Array(n);
  const im = new Float64Array(n);
  const dc = mean(segment);
  const win = hann(segment.length);
  for (let i = 0; i < segment.length; i++) re[i] = (segment[i] - dc) * win[i];
  fftRadix2(re, im);
  const half = n >> 1;
  const mag = new Float64Array(half);
  for (let i = 0; i < half; i++) mag[i] = Math.hypot(re[i], im[i]);
  return mag;
}

function argmax(a: Float64Array, from = 1, to = -1) {
  const end = Math.min(a.length, to < 0 ? a.length : to);
  let best = Math.max(1, Math.min(from, end - 1));
  let bv = a[best] ?? 0;
  for (let i = best + 1; i < end; i++) {
    if (a[i] > bv) { bv = a[i]; best = i; }
  }
  return best;
}

function peakBin(mag: Float64Array, sampleRate: number, targetFreq?: number, searchRatio = 0.25) {
  const n = mag.length * 2;
  let lo = Math.max(1, Math.round(5 * n / sampleRate));
  let hi = mag.length;
  if (targetFreq && targetFreq > 0) {
    const c = Math.round(targetFreq * n / sampleRate);
    lo = Math.max(1, Math.round(c * (1 - searchRatio)));
    hi = Math.min(mag.length, Math.round(c * (1 + searchRatio)) + 1);
  }
  return argmax(mag, lo, hi);
}

function spectralEntropy(mag: Float64Array) {
  let total = 0;
  for (let i = 1; i < mag.length; i++) total += mag[i];
  if (total <= 0) return 1;
  let entropy = 0;
  for (let i = 1; i < mag.length; i++) {
    const p = mag[i] / total;
    if (p > 0) entropy -= p * Math.log2(p);
  }
  return clamp01(entropy / Math.log2(Math.max(2, mag.length - 1)));
}

function sidebandRatio(mag: Float64Array, domBin: number) {
  const loA = Math.max(1, Math.round(domBin * 0.82));
  const hiA = Math.max(1, Math.round(domBin * 0.95));
  const loB = Math.min(mag.length, Math.round(domBin * 1.05));
  const hiB = Math.min(mag.length, Math.round(domBin * 1.18));
  let side = 0;
  for (let i = loA; i < hiA; i++) side += mag[i];
  for (let i = loB; i < hiB; i++) side += mag[i];
  const peak = mag[Math.min(mag.length - 1, Math.max(1, domBin))] || 1e-9;
  return clamp01(side / (peak * 16));
}

function chartSpectrum(globalSpectrum: Float64Array, sampleRate: number) {
  const chartLen = 256;
  const step = Math.max(1, Math.floor(globalSpectrum.length / chartLen));
  const spectrum: number[] = [];
  for (let i = 0; i < globalSpectrum.length; i += step) spectrum.push(globalSpectrum[i]);
  const max = Math.max(...spectrum, 1e-9);
  const spectrumNorm = spectrum.map((v) => v / max);
  const fftSize = globalSpectrum.length * 2;
  const freqAxis = spectrumNorm.map((_, i) => (i * step * sampleRate) / fftSize);
  return { spectrum: spectrumNorm, freqAxis };
}

function summariseCommon(
  samples: Float64Array,
  sampleRate: number,
  targetFreq: number | undefined,
  nWin: number,
  searchRatio: number,
) {
  const winLen = Math.floor(samples.length / nWin);
  if (winLen < 64) throw new Error(`Signal too short for ${nWin} windows`);

  const dominantFreqs: number[] = [];
  let globalSpectrum: Float64Array | null = null;

  for (let w = 0; w < nWin; w++) {
    const seg = samples.subarray(w * winLen, (w + 1) * winLen);
    const mag = magSpectrum(seg);
    if (!globalSpectrum) globalSpectrum = new Float64Array(mag.length);
    for (let i = 0; i < mag.length; i++) globalSpectrum[i] += mag[i];
    const bin = peakBin(mag, sampleRate, targetFreq, searchRatio);
    dominantFreqs.push((bin * sampleRate) / (mag.length * 2));
  }

  const trackedFrequencyHz = mean(dominantFreqs);
  const freqStd = std(dominantFreqs);
  const phaseCoherence = clamp01(1 - (freqStd / Math.max(1e-6, trackedFrequencyHz)) * 5);
  const tf = spectralEntropy(globalSpectrum!);
  const domBin = Math.round(trackedFrequencyHz * (globalSpectrum!.length * 2) / sampleRate);
  const mc = sidebandRatio(globalSpectrum!, domBin);
  return { dominantFreqs, globalSpectrum: globalSpectrum!, trackedFrequencyHz, phaseCoherence, topologicalFriction: tf, faultCondensation: mc };
}

// ---------- Engines ----------
function analyzeV10(samples: Float64Array, sampleRate: number, targetFreq?: number) {
  const common = summariseCommon(samples, sampleRate, targetFreq, 4, 0.12);
  const status = statusFrom(common.topologicalFriction, common.faultCondensation, common.phaseCoherence);
  const chart = chartSpectrum(common.globalSpectrum, sampleRate);
  return {
    phaseCoherence: common.phaseCoherence,
    topologicalFriction: common.topologicalFriction,
    faultCondensation: common.faultCondensation,
    trackedFrequencyHz: common.trackedFrequencyHz,
    sampleRateHz: sampleRate,
    nSamples: samples.length,
    status,
    spectrum: chart.spectrum,
    freqAxis: chart.freqAxis,
    dominantFreqPerWindow: common.dominantFreqs,
    engine: "ZETA-CORE v1.0 Standard Core",
    engineVersion: "v1.0",
    spatial: null,
    timestampUtc: new Date().toISOString(),
  };
}

function analyzeV11(samples: Float64Array, sampleRate: number, targetFreq?: number) {
  const common = summariseCommon(samples, sampleRate, targetFreq, 8, 0.25);
  const drift = std(common.dominantFreqs) / Math.max(1e-6, mean(common.dominantFreqs));
  const adaptivePenalty = clamp01(drift * 2);
  const topologicalFriction = clamp01(common.topologicalFriction * 0.9 + adaptivePenalty * 0.1);
  const phaseCoherence = clamp01(common.phaseCoherence * 0.96 + (1 - adaptivePenalty) * 0.04);
  const status = statusFrom(topologicalFriction, common.faultCondensation, phaseCoherence);
  const chart = chartSpectrum(common.globalSpectrum, sampleRate);
  return {
    phaseCoherence,
    topologicalFriction,
    faultCondensation: common.faultCondensation,
    trackedFrequencyHz: common.trackedFrequencyHz,
    sampleRateHz: sampleRate,
    nSamples: samples.length,
    status,
    spectrum: chart.spectrum,
    freqAxis: chart.freqAxis,
    dominantFreqPerWindow: common.dominantFreqs,
    engine: "ZETA-CORE v1.1 Adaptive Engine",
    engineVersion: "v1.1",
    spatial: null,
    timestampUtc: new Date().toISOString(),
  };
}

function analyzeV20(axes: [Float64Array, Float64Array, Float64Array], sampleRate: number, targetFreq?: number) {
  const perAxis = axes.map((axis) => summariseCommon(axis, sampleRate, targetFreq, 8, 0.3));
  const coherence = perAxis.map((a) => a.phaseCoherence);
  const friction = perAxis.map((a) => a.topologicalFriction);
  const condensation = perAxis.map((a) => a.faultCondensation);
  const freq = perAxis.map((a) => a.trackedFrequencyHz);

  const globalSpatialFriction = clamp01(Math.hypot(...friction) / Math.sqrt(3));
  const phaseCoherence = clamp01(mean(coherence));
  const faultCondensation = clamp01(Math.hypot(...condensation) / Math.sqrt(3));
  const trackedFrequencyHz = mean(freq);
  const status = statusFrom(globalSpatialFriction, faultCondensation, phaseCoherence);

  const merged = new Float64Array(perAxis[0].globalSpectrum.length);
  for (const axis of perAxis) {
    for (let i = 0; i < merged.length; i++) merged[i] += axis.globalSpectrum[i] / 3;
  }
  const chart = chartSpectrum(merged, sampleRate);

  return {
    phaseCoherence,
    topologicalFriction: globalSpatialFriction,
    faultCondensation,
    trackedFrequencyHz,
    sampleRateHz: sampleRate,
    nSamples: axes[0].length,
    status,
    spectrum: chart.spectrum,
    freqAxis: chart.freqAxis,
    dominantFreqPerWindow: perAxis[0].dominantFreqs,
    engine: "ZETA-CORE v2.0 Spatial Multi-Axis",
    engineVersion: "v2.0",
    spatial: {
      axisCoherence: { x: coherence[0], y: coherence[1], z: coherence[2] },
      axisTf: { x: friction[0], y: friction[1], z: friction[2] },
      axisMc: { x: condensation[0], y: condensation[1], z: condensation[2] },
      axisFrequencyHz: { x: freq[0], y: freq[1], z: freq[2] },
      globalSpatialFriction,
    },
    timestampUtc: new Date().toISOString(),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const accessKey = req.headers.get("x-zeta-key");
    if (accessKey !== ACCESS_CODE) return bad("Invalid access code", 401);

    const body = await req.json();
    const { samples, axes, sampleRate, targetFreq, filename } = body;
    const engineVersion: EngineVersion = body.engineVersion === "v1.0" || body.engineVersion === "v2.0" ? body.engineVersion : "v1.1";

    if (!finiteNumber(sampleRate) || sampleRate < 100) return bad("invalid sampleRate", 400);
    if (targetFreq !== undefined && (!finiteNumber(targetFreq) || targetFreq <= 0 || targetFreq >= sampleRate / 2)) {
      return bad("invalid targetFreq", 400);
    }

    const t0 = performance.now();
    let result;

    if (engineVersion === "v2.0") {
      let x: Float64Array;
      let y: Float64Array;
      let z: Float64Array;
      if (axes && Array.isArray(axes.x) && Array.isArray(axes.y) && Array.isArray(axes.z)) {
        x = assertSignal(axes.x, "axes.x");
        y = assertSignal(axes.y, "axes.y");
        z = assertSignal(axes.z, "axes.z");
        const n = Math.min(x.length, y.length, z.length);
        x = x.subarray(0, n); y = y.subarray(0, n); z = z.subarray(0, n);
      } else {
        const mono = assertSignal(samples, "samples");
        x = mono;
        y = mono;
        z = mono;
      }
      result = analyzeV20([x, y, z], sampleRate, targetFreq);
    } else {
      const mono = assertSignal(samples, "samples");
      result = engineVersion === "v1.0"
        ? analyzeV10(mono, sampleRate, targetFreq)
        : analyzeV11(mono, sampleRate, targetFreq);
    }

    const latency = performance.now() - t0;
    return ok({ ...result, latencyMs: latency, filename: filename || "unknown" });
  } catch (e) {
    return bad((e as Error).message, 500);
  }
});