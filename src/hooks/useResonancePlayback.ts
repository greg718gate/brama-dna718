import { useCallback, useRef, useEffect } from "react";
import { useResonance } from "@/contexts/ResonanceContext";
import { analyzeAtTime } from "@/lib/riemannCorrelationAnalyzer";

interface UseResonancePlaybackOptions {
  updateInterval?: number; // ms between updates
}

/**
 * Hook do integracji analizy rezonansu z odtwarzaniem symfonii
 * Aktualizuje globalny stan ResonanceContext podczas odtwarzania
 */
export function useResonancePlayback(options: UseResonancePlaybackOptions = {}) {
  const { updateInterval = 100 } = options;
  const { updateResonance, triggerVisualEffect } = useResonance();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastGateRef = useRef<number>(0);

  /**
   * Analizuje aktualny czas i aktualizuje stan rezonansu
   */
  const handleAnalysisUpdate = useCallback((currentTime: number) => {
    const result = analyzeAtTime(currentTime);
    
    // Aktualizacja globalnego stanu
    updateResonance({
      currentTime: result.currentTime,
      activeGateIndex: result.gateIndex,
      distanceToZero: result.zetaValue,
      isAligned: result.isNearZero,
      coherenceLevel: result.coherence,
      isPlaying: true,
    });
    
    // Wyzwalacz wizualny dla "Złotego Błysku"
    if (result.isNearZero) {
      triggerVisualEffect("GOLDEN_RESONANCE", { 
        intensity: result.coherence,
        gateIndex: result.gateIndex,
      });
    }
    
    // Wyzwalacz przejścia między bramami
    if (result.gateIndex !== lastGateRef.current) {
      lastGateRef.current = result.gateIndex;
      triggerVisualEffect("GATE_TRANSITION", {
        intensity: 0.8,
        gateIndex: result.gateIndex,
      });
    }
    
    return result;
  }, [updateResonance, triggerVisualEffect]);

  /**
   * Rozpoczyna ciągłą analizę podczas odtwarzania
   */
  const startResonanceTracking = useCallback((
    getCurrentTime: () => number
  ) => {
    // Zatrzymaj poprzedni tracking
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    lastGateRef.current = 0;
    
    updateResonance({ isPlaying: true });
    
    intervalRef.current = setInterval(() => {
      const currentTime = getCurrentTime();
      handleAnalysisUpdate(currentTime);
    }, updateInterval);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [handleAnalysisUpdate, updateInterval, updateResonance]);

  /**
   * Zatrzymuje tracking
   */
  const stopResonanceTracking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    updateResonance({ 
      isPlaying: false,
      isAligned: false,
      coherenceLevel: 0,
    });
  }, [updateResonance]);

  // Cleanup przy unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    handleAnalysisUpdate,
    startResonanceTracking,
    stopResonanceTracking,
  };
}
