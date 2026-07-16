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
