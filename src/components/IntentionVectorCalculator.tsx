import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Zap, Atom } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { MOON_MOD_FREQ, PHI, SCHUMANN_FREQ } from "@/lib/gatca718Constants";

const DISPLAY_SAMPLES_PER_SECOND = 200;
const GATE_18_REFERENCE = {
  amplitude: 6,
  timeActivation: 13,
  frequency: 18,
  result: 1.1628,
} as const;

type ChartPoint = {
  t: number;
  psi: number;
};

function calculateIntentionVector(
  amplitudeA: number,
  timeActivation: number,
  frequencySignature: number,
  samplesPerSecond: number = DISPLAY_SAMPLES_PER_SECOND,
): number {
  const numPoints = Math.max(1, Math.round(timeActivation * samplesPerSecond));
  const dt = timeActivation / numPoints;

  let sum = 0;
  for (let i = 0; i <= numPoints; i++) {
    const t = (i / numPoints) * timeActivation;
    const exponentialConsciousness = Math.cos(frequencySignature * t);
    const harmonics = Math.cos(SCHUMANN_FREQ * t) * Math.sin(MOON_MOD_FREQ * t);
    const psiTotal = amplitudeA * exponentialConsciousness * harmonics * (PHI ** 2);

    const weight = i === 0 || i === numPoints ? 0.5 : 1.0;
    sum += weight * psiTotal;
  }

  return Math.round(sum * dt * 10000) / 10000;
}

function generateWaveChartData(
  amplitudeA: number,
  timeActivation: number,
  frequencySignature: number,
): ChartPoint[] {
  const numPoints = Math.max(1, Math.round(timeActivation * DISPLAY_SAMPLES_PER_SECOND));
  const data: ChartPoint[] = [];

  for (let i = 0; i <= numPoints; i++) {
    const t = (i / numPoints) * timeActivation;
    const psi = amplitudeA * Math.cos(frequencySignature * t) * Math.cos(SCHUMANN_FREQ * t) * Math.sin(MOON_MOD_FREQ * t) * (PHI ** 2);

    if (i % 2 === 0) {
      data.push({
        t: Math.round(t * 1000) / 1000,
        psi: Math.round(psi * 10000) / 10000,
      });
    }
  }

  return data;
}

export const IntentionVectorCalculator = () => {
  const [amplitude, setAmplitude] = useState<number>(GATE_18_REFERENCE.amplitude);
  const [timeActivation, setTimeActivation] = useState<number>(GATE_18_REFERENCE.timeActivation);
  const [frequency, setFrequency] = useState<number>(GATE_18_REFERENCE.frequency);
  const [result, setResult] = useState<number | null>(null);
  const [referenceResult, setReferenceResult] = useState<number | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);

  const handleCalculate = () => {
    setChartData(generateWaveChartData(amplitude, timeActivation, frequency));
    setResult(calculateIntentionVector(amplitude, timeActivation, frequency));
    setReferenceResult(
      calculateIntentionVector(
        GATE_18_REFERENCE.amplitude,
        GATE_18_REFERENCE.timeActivation,
        GATE_18_REFERENCE.frequency,
      ),
    );
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-mono text-primary">
          <Atom className="w-5 h-5" />
          WEKTOR INTENCJI (VI)
        </CardTitle>
        <p className="text-sm text-muted-foreground font-mono">
          Kolaps funkcji falowej Ψ_total → materializacja wektora mocy
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-background/50 border border-border rounded-lg p-4 font-mono text-xs text-muted-foreground space-y-1">
          <p>Ψ_total = A · e<sup>i·f·t</sup> · cos(ω<sub>S</sub>·t) · sin(ω<sub>L</sub>·t) · φ²</p>
          <p>VI = ∫₀ᵀ Ψ_total(t) dt</p>
          <p className="text-primary/70 mt-2">
            ω<sub>S</sub> = {SCHUMANN_FREQ} Hz (Schumann) | ω<sub>L</sub> = {MOON_MOD_FREQ} Hz (Lunar) | φ = {PHI.toFixed(6)}
          </p>
          <p className="mt-2 text-[10px] text-muted-foreground">
            Referencja stabilna Gate 18: A=6, T=13, f=18 Hz → VI = {GATE_18_REFERENCE.result}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-mono">Amplituda A (0-9)</Label>
            <Input
              type="number"
              min={0}
              max={9}
              value={amplitude}
              onChange={(e) => setAmplitude(Number(e.target.value))}
              className="font-mono bg-background/50"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-mono">Czas T (s)</Label>
            <Input
              type="number"
              min={1}
              max={108}
              value={timeActivation}
              onChange={(e) => setTimeActivation(Number(e.target.value))}
              className="font-mono bg-background/50"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-mono">Częstotliwość (Hz)</Label>
            <Input
              type="number"
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
              className="font-mono bg-background/50"
            />
          </div>
        </div>

        <Button onClick={handleCalculate} className="w-full font-mono font-bold">
          <Zap className="w-4 h-4 mr-2" />
          OBLICZ WEKTOR INTENCJI
        </Button>

        {result !== null && (
          <div className="space-y-2">
            <div className={`p-4 rounded-lg text-center font-mono border transition-colors ${
              Math.abs(result) > 1
                ? "bg-primary/10 text-foreground border-primary/30"
                : "bg-muted/50 text-muted-foreground border-border"
            }`}>
              <p className="text-xs text-muted-foreground mb-1">VI — bieżące parametry (f = {frequency} Hz)</p>
              <p className="text-3xl font-bold">{result}</p>
            </div>

            {referenceResult !== null && (
              <div className="p-3 rounded-lg text-center font-mono border bg-accent/10 text-foreground border-accent/30">
                <p className="text-xs text-muted-foreground mb-1">
                  Referencja Gate 18 (A={GATE_18_REFERENCE.amplitude}, T={GATE_18_REFERENCE.timeActivation}, f={GATE_18_REFERENCE.frequency} Hz)
                </p>
                <p className="text-2xl font-bold">{referenceResult}</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Ta wartość powinna pozostać stabilna i odpowiadać historycznemu wynikowi 1.1628.
                </p>
              </div>
            )}
          </div>
        )}

        {chartData.length > 0 && (
          <div className="bg-background/50 border border-border rounded-lg p-4">
            <p className="text-xs font-mono text-muted-foreground mb-3">Ψ_total(t) — przebieg funkcji falowej dla bieżących parametrów</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="t"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  label={{ value: "t (s)", position: "insideBottomRight", offset: -5, fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  label={{ value: "Ψ", angle: -90, position: "insideLeft", fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelFormatter={(value) => `t = ${value}s`}
                  formatter={(value: number) => [value.toFixed(4), "Ψ_total"]}
                />
                <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="psi" stroke="hsl(var(--primary))" dot={false} strokeWidth={1.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};