import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// === GATCA-718 Constants ===
const PHI = (1 + Math.sqrt(5)) / 2;
const GAMMA = 1 / PHI;
const EULER_MASCHERONI = 0.577215664901532;
const CARRIER_FREQ = 718.57012515;
const SCHUMANN_FREQ = 7.83;
const MTDNA_LENGTH = 16569;
const GATCA_POSITIONS = [1,740,951,1227,2996,3424,4166,4832,6393,7756,8415,10059,11200,11336,11915,13703,14784,16179];

// === Core PRNG ===
interface PrngState { seed: number; counter: number; entropy: number[]; }

function createState(seed: number): PrngState {
  const entropy: number[] = [];
  for (let i = 0; i < 18; i++) {
    entropy.push(((GATCA_POSITIONS[i] * seed) % MTDNA_LENGTH) / MTDNA_LENGTH);
  }
  return { seed, counter: 0, entropy };
}

function nextRaw(state: PrngState): number {
  state.counter++;
  const gateIdx = state.counter % 18;
  const gateEntropy = state.entropy[gateIdx];
  const x = Math.sin(state.counter * PHI + gateEntropy * CARRIER_FREQ) * 10000;
  return x - Math.floor(x);
}

function getEntropyVector(state: PrngState, size: number): number[] {
  const r: number[] = [];
  for (let i = 0; i < size; i++) r.push(nextRaw(state));
  return r;
}

// === 3-Layer Quantum Filter ===
function analyzeSignal(
  data: number[],
  state: PrngState,
  threshold: number
) {
  const entropy = getEntropyVector(state, data.length);

  // Layer 1: GATCA Correlation (weight: PHI)
  let sum1 = 0;
  for (let i = 0; i < data.length; i++) sum1 += Math.sin(data[i] * entropy[i]);
  const layer1 = (sum1 / data.length) * PHI;

  // Layer 2: Harmonic Resonance (weight: EULER_MASCHERONI)
  let sum2 = 0;
  for (let i = 0; i < data.length; i++) sum2 += Math.cos(data[i] / PHI);
  const layer2 = (sum2 / data.length) * EULER_MASCHERONI;

  // Layer 3: Phase Coherence (Schumann sync)
  let sum3 = 0;
  for (let i = 0; i < data.length; i++) {
    const phase = (data[i] % SCHUMANN_FREQ) / SCHUMANN_FREQ * 2 * Math.PI;
    sum3 += Math.cos(phase);
  }
  const layer3 = sum3 / data.length;

  // Composite signal
  const compositeSignal = (layer1 + Math.abs(layer2) + Math.abs(layer3)) / (PHI + EULER_MASCHERONI + 1);
  
  // Confidence with calibrated amplifier (factor 10)
  // weak ~30-50%, medium ~55-75%, strong ~80-96%
  const AMPLIFIER = 10;
  const confidence = Math.tanh(Math.abs(compositeSignal) * AMPLIFIER) * 100;
  const decision = confidence / 100 > threshold ? (compositeSignal > 0 ? 1 : -1) : 0;

  const gateIdx = state.counter % 18;

  return {
    timestamp: new Date().toISOString(),
    decision,
    decisionLabel: decision === 1 ? "BUY" : decision === -1 ? "SELL" : "WAIT",
    confidence,
    compositeSignal,
    layers: {
      correlation: layer1,
      harmonicStrength: Math.abs(layer2),
      phaseCoherence: Math.abs(layer3),
    },
    gateSignature: `G${gateIdx + 1}:${GATCA_POSITIONS[gateIdx]}:${state.counter}`,
    entropyVector: entropy,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("x-qf-key");
    if (authHeader !== "2912") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { data, price, threshold = 0.75, seed } = body;

    if (!data || !Array.isArray(data) || data.length < 2) {
      return new Response(
        JSON.stringify({ error: "Provide 'data' array with at least 2 numbers" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const parsedData = data.map(Number).filter((n: number) => !isNaN(n));
    const state = createState(seed ?? Date.now());
    const result = analyzeSignal(parsedData, state, threshold);

    return new Response(
      JSON.stringify({
        ...result,
        price: price ?? null,
        engine: "GATCA-718 QF v2.0.0",
        carrier: CARRIER_FREQ,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
