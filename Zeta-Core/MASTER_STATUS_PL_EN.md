# Zeta-Core — Master Status & Manual (Public)
**Version:** 2026-07-16 · **Owner:** Zeta-Core (Aberdeen, Scotland)

> 🇵🇱 Publiczna wersja dokumentu. Wszystkie hasła, kody dostępu, sekrety kryptograficzne i dane operacyjne właściciela są przechowywane w prywatnym menedżerze haseł właściciela i **nie są częścią tego repozytorium**.
> 🇬🇧 Public version. All passwords, access codes, cryptographic secrets and owner operational data are stored in the owner's private password manager and are **not part of this repository**.

---

## 1. Access model / Model dostępu

Portal diagnostyczny (`/zeta`) chroniony jest kodem dostępu wydawanym klientowi indywidualnie przez właściciela drogą e-mailową po podpisaniu NDA lub w ramach pilotu.

The diagnostic portal (`/zeta`) is protected by an access code issued individually to each client by the owner via email after signing an NDA or as part of a pilot engagement.

**Contact for access:** see the project profile on the platform.

---

## 2. What already works / Co JUŻ DZIAŁA

### 🇵🇱 Portal diagnostyczny (produkcja)
- ✅ Ekran logowania kodem dostępu
- ✅ Wybór profilu maszyny (7 typów: silnik 50/60 Hz, pompa, wentylator, łożysko, przekładnia, auto)
- ✅ Wybór wersji silnika analitycznego: **v1.0 Standard**, **v1.1 Adaptive**, **v2.0 Spatial Multi-Axis**
- ✅ Wgrywanie plików audio (WAV/MP3/M4A/OGG/WEBM/FLAC) — dowolna długość
- ✅ Wgrywanie CSV/TXT z czujników — dowolna długość (dla v2.0: 3-osiowe X/Y/Z)
- ✅ Automatyczne dzielenie długich plików na okna 2–10 s + oś czasu
- ✅ Silnik po stronie serwera (kod niewidoczny dla klienta)
- ✅ 4 metryki: Phase Coherence, Topological Friction, Fault Condensation, Tracked Frequency
- ✅ Klasyfikacja statusu: HEALTHY / WATCH / DEGRADED / CRITICAL
- ✅ Wykresy spektrum + oś czasu
- ✅ Tryb LIVE 24h — mikrofon telefonu/laptopa, analiza co 5 s, event log, alarmy
- ✅ Eksport raportu PDF (PL/EN)
- ✅ Eksport CSV z całego event logu (tryb LIVE)

### 🇬🇧 Diagnostic portal (production)
- ✅ Access code login
- ✅ Machine profile selector (7 types)
- ✅ Engine version selector: **v1.0 Standard**, **v1.1 Adaptive**, **v2.0 Spatial Multi-Axis**
- ✅ Audio file upload (any length) — WAV/MP3/M4A/OGG/WEBM/FLAC
- ✅ Sensor CSV/TXT upload — any length (v2.0: tri-axial X/Y/Z)
- ✅ Long files auto-windowed 2–10 s + timeline
- ✅ Server-side engine (code hidden from client)
- ✅ 4 metrics: Phase Coherence, Topological Friction, Fault Condensation, Tracked Frequency
- ✅ Status: HEALTHY / WATCH / DEGRADED / CRITICAL
- ✅ Spectrum + timeline charts
- ✅ 24h LIVE mode — phone/laptop mic, 5 s analysis loop, event log, alerts
- ✅ Bilingual PDF report export (PL/EN)
- ✅ Full event log CSV export (LIVE mode)

### GitHub documentation (`Zeta-Core/`)
- ✅ README.md, CHANGELOG.md, ROADMAP.md, LICENSE (proprietary), SECURITY.md
- ✅ 7 ADR documents (architectural decisions)
- ✅ STATUS_REPORT.md, DUE_DILIGENCE_QA.md, FLEET_API_SPEC_v3.md
- ✅ `examples/` — 3 demo scripts
- ✅ `tests/` — unit and integration tests
- ✅ 3 binary versions `.so` (v1.0, v1.1, v2.0) — evaluation builds

---

## 3. Engine versions / Wersje silnika

| Version | Name | Status | Use case |
|---|---|---|---|
| v1.0 | Standard Core | ✅ Production | General-purpose diagnostics: motors, pumps, fans |
| v1.1 | Adaptive Engine | ✅ Production | Variable-speed drives, unstable RPM, longer recordings |
| v2.0 | Spatial Multi-Axis | ✅ Production | Tri-axial (X/Y/Z) sensor data; bearings, gearboxes, cross-axis correlation |

All three engines are callable from the portal via the engine selector.

---

## 4. How to demo (5 minutes) / Jak zademonstrować

### 🇵🇱
1. Wyślij klientowi kod dostępu e-mailem.
2. Klient otwiera portal i wpisuje kod.
3. Wybiera zakładkę: **Plik / CSV czujniki / LIVE Mikrofon**.
4. Wybiera profil maszyny (np. "Silnik elektryczny 50 Hz") i wersję silnika (Standard / Adaptive / Spatial).
5. Wgrywa plik / uruchamia tryb LIVE.
6. Otrzymuje wynik: kolor statusu + wykres + PDF do pobrania.

### 🇬🇧
1. Email the access code to the client.
2. Client opens the portal and enters the code.
3. Selects tab: **File / CSV sensors / LIVE Microphone**.
4. Picks machine profile (e.g. "Electric motor 50 Hz") and engine version (Standard / Adaptive / Spatial).
5. Uploads file / starts LIVE mode.
6. Receives result: status colour + chart + downloadable PDF.

### Metric interpretation / Interpretacja wyników

| Metric | PL | EN | Healthy range |
|---|---|---|---|
| Phase Coherence | Stabilność częstotliwości pracy | Frequency stability | > 0.85 |
| Topological Friction | Poziom chaosu widmowego | Spectral chaos level | < 0.35 |
| Fault Condensation | Energia w bocznych pasmach | Sideband energy (bearing/gear defect) | < 0.30 |
| Tracked Frequency | Dominująca częstotliwość [Hz] | Dominant frequency [Hz] | Matches profile |

| Status | PL | EN | Action |
|---|---|---|---|
| 🟢 HEALTHY | Sprawna | Healthy | Continue operation |
| 🟡 WATCH | Obserwacja | Watch | Re-measure in 7 days |
| 🟠 DEGRADED | Degradacja | Degraded | Schedule service within 30 days |
| 🔴 CRITICAL | Krytyczna | Critical | Immediate service |

---

## 5. Client pitch / Prezentacja dla klienta

**🇵🇱 (30 s):**
> "Zeta-Core to system diagnostyki predykcyjnej maszyn wirujących. Klient nagrywa dźwięk maszyny telefonem albo podłącza czujnik — silnik po stronie serwera analizuje sygnał metodą Phase-Coherence Analytics i zwraca raport PDF w 10 sekund. Nic nie instalują. Płacą za raport lub subskrypcję."

**🇬🇧 (30 s):**
> "Zeta-Core is predictive diagnostics for rotating machinery. The client records the machine with a phone or plugs in a sensor — our server-side engine runs Phase-Coherence Analytics and returns a PDF report in 10 seconds. Nothing to install. Pay per report or subscription."

**Suggested pricing / Cennik:**
- Single report / Pojedynczy raport: **£200**
- 10-report pack / Pakiet 10: **£1,500**
- Monthly monitoring per machine / Monitoring miesięczny: **£400/mo**
- 3-month pilot: **£2,500**

---

## 6. Known limits / Znane ograniczenia

- v1.0 Standard is best on stable-RPM machinery.
- v1.1 Adaptive is required for variable-speed drives.
- v2.0 Spatial requires tri-axial input (X/Y/Z columns in CSV).
- Baselines require 3–5 measurements of the machine in a healthy state before alerts become reliable.

---

## 7. Change log

| Date | Change |
|---|---|
| 2026-07-16 | Sanitized public version. All credentials moved to owner's private password manager. Engine selector for v1.0 / v1.1 / v2.0 confirmed as public capability. |

---

**Business contact:** see the project profile on the platform.
