import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowLeft, Smartphone, Cable, Network, Github, ShieldCheck, Mail } from "lucide-react";
import ZetaFooter from "@/components/ZetaFooter";

type Lang = "pl" | "en";

const T = {
  pl: {
    back: "← Powrót do portalu",
    title: "Zeta-Core — Instrukcja integracji",
    subtitle: "Jak podłączyć system do maszyn w Twojej firmie. Krok po kroku.",
    l1Title: "POZIOM 1 — Telefon lub laptop",
    l1Cost: "Status: test_phase · Dostęp otwarty, bez opłat · Bez instalacji",
    l1Steps: [
      "Pracownik podchodzi do maszyny z telefonem (Android/iPhone) lub laptopem.",
      "Otwiera w przeglądarce: zeta-core-dsp.com/zeta",
      "Kod Open Source może sprawdzić przed rozpoczęciem analizy.",
      "Wybiera profil maszyny (np. „Silnik elektryczny 50 Hz\") i wersję silnika (v1.0 / v1.1 / v2.0).",
      "OPCJA A — Plik: nagrywa 10-30 sekund dźwięku maszyny → wgrywa → raport PDF w 10 sekund.",
      "OPCJA B — LIVE 24h: klika „LIVE Mikrofon\" → telefon leży przy maszynie i analizuje ciągle, alarmuje przy statusie CRITICAL.",
    ],
    l1Result: "Wynik: kolorowy status (🟢 sprawna / 🟡 obserwacja / 🟠 degradacja / 🔴 krytyczna) + wykres widmowy + PDF do pobrania.",
    l2Title: "POZIOM 2 — Czujnik USB + laptop",
    l2Cost: "Koszt: 50-300 £ jednorazowo · Czas: 15 minut · Dla kogo: dokładniejsze pomiary niż mikrofon",
    l2Steps: [
      "Klient kupuje akcelerometr USB (np. Digiducer 333D01, PCB 356A32).",
      "Mocuje magnesem lub śrubą do obudowy maszyny (najlepiej przy łożysku lub przekładni).",
      "Nagrywa pomiar do pliku CSV (kolumny: X, Y, Z) — darmowym softem producenta czujnika.",
      "Wgrywa CSV na zeta-core-dsp.com/zeta → wybiera silnik v2.0 Spatial → raport 3-osiowy PDF.",
    ],
    l2Result: "Wynik: analiza per oś (X, Y, Z) + globalne tarcie topologiczne + wykrywanie usterek łożysk i przekładni.",
    l3Title: "POZIOM 3 — Integracja SCADA / PLC (Fleet v3.0)",
    l3Cost: "Koszt: pilot 15-30 tys. £ · Czas: 4-8 tygodni wdrożenia · Dla kogo: duże zakłady, dziesiątki maszyn",
    l3Steps: [
      "Klient ma już czujniki wibracji podpięte do PLC lub SCADA (Siemens S7, Allen-Bradley, Beckhoff).",
      "Ich system wysyła strumień danych przez MQTT / OPC-UA / REST do naszej bramy Fleet Gateway.",
      "Brama zwraca status każdej maszyny w czasie rzeczywistym (REST + WebSocket).",
      "Statusy wyświetlają się w istniejącym dashboardzie klienta (Grafana, Power BI, Ignition).",
    ],
    l3Result: "Status: specyfikacja API jest transparentnym projektem testowym; aktywne obliczenia pozostają lokalne w przeglądarce.",
    hmacTitle: "Open Source i lokalny Web Worker",
    hmacIntro: "Aktywny silnik nie wymaga instalatora, pliku wykonywalnego ani licencji binarnej. Obliczenia działają w piaskownicy przeglądarki, poza głównym wątkiem UI.",
    hmacFlowTitle: "Przepływ w 4 krokach:",
    hmacFlow: [
      "1. Otwórz publiczne repozytorium i sprawdź kod obliczeniowy.",
      "2. Uruchom portal w nowoczesnej przeglądarce — bez pobierania dodatkowych plików.",
      "3. Dane sygnałowe są przekazywane lokalnie do typowanego Web Workera.",
      "4. Worker zwraca wyłącznie wynik mapowania do interfejsu.",
    ],
    hmacVerifyTitle: "Co można zweryfikować:",
    hmacVerify: [
      "Pełne wzory i stałe matematyczne w źródle TypeScript.",
      "Protokół wiadomości między interfejsem i Workerem.",
      "Testy regresyjne wartości VI, Ψ i macierzy 18×18.",
      "Brak zewnętrznego instalatora i natywnego procesu.",
      "Lokalne przetwarzanie buforów sygnałowych.",
    ],
    hmacCodes: "Stałe zachowane w rdzeniu:",
    hmacErrors: [
      "718.5701251542688 Hz — nośna modelu",
      "7.83 Hz — częstotliwość Schumanna w modelu",
      "18.6 Hz — modulacja lunarna modelu",
      "φ = 1.618033988749895 — Złota Proporcja",
    ],
    hmacSecret: "Kod: github.com/greg718gate/brama-dna718. Platforma działa w fazie testowej; wyniki są mapowaniem numerycznym i nie stanowią oceny medycznej ani klinicznej.",
    contactTitle: "Kontakt dla klientów",
    contactBody: "Pytania dotyczące otwartego kodu, fazy testowej i integracji:",
    contactEmail: "contact@zeta-core-dsp.com",
    contactRegion: "Region: Aberdeen, Szkocja, UK",
    pricingTitle: "Status dostępu",
    pricing: [
      "Portal przeglądarkowy — dostęp otwarty",
      "Rdzeń Web Worker — Open Source",
      "Subskrypcja — test_phase / bez opłat",
    ],
  },
  en: {
    back: "← Back to portal",
    title: "Zeta-Core — Integration Guide",
    subtitle: "How to connect the system to your company's machines. Step by step.",
    l1Title: "LEVEL 1 — Phone or laptop",
    l1Cost: "Status: test_phase · Open access, no payment · No installation",
    l1Steps: [
      "Technician walks up to the machine with a phone (Android/iPhone) or laptop.",
      "Opens in browser: zeta-core-dsp.com/zeta",
      "Reviews the Open Source implementation before starting analysis.",
      "Selects machine profile (e.g. \"Electric motor 50 Hz\") and engine version (v1.0 / v1.1 / v2.0).",
      "OPTION A — File: records 10-30 seconds of machine sound → uploads → PDF report in 10 seconds.",
      "OPTION B — LIVE 24h: taps \"LIVE Microphone\" → phone sits next to the machine, analyses continuously, alerts on CRITICAL status.",
    ],
    l1Result: "Result: colour status (🟢 healthy / 🟡 watch / 🟠 degraded / 🔴 critical) + spectrum chart + downloadable PDF.",
    l2Title: "LEVEL 2 — USB sensor + laptop",
    l2Cost: "Cost: £50-300 one-off · Time: 15 minutes · For: more accurate readings than a microphone",
    l2Steps: [
      "Client buys a USB accelerometer (e.g. Digiducer 333D01, PCB 356A32).",
      "Attaches it with a magnet or bolt to the machine housing (best near a bearing or gearbox).",
      "Records a measurement to CSV (columns: X, Y, Z) using the sensor vendor's free software.",
      "Uploads the CSV to zeta-core-dsp.com/zeta → selects engine v2.0 Spatial → tri-axial PDF report.",
    ],
    l2Result: "Result: per-axis analysis (X, Y, Z) + global topological friction + bearing/gearbox fault detection.",
    l3Title: "LEVEL 3 — SCADA / PLC integration (Fleet v3.0)",
    l3Cost: "Cost: pilot £15-30k · Time: 4-8 weeks deployment · For: large plants, dozens of machines",
    l3Steps: [
      "Client already has vibration sensors wired to a PLC or SCADA (Siemens S7, Allen-Bradley, Beckhoff).",
      "Their system streams data via MQTT / OPC-UA / REST to our Fleet Gateway.",
      "The gateway returns each machine's status in real time (REST + WebSocket).",
      "Statuses appear on the client's existing dashboard (Grafana, Power BI, Ignition).",
    ],
    l3Result: "Status: the API specification is a transparent test-phase design; active calculations remain local to the browser.",
    hmacTitle: "Open Source and local Web Worker",
    hmacIntro: "The active engine needs no installer, executable or binary licence. Calculations run in the browser sandbox, away from the main UI thread.",
    hmacFlowTitle: "The 4-step flow:",
    hmacFlow: [
      "1. Open the public repository and review the computational source.",
      "2. Open the portal in a modern browser with no additional download.",
      "3. Signal data is sent locally to a typed Web Worker.",
      "4. The worker returns only the mapped result to the interface.",
    ],
    hmacVerifyTitle: "What can be verified:",
    hmacVerify: [
      "Full formulas and mathematical constants in TypeScript source.",
      "The message protocol between the interface and Worker.",
      "Regression tests for VI, Ψ and the 18×18 matrix.",
      "No external installer or native process.",
      "Local processing of signal buffers.",
    ],
    hmacCodes: "Constants preserved in the core:",
    hmacErrors: [
      "718.5701251542688 Hz — model carrier",
      "7.83 Hz — Schumann model frequency",
      "18.6 Hz — lunar model modulation",
      "φ = 1.618033988749895 — Golden Ratio",
    ],
    hmacSecret: "Source: github.com/greg718gate/brama-dna718. The platform is in test phase; results are numerical mappings, not medical or clinical assessments.",
    contactTitle: "Client contact",
    contactBody: "Questions about the open source, test phase and integrations:",
    contactEmail: "contact@zeta-core-dsp.com",
    contactRegion: "Region: Aberdeen, Scotland, UK",
    pricingTitle: "Access status",
    pricing: [
      "Browser portal — open access",
      "Web Worker core — Open Source",
      "Subscription — test_phase / no payment",
    ],
  },
};

export default function ZetaIntegration() {
  const [lang, setLang] = useState<Lang>(
    typeof navigator !== "undefined" && navigator.language.startsWith("pl") ? "pl" : "en"
  );
  const t = T[lang];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link to="/zeta" className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> {t.back}
          </Link>
          <button
            onClick={() => setLang(lang === "pl" ? "en" : "pl")}
            className="text-xs px-3 py-1 rounded border border-white/20 text-white/70 hover:border-cyan-400 hover:text-cyan-300 font-mono"
          >
            {lang === "pl" ? "EN" : "PL"}
          </button>
        </div>

        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{t.title}</h1>
          <p className="text-white/60">{t.subtitle}</p>
        </header>

        {/* LEVEL 1 */}
        <Card className="p-6 mb-6 bg-black/60 border-emerald-500/30">
          <div className="flex items-center gap-3 mb-3">
            <Smartphone className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-emerald-400">{t.l1Title}</h2>
          </div>
          <p className="text-sm text-white/60 mb-4">{t.l1Cost}</p>
          <ol className="space-y-2 text-sm text-white/85 list-decimal list-inside mb-4">
            {t.l1Steps.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
          <p className="text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded p-3">{t.l1Result}</p>
        </Card>

        {/* LEVEL 2 */}
        <Card className="p-6 mb-6 bg-black/60 border-amber-500/30">
          <div className="flex items-center gap-3 mb-3">
            <Cable className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-bold text-amber-400">{t.l2Title}</h2>
          </div>
          <p className="text-sm text-white/60 mb-4">{t.l2Cost}</p>
          <ol className="space-y-2 text-sm text-white/85 list-decimal list-inside mb-4">
            {t.l2Steps.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
          <p className="text-sm text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded p-3">{t.l2Result}</p>
        </Card>

        {/* LEVEL 3 */}
        <Card className="p-6 mb-6 bg-black/60 border-red-500/30">
          <div className="flex items-center gap-3 mb-3">
            <Network className="w-6 h-6 text-red-400" />
            <h2 className="text-xl font-bold text-red-400">{t.l3Title}</h2>
          </div>
          <p className="text-sm text-white/60 mb-4">{t.l3Cost}</p>
          <ol className="space-y-2 text-sm text-white/85 list-decimal list-inside mb-4">
            {t.l3Steps.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
          <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded p-3">{t.l3Result}</p>
        </Card>

        {/* OPEN SOURCE */}
        <Card className="p-6 mb-6 bg-black/60 border-cyan-500/30">
          <div className="flex items-center gap-3 mb-3">
            <Github className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-cyan-400">{t.hmacTitle}</h2>
          </div>
          <p className="text-sm text-white/70 mb-5">{t.hmacIntro}</p>

          <h3 className="text-sm font-bold text-white mb-2">{t.hmacFlowTitle}</h3>
          <ul className="space-y-2 text-sm text-white/85 mb-5">
            {t.hmacFlow.map((s, i) => <li key={i} className="border-l-2 border-cyan-500/40 pl-3">{s}</li>)}
          </ul>

          <h3 className="text-sm font-bold text-white mb-2">{t.hmacVerifyTitle}</h3>
          <ul className="space-y-1 text-sm text-white/85 mb-5 list-disc list-inside">
            {t.hmacVerify.map((s, i) => <li key={i}>{s}</li>)}
          </ul>

          <h3 className="text-sm font-bold text-white mb-2">{t.hmacCodes}</h3>
          <ul className="space-y-1 text-xs text-white/80 font-mono mb-5">
            {t.hmacErrors.map((s, i) => <li key={i}>{s}</li>)}
          </ul>

          <div className="flex gap-2 items-start bg-cyan-500/10 border border-cyan-500/20 rounded p-3">
            <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <p className="text-sm text-cyan-100">{t.hmacSecret}</p>
          </div>
        </Card>

        {/* PRICING */}
        <Card className="p-6 mb-6 bg-black/60 border-white/20">
          <h2 className="text-xl font-bold mb-4">{t.pricingTitle}</h2>
          <ul className="space-y-2 text-sm text-white/85">
            {t.pricing.map((s, i) => <li key={i} className="flex justify-between border-b border-white/10 pb-2">
              <span>{s.split(" — ")[0]}</span>
              <span className="text-cyan-300 font-mono">{s.split(" — ")[1]}</span>
            </li>)}
          </ul>
        </Card>

        {/* CONTACT */}
        <Card className="p-6 mb-10 bg-black/60 border-white/20">
          <div className="flex items-center gap-3 mb-3">
            <Mail className="w-6 h-6 text-white/80" />
            <h2 className="text-xl font-bold">{t.contactTitle}</h2>
          </div>
          <p className="text-sm text-white/70 mb-2">{t.contactBody}</p>
          <a href={`mailto:${t.contactEmail}`} className="text-cyan-400 hover:text-cyan-300 font-mono text-lg">
            {t.contactEmail}
          </a>
          <p className="text-xs text-white/50 mt-2">{t.contactRegion}</p>
        </Card>
      </div>
      <ZetaFooter lang={lang} />
    </div>
  );
}
