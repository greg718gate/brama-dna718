/**
 * Riemann Correlation Analyzer
 * Analiza korelacji między Symfonią 18 Bram DNA a linią krytyczną Riemanna
 */

import { riemannZeta, complexAbs, H_BAR, GAMMA } from './bramaUnificationEngine';

export interface CorrelationResult {
  peakTime: number;
  energy: number;
  zetaValue: number;
  isNearZero: boolean;
}

export interface AnalysisResult {
  correlations: CorrelationResult[];
  successRate: number;
  totalPeaks: number;
  nearZeroCount: number;
  averageZetaMagnitude: number;
  minZetaMagnitude: number;
  maxZetaMagnitude: number;
}

// Wynik analizy w czasie rzeczywistym
export interface RealtimeAnalysisResult {
  currentTime: number;
  gateIndex: number;
  energy: number;
  zetaValue: number;
  isNearZero: boolean;
  coherence: number;
}

const FREQ_718 = 718;
const ZERO_THRESHOLD = 0.1; // Próg bliskości zera Riemanna

// Pozycje 18 Bram DNA w czasie (w sekundach) - obliczone na podstawie symfonii
const GATE_TIMES = [
  0, 7.2, 14.4, 21.6, 28.8, 36.0, 43.2, 50.4, 57.6,
  64.8, 72.0, 79.2, 86.4, 93.6, 100.8, 108.0, 115.2, 122.4
];

/**
 * Określa indeks aktualnej Bramy na podstawie czasu odtwarzania
 */
export const getGateIndexAtTime = (currentTime: number): number => {
  for (let i = GATE_TIMES.length - 1; i >= 0; i--) {
    if (currentTime >= GATE_TIMES[i]) {
      return i + 1; // Bramy numerowane od 1
    }
  }
  return 1;
};

/**
 * Analizuje punkt w czasie rzeczywistym
 */
export const analyzeAtTime = (currentTime: number): RealtimeAnalysisResult => {
  const gateIndex = getGateIndexAtTime(currentTime);
  
  // Mapowanie czasu na energię: E = t × 718 × ħ
  const energy = currentTime * FREQ_718 * H_BAR;
  
  // Obliczenie wartości funkcji Zeta na linii krytycznej
  // s = 1/2 + i(E/ħ)
  const s = { re: 0.5, im: energy / H_BAR };
  const zetaComplex = riemannZeta(s, 30); // Mniejsza precyzja dla wydajności
  const zetaValue = complexAbs(zetaComplex);
  
  const isNearZero = zetaValue < ZERO_THRESHOLD;
  const coherence = Math.max(0, Math.min(1, 1 - zetaValue)); // Normalizacja do 0-1
  
  return {
    currentTime,
    gateIndex,
    energy,
    zetaValue,
    isNearZero,
    coherence,
  };
};

/**
 * Wykrywa szczyty energii w danych audio (gdzie amplituda > gamma = 0.618)
 */
export const detectPeaks = (
  audioData: Float32Array,
  sampleRate: number,
  threshold: number = GAMMA
): number[] => {
  const peaks: number[] = [];
  
  for (let i = 0; i < audioData.length; i++) {
    if (Math.abs(audioData[i]) > threshold) {
      // Konwersja indeksu na czas w sekundach
      const time = i / sampleRate;
      peaks.push(time);
    }
  }
  
  // Deduplikacja - grupowanie bliskich czasów (w oknie 0.01s)
  const deduplicated: number[] = [];
  let lastPeak = -1;
  
  for (const peak of peaks) {
    if (lastPeak === -1 || peak - lastPeak > 0.01) {
      deduplicated.push(peak);
      lastPeak = peak;
    }
  }
  
  return deduplicated;
};

/**
 * Mapuje czas szczytów na energię Riemanna
 * t -> E (zgodnie z równaniem Ψ)
 */
export const mapTimeToEnergy = (peakTimes: number[]): number[] => {
  return peakTimes.map(t => t * FREQ_718 * H_BAR);
};

/**
 * Sprawdza wyrównanie z linią krytyczną Riemanna
 * s = 1/2 + iE/ħ
 */
export const checkRiemannAlignment = (energies: number[]): number[] => {
  return energies.map(E => {
    // s = 1/2 + i(E/ħ)
    const s = { re: 0.5, im: E / H_BAR };
    const zetaValue = riemannZeta(s, 50);
    // Im mniejsza wartość bezwzględna ζ, tym bliżej zera Riemanna
    return complexAbs(zetaValue);
  });
};

/**
 * Pełna analiza korelacji Symfonia vs. Funkcja Zeta
 */
export const analyzeCorrelation = (
  audioBuffer: AudioBuffer,
  channel: number = 0
): AnalysisResult => {
  const audioData = audioBuffer.getChannelData(channel);
  const sampleRate = audioBuffer.sampleRate;
  
  // 1. Wykrywanie szczytów energii (Bram)
  const peakTimes = detectPeaks(audioData, sampleRate, GAMMA);
  
  // 2. Mapowanie czasu na energię Riemanna
  const energies = mapTimeToEnergy(peakTimes);
  
  // 3. Test linii krytycznej
  const zetaMagnitudes = checkRiemannAlignment(energies);
  
  // 4. Budowanie wyników korelacji
  const correlations: CorrelationResult[] = peakTimes.map((time, i) => ({
    peakTime: time,
    energy: energies[i],
    zetaValue: zetaMagnitudes[i],
    isNearZero: zetaMagnitudes[i] < ZERO_THRESHOLD,
  }));
  
  // 5. Obliczanie statystyk
  const nearZeroCount = correlations.filter(c => c.isNearZero).length;
  const successRate = peakTimes.length > 0 
    ? (nearZeroCount / peakTimes.length) * 100 
    : 0;
  
  const averageZetaMagnitude = zetaMagnitudes.length > 0
    ? zetaMagnitudes.reduce((sum, v) => sum + v, 0) / zetaMagnitudes.length
    : 0;
  
  const minZetaMagnitude = zetaMagnitudes.length > 0
    ? Math.min(...zetaMagnitudes)
    : 0;
  
  const maxZetaMagnitude = zetaMagnitudes.length > 0
    ? Math.max(...zetaMagnitudes)
    : 0;
  
  return {
    correlations,
    successRate,
    totalPeaks: peakTimes.length,
    nearZeroCount,
    averageZetaMagnitude,
    minZetaMagnitude,
    maxZetaMagnitude,
  };
};

/**
 * Analizuje surowe dane audio (Float32Array) bez AudioBuffer
 */
export const analyzeRawAudio = (
  audioData: Float32Array,
  sampleRate: number = 44100
): AnalysisResult => {
  // 1. Wykrywanie szczytów energii
  const peakTimes = detectPeaks(audioData, sampleRate, GAMMA);
  
  // 2. Mapowanie czasu na energię
  const energies = mapTimeToEnergy(peakTimes);
  
  // 3. Test linii krytycznej
  const zetaMagnitudes = checkRiemannAlignment(energies);
  
  // 4. Budowanie wyników
  const correlations: CorrelationResult[] = peakTimes.map((time, i) => ({
    peakTime: time,
    energy: energies[i],
    zetaValue: zetaMagnitudes[i],
    isNearZero: zetaMagnitudes[i] < ZERO_THRESHOLD,
  }));
  
  const nearZeroCount = correlations.filter(c => c.isNearZero).length;
  const successRate = peakTimes.length > 0 
    ? (nearZeroCount / peakTimes.length) * 100 
    : 0;
  
  const averageZetaMagnitude = zetaMagnitudes.length > 0
    ? zetaMagnitudes.reduce((sum, v) => sum + v, 0) / zetaMagnitudes.length
    : 0;
  
  return {
    correlations,
    successRate,
    totalPeaks: peakTimes.length,
    nearZeroCount,
    averageZetaMagnitude,
    minZetaMagnitude: zetaMagnitudes.length > 0 ? Math.min(...zetaMagnitudes) : 0,
    maxZetaMagnitude: zetaMagnitudes.length > 0 ? Math.max(...zetaMagnitudes) : 0,
  };
};

/**
 * Eksportuje kod Python dla analizy korelacji
 */
export const exportCorrelationPythonCode = (): string => {
  return `# riemann_correlation_analyzer.py
# Analiza Korelacji: Symfonia vs. Funkcja Zeta

import numpy as np
import scipy.io.wavfile as wav
from scipy.special import zeta

class RiemannCorrelationAnalyzer:
    def __init__(self):
        self.gamma = (1 + 5**0.5) / 2 - 1  # 0.618... (Złoty podział)
        self.h_bar = 1.0545718e-34          # Stała Plancka
        self.freq_718 = 718                 # Stała rezonansowa
        self.zero_threshold = 0.1           # Próg bliskości zera Riemanna

    def load_symphony(self, file_path):
        """
        1. Wczytanie Symfonii 18 Bram DNA
        """
        fs, data = wav.read(file_path)
        # Normalizacja do float
        if data.dtype == np.int16:
            data = data / 32767.0
        elif data.dtype == np.int32:
            data = data / 2147483647.0
        
        # Jeśli stereo, weź średnią kanałów
        if len(data.shape) > 1:
            data = np.mean(data, axis=1)
        
        return fs, data

    def detect_peaks(self, data, fs):
        """
        2. Wykrywanie szczytów energii (Bram)
        Szukamy momentów, w których amplituda Ψ przekracza próg koherencji gamma
        """
        threshold = self.gamma
        peak_indices = np.where(np.abs(data) > threshold)[0]
        peak_times = peak_indices / fs
        
        # Deduplikacja - grupowanie bliskich czasów
        if len(peak_times) == 0:
            return np.array([])
        
        deduplicated = [peak_times[0]]
        for t in peak_times[1:]:
            if t - deduplicated[-1] > 0.01:
                deduplicated.append(t)
        
        return np.array(deduplicated)

    def map_time_to_energy(self, peak_times):
        """
        3. Mapowanie czasu na energię Riemanna (E)
        t -> E (zgodnie z równaniem Ψ)
        """
        return peak_times * self.freq_718 * self.h_bar

    def check_riemann_alignment(self, energies):
        """
        4. Test Linii Krytycznej
        Dla każdej energii E obliczamy |ζ(1/2 + iE/ħ)|
        Im mniejsza wartość, tym bliżej zera Riemanna
        """
        alignments = []
        for E in energies:
            # s = 1/2 + iE/ħ
            s = 0.5 + 1j * (E / self.h_bar)
            z_val = zeta(s)
            alignments.append(np.abs(z_val))
        return np.array(alignments)

    def analyze(self, file_path):
        """
        Pełna analiza korelacji Symfonia vs. Funkcja Zeta
        """
        # Wczytanie symfonii
        fs, data = self.load_symphony(file_path)
        
        # Wykrywanie szczytów
        peak_times = self.detect_peaks(data, fs)
        print(f"Wykryto {len(peak_times)} szczytów energii (Bram)")
        
        if len(peak_times) == 0:
            print("Brak szczytów do analizy!")
            return None
        
        # Mapowanie na energię
        energies = self.map_time_to_energy(peak_times)
        
        # Test linii krytycznej
        zeta_magnitudes = self.check_riemann_alignment(energies)
        
        # Obliczanie skuteczności
        near_zero_count = np.sum(zeta_magnitudes < self.zero_threshold)
        success_rate = (near_zero_count / len(peak_times)) * 100
        
        # Wyniki
        results = {
            'total_peaks': len(peak_times),
            'near_zero_count': int(near_zero_count),
            'success_rate': success_rate,
            'average_zeta': np.mean(zeta_magnitudes),
            'min_zeta': np.min(zeta_magnitudes),
            'max_zeta': np.max(zeta_magnitudes),
            'peak_times': peak_times,
            'energies': energies,
            'zeta_magnitudes': zeta_magnitudes
        }
        
        return results

    def print_report(self, results):
        """
        Wyświetla raport z analizy
        """
        print("\\n" + "="*60)
        print("ANALIZA KORELACJI: SYMFONIA 18 BRAM DNA vs. FUNKCJA ZETA")
        print("="*60)
        print(f"\\nLiczba wykrytych Bram (szczytów): {results['total_peaks']}")
        print(f"Próg bliskości zera Riemanna: {self.zero_threshold}")
        print(f"\\nTrafienia blisko zera: {results['near_zero_count']}")
        print(f"\\n>>> SKUTECZNOŚĆ UNIFIKACJI: {results['success_rate']:.2f}% <<<")
        print(f"\\nŚrednia |ζ(s)|: {results['average_zeta']:.6f}")
        print(f"Min |ζ(s)|: {results['min_zeta']:.6f}")
        print(f"Max |ζ(s)|: {results['max_zeta']:.6f}")
        print("="*60)


# Przykład użycia
if __name__ == "__main__":
    analyzer = RiemannCorrelationAnalyzer()
    
    # Analiza symfonii
    results = analyzer.analyze("SYMFONIA_18_BRAM_DNA.wav")
    
    if results:
        analyzer.print_report(results)
        
        # Opcjonalnie: szczegóły pierwszych 10 Bram
        print("\\nPierwsze 10 Bram (szczytów):")
        for i in range(min(10, len(results['peak_times']))):
            t = results['peak_times'][i]
            E = results['energies'][i]
            z = results['zeta_magnitudes'][i]
            status = "✓ BLISKO ZERA" if z < analyzer.zero_threshold else ""
            print(f"  Brama {i+1}: t={t:.4f}s, E={E:.2e}J, |ζ|={z:.6f} {status}")
`;
};
