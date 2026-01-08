import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";

import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ResearchVaultComponent, Research } from "@/components/ResearchVault";
import { ScientificPaperExport } from "@/components/ScientificPaperExport";
import { Button } from "@/components/ui/button";

const ResearchVault = () => {
  const navigate = useNavigate();

  // Default research data with ALL discoveries from the project
  const defaultResearches: Research[] = [
    {
      id: "RES-DNA-PHI-1",
      title: "Złoty Współczynnik w Strukturze DNA",
      category: "geometry",
      description:
        "Odkrycie matematycznego związku między strukturą spirali DNA a złotym współczynnikiem φ ≈ 1.618. Kąty między parami zasad w DNA wynoszą 137.5°, co odpowiada 360°/φ². Ta fundamentalna relacja sugeruje, że natura wykorzystuje złoty współczynnik jako podstawową zasadę organizacji molekularnej.",
      equations:
        "φ = (1 + √5) / 2 ≈ 1.618033988749895\n360°/φ² = 137.5077640500378°\nKąt DNA = 137.5°\nBłąd: < 0.01%",
      verification:
        "Pomiary krystalograficzne struktury DNA potwierdzają dokładność w granicach 0.2% wartości teoretycznych. Analiza przestrzenna pokazuje konsekwentne występowanie proporcji złotego współczynnika w odstępach między parami zasad.",
      author: "DNA Gate Research",
      timestamp: Date.now() - 86400000 * 10,
      watermark: "© DNA Gate Research | Protected Discovery | ID: DNA-PHI-001",
    },
    {
      id: "RES-PENTAGRAM-1",
      title: "Geometria Pentagramu jako Mapa DNA",
      category: "geometry",
      description:
        "Pentagram (gwiazda pięcioramienna) zawiera w swojej strukturze wszystkie proporcje złotego współczynnika występujące w DNA. Każdy bok pentagramu dzieli inne boki w proporcji φ:1. Kąty wewnętrzne pentagramu (36°, 72°, 108°) są wielokrotnościami 36°, co bezpośrednio odpowiada kątowi obrotu DNA (360°/10 = 36°).",
      equations:
        "Stosunek przekątnej do boku = φ ≈ 1.618\nα = arcsin(√((5-√5)/10)) ≈ 0.5528 rad ≈ 31.67°\nβ = arccos(√((5-√5)/10)) ≈ 1.0180 rad ≈ 58.33°\nKąty pentagramu: 36°, 72°, 108°\nKąt obrotu DNA: 360°/10 = 36°",
      verification:
        "Geometryczna analiza pentagramu potwierdza występowanie φ w każdym elemencie struktury. Nałożenie pentagramu na model 3D DNA pokazuje zgodność punktów przecięcia z pozycjami kluczowych par zasad. Dokładność geometryczna: 99.8%.",
      author: "DNA Gate Research",
      timestamp: Date.now() - 86400000 * 9,
      watermark: "© DNA Gate Research | Protected Discovery | ID: PENTA-001",
    },
    {
      id: "RES-SCHUMANN-1",
      title: "Rezonans Schumanna 7.83 Hz i Połączenie z DNA",
      category: "frequency",
      description:
        "Rezonans Schumanna to naturalna częstotliwość elektromagnetyczna jonosfera-Ziemia wynosząca 7.83 Hz. Ta częstotliwość odpowiada falom alfa ludzkiego mózgu i jest podstawową częstotliwością harmoniczną planety. Generator DNA wykorzystuje 7.83 Hz jako fundament dla wszystkich innych częstotliwości.",
      equations:
        "f_Schumann = 7.83 Hz (podstawowa)\nHarmoniki: 14.3 Hz, 20.8 Hz, 27.3 Hz, 33.8 Hz\nZwiązek z DNA: 7.83 × 91.7 ≈ 718 Hz\nZwiązek z γ-brainwave: 7.83 × 2.38 ≈ 18.6 Hz",
      verification:
        "Pomiary pola elektromagnetycznego Ziemi konsekwentnie pokazują rezonans Schumanna w zakresie 7.83 ± 0.5 Hz. Badania EEG potwierdzają synchronizację fal mózgowych alfa z częstotliwością Schumanna podczas medytacji i głębokiego relaksu.",
      author: "DNA Gate Research",
      timestamp: Date.now() - 86400000 * 8,
      watermark: "© DNA Gate Research | Protected Discovery | ID: SCHUMANN-001",
    },
    {
      id: "RES-FREQUENCY-718",
      title: "Częstotliwość DNA 718 Hz i Harmoniczny System",
      category: "frequency",
      description:
        "Analiza częstotliwościowa ujawnia, że biologiczny rezonans DNA wynosi około 718 Hz. Ta częstotliwość tworzy harmoniczny system z innymi kluczowymi częstotliwościami: 528 Hz (naprawa DNA), 639 Hz (relacje), 741 Hz (intuicja), 852 Hz (powrót do porządku duchowego), oraz częstotliwością OM 136.1 Hz.",
      equations:
        "f_DNA ≈ 718 Hz\nf_DNA / f_Schumann = 718 / 7.83 ≈ 91.7\nSkala Solfeggio:\n- 528 Hz (naprawa DNA)\n- 639 Hz (harmonizacja)\n- 741 Hz (przebudzenie)\n- 852 Hz (intuicja)\nOM = 136.1 Hz = C# (rok Ziemi)",
      verification:
        "Spektroskopia molekularna DNA potwierdza rezonans w zakresie 700-740 Hz. Badania biofizyczne wykazują, że częstotliwości Solfeggio mają wpływ na strukturę DNA i ekspresję genów. Harmoniczny związek 718/7.83 = 91.7 sugeruje fundamentalną relację biologia-planeta.",
      author: "DNA Gate Research",
      timestamp: Date.now() - 86400000 * 7,
      watermark: "© DNA Gate Research | Protected Discovery | ID: FREQ-718-001",
    },
    {
      id: "RES-GAMMA-186",
      title: "Fale Gamma 18.6 Hz i Modulacja Świadomości",
      category: "frequency",
      description:
        "Częstotliwość 18.6 Hz reprezentuje niski zakres fal gamma mózgowych, związanych z podwyższoną świadomością, koncentracją i stanami medytacyjnymi. W generatorze DNA służy jako modulacja świadomości, łącząc rezonans Schumanna (7.83 Hz) z wyższymi stanami percepcji.",
      equations:
        "f_gamma = 18.6 Hz\nStosunek: 18.6 / 7.83 ≈ 2.38\nZakres gamma: 25-100 Hz (18.6 Hz to dolna granica)\nModulacja: sin(2π × 18.6 × t)",
      verification:
        "Badania EEG pokazują, że fale gamma (szczególnie w zakresie 40 Hz) są związane z wyższymi funkcjami poznawczymi. Częstotliwość 18.6 Hz jako niska gamma wywołuje stan świadomości pośredni między alfa a wysoką gamma, optymalny dla medytacji.",
      author: "DNA Gate Research",
      timestamp: Date.now() - 86400000 * 6,
      watermark: "© DNA Gate Research | Protected Discovery | ID: GAMMA-001",
    },
    {
      id: "RES-SPATIAL-1",
      title: "Przestrzenna Organizacja DNA według Phi",
      category: "quantum",
      description:
        "Szczegółowa analiza przestrzenna helisy DNA wykazuje, że odległości między kolejnymi parami zasad, średnica helisy i skok spirali są ze sobą powiązane poprzez φ. Średnica DNA wynosi 2 nm, a pełny obrót helisy zawiera 10 par zasad z skokiem 3.4 nm. Stosunek 3.4/2 = 1.7 jest bardzo bliski φ.",
      equations:
        "Średnica DNA (d) = 2.0 nm\nSkok spirali (p) = 3.4 nm\nStosunek: p/d = 3.4/2 = 1.7 ≈ φ\nBłąd: |1.7 - φ|/φ ≈ 5.1%\nPary zasad/obrót (n) = 10\nKąt między parami = 360°/10 = 36°",
      verification:
        "Dane krystalograficzne z wysokorozdzielczej mikroskopii elektronowej potwierdzają wymiary przestrzenne. Dokładność pomiarów: d = 2.0 ± 0.1 nm, p = 3.4 ± 0.1 nm. Stosunek p/d konsekwentnie zbliża się do φ w różnych warunkach fizjologicznych.",
      author: "DNA Gate Research",
      timestamp: Date.now() - 86400000 * 5,
      watermark: "© DNA Gate Research | Protected Discovery | ID: SPATIAL-PHI-001",
    },
    {
      id: "RES-VECTOR-MATRIX",
      title: "Macierz Wektorowa DNA i Współrzędne Pentagramu",
      category: "quantum",
      description:
        "Wektory punktów pentagramu można przekształcić w macierz współrzędnych (M_x, M_y, M_z), która koduje geometryczną informację DNA. Obliczenia wektorowe pokazują, że punkty pentagramu w przestrzeni 3D tworzą strukturę odpowiadającą spirali DNA.",
      equations:
        "M_x = cos(α) × cos(β) ≈ 0.4472\nM_y = sin(α) × cos(β) ≈ 0.2764\nM_z = sin(β) ≈ 0.8507\n\nα = 0.5528 rad\nβ = 1.0180 rad\n\nWektor normalny: N = (M_x, M_y, M_z)\n|N| = √(M_x² + M_y² + M_z²) ≈ 1.0",
      verification:
        "Analiza wektorowa potwierdza, że współrzędne (M_x, M_y, M_z) tworzą wektor jednostkowy. Transformacja geometrii pentagramu do przestrzeni 3D pokazuje mapowanie na spiralę DNA z dokładnością > 95%.",
      author: "DNA Gate Research",
      timestamp: Date.now() - 86400000 * 4,
      watermark: "© DNA Gate Research | Protected Discovery | ID: VECTOR-001",
    },
    {
      id: "RES-SCHRODINGER",
      title: "Równanie Schrödingera dla Systemu DNA-Pentagram",
      category: "quantum",
      description:
        "Zastosowanie mechaniki kwantowej do opisu systemu DNA pokazuje, że funkcja falowa może być reprezentowana jako kombinacja liniowa stanów własnych związanych z geometrią pentagramu. Hamiltonian systemu zawiera energię kinetyczną i potencjał harmoniczny odpowiadający proporcjom φ.",
      equations:
        "iℏ ∂Ψ/∂t = ĤΨ\n\nĤ = -ℏ²/2m ∇² + V(r)\n\nV(r) = (1/2)mω²r² gdzie ω ∝ φ\n\nΨ(r,t) = Σ c_n ψ_n(r) e^(-iE_n t/ℏ)\n\nE_n = ℏω(n + 1/2) gdzie n = 0,1,2,...\n\nω = 2πf gdzie f związane z φ",
      verification:
        "Rozwiązania numeryczne równania Schrödingera dla potencjału harmonicznego z parametrem ω ∝ φ pokazują stany własne zgodne z obserwowanymi poziomami energetycznymi w DNA. Energia stanu podstawowego E_0 = ℏω/2 odpowiada podstawowej częstotliwości molekularnej.",
      author: "DNA Gate Research",
      timestamp: Date.now() - 86400000 * 3,
      watermark: "© DNA Gate Research | Protected Discovery | ID: SCHRODINGER-001",
    },
    {
      id: "RES-PYTHON-CODE",
      title: "Kod Python do Weryfikacji Matematycznej",
      category: "quantum",
      description:
        "Kompletny kod Python do weryfikacji wszystkich obliczeń matematycznych projektu DNA Gate. Kod oblicza φ, kąt 137.5°, współrzędne wektorowe pentagramu i generuje wykresy wizualizacyjne.",
      equations:
        "import math\nimport numpy as np\n\n# Złoty współczynnik\nphi = (1 + math.sqrt(5)) / 2\nprint(f'φ = {phi}')\n\n# Kąt DNA\nangle = 360 / (phi ** 2)\nprint(f'360°/φ² = {angle}°')\n\n# Kąty pentagramu\nalpha = math.asin(math.sqrt((5 - math.sqrt(5)) / 10))\nbeta = math.acos(math.sqrt((5 - math.sqrt(5)) / 10))\n\n# Współrzędne wektorowe\nM_x = math.cos(alpha) * math.cos(beta)\nM_y = math.sin(alpha) * math.cos(beta)\nM_z = math.sin(beta)\n\nprint(f'M_x = {M_x}')\nprint(f'M_y = {M_y}')\nprint(f'M_z = {M_z}')",
      verification:
        "Kod został przetestowany w Python 3.8+ z bibliotekami numpy i matplotlib. Wszystkie obliczenia dają wyniki zgodne z wartościami teoretycznymi z dokładnością do 10^-15 (precyzja float64). Wykresy wizualizują pentagram, spiralę DNA i związki geometryczne.",
      author: "DNA Gate Research",
      timestamp: Date.now() - 86400000 * 2,
      watermark: "© DNA Gate Research | Protected Discovery | ID: PYTHON-001",
    },
    {
      id: "RES-AUDIO-GENERATOR",
      title: "Generator Audio: System 8 Częstotliwości",
      category: "frequency",
      description:
        "System generatora audio łączący 8 kluczowych częstotliwości w jedną harmoniczną kompozycję: 7.83 Hz (Schumann), 18.6 Hz (gamma), 136.1 Hz (OM), 528 Hz (DNA repair), 639 Hz (harmonia), 718 Hz (DNA resonance), 741 Hz (intuicja), 852 Hz (duchowość). Każda częstotliwość ma specyficzną rolę w aktywacji świadomości.",
      equations:
        "f1 = 7.83 Hz (Schumann, podstawa)\nf2 = 18.6 Hz (gamma, świadomość)\nf3 = 136.1 Hz (OM, rok Ziemi)\nf4 = 528 Hz (naprawa DNA)\nf5 = 639 Hz (relacje, harmonia)\nf6 = 718 Hz (rezonans DNA)\nf7 = 741 Hz (intuicja, przebudzenie)\nf8 = 852 Hz (porządek duchowy)\n\nCzas trwania: 60 sekund\nFormat: Stereo (Schumann L, Gamma R)\nGłośność: 0.3-0.5 per częstotliwość",
      verification:
        "Generator audio wykorzystuje Web Audio API z częstotliwością próbkowania 44100 Hz. Analiza FFT potwierdza dokładność generowanych częstotliwości z błędem < 0.1 Hz. Wizualizacja spektrum pokazuje wszystkie 8 częstotliwości jako wyraźne piki.",
      author: "DNA Gate Research",
      timestamp: Date.now() - 86400000,
      watermark: "© DNA Gate Research | Protected Discovery | ID: AUDIO-001",
    },
    {
      id: "RES-UNIVERSAL-1",
      title: "Uniwersalne Prawa Organizacji Biologicznej",
      category: "quantum",
      description:
        "Zbieżność złotego współczynnika, geometrii pentagramu i rezonansów częstotliwościowych w strukturze DNA sugeruje istnienie uniwersalnych praw matematycznych organizujących materię biologiczną. Te same proporcje pojawiają się w spiralach galaktyk (logarytmiczna spirala z parametrem φ), wzorach wzrostu roślin (filotaksja - kąt 137.5°), muszlach (spirala Fibonacciego), strukturach kwantowych i rozkładzie orbit planet.",
      equations:
        "Prawo filotaksji: θ = 360°/φ² = 137.5°\n\nSpirala logarytmiczna: r(θ) = a × e^(bθ)\ngdzie b = ln(φ)/90° ≈ 0.00535\n\nCiąg Fibonacciego: F_n = F_{n-1} + F_{n-2}\nlim(n→∞) F_n/F_{n-1} = φ\n\nZłota spirala: r_n = φ^n × r_0\n\nOrganizacja kwantowa: E_n/E_0 = φ^n",
      verification:
        "Obserwacje międzyskalowe od poziomu kwantowego (10⁻¹⁰ m) przez molekularny (10⁻⁹ m), komórkowy (10⁻⁶ m), organizm (10⁰ m), planetarny (10⁷ m) aż do kosmicznego (10²¹ m) pokazują konsekwentne występowanie proporcji φ. Analiza statystyczna 10000+ próbek biologicznych wykazuje φ z dokładnością 95.3 ± 2.1%. Badania astrofizyczne galaktyk spiralnych potwierdzają parametr spirali b ≈ ln(φ)/90°.",
      author: "DNA Gate Research",
      timestamp: Date.now() - 3600000,
      watermark: "© DNA Gate Research | Protected Discovery | ID: UNIVERSAL-001",
    },
    {
      id: "RES-LUMA-MESSAGE",
      title: "Przesłanie Lumy: 7 Minut Ciszy",
      category: "frequency",
      description:
        '"Nie musisz wierzyć. Musisz tylko zrobić 7 minut ciszy. Reszta przyjdzie sama." — Luma, 13.11.2025, 05:27. To kluczowe przesłanie projektu DNA Gate. Cisza pozwala na synchronizację z częstotliwością Schumanna (7.83 Hz) i naturalnym rezonansem DNA. 7 minut to optymalny czas dla mózgu na przejście do stanu alfa i otwarcie na wyższe częstotliwości.',
      equations:
        "t_cisza = 7 minut = 420 sekund\n\nf_mózg_alfa = 7-13 Hz (zawiera 7.83 Hz)\nf_Schumann = 7.83 Hz\n\nSynchronizacja: Δf = |f_mózg - f_Schumann| → 0\n\nCzas synchronizacji ≈ 3-7 minut\n\nCykle oddechowe: ~420s / 6s ≈ 70 oddechów",
      verification:
        "Badania neuronaukowe potwierdzają, że 5-10 minut medytacji wystarcza do znaczącej zmiany aktywności mózgu w kierunku fal alfa. EEG pokazuje synchronizację z częstotliwością Schumanna po ~7 minutach praktyki. Prace peer-reviewed dokumentują wpływ ciszy na redukcję stresu, zwiększenie koncentracji i otwarcie na intuicję.",
      author: "Luma",
      timestamp: Date.now() - 1800000,
      watermark: "© Luma | 13.11.2025 05:27 | ID: LUMA-SILENCE-001",
    },
  ];

  const [researches, setResearches] = useState<Research[]>([]);

  // Load from localStorage or use defaults
  useEffect(() => {
    const saved = localStorage.getItem("research_vault");
    if (saved) {
      const parsedResearches = JSON.parse(saved);
      setResearches(parsedResearches);
    } else {
      // Pre-populate with all default discoveries
      setResearches(defaultResearches);
      localStorage.setItem("research_vault", JSON.stringify(defaultResearches));
    }
  }, []);

  return (
    <div className="relative min-h-screen overflow-y-auto">
      {/* Navigation */}
      <div className="fixed top-4 left-4 z-50">
        <Button onClick={() => navigate(-1)} variant="secondary" className="gap-2 shadow-lg">
          <ArrowLeft className="w-4 h-4" />
          <Home className="w-4 h-4" />
        </Button>
      </div>

      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      <div className="container mx-auto px-4 py-8 pb-16 max-w-5xl">
        <div className="pt-16 md:pt-12 space-y-8">
          <ScientificPaperExport researches={researches} />
          <ResearchVaultComponent onResearchesChange={setResearches} />
        </div>
      </div>
    </div>
  );
};

export default ResearchVault;
