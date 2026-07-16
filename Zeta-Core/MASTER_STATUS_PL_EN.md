# Zeta-Core — Master Status & Instrukcja / Master Status & Manual
**Wersja / Version:** 2026-07-16 · **Właściciel / Owner:** brama-dna718 (Aberdeen, Scotland)

> 🇵🇱 Ten dokument to Twoja **jedyna ściąga**. Trzymaj otwarte, gdy rozmawiasz z klientem/inwestorem.
> 🇬🇧 This document is your **single cheat sheet**. Keep it open when talking to a client/investor.

---

## 1. Hasła, kody, adresy / Passwords, codes, addresses

| Co / What | Wartość / Value | Do czego / Purpose |
|---|---|---|
| Domena / Domain | `https://brama-dna718.com` | Strona główna / Main site |
| Portal diagnostyczny / Diagnostic portal | `https://brama-dna718.com/zeta` | **To pokazujesz klientowi / Show this to client** |
| Kod dostępu Zeta / Zeta access code | **`ZETA-2026`** | Klient wpisuje na `/zeta` |
| Ghost Mode / Admin | `718` lub `2912` | Twoje panele wewnętrzne |
| Studio wideo (ukryte) | `/moje-studio-wideo` · hasło `MojeStudio2026` | Twoje narzędzia audio/wideo |
| Kod dostępu PRNG/QF | `2912` | Panel `/qf` |
| E-mail kontaktowy | `bramadna718@gmail.com` | Sprzedaż, kod źródłowy symfonii |
| GitHub | folder `Zeta-Core/` | Dokumentacja techniczna dla due diligence |
| HMAC secret (Google Keep) | `0353defe28e63ce1c75d437296b5c3cd8538f732da518c49985c05ea8d8fac35` | **Nie pokazuj nikomu / Never share** |

---

## 2. Co JUŻ DZIAŁA / What ALREADY WORKS

### 🇵🇱 Portal diagnostyczny `/zeta` (produkcja)
- ✅ Ekran logowania kodem `ZETA-2026`
- ✅ Wybór profilu maszyny (7 typów: silnik 50/60 Hz, pompa, wentylator, łożysko, przekładnia, auto)
- ✅ Wgrywanie plików audio (WAV/MP3/M4A/OGG/WEBM/FLAC) — dowolna długość
- ✅ Wgrywanie CSV/TXT z czujników — dowolna długość
- ✅ Automatyczne dzielenie długich plików na okna 2–10 s + oś czasu
- ✅ Silnik po stronie serwera (kod niewidoczny dla klienta) — FFT, spectral entropy, sidebands
- ✅ 4 metryki: Phase Coherence, Topological Friction, Fault Condensation, Tracked Frequency
- ✅ Klasyfikacja statusu: HEALTHY / WATCH / DEGRADED / CRITICAL
- ✅ Wykresy spektrum + oś czasu (Recharts)
- ✅ **Tryb LIVE 24h** — mikrofon telefonu/laptopa, analiza co 5 s, event log, alarmy
- ✅ Eksport raportu PDF
- ✅ Eksport CSV z całego event logu (tryb LIVE)

### 🇬🇧 Diagnostic portal `/zeta` (production)
- ✅ Login gate with code `ZETA-2026`
- ✅ Machine profile selector (7 types)
- ✅ Audio file upload (any length) — WAV/MP3/M4A/OGG/WEBM/FLAC
- ✅ Sensor CSV/TXT upload (any length)
- ✅ Long files auto-windowed 2–10 s + timeline
- ✅ Server-side engine (code hidden from client) — FFT, spectral entropy, sidebands
- ✅ 4 metrics: Phase Coherence, Topological Friction, Fault Condensation, Tracked Frequency
- ✅ Status: HEALTHY / WATCH / DEGRADED / CRITICAL
- ✅ Spectrum + timeline charts
- ✅ **24h LIVE mode** — phone/laptop mic, 5 s analysis loop, event log, alerts
- ✅ PDF report export
- ✅ Full event log CSV export (LIVE mode)

### Dokumentacja na GitHub (`Zeta-Core/`)
- ✅ README.md, CHANGELOG.md, ROADMAP.md, LICENSE (proprietary), SECURITY.md
- ✅ 7 dokumentów ADR (decyzje architektoniczne)
- ✅ STATUS_REPORT.md, DUE_DILIGENCE_QA.md (10 pytań + odpowiedzi), FLEET_API_SPEC_v3.md
- ✅ `examples/` — 3 skrypty demo
- ✅ `tests/` — testy jednostkowe i integracyjne
- ✅ 3 wersje binarek `.so` (v1.0, v1.1, v2.0) — na razie stub, opisane jako "eval build"

---

## 3. Czego BRAKUJE / What is MISSING

| # | Element | Priorytet / Priority | Czas / Time | Uwagi |
|---|---|---|---|---|
| 1 | **Dwujęzyczność `/zeta` (PL/EN switch)** | 🔴 KRYTYCZNE | 45 min | Wszystkie etykiety, komunikaty, przyciski |
| 2 | **PDF raport dwujęzyczny** | 🔴 KRYTYCZNE | 30 min | Nagłówki i interpretacja w PL i EN obok siebie |
| 3 | **Instrukcja użytkownika PL/EN na stronie** | 🔴 KRYTYCZNE | 30 min | Sekcja "Jak używać / How to use" na `/zeta` |
| 4 | **Strona `/zeta` — landing dla klientów** | 🟡 WAŻNE | 45 min | Krótka strona sprzedażowa PL/EN przed loginem |
| 5 | Rekompilacja `.so` z HMAC z Keep + ECDSA sign | 🟢 NA POTEM | 40 min (Twoja praca offline) | Runbook już masz. Nie potrzebne dopóki nie sprzedajesz binarki. |
| 6 | Dashboard floty (Fleet v3.0) | 🟢 NA POTEM | 2 tygodnie | Tylko gdy klient zapłaci za pilot |
| 7 | Podpis e-mail w PDF (footer z kontaktem) | 🟢 NICE-TO-HAVE | 10 min | |

**Sumarycznie do "tiptop" na spotkanie z klientem UK: ~2,5 godziny mojej pracy.** Pozycje 1–4 są konieczne. Reszta może poczekać.

---

## 4. Instrukcja krok po kroku / Step-by-step manual

### 🇵🇱 Jak pokazać klientowi (demo 5 minut)

1. Otwórz w przeglądarce: `https://brama-dna718.com/zeta`
2. Wpisz kod: **`ZETA-2026`**
3. Wybierz zakładkę:
   - **Plik** — jeśli klient ma nagranie maszyny
   - **CSV czujniki** — jeśli klient ma dane z akcelerometru
   - **LIVE Mikrofon** — jeśli chcesz pokazać na żywo (np. telefon obok pralki)
4. Wybierz profil maszyny (np. "Silnik elektryczny 50 Hz")
5. Wgraj plik / kliknij "Start LIVE"
6. Poczekaj 3–10 sekund
7. Pokaż wynik: kolor statusu (zielony/żółty/pomarańczowy/czerwony) + wykres
8. Kliknij **"Pobierz PDF"** → daj klientowi raport na e-mail

### 🇬🇧 How to demo to a client (5 minutes)

1. Open browser: `https://brama-dna718.com/zeta`
2. Enter code: **`ZETA-2026`**
3. Choose tab:
   - **File** — client has a machine recording
   - **CSV sensors** — client has accelerometer data
   - **LIVE Microphone** — show real-time (e.g. phone next to a pump)
4. Pick machine profile (e.g. "Electric motor 50 Hz")
5. Upload file / click "Start LIVE"
6. Wait 3–10 seconds
7. Show result: status colour (green/yellow/orange/red) + chart
8. Click **"Download PDF"** → give client the report by email

### Interpretacja wyników / How to read results

| Metryka / Metric | Znaczenie PL | Meaning EN | Dobrze / Good |
|---|---|---|---|
| Phase Coherence | Stabilność częstotliwości pracy | Frequency stability | > 0.85 |
| Topological Friction | Poziom chaosu / tarcia widmowego | Spectral chaos level | < 0.35 |
| Fault Condensation | Energia w bocznych pasmach (uszkodzenie łożysk/zębatek) | Sideband energy (bearing/gear defect) | < 0.30 |
| Tracked Frequency | Dominująca częstotliwość pracy [Hz] | Dominant operating frequency [Hz] | Zgodna z profilem |

| Status | PL | EN | Rekomendacja / Action |
|---|---|---|---|
| 🟢 HEALTHY | Sprawna | Healthy | Kontynuować pracę |
| 🟡 WATCH | Obserwacja | Watch | Powtórzyć pomiar za 7 dni |
| 🟠 DEGRADED | Degradacja | Degraded | Zaplanować serwis w 30 dni |
| 🔴 CRITICAL | Krytyczna | Critical | Serwis natychmiastowy / Immediate service |

---

## 5. Co powiesz klientowi / What to tell the client

**🇵🇱 Skrypt (30 sekund):**
> "Zeta-Core to system diagnostyki predykcyjnej maszyn wirujących. Klient nagrywa dźwięk maszyny telefonem albo podłącza czujnik — nasz silnik po stronie serwera analizuje sygnał metodą Phase-Coherence Analytics i zwraca raport PDF w 10 sekund. Nie instalują nic. Płacą za raport lub subskrypcję. Pierwszy raport gratis dla weryfikacji."

**🇬🇧 Pitch (30 seconds):**
> "Zeta-Core is predictive diagnostics for rotating machinery. The client records the machine with a phone or plugs in a sensor — our server-side engine runs Phase-Coherence Analytics and returns a PDF report in 10 seconds. Nothing to install. Pay per report or subscription. First report free for verification."

**Cennik sugerowany / Suggested pricing:**
- Pojedynczy raport / Single report: **£200**
- Pakiet 10 raportów / 10-report pack: **£1,500**
- Monitoring miesięczny 1 maszyny / Monthly monitoring per machine: **£400/mo**
- Pilot 3-miesięczny / 3-month pilot: **£2,500**

---

## 6. Znane ograniczenia (mów szczerze) / Known limits (be honest)

- 🇵🇱 To wersja **v1.1 adaptive** — dobrze radzi sobie z silnikami, pompami, wentylatorami. Łożyska i przekładnie (v2.0 spatial) są w trybie eksperymentalnym.
- 🇵🇱 Baseline (co jest "normalne" dla danej maszyny) trzeba ustawić po 3–5 pomiarach maszyny w stanie zdrowym.
- 🇬🇧 This is **v1.1 adaptive** — best on motors, pumps, fans. Bearings and gearboxes (v2.0 spatial) are experimental.
- 🇬🇧 Baseline (what is "normal" for a given machine) requires 3–5 measurements while the machine is healthy.

---

## 7. Następne kroki / Next steps (kolejność wykonania)

1. **Teraz (ja robię):** dwujęzyczność `/zeta` + PDF PL/EN + instrukcja na stronie + landing sprzedażowy — łącznie ~2,5 h
2. **Ty (kiedy chcesz):** wypróbuj demo — nagraj telefonem 20 s pracy dowolnego urządzenia w domu (lodówka, wentylator, wiertarka). Wgraj na `/zeta`. Zobacz raport.
3. **Ty (gdy klient powie TAK):** wyślij mi jego wymagania — dopasuję profil, tekst raportu, ew. logo.
4. **Ty (po pierwszej sprzedaży):** rekompilacja `.so` z HMAC + ECDSA (runbook masz — punkt #5 wyżej).

---

## 8. Log zmian / Change log

| Data / Date | Co zrobiono / What changed |
|---|---|
| 2026-07-16 | Utworzono ten dokument. Portal `/zeta` działa: profile maszyn, długie pliki, tryb LIVE 24h, PDF, CSV export. |
| _następne_ | _(będę dopisywał po każdej sesji)_ |

---
**Kontakt techniczny / Technical contact:** `bramadna718@gmail.com`
