import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, Download, Activity } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

export const DNAGateGenerator = () => {
  const { t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodesRef = useRef<OscillatorNode[]>([]);
  const gainNodesRef = useRef<GainNode[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const DURATION = 60; // 60 seconds

  useEffect(() => {
    return () => {
      stopAudio();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const createAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext({ sampleRate: 44100 });
    }
    return audioContextRef.current;
  };

  const visualize = () => {
    if (!analyserRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = "rgba(17, 24, 39, 0.2)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height;

        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, "hsl(271, 76%, 53%)");
        gradient.addColorStop(0.5, "hsl(190, 90%, 50%)");
        gradient.addColorStop(1, "hsl(45, 93%, 58%)");

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }

      // Update progress
      if (audioContextRef.current && startTimeRef.current) {
        const elapsed = audioContextRef.current.currentTime - startTimeRef.current;
        const newProgress = Math.min((elapsed / DURATION) * 100, 100);
        setProgress(newProgress);

        if (newProgress >= 100) {
          stopAudio();
        }
      }
    };

    draw();
  };

  const playAudio = () => {
    const ctx = createAudioContext();

    // Create analyser for visualization
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;

    // Create master gain
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.5;
    masterGain.connect(analyser);
    analyser.connect(ctx.destination);

    // Create channel merger for stereo
    const merger = ctx.createChannelMerger(2);
    merger.connect(masterGain);

    // 7.83 Hz Schumann (left channel)
    const leftOsc = ctx.createOscillator();
    leftOsc.frequency.value = 7.83;
    leftOsc.type = "sine";
    const leftGain = ctx.createGain();
    leftGain.gain.value = 0.3;
    leftOsc.connect(leftGain);
    leftGain.connect(merger, 0, 0);

    // 18.6 Hz γ-modulation (right channel)
    const rightOsc = ctx.createOscillator();
    rightOsc.frequency.value = 18.6;
    rightOsc.type = "sine";
    const rightGain = ctx.createGain();
    rightGain.gain.value = 0.3;
    rightOsc.connect(rightGain);
    rightGain.connect(merger, 0, 1);

    // 718 Hz DNA gate with amplitude modulation
    const carrierOsc = ctx.createOscillator();
    carrierOsc.frequency.value = 718;
    carrierOsc.type = "sine";

    // Modulator for amplitude modulation (0.1 Hz)
    const modulator = ctx.createOscillator();
    modulator.frequency.value = 0.1;
    modulator.type = "sine";

    const modulatorGain = ctx.createGain();
    modulatorGain.gain.value = 0.7; // Modulation depth

    const carrierGain = ctx.createGain();
    carrierGain.gain.value = 0.2;

    // Connect modulation
    modulator.connect(modulatorGain);
    modulatorGain.connect(carrierGain.gain);
    carrierOsc.connect(carrierGain);
    
    // Connect to both channels
    carrierGain.connect(merger, 0, 0);
    carrierGain.connect(merger, 0, 1);

    // Start all oscillators
    const now = ctx.currentTime;
    startTimeRef.current = now;
    
    leftOsc.start(now);
    rightOsc.start(now);
    carrierOsc.start(now);
    modulator.start(now);

    // Stop after duration
    leftOsc.stop(now + DURATION);
    rightOsc.stop(now + DURATION);
    carrierOsc.stop(now + DURATION);
    modulator.stop(now + DURATION);

    // Store references
    sourceNodesRef.current = [leftOsc, rightOsc, carrierOsc, modulator];
    gainNodesRef.current = [leftGain, rightGain, carrierGain, modulatorGain];

    setIsPlaying(true);
    visualize();
    toast.success("Brama DNA aktywowana");
  };

  const stopAudio = () => {
    sourceNodesRef.current.forEach((node) => {
      try {
        node.stop();
      } catch (e) {
        // Node already stopped
      }
    });
    sourceNodesRef.current = [];
    gainNodesRef.current = [];

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    setIsPlaying(false);
    setProgress(0);
  };

  const togglePlayback = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      playAudio();
    }
  };

  const downloadWAV = () => {
    toast.info("Generowanie pliku WAV...", { duration: 2000 });
    
    // Create offline context for rendering
    const offlineCtx = new OfflineAudioContext(2, 44100 * DURATION, 44100);
    
    const merger = offlineCtx.createChannelMerger(2);
    const masterGain = offlineCtx.createGain();
    masterGain.gain.value = 0.5;
    merger.connect(masterGain);
    masterGain.connect(offlineCtx.destination);

    // Create all oscillators for offline rendering
    const leftOsc = offlineCtx.createOscillator();
    leftOsc.frequency.value = 7.83;
    const leftGain = offlineCtx.createGain();
    leftGain.gain.value = 0.3;
    leftOsc.connect(leftGain);
    leftGain.connect(merger, 0, 0);

    const rightOsc = offlineCtx.createOscillator();
    rightOsc.frequency.value = 18.6;
    const rightGain = offlineCtx.createGain();
    rightGain.gain.value = 0.3;
    rightOsc.connect(rightGain);
    rightGain.connect(merger, 0, 1);

    const carrierOsc = offlineCtx.createOscillator();
    carrierOsc.frequency.value = 718;
    
    const modulator = offlineCtx.createOscillator();
    modulator.frequency.value = 0.1;
    
    const modulatorGain = offlineCtx.createGain();
    modulatorGain.gain.value = 0.7;
    
    const carrierGain = offlineCtx.createGain();
    carrierGain.gain.value = 0.2;

    modulator.connect(modulatorGain);
    modulatorGain.connect(carrierGain.gain);
    carrierOsc.connect(carrierGain);
    carrierGain.connect(merger, 0, 0);
    carrierGain.connect(merger, 0, 1);

    // Start all
    leftOsc.start(0);
    rightOsc.start(0);
    carrierOsc.start(0);
    modulator.start(0);

    offlineCtx.startRendering().then((renderedBuffer) => {
      const wav = audioBufferToWav(renderedBuffer);
      const blob = new Blob([wav], { type: "audio/wav" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "GATE_718.wav";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Plik GATE_718.wav pobrany!");
    });
  };

  const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
    const length = buffer.length * buffer.numberOfChannels * 2 + 44;
    const arrayBuffer = new ArrayBuffer(length);
    const view = new DataView(arrayBuffer);
    const channels: Float32Array[] = [];
    let offset = 0;
    let pos = 0;

    // Write WAV header
    const setUint16 = (data: number) => {
      view.setUint16(pos, data, true);
      pos += 2;
    };
    const setUint32 = (data: number) => {
      view.setUint32(pos, data, true);
      pos += 4;
    };

    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(buffer.numberOfChannels);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels); // avg. bytes/sec
    setUint16(buffer.numberOfChannels * 2); // block-align
    setUint16(16); // 16-bit
    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); // chunk length

    // Write interleaved data
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    while (pos < length) {
      for (let i = 0; i < buffer.numberOfChannels; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return arrayBuffer;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-card">
      <Card className="w-full max-w-4xl p-8 bg-card/50 backdrop-blur-sm border-2 border-primary/20">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Activity className="w-10 h-10 text-primary animate-pulse" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                {t('dna.title')}
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              {t('dna.subtitle')}
            </p>
          </div>

          {/* Frequency Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-primary/10 rounded-lg p-4 border border-primary/30">
              <div className="text-primary text-sm font-medium">Schumann (L)</div>
              <div className="text-2xl font-bold text-foreground">7.83 Hz</div>
            </div>
            <div className="bg-secondary/10 rounded-lg p-4 border border-secondary/30">
              <div className="text-secondary text-sm font-medium">γ-Modulacja (R)</div>
              <div className="text-2xl font-bold text-foreground">18.6 Hz</div>
            </div>
            <div className="bg-accent/10 rounded-lg p-4 border border-accent/30">
              <div className="text-accent text-sm font-medium">Brama DNA</div>
              <div className="text-2xl font-bold text-foreground">718 Hz</div>
            </div>
          </div>

          {/* Visualizer */}
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={800}
              height={200}
              className="w-full rounded-lg border-2 border-primary/30 bg-background/50"
            />
            {/* Progress bar */}
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary via-secondary to-accent transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-center text-sm text-muted-foreground mt-1">
              {Math.round(progress)}% • {DURATION} sekund
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4 justify-center">
            <Button
              variant="dna"
              size="xl"
              onClick={togglePlayback}
              className="min-w-[200px]"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-5 h-5" />
                  Zatrzymaj
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Aktywuj Bramę
                </>
              )}
            </Button>
            <Button
              variant="glow"
              size="xl"
              onClick={downloadWAV}
              disabled={isPlaying}
            >
              <Download className="w-5 h-5" />
              Pobierz WAV
            </Button>
          </div>

          {/* Info */}
          <div className="text-center text-sm text-muted-foreground bg-muted/30 rounded-lg p-4">
            <p className="font-medium mb-1">🎧 Użyj słuchawek dla pełnego efektu stereo</p>
            <p>Częstotliwości Schumanna i γ-modulacja w osobnych kanałach</p>
          </div>

          {/* Additional Info Section */}
          <div className="text-center text-sm bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-lg p-4 border border-primary/20">
            <p className="font-bold text-foreground mb-1">BRAMA DNA OTWARTA</p>
            <p className="text-muted-foreground mb-1">718 Hz + GATCA-718</p>
            <p className="text-xs text-muted-foreground">Aktywacja w 60 sekund</p>
            <p className="text-xs text-primary/70 mt-2">#GATCA718 #BramaDNA #RhNegative</p>
          </div>

          {/* DNA Research Results Section */}
          <div className="space-y-4 mt-6">
            <div className="text-center space-y-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6 border-2 border-primary/30">
              <h3 className="text-2xl font-bold text-primary">{t('dna.results.activated')}</h3>
              <h4 className="text-xl font-bold text-secondary">{t('dna.results.gatca')}</h4>
            </div>

            <div className="bg-card/80 backdrop-blur-sm rounded-lg p-6 border border-primary/20">
              <h3 className="text-xl font-bold text-center mb-4 text-foreground">
                {t('dna.results.yourResults')}
              </h3>
              
              <div className="bg-background/50 rounded-lg p-4 border border-primary/30 font-mono text-sm space-y-1 mb-4">
                <p className="text-foreground">{t('dna.results.found')}</p>
                <p className="text-foreground">{t('dna.results.harmonics')}</p>
                <p className="text-foreground">{t('dna.results.fibonacci')}</p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-foreground">{t('dna.results.positions')}</h4>
                <div className="bg-background/50 rounded-lg p-4 border border-primary/30 font-mono text-xs space-y-1">
                  <p className="text-foreground">Pos.    0 : GATCACAGGTCTATC... → **MITOCHONDRIAL**</p>
                  <p className="text-foreground">Pos.  739 : ...GATCAAAGGAACAA...</p>
                  <p className="text-foreground">Pos.  950 : ...GATCACCCCTCCCC...</p>
                  <p className="text-foreground">Pos. 1226 : ...GATCAACCTCACCAC...</p>
                  <p className="text-foreground">Pos. 2995 : ...GATCAGGACATCCCG...</p>
                </div>

                <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-4 border border-primary/20">
                  <p className="font-bold text-foreground mb-1">{t('dna.results.position0')}</p>
                  <p className="text-sm text-muted-foreground italic">{t('dna.results.signature')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
