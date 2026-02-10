import { useState } from "react";
import { useResonance } from "@/contexts/ResonanceContext";
import { PentagramSphere } from "./PentagramSphere";
import { Loader2, Dna, Zap, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Lazy imports for debug components
import RiemannCorrelationAnalyzer from "./RiemannCorrelationAnalyzer";
import { ResonanceTuner } from "./ResonanceTuner";
import { EquationOfExit } from "./EquationOfExit";
import { IntentionVectorCalculator } from "./IntentionVectorCalculator";

const MasterPanel = () => {
  const { 
    activateBrama, 
    status, 
    isProcessing, 
    coherence, 
    tunedFreq,
    processingStatus,
    state,
  } = useResonance();
  
  const [inputValue, setInputValue] = useState("");
  const [isDebugOpen, setIsDebugOpen] = useState(false);

  const handleActivate = () => {
    activateBrama(inputValue || undefined);
  };

  const coherencePercent = (coherence * 100).toFixed(2);
  const isActive = processingStatus === "active";
  const isError = processingStatus === "error";

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 p-4">
      {/* SEKCJA 1: WEJŚCIE DNA */}
      <section className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Dna className="w-5 h-5" />
          <h2 className="font-mono font-semibold">DANE WEJŚCIOWE</h2>
        </div>
        
        <Textarea 
          placeholder="Wklej sekwencję rCRS lub pozycje mtDNA (np. 1, 740, 951...)&#10;Pozostaw puste dla domyślnych 18 pozycji rCRS"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="min-h-[100px] font-mono text-sm bg-background/50 border-border"
          disabled={isProcessing}
        />
        
        <div className="flex items-center justify-between gap-4">
          <Button
            onClick={handleActivate}
            disabled={isProcessing}
            className={`flex-1 h-12 font-bold text-lg transition-all ${
              isActive 
                ? "bg-amber-500 hover:bg-amber-600 text-black" 
                : "bg-primary hover:bg-primary/90"
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                PRZETWARZANIE...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                AKTYWUJ BRAMĘ
              </>
            )}
          </Button>
        </div>
        
        {/* Status Bar */}
        <div className={`p-3 rounded-lg font-mono text-sm text-center transition-colors ${
          isActive 
            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" 
            : isError
            ? "bg-destructive/20 text-destructive border border-destructive/30"
            : "bg-muted/50 text-muted-foreground border border-border"
        }`}>
          {status}
        </div>
      </section>

      {/* SEKCJA 2: SERCE - WIZUALIZACJA I WYNIK */}
      <section className="bg-card/50 backdrop-blur-sm border border-border rounded-xl overflow-hidden">
        {/* 3D Visualization */}
        <div className="h-[400px] relative">
          <PentagramSphere />
        </div>
        
        {/* Main Display */}
        <div className="p-6 border-t border-border bg-background/30">
          <div className="text-center space-y-2">
            <h1 className={`text-4xl md:text-5xl font-bold font-mono transition-colors ${
              isActive ? "text-amber-400" : "text-foreground"
            }`}>
              {coherencePercent}% <span className="text-lg text-muted-foreground">UNIFIKACJI</span>
            </h1>
            <p className="text-lg font-mono text-muted-foreground">
              Częstotliwość: <span className="text-primary">{tunedFreq.toFixed(6)} Hz</span>
            </p>
            <div className="flex justify-center gap-6 text-sm text-muted-foreground mt-4">
              <span>Brama: <span className="text-primary">{state.activeGateIndex || 1}/18</span></span>
              <span>|ζ(s)|: <span className="text-primary">{state.distanceToZero.toFixed(4)}</span></span>
              <span>Wyrównanie: <span className={state.isAligned ? "text-green-400" : "text-muted-foreground"}>
                {state.isAligned ? "TAK" : "NIE"}
              </span></span>
            </div>
          </div>
        </div>
      </section>

      {/* SEKCJA 3: RÓWNANIE WYJŚCIA */}
      <EquationOfExit />

      {/* SEKCJA 3.5: WEKTOR INTENCJI */}
      <IntentionVectorCalculator />

      {/* SEKCJA 4: BEBECHY - Panel Debug */}
      <Collapsible open={isDebugOpen} onOpenChange={setIsDebugOpen}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-between font-mono"
          >
            <span>Parametry Techniczne (Kalkulatory)</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isDebugOpen ? "rotate-180" : ""}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 space-y-4">
          <div className="grid gap-4">
            <ResonanceTuner />
            <RiemannCorrelationAnalyzer />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default MasterPanel;
