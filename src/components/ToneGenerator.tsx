import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";

interface ToneGeneratorProps {
  frequency?: number;
  isPlaying: boolean;
  onPlayingChange?: (playing: boolean) => void;
  showControls?: boolean;
  autoStart?: boolean;
}

export const ToneGenerator = ({ 
  frequency = 718, 
  isPlaying,
  onPlayingChange,
  showControls = true,
  autoStart = false
}: ToneGeneratorProps) => {
  const [volume, setVolume] = useState(0.3);
  const [isMuted, setIsMuted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Binaural offset - Schumann resonance for theta/alpha states
  const BINAURAL_OFFSET = 7.83;
  const leftOscillatorRef = useRef<OscillatorNode | null>(null);
  const rightOscillatorRef = useRef<OscillatorNode | null>(null);

  const startTone = useCallback(() => {
    if (audioContextRef.current) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      // Create stereo panner for binaural effect
      const merger = audioContext.createChannelMerger(2);
      const gainNode = audioContext.createGain();
      
      gainNode.gain.setValueAtTime(isMuted ? 0 : volume, audioContext.currentTime);
      merger.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Left oscillator - base frequency
      const leftOsc = audioContext.createOscillator();
      leftOsc.type = "sine";
      leftOsc.frequency.setValueAtTime(frequency, audioContext.currentTime);
      const leftGain = audioContext.createGain();
      leftGain.gain.value = 0.5;
      leftOsc.connect(leftGain);
      leftGain.connect(merger, 0, 0); // Left channel

      // Right oscillator - base frequency + binaural offset
      const rightOsc = audioContext.createOscillator();
      rightOsc.type = "sine";
      rightOsc.frequency.setValueAtTime(frequency + BINAURAL_OFFSET, audioContext.currentTime);
      const rightGain = audioContext.createGain();
      rightGain.gain.value = 0.5;
      rightOsc.connect(rightGain);
      rightGain.connect(merger, 0, 1); // Right channel

      leftOsc.start();
      rightOsc.start();
      
      leftOscillatorRef.current = leftOsc;
      rightOscillatorRef.current = rightOsc;
      oscillatorRef.current = leftOsc; // Keep for compatibility
      gainNodeRef.current = gainNode;
    } catch (error) {
      console.error("Error starting tone:", error);
    }
  }, [frequency, volume, isMuted]);

  const stopTone = useCallback(() => {
    if (leftOscillatorRef.current) {
      leftOscillatorRef.current.stop();
      leftOscillatorRef.current.disconnect();
      leftOscillatorRef.current = null;
    }
    if (rightOscillatorRef.current) {
      rightOscillatorRef.current.stop();
      rightOscillatorRef.current.disconnect();
      rightOscillatorRef.current = null;
    }
    if (oscillatorRef.current) {
      oscillatorRef.current = null;
    }
    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect();
      gainNodeRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isPlaying) {
      startTone();
    } else {
      stopTone();
    }

    return () => {
      stopTone();
    };
  }, [isPlaying, startTone, stopTone]);

  useEffect(() => {
    if (gainNodeRef.current && audioContextRef.current) {
      const effectiveVolume = isMuted ? 0 : volume;
      gainNodeRef.current.gain.setValueAtTime(effectiveVolume, audioContextRef.current.currentTime);
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    onPlayingChange?.(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  if (!showControls) return null;

  return (
    <div className="flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-[#ffd700]/30">
      <Button
        onClick={togglePlay}
        size="sm"
        variant="outline"
        className={`border-[#ffd700]/50 ${isPlaying ? 'bg-[#ffd700]/20 text-[#ffd700]' : 'text-gray-400'}`}
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </Button>
      
      <div className="flex items-center gap-2 flex-1">
        <Button
          onClick={toggleMute}
          size="sm"
          variant="ghost"
          className="p-1 h-8 w-8"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-gray-500" />
          ) : (
            <Volume2 className="w-4 h-4 text-[#ffd700]" />
          )}
        </Button>
        
        <Slider
          value={[volume * 100]}
          onValueChange={([val]) => setVolume(val / 100)}
          max={100}
          step={1}
          className="flex-1"
        />
      </div>
      
      <div className="text-xs text-[#ffd700] font-mono whitespace-nowrap">
        {frequency} Hz
      </div>
    </div>
  );
};
