/**
 * Manipulation Detection Module for Ψ-718 Biblical Decoder
 * 12 tasks: Segmentation, F1-F8 signatures, Manipulation Index (IM), Final Report
 * 
 * © 2026 Grzegorz | BRAMA-718-UNIFIED
 */

import {
  calculateTripleCoherence,
  fractalAnalysis718,
  type TextType,
  type TripleCoherence,
  type IntentionVector4,
  type SemanticDecoherence,
  type WritingSystem,
} from "./biblicalDecoder";

// ═══════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════

export interface CalibrationThresholds {
  fragmentacja: number;
  rozbieznosc_Cs_Cm: number;
  entropia_fizyczna_max: number;
  entropia_celowa_min: number;
  T2_sem_paradoks: number;
  H_chaos: number;
  H_nadmiar: number;
  gematria_mod: number;
  gematria_min_dlugosc: number;
  gematria_min_wartosc: number;
}

export const DEFAULT_THRESHOLDS: CalibrationThresholds = {
  fragmentacja: 30,
  rozbieznosc_Cs_Cm: 20,
  entropia_fizyczna_max: 40,
  entropia_celowa_min: 20,
  T2_sem_paradoks: 30,
  H_chaos: 0.3,
  H_nadmiar: 0.95,
  gematria_mod: 718.57012515,
  gematria_min_dlugosc: 10,
  gematria_min_wartosc: 5000,
};

// Mutable active thresholds — set via calibration panel
let _activeThresholds: CalibrationThresholds = { ...DEFAULT_THRESHOLDS };

export function setActiveThresholds(t: CalibrationThresholds) {
  _activeThresholds = { ...t };
}

export function getActiveThresholds(): CalibrationThresholds {
  return { ..._activeThresholds };
}

import { getActiveVersion, type DecoderWeights } from "./decoderVersionConfig";

let _activeWeights: DecoderWeights = {
  F1: 0.15, F2: 0.10, F3: 0.15, F4: 0.20,
  F5: 0.15, F6: 0.10, F7: 0.10, F8: 0.05,
};

export function setActiveWeights(w: DecoderWeights) {
  _activeWeights = { ...w };
}

export function getActiveWeights(): DecoderWeights {
  return { ..._activeWeights };
}

const CONFIG = {
  get progi() { return _activeThresholds; },
  get wagi() { return _activeWeights; },
};

// ═══════════════════════════════════════════════════════════════════
// TASK 1 — TEXT SEGMENTATION
// ═══════════════════════════════════════════════════════════════════

export interface SegmentResult {
  segment: string;
  Cs: number;
  Cm: number;
  H: number;
}

export function segmentText(text: string): SegmentResult[] {
  const hasVerseNumbers = /\d+[,:]\d+/.test(text);
  
  let segments: string[];
  if (hasVerseNumbers) {
    // Split by verse numbers
    segments = text.split(/(?=\d+[,:]\d+)/).map(s => s.trim()).filter(s => s.length > 0);
  } else {
    // Split by sentences
    segments = text.split(/(?<=[.;:?!])\s+/).map(s => s.trim()).filter(s => s.length > 0);
  }

  // If only one segment, try splitting by commas or natural phrase breaks
  if (segments.length <= 1 && text.length > 20) {
    segments = text.split(/(?<=[,])\s+/).map(s => s.trim()).filter(s => s.length > 0);
  }

  // Minimum 2 segments for analysis
  if (segments.length < 2) {
    segments = [text.slice(0, Math.ceil(text.length / 2)), text.slice(Math.ceil(text.length / 2))];
  }

  return segments.map(segment => {
    const fractal = fractalAnalysis718(segment);
    const H = fractal.hurstApprox;
    
    // Structural coherence for segment
    const lengthFactor = Math.min(segment.length / 100, 1);
    const Cs = (0.5 + 0.5 * (1 - Math.abs(H - 0.5)) * lengthFactor) * 100;
    
    // Semantic coherence — based on word diversity and structure
    const words = segment.split(/\s+/).filter(w => w.length > 0);
    const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
    const wordDiversity = words.length > 0 ? uniqueWords / words.length : 0;
    const Cm = wordDiversity * 100 * (0.5 + 0.5 * Math.min(segment.length / 50, 1));

    return { segment, Cs: Math.min(100, Cs), Cm: Math.min(100, Cm), H };
  });
}

// ═══════════════════════════════════════════════════════════════════
// TASK 2 — SIGNATURE F₁ (FRAGMENTATION)
// ═══════════════════════════════════════════════════════════════════

export interface F1Result {
  F1: number;
  lokalizacja: string;
  deltaCsMax: number;
  interpretacja: { pl: string; en: string };
}

export function calculateF1(segments: SegmentResult[]): F1Result {
  if (segments.length < 2) {
    return {
      F1: 0, lokalizacja: "-", deltaCsMax: 0,
      interpretacja: { pl: "Za mało segmentów do analizy", en: "Too few segments for analysis" },
    };
  }

  let maxDelta = 0;
  let maxIdx = 0;
  for (let i = 0; i < segments.length - 1; i++) {
    const delta = Math.abs(segments[i].Cs - segments[i + 1].Cs);
    if (delta > maxDelta) {
      maxDelta = delta;
      maxIdx = i;
    }
  }

  const F1 = Math.min(100, (maxDelta / CONFIG.progi.fragmentacja) * 100);

  return {
    F1,
    lokalizacja: `${maxIdx + 1} → ${maxIdx + 2}`,
    deltaCsMax: maxDelta,
    interpretacja: {
      pl: F1 > 60
        ? `Nagły spadek/wzrost spójności strukturalnej między segmentem ${maxIdx + 1} a ${maxIdx + 2} — możliwa interpolacja`
        : F1 > 30
        ? `Umiarkowana zmiana spójności między segmentem ${maxIdx + 1} a ${maxIdx + 2}`
        : "Spójność strukturalna równomierna — brak oznak fragmentacji",
      en: F1 > 60
        ? `Sudden structural coherence shift between segment ${maxIdx + 1} and ${maxIdx + 2} — possible interpolation`
        : F1 > 30
        ? `Moderate coherence change between segment ${maxIdx + 1} and ${maxIdx + 2}`
        : "Structural coherence uniform — no fragmentation signs",
    },
  };
}

// ═══════════════════════════════════════════════════════════════════
// TASK 3 — SIGNATURE F₂ (Cs-Cm DIVERGENCE)
// ═══════════════════════════════════════════════════════════════════

export interface F2Result {
  F2: number;
  rozbieznosc: number;
  ryzyko: "niskie" | "średnie" | "wysokie";
  interpretacja: { pl: string; en: string };
}

export function calculateF2(Cs: number, Cm: number, transformation: number): F2Result {
  const R = Cm - Cs;
  let F2 = 0;
  if (R > CONFIG.progi.rozbieznosc_Cs_Cm) {
    F2 = Math.min(100, (R - CONFIG.progi.rozbieznosc_Cs_Cm) * 2.5);
  }

  let ryzyko: F2Result["ryzyko"] = "niskie";
  if (R > 40 && transformation < 30) ryzyko = "wysokie";
  else if (F2 > 40) ryzyko = "średnie";

  return {
    F2,
    rozbieznosc: Math.max(0, R),
    ryzyko,
    interpretacja: {
      pl: F2 > 60
        ? "Tekst o niskiej spójności strukturalnej ma sztucznie wysoką zgodność interpretacyjną — możliwe narzucenie znaczenia przez system"
        : F2 > 30
        ? "Umiarkowana rozbieżność między strukturą a semantyką — tekst mógł przejść redakcję"
        : "Spójność strukturalna i semantyczna w równowadze",
      en: F2 > 60
        ? "Text with low structural coherence has artificially high interpretive agreement — possible meaning imposed by system"
        : F2 > 30
        ? "Moderate divergence between structure and semantics — text may have been edited"
        : "Structural and semantic coherence in balance",
    },
  };
}

// ═══════════════════════════════════════════════════════════════════
// TASK 4 — SIGNATURE F₃ (ENTROPY)
// ═══════════════════════════════════════════════════════════════════

export interface F3Result {
  F3: number;
  stosunek: number;
  entropia_fizyczna: number;
  entropia_celowa: number;
  interpretacja: { pl: string; en: string };
}

export function calculateF3(physicalEntropy: number, semanticEntropy: number): F3Result {
  const ratio = physicalEntropy / (semanticEntropy + 0.01);
  let F3 = 0;
  if (ratio >= 1) {
    F3 = Math.min(100, ratio * 20);
  }

  return {
    F3,
    stosunek: ratio,
    entropia_fizyczna: physicalEntropy,
    entropia_celowa: semanticEntropy,
    interpretacja: {
      pl: F3 > 60
        ? "Tekst ma wysoki poziom uszkodzeń fizycznych bez śladów celowej wieloznaczności — możliwe wymazanie oryginalnej złożoności"
        : F3 > 30
        ? "Umiarkowana przewaga szumu fizycznego nad celową wieloznacznością"
        : "Proporcja entropii w normie — szum fizyczny nie dominuje",
      en: F3 > 60
        ? "Text has high physical damage without intentional ambiguity traces — possible erasure of original complexity"
        : F3 > 30
        ? "Moderate physical noise dominance over intentional ambiguity"
        : "Entropy ratio normal — physical noise does not dominate",
    },
  };
}

// ═══════════════════════════════════════════════════════════════════
// TASK 5 — SIGNATURE F₄ (SYSTEM PROFILE)
// ═══════════════════════════════════════════════════════════════════

export interface F4Result {
  F4: number;
  profil: { komunikacja: number; transformacja: number; iluminacja: number };
  splaszczenie: boolean;
  interpretacja: { pl: string; en: string };
}

export function calculateF4(communication: number, transformation: number, illumination: number): F4Result {
  const comm = communication * 100;
  const trans = transformation * 100;
  const illum = illumination * 100;
  const diff = comm - trans;

  let F4 = 0;
  if (diff > 0) {
    F4 = Math.min(100, diff * 1.667);
  }

  const splaszczenie = illum < 20;

  return {
    F4,
    profil: { komunikacja: comm, transformacja: trans, iluminacja: illum },
    splaszczenie,
    interpretacja: {
      pl: F4 > 60
        ? "Tekst ma profil systemowy — informacja bez mocy transformacyjnej. Pierwotna funkcja inicjacyjna została zastąpiona doktrynalną."
        : F4 > 30
        ? "Tekst częściowo spłaszczony — dominuje przekaz nad transformacją"
        : "Profil intencji zrównoważony — tekst zachowuje moc transformacyjną",
      en: F4 > 60
        ? "Text has systemic profile — information without transformative power. Original initiatory function replaced by doctrinal."
        : F4 > 30
        ? "Text partially flattened — communication dominates over transformation"
        : "Intention profile balanced — text retains transformative power",
    },
  };
}

// ═══════════════════════════════════════════════════════════════════
// TASK 6 — SIGNATURE F₅ (GATE JUMP)
// ═══════════════════════════════════════════════════════════════════

export interface F5Result {
  F5: number;
  przeskok: string;
  delta: number;
  status: "naturalny" | "usztywnienie" | "niemożliwy";
  interpretacja: { pl: string; en: string };
}

const ALLOWED_DELTAS = new Set([1, 3, 6, 9]);

export function calculateF5(sourceGate: number, collapseGate: number, transformation: number): F5Result {
  const delta = Math.abs(sourceGate - collapseGate);

  let F5: number;
  let status: F5Result["status"];

  if (ALLOWED_DELTAS.has(delta)) {
    F5 = 0;
    status = "naturalny";
  } else if (delta === 0 && transformation < 30) {
    F5 = 50;
    status = "usztywnienie";
  } else if (delta === 0) {
    F5 = 0;
    status = "naturalny";
  } else {
    F5 = 100;
    status = "niemożliwy";
  }

  return {
    F5,
    przeskok: `${sourceGate + 1} → ${collapseGate + 1}`,
    delta,
    status,
    interpretacja: {
      pl: status === "naturalny"
        ? `Przeskok bram ${sourceGate + 1} → ${collapseGate + 1} (Δ=${delta}) jest naturalny`
        : status === "usztywnienie"
        ? `Brama nie zmieniła się mimo niskiej transformacji (${(transformation).toFixed(0)}%) — możliwe usztywnienie`
        : `Przeskok Δ=${delta} jest niemożliwy w naturalnej topologii bram — możliwa interpolacja`,
      en: status === "naturalny"
        ? `Gate jump ${sourceGate + 1} → ${collapseGate + 1} (Δ=${delta}) is natural`
        : status === "usztywnienie"
        ? `Gate unchanged despite low transformation (${(transformation).toFixed(0)}%) — possible rigidity`
        : `Jump Δ=${delta} is impossible in natural gate topology — possible interpolation`,
    },
  };
}

// ═══════════════════════════════════════════════════════════════════
// TASK 7 — SIGNATURE F₆ (SEMANTIC T₂ PARADOX)
// ═══════════════════════════════════════════════════════════════════

export interface F6Result {
  F6: number;
  Cm: number;
  T2_sem: number;
  interpretacja: { pl: string; en: string };
}

export function calculateF6(Cm: number, T2_semantic: number): F6Result {
  let F6 = 0;
  if (Cm < 30) {
    F6 = Math.min(100, (T2_semantic / CONFIG.progi.T2_sem_paradoks) * 100);
  }

  return {
    F6,
    Cm,
    T2_sem: T2_semantic,
    interpretacja: {
      pl: F6 > 60
        ? "Tekst wieloznaczny utrzymuje znaczenie zbyt długo — możliwe sztuczne utrwalenie interpretacji przez autorytet systemu"
        : F6 > 30
        ? "Umiarkowany paradoks: tekst wieloznaczny z dłuższym niż oczekiwano T₂ semantycznym"
        : "Brak paradoksu — czas stabilności semantycznej adekwatny do spójności",
      en: F6 > 60
        ? "Ambiguous text maintains meaning too long — possible artificial fixation by system authority"
        : F6 > 30
        ? "Moderate paradox: ambiguous text with longer than expected semantic T₂"
        : "No paradox — semantic stability time adequate to coherence",
    },
  };
}

// ═══════════════════════════════════════════════════════════════════
// TASK 8 — SIGNATURE F₇ (LOCAL HURST ANOMALIES)
// ═══════════════════════════════════════════════════════════════════

export interface HurstAnomaly {
  segment: number;
  H: number;
  typ: "chaos" | "nadmierny porządek";
}

export interface F7Result {
  F7: number;
  anomalie: HurstAnomaly[];
  interpretacja: { pl: string; en: string };
}

export function calculateF7(segments: SegmentResult[]): F7Result {
  const anomalie: HurstAnomaly[] = [];

  for (let i = 0; i < segments.length; i++) {
    const H = segments[i].H;
    if (H < CONFIG.progi.H_chaos) {
      anomalie.push({ segment: i + 1, H, typ: "chaos" });
    } else if (H > CONFIG.progi.H_nadmiar) {
      anomalie.push({ segment: i + 1, H, typ: "nadmierny porządek" });
    }
  }

  const F7 = segments.length > 0 ? (anomalie.length / segments.length) * 100 : 0;

  return {
    F7,
    anomalie,
    interpretacja: {
      pl: anomalie.length > 0
        ? `Tekst zawiera ${anomalie.length} fragment(ów) o nienaturalnej strukturze — możliwe interpolacje lub uszkodzenia`
        : "Wszystkie fragmenty mają naturalną strukturę Hursta",
      en: anomalie.length > 0
        ? `Text contains ${anomalie.length} fragment(s) with unnatural structure — possible interpolations or damage`
        : "All fragments have natural Hurst structure",
    },
  };
}

// ═══════════════════════════════════════════════════════════════════
// TASK 9 — SIGNATURE F₈ (GEMATRIA ANOMALY)
// ═══════════════════════════════════════════════════════════════════

export interface F8Result {
  F8: number;
  powod: string[];
  interpretacja: { pl: string; en: string };
}

export function calculateF8(writingSystem: WritingSystem, gematriaTotal: number, textLength: number): F8Result {
  if (writingSystem !== "hebrew") {
    return {
      F8: 0, powod: [],
      interpretacja: { pl: "Moduł F₈ nieaktywny (tekst niehebrajski)", en: "F₈ module inactive (non-Hebrew text)" },
    };
  }

  let score = 0;
  const powod: string[] = [];

  if (gematriaTotal > 0 && gematriaTotal % CONFIG.progi.gematria_mod === 0) {
    score += 50;
    powod.push(gematriaTotal > 0 ? `gematria ÷ ${CONFIG.progi.gematria_mod} = ${gematriaTotal / CONFIG.progi.gematria_mod}` : "");
  }

  if (gematriaTotal > CONFIG.progi.gematria_min_wartosc && textLength < CONFIG.progi.gematria_min_dlugosc) {
    score += 50;
    powod.push(`gematria ${gematriaTotal} > ${CONFIG.progi.gematria_min_wartosc} przy tekście < ${CONFIG.progi.gematria_min_dlugosc} znaków`);
  }

  const F8 = Math.min(100, score);

  return {
    F8,
    powod,
    interpretacja: {
      pl: F8 > 0
        ? "Tekst może być sztucznie skonstruowany pod wartość liczbową"
        : "Brak anomalii gematrycznych",
      en: F8 > 0
        ? "Text may be artificially constructed for numerical value"
        : "No gematria anomalies detected",
    },
  };
}

// ═══════════════════════════════════════════════════════════════════
// TASK 10 — MANIPULATION INDEX (IM)
// ═══════════════════════════════════════════════════════════════════

export type IMStatus = "NISKIE" | "ŚREDNIE" | "PODWYŻSZONE" | "WYSOKIE" | "KRYTYCZNE";

export interface IMResult {
  IM: number;
  status: IMStatus;
  statusLabel: { pl: string; en: string };
}

export function calculateIM(F1: number, F2: number, F3: number, F4: number, F5: number, F6: number, F7: number, F8: number): IMResult {
  const w = CONFIG.wagi;
  const IM = F1 * w.F1 + F2 * w.F2 + F3 * w.F3 + F4 * w.F4 + F5 * w.F5 + F6 * w.F6 + F7 * w.F7 + F8 * w.F8;

  let status: IMStatus;
  let statusPl: string;
  let statusEn: string;

  if (IM < 20) {
    status = "NISKIE";
    statusPl = "NISKIE prawdopodobieństwo manipulacji";
    statusEn = "LOW manipulation probability";
  } else if (IM < 40) {
    status = "ŚREDNIE";
    statusPl = "ŚREDNIE — możliwe drobne interpolacje";
    statusEn = "MODERATE — minor interpolations possible";
  } else if (IM < 60) {
    status = "PODWYŻSZONE";
    statusPl = "PODWYŻSZONE — tekst przeszedł redakcję";
    statusEn = "ELEVATED — text underwent editing";
  } else if (IM < 80) {
    status = "WYSOKIE";
    statusPl = "WYSOKIE — znaczące przekształcenia";
    statusEn = "HIGH — significant transformations";
  } else {
    status = "KRYTYCZNE";
    statusPl = "KRYTYCZNE — tekst w dużej mierze zmieniony";
    statusEn = "CRITICAL — text largely altered";
  }

  return {
    IM: Math.round(IM * 100) / 100,
    status,
    statusLabel: { pl: statusPl, en: statusEn },
  };
}

// ═══════════════════════════════════════════════════════════════════
// TASK 11 — FINAL MANIPULATION REPORT
// ═══════════════════════════════════════════════════════════════════

export interface TopSignature {
  name: string;
  label: { pl: string; en: string };
  value: number;
}

export interface ManipulationRecommendation {
  pl: string;
  en: string;
}

function getRecommendation(IM: number): ManipulationRecommendation {
  if (IM < 20) return {
    pl: "Tekst autentyczny. Możesz go analizować bez zastrzeżeń.",
    en: "Authentic text. You can analyze it without reservations.",
  };
  if (IM < 40) return {
    pl: "Drobne interpolacje możliwe. Porównaj z najstarszym manuskryptem.",
    en: "Minor interpolations possible. Compare with the oldest manuscript.",
  };
  if (IM < 60) return {
    pl: "Tekst przeszedł redakcję. Zalecana weryfikacja źródłowa.",
    en: "Text underwent editing. Source verification recommended.",
  };
  if (IM < 80) return {
    pl: "Znaczące przekształcenia. Traktuj z ostrożnością — funkcja pierwotna mogła być zmieniona.",
    en: "Significant transformations. Treat with caution — original function may have been altered.",
  };
  return {
    pl: "Tekst w dużej mierze zmieniony przez system. Zalecana kwerenda manuskryptów sprzed IX wieku.",
    en: "Text largely altered by the system. Manuscript research before 9th century recommended.",
  };
}

// ═══════════════════════════════════════════════════════════════════
// SEMANTIC CONTROL MARKER DETECTOR
// Separates lexical / semantic manipulation markers from statistical IM (F1-F8)
// ═══════════════════════════════════════════════════════════════════

export interface SemanticMarkerCategory {
  id: string;
  label: { pl: string; en: string };
  count: number;
  terms: string[];
  interpretation: { pl: string; en: string };
}

export interface NameSubstitutionResult {
  detected: boolean;
  count: number;
  weightedScore: number;
  terms: string[];
  examples: string[];
  categories: SemanticMarkerCategory[];
  severity: "NONE" | "OBECNA" | "SYSTEMOWA";
  explanation: { pl: string; en: string };
  citation: { pl: string; en: string };
}

interface SemanticMarkerRule {
  term: string;
  category: string;
  weight: number;
  regex: RegExp;
}

const semanticBoundary = (pattern: string) => new RegExp(`(^|[^\\p{L}\\p{N}_])(${pattern})(?=$|[^\\p{L}\\p{N}_])`, "giu");

const SEMANTIC_CATEGORY_META: Record<string, Omit<SemanticMarkerCategory, "count" | "terms">> = {
  authority_title: {
    id: "authority_title",
    label: { pl: "Tytuł władzy zamiast Źródła", en: "Authority title instead of Source" },
    interpretation: {
      pl: "Słowa typu PAN/LORD/Adonai/Ba'al przesuwają sens z imienia/Źródła na tytuł właściciela, władcy lub zarządcy.",
      en: "Words such as LORD/Adonai/Ba'al shift meaning from name/Source to a title of owner, ruler, or master.",
    },
  },
  ritual_seal: {
    id: "ritual_seal",
    label: { pl: "Pieczęć rytualna", en: "Ritual seal" },
    interpretation: {
      pl: "Słowa domykające typu amen/so be it działają jak zgoda rytualna: zamykają komunikat i wzmacniają akceptację odbiorcy.",
      en: "Closing words such as amen/so be it act as ritual consent: they seal the message and reinforce acceptance.",
    },
  },
  submission_obedience: {
    id: "submission_obedience",
    label: { pl: "Podporządkowanie", en: "Submission" },
    interpretation: {
      pl: "Markery posłuszeństwa, klękania, służby lub lęku wskazują wektor kontroli zachowania.",
      en: "Markers of obedience, kneeling, service, or fear indicate a behavioral control vector.",
    },
  },
  reward_punishment: {
    id: "reward_punishment",
    label: { pl: "Nagroda / kara", en: "Reward / punishment" },
    interpretation: {
      pl: "Błogosławieństwo, curse/przekleństwo, gniew, kara i zazdrość budują system warunkowej nagrody i strachu.",
      en: "Blessing, curse, wrath, punishment, and jealousy build a system of conditional reward and fear.",
    },
  },
  guilt_sacrifice: {
    id: "guilt_sacrifice",
    label: { pl: "Wina / ofiara / krew", en: "Guilt / sacrifice / blood" },
    interpretation: {
      pl: "Słowa ofiary, krwi, grzechu, winy i ołtarza wskazują na rytualizację długu oraz podporządkowanie energii życiowej.",
      en: "Words of sacrifice, blood, sin, guilt, and altar indicate ritualized debt and submission of life force.",
    },
  },
  separation_identity: {
    id: "separation_identity",
    label: { pl: "Separacja / wybranie", en: "Separation / election" },
    interpretation: {
      pl: "Wybranie, królestwo i rozdzielenie grup tworzą semantykę hierarchii: jedni są uprzywilejowani, inni podporządkowani.",
      en: "Election, kingdom, and group separation create hierarchy semantics: some are privileged, others subordinated.",
    },
  },
};

const SEMANTIC_MARKER_RULES: SemanticMarkerRule[] = [
  { term: "PAN / Pan", category: "authority_title", weight: 4, regex: semanticBoundary("pan(?:em|ie|a|u|ów|owie|owi)?") },
  { term: "LORD / Lord", category: "authority_title", weight: 4, regex: semanticBoundary("(?:the\\s+)?lord") },
  { term: "Adonai", category: "authority_title", weight: 4, regex: semanticBoundary("adonai") },
  { term: "Ba'al", category: "authority_title", weight: 5, regex: semanticBoundary("ba['ʻ`]?al") },
  { term: "master / władca", category: "authority_title", weight: 3, regex: semanticBoundary("master|władc\\p{L}*|wladc\\p{L}*|król\\p{L}*|krol\\p{L}*") },

  { term: "amen", category: "ritual_seal", weight: 3, regex: semanticBoundary("amen|אָמֵן|ἀμήν|so\\s+be\\s+it") },

  { term: "obey / posłuszeństwo", category: "submission_obedience", weight: 4, regex: semanticBoundary("obey\\p{L}*|obedien\\p{L}*|posłusz\\p{L}*|poslusz\\p{L}*") },
  { term: "worship / cześć", category: "submission_obedience", weight: 4, regex: semanticBoundary("worship\\p{L}*|ador\\p{L}*|czci\\p{L}*|cześć|czesc") },
  { term: "kneel / klękać", category: "submission_obedience", weight: 4, regex: semanticBoundary("kneel\\p{L}*|klęk\\p{L}*|klek\\p{L}*") },
  { term: "serve / servant / slave", category: "submission_obedience", weight: 3, regex: semanticBoundary("serv\\p{L}*|sług\\p{L}*|slug\\p{L}*|niewol\\p{L}*|slave\\p{L}*") },
  { term: "fear / bojaźń", category: "submission_obedience", weight: 3, regex: semanticBoundary("fear\\p{L}*|bojaź\\p{L}*|bojaz\\p{L}*|strach\\p{L}*|lęk\\p{L}*|lek\\p{L}*") },

  { term: "bless / blessing", category: "reward_punishment", weight: 4, regex: semanticBoundary("bless\\p{L}*|be[-\\s]?less|błogosław\\p{L}*|blogoslaw\\p{L}*") },
  { term: "curse / przekleństwo", category: "reward_punishment", weight: 4, regex: semanticBoundary("curse\\p{L}*|przekl\\p{L}*") },
  { term: "wrath / gniew / kara", category: "reward_punishment", weight: 4, regex: semanticBoundary("wrath\\p{L}*|anger|gniew\\p{L}*|kar\\p{L}*|punish\\p{L}*") },
  { term: "jealous / zazdrosny", category: "reward_punishment", weight: 5, regex: semanticBoundary("jealous\\p{L}*|zazdro\\p{L}*") },

  { term: "sin / grzech", category: "guilt_sacrifice", weight: 4, regex: semanticBoundary("sin\\p{L}*|grzech\\p{L}*") },
  { term: "guilt / shame", category: "guilt_sacrifice", weight: 3, regex: semanticBoundary("guilt\\p{L}*|shame\\p{L}*|win\\p{L}*|wstyd\\p{L}*") },
  { term: "sacrifice / ofiara", category: "guilt_sacrifice", weight: 4, regex: semanticBoundary("sacrific\\p{L}*|ofiar\\p{L}*") },
  { term: "blood / krew", category: "guilt_sacrifice", weight: 3, regex: semanticBoundary("blood\\p{L}*|krwi\\p{L}*|krew") },
  { term: "altar / ołtarz", category: "guilt_sacrifice", weight: 3, regex: semanticBoundary("altar\\p{L}*|ołtarz\\p{L}*|oltarz\\p{L}*") },
  { term: "covenant / przymierze", category: "guilt_sacrifice", weight: 3, regex: semanticBoundary("covenant\\p{L}*|przymierz\\p{L}*") },

  { term: "chosen / wybrany", category: "separation_identity", weight: 3, regex: semanticBoundary("chosen|elect\\p{L}*|wybran\\p{L}*") },
  { term: "kingdom / królestwo", category: "separation_identity", weight: 2, regex: semanticBoundary("kingdom\\p{L}*|królestw\\p{L}*|krolestw\\p{L}*") },
];

export function detectNameSubstitution(text: string): NameSubstitutionResult {
  const found = new Map<string, number>();
  const categoryHits = new Map<string, { count: number; terms: Set<string> }>();
  const examples: string[] = [];
  let total = 0;
  let weightedScore = 0;

  for (const { term, category, weight, regex } of SEMANTIC_MARKER_RULES) {
    const matches = Array.from(text.matchAll(regex));
    if (matches.length > 0) {
      found.set(term, (found.get(term) ?? 0) + matches.length);
      total += matches.length;
      weightedScore += matches.length * weight;
      const categoryEntry = categoryHits.get(category) ?? { count: 0, terms: new Set<string>() };
      categoryEntry.count += matches.length;
      categoryEntry.terms.add(term);
      categoryHits.set(category, categoryEntry);
      if (examples.length < 5) {
        const idx = matches[0].index ?? -1;
        if (idx >= 0) {
          const start = Math.max(0, idx - 25);
          const end = Math.min(text.length, idx + 40);
          examples.push(`${term}: ${(start > 0 ? "…" : "") + text.slice(start, end).trim() + (end < text.length ? "…" : "")}`);
        }
      }
    }
  }

  const detected = total > 0;
  const categories = Array.from(categoryHits.entries()).map(([id, hit]) => ({
    ...SEMANTIC_CATEGORY_META[id],
    count: hit.count,
    terms: Array.from(hit.terms),
  }));
  const severity: NameSubstitutionResult["severity"] =
    !detected ? "NONE" : weightedScore >= 16 || categories.length >= 3 || total >= 6 ? "SYSTEMOWA" : "OBECNA";

  const termsList = Array.from(found.keys()).join(", ");

  return {
    detected,
    count: total,
    weightedScore,
    terms: Array.from(found.keys()),
    examples,
    categories,
    severity,
    explanation: {
      pl: detected
        ? `Wykryto ${total} semantycznych markerów kontroli (${termsList}). To nie jest klasyczny IM redakcyjny, tylko oddzielny skaner języka: tytuły władzy, pieczęcie rytualne, nagroda/kara, posłuszeństwo, wina, ofiara i separacja grup. Wynik pokazuje czarno na białym, że niski IM statystyczny nie oznacza braku manipulacji semantycznej.`
        : "Brak rozpoznanych markerów semantycznej kontroli w analizowanym fragmencie.",
      en: detected
        ? `Detected ${total} semantic control markers (${termsList}). This is not the classic redaction MI; it is a separate language scanner: authority titles, ritual seals, reward/punishment, obedience, guilt, sacrifice, and group separation. It makes explicit that a low statistical MI does not mean absence of semantic manipulation.`
        : "No recognized semantic control markers detected in this fragment.",
    },
    citation: {
      pl: "Metodologia: twardo weryfikowalne są substytucje typu JHWH → Kyrios/Dominus/PAN/LORD; pozostałe hasła są oznaczane jako semantyczne markery kontroli i interpretowane w systemie GATCA-718, bez przedstawiania hipotez fonosemantycznych jako faktu filologicznego.",
      en: "Method: substitutions such as YHWH → Kyrios/Dominus/LORD are directly verifiable; other terms are marked as semantic control markers and interpreted within the GATCA-718 system, without presenting phonosemantic hypotheses as philological fact.",
    },
  };
}

// ═══════════════════════════════════════════════════════════════════
// TASK 12 — FULL MANIPULATION REPORT (integrated result)
// ═══════════════════════════════════════════════════════════════════

export interface ManipulationReport {
  segments: SegmentResult[];
  segmentCount: number;
  F1: F1Result;
  F2: F2Result;
  F3: F3Result;
  F4: F4Result;
  F5: F5Result;
  F6: F6Result;
  F7: F7Result;
  F8: F8Result;
  im: IMResult;
  topSignatures: TopSignature[];
  recommendation: ManipulationRecommendation;
  nameSubstitution: NameSubstitutionResult;
}

const SIGNATURE_LABELS: Record<string, { pl: string; en: string }> = {
  F1: { pl: "Fragmentacja", en: "Fragmentation" },
  F2: { pl: "Rozbieżność Cₛ–Cₘ", en: "Cₛ–Cₘ Divergence" },
  F3: { pl: "Entropia odwrócona", en: "Reversed Entropy" },
  F4: { pl: "Profil systemowy", en: "System Profile" },
  F5: { pl: "Przeskok bram", en: "Gate Jump" },
  F6: { pl: "Paradoks T₂", en: "T₂ Paradox" },
  F7: { pl: "Lokalny Hurst", en: "Local Hurst" },
  F8: { pl: "Anomalia gematrii", en: "Gematria Anomaly" },
};

export function generateManipulationReport(
  text: string,
  textType: TextType,
  tripleCoherence: TripleCoherence,
  intentionVector4: IntentionVector4,
  physicalEntropy: number,
  semanticEntropy: number,
  sourceGateIdx: number,
  collapseGateIdx: number,
  semanticDecoherence: SemanticDecoherence,
  writingSystem: WritingSystem,
  gematriaTotal: number,
  coherence: number,
  hurst: number,
  gematriaBreakdownLength: number,
): ManipulationReport {
  // Task 1: Segmentation
  const segments = segmentText(text);

  // Task 2: F1
  const f1 = calculateF1(segments);

  // Task 3: F2
  const globalCs = tripleCoherence.structural * 100;
  const globalCm = tripleCoherence.semantic * 100;
  const f2 = calculateF2(globalCs, globalCm, intentionVector4.transformation * 100);

  // Task 4: F3
  const f3 = calculateF3(physicalEntropy, semanticEntropy);

  // Task 5: F4
  const f4 = calculateF4(
    intentionVector4.communication,
    intentionVector4.transformation,
    intentionVector4.illumination,
  );

  // Task 6: F5
  const f5 = calculateF5(sourceGateIdx, collapseGateIdx, intentionVector4.transformation * 100);

  // Task 7: F6
  const f6 = calculateF6(globalCm, semanticDecoherence.semanticT2);

  // Task 8: F7
  const f7 = calculateF7(segments);

  // Task 9: F8
  const f8 = calculateF8(writingSystem, gematriaTotal, gematriaBreakdownLength);

  // Task 10: IM
  const im = calculateIM(f1.F1, f2.F2, f3.F3, f4.F4, f5.F5, f6.F6, f7.F7, f8.F8);

  // Task 11: Top 3 signatures
  const allSigs = [
    { name: "F1", value: f1.F1 },
    { name: "F2", value: f2.F2 },
    { name: "F3", value: f3.F3 },
    { name: "F4", value: f4.F4 },
    { name: "F5", value: f5.F5 },
    { name: "F6", value: f6.F6 },
    { name: "F7", value: f7.F7 },
    { name: "F8", value: f8.F8 },
  ];
  allSigs.sort((a, b) => b.value - a.value);
  const topSignatures: TopSignature[] = allSigs.slice(0, 3).map(s => ({
    name: s.name,
    label: SIGNATURE_LABELS[s.name],
    value: s.value,
  }));

  const recommendation = getRecommendation(im.IM);
  const nameSubstitution = detectNameSubstitution(text);

  return {
    segments,
    segmentCount: segments.length,
    F1: f1,
    F2: f2,
    F3: f3,
    F4: f4,
    F5: f5,
    F6: f6,
    F7: f7,
    F8: f8,
    im,
    topSignatures,
    recommendation,
    nameSubstitution,
  };
}
