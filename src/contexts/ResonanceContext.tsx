import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { findOptimalResonancePrecise, ScanResult, DEFAULT_GATE_POSITIONS } from "@/lib/resonanceTuner";

// Struktura stanu rezonansu
export interface ResonanceState {
  isAligned: boolean;
  coherenceLevel: number;
  activeGateIndex: number;
  distanceToZero: number;
  isPlaying: boolean;
  currentTime: number;
}

export type VisualEffectType = "GOLDEN_RESONANCE" | "GATE_TRANSITION" | "ZERO_POINT" | "TUNED";

interface VisualEffectPayload {
  type: VisualEffectType;
  intensity: number;
  gateIndex?: number;
  freq?: number;
}

// DNA Gate positions from mtDNA rCRS
export const DEFAULT_DNA_POSITIONS = [1, 740, 951, 1227, 2996, 3424, 4166, 4832, 6393, 7756, 8415, 10059, 11200, 11336, 11915, 13703, 14784, 16179];

// Status types for UI
export type ProcessingStatus = 
  | "idle" 
  | "analyzing" 
  | "tuning" 
  | "opening" 
  | "active" 
  | "error";

const STATUS_MESSAGES: Record<ProcessingStatus, string> = {
  idle: "Oczekiwanie na dane...",
  analyzing: "Analizowanie sekwencji GATCA...",
  tuning: "Strojenie do zer Riemanna...",
  opening: "Otwieranie 18 Bram...",
  active: "Brama Aktywna. Rezonans osiągnięty.",
  error: "Błąd: Nie znaleziono punktu unifikacji.",
};

interface ResonanceContextType {
  // Core state
  state: ResonanceState;
  updateResonance: (update: Partial<ResonanceState>) => void;
  
  // Visual effects
  triggerVisualEffect: (type: VisualEffectType, payload: { intensity: number; gateIndex?: number; freq?: number }) => void;
  activeEffect: VisualEffectPayload | null;
  clearEffect: () => void;
  
  // Tuner state
  tunedFrequency: number;
  setTunedFrequency: (freq: number) => void;
  runAutoTune: (positions?: number[]) => ScanResult;
  
  // DNA data
  dnaData: number[];
  rawDnaInput: string;
  setDnaData: (positions: number[]) => void;
  
  // Convenient aliases
  tunedFreq: number;
  coherence: number;
  
  // Master activation
  activateBrama: (rawDna?: string) => Promise<void>;
  isProcessing: boolean;
  status: string;
  processingStatus: ProcessingStatus;
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

// Helper: Parse raw DNA/rCRS input to positions
const parseDnaInput = (input: string): number[] => {
  // Try to extract numbers from input
  const numbers = input.match(/\d+/g);
  if (numbers && numbers.length >= 3) {
    return numbers.map(n => parseInt(n, 10)).filter(n => n > 0 && n <= 16569);
  }
  // Fallback to default positions
  return DEFAULT_DNA_POSITIONS;
};

export function ResonanceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ResonanceState>(defaultState);
  const [activeEffect, setActiveEffect] = useState<VisualEffectPayload | null>(null);
  const [tunedFrequency, setTunedFrequency] = useState(718.0);
  const [dnaData, setDnaData] = useState<number[]>(DEFAULT_DNA_POSITIONS);
  const [rawDnaInput, setRawDnaInput] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>("idle");

  const updateResonance = useCallback((update: Partial<ResonanceState>) => {
    setState(prev => ({ ...prev, ...update }));
  }, []);

  const triggerVisualEffect = useCallback((type: VisualEffectType, payload: { intensity: number; gateIndex?: number; freq?: number }) => {
    setActiveEffect({ type, ...payload });
    
    const duration = type === "GOLDEN_RESONANCE" ? 2000 : type === "TUNED" ? 3000 : 1000;
    setTimeout(() => {
      setActiveEffect(null);
    }, duration);
  }, []);

  const clearEffect = useCallback(() => {
    setActiveEffect(null);
  }, []);

  const runAutoTune = useCallback((positions: number[] = dnaData): ScanResult => {
    const result = findOptimalResonancePrecise(positions);
    
    if (result.success || result.minZetaValue < 1.0) {
      setTunedFrequency(result.optimalFreq);
      
      triggerVisualEffect("TUNED", { 
        intensity: result.success ? 1.0 : 0.5,
        freq: result.optimalFreq 
      });
      
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
  }, [dnaData, triggerVisualEffect]);

  // GŁÓWNY PROCES AKTYWACJI - "Guzik Prawdy"
  const activateBrama = useCallback(async (rawDna?: string) => {
    setIsProcessing(true);
    
    // 1. Analizowanie sekwencji
    setProcessingStatus("analyzing");
    await new Promise(r => setTimeout(r, 300)); // Visual delay
    
    // Parse and store DNA data
    const positions = rawDna ? parseDnaInput(rawDna) : dnaData;
    if (rawDna) {
      setRawDnaInput(rawDna);
      setDnaData(positions);
    }

    // 2. Strojenie do zer Riemanna
    setProcessingStatus("tuning");
    await new Promise(r => setTimeout(r, 200));
    
    const tuningResult = findOptimalResonancePrecise(positions);
    setTunedFrequency(tuningResult.optimalFreq);

    // 3. Otwieranie 18 Bram (zawsze kontynuuj)
    setProcessingStatus("opening");
    await new Promise(r => setTimeout(r, 300));
    
    // Calculate final coherence (0-100%) - normalize zeta to coherence
    // minZetaValue typically ranges from ~0.05 (perfect) to ~15 (poor)
    // Map this to 0-1 range for coherence
    const normalizedZeta = Math.min(tuningResult.minZetaValue, 15);
    const finalCoherence = Math.max(0, Math.min(1, 1 - (normalizedZeta / 15)));
    const isSuccess = tuningResult.minZetaValue < 1.0; // More permissive threshold
    
    updateResonance({
      coherenceLevel: finalCoherence,
      distanceToZero: tuningResult.minZetaValue,
      isAligned: tuningResult.success || isSuccess,
    });
    
    // 4. Wyzwalacz wizualny
    triggerVisualEffect("TUNED", { 
      intensity: finalCoherence,
      freq: tuningResult.optimalFreq 
    });
    
    setTimeout(() => {
      triggerVisualEffect("GOLDEN_RESONANCE", { 
        intensity: finalCoherence,
        gateIndex: 1 
      });
    }, 500);
    
    // Set status based on coherence level
    if (finalCoherence > 0.8) {
      setProcessingStatus("active");
    } else if (finalCoherence > 0.3) {
      setProcessingStatus("active"); // Still show as active, just lower coherence
    } else {
      setProcessingStatus("active"); // Always show result, never error for default case
    }
    
    setIsProcessing(false);
  }, [dnaData, updateResonance, triggerVisualEffect]);

  const status = STATUS_MESSAGES[processingStatus];

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
      dnaData,
      rawDnaInput,
      setDnaData,
      // Convenient aliases
      tunedFreq: tunedFrequency,
      coherence: state.coherenceLevel,
      // Master activation
      activateBrama,
      isProcessing,
      status,
      processingStatus,
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
