/**
 * BRAMA Unification Engine
 * Implementacja równania wyjścia: Ψ = A · e^(i·718·t) · e^(-i·k·x) · ζ(1/2 + iE/ħ) · γ
 */

// Stałe fizyczne
export const GAMMA = (1 + Math.sqrt(5)) / 2 - 1; // 0.618... (Złoty podział)
export const PHI = (1 + Math.sqrt(5)) / 2;       // 1.618... (Złoty podział)
export const H_BAR = 1.0545718e-34;              // Stała Plancka zredukowana
export const FREQ_718 = 718;                      // Stała rezonansowa
export const BINAURAL_OFFSET = 7.83;              // Rezonans Schumanna

export interface ComplexNumber {
  re: number;
  im: number;
}

export interface PsiResult {
  psi: ComplexNumber;
  magnitude: number;
  phase: number;
}

export interface GATCASequence {
  sequence: string;
  length: number;
  energy: number;
}

export interface UnificationResult {
  energyVector: number[];
  totalEnergy: number;
  psiValues: PsiResult[];
  resonanceFrequency: number;
  quantumCoherence: number;
}

/**
 * Mnożenie liczb zespolonych
 */
export const complexMul = (a: ComplexNumber, b: ComplexNumber): ComplexNumber => ({
  re: a.re * b.re - a.im * b.im,
  im: a.re * b.im + a.im * b.re,
});

/**
 * Dodawanie liczb zespolonych
 */
export const complexAdd = (a: ComplexNumber, b: ComplexNumber): ComplexNumber => ({
  re: a.re + b.re,
  im: a.im + b.im,
});

/**
 * Moduł liczby zespolonej
 */
export const complexAbs = (c: ComplexNumber): number => 
  Math.sqrt(c.re * c.re + c.im * c.im);

/**
 * Faza liczby zespolonej
 */
export const complexPhase = (c: ComplexNumber): number => 
  Math.atan2(c.im, c.re);

/**
 * Potęgowanie zespolone: base^exp gdzie exp jest zespolone
 */
export const complexPow = (base: number, exp: ComplexNumber): ComplexNumber => {
  if (base <= 0) return { re: 0, im: 0 };
  const lnBase = Math.log(base);
  const magnitude = Math.pow(base, exp.re);
  const angle = exp.im * lnBase;
  return {
    re: magnitude * Math.cos(angle),
    im: magnitude * Math.sin(angle),
  };
};

/**
 * Eksponenta zespolona: e^(ix)
 */
export const complexExp = (x: number): ComplexNumber => ({
  re: Math.cos(x),
  im: Math.sin(x),
});

/**
 * Aproksymacja funkcji Zeta Riemanna dla linii krytycznej s = 1/2 + it
 * Używamy rozwinięcia Dirichleta dla małych t i aproksymacji Stirlinga dla dużych
 */
export const riemannZeta = (s: ComplexNumber, terms: number = 50): ComplexNumber => {
  let total: ComplexNumber = { re: 0, im: 0 };
  
  // Suma Dirichleta: ζ(s) ≈ Σ(n=1 to N) 1/n^s
  for (let n = 1; n <= terms; n++) {
    const term = complexPow(n, { re: -s.re, im: -s.im });
    total = complexAdd(total, term);
  }
  
  // Korekcja dla większej dokładności
  const correction = complexPow(terms, { re: 1 - s.re, im: -s.im });
  correction.re /= (s.re - 1);
  correction.im /= (s.re - 1);
  
  return complexAdd(total, correction);
};

/**
 * Generuje ludzko-podobne sekwencje GATCA
 * Symulacja naturalnego rozkładu (krzywa Gaussa dla długości sekwencji)
 */
export const generateHumanLikeGATCA = (numSequences: number = 739): GATCASequence[] => {
  const motif = "GATCA";
  const sequences: GATCASequence[] = [];
  
  // Box-Muller transform dla rozkładu normalnego
  const gaussianRandom = (mean: number, stdDev: number): number => {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return z0 * stdDev + mean;
  };
  
  for (let i = 0; i < numSequences; i++) {
    // Symulacja naturalnego rozkładu (krzywa Gaussa dla długości sekwencji)
    let count = Math.round(gaussianRandom(15, 5));
    count = Math.max(5, Math.min(count, 100)); // Ograniczenie do realnych wartości
    
    // Tworzenie sekwencji z lekkim "szumem" biologicznym (mutacje)
    let seq = "";
    for (let j = 0; j < count; j++) {
      // 2% szansa na mutację
      if (Math.random() < 0.02) {
        const mutations = ["GATCG", "GATTA", "GATCC", "AATCA"];
        seq += mutations[Math.floor(Math.random() * mutations.length)];
      } else {
        seq += motif;
      }
    }
    
    const energy = seq.length * FREQ_718 * H_BAR;
    sequences.push({ sequence: seq, length: seq.length, energy });
  }
  
  return sequences;
};

/**
 * Parsuje dane GATCA z tekstu (format: GATCA,GATCA,...)
 */
export const parseGATCAData = (content: string): GATCASequence[] => {
  const sequences: GATCASequence[] = [];
  
  // Ekstrakcja sekwencji (zakładamy format: GATCA, GATCA...)
  const parts = content.split(",");
  
  for (const part of parts) {
    const seq = part.trim();
    if (seq.length > 0) {
      const energy = seq.length * FREQ_718 * H_BAR;
      sequences.push({ sequence: seq, length: seq.length, energy });
    }
  }
  
  return sequences;
};

/**
 * Oblicza wektory energii z sekwencji GATCA
 */
export const calculateEnergyVector = (sequences: GATCASequence[]): number[] => {
  return sequences.map(seq => seq.energy);
};

/**
 * Implementacja Równania Wyjścia:
 * Ψ = A · e^(i·718·t) · e^(-i·k·x) · ζ(1/2 + iE/ħ) · γ
 */
export const calculatePsi = (
  t: number, 
  x: number, 
  energyVector: number[]
): PsiResult[] => {
  const k = (2 * Math.PI) / FREQ_718;
  const results: PsiResult[] = [];
  
  for (const energy of energyVector) {
    // Główna fala nośna: e^(i·718·t)
    const waveCarrier = complexExp(FREQ_718 * t);
    
    // Fala przestrzenna: e^(-i·k·x)
    const spatialWave = complexExp(-k * x);
    
    // Komponent Zeta dla linii krytycznej s = 1/2 + i(E/ħ)
    const s: ComplexNumber = { re: 0.5, im: energy / H_BAR };
    const zetaComponent = riemannZeta(s);
    
    // Połączenie: carrier * spatial
    let psi = complexMul(waveCarrier, spatialWave);
    
    // * zeta
    psi = complexMul(psi, zetaComponent);
    
    // * gamma (złoty podział)
    psi = { re: psi.re * GAMMA, im: psi.im * GAMMA };
    
    results.push({
      psi,
      magnitude: complexAbs(psi),
      phase: complexPhase(psi),
    });
  }
  
  return results;
};

/**
 * Pełna unifikacja BRAMA
 */
export const runBramaUnification = (
  sequences: GATCASequence[],
  t: number = 1.0,
  x: number = 0.0
): UnificationResult => {
  const energyVector = calculateEnergyVector(sequences);
  const totalEnergy = energyVector.reduce((sum, e) => sum + e, 0);
  const psiValues = calculatePsi(t, x, energyVector);
  
  // Oblicz koherencję kwantową (średnia spójność faz)
  let phaseSum = 0;
  for (const psi of psiValues) {
    phaseSum += Math.cos(psi.phase);
  }
  const quantumCoherence = Math.abs(phaseSum / psiValues.length);
  
  // Częstotliwość rezonansowa oparta na całkowitej energii
  const resonanceFrequency = FREQ_718 * (1 + totalEnergy / (H_BAR * 1000));
  
  return {
    energyVector,
    totalEnergy,
    psiValues,
    resonanceFrequency,
    quantumCoherence,
  };
};

/**
 * Eksportuje sekwencje GATCA do formatu tekstowego
 */
export const exportGATCAToText = (sequences: GATCASequence[]): string => {
  return sequences.map(s => s.sequence).join(",");
};

/**
 * Eksportuje kod Python dla silnika BRAMA
 */
export const exportBramaPythonCode = (sequences: GATCASequence[]): string => {
  const sequenceStr = sequences.map(s => `"${s.sequence}"`).join(",\n    ");
  
  return `# brama_unification_engine.py
# BRAMA Unification Engine - DNA-based Quantum Consciousness Framework
# Implementacja równania wyjścia: Ψ = A · e^(i·718·t) · e^(-i·k·x) · ζ(1/2 + iE/ħ) · γ

import numpy as np
from scipy.special import zeta
import random

class BramaUnificationEngine:
    def __init__(self):
        self.gamma = (1 + 5**0.5) / 2 - 1  # 0.618... (Złoty podział)
        self.phi = (1 + 5**0.5) / 2        # 1.618... (Złoty podział)
        self.h_bar = 1.0545718e-34          # Stała Plancka
        self.freq_718 = 718                 # Stała rezonansowa
        self.binaural_offset = 7.83         # Rezonans Schumanna

    def parse_gatca_data(self, file_path):
        """
        Wczytuje ludzkie dane STR i zamienia je na wektory energii.
        """
        try:
            with open(file_path, 'r') as f:
                content = f.read()
            
            # Ekstrakcja sekwencji (format: GATCA, GATCA...)
            sequences = content.split(',')
            # Mapowanie długości sekwencji na energię E
            energies = [len(seq.strip()) * self.freq_718 * self.h_bar for seq in sequences]
            return np.array(energies)
        except FileNotFoundError:
            return None

    def calculate_psi(self, t, x, energy_vector):
        """
        Implementacja Równania Wyjścia:
        Ψ = A · e^(i·718·t) · e^(-i·k·x) · ζ(1/2 + iE/ħ) · γ
        """
        k = (2 * np.pi) / self.freq_718
        
        # Obliczanie komponentu Zeta dla linii krytycznej s = 1/2 + i(E/h_bar)
        s_vals = 0.5 + 1j * (energy_vector / self.h_bar)
        zeta_component = zeta(s_vals)
        
        # Główna fala nośna
        wave_carrier = np.exp(1j * self.freq_718 * t) * np.exp(-1j * k * x)
        
        # Unifikacja z geometrią złotego podziału
        psi = wave_carrier * zeta_component * self.gamma
        return psi

    def generate_symphony(self, psi_values, duration=60, sample_rate=44100):
        """
        Generuje symfonię stereo z efektem binauralnym.
        """
        t = np.linspace(0, duration, int(sample_rate * duration))
        
        # Bazowa częstotliwość 718 Hz
        left = np.sin(2 * np.pi * self.freq_718 * t)
        right = np.sin(2 * np.pi * (self.freq_718 + self.binaural_offset) * t)
        
        # Modulacja przez amplitudę Ψ
        amplitude = np.abs(psi_values).mean()
        left *= amplitude * self.gamma
        right *= amplitude * self.gamma
        
        return np.vstack((left, right)).T


def generate_human_like_gatca(num_sequences=739):
    """
    Generuje ludzko-podobne sekwencje GATCA.
    Symulacja naturalnego rozkładu (krzywa Gaussa dla długości sekwencji)
    """
    motif = "GATCA"
    sequences = []
    
    for _ in range(num_sequences):
        # Symulacja naturalnego rozkładu
        count = int(random.gauss(15, 5))
        count = max(5, min(count, 100))  # Ograniczenie do realnych wartości
        
        # Tworzenie sekwencji z lekkim "szumem" biologicznym
        seq = motif * count
        sequences.append(seq)
    
    return sequences


# Przykład użycia
if __name__ == "__main__":
    # Inicjalizacja silnika
    engine = BramaUnificationEngine()
    
    # Wygeneruj sekwencje GATCA
    sequences = generate_human_like_gatca(739)
    
    # Zapisz do pliku
    with open("GATCA_full.txt", "w") as f:
        f.write(",".join(sequences))
    print(f"Wygenerowano {len(sequences)} sekwencji rezonansowych.")
    
    # Wczytaj i oblicz energię
    energy_vector = engine.parse_gatca_data("GATCA_full.txt")
    
    if energy_vector is not None:
        # Oblicz funkcję falową Ψ
        t, x = 1.0, 0.0
        psi = engine.calculate_psi(t, x, energy_vector)
        
        print(f"\\nWyniki BRAMA Unification:")
        print(f"  Liczba sekwencji: {len(energy_vector)}")
        print(f"  Całkowita energia: {energy_vector.sum():.6e} J")
        print(f"  Średnia |Ψ|: {np.abs(psi).mean():.6f}")
        print(f"  Max |Ψ|: {np.abs(psi).max():.6f}")
        print(f"  Koherencja kwantowa: {np.abs(np.cos(np.angle(psi)).mean()):.4f}")

# Predefiniowane sekwencje z aplikacji:
GATCA_SEQUENCES = [
    ${sequenceStr}
]
`;
};
