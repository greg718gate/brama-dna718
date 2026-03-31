/**
 * Decoder Ψ-718 — Versioned Configuration System
 * 
 * X.Y.Z format:
 *   X = major (new modules)
 *   Y = calibration (threshold/weight changes)
 *   Z = patches (no result changes)
 * 
 * © 2026 Grzegorz | BRAMA-718-UNIFIED
 */

import type { CalibrationThresholds } from "./manipulationDetector";

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export interface DecoderWeights {
  F1: number;
  F2: number;
  F3: number;
  F4: number;
  F5: number;
  F6: number;
  F7: number;
  F8: number;
}

export interface DecoderVersionConfig {
  version: string;
  date: string;
  label: string;
  isBeta: boolean;
  thresholds: CalibrationThresholds;
  weights: DecoderWeights;
}

export interface ReferenceResult {
  name: string;
  C_total: number;
  IM: number;
  status: "AUTENTYCZNY" | "INTERPOLACJA" | "USZKODZONY";
}

// ═══════════════════════════════════════════════════════════════════
// STABLE v1.0.0 — IMMUTABLE REFERENCE
// ═══════════════════════════════════════════════════════════════════

/** Immutable reference results for v1.0.0 — these NEVER change */
export const STABLE_V1_REFERENCE_RESULTS: readonly ReferenceResult[] = Object.freeze([
  { name: "Ap 22,13 (Greek)",              C_total: 96.3, IM:  5, status: "AUTENTYCZNY" },
  { name: "Wj 3,14 (Hebrew)",              C_total: 63.3, IM: 12, status: "AUTENTYCZNY" },
  { name: "Kohelet 3,21 (Hebrew)",          C_total: 50.6, IM:  8, status: "AUTENTYCZNY" },
  { name: "1 J 5,7 — Comma Johanneum",     C_total: 31.2, IM: 82, status: "INTERPOLACJA" },
  { name: "Tabliczka z Koptos (fragment)",  C_total: 25.6, IM: 51, status: "USZKODZONY" },
]) as ReferenceResult[];

export const STABLE_V1_CONFIG: DecoderVersionConfig = Object.freeze({
  version: "1.0.0",
  date: "2026-03-31",
  label: "Stable Release",
  isBeta: false,
  thresholds: Object.freeze({
    fragmentacja: 30,
    rozbieznosc_Cs_Cm: 20,
    entropia_fizyczna_max: 40,
    entropia_celowa_min: 20,
    T2_sem_paradoks: 30,
    H_chaos: 0.3,
    H_nadmiar: 0.95,
    gematria_mod: 718,
    gematria_min_dlugosc: 10,
    gematria_min_wartosc: 5000,
  }),
  weights: Object.freeze({
    F1: 0.15,
    F2: 0.10,
    F3: 0.15,
    F4: 0.20,
    F5: 0.15,
    F6: 0.10,
    F7: 0.10,
    F8: 0.05,
  }),
}) as DecoderVersionConfig;

// ═══════════════════════════════════════════════════════════════════
// VERSION HISTORY
// ═══════════════════════════════════════════════════════════════════

const VERSION_HISTORY: DecoderVersionConfig[] = [
  { ...STABLE_V1_CONFIG },
];

// ═══════════════════════════════════════════════════════════════════
// ACTIVE VERSION STATE
// ═══════════════════════════════════════════════════════════════════

let _activeConfig: DecoderVersionConfig = { ...STABLE_V1_CONFIG };

export function getActiveVersion(): DecoderVersionConfig {
  return { ..._activeConfig };
}

export function getActiveVersionString(): string {
  return _activeConfig.version;
}

export function isCurrentBeta(): boolean {
  return _activeConfig.isBeta;
}

/**
 * Switch to a specific version from history.
 * Returns true if version was found and applied.
 */
export function switchToVersion(version: string): boolean {
  const config = VERSION_HISTORY.find(v => v.version === version);
  if (config) {
    _activeConfig = { ...config };
    return true;
  }
  return false;
}

/**
 * Switch to stable v1.0.0
 */
export function switchToStable(): void {
  _activeConfig = { ...STABLE_V1_CONFIG };
}

/**
 * Create a new calibration version (increments Y).
 * Saves current config to history and activates the new one.
 */
export function createCalibrationVersion(
  thresholds: CalibrationThresholds,
  weights: DecoderWeights
): DecoderVersionConfig {
  const lastVersion = _activeConfig.version;
  const parts = lastVersion.split(".").map(Number);
  const newVersion = `${parts[0]}.${parts[1] + 1}.${parts[2]}`;

  const newConfig: DecoderVersionConfig = {
    version: newVersion,
    date: new Date().toISOString().split("T")[0],
    label: `Calibration ${newVersion}`,
    isBeta: true,
    thresholds: { ...thresholds },
    weights: { ...weights },
  };

  VERSION_HISTORY.push({ ...newConfig });
  _activeConfig = { ...newConfig };

  return newConfig;
}

/**
 * Get all available versions
 */
export function getVersionHistory(): DecoderVersionConfig[] {
  return VERSION_HISTORY.map(v => ({ ...v }));
}
