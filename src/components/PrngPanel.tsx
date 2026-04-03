import { useState, useCallback, useMemo } from "react";
import { Gatca718Prng, QuantumFilterResult } from "@/lib/gatca718Prng";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dna, Dice1, Hash, Shuffle, BarChart3, Copy, RefreshCw, Zap, Activity, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { toast } from "sonner";

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
  const [qfResult, setQfResult] = useState<QuantumFilterResult | null>(null);
  const [qfHistory, setQfHistory] = useState<QuantumFilterResult[]>([]);

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
      <Tabs defaultValue="integer" className="w-full">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full">
          <TabsTrigger value="integer" className="text-xs"><Hash className="w-3 h-3 mr-1" />Integer</TabsTrigger>
          <TabsTrigger value="float" className="text-xs"><Zap className="w-3 h-3 mr-1" />Float</TabsTrigger>
          <TabsTrigger value="dice" className="text-xs"><Dice1 className="w-3 h-3 mr-1" />Kostki</TabsTrigger>
          <TabsTrigger value="list" className="text-xs"><Shuffle className="w-3 h-3 mr-1" />Lista</TabsTrigger>
          <TabsTrigger value="uuid" className="text-xs">UUID</TabsTrigger>
          <TabsTrigger value="gauss" className="text-xs"><BarChart3 className="w-3 h-3 mr-1" />Gauss</TabsTrigger>
        </TabsList>

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
