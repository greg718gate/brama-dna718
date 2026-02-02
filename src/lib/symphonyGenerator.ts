// SYMFONIA 18 BRAM DNA - Web Audio API Implementation
// Based on the Python algorithm for GATCA matrix sonification
// STEREO with binaural effect for enhanced consciousness modulation
// With Zero Point (Gate 18) singularity effect

const PHI = (1 + Math.sqrt(5)) / 2;
const GAMMA = 1 / PHI;
const SAMPLE_RATE = 44100;
const DURATION = 108; // seconds
const MTDNA_LENGTH = 16569;

// Binaural beat frequency difference (Hz) - optimal for theta/alpha states
const BINAURAL_OFFSET = 7.83; // Schumann resonance as binaural difference

// Zero Point frequency for Gate 18: 718 * φ = 1161.8 Hz
const ZERO_POINT_FREQ = 718 * PHI; // ~1161.8 Hz

// 18 confirmed GATCA positions (1-based, rCRS)
const GATCA_POSITIONS = [
  1, 740, 951, 1227, 2996, 3424, 4166, 4832, 6393, 
  7756, 8415, 10059, 11200, 11336, 11915, 13703, 14784, 16179
];

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
  const t = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    t[i] = (i / SAMPLE_RATE);
  }
  
  // Earth base frequency (7.83 Hz Schumann resonance) - stereo with phase difference
  const earthBaseLeft = new Float32Array(numSamples);
  const earthBaseRight = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    earthBaseLeft[i] = Math.sin(2 * Math.PI * 7.83 * t[i]) * 0.05;
    earthBaseRight[i] = Math.sin(2 * Math.PI * 7.83 * t[i] + Math.PI / 4) * 0.05; // Phase shifted
  }
  
  // Final wave accumulators for stereo
  const leftWave = new Float32Array(numSamples);
  const rightWave = new Float32Array(numSamples);
  
  // Generate each gate sound with binaural effect
  for (let gateIndex = 0; gateIndex < GATCA_POSITIONS.length; gateIndex++) {
    const pos = GATCA_POSITIONS[gateIndex];
    const startTime = (pos / MTDNA_LENGTH) * DURATION;
    const baseFreq = 144 * (1 + ((gateIndex * GAMMA) % 1)) + 718;
    
    // Binaural: left ear gets base frequency, right ear gets base + offset
    const leftFreq = baseFreq;
    const rightFreq = baseFreq + BINAURAL_OFFSET;
    
    const weight = (Math.pow(PHI, gateIndex % 7)) % 1;
    
    // === GATE 18 (pos 16179) - ZERO POINT SINGULARITY ===
    if (pos === 16179) {
      // Zero Point frequency: 718 * φ = 1161.8 Hz
      // Dirac delta simulation - infinitely short, powerful impulse
      for (let i = 0; i < numSamples; i++) {
        // Gaussian singularity at the end (Dirac delta approximation)
        const singularityEnvelope = Math.exp(-Math.pow(t[i] - DURATION, 2) / 0.001);
        
        // Zero Point tone with binaural effect
        const leftSingularity = Math.sin(2 * Math.PI * ZERO_POINT_FREQ * t[i]) * singularityEnvelope;
        const rightSingularity = Math.sin(2 * Math.PI * (ZERO_POINT_FREQ + BINAURAL_OFFSET) * t[i]) * singularityEnvelope;
        
        // Add with weight 144 (initiation number) * gamma
        leftWave[i] += leftSingularity * 144 * GAMMA;
        rightWave[i] += rightSingularity * 144 * GAMMA;
      }
    }
    
    // Standard gate processing (also applies to Gate 18 for continuity)
    for (let i = 0; i < numSamples; i++) {
      // Gaussian envelope (DNA gate modulation)
      const envelope = Math.exp(-Math.pow(t[i] - startTime, 2) / (2 * Math.pow(1.618, 2)));
      
      // Stereo binaural tones
      const leftTone = Math.sin(2 * Math.PI * leftFreq * t[i]) * envelope;
      const rightTone = Math.sin(2 * Math.PI * rightFreq * t[i]) * envelope;
      
      // Apply weight and gamma scaling (equivalent to * 0.3 * dna_gate)
      leftWave[i] += leftTone * weight * GAMMA * 0.3;
      rightWave[i] += rightTone * weight * GAMMA * 0.3;
    }
  }
  
  // Combine and normalize stereo channels
  let maxAbs = 0;
  for (let i = 0; i < numSamples; i++) {
    const combinedLeft = leftWave[i] + earthBaseLeft[i];
    const combinedRight = rightWave[i] + earthBaseRight[i];
    if (Math.abs(combinedLeft) > maxAbs) maxAbs = Math.abs(combinedLeft);
    if (Math.abs(combinedRight) > maxAbs) maxAbs = Math.abs(combinedRight);
  }
  
  for (let i = 0; i < numSamples; i++) {
    leftChannel[i] = (leftWave[i] + earthBaseLeft[i]) / maxAbs;
    rightChannel[i] = (rightWave[i] + earthBaseRight[i]) / maxAbs;
  }
  
  // Create WAV blob for download (stereo)
  const wavBlob = audioBufferToWavStereo(audioBuffer);
  
  return { audioBuffer, wavBlob };
}

function audioBufferToWavStereo(buffer: AudioBuffer): Blob {
  const numChannels = 2; // STEREO
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
  view.setUint32(16, 16, true); // fmt chunk size
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
    // Left channel
    const leftSample = Math.max(-1, Math.min(1, leftData[i]));
    const leftInt = leftSample < 0 ? leftSample * 0x8000 : leftSample * 0x7FFF;
    view.setInt16(offset, leftInt, true);
    offset += 2;
    
    // Right channel
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
  binauralOffset: BINAURAL_OFFSET,
  zeroPointFreq: ZERO_POINT_FREQ,
  stereo: true
};
