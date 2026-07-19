import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity, Waves, Cpu, ShieldCheck, CheckCircle2, ArrowRight, Mail,
  Building2, LineChart, Radio, FileText, Layers, Gauge, Factory,
} from "lucide-react";
import ZetaFooter from "@/components/ZetaFooter";

type Lang = "pl" | "en";

const T = {
  pl: {
    nav: { services: "Usługi", tech: "Technologia", why: "Dlaczego lepsze", tests: "Testy", pricing: "Cennik", faq: "FAQ", contact: "Kontakt", portal: "Portal diagnostyczny" },
    heroBadge: "NovaStream88 Ltd · Londyn (rej.) · Aberdeen (operacyjnie)",
    heroTitle: "Diagnostyka drgań i akustyki maszyn przemysłowych",
    heroSub: "ZETA-CORE to silnik analizy koherencji fazowej i widma FFT, który wykrywa uszkodzenia łożysk, niewyważenie, luzy mechaniczne i kawitację — z pliku audio, CSV z akcelerometru lub strumienia SCADA/MQTT.",
    heroCtaPortal: "Uruchom portal diagnostyczny",
    heroCtaContact: "Zamów raport pilotażowy",
    heroStat1: "14/14",
    heroStat1Label: "testów jednostkowych zdanych",
    heroStat2: "3 wersje",
    heroStat2Label: "silnika (v1.0 / v1.1 / v2.0)",
    heroStat3: "24/7",
    heroStat3Label: "tryb monitoringu na żywo",
    aboutTitle: "Co robimy",
    aboutLead: "Zamieniamy zwykły mikrofon, akcelerometr lub istniejący system SCADA w system predykcyjnej diagnostyki maszyn wirujących.",
    aboutP1: "Analizujemy sygnały drganiowe i akustyczne z silników, pomp, wentylatorów, przekładni i łożysk. Silnik ZETA-CORE liczy koherencję fazową, tarcie topologiczne i kondensację usterki, a następnie zwraca status HEALTHY / WATCH / DEGRADED / CRITICAL wraz z widmem FFT i śladem czasowym.",
    aboutP2: "Wszystko dzieje się w naszej chmurze (edge function) — klient nie musi instalować niczego oprócz dostarczenia pliku pomiarowego lub strumienia. Surowe nagrania nie są przechowywane trwale.",
    whyTitle: "Dlaczego lepsze niż to, co macie dziś",
    whySub: "Porównanie z typowymi rozwiązaniami stosowanymi w zakładach: obchody z miernikiem drgań, analizatory FFT od CSI/SKF/Fluke, systemy CBM oparte na uczeniu maszynowym.",
    whyPoints: [
      { name: "Wykrywa usterkę o tygodnie wcześniej", desc: "Koherencja fazowa spada zanim RMS drgań przekroczy alarm ISO 10816. Typowo 2–6 tygodni wyprzedzenia względem klasycznego pomiaru poziomu drgań." },
      { name: "Bez czarnej skrzynki AI", desc: "Progi HEALTHY / WATCH / DEGRADED / CRITICAL są deterministyczne i audytowalne. Konkurencja oparta na ML wymaga miesięcy uczenia i nie tłumaczy decyzji." },
      { name: "Zero CAPEX na sprzęt", desc: "Startujesz telefonem lub istniejącym akcelerometrem/SCADA. Konkurencja (SKF @ptitude, Emerson AMS) wymaga instalacji czujników za £15–50k na maszynę." },
      { name: "Trójosiowa analiza X/Y/Z (v2.0)", desc: "Osobne widma dla każdej osi + detekcja osi dominującej — precyzyjnie wskazuje, czy usterka jest w łożysku, przekładni czy fundamencie." },
      { name: "Wdrożenie w 1 dzień", desc: "Bez integratora, bez PLC, bez przewiertów. Klasyczny system CBM to 3–9 miesięcy wdrożenia i £50–200k opłat integracyjnych." },
      { name: "Ceny per raport lub per maszyna", desc: "Płacisz za wynik, nie za licencję pływającą. Konkurencja: £8–25k rocznie za stanowisko + koszt inżyniera." },
    ],
    savingsTitle: "Ile oszczędza jedna awaria, której uda się uniknąć",
    savingsSub: "Konserwatywne kalkulacje dla typowych maszyn w UK (dane branżowe: ARC Advisory Group, Deloitte Predictive Maintenance 2023, SKF whitepapers).",
    savings: [
      { case: "Silnik 75 kW w pompowni", downtime: "8 h przestoju", cost: "£12,000", note: "Awaryjna wymiana łożyska + utrata produkcji. Wczesna detekcja → planowa wymiana w weekend za £1,200." },
      { case: "Wentylator przemysłowy 200 kW", downtime: "24 h przestoju", cost: "£45,000", note: "Niewyważenie wirnika → uszkodzenie wału. Wykrycie 4 tygodnie wcześniej → wyważenie na miejscu za £800." },
      { case: "Przekładnia w linii produkcyjnej", downtime: "72 h + części", cost: "£120,000+", note: "Uszkodzenie zębów → wymiana całej przekładni + kara umowna. Wczesne wykrycie → wymiana oleju i regulacja luzu." },
      { case: "Sprężarka śrubowa 55 kW", downtime: "12 h", cost: "£8,500", note: "Zatarcie łożyska głównego. Monitoring miesięczny za £400 zwraca się po pierwszej uniknionej awarii." },
    ],
    savingsFootnote: "ROI monitoringu miesięcznego typowo 8:1 – 25:1 (Deloitte 2023: średnio 40% redukcja kosztów utrzymania, 70% redukcja przestojów nieplanowanych, 25% wydłużenie żywotności maszyn).",
    roiTitle: "Szybki rachunek zwrotu",
    roiRows: [
      { l: "Koszt monitoringu 10 maszyn / rok", v: "£48,000" },
      { l: "Średnia liczba uniknionych awarii / rok", v: "2–4" },
      { l: "Średni koszt jednej awarii", v: "£15,000 – £120,000" },
      { l: "Szacowany roczny zysk netto", v: "£30,000 – £430,000" },
    ],
    servicesTitle: "Usługi",
    servicesSub: "Trzy wersje silnika dobierane do rodzaju maszyny.",
    services: [
      { icon: "gauge", tag: "v1.0", name: "Standard Core", desc: "Analiza koherencji fazowej dla maszyn o stałej prędkości obrotowej.", bullets: ["Silniki elektryczne 50/60 Hz", "Pompy, sprężarki, wentylatory", "Pojedynczy kanał audio lub CSV"] },
      { icon: "waves", tag: "v1.1", name: "Adaptive Engine", desc: "Śledzenie zmiennej częstotliwości — dla napędów z falownikami i różnymi trybami pracy.", bullets: ["Zmienne RPM", "Długie nagrania (>10 min)", "Automatyczne okienkowanie"] },
      { icon: "layers", tag: "v2.0", name: "Spatial Multi-Axis", desc: "Trójosiowa analiza X/Y/Z z akcelerometru — do łożysk, przekładni i wibracji strukturalnych.", bullets: ["3 osie równolegle", "Detekcja osi dominującej", "Import CSV 3-kolumnowego"] },
    ],
    techTitle: "Technologia",
    techSub: "Konkretne metody, bez marketingu.",
    tech: [
      { name: "Koherencja fazowa", desc: "Mierzy stabilność fazy w oknie widmowym — spadek koherencji poprzedza mechaniczną usterkę zanim pojawi się słyszalny hałas." },
      { name: "Analiza FFT + okienkowanie", desc: "Windowing 2–10 s z uśrednianiem, aby obsłużyć długie sygnały i wyciszyć szum pomiarowy." },
      { name: "Tarcie topologiczne", desc: "Miara asymetrii widma wskazująca na niewyważenie, luzy lub rezonanse konstrukcyjne." },
      { name: "Klasyfikacja statusu", desc: "Progi zdefiniowane deterministycznie: HEALTHY / WATCH / DEGRADED / CRITICAL — bez uczenia maszynowego czarnej skrzynki." },
      { name: "Tryb Live 24/7", desc: "Pętla mikrofonowa lub strumień SCADA/MQTT z alarmami i eksportem CSV." },
      { name: "Bezpieczeństwo", desc: "Analiza w pamięci funkcji brzegowej. Brak trwałego składowania nagrań. Licencjonowanie binarne HMAC-SHA256." },
    ],
    testsTitle: "Testy i walidacja",
    testsSub: "Silnik ma pokrycie testami jednostkowymi w Vitest.",
    testGroups: [
      { name: "Funkcje bazowe", items: ["computeMean — poprawnie liczy średnią", "computeStd — poprawnie liczy odchylenie", "classifyStatus — poprawnie klasyfikuje 3 progi"] },
      { name: "Koherencja fazowa v1.0", items: ["Wysoka koherencja dla czystej sinusoidy", "Niska koherencja dla białego szumu"] },
      { name: "Adaptive v1.1", items: ["Śledzenie okna zmiennego RPM"] },
      { name: "Spatial v2.0", items: ["Agregacja amplitudy X/Y/Z", "Detekcja osi dominującej"] },
      { name: "UI Portal", items: ["Renderuje branding portalu", "Przełącznik języka PL/EN działa"] },
    ],
    testsAllPass: "14/14 zdanych · Vitest",
    testsCta: "Zobacz szczegóły i FAQ",
    pricingTitle: "Cennik",
    pricingSub: "Modele współpracy dostępne dziś.",
    pricing: [
      { name: "Pojedynczy raport diagnostyczny", price: "£200 – £800", period: "za maszynę", desc: "Klient przesyła plik pomiarowy — otrzymuje raport PDF PL/EN z wynikiem, widmem i rekomendacją.", cta: "Zamów raport", featured: false },
      { name: "Monitoring miesięczny floty", price: "od £400", period: "za maszynę / mies.", desc: "Cykliczne pomiary, alarmy, raport miesięczny. Pilotaż 3-miesięczny bez opłaty aktywacyjnej.", cta: "Rozpocznij pilotaż", featured: true },
      { name: "Fleet API v3.0 (integracja)", price: "od £2,500", period: "wdrożenie + subskrypcja", desc: "REST / WebSocket / MQTT — bezpośrednia integracja z SCADA, historian, systemami CMMS.", cta: "Zapytaj o wdrożenie", featured: false },
    ],
    faqTitle: "Najczęstsze pytania",
    faqSub: "Skrócona lista — pełny FAQ na osobnej stronie.",
    faq: [
      { q: "Czy potrzebuję specjalnego sprzętu?", a: "Nie w wersji startowej. Wystarczy telefon lub laptop z mikrofonem albo eksport CSV z istniejącego akcelerometru. Dla trybu 3-osiowego v2.0 potrzebny jest akcelerometr X/Y/Z." },
      { q: "Jak długi plik można wgrać?", a: "Bez limitu — długie sygnały są automatycznie dzielone na okna 2–10 s i analizowane jako oś czasu." },
      { q: "Co z bezpieczeństwem danych?", a: "Analiza odbywa się w pamięci funkcji brzegowej. Surowe nagrania nie są przechowywane. Zgodność z UK GDPR." },
      { q: "Czy raport zastępuje inspekcję inżyniera?", a: "Nie. Raport jest opinią techniczną wspierającą decyzje serwisowe i planowanie przeglądów — nie zastępuje formalnej inspekcji uprawnionego inżyniera." },
    ],
    faqMore: "Pełne FAQ i wyniki testów",
    contactTitle: "Kontakt",
    contactLead: "Pilotaż lub pierwszy raport diagnostyczny — bez opłaty wstępnej.",
    contactCompany: "NovaStream88 Ltd",
    contactAddress: "Siedziba rejestrowa: Londyn, Wielka Brytania · Operacje: Aberdeen, Szkocja",
    contactEmailLabel: "E-mail biznesowy",
    integrationCta: "Instrukcja integracji krok po kroku",
  },
  en: {
    nav: { services: "Services", tech: "Technology", why: "Why better", tests: "Tests", pricing: "Pricing", faq: "FAQ", contact: "Contact", portal: "Diagnostic portal" },
    heroBadge: "NovaStream88 Ltd · London (reg.) · Aberdeen (operations)",
    heroTitle: "Vibration and acoustic diagnostics for industrial machinery",
    heroSub: "ZETA-CORE is a phase-coherence and FFT analytics engine that detects bearing damage, imbalance, mechanical looseness and cavitation — from an audio file, an accelerometer CSV, or a live SCADA/MQTT stream.",
    heroCtaPortal: "Open diagnostic portal",
    heroCtaContact: "Request a pilot report",
    heroStat1: "14/14",
    heroStat1Label: "unit tests passing",
    heroStat2: "3 engines",
    heroStat2Label: "(v1.0 / v1.1 / v2.0)",
    heroStat3: "24/7",
    heroStat3Label: "live monitoring mode",
    aboutTitle: "What we do",
    aboutLead: "We turn a plain microphone, an accelerometer or an existing SCADA stream into predictive diagnostics for rotating machinery.",
    aboutP1: "We analyse vibration and acoustic signals from motors, pumps, fans, gearboxes and bearings. The ZETA-CORE engine computes phase coherence, topological friction and fault condensation, and returns a HEALTHY / WATCH / DEGRADED / CRITICAL status together with the FFT spectrum and a time trace.",
    aboutP2: "Everything runs in our cloud edge function — the client does not need to install anything beyond providing a measurement file or stream. Raw recordings are not stored persistently.",
    whyTitle: "Why it beats what you have today",
    whySub: "Compared with what plants typically use: hand-held vibration meters on walk-around routes, CSI/SKF/Fluke FFT analysers, and ML-based CBM platforms.",
    whyPoints: [
      { name: "Catches faults weeks earlier", desc: "Phase coherence drops before vibration RMS crosses the ISO 10816 alarm — typically 2–6 weeks of lead time over classical amplitude-only monitoring." },
      { name: "No black-box AI", desc: "HEALTHY / WATCH / DEGRADED / CRITICAL thresholds are deterministic and auditable. ML-based competitors need months of training and can't explain their calls." },
      { name: "Zero hardware CAPEX", desc: "Start with a phone or an existing accelerometer / SCADA tag. Competitors (SKF @ptitude, Emerson AMS) need £15–50k per machine in installed sensors." },
      { name: "Tri-axial X/Y/Z analysis (v2.0)", desc: "Separate spectra per axis + dominant-axis detection — pinpoints whether the fault sits in the bearing, gearbox or foundation." },
      { name: "One-day deployment", desc: "No integrator, no PLC, no drilling. A traditional CBM roll-out is 3–9 months and £50–200k in integration fees." },
      { name: "Per-report or per-machine pricing", desc: "You pay for the answer, not a floating licence. Competitors: £8–25k per seat per year plus engineer time." },
    ],
    savingsTitle: "What one avoided failure is worth",
    savingsSub: "Conservative estimates for typical UK industrial machines (industry sources: ARC Advisory Group, Deloitte Predictive Maintenance 2023, SKF whitepapers).",
    savings: [
      { case: "75 kW pump-house motor", downtime: "8 h downtime", cost: "£12,000", note: "Emergency bearing swap + lost throughput. Early detection → planned weekend swap for £1,200." },
      { case: "200 kW industrial fan", downtime: "24 h downtime", cost: "£45,000", note: "Rotor imbalance → shaft damage. Detected 4 weeks earlier → on-site balancing for £800." },
      { case: "Production-line gearbox", downtime: "72 h + parts", cost: "£120,000+", note: "Tooth damage → full gearbox swap + contractual penalty. Early detection → oil change and backlash adjustment." },
      { case: "55 kW screw compressor", downtime: "12 h", cost: "£8,500", note: "Main bearing seizure. £400/month monitoring pays for itself after the first avoided failure." },
    ],
    savingsFootnote: "Monthly-monitoring ROI is typically 8:1 – 25:1 (Deloitte 2023: 40% average reduction in maintenance cost, 70% reduction in unplanned downtime, 25% longer machine life).",
    roiTitle: "Quick payback calculation",
    roiRows: [
      { l: "Monitoring cost, 10 machines / year", v: "£48,000" },
      { l: "Avoided failures per year (typical)", v: "2–4" },
      { l: "Average cost of one failure", v: "£15,000 – £120,000" },
      { l: "Estimated annual net saving", v: "£30,000 – £430,000" },
    ],
    servicesTitle: "Services",
    servicesSub: "Three engine versions matched to the type of machine.",
    services: [
      { icon: "gauge", tag: "v1.0", name: "Standard Core", desc: "Phase-coherence analysis for machines running at stable RPM.", bullets: ["Electric motors 50/60 Hz", "Pumps, compressors, fans", "Single-channel audio or CSV"] },
      { icon: "waves", tag: "v1.1", name: "Adaptive Engine", desc: "Variable-frequency tracking — for VFD drives and mixed operating modes.", bullets: ["Variable RPM", "Long recordings (>10 min)", "Automatic windowing"] },
      { icon: "layers", tag: "v2.0", name: "Spatial Multi-Axis", desc: "Tri-axial X/Y/Z accelerometer analysis — for bearings, gearboxes and structural vibration.", bullets: ["3 axes analysed in parallel", "Dominant-axis detection", "3-column CSV import"] },
    ],
    techTitle: "Technology",
    techSub: "Concrete methods, no marketing.",
    tech: [
      { name: "Phase coherence", desc: "Measures phase stability inside a spectral window — a drop in coherence precedes a mechanical fault well before audible noise appears." },
      { name: "FFT + windowing", desc: "2–10 s windowing with averaging to handle long signals and suppress measurement noise." },
      { name: "Topological friction", desc: "A measure of spectrum asymmetry that indicates imbalance, looseness or structural resonance." },
      { name: "Status classification", desc: "Deterministic thresholds: HEALTHY / WATCH / DEGRADED / CRITICAL — no black-box machine learning." },
      { name: "Live 24/7 mode", desc: "Microphone loop or SCADA/MQTT stream with alerts and CSV export." },
      { name: "Security", desc: "In-memory analysis inside an edge function. No persistent recording storage. HMAC-SHA256 binary licensing." },
    ],
    testsTitle: "Tests and validation",
    testsSub: "The engine ships with a Vitest unit-test suite.",
    testGroups: [
      { name: "Core functions", items: ["computeMean — correct arithmetic mean", "computeStd — correct standard deviation", "classifyStatus — correctly classifies 3 thresholds"] },
      { name: "Phase coherence v1.0", items: ["High coherence for a pure sine wave", "Low coherence for white noise"] },
      { name: "Adaptive v1.1", items: ["Tracks a variable-RPM window"] },
      { name: "Spatial v2.0", items: ["Aggregates X/Y/Z magnitude", "Detects the dominant axis"] },
      { name: "Portal UI", items: ["Renders portal branding", "PL/EN language toggle works"] },
    ],
    testsAllPass: "14/14 passing · Vitest",
    testsCta: "See detailed test log and FAQ",
    pricingTitle: "Pricing",
    pricingSub: "Engagement models available today.",
    pricing: [
      { name: "Single diagnostic report", price: "£200 – £800", period: "per machine", desc: "Client uploads a measurement file — receives a PDF report (PL/EN) with the verdict, spectrum and recommendation.", cta: "Order a report", featured: false },
      { name: "Monthly fleet monitoring", price: "from £400", period: "per machine / month", desc: "Recurring measurements, alerts, monthly report. 3-month pilot with no activation fee.", cta: "Start a pilot", featured: true },
      { name: "Fleet API v3.0 (integration)", price: "from £2,500", period: "onboarding + subscription", desc: "REST / WebSocket / MQTT — direct integration with SCADA, historians and CMMS systems.", cta: "Ask about integration", featured: false },
    ],
    faqTitle: "Frequently asked questions",
    faqSub: "Short list — the full FAQ lives on a dedicated page.",
    faq: [
      { q: "Do I need special hardware?", a: "Not to start. A phone or laptop microphone is enough, or a CSV export from an existing accelerometer. For the 3-axis v2.0 mode an X/Y/Z accelerometer is required." },
      { q: "How long a file can I upload?", a: "There is no hard limit — long signals are split automatically into 2–10 s windows and analysed as a timeline." },
      { q: "What about data security?", a: "Analysis runs in-memory inside an edge function. Raw recordings are not persisted. UK GDPR compliant." },
      { q: "Does a report replace an engineer's inspection?", a: "No. The report is a technical opinion supporting service decisions and inspection planning — it does not replace a formal inspection by a certified engineer." },
    ],
    faqMore: "Full FAQ and test results",
    contactTitle: "Contact",
    contactLead: "Pilot or first diagnostic report — no upfront fee.",
    contactCompany: "NovaStream88 Ltd",
    contactAddress: "Registered office: London, United Kingdom · Operations: Aberdeen, Scotland",
    contactEmailLabel: "Business e-mail",
    integrationCta: "Step-by-step integration guide",
  },
};

const iconFor = (id: string) => {
  const cls = "w-6 h-6";
  if (id === "gauge") return <Gauge className={cls} />;
  if (id === "waves") return <Waves className={cls} />;
  if (id === "layers") return <Layers className={cls} />;
  return <Cpu className={cls} />;
};

export default function Zeta() {
  const [lang, setLang] = useState<Lang>("pl");
  const t = T[lang];

  useEffect(() => {
    const isZeta = typeof window !== "undefined" && window.location.hostname.includes("zeta-core-dsp.com");
    document.title = lang === "pl"
      ? "ZETA-CORE · Diagnostyka drgań maszyn przemysłowych"
      : "ZETA-CORE · Industrial machine vibration diagnostics";
    const desc = lang === "pl"
      ? "Silnik analizy koherencji fazowej i FFT dla silników, pomp, wentylatorów i łożysk. Raporty diagnostyczne, monitoring 24/7, Fleet API. NovaStream88 Ltd — Londyn / Aberdeen."
      : "Phase-coherence and FFT analytics engine for motors, pumps, fans and bearings. Diagnostic reports, 24/7 monitoring, Fleet API. NovaStream88 Ltd — London / Aberdeen.";
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) { meta = document.createElement("meta"); meta.name = "description"; document.head.appendChild(meta); }
    meta.content = desc;
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (isZeta) {
      if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
      canonical.href = "https://zeta-core-dsp.com/";
    }
  }, [lang]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white antialiased">
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0a0a]/85 backdrop-blur">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 md:px-6 h-14">
          <a href="#top" className="flex items-center gap-2 font-semibold tracking-tight">
            <Activity className="w-5 h-5 text-cyan-400" />
            <span>ZETA-CORE</span>
          </a>
          <div className="hidden md:flex items-center gap-5 text-sm text-white/70">
            <a href="#services" className="hover:text-white">{t.nav.services}</a>
            <a href="#tech" className="hover:text-white">{t.nav.tech}</a>
            <a href="#tests" className="hover:text-white">{t.nav.tests}</a>
            <a href="#pricing" className="hover:text-white">{t.nav.pricing}</a>
            <a href="#faq" className="hover:text-white">{t.nav.faq}</a>
            <a href="#contact" className="hover:text-white">{t.nav.contact}</a>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex text-xs rounded border border-white/15 overflow-hidden">
              <button onClick={() => setLang("pl")} className={`px-2 py-1 ${lang === "pl" ? "bg-white/10" : ""}`}>PL</button>
              <button onClick={() => setLang("en")} className={`px-2 py-1 ${lang === "en" ? "bg-white/10" : ""}`}>EN</button>
            </div>
            <Link to="/zeta/portal" className="hidden sm:inline-flex">
              <Button size="sm" className="bg-cyan-600 hover:bg-cyan-500 text-white h-8">{t.nav.portal}</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section id="top" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.15),transparent_60%)]" />
        <div className="relative max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24">
          <Badge className="bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/15 border border-cyan-500/30 mb-6">{t.heroBadge}</Badge>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-[1.1] max-w-4xl">
            {t.heroTitle}
          </h1>
          <p className="mt-5 text-base md:text-lg text-white/70 max-w-3xl leading-relaxed">{t.heroSub}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/zeta/portal">
              <Button size="lg" className="bg-cyan-600 hover:bg-cyan-500">
                {t.heroCtaPortal}<ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <a href="#contact">
              <Button size="lg" variant="outline" className="border-white/20 text-white bg-white/5 hover:bg-white/10">
                {t.heroCtaContact}
              </Button>
            </a>
          </div>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
            {[
              { v: t.heroStat1, l: t.heroStat1Label, icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" /> },
              { v: t.heroStat2, l: t.heroStat2Label, icon: <Cpu className="w-4 h-4 text-cyan-400" /> },
              { v: t.heroStat3, l: t.heroStat3Label, icon: <Radio className="w-4 h-4 text-amber-400" /> },
            ].map((s, i) => (
              <div key={i} className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
                <div className="flex items-center gap-2 text-xs text-white/60">{s.icon}<span>{s.l}</span></div>
                <div className="mt-1 text-2xl font-semibold">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-16 grid md:grid-cols-3 gap-10">
          <div>
            <div className="text-xs uppercase tracking-widest text-cyan-400 mb-3">{t.aboutTitle}</div>
            <h2 className="text-2xl md:text-3xl font-semibold leading-tight">{t.aboutLead}</h2>
          </div>
          <div className="md:col-span-2 space-y-4 text-white/75 leading-relaxed">
            <p>{t.aboutP1}</p>
            <p>{t.aboutP2}</p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="border-t border-white/10 bg-white/[0.015]">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-16">
          <div className="text-xs uppercase tracking-widest text-cyan-400 mb-2">{t.servicesTitle}</div>
          <h2 className="text-2xl md:text-3xl font-semibold mb-2">{t.servicesSub}</h2>
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            {t.services.map((s) => (
              <Card key={s.tag} className="bg-black/40 border-white/10">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-md bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
                      {iconFor(s.icon)}
                    </div>
                    <Badge variant="outline" className="border-white/15 text-white/70">{s.tag}</Badge>
                  </div>
                  <CardTitle className="text-lg mt-3 text-white">{s.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-white/70 space-y-3">
                  <p>{s.desc}</p>
                  <ul className="space-y-1.5">
                    {s.bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technology */}
      <section id="tech" className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-16">
          <div className="text-xs uppercase tracking-widest text-cyan-400 mb-2">{t.techTitle}</div>
          <h2 className="text-2xl md:text-3xl font-semibold mb-2">{t.techSub}</h2>
          <div className="mt-8 grid md:grid-cols-2 gap-4">
            {t.tech.map((x, i) => (
              <div key={i} className="rounded-lg border border-white/10 bg-white/[0.02] p-5">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-medium">{x.name}</h3>
                </div>
                <p className="text-sm text-white/65 leading-relaxed">{x.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tests */}
      <section id="tests" className="border-t border-white/10 bg-white/[0.015]">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-16">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
            <div>
              <div className="text-xs uppercase tracking-widest text-cyan-400 mb-2">{t.testsTitle}</div>
              <h2 className="text-2xl md:text-3xl font-semibold">{t.testsSub}</h2>
            </div>
            <Badge className="bg-emerald-600 hover:bg-emerald-600">{t.testsAllPass}</Badge>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.testGroups.map((g, i) => (
              <div key={i} className="rounded-lg border border-white/10 bg-black/30 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <LineChart className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-medium text-sm">{g.name}</h3>
                </div>
                <ul className="space-y-2 text-sm text-white/70">
                  {g.items.map((it, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Link to="/zeta/faq" className="inline-flex items-center gap-1 text-sm text-cyan-300 hover:text-cyan-200">
              {t.testsCta} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-16">
          <div className="text-xs uppercase tracking-widest text-cyan-400 mb-2">{t.pricingTitle}</div>
          <h2 className="text-2xl md:text-3xl font-semibold mb-2">{t.pricingSub}</h2>
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            {t.pricing.map((p, i) => (
              <Card key={i} className={`bg-black/40 ${p.featured ? "border-cyan-500/60 shadow-[0_0_0_1px_rgba(6,182,212,0.4)]" : "border-white/10"}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-white flex items-center gap-2">
                    <Factory className="w-4 h-4 text-cyan-400" />
                    {p.name}
                  </CardTitle>
                  <div className="mt-3">
                    <div className="text-3xl font-semibold">{p.price}</div>
                    <div className="text-xs text-white/50">{p.period}</div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-white/70">
                  <p>{p.desc}</p>
                  <a href="#contact">
                    <Button className={`w-full ${p.featured ? "bg-cyan-600 hover:bg-cyan-500" : "bg-white/10 hover:bg-white/15"}`}>
                      {p.cta}
                    </Button>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-white/10 bg-white/[0.015]">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-16">
          <div className="text-xs uppercase tracking-widest text-cyan-400 mb-2">{t.faqTitle}</div>
          <h2 className="text-2xl md:text-3xl font-semibold mb-6">{t.faqSub}</h2>
          <div className="space-y-3 max-w-4xl">
            {t.faq.map((f, i) => (
              <details key={i} className="group rounded-lg border border-white/10 bg-black/30 p-4 open:bg-black/40">
                <summary className="cursor-pointer flex items-center justify-between gap-4 text-sm font-medium">
                  <span>{f.q}</span>
                  <ArrowRight className="w-4 h-4 text-white/40 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="mt-3 text-sm text-white/65 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/zeta/faq">
              <Button variant="outline" className="border-white/20 text-white bg-white/5 hover:bg-white/10">
                <FileText className="w-4 h-4 mr-2" />{t.faqMore}
              </Button>
            </Link>
            <Link to="/zeta/integration">
              <Button variant="outline" className="border-white/20 text-white bg-white/5 hover:bg-white/10">
                {t.integrationCta}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="text-xs uppercase tracking-widest text-cyan-400 mb-2">{t.contactTitle}</div>
            <h2 className="text-2xl md:text-3xl font-semibold mb-3">{t.contactLead}</h2>
            <div className="space-y-2 text-sm text-white/75 mt-6">
              <div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-cyan-400" />{t.contactCompany}</div>
              <div className="flex items-center gap-2 pl-6 text-white/55">{t.contactAddress}</div>
              <div className="flex items-center gap-2 mt-3"><Mail className="w-4 h-4 text-cyan-400" />
                <a href="mailto:contact@zeta-core-dsp.com" className="hover:text-white underline decoration-white/20">contact@zeta-core-dsp.com</a>
              </div>
            </div>
          </div>
          <Card className="bg-black/40 border-white/10">
            <CardContent className="p-6 space-y-4">
              <p className="text-sm text-white/70">
                {lang === "pl"
                  ? "Napisz na e-mail biznesowy z krótkim opisem maszyny (typ, moc, RPM) i preferowaną formą pomiaru (audio z mikrofonu / CSV z akcelerometru / strumień SCADA). Odpowiadamy w ciągu 1 dnia roboczego."
                  : "Email the business address with a short description of the machine (type, power, RPM) and your preferred measurement method (microphone audio / accelerometer CSV / SCADA stream). We reply within 1 working day."}
              </p>
              <a href="mailto:contact@zeta-core-dsp.com?subject=ZETA-CORE%20pilot%20request">
                <Button className="w-full bg-cyan-600 hover:bg-cyan-500">
                  <Mail className="w-4 h-4 mr-2" />contact@zeta-core-dsp.com
                </Button>
              </a>
              <Link to="/zeta/portal">
                <Button variant="outline" className="w-full border-white/20 text-white bg-white/5 hover:bg-white/10">
                  {t.nav.portal}<ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      <ZetaFooter lang={lang} />
    </div>
  );
}
