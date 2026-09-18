/// <reference lib="webworker" />
import { analyzeRrSpectrum, buildHamiltonianAndEvolve, computeIntentionVector, computeLindblad, computeUnification, computeWavefunction } from "@/lib/browserMathCore";
import type { MathWorkerRequest, MathWorkerResponse } from "@/lib/mathWorkerClient";
import { analyzeZetaSignal } from "@/lib/zetaReference";

self.onmessage = (event: MessageEvent<MathWorkerRequest>) => {
  const { id, task, payload } = event.data;
  try {
    let result: unknown;
    if (task === "intention-vector") result = computeIntentionVector(payload);
    else if (task === "rr-spectrum") result = analyzeRrSpectrum(payload.rr, payload.breathDuration);
    else if (task === "hamiltonian-evolution") result = buildHamiltonianAndEvolve(payload.time);
    else if (task === "wavefunction") result = computeWavefunction(payload.t, payload.x, payload.energy, payload.terms);
    else if (task === "zeta-analysis") result = analyzeZetaSignal(payload);
    else if (task === "lindblad") result = computeLindblad(payload);
    else result = computeUnification(payload.sequences, payload.t, payload.x);
    self.postMessage({ id, ok: true, result } satisfies MathWorkerResponse);
  } catch (error) {
    self.postMessage({ id, ok: false, error: error instanceof Error ? error.message : "Math worker failed" } satisfies MathWorkerResponse);
  }
};

export {};
