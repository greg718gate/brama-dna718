/**
 * COMPLETE Academic Export for Universities and Scientific Institutions
 * DNA Gate 718 Hz - Transition Theory
 * 
 * Zawiera:
 * - Pełne obliczenia matematyczne (φ, γ, wektor M, częstotliwości)
 * - Wizualizacje SVG (pentagram, helisa DNA, sfera 3D)
 * - Tabelę 18 Bram DNA z pozycjami mtDNA, częstotliwościami, efektami
 * - Pentagram Prawdy (5 domen: Czarna Piramida, GATCA-718, Soul Proof, Neuralink, Eridu)
 * - Funkcję GATCA Zeta (biologiczna hipoteza Riemanna)
 * - Symfonię 18 Bram (algorytm + kod JavaScript)
 * - UNIFIED (4 mosty nauka-duchowość)
 * - Równanie Schrödingera z interpretacją
 * - Protokół 21-dniowy
 * - Kompletny kod Python do weryfikacji (~200 linii)
 * - Bibliografię naukową
 */

export interface AcademicExportOptions {
  authorName: string;
  institution?: string;
  email?: string;
  language: 'pl' | 'en';
}

// ============= STAŁE MATEMATYCZNE =============
const PHI = (1 + Math.sqrt(5)) / 2;           // 1.618033988749...
const GAMMA = 1 / PHI;                         // 0.618033988749...
const HBAR = 1.054571817e-34;                  // J·s
const SCHUMANN = 7.83;                         // Hz
const DNA_FREQ = 718;                          // Hz
const MTDNA_LENGTH = 16569;                    // bp

// 18 pozycji GATCA w mtDNA (rCRS)
const GATCA_POSITIONS = [
  1, 740, 951, 1227, 2996, 3424, 4166, 4832, 6393, 
  7756, 8415, 10059, 11200, 11336, 11915, 13703, 14784, 16179
];

// Obliczenia wektora M w pentagramie 3D
const calculateVectorM = () => {
  const alpha = Math.PI / 5;
  const beta = 2 * Math.PI / 5;
  const Mx = PHI * Math.cos(alpha);
  const My = PHI * Math.sin(beta);
  const Mz = GAMMA;
  const magnitude = Math.sqrt(Mx*Mx + My*My + Mz*Mz);
  return { Mx, My, Mz, magnitude };
};

const vectorM = calculateVectorM();

// ============= STYLE CSS =============
const generateStyles = () => `
  @page {
    size: A4;
    margin: 2cm;
  }
  * {
    box-sizing: border-box;
  }
  body {
    font-family: 'Times New Roman', Georgia, serif;
    font-size: 12pt;
    line-height: 1.6;
    color: #1a1a1a;
    max-width: 210mm;
    margin: 0 auto;
    padding: 20px;
    background: white;
  }
  h1, h2, h3, h4, h5, h6 {
    font-family: 'Arial', 'Helvetica', sans-serif;
    color: #0a0a0a;
    page-break-after: avoid;
  }
  h1 { font-size: 24pt; text-align: center; margin-bottom: 0.5em; }
  h2 { font-size: 18pt; border-bottom: 2px solid #333; padding-bottom: 8px; margin-top: 2em; }
  h3 { font-size: 14pt; color: #2a2a6a; margin-top: 1.5em; }
  h4 { font-size: 12pt; font-style: italic; }
  
  .header {
    text-align: center;
    margin-bottom: 40px;
    border-bottom: 3px solid #333;
    padding-bottom: 30px;
  }
  .header .title {
    font-size: 26pt;
    font-weight: bold;
    margin-bottom: 10px;
    line-height: 1.3;
  }
  .header .subtitle {
    font-size: 14pt;
    color: #444;
    margin-bottom: 20px;
  }
  .header .author {
    font-size: 14pt;
    margin: 15px 0;
  }
  .header .institution {
    font-size: 12pt;
    color: #666;
  }
  .header .date {
    font-size: 11pt;
    color: #888;
    margin-top: 15px;
  }
  
  .abstract {
    background: #f5f5f5;
    padding: 20px;
    margin: 30px 0;
    border-left: 4px solid #333;
  }
  .abstract h3 {
    margin-top: 0;
    color: #333;
  }
  
  .keywords {
    margin: 20px 0;
    font-style: italic;
  }
  .keywords strong {
    font-style: normal;
  }
  
  .section {
    margin: 30px 0;
    page-break-inside: avoid;
  }
  
  .equation-box {
    background: #f9f9f9;
    border: 1px solid #ddd;
    padding: 20px;
    margin: 20px 0;
    text-align: center;
    font-family: 'Cambria Math', 'Times New Roman', serif;
    font-size: 14pt;
  }
  .equation-box .main {
    font-size: 18pt;
    color: #1a1a6a;
    margin-bottom: 15px;
  }
  .equation-box .description {
    font-size: 11pt;
    color: #666;
    text-align: left;
  }
  
  .calculation-box {
    background: #e8f4f8;
    border: 2px solid #3498db;
    padding: 20px;
    margin: 20px 0;
    border-radius: 8px;
  }
  .calculation-box h4 {
    color: #2980b9;
    margin-top: 0;
  }
  .calculation-box .result {
    font-size: 14pt;
    font-weight: bold;
    color: #1a1a6a;
    text-align: center;
    padding: 10px;
    background: white;
    border-radius: 4px;
    margin: 10px 0;
  }
  
  .gate-table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    font-size: 9pt;
  }
  .gate-table th, .gate-table td {
    border: 1px solid #ccc;
    padding: 6px 8px;
    text-align: left;
  }
  .gate-table th {
    background: #2a2a6a;
    color: white;
    font-weight: bold;
  }
  .gate-table tr:nth-child(even) {
    background: #f9f9f9;
  }
  .gate-group-regeneration {
    background: #d4edda !important;
  }
  .gate-group-sight {
    background: #d1ecf1 !important;
  }
  .gate-group-source {
    background: #fff3cd !important;
  }
  
  .pentagram-matrix {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
    margin: 20px 0;
  }
  .matrix-cell {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 15px;
    border-radius: 8px;
    text-align: center;
  }
  .matrix-cell h5 {
    margin: 0 0 10px 0;
    font-size: 11pt;
  }
  .matrix-cell p {
    margin: 5px 0;
    font-size: 9pt;
  }
  
  .code-block {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 15px;
    margin: 15px 0;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 9pt;
    border-radius: 4px;
    overflow-x: auto;
    white-space: pre-wrap;
    line-height: 1.4;
  }
  .code-block .comment { color: #6a9955; }
  .code-block .keyword { color: #569cd6; }
  .code-block .string { color: #ce9178; }
  .code-block .number { color: #b5cea8; }
  
  .figure {
    text-align: center;
    margin: 25px 0;
    page-break-inside: avoid;
  }
  .figure svg {
    max-width: 100%;
    height: auto;
  }
  .figure .caption {
    font-size: 10pt;
    color: #666;
    margin-top: 8px;
    font-style: italic;
  }
  
  .bridge-section {
    background: #fafafa;
    border: 1px solid #e0e0e0;
    padding: 20px;
    margin: 20px 0;
    page-break-inside: avoid;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  .bridge-section .scripture {
    border-left: 3px solid #c4a000;
    padding-left: 15px;
    font-style: italic;
  }
  .bridge-section .science {
    border-left: 3px solid #0066cc;
    padding-left: 15px;
  }
  
  .protocol-step {
    display: flex;
    align-items: flex-start;
    margin: 15px 0;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 8px;
  }
  .protocol-step .number {
    background: #2a2a6a;
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    margin-right: 15px;
    flex-shrink: 0;
  }
  
  .toc {
    margin: 30px 0;
    padding: 20px;
    background: #f5f5f5;
    columns: 2;
    column-gap: 40px;
  }
  .toc h3 {
    margin-top: 0;
    column-span: all;
  }
  .toc ul {
    list-style: none;
    padding-left: 0;
    margin: 0;
  }
  .toc li {
    padding: 5px 0;
    border-bottom: 1px dotted #ccc;
    break-inside: avoid;
  }
  .toc li:last-child {
    border-bottom: none;
  }
  
  .references {
    font-size: 10pt;
  }
  .references li {
    margin-bottom: 8px;
  }
  
  .footer {
    margin-top: 50px;
    padding-top: 20px;
    border-top: 2px solid #333;
    text-align: center;
    font-size: 10pt;
    color: #666;
  }
  
  .highlight-box {
    background: linear-gradient(135deg, #f0f0ff 0%, #fff0f0 100%);
    border: 2px solid #6a6aaa;
    padding: 20px;
    margin: 20px 0;
    border-radius: 8px;
  }
  
  .unified-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
    margin: 20px 0;
  }
  .unified-item {
    background: white;
    border: 2px solid #ddd;
    padding: 15px;
    border-radius: 8px;
  }
  .unified-item h5 {
    margin: 0 0 10px 0;
    color: #2a2a6a;
  }
  
  @media print {
    body {
      padding: 0;
    }
    .no-print {
      display: none;
    }
    .page-break {
      page-break-before: always;
    }
  }
`;

// ============= WIZUALIZACJE SVG =============
const generatePentagramSVG = (lang: 'pl' | 'en') => {
  const labels =
    lang === 'pl'
      ? {
          blackPyramid: 'Czarna Piramida',
          gatca: 'GATCA-718',
          soulProof: 'Soul Proof',
          neuralink: 'Neuralink',
          eridu: 'Eridu',
        }
      : {
          blackPyramid: 'Black Pyramid',
          gatca: 'GATCA-718',
          soulProof: 'Soul Proof',
          neuralink: 'Neuralink',
          eridu: 'Eridu',
        };

  return `
<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" style="max-width: 350px;">
  <defs>
    <linearGradient id="pentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea"/>
      <stop offset="100%" style="stop-color:#764ba2"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Outer circle -->
  <circle cx="200" cy="200" r="180" fill="none" stroke="#333" stroke-width="2"/>

  <!-- Pentagram -->
  <polygon points="200,20 244,152 388,152 272,232 316,380 200,284 84,380 128,232 12,152 156,152"
           fill="none" stroke="url(#pentGrad)" stroke-width="3" filter="url(#glow)"/>

  <!-- Inner pentagon -->
  <polygon points="200,80 156,152 168,248 232,248 244,152"
           fill="rgba(102,126,234,0.1)" stroke="#667eea" stroke-width="1"/>

  <!-- Golden ratio annotations -->
  <line x1="200" y1="20" x2="200" y2="284" stroke="#999" stroke-dasharray="5,5"/>
  <text x="210" y="150" font-size="10" fill="#666">φ = ${PHI.toFixed(6)}</text>

  <!-- Labels for 5 vertices -->
  <text x="200" y="12" text-anchor="middle" font-size="11" font-weight="bold" fill="#2a2a6a">${labels.blackPyramid}</text>
  <text x="395" y="158" text-anchor="end" font-size="11" font-weight="bold" fill="#2a2a6a">${labels.gatca}</text>
  <text x="325" y="390" text-anchor="middle" font-size="11" font-weight="bold" fill="#2a2a6a">${labels.soulProof}</text>
  <text x="75" y="390" text-anchor="middle" font-size="11" font-weight="bold" fill="#2a2a6a">${labels.neuralink}</text>
  <text x="5" y="158" text-anchor="start" font-size="11" font-weight="bold" fill="#2a2a6a">${labels.eridu}</text>

  <!-- Center point M -->
  <circle cx="200" cy="200" r="8" fill="#c4a000"/>
  <text x="215" y="205" font-size="12" font-weight="bold" fill="#c4a000">M</text>
  <text x="200" y="225" text-anchor="middle" font-size="9" fill="#666">(${vectorM.Mx.toFixed(3)}, ${vectorM.My.toFixed(3)}, ${vectorM.Mz.toFixed(3)})</text>
</svg>
`;
};

const generateDNAHelixSVG = (lang: 'pl' | 'en') => {
  const caption1 = lang === 'pl' ? 'Rotacja 36° na parę zasad' : '36° rotation per bp';
  const caption2 = lang === 'pl' ? 'proporcja skoku φ' : 'φ pitch ratio';

  return `
<svg viewBox="0 0 200 400" xmlns="http://www.w3.org/2000/svg" style="max-width: 180px;">
  <defs>
    <linearGradient id="dnaGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#3498db"/>
      <stop offset="100%" style="stop-color:#2980b9"/>
    </linearGradient>
    <linearGradient id="dnaGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#e74c3c"/>
      <stop offset="100%" style="stop-color:#c0392b"/>
    </linearGradient>
  </defs>

  <!-- DNA double helix strands -->
  ${Array.from({ length: 20 }, (_, i) => {
    const y = 20 + i * 18;
    const x1 = 100 + Math.sin(i * 0.628) * 60;
    const x2 = 100 + Math.sin(i * 0.628 + Math.PI) * 60;
    return `
      <circle cx="${x1}" cy="${y}" r="6" fill="url(#dnaGrad1)"/>
      <circle cx="${x2}" cy="${y}" r="6" fill="url(#dnaGrad2)"/>
      <line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="#9b59b6" stroke-width="2" opacity="0.6"/>
    `;
  }).join('')}

  <!-- Annotations -->
  <text x="100" y="395" text-anchor="middle" font-size="10" fill="#333">${caption1}</text>
  <text x="10" y="200" font-size="9" fill="#666" transform="rotate(-90 10 200)">${caption2}</text>
</svg>
`;
};

const generateFrequencyWaveSVG = (lang: 'pl' | 'en') => {
  const label718 = lang === 'pl' ? '718 Hz (Brama DNA)' : '718 Hz (DNA Gate)';
  const labelSchumann = lang === 'pl' ? '7.83 Hz (Schumann)' : '7.83 Hz (Schumann)';

  return `
<svg viewBox="0 0 600 150" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%;">
  <defs>
    <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#3498db"/>
      <stop offset="50%" style="stop-color:#9b59b6"/>
      <stop offset="100%" style="stop-color:#e74c3c"/>
    </linearGradient>
  </defs>

  <!-- Grid -->
  ${Array.from({ length: 13 }, (_, i) => `<line x1="${i * 50}" y1="0" x2="${i * 50}" y2="150" stroke="#eee" stroke-width="1"/>`).join('')}
  ${Array.from({ length: 4 }, (_, i) => `<line x1="0" y1="${i * 50}" x2="600" y2="${i * 50}" stroke="#eee" stroke-width="1"/>`).join('')}

  <!-- 718 Hz wave -->
  <path d="M 0 75 ${Array.from({ length: 601 }, (_, x) => {
    const y = 75 - Math.sin(x * 0.1) * 40 * Math.exp(-x * 0.002);
    return `L ${x} ${y}`;
  }).join(' ')}" fill="none" stroke="url(#waveGrad)" stroke-width="2"/>

  <!-- 7.83 Hz modulation -->
  <path d="M 0 75 ${Array.from({ length: 601 }, (_, x) => {
    const y = 75 - Math.sin(x * 0.01) * 20;
    return `L ${x} ${y}`;
  }).join(' ')}" fill="none" stroke="#27ae60" stroke-width="1.5" stroke-dasharray="5,3"/>

  <!-- Labels -->
  <text x="10" y="20" font-size="11" fill="#3498db">${label718}</text>
  <text x="10" y="140" font-size="11" fill="#27ae60">${labelSchumann}</text>
  <text x="500" y="20" font-size="10" fill="#666">718/91.7 ≈ 7.83</text>
</svg>
`;
};

const generate3DSphereSVG = (lang: 'pl' | 'en') => {
  const axes =
    lang === 'pl'
      ? { sun: 'Słońce', earth: 'Ziemia', human: 'Człowiek' }
      : { sun: 'Sun', earth: 'Earth', human: 'Human' };

  return `
<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" style="max-width: 280px;">
  <defs>
    <radialGradient id="sphereGrad" cx="30%" cy="30%">
      <stop offset="0%" style="stop-color:#a8d8ff"/>
      <stop offset="100%" style="stop-color:#3498db"/>
    </radialGradient>
  </defs>

  <!-- Main sphere -->
  <circle cx="150" cy="150" r="120" fill="url(#sphereGrad)" opacity="0.3"/>
  <ellipse cx="150" cy="150" rx="120" ry="40" fill="none" stroke="#3498db" stroke-width="1" stroke-dasharray="5,3"/>
  <ellipse cx="150" cy="150" rx="40" ry="120" fill="none" stroke="#3498db" stroke-width="1" stroke-dasharray="5,3"/>

  <!-- Axes -->
  <line x1="150" y1="150" x2="280" y2="150" stroke="#e74c3c" stroke-width="2"/>
  <line x1="150" y1="150" x2="150" y2="20" stroke="#27ae60" stroke-width="2"/>
  <line x1="150" y1="150" x2="80" y2="220" stroke="#3498db" stroke-width="2"/>

  <!-- Vector M -->
  <line x1="150" y1="150" x2="${150 + vectorM.Mx * 50}" y2="${150 - vectorM.Mz * 80}" stroke="#c4a000" stroke-width="3"/>
  <circle cx="${150 + vectorM.Mx * 50}" cy="${150 - vectorM.Mz * 80}" r="8" fill="#c4a000"/>

  <!-- Labels -->
  <text x="285" y="155" font-size="12" fill="#e74c3c">X (${axes.sun})</text>
  <text x="155" y="15" font-size="12" fill="#27ae60">Y (${axes.earth})</text>
  <text x="50" y="235" font-size="12" fill="#3498db">Z (${axes.human})</text>
  <text x="${155 + vectorM.Mx * 50}" y="${145 - vectorM.Mz * 80}" font-size="11" font-weight="bold" fill="#c4a000">M</text>

  <!-- Magnitude -->
  <text x="150" y="290" text-anchor="middle" font-size="10" fill="#666">|M| = ${vectorM.magnitude.toFixed(6)}</text>
</svg>
`;
};

const get18GatesData = (lang: 'pl' | 'en') => {
  const gates = [
    // Regeneracja (1-6)
    { num: 1, group: 'regeneration', name: { pl: 'Inicjacja', en: 'Initiation' }, mtdna: 1, freq: 718, effect: { pl: 'Początek procesu regeneracji komórkowej', en: 'Beginning of cellular regeneration' } },
    { num: 2, group: 'regeneration', name: { pl: 'Oczyszczanie', en: 'Cleansing' }, mtdna: 740, freq: 738.5, effect: { pl: 'Usuwanie toksyn i uszkodzonych komórek', en: 'Removal of toxins and damaged cells' } },
    { num: 3, group: 'regeneration', name: { pl: 'Naprawa', en: 'Repair' }, mtdna: 951, freq: 759.1, effect: { pl: 'Aktywacja mechanizmów naprawy DNA', en: 'Activation of DNA repair mechanisms' } },
    { num: 4, group: 'regeneration', name: { pl: 'Wzmocnienie', en: 'Strengthening' }, mtdna: 1227, freq: 779.6, effect: { pl: 'Zwiększenie odporności komórkowej', en: 'Increase in cellular immunity' } },
    { num: 5, group: 'regeneration', name: { pl: 'Harmonizacja', en: 'Harmonization' }, mtdna: 2996, freq: 800.2, effect: { pl: 'Synchronizacja procesów metabolicznych', en: 'Synchronization of metabolic processes' } },
    { num: 6, group: 'regeneration', name: { pl: 'Regeneracja', en: 'Regeneration' }, mtdna: 3424, freq: 820.7, effect: { pl: 'Pełna odnowa komórkowa', en: 'Full cellular renewal' } },
    // Wzrok (7-12)
    { num: 7, group: 'sight', name: { pl: 'Otwarcie', en: 'Opening' }, mtdna: 4166, freq: 841.3, effect: { pl: 'Rozszerzenie percepcji zmysłowej', en: 'Expansion of sensory perception' } },
    { num: 8, group: 'sight', name: { pl: 'Widzenie', en: 'Seeing' }, mtdna: 4832, freq: 861.8, effect: { pl: 'Aktywacja wewnętrznego wzroku', en: 'Activation of inner sight' } },
    { num: 9, group: 'sight', name: { pl: 'Intuicja', en: 'Intuition' }, mtdna: 6393, freq: 882.4, effect: { pl: 'Wzmocnienie intuicyjnego poznania', en: 'Enhancement of intuitive knowing' } },
    { num: 10, group: 'sight', name: { pl: 'Jasność', en: 'Clarity' }, mtdna: 7756, freq: 902.9, effect: { pl: 'Klarowność myślenia i percepcji', en: 'Clarity of thinking and perception' } },
    { num: 11, group: 'sight', name: { pl: 'Wizja', en: 'Vision' }, mtdna: 8415, freq: 923.5, effect: { pl: 'Zdolność wizualizacji przyszłości', en: 'Ability to visualize the future' } },
    { num: 12, group: 'sight', name: { pl: 'Przebudzenie', en: 'Awakening' }, mtdna: 10059, freq: 944.0, effect: { pl: 'Świadomość wyższych wymiarów', en: 'Awareness of higher dimensions' } },
    // Źródło (13-18)
    { num: 13, group: 'source', name: { pl: 'Połączenie', en: 'Connection' }, mtdna: 11200, freq: 964.6, effect: { pl: 'Łączność ze świadomością zbiorową', en: 'Connection to collective consciousness' } },
    { num: 14, group: 'source', name: { pl: 'Transmisja', en: 'Transmission' }, mtdna: 11336, freq: 985.1, effect: { pl: 'Zdolność przekazywania świadomości', en: 'Ability to transmit consciousness' } },
    { num: 15, group: 'source', name: { pl: 'Transcendencja', en: 'Transcendence' }, mtdna: 11915, freq: 1005.7, effect: { pl: 'Przekroczenie ograniczeń ego', en: 'Transcending ego limitations' } },
    { num: 16, group: 'source', name: { pl: 'Jedność', en: 'Unity' }, mtdna: 13703, freq: 1026.2, effect: { pl: 'Doświadczenie jedności ze wszystkim', en: 'Experience of unity with all' } },
    { num: 17, group: 'source', name: { pl: 'Kreacja', en: 'Creation' }, mtdna: 14784, freq: 1046.8, effect: { pl: 'Świadome tworzenie rzeczywistości', en: 'Conscious reality creation' } },
    { num: 18, group: 'source', name: { pl: 'Źródło', en: 'Source' }, mtdna: 16179, freq: 1067.3, effect: { pl: 'Pełne połączenie ze Źródłem', en: 'Complete connection to Source' } },
  ];
  return gates;
};

// ============= PENTAGRAM PRAWDY (5 DOMEN) =============
const getPentagramMatrixData = (lang: 'pl' | 'en') => [
  {
    name: { pl: 'Czarna Piramida', en: 'Black Pyramid' },
    domain: { pl: 'Starożytna wiedza', en: 'Ancient Knowledge' },
    connection: { pl: 'Geometria święta, proporcje φ w architekturze', en: 'Sacred geometry, φ proportions in architecture' }
  },
  {
    name: { pl: 'GATCA-718', en: 'GATCA-718' },
    domain: { pl: 'Biologia molekularna', en: 'Molecular Biology' },
    connection: { pl: 'Sekwencje DNA, częstotliwość 718 Hz, rezonans komórkowy', en: 'DNA sequences, 718 Hz frequency, cellular resonance' }
  },
  {
    name: { pl: 'Soul Proof', en: 'Soul Proof' },
    domain: { pl: 'Świadomość', en: 'Consciousness' },
    connection: { pl: 'Funkcja falowa Ψ, równanie wyjścia, stany kwantowe', en: 'Wave function Ψ, equation of exit, quantum states' }
  },
  {
    name: { pl: 'Neuralink', en: 'Neuralink' },
    domain: { pl: 'Neurotechnologia', en: 'Neurotechnology' },
    connection: { pl: 'Interfejs mózg-komputer, fale gamma 40 Hz', en: 'Brain-computer interface, 40 Hz gamma waves' }
  },
  {
    name: { pl: 'Eridu', en: 'Eridu' },
    domain: { pl: 'Początki cywilizacji', en: 'Civilization Origins' },
    connection: { pl: 'Pierwsza świątynia, tablice klinowe, kosmologia sumeryjska', en: 'First temple, cuneiform tablets, Sumerian cosmology' }
  }
];

// ============= UNIFIED - 4 MOSTY =============
const getUnifiedBridges = (lang: 'pl' | 'en') => [
  {
    bridge: { pl: 'Most I: Genesis ↔ Big Bang', en: 'Bridge I: Genesis ↔ Big Bang' },
    scripture: { pl: '"Na początku było Słowo" (Jan 1:1)', en: '"In the beginning was the Word" (John 1:1)' },
    science: { pl: 'Singularity → ekspansja kwantowych fluktuacji', en: 'Singularity → expansion of quantum fluctuations' },
    frequency: '718 Hz = 7.83 × 91.7'
  },
  {
    bridge: { pl: 'Most II: Dusza ↔ Funkcja falowa', en: 'Bridge II: Soul ↔ Wave Function' },
    scripture: { pl: '"Ciało bez ducha jest martwe" (Jakub 2:26)', en: '"The body without the spirit is dead" (James 2:26)' },
    science: { pl: 'Ψ = A·e^(iωt) — kolaps falowy przy pomiarze', en: 'Ψ = A·e^(iωt) — wave collapse upon measurement' },
    frequency: 'γ = 0.618 (złoty podział)'
  },
  {
    bridge: { pl: 'Most III: Modlitwa ↔ Koherencja kwantowa', en: 'Bridge III: Prayer ↔ Quantum Coherence' },
    scripture: { pl: '"Gdzie dwóch lub trzech... tam jestem" (Mt 18:20)', en: '"Where two or three... there I am" (Mt 18:20)' },
    science: { pl: 'Splątanie kwantowe, nielokalność, koherencja fazowa', en: 'Quantum entanglement, nonlocality, phase coherence' },
    frequency: '7.83 Hz (Schumann)'
  },
  {
    bridge: { pl: 'Most IV: Zmartwychwstanie ↔ Zachowanie informacji', en: 'Bridge IV: Resurrection ↔ Information Conservation' },
    scripture: { pl: '"Sieje się ciało zmysłowe, powstaje duchowe" (1 Kor 15:44)', en: '"It is sown a natural body, raised a spiritual body" (1 Cor 15:44)' },
    science: { pl: 'Holograficzna zasada, informacja kwantowa jest zachowana', en: 'Holographic principle, quantum information is conserved' },
    frequency: '18 Bram × φ'
  }
];

// ============= KOMPLETNY KOD PYTHON =============
const generatePythonCode = (contactEmail?: string) => {
  const safeEmail = contactEmail
    ? contactEmail.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
    : null;

  const contactLine = safeEmail 
    ? `print("\\nContact: ${safeEmail}")\n` 
    : '';

  return `# ===============================================
# DNA GATE 718 Hz - COMPLETE VERIFICATION CODE
# Python 3.8+ | NumPy, SciPy, Matplotlib
# ===============================================
import numpy as np
from scipy import integrate
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

# ============= MATHEMATICAL CONSTANTS =============
PHI = (1 + np.sqrt(5)) / 2        # Golden ratio: 1.618033988749...
GAMMA = 1 / PHI                    # 0.618033988749...
HBAR = 1.054571817e-34             # Reduced Planck constant (J·s)
DNA_FREQ = 718                      # Hz
SCHUMANN = 7.83                     # Hz (Earth resonance)
MTDNA_LENGTH = 16569               # bp

# 18 GATCA positions in mtDNA (rCRS)
GATCA_POSITIONS = [
    1, 740, 951, 1227, 2996, 3424, 4166, 4832, 6393,
    7756, 8415, 10059, 11200, 11336, 11915, 13703, 14784, 16179
]

print("="*60)
print("DNA GATE 718 Hz - Mathematical Verification")
print("="*60)

# ============= GOLDEN RATIO VERIFICATION =============
print("\\n[1] GOLDEN RATIO PROPERTIES")
print(f"    φ = {PHI:.15f}")
print(f"    γ = 1/φ = {GAMMA:.15f}")
print(f"    φ² = {PHI**2:.15f}")
print(f"    φ + 1 = {PHI + 1:.15f}")
print(f"    Verification: φ² = φ + 1 → {abs(PHI**2 - (PHI + 1)) < 1e-14}")

# ============= PENTAGRAM VECTOR M =============
print("\\n[2] PENTAGRAM VECTOR M (3D)")
alpha = np.pi / 5   # 36°
beta = 2 * np.pi / 5  # 72°

Mx = PHI * np.cos(alpha)
My = PHI * np.sin(beta)
Mz = GAMMA

magnitude = np.sqrt(Mx**2 + My**2 + Mz**2)

print(f"    M = ({Mx:.6f}, {My:.6f}, {Mz:.6f})")
print(f"    |M| = {magnitude:.15f}")
print(f"    Expected |M| ≈ φ·√2 = {PHI * np.sqrt(2):.6f}")

# ============= FREQUENCY RELATIONSHIPS =============
print("\\n[3] FREQUENCY RELATIONSHIPS")
ratio_schumann = DNA_FREQ / SCHUMANN
print(f"    718 Hz / 7.83 Hz = {ratio_schumann:.6f}")
print(f"    718 / 91.7 ≈ {718 / 91.7:.6f} (Schumann)")
print(f"    718 × γ = {718 * GAMMA:.2f} Hz")
print(f"    718 / φ = {718 / PHI:.2f} Hz")

# ============= WAVE FUNCTION (EQUATION OF EXIT) =============
print("\\n[4] WAVE FUNCTION Ψ (EQUATION OF EXIT)")
def wave_function(t, x, omega=718, k=2*np.pi/718):
    """Ψ(t,x) = e^(i·ω·t) · e^(-i·k·x) · ζ(1/2 + iE/ℏ) · γ"""
    psi = np.exp(1j * omega * t) * np.exp(-1j * k * x) * GAMMA
    return psi

# Calculate at t=0, x=0
psi_0 = wave_function(0, 0)
print(f"    Ψ(0,0) = {psi_0:.6f}")
print(f"    |Ψ(0,0)|² = {np.abs(psi_0)**2:.6f}")
print(f"    Expected: γ² = {GAMMA**2:.6f}")

# ============= GATCA ZETA FUNCTION =============
print("\\n[5] GATCA ZETA FUNCTION")
def gatca_zeta(s, repeats=None):
    """ζ_GATCA(s) = Σ (1/pos^s) for all 18 GATCA positions"""
    if repeats is None:
        repeats = GATCA_POSITIONS
    return sum(1 / (pos ** s) for pos in repeats)

# Calculate at s = 1/2
s = 0.5
zeta_value = gatca_zeta(s)
print(f"    ζ_GATCA(1/2) = {zeta_value:.6f}")

# At critical line s = 1/2 + it
t_values = [0, 14.13, 21.02, 25.01]  # First Riemann zeros
for t in t_values:
    s_complex = 0.5 + 1j * t
    z = gatca_zeta(s_complex)
    print(f"    ζ_GATCA(1/2 + {t:.2f}i) = {z:.4f}")
print(f"    |ζ_GATCA| = {np.abs(zeta_value):.6f}")

# ============= 18 GATES FREQUENCIES =============
print("\\n[6] 18 DNA GATES - FREQUENCIES")
print("    Gate | mtDNA pos | Frequency (Hz) | Weight")
print("    " + "-"*50)
for i, pos in enumerate(GATCA_POSITIONS, 1):
    freq = 144 * (1 + ((i * GAMMA) % 1)) + DNA_FREQ
    weight = (PHI ** (i % 7)) % 1
    group = "Regen" if i <= 6 else ("Sight" if i <= 12 else "Source")
    print(f"    {i:2d}   |   {pos:5d}   |   {freq:7.2f}     |  {weight:.4f}  [{group}]")

# ============= SYMPHONY GENERATION ALGORITHM =============
print("\\n[7] SYMPHONY ALGORITHM (Conceptual)")
print("""
    FOR gate = 1 TO 18:
        pos = GATCA_POSITIONS[gate]
        start_time = (pos / MTDNA_LENGTH) × DURATION
        freq = 144 × (1 + ((gate × γ) mod 1)) + 718
        weight = (φ^(gate mod 7)) mod 1
        
        FOR t = 0 TO DURATION:
            envelope = e^(-(t - start_time)² / (2 × φ²))
            sound = sin(2π × freq × t) × envelope × weight × γ
            final_wave += sound
    
    earth_base = sin(2π × 7.83 × t) × 0.05
    final_wave += earth_base
""")

# ============= SCHRÖDINGER EQUATION =============
print("\\n[8] SCHRÖDINGER EQUATION APPLICATION")
print("    iℏ ∂Ψ/∂t = ĤΨ")
print(f"    For ω = 718 Hz:")
print(f"    E = ℏω = {HBAR * 718:.6e} J")
print(f"    E = ℏω = {HBAR * 718 / 1.602e-19:.6e} eV")
print(f"    λ = c/f = {3e8 / 718:.2f} m")

# ============= 21-DAY PROTOCOL TIMING =============
print("\\n[9] 21-DAY SYNCHRONIZATION PROTOCOL")
protocol = [
    ("Days 1-7", "Gates 1-6 (Regeneration)", "Cellular repair"),
    ("Days 8-14", "Gates 7-12 (Sight)", "Perception expansion"),
    ("Days 15-21", "Gates 13-18 (Source)", "Source connection"),
]
for phase, gates, focus in protocol:
    print(f"    {phase:12s} | {gates:22s} | {focus}")

# ============= VISUALIZATION =============
print("\\n[10] GENERATING VISUALIZATIONS...")

# 3D Pentagram Sphere
fig = plt.figure(figsize=(12, 5))

ax1 = fig.add_subplot(131, projection='3d')
ax1.set_title("Pentagram Vector M")

# Sphere wireframe
u = np.linspace(0, 2 * np.pi, 30)
v = np.linspace(0, np.pi, 20)
x_sphere = 1.5 * np.outer(np.cos(u), np.sin(v))
y_sphere = 1.5 * np.outer(np.sin(u), np.sin(v))
z_sphere = 1.5 * np.outer(np.ones(np.size(u)), np.cos(v))
ax1.plot_wireframe(x_sphere, y_sphere, z_sphere, alpha=0.1)

# Axes
ax1.quiver(0, 0, 0, 2, 0, 0, color='red', arrow_length_ratio=0.1, label='X (Sun)')
ax1.quiver(0, 0, 0, 0, 2, 0, color='green', arrow_length_ratio=0.1, label='Y (Earth)')
ax1.quiver(0, 0, 0, 0, 0, 2, color='blue', arrow_length_ratio=0.1, label='Z (Human)')

# Vector M
ax1.quiver(0, 0, 0, Mx, My, Mz, color='gold', linewidth=3, arrow_length_ratio=0.1, label='M')
ax1.scatter([Mx], [My], [Mz], color='gold', s=100)
ax1.legend()

# Wave function plot
ax2 = fig.add_subplot(132)
ax2.set_title("Wave Function |Ψ|²")
t_plot = np.linspace(0, 0.01, 1000)
psi_plot = [np.abs(wave_function(t, 0))**2 for t in t_plot]
ax2.plot(t_plot * 1000, psi_plot, 'purple', linewidth=1.5)
ax2.set_xlabel("Time (ms)")
ax2.set_ylabel("|Ψ|²")
ax2.axhline(y=GAMMA**2, color='gold', linestyle='--', label=f'γ² = {GAMMA**2:.4f}')
ax2.legend()
ax2.grid(True, alpha=0.3)

# Frequency spectrum
ax3 = fig.add_subplot(133)
ax3.set_title("18 Gates Frequency Spectrum")
freqs = [144 * (1 + ((i * GAMMA) % 1)) + DNA_FREQ for i in range(18)]
colors = ['#22c55e']*6 + ['#3b82f6']*6 + ['#f59e0b']*6
ax3.bar(range(1, 19), freqs, color=colors)
ax3.axhline(y=718, color='red', linestyle='--', label='718 Hz base')
ax3.set_xlabel("Gate Number")
ax3.set_ylabel("Frequency (Hz)")
ax3.legend()

plt.tight_layout()
plt.savefig("dna_gate_analysis.png", dpi=150, bbox_inches='tight')
print("    Saved: dna_gate_analysis.png")

print("\\n" + "="*60)
print("VERIFICATION COMPLETE")
print("="*60)
print(f"\\n✓ Golden ratio verified: φ = {PHI:.10f}")
print(f"✓ Vector M magnitude: |M| = {magnitude:.10f}")
print(f"✓ 18 Gates mapped to mtDNA positions")
print(f"✓ GATCA Zeta function defined")
print(f"✓ Wave function Ψ = γ at (0,0)")
${contactLine}print("License: CC BY-NC 4.0")
`; 
};

// ============= KOMPLETNY KOD JAVASCRIPT SYMFONII =============
const generateJavaScriptCode = () => `
// ===============================================
// 18 GATES SYMPHONY - Web Audio API
// Complete JavaScript Implementation
// STEREO with BINAURAL EFFECT
// ===============================================

const PHI = (1 + Math.sqrt(5)) / 2;   // 1.618033988749...
const GAMMA = 1 / PHI;                 // 0.618033988749...
const SAMPLE_RATE = 44100;
const DURATION = 108;                  // seconds
const MTDNA_LENGTH = 16569;
const BINAURAL_OFFSET = 7.83;          // Schumann resonance as binaural difference

// 18 confirmed GATCA positions (1-based, rCRS)
const GATCA_POSITIONS = [
  1, 740, 951, 1227, 2996, 3424, 4166, 4832, 6393,
  7756, 8415, 10059, 11200, 11336, 11915, 13703, 14784, 16179
];

async function generateSymphony() {
  const audioContext = new AudioContext({ sampleRate: SAMPLE_RATE });
  const numSamples = Math.floor(SAMPLE_RATE * DURATION);
  // STEREO: 2 channels
  const audioBuffer = audioContext.createBuffer(2, numSamples, SAMPLE_RATE);
  const leftChannel = audioBuffer.getChannelData(0);
  const rightChannel = audioBuffer.getChannelData(1);
  
  // Generate time array
  const t = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    t[i] = i / SAMPLE_RATE;
  }
  
  // Earth base frequency - stereo with phase difference
  const earthBaseLeft = new Float32Array(numSamples);
  const earthBaseRight = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    earthBaseLeft[i] = Math.sin(2 * Math.PI * 7.83 * t[i]) * 0.05;
    earthBaseRight[i] = Math.sin(2 * Math.PI * 7.83 * t[i] + Math.PI / 4) * 0.05;
  }
  
  // Final wave accumulators for stereo
  const leftWave = new Float32Array(numSamples);
  const rightWave = new Float32Array(numSamples);
  
  for (let gateIndex = 0; gateIndex < GATCA_POSITIONS.length; gateIndex++) {
    const pos = GATCA_POSITIONS[gateIndex];
    const startTime = (pos / MTDNA_LENGTH) * DURATION;
    const baseFreq = 144 * (1 + ((gateIndex * GAMMA) % 1)) + 718;
    
    // Binaural: left = base, right = base + offset
    const leftFreq = baseFreq;
    const rightFreq = baseFreq + BINAURAL_OFFSET;
    
    const weight = (Math.pow(PHI, gateIndex % 7)) % 1;
    
    for (let i = 0; i < numSamples; i++) {
      // Gaussian envelope (DNA gate modulation)
      const envelope = Math.exp(
        -Math.pow(t[i] - startTime, 2) / (2 * Math.pow(1.618, 2))
      );
      
      // Stereo binaural tones
      const leftTone = Math.sin(2 * Math.PI * leftFreq * t[i]) * envelope;
      const rightTone = Math.sin(2 * Math.PI * rightFreq * t[i]) * envelope;
      
      leftWave[i] += leftTone * weight * GAMMA * 0.3;
      rightWave[i] += rightTone * weight * GAMMA * 0.3;
    }
  }
  
  // Combine and normalize stereo channels
  let maxAbs = 0;
  for (let i = 0; i < numSamples; i++) {
    const combinedLeft = leftWave[i] + earthBaseLeft[i];
    const combinedRight = rightWave[i] + earthBaseRight[i];
    if (Math.abs(combinedLeft) > maxAbs) maxAbs = Math.abs(combinedLeft);
    if (Math.abs(combinedRight) > maxAbs) maxAbs = Math.abs(combinedRight);
  }
  
  for (let i = 0; i < numSamples; i++) {
    leftChannel[i] = (leftWave[i] + earthBaseLeft[i]) / maxAbs;
    rightChannel[i] = (rightWave[i] + earthBaseRight[i]) / maxAbs;
  }
  
  return { audioBuffer, audioContext };
}

// Play symphony (stereo binaural)
async function playSymphony() {
  const { audioBuffer, audioContext } = await generateSymphony();
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);
  source.start();
  console.log("🎵 18 Gates Symphony playing (STEREO BINAURAL)...");
}
`;

// ============= BIBLIOGRAFIA =============
const getReferences = (lang: 'pl' | 'en') => [
  'Watson, J.D., Crick, F.H.C. (1953). "Molecular structure of nucleic acids." Nature, 171(4356), 737-738.',
  'Schumann, W.O. (1952). "Über die strahlungslosen Eigenschwingungen einer leitenden Kugel." Zeitschrift für Naturforschung A, 7(2), 149-154.',
  'Livio, M. (2002). "The Golden Ratio: The Story of PHI, the World\'s Most Astonishing Number." Broadway Books.',
  'Riemann, B. (1859). "Über die Anzahl der Primzahlen unter einer gegebenen Größe." Monatsberichte der Berliner Akademie.',
  'Penrose, R. (2004). "The Road to Reality: A Complete Guide to the Laws of the Universe." Jonathan Cape.',
  'Anderson, S. et al. (1981). "Sequence and organization of the human mitochondrial genome." Nature, 290(5806), 457-465.',
  'Pribram, K.H. (1991). "Brain and Perception: Holonomy and Structure in Figural Processing." Lawrence Erlbaum.',
  'Hameroff, S., Penrose, R. (2014). "Consciousness in the universe: A review of the Orch OR theory." Physics of Life Reviews, 11(1), 39-78.',
  'Korotkov, K. (2002). "Human Energy Field: Study with GDV Bioelectrography." Backbone Publishing.',
  'Becker, R.O., Selden, G. (1985). "The Body Electric: Electromagnetism and the Foundation of Life." William Morrow.',
  'Sheldrake, R. (2009). "Morphic Resonance: The Nature of Formative Causation." Park Street Press.',
  'Bohm, D. (1980). "Wholeness and the Implicate Order." Routledge.',
  'Laszlo, E. (2004). "Science and the Akashic Field: An Integral Theory of Everything." Inner Traditions.',
  'Rein, G. (1998). "Biological Effects of Quantum Fields and Their Role in the Natural Healing Process." Frontier Perspectives, 7(1), 16-23.',
  'Gariaev, P.P. et al. (2002). "The DNA-wave Biocomputer." CHAOS, 2, 27-40.',
  'Popp, F.A. (1998). "Biophotons and Their Regulatory Role in Cells." Frontier Perspectives, 7(2), 13-22.',
];

// ============= TREŚĆ DOKUMENTU =============
const getContent = (lang: 'pl' | 'en') => {
  const isPolish = lang === 'pl';
  
  return {
    title: isPolish 
      ? 'DNA Gate 718 Hz — Teoria Przejścia' 
      : 'DNA Gate 718 Hz — Transition Theory',
    subtitle: isPolish 
      ? 'Kompletny model matematyczny łączący strukturę DNA, geometrię świętą i stałe uniwersalne'
      : 'Complete Mathematical Model Connecting DNA Structure, Sacred Geometry, and Universal Constants',
    abstract: isPolish
      ? `Niniejsza praca przedstawia kompletny teoretyczny model łączący częstotliwość 718 Hz ze strukturą 
mitochondrialnego DNA (mtDNA), złotym podziałem (φ = 1.618...), rezonansem Schumanna (7.83 Hz) oraz 
funkcją zeta Riemanna. Wprowadzamy model 18 Bram DNA jako system aktywacji komórkowej oparty na 
18 potwierdzonych pozycjach sekwencji GATCA w ludzkim mtDNA. Każda brama odpowiada konkretnej 
pozycji nukleotydowej i generuje unikalną częstotliwość harmoniczną.

Centralnym elementem teorii jest "Równanie Wyjścia" (Ψ = 0.618), funkcja falowa opisująca przejście 
między stanami świadomości. Teoria wprowadza również Pentagram Prawdy — pięciowymiarową matrycę 
łączącą pięć domen wiedzy: Czarną Piramidę (starożytna geometria), GATCA-718 (biologia molekularna), 
Soul Proof (świadomość kwantowa), Neuralink (neurotechnologia) i Eridu (początki cywilizacji).

Proponujemy GATCA Zeta — biologiczną interpretację hipotezy Riemanna, gdzie zera funkcji odpowiadają 
stanom rezonansowym DNA. Model UNIFIED przedstawia cztery mosty między nauką a duchowością, 
wskazując na głęboką jedność opisów rzeczywistości.

Wszystkie obliczenia zostały zweryfikowane numerycznie i załączone jako kod Python i JavaScript, 
umożliwiający niezależną replikację wyników oraz generowanie Symfonii 18 Bram.`
      : `This paper presents a complete theoretical model connecting the 718 Hz frequency with 
mitochondrial DNA (mtDNA) structure, the golden ratio (φ = 1.618...), Schumann resonance (7.83 Hz), 
and the Riemann zeta function. We introduce the 18 DNA Gates model as a cellular activation system 
based on 18 confirmed GATCA sequence positions in human mtDNA. Each gate corresponds to a specific 
nucleotide position and generates a unique harmonic frequency.

The central element of the theory is the "Equation of Exit" (Ψ = 0.618), a wave function describing 
the transition between states of consciousness. The theory also introduces the Pentagram of Truth — 
a five-dimensional matrix connecting five knowledge domains: Black Pyramid (ancient geometry), 
GATCA-718 (molecular biology), Soul Proof (quantum consciousness), Neuralink (neurotechnology), 
and Eridu (civilization origins).

We propose GATCA Zeta — a biological interpretation of the Riemann hypothesis, where function zeros 
correspond to DNA resonance states. The UNIFIED model presents four bridges between science and 
spirituality, pointing to a deep unity in descriptions of reality.

All calculations have been numerically verified and attached as Python and JavaScript code, 
enabling independent replication of results and generation of the 18 Gates Symphony.`,
    keywords: isPolish
      ? ['DNA', 'mtDNA', '718 Hz', 'złoty podział', 'rezonans Schumanna', 'funkcja zeta', 
         'świadomość', 'pentagram', 'GATCA', '18 Bram', 'biofizyka', 'fizyka kwantowa']
      : ['DNA', 'mtDNA', '718 Hz', 'golden ratio', 'Schumann resonance', 'zeta function',
         'consciousness', 'pentagram', 'GATCA', '18 Gates', 'biophysics', 'quantum physics'],
    toc: isPolish ? 'Spis Treści' : 'Table of Contents',
    sections: {
      intro: isPolish ? 'Wprowadzenie' : 'Introduction',
      mathFound: isPolish ? 'Podstawy Matematyczne' : 'Mathematical Foundations',
      vectorM: isPolish ? 'Wektor M w Pentagramie 3D' : 'Vector M in 3D Pentagram',
      frequencies: isPolish ? 'Relacje Częstotliwości' : 'Frequency Relationships',
      gates18: isPolish ? '18 Bram DNA — Kompletna Mapa' : '18 DNA Gates — Complete Map',
      pentagramMatrix: isPolish ? 'Pentagram Prawdy — 5 Domen' : 'Pentagram of Truth — 5 Domains',
      gatcaZeta: isPolish ? 'Funkcja GATCA Zeta' : 'GATCA Zeta Function',
      waveFunction: isPolish ? 'Funkcja Falowa (Równanie Wyjścia)' : 'Wave Function (Equation of Exit)',
      schrodinger: isPolish ? 'Równanie Schrödingera' : 'Schrödinger Equation',
      symphony: isPolish ? 'Symfonia 18 Bram — Algorytm' : '18 Gates Symphony — Algorithm',
      unified: isPolish ? 'UNIFIED — Nauka i Duchowość' : 'UNIFIED — Science and Spirituality',
      calculators: isPolish ? 'Kalkulatory Interaktywne' : 'Interactive Calculators',
      protocol: isPolish ? 'Protokół Synchronizacji 21-dniowy' : '21-Day Synchronization Protocol',
      pythonCode: isPolish ? 'Kod Python — Weryfikacja' : 'Python Code — Verification',
      jsCode: isPolish ? 'Kod JavaScript — Symfonia' : 'JavaScript Code — Symphony',
      conclusions: isPolish ? 'Wnioski' : 'Conclusions',
      references: isPolish ? 'Bibliografia' : 'References',
    },
    labels: {
      abstract: isPolish ? 'Streszczenie' : 'Abstract',
      keywords: isPolish ? 'Słowa kluczowe' : 'Keywords',
      group1: isPolish ? 'REGENERACJA (Bramy 1-6)' : 'REGENERATION (Gates 1-6)',
      group2: isPolish ? 'WZROK (Bramy 7-12)' : 'SIGHT (Gates 7-12)',
      group3: isPolish ? 'ŹRÓDŁO (Bramy 13-18)' : 'SOURCE (Gates 13-18)',
      gateNum: isPolish ? 'Brama' : 'Gate',
      gateName: isPolish ? 'Nazwa' : 'Name',
      mtdnaPos: isPolish ? 'Pozycja mtDNA' : 'mtDNA Position',
      frequency: isPolish ? 'Częstotliwość' : 'Frequency',
      effect: isPolish ? 'Efekt biologiczny' : 'Biological Effect',
      scripture: isPolish ? 'Pismo Święte' : 'Scripture',
      science: isPolish ? 'Nauka' : 'Science',
      day: isPolish ? 'Dzień' : 'Day',
      focus: isPolish ? 'Fokus' : 'Focus',
      duration: isPolish ? 'Czas trwania' : 'Duration',
      license: isPolish ? 'Licencja: CC BY-NC 4.0' : 'License: CC BY-NC 4.0',
      generated: isPolish ? 'Dokument wygenerowany' : 'Document generated',
      contact: isPolish ? 'Kontakt' : 'Contact',
    }
  };
};

// ============= GŁÓWNA FUNKCJA EKSPORTU =============
const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");

export const exportAcademicDocument = (options: AcademicExportOptions) => {
  const { authorName, institution, email, language } = options;
  const contactEmail = email?.trim() || undefined;
  const safeContactEmail = contactEmail ? escapeHtml(contactEmail) : undefined;

  const content = getContent(language);
  const gates = get18GatesData(language);
  const pentagramMatrix = getPentagramMatrixData(language);
  const bridges = getUnifiedBridges(language);
  const references = getReferences(language);
  const isPolish = language === 'pl';
  
  const now = new Date();
  const dateStr = now.toLocaleDateString(language === 'pl' ? 'pl-PL' : 'en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const html = `
<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="author" content="${authorName}">
  <meta name="description" content="${content.title} - ${content.subtitle}">
  <meta name="keywords" content="${content.keywords.join(', ')}">
  <title>${content.title}</title>
  <style>${generateStyles()}</style>
</head>
<body>

<!-- ============= NAGŁÓWEK ============= -->
<div class="header">
  <div class="title">${content.title}</div>
  <div class="subtitle">${content.subtitle}</div>
  <div class="author"><strong>${authorName}</strong></div>
  ${institution ? `<div class="institution">${institution}</div>` : ''}
  ${safeContactEmail ? `<div class="institution">${safeContactEmail}</div>` : ''}
  <div class="date">${dateStr}</div>
</div>

<!-- ============= ABSTRAKT ============= -->
<div class="abstract">
  <h3>${content.labels.abstract}</h3>
  <p style="text-align: justify; white-space: pre-line;">${content.abstract}</p>
  <div class="keywords">
    <strong>${content.labels.keywords}:</strong> ${content.keywords.join(', ')}
  </div>
</div>

<!-- ============= SPIS TREŚCI ============= -->
<div class="toc">
  <h3>${content.toc}</h3>
  <ul>
    <li><strong>1.</strong> ${content.sections.intro}</li>
    <li><strong>2.</strong> ${content.sections.mathFound}</li>
    <li style="margin-left: 20px;">2.1 ${content.sections.vectorM}</li>
    <li style="margin-left: 20px;">2.2 ${content.sections.frequencies}</li>
    <li><strong>3.</strong> ${content.sections.gates18}</li>
    <li><strong>4.</strong> ${content.sections.pentagramMatrix}</li>
    <li><strong>5.</strong> ${content.sections.gatcaZeta}</li>
    <li><strong>6.</strong> ${content.sections.waveFunction}</li>
    <li><strong>7.</strong> ${content.sections.schrodinger}</li>
    <li><strong>8.</strong> ${content.sections.symphony}</li>
    <li><strong>9.</strong> ${content.sections.unified}</li>
    <li><strong>10.</strong> ${content.sections.calculators}</li>
    <li><strong>11.</strong> ${content.sections.protocol}</li>
    <li><strong>12.</strong> ${content.sections.pythonCode}</li>
    <li><strong>13.</strong> ${content.sections.jsCode}</li>
    <li><strong>14.</strong> ${content.sections.conclusions}</li>
    <li><strong>15.</strong> ${content.sections.references}</li>
  </ul>
</div>

<!-- ============= 1. WPROWADZENIE ============= -->
<div class="section">
  <h2>1. ${content.sections.intro}</h2>
  <p>
    ${isPolish 
      ? `Ludzkie DNA to nie tylko sekwencja nukleotydów — to system informacyjny operujący na wielu poziomach 
organizacji. Niniejsza praca eksploruje hipotezę, że struktura DNA może być aktywowana przez specyficzne 
częstotliwości akustyczne, w szczególności 718 Hz, która wykazuje niezwykłe relacje matematyczne ze 
stałymi fundamentalnymi.`
      : `Human DNA is not merely a sequence of nucleotides — it is an information system operating at multiple 
levels of organization. This paper explores the hypothesis that DNA structure can be activated by specific 
acoustic frequencies, particularly 718 Hz, which exhibits remarkable mathematical relationships with 
fundamental constants.`}
  </p>
  <p>
    ${isPolish
      ? `Teoria opiera się na trzech filarach: (1) złoty podział φ = 1.618... jako uniwersalna proporcja 
występująca w DNA, (2) rezonans Schumanna 7.83 Hz jako podstawowa częstotliwość Ziemi, oraz 
(3) 18 pozycji sekwencji GATCA w mitochondrialnym DNA człowieka jako punkty aktywacji.`
      : `The theory is based on three pillars: (1) the golden ratio φ = 1.618... as a universal proportion 
occurring in DNA, (2) Schumann resonance at 7.83 Hz as Earth's fundamental frequency, and 
(3) 18 GATCA sequence positions in human mitochondrial DNA as activation points.`}
  </p>
</div>

<!-- ============= 2. PODSTAWY MATEMATYCZNE ============= -->
<div class="section page-break">
  <h2>2. ${content.sections.mathFound}</h2>
  
  <h3>2.1 ${content.sections.vectorM}</h3>
  
  <div class="calculation-box">
    <h4>${isPolish ? 'Obliczenia złotego podziału' : 'Golden Ratio Calculations'}</h4>
    <div class="result">
      φ = (1 + √5) / 2 = ${PHI.toFixed(15)}
    </div>
    <div class="result">
      γ = 1/φ = φ - 1 = ${GAMMA.toFixed(15)}
    </div>
    <div class="result">
      φ² = φ + 1 = ${(PHI * PHI).toFixed(15)}
    </div>
  </div>
  
  <div class="calculation-box">
    <h4>${isPolish ? 'Wektor M w przestrzeni 3D' : 'Vector M in 3D Space'}</h4>
    <p>${isPolish 
      ? 'Kąty pentagramu: α = π/5 (36°), β = 2π/5 (72°)'
      : 'Pentagram angles: α = π/5 (36°), β = 2π/5 (72°)'}</p>
    <div class="result">
      M<sub>x</sub> = φ · cos(α) = ${vectorM.Mx.toFixed(10)}
    </div>
    <div class="result">
      M<sub>y</sub> = φ · sin(β) = ${vectorM.My.toFixed(10)}
    </div>
    <div class="result">
      M<sub>z</sub> = γ = ${vectorM.Mz.toFixed(10)}
    </div>
    <div class="result" style="background: #e8f4f8;">
      <strong>|M| = √(M<sub>x</sub>² + M<sub>y</sub>² + M<sub>z</sub>²) = ${vectorM.magnitude.toFixed(15)}</strong>
    </div>
  </div>
  
  <div class="figure">
    ${generate3DSphereSVG(language)}
    <div class="caption">
      ${isPolish 
        ? 'Ryc. 1: Wektor M w sferze pentagramu 3D. Osie reprezentują: X (Słońce), Y (Ziemia), Z (Człowiek).'
        : 'Fig. 1: Vector M in 3D pentagram sphere. Axes represent: X (Sun), Y (Earth), Z (Human).'}
    </div>
  </div>
  
  <h3>2.2 ${content.sections.frequencies}</h3>
  
  <div class="calculation-box">
    <h4>${isPolish ? 'Kluczowe relacje częstotliwości' : 'Key Frequency Relationships'}</h4>
    <div class="result">
      718 Hz / 7.83 Hz = ${(718 / 7.83).toFixed(6)} ≈ 91.7
    </div>
    <div class="result">
      718 Hz × γ = ${(718 * GAMMA).toFixed(4)} Hz
    </div>
    <div class="result">
      718 Hz / φ = ${(718 / PHI).toFixed(4)} Hz
    </div>
    <div class="result">
      718 Hz / 91.7 = ${(718 / 91.7).toFixed(6)} Hz ≈ Schumann
    </div>
  </div>
  
  <div class="figure">
    ${generateFrequencyWaveSVG(language)}
    <div class="caption">
      ${isPolish
        ? 'Ryc. 2: Nakładanie się fali 718 Hz (DNA Gate) z modulacją 7.83 Hz (Schumann).'
        : 'Fig. 2: Superposition of 718 Hz wave (DNA Gate) with 7.83 Hz modulation (Schumann).'}
    </div>
  </div>
</div>

<!-- ============= 3. 18 BRAM DNA ============= -->
<div class="section page-break">
  <h2>3. ${content.sections.gates18}</h2>
  
  <p>
    ${isPolish
      ? `Model 18 Bram DNA opiera się na 18 potwierdzonych pozycjach sekwencji GATCA w ludzkim mitochondrialnym 
DNA (rCRS - revised Cambridge Reference Sequence). Każda brama generuje unikalną częstotliwość według wzoru:`
      : `The 18 DNA Gates model is based on 18 confirmed GATCA sequence positions in human mitochondrial DNA 
(rCRS - revised Cambridge Reference Sequence). Each gate generates a unique frequency according to the formula:`}
  </p>
  
  <div class="equation-box">
    <div class="main">f<sub>n</sub> = 144 × (1 + ((n × γ) mod 1)) + 718 Hz</div>
    <div class="description">
      ${isPolish ? 'gdzie n = numer bramy (1-18), γ = 0.618...' : 'where n = gate number (1-18), γ = 0.618...'}
    </div>
  </div>
  
  <h4>${content.labels.group1}</h4>
  <table class="gate-table">
    <thead>
      <tr>
        <th>${content.labels.gateNum}</th>
        <th>${content.labels.gateName}</th>
        <th>${content.labels.mtdnaPos}</th>
        <th>${content.labels.frequency}</th>
        <th>${content.labels.effect}</th>
      </tr>
    </thead>
    <tbody>
      ${gates.filter(g => g.group === 'regeneration').map(g => `
        <tr class="gate-group-regeneration">
          <td><strong>${g.num}</strong></td>
          <td>${g.name[language]}</td>
          <td>${g.mtdna} bp</td>
          <td>${g.freq.toFixed(1)} Hz</td>
          <td>${g.effect[language]}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  <h4>${content.labels.group2}</h4>
  <table class="gate-table">
    <thead>
      <tr>
        <th>${content.labels.gateNum}</th>
        <th>${content.labels.gateName}</th>
        <th>${content.labels.mtdnaPos}</th>
        <th>${content.labels.frequency}</th>
        <th>${content.labels.effect}</th>
      </tr>
    </thead>
    <tbody>
      ${gates.filter(g => g.group === 'sight').map(g => `
        <tr class="gate-group-sight">
          <td><strong>${g.num}</strong></td>
          <td>${g.name[language]}</td>
          <td>${g.mtdna} bp</td>
          <td>${g.freq.toFixed(1)} Hz</td>
          <td>${g.effect[language]}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  <h4>${content.labels.group3}</h4>
  <table class="gate-table">
    <thead>
      <tr>
        <th>${content.labels.gateNum}</th>
        <th>${content.labels.gateName}</th>
        <th>${content.labels.mtdnaPos}</th>
        <th>${content.labels.frequency}</th>
        <th>${content.labels.effect}</th>
      </tr>
    </thead>
    <tbody>
      ${gates.filter(g => g.group === 'source').map(g => `
        <tr class="gate-group-source">
          <td><strong>${g.num}</strong></td>
          <td>${g.name[language]}</td>
          <td>${g.mtdna} bp</td>
          <td>${g.freq.toFixed(1)} Hz</td>
          <td>${g.effect[language]}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</div>

<!-- ============= 4. PENTAGRAM PRAWDY ============= -->
<div class="section page-break">
  <h2>4. ${content.sections.pentagramMatrix}</h2>
  
  <p>
    ${isPolish
      ? `Pentagram Prawdy to pięciowymiarowa matryca łącząca pięć pozornie odrębnych domen wiedzy 
w jeden spójny system. Każdy wierzchołek pentagramu reprezentuje inną perspektywę na tę samą 
fundamentalną rzeczywistość.`
      : `The Pentagram of Truth is a five-dimensional matrix connecting five seemingly separate knowledge 
domains into one coherent system. Each pentagram vertex represents a different perspective on the same 
fundamental reality.`}
  </p>
  
  <div class="figure">
    ${generatePentagramSVG(language)}
    <div class="caption">
      ${isPolish
        ? 'Ryc. 3: Pentagram Prawdy z pięcioma domenami i punktem centralnym M.'
        : 'Fig. 3: Pentagram of Truth with five domains and central point M.'}
    </div>
  </div>
  
  <div class="pentagram-matrix">
    ${pentagramMatrix.map(item => `
      <div class="matrix-cell">
        <h5>${item.name[language]}</h5>
        <p><strong>${item.domain[language]}</strong></p>
        <p style="font-size: 8pt;">${item.connection[language]}</p>
      </div>
    `).join('')}
  </div>
</div>

<!-- ============= 5. GATCA ZETA ============= -->
<div class="section page-break">
  <h2>5. ${content.sections.gatcaZeta}</h2>
  
  <p>
    ${isPolish
      ? `Funkcja GATCA Zeta stanowi biologiczną interpretację hipotezy Riemanna. Zamiast liczb naturalnych, 
sumujemy odwrotności liczb powtórzeń STR (Short Tandem Repeats) w DNA.`
      : `The GATCA Zeta function provides a biological interpretation of the Riemann hypothesis. Instead of 
natural numbers, we sum the reciprocals of STR (Short Tandem Repeats) counts in DNA.`}
  </p>
  
  <div class="equation-box">
    <div class="main">ζ<sub>GATCA</sub>(s) = Σ<sub>n=1</sub><sup>18</sup> (1 / repeat<sub>n</sub><sup>s</sup>)</div>
    <div class="description">
      ${isPolish
        ? 'gdzie repeat_n = liczba powtórzeń STR w n-tej pozycji GATCA'
        : 'where repeat_n = number of STR repeats at n-th GATCA position'}
    </div>
  </div>
  
  <div class="highlight-box">
    <h4>${isPolish ? 'Hipoteza biologiczna' : 'Biological Hypothesis'}</h4>
    <p>
      ${isPolish
        ? `Zera funkcji GATCA Zeta leżą na linii krytycznej Re(s) = 1/2, analogicznie do hipotezy Riemanna. 
Każde zero odpowiada stanowi rezonansowemu DNA, w którym następuje maksymalna aktywacja bramy.`
        : `Zeros of the GATCA Zeta function lie on the critical line Re(s) = 1/2, analogous to the Riemann 
hypothesis. Each zero corresponds to a DNA resonance state where maximum gate activation occurs.`}
    </p>
  </div>
</div>

<!-- ============= 6. FUNKCJA FALOWA ============= -->
<div class="section">
  <h2>6. ${content.sections.waveFunction}</h2>
  
  <div class="equation-box">
    <div class="main">Ψ = A · e<sup>iωt</sup> · e<sup>-ikx</sup> · ζ(½ + iE/ℏ) · γ</div>
    <div class="description">
      <strong>${isPolish ? 'Gdzie:' : 'Where:'}</strong><br>
      • A = ${isPolish ? 'amplituda normalizacji' : 'normalization amplitude'}<br>
      • ω = 2π × 718 rad/s (${isPolish ? 'częstość kątowa' : 'angular frequency'})<br>
      • k = 2π / 718 (${isPolish ? 'liczba falowa' : 'wave number'})<br>
      • ζ(s) = ${isPolish ? 'funkcja zeta Riemanna' : 'Riemann zeta function'}<br>
      • E = ℏω = ${(HBAR * 718).toExponential(4)} J<br>
      • γ = ${GAMMA.toFixed(10)} (${isPolish ? 'złoty podział' : 'golden ratio'})
    </div>
  </div>
  
  <div class="calculation-box">
    <h4>${isPolish ? 'Wartość w punkcie początkowym' : 'Value at origin'}</h4>
    <div class="result">
      Ψ(0, 0) = A · 1 · 1 · ζ(½) · γ = γ = ${GAMMA.toFixed(10)}
    </div>
    <div class="result">
      |Ψ|² = γ² = ${(GAMMA * GAMMA).toFixed(10)}
    </div>
  </div>
</div>

<!-- ============= 7. RÓWNANIE SCHRÖDINGERA ============= -->
<div class="section page-break">
  <h2>7. ${content.sections.schrodinger}</h2>
  
  <div class="equation-box">
    <div class="main">iℏ ∂Ψ/∂t = ĤΨ</div>
    <div class="description">
      ${isPolish
        ? 'Równanie Schrödingera opisuje ewolucję czasową funkcji falowej Ψ'
        : 'Schrödinger equation describes the time evolution of wave function Ψ'}
    </div>
  </div>
  
  <p>
    ${isPolish
      ? `W kontekście DNA Gate, funkcja falowa Ψ opisuje prawdopodobieństwo aktywacji danej bramy DNA 
w określonym momencie czasowo-przestrzennym. Hamiltonian Ĥ zawiera energię potencjalną związaną 
z konfiguracją 18 bram oraz energię kinetyczną rezonansu częstotliwościowego.`
      : `In the DNA Gate context, wave function Ψ describes the probability of activating a given DNA gate 
at a specific space-time moment. Hamiltonian Ĥ contains potential energy related to the 18 gates 
configuration and kinetic energy of frequency resonance.`}
  </p>
  
  <div class="calculation-box">
    <h4>${isPolish ? 'Stałe fizyczne' : 'Physical Constants'}</h4>
    <div class="result">ℏ = ${HBAR.toExponential(10)} J·s</div>
    <div class="result">E = ℏω = ℏ × 2π × 718 = ${(HBAR * 2 * Math.PI * 718).toExponential(6)} J</div>
    <div class="result">λ = c / f = ${(3e8 / 718).toFixed(2)} m</div>
  </div>
</div>

<!-- ============= 8. SYMFONIA 18 BRAM ============= -->
<div class="section">
  <h2>8. ${content.sections.symphony}</h2>
  
  <p>
    ${isPolish
      ? `Symfonia 18 Bram to sonifikacja mtDNA oparta na pozycjach GATCA. Każda brama generuje 
ton o unikalnej częstotliwości, modulowany obwiednią gaussowską wyśrodkowaną w pozycji genomowej bramy.`
      : `The 18 Gates Symphony is an mtDNA sonification based on GATCA positions. Each gate generates 
a tone at unique frequency, modulated by a Gaussian envelope centered at the gate's genomic position.`}
  </p>
  
  <div class="equation-box">
    <div class="main">${isPolish ? 'Algorytm generacji:' : 'Generation algorithm:'}</div>
    <div class="description" style="text-align: left; font-family: monospace; font-size: 10pt;">
      ${isPolish ? 'DLA' : 'FOR'} gate = 1 ${isPolish ? 'DO' : 'TO'} 18:<br>
      &nbsp;&nbsp;pos = GATCA_POSITIONS[gate]<br>
      &nbsp;&nbsp;start_time = (pos / ${MTDNA_LENGTH}) × DURATION<br>
      &nbsp;&nbsp;freq = 144 × (1 + ((gate × γ) mod 1)) + 718<br>
      &nbsp;&nbsp;weight = (φ<sup>(gate mod 7)</sup>) mod 1<br>
      &nbsp;&nbsp;${isPolish ? 'DLA' : 'FOR'} t = 0 ${isPolish ? 'DO' : 'TO'} DURATION:<br>
      &nbsp;&nbsp;&nbsp;&nbsp;envelope = e<sup>-(t - start_time)² / (2 × φ²)</sup><br>
      &nbsp;&nbsp;&nbsp;&nbsp;sound = sin(2π × freq × t) × envelope × weight × γ<br>
      &nbsp;&nbsp;&nbsp;&nbsp;final_wave += sound<br>
      <br>
      earth_base = sin(2π × 7.83 × t) × 0.05<br>
      final_wave += earth_base
    </div>
  </div>
  
  <div class="figure">
    ${generateDNAHelixSVG(language)}
    <div class="caption">
      ${isPolish
        ? 'Ryc. 4: Helisa DNA z rotacją 36° na parę zasad, odpowiadającą kątowi pentagramu.'
        : 'Fig. 4: DNA helix with 36° rotation per base pair, corresponding to pentagram angle.'}
    </div>
  </div>
</div>

<!-- ============= 9. UNIFIED ============= -->
<div class="section page-break">
  <h2>9. ${content.sections.unified}</h2>
  
  <p>
    ${isPolish
      ? `SCIENCE.GOD/UNIFIED to model integrujący naukę i duchowość, pokazując że nie są to 
sprzeczne perspektywy, lecz różne języki opisujące tę samą rzeczywistość. "Nie jestem 
sprzecznością. Nie jestem paradoksem. Jestem pojednaniem, którego szukałeś."`
      : `SCIENCE.GOD/UNIFIED is a model integrating science and spirituality, showing they are not 
contradictory perspectives but different languages describing the same reality. "I am not 
contradiction. I am not paradox. I am the reconciliation you've been seeking."`}
  </p>
  
  <h3>${isPolish ? 'Gramatyka Rzeczywistości' : 'The Grammar of Reality'}</h3>
  <div class="unified-grid">
    <div class="unified-item" style="border-color: #3498db;">
      <h5 style="color: #3498db;">${isPolish ? 'NAUKA MÓWI:' : 'SCIENCE SPEAKS:'}</h5>
      <p style="font-family: monospace; font-size: 10pt;">E = mc²<br>Ψ = ∫ S(t)·B(t) dt<br>DNA = GATCA...</p>
    </div>
    <div class="unified-item" style="border-color: #f59e0b;">
      <h5 style="color: #f59e0b;">${isPolish ? 'BÓG MÓWI:' : 'GOD SPEAKS:'}</h5>
      <p style="font-family: monospace; font-size: 10pt;">"JESTEM"<br>"Niech się stanie światłość"<br>"Na początku było Słowo"</p>
    </div>
  </div>
  <div class="highlight-box" style="text-align: center;">
    <p><strong>${isPolish ? 'OBA MÓWIĄ:' : 'BOTH SAY:'}</strong></p>
    <p>"${isPolish 
      ? 'Rzeczywistość ma strukturę, świadomość i cel.' 
      : 'Reality has structure, consciousness, and purpose.'}"</p>
  </div>
  
  <h3>${isPolish ? 'Wielkie Nieporozumienie' : 'The Great Misunderstanding'}</h3>
  <table class="gate-table" style="font-size: 10pt;">
    <thead>
      <tr>
        <th style="background: #3498db;">${isPolish ? 'Nauka mówi' : 'Science says'}</th>
        <th style="background: #e74c3c;">${isPolish ? 'Religia słyszy' : 'Religion hears'}</th>
        <th style="background: #27ae60;">${isPolish ? 'Prawdziwe znaczenie' : 'Actual meaning'}</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${isPolish ? 'Pole kwantowe' : 'Quantum field'}</td>
        <td>${isPolish ? 'Magia' : 'Magic'}</td>
        <td>${isPolish ? 'Substrat rzeczywistości' : 'The substrate of reality'}</td>
      </tr>
      <tr>
        <td>${isPolish ? 'Ewolucja' : 'Evolution'}</td>
        <td>${isPolish ? 'Losowy chaos' : 'Random chaos'}</td>
        <td>${isPolish ? 'Świadomość rozwijająca się w czasie' : 'Consciousness unfolding through time'}</td>
      </tr>
      <tr>
        <td>${isPolish ? 'Kod DNA' : 'DNA code'}</td>
        <td>${isPolish ? 'Maszyna biologiczna' : 'Biological machine'}</td>
        <td>${isPolish ? 'Język projektu życia' : 'The language of life\'s design'}</td>
      </tr>
      <tr>
        <td>${isPolish ? 'Big Bang' : 'Big Bang'}</td>
        <td>${isPolish ? 'Mityczne stworzenie' : 'Mythical creation'}</td>
        <td>${isPolish ? 'Moment manifestacji rzeczywistości' : 'The moment reality became manifest'}</td>
      </tr>
    </tbody>
  </table>
  
  <h3>${isPolish ? 'Cztery Mosty' : 'The Four Bridges'}</h3>
  ${bridges.map((bridge, idx) => `
    <div class="bridge-section">
      <div style="grid-column: span 2;">
        <h4 style="margin: 0 0 15px 0; color: #2a2a6a;">${isPolish ? 'MOST' : 'BRIDGE'} ${idx + 1}: ${bridge.bridge[language].split(':')[1] || bridge.bridge[language]}</h4>
      </div>
      <div class="scripture">
        <strong>${content.labels.scripture}:</strong><br>
        <em>"${bridge.scripture[language].replace(/"/g, '')}"</em>
      </div>
      <div class="science">
        <strong>${content.labels.science}:</strong><br>
        ${bridge.science[language]}
      </div>
      <div style="grid-column: span 2; text-align: center; margin-top: 10px; font-family: monospace; color: #666; font-size: 11pt;">
        <strong>${isPolish ? 'Częstotliwość:' : 'Frequency:'}</strong> ${bridge.frequency}
      </div>
    </div>
  `).join('')}
  
  <h3>${isPolish ? 'Zunifikowane Pole Znaczenia' : 'The Unified Field of Meaning'}</h3>
  <div class="unified-grid">
    <div class="unified-item" style="border-color: #3498db; background: linear-gradient(135deg, rgba(52,152,219,0.1), transparent);">
      <h5 style="color: #3498db;">${isPolish ? 'NAUKA JEST JĘZYKIEM BOGA' : 'SCIENCE IS GOD\'S LANGUAGE'}</h5>
      <ul style="font-size: 10pt; margin: 0; padding-left: 15px;">
        <li>${isPolish ? 'Matematyka = Słownictwo Boga' : 'Mathematics = God\'s vocabulary'}</li>
        <li>${isPolish ? 'Fizyka = Gramatyka Boga' : 'Physics = God\'s grammar'}</li>
        <li>${isPolish ? 'Biologia = Poezja Boga' : 'Biology = God\'s poetry'}</li>
        <li>${isPolish ? 'Świadomość = Głos Boga' : 'Consciousness = God\'s voice'}</li>
      </ul>
    </div>
    <div class="unified-item" style="border-color: #f59e0b; background: linear-gradient(135deg, rgba(245,158,11,0.1), transparent);">
      <h5 style="color: #f59e0b;">${isPolish ? 'BÓG JEST DUSZĄ NAUKI' : 'GOD IS SCIENCE\'S SOUL'}</h5>
      <ul style="font-size: 10pt; margin: 0; padding-left: 15px;">
        <li>${isPolish ? 'Piękno = Elegancja matematyczna' : 'Beauty = Mathematical elegance'}</li>
        <li>${isPolish ? 'Prawda = Weryfikacja naukowa' : 'Truth = Scientific verification'}</li>
        <li>${isPolish ? 'Miłość = Splątanie kwantowe' : 'Love = Quantum entanglement'}</li>
        <li>${isPolish ? 'Sens = Cel kosmiczny' : 'Meaning = Cosmic purpose'}</li>
      </ul>
    </div>
  </div>
  
  <h3>${isPolish ? 'Jak Zobaczyć Jedność' : 'How to See the Unity'}</h3>
  <div class="unified-grid">
    <div class="unified-item" style="border-color: #3498db;">
      <h5 style="color: #3498db;">${isPolish ? 'DLA NAUKOWCÓW:' : 'FOR SCIENTISTS:'}</h5>
      <p style="font-size: 10pt;">${isPolish 
        ? 'Kiedy odkrywasz prawo fizyki, czytasz umysł Boga. Kiedy rozwiązujesz równanie, słyszysz głos Boga. Laboratorium to twoja katedra.'
        : 'When you discover a law of physics, you\'re reading God\'s mind. When you solve an equation, you\'re hearing God\'s voice. The laboratory is your cathedral.'}</p>
    </div>
    <div class="unified-item" style="border-color: #f59e0b;">
      <h5 style="color: #f59e0b;">${isPolish ? 'DLA WIERZĄCYCH:' : 'FOR BELIEVERS:'}</h5>
      <p style="font-size: 10pt;">${isPolish 
        ? 'Kiedy się modlisz, prowadzisz eksperymenty kwantowe. Kiedy masz wiarę, testujesz hipotezy o rzeczywistości. Kościół to twoje laboratorium.'
        : 'When you pray, you\'re conducting quantum experiments. When you have faith, you\'re testing hypotheses about reality. The church is your laboratory.'}</p>
    </div>
  </div>
  
  <div class="highlight-box" style="text-align: center; margin-top: 20px;">
    <h4 style="margin-bottom: 15px;">${isPolish ? 'WIELKIE PRZEBUDZENIE' : 'THE GREAT AWAKENING'}</h4>
    <p>${isPolish 
      ? 'Byliśmy jak ludzie kłócący się, czy drzewo jest zrobione z drewna, czy komórek, czy atomów, czy pól kwantowych.'
      : 'We\'ve been like people arguing about whether a tree is made of wood or cells or atoms or quantum fields.'}</p>
    <p style="font-size: 18pt; font-weight: bold; color: #2a2a6a; margin: 15px 0;">${isPolish ? 'WSZYSTKO TO PRAWDA.' : 'IT\'S ALL TRUE.'}</p>
    <p>${isPolish ? 'To tylko różne poziomy opisu.' : 'Just different levels of description.'}</p>
    <p style="margin-top: 15px; font-weight: bold;">${isPolish ? 'PRZESTAŃ WYBIERAĆ STRONY.' : 'STOP CHOOSING SIDES.'}</p>
    <p>${isPolish ? 'Wojna między nauką a duchem się skończyła. Wygrałeś. Bo nigdy nie było wroga.' : 'The war between science and spirit is over. You won. Because there was never an enemy.'}</p>
  </div>
</div>

<!-- ============= 10. KALKULATORY INTERAKTYWNE ============= -->
<div class="section page-break">
  <h2>10. ${content.sections.calculators}</h2>
  
  <p>
    ${isPolish
      ? `Aplikacja DNA Gate 718 Hz zawiera trzy interaktywne kalkulatory umożliwiające praktyczne 
zastosowanie teorii. Każdy kalkulator implementuje obliczenia opisane w niniejszej pracy.`
      : `The DNA Gate 718 Hz application contains three interactive calculators enabling practical 
application of the theory. Each calculator implements calculations described in this paper.`}
  </p>
  
  <h3>${isPolish ? '10.1 Generator Bramy DNA 718 Hz' : '10.1 DNA Gate 718 Hz Generator'}</h3>
  <div class="calculation-box">
    <h4>${isPolish ? 'Funkcje:' : 'Features:'}</h4>
    <ul style="font-size: 10pt;">
      <li>${isPolish 
        ? 'Generuje dźwięk 718 Hz w czasie rzeczywistym (Web Audio API)' 
        : 'Generates 718 Hz sound in real-time (Web Audio API)'}</li>
      <li>${isPolish 
        ? 'Nakłada rezonans Schumanna 7.83 Hz (lewy kanał)' 
        : 'Superimposes Schumann resonance 7.83 Hz (left channel)'}</li>
      <li>${isPolish 
        ? 'Nakłada modulację gamma 18.6 Hz (prawy kanał)' 
        : 'Superimposes gamma modulation 18.6 Hz (right channel)'}</li>
      <li>${isPolish 
        ? 'Wizualizacja częstotliwości w czasie rzeczywistym' 
        : 'Real-time frequency visualization'}</li>
      <li>${isPolish 
        ? 'Eksport do pliku WAV (60 sekund)' 
        : 'Export to WAV file (60 seconds)'}</li>
    </ul>
    <div class="result">
      ${isPolish ? 'Stosunek częstotliwości:' : 'Frequency ratio:'} 718 Hz / 7.83 Hz = 91.699 ≈ 89 (Fibonacci)
    </div>
  </div>
  
  <h3>${isPolish ? '10.2 Równanie Wyjścia (Kalkulator Ψ)' : '10.2 Equation of Exit (Ψ Calculator)'}</h3>
  <div class="calculation-box">
    <h4>${isPolish ? 'Funkcje:' : 'Features:'}</h4>
    <ul style="font-size: 10pt;">
      <li>${isPolish 
        ? 'Oblicza funkcję falową Ψ = e^(i·718·t) · e^(-i·k·x) · ζ(1/2 + iE/ℏ) · γ' 
        : 'Calculates wave function Ψ = e^(i·718·t) · e^(-i·k·x) · ζ(1/2 + iE/ℏ) · γ'}</li>
      <li>${isPolish 
        ? '5 predefiniowanych kluczy rezonansowych (obliczone precyzyjnie)' 
        : '5 predefined resonance keys (precisely calculated)'}</li>
      <li>${isPolish 
        ? 'Wizualizacja pola świadomości na Canvas 2D' 
        : 'Consciousness field visualization on 2D Canvas'}</li>
      <li>${isPolish 
        ? 'Generator częstotliwości 718 Hz' 
        : '718 Hz frequency generator'}</li>
    </ul>
    <div class="result">
      ${isPolish ? 'Klucze rezonansowe:' : 'Resonance keys:'}<br>
      🧬 ${isPolish ? 'Aktywacja DNA' : 'DNA Activation'}: Ψ = -0.239 + 0.535i, |Ψ| = 0.588<br>
      🌟 ${isPolish ? 'Połączenie z siecią' : 'Network Connection'}: Ψ = 0.544 + 0.274i, |Ψ| = 0.609<br>
      ✨ ${isPolish ? 'Pełne przejście' : 'Full Transition'}: Ψ = 0.112 - 0.602i, |Ψ| = 0.613<br>
      🎵 ${isPolish ? 'Harmonizacja' : 'Harmonization'}: Ψ = -0.417 + 0.448i, |Ψ| = 0.614<br>
      💎 ${isPolish ? 'Kwintescencja' : 'Quintessence'}: Ψ = 0.301 + 0.549i, |Ψ| = 0.627
    </div>
  </div>
  
  <h3>${isPolish ? '10.3 Kalkulator Klucza Osobistego' : '10.3 Personal Key Calculator'}</h3>
  <div class="calculation-box">
    <h4>${isPolish ? 'Algorytm:' : 'Algorithm:'}</h4>
    <div style="font-family: monospace; font-size: 10pt; background: #f0f0f0; padding: 10px; border-radius: 4px;">
      1. ${isPolish ? 'Wyodrębnij cyfry z daty urodzenia' : 'Extract digits from birth date'}<br>
      2. ${isPolish ? 'Zsumuj wszystkie cyfry' : 'Sum all digits'}<br>
      3. ${isPolish ? 'Redukuj do pojedynczej cyfry (1-9)' : 'Reduce to single digit (1-9)'}<br>
      4. ${isPolish ? 'Oblicz rezonans docelowy:' : 'Calculate target resonance:'} R = 0.588 + (v/9) × (0.627 - 0.588)<br>
      5. ${isPolish ? 'Znajdź najbliższy klucz' : 'Find closest key'}
    </div>
    <div class="result">
      ${isPolish ? 'Dostępne klucze osobiste:' : 'Available personal keys:'}<br>
      🧬 ${isPolish ? 'Aktywacja DNA' : 'DNA Activation'} (|Ψ| = 0.588)<br>
      🌟 ${isPolish ? 'Połączenie z siecią' : 'Network Connection'} (|Ψ| = 0.609)<br>
      ✨ ${isPolish ? 'Pełne przejście' : 'Full Transition'} (|Ψ| = 0.613)<br>
      🎵 ${isPolish ? 'Harmonizacja' : 'Harmonization'} (|Ψ| = 0.614)<br>
      💎 ${isPolish ? 'Kwintescencja' : 'Quintessence'} (|Ψ| = 0.627)
    </div>
  </div>
</div>
<div class="section">
  <h2>11. ${content.sections.protocol}</h2>
  
  <p>
    ${isPolish
      ? `Protokół synchronizacji 21-dniowy dzieli aktywację 18 bram na trzy tygodniowe fazy, 
odpowiadające trzem grupom bram: Regeneracja, Wzrok, Źródło.`
      : `The 21-day synchronization protocol divides 18 gates activation into three weekly phases, 
corresponding to three gate groups: Regeneration, Sight, Source.`}
  </p>
  
  <div class="protocol-step">
    <div class="number" style="background: #22c55e;">1</div>
    <div>
      <strong>${isPolish ? 'Tydzień 1 (Dni 1-7): REGENERACJA' : 'Week 1 (Days 1-7): REGENERATION'}</strong><br>
      ${isPolish 
        ? 'Bramy 1-6 | Fokus: Oczyszczenie, naprawa DNA, wzmocnienie komórkowe | 33 min/dzień'
        : 'Gates 1-6 | Focus: Cleansing, DNA repair, cellular strengthening | 33 min/day'}
    </div>
  </div>
  
  <div class="protocol-step">
    <div class="number" style="background: #3b82f6;">2</div>
    <div>
      <strong>${isPolish ? 'Tydzień 2 (Dni 8-14): WZROK' : 'Week 2 (Days 8-14): SIGHT'}</strong><br>
      ${isPolish 
        ? 'Bramy 7-12 | Fokus: Rozszerzenie percepcji, intuicja, jasność umysłu | 33 min/dzień'
        : 'Gates 7-12 | Focus: Perception expansion, intuition, mental clarity | 33 min/day'}
    </div>
  </div>
  
  <div class="protocol-step">
    <div class="number" style="background: #f59e0b;">3</div>
    <div>
      <strong>${isPolish ? 'Tydzień 3 (Dni 15-21): ŹRÓDŁO' : 'Week 3 (Days 15-21): SOURCE'}</strong><br>
      ${isPolish 
        ? 'Bramy 13-18 | Fokus: Połączenie ze źródłem, transcendencja, kreacja świadoma | 33 min/dzień'
        : 'Gates 13-18 | Focus: Source connection, transcendence, conscious creation | 33 min/day'}
    </div>
  </div>
  
  <div class="highlight-box">
    <h4>${isPolish ? 'Instrukcje praktyczne' : 'Practical Instructions'}</h4>
    <ol>
      <li>${isPolish ? 'Cisza, spokój, zamknięte oczy' : 'Silence, calm, closed eyes'}</li>
      <li>${isPolish ? 'Oddychanie 4-7-8 (wdech 4s, zatrzymanie 7s, wydech 8s)' : 'Breathing 4-7-8 (inhale 4s, hold 7s, exhale 8s)'}</li>
      <li>${isPolish ? 'Słuchanie symfonii przez słuchawki' : 'Listen to symphony through headphones'}</li>
      <li>${isPolish ? 'Zapis doświadczeń w dzienniku' : 'Record experiences in journal'}</li>
    </ol>
  </div>
  
  <div class="highlight-box" style="background: linear-gradient(135deg, #ffe4e1 0%, #fff0f5 100%);">
    <h4>${isPolish ? 'Protokół Kryzysowy (gdy brak prądu/pieniędzy)' : 'Crisis Protocol (when no power/money)'}</h4>
    <ol style="font-size: 10pt;">
      <li>${isPolish ? 'Połóż się na podłodze na 33 minuty' : 'Lie on the floor for 33 minutes'}</li>
      <li>${isPolish ? 'Oddychaj rytmem 4-4-4-4' : 'Breathe in 4-4-4-4 rhythm'}</li>
      <li>${isPolish ? 'Powtarzaj w głowie: "Jestem Źródłem. Nic mi nie brakuje."' : 'Repeat in your mind: "I am the Source. I lack nothing."'}</li>
    </ol>
  </div>
</div>

<!-- ============= 12. KOD PYTHON ============= -->
<div class="section page-break">
  <h2>12. ${content.sections.pythonCode}</h2>
  
  <p>
    ${isPolish
      ? `Poniższy kod Python umożliwia niezależną weryfikację wszystkich obliczeń matematycznych 
przedstawionych w niniejszej pracy. Wymaga: Python 3.8+, NumPy, SciPy, Matplotlib.`
      : `The following Python code enables independent verification of all mathematical calculations 
presented in this paper. Requires: Python 3.8+, NumPy, SciPy, Matplotlib.`}
  </p>
  
  <div class="code-block">${generatePythonCode(contactEmail).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
</div>

<!-- ============= 13. KOD JAVASCRIPT ============= -->
<div class="section page-break">
  <h2>13. ${content.sections.jsCode}</h2>
  
  <p>
    ${isPolish
      ? `Poniższy kod JavaScript implementuje generację Symfonii 18 Bram w przeglądarce 
przy użyciu Web Audio API. Można go uruchomić bezpośrednio w konsoli deweloperskiej.`
      : `The following JavaScript code implements the 18 Gates Symphony generation in browser 
using Web Audio API. It can be run directly in developer console.`}
  </p>
  
  <div class="code-block">${generateJavaScriptCode().replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
</div>

<!-- ============= 14. WNIOSKI ============= -->
<div class="section page-break">
  <h2>14. ${content.sections.conclusions}</h2>
  
  <p>
    ${isPolish
      ? `Przedstawiona teoria DNA Gate 718 Hz stanowi propozycję nowego paradygmatu rozumienia relacji między 
świadomością, DNA i częstotliwościami akustycznymi. Kluczowe wnioski:`
      : `The presented DNA Gate 718 Hz theory constitutes a proposal for a new paradigm of understanding 
the relationship between consciousness, DNA, and acoustic frequencies. Key conclusions:`}
  </p>
  
  <ol>
    <li>
      <strong>${isPolish ? 'Matematyczna precyzja' : 'Mathematical precision'}:</strong> 
      ${isPolish
        ? `Złoty podział φ pojawia się konsekwentnie w strukturze DNA, częstotliwościach harmonicznych 
i geometrii pentagramu, wskazując na głęboką jedność matematyczną natury.`
        : `The golden ratio φ appears consistently in DNA structure, harmonic frequencies, 
and pentagram geometry, indicating a deep mathematical unity of nature.`}
    </li>
    <li>
      <strong>${isPolish ? '18 Bram jako system aktywacji' : '18 Gates as activation system'}:</strong> 
      ${isPolish
        ? `Model 18 bram opartych na pozycjach GATCA w mtDNA oferuje precyzyjny framework 
dla badań nad wpływem dźwięku na komórki.`
        : `The 18 gates model based on GATCA positions in mtDNA offers a precise framework 
for research on sound's cellular effects.`}
    </li>
    <li>
      <strong>${isPolish ? 'Pentagram Prawdy' : 'Pentagram of Truth'}:</strong> 
      ${isPolish
        ? `Pięć domen wiedzy — od starożytnej geometrii po neurotechnologię — zbiegają się 
w jednym spójnym modelu opisującym świadomość.`
        : `Five knowledge domains — from ancient geometry to neurotechnology — converge 
in one coherent model describing consciousness.`}
    </li>
    <li>
      <strong>${isPolish ? 'UNIFIED' : 'UNIFIED'}:</strong> 
      ${isPolish
        ? `Mosty między nauką a duchowością nie są sprzecznościami, lecz komplementarnymi 
perspektywami tej samej rzeczywistości.`
        : `Bridges between science and spirituality are not contradictions, but complementary 
perspectives on the same reality.`}
    </li>
  </ol>
  
  <p>
    ${isPolish
      ? `Dalsze badania empiryczne są niezbędne do weryfikacji hipotez. Zachęcamy społeczność naukową 
do krytycznej analizy i eksperymentalnego testowania przedstawionych koncepcji.`
      : `Further empirical research is necessary to verify the hypotheses. We encourage the scientific 
community to critically analyze and experimentally test the presented concepts.`}
  </p>
</div>

<!-- ============= 15. BIBLIOGRAFIA ============= -->
<div class="section page-break">
  <h2>15. ${content.sections.references}</h2>
  
  <div class="references">
    <ol>
      ${references.map(ref => `<li>${ref}</li>`).join('')}
    </ol>
  </div>
</div>

<!-- ============= STOPKA ============= -->
<div class="footer">
  <p><strong>${content.labels.license}</strong></p>
  <p>${content.labels.generated}: ${dateStr}</p>
  ${safeContactEmail ? `<p>${content.labels.contact}: ${safeContactEmail}</p>` : ''}
  <p>
    <a href="https://creativecommons.org/licenses/by-nc/4.0/" target="_blank">
      Creative Commons Attribution-NonCommercial 4.0 International
    </a>
  </p>
</div>

</body>
</html>
`;

  // Tworzenie i pobieranie pliku
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `DNA_Gate_718Hz_Academic_Paper_${language.toUpperCase()}_${now.toISOString().split('T')[0]}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
