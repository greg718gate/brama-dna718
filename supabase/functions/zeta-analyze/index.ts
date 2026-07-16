// Zeta-Core Machine Health Diagnostic Engine — server-side
// Input: { samples: number[], sampleRate: number, targetFreq?: number, filename?: string }
// Output: phase coherence, topological friction, fault condensation, tracked freq, status

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-zeta-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ACCESS_CODE = "ZETA-2026";

// ---------- FFT (radix-2, in-place) ----------
function fftRadix2(re: Float64Array, im: Float64Array) {
  const n = re.length;
  if (n <= 1) return;
  // bit-reverse
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = -2 * Math.PI / len;
    const wRe = Math.cos(ang);
    const wIm = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let curRe = 1, curIm = 0;
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

function nextPow2(n: number) {
  let p = 1;
  while (p < n) p <<= 1;
  return p;
}

function hann(n: number) {
  const w = new Float64Array(n);
  for (let i = 0; i < n; i++) w[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (n - 1)));
  return w;
}

// Magnitude spectrum for a windowed segment
function magSpectrum(segment: Float64Array): Float64Array {
  const N = nextPow2(segment.length);
  const re = new Float64Array(N);
  const im = new Float64Array(N);
  const w = hann(segment.length);
  for (let i = 0; i < segment.length; i++) re[i] = segment[i] * w[i];
  fftRadix2(re, im);
  const half = N >> 1;
  const mag = new Float64Array(half);
  for (let i = 0; i < half; i++) mag[i] = Math.hypot(re[i], im[i]);
  return mag;
}

function argmax(a: Float64Array, from = 1, to = -1) {
  const end = to < 0 ? a.length : to;
  let best = from, bv = a[from];
  for (let i = from + 1; i < end; i++) if (a[i] > bv) { bv = a[i]; best = i; }
  return best;
}

function mean(a: number[]) { return a.reduce((s, x) => s + x, 0) / a.length; }
function std(a: number[]) {
  const m = mean(a);
  return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / a.length);
}

function analyze(samples: Float64Array, sampleRate: number, targetFreq?: number) {
  // Normalize (remove DC)
  const dc = samples.reduce((s, x) => s + x, 0) / samples.length;
  for (let i = 0; i < samples.length; i++) samples[i] -= dc;

  // Split into 8 non-overlapping windows
  const nWin = 8;
  const winLen = Math.floor(samples.length / nWin);
  if (winLen < 64) throw new Error("Signal too short (need at least 512 samples)");

  const dominantFreqs: number[] = [];
  const dominantAmps: number[] = [];
  let globalSpectrum: Float64Array | null = null;

  for (let w = 0; w < nWin; w++) {
    const seg = samples.subarray(w * winLen, (w + 1) * winLen);
    const mag = magSpectrum(new Float64Array(seg));
    if (!globalSpectrum) globalSpectrum = new Float64Array(mag.length);
    for (let i = 0; i < mag.length; i++) globalSpectrum[i] += mag[i];
    const N = mag.length * 2;
    // If targetFreq given, search ±20% of it; else full band > 5 Hz
    let lo = 1, hi = mag.length;
    if (targetFreq && targetFreq > 0) {
      const centerBin = Math.round(targetFreq * N / sampleRate);
      lo = Math.max(1, Math.round(centerBin * 0.8));
      hi = Math.min(mag.length, Math.round(centerBin * 1.2));
    } else {
      lo = Math.max(1, Math.round(5 * N / sampleRate));
    }
    const peakBin = argmax(mag, lo, hi);
    const peakFreq = peakBin * sampleRate / N;
    dominantFreqs.push(peakFreq);
    dominantAmps.push(mag[peakBin]);
  }

  // Phase coherence: stability of dominant frequency across windows.
  // High if freq barely wanders. 1 - normalized_std, clamped.
  const meanFreq = mean(dominantFreqs);
  const freqStd = std(dominantFreqs);
  const phaseCoherence = Math.max(0, Math.min(1, 1 - (freqStd / Math.max(1e-6, meanFreq)) * 5));

  // Topological friction: normalized spectral entropy of the global spectrum.
  // Pure tone -> entropy ~0 -> friction ~0. Broadband noise -> entropy high -> friction high.
  let total = 0;
  for (let i = 0; i < globalSpectrum!.length; i++) total += globalSpectrum![i];
  let entropy = 0;
  for (let i = 0; i < globalSpectrum!.length; i++) {
    const p = globalSpectrum![i] / (total || 1);
    if (p > 0) entropy -= p * Math.log2(p);
  }
  const maxEntropy = Math.log2(globalSpectrum!.length);
  const topologicalFriction = Math.max(0, Math.min(1, entropy / maxEntropy));

  // Fault condensation: energy in sidebands (±5–15% of dominant freq) vs dominant peak energy.
  const N2 = globalSpectrum!.length * 2;
  const domBin = Math.round(meanFreq * N2 / sampleRate);
  const sbLo1 = Math.max(1, Math.round(domBin * 1.05));
  const sbHi1 = Math.min(globalSpectrum!.length, Math.round(domBin * 1.15));
  const sbLo2 = Math.max(1, Math.round(domBin * 0.85));
  const sbHi2 = Math.min(globalSpectrum!.length, Math.round(domBin * 0.95));
  let sbEnergy = 0;
  for (let i = sbLo1; i < sbHi1; i++) sbEnergy += globalSpectrum![i];
  for (let i = sbLo2; i < sbHi2; i++) sbEnergy += globalSpectrum![i];
  const peakEnergy = globalSpectrum![domBin] || 1e-6;
  const faultCondensation = Math.max(0, Math.min(1, sbEnergy / (peakEnergy * 20)));

  // Status classification
  const tf = topologicalFriction;
  let status: "HEALTHY" | "WATCH" | "DEGRADED" | "CRITICAL";
  if (tf < 0.35) status = "HEALTHY";
  else if (tf < 0.55) status = "WATCH";
  else if (tf < 0.75) status = "DEGRADED";
  else status = "CRITICAL";

  // Bump severity if fault condensation is high (sidebands = bearing/gear defect signature)
  if (faultCondensation > 0.6 && status === "HEALTHY") status = "WATCH";
  if (faultCondensation > 0.8 && status !== "CRITICAL") status = "DEGRADED";

  // Downsample spectrum for chart (256 points)
  const chartLen = 256;
  const chartSpectrum: number[] = [];
  const step = Math.max(1, Math.floor(globalSpectrum!.length / chartLen));
  for (let i = 0; i < globalSpectrum!.length; i += step) {
    chartSpectrum.push(globalSpectrum![i]);
  }
  const chartMax = Math.max(...chartSpectrum, 1e-6);
  const spectrumNorm = chartSpectrum.map((v) => v / chartMax);
  const freqAxis = spectrumNorm.map((_, i) => (i * step * sampleRate) / N2);

  return {
    phaseCoherence,
    topologicalFriction,
    faultCondensation,
    trackedFrequencyHz: meanFreq,
    sampleRateHz: sampleRate,
    nSamples: samples.length,
    status,
    spectrum: spectrumNorm,
    freqAxis,
    dominantFreqPerWindow: dominantFreqs,
    timestampUtc: new Date().toISOString(),
    engine: "ZETA-CORE v1.1 (server-side adaptive)",
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const accessKey = req.headers.get("x-zeta-key");
    if (accessKey !== ACCESS_CODE) {
      return new Response(JSON.stringify({ error: "Invalid access code" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { samples, sampleRate, targetFreq, filename } = body;

    if (!Array.isArray(samples) || samples.length < 512) {
      return new Response(JSON.stringify({ error: "samples must be an array of at least 512 numbers" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!sampleRate || sampleRate < 100) {
      return new Response(JSON.stringify({ error: "invalid sampleRate" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const t0 = performance.now();
    const arr = new Float64Array(samples);
    const result = analyze(arr, sampleRate, targetFreq);
    const latency = performance.now() - t0;

    return new Response(JSON.stringify({ ...result, latencyMs: latency, filename: filename || "unknown" }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
