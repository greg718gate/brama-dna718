import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  decodeVerse,
  PRESET_VERSES,
  HEBREW_GEMATRIA,
  type DecoderResult,
} from "@/lib/biblicalDecoder";

const stateColors: Record<string, string> = {
  TELEPORTATION_READY: "bg-green-500/20 text-green-400 border-green-500/40",
  HIGH_COHERENCE: "bg-amber-500/20 text-amber-400 border-amber-500/40",
  SUPERPOSITION: "bg-blue-500/20 text-blue-400 border-blue-500/40",
  ENTANGLED: "bg-purple-500/20 text-purple-400 border-purple-500/40",
  DECOHERENT: "bg-red-500/20 text-red-400 border-red-500/40",
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
    // Small timeout to show loading state
    setTimeout(() => {
      const r = decodeVerse(reference || "Custom", text, hebrewText);
      setResult(r);
      setIsCalculating(false);
    }, 100);
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
    }, 100);
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
          <Badge variant="outline" className="ml-auto font-mono text-xs">
            Gematria + Fraktal + Hamilton
          </Badge>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        {/* Preset verses */}
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Predefiniowane wersety
            </CardTitle>
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
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Referencja (np. Genesis 1:1)
              </label>
              <Input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Genesis 1:1"
                className="font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Tekst wersetu (dowolny język)
              </label>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="In the beginning God created the heavens and the earth..."
                className="font-mono min-h-[80px]"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Tekst hebrajski (opcjonalnie – dla gematrii)
              </label>
              <Textarea
                value={hebrewText}
                onChange={(e) => setHebrewText(e.target.value)}
                placeholder="בְּרֵאשִׁית בָּרָא אֱלֹהִים"
                className="font-mono min-h-[60px]"
                dir="rtl"
              />
            </div>
            <Button
              onClick={handleDecode}
              disabled={isCalculating || (!text.trim() && !hebrewText.trim())}
              className="w-full h-12 font-bold text-lg"
            >
              <Zap className="w-5 h-5 mr-2" />
              {isCalculating ? "OBLICZANIE Ψ..." : "DEKODUJ PRZEZ Ψ-718"}
            </Button>
          </CardContent>
        </Card>

        {/* Hebrew Gematria reference */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono text-muted-foreground">
              TABELA GEMATRII HEBRAJSKIEJ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(HEBREW_GEMATRIA).map(([char, val]) => (
                <span
                  key={char}
                  className="inline-flex items-center gap-1 text-xs bg-muted/50 rounded px-2 py-0.5 font-mono"
                >
                  <span className="text-primary text-sm">{char}</span>
                  <span className="text-muted-foreground">={val}</span>
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <div className="space-y-4 animate-fade-in">
            {/* Main result header */}
            <Card className="border-primary/30 bg-card/80">
              <CardContent className="pt-6">
                <div className="text-center space-y-2 mb-4">
                  <h2 className="font-mono font-bold text-xl text-primary">
                    Ψ-718 QUANTUM DECODER
                  </h2>
                  <p className="text-lg font-semibold">{result.reference}</p>
                  <p className="text-sm text-muted-foreground italic">
                    "{result.text.slice(0, 120)}"
                  </p>
                </div>

                <Separator className="my-4" />

                {/* Gematria */}
                <div className="space-y-2">
                  <h3 className="font-mono text-sm text-primary">
                    ✡ GEMATRIA HEBRAJSKA
                  </h3>
                  {result.gematriaBreakdown.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {result.gematriaBreakdown.map((b, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-0.5 text-xs bg-primary/10 rounded px-1.5 py-0.5 font-mono"
                        >
                          <span className="text-primary">{b.char}</span>
                          <span className="text-muted-foreground">
                            ={b.value}
                          </span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Brak tekstu hebrajskiego – użyto gematrii łacińskiej
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                    <div>
                      Suma gematrii:{" "}
                      <span className="text-primary font-bold">
                        {result.gematriaTotal}
                      </span>
                    </div>
                    <div>
                      t (znormalizowane):{" "}
                      <span className="text-primary font-bold">
                        {result.gematriaT.toFixed(6)}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Fractal */}
                <div className="space-y-2">
                  <h3 className="font-mono text-sm text-primary">
                    🌀 ANALIZA FRAKTALNA (718 znaków)
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                    <div>
                      Hurst (H):{" "}
                      <span className="text-primary font-bold">
                        {result.fractalHurst.toFixed(6)}
                      </span>
                    </div>
                    <div>
                      x (przestrzeń):{" "}
                      <span className="text-primary font-bold">
                        {result.fractalX.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Hamilton Gate */}
                <div className="space-y-2">
                  <h3 className="font-mono text-sm text-primary">
                    ⚛️ KORELACJA HAMILTONA → BRAMA DNA
                  </h3>
                  <div className="text-sm font-mono">
                    <div>
                      Hamilton Gate Index:{" "}
                      <span className="text-primary font-bold">
                        {result.hamiltonGate}
                      </span>
                    </div>
                    <div>
                      Brama:{" "}
                      <span className="text-primary font-bold">
                        {result.gateName}
                      </span>
                    </div>
                    <div>
                      Pozycja mtDNA:{" "}
                      <span className="text-primary font-bold">
                        {result.gatePosition}
                      </span>{" "}
                      / 16569 (rCRS)
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Wave Function */}
                <div className="space-y-2">
                  <h3 className="font-mono text-sm text-primary">
                    🌊 FUNKCJA FALOWA Ψ
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm font-mono">
                    <div>
                      Ψ = {result.psi.amplitude.re.toFixed(6)}{" "}
                      {result.psi.amplitude.im >= 0 ? "+" : ""}
                      {result.psi.amplitude.im.toFixed(6)}i
                    </div>
                    <div>
                      |Ψ| ={" "}
                      <span className="text-primary font-bold">
                        {result.psi.magnitude.toFixed(6)}
                      </span>
                    </div>
                    <div>Faza = {result.psi.phase.toFixed(6)} rad</div>
                    <div>
                      Koherencja ={" "}
                      <span className="text-primary font-bold">
                        {(result.psi.coherence * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Badge
                      variant="outline"
                      className={
                        stateColors[result.psi.quantumState] || ""
                      }
                    >
                      {result.psi.quantumState}
                    </Badge>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Vector of Intention */}
                <div className="space-y-2">
                  <h3 className="font-mono text-sm text-primary">
                    🎯 WEKTOR INTENCJI (VI)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm font-mono">
                    <div>
                      VI Magnitude:{" "}
                      <span className="text-primary font-bold">
                        {result.vi.viMagnitude.toFixed(6)}
                      </span>
                    </div>
                    <div>
                      Materializacja:{" "}
                      <span className="text-primary font-bold">
                        {result.vi.materializationPotential.toFixed(6)}
                      </span>
                    </div>
                    <div>
                      Koherencja końcowa:{" "}
                      <span className="text-primary font-bold">
                        {(result.vi.coherenceAtEnd * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div>
                      Teleport Ready:{" "}
                      <span
                        className={
                          result.vi.teleportReady
                            ? "text-green-400 font-bold"
                            : "text-muted-foreground"
                        }
                      >
                        {result.vi.teleportReady ? "TAK ✓" : "NIE ×"}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Golden Signatures */}
                <div className="space-y-2">
                  <h3 className="font-mono text-sm text-primary">
                    ✦ GOLDEN SIGNATURES
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs font-mono text-muted-foreground">
                    <div>φ = {result.goldenSignatures.phi.toFixed(6)}</div>
                    <div>γ = 1/φ = {result.goldenSignatures.gamma.toFixed(6)}</div>
                    <div>
                      718/7.83 ≈{" "}
                      {result.goldenSignatures.ratio718Schumann.toFixed(2)}{" "}
                      (≈89 Fibonacci)
                    </div>
                    <div>
                      718/γ ≈{" "}
                      {result.goldenSignatures.ratio718Gamma.toFixed(2)}{" "}
                      (≈1152 = 12³)
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Interpretation */}
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <h3 className="font-mono text-sm text-primary mb-2">
                    📖 INTERPRETACJA
                  </h3>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default BiblicalDecoder;
