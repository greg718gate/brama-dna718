import type { GATCASequence, UnificationResult } from "@/lib/bramaUnificationEngine";
import type { HamiltonianEvolutionOutput, IntentionVectorInput, IntentionVectorOutput, RrSpectrumOutput } from "@/lib/browserMathCore";
import type { ZetaAnalysisInput } from "@/lib/zetaReference";

export type MathWorkerRequest =
  | { id: number; task: "intention-vector"; payload: IntentionVectorInput }
  | { id: number; task: "rr-spectrum"; payload: { rr: number[]; breathDuration: number } }
  | { id: number; task: "hamiltonian-evolution"; payload: { time: number } }
  | { id: number; task: "wavefunction"; payload: { t: number; x: number; energy?: number; terms?: number } }
  | { id: number; task: "zeta-analysis"; payload: ZetaAnalysisInput }
  | { id: number; task: "unification"; payload: { sequences: GATCASequence[]; t: number; x: number } };

export type MathWorkerResponse = { id: number; ok: true; result: unknown } | { id: number; ok: false; error: string };
let worker: Worker | null = null;
let nextId = 1;
const pending = new Map<number, { resolve: (value: unknown) => void; reject: (reason: Error) => void }>();

function getWorker() {
  if (!worker) {
    worker = new Worker(new URL("../workers/math.worker.ts", import.meta.url), { type: "module", name: "sentinel-math" });
    worker.onmessage = (event: MessageEvent<MathWorkerResponse>) => {
      const request = pending.get(event.data.id);
      if (!request) return;
      pending.delete(event.data.id);
      if (event.data.ok) request.resolve(event.data.result);
      else if ("error" in event.data) request.reject(new Error(event.data.error));
    };
    worker.onerror = (event) => {
      const error = new Error(event.message || "Math worker failed");
      pending.forEach(({ reject }) => reject(error));
      pending.clear();
    };
  }
  return worker;
}

function request<T>(message: Omit<MathWorkerRequest, "id">): Promise<T> {
  const id = nextId++;
  return new Promise<T>((resolve, reject) => {
    pending.set(id, { resolve: (value) => resolve(value as T), reject });
    getWorker().postMessage({ ...message, id });
  });
}

export const mathWorker = {
  intentionVector: (payload: IntentionVectorInput) => request<IntentionVectorOutput>({ task: "intention-vector", payload }),
  analyzeRr: (rr: number[], breathDuration: number) => request<RrSpectrumOutput>({ task: "rr-spectrum", payload: { rr, breathDuration } }),
  hamiltonianEvolution: (time: number) => request<HamiltonianEvolutionOutput>({ task: "hamiltonian-evolution", payload: { time } }),
  wavefunction: (t: number, x: number, energy?: number, terms?: number) => request<{ re: number; im: number; magnitude: number; phase: number }>({ task: "wavefunction", payload: { t, x, energy, terms } }),
  zetaAnalysis: <T>(payload: ZetaAnalysisInput) => request<T>({ task: "zeta-analysis", payload }),
  unification: (sequences: GATCASequence[], t: number, x: number) => request<UnificationResult>({ task: "unification", payload: { sequences, t, x } }),
};
