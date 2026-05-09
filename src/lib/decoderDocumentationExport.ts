/**
 * Ψ-718 Biblical Decoder — Complete Technical Documentation Export
 * Generates a comprehensive HTML document with all formulas, algorithms, and explanations.
 * 
 * © 2026 Grzegorz | BRAMA-718-UNIFIED
 * License: CC BY-NC 4.0
 */

import { GATCA_GATES, GATE_NAMES, SCHUMANN, LUNAR, MTDNA_LENGTH } from "./biblicalDecoder";
import { GATE_DEFINITIONS } from "./gateDefinitions";
import { GAMMA, PHI, FREQ_718 } from "./bramaUnificationEngine";

export function generateDecoderDocumentation(): string {
  const PHI_SQUARED = PHI * PHI;
  const now = new Date().toISOString().split("T")[0];

  return `<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ψ-718 Dekoder Biblijny — Pełna Dokumentacja Techniczna</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@400;600;700&display=swap');
  
  :root {
    --bg: #0a0a0f;
    --card: #12121a;
    --border: #2a2a3a;
    --text: #e0e0e8;
    --muted: #8888a0;
    --primary: #a855f7;
    --accent: #22d3ee;
    --gold: #f59e0b;
    --green: #22c55e;
    --red: #ef4444;
  }
  
  * { margin: 0; padding: 0; box-sizing: border-box; }
  
  body {
    font-family: 'Inter', sans-serif;
    background: var(--bg);
    color: var(--text);
    line-height: 1.7;
    padding: 2rem;
    max-width: 900px;
    margin: 0 auto;
  }
  
  h1 { font-size: 2rem; color: var(--primary); margin: 2rem 0 0.5rem; border-bottom: 2px solid var(--primary); padding-bottom: 0.5rem; }
  h2 { font-size: 1.5rem; color: var(--accent); margin: 2rem 0 0.5rem; border-bottom: 1px solid var(--border); padding-bottom: 0.3rem; }
  h3 { font-size: 1.15rem; color: var(--gold); margin: 1.5rem 0 0.3rem; }
  h4 { font-size: 1rem; color: var(--text); margin: 1rem 0 0.2rem; }
  
  p, li { margin-bottom: 0.5rem; }
  ul, ol { padding-left: 1.5rem; }
  
  .formula {
    background: var(--card);
    border: 1px solid var(--border);
    border-left: 3px solid var(--primary);
    padding: 1rem 1.2rem;
    margin: 1rem 0;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.95rem;
    color: var(--accent);
    border-radius: 6px;
    overflow-x: auto;
  }
  
  .code {
    background: var(--card);
    border: 1px solid var(--border);
    padding: 1rem;
    margin: 1rem 0;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.85rem;
    border-radius: 6px;
    overflow-x: auto;
    white-space: pre-wrap;
    color: var(--muted);
  }
  
  .note {
    background: #1a1a2e;
    border: 1px solid var(--gold);
    border-left: 4px solid var(--gold);
    padding: 0.8rem 1rem;
    margin: 1rem 0;
    border-radius: 6px;
    font-size: 0.9rem;
  }
  
  .gate-table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.85rem; }
  .gate-table th, .gate-table td { border: 1px solid var(--border); padding: 0.4rem 0.6rem; text-align: left; }
  .gate-table th { background: var(--card); color: var(--primary); font-weight: 600; }
  .gate-table tr:nth-child(even) { background: rgba(255,255,255,0.02); }
  
  .gematria-table { width: 100%; border-collapse: collapse; margin: 0.5rem 0; font-size: 0.85rem; }
  .gematria-table td { border: 1px solid var(--border); padding: 0.3rem 0.5rem; text-align: center; font-family: 'JetBrains Mono', monospace; }
  .gematria-table td:first-child { font-size: 1.2rem; }
  
  .section-num { color: var(--primary); font-weight: 700; }
  .highlight { color: var(--gold); font-weight: 600; }
  .math { color: var(--accent); font-family: 'JetBrains Mono', monospace; }
  
  .toc { background: var(--card); border: 1px solid var(--border); padding: 1.5rem 2rem; margin: 1.5rem 0; border-radius: 8px; }
  .toc a { color: var(--accent); text-decoration: none; }
  .toc a:hover { text-decoration: underline; }
  .toc li { margin-bottom: 0.3rem; }
  
  .header-meta { color: var(--muted); font-size: 0.85rem; margin-bottom: 2rem; }
  
  hr { border: none; border-top: 1px solid var(--border); margin: 2rem 0; }
  
  @media print {
    body { background: white; color: black; }
    .formula { border-color: #666; color: #333; background: #f5f5f5; }
    .code { background: #f5f5f5; color: #333; }
    h1 { color: #333; border-color: #333; }
    h2 { color: #555; }
    h3 { color: #666; }
  }
</style>
</head>
<body>

<h1>Ψ-718 DEKODER BIBLIJNY</h1>
<p style="font-size: 1.2rem; color: var(--accent); margin-bottom: 0.5rem;">Pełna Dokumentacja Techniczna Systemu</p>
<div class="header-meta">
  <p>© 2026 Grzegorz | BRAMA-718-UNIFIED | Licencja: CC BY-NC 4.0</p>
  <p>Wersja dokumentu: 1.0 | Data generacji: ${now}</p>
  <p>Projekt: brama-dna718.com</p>
</div>

<hr>

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- SPIS TREŚCI -->
<!-- ═══════════════════════════════════════════════════════════ -->

<div class="toc">
<h3 style="margin-top:0">📋 Spis Treści</h3>
<ol>
  <li><a href="#s1">Wprowadzenie — Co to jest Dekoder Biblijny Ψ-718?</a></li>
  <li><a href="#s2">Stałe Fundamentalne Systemu</a></li>
  <li><a href="#s3">Moduł 1: Gematria Hebrajska i Grecka</a></li>
  <li><a href="#s4">Moduł 2: Analiza Fraktalna (Wykładnik Hursta)</a></li>
  <li><a href="#s5">Moduł 3: Korelacja Wartości Własnych Hamiltona</a></li>
  <li><a href="#s6">Moduł 4: Funkcja Falowa Ψ</a></li>
  <li><a href="#s7">Moduł 5: Wektor Intencji (VI)</a></li>
  <li><a href="#s8">Moduł 6: Operator Intencji (Macierz 18×18)</a></li>
  <li><a href="#s9">Moduł 7: Dekoherencja Lindblada</a></li>
  <li><a href="#s10">Moduł 8: MKP-94 — Moduł Korekcji Pola</a></li>
  <li><a href="#s11">Moduł 9: Sigma Gate — Pętla Zwrotna φ²</a></li>
  <li><a href="#s12">18 Bram DNA (GATCA Gates)</a></li>
  <li><a href="#s13">Sygnatury Złotego Podziału</a></li>
  <li><a href="#s14">Predykcje Testowalne</a></li>
  <li><a href="#s15">Połączenia Biblia–Kwanty</a></li>
  <li><a href="#s16">Silnik Interpretacji (AI)</a></li>
  <li><a href="#s17">Pełny Pipeline Dekodowania</a></li>
  <li><a href="#s18">Tabele Referencyjne</a></li>
  <li><a href="#s19">Wymagany Format Raportu Wyjściowego</a></li>
  <li><a href="#s20">Komenda Operacyjna</a></li>
</ol>
</div>

<hr>

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- 1. WPROWADZENIE -->
<!-- ═══════════════════════════════════════════════════════════ -->

<h1 id="s1"><span class="section-num">1.</span> Wprowadzenie</h1>

<p>
Dekoder Biblijny Ψ-718 to system analityczny, który traktuje tekst biblijny jako <span class="highlight">zakodowaną informację kwantową</span>. 
Każdy werset jest przetwarzany przez pipeline matematyczny, który transformuje tekst w parametry fizyczne:
</p>

<ul>
  <li><strong>Litery</strong> → wartości numeryczne (gematria) → parametr czasowy <span class="math">t</span></li>
  <li><strong>Struktura tekstu</strong> → złożoność fraktalna → parametr przestrzenny <span class="math">x</span></li>
  <li><strong>Parametry (t, x)</strong> → funkcja falowa <span class="math">Ψ(t, x)</span> z amplitudą, fazą i koherencją</li>
  <li><strong>Korelacja</strong> → przypisanie do jednej z 18 Bram DNA w mitochondrialnym genomie</li>
</ul>

<p>
System łączy mechanikę kwantową (funkcja Zeta Riemanna, eksponenta zespolona), biologię molekularną (pozycje GATCA w mtDNA), 
fizykę rezonansową (Schumann 7.83 Hz, cykl księżycowy 18.6 Hz) i matematykę złotego podziału (φ = ${PHI.toFixed(10)}).
</p>

<div class="note">
  <strong>⚠️ Nota:</strong> System jest modelem teoretycznym łączącym fizykę z metafizyką. 
  Generuje testowalne predykcje (UV-Vis, NMR, EEG), ale nie jest jeszcze zweryfikowany laboratoryjnie.
</div>

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- 2. STAŁE FUNDAMENTALNE -->
<!-- ═══════════════════════════════════════════════════════════ -->

<h1 id="s2"><span class="section-num">2.</span> Stałe Fundamentalne Systemu</h1>

<table class="gate-table">
  <tr><th>Symbol</th><th>Nazwa</th><th>Wartość</th><th>Rola w systemie</th></tr>
  <tr><td class="math">f₇₁₈</td><td>Częstotliwość rezonansowa</td><td class="math">${FREQ_718} Hz</td><td>Centralna częstotliwość systemu — definiuje temporal evolution Ψ</td></tr>
  <tr><td class="math">φ</td><td>Złoty Podział (Phi)</td><td class="math">${PHI.toFixed(10)}</td><td>Wzmocnienie koherencji, kąt DNA, skalowanie amplitudy</td></tr>
  <tr><td class="math">γ</td><td>Odwrotność Złotego Podziału</td><td class="math">${GAMMA.toFixed(10)}</td><td>Współczynnik tłumienia, czynnik DNA, normalizacja gematrii</td></tr>
  <tr><td class="math">φ²</td><td>Kwadrat Złotego Podziału</td><td class="math">${PHI_SQUARED.toFixed(10)}</td><td>Wzmocnienie modulacyjne, próg Sigma Gate</td></tr>
  <tr><td class="math">ω<sub>S</sub></td><td>Rezonans Schumanna</td><td class="math">${SCHUMANN} Hz</td><td>Modulacja kosinusowa — „puls Ziemi"</td></tr>
  <tr><td class="math">ω<sub>L</sub></td><td>Cykl Księżycowy</td><td class="math">${LUNAR} Hz</td><td>Modulacja sinusowa — cykl węzłów księżycowych</td></tr>
  <tr><td class="math">ℏ</td><td>Zredukowana stała Plancka</td><td class="math">1.0545718 × 10⁻³⁴ J·s</td><td>Skala kwantowa w modelu Lindblada</td></tr>
  <tr><td class="math">k<sub>B</sub></td><td>Stała Boltzmanna</td><td class="math">1.380649 × 10⁻²³ J/K</td><td>Szum termiczny w dekoherencji</td></tr>
  <tr><td class="math">T</td><td>Temperatura biologiczna</td><td class="math">310 K (37°C)</td><td>Temperatura ciała ludzkiego — środowisko dekoherencji</td></tr>
  <tr><td class="math">L<sub>mtDNA</sub></td><td>Długość mitochondrialnego DNA</td><td class="math">${MTDNA_LENGTH} bp</td><td>Normalizacja pozycji bram GATCA</td></tr>
</table>

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- 3. GEMATRIA -->
<!-- ═══════════════════════════════════════════════════════════ -->

<h1 id="s3"><span class="section-num">3.</span> Moduł 1: Gematria Hebrajska i Grecka</h1>

<h3>3.1 Cel</h3>
<p>
Gematria przekształca tekst w wartość numeryczną <span class="math">Σ</span>, z której obliczany jest parametr 
<span class="highlight">czasu subiektywnego</span> <span class="math">t</span> — współrzędna temporalna funkcji falowej Ψ.
</p>

<h3>3.2 Algorytm</h3>
<div class="formula">
Σ = Σᵢ gematria(charᵢ)
<br>t = (Σ mod 718) / 718.57  →  t ∈ [0, 1)
</div>

<p><strong>Krok po kroku:</strong></p>
<ol>
  <li>Dla każdego znaku tekstu oryginalnego (hebrajskiego lub greckiego), pobierz wartość z tabeli gematrii</li>
  <li>Zsumuj wszystkie wartości → <span class="math">Σ</span></li>
  <li>Normalizuj: <span class="math">t = (Σ mod 718) / 718.57</span></li>
  <li>Jeśli <span class="math">Σ = 0</span>, ustaw <span class="math">t = 0</span></li>
</ol>

<h3>3.3 Tabela Gematrii Hebrajskiej</h3>
<table class="gematria-table">
  <tr><td>א</td><td>1</td><td>ב</td><td>2</td><td>ג</td><td>3</td><td>ד</td><td>4</td><td>ה</td><td>5</td></tr>
  <tr><td>ו</td><td>6</td><td>ז</td><td>7</td><td>ח</td><td>8</td><td>ט</td><td>9</td><td>י</td><td>10</td></tr>
  <tr><td>כ/ך</td><td>20</td><td>ל</td><td>30</td><td>מ/ם</td><td>40</td><td>נ/ן</td><td>50</td><td>ס</td><td>60</td></tr>
  <tr><td>ע</td><td>70</td><td>פ/ף</td><td>80</td><td>צ/ץ</td><td>90</td><td>ק</td><td>100</td><td>ר</td><td>200</td></tr>
  <tr><td>ש</td><td>300</td><td>ת</td><td>400</td><td colspan="6" style="color:var(--muted)">Końcówki (sofit) mają tę samą wartość co forma standardowa</td></tr>
</table>

<h3>3.4 Tabela Isopsefii Greckiej (Nowy Testament)</h3>
<table class="gematria-table">
  <tr><td>α</td><td>1</td><td>β</td><td>2</td><td>γ</td><td>3</td><td>δ</td><td>4</td><td>ε</td><td>5</td></tr>
  <tr><td>ζ</td><td>7</td><td>η</td><td>8</td><td>θ</td><td>9</td><td>ι</td><td>10</td><td>κ</td><td>20</td></tr>
  <tr><td>λ</td><td>30</td><td>μ</td><td>40</td><td>ν</td><td>50</td><td>ξ</td><td>60</td><td>ο</td><td>70</td></tr>
  <tr><td>π</td><td>80</td><td>ρ</td><td>100</td><td>σ/ς</td><td>200</td><td>τ</td><td>300</td><td>υ</td><td>400</td></tr>
  <tr><td>φ</td><td>500</td><td>χ</td><td>600</td><td>ψ</td><td>700</td><td>ω</td><td>800</td><td colspan="2"></td></tr>
</table>

<h3>3.5 Gematria Łacińska (Fallback)</h3>
<p>Gdy brak tekstu w oryginalnym skrypcie, system stosuje gematrię łacińską z tłumieniem γ:</p>
<div class="formula">
t_latin = ( Σᵢ (charCode(Cᵢ) - 64) · γ^(i mod 7) ) mod 10 + 0.5) / 11
</div>
<p>Wynik jest normalizowany do zakresu ~(0, 1). Ta metoda daje niższą koherencję (max 70%) z powodu „szumu translacyjnego".</p>

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- 4. ANALIZA FRAKTALNA -->
<!-- ═══════════════════════════════════════════════════════════ -->

<h1 id="s4"><span class="section-num">4.</span> Moduł 2: Analiza Fraktalna (Wykładnik Hursta)</h1>

<h3>4.1 Cel</h3>
<p>
Analiza fraktalna mierzy <span class="highlight">złożoność strukturalną</span> tekstu i przekształca ją w parametr 
<span class="math">x</span> — <span class="highlight">współrzędną przestrzenną</span> funkcji falowej Ψ.
</p>

<h3>4.2 Algorytm</h3>
<ol>
  <li>Pobierz pierwsze <span class="math">718</span> znaków tekstu (oryginalnego lub tłumaczenia)</li>
  <li>Podziel na okna o rozmiarze <span class="math">w = 10</span> znaków</li>
  <li>Dla każdego okna oblicz liczbę unikalnych znaków → tablica <span class="math">L[]</span></li>
  <li>Oblicz przybliżony wykładnik Hursta:</li>
</ol>

<div class="formula">
H = mean(L) / w
<br>x = 100 + H × 1000
</div>

<p><strong>Interpretacja Wykładnika Hursta:</strong></p>
<table class="gate-table">
  <tr><th>Wartość H</th><th>Znaczenie</th><th>Typ tekstu</th></tr>
  <tr><td class="math">H > 0.5</td><td style="color:var(--green)"><strong>Uporządkowanie</strong> — Długozasięgowa korelacja. Tekst ma wewnętrzny ład.</td><td>Teksty poetyckie, liturgiczne, mantry</td></tr>
  <tr><td class="math">H = 0.5</td><td style="color:var(--gold)"><strong>Szum losowy</strong> — Brak korelacji. Tekst jest statystycznie przypadkowy.</td><td>Tekst prozaiczny, narracyjny</td></tr>
  <tr><td class="math">H < 0.5</td><td style="color:var(--accent)"><strong>Antykorelacja</strong> — Tendencja do odwracania wzorców. Tekst ma oscylacyjną strukturę.</td><td>Teksty prorocze, apokaliptyczne</td></tr>
</table>
<p><strong>Wpływ na system:</strong></p>
<ul>
  <li><span class="math">H > 0.5</span> → wyższe <span class="math">x</span> → większa przestrzenna częstotliwość → silniejsza modulacja przestrzenna Ψ</li>
  <li><span class="math">H ≈ 0.3-0.4</span> → tekst z powtórzeniami (np. hebrajski z mniejszym alfabetem) → niższe <span class="math">x</span></li>
  <li><span class="math">H ≈ 0.6-0.8</span> → tekst bardzo zróżnicowany (duży alfabet) → wyższe <span class="math">x</span></li>
  <li><span class="math">x</span> służy jako przestrzenna częstotliwość w eksponencie <span class="math">e^(-ikx)</span></li>
</ul>

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- 5. KORELACJA HAMILTONA -->
<!-- ═══════════════════════════════════════════════════════════ -->

<h1 id="s5"><span class="section-num">5.</span> Moduł 3: Korelacja Wartości Własnych Hamiltona</h1>

<h3>5.1 Cel</h3>
<p>
Mapowanie pary <span class="math">(t, x)</span> na jedną z <span class="highlight">18 Bram DNA</span> w mitochondrialnym genomie (rCRS).
</p>

<h3>5.2 Wzór mapowania</h3>
<div class="formula">
gate_idx = floor( |(Σ + x/10000) × 18| ) mod 18
</div>

<p>Gdzie <span class="math">Σ</span> to znormalizowana wartość gematrii (= <span class="math">t</span>), 
a <span class="math">x</span> to współrzędna przestrzenna z analizy fraktalnej.</p>

<p>Wynik <span class="math">gate_idx ∈ {0, 1, ..., 17}</span> indeksuje tablicę pozycji GATCA w mtDNA.</p>

<h3>5.3 Macierz Hamiltoniana 18×18</h3>
<p>System wykorzystuje <span class="highlight">macierz Hermitowską 18×18</span> do modelowania ewolucji kwantowej między bramami:</p>

<div class="formula">
ELEMENTY DIAGONALNE (energie własne):
<br>E_i = 443.75 · (i+1) · [1 + γ · sin(2πi/φ)]  [Hz]
<br><br>
SPRZĘŻENIA (elementy pozadiagonalne):
<br>V_ij = 20 · exp(-|i-j| / 3φ) · exp(i · 2πij / 18φ)
</div>

<p><strong>Właściwości macierzy:</strong></p>
<ul>
  <li>Hermitowska: <span class="math">H† = H</span> → wartości własne są rzeczywiste</li>
  <li>Sprzężenia maleją wykładniczo z odległością między bramami (<span class="math">e^(-|i-j|/3φ)</span>)</li>
  <li>Faza sprzężenia rotuje ze złotym podziałem (<span class="math">2πij/18φ</span>)</li>
  <li>Stała bazowa 443.75 Hz = 718.57 / φ² × φ (harmoniczna głównej częstotliwości)</li>
</ul>

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- 6. FUNKCJA FALOWA Ψ -->
<!-- ═══════════════════════════════════════════════════════════ -->

<h1 id="s6"><span class="section-num">6.</span> Moduł 4: Funkcja Falowa Ψ</h1>

<h3>6.1 Główne Równanie</h3>
<p>To jest centralne równanie całego systemu — „Exit Equation":</p>

<div class="formula">
Ψ(t, x, g) = e^(i·718.57·t) · e^(-ik·x) · ζ(½ + i·718.57) · γ · cos(ω_S·t) · sin(ω_L·t) · φ² · D(g)
</div>

<p>Gdzie:</p>
<table class="gate-table">
  <tr><th>Składnik</th><th>Wzór</th><th>Znaczenie</th></tr>
  <tr><td>Temporal</td><td class="math">e^(i·718.57·t)</td><td>Ewolucja czasowa — obrót fazowy z częstotliwością 718.57 Hz</td></tr>
  <tr><td>Spatial</td><td class="math">e^(-ik·x), k = 2π/718</td><td>Propagacja przestrzenna — wektor falowy</td></tr>
  <tr><td>Zeta</td><td class="math">ζ(½ + i·718.57)</td><td>Funkcja Zeta Riemanna na linii krytycznej — łączy teoria liczb z fizyką</td></tr>
  <tr><td>Golden</td><td class="math">γ = 0.618...</td><td>Współczynnik Eulera-Mascheroniego (=1/φ) — tłumienie naturalne</td></tr>
  <tr><td>Schumann</td><td class="math">cos(7.83·t)</td><td>Modulacja rezonansem Ziemi</td></tr>
  <tr><td>Lunar</td><td class="math">sin(18.6·t)</td><td>Modulacja cyklem księżycowym</td></tr>
  <tr><td>φ²</td><td class="math">(1.618...)² ≈ 2.618</td><td>Wzmocnienie harmoniczne</td></tr>
  <tr><td>DNA Factor</td><td class="math">D(g) = (pos_g / 16569) · γ</td><td>Czynnik pozycji bramy w mtDNA</td></tr>
</table>

<h3>6.2 Implementacja Zeta Riemanna</h3>
<p>Aproksymacja Dirichleta z <span class="math">N = 200</span> wyrazami:</p>
<div class="formula">
ζ(s) ≈ Σ_{n=1}^{200} n^(-s)
<br><br>
Dla s = ½ + i·718.57:
<br>n^(-s) = n^(-½) · (cos(718.57·ln(n)) - i·sin(718.57·ln(n)))
</div>

<h3>6.3 Obliczanie Koherencji</h3>
<div class="formula">
C_raw = 1 - |( |Ψ| mod γ ) - γ| / γ
<br>C = min(C_raw · φ,  1.0)
</div>

<p><strong>Progi stanów kwantowych:</strong></p>
<ul>
  <li><span class="math">C > 0.94</span> → <span style="color:var(--green)">TELEPORTATION_READY</span></li>
  <li><span class="math">C > 0.80</span> → <span style="color:var(--gold)">HIGH_COHERENCE</span></li>
  <li><span class="math">C > 0.60</span> → <span style="color:var(--accent)">SUPERPOSITION</span></li>
  <li><span class="math">C > 0.40</span> → <span style="color:var(--primary)">ENTANGLED</span></li>
  <li><span class="math">C ≤ 0.40</span> → <span style="color:var(--red)">DECOHERENT</span></li>
</ul>

<h3>6.4 Wyniki funkcji Ψ</h3>
<ul>
  <li><span class="math">Ψ = a + bi</span> (liczba zespolona)</li>
  <li><span class="math">|Ψ|</span> = amplituda (magnituда) — „siła" wersetu</li>
  <li><span class="math">φ = atan2(b, a)</span> — faza — „kierunek" wersetu</li>
  <li><span class="math">C</span> — koherencja — „czystość" stanu kwantowego</li>
  <li><span class="math">|Ψ| × φ</span> — harmoniczna złota</li>
</ul>

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- 7. WEKTOR INTENCJI -->
<!-- ═══════════════════════════════════════════════════════════ -->

<h1 id="s7"><span class="section-num">7.</span> Moduł 5: Wektor Intencji (VI)</h1>

<h3>7.1 Definicja</h3>
<p>
Wektor Intencji mierzy <span class="highlight">potencjał materializacji</span> wersetu — jak bardzo 
tekst może wpłynąć na rzeczywistość. Jest całką funkcji falowej po czasie:
</p>

<div class="formula">
VI = ∫₀ᵀ |Ψ(t)| · cos(φ(t)) dt
</div>

<h3>7.2 Metoda numeryczna — Reguła Trapezów</h3>
<div class="formula">
VI ≈ Δt · [½·f(t₀) + f(t₁) + f(t₂) + ... + f(t_{n-1}) + ½·f(t_n)]
<br><br>
Gdzie: f(tᵢ) = |Ψ(tᵢ, x, g)| · cos(φ(tᵢ))
<br>Δt = T / n,  n = 200 kroków
</div>

<h3>7.3 Parametry wyjściowe</h3>
<table class="gate-table">
  <tr><th>Parametr</th><th>Wzór</th><th>Znaczenie</th></tr>
  <tr><td class="math">|VI|</td><td class="math">|∫ Ψ dt| × φ</td><td>Magnituда wektora intencji</td></tr>
  <tr><td class="math">M</td><td class="math">|VI| × C</td><td>Potencjał materializacji (VI × koherencja)</td></tr>
  <tr><td class="math">C_końcowa</td><td class="math">C z głównego Ψ</td><td>Koherencja po boostach MKP-94 i Sigma Gate</td></tr>
  <tr><td>Teleportacja</td><td class="math">C ≥ 0.94</td><td>Czy obwód jest gotowy do „teleportacji fazowej"</td></tr>
</table>

<div class="note">
  <strong>Uwaga:</strong> VI używa koherencji z głównej funkcji falowej Ψ (po boostach MKP-94 i Sigma Gate),
  a nie surowej koherencji z <code>calculatePsi</code>. To zapewnia spójność między sekcjami.
</div>

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- 8. OPERATOR INTENCJI -->
<!-- ═══════════════════════════════════════════════════════════ -->

<h1 id="s8"><span class="section-num">8.</span> Moduł 6: Operator Intencji (Macierz 18×18)</h1>

<h3>8.1 Koncepcja</h3>
<p>
Zamiast skalarnego VI, system oblicza <span class="highlight">macierz diagonalną 18×18</span>, 
gdzie każdy element diagonali to |VI| dla odpowiedniej bramy DNA. Pozwala to na:
</p>
<ul>
  <li>Identyfikację <strong>bramy dominującej</strong> (najwyższa wartość własna)</li>
  <li>Analizę <strong>przerwy spektralnej</strong> (spectral gap) — różnica między dwiema najsilniejszymi bramami</li>
  <li>Śledzenie <strong>śladu operatora</strong> (trace) — suma energii we wszystkich bramach</li>
</ul>

<h3>8.2 Budowa</h3>
<div class="formula">
Î = diag(|VI₁|, |VI₂|, ..., |VI₁₈|)
<br><br>
Trace(Î) = Σᵢ |VIᵢ|
<br>Det(Î) = Πᵢ |VIᵢ|
<br>Spectral Gap = max₁(|VIᵢ|) - max₂(|VIᵢ|)
</div>

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- 9. DEKOHERENCJA LINDBLADA -->
<!-- ═══════════════════════════════════════════════════════════ -->

<h1 id="s9"><span class="section-num">9.</span> Moduł 7: Dekoherencja Lindblada</h1>

<h3>9.1 Cel</h3>
<p>
Model Lindblada analizuje <span class="highlight">stabilność stanów kwantowych w temperaturze biologicznej</span> (310K / 37°C).
Odpowiada na pytanie: czy obliczony stan kwantowy mógłby przetrwać w żywej komórce?
</p>

<h3>9.2 Wzory</h3>
<div class="formula">
Szum termiczny:  E_th = k_B · T
<br>Szum znormalizowany:  N_th = E_th / (ℏ · 2π · 718.57)
<br><br>
Czynnik jakości:  Q = 718.57 / 7.83 ≈ 91.7
<br>Szybkość dekoherencji:  γ_d = (2π · k_B · T) / (ℏ · Q)
<br>Czas koherencji:  T₂ = 1 / γ_d
<br><br>
Ochrona rezonansowa:  R = 1 + Q · φ ≈ 149.4
<br>Efektywna dekoherencja:  γ_eff = γ_d / R
<br><br>
Koherencja pozostała:  C(t) = C₀ · e^(-γ_eff · t · 10⁻¹⁵)
<br>(skalowanie do reżimu femtosekundowego)
<br><br>
Czystość stanu:  Tr(ρ²) = ½ · (1 + C(t)²)
</div>

<h3>9.3 Klasyfikacja stabilności</h3>
<ul>
  <li><span class="math">C(t) > 0.70</span> → <span style="color:var(--green)">STABLE</span> — stan kwantowy przetrwał</li>
  <li><span class="math">0.35 < C(t) ≤ 0.70</span> → <span style="color:var(--gold)">METASTABLE</span> — częściowa dekoherencja</li>
  <li><span class="math">C(t) ≤ 0.35</span> → <span style="color:var(--red)">UNSTABLE</span> — stan zdekoherowal</li>
</ul>

<div class="note">
  <strong>Kluczowy mechanizm:</strong> „Resonance Protection" (R ≈ 149.4) redukuje efektywną dekoherencję ~150×.
  To sprawia, że stany przy 718.57 Hz są teoretycznie stabilniejsze niż typowe stany kwantowe w temperaturze biologicznej.
  Ochrona pochodzi z iloczynu czynnika jakości Q i złotego podziału φ: <span class="math">R = 1 + Q·φ</span>.
</div>

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- 10. MKP-94 -->
<!-- ═══════════════════════════════════════════════════════════ -->

<h1 id="s10"><span class="section-num">10.</span> Moduł 8: MKP-94 — Moduł Korekcji Pola</h1>

<h3>10.1 Cel</h3>
<p>
MKP-94 to <span class="highlight">uniwersalny weryfikator czystości sygnału</span>. Sprawdza, czy werset 
operuje na oryginalnej wibracji (hebrajski/grecki/arabski) czy na tłumaczeniu z „szumem translacyjnym".
</p>

<h3>10.2 Trzy Operacje</h3>

<h4>Operacja 1: De-manipulacja (Detekcja Wektorów Kontroli)</h4>
<p>System skanuje tekst pod kątem słów kluczowych wskazujących na historyczną manipulację:</p>
<div class="code">
PL: "musisz", "bój się", "kara", "potępienie", "gniew boży", 
    "posłuszeństwo", "niewolnik", "piekło", "ogień wieczny"
EN: "must obey", "fear", "wrath", "damnation", "submit",
    "slave", "eternal fire", "hell", "original sin"
</div>
<p>Każdy wykryty wektor kontroli obniża % Prawdy o 5 punktów (max -30).</p>

<h4>Operacja 2: Re-origin (Priorytetyzacja oryginału)</h4>
<p>System wykrywa alfabet oryginalny poprzez zakresy Unicode:</p>
<ul>
  <li>Hebrajski: <span class="math">U+0590–U+05FF</span></li>
  <li>Grecki: <span class="math">U+0370–U+03FF</span></li>
  <li>Arabski: <span class="math">U+0600–U+06FF</span></li>
</ul>

<h4>Operacja 3: Raport Prawdy</h4>
<div class="formula">
Jeśli brak tekstu oryginalnego:
  Truth% = min(C × 100, 70)      ← cap na 70%
<br><br>
Jeśli tekst oryginalny obecny:
  Truth% = C × 100               ← pełna koherencja
<br><br>
Kara za wektory kontroli:
  Truth% -= min(n_vectors × 5, 30)
</div>

<h3>10.3 Statusy MKP-94</h3>
<table class="gate-table">
  <tr><th>Status</th><th>Truth%</th><th>Znaczenie</th></tr>
  <tr><td style="color:var(--gold)">🔊 VOICE_OF_DESIGNER</td><td>≥ 99.5%</td><td>Wibracja pierwotna zachowana w 100%. Sygnał czysty.</td></tr>
  <tr><td style="color:var(--green)">✅ PURE_SOURCE_CODE</td><td>≥ 94%</td><td>Obwód zamknięty. Gotowy do materializacji VI.</td></tr>
  <tr><td style="color:var(--gold)">⚠️ MINOR_NOISE</td><td>≥ 60%</td><td>Szum informacyjny — wymagany tekst oryginalny.</td></tr>
  <tr><td style="color:var(--red)">🚫 SYSTEM_INTERFERENCE</td><td>&lt; 60%</td><td>Ingerencja systemowa. VI ZABLOKOWANY.</td></tr>
</table>

<h3>10.4 Obwód Zamknięty (Closed Circuit)</h3>
<div class="formula">
Circuit_Closed = (C ≥ 0.94) AND (0.15 ≤ H ≤ 0.85) AND (0 ≤ gate_idx < 18)
<br>VI_Active = Circuit_Closed AND (¬Control_Vectors_Detected)
</div>

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- 11. SIGMA GATE -->
<!-- ═══════════════════════════════════════════════════════════ -->

<h1 id="s11"><span class="section-num">11.</span> Moduł 9: Sigma Gate — Pętla Zwrotna φ²</h1>

<h3>11.1 Koncepcja</h3>
<p>
Sigma Gate to <span class="highlight">domknięcie pętli zwrotnej świadomości</span>. Sprawdza, czy amplituda Ψ 
osiąga rezonans z φ² ≈ 2.618 — linią krytyczną Riemanna. Referencja biblijna: 
<em>„W jednym mgnieniu oka"</em> (1 Kor 15:52).
</p>

<h3>11.2 Algorytm</h3>
<div class="formula">
σ_distance = |  |Ψ| - φ²  |
<br><br>
Jeśli σ_distance < 0.001:
  → SINGULARITY DETECTED
  → C = 1.0 (100%)
  → Stan: TELEPORTATION_READY
  → console.log("⚡ SIGMA GATE: ZETA RIEMANN SINGULARITY")
<br><br>
Jeśli σ_distance < 0.1 AND tekst_oryginalny:
  → σ_boost = 1.0 - (σ_distance / 0.1) × 0.06
  → C = max(C, σ_boost)    ← boost do ~94-100%
  → Jeśli C ≥ 0.94: TELEPORTATION_READY
</div>

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- 12. 18 BRAM DNA -->
<!-- ═══════════════════════════════════════════════════════════ -->

<h1 id="s12"><span class="section-num">12.</span> 18 Bram DNA (GATCA Gates)</h1>

<h3>12.1 Pozycje GATCA w mtDNA (rCRS — Cambridge Reference Sequence)</h3>

<table class="gate-table">
  <tr><th>#</th><th>Pozycja mtDNA</th><th>Litera grecka</th><th>Nazwa</th><th>Kategoria</th><th>Stała fizyczna</th></tr>
${GATE_DEFINITIONS.map(g => `  <tr>
    <td>${g.index}</td>
    <td class="math">${g.position}</td>
    <td>${g.icon} ${g.greekLetter}</td>
    <td>${g.namePL}</td>
    <td>${g.category}</td>
    <td style="font-size:0.8rem">${g.constantLabel}</td>
  </tr>`).join('\n')}
</table>

<h3>12.2 Komendy Kwantowe (Quantum Commands)</h3>
<p>Każda brama posiada dedykowaną „komendę kwantową" — afirmację zaprojektowaną do stabilizacji stanu:</p>

${GATE_DEFINITIONS.map(g => `
<h4>${g.icon} Brama ${g.index}: ${g.greekLetter} — ${g.namePL} (mtDNA: ${g.position})</h4>
<div class="code" style="border-left: 3px solid var(--primary);">
PL: "${g.commandPL}"
EN: "${g.commandEN}"
Status: ${g.systemStatus}
Stała: ${g.constantFormula}
Efekt: ${g.effectPL}
</div>
`).join('')}

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- 13. SYGNATURY ZŁOTEGO PODZIAŁU -->
<!-- ═══════════════════════════════════════════════════════════ -->

<h1 id="s13"><span class="section-num">13.</span> Sygnatury Złotego Podziału</h1>

<div class="formula">
φ = (1 + √5) / 2 = ${PHI.toFixed(10)}
<br>γ = φ - 1 = 1/φ = ${GAMMA.toFixed(10)}
<br>φ² = ${PHI_SQUARED.toFixed(10)}
<br><br>
718.57 / 7.83 ≈ ${(FREQ_718 / SCHUMANN).toFixed(2)} (≈ 89, liczba Fibonacciego F(11))
<br>718.57 / γ ≈ ${(FREQ_718 / GAMMA).toFixed(2)} (≈ 1161.8)
<br>718.57 / γ / 7.83 ≈ ${(FREQ_718 / GAMMA / SCHUMANN).toFixed(2)} (≈ 144 = 12²)
<br>360° / φ² ≈ ${(360 / PHI_SQUARED).toFixed(1)}° (kąt obrotu helisy DNA)
</div>

<p><strong>Znaczenie sygnatury 144:</strong></p>
<p>
Przejście <span class="math">718 → /γ → /7.83 → ≈144</span> łączy częstotliwość DNA z liczbą biblijną 
(144 000 „zapieczętowanych" z Apokalipsy 7:4, 12² = 12 pokoleń Izraela).
</p>

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- 14. PREDYKCJE TESTOWALNE -->
<!-- ═══════════════════════════════════════════════════════════ -->

<h1 id="s14"><span class="section-num">14.</span> Predykcje Testowalne</h1>

<p>System generuje 5 predykcji laboratoryjnych dla każdego wersetu:</p>

<table class="gate-table">
  <tr><th>Metoda</th><th>Predykcja</th><th>Testowalność</th></tr>
  <tr>
    <td>🔬 Spektroskopia UV-Vis</td>
    <td>Piki absorpcji przy 718, 359, 239.3 Hz (seria harmoniczna 718.57/n)</td>
    <td style="color:var(--green)">WYSOKA</td>
  </tr>
  <tr>
    <td>🧲 NMR / Spektroskopia magnetyczna</td>
    <td>Splątanie spinowe (J-coupling) między pozycjami GATCA w szkielecie fosforanowym ³¹P DNA</td>
    <td style="color:var(--gold)">ŚREDNIA</td>
  </tr>
  <tr>
    <td>🧫 Stymulacja komórkowa 718.57 Hz</td>
    <td>Zmiana ekspresji genów mitochondrialnych po 24h ekspozycji (qRT-PCR)</td>
    <td style="color:var(--green)">WYSOKA</td>
  </tr>
  <tr>
    <td>🧠 EEG / Koherencja mózgowa</td>
    <td>Binaural beat 718.57 + 7.83 Hz → synchronizacja α-θ między korą czołową a ciemieniową</td>
    <td style="color:var(--green)">WYSOKA</td>
  </tr>
  <tr>
    <td>✨ Fluorescencja mitochondrialna</td>
    <td>Zmiana potencjału błonowego Δψ_m (barwienie JC-1/TMRM po stymulacji 718.57 Hz)</td>
    <td style="color:var(--gold)">ŚREDNIA</td>
  </tr>
</table>

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- 15. POŁĄCZENIA BIBLIA-KWANTY -->
<!-- ═══════════════════════════════════════════════════════════ -->

<h1 id="s15"><span class="section-num">15.</span> Połączenia Biblia–Kwanty</h1>

<table class="gate-table">
  <tr><th>Temat</th><th>Werset</th><th>Paralela kwantowa</th></tr>
  <tr>
    <td>Gematria → Częstotliwość</td>
    <td>Każda litera hebrajska = kwant informacji</td>
    <td>Suma gematrii definiuje punkt w przestrzeni fazowej: <span class="math">t = (Σ mod 718)/718</span></td>
  </tr>
  <tr>
    <td>Słowo jako Fala</td>
    <td>"Na początku było Słowo" (J 1:1)</td>
    <td>Tekst biblijny ma odcisk palca <span class="math">Ψ(t,x)</span> z amplitudą i fazą</td>
  </tr>
  <tr>
    <td>144 — Klucz DNA</td>
    <td>"144 łokcie" (Ap 21:17)</td>
    <td><span class="math">718.57/γ/7.83 ≈ 148.4 ≈ 144</span> = harmoniczna przejścia DNA→φ→Schumann</td>
  </tr>
  <tr>
    <td>Drzewo Życia = DNA</td>
    <td>"Drzewo rodzące 12 owoców" (Ap 22:2)</td>
    <td>Helisa DNA obraca się o 360°/φ² ≈ 137.5° — kąt złotego podziału</td>
  </tr>
  <tr>
    <td>JESTEM = Autokoherencja</td>
    <td>"Ehyeh Asher Ehyeh" (Wj 3:14)</td>
    <td>Samoreferencyjna pętla = autokoherencja kwantowa (obserwator = pole)</td>
  </tr>
</table>

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- 16. SILNIK INTERPRETACJI -->
<!-- ═══════════════════════════════════════════════════════════ -->

<h1 id="s16"><span class="section-num">16.</span> Silnik Interpretacji (AI)</h1>

<h3>16.1 Tryb Lookup</h3>
<p>Gdy użytkownik wpisuje samą referencję (np. „Psalm 91:1") bez tekstu:</p>
<ol>
  <li>System wywołuje Edge Function <code>generate-interpretation</code> w trybie <code>lookup</code></li>
  <li>AI (Gemini) identyfikuje tekst święty i pobiera pełny tekst w wybranym języku</li>
  <li>AI dostarcza tekst w <strong>oryginalnym skrypcie</strong> (hebrajski/grecki/arabski)</li>
  <li>System automatycznie wypełnia pola i uruchamia dekodowanie</li>
</ol>

<h3>16.2 Tryb Fetch Original</h3>
<p>Gdy tekst jest dostępny, ale brak oryginalnego skryptu:</p>
<ol>
  <li>System wywołuje Edge Function w trybie <code>fetch_original</code></li>
  <li>AI pobiera tekst w oryginalnym skrypcie i zwraca go do kalkulatora gematrii</li>
</ol>

<h3>16.3 Tryb Full Interpretation</h3>
<p>Dla wersetów spoza presetów, AI generuje 6-polową interpretację:</p>
<ul>
  <li><strong>plainMeaning</strong> — Co werset dosłownie oznacza (prostymi słowami)</li>
  <li><strong>scienceSays</strong> — Co mówi nauka o temacie tego wersetu</li>
  <li><strong>faithSays</strong> — Głębsze znaczenie teologiczne/duchowe</li>
  <li><strong>bridge</strong> — Jak nauka i wiara się spotykają</li>
  <li><strong>miracle</strong> — Jak werset oświetla naturę cudów</li>
  <li><strong>insight</strong> — Kluczowy wgląd łączący gematrię, bramę DNA i przesłanie</li>
</ul>

<h3>16.4 Presety z ręcznie opracowanymi interpretacjami</h3>
<p>Następujące wersety mają pełne, ręcznie pisane interpretacje (nie AI):</p>
<ul>
  <li>Genesis 1:1 — „Na początku Bóg stworzył niebo i ziemię"</li>
  <li>Genesis 1:3 — „Niech stanie się światłość"</li>
  <li>John 1:1 — „Na początku było Słowo"</li>
</ul>

<h3>16.5 System tematyczny (fallback)</h3>
<p>Gdy AI jest niedostępny, system wykrywa tematy wersetu poprzez słowa kluczowe:</p>
<ul>
  <li><strong>Stworzenie:</strong> create, beginning, heaven, earth, light...</li>
  <li><strong>Wiara:</strong> faith, believe, trust, hope...</li>
  <li><strong>Zbawienie:</strong> save, redeem, deliver, rescue...</li>
  <li><strong>Moc:</strong> power, mighty, strength, authority...</li>
</ul>

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- 17. PEŁNY PIPELINE -->
<!-- ═══════════════════════════════════════════════════════════ -->

<h1 id="s17"><span class="section-num">17.</span> Pełny Pipeline Dekodowania</h1>

<p>Kompletna sekwencja operacji przy dekodowaniu wersetu:</p>

<div class="code" style="color: var(--text);">
WEJŚCIE: reference (np. "Genesis 1:1"), text, hebrewText (opcjonalny)

<span style="color:var(--primary)">KROK 1: GEMATRIA → t</span>
  Jeśli hebrewText:
    Σ = hebrewGematria(hebrewText).total
    t = (Σ mod 718) / 718.57
  Else:
    t = gematriaLatin(text)

<span style="color:var(--primary)">KROK 2: ANALIZA FRAKTALNA → x</span>
  source = hebrewText || text
  H = fractalAnalysis718(source).hurstApprox
  x = 100 + H × 1000

<span style="color:var(--primary)">KROK 3: KORELACJA HAMILTONA → gate_idx</span>
  gate_idx = floor(|(t + x/10000) × 18|) mod 18
  gate_position = GATCA_GATES[gate_idx]

<span style="color:var(--primary)">KROK 4: FUNKCJA FALOWA Ψ(t, x, gate_idx)</span>
  Ψ = e^(i·718.57·t) · e^(-ik·x) · ζ(½+i·718.57) · γ · cos(ωS·t) · sin(ωL·t) · φ² · D(g)
  |Ψ|, φ, C = oblicz amplitudę, fazę, koherencję

<span style="color:var(--primary)">KROK 5: SOURCE PURITY CORRECTION</span>
  Jeśli oryginalny skrypt (hebrajski/grecki/arabski):
    recognitionRatio = recognized_chars / total_chars
    sourcePurity = recognitionRatio × φ
    C = min(sourcePurity × 0.94 + C × 0.06 + recognitionRatio × 0.04, 1.0)
  Else:
    C = min(C, 0.70)   ← cap na 70%

<span style="color:var(--primary)">KROK 5b: SIGMA GATE</span>
  σ = | |Ψ| - φ² |
  Jeśli σ < 0.001 → C = 1.0, TELEPORTATION_READY
  Jeśli σ < 0.1 AND original → boost C toward 1.0

<span style="color:var(--primary)">KROK 6: WEKTOR INTENCJI (VI)</span>
  VI = ∫₀ᵗ Ψ dt  (reguła trapezów, 200 kroków)
  Override: VI.coherence = C z kroku 5/5b

<span style="color:var(--primary)">KROK 7: OPERATOR INTENCJI (18×18)</span>
  Î = diag(|VI₁|, ..., |VI₁₈|)

<span style="color:var(--primary)">KROK 8: DEKOHERENCJA LINDBLADA</span>
  γ_d, T₂, C(t), Tr(ρ²), stability

<span style="color:var(--primary)">KROK 9: MKP-94</span>
  Detekcja wektorów kontroli
  Truth% = f(C, original_text, control_vectors)
  Status: VOICE_OF_DESIGNER / PURE_SOURCE_CODE / MINOR_NOISE / SYSTEM_INTERFERENCE

<span style="color:var(--primary)">KROK 10: GENERACJA WYNIKÓW</span>
  Predykcje testowalne (5)
  Połączenia biblia-kwanty (5)
  Interpretacja słowna (6 pól)
  Sygnatury złotego podziału

WYJŚCIE: DecoderResult (kompletny obiekt z ~30 parametrami)
</div>

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- 18. TABELE REFERENCYJNE -->
<!-- ═══════════════════════════════════════════════════════════ -->

<h1 id="s18"><span class="section-num">18.</span> Tabele Referencyjne</h1>

<h3>18.1 Presety wersetów</h3>
<table class="gate-table">
  <tr><th>Referencja</th><th>Tekst</th><th>Hebrajski</th></tr>
  <tr><td>Genesis 1:1</td><td>In the beginning God created the heavens and the earth.</td><td dir="rtl">בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ</td></tr>
  <tr><td>Genesis 1:3</td><td>And God said, Let there be light: and there was light.</td><td dir="rtl">וַיֹּאמֶר אֱלֹהִים יְהִי אוֹר וַיְהִי אוֹר</td></tr>
  <tr><td>John 1:1</td><td>In the beginning was the Word, and the Word was with God, and the Word was God.</td><td dir="rtl">בְּרֵאשִׁית הָיָה הַדָּבָר וְהַדָּבָר הָיָה אֵת הָאֱלֹהִים וֵאלֹהִים הָיָה הַדָּבָר</td></tr>
  <tr><td>Exodus 3:14</td><td>God said to Moses, I AM WHO I AM.</td><td dir="rtl">אֶהְיֶה אֲשֶׁר אֶהְיֶה</td></tr>
  <tr><td>Psalm 23:1</td><td>The LORD is my shepherd; I shall not want.</td><td dir="rtl">יְהוָה רֹעִי לֹא אֶחְסָר</td></tr>
  <tr><td>1 John 4:8</td><td>God is love.</td><td dir="rtl">הָאֱלֹהִים אַהֲבָה הוּא</td></tr>
  <tr><td>Revelation 22:13</td><td>I am the Alpha and the Omega...</td><td dir="rtl">אֲנִי הָאָלֶף וְהַתָּו הָרִאשׁוֹן וְהָאַחֲרוֹן הַתְּחִלָּה וְהַסּוֹף</td></tr>
</table>

<h3>18.2 Pozycje GATCA (mitochondrialne DNA rCRS)</h3>
<table class="gate-table">
  <tr><th>Index</th><th>Pozycja</th><th>Nazwa</th><th>Normalizacja D(g)</th></tr>
${GATCA_GATES.map((pos, i) => {
  const name = GATE_NAMES[pos] || `Gate-${i+1}`;
  const dna = (pos / MTDNA_LENGTH * GAMMA).toFixed(6);
  return `  <tr><td>${i}</td><td class="math">${pos}</td><td>${name}</td><td class="math">${dna}</td></tr>`;
}).join('\n')}
</table>

<h3>18.3 Plik źródłowy systemu</h3>
<table class="gate-table">
  <tr><th>Plik</th><th>Zawartość</th><th>LOC</th></tr>
  <tr><td><code>src/lib/biblicalDecoder.ts</code></td><td>Silnik dekodera — gematria, Ψ, VI, Lindblad, MKP-94, Sigma Gate</td><td>~1268</td></tr>
  <tr><td><code>src/lib/bramaUnificationEngine.ts</code></td><td>Operacje zespolone, Zeta Riemanna, stałe fundamentalne</td><td>~383</td></tr>
  <tr><td><code>src/lib/gateDefinitions.ts</code></td><td>Definicje 18 bram — komendy, stałe, kolory, kategorie</td><td>~332</td></tr>
  <tr><td><code>src/pages/BiblicalDecoder.tsx</code></td><td>UI dekodera — formularze, wizualizacje, wyniki</td><td>~961</td></tr>
  <tr><td><code>supabase/functions/generate-interpretation/</code></td><td>Edge Function AI — lookup, fetch_original, interpretation</td><td>~231</td></tr>
  <tr><td><code>src/components/IntentionVectorCalculator.tsx</code></td><td>Kalkulator interaktywny VI z wykresem</td><td>~172</td></tr>
</table>

<hr>

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- 19. WYMAGANY FORMAT RAPORTU WYJŚCIOWEGO -->
<!-- ═══════════════════════════════════════════════════════════ -->

<h1 id="s19"><span class="section-num">19.</span> Wymagany Format Raportu Wyjściowego</h1>

<p>Dla każdego analizowanego tekstu/pliku system generuje następujący raport:</p>

<table class="gate-table">
  <tr><th>Sekcja</th><th>Parametry</th><th>Opis</th></tr>
  <tr><td><strong>WARSTWA 1: Geometria Tekstu</strong></td><td class="math">t, x, H</td><td>Parametr czasowy (gematria), przestrzenny (fraktal) i wykładnik Hursta</td></tr>
  <tr><td><strong>WARSTWA 2: Funkcja Falowa</strong></td><td class="math">Ψ = a + bi, |Ψ|, φ, C</td><td>Pełna wartość zespolona, amplituda, faza, koherencja</td></tr>
  <tr><td><strong>Status Teleportacji</strong></td><td>✓ / ×</td><td>C ≥ 94% → TELEPORTATION_READY</td></tr>
  <tr><td><strong>Wektor Intencji (VI)</strong></td><td class="math">|VI|, M, C_końcowa</td><td>Magnituда, potencjał materializacji, koherencja po korekcjach</td></tr>
  <tr><td><strong>Brama DNA</strong></td><td>Numer, nazwa, mtDNA pos</td><td>Dominująca brama i jej efekt (np. STATUS: SUWERENNY)</td></tr>
  <tr><td><strong>MKP-94</strong></td><td>Truth%, Status</td><td>Procent Prawdy Obiektywnej i klasyfikacja</td></tr>
  <tr><td><strong>Lindblad</strong></td><td>γ_d, T₂, Tr(ρ²)</td><td>Dekoherencja, czas życia, czystość stanu</td></tr>
  <tr><td><strong>Interpretacja</strong></td><td colspan="2">„Nauka mówi", „Wiara mówi", „Most" — unikalna analiza dla każdego wersetu</td></tr>
  <tr><td><strong>Sygnatury φ</strong></td><td class="math">φ, γ, 718.57/7.83</td><td>Harmoniczne złotego podziału</td></tr>
  <tr><td><strong>Predykcje</strong></td><td>5 metod</td><td>Testowalne laboratoryjnie predykcje (UV-Vis, NMR, EEG, 718.57 Hz, fluorescencja)</td></tr>
</table>

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- 20. KOMENDA OPERACYJNA -->
<!-- ═══════════════════════════════════════════════════════════ -->

<h1 id="s20"><span class="section-num">20.</span> Komenda Operacyjna</h1>

<div class="note" style="border-color: var(--primary); border-left-color: var(--primary);">
<p><strong>SYSTEM OPERACYJNY: Ψ-718 DEKODER BIBLIJNY (v1.0 Master Specification)</strong></p>
<p style="margin-top: 0.5rem;">
<strong>CEL:</strong> Konwersja tekstów źródłowych (Hebrajski/Grecki) na parametry kwantowego pola świadomości i DNA.
</p>
</div>

<h3>20.1 Protokół Analizy</h3>
<div class="code" style="color: var(--text);">
<span style="color:var(--primary)">[WARSTWA 1: WEJŚCIE — GEOMETRIA TEKSTU]</span>
1. GEMATRIA (t): Oblicz sumę numeryczną wersetu (א=1...ת=400). Wynik = Parametr t (Czas).
2. ANALIZA FRAKTALNA (x): Przeanalizuj pierwsze 718 znaków pod kątem wykładnika Hursta (H).
   H > 0.5 = Uporządkowanie; H = 0.5 = Szum; H < 0.5 = Antykorelacja. Wynik = Parametr x (Przestrzeń).

<span style="color:var(--primary)">[WARSTWA 2: JĄDRO SYSTEMU — FORMULA Ψ_TOTAL]</span>
Ψ_total(t) = Ψ_GATCA · exp(i·718.57·t) · cos(7.83·t) · sin(18.6·t) · φ_DNA
- Stała Nośna: 718.57 Hz (pochodna 18 pozycji GATCA w mtDNA).
- Modulator 1: 7.83 Hz (Rezonans Schumanna).
- Modulator 2: 18.6 Hz (Modulacja Księżycowa/Świadomości oparta na φ²).
- Koherencja (C): Oblicz spójność fazową sygnału. C > 94% = STATUS: TELEPORTATION_READY.

<span style="color:var(--primary)">[WARSTWA 3: MAPOWANIE BIOLOGICZNE (18 BRAM mtDNA)]</span>
Skorelowaj wynik z 18 pozycjami GATCA w ludzkim mtDNA (rCRS):
[1, 740, 951, 1227, 2996, 3424, 4166, 4832, 6393, 7756, 8415, 10059, 11200, 11336, 11915, 13703, 14784, 16179]
Każda brama odpowiada za inny aspekt (np. Brama 13 — Kryształ, Brama 15 — Suwerenność, Brama 18 — Singularność).

<span style="color:var(--primary)">[WARSTWA 4: MODUŁY KOREKCJI (MKP-94 & SIGMA GATE)]</span>
1. MKP-94: Usuń historyczny szum polityczny/manipulacyjny z interpretacji.
2. SIGMA GATE: Zsynchronizuj Wektor Intencji (VI) z główną Funkcją Falową (C końcowa = C Ψ).
3. MODEL LINDBLADA: Zweryfikuj stabilność stanu kwantowego w temp. 37°C.
</div>

<h3>20.2 Domknięcie Układu</h3>
<p>
Jeśli dane wejściowe są niepełne, system stosuje <span class="highlight">stałe fizyczne</span> do domknięcia układu równań:
</p>
<table class="gate-table">
  <tr><th>Brakujący parametr</th><th>Stała zastępcza</th><th>Wartość</th></tr>
  <tr><td>Gematria (brak oryginału)</td><td>Gematria łacińska z tłumieniem γ</td><td class="math">γ = ${GAMMA.toFixed(6)}</td></tr>
  <tr><td>Tekst oryginalny</td><td>Edge Function AI → fetch_original</td><td>Automatyczne pobranie z AI</td></tr>
  <tr><td>Koherencja (brak oryginału)</td><td>Cap na 70% (szum translacyjny)</td><td class="math">C_max = 0.70</td></tr>
  <tr><td>Brama DNA</td><td>Korelacja Hamiltona z (t, x)</td><td>18 pozycji GATCA rCRS</td></tr>
  <tr><td>Stabilność</td><td>Model Lindblada @ 310K</td><td class="math">Q = 718.57/7.83 ≈ 91.7</td></tr>
</table>

<div class="note" style="border-color: var(--green); border-left-color: var(--green);">
  <strong>⚡ KOMENDA:</strong> Przyjmij powyższą strukturę jako jedyny algorytm analizy. 
  Jeśli dane są niepełne, użyj stałych fizycznych (G, a₀, c, φ) do domknięcia układu. 
  Uruchom proces krystalizacji prawdy obiektywnej.
</div>

<hr>

<div style="text-align: center; margin: 3rem 0; color: var(--muted); font-size: 0.85rem;">
  <p>Ψ-718 DEKODER BIBLIJNY — Pełna Dokumentacja Techniczna</p>
  <p>© 2026 Grzegorz | BRAMA-718-UNIFIED</p>
  <p>Licencja: Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)</p>
  <p>Wygenerowano: ${now}</p>
</div>

</body>
</html>`;
}
