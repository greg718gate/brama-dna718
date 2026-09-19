/**
 * RIEMANN HOLOGRAPHIC MATRIX — analiza harmoniczna 18 Bram DNA
 * ============================================================
 * Odwzorowanie skryptu mpmath (75 DPS) w przeglądarce.
 * f_exact = 448. nietrywialne zero funkcji ζ Riemanna.
 *
 * Translacja fazy na częstotliwość akustyczną:
 *   f_tuning = f_exact * (1 + Δφ / 2π)
 *   binaural delta = |f_tuning − f_exact|
 *
 * Model matematyczno-lingwistyczny (test_phase) — nie narzędzie medyczne.
 */

import { CARRIER_FREQ, GAMMA, GATCA_POSITIONS, PHI } from "@/lib/gatca718Constants";

export interface PureRatio {
  pl: string;
  en: string;
  value: number;
}

export const PURE_RATIOS: readonly PureRatio[] = Object.freeze([
  { pl: "Oktawa (1:2)", en: "Octave (1:2)", value: 2 },
  { pl: "Kwinta czysta (2:3)", en: "Perfect fifth (2:3)", value: 1.5 },
  { pl: "Kwarta czysta (3:4)", en: "Perfect fourth (3:4)", value: 4 / 3 },
  { pl: "Tercja wielka (4:5)", en: "Major third (4:5)", value: 1.25 },
  { pl: "Złoty Podział (φ)", en: "Golden ratio (φ)", value: PHI },
  { pl: "Odwrotność φ (γ)", en: "Inverse φ (γ)", value: GAMMA },
]);

export const HARMONIC_ORDER_MAX = 24;
export const DEFAULT_COHERENCE_THRESHOLD = 98;

export interface GateResonance {
  /** 1-based index bramy docelowej */
  targetGate: number;
  targetPosition: number;
  distance: number;
  ratioIndex: number;
  ratioLabelPl: string;
  ratioLabelEn: string;
  /** koherencja w % */
  coherence: number;
  /** błąd zrzutowany na cykl [-π, π] */
  phaseShift: number;
  /** korekta = −phaseShift */
  correction: number;
}

export interface GateResonatorResult {
  gate: number;
  position: number;
  fExact: number;
  threshold: number;
  resonances: GateResonance[];
  critical: GateResonance[];
  stableLines: number;
  meanPhaseImpulse: number;
  fTuning: number;
  binauralDelta: number;
}

/** Zawinięcie kąta do [-π, π] (odpowiednik atan2(sin, cos)) */
function wrapPhase(angle: number): number {
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}

/** Profil harmoniczny pojedynczego węzła (brama 1..18) */
export function analyzeGateHarmonics(gate: number): GateResonance[] {
  const idx = gate - 1;
  if (idx < 0 || idx >= GATCA_POSITIONS.length) {
    throw new Error(`Gate index out of range: ${gate}`);
  }
  const from = GATCA_POSITIONS[idx];
  const out: GateResonance[] = [];

  for (let j = 0; j < GATCA_POSITIONS.length; j++) {
    if (j === idx) continue;
    const to = GATCA_POSITIONS[j];
    const distance = Math.abs(to - from);
    const coefficient = distance / CARRIER_FREQ;

    let minError = 10;
    let signedError = 0;
    let ratioIndex = -1;
    let labelPl = "Brak";
    let labelEn = "None";

    for (let r = 0; r < PURE_RATIOS.length; r++) {
      const ratio = PURE_RATIOS[r];
      for (let w = 1; w <= HARMONIC_ORDER_MAX; w++) {
        // nadtony
        const over = ratio.value * w;
        const overErr = Math.abs(coefficient - over);
        if (overErr < minError) {
          minError = overErr;
          signedError = coefficient - over;
          ratioIndex = r;
          labelPl = `${ratio.pl} ×${w}`;
          labelEn = `${ratio.en} ×${w}`;
        }
        // podtony
        const under = ratio.value / w;
        const underErr = Math.abs(coefficient - under);
        if (underErr < minError) {
          minError = underErr;
          signedError = coefficient - under;
          ratioIndex = r;
          labelPl = `${ratio.pl} / ${w}`;
          labelEn = `${ratio.en} / ${w}`;
        }
      }
    }

    const coherence = Math.max(0, (1 - minError) * 100);
    const phaseShift = wrapPhase(signedError * Math.PI * 2);

    out.push({
      targetGate: j + 1,
      targetPosition: to,
      distance,
      ratioIndex,
      ratioLabelPl: labelPl,
      ratioLabelEn: labelEn,
      coherence,
      phaseShift,
      correction: -phaseShift,
    });
  }

  return out.sort((a, b) => b.coherence - a.coherence);
}

/**
 * Pełny wynik rezonatora: krytyczne linie >threshold%, średni wektor Δφ,
 * korekcyjna nośna i dudnienie różnicowe (binaural beat).
 */
export function computeGateResonator(
  gate: number,
  threshold: number = DEFAULT_COHERENCE_THRESHOLD,
): GateResonatorResult {
  const resonances = analyzeGateHarmonics(gate);
  const critical = resonances.filter((r) => r.coherence > threshold);
  const sum = critical.reduce((acc, r) => acc + r.correction, 0);
  const meanPhaseImpulse = critical.length > 0 ? sum / critical.length : 0;
  const fTuning = CARRIER_FREQ * (1 + meanPhaseImpulse / (2 * Math.PI));

  return {
    gate,
    position: GATCA_POSITIONS[gate - 1],
    fExact: CARRIER_FREQ,
    threshold,
    resonances,
    critical,
    stableLines: critical.length,
    meanPhaseImpulse,
    fTuning,
    binauralDelta: Math.abs(fTuning - CARRIER_FREQ),
  };
}

/**
 * Lokalna synteza stereo 16-bit PCM (WAV) w pamięci przeglądarki:
 * lewy kanał = f_exact, prawy = f_tuning, 2 s fade in/out.
 */
export function renderStereoWav(
  fLeft: number,
  fRight: number,
  durationSeconds: number,
  sampleRate = 44100,
  amplitude = 0.5,
): Blob {
  const frames = Math.floor(sampleRate * durationSeconds);
  const fade = Math.min(Math.floor(sampleRate * 2), Math.floor(frames / 2));
  const bytesPerSample = 2;
  const blockAlign = bytesPerSample * 2;
  const dataSize = frames * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 2, true); // stereo
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  const twoPi = 2 * Math.PI;
  let offset = 44;
  for (let n = 0; n < frames; n++) {
    const t = n / sampleRate;
    let env = 1;
    if (fade > 0) {
      if (n < fade) env = n / fade;
      else if (n >= frames - fade) env = (frames - 1 - n) / fade;
    }
    const left = Math.sin(twoPi * fLeft * t) * env * amplitude;
    const right = Math.sin(twoPi * fRight * t) * env * amplitude;
    view.setInt16(offset, Math.max(-1, Math.min(1, left)) * 32767, true);
    view.setInt16(offset + 2, Math.max(-1, Math.min(1, right)) * 32767, true);
    offset += 4;
  }

  return new Blob([buffer], { type: "audio/wav" });
}
