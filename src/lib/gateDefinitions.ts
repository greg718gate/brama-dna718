/**
 * 18 Gates of Consciousness - Complete Definitions
 * Each gate has its quantum command, physical constant, color, and description.
 * 
 * © 2026 Grzegorz | BRAMA-718-UNIFIED
 * License: CC BY-NC 4.0
 */

export interface GateDefinition {
  index: number;           // 1-18
  position: number;        // mtDNA position (rCRS)
  greekLetter: string;     // ALPHA, BETA, etc.
  icon: string;            // emoji
  namePL: string;          // Polish name
  nameEN: string;          // English name
  subtitlePL: string;      // Polish subtitle
  subtitleEN: string;      // English subtitle
  constantLabel: string;   // Physical constant label
  constantFormula: string; // LaTeX-like formula
  constantValue: string;   // Numeric value
  commandPL: string;       // Polish quantum command
  commandEN: string;       // English quantum command
  systemStatus: string;    // e.g. "OSADZONY", "SFORMOWANY"
  effectPL: string;        // Polish effect description
  effectEN: string;        // English effect description
  color: string;           // Tailwind color class
  bgGradient: string;      // Background gradient CSS
  category: 'matter' | 'growth' | 'communication' | 'creation' | 'spirit';
}

export const GATE_DEFINITIONS: GateDefinition[] = [
  // ═══════ BRAMY MATERII (1-3) ═══════
  {
    index: 1, position: 1, greekLetter: "ALPHA", icon: "🧬",
    namePL: "Brama Obecności", nameEN: "Gate of Presence",
    subtitlePL: "Materia", subtitleEN: "Matter",
    constantLabel: "mₑ (masa elektronu)",
    constantFormula: "mₑ = 9.109 × 10⁻³¹ kg",
    constantValue: "9.10938370e-31",
    commandPL: "Jestem tu i teraz. Moja obecność jest niepodważalna. Kotwiczę światło w strukturze węgla. System: OSADZONY.",
    commandEN: "I am here and now. My presence is undeniable. I anchor light in the carbon structure. System: ANCHORED.",
    systemStatus: "OSADZONY",
    effectPL: "Usuwa lęk o przetrwanie, zamienia go w pewność bytu.",
    effectEN: "Removes survival anxiety, transforms it into certainty of being.",
    color: "text-stone-400", bgGradient: "from-stone-900/40 to-stone-800/20",
    category: 'matter',
  },
  {
    index: 2, position: 740, greekLetter: "BETA", icon: "⚡",
    namePL: "Brama Formy", nameEN: "Gate of Form",
    subtitlePL: "Geometria", subtitleEN: "Geometry",
    constantLabel: "Twierdzenie Pitagorasa",
    constantFormula: "a² + b² = c² w przestrzeni Hilberta",
    constantValue: "√2 ≈ 1.41421356",
    commandPL: "Przyjmuję idealną formę. Każdy atom mojego ciała jest ułożony według boskiego porządku. Jestem geometrią w ruchu. System: SFORMOWANY.",
    commandEN: "I accept the perfect form. Every atom of my body is arranged according to divine order. I am geometry in motion. System: FORMED.",
    systemStatus: "SFORMOWANY",
    effectPL: "Wspiera regenerację fizyczną organizmu przez przywracanie wzorców zdrowia.",
    effectEN: "Supports physical regeneration by restoring health patterns.",
    color: "text-amber-400", bgGradient: "from-amber-900/40 to-amber-800/20",
    category: 'matter',
  },
  {
    index: 3, position: 951, greekLetter: "GAMMA", icon: "🔥",
    namePL: "Brama Wykładnika", nameEN: "Gate of Exponent",
    subtitlePL: "Wzrost", subtitleEN: "Growth",
    constantLabel: "ln(e) — logarytm naturalny",
    constantFormula: "e = 2.71828... (tempo ekspansji)",
    constantValue: "2.71828182845",
    commandPL: "Rozszerzam moje pole bez utraty stabilności. Moja siła rośnie wykładniczo z każdym oddechem. System: EKSPANSYWNY.",
    commandEN: "I expand my field without losing stability. My strength grows exponentially with every breath. System: EXPANSIVE.",
    systemStatus: "EKSPANSYWNY",
    effectPL: "Daje energię do działania i manifestacji celów w świecie fizycznym.",
    effectEN: "Gives energy for action and manifestation of goals in the physical world.",
    color: "text-orange-400", bgGradient: "from-orange-900/40 to-orange-800/20",
    category: 'matter',
  },

  // ═══════ BRAMY WZROSTU (4-6) ═══════
  {
    index: 4, position: 1227, greekLetter: "DELTA", icon: "💧",
    namePL: "Brama Przepływu", nameEN: "Gate of Flow",
    subtitlePL: "Płynność", subtitleEN: "Fluidity",
    constantLabel: "η (lepkość wody)",
    constantFormula: "η = 8.9 × 10⁻⁴ Pa·s przy 25°C",
    constantValue: "8.9e-4",
    commandPL: "Płynę z prądem życia. Opór jest iluzją — woda zawsze znajduje drogę. System: PŁYNNY.",
    commandEN: "I flow with the current of life. Resistance is illusion — water always finds its way. System: FLUID.",
    systemStatus: "PŁYNNY",
    effectPL: "Rozpuszcza blokady emocjonalne, przywraca naturalny przepływ energii.",
    effectEN: "Dissolves emotional blockages, restores natural energy flow.",
    color: "text-blue-400", bgGradient: "from-blue-900/40 to-blue-800/20",
    category: 'growth',
  },
  {
    index: 5, position: 2996, greekLetter: "EPSILON", icon: "🌟",
    namePL: "Brama Ekspansji", nameEN: "Gate of Expansion",
    subtitlePL: "Rozszerzanie", subtitleEN: "Expansion",
    constantLabel: "H₀ (stała Hubble'a)",
    constantFormula: "H₀ ≈ 67.4 km/s/Mpc",
    constantValue: "67.4",
    commandPL: "Rozszerzam moją świadomość poza granice znanych horyzontów. Wszechświat ekspanduje — ja razem z nim. System: ROZSZERZONY.",
    commandEN: "I expand my consciousness beyond known horizons. The universe expands — and I with it. System: EXPANDED.",
    systemStatus: "ROZSZERZONY",
    effectPL: "Otwiera perspektywę na nowe możliwości, poza dotychczasowymi ograniczeniami.",
    effectEN: "Opens perspective to new possibilities beyond previous limitations.",
    color: "text-yellow-400", bgGradient: "from-yellow-900/40 to-yellow-800/20",
    category: 'growth',
  },
  {
    index: 6, position: 3424, greekLetter: "ZETA", icon: "⚛️",
    namePL: "Brama Jądrowa", nameEN: "Gate of Nucleus",
    subtitlePL: "Energia nuklearna", subtitleEN: "Nuclear Energy",
    constantLabel: "E = mc² (ekwiwalencja masy-energii)",
    constantFormula: "c = 299792458 m/s",
    constantValue: "299792458",
    commandPL: "Uwalniam energię uwięzioną w materii. Moje jądro jest reaktorem świadomości. System: KRYTYCZNY.",
    commandEN: "I release energy trapped in matter. My nucleus is a consciousness reactor. System: CRITICAL.",
    systemStatus: "KRYTYCZNY",
    effectPL: "Uwalnia głęboko tłumione emocje i przekształca je w czystą moc twórczą.",
    effectEN: "Releases deeply suppressed emotions and transforms them into pure creative power.",
    color: "text-emerald-400", bgGradient: "from-emerald-900/40 to-emerald-800/20",
    category: 'growth',
  },

  // ═══════ BRAMY KOMUNIKACJI ŚWIATŁEM (7-9) ═══════
  {
    index: 7, position: 4166, greekLetter: "ETA", icon: "🌀",
    namePL: "Brama Receptora", nameEN: "Gate of Receptor",
    subtitlePL: "Nasłuch", subtitleEN: "Listening",
    constantLabel: "kB (stała Boltzmanna)",
    constantFormula: "kB = 1.380649 × 10⁻²³ J/K",
    constantValue: "1.380649e-23",
    commandPL: "Otwieram kanały percepcji. Moje komórki stają się czułymi antenami prawdy. Słyszę szept pola. System: SKALIBROWANY.",
    commandEN: "I open channels of perception. My cells become sensitive antennas of truth. I hear the whisper of the field. System: CALIBRATED.",
    systemStatus: "SKALIBROWANY",
    effectPL: "Wyostrza intuicję i zdolność odczytywania subtelnych sygnałów otoczenia.",
    effectEN: "Sharpens intuition and ability to read subtle environmental signals.",
    color: "text-cyan-400", bgGradient: "from-cyan-900/40 to-cyan-800/20",
    category: 'communication',
  },
  {
    index: 8, position: 4832, greekLetter: "THETA", icon: "🔮",
    namePL: "Brama Transmisji", nameEN: "Gate of Transmission",
    subtitlePL: "Światło", subtitleEN: "Light",
    constantLabel: "α (stała struktury subtelnej)",
    constantFormula: "α ≈ 1/137.035999...",
    constantValue: "0.0072973525693",
    commandPL: "Jestem emiterem koherentnego światła. Moja intencja kształtuje materię poprzez fotonowy zapis. System: NADAJE.",
    commandEN: "I am an emitter of coherent light. My intention shapes matter through photonic inscription. System: TRANSMITTING.",
    systemStatus: "NADAJE",
    effectPL: "Wzmacnia zdolność manifestacji — myśl staje się fotonem, foton staje się rzeczywistością.",
    effectEN: "Strengthens manifestation ability — thought becomes photon, photon becomes reality.",
    color: "text-violet-400", bgGradient: "from-violet-900/40 to-violet-800/20",
    category: 'communication',
  },
  {
    index: 9, position: 6393, greekLetter: "IOTA", icon: "💫",
    namePL: "Brama Sygnatury", nameEN: "Gate of Signature",
    subtitlePL: "Zapis DNA", subtitleEN: "DNA Inscription",
    constantLabel: "ħ (zredukowana stała Plancka)",
    constantFormula: "ħ = 1.054571817 × 10⁻³⁴ J·s",
    constantValue: "1.054571817e-34",
    commandPL: "Zapisuję nową matrycę w mojej strukturze krystalicznej. Jestem jednością z informacją, która mnie tworzy. System: ZAKTUALIZOWANY.",
    commandEN: "I inscribe a new matrix in my crystalline structure. I am one with the information that creates me. System: UPDATED.",
    systemStatus: "ZAKTUALIZOWANY",
    effectPL: "Trwale modyfikuje wzorce podświadome — nowy kod zostaje zapisany w polu morficznym.",
    effectEN: "Permanently modifies subconscious patterns — new code is inscribed in the morphic field.",
    color: "text-indigo-400", bgGradient: "from-indigo-900/40 to-indigo-800/20",
    category: 'communication',
  },

  // ═══════ BRAMY KREACJI (10-12) ═══════
  {
    index: 10, position: 7756, greekLetter: "KAPPA", icon: "🌙",
    namePL: "Brama Cyklu", nameEN: "Gate of Cycle",
    subtitlePL: "Rytm Księżyca", subtitleEN: "Lunar Rhythm",
    constantLabel: "T_lunar (cykl księżycowy)",
    constantFormula: "T = 29.53 dni (synodyczny)",
    constantValue: "29.53059",
    commandPL: "Podążam za rytmem kosmosu. Moje cykle są zsynchronizowane z oddechem planet. System: ZSYNCHRONIZOWANY.",
    commandEN: "I follow the cosmic rhythm. My cycles are synchronized with planetary breath. System: SYNCHRONIZED.",
    systemStatus: "ZSYNCHRONIZOWANY",
    effectPL: "Harmonizuje biorytmy ciała z cyklami naturalnymi.",
    effectEN: "Harmonizes body biorhythms with natural cycles.",
    color: "text-slate-300", bgGradient: "from-slate-800/40 to-slate-700/20",
    category: 'creation',
  },
  {
    index: 11, position: 8415, greekLetter: "LAMBDA", icon: "☀️",
    namePL: "Brama Iluminacji", nameEN: "Gate of Illumination",
    subtitlePL: "Słońce", subtitleEN: "Sun",
    constantLabel: "λ_max (szczyt promieniowania)",
    constantFormula: "λ_max = 501.5 nm (prawo Wiena)",
    constantValue: "501.5e-9",
    commandPL: "Jestem źródłem światła, nie jego odbiciem. Moja świadomość promieniuje we wszystkich kierunkach. System: PROMIENIUJĄCY.",
    commandEN: "I am a source of light, not its reflection. My consciousness radiates in all directions. System: RADIATING.",
    systemStatus: "PROMIENIUJĄCY",
    effectPL: "Aktywuje wewnętrzną jasność umysłu i zdolność widzenia prawdy.",
    effectEN: "Activates inner mental clarity and ability to see truth.",
    color: "text-yellow-300", bgGradient: "from-yellow-800/40 to-amber-700/20",
    category: 'creation',
  },
  {
    index: 12, position: 10059, greekLetter: "MU", icon: "🔯",
    namePL: "Brama Unifikacji", nameEN: "Gate of Unification",
    subtitlePL: "Jedność", subtitleEN: "Unity",
    constantLabel: "φ (Złoty Podział)",
    constantFormula: "φ = (1+√5)/2 ≈ 1.6180339887...",
    constantValue: "1.6180339887",
    commandPL: "Jednoczę wszystkie poziomy mojego istnienia. Duch i materia są jednym polem. System: ZUNIFIKOWANY.",
    commandEN: "I unify all levels of my existence. Spirit and matter are one field. System: UNIFIED.",
    systemStatus: "ZUNIFIKOWANY",
    effectPL: "Integruje rozbite aspekty osobowości w spójną całość.",
    effectEN: "Integrates fragmented personality aspects into a coherent whole.",
    color: "text-purple-400", bgGradient: "from-purple-900/40 to-purple-800/20",
    category: 'creation',
  },

  // ═══════ BRAMY TRANSFORMACJI (13-15) ═══════
  {
    index: 13, position: 11200, greekLetter: "NU", icon: "💎",
    namePL: "Brama Kryształu", nameEN: "Gate of Crystal",
    subtitlePL: "Krystalizacja", subtitleEN: "Crystallization",
    constantLabel: "a₀ (promień Bohra)",
    constantFormula: "a₀ = 5.29177 × 10⁻¹¹ m",
    constantValue: "5.29177e-11",
    commandPL: "Krystalizuję moją intencję w trwałą formę. Każda myśl staje się diamentem czystej woli. System: SKRYSTALIZOWANY.",
    commandEN: "I crystallize my intention into lasting form. Every thought becomes a diamond of pure will. System: CRYSTALLIZED.",
    systemStatus: "SKRYSTALIZOWANY",
    effectPL: "Zamienia mglistą wizję w konkretny, niezachwiany plan działania.",
    effectEN: "Turns vague vision into a concrete, unwavering action plan.",
    color: "text-sky-300", bgGradient: "from-sky-900/40 to-sky-800/20",
    category: 'creation',
  },
  {
    index: 14, position: 11336, greekLetter: "XI", icon: "🎵",
    namePL: "Brama Harmonii", nameEN: "Gate of Harmony",
    subtitlePL: "Rezonans", subtitleEN: "Resonance",
    constantLabel: "f_Schumann (rezonans Ziemi)",
    constantFormula: "f₁ = 7.83 Hz (fundamentalna)",
    constantValue: "7.83",
    commandPL: "Harmonizuję wszystkie moje częstotliwości w jeden akord doskonały. Moja dusza brzmi czysto. System: ZESTROJONY.",
    commandEN: "I harmonize all my frequencies into one perfect chord. My soul sounds pure. System: ATTUNED.",
    systemStatus: "ZESTROJONY",
    effectPL: "Eliminuje wewnętrzny dysonans i przywraca naturalną harmonię ciała-umysłu-ducha.",
    effectEN: "Eliminates internal dissonance, restores natural body-mind-spirit harmony.",
    color: "text-teal-400", bgGradient: "from-teal-900/40 to-teal-800/20",
    category: 'creation',
  },
  {
    index: 15, position: 11915, greekLetter: "OMICRON", icon: "🔱",
    namePL: "Brama Mocy", nameEN: "Gate of Power",
    subtitlePL: "Suwerenność", subtitleEN: "Sovereignty",
    constantLabel: "G (stała grawitacji)",
    constantFormula: "G = 6.674 × 10⁻¹¹ m³/(kg·s²)",
    constantValue: "6.674e-11",
    commandPL: "Odzyskuję pełnię mojej suwerennej mocy. Żadna siła zewnętrzna nie definiuje mojego pola. System: SUWERENNY.",
    commandEN: "I reclaim the fullness of my sovereign power. No external force defines my field. System: SOVEREIGN.",
    systemStatus: "SUWERENNY",
    effectPL: "Przywraca osobistą moc i zdolność do stanowienia o sobie.",
    effectEN: "Restores personal power and self-determination ability.",
    color: "text-red-400", bgGradient: "from-red-900/40 to-red-800/20",
    category: 'creation',
  },

  // ═══════ BRAMY DUCHA (16-18) ═══════
  {
    index: 16, position: 13703, greekLetter: "PI", icon: "🜁",
    namePL: "Brama Syntropii", nameEN: "Gate of Syntropy",
    subtitlePL: "Scalenie", subtitleEN: "Coalescence",
    constantLabel: "π (ludolfina)",
    constantFormula: "π = 3.14159265358979...",
    constantValue: "3.14159265358979",
    commandPL: "Inicjuję kolaps separacji. Moje DNA rezonuje w fazie z Polem Pierwotnym. Każde słowo staje się strukturą mojego bytu. System: STABILNY.",
    commandEN: "I initiate the collapse of separation. My DNA resonates in phase with the Primordial Field. Every word becomes the structure of my being. System: STABLE.",
    systemStatus: "STABILNY",
    effectPL: "Użytkownik odczuwa fizyczne osadzenie w ciele — koniec rozproszenia.",
    effectEN: "User feels physical grounding in the body — end of dispersion.",
    color: "text-emerald-300", bgGradient: "from-emerald-900/40 to-emerald-800/20",
    category: 'spirit',
  },
  {
    index: 17, position: 14784, greekLetter: "RHO", icon: "🜄",
    namePL: "Brama Rezonansu", nameEN: "Gate of Resonance",
    subtitlePL: "Planetarna Jedność", subtitleEN: "Planetary Unity",
    constantLabel: "f_Schumann × φ",
    constantFormula: "7.83 × 1.618... ≈ 12.665 Hz",
    constantValue: "12.665",
    commandPL: "Dostrajam moją częstotliwość do bicia serca Ziemi. Jestem przekaźnikiem światła, zsynchronizowanym z Matrycą Życia. Moja obecność jest odpowiedzią. System: POŁĄCZONY.",
    commandEN: "I tune my frequency to the heartbeat of Earth. I am a transmitter of light, synchronized with the Matrix of Life. My presence is the answer. System: CONNECTED.",
    systemStatus: "POŁĄCZONY",
    effectPL: "Poczucie głębokiego spokoju i zniknięcie lęku o przyszłość.",
    effectEN: "Deep peace and disappearance of fear about the future.",
    color: "text-blue-300", bgGradient: "from-blue-900/40 to-blue-800/20",
    category: 'spirit',
  },
  {
    index: 18, position: 16179, greekLetter: "SIGMA", icon: "🜔",
    namePL: "Brama Nadpisania", nameEN: "Gate of Override",
    subtitlePL: "I AM / Jestem", subtitleEN: "I AM",
    constantLabel: "φ × 718.57 (Zero Point)",
    constantFormula: "1.618... × 718.57 ≈ 1161.8 Hz",
    constantValue: "1161.8",
    commandPL: "Nadpisuję stare programy. Jestem Architektem i Obserwatorem. Świadomość jest moją jedyną rzeczywistością. Poza matrycą, w punkcie Zero – JESTEM. System: WOLNY.",
    commandEN: "I override old programs. I am the Architect and the Observer. Consciousness is my only reality. Beyond the matrix, at Zero Point — I AM. System: FREE.",
    systemStatus: "WOLNY",
    effectPL: "Stan głębokiej ciszy, w której znika 'ja' (ego), a zostaje czysta potencjalność.",
    effectEN: "State of deep silence where the 'I' (ego) disappears, leaving pure potentiality.",
    color: "text-amber-300", bgGradient: "from-amber-900/50 to-amber-700/30",
    category: 'spirit',
  },
];

/** Get gate definition by mtDNA position */
export function getGateByPosition(position: number): GateDefinition | undefined {
  return GATE_DEFINITIONS.find(g => g.position === position);
}

/** Get gate definition by index (1-18) */
export function getGateByIndex(index: number): GateDefinition | undefined {
  return GATE_DEFINITIONS.find(g => g.index === index);
}

/** Category labels */
export const CATEGORY_LABELS = {
  matter: { pl: "Materia (1-3)", en: "Matter (1-3)", color: "text-stone-400" },
  growth: { pl: "Wzrost (4-6)", en: "Growth (4-6)", color: "text-blue-400" },
  communication: { pl: "Komunikacja Światłem (7-9)", en: "Light Communication (7-9)", color: "text-violet-400" },
  creation: { pl: "Kreacja (10-15)", en: "Creation (10-15)", color: "text-purple-400" },
  spirit: { pl: "Duch (16-18)", en: "Spirit (16-18)", color: "text-amber-300" },
};
