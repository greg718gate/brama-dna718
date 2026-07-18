import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowLeft, Smartphone, Cable, Network, KeyRound, ShieldCheck, Mail } from "lucide-react";

type Lang = "pl" | "en";

const T = {
  pl: {
    back: "← Powrót do portalu",
    title: "Zeta-Core — Instrukcja integracji",
    subtitle: "Jak podłączyć system do maszyn w Twojej firmie. Krok po kroku.",
    l1Title: "POZIOM 1 — Telefon lub laptop",
    l1Cost: "Koszt: 0 £ · Czas: 2 minuty · Dla kogo: pilot, warsztaty, pierwsze demo",
    l1Steps: [
      "Pracownik podchodzi do maszyny z telefonem (Android/iPhone) lub laptopem.",
      "Otwiera w przeglądarce: brama-dna718.com/zeta",
      "Wpisuje kod dostępu otrzymany mailem od nas.",
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
      "Wgrywa CSV na brama-dna718.com/zeta → wybiera silnik v2.0 Spatial → raport 3-osiowy PDF.",
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
    l3Result: "Status: specyfikacja API gotowa (Zeta-Core/docs/FLEET_API_SPEC_v3.md). Implementacja uruchamiana pod pierwszego klienta.",
    hmacTitle: "Licencjonowanie HMAC-SHA256 — jak to działa",
    hmacIntro: "To jest mechanizm zabezpieczający dla klientów, którzy chcą kupić silnik ON-PREMISE (plik .so na własny serwer, bez chmury). Web demo (poziom 1) tego nie potrzebuje.",
    hmacFlowTitle: "Przepływ w 4 krokach:",
    hmacFlow: [
      "1. Klient płaci fakturę i podaje: nazwę firmy, ID maszyny (MAC adres serwera), datę wygaśnięcia licencji.",
      "2. My uruchamiamy narzędzie issue_token.py (mamy je lokalnie, sekret HMAC nigdy nie opuszcza naszego komputera).",
      "3. Narzędzie generuje token w formacie: ZC1.<payload_base64>.<sygnatura_HMAC> — np. ZC1.eyJjb21wYW55Ijoi...Q.a3f9b2c8e1d47...",
      "4. Wysyłamy token mailem. Klient wkleja go do swojego kodu jako parametr license_key w funkcji run_zeta_diagnostic().",
    ],
    hmacVerifyTitle: "Co silnik sprawdza przy każdym uruchomieniu:",
    hmacVerify: [
      "Podpis HMAC-SHA256 — czy token nie został sfałszowany (klient nie może sam wygenerować nowego).",
      "Data ważności — czy licencja nie wygasła.",
      "Machine binding — czy token jest przypisany do tego serwera (MAC adres).",
      "Product ID — czy token jest dla właściwej wersji silnika (v1.1 nie zadziała z tokenem v2.0).",
      "Feature bits — czy wykupione funkcje są odblokowane (np. SPATIAL wymaga oddzielnego bitu).",
    ],
    hmacCodes: "Kody błędów zwracane przez silnik:",
    hmacErrors: [
      "0 = OK, wszystko działa",
      "-2 = token uszkodzony (błąd wklejenia)",
      "-3 = podpis nieprawidłowy (próba fałszerstwa)",
      "-4 = licencja wygasła — trzeba odnowić",
      "-5 = zły serwer (token nie dla tej maszyny)",
      "-6 = zła wersja silnika",
      "-7 = brak wykupionej funkcji",
    ],
    hmacSecret: "Sekret HMAC (32 bajty) trzymamy tylko my. Bez niego nikt nie wygeneruje ważnego tokenu, nawet jeśli ukradnie plik .so. To standardowy mechanizm używany m.in. przez AWS, Stripe, GitHub.",
    contactTitle: "Kontakt dla klientów",
    contactBody: "Wszystkie zapytania handlowe, prośby o kod dostępu do portalu, wystawienie licencji HMAC lub pilot 3-miesięczny:",
    contactEmail: "contact@zeta-core-dns.com",
    contactRegion: "Region: Aberdeen, Szkocja, UK",
    pricingTitle: "Cennik referencyjny",
    pricing: [
      "Pojedynczy raport diagnostyczny — 200 £",
      "Pakiet 10 raportów — 1 500 £",
      "Monitoring miesięczny 1 maszyny — 400 £/mies.",
      "Pilot 3-miesięczny (1 maszyna) — 2 500 £",
      "Licencja on-premise (silnik .so + HMAC, 1 rok) — od 8 000 £",
      "Fleet Gateway v3.0 (integracja SCADA, do 50 maszyn) — od 25 000 £",
    ],
  },
  en: {
    back: "← Back to portal",
    title: "Zeta-Core — Integration Guide",
    subtitle: "How to connect the system to your company's machines. Step by step.",
    l1Title: "LEVEL 1 — Phone or laptop",
    l1Cost: "Cost: £0 · Time: 2 minutes · For: pilot, workshops, first demo",
    l1Steps: [
      "Technician walks up to the machine with a phone (Android/iPhone) or laptop.",
      "Opens in browser: brama-dna718.com/zeta",
      "Enters the access code we sent by email.",
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
      "Uploads the CSV to brama-dna718.com/zeta → selects engine v2.0 Spatial → tri-axial PDF report.",
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
    l3Result: "Status: API spec ready (Zeta-Core/docs/FLEET_API_SPEC_v3.md). Implementation triggered by first paying customer.",
    hmacTitle: "HMAC-SHA256 licensing — how it works",
    hmacIntro: "This is the protection mechanism for clients who want to buy the engine ON-PREMISE (a .so file on their own server, no cloud). The web demo (Level 1) does not need this.",
    hmacFlowTitle: "The 4-step flow:",
    hmacFlow: [
      "1. Client pays the invoice and provides: company name, machine ID (server MAC address), licence expiry date.",
      "2. We run the issue_token.py tool locally (the HMAC secret never leaves our machine).",
      "3. The tool generates a token in the format: ZC1.<payload_base64>.<HMAC_signature> — e.g. ZC1.eyJjb21wYW55Ijoi...Q.a3f9b2c8e1d47...",
      "4. We send the token by email. The client pastes it into their code as the license_key parameter of run_zeta_diagnostic().",
    ],
    hmacVerifyTitle: "What the engine verifies on every call:",
    hmacVerify: [
      "HMAC-SHA256 signature — that the token has not been forged (the client cannot mint a new one themselves).",
      "Expiry date — that the licence has not expired.",
      "Machine binding — that the token is bound to this server (MAC address).",
      "Product ID — that the token matches the engine version (v1.1 token won't unlock v2.0).",
      "Feature bits — that the purchased features are enabled (e.g. SPATIAL needs a separate bit).",
    ],
    hmacCodes: "Error codes returned by the engine:",
    hmacErrors: [
      "0 = OK, working",
      "-2 = malformed token (paste error)",
      "-3 = signature mismatch (tampered)",
      "-4 = licence expired — needs renewal",
      "-5 = wrong machine (token not for this server)",
      "-6 = wrong engine version",
      "-7 = feature not licensed",
    ],
    hmacSecret: "The HMAC secret (32 bytes) is held only by us. Without it, nobody can mint a valid token, even if the .so file is stolen. This is the standard mechanism used by AWS, Stripe, GitHub and others.",
    contactTitle: "Client contact",
    contactBody: "All commercial enquiries, portal access codes, HMAC licence issuance or 3-month pilots:",
    contactEmail: "contact@zeta-core-dns.com",
    contactRegion: "Region: Aberdeen, Scotland, UK",
    pricingTitle: "Reference pricing",
    pricing: [
      "Single diagnostic report — £200",
      "Pack of 10 reports — £1,500",
      "Monthly monitoring, 1 machine — £400/mo",
      "3-month pilot (1 machine) — £2,500",
      "On-premise licence (.so engine + HMAC, 1 year) — from £8,000",
      "Fleet Gateway v3.0 (SCADA integration, up to 50 machines) — from £25,000",
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

        {/* HMAC */}
        <Card className="p-6 mb-6 bg-black/60 border-cyan-500/30">
          <div className="flex items-center gap-3 mb-3">
            <KeyRound className="w-6 h-6 text-cyan-400" />
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
    </div>
  );
}
