import { createContext, useContext, useState, useCallback, ReactNode } from "react";

// Struktura stanu rezonansu zgodnie z planem
export interface ResonanceState {
  isAligned: boolean;       // Czy aktualna Brama trafia w zero Riemanna?
  coherenceLevel: number;   // Skuteczność unifikacji (0.0 - 1.0)
  activeGateIndex: number;  // Indeks aktualnie odtwarzanej Bramy (1-18)
  distanceToZero: number;   // Jak blisko zera Riemanna jesteśmy (< 0.1 = trafienie)
  isPlaying: boolean;       // Czy symfonia jest odtwarzana
  currentTime: number;      // Aktualny czas odtwarzania
}

export type VisualEffectType = "GOLDEN_RESONANCE" | "GATE_TRANSITION" | "ZERO_POINT";

interface VisualEffectPayload {
  type: VisualEffectType;
  intensity: number;
  gateIndex?: number;
}

interface ResonanceContextType {
  state: ResonanceState;
  updateResonance: (update: Partial<ResonanceState>) => void;
  triggerVisualEffect: (type: VisualEffectType, payload: { intensity: number; gateIndex?: number }) => void;
  activeEffect: VisualEffectPayload | null;
  clearEffect: () => void;
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

  const updateResonance = useCallback((update: Partial<ResonanceState>) => {
    setState(prev => ({ ...prev, ...update }));
  }, []);

  const triggerVisualEffect = useCallback((type: VisualEffectType, payload: { intensity: number; gateIndex?: number }) => {
    setActiveEffect({ type, ...payload });
    
    // Auto-clear effect after animation duration
    setTimeout(() => {
      setActiveEffect(null);
    }, type === "GOLDEN_RESONANCE" ? 2000 : 1000);
  }, []);

  const clearEffect = useCallback(() => {
    setActiveEffect(null);
  }, []);

  return (
    <ResonanceContext.Provider value={{ 
      state, 
      updateResonance, 
      triggerVisualEffect, 
      activeEffect,
      clearEffect 
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
