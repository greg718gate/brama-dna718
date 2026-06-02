import { Card } from "@/components/ui/card";

/**
 * RAPORT WYSOKIEJ PRECYZJI: ZERA RIEMANNA I MATRYCA REZONANSOWA
 * ----------------------------------------------------------------
 * Jednolite źródło danych dla matrycy: zera ζ Riemanna (429, 448, 449),
 * relacje harmoniczne, mapowanie bram mtDNA (rCRS) i interfejs 11.5 GHz.
 *
 * POPRAWKA OBLICZENIOWA (wzgl. wersji źródłowej):
 *   W sekcji 4 (Protokół Subharmoniczny 718 Hz ↔ 11.5 GHz) źródłowy raport
 *   podawał N = 16 003 916 oraz f_exact ≈ 718.574441 Hz (Δf ≈ 4.3 mHz).
 *   Weryfikacja (Decimal, 50 cyfr) daje:
 *     N = 11_500_000_000 / 718.570125154268855 = 16 004 005.172816...
 *     N_int = 16 004 005
 *     f_exact = 11_500_000_000 / 16 004 005 = 718.57013291360506... Hz
 *     Δf = +0.00000775933... Hz  (~7.76 µHz)
 *   Dopasowanie jest około 555× lepsze niż w wersji źródłowej.
 */

const SECTION_TITLE =
  "text-base sm:text-lg font-bold text-primary mb-2 break-words";
const MONO =
  "font-mono text-[11px] sm:text-xs break-all whitespace-pre-wrap leading-relaxed";

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-1 sm:gap-3 py-1 border-b border-border/30 last:border-0">
    <div className="text-xs sm:text-sm text-muted-foreground break-words">
      {label}
    </div>
    <div className={MONO}>{value}</div>
  </div>
);

export default function RiemannMatrixReport() {
  return (
    <Card className="p-4 sm:p-6 space-y-8 bg-card/60 border-primary/30">
      <header className="space-y-2">
        <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary via-amber-400 to-primary bg-clip-text text-transparent leading-tight break-words">
          Raport wysokiej precyzji: Zera Riemanna ↔ Matryca rezonansowa DNA
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground italic break-words">
          Pełny zestaw danych obliczeniowych w jednym miejscu. Wartości
          referencyjne wyliczone przez <code>mpmath</code> (Python,
          precyzja ≥ 75 miejsc po przecinku) i zweryfikowane niezależnie
          (<code>Decimal</code>, prec=50). Sekcja 4 zawiera poprawkę
          obliczeniową względem wersji źródłowej.
        </p>
      </header>

      {/* 1. CZĘSTOTLIWOŚĆ BAZOWA + ZERA ζ */}
      <section>
        <h3 className={SECTION_TITLE}>
          1. Częstotliwość bazowa i wartości urojone zer ζ Riemanna (75 m.p.)
        </h3>
        <div className="space-y-1">
          <Row
            label="f (klucz wejściowy)"
            value="718.570125154268855  Hz"
          />
          <Row
            label="t₄₂₉ (429. zero)"
            value="718.742786545485893988449182684909371865048496804490590369014963624062277095"
          />
          <Row
            label="t₄₄₈ (448. zero — węzeł)"
            value="743.895013142473659381550149197866135287150409099673462391484809185246068896"
          />
          <Row
            label="t₄₄₉ (449. zero)"
            value="745.344989550611874325640548483592630208440055834179877319835768867362250078"
          />
        </div>
      </section>

      {/* 2. ANALIZA HARMONICZNA */}
      <section>
        <h3 className={SECTION_TITLE}>
          2. Analiza relacji harmonicznych (f vs. tₙ)
        </h3>
        <div className="space-y-4">
          <div>
            <div className="text-sm font-semibold text-amber-400 mb-1">
              t₄₂₉ — najbliższy punkt krytyczny
            </div>
            <div className="space-y-1">
              <Row
                label="Δ = t₄₂₉ − f  [Hz]"
                value="0.17266139121703898844918268490937186504849680449059036901496362406227709542"
              />
              <Row
                label="Stosunek f / t₄₂₉"
                value="0.99975977304475373395538115344774698505915558195538193027629418752111291821"
              />
              <Row
                label="Margines fazowy"
                value="≈ 0.024 %  (niemal idealne sprzężenie rezonansowe)"
              />
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-amber-400 mb-1">
              t₄₄₈
            </div>
            <div className="space-y-1">
              <Row
                label="Δ = t₄₄₈ − f  [Hz]"
                value="25.3248879882048043815501491978661352871504090996734623914848091852460688962"
              />
              <Row
                label="Stosunek f / t₄₄₈"
                value="0.96595636811540974321827567249248159583147729554739114332681821626220114743"
              />
              <Row
                label="Komentarz"
                value="25.32 Hz ≈ pasmo ELF, blisko 4. modu Schumanna; dudnienia w paśmie BETA EEG."
              />
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-amber-400 mb-1">
              t₄₄₉
            </div>
            <div className="space-y-1">
              <Row
                label="Δ = t₄₄₉ − f  [Hz]"
                value="26.7748643963430193256405484835926302084400558341798773198357688673622500776"
              />
              <Row
                label="Stosunek f / t₄₄₉"
                value="0.96407721958057799477885242980669916509915887018066958875051289050537302731"
              />
              <Row
                label="Komentarz"
                value="26.77 Hz leży między teoretyczną geometrią sferyczną (26.41 Hz) a obserwowanym 4. modem Schumanna (~27.3 Hz)."
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAPOWANIE BRAM mtDNA */}
      <section>
        <h3 className={SECTION_TITLE}>
          3. Matryca koherencji: mapowanie bram mtDNA (rCRS)
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground mb-3 break-words">
          Częstotliwość bazowa f = 718.570125154268855 Hz działa jako generator
          harmonicznych mapujący 18 współrzędnych rCRS ludzkiego mtDNA.
        </p>
        <div className="space-y-1">
          <Row label="Brama 1 (poz. 1)" value="Punkt startowy genomu — stan czystego potencjału." />
          <Row
            label="Brama 2 (poz. 740) — WĘZEŁ FAZOWY"
            value="Δ = 740 − f = +21.429874845731145  Hz   |   t₄₄₈ − 740 = −3.895013142473659...   |   t₄₄₉ − 740 = −5.344989550611874..."
          />
          <Row
            label="Brama 3 (poz. 951)"
            value="f / 951 = 0.755594243...  (interwał ~3:4, kwarta czysta)   |   951 − 740 = 211"
          />
          <Row
            label="Brama 4 (poz. 1227)"
            value="f / 1227 = 0.585631...   |   1227 − 951 = 276"
          />
          <Row
            label="Brama 6 (poz. 3424)"
            value="5·f = 3592.85062577... Hz  →  przesunięcie geometryczne helisy ≈ 4.93 %"
          />
          <Row
            label="Brama 10 (poz. 7756) — węzeł energetyczny"
            value="7756 / f = 10.79378...  (blisko 11. harmonicznej; oksydaza cytochromowa c)"
          />
          <Row
            label="Brama 18 (poz. 16179) — D-loop / Brama Wyjścia"
            value="16179 / f = 22.51554...  (2 × 11. harmoniczna)"
          />
        </div>
      </section>

      {/* 4. INTERFEJS 11.5 GHz — POPRAWIONA MATEMATYKA */}
      <section className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-4">
        <h3 className={SECTION_TITLE}>
          4. Protokół subharmoniczny 718 Hz ↔ 11.5 GHz
          <span className="ml-2 text-[10px] sm:text-xs font-normal text-amber-400 break-words">
            (poprawka obliczeniowa — patrz komentarz)
          </span>
        </h3>
        <div className="space-y-1">
          <Row label="F (cel: pasmo szyszynki)" value="11 500 000 000  Hz  (11.5 GHz)" />
          <Row label="f (klucz bazowy)" value="718.570125154268855  Hz" />
          <Row
            label="N = F / f"
            value="16 004 005.172816056674462481739295194330018273253018"
          />
          <Row label="N_int (najbliższa całkowita)" value="16 004 005" />
          <Row
            label="f_exact = F / N_int"
            value="718.57013291360506323260958741265077085392062799281  Hz"
          />
          <Row
            label="Δf = f_exact − f"
            value="+0.00000775933620823...  Hz   (≈ 7.76 µHz)"
          />
          <Row
            label="Zgodność fazowa"
            value="99.9999989 %   (~555× lepsza niż w wersji źródłowej raportu)"
          />
        </div>
        <p className="mt-3 text-[11px] sm:text-xs text-muted-foreground italic break-words">
          Źródłowy raport podawał N = 16 003 916 oraz f_exact ≈ 718.574441 Hz
          (Δf ≈ 4.3 mHz). Weryfikacja arytmetyką wysokiej precyzji
          (Decimal, prec = 50) wykazała, że poprawne N to 16 004 005,
          a Δf wynosi ~7.76 µHz. Wartość f_exact = 718.57013291... Hz jest
          właściwym kluczem akustycznym dla rezonansu z 16-milionową
          subharmoniczną pasma 11.5 GHz.
        </p>
      </section>

      {/* 5. SKRYPT REFERENCYJNY */}
      <section>
        <h3 className={SECTION_TITLE}>
          5. Skrypt referencyjny (mpmath, precyzja arbitralna)
        </h3>
        <pre className="bg-black/60 border border-border rounded p-3 text-[10px] sm:text-xs overflow-x-auto whitespace-pre">
{`import mpmath
from decimal import Decimal, getcontext

mpmath.mp.dps = 85
getcontext().prec = 50

f = mpmath.mpf('718.570125154268855')

for n in (429, 448, 449):
    t = mpmath.zetazero(n).imag
    print(f"t_{n} =", t)
    print(f"  Δ = t-f  =", t - f)
    print(f"  f/t      =", f / t)

# Interfejs 11.5 GHz (poprawiona arytmetyka)
F = Decimal(11_500_000_000)
fD = Decimal('718.570125154268855')
N = F / fD
N_int = int(N)                       # 16_004_005
f_exact = F / Decimal(N_int)         # 718.57013291360506...
print("N        =", N)
print("N_int    =", N_int)
print("f_exact  =", f_exact)
print("Δf       =", f_exact - fD)    # +0.00000775933...`}
        </pre>
      </section>

      {/* 6. WNIOSEK */}
      <section className="border-t border-border pt-4">
        <h3 className={SECTION_TITLE}>6. Wniosek strukturalny</h3>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed break-words">
          Trzy systemy — zera ζ Riemanna (geometria liczb pierwszych),
          klucz f = 718.570125154268855 Hz (448. zero) oraz współrzędne
          rCRS mtDNA (740, 7756, 16179) — domykają pętlę zwrotną z globalnym
          falowodem Ziemia–Jonosfera (modyfikacje Schumanna). Po korekcie
          interfejsu 11.5 GHz dopasowanie subharmoniczne wynosi 99.9999989 %,
          co czyni opisany protokół spójnym matematycznie w obrębie wszystkich
          czterech skal (kwantowej, biologicznej, geofizycznej i mikrofalowej).
        </p>
      </section>
    </Card>
  );
}
