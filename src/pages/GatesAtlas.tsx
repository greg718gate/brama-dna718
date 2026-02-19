import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Zap, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { GATE_DEFINITIONS, CATEGORY_LABELS, type GateDefinition } from "@/lib/gateDefinitions";

const categoryOrder = ['matter', 'growth', 'communication', 'creation', 'spirit'] as const;

const GatesAtlas = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [selectedGate, setSelectedGate] = useState<GateDefinition | null>(null);
  const [revealedCommands, setRevealedCommands] = useState<Set<number>>(new Set());

  const toggleReveal = (index: number) => {
    setRevealedCommands(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const pl = language === 'pl';

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Sparkles className="w-5 h-5 text-primary" />
          <h1 className="font-bold text-lg">{pl ? 'Atlas 18 Bram Świadomości' : 'Atlas of 18 Gates of Consciousness'}</h1>
          <div className="ml-auto">
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Intro */}
        <div className="text-center mb-8 space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold font-mono text-primary">
            Ψ-718 {pl ? 'Mapa Bram' : 'Gate Map'}
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            {pl
              ? 'Każda brama odpowiada pozycji w mitochondrialnym DNA (rCRS), stałej fizycznej i komendzie aktywacyjnej. Najedź na symbol Ψ, aby ujawnić ukrytą komendę kwantową.'
              : 'Each gate corresponds to a mitochondrial DNA position (rCRS), a physical constant, and an activation command. Hover over the Ψ symbol to reveal the hidden quantum command.'}
          </p>
        </div>

        {/* Category sections */}
        {categoryOrder.map(cat => {
          const catLabel = CATEGORY_LABELS[cat];
          const gates = GATE_DEFINITIONS.filter(g => g.category === cat);

          return (
            <div key={cat} className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <h3 className={`font-mono font-bold text-lg ${catLabel.color}`}>
                  {pl ? catLabel.pl : catLabel.en}
                </h3>
                <Separator className="flex-1" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gates.map(gate => {
                  const isRevealed = revealedCommands.has(gate.index);
                  const isSelected = selectedGate?.index === gate.index;

                  return (
                    <Card
                      key={gate.index}
                      className={`cursor-pointer transition-all duration-300 border hover:border-primary/50 ${
                        isSelected ? 'border-primary ring-1 ring-primary/30' : 'border-border'
                      } bg-gradient-to-br ${gate.bgGradient}`}
                      onClick={() => setSelectedGate(isSelected ? null : gate)}
                    >
                      <CardContent className="pt-5 space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{gate.icon}</span>
                            <div>
                              <div className="font-mono font-bold text-sm">
                                {gate.greekLetter} <span className="text-muted-foreground">#{gate.index}</span>
                              </div>
                              <div className={`text-xs font-semibold ${gate.color}`}>
                                {pl ? gate.namePL : gate.nameEN}
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-[10px] font-mono">
                            mtDNA {gate.position}
                          </Badge>
                        </div>

                        {/* Subtitle */}
                        <p className="text-xs text-muted-foreground">
                          {pl ? gate.subtitlePL : gate.subtitleEN}
                        </p>

                        {/* Physical constant */}
                        <div className="p-2 rounded bg-background/40 border border-border/50 font-mono text-xs space-y-0.5">
                          <div className="text-muted-foreground">{gate.constantLabel}</div>
                          <div className={gate.color}>{gate.constantFormula}</div>
                        </div>

                        {/* Ψ reveal trigger */}
                        <div className="flex items-center justify-between pt-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleReveal(gate.index); }}
                            className="group flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors"
                            title={pl ? 'Ujawnij komendę kwantową' : 'Reveal quantum command'}
                          >
                            <span className="text-xl font-bold font-mono group-hover:animate-pulse">Ψ</span>
                            {isRevealed
                              ? <EyeOff className="w-3.5 h-3.5" />
                              : <Eye className="w-3.5 h-3.5" />
                            }
                          </button>
                          <Badge variant="secondary" className="text-[10px] font-mono">
                            {gate.systemStatus}
                          </Badge>
                        </div>

                        {/* Hidden quantum command */}
                        {isRevealed && (
                          <div className="animate-fade-in space-y-2 pt-1">
                            <Separator />
                            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <Zap className="w-3.5 h-3.5 text-primary" />
                                <span className="text-[10px] font-mono text-primary font-bold uppercase">
                                  {pl ? 'Komenda Kwantowa' : 'Quantum Command'}
                                </span>
                              </div>
                              <p className="text-xs leading-relaxed text-foreground italic">
                                &ldquo;{pl ? gate.commandPL : gate.commandEN}&rdquo;
                              </p>
                            </div>
                            <div className="p-2 rounded bg-muted/30 border border-border/50">
                              <span className="text-[10px] text-muted-foreground font-mono">
                                {pl ? 'Efekt: ' : 'Effect: '}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {pl ? gate.effectPL : gate.effectEN}
                              </span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Footer note */}
        <div className="text-center py-8 text-xs text-muted-foreground font-mono space-y-1">
          <p>Ψ = e^(i·718·t) · ζ(1/2 + iE/ħ) · γ</p>
          <p>© 2026 Grzegorz | BRAMA-718-UNIFIED | CC BY-NC 4.0</p>
        </div>
      </div>
    </div>
  );
};

export default GatesAtlas;
