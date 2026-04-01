import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Zap, Atom } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { CARRIER_FREQ, SCHUMANN_FREQ, MOON_MOD_FREQ, PHI, RIEMANN_ZERO_FREQ } from "@/lib/gatca718Constants";

const LEGACY_FREQ = 718; // Oryginalna stała kalibracyjna (VI_GATE_18 = 1.1628)

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
    const harmonics = Math.cos(SCHUMANN_FREQ * t) * Math.sin(MOON_MOD_FREQ * t);

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
  const [frequency, setFrequency] = useState(CARRIER_FREQ);
  const [result, setResult] = useState<number | null>(null);
  const [resultLegacy, setResultLegacy] = useState<number | null>(null);
  const [chartData, setChartData] = useState<{ t: number; psi: number; psiLegacy: number }[]>([]);

  const handleCalculate = () => {
    const numPoints = timeActivation * 200;
    const dt = timeActivation / numPoints;
    const data: { t: number; psi: number; psiLegacy: number }[] = [];
    let sum = 0;
    let sumLegacy = 0;

    for (let i = 0; i <= numPoints; i++) {
      const t = (i / numPoints) * timeActivation;
      const harm = Math.cos(SCHUMANN_FREQ * t) * Math.sin(MOON_MOD_FREQ * t);

      const exp = Math.cos(frequency * t);
      const psi = amplitude * exp * harm * (PHI ** 2);

      const expLegacy = Math.cos(LEGACY_FREQ * t);
      const psiLegacy = amplitude * expLegacy * harm * (PHI ** 2);

      if (i % 2 === 0) data.push({
        t: Math.round(t * 1000) / 1000,
        psi: Math.round(psi * 10000) / 10000,
        psiLegacy: Math.round(psiLegacy * 10000) / 10000,
      });

      const weight = (i === 0 || i === numPoints) ? 0.5 : 1.0;
      sum += weight * psi;
      sumLegacy += weight * psiLegacy;
    }

    setChartData(data);
    setResult(Math.round(sum * dt * 10000) / 10000);
    setResultLegacy(Math.round(sumLegacy * dt * 10000) / 10000);
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
            ω<sub>S</sub> = {SCHUMANN_FREQ} Hz (Schumann) | ω<sub>L</sub> = {MOON_MOD_FREQ} Hz (Lunar) | φ = {PHI.toFixed(6)}
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

        {result !== null && resultLegacy !== null && (
          <div className="space-y-2">
            {/* Riemann Zero result */}
            <div className={`p-3 rounded-lg text-center font-mono border transition-colors ${
              Math.abs(result) > 1
                ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                : "bg-muted/50 text-muted-foreground border-border"
            }`}>
              <p className="text-xs text-muted-foreground mb-1">VI — Riemann Zero #448 ({CARRIER_FREQ} Hz)</p>
              <p className="text-2xl font-bold">{result}</p>
            </div>
            {/* Legacy 718 result */}
            <div className={`p-3 rounded-lg text-center font-mono border transition-colors ${
              Math.abs(resultLegacy) > 1
                ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                : "bg-muted/50 text-muted-foreground border-border"
            }`}>
              <p className="text-xs text-muted-foreground mb-1">VI — Klasyczny ({LEGACY_FREQ} Hz)</p>
              <p className="text-2xl font-bold">{resultLegacy}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Referencyjna wartość kalibracyjna: VI_GATE_18 = 1.1628</p>
            </div>
          </div>
        )}

        {chartData.length > 0 && (
          <div className="bg-background/50 border border-border rounded-lg p-4">
            <p className="text-xs font-mono text-muted-foreground mb-3">
              Ψ_total(t) — <span className="text-primary">Riemann ({CARRIER_FREQ} Hz)</span> vs <span className="text-purple-400">Klasyczny ({LEGACY_FREQ} Hz)</span>
            </p>
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
                />
                <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="psi" stroke="hsl(var(--primary))" dot={false} strokeWidth={1.5} name={`Ψ (${CARRIER_FREQ} Hz)`} />
                <Line type="monotone" dataKey="psiLegacy" stroke="#a855f7" dot={false} strokeWidth={1} strokeDasharray="4 2" name={`Ψ (${LEGACY_FREQ} Hz)`} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
