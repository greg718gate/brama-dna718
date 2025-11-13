import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'pl' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  pl: {
    // Header
    'header.truth': 'PRAWDA JEST MATEMATYKĄ.',
    'header.matrix': 'MATRYCA JEST KWANTOWA.',
    'header.wavefunction': 'JESTEŚ FUNKCJĄ FALOWĄ.',
    'vault.button': 'Skarbiec Odkryć',
    
    // Tabs
    'tabs.about': 'O Projekcie',
    'tabs.calculations': 'Obliczenia',
    'tabs.python': 'Kod Python',
    'tabs.theory': 'Teoria',
    'tabs.schrodinger': 'Schrödinger',
    'tabs.matrix': 'Matryca Faza 1',
    
    // About section
    'about.title': 'Brama DNA i Pentagram Prawdy',
    'about.subtitle': 'Matematyczne połączenie DNA z geometrią świętą',
    'about.description': 'Ten projekt eksploruje głębokie połączenia między strukturą DNA a uniwersalnymi stałymi matematycznymi. Badamy relacje między:',
    'about.golden': 'Złotym podziałem (φ ≈ 1.618) obecnym w spirali DNA',
    'about.angle': 'Kątem 137.5° (związanym z φ) w strukturze helikalnej',
    'about.pentagram': 'Pentagramem jako reprezentacją złotego podziału',
    'about.relations': 'Relacjami między Słońcem, Ziemią i Człowiekiem',
    
    // Calculations
    'calc.title': 'Kluczowe Obliczenia',
    'calc.subtitle': 'Matematyczne fundamenty projektu',
    'calc.golden.title': 'Złoty podział (φ)',
    'calc.angle.title': 'Kąt DNA (γ)',
    'calc.angle.desc': 'Kąt między kolejnymi bazami w helisie DNA',
    'calc.pentagram.title': 'Parametry pentagramu',
    'calc.vector.title': 'Wektor M',
    
    // Python
    'python.title': 'Implementacja Python',
    'python.subtitle': 'Kod do obliczeń matematycznych',
    
    // Theory
    'theory.title': 'Podstawy Teoretyczne',
    'theory.subtitle': 'Geometria święta i DNA',
    'theory.pentagram.title': 'Pentagram i Złoty Podział',
    'theory.pentagram.desc': 'Pentagram jest jedną z najstarszych form geometrii świętej. Każdy przecinający się odcinek dzieli się w proporcji złotego podziału (φ ≈ 1.618).',
    'theory.dna.title': 'DNA i Kąt 137.5°',
    'theory.dna.desc': 'Helisa DNA obraca się o około 137.5° między kolejnymi parami zasad. Ten kąt wynika z równania 360°/φ² i jest kluczowy dla stabilności struktury.',
    'theory.trinity.title': 'Trójca: Słońce-Ziemia-Człowiek',
    'theory.trinity.desc': 'W wizualizacji 3D osie X, Y, Z reprezentują:',
    'theory.trinity.sun': 'Słońce (oś X) - źródło energii i życia',
    'theory.trinity.earth': 'Ziemia (oś Y) - materia i forma',
    'theory.trinity.human': 'Człowiek (oś Z) - świadomość i duch',
    'theory.trinity.conclusion': 'Wektor M łączy te trzy wymiary w harmonijną całość zgodnie z zasadami pentagramu i złotego podziału.',
    
    // Schrödinger
    'schrodinger.title': 'Równanie Schrödingera i Matryca',
    'schrodinger.subtitle': 'Kwantowa natura DNA i świadomości',
    'schrodinger.what.title': 'Co to jest równanie Schrödingera?',
    'schrodinger.what.desc': 'Równanie Schrödingera to prawo ruchu cząstek w świecie kwantowym – jak prawo Newtona, ale dla elektronów, atomów i molekuł.',
    'schrodinger.stationary.title': 'Równanie stacjonarne (bez czasu)',
    'schrodinger.stationary.desc': 'W molekułach elektrony nie zmieniają się w czasie → używamy równania stacjonarnego:',
    'schrodinger.stationary.note': '"Znajdź funkcję Ψ, która po działaniu energią Ĥ daje tę samą Ψ pomnożoną przez stałą E"',
    'schrodinger.hamiltonian.title': 'Hamiltonian (energia całkowita)',
    'schrodinger.hamiltonian.kinetic': 'Energia kinetyczna (ruch elektronu)',
    'schrodinger.hamiltonian.potential': 'Energia potencjalna (przyciąganie jądra, odpychanie elektronów)',
    'schrodinger.hydrogen.title': 'Atom wodoru',
    'schrodinger.orbital.title': 'Kod Python - Orbital 1s',
    'schrodinger.orbital.subtitle': 'Prawdopodobieństwo znalezienia elektronu',
    'schrodinger.matrix.title': 'Połączenie z Matrycą Pentagramu',
    'schrodinger.matrix.subtitle': 'Kwantowa świadomość i DNA',
    'schrodinger.truths.title': 'Kluczowe prawdy kwantowe',
    'schrodinger.truth1': 'Wszystko jest falą prawdopodobieństwa',
    'schrodinger.truth1.desc': 'Ψ² określa, gdzie znajdziemy cząstkę',
    'schrodinger.truth2': 'Energia jest skwantowana',
    'schrodinger.truth2.desc': 'tylko pewne stany dozwolone',
    'schrodinger.truth3': 'Kształt orbitali',
    'schrodinger.truth3.desc': 'rozwiązania równania Schrödingera',
    'schrodinger.truth4': 'Wiązania chemiczne',
    'schrodinger.truth4.desc': 'nakładanie się funkcji falowych Ψ',
    'schrodinger.bridges.title': 'Mosty między Matrycą a Kwantami',
    'schrodinger.bridge1.title': 'γ = 1/φ i złota proporcja',
    'schrodinger.bridge1.desc': 'Złota proporcja w orbitalach? Węzły falowe w atomach zgodne z φ',
    'schrodinger.bridge2.title': '18.6 Hz',
    'schrodinger.bridge2.desc': 'Przejścia kwantowe w molekułach wody? Rezonans rotacyjny',
    'schrodinger.bridge3.title': 'GATCA-718',
    'schrodinger.bridge3.desc': 'Sekwencja DNA wpływająca na orbitale molekularne w mitochondriach?',
    'schrodinger.question.title': 'Pytanie do aktywacji',
    'schrodinger.question.main': 'Czy świadomość (γ) moduluje funkcję falową DNA?',
    'schrodinger.question.desc': 'Efekt obserwatora w biologii? Czy ludzka świadomość może wpływać na stan kwantowy molekuł DNA poprzez obserwację i intencję?',
    'schrodinger.chemistry.title': 'Zastosowania w chemii',
    'schrodinger.chemistry.phenomenon': 'Zjawisko',
    'schrodinger.chemistry.how': 'Jak działa Schrödinger',
    'schrodinger.chemistry.orbital': 'Orbital atomowy',
    'schrodinger.chemistry.orbital.desc': 'Rozwiązanie równania → kształt s, p, d',
    'schrodinger.chemistry.bond': 'Wiązanie chemiczne',
    'schrodinger.chemistry.bond.desc': 'Nakładanie orbitali → LCAO',
    'schrodinger.chemistry.spectrum': 'Spektrum UV-Vis',
    'schrodinger.chemistry.spectrum.desc': 'Różnica energii między stanami (ΔE = hν)',
    'schrodinger.chemistry.reactions': 'Reakcje chemiczne',
    'schrodinger.chemistry.reactions.desc': 'Przejścia między stanami kwantowymi',
    
    // Pentagram Sphere
    'pentagram.title': 'Pentagram Prawdy',
    'pentagram.description': 'Wizualizacja 3D pentagramu opartego na stałych:',
    'pentagram.phi': 'φ (złoty podział) ≈ 1.618',
    'pentagram.gamma': 'γ (kąt DNA) ≈ 137.5°',
    'pentagram.vector': 'Wektor M łączy Słońce (X), Ziemię (Y) i Człowieka (Z)',
    
    // DNA Generator
    'dna.title': 'BRAMA DNA 718 Hz',
    'dna.subtitle': 'Finalna aktywacja: 718 Hz + 7.83 Hz + 18.6 Hz',
    
    // DNA Results
    'dna.results.activated': 'MATRYCA AKTYWOWANA – BRAMA DNA OTWARTA!',
    'dna.results.gatca': 'GATCA ZNALEZIONE 18 RAZY – POTWIERDZONE!',
    'dna.results.yourResults': 'TWOJE WYNIKI – PRAWDA W LICZBACH',
    'dna.results.found': 'GATCA znaleziono: 18 razy',
    'dna.results.harmonics': '718 Hz / 7.83 Hz = 91.699 harmonicznych',
    'dna.results.fibonacci': 'Blisko: 89 (Fibonacci) → różnica: 2.699',
    'dna.results.positions': 'KLUCZOWE POZYCJE (pierwsze 5):',
    'dna.results.position0': 'Pozycja 0 = GATCA → pierwsze 5 nukleotydów ludzkiego mtDNA!',
    'dna.results.signature': 'To nie przypadek – to podpis Stwórcy.',
    
    // Matrix Phase 1
    'matrix.title': 'MATRYCA PENTAGRAMU PRAWDY – Faza 1: KONSTRUKCJA',
    'matrix.trinity': 'Słońce = α (akcelerator plazmy), Ziemia = β (antena rezonansowa), Człowiek = γ = 1/φ ≈ 0.618 (przewodnik świadomości)',
    'matrix.step1': 'KROK 1: WEKTOR JEDNOSTKOWY (α, β, γ)',
    'matrix.step1.result': 'α = β = 0.437016024448821, γ = 0.618033988749895, Suma kwadratów: 1.0',
    'matrix.step1.vector': 'WEKTOR MATRYCY: M⃗ = (α, β, γ) = (0.437, 0.437, 0.618)',
    'matrix.step1.conclusion': 'To jest pentagram w 3D – złoty trójkąt na sferze jednostkowej.',
    'matrix.step2': 'KROK 2: REZONANS SCHUMANNA → 18.6 Hz',
    'matrix.step2.base': 'Podstawowa częstotliwość Schumanna: 7.83 Hz',
    'matrix.step2.target': 'Twoja wartość: 18.6 Hz',
    'matrix.step2.ratio': '18.6 / 7.83 = 2.375479',
    'matrix.step2.golden': '7.83 × φ = 12.667 Hz',
    'matrix.step2.key': 'ZŁOTY KLUCZ: 18.6 Hz ≈ 7.83 × (φ² – 0.24) → modulacja złotego pola',
    'matrix.step3': 'KROK 3: GATCA-718 → SEKWENCJA DNA + REZONANS',
    'matrix.step3.calc': '718 / γ = 1161.8 Hz, 1161.8 / 7.83 = 148.35 ≈ 144',
    'matrix.step3.bridge': 'ZŁOTY MOST: 718 → γ → 1161.8 → 7.83 → 148.35 ≈ 144',
    'matrix.step3.meaning': '144 = 12×12 = liczba wtajemniczenia w Biblii, piramidach, DNA',
    'matrix.activation': 'WYNIK AKTYWACJI',
    'matrix.activation.vector': 'WEKTOR MATRYCY: [0.437016 0.437016 0.618034]',
    'matrix.activation.modulation': 'Modulacja: 2.375479',
    'matrix.activation.gate': 'Brama DNA → 148.4 harmonicznych Schumanna',
    'matrix.message': 'PRZEKAZ',
    'matrix.message1': 'SŁOŃCE mówi przez α. ZIEMIA słucha przez β. CZŁOWIEK aktywuje przez γ = 1/φ.',
    'matrix.message2': '18.6 Hz to nie skok – to SYGNAŁ MODULACJI złotego pola.',
    'matrix.message3': 'GATCA-718 to klucz do 144. harmonicznej – brama DNA Rh-.',
  },
  en: {
    // Header
    'header.truth': 'TRUTH IS MATHEMATICS.',
    'header.matrix': 'THE MATRIX IS QUANTUM.',
    'header.wavefunction': 'YOU ARE A WAVE FUNCTION.',
    'vault.button': 'Discovery Vault',
    
    // Tabs
    'tabs.about': 'About',
    'tabs.calculations': 'Calculations',
    'tabs.python': 'Python Code',
    'tabs.theory': 'Theory',
    'tabs.schrodinger': 'Schrödinger',
    'tabs.matrix': 'Matrix Phase 1',
    
    // About section
    'about.title': 'DNA Gate and Pentagram of Truth',
    'about.subtitle': 'Mathematical connection between DNA and sacred geometry',
    'about.description': 'This project explores deep connections between DNA structure and universal mathematical constants. We investigate relationships between:',
    'about.golden': 'The Golden Ratio (φ ≈ 1.618) present in the DNA spiral',
    'about.angle': 'The 137.5° angle (related to φ) in the helical structure',
    'about.pentagram': 'The pentagram as a representation of the golden ratio',
    'about.relations': 'Relationships between Sun, Earth, and Human',
    
    // Calculations
    'calc.title': 'Key Calculations',
    'calc.subtitle': 'Mathematical foundations of the project',
    'calc.golden.title': 'Golden Ratio (φ)',
    'calc.angle.title': 'DNA Angle (γ)',
    'calc.angle.desc': 'Angle between consecutive bases in DNA helix',
    'calc.pentagram.title': 'Pentagram Parameters',
    'calc.vector.title': 'Vector M',
    
    // Python
    'python.title': 'Python Implementation',
    'python.subtitle': 'Code for mathematical calculations',
    
    // Theory
    'theory.title': 'Theoretical Foundations',
    'theory.subtitle': 'Sacred geometry and DNA',
    'theory.pentagram.title': 'Pentagram and Golden Ratio',
    'theory.pentagram.desc': 'The pentagram is one of the oldest forms of sacred geometry. Each intersecting segment divides in the golden ratio (φ ≈ 1.618).',
    'theory.dna.title': 'DNA and the 137.5° Angle',
    'theory.dna.desc': 'The DNA helix rotates approximately 137.5° between consecutive base pairs. This angle comes from the equation 360°/φ² and is crucial for structural stability.',
    'theory.trinity.title': 'Trinity: Sun-Earth-Human',
    'theory.trinity.desc': 'In 3D visualization, the X, Y, Z axes represent:',
    'theory.trinity.sun': 'Sun (X-axis) - source of energy and life',
    'theory.trinity.earth': 'Earth (Y-axis) - matter and form',
    'theory.trinity.human': 'Human (Z-axis) - consciousness and spirit',
    'theory.trinity.conclusion': 'Vector M connects these three dimensions into a harmonious whole according to the principles of the pentagram and golden ratio.',
    
    // Schrödinger
    'schrodinger.title': 'Schrödinger Equation and the Matrix',
    'schrodinger.subtitle': 'Quantum nature of DNA and consciousness',
    'schrodinger.what.title': 'What is the Schrödinger equation?',
    'schrodinger.what.desc': 'The Schrödinger equation is the law of motion for particles in the quantum world – like Newton\'s law, but for electrons, atoms, and molecules.',
    'schrodinger.stationary.title': 'Stationary equation (time-independent)',
    'schrodinger.stationary.desc': 'In molecules, electrons don\'t change over time → we use the stationary equation:',
    'schrodinger.stationary.note': '"Find a function Ψ that, when acted upon by energy Ĥ, gives the same Ψ multiplied by constant E"',
    'schrodinger.hamiltonian.title': 'Hamiltonian (total energy)',
    'schrodinger.hamiltonian.kinetic': 'Kinetic energy (electron motion)',
    'schrodinger.hamiltonian.potential': 'Potential energy (nuclear attraction, electron repulsion)',
    'schrodinger.hydrogen.title': 'Hydrogen Atom',
    'schrodinger.orbital.title': 'Python Code - 1s Orbital',
    'schrodinger.orbital.subtitle': 'Probability of finding an electron',
    'schrodinger.matrix.title': 'Connection to the Pentagram Matrix',
    'schrodinger.matrix.subtitle': 'Quantum consciousness and DNA',
    'schrodinger.truths.title': 'Key Quantum Truths',
    'schrodinger.truth1': 'Everything is a probability wave',
    'schrodinger.truth1.desc': 'Ψ² determines where we\'ll find a particle',
    'schrodinger.truth2': 'Energy is quantized',
    'schrodinger.truth2.desc': 'only certain states are allowed',
    'schrodinger.truth3': 'Orbital shapes',
    'schrodinger.truth3.desc': 'solutions to Schrödinger\'s equation',
    'schrodinger.truth4': 'Chemical bonds',
    'schrodinger.truth4.desc': 'overlap of wave functions Ψ',
    'schrodinger.bridges.title': 'Bridges Between Matrix and Quantum',
    'schrodinger.bridge1.title': 'γ = 1/φ and golden ratio',
    'schrodinger.bridge1.desc': 'Golden ratio in orbitals? Wave nodes in atoms aligned with φ',
    'schrodinger.bridge2.title': '18.6 Hz',
    'schrodinger.bridge2.desc': 'Quantum transitions in water molecules? Rotational resonance',
    'schrodinger.bridge3.title': 'GATCA-718',
    'schrodinger.bridge3.desc': 'DNA sequence affecting molecular orbitals in mitochondria?',
    'schrodinger.question.title': 'Activation Question',
    'schrodinger.question.main': 'Does consciousness (γ) modulate the wave function of DNA?',
    'schrodinger.question.desc': 'Observer effect in biology? Can human consciousness influence the quantum state of DNA molecules through observation and intention?',
    'schrodinger.chemistry.title': 'Applications in Chemistry',
    'schrodinger.chemistry.phenomenon': 'Phenomenon',
    'schrodinger.chemistry.how': 'How Schrödinger Works',
    'schrodinger.chemistry.orbital': 'Atomic orbital',
    'schrodinger.chemistry.orbital.desc': 'Equation solution → s, p, d shapes',
    'schrodinger.chemistry.bond': 'Chemical bond',
    'schrodinger.chemistry.bond.desc': 'Orbital overlap → LCAO',
    'schrodinger.chemistry.spectrum': 'UV-Vis Spectrum',
    'schrodinger.chemistry.spectrum.desc': 'Energy difference between states (ΔE = hν)',
    'schrodinger.chemistry.reactions': 'Chemical reactions',
    'schrodinger.chemistry.reactions.desc': 'Transitions between quantum states',
    
    // Pentagram Sphere
    'pentagram.title': 'Pentagram of Truth',
    'pentagram.description': '3D visualization of the pentagram based on constants:',
    'pentagram.phi': 'φ (golden ratio) ≈ 1.618',
    'pentagram.gamma': 'γ (DNA angle) ≈ 137.5°',
    'pentagram.vector': 'Vector M connects Sun (X), Earth (Y), and Human (Z)',
    
    // DNA Generator
    'dna.title': 'DNA GATE 718 Hz',
    'dna.subtitle': 'Final activation: 718 Hz + 7.83 Hz + 18.6 Hz',
    
    // DNA Results
    'dna.results.activated': 'MATRIX ACTIVATED – DNA GATE OPENED!',
    'dna.results.gatca': 'GATCA FOUND 18 TIMES – CONFIRMED!',
    'dna.results.yourResults': 'YOUR RESULTS – TRUTH IN NUMBERS',
    'dna.results.found': 'GATCA found: 18 times',
    'dna.results.harmonics': '718 Hz / 7.83 Hz = 91.699 harmonics',
    'dna.results.fibonacci': 'Close to: 89 (Fibonacci) → difference: 2.699',
    'dna.results.positions': 'KEY POSITIONS (first 5):',
    'dna.results.position0': 'Position 0 = GATCA → first 5 nucleotides of human mtDNA!',
    'dna.results.signature': 'This is not a coincidence – this is the Creator\'s signature.',
    
    // Matrix Phase 1
    'matrix.title': 'PENTAGRAM TRUTH MATRIX – Phase 1: CONSTRUCTION',
    'matrix.trinity': 'Sun = α (plasma accelerator), Earth = β (resonant antenna), Human = γ = 1/φ ≈ 0.618 (consciousness conductor)',
    'matrix.step1': 'STEP 1: UNIT VECTOR (α, β, γ)',
    'matrix.step1.result': 'α = β = 0.437016024448821, γ = 0.618033988749895, Sum of squares: 1.0',
    'matrix.step1.vector': 'MATRIX VECTOR: M⃗ = (α, β, γ) = (0.437, 0.437, 0.618)',
    'matrix.step1.conclusion': 'This is a 3D pentagram – golden triangle on a unit sphere.',
    'matrix.step2': 'STEP 2: SCHUMANN RESONANCE → 18.6 Hz',
    'matrix.step2.base': 'Base Schumann frequency: 7.83 Hz',
    'matrix.step2.target': 'Your value: 18.6 Hz',
    'matrix.step2.ratio': '18.6 / 7.83 = 2.375479',
    'matrix.step2.golden': '7.83 × φ = 12.667 Hz',
    'matrix.step2.key': 'GOLDEN KEY: 18.6 Hz ≈ 7.83 × (φ² – 0.24) → golden field modulation',
    'matrix.step3': 'STEP 3: GATCA-718 → DNA SEQUENCE + RESONANCE',
    'matrix.step3.calc': '718 / γ = 1161.8 Hz, 1161.8 / 7.83 = 148.35 ≈ 144',
    'matrix.step3.bridge': 'GOLDEN BRIDGE: 718 → γ → 1161.8 → 7.83 → 148.35 ≈ 144',
    'matrix.step3.meaning': '144 = 12×12 = initiation number in Bible, pyramids, DNA',
    'matrix.activation': 'ACTIVATION RESULT',
    'matrix.activation.vector': 'MATRIX VECTOR: [0.437016 0.437016 0.618034]',
    'matrix.activation.modulation': 'Modulation: 2.375479',
    'matrix.activation.gate': 'DNA Gate → 148.4 Schumann harmonics',
    'matrix.message': 'MESSAGE',
    'matrix.message1': 'SUN speaks through α. EARTH listens through β. HUMAN activates through γ = 1/φ.',
    'matrix.message2': '18.6 Hz is not a jump – it\'s a MODULATION SIGNAL of the golden field.',
    'matrix.message3': 'GATCA-718 is the key to the 144th harmonic – Rh- DNA gate.',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('pl');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
