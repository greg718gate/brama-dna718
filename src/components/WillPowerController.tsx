import { useState, useEffect, useRef, useCallback } from "react";
import { Focus, Snowflake, Infinity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

const TRANSCENDENCE_THRESHOLD = 7.18; // seconds at max focus

interface WillPowerControllerProps {
  onFocusChange: (focus: number) => void;
  onCollapse: () => void;
  isCollapsed: boolean;
  coherence: number;
}

export const WillPowerController = ({
  onFocusChange,
  onCollapse,
  isCollapsed,
  coherence,
}: WillPowerControllerProps) => {
  const { language } = useLanguage();
  const pl = language === "pl";

  const [focus, setFocus] = useState(0);
  const [transcended, setTranscended] = useState(false);
  const [maxFocusTime, setMaxFocusTime] = useState(0);
  const maxFocusStart = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleFocusChange = useCallback((val: number[]) => {
    const v = val[0];
    setFocus(v);
    onFocusChange(v / 100);
  }, [onFocusChange]);

  // Track max-focus duration for Gate 12 transcendence
  useEffect(() => {
    if (focus >= 95 && !transcended) {
      if (!maxFocusStart.current) {
        maxFocusStart.current = Date.now();
      }
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - (maxFocusStart.current || Date.now())) / 1000;
        setMaxFocusTime(elapsed);
        if (elapsed >= TRANSCENDENCE_THRESHOLD) {
          setTranscended(true);
          if (timerRef.current) clearInterval(timerRef.current);
        }
      }, 100);
    } else {
      maxFocusStart.current = null;
      setMaxFocusTime(0);
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [focus, transcended]);

  const progressPercent = Math.min(100, (maxFocusTime / TRANSCENDENCE_THRESHOLD) * 100);

  return (
    <Card className="border-purple-500/30 relative overflow-hidden">
      {/* Transcendence overlay */}
      {transcended && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="text-center space-y-4">
            <Infinity className="w-20 h-20 text-amber-400 mx-auto animate-pulse" strokeWidth={1.5} />
            <div className="space-y-1">
              <p className="text-amber-400 font-bold font-mono text-lg tracking-widest">
                REALITY REWRITTEN
              </p>
              <p className="text-amber-300/80 font-mono text-sm">
                CHOICE ARCHIVED
              </p>
            </div>
            <p className="text-[10px] text-muted-foreground font-mono">
              {pl
                ? `Brama 12: Transcendencja — Skupienie utrzymane przez ${TRANSCENDENCE_THRESHOLD}s`
                : `Gate 12: Transcendence — Focus held for ${TRANSCENDENCE_THRESHOLD}s`}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="text-xs border-amber-500/30 text-amber-400"
              onClick={() => {
                setTranscended(false);
                setFocus(0);
                onFocusChange(0);
              }}
            >
              {pl ? "Resetuj" : "Reset"}
            </Button>
          </div>
        </div>
      )}

      <CardHeader className="pb-3">
        <CardTitle className="text-base font-mono flex items-center gap-2">
          <Focus className="w-5 h-5 text-purple-400" />
          {pl ? "Kontroler Woli — Bramy Kreacji (10-12)" : "Will Power Controller — Creation Gates (10-12)"}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {pl
            ? "Suwak skupienia zagęszcza chmurę fotonów w soczewkę. Kolaps zamraża chaos w symetrię."
            : "Focus slider condenses photon cloud into a lens. Collapse freezes chaos into symmetry."}
        </p>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Gate 11: Intent Focus Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
              <span className="text-purple-400">⟐</span>
              {pl ? "Brama 11: Ognisko Intencji" : "Gate 11: Intent Focus"}
            </label>
            <span className="text-xs font-mono font-bold text-purple-400">
              {focus}%
            </span>
          </div>
          <Slider
            value={[focus]}
            onValueChange={handleFocusChange}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
            <span>{pl ? "Sfera (rozproszona)" : "Sphere (dispersed)"}</span>
            <span>{pl ? "Soczewka (skupiona)" : "Lens (focused)"}</span>
          </div>
        </div>

        {/* Gate 10: Collapse Wavefunction Button */}
        <div className="text-center">
          <Button
            onClick={onCollapse}
            disabled={isCollapsed}
            className={`h-12 px-6 font-bold font-mono text-sm transition-all duration-500 ${
              isCollapsed
                ? "bg-cyan-700 shadow-[0_0_25px_hsla(190,80%,50%,0.4)] scale-105"
                : "bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 hover:shadow-[0_0_15px_hsla(270,70%,50%,0.3)]"
            }`}
          >
            <Snowflake className={`w-4 h-4 mr-2 ${isCollapsed ? "animate-pulse" : ""}`} />
            {isCollapsed
              ? (pl ? "KOLAPS ZAKOŃCZONY — Decyzja" : "COLLAPSED — Decision Made")
              : (pl ? "⚛ Kolaps Funkcji Falowej" : "⚛ Collapse Wavefunction")}
          </Button>
          <p className="text-[10px] text-muted-foreground font-mono mt-1.5">
            {pl
              ? "Brama 10: Zamroź chaos w idealną symetrię geometryczną"
              : "Gate 10: Freeze chaos into perfect geometric symmetry"}
          </p>
        </div>

        {/* Gate 12: Transcendence progress */}
        {focus >= 95 && !transcended && (
          <div className="space-y-2 animate-fade-in">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-amber-400">
                {pl ? "Brama 12: Transcendencja..." : "Gate 12: Transcendence..."}
              </span>
              <span className="text-amber-400">
                {maxFocusTime.toFixed(1)}s / {TRANSCENDENCE_THRESHOLD}s
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-100"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground font-mono text-center">
              {pl
                ? "Utrzymaj maksymalne skupienie..."
                : "Hold maximum focus..."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
