import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { findOptimalResonancePrecise, ScanResult, DEFAULT_GATE_POSITIONS } from "@/lib/resonanceTuner";

// Struktura stanu rezonansu zgodnie z planem
export interface ResonanceState {
  isAligned: boolean;       // Czy aktualna Brama trafia w zero Riemanna?
  coherenceLevel: number;   // Skuteczność unifikacji (0.0 - 1.0)
  activeGateIndex: number;  // Indeks aktualnie odtwarzanej Bramy (1-18)
  distanceToZero: number;   // Jak blisko zera Riemanna jesteśmy (< 0.1 = trafienie)
  isPlaying: boolean;       // Czy symfonia jest odtwarzana
  currentTime: number;      // Aktualny czas odtwarzania
}

export type VisualEffectType = "GOLDEN_RESONANCE" | "GATE_TRANSITION" | "ZERO_POINT" | "TUNED";

interface VisualEffectPayload {
  type: VisualEffectType;
  intensity: number;
  gateIndex?: number;
  freq?: number;
}

interface ResonanceContextType {
  state: ResonanceState;
  updateResonance: (update: Partial<ResonanceState>) => void;
  triggerVisualEffect: (type: VisualEffectType, payload: { intensity: number; gateIndex?: number; freq?: number }) => void;
  activeEffect: VisualEffectPayload | null;
  clearEffect: () => void;
  // Nowe pola dla tunera
  tunedFrequency: number;
  setTunedFrequency: (freq: number) => void;
  runAutoTune: (positions?: number[]) => ScanResult;
}

const defaultState: ResonanceState = {
  isAligned: false,
  coherenceLevel: 0,
  activeGateIndex: 0,
  distanceToZero: 1,
  isPlaying: false,
  currentTime: 0,
};

const ResonanceContext = createContext<ResonanceContextType | undefined>(undefined);

export function ResonanceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ResonanceState>(defaultState);
  const [activeEffect, setActiveEffect] = useState<VisualEffectPayload | null>(null);
  const [tunedFrequency, setTunedFrequency] = useState(718.0);

  const updateResonance = useCallback((update: Partial<ResonanceState>) => {
    setState(prev => ({ ...prev, ...update }));
  }, []);

  const triggerVisualEffect = useCallback((type: VisualEffectType, payload: { intensity: number; gateIndex?: number; freq?: number }) => {
    setActiveEffect({ type, ...payload });
    
    // Auto-clear effect after animation duration
    const duration = type === "GOLDEN_RESONANCE" ? 2000 : type === "TUNED" ? 3000 : 1000;
    setTimeout(() => {
      setActiveEffect(null);
    }, duration);
  }, []);

  const clearEffect = useCallback(() => {
    setActiveEffect(null);
  }, []);

  const runAutoTune = useCallback((positions: number[] = DEFAULT_GATE_POSITIONS): ScanResult => {
    const result = findOptimalResonancePrecise(positions);
    
    if (result.success || result.minZetaValue < 1.0) {
      setTunedFrequency(result.optimalFreq);
      
      // Wyzwól efekt wizualny TUNED
      triggerVisualEffect("TUNED", { 
        intensity: result.success ? 1.0 : 0.5,
        freq: result.optimalFreq 
      });
      
      // Jeśli sukces (< 0.1), wyzwól też Złoty Błysk
      if (result.success) {
        setTimeout(() => {
          triggerVisualEffect("GOLDEN_RESONANCE", { 
            intensity: 1.0,
            gateIndex: 1 
          });
        }, 500);
      }
    }
    
    return result;
  }, [triggerVisualEffect]);

  return (
    <ResonanceContext.Provider value={{ 
      state, 
      updateResonance, 
      triggerVisualEffect, 
      activeEffect,
      clearEffect,
      tunedFrequency,
      setTunedFrequency,
      runAutoTune,
    }}>
      {children}
    </ResonanceContext.Provider>
  );
}

export function useResonance() {
  const context = useContext(ResonanceContext);
  if (context === undefined) {
    throw new Error("useResonance must be used within a ResonanceProvider");
  }
  return context;
}

// Hook do analizy w czasie rzeczywistym
export function useResonanceAnalysis() {
  const { state, updateResonance, triggerVisualEffect } = useResonance();
  
  const analyzeAtTime = useCallback((
    currentTime: number, 
    zetaValue: number, 
    gateIndex: number
  ) => {
    const isNearZero = zetaValue < 0.1;
    const coherence = Math.max(0, 1 - zetaValue);
    
    updateResonance({
      currentTime,
      activeGateIndex: gateIndex,
      distanceToZero: zetaValue,
      isAligned: isNearZero,
      coherenceLevel: coherence,
    });
    
    // Wyzwalacz wizualny dla "Złotego Błysku"
    if (isNearZero) {
      triggerVisualEffect("GOLDEN_RESONANCE", { 
        intensity: coherence,
        gateIndex 
      });
    }
    
    return { isNearZero, coherence };
  }, [updateResonance, triggerVisualEffect]);
  
  return { state, analyzeAtTime };
}
