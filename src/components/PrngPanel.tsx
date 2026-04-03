import { useState, useCallback, useMemo } from "react";
import { Gatca718Prng, QuantumFilterResult } from "@/lib/gatca718Prng";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dna, Dice1, Hash, Shuffle, BarChart3, Copy, RefreshCw, Zap, Activity, TrendingUp, TrendingDown, Minus, Download, FileText } from "lucide-react";
import { toast } from "sonner";

/** Wpis dziennika sygnałów QF */
interface SignalLogEntry {
  timestamp: string;
  action: "BUY" | "SELL";
  confidence: number;
  price: number;
  compositeSignal: number;
  gateSignature: string;
  correlation: number;
  harmonicStrength: number;
  phaseCoherence: number;
}

const PrngPanel = () => {
  const [prng] = useState(() => new Gatca718Prng());
  const [results, setResults] = useState<string[]>([]);
  const [history, setHistory] = useState<{ type: string; value: string; gate: number }[]>([]);

  // --- Integer generator state ---
  const [intMin, setIntMin] = useState("1");
  const [intMax, setIntMax] = useState("100");
  const [intCount, setIntCount] = useState("1");

  // --- Float generator state ---
  const [floatMin, setFloatMin] = useState("0");
  const [floatMax, setFloatMax] = useState("1");
  const [floatCount, setFloatCount] = useState("5");

  // --- Dice state ---
  const [diceSides, setDiceSides] = useState("6");
  const [diceCount, setDiceCount] = useState("3");

  // --- List state ---
  const [listInput, setListInput] = useState("Alfa, Beta, Gamma, Delta, Epsilon");
  const [listAction, setListAction] = useState<"pick" | "shuffle">("pick");

  // --- Quantum Filter state ---
  const [qfInput, setQfInput] = useState("1.2345, 0.9876, 1.0012, 0.8765, 1.1234, 0.9543, 1.0678, 0.9321, 1.0456, 0.8912");
  const [qfThreshold, setQfThreshold] = useState("0.85");
  const [qfPrice, setQfPrice] = useState("");
  const [qfResult, setQfResult] = useState<QuantumFilterResult | null>(null);
  const [qfHistory, setQfHistory] = useState<QuantumFilterResult[]>([]);
  const [signalLog, setSignalLog] = useState<SignalLogEntry[]>([]);

  // --- Seed ---
  const [seedInput, setSeedInput] = useState("");

  const addToHistory = useCallback((type: string, value: string) => {
    const stats = prng.stats();
    setHistory(prev => [{ type, value, gate: stats.gateIndex }, ...prev].slice(0, 50));
  }, [prng]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Skopiowano!");
  }, []);

  // --- Generators ---
  const generateIntegers = useCallback(() => {
    const min = parseInt(intMin) || 0;
    const max = parseInt(intMax) || 100;
    const count = Math.min(parseInt(intCount) || 1, 1000);
    const nums = Array.from({ length: count }, () => prng.integer(min, max));
    const result = nums.join(", ");
    setResults([result]);
    addToHistory(`Integer [${min}-${max}]`, result);
  }, [prng, intMin, intMax, intCount, addToHistory]);

  const generateFloats = useCallback(() => {
    const min = parseFloat(floatMin) || 0;
    const max = parseFloat(floatMax) || 1;
    const count = Math.min(parseInt(floatCount) || 5, 1000);
    const nums = Array.from({ length: count }, () => prng.float(min, max));
    const result = nums.map(n => n.toFixed(8)).join("\n");
    setResults([result]);
    addToHistory(`Float [${min}-${max}]`, `${count} values`);
  }, [prng, floatMin, floatMax, floatCount, addToHistory]);

  const generateDice = useCallback(() => {
    const sides = parseInt(diceSides) || 6;
    const count = Math.min(parseInt(diceCount) || 3, 100);
    const rolls = Array.from({ length: count }, () => prng.dice(sides));
    const sum = rolls.reduce((a, b) => a + b, 0);
    const result = `🎲 ${rolls.join(", ")}  |  Suma: ${sum}  |  Średnia: ${(sum / count).toFixed(2)}`;
    setResults([result]);
    addToHistory(`Dice d${sides}×${count}`, result);
  }, [prng, diceSides, diceCount, addToHistory]);

  const generateFromList = useCallback(() => {
    const items = listInput.split(",").map(s => s.trim()).filter(Boolean);
    if (items.length === 0) return;
    if (listAction === "pick") {
      const picked = prng.pick(items);
      setResults([`✦ ${picked}`]);
      addToHistory("Pick", picked);
    } else {
      const shuffled = prng.shuffle(items);
      setResults([shuffled.join(", ")]);
      addToHistory("Shuffle", shuffled.join(", "));
    }
  }, [prng, listInput, listAction, addToHistory]);

  const generateUuid = useCallback(() => {
    const uuid = prng.uuid();
    setResults([uuid]);
    addToHistory("UUID", uuid);
  }, [prng, addToHistory]);

  const generateGaussian = useCallback(() => {
    const values = Array.from({ length: 10 }, () => prng.gaussian(0, 1));
    const result = values.map(v => v.toFixed(6)).join("\n");
    setResults([result]);
    addToHistory("Gaussian(0,1)", `10 values`);
  }, [prng, addToHistory]);

  const handleReseed = useCallback(() => {
    const seed = seedInput ? parseInt(seedInput) : Date.now();
    prng.reseed(seed);
    setSeedInput("");
    toast.success(`Reseed: ${seed}`);
  }, [prng, seedInput]);

  const runQuantumFilter = useCallback(() => {
    const values = qfInput.split(",").map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
    if (values.length < 2) {
      toast.error("Wprowadź min. 2 wartości liczbowe");
      return;
    }
    const threshold = parseFloat(qfThreshold) || 0.85;
    const price = parseFloat(qfPrice) || 0;
    const result = prng.analyzeSignal(values, threshold);
    setQfResult(result);
    setQfHistory(prev => [result, ...prev].slice(0, 20));
    addToHistory("QF", `${result.decisionLabel} (${result.confidence.toFixed(1)}%)`);

    // Auto-log BUY/SELL signals
    if (result.decision !== 0) {
      const now = new Date();
      const timestamp = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}.${String(now.getMilliseconds()).padStart(3,'0')}`;
      const entry: SignalLogEntry = {
        timestamp,
        action: result.decisionLabel as "BUY" | "SELL",
        confidence: result.confidence,
        price,
        compositeSignal: result.compositeSignal,
        gateSignature: result.gateSignature,
        correlation: result.correlation,
        harmonicStrength: result.harmonicStrength,
        phaseCoherence: result.phaseCoherence,
      };
      setSignalLog(prev => [entry, ...prev]);
      toast.success(`⚡ Sygnał ${entry.action} zarejestrowany @ ${price || "brak ceny"}`);
    }
  }, [prng, qfInput, qfThreshold, qfPrice, addToHistory]);

  /** Eksport dziennika sygnałów do CSV */
  const exportSignalLogCSV = useCallback(() => {
    if (signalLog.length === 0) {
      toast.error("Brak sygnałów do eksportu");
      return;
    }
    const header = "Timestamp,Action,Confidence(%),Price,Composite,Gate,Correlation,HarmonicStrength,PhaseCoherence";
    const rows = signalLog.map(e =>
      `${e.timestamp},${e.action},${e.confidence.toFixed(4)},${e.price},${e.compositeSignal.toFixed(8)},${e.gateSignature},${e.correlation.toFixed(6)},${e.harmonicStrength.toFixed(6)},${e.phaseCoherence.toFixed(6)}`
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gatca_performance_log_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Wyeksportowano ${signalLog.length} sygnałów`);
  }, [signalLog]);

  /** Eksport pełnego JSON odpowiedzi QF */
  const exportQfJson = useCallback(() => {
    if (!qfResult) return;
    const json = JSON.stringify(qfResult, null, 2);
    copyToClipboard(json);
    toast.success("JSON skopiowany do schowka");
  }, [qfResult, copyToClipboard]);

  const stats = useMemo(() => prng.stats(), [results, history]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Dna className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold font-mono text-foreground">
            GATCA-718 PRNG
          </h1>
        </div>
        <p className="text-sm text-muted-foreground font-mono">
          Quantum-Speed Pseudorandom Engine · φ × 718.57 × mtDNA
        </p>
        <div className="flex justify-center gap-2 flex-wrap">
          <Badge variant="outline" className="font-mono text-xs">
            Brama: {stats.gateIndex + 1}/18
          </Badge>
          <Badge variant="outline" className="font-mono text-xs">
            Iteracja: {stats.counter}
          </Badge>
          <Badge variant="outline" className="font-mono text-xs">
            Seed: {stats.seed}
          </Badge>
        </div>
      </div>

      {/* Reseed */}
      <Card className="bg-card/50 backdrop-blur-sm border-border">
        <CardContent className="pt-4 flex gap-2">
          <Input
            placeholder="Seed (puste = timestamp)"
            value={seedInput}
            onChange={(e) => setSeedInput(e.target.value)}
            className="font-mono"
          />
          <Button variant="outline" onClick={handleReseed} className="shrink-0">
            <RefreshCw className="w-4 h-4 mr-1" /> Reseed
          </Button>
        </CardContent>
      </Card>

      {/* Generator Tabs */}
      <Tabs defaultValue="quantum" className="w-full">
        <TabsList className="grid grid-cols-4 md:grid-cols-7 w-full">
          <TabsTrigger value="quantum" className="text-xs"><Activity className="w-3 h-3 mr-1" />QF</TabsTrigger>
          <TabsTrigger value="integer" className="text-xs"><Hash className="w-3 h-3 mr-1" />Int</TabsTrigger>
          <TabsTrigger value="float" className="text-xs"><Zap className="w-3 h-3 mr-1" />Float</TabsTrigger>
          <TabsTrigger value="dice" className="text-xs"><Dice1 className="w-3 h-3 mr-1" />Dice</TabsTrigger>
          <TabsTrigger value="list" className="text-xs"><Shuffle className="w-3 h-3 mr-1" />Lista</TabsTrigger>
          <TabsTrigger value="uuid" className="text-xs">UUID</TabsTrigger>
          <TabsTrigger value="gauss" className="text-xs"><BarChart3 className="w-3 h-3 mr-1" />Gauss</TabsTrigger>
        </TabsList>

        {/* Quantum Filter */}
        <TabsContent value="quantum">
          <Card className="bg-card/50 border-border border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Quantum Filter GATCA-718
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Filtr interferencyjny φ × 718.57 × mtDNA — 3 warstwy analizy
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Wektor danych (wartości oddzielone przecinkami)</label>
                <Textarea
                  value={qfInput}
                  onChange={(e) => setQfInput(e.target.value)}
                  className="font-mono text-xs"
                  rows={3}
                  placeholder="1.2345, 0.9876, 1.0012, ..."
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Próg decyzji (0.0–1.0)</label>
                <Input
                  value={qfThreshold}
                  onChange={(e) => setQfThreshold(e.target.value)}
                  className="font-mono"
                />
              </div>
              <Button onClick={runQuantumFilter} className="w-full">
                <Activity className="w-4 h-4 mr-2" /> Analizuj sygnał
              </Button>

              {qfResult && (
                <div className="space-y-3 mt-4">
                  {/* Decision */}
                  <div className={`text-center p-4 rounded-lg border ${
                    qfResult.decision === 1 ? "bg-emerald-500/10 border-emerald-500/30" :
                    qfResult.decision === -1 ? "bg-red-500/10 border-red-500/30" :
                    "bg-muted/30 border-border"
                  }`}>
                    <div className="flex items-center justify-center gap-2 mb-1">
                      {qfResult.decision === 1 ? <TrendingUp className="w-6 h-6 text-emerald-500" /> :
                       qfResult.decision === -1 ? <TrendingDown className="w-6 h-6 text-red-500" /> :
                       <Minus className="w-6 h-6 text-muted-foreground" />}
                      <span className={`text-2xl font-bold font-mono ${
                        qfResult.decision === 1 ? "text-emerald-500" :
                        qfResult.decision === -1 ? "text-red-500" :
                        "text-muted-foreground"
                      }`}>
                        {qfResult.decisionLabel}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">
                      Confidence: {qfResult.confidence.toFixed(2)}%
                    </span>
                  </div>

                  {/* 3-Layer Analysis */}
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-muted-foreground">Korelacja GATCA</span>
                        <span className="text-primary">{qfResult.correlation.toFixed(6)}</span>
                      </div>
                      <Progress value={Math.abs(qfResult.correlation) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-muted-foreground">Rezonans harmoniczny</span>
                        <span className="text-primary">{qfResult.harmonicStrength.toFixed(6)}</span>
                      </div>
                      <Progress value={qfResult.harmonicStrength * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-muted-foreground">Koherencja fazowa</span>
                        <span className="text-primary">{qfResult.phaseCoherence.toFixed(6)}</span>
                      </div>
                      <Progress value={qfResult.phaseCoherence * 100} className="h-2" />
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="bg-background/50 p-2 rounded">
                      <span className="text-muted-foreground">Composite:</span>{" "}
                      <span className="text-foreground">{qfResult.compositeSignal.toFixed(8)}</span>
                    </div>
                    <div className="bg-background/50 p-2 rounded">
                      <span className="text-muted-foreground">Gate:</span>{" "}
                      <span className="text-foreground">{qfResult.gateSignature}</span>
                    </div>
                  </div>

                  {/* Entropy vector */}
                  <details className="text-xs">
                    <summary className="text-muted-foreground cursor-pointer font-mono">
                      Wektor entropii ({qfResult.entropyVector.length} wartości)
                    </summary>
                    <pre className="mt-1 p-2 bg-background/50 rounded font-mono text-[10px] text-muted-foreground overflow-x-auto">
                      {qfResult.entropyVector.map(v => v.toFixed(8)).join("\n")}
                    </pre>
                  </details>
                </div>
              )}

              {/* QF History */}
              {qfHistory.length > 1 && (
                <details className="text-xs">
                  <summary className="text-muted-foreground cursor-pointer font-mono">
                    Historia QF ({qfHistory.length})
                  </summary>
                  <div className="mt-1 space-y-1 max-h-[150px] overflow-y-auto">
                    {qfHistory.map((r, i) => (
                      <div key={i} className="flex items-center gap-2 font-mono text-[10px]">
                        <Badge variant="outline" className={`text-[9px] ${
                          r.decision === 1 ? "border-emerald-500/50 text-emerald-500" :
                          r.decision === -1 ? "border-red-500/50 text-red-500" :
                          ""
                        }`}>
                          {r.decisionLabel}
                        </Badge>
                        <span className="text-muted-foreground">{r.confidence.toFixed(1)}%</span>
                        <span className="text-muted-foreground">{r.gateSignature}</span>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integer */}
        <TabsContent value="integer">
          <Card className="bg-card/50 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono">Liczby całkowite</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Min</label>
                  <Input value={intMin} onChange={(e) => setIntMin(e.target.value)} className="font-mono" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Max</label>
                  <Input value={intMax} onChange={(e) => setIntMax(e.target.value)} className="font-mono" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Ilość</label>
                  <Input value={intCount} onChange={(e) => setIntCount(e.target.value)} className="font-mono" />
                </div>
              </div>
              <Button onClick={generateIntegers} className="w-full">
                <Zap className="w-4 h-4 mr-2" /> Generuj
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Float */}
        <TabsContent value="float">
          <Card className="bg-card/50 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono">Liczby zmiennoprzecinkowe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Min</label>
                  <Input value={floatMin} onChange={(e) => setFloatMin(e.target.value)} className="font-mono" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Max</label>
                  <Input value={floatMax} onChange={(e) => setFloatMax(e.target.value)} className="font-mono" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Ilość</label>
                  <Input value={floatCount} onChange={(e) => setFloatCount(e.target.value)} className="font-mono" />
                </div>
              </div>
              <Button onClick={generateFloats} className="w-full">
                <Zap className="w-4 h-4 mr-2" /> Generuj
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dice */}
        <TabsContent value="dice">
          <Card className="bg-card/50 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono">Rzut kostkami</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Ścianki</label>
                  <Input value={diceSides} onChange={(e) => setDiceSides(e.target.value)} className="font-mono" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Rzutów</label>
                  <Input value={diceCount} onChange={(e) => setDiceCount(e.target.value)} className="font-mono" />
                </div>
              </div>
              <Button onClick={generateDice} className="w-full">
                <Dice1 className="w-4 h-4 mr-2" /> Rzuć
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* List */}
        <TabsContent value="list">
          <Card className="bg-card/50 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono">Losowanie z listy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="Elementy oddzielone przecinkami..."
                value={listInput}
                onChange={(e) => setListInput(e.target.value)}
                className="font-mono text-sm"
              />
              <div className="flex gap-2">
                <Button
                  variant={listAction === "pick" ? "default" : "outline"}
                  onClick={() => setListAction("pick")}
                  className="flex-1"
                >
                  Losuj 1
                </Button>
                <Button
                  variant={listAction === "shuffle" ? "default" : "outline"}
                  onClick={() => setListAction("shuffle")}
                  className="flex-1"
                >
                  Tasuj
                </Button>
              </div>
              <Button onClick={generateFromList} className="w-full">
                <Shuffle className="w-4 h-4 mr-2" /> Wykonaj
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* UUID */}
        <TabsContent value="uuid">
          <Card className="bg-card/50 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono">UUID v4 (GATCA-enhanced)</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={generateUuid} className="w-full">
                <Zap className="w-4 h-4 mr-2" /> Generuj UUID
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gaussian */}
        <TabsContent value="gauss">
          <Card className="bg-card/50 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono">Rozkład normalny (μ=0, σ=1)</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={generateGaussian} className="w-full">
                <BarChart3 className="w-4 h-4 mr-2" /> Generuj 10 wartości
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Results */}
      {results.length > 0 && (
        <Card className="bg-card/50 border-border border-primary/30">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-mono text-primary">WYNIK</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(results.join("\n"))}>
              <Copy className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <pre className="font-mono text-sm text-foreground whitespace-pre-wrap break-all bg-background/50 p-3 rounded-lg">
              {results.join("\n")}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* History */}
      {history.length > 0 && (
        <Card className="bg-card/50 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-mono text-muted-foreground">
              Historia ({history.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-[200px] overflow-y-auto">
              {history.map((entry, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                  <Badge variant="outline" className="text-[10px] shrink-0">G{entry.gate + 1}</Badge>
                  <span className="text-primary shrink-0">{entry.type}</span>
                  <span className="truncate">{entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PrngPanel;
