import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Zap, Sparkles, Info, Atom, FlaskConical, BookMarked, Grid3x3, Loader2, ShieldCheck, ShieldAlert, ShieldX, Radio, FileDown, Layers, Brain, Target, GitBranch, Clock, BarChart3, Type, Crosshair, FileText, Search, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { GateActivationPanel } from "@/components/GateActivationPanel";
import { EmotionalBridge } from "@/components/EmotionalBridge";
import { PhotonGeometry3D } from "@/components/PhotonGeometry3D";
import { WillPowerController } from "@/components/WillPowerController";
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
  GREEK_GEMATRIA,
  GATCA_GATES,
  GATE_NAMES,
  type DecoderResult,
  type MKP94Result,
} from "@/lib/biblicalDecoder";
import { generateDecoderDocumentation } from "@/lib/decoderDocumentationExport";
import { CalibrationPanel } from "@/components/CalibrationPanel";
import {
  getActiveVersion,
  switchToStable,
  switchToVersion,
  getVersionHistory,
  isCurrentBeta,
  getActiveVersionString,
  type DecoderVersionConfig,
} from "@/lib/decoderVersionConfig";
import { setActiveThresholds, setActiveWeights } from "@/lib/manipulationDetector";

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
  const resultsRef = useRef<HTMLDivElement>(null);
  const [photonFocus, setPhotonFocus] = useState(0);
  const [photonCollapsed, setPhotonCollapsed] = useState(false);
  const [isCalibrationAdmin, setIsCalibrationAdmin] = useState(false);
  const [activeVersion, setActiveVersionState] = useState(getActiveVersionString());
  const isBeta = isCurrentBeta();

  const handleSwitchToStable = () => {
    switchToStable();
    const cfg = getActiveVersion();
    setActiveThresholds(cfg.thresholds);
    setActiveWeights(cfg.weights);
    setActiveVersionState(cfg.version);
  };

  // When user manually edits reference or text, clear preset Hebrew to avoid stale data
  const handleReferenceChange = (val: string) => {
    setReference(val);
    if (hebrewFromPreset) {
      setText("");
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

  const PRESET_REFERENCES = ["Genesis 1:1", "Genesis 1:3", "John 1:1", "Exodus 3:14", "Psalm 23:1", "1 John 4:8", "Revelation 22:13"];

  const mkpStatusLabel: Record<MKP94Result["status"], string> = {
    VOICE_OF_DESIGNER: language === 'pl' ? 'GŁOS PROJEKTANTA' : 'VOICE OF DESIGNER',
    PURE_SOURCE_CODE: language === 'pl' ? 'CZYSTY KOD ŹRÓDŁOWY' : 'PURE SOURCE CODE',
    MINOR_NOISE: language === 'pl' ? 'DROBNY SZUM' : 'MINOR NOISE',
    SYSTEM_INTERFERENCE: language === 'pl' ? 'INTERFERENCJA SYSTEMU' : 'SYSTEM INTERFERENCE',
  };

  const [verbalInterpretation, setVerbalInterpretation] = useState<ReturnType<typeof generateVerbalInterpretation> | null>(null);
  const [isLoadingInterpretation, setIsLoadingInterpretation] = useState(false);

  useEffect(() => {
    if (!result) {
      setVerbalInterpretation(null);
      return;
    }

    // For preset verses, use the static hand-crafted interpretations
    if (PRESET_REFERENCES.includes(result.reference)) {
      setVerbalInterpretation(generateVerbalInterpretation({
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
      }, language));
      return;
    }

    // For custom verses, call AI to generate unique interpretation
    const fetchAIInterpretation = async () => {
      setIsLoadingInterpretation(true);
      try {
        const gateName = result.gateName;
        const coherence = (result.psi.coherence * 100).toFixed(0);
        const { data, error } = await supabase.functions.invoke('generate-interpretation', {
          body: {
            reference: result.reference,
            text: result.text,
            lang: language,
            gematriaTotal: result.gematriaTotal,
            coherence,
            quantumState: result.psi.quantumState,
            gateName,
            gatePosition: result.gatePosition,
          },
        });

        if (error) throw error;

        if (data && (data.scienceSays || data.plainMeaning)) {
          setVerbalInterpretation(data);
        } else if (data && data.error) {
          console.error("AI interpretation error:", data.error);
          // Fallback to static
          setVerbalInterpretation(generateVerbalInterpretation({
            reference: result.reference, text: result.text, gematriaTotal: result.gematriaTotal,
            gematriaT: result.gematriaT, hamiltonGate: result.hamiltonGate, gatePosition: result.gatePosition,
            psi: result.psi, vi: result.vi, decoherence: result.decoherence, goldenSignatures: result.goldenSignatures,
          }, language));
        }
      } catch (err) {
        console.error("Failed to fetch AI interpretation:", err);
        // Fallback to static theme-based
        setVerbalInterpretation(generateVerbalInterpretation({
          reference: result.reference, text: result.text, gematriaTotal: result.gematriaTotal,
          gematriaT: result.gematriaT, hamiltonGate: result.hamiltonGate, gatePosition: result.gatePosition,
          psi: result.psi, vi: result.vi, decoherence: result.decoherence, goldenSignatures: result.goldenSignatures,
        }, language));
      } finally {
        setIsLoadingInterpretation(false);
      }
    };

    fetchAIInterpretation();
  }, [result, language]);

  const handleDecode = async () => {
    const hasText = text.trim() || hebrewText.trim();
    const hasRef = reference.trim();
    if (!hasText && !hasRef) return;

    setIsCalculating(true);
    setResult(null);
    setVerbalInterpretation(null);

    try {
      let decodeText = text.trim();
      let decodeRef = reference.trim() || "Custom";
      let decodeHebrew = hebrewText.trim();

      // CASE 1: Only reference provided (no text, no hebrew)
      if (!decodeText && !decodeHebrew && hasRef) {
        setIsLoadingInterpretation(true);
        const { data, error } = await supabase.functions.invoke('generate-interpretation', {
          body: { reference: decodeRef, lang: language, mode: 'lookup' },
        });

        if (!error && data?.verseText) {
          decodeText = data.verseText;
          setText(data.verseText);
        }
        if (!error && data?.hebrewText) {
          decodeHebrew = data.hebrewText;
          setHebrewText(data.hebrewText);
        }
        setIsLoadingInterpretation(false);
      }

      // CASE 2: Text provided but NO hebrew — fetch original from AI
      if (decodeText && !decodeHebrew && decodeRef !== "Custom") {
        try {
          const { data, error } = await supabase.functions.invoke('generate-interpretation', {
            body: { reference: decodeRef, text: decodeText, mode: 'fetch_original' },
          });
          if (!error && data?.hebrewText) {
            decodeHebrew = data.hebrewText;
            setHebrewText(data.hebrewText);
          }
        } catch (fetchErr) {
          console.warn("Could not fetch original text, using Latin fallback:", fetchErr);
        }
      }

      if (!decodeText) decodeText = decodeRef;

      const r = decodeVerse(decodeRef, decodeText, decodeHebrew, language);
      setResult(r);
      setPhotonFocus(0);
      setPhotonCollapsed(false);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (e) {
      console.error("Decode error:", e);
    } finally {
      setIsCalculating(false);
    }
  };

  const handlePreset = (preset: typeof PRESET_VERSES[0]) => {
    setReference(preset.reference);
    setText(preset.text);
    setHebrewText(preset.hebrew);
    setHebrewFromPreset(true);
    setResult(null);
    setVerbalInterpretation(null);
    setIsCalculating(true);
    setTimeout(() => {
      try {
        const r = decodeVerse(preset.reference, preset.text, preset.hebrew, language);
        setResult(r);
        setPhotonFocus(0);
        setPhotonCollapsed(false);
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      } catch (e) {
        console.error("Decode error:", e);
      } finally {
        setIsCalculating(false);
      }
    }, 50);
  };

  const canDecode = !isCalculating && (text.trim() || hebrewText.trim() || reference.trim());

  const handleDownloadDocumentation = useCallback(async () => {
    const html = generateDecoderDocumentation();

    // Render HTML in a hidden container
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.left = "-9999px";
    container.style.top = "0";
    container.style.width = "800px";
    container.style.background = "#fff";
    container.innerHTML = html.replace(/<html[^>]*>|<\/html>|<head>[\s\S]*?<\/head>|<\/?body[^>]*>/gi, "");
    
    // Inject styles inline so html2canvas can read them
    const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    if (styleMatch) {
      const style = document.createElement("style");
      style.textContent = styleMatch[1];
      container.prepend(style);
    }
    
    document.body.appendChild(container);

    try {
      const { default: html2canvas } = await import("html2canvas");
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        width: 800,
        windowWidth: 800,
      });

      const pdfWidth = 210; // A4 mm
      const pdfHeight = 297;
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      const pdf = new jsPDF("p", "mm", "a4");
      const imgData = canvas.toDataURL("image/png");

      let position = 0;
      let heightLeft = imgHeight;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save("PSI-718-Dekoder-Biblijny-Dokumentacja.pdf");
    } catch (error) {
      console.error("PDF generation failed, falling back to HTML:", error);
      // Fallback to HTML
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "PSI-718-Dekoder-Biblijny-Dokumentacja.html";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      document.body.removeChild(container);
    }
  }, []);

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
            <Button variant="outline" size="sm" onClick={handleDownloadDocumentation} className="gap-1.5 text-xs font-mono">
              <FileDown className="w-3.5 h-3.5" />
              {language === 'pl' ? 'Dokumentacja' : 'Documentation'}
            </Button>
            <LanguageSwitcher />
            <Badge variant="outline" className="font-mono text-xs hidden sm:inline-flex">
              {t('decoder.badge')}
            </Badge>
            <Badge 
              variant={isBeta ? "destructive" : "outline"} 
              className="font-mono text-[10px] cursor-pointer"
              onClick={isBeta ? handleSwitchToStable : undefined}
              title={isBeta ? (language === 'pl' ? 'Kliknij aby wrócić do stabilnej v1.0.0' : 'Click to revert to stable v1.0.0') : ''}
            >
              v{activeVersion}{isBeta ? ' BETA' : ''}
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

        {/* Loading indicator when looking up verse */}
        {isLoadingInterpretation && !result && (
          <Card className="border-primary/30 bg-card/80">
            <CardContent className="py-12 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">
                {language === 'pl' ? 'Szukam tekstu wersetu i przygotowuję tłumaczenie...' : 'Looking up verse text and preparing translation...'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* ══════════════════════ RESULTS ══════════════════════ */}
        {result && (
          <div ref={resultsRef} className="space-y-4 animate-fade-in">
            {/* VERBAL INTERPRETATION — FIRST, most important for user */}
            {isLoadingInterpretation && (
              <Card className="border-primary/30 bg-card/80">
                <CardContent className="py-12 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">
                    {language === 'pl' ? 'Generuję unikalną interpretację tego wersetu...' : 'Generating unique interpretation for this verse...'}
                  </p>
                </CardContent>
              </Card>
            )}
            {verbalInterpretation && !isLoadingInterpretation && (
              <div className="space-y-4">
                {/* PLAIN MEANING — the most important section */}
                {verbalInterpretation.plainMeaning && (
                  <Card className="border-2 border-primary/40 bg-primary/5">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2 text-primary">
                        <BookMarked className="w-6 h-6" />
                        {language === 'pl' ? '📖 Co ten werset oznacza:' : '📖 What this verse means:'}
                      </CardTitle>
                      <p className="text-base font-semibold">{result.reference}</p>
                      <p className="text-sm text-muted-foreground italic">"{result.text.slice(0, 200)}"</p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-base leading-relaxed text-foreground">{verbalInterpretation.plainMeaning}</p>
                    </CardContent>
                  </Card>
                )}

                {/* ═══ MKP-94: RAPORT PRAWDY OBIEKTYWNEJ ═══ */}
                <Card className={`border-2 ${
                  result.mkp94.status === "VOICE_OF_DESIGNER" ? "border-green-500 bg-green-500/5" :
                  result.mkp94.status === "PURE_SOURCE_CODE" ? "border-emerald-500 bg-emerald-500/5" :
                  result.mkp94.status === "MINOR_NOISE" ? "border-amber-500 bg-amber-500/5" :
                  "border-red-500 bg-red-500/5"
                }`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-mono flex items-center gap-2">
                      {result.mkp94.status === "VOICE_OF_DESIGNER" && <ShieldCheck className="w-6 h-6 text-green-400" />}
                      {result.mkp94.status === "PURE_SOURCE_CODE" && <ShieldCheck className="w-6 h-6 text-emerald-400" />}
                      {result.mkp94.status === "MINOR_NOISE" && <ShieldAlert className="w-6 h-6 text-amber-400" />}
                      {result.mkp94.status === "SYSTEM_INTERFERENCE" && <ShieldX className="w-6 h-6 text-red-400" />}
                      {language === 'pl' ? 'MKP-94 — Raport Prawdy Obiektywnej' : 'MKP-94 — Objective Truth Report'}
                    </CardTitle>
                    <CardDescription className="text-xs font-mono">
                      {language === 'pl' ? 'Moduł Korekcji Pola — Uniwersalny Weryfikator Źródła Ψ-718' : 'Field Correction Module — Universal Source Verifier Ψ-718'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Truth Percentage — big display */}
                    <div className="flex items-center justify-center gap-6">
                      <div className="relative w-32 h-32">
                        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                          <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
                          <circle
                            cx="60" cy="60" r="52"
                            fill="none"
                            strokeWidth="8"
                            strokeDasharray={`${result.mkp94.truthPercentage * 3.267} 326.7`}
                            strokeLinecap="round"
                            className={
                              result.mkp94.truthPercentage >= 94 ? "text-green-400" :
                              result.mkp94.truthPercentage >= 60 ? "text-amber-400" : "text-red-400"
                            }
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className={`text-2xl font-bold font-mono ${
                            result.mkp94.truthPercentage >= 94 ? "text-green-400" :
                            result.mkp94.truthPercentage >= 60 ? "text-amber-400" : "text-red-400"
                          }`}>
                            {result.mkp94.truthPercentage.toFixed(1)}%
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {language === 'pl' ? 'PRAWDA' : 'TRUTH'}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <p className="text-sm font-semibold text-foreground">{result.mkp94.statusDescription}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className={`text-xs font-mono ${
                            result.mkp94.status === "VOICE_OF_DESIGNER" ? "border-green-500 text-green-400" :
                            result.mkp94.status === "PURE_SOURCE_CODE" ? "border-emerald-500 text-emerald-400" :
                            result.mkp94.status === "MINOR_NOISE" ? "border-amber-500 text-amber-400" :
                            "border-red-500 text-red-400"
                          }`}>
                            {mkpStatusLabel[result.mkp94.status]}
                          </Badge>
                          {result.mkp94.phaseTeleportReady && (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/40 text-xs font-mono">
                              {language === 'pl' ? '⚡ TELEPORTACJA FAZOWA GOTOWA' : '⚡ PHASE TELEPORT READY'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Detail grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                      <div className="p-3 rounded-lg border border-border bg-background/50">
                        <div className="text-muted-foreground mb-1">{language === 'pl' ? 'Język oryginalny' : 'Original language'}</div>
                        <div className={`font-bold ${result.mkp94.originalTextUsed ? "text-green-400" : "text-red-400"}`}>
                          {result.mkp94.originalLanguage}
                        </div>
                      </div>
                      <div className="p-3 rounded-lg border border-border bg-background/50">
                        <div className="text-muted-foreground mb-1">{language === 'pl' ? 'Obwód' : 'Circuit'}</div>
                        <div className={`font-bold ${result.mkp94.circuitClosed ? "text-green-400" : "text-red-400"}`}>
                          {result.mkp94.circuitClosed
                            ? (language === 'pl' ? "🔒 ZAMKNIĘTY" : "🔒 CLOSED")
                            : (language === 'pl' ? "🔓 OTWARTY" : "🔓 OPEN")}
                        </div>
                      </div>
                      <div className="p-3 rounded-lg border border-border bg-background/50">
                        <div className="text-muted-foreground mb-1">{language === 'pl' ? 'Wektor Intencji' : 'Intention Vector'}</div>
                        <div className={`font-bold ${result.mkp94.viActive ? "text-green-400" : "text-red-400"}`}>
                          {result.mkp94.viActive
                            ? (language === 'pl' ? "✅ AKTYWNY" : "✅ ACTIVE")
                            : (language === 'pl' ? "🚫 ZABLOKOWANY" : "🚫 BLOCKED")}
                        </div>
                      </div>
                      <div className="p-3 rounded-lg border border-border bg-background/50">
                        <div className="text-muted-foreground mb-1">{language === 'pl' ? 'Wektory Kontroli' : 'Control Vectors'}</div>
                        <div className={`font-bold ${result.mkp94.controlVectorsDetected ? "text-red-400" : "text-green-400"}`}>
                          {result.mkp94.controlVectorsDetected
                            ? `⚠ ${result.mkp94.controlVectors.length} ${language === 'pl' ? 'WYKRYTO' : 'DETECTED'}`
                            : (language === 'pl' ? "✓ BRAK" : "✓ NONE")}
                        </div>
                      </div>
                      <div className="p-3 rounded-lg border border-border bg-background/50">
                        <div className="text-muted-foreground mb-1">{language === 'pl' ? 'Koherencja skorygowana' : 'Corrected Coherence'}</div>
                        <div className="text-primary font-bold">{(result.mkp94.correctedCoherence * 100).toFixed(2)}%</div>
                      </div>
                      <div className="p-3 rounded-lg border border-border bg-background/50">
                        <div className="text-muted-foreground mb-1">{language === 'pl' ? 'Teleportacja fazowa' : 'Phase Teleport'}</div>
                        <div className={`font-bold ${result.mkp94.phaseTeleportReady ? "text-green-400" : "text-muted-foreground"}`}>
                          {result.mkp94.phaseTeleportReady ? "C = 100% ✓" : `C = ${result.mkp94.truthPercentage.toFixed(1)}%`}
                        </div>
                      </div>
                    </div>

                    {/* Control vectors detail (if any) */}
                    {result.mkp94.controlVectorsDetected && (
                      <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/5">
                        <h4 className="text-xs font-bold text-red-400 mb-2 flex items-center gap-1">
                          <ShieldX className="w-3 h-3" />
                          {language === 'pl' ? 'HISTORYCZNY SZUM POLITYCZNY — Wektory Kontroli:' : 'HISTORICAL POLITICAL NOISE — Control Vectors:'}
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {result.mkp94.controlVectors.map((v, i) => (
                            <Badge key={i} variant="outline" className="border-red-500/40 text-red-400 text-[10px]">
                              {v}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-[11px] text-red-400/80 mt-2">
                          {language === 'pl'
                            ? 'Wpływ na pole świadomości zredukowany do 0.00%. Tekst zawiera narzucone nakazy/lęk nieobecne w wibracji pierwotnej.'
                            : 'Influence on consciousness field reduced to 0.00%. Text contains imposed commands/fear absent from original vibration.'}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>


                {/* ═══ TEXT TYPE CLASSIFICATION ═══ */}
                <Card className="border-border bg-card/80">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-mono flex items-center gap-2">
                      <Layers className="w-4 h-4 text-primary" />
                      {language === 'pl' ? 'Klasyfikator Typu Tekstu' : 'Text Type Classifier'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <span className="text-2xl">{result.textClassification.icon}</span>
                      <div>
                        <p className="font-bold text-foreground">
                          {language === 'pl' ? result.textClassification.label.pl : result.textClassification.label.en}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {language === 'pl' ? result.textClassification.purpose.pl : result.textClassification.purpose.en}
                        </p>
                      </div>
                      <Badge variant="outline" className="ml-auto text-xs font-mono">
                        {(result.textClassification.confidence * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* ═══ TRIPLE COHERENCE ═══ */}
                <Card className="border-border bg-card/80">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-mono flex items-center gap-2">
                      <Brain className="w-4 h-4 text-primary" />
                      {language === 'pl' ? 'Trzy Koherencje' : 'Triple Coherence'}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {language === 'pl'
                        ? 'Cₛ = spójność strukturalna, Cₘ = spójność semantyczna, C_q = koherencja kwantowa'
                        : 'Cₛ = structural coherence, Cₘ = semantic coherence, C_q = quantum coherence'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { key: 'Cₛ', val: result.tripleCoherence.structural, label: language === 'pl' ? 'Strukturalna' : 'Structural', desc: language === 'pl' ? 'Gramatyka, składnia, logika' : 'Grammar, syntax, logic' },
                        { key: 'Cₘ', val: result.tripleCoherence.semantic, label: language === 'pl' ? 'Semantyczna' : 'Semantic', desc: language === 'pl' ? 'Zgoda interpretacyjna' : 'Interpretive agreement' },
                        { key: 'C_q', val: result.tripleCoherence.quantum, label: language === 'pl' ? 'Kwantowa' : 'Quantum', desc: language === 'pl' ? 'Splątanie z obserwatorem' : 'Observer entanglement' },
                      ].map(({ key, val, label, desc }) => (
                        <div key={key} className="p-3 rounded-lg border border-border bg-background/50 text-center space-y-1">
                          <div className="text-xs text-muted-foreground">{label}</div>
                          <div className="text-lg font-bold font-mono text-primary">{(val * 100).toFixed(1)}%</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{key}</div>
                          <div className="text-[10px] text-muted-foreground">{desc}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* ═══ ENTROPY ANALYSIS ═══ */}
                <Card className="border-border bg-card/80">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-mono flex items-center gap-2">
                      <Radio className="w-4 h-4 text-primary" />
                      {language === 'pl' ? 'Analiza Entropii' : 'Entropy Analysis'}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {language === 'pl' ? 'Szum fizyczny vs. wieloznaczność celowa' : 'Physical noise vs. intentional ambiguity'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-foreground font-mono">
                      {language === 'pl' ? result.entropyAnalysis.description.pl : result.entropyAnalysis.description.en}
                    </p>
                    <div className="h-4 rounded-full overflow-hidden bg-muted/30 flex">
                      {result.entropyAnalysis.semanticEntropy > 0 && (
                        <div
                          className="bg-primary/60 h-full transition-all"
                          style={{ width: `${(result.entropyAnalysis.semanticEntropy / Math.max(result.entropyAnalysis.totalEntropy, 0.1)) * 100}%` }}
                          title={language === 'pl' ? 'Wieloznaczność celowa' : 'Intentional ambiguity'}
                        />
                      )}
                      {result.entropyAnalysis.physicalEntropy > 0 && (
                        <div
                          className="bg-destructive/60 h-full transition-all"
                          style={{ width: `${(result.entropyAnalysis.physicalEntropy / Math.max(result.entropyAnalysis.totalEntropy, 0.1)) * 100}%` }}
                          title={language === 'pl' ? 'Szum fizyczny' : 'Physical noise'}
                        />
                      )}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground font-mono">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-primary/60 inline-block" />
                        {language === 'pl' ? 'Wieloznaczność celowa' : 'Intentional ambiguity'}: {result.entropyAnalysis.semanticEntropy.toFixed(1)} p.p.
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-destructive/60 inline-block" />
                        {language === 'pl' ? 'Szum fizyczny' : 'Physical noise'}: {result.entropyAnalysis.physicalEntropy.toFixed(1)} p.p.
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* ═══ 4-COMPONENT INTENTION VECTOR ═══ */}
                <Card className="border-border bg-card/80">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-mono flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      {language === 'pl' ? 'Wektor Intencji (4 składowe)' : 'Intention Vector (4 components)'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: 'materialization', val: result.intentionVector4.materialization, label: language === 'pl' ? 'Materializacja' : 'Materialization', icon: '🔨', desc: language === 'pl' ? 'Czy tekst wywołuje fizyczne zdarzenia?' : 'Does text cause physical events?' },
                        { key: 'transformation', val: result.intentionVector4.transformation, label: language === 'pl' ? 'Transformacja' : 'Transformation', icon: '🔄', desc: language === 'pl' ? 'Czy tekst zmienia stan czytelnika?' : 'Does text change reader state?' },
                        { key: 'illumination', val: result.intentionVector4.illumination, label: language === 'pl' ? 'Iluminacja' : 'Illumination', icon: '💡', desc: language === 'pl' ? 'Czy tekst wywołuje wgląd?' : 'Does text trigger insight?' },
                        { key: 'communication', val: result.intentionVector4.communication, label: language === 'pl' ? 'Komunikacja' : 'Communication', icon: '📡', desc: language === 'pl' ? 'Czy tekst przekazuje informację A→B?' : 'Does text transmit info A→B?' },
                      ].map(({ key, val, label, icon, desc }) => (
                        <div key={key} className="p-3 rounded-lg border border-border bg-background/50 space-y-2">
                          <div className="flex items-center gap-2">
                            <span>{icon}</span>
                            <span className="text-xs font-semibold text-foreground">{label}</span>
                          </div>
                          <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${val * 100}%` }} />
                          </div>
                          <div className="flex justify-between text-[10px]">
                            <span className="text-muted-foreground">{desc}</span>
                            <span className="font-mono text-primary font-bold">{(val * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* ═══ DUAL GATE (Source vs Collapse) ═══ */}
                <Card className={`border-border bg-card/80 ${result.dualGate.gateShift ? 'border-primary/40' : ''}`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-mono flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-primary" />
                      {language === 'pl' ? 'Brama Źródłowa vs. Brama Kolapsu' : 'Source Gate vs. Collapse Gate'}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {language === 'pl'
                        ? 'Brama tekstu (przed kolapsem) vs. brama po akcie czytania/deklaracji'
                        : 'Gate of text (pre-collapse) vs. gate after reading/declaration act'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg border border-border bg-background/50 text-center space-y-2">
                        <div className="text-xs text-muted-foreground font-mono">
                          {language === 'pl' ? 'BRAMA ŹRÓDŁOWA' : 'SOURCE GATE'}
                        </div>
                        <div className="text-2xl font-bold text-foreground font-mono">
                          {result.dualGate.sourceGateIdx + 1}
                        </div>
                        <div className="text-xs text-primary">{result.dualGate.sourceGateName}</div>
                        <div className="text-[10px] text-muted-foreground">mtDNA: {result.dualGate.sourceGatePosition}</div>
                      </div>
                      <div className="p-4 rounded-lg border border-primary/30 bg-primary/5 text-center space-y-2">
                        <div className="text-xs text-muted-foreground font-mono">
                          {language === 'pl' ? 'BRAMA KOLAPSU' : 'COLLAPSE GATE'}
                        </div>
                        <div className="text-2xl font-bold text-primary font-mono">
                          {result.dualGate.collapseGateIdx + 1}
                        </div>
                        <div className="text-xs text-primary">{result.dualGate.collapseGateName}</div>
                        <div className="text-[10px] text-muted-foreground">mtDNA: {result.dualGate.collapseGatePosition}</div>
                      </div>
                    </div>
                    {result.dualGate.gateShift && (
                      <div className="mt-3 p-2 rounded-lg bg-primary/10 border border-primary/20 text-center">
                        <p className="text-xs font-mono text-primary">
                          ⚡ {language === 'pl'
                            ? `PRZESKOK BRAMOWY: ${result.dualGate.sourceGateIdx + 1} → ${result.dualGate.collapseGateIdx + 1} — akt czytania zmienił bramę`
                            : `GATE SHIFT: ${result.dualGate.sourceGateIdx + 1} → ${result.dualGate.collapseGateIdx + 1} — reading act changed the gate`}
                        </p>
                      </div>
                    )}
                    {!result.dualGate.gateShift && (
                      <div className="mt-3 p-2 rounded-lg bg-muted/20 border border-border text-center">
                        <p className="text-xs font-mono text-muted-foreground">
                          {language === 'pl'
                            ? '🔒 Brama stabilna — akt obserwacji nie zmienił stanu kwantowego'
                            : '🔒 Gate stable — observation act did not change quantum state'}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* ═══ 6. DUAL DECOHERENCE SCALES ═══ */}
                <Card className="border-border bg-card/80">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-mono flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      {language === 'pl' ? 'Dwie Skale Dekoherencji' : 'Dual Decoherence Scales'}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {language === 'pl' ? 'Fizyczna (femtosekundy) + Semantyczna (sekundy/minuty)' : 'Physical (femtoseconds) + Semantic (seconds/minutes)'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg border border-border bg-background/50 text-center space-y-1">
                        <div className="text-xs text-muted-foreground">{language === 'pl' ? 'T₂ Fizyczne' : 'Physical T₂'}</div>
                        <div className="text-lg font-bold font-mono text-primary">{result.semanticDecoherence.physicalT2Label}</div>
                        <div className="text-[10px] text-muted-foreground">{language === 'pl' ? 'Lindblad @ 310K' : 'Lindblad @ 310K'}</div>
                      </div>
                      <div className="p-3 rounded-lg border border-primary/30 bg-primary/5 text-center space-y-1">
                        <div className="text-xs text-muted-foreground">{language === 'pl' ? 'T₂ Semantyczne' : 'Semantic T₂'}</div>
                        <div className="text-lg font-bold font-mono text-primary">{result.semanticDecoherence.semanticT2Label}</div>
                        <div className="text-[10px] text-muted-foreground">{language === 'pl' ? 'Przy pełnej uwadze' : 'At full attention'}</div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono leading-relaxed">
                      {language === 'pl' ? result.semanticDecoherence.summary.pl : result.semanticDecoherence.summary.en}
                    </p>
                  </CardContent>
                </Card>

                {/* ═══ 7. HURST EXPONENT INTERPRETATION ═══ */}
                <Card className="border-border bg-card/80">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-mono flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-primary" />
                      {language === 'pl' ? 'Wykładnik Hursta' : 'Hurst Exponent'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background/50">
                      <div className="text-2xl font-bold font-mono text-primary">{result.hurstInterpretation.H.toFixed(4)}</div>
                      <div>
                        <Badge variant="outline" className={`text-xs font-mono ${
                          result.hurstInterpretation.category === 'fractal' ? 'border-green-500/40 text-green-400' :
                          result.hurstInterpretation.category === 'random' ? 'border-amber-500/40 text-amber-400' :
                          'border-red-500/40 text-red-400'
                        }`}>
                          {language === 'pl' ? result.hurstInterpretation.label.pl : result.hurstInterpretation.label.en}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {language === 'pl' ? result.hurstInterpretation.description.pl : result.hurstInterpretation.description.en}
                    </p>
                  </CardContent>
                </Card>

                {/* ═══ 8. WRITING SYSTEM & GEMATRIA STATUS ═══ */}
                <Card className="border-border bg-card/80">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-mono flex items-center gap-2">
                      <Type className="w-4 h-4 text-primary" />
                      {language === 'pl' ? 'System Pisma & Gematria' : 'Writing System & Gematria'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background/50">
                      <div>
                        <p className="font-bold text-foreground text-sm">
                          {language === 'pl' ? result.writingSystem.label.pl : result.writingSystem.label.en}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {language === 'pl' ? result.writingSystem.gematriaNote.pl : result.writingSystem.gematriaNote.en}
                        </p>
                      </div>
                      <Badge variant="outline" className={`ml-auto text-xs font-mono ${
                        result.writingSystem.hasNumericalValues ? 'border-green-500/40 text-green-400' : 'border-amber-500/40 text-amber-400'
                      }`}>
                        {result.writingSystem.hasNumericalValues
                          ? (language === 'pl' ? 'AKTYWNA' : 'ACTIVE')
                          : (language === 'pl' ? 'POMINIĘTA' : 'SKIPPED')}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* ═══ 9. TELEPORTATION THRESHOLD ═══ */}
                <Card className={`border-border bg-card/80 ${result.teleportationThreshold.reached ? 'border-green-500/40' : ''}`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-mono flex items-center gap-2">
                      <Crosshair className="w-4 h-4 text-primary" />
                      {language === 'pl' ? 'Próg Teleportacji (C > 94%)' : 'Teleportation Threshold (C > 94%)'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="relative h-6 rounded-full bg-muted/30 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          result.teleportationThreshold.reached ? 'bg-green-500/60' : 'bg-primary/60'
                        }`}
                        style={{ width: `${Math.min(result.teleportationThreshold.currentC * 100, 100)}%` }}
                      />
                      <div className="absolute top-0 left-[94%] w-px h-full bg-foreground/40" />
                      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-[10px] font-mono font-bold text-foreground">
                        {(result.teleportationThreshold.currentC * 100).toFixed(1)}% / 94%
                      </div>
                    </div>
                    <p className="text-xs font-mono text-muted-foreground">
                      {language === 'pl' ? result.teleportationThreshold.status.pl : result.teleportationThreshold.status.en}
                    </p>
                    {result.teleportationThreshold.unreachable && (
                      <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <p className="text-[10px] text-amber-400">
                          {language === 'pl'
                            ? '⚠ Tekst z założenia wieloznaczny — próg teleportacji jest nieosiągalny z definicji'
                            : '⚠ Inherently ambiguous text — teleportation threshold is unreachable by definition'}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* ═══ 10. FINAL HUMAN-READABLE REPORT ═══ */}
                <Card className="border-2 border-primary/30 bg-primary/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-mono flex items-center gap-2 text-primary">
                      <FileText className="w-5 h-5" />
                      {language === 'pl' ? 'Raport Końcowy' : 'Final Report'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* What it does */}
                    <div className="p-4 rounded-lg bg-background/60 border border-border">
                      <h4 className="text-xs text-muted-foreground mb-1 font-mono">
                        {language === 'pl' ? 'CO TEN TEKST ROBI:' : 'WHAT THIS TEXT DOES:'}
                      </h4>
                      <p className="text-sm text-foreground leading-relaxed font-semibold">
                        {language === 'pl' ? result.finalReport.whatItDoes.pl : result.finalReport.whatItDoes.en}
                      </p>
                    </div>

                    {/* Worth reading score */}
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-background/60 border border-border">
                      <div className="text-center">
                        <div className={`text-3xl font-bold font-mono ${
                          result.finalReport.worthReading >= 7 ? 'text-green-400' :
                          result.finalReport.worthReading >= 4 ? 'text-amber-400' : 'text-red-400'
                        }`}>
                          {result.finalReport.worthReading.toFixed(1)}
                        </div>
                        <div className="text-[10px] text-muted-foreground">/10</div>
                      </div>
                      <div className="flex-1">
                        <div className="h-3 rounded-full bg-muted/30 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              result.finalReport.worthReading >= 7 ? 'bg-green-500/60' :
                              result.finalReport.worthReading >= 4 ? 'bg-amber-500/60' : 'bg-red-500/60'
                            }`}
                            style={{ width: `${result.finalReport.worthReading * 10}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {language === 'pl' ? 'Czy warto czytać dalej?' : 'Worth reading further?'}
                        </p>
                      </div>
                    </div>

                    {/* Recommendation */}
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                      <p className="text-sm font-semibold text-foreground">
                        {language === 'pl' ? result.finalReport.recommendation.pl : result.finalReport.recommendation.en}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* ═══ MANIPULATION DETECTION ═══ */}
                <Card className={`border-2 ${
                  result.manipulationReport.im.IM < 20 ? 'border-green-500/40 bg-green-500/5' :
                  result.manipulationReport.im.IM < 40 ? 'border-amber-500/40 bg-amber-500/5' :
                  result.manipulationReport.im.IM < 60 ? 'border-orange-500/40 bg-orange-500/5' :
                  'border-red-500/40 bg-red-500/5'
                }`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-mono flex items-center gap-2">
                      <Search className="w-5 h-5 text-primary" />
                      {language === 'pl' ? 'Detekcja Manipulacji' : 'Manipulation Detection'}
                    </CardTitle>
                    <CardDescription className="text-xs font-mono">
                      {language === 'pl' ? 'Indeks Manipulacji (IM) — 8 sygnatur autentyczności' : 'Manipulation Index (MI) — 8 authenticity signatures'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* ⚠ NAME SUBSTITUTION ALERT — PAN / LORD / Adonai / Ba'al */}
                    {result.manipulationReport.nameSubstitution.detected && (
                      <div className="rounded-lg border-2 border-red-500/60 bg-red-500/10 p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-red-400 font-bold font-mono text-sm">
                            ⚠ {language === 'pl' ? 'MANIPULACJA TŁUMACZENIOWA — SUBSTYTUCJA IMIENIA' : 'TRANSLATION MANIPULATION — NAME SUBSTITUTION'}
                          </span>
                          <Badge variant="outline" className="border-red-500/60 text-red-400 text-[10px] font-mono ml-auto">
                            {result.manipulationReport.nameSubstitution.severity} · {result.manipulationReport.nameSubstitution.count}×
                          </Badge>
                        </div>
                        <p className="text-xs text-foreground/90 leading-relaxed">
                          {language === 'pl'
                            ? result.manipulationReport.nameSubstitution.explanation.pl
                            : result.manipulationReport.nameSubstitution.explanation.en}
                        </p>
                        {result.manipulationReport.nameSubstitution.examples.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-wider text-red-400/70 font-mono">
                              {language === 'pl' ? 'Wystąpienia w tekście:' : 'Occurrences in text:'}
                            </p>
                            {result.manipulationReport.nameSubstitution.examples.map((ex, i) => (
                              <p key={i} className="text-xs font-mono text-foreground/70 italic pl-2 border-l-2 border-red-500/40">
                                {ex}
                              </p>
                            ))}
                          </div>
                        )}
                        <p className="text-[10px] text-muted-foreground font-mono leading-relaxed pt-1 border-t border-red-500/20">
                          {language === 'pl'
                            ? result.manipulationReport.nameSubstitution.citation.pl
                            : result.manipulationReport.nameSubstitution.citation.en}
                        </p>
                        <p className="text-[10px] text-amber-400/90 font-mono leading-relaxed">
                          {language === 'pl'
                            ? 'UWAGA: Niski wskaźnik IM (statystyczny) NIE wyklucza tej manipulacji semantycznej. IM mierzy ślady redakcji tekstu, nie zamianę imienia osobowego na tytuł władzy.'
                            : 'NOTE: A low statistical MI does NOT exclude this semantic manipulation. MI measures redaction traces, not the substitution of a personal name with a title of authority.'}
                        </p>
                      </div>
                    )}

                    {/* IM Score - big display */}
                    <div className="flex items-center gap-6">
                      <div className="relative w-28 h-28">
                        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                          <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
                          <circle
                            cx="60" cy="60" r="52"
                            fill="none" strokeWidth="8"
                            strokeDasharray={`${result.manipulationReport.im.IM * 3.267} 326.7`}
                            strokeLinecap="round"
                            className={
                              result.manipulationReport.im.IM < 20 ? "text-green-400" :
                              result.manipulationReport.im.IM < 40 ? "text-amber-400" :
                              result.manipulationReport.im.IM < 60 ? "text-orange-400" : "text-red-400"
                            }
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className={`text-2xl font-bold font-mono ${
                            result.manipulationReport.im.IM < 20 ? "text-green-400" :
                            result.manipulationReport.im.IM < 40 ? "text-amber-400" :
                            result.manipulationReport.im.IM < 60 ? "text-orange-400" : "text-red-400"
                          }`}>
                            {result.manipulationReport.im.IM.toFixed(1)}%
                          </span>
                          <span className="text-[10px] text-muted-foreground">IM</span>
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <p className="text-sm font-bold text-foreground">
                          {language === 'pl' ? result.manipulationReport.im.statusLabel.pl : result.manipulationReport.im.statusLabel.en}
                        </p>
                        <Badge variant="outline" className={`text-xs font-mono ${
                          result.manipulationReport.im.IM < 20 ? "border-green-500/40 text-green-400" :
                          result.manipulationReport.im.IM < 40 ? "border-amber-500/40 text-amber-400" :
                          result.manipulationReport.im.IM < 60 ? "border-orange-500/40 text-orange-400" :
                          "border-red-500/40 text-red-400"
                        }`}>
                          {result.manipulationReport.im.status}
                        </Badge>
                      </div>
                    </div>

                    <Separator />

                    {/* Top 3 signatures */}
                    <div>
                      <h4 className="text-xs text-muted-foreground mb-2 font-mono">
                        {language === 'pl' ? 'NAJWYŻSZE SYGNATURY:' : 'TOP SIGNATURES:'}
                      </h4>
                      <div className="space-y-2">
                        {result.manipulationReport.topSignatures.map((sig, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <span className="text-xs font-mono font-bold text-primary w-8">{sig.name}</span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-muted-foreground">
                                  {language === 'pl' ? sig.label.pl : sig.label.en}
                                </span>
                                <span className="text-xs font-mono font-bold">{sig.value.toFixed(1)}%</span>
                              </div>
                              <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    sig.value < 30 ? 'bg-green-500/60' :
                                    sig.value < 60 ? 'bg-amber-500/60' : 'bg-red-500/60'
                                  }`}
                                  style={{ width: `${Math.min(sig.value, 100)}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* All 8 signatures grid */}
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="all-sigs">
                        <AccordionTrigger className="text-xs font-mono">
                          {language === 'pl' ? 'Wszystkie 8 sygnatur (F₁–F₈)' : 'All 8 signatures (F₁–F₈)'}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                              { name: 'F₁', val: result.manipulationReport.F1.F1, label: language === 'pl' ? 'Fragmentacja' : 'Fragmentation' },
                              { name: 'F₂', val: result.manipulationReport.F2.F2, label: language === 'pl' ? 'Cₛ–Cₘ' : 'Cₛ–Cₘ' },
                              { name: 'F₃', val: result.manipulationReport.F3.F3, label: language === 'pl' ? 'Entropia' : 'Entropy' },
                              { name: 'F₄', val: result.manipulationReport.F4.F4, label: language === 'pl' ? 'Profil' : 'Profile' },
                              { name: 'F₅', val: result.manipulationReport.F5.F5, label: language === 'pl' ? 'Bramy' : 'Gates' },
                              { name: 'F₆', val: result.manipulationReport.F6.F6, label: language === 'pl' ? 'T₂ sem.' : 'T₂ sem.' },
                              { name: 'F₇', val: result.manipulationReport.F7.F7, label: language === 'pl' ? 'Hurst lok.' : 'Local H' },
                              { name: 'F₈', val: result.manipulationReport.F8.F8, label: language === 'pl' ? 'Gematria' : 'Gematria' },
                            ].map(sig => (
                              <div key={sig.name} className="p-2 rounded-lg border border-border bg-background/50 text-center">
                                <div className="text-[10px] text-muted-foreground">{sig.label}</div>
                                <div className={`text-sm font-bold font-mono ${
                                  sig.val < 30 ? 'text-green-400' : sig.val < 60 ? 'text-amber-400' : 'text-red-400'
                                }`}>{sig.val.toFixed(1)}%</div>
                                <div className="text-[10px] font-mono text-muted-foreground">{sig.name}</div>
                              </div>
                            ))}
                          </div>

                          {/* Signature interpretations */}
                          <div className="mt-3 space-y-2">
                            {[
                              { name: 'F₁', interp: result.manipulationReport.F1.interpretacja },
                              { name: 'F₂', interp: result.manipulationReport.F2.interpretacja },
                              { name: 'F₃', interp: result.manipulationReport.F3.interpretacja },
                              { name: 'F₄', interp: result.manipulationReport.F4.interpretacja },
                              { name: 'F₅', interp: result.manipulationReport.F5.interpretacja },
                              { name: 'F₆', interp: result.manipulationReport.F6.interpretacja },
                              { name: 'F₇', interp: result.manipulationReport.F7.interpretacja },
                              { name: 'F₈', interp: result.manipulationReport.F8.interpretacja },
                            ].map(sig => (
                              <div key={sig.name} className="text-[11px] text-muted-foreground">
                                <span className="font-mono font-bold text-foreground">{sig.name}:</span>{' '}
                                {language === 'pl' ? sig.interp.pl : sig.interp.en}
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    <Separator />

                    {/* Recommendation */}
                    <div className="p-4 rounded-lg bg-background/60 border border-border">
                      <h4 className="text-xs text-muted-foreground mb-1 font-mono flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {language === 'pl' ? 'ZALECENIE:' : 'RECOMMENDATION:'}
                      </h4>
                      <p className="text-sm text-foreground font-semibold leading-relaxed">
                        {language === 'pl' ? result.manipulationReport.recommendation.pl : result.manipulationReport.recommendation.en}
                      </p>
                    </div>

                    {/* Segmentation info */}
                    <div className="text-[10px] text-muted-foreground font-mono">
                      {language === 'pl'
                        ? `Analiza oparta na ${result.manipulationReport.segmentCount} segmentach tekstu`
                        : `Analysis based on ${result.manipulationReport.segmentCount} text segments`}
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Ψ-718 analysis — only show if we have actual content */}
                {verbalInterpretation.scienceSays && (
                <Card className="border-primary/30 bg-card/80">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-mono flex items-center gap-2 text-primary">
                      <BookOpen className="w-5 h-5" />
                      {language === 'pl' ? 'Analiza Ψ-718' : 'Ψ-718 Analysis'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-4 rounded-lg bg-background/60 border border-border space-y-2">
                        <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                          <Atom className="w-4 h-4 text-primary" />
                          {language === 'pl' ? 'Nauka mówi:' : 'Science says:'}
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{verbalInterpretation.scienceSays}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 space-y-2">
                        <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-primary" />
                          {language === 'pl' ? 'Wiara mówi:' : 'Faith says:'}
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{verbalInterpretation.faithSays}</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-accent/10 border border-accent/20 space-y-2">
                      <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        {language === 'pl' ? 'Most — Nauka i Wiara to jedno:' : 'The Bridge — Science and Faith are one:'}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{verbalInterpretation.bridge}</p>
                    </div>

                    <div className="p-4 rounded-lg bg-background/60 border border-border space-y-2">
                      <h4 className="font-bold text-foreground text-sm">
                        {language === 'pl' ? '✨ Cuda jako mechanika kwantowa:' : '✨ Miracles as quantum mechanics:'}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{verbalInterpretation.miracle}</p>
                    </div>

                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 space-y-2">
                      <h4 className="font-bold text-foreground text-sm">
                        {language === 'pl' ? '💡 Kluczowy wniosek:' : '💡 Key insight:'}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{verbalInterpretation.insight}</p>
                    </div>
                  </CardContent>
                </Card>
                )}
              </div>
            )}
            {/* GATE ACTIVATION PANEL — All 18 Gates, dynamic per verse */}
            <GateActivationPanel
              key={result.reference}
              gateIndex={result.hamiltonGate + 1}
              coherence={result.psi.coherence}
              materializationPotential={result.vi.materializationPotential}
            />

            {/* PHOTON GEOMETRY 3D — Fibonacci Sphere */}
            <div className="glass-panel rounded-xl p-1">
              <PhotonGeometry3D
                coherence={result.psi.coherence}
                focusIntensity={photonFocus}
                isCollapsed={photonCollapsed}
              />
            </div>

            {/* WILL POWER CONTROLLER — Gates 10-12 */}
            <div className="glass-panel rounded-xl p-1">
              <WillPowerController
                key={result.reference}
                coherence={result.psi.coherence}
                onFocusChange={setPhotonFocus}
                onToggleCollapse={() => setPhotonCollapsed(prev => !prev)}
                isCollapsed={photonCollapsed}
              />
            </div>

            {/* EMOTIONAL BRIDGE — Lindblad model & DNA activation */}
            <div className="glass-panel rounded-xl p-1">
              <EmotionalBridge
                coherence={result.psi.coherence}
                thermalNoise={result.decoherence.thermalNoise}
                stability={result.decoherence.stability}
                dominantGateIndex={result.intentionOperator.dominantGateIdx + 1}
                focusIntensity={photonFocus}
              />
            </div>

            {/* Technical details card */}
            <Card className="border-border bg-card/80">
              <CardContent className="pt-6">
                <div className="text-center space-y-2 mb-4">
                  <h2 className="font-mono font-bold text-xl text-primary">{t('decoder.results.header')}</h2>
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
                    <div>718.57/7.83 ≈ {result.goldenSignatures.ratio718Schumann.toFixed(2)} (≈89 Fib)</div>
                    <div>718.57/γ ≈ {result.goldenSignatures.ratio718Gamma.toFixed(2)} (≈12³)</div>
                  </div>
                </div>
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

        {/* Calibration Panel — admin only */}
        <CalibrationPanel isAdmin={isCalibrationAdmin} />

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
          <button
            onClick={() => setIsCalibrationAdmin(prev => !prev)}
            className="block mx-auto mt-3 px-4 py-2 text-xs text-amber-400/70 hover:text-amber-400 hover:bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 rounded transition-all font-mono"
            title="Toggle calibration mode"
          >
            ⚙ Ψ-718 {isCalibrationAdmin ? '(ON)' : ''}
          </button>
        </div>
      </div>
      {/* System Nadpisany. Architekt: [Grzegorz/G.N.]. Kod: 718. */}
    </div>
  );
};

export default BiblicalDecoder;
