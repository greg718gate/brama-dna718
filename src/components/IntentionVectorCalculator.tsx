import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Zap, Atom } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const SCHUMANN_FREQ = 7.83;
const LUNAR_NODE_FREQ = 18.6;
const PHI = (1 + Math.sqrt(5)) / 2;

function calculateIntentionVector(
  amplitudeA: number,
  timeActivation: number,
  frequencySignature: number = 718
): number {
  const numPoints = timeActivation * 1000;
  const dt = timeActivation / numPoints;

  let sum = 0;
  for (let i = 0; i <= numPoints; i++) {
    const t = (i / numPoints) * timeActivation;

    // Świadomość Wykładnicza - część rzeczywista e^(i*718*t)
    const exponentialConsciousness = Math.cos(frequencySignature * t);

    // Harmonizacja Schumanna i Cykl Księżycowy
    const harmonics = Math.cos(SCHUMANN_FREQ * t) * Math.sin(LUNAR_NODE_FREQ * t);

    // Iloczyn kwantowy z Amplitudą A i Kluczem DNA (phi)
    const psiTotal = amplitudeA * exponentialConsciousness * harmonics * (PHI ** 2);

    // Trapezoid rule
    const weight = (i === 0 || i === numPoints) ? 0.5 : 1.0;
    sum += weight * psiTotal;
  }

  return Math.round(sum * dt * 10000) / 10000;
}

export const IntentionVectorCalculator = () => {
  const [amplitude, setAmplitude] = useState(6);
  const [timeActivation, setTimeActivation] = useState(13);
  const [frequency, setFrequency] = useState(718);
  const [result, setResult] = useState<number | null>(null);
  const [chartData, setChartData] = useState<{ t: number; psi: number }[]>([]);

  const handleCalculate = () => {
    const numPoints = timeActivation * 200; // fewer points for chart clarity
    const dt = timeActivation / numPoints;
    const data: { t: number; psi: number }[] = [];
    let sum = 0;

    for (let i = 0; i <= numPoints; i++) {
      const t = (i / numPoints) * timeActivation;
      const exp = Math.cos(frequency * t);
      const harm = Math.cos(SCHUMANN_FREQ * t) * Math.sin(LUNAR_NODE_FREQ * t);
      const psi = amplitude * exp * harm * (PHI ** 2);

      if (i % 2 === 0) data.push({ t: Math.round(t * 1000) / 1000, psi: Math.round(psi * 10000) / 10000 });

      const weight = (i === 0 || i === numPoints) ? 0.5 : 1.0;
      sum += weight * psi;
    }

    setChartData(data);
    setResult(Math.round(sum * dt * 10000) / 10000);
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
        {/* Equation display */}
        <div className="bg-background/50 border border-border rounded-lg p-4 font-mono text-xs text-muted-foreground space-y-1">
          <p>Ψ_total = A · e<sup>i·f·t</sup> · cos(ω<sub>S</sub>·t) · sin(ω<sub>L</sub>·t) · φ²</p>
          <p>VI = ∫₀ᵀ Ψ_total(t) dt</p>
          <p className="text-primary/70 mt-2">
            ω<sub>S</sub> = {SCHUMANN_FREQ} Hz (Schumann) | ω<sub>L</sub> = {LUNAR_NODE_FREQ} Hz (Lunar) | φ = {PHI.toFixed(6)}
          </p>
        </div>

        {/* Inputs */}
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
          <div className={`p-4 rounded-lg text-center font-mono border transition-colors ${
            Math.abs(result) > 1
              ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
              : "bg-muted/50 text-muted-foreground border-border"
          }`}>
            <p className="text-xs text-muted-foreground mb-1">Wektor Intencji VI zmaterializowany:</p>
            <p className="text-3xl font-bold">{result}</p>
          </div>
        )}

        {chartData.length > 0 && (
          <div className="bg-background/50 border border-border rounded-lg p-4">
            <p className="text-xs font-mono text-muted-foreground mb-3">Ψ_total(t) — przebieg funkcji falowej</p>
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
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  labelFormatter={(v) => `t = ${v}s`}
                  formatter={(v: number) => [v.toFixed(4), "Ψ_total"]}
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
