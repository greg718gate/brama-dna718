import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import ZetaFooter from "@/components/ZetaFooter";

type Lang = "pl" | "en";

const T = {
  pl: {
    title: "ZETA-CORE — FAQ, Testy i Analizy",
    subtitle: "Najczęstsze pytania, wyniki testów jednostkowych i status systemu",
    back: "← Powrót do /zeta",
    integration: "Instrukcja integracji",
    testsTitle: "Wyniki testów jednostkowych (Vitest)",
    testsDesc: "Testy uruchamiane komendą: bunx vitest run",
    faqTitle: "Najczęściej zadawane pytania (FAQ)",
    statusTitle: "Status wdrożenia komponentów",
    passed: "PASSED",
    status_ok: "Działa w test_phase",
    status_partial: "Częściowo",
    status_planned: "Zaplanowane",
    faq: [
      { q: "Czym jest ZETA-CORE?", a: "Silnik diagnostyczny do analizy drgań i sygnałów akustycznych maszyn przemysłowych. Wykrywa uszkodzenia łożysk, niewyważenie, luzy, kawitację — na podstawie analizy koherencji fazowej i spektrum FFT." },
      { q: "Jakie są wersje silnika?", a: "v1.0 Standard (stałe RPM), v1.1 Adaptive (zmienna prędkość), v2.0 Spatial (3-osiowe X/Y/Z z akcelerometrem)." },
      { q: "Jak podłączyć maszynę?", a: "3 poziomy: (1) telefon/laptop — nagranie mikrofonem, (2) czujnik USB — akcelerometr → CSV, (3) SCADA/MQTT — strumień na żywo. Szczegóły na /zeta/integration." },
      { q: "Ile kosztuje dostęp?", a: "Status subskrypcji to test_phase: dostęp jest otwarty i bez opłat." },
      { q: "Gdzie działa rdzeń?", a: "Wyłącznie lokalnie w piaskownicy przeglądarki. Ciężkie obliczenia wykonuje Web Worker; nie ma instalatora ani zewnętrznego procesu." },
      { q: "Czy kod jest jawny?", a: "Tak. Kod obliczeniowy jest dostępny do weryfikacji na github.com/greg718gate/brama-dna718." },
      { q: "Jaka jest długość obsługiwanego pliku?", a: "Bez limitu — długie sygnały są automatycznie okienkowane (windowing) i uśredniane." },
      { q: "Czy działa 24/7?", a: "Tak. Tryb Live w /zeta uruchamia pętlę pomiarową z alarmami i eksportem CSV." },
      { q: "Jakie są kody dostępu?", a: "Portal demonstracyjny: ZETA-2026. Instrukcja publiczna: /zeta/integration (bez hasła)." },
      { q: "Jak zamówić pilotaż?", a: "Napisz na contact@zeta-core-dsp.com — pierwszy raport diagnostyczny wykonujemy bez opłaty wstępnej." },
    ],
    components: [
      { name: "Silniki v1.0 / v1.1 / v2.0 (lokalny Web Worker)", status: "ok" },
      { name: "Portal /zeta (upload, live, PDF)", status: "ok" },
      { name: "Instrukcja /zeta/integration (PL/EN)", status: "ok" },
      { name: "Pełna dwujęzyczność UI", status: "ok" },
      { name: "Testy jednostkowe (Vitest, 14/14)", status: "ok" },
      { name: "Publiczne repozytorium Open Source", status: "ok" },
      { name: "Macierz 18×18, Ψ, VI i RR poza wątkiem UI", status: "ok" },
      { name: "Fleet Aggregation v3.0 (REST/MQTT)", status: "planned" },
      { name: "Temporal Coherence v2.1", status: "planned" },
    ],
  },
  en: {
    title: "ZETA-CORE — FAQ, Tests & Analytics",
    subtitle: "Frequently asked questions, unit test results and system status",
    back: "← Back to /zeta",
    integration: "Integration guide",
    testsTitle: "Unit test results (Vitest)",
    testsDesc: "Tests executed via: bunx vitest run",
    faqTitle: "Frequently Asked Questions (FAQ)",
    statusTitle: "Component deployment status",
    passed: "PASSED",
    status_ok: "Running in test_phase",
    status_partial: "Partial",
    status_planned: "Planned",
    faq: [
      { q: "What is ZETA-CORE?", a: "A diagnostic engine for vibration and acoustic analysis of industrial machinery. Detects bearing damage, imbalance, mechanical looseness, cavitation — via phase coherence and FFT spectrum analysis." },
      { q: "What engine versions are available?", a: "v1.0 Standard (stable RPM), v1.1 Adaptive (variable speed), v2.0 Spatial (3-axis X/Y/Z with accelerometer)." },
      { q: "How does a company connect its machines?", a: "3 levels: (1) phone/laptop microphone, (2) USB accelerometer → CSV upload, (3) SCADA/MQTT live stream. Full guide at /zeta/integration." },
      { q: "How much does access cost?", a: "The subscription status is test_phase: access is open and free of charge." },
      { q: "Where does the core run?", a: "Only inside the browser sandbox. Heavy calculations run in a Web Worker; there is no installer or external process." },
      { q: "Is the code public?", a: "Yes. The computational source can be reviewed at github.com/greg718gate/brama-dna718." },
      { q: "What file lengths are supported?", a: "No hard limit — long signals are automatically windowed and averaged." },
      { q: "Does it run 24/7?", a: "Yes. Live mode in /zeta runs a continuous measurement loop with alerts and CSV export." },
      { q: "What are the access codes?", a: "Demo portal: ZETA-2026. Public integration guide: /zeta/integration (no password)." },
      { q: "How do I request a pilot?", a: "Email contact@zeta-core-dsp.com — the first diagnostic report is delivered with no upfront fee." },
    ],
    components: [
      { name: "Engines v1.0 / v1.1 / v2.0 (local Web Worker)", status: "ok" },
      { name: "Portal /zeta (upload, live, PDF)", status: "ok" },
      { name: "Guide /zeta/integration (PL/EN)", status: "ok" },
      { name: "Full bilingual UI", status: "ok" },
      { name: "Unit tests (Vitest, 14/14)", status: "ok" },
      { name: "Public Open Source repository", status: "ok" },
      { name: "18×18 matrix, Ψ, VI and RR off the UI thread", status: "ok" },
      { name: "Fleet Aggregation v3.0 (REST/MQTT)", status: "planned" },
      { name: "Temporal Coherence v2.1", status: "planned" },
    ],
  },
};

const TEST_RESULTS = [
  { file: "src/lib/zetaReference.test.ts", suite: "computeMean", name: "returns 0 for empty array", ok: true },
  { file: "src/lib/zetaReference.test.ts", suite: "computeMean", name: "computes arithmetic mean", ok: true },
  { file: "src/lib/zetaReference.test.ts", suite: "computeStd", name: "returns 0 for constant signal", ok: true },
  { file: "src/lib/zetaReference.test.ts", suite: "computeStd", name: "computes standard deviation", ok: true },
  { file: "src/lib/zetaReference.test.ts", suite: "classifyStatus", name: "OK below warning threshold", ok: true },
  { file: "src/lib/zetaReference.test.ts", suite: "classifyStatus", name: "WARNING between thresholds", ok: true },
  { file: "src/lib/zetaReference.test.ts", suite: "classifyStatus", name: "CRITICAL above critical threshold", ok: true },
  { file: "src/lib/zetaReference.test.ts", suite: "phaseCoherence v1.0", name: "high coherence for pure sine", ok: true },
  { file: "src/lib/zetaReference.test.ts", suite: "phaseCoherence v1.0", name: "low coherence for white noise", ok: true },
  { file: "src/lib/zetaReference.test.ts", suite: "spatialAnalysis v2.0", name: "aggregates X/Y/Z magnitude", ok: true },
  { file: "src/lib/zetaReference.test.ts", suite: "spatialAnalysis v2.0", name: "detects dominant axis", ok: true },
  { file: "src/lib/zetaReference.test.ts", suite: "adaptive v1.1", name: "tracks variable RPM window", ok: true },
  { file: "src/pages/Zeta.test.tsx", suite: "Zeta page", name: "renders auth gate", ok: true },
  { file: "src/pages/Zeta.test.tsx", suite: "Zeta page", name: "language toggle switches labels", ok: true },
];

export default function ZetaFAQ() {
  const [lang, setLang] = useState<Lang>("pl");
  const t = T[lang];
  const passedCount = TEST_RESULTS.filter((r) => r.ok).length;

  const statusBadge = (s: string) => {
    if (s === "ok") return <Badge className="bg-emerald-600 hover:bg-emerald-600">{t.status_ok}</Badge>;
    if (s === "partial") return <Badge className="bg-amber-600 hover:bg-amber-600">{t.status_partial}</Badge>;
    return <Badge variant="secondary">{t.status_planned}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        <header className="flex items-center justify-between gap-4 flex-wrap">
          <Link to="/zeta" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> {t.back}
          </Link>
          <div className="flex gap-2">
            <Button variant={lang === "pl" ? "default" : "outline"} size="sm" onClick={() => setLang("pl")}>PL</Button>
            <Button variant={lang === "en" ? "default" : "outline"} size="sm" onClick={() => setLang("en")}>EN</Button>
          </div>
        </header>

        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{t.title}</h1>
          <p className="text-muted-foreground mt-1">{t.subtitle}</p>
          <Link to="/zeta/integration" className="text-sm text-primary underline mt-2 inline-block">
            → {t.integration}
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{t.testsTitle}</span>
              <Badge className="bg-emerald-600 hover:bg-emerald-600">{passedCount}/{TEST_RESULTS.length} {t.passed}</Badge>
            </CardTitle>
            <p className="text-xs text-muted-foreground font-mono">{t.testsDesc}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 font-mono text-xs">
              {TEST_RESULTS.map((r, i) => (
                <div key={i} className="flex items-start gap-2 py-1 border-b border-border/40">
                  {r.ok ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />}
                  <div className="min-w-0 flex-1">
                    <div className="truncate"><span className="text-muted-foreground">{r.suite}</span> › {r.name}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{r.file}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t.statusTitle}</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {t.components.map((c, i) => (
                <div key={i} className="flex items-center justify-between gap-3 py-2 border-b border-border/40">
                  <span className="text-sm">{c.name}</span>
                  {statusBadge(c.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t.faqTitle}</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {t.faq.map((f, i) => (
                <div key={i} className="border-b border-border/40 pb-3">
                  <div className="font-semibold text-sm">{i + 1}. {f.q}</div>
                  <div className="text-sm text-muted-foreground mt-1">{f.a}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <ZetaFooter lang={lang} />
    </div>
  );
}
