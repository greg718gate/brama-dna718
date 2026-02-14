import { useState, useMemo } from "react";
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
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  decodeVerse,
  generatePredictions,
  generateBibleConnections,
  generateVerbalInterpretation,
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
  const { t, language } = useLanguage();
  const [reference, setReference] = useState("");
  const [text, setText] = useState("");
  const [hebrewText, setHebrewText] = useState("");
  const [hebrewFromPreset, setHebrewFromPreset] = useState(false);
  const [result, setResult] = useState<DecoderResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // When user manually edits reference or text, clear preset Hebrew to avoid stale data
  const handleReferenceChange = (val: string) => {
    setReference(val);
    if (hebrewFromPreset) {
      setHebrewText("");
      setHebrewFromPreset(false);
    }
  };
  const handleTextChange = (val: string) => {
    setText(val);
    if (hebrewFromPreset) {
      setHebrewText("");
      setHebrewFromPreset(false);
    }
  };

  // Re-generate language-dependent content when language changes
  const localizedPredictions = useMemo(() => {
    if (!result) return [];
    return generatePredictions({
      gatePosition: result.gatePosition,
      psi: result.psi,
      vi: result.vi,
    }, language);
  }, [result, language]);

  const localizedBibleConnections = useMemo(() => {
    if (!result) return [];
    return generateBibleConnections({
      reference: result.reference,
      gematriaTotal: result.gematriaTotal,
      hamiltonGate: result.hamiltonGate,
      gatePosition: result.gatePosition,
      psi: result.psi,
    }, language);
  }, [result, language]);

  const verbalInterpretation = useMemo(() => {
    if (!result) return null;
    return generateVerbalInterpretation({
      reference: result.reference,
      text: result.text,
      gematriaTotal: result.gematriaTotal,
      gematriaT: result.gematriaT,
      hamiltonGate: result.hamiltonGate,
      gatePosition: result.gatePosition,
      psi: result.psi,
      vi: result.vi,
      decoherence: result.decoherence,
      goldenSignatures: result.goldenSignatures,
    }, language);
  }, [result, language]);

  const handleDecode = () => {
    // Allow decoding if ANY field has content
    const effectiveText = text.trim() || hebrewText.trim() || reference.trim();
    if (!effectiveText) return;
    setIsCalculating(true);
    setTimeout(() => {
      try {
        const decodeText = text.trim() || reference.trim();
        const r = decodeVerse(reference || "Custom", decodeText, hebrewText);
        setResult(r);
      } catch (e) {
        console.error("Decode error:", e);
      } finally {
        setIsCalculating(false);
      }
    }, 50);
  };

  const handlePreset = (preset: typeof PRESET_VERSES[0]) => {
    setReference(preset.reference);
    setText(preset.text);
    setHebrewText(preset.hebrew);
    setHebrewFromPreset(true);
    setIsCalculating(true);
    setTimeout(() => {
      try {
        const r = decodeVerse(preset.reference, preset.text, preset.hebrew);
        setResult(r);
      } catch (e) {
        console.error("Decode error:", e);
      } finally {
        setIsCalculating(false);
      }
    }, 50);
  };

  const canDecode = !isCalculating && (text.trim() || hebrewText.trim() || reference.trim());


  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <BookOpen className="w-5 h-5 text-primary" />
          <h1 className="font-bold text-lg">{t('decoder.title')}</h1>
          <div className="ml-auto flex items-center gap-2">
            <LanguageSwitcher />
            <Badge variant="outline" className="font-mono text-xs hidden sm:inline-flex">
              {t('decoder.badge')}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        {/* EXPLANATION - "for people" */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Info className="w-5 h-5 text-primary" />
              {t('decoder.whatIs.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>{t('decoder.forPeople.intro')}</p>
            <p><strong className="text-foreground">{t('decoder.title')}</strong> — {t('decoder.whatIs.intro')}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(['step1', 'step2', 'step3', 'step4'] as const).map((step) => (
                <div key={step} className="p-3 rounded-lg bg-background/50 border border-border space-y-2">
                  <h4 className="font-semibold text-foreground text-xs">{t(`decoder.${step}.title`)}</h4>
                  <p className="text-xs">{t(`decoder.${step}.desc`)}</p>
                  <p className="text-xs italic text-primary/80">{t(`decoder.${step}.simple`)}</p>
                </div>
              ))}
            </div>
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <h4 className="font-semibold text-foreground text-xs mb-1">{t('decoder.purpose.title')}</h4>
              <p className="text-xs">{t('decoder.purpose.simple')}</p>
            </div>
          </CardContent>
        </Card>


        {/* Preset verses */}
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              {t('decoder.presets')}
            </CardTitle>
            <CardDescription className="text-xs">{t('decoder.presets.desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {PRESET_VERSES.map((p) => (
                <Button key={p.reference} variant="outline" size="sm" className="text-xs" onClick={() => handlePreset(p)}>
                  {p.reference}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Input */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono">{t('decoder.input')}</CardTitle>
            <CardDescription className="text-xs">{t('decoder.input.desc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t('decoder.input.ref')}</label>
              <Input value={reference} onChange={(e) => handleReferenceChange(e.target.value)} placeholder="Genesis 1:1" className="font-mono" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t('decoder.input.text')}</label>
              <Textarea value={text} onChange={(e) => handleTextChange(e.target.value)} placeholder="In the beginning God created the heavens and the earth..." className="font-mono min-h-[80px]" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t('decoder.input.hebrew')}</label>
              <Textarea value={hebrewText} onChange={(e) => { setHebrewText(e.target.value); setHebrewFromPreset(false); }} placeholder="בְּרֵאשִׁית בָּרָא אֱלֹהִים" className="font-mono min-h-[60px]" dir="rtl" />
            </div>
            <Button onClick={handleDecode} disabled={!canDecode} className="w-full h-12 font-bold text-lg">
              <Zap className="w-5 h-5 mr-2" />
              {isCalculating ? t('decoder.button.loading') : t('decoder.button')}
            </Button>
          </CardContent>
        </Card>

        {/* Gematria table */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono text-muted-foreground">{t('decoder.gematria.table')}</CardTitle>
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
            <Card className="border-primary/30 bg-card/80">
              <CardContent className="pt-6">
                <div className="text-center space-y-2 mb-4">
                  <h2 className="font-mono font-bold text-xl text-primary">{t('decoder.results.header')}</h2>
                  <p className="text-lg font-semibold">{result.reference}</p>
                  <p className="text-sm text-muted-foreground italic">"{result.text.slice(0, 120)}"</p>
                </div>
                <Separator className="my-4" />

                {/* Gematria */}
                <div className="space-y-2">
                  <h3 className="font-mono text-sm text-primary">{t('decoder.gematria.title')}</h3>
                  <p className="text-xs text-muted-foreground">{t('decoder.gematria.explain')}</p>
                  {result.gematriaBreakdown.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {result.gematriaBreakdown.map((b, i) => (
                        <span key={i} className="inline-flex items-center gap-0.5 text-xs bg-primary/10 rounded px-1.5 py-0.5 font-mono">
                          <span className="text-primary">{b.char}</span><span className="text-muted-foreground">={b.value}</span>
                        </span>
                      ))}
                    </div>
                  ) : (<p className="text-xs text-muted-foreground">{t('decoder.gematria.none')}</p>)}
                  <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                    <div>{t('decoder.label.sum')}: <span className="text-primary font-bold">{result.gematriaTotal}</span></div>
                    <div>{t('decoder.label.time')}: <span className="text-primary font-bold">{result.gematriaT.toFixed(6)}</span></div>
                  </div>
                </div>
                <Separator className="my-4" />

                {/* Fractal */}
                <div className="space-y-2">
                  <h3 className="font-mono text-sm text-primary">{t('decoder.fractal.title')}</h3>
                  <p className="text-xs text-muted-foreground">{t('decoder.fractal.explain')}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                    <div>Hurst: <span className="text-primary font-bold">{result.fractalHurst.toFixed(6)}</span></div>
                    <div>x = <span className="text-primary font-bold">{result.fractalX.toFixed(2)}</span></div>
                  </div>
                </div>
                <Separator className="my-4" />

                {/* Hamilton */}
                <div className="space-y-2">
                  <h3 className="font-mono text-sm text-primary">{t('decoder.hamilton.title')}</h3>
                  <p className="text-xs text-muted-foreground">{t('decoder.hamilton.explain')}</p>
                  <div className="text-sm font-mono space-y-1">
                    <div>{t('decoder.label.gate')}: <span className="text-primary font-bold">{result.hamiltonGate}</span></div>
                    <div>{result.gateName}</div>
                    <div>mtDNA: <span className="text-primary font-bold">{result.gatePosition}</span> / 16569</div>
                  </div>
                </div>
                <Separator className="my-4" />

                {/* Psi */}
                <div className="space-y-2">
                  <h3 className="font-mono text-sm text-primary">{t('decoder.psi.title')}</h3>
                  <p className="text-xs text-muted-foreground">{t('decoder.psi.explain')}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm font-mono">
                    <div>Ψ = {result.psi.amplitude.re.toFixed(6)} {result.psi.amplitude.im >= 0 ? "+" : ""}{result.psi.amplitude.im.toFixed(6)}i</div>
                    <div>|Ψ| = <span className="text-primary font-bold">{result.psi.magnitude.toFixed(6)}</span></div>
                    <div>φ = {result.psi.phase.toFixed(6)} rad</div>
                    <div>{t('decoder.label.coherence')}: <span className="text-primary font-bold">{(result.psi.coherence * 100).toFixed(2)}%</span></div>
                  </div>
                  <Badge variant="outline" className={stateColors[result.psi.quantumState] || ""}>{result.psi.quantumState}</Badge>
                </div>
                <Separator className="my-4" />

                {/* VI */}
                <div className="space-y-2">
                  <h3 className="font-mono text-sm text-primary">{t('decoder.vi.title')}</h3>
                  <p className="text-xs text-muted-foreground">{t('decoder.vi.explain')}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm font-mono">
                    <div>|VI| = <span className="text-primary font-bold">{result.vi.viMagnitude.toFixed(6)}</span></div>
                    <div>{t('decoder.label.materialization')}: <span className="text-primary font-bold">{result.vi.materializationPotential.toFixed(6)}</span></div>
                    <div>{t('decoder.label.coherenceEnd')}: <span className="text-primary font-bold">{(result.vi.coherenceAtEnd * 100).toFixed(2)}%</span></div>
                    <div>{t('decoder.label.teleport')}: <span className={result.vi.teleportReady ? "text-green-400 font-bold" : "text-muted-foreground"}>{result.vi.teleportReady ? "✓" : "×"}</span></div>
                  </div>
                </div>
                <Separator className="my-4" />

                {/* Golden */}
                <div className="space-y-2">
                  <h3 className="font-mono text-sm text-primary">{t('decoder.golden.title')}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs font-mono text-muted-foreground">
                    <div>φ = {result.goldenSignatures.phi.toFixed(6)}</div>
                    <div>γ = {result.goldenSignatures.gamma.toFixed(6)}</div>
                    <div>718/7.83 ≈ {result.goldenSignatures.ratio718Schumann.toFixed(2)} (≈89 Fib)</div>
                    <div>718/γ ≈ {result.goldenSignatures.ratio718Gamma.toFixed(2)} (≈12³)</div>
                  </div>
                </div>
                <Separator className="my-4" />

                {/* VERBAL INTERPRETATION - Science ↔ Faith */}
                {verbalInterpretation && (
                  <div className="space-y-4">
                    <h3 className="font-mono text-sm text-primary mb-2">{t('decoder.interpretation.title')}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-4 rounded-lg bg-background/60 border border-border space-y-2">
                        <h4 className="font-bold text-foreground text-xs flex items-center gap-2">
                          <Atom className="w-4 h-4 text-primary" />
                          {language === 'pl' ? 'Nauka mówi:' : 'Science says:'}
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">{verbalInterpretation.scienceSays}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 space-y-2">
                        <h4 className="font-bold text-foreground text-xs flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-primary" />
                          {language === 'pl' ? 'Wiara mówi:' : 'Faith says:'}
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">{verbalInterpretation.faithSays}</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-accent/10 border border-accent/20 space-y-2">
                      <h4 className="font-bold text-foreground text-xs flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        {language === 'pl' ? 'Most — Nauka i Wiara to jedno:' : 'The Bridge — Science and Faith are one:'}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{verbalInterpretation.bridge}</p>
                    </div>

                    <div className="p-4 rounded-lg bg-background/60 border border-border space-y-2">
                      <h4 className="font-bold text-foreground text-xs">
                        {language === 'pl' ? '✨ Cuda jako mechanika kwantowa:' : '✨ Miracles as quantum mechanics:'}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{verbalInterpretation.miracle}</p>
                    </div>

                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 space-y-2">
                      <h4 className="font-bold text-foreground text-xs">
                        {language === 'pl' ? '💡 Kluczowy wniosek:' : '💡 Key insight:'}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{verbalInterpretation.insight}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Intention Operator 18×18 */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-mono flex items-center gap-2">
                  <Grid3x3 className="w-4 h-4 text-primary" />
                  {t('decoder.operator.title')}
                </CardTitle>
                <CardDescription className="text-xs">{t('decoder.operator.desc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">{t('decoder.operator.explain')}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                  {result.intentionOperator.diagonal.map((val, i) => {
                    const isDominant = i === result.intentionOperator.dominantGateIdx;
                    return (
                      <div key={i} className={`p-2 rounded border ${isDominant ? "border-primary bg-primary/10" : "border-border bg-muted/20"}`}>
                        <div className="text-muted-foreground text-[10px]">{t('decoder.label.gate')} {i + 1} ({GATCA_GATES[i]})</div>
                        <div className={`font-bold ${isDominant ? "text-primary" : "text-foreground"}`}>{val.toFixed(6)}</div>
                      </div>
                    );
                  })}
                </div>
                <Separator />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div><span className="text-muted-foreground">{t('decoder.label.trace')}:</span> <span className="text-primary font-bold">{result.intentionOperator.trace.toFixed(6)}</span></div>
                  <div><span className="text-muted-foreground">{t('decoder.label.maxEigen')}:</span> <span className="text-primary font-bold">{result.intentionOperator.maxEigenvalue.toFixed(6)}</span></div>
                  <div><span className="text-muted-foreground">{t('decoder.label.dominant')}:</span> <span className="text-primary font-bold">{t('decoder.label.gate')} {result.intentionOperator.dominantGateIdx + 1}</span></div>
                  <div><span className="text-muted-foreground">{t('decoder.label.gap')}:</span> <span className="text-primary font-bold">{result.intentionOperator.spectralGap.toFixed(6)}</span></div>
                </div>
              </CardContent>
            </Card>

            {/* Decoherence */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-mono flex items-center gap-2">
                  <Atom className="w-4 h-4 text-primary" />
                  {t('decoder.decoherence.title')}
                </CardTitle>
                <CardDescription className="text-xs">{t('decoder.decoherence.desc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">{t('decoder.decoherence.explain')}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-mono">
                  <div className="p-3 rounded-lg bg-muted/20 border border-border">
                    <div className="text-xs text-muted-foreground mb-1">{t('decoder.label.decoRate')}</div>
                    <div className="text-primary font-bold">{result.decoherence.decoherenceRate.toExponential(4)} s⁻¹</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/20 border border-border">
                    <div className="text-xs text-muted-foreground mb-1">{t('decoder.label.coherenceTime')}</div>
                    <div className="text-primary font-bold">{result.decoherence.coherenceTime.toExponential(4)} s</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/20 border border-border">
                    <div className="text-xs text-muted-foreground mb-1">{t('decoder.label.remainingCoherence')}</div>
                    <div className="text-primary font-bold">{(result.decoherence.remainingCoherence * 100).toFixed(4)}%</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/20 border border-border">
                    <div className="text-xs text-muted-foreground mb-1">{t('decoder.label.purity')}</div>
                    <div className="text-primary font-bold">{result.decoherence.purity.toFixed(6)}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/20 border border-border">
                    <div className="text-xs text-muted-foreground mb-1">{t('decoder.label.thermal')}</div>
                    <div className="text-primary font-bold">{result.decoherence.thermalNoise.toExponential(4)}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/20 border border-border">
                    <div className="text-xs text-muted-foreground mb-1">{t('decoder.label.stability')}</div>
                    <div className={`font-bold ${stabilityColors[result.decoherence.stability]}`}>{result.decoherence.stability}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testable Predictions */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-mono flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-primary" />
                  {t('decoder.predictions.title')}
                </CardTitle>
                <CardDescription className="text-xs">{t('decoder.predictions.desc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-3">{t('decoder.predictions.explain')}</p>
                <Accordion type="multiple" className="w-full">
                  {localizedPredictions.map((pred, i) => (
                    <AccordionItem key={i} value={`pred-${i}`}>
                      <AccordionTrigger className="text-sm font-mono">
                        <div className="flex items-center gap-2 text-left">
                          <span>{pred.icon}</span>
                          <span>{pred.method}</span>
                          <Badge variant="outline" className={`ml-2 text-[10px] ${testabilityColors[pred.testability]}`}>{pred.testability}</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-2 text-sm">
                        <p className="font-semibold text-foreground">{pred.prediction}</p>
                        <p className="text-muted-foreground text-xs leading-relaxed">{pred.details}</p>
                        <div className="p-2 rounded bg-muted/30 border border-border font-mono text-xs">
                          <span className="text-primary">{pred.expectedValue}</span>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            {/* Bible Connections */}
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-mono flex items-center gap-2">
                  <BookMarked className="w-4 h-4 text-primary" />
                  {t('decoder.bible.title')}
                </CardTitle>
                <CardDescription className="text-xs">{t('decoder.bible.desc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-3">{t('decoder.bible.explain')}</p>
                <Accordion type="multiple" className="w-full">
                  {localizedBibleConnections.map((conn, i) => (
                    <AccordionItem key={i} value={`bible-${i}`}>
                      <AccordionTrigger className="text-sm font-mono text-left">{conn.title}</AccordionTrigger>
                      <AccordionContent className="space-y-3 text-sm">
                        <div className="p-2 rounded bg-primary/5 border border-primary/20 text-xs italic">{conn.verse}</div>
                        <p className="text-muted-foreground text-xs leading-relaxed">{conn.quantumParallel}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="p-2 rounded bg-muted/20 border border-border text-xs font-mono">
                            <span className="text-muted-foreground">DNA:</span> <span className="text-primary">{conn.gateLink}</span>
                          </div>
                          <div className="p-2 rounded bg-muted/20 border border-border text-xs font-mono">
                            <span className="text-muted-foreground">{t('decoder.label.key')}:</span> <span className="text-primary">{conn.numericalKey}</span>
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

        {/* ══════════════════════ VISUALIZATIONS ══════════════════════ */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-sm font-mono flex items-center gap-2">
              📊 {t('decoder.viz.title')}
            </CardTitle>
            <CardDescription className="text-xs">{t('decoder.viz.desc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Viz 1: Quantum Evolution */}
            <div className="space-y-3">
              <h3 className="font-mono text-sm font-semibold text-foreground">{t('decoder.viz1.title')}</h3>
              <img 
                src="/screenshots/quantum-evolution.jpg" 
                alt="Quantum evolution - probability map, coherence, VI accumulation, final state" 
                className="w-full rounded-lg border border-border"
                loading="lazy"
              />
              <p className="text-xs text-muted-foreground leading-relaxed">{t('decoder.viz1.desc')}</p>
            </div>

            <Separator />

            {/* Viz 2: Hamiltonian */}
            <div className="space-y-3">
              <h3 className="font-mono text-sm font-semibold text-foreground">{t('decoder.viz2.title')}</h3>
              <img 
                src="/screenshots/hamiltonian-matrix.jpg" 
                alt="Hamiltonian matrix, energy spectrum, density matrix, evolution operator" 
                className="w-full rounded-lg border border-border"
                loading="lazy"
              />
              <p className="text-xs text-muted-foreground leading-relaxed">{t('decoder.viz2.desc')}</p>
            </div>

            <Separator />

            {/* Viz 3: App screenshot */}
            <div className="space-y-3">
              <h3 className="font-mono text-sm font-semibold text-foreground">{t('decoder.viz3.title')}</h3>
              <div className="flex justify-center">
                <img 
                  src="/screenshots/intention-vector-calc.jpg" 
                  alt="Intention Vector Calculator - VI = 1.1628" 
                  className="max-w-sm w-full rounded-lg border border-border"
                  loading="lazy"
                />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{t('decoder.viz3.desc')}</p>
            </div>
          </CardContent>
        </Card>

        {/* License footer */}
        <div className="text-center py-6 border-t border-border">
          <p className="text-xs text-muted-foreground">{t('decoder.license')}</p>
          <a 
            href="https://creativecommons.org/licenses/by-nc/4.0/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline"
          >
            Creative Commons BY-NC 4.0
          </a>
        </div>
      </div>
    </div>
  );
};

export default BiblicalDecoder;
