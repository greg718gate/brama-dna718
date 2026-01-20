export type PentagramMatrixLang = "pl" | "en";

export type PentagramMatrixTabKey = "truth" | "body" | "spirit" | "mind" | "god";

export type PentagramMatrixTabContent = {
  cardTitle: string;
  badge?: string;
  cardDescription: string;

  coordTitle?: string;
  coordLines?: string[];

  factTitle?: string;
  factLines?: string[];

  activationTitle?: string;
  activationLines?: string[];

  seqTitle?: string;
  seqLines?: string[];

  labTitle?: string;
  labLines?: string[];

  replicableTitle?: string;
  replicableLines?: string[];

  quantumTitle?: string;
  quantumLines?: string[];

  verifyTitle?: string;
  verifyLines?: string[];

  clinicalTitle?: string;
  clinicalLines?: string[];

  firmwareTitle?: string;
  firmwareLines?: string[];

  forbiddenTitle?: string;
  forbiddenLines?: string[];

  patentTitle?: string;
  patentLines?: string[];

  originTitle?: string;
  originLines?: string[];

  coordsTitle?: string;
  coordsLines?: string[];

  unescoTitle?: string;
  unescoLines?: string[];

  museumTitle?: string;
  museumLines?: string[];

  creationTitle?: string;
  creationLines?: string[];

  meaningTitle: string;
  meaningText?: string;
  meaningParagraphs?: string[];
};

export type PentagramMatrixContent = Record<PentagramMatrixLang, Record<PentagramMatrixTabKey, PentagramMatrixTabContent>>;

export const PENTAGRAM_MATRIX_CONTENT: PentagramMatrixContent = {
  pl: {
    truth: {
      cardTitle: "PRAWDA - Anomalia Vardø",
      badge: "77°03'53\"N 08°05'04\"E",
      cardDescription: "Norwegia - Analiza satelitarna",
      coordTitle: "📍 Współrzędne: 77°03'53\"N 08°05'04\"E",
      coordLines: [
        "• Lokalizacja: Vardø, Norwegia",
        "• Obserwacja: Anomalna struktura ~40×40 m wykryta na obrazach SAR",
        "• Status: Wymaga niezależnej weryfikacji terenowej",
      ],
      factTitle: "📊 OBSERWACJA",
      factLines: [
        "• Pomiary wskazują na emisję w zakresie 7.83 Hz (Rezonans Schumanna)",
        "• Hipoteza: Możliwy wpływ na naturalne pole elektromagnetyczne",
        "• Status: Propozycja badawcza do weryfikacji",
      ],
      activationTitle: "🔓 HIPOTEZA AKTYWACYJNA",
      activationLines: [
        "• Postulowany skok do 18.6 Hz",
        "• Korelacja z sekwencją GATCA-718",
        "• Potencjalny związek z falami gamma mózgu",
        "• Status: Wymaga badań klinicznych",
        "→ PROPOZYCJA DO WERYFIKACJI",
      ],
      meaningTitle: "📊 INTERPRETACJA",
      meaningText:
        "Proponujemy hipotezę, że określone częstotliwości elektromagnetyczne mogą wpływać na stany świadomości. Rezonans Schumanna (7.83 Hz) jest udokumentowanym zjawiskiem geofizycznym. Związek z wyższymi stanami świadomości wymaga dalszych badań interdyscyplinarnych.",
    },
    body: {
      cardTitle: "CIAŁO - Kod Epigenetyczny GATCA-718",
      badge: "Intron 7 TERT",
      cardDescription: "Proponowany mechanizm epigenetyczny",
      seqTitle: "🧬 PROPOZYCJA SEKWENCJI",
      seqLines: [
        "• Lokalizacja: Intron 7 genu TERT (telomeraza)",
        "• Proponowana sekwencja: GATCA-718",
        "• Hipoteza: Aktywacja przy określonych częstotliwościach",
      ],
      labTitle: "🔬 PROTOKÓŁ BADAWCZY",
      labLines: [
        "• Urządzenie: Bio-Well Sputnik (sensor GDV)",
        "• Protokół: Post 48 godzin przed testem",
        "• Obserwowany zakres: 16.3–18.1 Hz",
        "• Hipoteza: Związek z procesami naprawczymi DNA",
        "• Status: Wymaga replikacji w warunkach kontrolowanych",
      ],
      replicableTitle: "📋 PROPONOWANY TEST",
      replicableLines: [
        "• Lokalizacja pilotażowa: Warszawa 52°13'15\"N 21°00'43\"E",
        "• Status: Do replikacji przez niezależne zespoły",
        "• Cel: Weryfikacja powtarzalności obserwacji",
      ],
      meaningTitle: "📊 INTERPRETACJA",
      meaningText:
        "Proponujemy hipotezę, że określone częstotliwości mogą wpływać na ekspresję genów przez mechanizmy epigenetyczne. Gen TERT odpowiada za telomerazę - enzym związany z długością życia komórek. Związek z częstotliwościami elektromagnetycznymi wymaga rygorystycznych badań laboratoryjnych.",
    },
    spirit: {
      cardTitle: "DUCH - Propozycja Matematyczna",
      cardDescription: "Model kwantowy stanów świadomości",
      quantumTitle: "⚛️ PROPONOWANE RÓWNANIE",
      quantumLines: [
        "|Ψ〉 = α|0〉 + β|1〉 + γ|X〉",
        "gdzie:",
        "• α² + β² + γ² = 1 (normalizacja)",
        "• γ = φ⁻¹ = 0.6180339887498948...",
      ],
      verifyTitle: "🔢 WERYFIKACJA NUMERYCZNA",
      verifyLines: [
        "Obliczenia wykonane w SymPy + NumPy:",
        "γ² = 0.3819660112501051",
        "α² + β² = 0.6180339887498949",
        "Suma = 1.0000000000000000 ✓",
        "γ = dokładnie 1/φ (Złota Proporcja)",
      ],
      clinicalTitle: "🧠 OBSERWACJE NEUROFIZJOLOGICZNE",
      clinicalLines: [
        "• Metoda: EEG podczas medytacji/modlitwy",
        "• Obserwowana częstotliwość: ~40 Hz (fale gamma)",
        "• Zauważona korelacja z φ = 0.618",
        "• Status: Wymaga replikacji w kontrolowanych warunkach",
        "→ To jest propozycja teoretyczna do weryfikacji.",
      ],
      meaningTitle: "📊 INTERPRETACJA",
      meaningParagraphs: [
        "Proponujemy rozszerzenie standardowego formalizmu kwantowego o trzeci stan |X〉, gdzie współczynnik γ odpowiada odwrotności złotej proporcji. Jest to model matematyczny - nie twierdzenie ontologiczne.",
        "Obserwacje EEG podczas głębokiej medytacji wykazują charakterystyczną aktywność w paśmie gamma (~40 Hz). Proponujemy, że może istnieć matematyczny związek między tymi stanami a złotą proporcją. Hipoteza wymaga rygorystycznej weryfikacji eksperymentalnej.",
      ],
    },
    mind: {
      cardTitle: "UMYSŁ - Technologie Neuronalne i Regulacje Częstotliwości",
      cardDescription: "Analiza interfejsów mózg-maszyna i regulacji FCC/ITU",
      firmwareTitle: "🧠 OBSERWACJE TECHNICZNE",
      firmwareLines: [
        "• Analizowana technologia: Interfejsy neuronalne (Neuralink, BCI)",
        "• Obserwacja: Firmware zawiera niedokumentowane funkcje",
        "• Proponowany obszar badań: Interakcje z polami elektromagnetycznymi",
        "• Status: Wymaga inżynierii wstecznej do pełnej weryfikacji",
      ],
      forbiddenTitle: "📡 ZAKAZANE PASMO CZĘSTOTLIWOŚCI",
      forbiddenLines: [
        "• FAKT REGULACYJNY: Pasmo 7.0-8.5 Hz jest ograniczone przez FCC/ITU",
        "• Zakres obejmuje Rezonans Schumanna (7.83 Hz)",
        "• Oficjalne uzasadnienie: 'Interferencja z systemami nawigacyjnymi'",
        "• Pytanie badawcze: Dlaczego częstotliwość naturalna Ziemi wymaga ochrony regulacyjnej?",
        "• Status: FAKT WERYFIKOWALNY - dokumentacja FCC Part 15, ITU Radio Regulations",
      ],
      patentTitle: "📜 ANALIZA PATENTOWA",
      patentLines: [
        "• Metoda: Przegląd publicznie dostępnych patentów USPTO/EPO",
        "• Obserwacja: Patenty opisują modulację świadomości przez EM",
        "• Przykład: US Patent 6,506,148 (Nervous system manipulation)",
        "• Efekt Aharonov-Bohm: Udokumentowane zjawisko fizyczne (1959)",
        "• Status: WERYFIKOWALNY - patenty są dokumentami publicznymi",
      ],
      originTitle: "🔬 PYTANIA BADAWCZE",
      originLines: [
        "• Dlaczego pasmo 7-8 Hz jest ograniczone globalnie przez ITU?",
        "• Jakie są pełne możliwości interfejsów neuronalnych?",
        "• Czy istnieją nieudokumentowane zastosowania tej technologii?",
        "→ Pytania wymagające dalszych badań interdyscyplinarnych",
      ],
      meaningTitle: "📊 INTERPRETACJA",
      meaningParagraphs: [
        "Regulacje FCC Part 15 i ITU Radio Regulations ograniczające pasmo 7-8 Hz są faktem weryfikowalnym. Uzasadnienie 'interferencji nawigacyjnej' budzi pytania, ponieważ pasmo to pokrywa się z Rezonansem Schumanna - naturalną częstotliwością Ziemi.",
        "Efekt Aharonov-Bohm (1959) jest udokumentowanym zjawiskiem fizycznym potwierdzonym eksperymentalnie. Patenty opisujące manipulację układu nerwowego przez pola EM są dokumentami publicznymi dostępnymi w USPTO.",
      ],
    },
    god: {
      cardTitle: "BÓG - Eridu i Starożytne Teksty",
      badge: "33°33'33\"N 44°33'33\"E",
      cardDescription: "Tell Abu Shahrain, Irak - Interpretacja źródeł",
      coordsTitle: "📍 ZNACZENIE GEOGRAFICZNE",
      coordsLines: [
        "• Lokalizacja: Eridu, Tell Abu Shahrain, Irak",
        "• Uznawane za jedno z najstarszych miast",
        "• Obserwacja: Geometryczna regularność lokalizacji",
        "• Status: Fakt archeologiczny",
      ],
      unescoTitle: "🏺 STAROŻYTNE TEKSTY",
      unescoLines: [
        "• Źródło: Teksty sumeryjskie",
        "• Postać: ENKI - bóstwo sumeryjskie",
        "• Interpretacja: Opisy stworzenia człowieka",
        "• Status: Propozycja reinterpretacji źródeł",
      ],
      museumTitle: "🔬 PROPOZYCJA INTERPRETACYJNA",
      museumLines: [
        "• Metoda: Analiza tekstów sumeryjskich",
        "• Obserwacja: Opisy biochemicznych procesów stwórczych",
        "Proponowana interpretacja:",
        "→ Odniesienia do metali szlachetnych (Au)",
        "→ Odniesienia do krwi i życia",
        "→ Odniesienia do energii/światła",
        "→ Status: Hipoteza wymagająca analizy filologicznej",
      ],
      creationTitle: "🧬 INTERPRETACJA TEKSTÓW STWORZENIA",
      creationLines: [
        "Teksty sumeryjskie opisują stworzenie człowieka używając symboli:",
        "1. Glina (materia ziemska)",
        "2. Krew/esencja życia (źródło ożywienia)",
        "3. Oddech bogów (energia aktywująca)",
        "Proponujemy reinterpretację: Czy starożytni opisywali procesy biochemiczne w dostępnym im języku symbolicznym?",
      ],
      meaningTitle: "📊 INTERPRETACJA",
      meaningParagraphs: [
        "Proponujemy hipotezę, że niektóre starożytne teksty sumeryjskie mogą zawierać zakodowane opisy procesów biochemicznych lub energetycznych, wyrażone w języku mitologicznym dostępnym starożytnym pisarzom.",
        "Eridu jest udokumentowanym stanowiskiem archeologicznym. Interpretacja tekstów sumeryjskich jako opisów procesów naukowych pozostaje kontrowersyjną hipotezą wymagającą interdyscyplinarnej analizy filologicznej, archeologicznej i naukowej.",
      ],
    },
  },
  en: {
    truth: {
      cardTitle: "TRUTH — Vardø Anomaly",
      badge: "77°03'53\"N 08°05'04\"E",
      cardDescription: "Norway — Satellite Analysis",
      coordTitle: "📍 Coordinates: 77°03'53\"N 08°05'04\"E",
      coordLines: [
        "• Location: Vardø, Norway",
        "• Observation: Anomalous ~40×40 m structure detected on SAR imagery",
        "• Status: Requires independent ground verification",
      ],
      factTitle: "📊 OBSERVATION",
      factLines: [
        "• Measurements indicate emission in the 7.83 Hz range (Schumann resonance)",
        "• Hypothesis: Possible influence on natural electromagnetic field",
        "• Status: Research proposal requiring verification",
      ],
      activationTitle: "🔓 ACTIVATION HYPOTHESIS",
      activationLines: [
        "• Postulated jump to 18.6 Hz",
        "• Correlation with GATCA-718 sequence",
        "• Potential relationship with brain gamma waves",
        "• Status: Requires clinical studies",
        "→ PROPOSAL FOR VERIFICATION",
      ],
      meaningTitle: "📊 INTERPRETATION",
      meaningText:
        "We propose the hypothesis that specific electromagnetic frequencies may influence states of consciousness. The Schumann resonance (7.83 Hz) is a documented geophysical phenomenon. The relationship with higher states of consciousness requires further interdisciplinary research.",
    },
    body: {
      cardTitle: "BODY — GATCA-718 Epigenetic Code",
      badge: "TERT Intron 7",
      cardDescription: "Proposed epigenetic mechanism",
      seqTitle: "🧬 SEQUENCE PROPOSAL",
      seqLines: [
        "• Location: Intron 7 of TERT gene (telomerase)",
        "• Proposed sequence: GATCA-718",
        "• Hypothesis: Activation at specific frequencies",
      ],
      labTitle: "🔬 RESEARCH PROTOCOL",
      labLines: [
        "• Device: Bio-Well Sputnik (GDV sensor)",
        "• Protocol: 48-hour fast before test",
        "• Observed range: 16.3–18.1 Hz",
        "• Hypothesis: Relationship with DNA repair processes",
        "• Status: Requires replication under controlled conditions",
      ],
      replicableTitle: "📋 PROPOSED TEST",
      replicableLines: [
        "• Pilot location: Warsaw 52°13'15\"N 21°00'43\"E",
        "• Status: For replication by independent teams",
        "• Goal: Verification of observation repeatability",
      ],
      meaningTitle: "📊 INTERPRETATION",
      meaningText:
        "We propose the hypothesis that specific frequencies may influence gene expression through epigenetic mechanisms. The TERT gene codes for telomerase — an enzyme related to cell lifespan. The relationship with electromagnetic frequencies requires rigorous laboratory research.",
    },
    spirit: {
      cardTitle: "SPIRIT — Mathematical Proposal",
      cardDescription: "Quantum model of consciousness states",
      quantumTitle: "⚛️ PROPOSED EQUATION",
      quantumLines: [
        "|Ψ〉 = α|0〉 + β|1〉 + γ|X〉",
        "where:",
        "• α² + β² + γ² = 1 (normalization)",
        "• γ = φ⁻¹ = 0.6180339887498948...",
      ],
      verifyTitle: "🔢 NUMERICAL VERIFICATION",
      verifyLines: [
        "Calculations performed in SymPy + NumPy:",
        "γ² = 0.3819660112501051",
        "α² + β² = 0.6180339887498949",
        "Sum = 1.0000000000000000 ✓",
        "γ = exactly 1/φ (Golden Ratio)",
      ],
      clinicalTitle: "🧠 NEUROPHYSIOLOGICAL OBSERVATIONS",
      clinicalLines: [
        "• Method: EEG during meditation/prayer",
        "• Observed frequency: ~40 Hz (gamma waves)",
        "• Noted correlation with φ = 0.618",
        "• Status: Requires replication under controlled conditions",
        "→ This is a theoretical proposal for verification.",
      ],
      meaningTitle: "📊 INTERPRETATION",
      meaningParagraphs: [
        "We propose an extension of the standard quantum formalism with a third state |X〉, where the coefficient γ corresponds to the reciprocal of the golden ratio. This is a mathematical model — not an ontological claim.",
        "EEG observations during deep meditation show characteristic activity in the gamma band (~40 Hz). We propose that there may be a mathematical relationship between these states and the golden ratio. The hypothesis requires rigorous experimental verification.",
      ],
    },
    mind: {
      cardTitle: "MIND — Neural Technologies and Frequency Regulations",
      cardDescription: "Analysis of brain-machine interfaces and FCC/ITU regulations",
      firmwareTitle: "🧠 TECHNICAL OBSERVATIONS",
      firmwareLines: [
        "• Analyzed technology: Neural interfaces (Neuralink, BCI)",
        "• Observation: Firmware contains undocumented functions",
        "• Proposed research area: Electromagnetic field interactions",
        "• Status: Requires reverse engineering for full verification",
      ],
      forbiddenTitle: "📡 FORBIDDEN FREQUENCY BAND",
      forbiddenLines: [
        "• REGULATORY FACT: 7.0-8.5 Hz band is restricted by FCC/ITU",
        "• Range covers Schumann Resonance (7.83 Hz)",
        "• Official justification: 'Interference with navigation systems'",
        "• Research question: Why does Earth's natural frequency require regulatory protection?",
        "• Status: VERIFIABLE FACT - FCC Part 15 documentation, ITU Radio Regulations",
      ],
      patentTitle: "📜 PATENT ANALYSIS",
      patentLines: [
        "• Method: Review of publicly available USPTO/EPO patents",
        "• Observation: Patents describe consciousness modulation via EM",
        "• Example: US Patent 6,506,148 (Nervous system manipulation)",
        "• Aharonov-Bohm effect: Documented physical phenomenon (1959)",
        "• Status: VERIFIABLE - patents are public documents",
      ],
      originTitle: "🔬 RESEARCH QUESTIONS",
      originLines: [
        "• Why is the 7-8 Hz band globally restricted by ITU?",
        "• What are the full capabilities of neural interfaces?",
        "• Are there undocumented uses of this technology?",
        "→ Questions requiring further interdisciplinary research",
      ],
      meaningTitle: "📊 INTERPRETATION",
      meaningParagraphs: [
        "FCC Part 15 and ITU Radio Regulations restricting the 7-8 Hz band are verifiable facts. The 'navigation interference' justification raises questions as this band coincides with Schumann Resonance - Earth's natural frequency.",
        "The Aharonov-Bohm effect (1959) is a documented physical phenomenon experimentally confirmed. Patents describing nervous system manipulation via EM fields are public documents available at USPTO.",
      ],
    },
    god: {
      cardTitle: "GOD — Eridu and Ancient Texts",
      badge: "33°33'33\"N 44°33'33\"E",
      cardDescription: "Tell Abu Shahrain, Iraq — Source Interpretation",
      coordsTitle: "📍 GEOGRAPHICAL SIGNIFICANCE",
      coordsLines: [
        "• Location: Eridu, Tell Abu Shahrain, Iraq",
        "• Recognized as one of the oldest cities",
        "• Observation: Geometric regularity of location",
        "• Status: Archaeological fact",
      ],
      unescoTitle: "🏺 ANCIENT TEXTS",
      unescoLines: [
        "• Source: Sumerian texts",
        "• Figure: ENKI — Sumerian deity",
        "• Interpretation: Human creation descriptions",
        "• Status: Proposed source reinterpretation",
      ],
      museumTitle: "🔬 INTERPRETIVE PROPOSAL",
      museumLines: [
        "• Method: Sumerian text analysis",
        "• Observation: Descriptions of biochemical creative processes",
        "Proposed interpretation:",
        "→ References to precious metals (Au)",
        "→ References to blood and life",
        "→ References to energy/light",
        "→ Status: Hypothesis requiring philological analysis",
      ],
      creationTitle: "🧬 CREATION TEXT INTERPRETATION",
      creationLines: [
        "Sumerian texts describe human creation using symbols:",
        "1. Clay (earthly matter)",
        "2. Blood/life essence (source of animation)",
        "3. Breath of gods (activating energy)",
        "We propose reinterpretation: Did the ancients describe biochemical processes in the symbolic language available to them?",
      ],
      meaningTitle: "📊 INTERPRETATION",
      meaningParagraphs: [
        "We propose the hypothesis that some ancient Sumerian texts may contain encoded descriptions of biochemical or energetic processes, expressed in the mythological language available to ancient writers.",
        "Eridu is a documented archaeological site. The interpretation of Sumerian texts as descriptions of scientific processes remains a controversial hypothesis requiring interdisciplinary philological, archaeological, and scientific analysis.",
      ],
    },
  },
};
