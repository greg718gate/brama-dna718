import { describe, expect, it } from "vitest";
import { buildHamiltonianAndEvolve, computeIntentionVector, computeWavefunction } from "./browserMathCore";
import { CARRIER_FREQ, GATCA_POSITIONS } from "./gatca718Constants";

describe("browser math core", () => {
  it("preserves the Gate 18 VI reference", () => {
    expect(computeIntentionVector({ amplitude: 6, duration: 13, frequency: 18 }).value).toBe(1.1628);
  });
  it("builds and evolves the complete 18x18 Hamiltonian", () => {
    const result = buildHamiltonianAndEvolve(1);
    expect(result.matrix).toHaveLength(18);
    expect(result.matrix.every((row) => row.length === 18)).toBe(true);
    expect(result.probabilities.reduce((sum, value) => sum + value, 0)).toBeCloseTo(1, 12);
    expect(GATCA_POSITIONS).toHaveLength(18);
  });
  it("returns finite Psi values on the critical line", () => {
    const psi = computeWavefunction(1, 0, CARRIER_FREQ * 1.0545718e-34, 50);
    expect(Number.isFinite(psi.magnitude)).toBe(true);
  });
});
