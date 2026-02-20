import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { getGateByIndex, GATE_DEFINITIONS } from "@/lib/gateDefinitions";
import { Zap, RotateCcw, Check } from "lucide-react";

interface GateActivationPanelProps {
  /** Gate index 1-18 from decodeVerse result */
  gateIndex: number;
  /** Coherence 0-1 from Ψ result */
  coherence: number;
  /** Materialization potential from VI */
  materializationPotential: number;
}

// Colors per category
const CATEGORY_COLORS: Record<string, { border: string; glow: string; badge: string; ring: string }> = {
  matter:        { border: "border-stone-500/50",   glow: "hsla(25,20%,50%,0.3)",  badge: "bg-stone-500/20 text-stone-300",   ring: "hsl(25,20%,50%)" },
  growth:        { border: "border-emerald-500/50", glow: "hsla(160,70%,40%,0.4)", badge: "bg-emerald-500/20 text-emerald-300", ring: "hsl(160,70%,40%)" },
  communication: { border: "border-cyan-500/50",    glow: "hsla(190,80%,45%,0.4)", badge: "bg-cyan-500/20 text-cyan-300",    ring: "hsl(190,80%,45%)" },
  creation:      { border: "border-purple-500/50",  glow: "hsla(270,70%,55%,0.4)", badge: "bg-purple-500/20 text-purple-300", ring: "hsl(270,70%,55%)" },
  spirit:        { border: "border-amber-500/50",   glow: "hsla(45,90%,55%,0.4)",  badge: "bg-amber-500/20 text-amber-300",   ring: "hsl(45,90%,55%)" },
};

const CATEGORY_LABELS_PL: Record<string, string> = {
  matter: "Materia", growth: "Wzrost", communication: "Komunikacja", creation: "Kreacja", spirit: "Duch",
};
const CATEGORY_LABELS_EN: Record<string, string> = {
  matter: "Matter", growth: "Growth", communication: "Communication", creation: "Creation", spirit: "Spirit",
};

// Gate group ranges for display
const GATE_GROUPS = [
  { range: "1-3",   labelPL: "Bramy Materii",        labelEN: "Matter Gates",        indices: [1, 2, 3] },
  { range: "4-6",   labelPL: "Bramy Wzrostu",         labelEN: "Growth Gates",        indices: [4, 5, 6] },
  { range: "7-9",   labelPL: "Bramy Komunikacji",     labelEN: "Communication Gates", indices: [7, 8, 9] },
  { range: "10-12", labelPL: "Bramy Kreacji",          labelEN: "Creation Gates",      indices: [10, 11, 12] },
  { range: "13-15", labelPL: "Bramy Transformacji",   labelEN: "Transformation Gates",indices: [13, 14, 15] },
  { range: "16-18", labelPL: "Bramy Ducha",            labelEN: "Spirit Gates",        indices: [16, 17, 18] },
];

/** Animated ring that pulses at coherence-derived speed */
function CoherenceRing({ coherence, color }: { coherence: number; color: string }) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * coherence;
  return (
    <svg width="96" height="96" className="absolute inset-0 m-auto" style={{ top: 0, left: 0, right: 0, bottom: 0 }}>
      {/* Track */}
      <circle cx="48" cy="48" r={radius} stroke="hsl(220,15%,20%)" strokeWidth="4" fill="none" />
      {/* Progress */}
      <circle
        cx="48" cy="48" r={radius}
        stroke={color}
        strokeWidth="4"
        fill="none"
        strokeDasharray={`${dash} ${circumference}`}
        strokeLinecap="round"
        transform="rotate(-90 48 48)"
        style={{ transition: "stroke-dasharray 0.8s ease", filter: `drop-shadow(0 0 6px ${color})` }}
      />
    </svg>
  );
}

export const GateActivationPanel = ({ gateIndex, coherence, materializationPotential }: GateActivationPanelProps) => {
  const { language } = useLanguage();
  const pl = language === "pl";

  const gate = getGateByIndex(gateIndex);
  const [activated, setActivated] = useState(false);
  const [commandStep, setCommandStep] = useState(0);
  const [pulse, setPulse] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const colors = gate ? CATEGORY_COLORS[gate.category] : CATEGORY_COLORS.matter;

  // Pulsing glow
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setPulse(Math.sin(Date.now() / 900) * 0.5 + 0.5);
    }, 50);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // Reset when gate changes
  useEffect(() => {
    setActivated(false);
    setCommandStep(0);
  }, [gateIndex]);

  const handleActivate = () => {
    setActivated(true);
    // Step through command words
    if (gate) {
      const words = (pl ? gate.commandPL : gate.commandEN).split(" ");
      let step = 0;
      const stepTimer = setInterval(() => {
        step++;
        setCommandStep(step);
        if (step >= words.length) clearInterval(stepTimer);
      }, 120);
    }
  };

  const handleReset = () => {
    setActivated(false);
    setCommandStep(0);
  };

  if (!gate) return null;

  const command = pl ? gate.commandPL : gate.commandEN;
  const commandWords = command.split(" ");
  const visibleCommand = commandWords.slice(0, commandStep).join(" ");

  const group = GATE_GROUPS.find(g => g.indices.includes(gateIndex));
  const categoryLabel = pl ? CATEGORY_LABELS_PL[gate.category] : CATEGORY_LABELS_EN[gate.category];

  const coherencePct = (coherence * 100).toFixed(1);
  const materialPct = Math.min(100, materializationPotential * 100).toFixed(1);

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-700 ${colors.border}`}
      style={{
        background: `linear-gradient(135deg, ${colors.glow.replace("0.3", activated ? "0.2" : "0.06")}, hsla(220,25%,7%,0.97))`,
        boxShadow: activated ? `0 0 40px ${colors.glow.replace("0.3", "0.5")}` : undefined,
      }}
    >
      {/* Background glow overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 30% 30%, ${colors.glow.replace("0.3", String(pulse * 0.12))}, transparent 60%)`,
        }}
      />

      <CardHeader className="relative z-10 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={`text-[10px] font-mono ${colors.badge}`}>
                {group ? (pl ? group.labelPL : group.labelEN) : ""} — {categoryLabel}
              </Badge>
              <Badge variant="outline" className="text-[10px] font-mono border-border">
                mtDNA {gate.position}
              </Badge>
            </div>
            <CardTitle className="text-xl font-mono flex items-center gap-2">
              <span className="text-2xl">{gate.icon}</span>
              <span>
                <span className="text-muted-foreground text-sm font-normal">Brama {gateIndex} — {gate.greekLetter}</span>
                <br />
                {pl ? gate.namePL : gate.nameEN}
              </span>
            </CardTitle>
            <p className="text-xs text-muted-foreground italic">
              {pl ? gate.subtitlePL : gate.subtitleEN}
            </p>
          </div>

          {/* Gate index badge */}
          <div className="relative flex-shrink-0 w-24 h-24">
            <CoherenceRing coherence={coherence} color={colors.ring} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono font-black text-2xl leading-none" style={{ color: colors.ring }}>
                {gateIndex}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">{coherencePct}%</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 space-y-4">
        {/* Physical constant */}
        <div className="p-3 rounded-lg bg-background/40 border border-border/50 space-y-1">
          <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
            {gate.constantLabel}
          </div>
          <div className="font-mono text-sm font-bold" style={{ color: colors.ring }}>
            {gate.constantFormula}
          </div>
        </div>

        {/* Metrics row */}
        <div className="grid grid-cols-3 gap-2 text-xs font-mono">
          <div className="p-2 rounded bg-background/40 border border-border/40 text-center">
            <div className="text-muted-foreground text-[10px]">{pl ? "Koherencja" : "Coherence"}</div>
            <div className="font-bold" style={{ color: colors.ring }}>{coherencePct}%</div>
          </div>
          <div className="p-2 rounded bg-background/40 border border-border/40 text-center">
            <div className="text-muted-foreground text-[10px]">{pl ? "Potencjał" : "Potential"}</div>
            <div className="font-bold" style={{ color: colors.ring }}>{materialPct}%</div>
          </div>
          <div className="p-2 rounded bg-background/40 border border-border/40 text-center">
            <div className="text-muted-foreground text-[10px]">Status</div>
            <div className="font-bold text-[11px]" style={{ color: colors.ring }}>{gate.systemStatus}</div>
          </div>
        </div>

        {/* Effect */}
        <div className="p-3 rounded-lg bg-background/40 border border-border/50">
          <div className="text-[10px] text-muted-foreground font-mono mb-1">{pl ? "EFEKT BRAMY:" : "GATE EFFECT:"}</div>
          <p className="text-xs leading-relaxed text-foreground/80">
            {pl ? gate.effectPL : gate.effectEN}
          </p>
        </div>

        {/* Quantum Command — ACTIVATED */}
        {activated && (
          <div
            className="p-4 rounded-xl border animate-fade-in"
            style={{
              borderColor: colors.ring + "60",
              background: `linear-gradient(135deg, ${colors.glow.replace("0.3", "0.15")}, hsla(220,25%,7%,0.9))`,
              boxShadow: `inset 0 0 30px ${colors.glow.replace("0.3", "0.15")}`,
            }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <Check className="w-3.5 h-3.5" style={{ color: colors.ring }} />
              <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: colors.ring }}>
                {pl ? "Komenda Kwantowa — Aktywna" : "Quantum Command — Active"}
              </span>
            </div>
            <p className="font-mono text-sm leading-relaxed" style={{ color: colors.ring }}>
              {visibleCommand}
              {commandStep < commandWords.length && (
                <span className="animate-pulse ml-1">▋</span>
              )}
            </p>
          </div>
        )}

        {/* Activate button */}
        <div className="flex gap-2">
          {!activated ? (
            <Button
              onClick={handleActivate}
              className="flex-1 h-12 font-bold font-mono text-sm"
              style={{
                background: `linear-gradient(135deg, ${colors.ring}, ${colors.ring.replace("hsl", "hsla").replace(")", ", 0.7)")})`,
                boxShadow: `0 0 20px ${colors.glow}`,
              }}
            >
              <Zap className="w-4 h-4 mr-2" />
              {pl ? `⚡ Aktywuj Bramę ${gateIndex}` : `⚡ Activate Gate ${gateIndex}`}
            </Button>
          ) : (
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex-1 h-10 font-mono text-xs"
              style={{ borderColor: colors.ring + "50" }}
            >
              <RotateCcw className="w-3.5 h-3.5 mr-2" />
              {pl ? "Resetuj" : "Reset"}
            </Button>
          )}
        </div>

        {/* Gate selector — show all 18 gates in groups */}
        <div className="pt-2 border-t border-border/30">
          <div className="text-[10px] text-muted-foreground font-mono mb-2 uppercase tracking-widest">
            {pl ? "Wszystkie 18 Bram mtDNA:" : "All 18 mtDNA Gates:"}
          </div>
          <div className="space-y-1.5">
            {GATE_GROUPS.map((grp) => (
              <div key={grp.range} className="flex items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground font-mono w-8">{grp.range}</span>
                <div className="flex gap-1 flex-wrap">
                  {grp.indices.map((idx) => {
                    const g = getGateByIndex(idx);
                    const isActive = idx === gateIndex;
                    const cat = g?.category || "matter";
                    const c = CATEGORY_COLORS[cat];
                    return (
                      <span
                        key={idx}
                        className={`inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded border transition-all duration-300 ${
                          isActive
                            ? `${c.badge} ${c.border} scale-110 shadow-sm`
                            : "border-border/30 text-muted-foreground/50 bg-background/20"
                        }`}
                        title={g ? (pl ? g.namePL : g.nameEN) : ""}
                      >
                        {g?.icon} {idx}
                        {isActive && <span className="text-[8px] ml-0.5">●</span>}
                      </span>
                    );
                  })}
                </div>
                <span className="text-[10px] text-muted-foreground/50 font-mono ml-1">
                  {pl ? grp.labelPL : grp.labelEN}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
