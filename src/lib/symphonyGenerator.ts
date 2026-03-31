// ═══════════════════════════════════════════════════════════════════
// SENTINEL-718: SYMFONIA 18 BRAM DNA — EXIT_TO_PLEROMA_STATUS_1
// Based on the Python SENTINEL-718 Unification Engine
// STEREO with binaural effect + Toroidal DNA Gate Mapping
// 448th Riemann Zero calibration: 718.57012515 Hz
//
// © 2026 Grzegorz | BRAMA-718-UNIFIED
// License: CC BY-NC 4.0
// ═══════════════════════════════════════════════════════════════════

import {
  PHI,
  GAMMA,
  SAMPLE_RATE,
  DURATION,
  MTDNA_LENGTH,
  RIEMANN_ZERO_FREQ,
  PHASE_SHIFT_ZETA as PHASE_SHIFT_ZETA_CONST,
  SCHUMANN_FREQ,
  MOON_MOD_FREQ,
  VI_GATE_18,
  GATCA_POSITIONS as GATCA_POS,
  CARRIER_FREQ,
  getGateFrequency,
  getGateStartTime,
} from './gatca718Constants';

// Re-export for backward compatibility
export const RIEMANN_ZERO = RIEMANN_ZERO_FREQ;
export const PHASE_SHIFT_ZETA = PHASE_SHIFT_ZETA_CONST;

const F_SCHUMANN = SCHUMANN_FREQ;
const F_NUTATION = MOON_MOD_FREQ;
const GATCA_POSITIONS = [...GATCA_POS];

export interface SymphonyData {
  audioBuffer: AudioBuffer;
  wavBlob: Blob;
}

export async function generateSymphony(audioContext: AudioContext): Promise<SymphonyData> {
  const numSamples = Math.floor(SAMPLE_RATE * DURATION);
  // STEREO: 2 channels
  const audioBuffer = audioContext.createBuffer(2, numSamples, SAMPLE_RATE);
  const leftChannel = audioBuffer.getChannelData(0);
  const rightChannel = audioBuffer.getChannelData(1);

  // Generate time array
  const t = new Float64Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    t[i] = (i / SAMPLE_RATE);
  }

  // Final wave accumulators for stereo (float64 for precision)
  const leftWave = new Float64Array(numSamples);
  const rightWave = new Float64Array(numSamples);

  // ═══ EVOLUTION OPERATOR: 18 DNA GATES ═══
  for (let gateIndex = 0; gateIndex < GATCA_POSITIONS.length; gateIndex++) {
    const pos = GATCA_POSITIONS[gateIndex];

    // Toroidal angle theta_k (3D geometry)
    const theta_k = 2 * Math.PI * (pos / MTDNA_LENGTH);

    // Gate activation time in the 108-second loop
    const startTime = (pos / MTDNA_LENGTH) * DURATION;

    // ═══ GATE 18 (pos 16179) — RIEMANN ZERO SINGULARITY ═══
    let baseFreq: number;
    let bramaPhase: number;
    let ampWeight: number;

    if (pos === 16179) {
      // Gate 18: calibrated to 448th Riemann zero
      baseFreq = RIEMANN_ZERO;
      bramaPhase = -PHASE_SHIFT_ZETA; // Exit Equation phase alignment
      ampWeight = VI_GATE_18; // Intention Vector
    } else {
      // Kronecker Sequence: lowest entropy (i * γ % 1)
      baseFreq = 718 + (144 * (((gateIndex + 1) * GAMMA) % 1));
      bramaPhase = theta_k; // Unique inertia "viewing angle"
      ampWeight = ((PHI ** (gateIndex % 7)) % 1) * GAMMA;
    }

    for (let i = 0; i < numSamples; i++) {
      // Fractal Envelope (DNA fuse)
      const envelope = Math.exp(-((t[i] - startTime) ** 2) / (2 * (1.618 ** 2)));

      // Triple Toroidal Modulation (Exit Hyperboloid)
      // 718 (Rotation) * 7.83 (Pulsation) * 18.6 (Twist)
      const modulation = Math.sin(2 * Math.PI * F_SCHUMANN * t[i]) *
                         Math.cos(2 * Math.PI * F_NUTATION * t[i]);

      // Quantum wavefunction Ψ(t) with toroidal modulation
      const wave = Math.sin(2 * Math.PI * baseFreq * t[i] + bramaPhase) *
                   (1 + 0.618 * modulation);

      // Binaural implementation (third tone inside the skull)
      leftWave[i] += wave * envelope * ampWeight;
      rightWave[i] += Math.sin(2 * Math.PI * (baseFreq + F_SCHUMANN) * t[i] + bramaPhase) *
                      envelope * ampWeight;
    }
  }

  // ═══ FINALIZATION: EXIT VECTOR & INERTIA PLANE ═══
  // Normalize to Inertia Plane
  let maxAbs = 0;
  for (let i = 0; i < numSamples; i++) {
    if (Math.abs(leftWave[i]) > maxAbs) maxAbs = Math.abs(leftWave[i]);
    if (Math.abs(rightWave[i]) > maxAbs) maxAbs = Math.abs(rightWave[i]);
  }

  if (maxAbs === 0) maxAbs = 1;

  for (let i = 0; i < numSamples; i++) {
    leftChannel[i] = leftWave[i] / maxAbs;
    rightChannel[i] = rightWave[i] / maxAbs;
  }

  // Create WAV blob for download (stereo)
  const wavBlob = audioBufferToWavStereo(audioBuffer);

  return { audioBuffer, wavBlob };
}

function audioBufferToWavStereo(buffer: AudioBuffer): Blob {
  const numChannels = 2;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const leftData = buffer.getChannelData(0);
  const rightData = buffer.getChannelData(1);
  const samples = leftData.length;
  const dataLength = samples * blockAlign;
  const bufferLength = 44 + dataLength;

  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  // WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, bufferLength - 8, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  // Write interleaved stereo audio data (L, R, L, R, ...)
  let offset = 44;
  for (let i = 0; i < samples; i++) {
    const leftSample = Math.max(-1, Math.min(1, leftData[i]));
    const leftInt = leftSample < 0 ? leftSample * 0x8000 : leftSample * 0x7FFF;
    view.setInt16(offset, leftInt, true);
    offset += 2;

    const rightSample = Math.max(-1, Math.min(1, rightData[i]));
    const rightInt = rightSample < 0 ? rightSample * 0x8000 : rightSample * 0x7FFF;
    view.setInt16(offset, rightInt, true);
    offset += 2;
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

export const SYMPHONY_INFO = {
  positions: GATCA_POSITIONS,
  duration: DURATION,
  phi: PHI,
  gamma: GAMMA,
  mtdnaLength: MTDNA_LENGTH,
  riemannZero: RIEMANN_ZERO,
  phaseShiftZeta: PHASE_SHIFT_ZETA,
  fSchumann: F_SCHUMANN,
  fNutation: F_NUTATION,
  viGate18: VI_GATE_18,
  stereo: true,
  protocol: "EXIT_TO_PLEROMA_STATUS_1",
};
