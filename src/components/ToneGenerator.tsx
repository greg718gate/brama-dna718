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

  const startTone = useCallback(() => {
    if (audioContextRef.current) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(isMuted ? 0 : volume, audioContext.currentTime);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start();
      
      oscillatorRef.current = oscillator;
      gainNodeRef.current = gainNode;
    } catch (error) {
      console.error("Error starting tone:", error);
    }
  }, [frequency, volume, isMuted]);

  const stopTone = useCallback(() => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current.disconnect();
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
