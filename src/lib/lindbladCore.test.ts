import { describe, expect, it } from "vitest";
import { BODY_TEMPERATURE_K, evolveLindblad } from "./lindbladCore";
import { mapSourceScriptToMatrix } from "./biblicalDecoder";

describe("Lindblad master equation", () => {
  const result = evolveLindblad({ coherence: 0.5, cycles: 4, samples: 20, substeps: 8 });

  it("runs at body temperature 37 C", () => {
    expect(result.temperatureK).toBe(BODY_TEMPERATURE_K);
    expect(result.thermalOccupation).toBeGreaterThan(1e9);
  });

  it("keeps the density matrix physical (trace 1, purity in range)", () => {
    const populations = result.finalPopulations.reduce((s, v) => s + v, 0);
    expect(populations).toBeCloseTo(1, 3);
    expect(result.finalPurity).toBeGreaterThan(0);
    expect(result.finalPurity).toBeLessThanOrEqual(1.0001);
  });

  it("reports entanglement entropy between Alpha and Sigma within 0..1 bit", () => {
    expect(result.finalEntanglementEntropy).toBeGreaterThanOrEqual(0);
    expect(result.peakEntanglementEntropy).toBeLessThanOrEqual(1.0001);
    expect(result.series.length).toBe(21);
  });
});

describe("source-script matrix mapping", () => {
  it("maps Hebrew characters onto an 18x18 distribution", () => {
    const mapping = mapSourceScriptToMatrix("בְּרֵאשִׁית בָּרָא אֱלֹהִים", "In the beginning");
    expect(mapping.usedOriginalScript).toBe(true);
    expect(mapping.script).toBe("hebrew");
    expect(mapping.matrix).toHaveLength(18);
    expect(mapping.matrix.every((row) => row.length === 18)).toBe(true);
    const total = mapping.matrix.flat().reduce((s, v) => s + v, 0);
    expect(total).toBeCloseTo(1, 10);
    expect(mapping.recognized).toBeGreaterThan(0);
  });

  it("falls back to Latin text and flags it", () => {
    const mapping = mapSourceScriptToMatrix("", "In the beginning God created");
    expect(mapping.usedOriginalScript).toBe(false);
    expect(mapping.script).toBe("latin");
  });
});
