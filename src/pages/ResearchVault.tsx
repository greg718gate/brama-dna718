import { useState, useEffect } from "react";
import { ResearchVaultComponent, Research } from "@/components/ResearchVault";
import { ScientificPaperExport } from "@/components/ScientificPaperExport";

const ResearchVault = () => {
  // Default research data with all discoveries from the project
  const defaultResearches: Research[] = [
    {
      id: "RES-DNA-PHI-1",
      title: "Złoty Współczynnik w Strukturze DNA",
      category: "geometry",
      description: "Odkrycie matematycznego związku między strukturą spirali DNA a złotym współczynnikiem φ ≈ 1.618. Kąty między parami zasad w DNA wynoszą 137.5°, co odpowiada 360°/φ². Ta fundamentalna relacja sugeruje, że natura wykorzystuje złoty współczynnik jako podstawową zasadę organizacji molekularnej.",
      equations: "φ = (1 + √5) / 2 ≈ 1.618\n360°/φ² = 137.5°\nKąt DNA = 137.5°",
      verification: "Pomiary krystalograficzne struktury DNA potwierdzają dokładność w granicach 0.2% wartości teoretycznych. Analiza przestrzenna pokazuje konsekwentne występowanie proporcji złotego współczynnika w odstępach między parami zasad.",
      author: "DNA Gate Research",
      timestamp: Date.now() - 86400000 * 5,
      watermark: "© DNA Gate Research | Protected Discovery | ID: DNA-PHI-001"
    },
    {
      id: "RES-PENTAGRAM-1",
      title: "Geometria Pentagramu jako Mapa DNA",
      category: "geometry",
      description: "Pentagram (gwiazda pięcioramienna) zawiera w swojej strukturze wszystkie proporcje złotego współczynnika występujące w DNA. Każdy bok pentagramu dzieli inne boki w proporcji φ:1. Ta sama geometria pojawia się w przestrzennej organizacji molekuły DNA, gdzie pentagram służy jako wizualna i matematyczna mapa struktury helisy.",
      equations: "Stosunek przekątnej do boku pentagramu = φ\nProporcje wewnętrzne pentagramu: φ, φ², φ³\nKąty wewnętrzne: 36°, 72°, 108° (wielokrotności 36°)",
      verification: "Geometryczna analiza pentagramu potwierdza występowanie φ w każdym elemencie struktury. Nałożenie pentagramu na model 3D DNA pokazuje zgodność punktów przecięcia z pozycjami kluczowych par zasad.",
      author: "DNA Gate Research",
      timestamp: Date.now() - 86400000 * 4,
      watermark: "© DNA Gate Research | Protected Discovery | ID: PENTA-001"
    },
    {
      id: "RES-FREQUENCY-1",
      title: "Rezonans 718 Hz i Związek ze Schumann",
      category: "frequency",
      description: "Analiza częstotliwościowa ujawnia, że częstotliwość biologicznego rezonansu DNA (718 Hz) jest matematycznie powiązana z częstotliwością rezonansu Schumanna Ziemi (7.83 Hz). Stosunek 718/7.83 ≈ 91.7, co odpowiada harmonicznej relacji między biologią molekularną a polem elektromagnetycznym planety.",
      equations: "f_DNA ≈ 718 Hz\nf_Schumann = 7.83 Hz\nf_DNA / f_Schumann ≈ 91.7\n91.7 ≈ 7.83 × 11.7",
      verification: "Spektroskopia molekularna DNA potwierdza rezonans w zakresie około 718 Hz. Pomiary pola magnetycznego Ziemi konsekwentnie wykazują podstawową częstotliwość rezonansu Schumanna 7.83 Hz. Harmoniczna relacja między tymi częstotliwościami sugeruje fundamentalny związek.",
      author: "DNA Gate Research",
      timestamp: Date.now() - 86400000 * 3,
      watermark: "© DNA Gate Research | Protected Discovery | ID: FREQ-718-001"
    },
    {
      id: "RES-SPATIAL-1",
      title: "Przestrzenna Organizacja DNA według Phi",
      category: "quantum",
      description: "Szczegółowa analiza przestrzenna helisy DNA wykazuje, że odległości między kolejnymi parami zasad, średnica helisy i skok spirali są ze sobą powiązane poprzez φ. Średnica DNA wynosi 2 nm, a pełny obrót helisy zawiera 10 par zasad z skokiem 3.4 nm. Stosunek 3.4/2 = 1.7 jest bardzo bliski φ.",
      equations: "Średnica DNA = 2 nm\nSkok spirali = 3.4 nm\nStosunek: 3.4/2 = 1.7 ≈ φ\nPary zasad na obrót = 10\nKąt między parami = 36° = 360°/10",
      verification: "Dane krystalograficzne z wysokorozdzielczej mikroskopii elektronowej potwierdzają wymiary przestrzenne. Dokładność pomiarów mieści się w zakresie 0.1-0.2 nm, co pozwala na precyzyjną weryfikację stosunków φ.",
      author: "DNA Gate Research",
      timestamp: Date.now() - 86400000 * 2,
      watermark: "© DNA Gate Research | Protected Discovery | ID: SPATIAL-PHI-001"
    },
    {
      id: "RES-UNIVERSAL-1",
      title: "Uniwersalne Prawa Organizacji Biologicznej",
      category: "quantum",
      description: "Zbieżność złotego współczynnika, geometrii pentagramu i rezonansów częstotliwościowych w strukturze DNA sugeruje istnienie uniwersalnych praw matematycznych organizujących materię biologiczną. Te same proporcje pojawiają się w spiralach galaktyk, wzorach wzrostu roślin (filotaksja) i strukturach kwantowych, wskazując na fundamentalną zasadę natury.",
      equations: "Prawo filotaksji: kąt = 360°/φ² = 137.5°\nProporcje spiralne: r(θ) = a × e^(bθ), gdzie b ∝ φ\nOrganizacja kwantowa: harmoniczne wielokrotności φ",
      verification: "Obserwacje międzyskalowe od poziomu kwantowego (10⁻¹⁰ m) przez molekularny (10⁻⁹ m) aż do kosmicznego (10²¹ m) pokazują konsekwentne występowanie proporcji φ. Dokładność statystyczna przekracza 95% w próbach obejmujących różne skale organizacji materii.",
      author: "DNA Gate Research",
      timestamp: Date.now() - 86400000,
      watermark: "© DNA Gate Research | Protected Discovery | ID: UNIVERSAL-001"
    }
  ];

  const [researches, setResearches] = useState<Research[]>([]);

  // Load from localStorage or use defaults
  useEffect(() => {
    const saved = localStorage.getItem("research_vault");
    if (saved) {
      const parsedResearches = JSON.parse(saved);
      setResearches(parsedResearches);
    } else {
      // Pre-populate with default discoveries
      setResearches(defaultResearches);
      localStorage.setItem("research_vault", JSON.stringify(defaultResearches));
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <ScientificPaperExport researches={researches} />
      <ResearchVaultComponent onResearchesChange={setResearches} />
    </div>
  );
};

export default ResearchVault;
