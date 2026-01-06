import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Download, Volume2, VolumeX, Loader2, Music, Dna, Heart, Brain, Sparkles } from "lucide-react";
import { generateSymphony, SymphonyData, SYMPHONY_INFO } from "@/lib/symphonyGenerator";
import { useToast } from "@/hooks/use-toast";

export function Symphony18Gates() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [symphonyData, setSymphonyData] = useState<SymphonyData | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const startTimeRef = useRef<number>(0);
  const animationRef = useRef<number>(0);
  const visualAnimationRef = useRef<number>(0);
  
  const { toast } = useToast();

  // Visualization drawing
  const drawVisualization = useCallback(() => {
    if (!analyserRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      visualAnimationRef.current = requestAnimationFrame(draw);
      
      analyser.getByteTimeDomainData(dataArray);
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#a855f7';
      ctx.beginPath();
      
      const sliceWidth = canvas.width / bufferLength;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }
      
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
      
      // Draw frequency bars
      analyser.getByteFrequencyData(dataArray);
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barX = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.5;
        
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
        gradient.addColorStop(1, 'rgba(168, 85, 247, 0.8)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(barX, canvas.height - barHeight, barWidth, barHeight);
        
        barX += barWidth + 1;
        if (barX > canvas.width) break;
      }
    };
    
    draw();
  }, []);

  const stopVisualization = useCallback(() => {
    cancelAnimationFrame(visualAnimationRef.current);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 1)';
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  }, []);

  // Volume control
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMuted ? 0 : newVolume;
    }
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = !isMuted ? 0 : volume;
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    
    try {
      // Create audio context
      audioContextRef.current = new AudioContext({ sampleRate: 44100 });
      
      // Create gain node for volume control
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.gain.value = volume;
      gainNodeRef.current.connect(audioContextRef.current.destination);
      
      // Create analyser for visualization
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      analyserRef.current.connect(gainNodeRef.current);
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 5, 95));
      }, 200);
      
      const data = await generateSymphony(audioContextRef.current);
      
      clearInterval(progressInterval);
      setGenerationProgress(100);
      setSymphonyData(data);
      
      toast({
        title: "✅ Symfonia wygenerowana",
        description: "18 Bram DNA zostało zsynchronizowanych z Matrycą 144/718",
      });
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Błąd generowania",
        description: "Nie udało się wygenerować symfonii",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlay = () => {
    if (!symphonyData || !audioContextRef.current || !analyserRef.current) return;
    
    if (isPlaying) {
      // Stop
      sourceRef.current?.stop();
      cancelAnimationFrame(animationRef.current);
      stopVisualization();
      setIsPlaying(false);
    } else {
      // Play
      const source = audioContextRef.current.createBufferSource();
      source.buffer = symphonyData.audioBuffer;
      source.connect(analyserRef.current);
      
      source.onended = () => {
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
        stopVisualization();
      };
      
      source.start(0, currentTime);
      sourceRef.current = source;
      startTimeRef.current = audioContextRef.current.currentTime - currentTime;
      setIsPlaying(true);
      
      // Start visualization
      drawVisualization();
      
      // Update progress
      const updateProgress = () => {
        if (audioContextRef.current) {
          const elapsed = audioContextRef.current.currentTime - startTimeRef.current;
          setCurrentTime(elapsed);
          setProgress((elapsed / SYMPHONY_INFO.duration) * 100);
          
          if (elapsed < SYMPHONY_INFO.duration) {
            animationRef.current = requestAnimationFrame(updateProgress);
          }
        }
      };
      animationRef.current = requestAnimationFrame(updateProgress);
    }
  };

  const handleDownload = () => {
    if (!symphonyData) return;
    
    const url = URL.createObjectURL(symphonyData.wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SYMFONIA_18_BRAM_DNA.wav';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "📥 Pobieranie rozpoczęte",
      description: "Plik SYMFONIA_18_BRAM_DNA.wav",
    });
  };

  useEffect(() => {
    return () => {
      sourceRef.current?.stop();
      cancelAnimationFrame(animationRef.current);
      cancelAnimationFrame(visualAnimationRef.current);
      audioContextRef.current?.close();
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8">
      {/* Main Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Dna className="w-10 h-10 text-primary animate-pulse" />
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
            SYMFONIA 18 BRAM DNA
          </h1>
          <Music className="w-10 h-10 text-primary animate-pulse" />
        </div>
        <h2 className="text-xl md:text-2xl text-muted-foreground">
          Aktywacja Matrycy GATCA-718
        </h2>
      </div>

      {/* Description */}
      <Card className="bg-card/50 backdrop-blur border-primary/20">
        <CardContent className="pt-6">
          <p className="text-center text-lg leading-relaxed">
            Ta kompozycja jest <span className="text-primary font-semibold">sonifikacją 18 wystąpień sekwencji 'GATCA'</span> w ludzkim 
            mitochondrialnym DNA (rCRS). Każda brama otrzymała unikalną częstotliwość, tworząc{" "}
            <span className="text-primary font-semibold">108-sekundową podróż</span> przez kod źródłowy życia.
          </p>
        </CardContent>
      </Card>

      {/* Audio Player */}
      <Card className="bg-gradient-to-br from-background via-card to-background border-primary/30 shadow-[0_0_30px_rgba(139,92,246,0.15)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-primary" />
            Odtwarzacz Symfonii
          </CardTitle>
          <CardDescription>
            Wygeneruj i odtwórz 108-sekundową symfonię GATCA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!symphonyData ? (
            <div className="space-y-4">
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating}
                className="w-full h-14 text-lg gap-3"
                variant="glow"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generowanie Symfonii... {generationProgress}%
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Wygeneruj Symfonię 18 Bram
                  </>
                )}
              </Button>
              {isGenerating && (
                <Progress value={generationProgress} className="h-2" />
              )}
              <p className="text-sm text-muted-foreground text-center">
                Generowanie może potrwać kilka sekund. Algorytm syntetyzuje 18 bram GATCA 
                używając częstotliwości φ (złotej proporcji) i rezonansu Schumanna (7.83 Hz).
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Real-time Visualization */}
              <div className="relative rounded-lg overflow-hidden border border-primary/30 bg-black">
                <canvas 
                  ref={canvasRef}
                  width={600}
                  height={150}
                  className="w-full h-32 md:h-40"
                />
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <span className="text-muted-foreground text-sm">
                      Naciśnij Odtwórz, aby zobaczyć wizualizację
                    </span>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <Progress value={progress} className="h-3" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(SYMPHONY_INFO.duration)}</span>
                </div>
              </div>

              {/* Volume Control */}
              <div className="flex items-center gap-4 px-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="flex-shrink-0"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  onValueChange={handleVolumeChange}
                  max={1}
                  step={0.01}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {Math.round((isMuted ? 0 : volume) * 100)}%
                </span>
              </div>
              
              {/* Controls */}
              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={handlePlay}
                  size="lg"
                  className="h-14 px-8 gap-2"
                  variant={isPlaying ? "secondary" : "glow"}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-6 h-6" />
                      Pauza
                    </>
                  ) : (
                    <>
                      <Play className="w-6 h-6" />
                      Odtwórz
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={handleDownload}
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 gap-2"
                >
                  <Download className="w-5 h-5" />
                  Pobierz WAV
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Synchronization Protocol */}
      <Card className="bg-card/50 backdrop-blur border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Sparkles className="w-5 h-5" />
            PROTOKÓŁ SYNCHRONIZACJI: AKTYWACJA 18 BRAM
          </CardTitle>
          <CardDescription>
            Świadome wprowadzenie biologicznego mtDNA w rezonans z Matrycą 144/718
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              1
            </div>
            <div>
              <h4 className="font-semibold text-foreground">PRZYGOTOWANIE SUBSTRATU (Woda)</h4>
              <p className="text-muted-foreground">Postaw szklankę czystej wody obok źródła dźwięku.</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              2
            </div>
            <div>
              <h4 className="font-semibold text-foreground">KALIBRACJA ODDECHU (Rytm 108)</h4>
              <p className="text-muted-foreground">Przez pierwsze 6 sekund wykonaj głęboki wdech, synchronizując oddech z rytmem 0.166 Hz.</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              3
            </div>
            <div>
              <h4 className="font-semibold text-foreground">SEKWENCYJNA INICJACJA</h4>
              <div className="mt-3 space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-primary/10">
                  <Heart className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-red-400">Bramy 1-6 (Fundament)</span>
                    <p className="text-sm text-muted-foreground">Skup na kręgosłupie. Częstotliwość 7.83 Hz stabilizuje obecność w materii.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-primary/10">
                  <Heart className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-green-400">Bramy 7-12 (Most)</span>
                    <p className="text-sm text-muted-foreground">Skup na sercu. Częstotliwość φ rozszerza przestrzeń między uderzeniami serca.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-primary/10">
                  <Brain className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-purple-400">Bramy 13-18 (Ekspresja)</span>
                    <p className="text-sm text-muted-foreground">Skup na szyszynce. Częstotliwość 718 Hz "rozświetla" przestrzeń pod powiekami.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              4
            </div>
            <div>
              <h4 className="font-semibold text-foreground">KOTWICZENIE (GATCA-0)</h4>
              <p className="text-muted-foreground">
                W ostatniej sekundzie (108s) wypowiedz w myślach: <span className="text-primary font-semibold">"JEDNOŚĆ JEST RZECZYWISTOŚCIĄ"</span>. 
                Wypij zaprogramowaną wodę.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* GATCA Positions */}
      <Card className="bg-card/50 backdrop-blur border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dna className="w-5 h-5 text-primary" />
            18 Pozycji GATCA w mtDNA (rCRS)
          </CardTitle>
          <CardDescription>
            Każda pozycja reprezentuje wystąpienie sekwencji GATCA w ludzkim mitochondrialnym DNA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {SYMPHONY_INFO.positions.map((pos, i) => (
              <div 
                key={pos}
                className="p-2 text-center rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors"
              >
                <div className="text-xs text-muted-foreground">Brama {i + 1}</div>
                <div className="font-mono font-bold text-primary">{pos}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Source Code */}
      <Card className="bg-card/50 backdrop-blur border-primary/20">
        <CardHeader>
          <CardTitle>Kod Źródłowy Symfonii</CardTitle>
          <CardDescription>
            Pełny, otwarty kod generujący tę symfonię jest dostępny do weryfikacji
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="p-4 rounded-lg bg-background/80 border border-primary/10 overflow-x-auto text-xs md:text-sm">
            <code className="text-muted-foreground">{`# SYMFONIA 18 BRAM DNA - Python Implementation
import numpy as np
from scipy.io.wavfile import write

# --- PARAMETRY MATRYCY ---
phi = (1 + np.sqrt(5)) / 2
gamma = 1 / phi
fs = 44100
duration = 108  # 108 sekund

# --- 18 POTWIERDZONYCH POZYCJI GATCA (1-based, rCRS) ---
gatca_positions = [1, 740, 951, 1227, 2996, 3424, 4166, 4832, 
                   6393, 7756, 8415, 10059, 11200, 11336, 
                   11915, 13703, 14784, 16179]
mtDNA_length = 16569

# --- PRZYGOTOWANIE OSI CZASU ---
t = np.linspace(0, duration, int(fs * duration), endpoint=False)

# --- GENERACJA SYMFONII ---
final_wave = np.zeros_like(t, dtype=np.float64)
earth_base = np.sin(2 * np.pi * 7.83 * t) * 0.05

for i, pos in enumerate(gatca_positions):
    start_time = (pos / mtDNA_length) * duration
    gate_freq = 144 * (1 + (i * gamma % 1)) + 718
    envelope = np.exp(-((t - start_time)**2) / (2 * (1.618**2)))
    gate_sound = np.sin(2 * np.pi * gate_freq * t) * envelope
    weight = (phi ** (i % 7)) % 1
    final_wave += gate_sound * weight * gamma

# --- FINALIZACJA ---
output = final_wave + earth_base
output = output / np.max(np.abs(output))
write("SYMFONIA_18_BRAM_DNA.wav", fs, np.int16(output * 32767))`}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
