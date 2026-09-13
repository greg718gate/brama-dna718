import { useCallback, useEffect, useRef, useState } from "react";
import { AudioLines, Pause, Play, Radio, ShieldCheck, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export type AudioStreamMode = "static" | "dynamic";

interface AudioModeSelectorProps {
  onModeChange: (mode: AudioStreamMode) => void;
  currentPhaseError: number;
}

const BASE_FREQUENCY = 718.570125154269;
const REQUESTED_SAMPLE_RATE = 44_100;
const MAX_JITTER_SECONDS = 0.008;

const TEXT = {
  pl: {
    title: "✦ WYBÓR TRYBU STRUMIENIA AUDIO Ψ ✦",
    local: "Generowanie nieskompresowane lokalnie w pamięci RAM",
    staticName: "Tryb Statyczny (Laser)",
    staticShort: "Laserowa sinusoida 718.57 Hz",
    staticDescription: "Krystalicznie czysta sinusoida bazy 718.57 Hz. Laboratoryjny, stały wzorzec rezonansu konstruktywnego.",
    dynamicName: "Tryb Dynamiczny (Żywy Jitter)",
    dynamicShort: "Żywy jitter i bariera fazy",
    dynamicDescription: "Zaawansowany biofeedback. Mikro-szum fazowy zależy od błędu DPLL i zanika do 0.000 ms przy fazie 0.0 rad.",
    frequency: "Częstotliwość bazowa",
    jitter: "Aktywny jitter fazy",
    format: "Format strumienia",
    precision: "Dokładność generatora",
    precisionValue: "±1×10⁻¹² Hz (double-precision Web Audio)",
    binauralNote: "Najlepiej używać dobrych słuchawek lub wzbudników — to system binauralny.",
    start: "Uruchom czysty strumień",
    stop: "Zatrzymaj strumień",
    active: "Strumień PCM aktywny",
    inactive: "Strumień oczekuje na uruchomienie",
  },
  en: {
    title: "✦ AUDIO STREAM MODE SELECTION Ψ ✦",
    local: "Uncompressed generation locally in RAM",
    staticName: "Static Mode (Laser)",
    staticShort: "Laser sine wave at 718.57 Hz",
    staticDescription: "A crystal-clear 718.57 Hz base sine wave. A constant laboratory reference for constructive resonance.",
    dynamicName: "Dynamic Mode (Live Jitter)",
    dynamicShort: "Live jitter and phase barrier",
    dynamicDescription: "Advanced biofeedback. Phase micro-noise follows the DPLL error and falls to 0.000 ms at phase 0.0 rad.",
    frequency: "Base frequency",
    jitter: "Active phase jitter",
    format: "Stream format",
    precision: "Generator precision",
    precisionValue: "±1×10⁻¹² Hz (double-precision Web Audio)",
    binauralNote: "Use quality headphones or tactile transducers — this is a binaural system.",
    start: "Start clean stream",
    stop: "Stop stream",
    active: "PCM stream active",
    inactive: "Stream waiting to start",
  },
};

export const AudioModeSelector = ({ onModeChange, currentPhaseError }: AudioModeSelectorProps) => {
  const { language } = useLanguage();
  const text = TEXT[language === "pl" ? "pl" : "en"];
  const [selectedMode, setSelectedMode] = useState<AudioStreamMode>("static");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const delayRef = useRef<DelayNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const jitterTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const modeRef = useRef<AudioStreamMode>(selectedMode);
  const phaseErrorRef = useRef(currentPhaseError);

  const calculatedJitterSeconds = selectedMode === "dynamic"
    ? Math.min(MAX_JITTER_SECONDS, MAX_JITTER_SECONDS * Math.abs(currentPhaseError))
    : 0;
  const calculatedJitterMs = (calculatedJitterSeconds * 1000).toFixed(3);

  modeRef.current = selectedMode;
  phaseErrorRef.current = currentPhaseError;

  const stopAudio = useCallback(() => {
    if (jitterTimerRef.current) {
      clearInterval(jitterTimerRef.current);
      jitterTimerRef.current = null;
    }
    oscillatorRef.current?.stop();
    oscillatorRef.current?.disconnect();
    delayRef.current?.disconnect();
    gainRef.current?.disconnect();
    oscillatorRef.current = null;
    delayRef.current = null;
    gainRef.current = null;
    const context = audioContextRef.current;
    audioContextRef.current = null;
    if (context && context.state !== "closed") void context.close();
    setIsPlaying(false);
  }, []);

  const startAudio = useCallback(() => {
    if (audioContextRef.current) return;

    if (!window.AudioContext) return;

    const context = new window.AudioContext({ sampleRate: REQUESTED_SAMPLE_RATE });
    const oscillator = context.createOscillator();
    const delay = context.createDelay(MAX_JITTER_SECONDS);
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(BASE_FREQUENCY, context.currentTime);
    delay.delayTime.setValueAtTime(0, context.currentTime);
    gain.gain.setValueAtTime(0.08, context.currentTime);
    oscillator.connect(delay);
    delay.connect(gain);
    gain.connect(context.destination);
    oscillator.start();

    audioContextRef.current = context;
    oscillatorRef.current = oscillator;
    delayRef.current = delay;
    gainRef.current = gain;
    setIsPlaying(true);

    jitterTimerRef.current = setInterval(() => {
      const activeContext = audioContextRef.current;
      const activeDelay = delayRef.current;
      if (!activeContext || !activeDelay) return;
      const amplitude = modeRef.current === "dynamic"
        ? Math.min(MAX_JITTER_SECONDS, MAX_JITTER_SECONDS * Math.abs(phaseErrorRef.current))
        : 0;
      const nextDelay = amplitude === 0 ? 0 : Math.random() * amplitude;
      activeDelay.delayTime.setTargetAtTime(nextDelay, activeContext.currentTime, 0.012);
    }, 40);
  }, []);

  useEffect(() => () => stopAudio(), [stopAudio]);

  const handleModeSelect = (mode: AudioStreamMode) => {
    setSelectedMode(mode);
    onModeChange(mode);
  };

  return (
    <section className="w-full space-y-4 rounded-lg border border-primary/30 bg-background/70 p-4 font-mono text-xs text-foreground/80 sm:p-5" aria-labelledby="audio-mode-title">
      <div className="space-y-1 border-l-2 border-primary pl-3">
        <h4 id="audio-mode-title" className="break-words text-sm font-bold text-foreground">{text.title}</h4>
        <p className="text-[0.68rem] text-muted-foreground">{text.local}</p>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2" role="radiogroup" aria-labelledby="audio-mode-title">
        {([
          { mode: "static" as const, icon: Radio, name: text.staticName, short: text.staticShort, description: text.staticDescription, color: "secondary" },
          { mode: "dynamic" as const, icon: Waves, name: text.dynamicName, short: text.dynamicShort, description: text.dynamicDescription, color: "primary" },
        ]).map(({ mode, icon: Icon, name, short, description, color }) => {
          const active = selectedMode === mode;
          return (
            <Button
              key={mode}
              type="button"
              variant="outline"
              role="radio"
              aria-checked={active}
              onClick={() => handleModeSelect(mode)}
              className={`h-auto min-w-0 whitespace-normal p-3 text-left ${active ? (color === "secondary" ? "border-secondary/70 bg-secondary/10" : "border-primary/70 bg-primary/10") : "border-border bg-transparent"}`}
            >
              <span className="flex min-w-0 items-start gap-2">
                <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${color === "secondary" ? "text-secondary" : "text-primary"}`} />
                <span className="min-w-0 space-y-1">
                  <span className="block break-words font-bold text-foreground">{name}</span>
                  <span className="block break-words text-[0.68rem] text-muted-foreground">{short}</span>
                  <span className="block break-words text-[0.65rem] font-normal leading-relaxed text-muted-foreground/80">{description}</span>
                </span>
              </span>
            </Button>
          );
        })}
      </div>

      <dl className="space-y-2 rounded-md border border-border bg-background/60 p-3">
        <div className="flex flex-wrap justify-between gap-x-3 gap-y-1">
          <dt className="text-muted-foreground">{text.frequency}:</dt>
          <dd className="font-bold text-foreground">718.570125 Hz</dd>
        </div>
        <div className="flex flex-wrap justify-between gap-x-3 gap-y-1">
          <dt className="text-muted-foreground">{text.jitter}:</dt>
          <dd className={selectedMode === "dynamic" && calculatedJitterSeconds > 0 ? "font-bold text-destructive" : "text-secondary"}>{calculatedJitterMs} ms</dd>
        </div>
        <div className="flex flex-wrap justify-between gap-x-3 gap-y-1">
          <dt className="text-muted-foreground">{text.format}:</dt>
          <dd className="text-primary">RAW PCM / 44100 Hz</dd>
        </div>
      </dl>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Button type="button" variant={isPlaying ? "secondary" : "glow"} className="w-full whitespace-normal sm:w-auto" onClick={isPlaying ? stopAudio : startAudio}>
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {isPlaying ? text.stop : text.start}
        </Button>
        <p className="flex items-center gap-2 text-[0.68rem] text-muted-foreground" role="status">
          {isPlaying ? <AudioLines className="h-4 w-4 text-secondary" /> : <ShieldCheck className="h-4 w-4" />}
          {isPlaying ? text.active : text.inactive}
        </p>
      </div>
    </section>
  );
};