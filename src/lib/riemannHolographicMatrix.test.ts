import { describe, expect, it } from "vitest";
import { analyzeGateHarmonics, computeGateResonator } from "./riemannHolographicMatrix";
import { CARRIER_FREQ } from "./gatca718Constants";

describe("riemannHolographicMatrix", () => {
  it("returns 17 resonances per gate with bounded phase", () => {
    const rs = analyzeGateHarmonics(2);
    expect(rs).toHaveLength(17);
    rs.forEach((r) => {
      expect(Math.abs(r.phaseShift)).toBeLessThanOrEqual(Math.PI);
      expect(r.coherence).toBeGreaterThanOrEqual(0);
      expect(r.coherence).toBeLessThanOrEqual(100);
    });
  });

  it("maps mean phase vector to a carrier close to f_exact", () => {
    const res = computeGateResonator(2);
    expect(res.critical.every((r) => r.coherence > 98)).toBe(true);
    expect(Number.isFinite(res.fTuning)).toBe(true);
    expect(Math.abs(res.fTuning - CARRIER_FREQ)).toBeCloseTo(res.binauralDelta, 12);
    expect(res.binauralDelta).toBeLessThan(CARRIER_FREQ / 2);
  });

  it("keeps carrier identical when no critical lines exist", () => {
    const res = computeGateResonator(2, 100);
    expect(res.stableLines).toBe(0);
    expect(res.fTuning).toBe(CARRIER_FREQ);
  });
});
