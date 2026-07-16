import { describe, it, expect } from "vitest";
import {
  mean, std, clamp01, statusFrom,
  phaseCoherence, sinewave, noise, add,
} from "./zetaReference";

describe("Zeta-Core reference engine", () => {
  describe("basic helpers", () => {
    it("mean/std/clamp behave", () => {
      expect(mean([1, 2, 3])).toBeCloseTo(2, 12);
      expect(std([1, 1, 1])).toBeCloseTo(0, 12);
      expect(clamp01(-1)).toBe(0);
      expect(clamp01(2)).toBe(1);
      expect(clamp01(0.5)).toBe(0.5);
    });
  });

  describe("status thresholds (ADR-004)", () => {
    it("classifies HEALTHY when everything is low", () => {
      expect(statusFrom(0.1, 0.1, 0.9)).toBe("HEALTHY");
    });
    it("WATCH triggers between 0.35 and 0.55", () => {
      expect(statusFrom(0.45, 0.1, 0.9)).toBe("WATCH");
    });
    it("DEGRADED triggers 0.55–0.75", () => {
      expect(statusFrom(0.65, 0.1, 0.9)).toBe("DEGRADED");
    });
    it("CRITICAL triggers above 0.75", () => {
      expect(statusFrom(0.85, 0.1, 0.9)).toBe("CRITICAL");
    });
    it("low coherence collapses to CRITICAL", () => {
      expect(statusFrom(0.1, 0.1, 0.1)).toBe("CRITICAL");
    });
    it("high Mc escalates severity", () => {
      expect(statusFrom(0.1, 0.5, 0.9)).toBe("WATCH");
      expect(statusFrom(0.85, 0.9, 0.9)).toBe("CRITICAL");
    });
  });

  describe("phase coherence — v1.0 Standard Core contract", () => {
    it("pure sinusoid at target freq yields near-unity coherence", () => {
      const s = sinewave(4096, 8000, 50);
      const c = phaseCoherence(s, 8000, 50);
      expect(c).toBeGreaterThan(0.7);
    });

    it("white noise at target freq yields near-zero coherence", () => {
      const n = noise(4096, 42);
      const c = phaseCoherence(n, 8000, 50);
      expect(c).toBeLessThan(0.1);
    });

    it("healthy machine (tone + small noise) is HEALTHY-band", () => {
      const s = add(sinewave(8192, 8000, 50), noise(8192, 7), 0.02);
      const c = phaseCoherence(s, 8000, 50);
      // With tiny noise, coherence should still be strong (> 0.6)
      expect(c).toBeGreaterThan(0.6);
    });

    it("degraded machine (tone + heavy sidebands) loses coherence", () => {
      // Simulate a bearing fault: 50 Hz carrier + 47 Hz + 53 Hz sidebands + noise
      const carrier = sinewave(8192, 8000, 50, 1.0);
      const sbLo = sinewave(8192, 8000, 47, 0.9);
      const sbHi = sinewave(8192, 8000, 53, 0.9);
      const nz = noise(8192, 99);
      const damaged = new Float64Array(8192);
      for (let i = 0; i < 8192; i++) damaged[i] = carrier[i] + sbLo[i] + sbHi[i] + 0.3 * nz[i];
      const c = phaseCoherence(damaged, 8000, 50);
      // Sidebands drag coherence down vs a pure tone
      expect(c).toBeLessThan(0.6);
    });
  });

  describe("v2.0 Spatial — per-axis independence", () => {
    it("computes coherence independently per axis", () => {
      const x = sinewave(4096, 8000, 50);          // clean X
      const y = noise(4096, 13);                    // noisy Y
      const z = sinewave(4096, 8000, 50, 0.5);      // clean Z
      const cx = phaseCoherence(x, 8000, 50);
      const cy = phaseCoherence(y, 8000, 50);
      const cz = phaseCoherence(z, 8000, 50);
      expect(cx).toBeGreaterThan(cy);
      expect(cz).toBeGreaterThan(cy);
      // Global spatial friction (norm of per-axis Tf ~ 1 - coherence)
      const tfx = 1 - cx, tfy = 1 - cy, tfz = 1 - cz;
      const global = Math.sqrt((tfx * tfx + tfy * tfy + tfz * tfz) / 3);
      expect(global).toBeGreaterThan(0);
      expect(global).toBeLessThanOrEqual(1);
    });
  });
});
