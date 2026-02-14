import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Zap, Sparkles, Info, Atom, FlaskConical, BookMarked, Grid3x3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  decodeVerse,
  PRESET_VERSES,
  HEBREW_GEMATRIA,
  GATCA_GATES,
  GATE_NAMES,
  type DecoderResult,
} from "@/lib/biblicalDecoder";

const stateColors: Record<string, string> = {
  TELEPORTATION_READY: "bg-green-500/20 text-green-400 border-green-500/40",
  HIGH_COHERENCE: "bg-amber-500/20 text-amber-400 border-amber-500/40",
  SUPERPOSITION: "bg-blue-500/20 text-blue-400 border-blue-500/40",
  ENTANGLED: "bg-purple-500/20 text-purple-400 border-purple-500/40",
  DECOHERENT: "bg-red-500/20 text-red-400 border-red-500/40",
};

const stabilityColors: Record<string, string> = {
  STABLE: "text-green-400",
  METASTABLE: "text-amber-400",
  UNSTABLE: "text-red-400",
};

const testabilityColors: Record<string, string> = {
  HIGH: "bg-green-500/20 text-green-400",
  MEDIUM: "bg-amber-500/20 text-amber-400",
  LOW: "bg-red-500/20 text-red-400",
};

const BiblicalDecoder = () => {
  const navigate = useNavigate();
  const [reference, setReference] = useState("");
  const [text, setText] = useState("");
  const [hebrewText, setHebrewText] = useState("");
  const [result, setResult] = useState<DecoderResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleDecode = () => {
    if (!text.trim() && !hebrewText.trim()) return;
    setIsCalculating(true);
    setTimeout(() => {
      const r = decodeVerse(reference || "Custom", text, hebrewText);
      setResult(r);
      setIsCalculating(false);
    }, 150);
  };

  const handlePreset = (preset: typeof PRESET_VERSES[0]) => {
    setReference(preset.reference);
    setText(preset.text);
    setHebrewText(preset.hebrew);
    setIsCalculating(true);
    setTimeout(() => {
      const r = decodeVerse(preset.reference, preset.text, preset.hebrew);
      setResult(r);
      setIsCalculating(false);
    }, 150);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <BookOpen className="w-5 h-5 text-primary" />
          <h1 className="font-bold text-lg">Ψ-718 Biblical Decoder</h1>
          <Badge variant="outline" className="ml-auto font-mono text-xs hidden sm:inline-flex">
            Gematria + Fraktal + Hamilton + Lindblad
          </Badge>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        {/* EXPLANATION - What is this and how it works */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Info className="w-5 h-5 text-primary" />
              Czym jest Ψ-718 Biblical Decoder?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              <strong className="text-foreground">Ψ-718 Biblical Decoder</strong> to narzędzie obliczeniowe, które
              przekształca tekst biblijny w parametry kwantowego pola świadomości. Łączy starożytną
              wiedzę zawartą w gematrii hebrajskiej z nowoczesną fizyką kwantową i biologią molekularną DNA.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-background/50 border border-border space-y-2">
                <h4 className="font-semibold text-foreground text-xs">🔤 Krok 1: Gematria Hebrajska</h4>
                <p className="text-xs">
                  Każda litera hebrajska ma wartość liczbową (א=1, ב=2... ת=400).
                  Suma wartości wersetu staje się parametrem czasowym <code className="text-primary">t</code> w równaniu falowym Ψ.
                  To jest punkt wejścia tekstu do pola kwantowego.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-background/50 border border-border space-y-2">
                <h4 className="font-semibold text-foreground text-xs">🌀 Krok 2: Analiza Fraktalna</h4>
                <p className="text-xs">
                  Pierwsze 718 znaków tekstu jest analizowane pod kątem złożoności fraktalnej
                  (przybliżenie wykładnika Hursta). Wynik definiuje parametr przestrzenny <code className="text-primary">x</code> —
                  „gdzie" w polu informacyjnym znajduje się ten tekst.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-background/50 border border-border space-y-2">
                <h4 className="font-semibold text-foreground text-xs">⚛️ Krok 3: Korelacja Hamiltona</h4>
                <p className="text-xs">
                  Operator Hamiltona (energia całkowita systemu) ma 18 poziomów energii odpowiadających
                  18 bramom GATCA w mitochondrialnym DNA. Kombinacja gematrii i fraktala wskazuje,
                  która brama DNA rezonuje z tym wersetem.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-background/50 border border-border space-y-2">
                <h4 className="font-semibold text-foreground text-xs">🌊 Krok 4: Funkcja Falowa Ψ</h4>
                <p className="text-xs">
                  Obliczamy pełną funkcję falową: <code className="text-primary">Ψ = e^(i·718·t) · ζ(1/2+iE/ħ) · γ</code> —
                  z modulacjami Schumanna (7.83 Hz), Lunar (18.6 Hz) i wzmocnieniem φ².
                  Wynik daje amplitudę, fazę i koherencję kwantową wersetu.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <h4 className="font-semibold text-foreground text-xs mb-1">🎯 Do czego to służy?</h4>
              <p className="text-xs">
                System pozwala zbadać numeryczną strukturę tekstów biblijnych poprzez pryzmat fizyki kwantowej.
                Oblicza „odcisk palca" każdego wersetu — jego amplitudę falową, rezonans z bramami DNA,
                Wektor Intencji (VI) i stabilność kwantową w warunkach biologicznych (model dekherencji Lindblada).
                Każdy wynik zawiera predykcje testowalne laboratoryjnie (UV-Vis, NMR, EEG).
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Preset verses */}
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Predefiniowane wersety
            </CardTitle>
            <CardDescription className="text-xs">
              Kliknij werset, aby natychmiast obliczyć jego odcisk kwantowy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {PRESET_VERSES.map((p) => (
                <Button
                  key={p.reference}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handlePreset(p)}
                >
                  {p.reference}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Input */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono">DANE WEJŚCIOWE</CardTitle>
            <CardDescription className="text-xs">
              Wpisz dowolny tekst biblijny. Opcjonalnie dodaj oryginał hebrajski dla precyzyjnej gematrii.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Referencja (np. Genesis 1:1)</label>
              <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Genesis 1:1" className="font-mono" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Tekst wersetu (dowolny język)</label>
              <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="In the beginning God created the heavens and the earth..." className="font-mono min-h-[80px]" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Tekst hebrajski (opcjonalnie – dla gematrii)</label>
              <Textarea value={hebrewText} onChange={(e) => setHebrewText(e.target.value)} placeholder="בְּרֵאשִׁית בָּרָא אֱלֹהִים" className="font-mono min-h-[60px]" dir="rtl" />
            </div>
            <Button onClick={handleDecode} disabled={isCalculating || (!text.trim() && !hebrewText.trim())} className="w-full h-12 font-bold text-lg">
              <Zap className="w-5 h-5 mr-2" />
              {isCalculating ? "OBLICZANIE Ψ..." : "DEKODUJ PRZEZ Ψ-718"}
            </Button>
          </CardContent>
        </Card>

        {/* Hebrew Gematria reference */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono text-muted-foreground">TABELA GEMATRII HEBRAJSKIEJ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(HEBREW_GEMATRIA).map(([char, val]) => (
                <span key={char} className="inline-flex items-center gap-1 text-xs bg-muted/50 rounded px-2 py-0.5 font-mono">
                  <span className="text-primary text-sm">{char}</span>
                  <span className="text-muted-foreground">={val}</span>
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ══════════════════════ RESULTS ══════════════════════ */}
        {result && (
          <div className="space-y-4 animate-fade-in">

            {/* ─── Core Results ─── */}
            <Card className="border-primary/30 bg-card/80">
              <CardContent className="pt-6">
                <div className="text-center space-y-2 mb-4">
                  <h2 className="font-mono font-bold text-xl text-primary">Ψ-718 QUANTUM DECODER</h2>
                  <p className="text-lg font-semibold">{result.reference}</p>
                  <p className="text-sm text-muted-foreground italic">"{result.text.slice(0, 120)}"</p>
                </div>

                <Separator className="my-4" />

                {/* Gematria */}
                <div className="space-y-2">
                  <h3 className="font-mono text-sm text-primary">✡ GEMATRIA HEBRAJSKA</h3>
                  {result.gematriaBreakdown.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {result.gematriaBreakdown.map((b, i) => (
                        <span key={i} className="inline-flex items-center gap-0.5 text-xs bg-primary/10 rounded px-1.5 py-0.5 font-mono">
                          <span className="text-primary">{b.char}</span>
                          <span className="text-muted-foreground">={b.value}</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Brak tekstu hebrajskiego – użyto gematrii łacińskiej</p>
                  )}
                  <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                    <div>Suma: <span className="text-primary font-bold">{result.gematriaTotal}</span></div>
                    <div>t = <span className="text-primary font-bold">{result.gematriaT.toFixed(6)}</span></div>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Fractal */}
                <div className="space-y-2">
                  <h3 className="font-mono text-sm text-primary">🌀 ANALIZA FRAKTALNA (718 znaków)</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                    <div>Hurst (H): <span className="text-primary font-bold">{result.fractalHurst.toFixed(6)}</span></div>
                    <div>x = <span className="text-primary font-bold">{result.fractalX.toFixed(2)}</span></div>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Hamilton Gate */}
                <div className="space-y-2">
                  <h3 className="font-mono text-sm text-primary">⚛️ KORELACJA HAMILTONA → BRAMA DNA</h3>
                  <div className="text-sm font-mono space-y-1">
                    <div>Gate Index: <span className="text-primary font-bold">{result.hamiltonGate}</span></div>
                    <div>Brama: <span className="text-primary font-bold">{result.gateName}</span></div>
                    <div>Pozycja mtDNA: <span className="text-primary font-bold">{result.gatePosition}</span> / 16569</div>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Wave Function */}
                <div className="space-y-2">
                  <h3 className="font-mono text-sm text-primary">🌊 FUNKCJA FALOWA Ψ</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm font-mono">
                    <div>Ψ = {result.psi.amplitude.re.toFixed(6)} {result.psi.amplitude.im >= 0 ? "+" : ""}{result.psi.amplitude.im.toFixed(6)}i</div>
                    <div>|Ψ| = <span className="text-primary font-bold">{result.psi.magnitude.toFixed(6)}</span></div>
                    <div>Faza = {result.psi.phase.toFixed(6)} rad</div>
                    <div>Koherencja = <span className="text-primary font-bold">{(result.psi.coherence * 100).toFixed(2)}%</span></div>
                  </div>
                  <Badge variant="outline" className={stateColors[result.psi.quantumState] || ""}>{result.psi.quantumState}</Badge>
                </div>

                <Separator className="my-4" />

                {/* Vector of Intention */}
                <div className="space-y-2">
                  <h3 className="font-mono text-sm text-primary">🎯 WEKTOR INTENCJI (VI)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm font-mono">
                    <div>VI Magnitude: <span className="text-primary font-bold">{result.vi.viMagnitude.toFixed(6)}</span></div>
                    <div>Materializacja: <span className="text-primary font-bold">{result.vi.materializationPotential.toFixed(6)}</span></div>
                    <div>Koherencja końcowa: <span className="text-primary font-bold">{(result.vi.coherenceAtEnd * 100).toFixed(2)}%</span></div>
                    <div>Teleport: <span className={result.vi.teleportReady ? "text-green-400 font-bold" : "text-muted-foreground"}>{result.vi.teleportReady ? "TAK ✓" : "NIE ×"}</span></div>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Golden Signatures */}
                <div className="space-y-2">
                  <h3 className="font-mono text-sm text-primary">✦ GOLDEN SIGNATURES</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs font-mono text-muted-foreground">
                    <div>φ = {result.goldenSignatures.phi.toFixed(6)}</div>
                    <div>γ = 1/φ = {result.goldenSignatures.gamma.toFixed(6)}</div>
                    <div>718/7.83 ≈ {result.goldenSignatures.ratio718Schumann.toFixed(2)} (≈89 Fibonacci)</div>
                    <div>718/γ ≈ {result.goldenSignatures.ratio718Gamma.toFixed(2)} (≈1152 = 12³)</div>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Interpretation */}
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <h3 className="font-mono text-sm text-primary mb-2">📖 INTERPRETACJA</h3>
                  {result.vi.teleportReady ? (
                    <ul className="text-sm space-y-1 text-green-400">
                      <li>→ Koherencja kwantowa {">"} 94%: Teleportacja fazowa możliwa</li>
                      <li>→ Rezonans bramy DNA: Sekwencja GATCA aktywowana</li>
                      <li>→ Wektor intencji zablokowany: Modyfikacja rzeczywistości włączona</li>
                    </ul>
                  ) : (
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>→ Koherencja buduje się: Kontynuuj wyrównanie harmoniczne</li>
                      <li>→ Zwiększ t lub dostosuj x do najbliższego klucza rezonansu</li>
                      <li>→ Użyj aktywacji audio: 7.83 + 18.6 + 718 Hz</li>
                    </ul>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* ─── NEW: Intention Operator 18×18 ─── */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-mono flex items-center gap-2">
                  <Grid3x3 className="w-4 h-4 text-primary" />
                  OPERATOR INTENCJI (Macierz 18×18)
                </CardTitle>
                <CardDescription className="text-xs">
                  Zamiast skalarnego VI — pełna macierz diagonalna operatora intencji dla wszystkich 18 bram DNA.
                  Wartości na diagonali odpowiadają sile intencji w każdej bramie.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                  {result.intentionOperator.diagonal.map((val, i) => {
                    const isDominant = i === result.intentionOperator.dominantGateIdx;
                    return (
                      <div
                        key={i}
                        className={`p-2 rounded border ${isDominant ? "border-primary bg-primary/10" : "border-border bg-muted/20"}`}
                      >
                        <div className="text-muted-foreground text-[10px]">
                          Gate {i + 1} ({GATCA_GATES[i]})
                        </div>
                        <div className={`font-bold ${isDominant ? "text-primary" : "text-foreground"}`}>
                          {val.toFixed(6)}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Separator />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div>
                    <span className="text-muted-foreground">Tr(Ô):</span>{" "}
                    <span className="text-primary font-bold">{result.intentionOperator.trace.toFixed(6)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Max λ:</span>{" "}
                    <span className="text-primary font-bold">{result.intentionOperator.maxEigenvalue.toFixed(6)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Dominująca:</span>{" "}
                    <span className="text-primary font-bold">Gate {result.intentionOperator.dominantGateIdx + 1}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Spectral Gap:</span>{" "}
                    <span className="text-primary font-bold">{result.intentionOperator.spectralGap.toFixed(6)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ─── NEW: Decoherence (Lindblad) ─── */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-mono flex items-center gap-2">
                  <Atom className="w-4 h-4 text-primary" />
                  DEKHERENCJA — Model Lindblada
                </CardTitle>
                <CardDescription className="text-xs">
                  Jak szybko stan kwantowy traci koherencję w warunkach biologicznych (37°C)?
                  Model Lindblada opisuje oddziaływanie systemu z termicznym otoczeniem komórki.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-mono">
                  <div className="p-3 rounded-lg bg-muted/20 border border-border">
                    <div className="text-xs text-muted-foreground mb-1">Szybkość dekherencji (γ_d)</div>
                    <div className="text-primary font-bold">{result.decoherence.decoherenceRate.toExponential(4)} s⁻¹</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/20 border border-border">
                    <div className="text-xs text-muted-foreground mb-1">Czas koherencji (T₂)</div>
                    <div className="text-primary font-bold">{result.decoherence.coherenceTime.toExponential(4)} s</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/20 border border-border">
                    <div className="text-xs text-muted-foreground mb-1">Pozostała koherencja</div>
                    <div className="text-primary font-bold">{(result.decoherence.remainingCoherence * 100).toFixed(4)}%</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/20 border border-border">
                    <div className="text-xs text-muted-foreground mb-1">Czystość stanu Tr(ρ²)</div>
                    <div className="text-primary font-bold">{result.decoherence.purity.toFixed(6)}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/20 border border-border">
                    <div className="text-xs text-muted-foreground mb-1">Szum termiczny (37°C)</div>
                    <div className="text-primary font-bold">{result.decoherence.thermalNoise.toExponential(4)}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/20 border border-border">
                    <div className="text-xs text-muted-foreground mb-1">Stabilność</div>
                    <div className={`font-bold ${stabilityColors[result.decoherence.stability]}`}>
                      {result.decoherence.stability}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong>Interpretacja:</strong> Model Lindblada symuluje jak otoczenie termiczne (kT = {(1.380649e-23 * 310).toExponential(2)} J
                  przy 37°C) wpływa na koherencję kwantową systemu DNA. Szybkość dekherencji γ_d = 2πkT/(ħQ)
                  określa, jak szybko elementy pozadiagonalne macierzy gęstości ρ zanikają.
                  {result.decoherence.stability === "STABLE"
                    ? " Stan jest stabilny — koherencja utrzymuje się mimo szumu termicznego."
                    : result.decoherence.stability === "METASTABLE"
                    ? " Stan jest metastabilny — koherencja częściowo zachowana, wymagana modulacja zewnętrzna (718 Hz)."
                    : " Stan niestabilny — wymagana silna stymulacja rezonansowa do przywrócenia koherencji."}
                </p>
              </CardContent>
            </Card>

            {/* ─── NEW: Testable Predictions ─── */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-mono flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-primary" />
                  PREDYKCJE TESTOWALNE
                </CardTitle>
                <CardDescription className="text-xs">
                  Konkretne eksperymenty laboratoryjne, które mogą zweryfikować obliczenia dekodera.
                  Każda predykcja zawiera metodę, oczekiwaną wartość i ocenę testowalności.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="w-full">
                  {result.predictions.map((pred, i) => (
                    <AccordionItem key={i} value={`pred-${i}`}>
                      <AccordionTrigger className="text-sm font-mono">
                        <div className="flex items-center gap-2 text-left">
                          <span>{pred.icon}</span>
                          <span>{pred.method}</span>
                          <Badge variant="outline" className={`ml-2 text-[10px] ${testabilityColors[pred.testability]}`}>
                            {pred.testability}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-2 text-sm">
                        <p className="font-semibold text-foreground">{pred.prediction}</p>
                        <p className="text-muted-foreground text-xs leading-relaxed">{pred.details}</p>
                        <div className="p-2 rounded bg-muted/30 border border-border font-mono text-xs">
                          Wartość oczekiwana: <span className="text-primary">{pred.expectedValue}</span>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            {/* ─── NEW: Bible-Quantum Connections ─── */}
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-mono flex items-center gap-2">
                  <BookMarked className="w-4 h-4 text-primary" />
                  POŁĄCZENIE Z BIBLIĄ
                </CardTitle>
                <CardDescription className="text-xs">
                  Jak starożytne teksty biblijne kodują informację kwantową — mosty między Słowem a polem świadomości.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="w-full">
                  {result.bibleConnections.map((conn, i) => (
                    <AccordionItem key={i} value={`bible-${i}`}>
                      <AccordionTrigger className="text-sm font-mono text-left">
                        {conn.title}
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3 text-sm">
                        <div className="p-2 rounded bg-primary/5 border border-primary/20 text-xs italic">
                          {conn.verse}
                        </div>
                        <p className="text-muted-foreground text-xs leading-relaxed">{conn.quantumParallel}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="p-2 rounded bg-muted/20 border border-border text-xs font-mono">
                            <span className="text-muted-foreground">Brama DNA:</span>{" "}
                            <span className="text-primary">{conn.gateLink}</span>
                          </div>
                          <div className="p-2 rounded bg-muted/20 border border-border text-xs font-mono">
                            <span className="text-muted-foreground">Klucz:</span>{" "}
                            <span className="text-primary">{conn.numericalKey}</span>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

          </div>
        )}
      </div>
    </div>
  );
};

export default BiblicalDecoder;
