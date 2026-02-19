import { useState, useEffect, useMemo } from "react";
import { Heart, Activity, Zap, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { getGateByIndex } from "@/lib/gateDefinitions";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

const PHI = (1 + Math.sqrt(5)) / 2;

interface EmotionalBridgeProps {
  coherence: number;       // 0–1
  thermalNoise: number;    // from decoherence result
  stability: string;       // STABLE | METASTABLE | UNSTABLE
  dominantGateIndex: number; // 1-18
}

/** Generate Lindblad model data: stability vs thermal noise over time */
function generateLindbladData(coherence: number, thermalNoise: number) {
  const points = 50;
  const data = [];
  const gamma = Math.max(thermalNoise, 1e-6);
  const protection = coherence * PHI;
  const isPhotonic = coherence < 0.3;

  for (let i = 0; i <= points; i++) {
    const t = i / points;
    const tReal = t * 100;
    const decay = Math.exp(-gamma * t * 10);
    const steadyState = protection / (1 + gamma);
    const purity = coherence * decay + steadyState * (1 - decay);
    // In photonic phase: amplify noise to show creation activity
    const noiseBase = gamma * (1 - decay) * (1 - protection * 0.5);
    const noise = isPhotonic
      ? Math.min(1, noiseBase + 0.3 * Math.sin(t * Math.PI * 4) * 0.5 + 0.4)
      : noiseBase;
    const stabilityVal = Math.max(0, purity - noise * 0.3);
    // Manifestation energy: visible only in photonic phase
    const manifestation = isPhotonic
      ? Math.min(1, (1 - decay) * 0.8 + Math.sin(t * Math.PI * 3) * 0.15)
      : 0;

    data.push({
      time: tReal.toFixed(0),
      purity: Math.max(0, Math.min(1, purity)),
      noise: Math.max(0, Math.min(1, noise)),
      stability: Math.max(0, Math.min(1, stabilityVal)),
      protection: Math.max(0, Math.min(1, protection * decay)),
      manifestation: Math.max(0, Math.min(1, manifestation)),
    });
  }
  return data;
}

/** Trigger haptic feedback synced to φ frequency */
function triggerPhiHaptic() {
  if (!navigator.vibrate) return false;
  // φ-based pattern: 16ms on, 10ms off, 26ms on, 16ms off, 42ms on
  // Fibonacci: 1,1,2,3,5,8... scaled to ms
  const fibPattern = [16, 10, 26, 16, 42, 26, 68, 42, 110];
  navigator.vibrate(fibPattern);
  return true;
}

export const EmotionalBridge = ({
  coherence,
  thermalNoise,
  stability,
  dominantGateIndex,
}: EmotionalBridgeProps) => {
  const { language } = useLanguage();
  const pl = language === "pl";
  const [isActivated, setIsActivated] = useState(false);
  const [pulseIntensity, setPulseIntensity] = useState(0);
  const [hapticSupported, setHapticSupported] = useState(false);

  const isGrowthGate = dominantGateIndex >= 4 && dominantGateIndex <= 6;
  const isPhotonicPhase = coherence < 0.3; // Dynamic Creation Phase
  const gate = getGateByIndex(dominantGateIndex);

  // Check haptic support
  useEffect(() => {
    setHapticSupported(!!navigator.vibrate);
  }, []);

  // Pulsing emerald background intensity based on coherence
  useEffect(() => {
    if (!isGrowthGate && !isPhotonicPhase) return;
    const interval = setInterval(() => {
      setPulseIntensity(() => {
        const speed = isPhotonicPhase ? 2.0 : 1.0;
        const wave = Math.sin(Date.now() / (1000 / PHI) * speed) * 0.5 + 0.5;
        return isPhotonicPhase ? wave * 0.9 : wave * coherence;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [coherence, isGrowthGate, isPhotonicPhase]);

  const lindbladData = useMemo(
    () => generateLindbladData(coherence, thermalNoise),
    [coherence, thermalNoise]
  );

  const handleActivateDNA = () => {
    setIsActivated(true);
    const hadHaptic = triggerPhiHaptic();

    // Reset after animation
    setTimeout(() => setIsActivated(false), 3000);

    if (!hadHaptic && hapticSupported) {
      // Fallback single vibration
      navigator.vibrate?.(100);
    }
  };

  const emeraldOpacity = isGrowthGate ? pulseIntensity * 0.15 : 0;
  const photonicOpacity = isPhotonicPhase ? pulseIntensity * 0.2 : 0;

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-500 ${
        isPhotonicPhase ? "border-amber-400/40" : "border-emerald-500/30"
      }`}
      style={{
        background: isPhotonicPhase
          ? `linear-gradient(135deg, 
              hsla(45, 93%, 20%, ${photonicOpacity + 0.06}), 
              hsla(38, 80%, 15%, ${photonicOpacity * 0.5 + 0.03}), 
              hsla(220, 25%, 8%, 0.95))`
          : isGrowthGate
          ? `linear-gradient(135deg, 
              hsla(160, 84%, 15%, ${emeraldOpacity + 0.05}), 
              hsla(160, 70%, 10%, ${emeraldOpacity * 0.5 + 0.03}), 
              hsla(220, 25%, 8%, 0.95))`
          : undefined,
      }}
    >
      {/* Pulsing overlay: golden for photonic, emerald for growth */}
      {(isGrowthGate || isPhotonicPhase) && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-700"
          style={{
            background: isPhotonicPhase
              ? `radial-gradient(ellipse at 50% 40%, hsla(45, 93%, 55%, ${photonicOpacity * 0.5}) 0%, hsla(38, 90%, 40%, ${photonicOpacity * 0.2}) 40%, transparent 70%)`
              : `radial-gradient(ellipse at 30% 50%, hsla(160, 84%, 30%, ${emeraldOpacity * 0.4}) 0%, transparent 70%)`,
            opacity: pulseIntensity,
          }}
        />
      )}

      {/* DNA Activation flash */}
      {isActivated && (
        <div className="absolute inset-0 pointer-events-none animate-fade-in z-10">
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 50%, 
                hsla(160, 90%, 50%, 0.3) 0%, 
                hsla(45, 93%, 58%, 0.1) 40%, 
                transparent 70%)`,
              animation: "pulse 1.5s ease-out",
            }}
          />
        </div>
      )}

      <CardHeader className="relative z-20 pb-3">
        <CardTitle className="text-base font-mono flex items-center gap-2">
          <Heart className={`w-5 h-5 ${isPhotonicPhase ? "text-amber-400" : "text-emerald-400"}`} />
          {isPhotonicPhase
            ? (pl ? "FAZA DYNAMICZNEJ KREACJI" : "DYNAMIC CREATION PHASE")
            : (pl ? "Most Emocjonalny — Bramy Wzrostu (4-6)" : "Emotional Bridge — Growth Gates (4-6)")}
        </CardTitle>
        {isPhotonicPhase && (
          <div className="flex items-center gap-1.5 mt-1">
            <Zap className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span className="text-[11px] font-mono text-amber-300/90">
              {pl
                ? "Koherencja < 30% → Wysoka aktywność fotonowa — światło manifestuje się w materii"
                : "Coherence < 30% → High photonic activity — light manifests into matter"}
            </span>
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          {pl
            ? "Model Lindblada: stabilność kwantowa wersetu w temperaturze biologicznej (310K)"
            : "Lindblad Model: quantum stability of verse at biological temperature (310K)"}
        </p>
      </CardHeader>

      <CardContent className="relative z-20 space-y-5">
        {/* Lindblad Chart */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            {pl ? "Dynamika Lindblada: Koherencja vs Szum Termiczny" : "Lindblad Dynamics: Coherence vs Thermal Noise"}
          </div>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={lindbladData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="gradStability" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isPhotonicPhase ? "hsl(45, 93%, 58%)" : "hsl(160, 84%, 40%)"} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={isPhotonicPhase ? "hsl(45, 93%, 58%)" : "hsl(160, 84%, 40%)"} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradNoise" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isPhotonicPhase ? "hsl(38, 90%, 55%)" : "hsl(0, 84%, 60%)"} stopOpacity={isPhotonicPhase ? 0.5 : 0.3} />
                    <stop offset="100%" stopColor={isPhotonicPhase ? "hsl(38, 90%, 55%)" : "hsl(0, 84%, 60%)"} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradProtection" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(45, 93%, 58%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(45, 93%, 58%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradManifestation" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(50, 100%, 80%)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(50, 100%, 80%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 20%)" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10, fill: "hsl(215, 20%, 65%)" }}
                  label={{ value: "fs", position: "insideBottomRight", offset: -5, fontSize: 10, fill: "hsl(215, 20%, 65%)" }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "hsl(215, 20%, 65%)" }}
                  domain={[0, 1]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(220, 20%, 12%)",
                    border: "1px solid hsl(220, 15%, 20%)",
                    borderRadius: "8px",
                    fontSize: "11px",
                  }}
                  formatter={(value: number, name: string) => [
                    value.toFixed(4),
                    name === "stability"
                      ? (pl ? "Stabilność" : "Stability")
                      : name === "noise"
                      ? (pl ? (isPhotonicPhase ? "Aktywność fotonowa" : "Szum termiczny") : (isPhotonicPhase ? "Photonic Activity" : "Thermal Noise"))
                      : name === "protection"
                      ? (pl ? "Ochrona rezonansowa" : "Resonance Protection")
                      : name === "manifestation"
                      ? (pl ? "Energia manifestacji" : "Manifestation Energy")
                      : (pl ? "Czystość" : "Purity"),
                  ]}
                />
                <Legend
                  wrapperStyle={{ fontSize: "10px" }}
                  formatter={(value) =>
                    value === "stability"
                      ? (pl ? "Stabilność" : "Stability")
                      : value === "noise"
                      ? (pl ? (isPhotonicPhase ? "Fotony" : "Szum") : (isPhotonicPhase ? "Photons" : "Noise"))
                      : value === "protection"
                      ? (pl ? "Ochrona φ" : "φ Protection")
                      : value === "manifestation"
                      ? (pl ? "Manifestacja" : "Manifestation")
                      : (pl ? "Czystość" : "Purity")
                  }
                />
                <Area
                  type="monotone"
                  dataKey="stability"
                  stroke={isPhotonicPhase ? "hsl(45, 93%, 58%)" : "hsl(160, 84%, 40%)"}
                  fill="url(#gradStability)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="noise"
                  stroke={isPhotonicPhase ? "hsl(38, 90%, 55%)" : "hsl(0, 84%, 60%)"}
                  fill="url(#gradNoise)"
                  strokeWidth={isPhotonicPhase ? 2.5 : 1.5}
                  strokeDasharray={isPhotonicPhase ? undefined : "4 2"}
                />
                <Area
                  type="monotone"
                  dataKey="protection"
                  stroke="hsl(45, 93%, 58%)"
                  fill="url(#gradProtection)"
                  strokeWidth={1.5}
                />
                {isPhotonicPhase && (
                  <Area
                    type="monotone"
                    dataKey="manifestation"
                    stroke="hsl(50, 100%, 80%)"
                    fill="url(#gradManifestation)"
                    strokeWidth={2}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="purity"
                  stroke="hsl(271, 76%, 53%)"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 text-xs font-mono">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
              <div className="text-muted-foreground">{pl ? "Koherencja" : "Coherence"}</div>
              <div className="text-emerald-400 font-bold text-sm">{(coherence * 100).toFixed(1)}%</div>
            </div>
            <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
              <div className="text-muted-foreground">{pl ? "Szum" : "Noise"}</div>
              <div className="text-destructive font-bold text-sm">{thermalNoise.toExponential(2)}</div>
            </div>
            <div className={`p-2 rounded-lg border text-center ${
              stability === "STABLE"
                ? "bg-emerald-500/10 border-emerald-500/20"
                : stability === "METASTABLE"
                ? "bg-accent/10 border-accent/20"
                : "bg-destructive/10 border-destructive/20"
            }`}>
              <div className="text-muted-foreground">{pl ? "Status" : "Status"}</div>
              <div className={`font-bold text-sm ${
                stability === "STABLE"
                  ? "text-emerald-400"
                  : stability === "METASTABLE"
                  ? "text-accent"
                  : "text-destructive"
              }`}>
                {stability}
              </div>
            </div>
          </div>
        </div>

        {/* Activate DNA Button */}
        <div className="text-center space-y-2">
          <Button
            onClick={handleActivateDNA}
            disabled={isActivated}
            className={`h-14 px-8 text-base font-bold font-mono transition-all duration-500 ${
              isActivated
                ? "bg-emerald-600 shadow-[0_0_30px_hsla(160,84%,40%,0.5)] scale-105"
                : "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 hover:shadow-[0_0_20px_hsla(160,84%,40%,0.3)]"
            }`}
          >
            {isActivated ? (
              <>
                <Waves className="w-5 h-5 mr-2 animate-pulse" />
                {pl ? "DNA AKTYWOWANE — φ = 1.618..." : "DNA ACTIVATED — φ = 1.618..."}
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                {pl ? "⚡ Aktywuj DNA" : "⚡ Activate DNA"}
              </>
            )}
          </Button>

          <p className="text-[10px] text-muted-foreground font-mono">
            {hapticSupported
              ? (pl
                  ? "Wibracja zsynchronizowana z ciągiem Fibonacciego (φ-pattern)"
                  : "Vibration synchronized with Fibonacci sequence (φ-pattern)")
              : (pl
                  ? "Aktywacja wizualna (urządzenie nie wspiera haptic feedback)"
                  : "Visual activation (device does not support haptic feedback)")}
          </p>

          {gate && (
            <div className="mt-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs font-mono">
              <span className="text-emerald-400">{gate.icon} {pl ? gate.namePL : gate.nameEN}</span>
              <span className="text-muted-foreground"> — {gate.constantLabel}: </span>
              <span className="text-primary">{gate.constantFormula}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
