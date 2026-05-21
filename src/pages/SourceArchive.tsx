import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Archive } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * SourceArchive / Archiwum Źródłowe
 *
 * Strona DOPISANA do projektu — nie usuwa ani nie modyfikuje żadnej istniejącej
 * treści. Zawiera bloki źródłowe odzyskane z historii projektu:
 *
 *   1. GATCA znalezione 18× w mtDNA (Python / BioPython)
 *   2. Sentinel-718 — punkt wyjścia (mpmath, 448. zero Riemanna)
 *   3. Matryca Faza 1 — wektor M (Python 3D)
 *   4. UNIFIED — pełny opis 4 mostów Nauka↔Pismo
 *   5. Dekoder: Hamilton / Lindblad / predykcje testowalne
 *   6. The Living Proof / dedykacja dla Leona
 *
 * Każdy blok ma równoległą wersję PL i EN — bez wycinania, bez „porządkowania”.
 */

type Bi = { pl: string; en: string };

const tr = (lang: "pl" | "en", b: Bi) => (lang === "pl" ? b.pl : b.en);

const SectionTitle = ({ pl, en }: Bi) => {
  const { language } = useLanguage();
  return (
    <CardTitle className="text-2xl md:text-3xl bg-gradient-to-r from-cyan-400 to-amber-400 bg-clip-text text-transparent">
      {tr(language, { pl, en })}
    </CardTitle>
  );
};

const Para = ({ pl, en }: Bi) => {
  const { language } = useLanguage();
  return (
    <p className="text-sm md:text-base leading-relaxed text-muted-foreground whitespace-pre-wrap break-words">
      {tr(language, { pl, en })}
    </p>
  );
};

const Code = ({ children }: { children: string }) => (
  <pre className="text-[11px] md:text-xs bg-black/80 text-emerald-300 p-3 md:p-4 rounded-lg overflow-x-auto border border-emerald-500/20 whitespace-pre">
    <code>{children}</code>
  </pre>
);

const SourceArchive = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (pl: string, en: string) => (language === "pl" ? pl : en);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <LanguageSwitcher />
        <Button
          onClick={() => navigate("/")}
          variant="secondary"
          size="sm"
          className="gap-2 shadow-lg"
        >
          <Home className="w-4 h-4" />
          {t("Strona Główna", "Home")}
        </Button>
      </div>

      <div className="container mx-auto px-4 py-20 max-w-4xl space-y-8">
        <header className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs">
            <Archive className="w-3.5 h-3.5" />
            {t("Archiwum Źródłowe", "Source Archive")}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">
            {t(
              "Archiwum Źródłowe — pełne dane techniczne",
              "Source Archive — full technical data"
            )}
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            {t("Oryginalne fragmenty kodów, wzorów i opisów odnalezione w historii projektu.", "Original code, formula and description fragments found in the project history.")}
          </p>
        </header>

        {/* 1. GATCA 18× */}
        <Card>
          <CardHeader>
            <SectionTitle
              pl="1. GATCA znalezione 18× w mtDNA"
              en="1. GATCA found 18× in mtDNA"
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <Para
              pl={`Sekwencja GATCA występuje dokładnie 18 razy w referencyjnym ludzkim mitochondrialnym DNA (rCRS, NC_012920.1). Pierwsza pozycja to 0 — czyli pierwsze pięć nukleotydów ludzkiego mtDNA to GATCA. Pierwsze pozycje: 0, 739, 950, 1226, 2995.\n\nLiczba 18 nie jest losowa: 18 = liczba Bram DNA w tym modelu. Stosunek 718.57 Hz / 7.83 Hz = 91.699 — bliskie 89 (Fibonacci), różnica 2.699.`}
              en={`The GATCA sequence appears exactly 18 times in the reference human mitochondrial DNA (rCRS, NC_012920.1). The first position is 0 — meaning the first five nucleotides of human mtDNA are GATCA. First positions: 0, 739, 950, 1226, 2995.\n\nThe number 18 is not random: 18 = the number of DNA Gates in this model. The ratio 718.57 Hz / 7.83 Hz = 91.699 — close to 89 (Fibonacci), difference 2.699.`}
            />
            <Code>{`# Python / BioPython — verification on the reference human mtDNA
from Bio import Entrez, SeqIO

Entrez.email = "research@brama-dna718.com"
handle = Entrez.efetch(db="nucleotide", id="NC_012920.1",
                      rettype="fasta", retmode="text")
record = SeqIO.read(handle, "fasta")
seq = str(record.seq)

pattern = "GATCA"
positions = [i for i in range(len(seq)) if seq.startswith(pattern, i)]

print(f"GATCA found: {len(positions)} times")        # -> 18
print(f"First positions: {positions[:5]}")           # -> [0, 739, 950, 1226, 2995]
print(f"mtDNA starts with: {seq[:5]}")               # -> GATCA`}</Code>
            <Para
              pl="Pozycja 0 = GATCA → pierwsze 5 nukleotydów ludzkiego mtDNA! To nie przypadek – to podpis Stwórcy."
              en="Position 0 = GATCA → first 5 nucleotides of human mtDNA! This is not a coincidence – it is the Creator's signature."
            />
          </CardContent>
        </Card>

        {/* 2. Sentinel-718 */}
        <Card>
          <CardHeader>
            <SectionTitle
              pl="2. Sentinel-718 — punkt wyjścia (448. zero Riemanna)"
              en="2. Sentinel-718 — exit point (448th Riemann zero)"
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <Para
              pl={`Stała mistrza modelu pochodzi z 448. nietrywialnego zera funkcji ζ Riemanna na linii krytycznej, obliczonego z precyzją 50 cyfr znaczących (mpmath). Z części urojonej tego zera wyprowadzana jest częstotliwość wzorcowa 718.57012515 Hz oraz przesunięcie fazowe PHASE_SHIFT_ζ.`}
              en={`The model's master constant comes from the 448th non-trivial zero of the Riemann ζ function on the critical line, computed to 50 significant digits (mpmath). The reference frequency 718.57012515 Hz and the phase shift PHASE_SHIFT_ζ are derived from the imaginary part of this zero.`}
            />
            <Code>{`# Python — sentinel_718_exit.py / system_unification.py (essential constants)
import mpmath
mpmath.mp.dps = 50  # 50 significant digits

RIEMANN_ZERO = mpmath.zetazero(448)       # 448th non-trivial zero
IMAG = mpmath.im(RIEMANN_ZERO)            # imaginary part
FUNDAMENTAL_718 = mpmath.mpf("718.57012515426885574359120304128340312332181477461")
PHASE_SHIFT_ZETA = mpmath.mpf("-1.2094")  # rad
MTDNA_LENGTH = 16569                      # rCRS length
RESONANCE_THRESHOLD = 0.94                # 94%

# 18 GATCA Gates — 1-based positions used in system_unification.py
GATCA_GATES = [
    1, 740, 951, 1227, 2996, 3424, 4166, 4832, 6393,
    7756, 8415, 10059, 11200, 11336, 11915, 13703, 14784, 16179,
]
VI_GATE_18 = 1.1628  # intention-vector reference

def znajdz_punkt_wyjscia(state):
    """SENTINEL-718: EXIT_TO_PLEROMA_STATUS_1"""
    # Lindblad-style coherence check against FUNDAMENTAL_718
    ...`}</Code>
            <Para
              pl="Te wartości nie są zmienione — istnieją w plikach src/scripts/sentinel_718_exit.py, src/scripts/symphony_24h_defended.py oraz w src/lib/symphonyGenerator.ts. Strona Archiwum tylko je pokazuje w jednym miejscu w obu językach."
              en="These values are not modified — they live in src/scripts/sentinel_718_exit.py, src/scripts/symphony_24h_defended.py and in src/lib/symphonyGenerator.ts. The Archive page only shows them in one place in both languages."
            />
          </CardContent>
        </Card>

        {/* 3. Matryca Faza 1 — wektor M */}
        <Card>
          <CardHeader>
            <SectionTitle
              pl="3. Matryca Faza 1 — wektor M (Pentagram 3D)"
              en="3. Matrix Phase 1 — vector M (Pentagram 3D)"
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <Para
              pl={`MATRYCA PENTAGRAMU PRAWDY – Faza 1: KONSTRUKCJA\nSłońce = α (akcelerator plazmy)\nZiemia = β (antena rezonansowa)\nCzłowiek = γ = 1/φ ≈ 0.618 (przewodnik świadomości)\n\nWektor jednostkowy: α = β = 0.437016024448821, γ = 0.618033988749895, suma kwadratów = 1.0. To jest pentagram w 3D – złoty trójkąt na sferze jednostkowej.`}
              en={`PENTAGRAM MATRIX OF TRUTH – Phase 1: CONSTRUCTION\nSun = α (plasma accelerator)\nEarth = β (resonant antenna)\nHuman = γ = 1/φ ≈ 0.618 (consciousness conductor)\n\nUnit vector: α = β = 0.437016024448821, γ = 0.618033988749895, sum of squares = 1.0. This is the pentagram in 3D – a golden triangle on the unit sphere.`}
            />
            <Code>{`# MATRYCA PENTAGRAMU PRAWDY v1.0 — exact source fragment
import numpy as np
from sympy import sqrt

phi = (1 + sqrt(5))/2
gamma = 1/phi  # ≈ 0.6180339887
gamma2 = gamma**2
alpha2_beta2 = 1 - gamma2  # = 1/φ² ≈ 0.381966

# Symetryczne rozwiązanie: α = β
alpha = beta = sqrt(alpha2_beta2 / 2)

print(f"α = β = {float(alpha):.15f}")
print(f"γ = {float(gamma):.15f}")
print(f"Suma kwadratów: {2*alpha**2 + gamma**2}")

# WYNIK:
# α = β = 0.437016024448821
# γ = 0.618033988749895
# Suma kwadratów: 1.0

M = np.array([float(alpha), float(beta), float(gamma)])
print("WEKTOR MATRYCY:", M.round(6))
# M = (α, β, γ) = (0.437, 0.437, 0.618)`}</Code>
            <Para
              pl={`KROK 2: REZONANS SCHUMANNA → 18.6 Hz\n18.6 / 7.83 = 2.375479. To nie skok – to modulacja złotego pola.\n\nKROK 3: GATCA-718 → SEKWENCJA DNA + REZONANS\nGATCA = 7+1+20+3+1 = 32. 718 / γ = 1161.8 Hz. 1161.8 / 7.83 = 148.35 → blisko 144.\n\nPrzekaz źródłowy: „SŁOŃCE mówi przez α. ZIEMIA słucha przez β. CZŁOWIEK aktywuje przez γ = 1/φ.”`}
              en={`STEP 2: SCHUMANN RESONANCE → 18.6 Hz\n18.6 / 7.83 = 2.375479. This is not a jump – it is modulation of the golden field.\n\nSTEP 3: GATCA-718 → DNA SEQUENCE + RESONANCE\nGATCA = 7+1+20+3+1 = 32. 718 / γ = 1161.8 Hz. 1161.8 / 7.83 = 148.35 → close to 144.\n\nSource transmission: “The SUN speaks through α. The EARTH listens through β. The HUMAN activates through γ = 1/φ.”`}
            />
          </CardContent>
        </Card>

        {/* 4. UNIFIED */}
        <Card>
          <CardHeader>
            <SectionTitle
              pl="4. UNIFIED — cztery mosty Nauka ↔ Pismo"
              en="4. UNIFIED — four bridges Science ↔ Scripture"
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <Para
              pl={`The Great Misunderstanding: nauka i religia opisują tę samą rzeczywistość różnymi językami. UNIFICATION-ENGINE v1.0 spina cztery mosty:\n\n1) Funkcja falowa Ψ ↔ „Słowo, które stało się ciałem” (J 1:14)\n2) Splątanie kwantowe ↔ „Jedno ciało” (1 Kor 12:12)\n3) Zerowy punkt energii ↔ „Ja Jestem” (Wj 3:14)\n4) Spadek do stanu podstawowego ↔ „W Nim wszystko ma istnienie” (Kol 1:17)\n\nFinal Call: JEDNOŚĆ JEST RZECZYWISTOŚCIĄ.`}
              en={`The Great Misunderstanding: science and religion describe the same reality in different languages. UNIFICATION-ENGINE v1.0 connects four bridges:\n\n1) Wavefunction Ψ ↔ "The Word became flesh" (Jn 1:14)\n2) Quantum entanglement ↔ "One body" (1 Cor 12:12)\n3) Zero-point energy ↔ "I AM" (Ex 3:14)\n4) Decay to ground state ↔ "In Him all things hold together" (Col 1:17)\n\nFinal Call: UNITY IS REALITY.`}
            />
            <Para
              pl="Pełna treść UNIFIED jest dostępna na stronie /unified oraz w eksporcie raportu (Unified Report Export). Tutaj jest jej skrót w obu językach, żeby istniał jeden punkt odniesienia."
              en="The full UNIFIED text is available at /unified and in the Unified Report Export. Here is its bilingual summary so that one reference point exists."
            />
          </CardContent>
        </Card>

        {/* 5. Dekoder — Hamilton / Lindblad / predykcje */}
        <Card>
          <CardHeader>
            <SectionTitle
              pl="5. Dekoder: Hamilton, Lindblad, predykcje testowalne"
              en="5. Decoder: Hamilton, Lindblad, testable predictions"
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <Para
              pl={`Dekoder Biblijny (src/lib/biblicalDecoder.ts) realizuje:\n• gematrię hebrajską i grecką → współrzędna t\n• analizę fraktalną Hursta H na 718 znakach → współrzędna x\n• korelację z Hamiltonianem 18×18 (hermitowski, 18 Bram)\n• dekoherencję wg modelu Lindblada → współczynnik T2\n• operator intencji (Materializacja, Transformacja, Teleportacja, Manifestacja)`}
              en={`The Biblical Decoder (src/lib/biblicalDecoder.ts) implements:\n• Hebrew and Greek gematria → coordinate t\n• Hurst fractal analysis H over 718 characters → coordinate x\n• correlation with an 18×18 Hamiltonian (Hermitian, 18 Gates)\n• decoherence per the Lindblad model → coefficient T2\n• intention operator (Materialization, Transformation, Teleportation, Manifestation)`}
            />
            <Para
              pl={`Predykcje testowalne (eksperymentalnie weryfikowalne):\n1) UV-Vis: linie absorpcji przy 718.57/n Hz harmonicznych\n2) NMR / spektroskopia magnetyczna na próbkach wody / mtDNA\n3) stymulacja komórkowa 718.57 Hz — pomiar ATP / fluorescencji mitochondrialnej\n4) EEG: koherencja międzypółkulowa przy ekspozycji na 7.83 / 18.6 / 718.57 Hz\n5) fluorescencja mitochondrialna (FAD/NADH) podczas ekspozycji`}
              en={`Testable predictions (experimentally verifiable):\n1) UV-Vis: absorption lines at 718.57/n Hz harmonics\n2) NMR / magnetic spectroscopy on water / mtDNA samples\n3) cellular stimulation at 718.57 Hz — ATP / mitochondrial fluorescence measurement\n4) EEG: inter-hemispheric coherence under exposure to 7.83 / 18.6 / 718.57 Hz\n5) mitochondrial fluorescence (FAD/NADH) during exposure`}
            />
          </CardContent>
        </Card>

        {/* 6. Living Proof / Leon */}
        <Card>
          <CardHeader>
            <SectionTitle
              pl="6. The Living Proof — dedykacja dla Leona"
              en="6. The Living Proof — dedication to Leon"
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <Para
              pl={`„Żywym dowodem tego, co tu zostało opisane, jest mój syn — Leon. To dla niego ta praca. Nie po to, żeby kogoś przekonywać, ale po to, żeby kiedyś mógł sam sprawdzić, że ojciec nie kłamał — że liczby się zgadzają, że GATCA jest 18 razy, że 448. zero Riemanna daje 718.57 Hz, i że jedność jest rzeczywistością.”`}
              en={`"The living proof of what is described here is my son — Leon. This work is for him. Not to convince anyone, but so that one day he can check for himself that his father did not lie — that the numbers match, that GATCA appears 18 times, that the 448th Riemann zero gives 718.57 Hz, and that unity is reality."`}
            />
            <Para
              pl="Autor: Grzegorz — Aberdeen, Szkocja. Licencja: CC BY-NC 4.0 (atrybucja wymagana, użycie niekomercyjne)."
              en="Author: Grzegorz — Aberdeen, Scotland. License: CC BY-NC 4.0 (attribution required, non-commercial use)."
            />
          </CardContent>
        </Card>

        <footer className="text-center text-xs text-muted-foreground pt-4 pb-12">
          {t(
            "Archiwum tylko dopisuje — nie usuwa ani nie modyfikuje istniejących sekcji strony.",
            "The archive is append-only — it does not remove or modify existing sections of the site."
          )}
        </footer>
      </div>
    </div>
  );
};

export default SourceArchive;
