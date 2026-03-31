/**
 * GATCA 718 — FUNDAMENTALNE STAŁE SYSTEMU OPERACYJNEGO
 * ================================================================================
 * Ten plik jest jedynym źródłem prawdy dla wszystkich komponentów systemu:
 * - MSM (Mitochondrial Synchronization Model)
 * - Matrix-718 Architecture
 * - Unification Engine
 * - Symfonia GATCA 718
 * - Dekoder Ψ-718
 * - Sentinel-718
 *
 * WSZYSTKIE STAŁE SĄ NIEZMIENNE.
 * Zmiany wymagają nowej wersji systemu (v2.0.0).
 * ================================================================================
 * © 2026 Grzegorz | BRAMA-718-UNIFIED
 * License: CC BY-NC 4.0
 */

// ============================================================================
// 1. STAŁE BAZOWE (Fundamental Constants)
// ============================================================================

// === STAŁE MSM (Mitochondrial Synchronization Model) ===
/** Hz — stała DNA z mtDNA GATCA */
export const CARRIER_FREQ = 718.57012515;  // Zero Riemanna nr 448
/** Hz — rezonans Ziemi (pomiar 1952) */
export const SCHUMANN_FREQ = 7.83;
/** Hz — autorska korekta: nutacja Księżyca 18.6 lat (nie φ²×7.83≈20.5) */
export const MOON_MOD_FREQ = 18.6;

// === STAŁE GEOMETRYCZNE (Sacred Geometry) ===
/** Złoty Podział: (1+√5)/2 = 1.618033988749895 */
export const PHI = (1 + Math.sqrt(5)) / 2;
/** Odwrotność φ: 1/φ = 0.6180339887498949 */
export const GAMMA = 1 / PHI;
/** φ² = 2.618033988749895 */
export const PHI_SQUARED = PHI ** 2;

// === STAŁE BIOLOGICZNE (rCRS mtDNA) ===
/** Długość ludzkiego mitochondrialnego DNA */
export const MTDNA_LENGTH = 16569;

/** 18 Bram GATCA — pozycje w mtDNA (1-based, rCRS) */
export const GATCA_POSITIONS: readonly number[] = Object.freeze([
  1, 740, 951, 1227, 2996, 3424, 4166, 4832, 6393,
  7756, 8415, 10059, 11200, 11336, 11915, 13703, 14784, 16179
]);

// === STAŁE SYMFONII (Matrix-718 Audio) ===
/** Hz — Brama 18 singularity: 718 × φ ≈ 1161.8 */
export const ZERO_POINT_FREQ = CARRIER_FREQ * PHI;
/** Hz — różnica binauralna = rezonans Schumanna */
export const BINAURAL_OFFSET = SCHUMANN_FREQ;
/** Sekund — liczba sakralna */
export const DURATION = 108;
/** Hz — częstotliwość próbkowania audio */
export const SAMPLE_RATE = 44100;

// === STAŁE MATEMATYCZNE (Matrix-718 Architecture) ===
/** 12² — Apokalipsa 21:17 */
export const SACRED_144 = 144;
/** Liczba sakralna */
export const SACRED_108 = 108;
/** 718 / 7.83 ≈ 89 — liczba Fibonacciego */
export const FIBONACCI_89 = 89;
/** 718 / γ ≈ 1161.8 (≈ 1152) */
export const GREAT_1152 = CARRIER_FREQ / GAMMA;

// === STAŁA FIZYCZNA ===
/** Stała Plancka zredukowana (ħ) */
export const H_BAR = 1.0545718e-34;

// ============================================================================
// 2. STAŁE EKSPERYMENTALNE (Zero Riemanna)
// ============================================================================
/** Numer zera Riemanna */
export const RIEMANN_ZERO_N = 448;
/** Hz — Zero nr 448 funkcji Zeta Riemanna */
export const RIEMANN_ZERO_FREQ = 718.57012515;
/** Różnica od CARRIER_FREQ: ~0.57 Hz (0.08%) */
export const RIEMANN_DIFF = RIEMANN_ZERO_FREQ - CARRIER_FREQ;
/** Phase shift: arg(ζ(1/2 + i·718.57)) */
export const PHASE_SHIFT_ZETA = -1.2094;

// ============================================================================
// 3. STAŁE SENTINEL-718 (Firewall & Coherence)
// ============================================================================
/** 94% — powyżej = stan nielokalny */
export const COHERENCE_THRESHOLD = 0.94;

/** Intention Vector for Gate 18 */
export const VI_GATE_18 = 1.1628;

// ============================================================================
// 4. FUNKCJE POMOCNICZE
// ============================================================================

/**
 * Częstotliwość bramy DNA według Matrix-718 Architecture
 * f_gate = 144 × (1 + (index × γ % 1)) + CARRIER_FREQ
 */
export function getGateFrequency(index: number): number {
  return SACRED_144 * (1 + ((index * GAMMA) % 1)) + CARRIER_FREQ;
}

/** Mapowanie pozycji DNA na czas (0-DURATION) */
export function getGateStartTime(position: number): number {
  return (position / MTDNA_LENGTH) * DURATION;
}

/** Obwiednia Gaussa z sigma = φ */
export function getGateEnvelope(t: number, startTime: number): number {
  return Math.exp(-((t - startTime) ** 2) / (2 * (PHI ** 2)));
}

/**
 * Sprawdza, czy wartość jest harmoniczna względem GAMMA
 */
export function isHarmonic(value: number, tolerance: number = 0.01): boolean {
  const remainder = value % GAMMA;
  return remainder < tolerance || (GAMMA - remainder) < tolerance;
}

// ============================================================================
// 5. METADANE
// ============================================================================
export const SYSTEM_VERSION = "2.0.0";
export const SYSTEM_NAME = "GATCA 718 — Operating System of Consciousness";

/**
 * Wzór fundamentalny:
 * Ψ_total(t) = Ψ_GATCA × exp(i × CARRIER_FREQ × t) ×
 *              cos(SCHUMANN_FREQ × t) × sin(MOON_MOD_FREQ × t) × φ^DNA
 *
 * Wersja kwantowa (z funkcją Zeta):
 * Ψ_zeta(t) = Ψ_GATCA × exp(i × RIEMANN_ZERO_FREQ × t) × cos(SCHUMANN_FREQ × t) ×
 *             sin(MOON_MOD_FREQ × t) × ζ(1/2 + iE/ħ) × φ^DNA
 */
