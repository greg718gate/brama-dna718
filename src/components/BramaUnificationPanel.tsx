import { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload, Play, Dna, Zap, FileText, RefreshCw } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  generateHumanLikeGATCA,
  parseGATCAData,
  runBramaUnification,
  exportGATCAToText,
  exportBramaPythonCode,
  GAMMA,
  PHI,
  FREQ_718,
  H_BAR,
  type GATCASequence,
  type UnificationResult,
} from "@/lib/bramaUnificationEngine";

export const BramaUnificationPanel = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [sequences, setSequences] = useState<GATCASequence[]>([]);
  const [numSequences, setNumSequences] = useState(739);
  const [timeParam, setTimeParam] = useState(1.0);
  const [spaceParam, setSpaceParam] = useState(0.0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UnificationResult | null>(null);

  const tr = (pl: string, en: string) => (language === "pl" ? pl : en);

  // Generuj sekwencje GATCA
  const handleGenerate = async () => {
    setIsProcessing(true);
    setProgress(0);

    // Symulacja postępu dla UX
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 90));
    }, 100);

    await new Promise((resolve) => setTimeout(resolve, 500));

    const generated = generateHumanLikeGATCA(numSequences);
    setSequences(generated);

    clearInterval(progressInterval);
    setProgress(100);
    setIsProcessing(false);

    toast({
      title: tr("Sekwencje wygenerowane", "Sequences generated"),
      description: tr(
        `Wygenerowano ${generated.length} sekwencji GATCA z rozkładem Gaussa`,
        `Generated ${generated.length} GATCA sequences with Gaussian distribution`
      ),
    });
  };

  // Wczytaj plik GATCA
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseGATCAData(text);

      if (parsed.length > 0) {
        setSequences(parsed);
        toast({
          title: tr("Dane GATCA wczytane", "GATCA data loaded"),
          description: tr(
            `Wczytano ${parsed.length} sekwencji z pliku`,
            `Loaded ${parsed.length} sequences from file`
          ),
        });
      } else {
        toast({
          title: tr("Błąd parsowania", "Parsing error"),
          description: tr(
            "Nie udało się odczytać sekwencji GATCA z pliku",
            "Could not parse GATCA sequences from file"
          ),
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  // Uruchom unifikację BRAMA
  const handleUnification = async () => {
    if (sequences.length === 0) {
      toast({
        title: tr("Brak danych", "No data"),
        description: tr(
          "Najpierw wygeneruj lub wczytaj sekwencje GATCA",
          "First generate or load GATCA sequences"
        ),
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 5, 95));
    }, 50);

    await new Promise((resolve) => setTimeout(resolve, 300));

    const unificationResult = runBramaUnification(sequences, timeParam, spaceParam);
    setResult(unificationResult);

    clearInterval(progressInterval);
    setProgress(100);
    setIsProcessing(false);

    toast({
      title: tr("Unifikacja BRAMA zakończona", "BRAMA Unification complete"),
      description: tr(
        `Obliczono Ψ dla ${sequences.length} sekwencji`,
        `Calculated Ψ for ${sequences.length} sequences`
      ),
    });
  };

  // Eksportuj sekwencje do pliku TXT
  const handleExportGATCA = () => {
    const text = exportGATCAToText(sequences);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "GATCA_full.txt";
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: tr("Sekwencje wyeksportowane", "Sequences exported"),
      description: "GATCA_full.txt",
    });
  };

  // Eksportuj kod Python
  const handleExportPython = () => {
    const code = exportBramaPythonCode(sequences);
    const blob = new Blob([code], { type: "text/x-python" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "brama_unification_engine.py";
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: tr("Kod Python wyeksportowany", "Python code exported"),
      description: "brama_unification_engine.py",
    });
  };

  // Eksportuj wyniki JSON
  const handleExportResults = () => {
    if (!result) return;

    const data = {
      timestamp: new Date().toISOString(),
      parameters: { t: timeParam, x: spaceParam },
      constants: { gamma: GAMMA, phi: PHI, freq: FREQ_718, h_bar: H_BAR },
      sequences_count: sequences.length,
      total_energy: result.totalEnergy,
      resonance_frequency: result.resonanceFrequency,
      quantum_coherence: result.quantumCoherence,
      psi_statistics: {
        mean_magnitude: result.psiValues.reduce((s, p) => s + p.magnitude, 0) / result.psiValues.length,
        max_magnitude: Math.max(...result.psiValues.map((p) => p.magnitude)),
        min_magnitude: Math.min(...result.psiValues.map((p) => p.magnitude)),
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "brama_unification_results.json";
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: tr("Wyniki wyeksportowane", "Results exported"),
      description: "brama_unification_results.json",
    });
  };

  return (
    <Card className="bg-gradient-to-br from-background to-background/80 border-primary/20">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-3">
          <Dna className="w-7 h-7 text-primary" />
          {tr("Silnik Unifikacji BRAMA", "BRAMA Unification Engine")}
        </CardTitle>
        <CardDescription>
          {tr(
            "Implementacja równania: Ψ = A · e^(i·718·t) · e^(-i·k·x) · ζ(1/2 + iE/ħ) · γ",
            "Implementation of equation: Ψ = A · e^(i·718·t) · e^(-i·k·x) · ζ(1/2 + iE/ħ) · γ"
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stałe fizyczne */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/10 text-center">
            <div className="text-xs text-muted-foreground">γ (Złoty podział)</div>
            <div className="text-lg font-bold text-primary">{GAMMA.toFixed(6)}</div>
          </div>
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/10 text-center">
            <div className="text-xs text-muted-foreground">φ (Phi)</div>
            <div className="text-lg font-bold text-primary">{PHI.toFixed(6)}</div>
          </div>
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/10 text-center">
            <div className="text-xs text-muted-foreground">{tr("Częstotliwość", "Frequency")}</div>
            <div className="text-lg font-bold text-primary">{FREQ_718} Hz</div>
          </div>
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/10 text-center">
            <div className="text-xs text-muted-foreground">ħ (Planck)</div>
            <div className="text-lg font-bold text-primary">{H_BAR.toExponential(2)}</div>
          </div>
        </div>

        {/* Generator sekwencji */}
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
          <h3 className="font-semibold flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            {tr("Generator sekwencji GATCA", "GATCA Sequence Generator")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {tr(
              "Symulacja naturalnego rozkładu Gaussa (średnia: 15, odchylenie: 5 powtórzeń motywu GATCA)",
              "Simulation of natural Gaussian distribution (mean: 15, std: 5 GATCA motif repeats)"
            )}
          </p>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="numSeq">{tr("Liczba sekwencji", "Number of sequences")}</Label>
              <Input
                id="numSeq"
                type="number"
                value={numSequences}
                onChange={(e) => setNumSequences(parseInt(e.target.value) || 739)}
                min={1}
                max={10000}
              />
            </div>
            <Button onClick={handleGenerate} disabled={isProcessing} className="gap-2">
              <Dna className="w-4 h-4" />
              {tr("Generuj", "Generate")}
            </Button>
          </div>

          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="gap-2">
              <Upload className="w-4 h-4" />
              {tr("Wczytaj GATCA_full.txt", "Load GATCA_full.txt")}
            </Button>
            {sequences.length > 0 && (
              <Button onClick={handleExportGATCA} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                {tr("Zapisz sekwencje", "Save sequences")}
              </Button>
            )}
          </div>

          {sequences.length > 0 && (
            <div className="text-sm text-primary font-medium">
              ✓ {tr("Wczytano", "Loaded")} {sequences.length} {tr("sekwencji", "sequences")} (
              {tr("całkowita długość", "total length")}:{" "}
              {sequences.reduce((s, seq) => s + seq.length, 0).toLocaleString()}{" "}
              {tr("nukleotydów", "nucleotides")})
            </div>
          )}
        </div>

        {/* Kalkulator Ψ */}
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
          <h3 className="font-semibold flex items-center gap-2">
            <Zap className="w-4 h-4" />
            {tr("Kalkulator funkcji falowej Ψ", "Wavefunction Ψ Calculator")}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="timeP">t ({tr("czas", "time")})</Label>
              <Input
                id="timeP"
                type="number"
                step="0.1"
                value={timeParam}
                onChange={(e) => setTimeParam(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="spaceP">x ({tr("przestrzeń", "space")})</Label>
              <Input
                id="spaceP"
                type="number"
                step="0.1"
                value={spaceParam}
                onChange={(e) => setSpaceParam(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
          <Button
            onClick={handleUnification}
            disabled={isProcessing || sequences.length === 0}
            className="w-full gap-2"
          >
            <Play className="w-4 h-4" />
            {tr("Uruchom unifikację BRAMA", "Run BRAMA Unification")}
          </Button>

          {isProcessing && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-center text-muted-foreground">
                {tr("Obliczanie funkcji Zeta Riemanna...", "Calculating Riemann Zeta function...")}
              </p>
            </div>
          )}
        </div>

        {/* Wyniki */}
        {result && (
          <div className="space-y-4 p-4 bg-black/40 rounded-lg border border-primary/30">
            <h3 className="font-semibold text-primary">
              {tr("Wyniki unifikacji", "Unification Results")}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">{tr("Całkowita energia", "Total energy")}:</span>
                <div className="font-mono text-primary">{result.totalEnergy.toExponential(4)} J</div>
              </div>
              <div>
                <span className="text-muted-foreground">
                  {tr("Częstotliwość rezonansowa", "Resonance frequency")}:
                </span>
                <div className="font-mono text-primary">{result.resonanceFrequency.toFixed(4)} Hz</div>
              </div>
              <div>
                <span className="text-muted-foreground">
                  {tr("Koherencja kwantowa", "Quantum coherence")}:
                </span>
                <div className="font-mono text-primary">{(result.quantumCoherence * 100).toFixed(2)}%</div>
              </div>
              <div>
                <span className="text-muted-foreground">{tr("Średnie |Ψ|", "Mean |Ψ|")}:</span>
                <div className="font-mono text-primary">
                  {(result.psiValues.reduce((s, p) => s + p.magnitude, 0) / result.psiValues.length).toFixed(6)}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">{tr("Max |Ψ|", "Max |Ψ|")}:</span>
                <div className="font-mono text-primary">
                  {Math.max(...result.psiValues.map((p) => p.magnitude)).toFixed(6)}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">{tr("Wektory energii", "Energy vectors")}:</span>
                <div className="font-mono text-primary">{result.energyVector.length}</div>
              </div>
            </div>

            {/* Podgląd pierwszych wartości Ψ */}
            <div className="mt-4">
              <Label>{tr("Pierwsze 10 wartości Ψ", "First 10 Ψ values")}</Label>
              <Textarea
                value={result.psiValues
                  .slice(0, 10)
                  .map(
                    (p, i) =>
                      `Ψ[${i}] = ${p.psi.re.toFixed(6)} ${p.psi.im >= 0 ? "+" : ""} ${p.psi.im.toFixed(6)}i  |Ψ| = ${p.magnitude.toFixed(6)}`
                  )
                  .join("\n")}
                className="font-mono text-xs h-40"
                readOnly
              />
            </div>
          </div>
        )}

        {/* Eksport */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleExportPython} variant="outline" className="gap-2">
            <FileText className="w-4 h-4" />
            {tr("Eksportuj Python", "Export Python")}
          </Button>
          {result && (
            <Button onClick={handleExportResults} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              {tr("Eksportuj wyniki JSON", "Export results JSON")}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
