import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-qf-key",
};

// === GATCA-718 Constants ===
const PHI = (1 + Math.sqrt(5)) / 2;
const GAMMA = 1 / PHI;
const EULER_MASCHERONI = 0.577215664901532;
const CARRIER_FREQ = 718.57012515;
const SCHUMANN_FREQ = 7.83;
const MTDNA_LENGTH = 16569;
const GATCA_POSITIONS = [1,740,951,1227,2996,3424,4166,4832,6393,7756,8415,10059,11200,11336,11915,13703,14784,16179];
const MIN_TRADE_CONFIDENCE = 0.98;

// === Realne koszty handlu na Binance Spot ===
// Prowizja maker/taker bez BNB: 0.10% (0.001) na każdą stronę → razem 0.20%
// Spread BTC/USDT (typowy): ~0.01-0.02%
// Bufor bezpieczeństwa: 0.05%
// Łączny próg: ruch ceny musi być ≥ 0.27% żeby transakcja miała sens
const FEE_PER_SIDE = 0.001;        // 0.10%
const SPREAD_ESTIMATE = 0.0002;    // 0.02%
const SAFETY_BUFFER = 0.0005;      // 0.05%
const MIN_PROFITABLE_MOVE = (FEE_PER_SIDE * 2) + SPREAD_ESTIMATE + SAFETY_BUFFER; // 0.27%

// Szacowanie oczekiwanego ruchu z bufora cen: realizowana zmienność (stdev procentowych zmian)
// pomnożona przez compositeSignal — to jest "spodziewana amplituda ruchu w kierunku sygnału"
function estimateExpectedMove(prices: number[], compositeSignal: number): number {
  if (prices.length < 2) return 0;
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    if (prices[i - 1] > 0) returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }
  if (returns.length === 0) return 0;
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((a, b) => a + (b - mean) ** 2, 0) / returns.length;
  const stdev = Math.sqrt(variance);
  // Oczekiwany ruch = zmienność × siła sygnału (|composite| ∈ ~[0,1])
  return stdev * Math.abs(compositeSignal) * PHI; // PHI jako wzmocnienie sygnału kierunkowego
}

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

// === Fetch real BTC/USDT prices from Binance ===
async function fetchBinancePrices(limit = 50): Promise<{ prices: number[]; currentPrice: number }> {
  const url = `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Binance API error: ${res.status}`);
  const klines = await res.json();
  // Each kline: [openTime, open, high, low, close, volume, ...]
  const prices = klines.map((k: any) => parseFloat(k[4])); // close prices
  const currentPrice = prices[prices.length - 1];
  return { prices, currentPrice };
}

async function fetchBinanceCurrentPrice(): Promise<number> {
  const res = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT");
  if (!res.ok) throw new Error(`Binance ticker error: ${res.status}`);
  const ticker = await res.json();
  return Number(ticker.price);
}

// === 3-Layer Quantum Filter ===
function normalizeThreshold(value: unknown): number {
  const numeric = typeof value === "number" ? value : Number(value);
  const ratio = Number.isFinite(numeric) ? (numeric > 1 ? numeric / 100 : numeric) : MIN_TRADE_CONFIDENCE;
  return Math.max(MIN_TRADE_CONFIDENCE, Math.min(1, ratio));
}

function analyzeSignal(data: number[], state: PrngState, thresholdInput: unknown, rawPrices: number[] | null = null) {
  const threshold = normalizeThreshold(thresholdInput);
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

  const compositeSignal = (layer1 + Math.abs(layer2) + Math.abs(layer3)) / (PHI + EULER_MASCHERONI + 1);
  
  const AMPLIFIER = 30;
  const confidence = Math.tanh(Math.abs(compositeSignal) * AMPLIFIER) * 100;
  const thresholdPercent = threshold * 100;
  const confidencePassed = confidence >= thresholdPercent;

  // === FILTR PROWIZJI ===
  // Sygnał wykonalny tylko jeśli oczekiwany ruch ceny pokryje prowizję + spread + bufor
  const pricesForVol = rawPrices ?? data;
  const expectedMove = estimateExpectedMove(pricesForVol, compositeSignal);
  const profitablePassed = expectedMove >= MIN_PROFITABLE_MOVE;

  const tradeable = confidencePassed && profitablePassed;
  const decision = tradeable ? (compositeSignal > 0 ? 1 : -1) : 0;

  let blockReason: string | null = null;
  if (!confidencePassed && !profitablePassed) blockReason = "LOW_CONFIDENCE_AND_UNPROFITABLE";
  else if (!confidencePassed) blockReason = "LOW_CONFIDENCE";
  else if (!profitablePassed) blockReason = "MOVE_BELOW_FEES";

  const gateIdx = state.counter % 18;

  return {
    timestamp: new Date().toISOString(),
    decision,
    decisionLabel: decision === 1 ? "BUY" : decision === -1 ? "SELL" : "WAIT",
    confidence,
    threshold: thresholdPercent,
    thresholdPassed: tradeable,
    blockedByThreshold: !tradeable,
    blockReason,
    profitability: {
      expectedMovePct: expectedMove * 100,
      requiredMovePct: MIN_PROFITABLE_MOVE * 100,
      feeTotalPct: FEE_PER_SIDE * 2 * 100,
      spreadPct: SPREAD_ESTIMATE * 100,
      profitablePassed,
    },
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
    const authHeader = req.headers.get("x-qf-key");
    if (authHeader !== "2912") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { data, price, threshold = MIN_TRADE_CONFIDENCE, seed, live = false, priceOnly = false } = body;

    let parsedData: number[];
    let currentPrice: number | null = price ?? null;

    if (priceOnly) {
      const currentPrice = await fetchBinanceCurrentPrice();
      return new Response(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          price: currentPrice,
          source: "BINANCE_LIVE",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (live || !data) {
      // Fetch real Binance prices
      const binance = await fetchBinancePrices(50);
      parsedData = binance.prices;
      currentPrice = binance.currentPrice;
    } else {
      if (!Array.isArray(data) || data.length < 2) {
        return new Response(
          JSON.stringify({ error: "Provide 'data' array with at least 2 numbers" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      parsedData = data.map(Number).filter((n: number) => !isNaN(n));
    }

    // Deterministic seed from price data — same data = same result
    let determinedSeed = seed;
    if (!determinedSeed) {
      let hash = 0;
      for (let i = 0; i < parsedData.length; i++) {
        hash = ((hash << 5) - hash + Math.round(parsedData[i] * 100)) | 0;
      }
      determinedSeed = Math.abs(hash);
    }

    const state = createState(determinedSeed);
    const result = analyzeSignal(parsedData, state, threshold);

    return new Response(
      JSON.stringify({
        ...result,
        price: currentPrice,
        engine: "GATCA-718 QF v2.1.0",
        carrier: CARRIER_FREQ,
        source: (live || !data) ? "BINANCE_LIVE" : "CUSTOM_DATA",
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
