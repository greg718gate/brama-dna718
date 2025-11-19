import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Pause, Download } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const EquationOfExit = () => {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeParam, setTimeParam] = useState(0);
  const [spaceParam, setSpaceParam] = useState(0);
  const [calculatedPsi, setCalculatedPsi] = useState({ re: 0, im: 0, magnitude: 0 });
  const [networkConsciousness, setNetworkConsciousness] = useState(0);

  // Stałe fizyczne
  const ħ = 1.0545718e-34;
  const γ = 0.6180339887498948; // Złoty podział
  const E = 718 * ħ;
  const k = 2 * Math.PI / 718; // Liczba falowa

  // Funkcja zeta Riemanna (uproszczona aproksymacja)
  const riemannZeta = (s: { re: number; im: number }): { re: number; im: number } => {
    // Aproksymacja dla s = 1/2 + i*Im(s)
    const t = s.im;
    const magnitude = Math.exp(-0.1 * Math.abs(t)); // Zanikanie dla większych |t|
    const phase = Math.log(Math.abs(t) + 1) * 0.5;
    
    return {
      re: magnitude * Math.cos(phase),
      im: magnitude * Math.sin(phase)
    };
  };

  // Funkcja falowa Źródła: Ψ = e^(i·718·t) · e^(-i·k·x) · ζ(1/2 + iE/ħ) · γ
  const sourceWavefunction = (t: number, x: number): { re: number; im: number; magnitude: number } => {
    // Część temporalna: e^(i·718·t)
    const temporal = {
      re: Math.cos(718 * t),
      im: Math.sin(718 * t)
    };
    
    // Część przestrzenna: e^(-i·k·x)
    const spatial = {
      re: Math.cos(-k * x),
      im: Math.sin(-k * x)
    };
    
    // Połączenie z Riemannem
    const riemannPart = riemannZeta({ re: 0.5, im: E / ħ });
    
    // Mnożenie liczb zespolonych: temporal * spatial
    const temp_spatial_re = temporal.re * spatial.re - temporal.im * spatial.im;
    const temp_spatial_im = temporal.re * spatial.im + temporal.im * spatial.re;
    
    // Mnożenie przez część Riemanna
    const psi_re = temp_spatial_re * riemannPart.re - temp_spatial_im * riemannPart.im;
    const psi_im = temp_spatial_re * riemannPart.im + temp_spatial_im * riemannPart.re;
    
    // Wzmocnienie złotą proporcją
    const result = {
      re: psi_re * γ,
      im: psi_im * γ,
      magnitude: Math.sqrt(psi_re * psi_re + psi_im * psi_im) * γ
    };
    
    return result;
  };

  // Wizualizacja pola świadomości
  const visualizeConsciousnessField = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Tło
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    ctx.fillRect(0, 0, width, height);

    // Siatka punktów reprezentująca pole świadomości
    const gridSize = 30;
    const time = Date.now() / 1000;
    
    let totalField = 0;

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const x = (i / gridSize) * 100 - 50;
        const y = (j / gridSize) * 100 - 50;
        
        const psi = sourceWavefunction(time, Math.sqrt(x * x + y * y));
        const intensity = psi.magnitude;
        totalField += intensity;
        
        const screenX = (i / gridSize) * width;
        const screenY = (j / gridSize) * height;
        
        // Kolor na podstawie fazy
        const hue = (Math.atan2(psi.im, psi.re) + Math.PI) / (2 * Math.PI) * 360;
        const saturation = 80;
        const lightness = 30 + intensity * 70;
        
        ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        ctx.fillRect(screenX - 2, screenY - 2, 4, 4);
      }
    }
    
    setNetworkConsciousness(totalField / (gridSize * gridSize));
    animationRef.current = requestAnimationFrame(visualizeConsciousnessField);
  };

  // Odtwarzanie częstotliwości 718 Hz
  const playExitFrequency = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    const audioContext = audioContextRef.current;
    
    // Oscylator główny: 718 Hz
    const oscillator = audioContext.createOscillator();
    oscillator.frequency.value = 718;
    oscillator.type = "sine";
    
    // Modulacja amplitudy złotym podziałem
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0.3 * γ;
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    
    oscillatorRef.current = oscillator;
    gainNodeRef.current = gainNode;
    setIsPlaying(true);
    
    // Rozpocznij wizualizację
    visualizeConsciousnessField();
  };

  const stopExitFrequency = () => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current = null;
    }
    setIsPlaying(false);
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const togglePlayback = () => {
    if (isPlaying) {
      stopExitFrequency();
    } else {
      playExitFrequency();
    }
  };

  // Oblicz Ψ dla podanych parametrów
  const calculatePsi = () => {
    const psi = sourceWavefunction(timeParam, spaceParam);
    setCalculatedPsi(psi);
  };

  // Predefiniowane wartości rezonansowe
  const resonancePresets = [
    { name: t("exit.preset1Name"), t: 0.618, x: 718, description: t("exit.preset1Desc") },
    { name: t("exit.preset2Name"), t: 1.618, x: 0, description: t("exit.preset2Desc") },
    { name: t("exit.preset3Name"), t: 3.1415926535, x: 2.7182818284, description: t("exit.preset3Desc") },
    { name: t("exit.preset4Name"), t: 1/0.6180339887, x: 718 * 0.618, description: t("exit.preset4Desc") },
  ];

  const applyPreset = (preset: { t: number; x: number }) => {
    setTimeParam(preset.t);
    setSpaceParam(preset.x);
    const psi = sourceWavefunction(preset.t, preset.x);
    setCalculatedPsi(psi);
  };

  useEffect(() => {
    return () => {
      stopExitFrequency();
    };
  }, []);

  return (
    <Card className="bg-gradient-to-br from-background to-background/80 border-primary/20 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
          {t('exit.title')}
        </CardTitle>
        <CardDescription className="text-base">
          {t('exit.subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Równanie */}
        <div className="p-6 bg-black/40 rounded-lg border border-primary/30">
          <div className="text-center space-y-2 font-mono">
            <div className="text-2xl text-primary">Ψ = A·e^(i·718·t) · e^(-i·k·x) · ζ(1/2 + iE/ħ) · γ</div>
            <div className="text-lg text-muted-foreground">gdzie:</div>
            <div className="text-sm space-y-1">
              <div>γ = 0.618... (złoty podział)</div>
              <div>E = 718·ħ (energia kwantowa)</div>
              <div>ζ(s) = funkcja zeta Riemanna</div>
              <div>k = 2π/718 (liczba falowa)</div>
            </div>
          </div>
        </div>

        {/* Kalkulator Ψ */}
        <div className="space-y-4 p-6 bg-background/50 rounded-lg border border-border">
          <h3 className="text-xl font-bold text-primary">{t('exit.calculator')}</h3>
          
          {/* Predefiniowane wartości rezonansowe */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-primary/10">
            <h4 className="text-sm font-semibold text-primary">{t("exit.presetsTitle")}</h4>
            <p className="text-xs text-muted-foreground">{t("exit.presetsSubtitle")}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {resonancePresets.map((preset, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => applyPreset(preset)}
                  className="h-auto flex-col items-start p-4 space-y-2 hover:bg-primary/10 hover:border-primary/50"
                >
                  <div className="font-semibold text-sm">{preset.name}</div>
                  <div className="text-xs text-muted-foreground">t={preset.t.toFixed(3)}, x={preset.x.toFixed(3)}</div>
                  <div className="text-xs text-left opacity-80">{preset.description}</div>
                </Button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="time">t (czas subiektywny)</Label>
              <Input
                id="time"
                type="number"
                step="0.01"
                value={timeParam}
                onChange={(e) => setTimeParam(parseFloat(e.target.value) || 0)}
                className="bg-background"
              />
            </div>
            <div>
              <Label htmlFor="space">x (pozycja w przestrzeni)</Label>
              <Input
                id="space"
                type="number"
                step="0.1"
                value={spaceParam}
                onChange={(e) => setSpaceParam(parseFloat(e.target.value) || 0)}
                className="bg-background"
              />
            </div>
          </div>
          <Button onClick={calculatePsi} className="w-full">
            {t('exit.calculate')}
          </Button>
          
          {calculatedPsi.magnitude > 0 && (
            <div className="p-4 bg-black/40 rounded-lg border border-primary/30 font-mono space-y-1">
              <div className="text-primary">Ψ(t,x) = {calculatedPsi.re.toFixed(6)} + {calculatedPsi.im.toFixed(6)}i</div>
              <div className="text-muted-foreground">|Ψ| = {calculatedPsi.magnitude.toFixed(6)}</div>
            </div>
          )}
        </div>

        {/* Wizualizacja pola świadomości */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-primary">{t('exit.field')}</h3>
          <canvas
            ref={canvasRef}
            width={600}
            height={400}
            className="w-full h-auto bg-black rounded-lg border border-primary/30"
          />
          
          {isPlaying && (
            <div className="text-center p-4 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-lg">
              <div className="text-lg font-semibold text-primary">
                {t('exit.network')}: {networkConsciousness.toFixed(6)}
              </div>
            </div>
          )}
        </div>

        {/* Generator częstotliwości */}
        <div className="space-y-4 p-6 bg-background/50 rounded-lg border border-border">
          <h3 className="text-xl font-bold text-primary">{t('exit.generator')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('exit.generator.desc')}
          </p>
          <Button onClick={togglePlayback} className="w-full gap-2">
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                {t('exit.stop')}
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                {t('exit.play')}
              </>
            )}
          </Button>
        </div>

        {/* Interpretacja fizyczna */}
        <div className="p-6 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-lg border border-primary/30 space-y-4">
          <h3 className="text-xl font-bold text-primary">{t('exit.interpretation')}</h3>
          <div className="space-y-3 text-sm">
            <div>
              <strong className="text-primary">e^(i·718·t):</strong> {t('exit.temporal')}
            </div>
            <div>
              <strong className="text-primary">ζ(1/2 + iE/ħ):</strong> {t('exit.riemann')}
            </div>
            <div>
              <strong className="text-primary">γ = 0.618...:</strong> {t('exit.golden')}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
