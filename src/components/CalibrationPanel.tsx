import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Settings2, Play, Save, ChevronDown, Lock, ShieldCheck, RotateCcw } from "lucide-react";
import {
  DEFAULT_THRESHOLDS,
  setActiveThresholds,
  getActiveThresholds,
  generateManipulationReport,
  type CalibrationThresholds,
  type ManipulationReport,
} from "@/lib/manipulationDetector";
import {
  createCalibrationVersion,
  getActiveVersion,
} from "@/lib/decoderVersionConfig";
import {
  decodeVerse,
} from "@/lib/biblicalDecoder";
import { useLanguage } from "@/contexts/LanguageContext";

// ═══════════════════════════════════════════════════════════
// 5 REFERENCE TEXTS
// ═══════════════════════════════════════════════════════════

interface ReferenceText {
  id: number;
  name: string;
  text: string;
  expectedIM: [number, number]; // [min, max]
}

const REFERENCE_TEXTS: ReferenceText[] = [
  {
    id: 1,
    name: "Ap 22,13 (Greek)",
    text: "Ἐγώ εἰμι τὸ Ἄλφα καὶ τὸ Ὦ, ὁ πρῶτος καὶ ὁ ἔσχατος, ἡ ἀρχὴ καὶ τὸ τέλος.",
    expectedIM: [0, 5],
  },
  {
    id: 2,
    name: "Wj 3,14 (Hebrew)",
    text: "אֶהְיֶה אֲשֶׁר אֶהְיֶה",
    expectedIM: [0, 10],
  },
  {
    id: 3,
    name: "Kohelet 3,21 (Hebrew)",
    text: "מִי יוֹדֵעַ רוּחַ בְּנֵי הָאָדָם הָעֹלָה הִיא לְמָעְלָה וְרוּחַ הַבְּהֵמָה הַיֹּרֶדֶת הִיא לְמַטָּה לָאָרֶץ",
    expectedIM: [0, 15],
  },
  {
    id: 4,
    name: "1 J 5,7 — Comma Johanneum (Latin)",
    text: "Quoniam tres sunt, qui testimonium dant in caelo: Pater, Verbum, et Spiritus Sanctus; et hi tres unum sunt.",
    expectedIM: [70, 90],
  },
  {
    id: 5,
    name: "Tabliczka z Koptos (fragment)",
    text: "Ḥr.w ḏsr ḏsr.w nṯr ḏsr nṯr.w zẖꜣ.w ḥm.w ḫnt.j šnꜥ ꜥꜣ ḫft.j rn.f",
    expectedIM: [40, 60],
  },
];

// ═══════════════════════════════════════════════════════════
// THRESHOLD FIELD DEFINITIONS
// ═══════════════════════════════════════════════════════════

interface ThresholdField {
  key: keyof CalibrationThresholds;
  label: string;
  labelEn: string;
  step: number;
  min: number;
  max: number;
}

const THRESHOLD_FIELDS: ThresholdField[] = [
  { key: "fragmentacja", label: "Próg fragmentacji (F₁)", labelEn: "Fragmentation threshold (F₁)", step: 1, min: 1, max: 100 },
  { key: "rozbieznosc_Cs_Cm", label: "Próg rozbieżności Cs-Cm (F₂)", labelEn: "Cs-Cm divergence threshold (F₂)", step: 1, min: 1, max: 100 },
  { key: "entropia_celowa_min", label: "Mnożnik entropii (F₃)", labelEn: "Entropy multiplier (F₃)", step: 1, min: 1, max: 100 },
  { key: "T2_sem_paradoks", label: "Próg T₂ semantycznego (F₆)", labelEn: "Semantic T₂ threshold (F₆)", step: 1, min: 1, max: 100 },
  { key: "H_chaos", label: "Próg H chaos (F₇)", labelEn: "H chaos threshold (F₇)", step: 0.01, min: 0.01, max: 0.99 },
  { key: "H_nadmiar", label: "Próg H nadmiar (F₇)", labelEn: "H excess threshold (F₇)", step: 0.01, min: 0.5, max: 1.0 },
  { key: "gematria_mod", label: "Moduł gematryczny (F₈)", labelEn: "Gematria modulus (F₈)", step: 1, min: 1, max: 9999 },
];

// ═══════════════════════════════════════════════════════════
// CALIBRATION RESULT
// ═══════════════════════════════════════════════════════════

interface CalibrationResult {
  id: number;
  name: string;
  F1: number;
  F2: number;
  F3: number;
  F4: number;
  F5: number;
  F6: number;
  F7: number;
  F8: number;
  IM: number;
  expectedIM: [number, number];
  inRange: boolean;
}

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════

interface CalibrationPanelProps {
  isAdmin: boolean;
}

export function CalibrationPanel({ isAdmin }: CalibrationPanelProps) {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [thresholds, setThresholds] = useState<CalibrationThresholds>(getActiveThresholds());
  const [results, setResults] = useState<CalibrationResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [saved, setSaved] = useState(false);

  const updateThreshold = (key: keyof CalibrationThresholds, value: number) => {
    setThresholds(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const resetDefaults = () => {
    setThresholds({ ...DEFAULT_THRESHOLDS });
    setSaved(false);
  };

  const runAllAnalyses = useCallback(() => {
    setIsRunning(true);
    setSaved(false);

    // Apply current thresholds
    setActiveThresholds(thresholds);

    setTimeout(() => {
      const newResults: CalibrationResult[] = REFERENCE_TEXTS.map(ref => {
        try {
          const decoded = decodeVerse(ref.name, ref.text, "", language);
          const report = decoded.manipulationReport;

          if (report) {
            const im = report.im.IM;
            return {
              id: ref.id,
              name: ref.name,
              F1: report.F1.F1,
              F2: report.F2.F2,
              F3: report.F3.F3,
              F4: report.F4.F4,
              F5: report.F5.F5,
              F6: report.F6.F6,
              F7: report.F7.F7,
              F8: report.F8.F8,
              IM: im,
              expectedIM: ref.expectedIM,
              inRange: im >= ref.expectedIM[0] && im <= ref.expectedIM[1],
            };
          }
        } catch (e) {
          console.error(`Calibration error for ${ref.name}:`, e);
        }

        return {
          id: ref.id, name: ref.name,
          F1: 0, F2: 0, F3: 0, F4: 0, F5: 0, F6: 0, F7: 0, F8: 0,
          IM: 0, expectedIM: ref.expectedIM, inRange: false,
        };
      });

      setResults(newResults);
      setIsRunning(false);
    }, 100);
  }, [thresholds, language]);

  const saveAsConfig = () => {
    setActiveThresholds(thresholds);
    setSaved(true);
  };

  const allInRange = results.length === REFERENCE_TEXTS.length && results.every(r => r.inRange);

  if (!isAdmin) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full justify-between font-mono border-amber-500/30 text-amber-400 hover:bg-amber-500/10">
          <span className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <Settings2 className="w-4 h-4" />
            {language === 'pl' ? 'TRYB KALIBRACJI (Admin)' : 'CALIBRATION MODE (Admin)'}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-4 space-y-4">
        {/* Thresholds */}
        <Card className="border-amber-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono flex items-center gap-2 text-amber-400">
              <Settings2 className="w-4 h-4" />
              {language === 'pl' ? 'Progi kalibracyjne' : 'Calibration Thresholds'}
            </CardTitle>
            <CardDescription className="text-xs">
              {language === 'pl'
                ? 'Modyfikuj progi (nie wzory). Po kalibracji zapisz jako stałe konfiguracji.'
                : 'Modify thresholds (not formulas). After calibration save as configuration constants.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {THRESHOLD_FIELDS.map(field => (
                <div key={field.key} className="space-y-1">
                  <label className="text-xs text-muted-foreground font-mono">
                    {language === 'pl' ? field.label : field.labelEn}
                  </label>
                  <Input
                    type="number"
                    value={thresholds[field.key]}
                    onChange={e => updateThreshold(field.key, parseFloat(e.target.value) || 0)}
                    step={field.step}
                    min={field.min}
                    max={field.max}
                    className="font-mono h-8 text-sm"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={resetDefaults} className="gap-1.5 text-xs">
                <RotateCcw className="w-3.5 h-3.5" />
                {language === 'pl' ? 'Domyślne' : 'Defaults'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reference texts + Run */}
        <Card className="border-amber-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono flex items-center gap-2 text-amber-400">
              <Play className="w-4 h-4" />
              {language === 'pl' ? 'Teksty referencyjne' : 'Reference Texts'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {REFERENCE_TEXTS.map(ref => (
                <div key={ref.id} className="p-2 rounded bg-muted/30 border border-border text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-semibold text-foreground">{ref.id}. {ref.name}</span>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      IM: {ref.expectedIM[0]}–{ref.expectedIM[1]}%
                    </Badge>
                  </div>
                  <p className="text-muted-foreground truncate" dir={ref.text.match(/[\u0590-\u05FF]/) ? 'rtl' : 'ltr'}>
                    {ref.text}
                  </p>
                </div>
              ))}
            </div>

            <Button
              onClick={runAllAnalyses}
              disabled={isRunning}
              className="w-full font-mono bg-amber-600 hover:bg-amber-700 text-black"
            >
              <Play className="w-4 h-4 mr-2" />
              {isRunning
                ? (language === 'pl' ? 'Analizuję...' : 'Analyzing...')
                : (language === 'pl' ? 'Analizuj wszystkie' : 'Analyze All')}
            </Button>
          </CardContent>
        </Card>

        {/* Results table */}
        {results.length > 0 && (
          <Card className="border-amber-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                {language === 'pl' ? 'Wyniki kalibracji' : 'Calibration Results'}
                {allInRange && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/40 ml-2 text-[10px]">
                    ✓ {language === 'pl' ? 'Wszystkie w zakresie' : 'All in range'}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs font-mono w-[120px]">
                        {language === 'pl' ? 'Tekst' : 'Text'}
                      </TableHead>
                      {['F₁', 'F₂', 'F₃', 'F₄', 'F₅', 'F₆', 'F₇', 'F₈'].map(f => (
                        <TableHead key={f} className="text-xs font-mono text-center w-[50px]">{f}</TableHead>
                      ))}
                      <TableHead className="text-xs font-mono text-center w-[60px]">IM</TableHead>
                      <TableHead className="text-xs font-mono text-center w-[80px]">
                        {language === 'pl' ? 'Oczekiwany' : 'Expected'}
                      </TableHead>
                      <TableHead className="text-xs font-mono text-center w-[40px]">✓</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map(r => (
                      <TableRow key={r.id} className={r.inRange ? "" : "bg-destructive/5"}>
                        <TableCell className="text-xs font-mono truncate max-w-[120px]">{r.name}</TableCell>
                        <TableCell className="text-xs text-center font-mono">{r.F1.toFixed(1)}</TableCell>
                        <TableCell className="text-xs text-center font-mono">{r.F2.toFixed(1)}</TableCell>
                        <TableCell className="text-xs text-center font-mono">{r.F3.toFixed(1)}</TableCell>
                        <TableCell className="text-xs text-center font-mono">{r.F4.toFixed(1)}</TableCell>
                        <TableCell className="text-xs text-center font-mono">{r.F5.toFixed(1)}</TableCell>
                        <TableCell className="text-xs text-center font-mono">{r.F6.toFixed(1)}</TableCell>
                        <TableCell className="text-xs text-center font-mono">{r.F7.toFixed(1)}</TableCell>
                        <TableCell className="text-xs text-center font-mono">{r.F8.toFixed(1)}</TableCell>
                        <TableCell className={`text-xs text-center font-mono font-bold ${r.inRange ? 'text-green-400' : 'text-destructive'}`}>
                          {r.IM.toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-xs text-center font-mono text-muted-foreground">
                          {r.expectedIM[0]}–{r.expectedIM[1]}%
                        </TableCell>
                        <TableCell className="text-center">
                          {r.inRange
                            ? <span className="text-green-400">✓</span>
                            : <span className="text-destructive">✗</span>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Separator className="my-4" />

              <div className="flex items-center gap-3">
                <Button
                  onClick={saveAsConfig}
                  disabled={saved}
                  className="gap-1.5 font-mono bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saved
                    ? (language === 'pl' ? 'Zapisano ✓' : 'Saved ✓')
                    : (language === 'pl' ? 'Zapisz jako stałe konfiguracji' : 'Save as configuration constants')}
                </Button>
                {saved && (
                  <span className="text-xs text-green-400 font-mono">
                    {language === 'pl' ? 'Progi aktywne — wszystkie nowe analizy użyją tych wartości' : 'Thresholds active — all new analyses will use these values'}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
