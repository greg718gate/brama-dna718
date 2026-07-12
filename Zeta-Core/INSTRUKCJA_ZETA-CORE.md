# INSTRUKCJA ZETA-CORE — Pełna dokumentacja wdrożeniowa

**Wersja dokumentu:** 1.0  
**Data:** 2026-07-12  
**Autor:** Grzegorz / Brama-DNA718  
**Dotyczy:** `Zeta-Core/v1.0-standard-core/`, `Zeta-Core/v1.1-adaptive-engine/`, `Zeta-Core/v2.0-spatial-multi-axis/`

Ten dokument opisuje **wszystko**, co musisz wiedzieć zanim przekażesz binarkę Zeta-Core firmie zewnętrznej: co jest w środku, jak działają zabezpieczenia, jak wystawić licencję, co dać klientowi, a czego **nigdy** nie wysyłać.

---

## 1. Co dokładnie zostało zbudowane

Trzy silniki DSP, każdy jako **skompilowana, stripped, natywna biblioteka ELF `.so`** (x86-64 Linux). Kod źródłowy nie znajduje się w repozytorium.

| Folder | Plik | Eksportowany symbol | Zastosowanie |
|---|---|---|---|
| `v1.0-standard-core/` | `ZETA_ENGINE.so` | `run_zeta_diagnostic` | benchmark laboratoryjny, warunki idealne |
| `v1.1-adaptive-engine/` | `ZETA-CORE_v1.1.so` | `run_zeta_diagnostic` | produkcyjny, jednoosiowy, live |
| `v2.0-spatial-multi-axis/` | `ZETA-CORE_v2.0.so` | `run_zeta_spatial` | 3-osiowy (X, Y, Z) |

Wszystkie funkcje wewnętrzne (SHA-256, HMAC, weryfikator licencji, filtr Butterwortha, tracker RPM, analizy per-oś) są w linkerze oznaczone jako `local` — z zewnątrz są **niewidoczne i niewywoływalne**.

**Weryfikacja u siebie:**
```bash
file Zeta-Core/v1.0-standard-core/ZETA_ENGINE.so
# ELF 64-bit LSB shared object, ... stripped

nm -D --defined-only Zeta-Core/v1.0-standard-core/ZETA_ENGINE.so
# ...  T run_zeta_diagnostic       <-- tylko to
```

---

## 2. Publiczne API (kontrakt "Single Gate")

To jest **jedyny** sposób komunikacji z silnikiem. Klient nie ma innej drogi.

### v1.0 i v1.1

```c
int run_zeta_diagnostic(
    const double* input,        // surowe próbki mono, PCM double
    double*       output,       // bufor >= 8 double
    int           length,       // liczba próbek
    int           sample_rate,  // Hz
    double        target_freq,  // Hz (nominalna częstotliwość obrotowa)
    const char*   license_key   // token licencyjny (patrz §4)
);
```

**Bufor `output` po sukcesie:**

| Index | Znaczenie |
|---|---|
| `output[0]` | coherence (0–1) — czystość fazowa |
| `output[1]` | topological friction Tf (0–1) |
| `output[2]` | Mc — fault condensation index |
| `output[3]` | efektywna śledzona częstotliwość (Hz) |

### v2.0

```c
int run_zeta_spatial(
    const double* input,        // interleaved [x0,y0,z0, x1,y1,z1, ...]
    double*       output,       // bufor >= 8 double
    int           n_samples,    // liczba próbek NA OŚ
    int           sample_rate,
    double        target_freq,
    const char*   license_key
);
```

| Index | Znaczenie |
|---|---|
| `output[0..2]` | coherence per oś: X, Y, Z |
| `output[3..5]` | Tf per oś: X, Y, Z |
| `output[6]` | globalna friction ‖Tf‖₂ / √3 |
| `output[7]` | target_freq |

### Kody zwrotne

| Kod | Znaczenie |
|---|---|
|  0 | OK |
| -1 | Nieprawidłowe argumenty (NULL, ujemne, za krótkie) |
| -2 | Zły format tokenu licencji |
| -3 | Podpis się nie zgadza (podrobiony / uszkodzony) |
| -4 | Licencja wygasła (`not_after` minęło) |
| -5 | Machine binding — token nie pasuje do tej maszyny |
| -6 | Zły produkt (np. token v1.0 na binarce v2.0) |
| -7 | Brak wymaganej flagi feature |

---

## 3. Sposób kompilacji (dla Twojej wiedzy)

```
gcc -O2 -fPIC -fvisibility=hidden -Wall \
    zeta_common.c zeta_vXX.c \
    -Wl,--version-script=map_vXX.map \
    -Wl,--gc-sections -ffunction-sections -fdata-sections \
    -Wl,--strip-all -shared -lm -o ZETA-CORE_vXX.so
strip --strip-all ZETA-CORE_vXX.so
```

**Co robi każda flaga (istotne z punktu ochrony IP):**

- `-fvisibility=hidden` — **domyślnie wszystkie** symbole są prywatne. Bez tego GCC eksportowałby każdą funkcję global-scope.
- `--version-script` — jawna biała lista: tylko `run_zeta_diagnostic` (v1.0/v1.1) albo `run_zeta_spatial` (v2.0). Wszystko inne = `local: *`.
- `--gc-sections` + `-ffunction-sections -fdata-sections` — linker usuwa martwe sekcje razem z ich nazwami.
- `--strip-all` + `strip --strip-all` — usuwa tabelę symboli, informacje debug (`.debug_*`, `.symtab`, `.strtab`), nazwy funkcji lokalnych.

Efekt: w `nm -D` widać tylko jeden symbol. W `strings` nie ma nazw takich jak `zeta_verify_license`, `hmac_sha256`, `load_secret`, `machine_fingerprint` — są pod surowymi offsetami RAM.

---

## 4. System licencyjny — szczegóły

### 4.1 Format tokenu

```
ZC1.<base64url_payload>.<base64url_signature>
```

Wygląda tak (przykład, ~120 znaków, wysyłalny mailem):
```
ZC1.QVRFWgECAQDpAwAAKukyaQAAAADwGjBrAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA.mK9x...MHo
```

### 4.2 Struktura payloadu (60 bajtów, little-endian)

| Offset | Rozmiar | Pole | Znaczenie |
|---|---|---|---|
| 0  | 4  | `magic` | `0x5A455441` ('ZETA') |
| 4  | 1  | `version` | zawsze `1` |
| 5  | 1  | `product_id` | `1` = v1.0, `2` = v1.1, `3` = v2.0 |
| 6  | 2  | `features` | bitmask (patrz §4.3) |
| 8  | 4  | `licensee_id` | Twój identyfikator klienta (dowolny u32) |
| 12 | 8  | `issued_at` | unix timestamp wystawienia |
| 20 | 8  | `not_after` | unix timestamp wygaśnięcia, `0` = wieczne |
| 28 | 32 | `machine_hash` | SHA-256 fingerprintu maszyny, 32× `0x00` = floating |

Sygnatura: **HMAC-SHA256(payload, secret)** — 32 bajty.

### 4.3 Flagi feature

| Bit | Nazwa | Wymagane przez |
|---|---|---|
| `0x0001` | CORE | wszystkie silniki |
| `0x0002` | SPATIAL | tylko v2.0 |

Można też definiować własne flagi (`0x0004`, `0x0008`, …) na przyszłe rozszerzenia — silnik już teraz sprawdza je maską, więc token z dodatkowymi bitami będzie dalej działać.

### 4.4 Sekret HMAC

- Zaszyty **w każdej binarce** w postaci **zaszyfrowanej dwuwarstwowym XOR-em** z obrotową padką: `secret[i] = SECRET_ENC[i] ^ SECRET_PAD[i] ^ ((i*17 + 0x5b) & 0xff)`.
- Rekonstruowany w RAM tylko na czas obliczenia HMAC, potem zerowany (`memset` po pętli).
- W `strings` na `.so` **nie widać** ani gotowego sekretu, ani słowa "secret", "hmac", "license".
- **Ty jesteś jedyną osobą znającą wartość sekretu.** Ten dokument jej **nie zawiera** — jest w `/tmp/zeta_src/zeta_common.c` na Twoim koncie i w Twoich prywatnych notatkach.

⚠️ **Jeśli sekret wycieknie:** ktoś może wystawiać własne licencje. Reakcja: przekompilować binarkę z nowym sekretem, wypuścić Zeta-Core v1.2/v2.1, wycofać starą wersję. Klienci muszą dostać nowy `.so` i nowe tokeny.

### 4.5 Machine binding

Fingerprint maszyny liczony w binarce jako SHA-256 z:
1. `/etc/machine-id` (jeśli istnieje)
2. `/var/lib/dbus/machine-id` (jeśli istnieje)
3. adres MAC pierwszego non-loopback interfejsu sieciowego

Jeśli nic z powyższych nie jest czytelne → fingerprint = 32× `0x00` → binarka odrzuca każdy token bindowany, ale przyjmuje floating.

**Jak zdobyć fingerprint od klienta przed wystawieniem tokenu:** wyślij mu jednolinijkowy skrypt:

```bash
python3 -c "import hashlib, uuid, pathlib; \
h=hashlib.sha256(); \
[h.update(pathlib.Path(p).read_bytes()) for p in ['/etc/machine-id','/var/lib/dbus/machine-id'] if pathlib.Path(p).exists()]; \
mac=uuid.getnode().to_bytes(6,'big'); h.update(mac); \
print(h.hexdigest())"
```

Odsyłają Ci 64 znaki hex — wklejasz do generatora poniżej.

### 4.6 Generator tokenów (trzymaj tylko u siebie)

To jest **Twoje narzędzie prywatne**. Nie umieszczaj go w repozytorium.

```python
# issue_license.py — TRZYMAĆ POZA REPO
import struct, hmac, hashlib, base64, time

# Sekret — 32 bajty, znane tylko Tobie. Uzupełnij samodzielnie z sejfu.
SECRET = bytes.fromhex("XX"*32)  # <-- prawdziwe 64 znaki hex

def issue(product_id: int, features: int, licensee_id: int,
          days_valid: int = 0, machine_hash_hex: str = "") -> str:
    now = int(time.time())
    not_after = 0 if days_valid == 0 else now + days_valid*86400
    mh = bytes.fromhex(machine_hash_hex) if machine_hash_hex else b"\x00"*32
    assert len(mh) == 32
    payload = struct.pack('<IBBHIQQ',
                          0x5A455441, 1, product_id, features,
                          licensee_id, now, not_after) + mh
    sig = hmac.new(SECRET, payload, hashlib.sha256).digest()
    b64 = lambda b: base64.urlsafe_b64encode(b).rstrip(b'=').decode()
    return f"ZC1.{b64(payload)}.{b64(sig)}"

# Przykłady:
# Perpetual floating v1.1 dla licensee 1001:
# print(issue(2, 0x0001, 1001))
# 90 dni, v2.0 z SPATIAL, machine-locked:
# print(issue(3, 0x0003, 4242, days_valid=90, machine_hash_hex="abc123..."))
```

---

## 5. Co przekazać firmie / fabryce

**WOLNO wysłać:**
- ✅ Odpowiedni plik `.so` (jeden — dokładnie ten, na który wystawiasz licencję).
- ✅ Token licencyjny (`ZC1.xxx.yyy`) — najlepiej innym kanałem niż `.so` (np. `.so` mailem, token przez Signal/Telegram).
- ✅ Plik `INTEGRATION_README.txt` (tłumaczenie na EN, sygnatury funkcji, kody zwrotne, przykład wywołania).
- ✅ Ten kawałek instrukcji: **rozdziały 2, 6, 7** (API + obsługa błędów + integracja).

**NIGDY nie wysyłać:**
- ❌ Kodu C (`zeta_common.c`, `zeta_v1x.c`, `zeta_v20.c`).
- ❌ Katalogu `/tmp/zeta_src/` ani żadnych `.o`.
- ❌ Skryptu `issue_license.py` z wypełnionym `SECRET`.
- ❌ Wartości `SECRET_ENC` / `SECRET_PAD` / złożonego sekretu HMAC.
- ❌ Tego dokumentu w całości (są w nim wewnętrzne szczegóły).
- ❌ Innych `.so` niż ten, za który klient zapłacił.

---

## 6. Integracja po stronie klienta (fragment do wysłania)

Klient dostaje `.so` + token i wywołuje z dowolnego języka przez FFI. Najprostszy Python:

```python
import ctypes

lib = ctypes.CDLL("./ZETA-CORE_v1.1.so")
lib.run_zeta_diagnostic.restype  = ctypes.c_int
lib.run_zeta_diagnostic.argtypes = [
    ctypes.POINTER(ctypes.c_double),  # input
    ctypes.POINTER(ctypes.c_double),  # output
    ctypes.c_int,                     # length
    ctypes.c_int,                     # sample_rate
    ctypes.c_double,                  # target_freq
    ctypes.c_char_p                   # license_key
]

LICENSE = b"ZC1.xxxxxxxx.yyyyyyyy"        # przekazane przez Zeta-Core

signal = (ctypes.c_double * len(samples))(*samples)
out    = (ctypes.c_double * 8)()

rc = lib.run_zeta_diagnostic(signal, out, len(samples), 44100, 150.0, LICENSE)
if rc != 0:
    raise RuntimeError(f"Zeta-Core error {rc}")

print("coherence:", out[0], "Tf:", out[1], "Mc:", out[2], "f:", out[3])
```

Analogicznie z C++, C#, Rust (dowolny FFI z sygnaturą jak w §2).

---

## 7. Obsługa błędów u klienta (przykład mapowania)

```
-1  →  "invalid input buffer or parameters"
-2  →  "license token malformed — check for whitespace/copy errors"
-3  →  "license signature mismatch — contact Zeta-Core support"
-4  →  "license expired — renewal required"
-5  →  "license bound to a different machine"
-6  →  "wrong product — this token is not valid for this engine version"
-7  →  "feature not enabled on this license tier"
```

---

## 8. Cykl życia licencji

1. **Zapytanie klienta** → dostajesz `licensee_id` (nadajesz numer), preferowany tier (v1.0/1.1/2.0), czas trwania, czy binding do maszyny.
2. **Jeśli machine-locked** → wysyłasz jednolinijkowiec z §4.5, dostajesz 64 hex.
3. **Wystawiasz token** przez `issue_license.py` u siebie na lokalnej maszynie.
4. **Wysyłasz klientowi** `.so` + token (osobnymi kanałami). Klient testuje `rc == 0`.
5. **Rewokacja** — nie ma w binarce online CRL. Aby "odebrać" licencję: zbliżający się `not_after` wystawiaj krótki (np. 90 dni) i po prostu nie odnawiaj. Dla licencji perpetual: musisz wypuścić nową wersję `.so` z nowym `SECRET` i przestać obsługiwać starą.
6. **Odnowienie** — nowy token do tego samego `licensee_id`, ten sam `.so`, klient tylko wymienia string. Zero zmian w kodzie u klienta.

---

## 9. Checklist przed każdą wysyłką

- [ ] Sprawdziłem, że wysyłam **tylko** `.so` + `INTEGRATION_README.txt`.
- [ ] Token był wygenerowany dla właściwego `product_id`.
- [ ] Jeśli miała być licencja czasowa — sprawdziłem `not_after` (Unix → data czytelna).
- [ ] Jeśli miała być machine-locked — wkleiłem właściwy fingerprint (64 hex).
- [ ] Token i `.so` idą **różnymi kanałami**.
- [ ] Nie załączam kodu źródłowego (`.c/.h/.py`).
- [ ] Nie załączam `issue_license.py`.
- [ ] Zapisałem u siebie: `licensee_id → data → tier → not_after → machine_hash → token`.

---

## 10. Model biznesowy — sugerowane tiers

| Tier | Silnik | Feature | Czas | Machine binding | Zastosowanie |
|---|---|---|---|---|---|
| Eval | v1.0 | CORE | 30 dni | tak | ocena laboratoryjna |
| Standard | v1.1 | CORE | 12 mies. | tak | pojedynczy czujnik live |
| Pro | v1.1 | CORE | 12 mies. | floating | flota jednoosiowa |
| Spatial | v2.0 | CORE + SPATIAL | 12 mies. | tak | 3-osiowe diagnostyki premium |
| Enterprise | dowolny | dowolne | perpetual | floating | white-label, kontrakt indywidualny |

---

## 11. Kontakt operacyjny

- **Wystawianie licencji:** tylko Twój lokalny `issue_license.py` z sekretem.
- **Wsparcie klienta:** `bramadna718@gmail.com`.
- **Repozytorium:** `Zeta-Core/` w projekcie brama-dna718 — publicznie widać tylko `.so` (jako *"binary file not shown"*) i README.

---

## 12. Awaryjne scenariusze

| Scenariusz | Reakcja |
|---|---|
| Klient twierdzi że dostaje `-3` po skopiowaniu tokenu | Whitespace w mailu — poproś o token bez łamania linii. |
| Klient dostaje `-5` mimo bindingu do właściwej maszyny | Odpalają w kontenerze bez `/etc/machine-id` — wystaw token floating lub daj im mount `--read-only` machine-id. |
| Dostajesz zgłoszenie że silnik działa **bez** tokenu | Niemożliwe — silnik zwraca `-2` przy `NULL`. Prawdopodobnie testują `run_zeta_diagnostic` z dowolnym stringiem który przypadkiem parsuje się do pustego tokenu → to `-2`, nie `0`. Poproś o `rc`. |
| Wyciekł sekret HMAC | Nowa binarka z nowym sekretem, nowa wersja (`v1.2`, `v2.1`), rotacja u wszystkich aktywnych klientów, poprzednia wersja `.so` usunięta z repo. |
| Klient odsprzedał `.so` innej firmie | Machine binding to blokuje. Dla floating: `licensee_id` w tokenie identyfikuje sprawcę — masz dowód pochodzenia. |

---

**Koniec instrukcji.** Trzymaj ten plik w prywatnym miejscu (np. lokalny sejf haseł, prywatne repo). W publicznym `Zeta-Core/` na GitHubie jest tylko `README.md` bez sekretów.
