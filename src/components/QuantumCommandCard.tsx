import { Zap } from "lucide-react";
import { useState } from "react";
import { getGateByPosition, type GateDefinition } from "@/lib/gateDefinitions";
import { useLanguage } from "@/contexts/LanguageContext";

interface QuantumCommandCardProps {
  gatePosition: number;
}

/**
 * Displays the quantum command for the dominant gate detected by the decoder.
 * The command is hidden behind a Ψ hover/click reveal.
 */
export const QuantumCommandCard = ({ gatePosition }: QuantumCommandCardProps) => {
  const { language } = useLanguage();
  const [isRevealed, setIsRevealed] = useState(false);
  const gate = getGateByPosition(gatePosition);

  if (!gate) return null;

  const pl = language === 'pl';

  return (
    <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 p-4 space-y-3">
      {/* Gate header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{gate.icon}</span>
          <div>
            <div className="font-mono font-bold text-sm text-primary">
              {pl ? 'Dominująca Brama' : 'Dominant Gate'}: {gate.greekLetter} #{gate.index}
            </div>
            <div className="text-xs text-muted-foreground">
              {pl ? gate.namePL : gate.nameEN} — {pl ? gate.subtitlePL : gate.subtitleEN}
            </div>
          </div>
        </div>
        <span className="text-xs font-mono text-muted-foreground">mtDNA {gate.position}</span>
      </div>

      {/* Ψ reveal */}
      <div className="text-center">
        <button
          onClick={() => setIsRevealed(!isRevealed)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/30 transition-all group"
        >
          <span className="text-2xl font-bold font-mono text-primary group-hover:animate-pulse">Ψ</span>
          <span className="text-xs text-muted-foreground">
            {isRevealed
              ? (pl ? 'Ukryj komendę' : 'Hide command')
              : (pl ? 'Ujawnij Komendę Kwantową' : 'Reveal Quantum Command')
            }
          </span>
        </button>
      </div>

      {/* Revealed command */}
      {isRevealed && (
        <div className="animate-fade-in space-y-3">
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-1.5 mb-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-xs font-mono text-primary font-bold uppercase tracking-wider">
                {pl ? 'Komenda Kwantowa' : 'Quantum Command'}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-foreground italic font-medium">
              &ldquo;{pl ? gate.commandPL : gate.commandEN}&rdquo;
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded bg-muted/30 border border-border/50 font-mono">
              <span className="text-muted-foreground">{gate.constantLabel}:</span>
              <div className={gate.color}>{gate.constantFormula}</div>
            </div>
            <div className="p-2 rounded bg-muted/30 border border-border/50">
              <span className="text-muted-foreground font-mono">{pl ? 'Efekt:' : 'Effect:'}</span>
              <div className="text-muted-foreground">{pl ? gate.effectPL : gate.effectEN}</div>
            </div>
          </div>

          <div className="text-center">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-mono font-bold">
              System: {gate.systemStatus}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
