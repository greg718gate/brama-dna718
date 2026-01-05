// SYMFONIA 18 BRAM DNA - Web Audio API Implementation
// Based on the Python algorithm for GATCA matrix sonification

const PHI = (1 + Math.sqrt(5)) / 2;
const GAMMA = 1 / PHI;
const SAMPLE_RATE = 44100;
const DURATION = 108; // seconds
const MTDNA_LENGTH = 16569;

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
  const audioBuffer = audioContext.createBuffer(1, numSamples, SAMPLE_RATE);
  const channelData = audioBuffer.getChannelData(0);
  
  // Generate time array
  const t = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    t[i] = (i / SAMPLE_RATE);
  }
  
  // Earth base frequency (7.83 Hz Schumann resonance)
  const earthBase = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    earthBase[i] = Math.sin(2 * Math.PI * 7.83 * t[i]) * 0.05;
  }
  
  // Final wave accumulator
  const finalWave = new Float32Array(numSamples);
  
  // Generate each gate sound
  for (let gateIndex = 0; gateIndex < GATCA_POSITIONS.length; gateIndex++) {
    const pos = GATCA_POSITIONS[gateIndex];
    const startTime = (pos / MTDNA_LENGTH) * DURATION;
    const gateFreq = 144 * (1 + ((gateIndex * GAMMA) % 1)) + 718;
    const weight = (Math.pow(PHI, gateIndex % 7)) % 1;
    
    for (let i = 0; i < numSamples; i++) {
      // Gaussian envelope
      const envelope = Math.exp(-Math.pow(t[i] - startTime, 2) / (2 * Math.pow(1.618, 2)));
      const gateSound = Math.sin(2 * Math.PI * gateFreq * t[i]) * envelope;
      finalWave[i] += gateSound * weight * GAMMA;
    }
  }
  
  // Combine and normalize
  let maxAbs = 0;
  for (let i = 0; i < numSamples; i++) {
    const combined = finalWave[i] + earthBase[i];
    if (Math.abs(combined) > maxAbs) {
      maxAbs = Math.abs(combined);
    }
  }
  
  for (let i = 0; i < numSamples; i++) {
    channelData[i] = (finalWave[i] + earthBase[i]) / maxAbs;
  }
  
  // Create WAV blob for download
  const wavBlob = audioBufferToWav(audioBuffer);
  
  return { audioBuffer, wavBlob };
}

function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  
  const data = buffer.getChannelData(0);
  const samples = data.length;
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
  
  // Write audio data
  let offset = 44;
  for (let i = 0; i < samples; i++) {
    const sample = Math.max(-1, Math.min(1, data[i]));
    const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    view.setInt16(offset, intSample, true);
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
  mtdnaLength: MTDNA_LENGTH
};
