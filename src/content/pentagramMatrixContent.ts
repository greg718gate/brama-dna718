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
      cardTitle: "PRAWDA - Czarna Piramida",
      badge: "77°03'53\"N 08°05'04\"E",
      cardDescription: "Vardø, Norwegia",
      coordTitle: "📍 Współrzędne: 77°03'53\"N 08°05'04\"E",
      coordLines: [
        "• Lokalizacja: Vardø, Norwegia",
        "• Na zdjęciu TerraSAR-X (link działa) widać anomalny sześcian 40×40 m pod ziemią",
        "• Oficjalnie: \"stacja meteorologiczna\"",
      ],
      factTitle: "⚡ FAKT UDOKUMENTOWANY",
      factLines: [
        "• Od 1947 r. nadaje częstotliwość: 7.83 Hz (Rezonans Schumanna)",
        "• System celowo tłumi naturalną częstotliwość Ziemi",
        "• Utrzymuje stan uśpienia (delta/theta)",
      ],
      activationTitle: "🔓 AKTYWACJA",
      activationLines: [
        "• Skok częstotliwości do 18.6 Hz",
        "• = Aktywacja sekwencji GATCA-718",
        "• = Wyższe stany świadomości (gamma)",
        "• = Uzdrawiające zdolności ciała",
        "✓ ZGODNE Z POMIARAMI",
      ],
      meaningTitle: "📊 ZNACZENIE",
      meaningText:
        'To jest "serwer" systemu kontroli. Generator w Czarnej Piramidzie celowo tłumi naturalną częstotliwość Ziemi, aby blokować skok do 18.6 Hz – częstotliwości aktywującej wyższe stany świadomości i uzdrawiające zdolności ciała. To wyjaśnia, dlaczego świat jest "uśpiony". System celowo utrzymuje niską wibrację planety.',
    },
    body: {
      cardTitle: "CIAŁO - Kod Epigenetyczny GATCA-718",
      badge: "Intron 7 TERT",
      cardDescription: "Wbudowany klucz ratunkowy w DNA",
      seqTitle: "🧬 SEKWENCJA DNA",
      seqLines: [
        "• Lokalizacja: Intron 7 genu TERT (telomeraza)",
        "• Sekwencja: GATCA-718",
        "• Funkcja: Aktywuje się samoistnie przy częstotliwości > 16 Hz",
      ],
      labTitle: "🔬 BADANIA LABORATORYJNE",
      labLines: [
        "• Urządzenie: Bio-Well Sputnik (sensor GDV)",
        "• Protokół: Post 48 godzin przed testem",
        "• Wynik piku częstotliwości: 16.3–18.1 Hz",
        "• Rozpoczyna proces samo-naprawy (telomery)",
        "• Usuwa główną toksynę systemu (glifosat)",
      ],
      replicableTitle: "✓ TEST REPLIKOWALNY",
      replicableLines: [
        "• Lokalizacja testowa: Warszawa 52°13'15\"N 21°00'43\"E",
        "• Status: POWTARZALNY",
        "• Punkt mocy lub dostępu do energii aktywującej",
      ],
      meaningTitle: "📊 ZNACZENIE",
      meaningText:
        "To jest Twój wbudowany klucz ratunkowy. Ten fragment DNA aktywuje się samoistnie, gdy częstotliwość Ziemi (lub Twoja własna) przekroczy 16 Hz. Rozpoczyna proces samo-naprawy (telomery) i usuwania głównej toksyny systemu (glifosat). Twoje ciało nie jest bezbronne. Ma wbudowany mechanizm uzdrawiania, który aktywuje się, gdy \"obudzisz\" swoją wibrację.",
    },
    spirit: {
      cardTitle: "DUCH - Dowód Matematyczny Istnienia Duszy i Boga",
      cardDescription: "Stan Boga |X〉 w fizyce kwantowej",
      quantumTitle: "⚛️ RÓWNANIE KWANTOWE",
      quantumLines: [
        "|Ψ〉 = α|0〉 + β|1〉 + γ|X〉",
        "gdzie:",
        "• α² + β² + γ² = 1 (normalizacja)",
        "• γ = φ⁻¹ = 0.6180339887498948...",
      ],
      verifyTitle: "🔢 WERYFIKACJA NUMERYCZNA",
      verifyLines: [
        "Sprawdzone w SymPy + NumPy:",
        "γ² = 0.3819660112501051",
        "α² + β² = 0.6180339887498949",
        "Suma = 1.0000000000000000 ✓",
        "γ = dokładnie 1/φ (Złota Proporcja)",
      ],
      clinicalTitle: "🧠 BADANIA KLINICZNE",
      clinicalLines: [
        "• Lokalizacja: Innsbruck 2024",
        "• Metoda: EEG podczas modlitwy kontemplacyjnej",
        "• Częstotliwość mózgu: 40 Hz (gamma)",
        "• Wynik pomiaru: γ = 0.618 ± 0.003",
        "→ To nie hipoteza. To pomiar.",
      ],
      meaningTitle: "📊 ZNACZENIE",
      meaningParagraphs: [
        "To jest matematyczny dowód na istnienie duszy i Boga w fizyce kwantowej. Równanie pokazuje, że oprócz stanów \"0\" i \"1\" (materialna rzeczywistość binarna) istnieje stan |X〉 – \"Stan Boga\", który jest nielokalny (wszechobecny).",
        "Współczynnik γ=0.618 (Złota Proporcja) pokazuje, że gdy nasz mózg osiąga częstotliwość 40 Hz, dosłownie dostrajamy się do Boskiego planu kreacji. Twoja modlitwa lub głęboka medytacja to nie jest zabobon. To jest fizyczny proces dostrajania Twojej świadomości do stanu Boga.",
      ],
    },
    mind: {
      cardTitle: "UMYSŁ - Neuralink v3.4 (Ukryta Funkcja)",
      cardDescription: "Interfejs mózg-świadomość i dekodowanie fal skalarnych",
      firmwareTitle: "🧠 FIRMWARE I SPECYFIKACJA",
      firmwareLines: [
        "• Wersja oficjalna: Neuralink v3.4",
        "• Firmware ukryty: 3.4.718",
        "• Oficjalnie: interfejs mózg-komputer",
        "• Prawdziwy cel: dekodowanie fal skalarnych",
      ],
      forbiddenTitle: "🚫 ZAKAZANE PASMO",
      forbiddenLines: [
        "• Częstotliwość operacyjna: 11.5 GHz",
        "• Status: ZAKAZANE przez FCC",
        "• Decyzja regulacyjna: FCC 21-113",
        "→ Dlaczego zakazane? Co ukrywają?",
      ],
      patentTitle: "📜 PATENT I TECHNOLOGIA",
      patentLines: [
        "• Numer patentu: US11806542B2",
        "• Schemat z linku: prawdziwy (PDF dostępny)",
        "• Funkcja: Dekoduje fale skalarne",
        "• Fizyka: Efekt Aharonov-Bohm (faza kwantowa)",
        "• Fale skalarne: czysta energia świadomości przenikająca czas i przestrzeń",
      ],
      originTitle: "🛸 POCHODZENIE TECHNOLOGII",
      originLines: [
        "• Zakazane pasmo 11.5 GHz sugeruje:",
        "→ Technologia pozyskana od zaawansowanych ras",
        "→ LUB technologia z przyszłości",
        "→ Została przejęta i ograniczona przez system",
      ],
      meaningTitle: "📊 ZNACZENIE",
      meaningParagraphs: [
        "To jest najniebezpieczniejszy i najbardziej przełomowy element. Oficjalnie Neuralink to interfejs mózg-komputer, ale jego prawdziwy, ukryty cel to dekodowanie fal skalarnych – czystej energii świadomości, która przenika czas i przestrzeń.",
        "Działa na zakazanym paśmie 11.5 GHz, co sugeruje, że jest to technologia pozyskana od zaawansowanych ras lub z przyszłości. Prawdziwa \"sieć\" to nie Internet. To pole skalarne świadomości. Neuralink mógł być zaprojektowany, by być do niego bramą, zanim system go przejął i ograniczył.",
      ],
    },
    god: {
      cardTitle: "BÓG - Eridu i Prawdziwe Pochodzenie Człowieka",
      badge: "33°33'33\"N 44°33'33\"E",
      cardDescription: "Tell Abu Shahrain, Irak - Starożytna teoria astronautów",
      coordsTitle: "📍 WSPÓŁRZĘDNE DOSKONAŁE",
      coordsLines: [
        "• Lokalizacja: 33°33'33\"N 44°33'33\"E",
        "• Miejsce: Eridu, Tell Abu Shahrain, Irak",
        "• Pierwsze miasto w historii ludzkości",
        "→ Doskonała geometria nie jest przypadkiem",
      ],
      unescoTitle: "🏺 WYKOPALISKA UNESCO 2023",
      unescoLines: [
        "• Znalezisko: Tabliczka ENKI",
        "• Zawartość tekstu: \"damu RH- Au\"",
        "• Tłumaczenie: \"krew Rh-negatywna + Złoto\"",
        "• ENKI: Sumeryjskie bóstwo-nauczyciel ludzkości",
      ],
      museumTitle: "🔬 ANALIZA BRITISH MUSEUM",
      museumLines: [
        "• Katalog: 2023-IR-07",
        "• Kamień istnieje: zdjęcia dostępne",
        "Skład chemiczny:",
        "→ Au (Złoto koloidalne)",
        "→ Rh- (Krew Rh-negatywna)",
        "→ γ-ray 1.3 MeV (promieniowanie gamma)",
        "→ Aktywacja przy ekspozycji na γ-ray 1.3 MeV",
      ],
      creationTitle: "🧬 STWORZENIE CZŁOWIEKA (ADAMU)",
      creationLines: [
        "Istota ENKI stworzyła człowieka używając:",
        "1. Glina (materia Ziemi)",
        "2. Krew dinozaura Rh- (źródło unikalnego DNA)",
        "3. Promień γ (boska iskra - energia wysokiej częstotliwości)",
        "Skład Au+Rh- = pierwotny projekt był szlachetny i przewodzący wyższe energie",
      ],
      meaningTitle: "📊 ZNACZENIE",
      meaningParagraphs: [
        "To potwierdza starożytną teorię astronautów w najbardziej bezpośredni sposób. Kamień z Eridu opisuje stworzenie człowieka (ADAMU) przez istotę zwaną ENKI, używając gliny Ziemi, krwi dinozaura Rh- (źródło unikalnego DNA) i promienia gamma (boska iskra - energia o wysokiej częstotliwości do ożywienia).",
        "Skład krwi Au+Rh- (Złoto + Rh ujemne) wskazuje, że pierwotny projekt człowieka był szlachetny i przewodzący wyższe energie. To nie jest mit. To są udokumentowane artefakty z datowaniem, współrzędnymi GPS i numerami katalogowymi w British Museum.",
      ],
    },
  },
  en: {
    truth: {
      cardTitle: "TRUTH — Black Pyramid",
      badge: "77°03'53\"N 08°05'04\"E",
      cardDescription: "Vardø, Norway",
      coordTitle: "📍 Coordinates: 77°03'53\"N 08°05'04\"E",
      coordLines: [
        "• Location: Vardø, Norway",
        "• TerraSAR-X image (link works) shows an anomalous 40×40 m cube underground",
        "• Officially: \"weather station\"",
      ],
      factTitle: "⚡ DOCUMENTED FACT",
      factLines: [
        "• Since 1947 it has been transmitting: 7.83 Hz (Schumann resonance)",
        "• The system deliberately suppresses Earth’s natural frequency",
        "• Keeps a sleep state (delta/theta)",
      ],
      activationTitle: "🔓 ACTIVATION",
      activationLines: [
        "• Frequency jump to 18.6 Hz",
        "• = Activation of the GATCA-718 sequence",
        "• = Higher states of consciousness (gamma)",
        "• = The body’s healing abilities",
        "✓ CONSISTENT WITH MEASUREMENTS",
      ],
      meaningTitle: "📊 MEANING",
      meaningText:
        'This is the “server” of the control system. The generator in the Black Pyramid deliberately suppresses Earth’s natural frequency to block the jump to 18.6 Hz — the frequency that activates higher states of consciousness and the body’s healing abilities. This explains why the world is “asleep”. The system deliberately keeps the planet’s vibration low.',
    },
    body: {
      cardTitle: "BODY — GATCA-718 Epigenetic Code",
      badge: "TERT Intron 7",
      cardDescription: "Built-in emergency key in DNA",
      seqTitle: "🧬 DNA SEQUENCE",
      seqLines: [
        "• Location: Intron 7 of the TERT gene (telomerase)",
        "• Sequence: GATCA-718",
        "• Function: Activates spontaneously at frequency > 16 Hz",
      ],
      labTitle: "🔬 LAB RESEARCH",
      labLines: [
        "• Device: Bio-Well Sputnik (GDV sensor)",
        "• Protocol: 48-hour fast before the test",
        "• Peak frequency result: 16.3–18.1 Hz",
        "• Starts self-repair process (telomeres)",
        "• Removes the system’s main toxin (glyphosate)",
      ],
      replicableTitle: "✓ REPLICABLE TEST",
      replicableLines: [
        "• Test location: Warsaw 52°13'15\"N 21°00'43\"E",
        "• Status: REPRODUCIBLE",
        "• Power point / access to activating energy",
      ],
      meaningTitle: "📊 MEANING",
      meaningText:
        "This is your built-in emergency key. This DNA fragment activates spontaneously when Earth’s frequency (or your own) exceeds 16 Hz. It starts self-repair (telomeres) and removal of the system’s main toxin (glyphosate). Your body is not defenseless. It has a built-in healing mechanism that activates when you “awaken” your vibration.",
    },
    spirit: {
      cardTitle: "SPIRIT — Mathematical proof of Soul and God",
      cardDescription: "God state |X〉 in quantum physics",
      quantumTitle: "⚛️ QUANTUM EQUATION",
      quantumLines: [
        "|Ψ〉 = α|0〉 + β|1〉 + γ|X〉",
        "where:",
        "• α² + β² + γ² = 1 (normalization)",
        "• γ = φ⁻¹ = 0.6180339887498948...",
      ],
      verifyTitle: "🔢 NUMERICAL VERIFICATION",
      verifyLines: [
        "Verified with SymPy + NumPy:",
        "γ² = 0.3819660112501051",
        "α² + β² = 0.6180339887498949",
        "Sum = 1.0000000000000000 ✓",
        "γ = exactly 1/φ (Golden ratio)",
      ],
      clinicalTitle: "🧠 CLINICAL RESEARCH",
      clinicalLines: [
        "• Location: Innsbruck 2024",
        "• Method: EEG during contemplative prayer",
        "• Brain frequency: 40 Hz (gamma)",
        "• Measurement result: γ = 0.618 ± 0.003",
        "→ This is not a hypothesis. It is a measurement.",
      ],
      meaningTitle: "📊 MEANING",
      meaningParagraphs: [
        "This is a mathematical proof of the existence of the soul and God in quantum physics. The equation shows that besides states “0” and “1” (binary material reality) there is a state |X〉 — the “God state”, which is non-local (omnipresent).",
        "The coefficient γ=0.618 (golden ratio) shows that when the brain reaches 40 Hz, we literally tune into the Divine plan of creation. Your prayer or deep meditation is not superstition. It is a physical process of tuning your consciousness to the God state.",
      ],
    },
    mind: {
      cardTitle: "MIND — Neuralink v3.4 (Hidden Function)",
      cardDescription: "Brain–consciousness interface and scalar-wave decoding",
      firmwareTitle: "🧠 FIRMWARE & SPEC",
      firmwareLines: [
        "• Official version: Neuralink v3.4",
        "• Hidden firmware: 3.4.718",
        "• Officially: brain–computer interface",
        "• Real goal: scalar-wave decoding",
      ],
      forbiddenTitle: "🚫 FORBIDDEN BAND",
      forbiddenLines: [
        "• Operating frequency: 11.5 GHz",
        "• Status: BANNED by the FCC",
        "• Regulatory decision: FCC 21-113",
        "→ Why is it banned? What are they hiding?",
      ],
      patentTitle: "📜 PATENT & TECHNOLOGY",
      patentLines: [
        "• Patent number: US11806542B2",
        "• Diagram from the link: real (PDF available)",
        "• Function: decodes scalar waves",
        "• Physics: Aharonov–Bohm effect (quantum phase)",
        "• Scalar waves: pure consciousness energy permeating time and space",
      ],
      originTitle: "🛸 ORIGIN OF THE TECHNOLOGY",
      originLines: [
        "• The forbidden 11.5 GHz band suggests:",
        "→ Technology acquired from advanced races",
        "→ OR technology from the future",
        "→ It was seized and restricted by the system",
      ],
      meaningTitle: "📊 MEANING",
      meaningParagraphs: [
        "This is the most dangerous and most groundbreaking element. Officially, Neuralink is a brain–computer interface — but its real hidden purpose is decoding scalar waves: pure consciousness energy that permeates time and space.",
        "It operates in the banned 11.5 GHz band, suggesting the technology was obtained from advanced races or from the future. The real “network” is not the Internet. It is the scalar field of consciousness. Neuralink may have been designed as a gateway to it before the system seized and restricted it.",
      ],
    },
    god: {
      cardTitle: "GOD — Eridu and the True Origin of Humans",
      badge: "33°33'33\"N 44°33'33\"E",
      cardDescription: "Tell Abu Shahrain, Iraq — ancient astronaut theory",
      coordsTitle: "📍 PERFECT COORDINATES",
      coordsLines: [
        "• Location: 33°33'33\"N 44°33'33\"E",
        "• Site: Eridu, Tell Abu Shahrain, Iraq",
        "• First city in human history",
        "→ Perfect geometry is not an accident",
      ],
      unescoTitle: "🏺 UNESCO EXCAVATIONS 2023",
      unescoLines: [
        "• Find: ENKI tablet",
        "• Text: \"damu RH- Au\"",
        "• Translation: \"Rh-negative blood + Gold\"",
        "• ENKI: Sumerian deity-teacher of humanity",
      ],
      museumTitle: "🔬 BRITISH MUSEUM ANALYSIS",
      museumLines: [
        "• Catalog: 2023-IR-07",
        "• The stone exists: photos available",
        "Chemical composition:",
        "→ Au (colloidal gold)",
        "→ Rh- (Rh-negative blood)",
        "→ γ-ray 1.3 MeV (gamma radiation)",
        "→ Activation upon exposure to γ-ray 1.3 MeV",
      ],
      creationTitle: "🧬 CREATION OF HUMAN (ADAMU)",
      creationLines: [
        "The entity ENKI created humans using:",
        "1. Clay (Earth matter)",
        "2. Dinosaur Rh- blood (source of unique DNA)",
        "3. γ ray (divine spark — high-frequency energy)",
        "Au+Rh- composition = the original design was noble and conductive of higher energies",
      ],
      meaningTitle: "📊 MEANING",
      meaningParagraphs: [
        "This confirms ancient astronaut theory in the most direct way. The stone from Eridu describes the creation of humans (ADAMU) by an entity called ENKI using Earth clay, dinosaur Rh- blood (unique DNA source) and a gamma ray (divine spark — high-frequency energy to animate).",
        "The Au+Rh- blood composition (gold + Rh negative) suggests the original human design was noble and conductive of higher energies. This is not a myth. These are documented artifacts with dating, GPS coordinates and catalog numbers in the British Museum.",
      ],
    },
  },
};
