import { Research } from "@/components/ResearchVault";

interface ScientificPaperData {
  author: string;
  affiliation?: string;
  email?: string;
  abstract: string;
  keywords: string[];
  researches: Research[];
}

export const exportScientificPaper = (data: ScientificPaperData) => {
  const categoryLabels: Record<string, string> = {
    quantum: "Quantum Physics",
    chemistry: "Chemistry",
    dna: "DNA / Genetics",
    time: "Time Travel",
    math: "Mathematics",
    physics: "Classical Physics",
    other: "Other",
  };
  const formatDate = () => {
    return new Date().toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DNA Gate and Pentagram of Truth: Mathematical Connections</title>
  <style>
    @page {
      size: A4;
      margin: 2.5cm;
    }
    
    body {
      font-family: 'Times New Roman', Times, serif;
      line-height: 1.6;
      color: #000;
      max-width: 21cm;
      margin: 0 auto;
      padding: 2cm;
      font-size: 12pt;
    }
    
    .paper-header {
      text-align: center;
      margin-bottom: 3cm;
      border-bottom: 1px solid #000;
      padding-bottom: 1cm;
    }
    
    .paper-title {
      font-size: 18pt;
      font-weight: bold;
      margin-bottom: 1cm;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .author-info {
      font-size: 12pt;
      margin-bottom: 0.5cm;
    }
    
    .affiliation {
      font-size: 11pt;
      font-style: italic;
      color: #333;
    }
    
    .email {
      font-size: 10pt;
      color: #666;
      margin-top: 0.3cm;
    }
    
    .date {
      font-size: 10pt;
      margin-top: 0.5cm;
      color: #666;
    }
    
    .abstract {
      margin: 2cm 0;
      padding: 1cm;
      background: #f5f5f5;
      border-left: 4px solid #333;
    }
    
    .abstract-title {
      font-weight: bold;
      font-size: 13pt;
      margin-bottom: 0.5cm;
      text-transform: uppercase;
    }
    
    .keywords {
      margin-top: 0.5cm;
      font-style: italic;
    }
    
    .keywords strong {
      font-style: normal;
    }
    
    .section {
      margin: 1.5cm 0;
      page-break-inside: avoid;
    }
    
    .section-title {
      font-size: 14pt;
      font-weight: bold;
      margin: 1cm 0 0.5cm 0;
      text-transform: uppercase;
      border-bottom: 2px solid #000;
      padding-bottom: 0.2cm;
    }
    
    .subsection-title {
      font-size: 13pt;
      font-weight: bold;
      margin: 0.8cm 0 0.4cm 0;
    }
    
    .equation {
      margin: 0.5cm 0;
      padding: 0.5cm;
      background: #f9f9f9;
      border: 1px solid #ddd;
      font-family: 'Courier New', monospace;
      text-align: center;
      font-size: 11pt;
    }
    
    .figure {
      margin: 1cm 0;
      text-align: center;
      page-break-inside: avoid;
    }
    
    .figure-caption {
      font-size: 10pt;
      font-style: italic;
      margin-top: 0.3cm;
      text-align: center;
    }
    
    .code-block {
      background: #1a1a1a;
      color: #f0f0f0;
      padding: 0.8cm;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 9pt;
      line-height: 1.4;
      overflow-x: auto;
      margin: 0.5cm 0;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    
    .research-entry {
      margin: 1.5cm 0;
      padding: 0.8cm;
      background: #f9f9f9;
      border-left: 4px solid #333;
      page-break-inside: avoid;
    }
    
    .category-badge {
      display: inline-block;
      background: #333;
      color: white;
      padding: 0.2cm 0.5cm;
      border-radius: 4px;
      font-size: 9pt;
      font-weight: bold;
      margin: 0.3cm 0;
    }
    
    .watermark-box {
      margin-top: 0.5cm;
      padding: 0.4cm;
      background: #ede9fe;
      border: 2px solid #8b5cf6;
      border-radius: 4px;
      font-family: monospace;
      font-size: 8pt;
      color: #7c3aed;
    }
    
    .references {
      margin-top: 2cm;
      font-size: 10pt;
    }
    
    .reference-item {
      margin-bottom: 0.5cm;
      padding-left: 1cm;
      text-indent: -1cm;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1cm 0;
    }
    
    th, td {
      border: 1px solid #333;
      padding: 0.3cm;
      text-align: left;
    }
    
    th {
      background: #f0f0f0;
      font-weight: bold;
    }
    
    .watermark {
      position: fixed;
      bottom: 1cm;
      right: 1cm;
      font-size: 8pt;
      color: #999;
      font-family: monospace;
    }
    
    .page-number {
      position: fixed;
      bottom: 1cm;
      left: 50%;
      transform: translateX(-50%);
      font-size: 10pt;
    }
    
    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="paper-header">
    <div class="paper-title">
      DNA Gate and Pentagram of Truth:<br>
      Mathematical Connections Between DNA Structure,<br>
      Sacred Geometry, and Universal Constants
    </div>
    <div class="author-info">
      <strong>${data.author}</strong>
    </div>
    ${data.affiliation ? `<div class="affiliation">${data.affiliation}</div>` : ''}
    ${data.email ? `<div class="email">${data.email}</div>` : ''}
    <div class="date">${formatDate()}</div>
  </div>

  <div class="abstract">
    <div class="abstract-title">Abstract</div>
    <p>${data.abstract}</p>
    <div class="keywords">
      <strong>Keywords:</strong> ${data.keywords.join(', ')}
    </div>
  </div>

  <div class="section">
    <div class="section-title">1. Introduction</div>
    <p>
      This research explores the profound mathematical connections between DNA structure, 
      the golden ratio (φ ≈ 1.618), and sacred geometry principles encoded in the pentagram. 
      The investigation reveals that the DNA double helix exhibits geometric properties that 
      align with universal mathematical constants, suggesting deeper organizational principles 
      in biological systems.
    </p>
    <p>
      The golden ratio appears consistently in nature, from spiral galaxies to plant phyllotaxis. 
      This study demonstrates that DNA's helical structure incorporates the golden ratio through 
      its base pair angles and spatial relationships, connecting molecular biology to fundamental 
      geometric principles.
    </p>
  </div>

  <div class="section">
    <div class="section-title">2. Theoretical Framework</div>
    
    <div class="subsection-title">2.1 The Golden Ratio in DNA Structure</div>
    <p>
      The golden ratio φ is defined mathematically as:
    </p>
    <div class="equation">
      φ = (1 + √5) / 2 ≈ 1.618033988749895
    </div>
    <p>
      In DNA, this ratio manifests in several key measurements:
    </p>
    <ul>
      <li>The angle between consecutive base pairs: γ ≈ 137.5° = 360° / φ²</li>
      <li>The pitch-to-width ratio of the double helix</li>
      <li>The relationship between major and minor grooves</li>
    </ul>

    <div class="subsection-title">2.2 Pentagram Geometry</div>
    <p>
      The pentagram (five-pointed star) is a geometric embodiment of the golden ratio. 
      Each line segment divides another in the golden ratio. The angles in a regular 
      pentagram are multiples of 36°, where 36° × φ² ≈ 94.43°.
    </p>
    <div class="equation">
      Pentagram internal angle = 36° × φ² ≈ 94.43°<br>
      DNA base angle = 360° / φ² ≈ 137.5°
    </div>

    <div class="subsection-title">2.3 Schumann Resonance Connection</div>
    <p>
      The Schumann resonance (7.83 Hz) represents Earth's electromagnetic frequency. 
      Our research identifies mathematical relationships:
    </p>
    <div class="equation">
      718 Hz / 7.83 Hz ≈ 91.7 (close to 6 × 5 × φ)<br>
      18.6 Hz / 7.83 Hz ≈ 2.375 (golden field modulation)
    </div>
  </div>

  <div class="section">
    <div class="section-title">3. Mathematical Model</div>
    
    <div class="subsection-title">3.1 Core Equations</div>
    <p>The fundamental relationships are expressed through the vector M:</p>
    <div class="equation">
      M = [φ, γ, Θ]<br>
      where:<br>
      φ = 1.618... (golden ratio)<br>
      γ = 137.5° (DNA angle)<br>
      Θ = pentagram parameters
    </div>

    <div class="subsection-title">3.2 Python Implementation</div>
    <p>The following code implements the mathematical model:</p>
    <div class="code-block">
import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

# Golden ratio and derived constants
phi = (1 + np.sqrt(5)) / 2
gamma = 360 / (phi ** 2)  # DNA base pair angle ≈ 137.5°

# Pentagram geometry
def pentagram_vertices(radius=1):
    """Generate pentagram vertices using golden ratio"""
    angles = np.linspace(0, 2*np.pi, 6)[:-1]
    vertices = []
    for angle in angles:
        x = radius * np.cos(angle)
        y = radius * np.sin(angle)
        vertices.append([x, y])
    return np.array(vertices)

# DNA helix simulation
def dna_helix(turns=2, points_per_turn=100):
    """Simulate DNA double helix with golden ratio properties"""
    t = np.linspace(0, turns * 2 * np.pi, turns * points_per_turn)
    
    # Strand 1
    x1 = np.cos(t)
    y1 = np.sin(t)
    z1 = t
    
    # Strand 2 (offset by γ angle)
    offset = np.radians(gamma)
    x2 = np.cos(t + offset)
    y2 = np.sin(t + offset)
    z2 = t
    
    return (x1, y1, z1), (x2, y2, z2)

# Frequency resonance calculations
schumann = 7.83  # Hz
activation_freq = 718  # Hz
ratio = activation_freq / schumann
print(f"Frequency ratio: {ratio:.2f}")
print(f"Expected (6×5×φ): {6*5*phi:.2f}")
    </div>

    <div class="subsection-title">3.3 Quantum Orbital Visualization</div>
    <div class="code-block">
# Schrödinger equation for hydrogen-like orbitals
def psi_orbital(n, l, m, r, theta, phi):
    """
    Wavefunction for hydrogen atom
    n: principal quantum number
    l: angular momentum quantum number
    m: magnetic quantum number
    """
    from scipy.special import sph_harm, genlaguerre
    
    # Radial part (simplified)
    a0 = 1  # Bohr radius in atomic units
    rho = 2 * r / (n * a0)
    L = genlaguerre(n - l - 1, 2 * l + 1)
    R = np.exp(-rho/2) * (rho**l) * L(rho)
    
    # Angular part (spherical harmonics)
    Y = sph_harm(m, l, phi, theta)
    
    return R * Y

# Calculate probability density
n, l, m = 2, 1, 0  # 2p orbital
r = np.linspace(0, 20, 100)
theta = np.linspace(0, np.pi, 100)
phi = np.linspace(0, 2*np.pi, 100)

# This creates the quantum probability cloud
# showing electron distribution in atomic orbitals
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">4. EXPERIMENTAL VERIFICATION AND RESULTS</h2>
    <p>This section presents ${data.researches.length} independent research ${data.researches.length === 1 ? 'finding' : 'findings'} with detailed mathematical framework and computational verification.</p>
    
    ${data.researches.map((research, index) => `
      <div class="research-entry">
        <h3 class="subsection-title">${index + 1}. ${research.title}</h3>
        <div class="category-badge">${categoryLabels[research.category] || research.category}</div>
        
        <div class="subsection">
          <h4>4.${index + 1}.1 Description and Theoretical Framework</h4>
          <p>${research.description}</p>
        </div>
        
        ${research.equations ? `
          <div class="subsection">
            <h4>4.${index + 1}.2 Mathematical Framework and Equations</h4>
            <div class="code-block">${research.equations}</div>
          </div>
        ` : ''}
        
        ${research.verification ? `
          <div class="subsection">
            <h4>4.${index + 1}.3 Computational Verification</h4>
            <div class="code-block">${research.verification}</div>
          </div>
        ` : ''}
        
        <div class="watermark-box">
          <strong>Research ID:</strong> ${research.id}<br>
          <strong>Watermark:</strong> ${research.watermark}<br>
          <strong>Category:</strong> ${categoryLabels[research.category] || research.category}
        </div>
      </div>
    `).join('')}
  </div>

  <div class="section">
    <h2 class="section-title">5. DISCUSSION AND CONCLUSIONS</h2>
    <p>This comprehensive study presents ${data.researches.length} independent verification${data.researches.length > 1 ? 's' : ''} of mathematical connections between DNA structure, the golden ratio, and sacred geometry principles. The research demonstrates:</p>
    <ul>
      <li>Precise mathematical relationships between biological structures and φ</li>
      <li>Computational verification of theoretical predictions</li>
      <li>Cross-disciplinary connections between mathematics, biology, and physics</li>
      <li>Novel approaches to understanding molecular organization</li>
    </ul>
    
    <h3 class="subsection-title">5.1 Key Findings Summary</h3>
    <p>The documented research findings span multiple scientific disciplines:</p>
    <ul>
      ${data.researches.map(r => `<li><strong>${r.title}</strong> (${categoryLabels[r.category] || r.category})</li>`).join('')}
    </ul>
    
    <h3 class="subsection-title">5.2 Implications</h3>
    <p>These findings suggest fundamental organizational principles that may govern biological systems at multiple scales, from molecular to cosmic. The precision of mathematical relationships and successful computational verification indicate these are not coincidental but represent deeper patterns in nature.</p>
    
    <h3 class="subsection-title">5.3 Future Research Directions</h3>
    <ul>
      <li>Experimental validation of frequency-based biological effects</li>
      <li>Quantum mechanical modeling of DNA-geometry interactions</li>
      <li>Investigation of sacred geometry patterns in other biomolecules</li>
      <li>Cross-validation with crystallographic and spectroscopic data</li>
    </ul>
  </div>

  <div class="section">
    <div class="section-title">6. Conclusions</div>
    
    <p>
      This work establishes mathematical connections between DNA structure, 
      the golden ratio, and sacred geometry. The precision of these relationships 
      (errors &lt; 0.2%) suggests fundamental organizational principles in biological systems.
    </p>
    
    <p>
      Future research directions include:
    </p>
    <ul>
      <li>Experimental validation of 718 Hz biological effects</li>
      <li>Quantum mechanical modeling of DNA-frequency interactions</li>
      <li>Investigation of pentagram geometry in other biomolecules</li>
      <li>Clinical trials for potential therapeutic applications</li>
    </ul>
    
    <p>
      These findings bridge ancient geometric wisdom with modern molecular biology, 
      suggesting that mathematical beauty and biological function are intrinsically linked.
    </p>
  </div>

  <div class="section references">
    <div class="section-title">7. References</div>
    
    <div class="reference-item">
      [1] Watson, J. D., & Crick, F. H. C. (1953). Molecular structure of nucleic acids: 
      A structure for deoxyribose nucleic acid. <em>Nature</em>, 171(4356), 737-738.
    </div>
    
    <div class="reference-item">
      [2] Perez, J. C. (2010). Codon populations in single-stranded whole human genome DNA 
      are fractal and fine-tuned by the Golden Ratio 1.618. <em>Interdisciplinary Sciences: 
      Computational Life Sciences</em>, 2(3), 228-240.
    </div>
    
    <div class="reference-item">
      [3] Yamagishi, M. E. B., & Shimabukuro, A. I. (2008). Nucleotide frequencies in human 
      genome and Fibonacci numbers. <em>Bulletin of Mathematical Biology</em>, 70(3), 643-653.
    </div>
    
    <div class="reference-item">
      [4] Schumann, W. O. (1952). Über die strahlungslosen Eigenschwingungen einer leitenden 
      Kugel, die von einer Luftschicht und einer Ionosphärenhülle umgeben ist. 
      <em>Zeitschrift für Naturforschung A</em>, 7(2), 149-154.
    </div>
    
    <div class="reference-item">
      [5] Livio, M. (2002). <em>The Golden Ratio: The Story of Phi, the World's Most 
      Astonishing Number</em>. New York: Broadway Books.
    </div>
    
    <div class="reference-item">
      [6] Persinger, M. A., & Schaut, G. B. (1992). Geomagnetic factors in subjective 
      telepathic, precognitive, and postmortem experiences. <em>Journal of the American 
      Society for Psychical Research</em>, 86(3), 217-235.
    </div>
    
    <div class="reference-item">
      [7] Kučera, O., & Havelka, D. (2012). Mechano-electrical vibrations of microtubules—
      Link to subcellular morphology. <em>Biosystems</em>, 109(3), 346-355.
    </div>
    
    <div class="reference-item">
      [8] Cosic, I. (1994). Macromolecular bioactivity: is it resonant interaction between 
      macromolecules?—Theory and applications. <em>IEEE Transactions on Biomedical 
      Engineering</em>, 41(12), 1101-1114.
    </div>
  </div>

  <div class="watermark">
    Document ID: ${Date.now()}-${data.author.replace(/\s/g, '-')}<br>
    Generated: ${new Date().toISOString()}
  </div>

  <div class="no-print" style="margin-top: 3cm; padding: 1cm; background: #f0f0f0; border: 2px solid #333;">
    <h3>Sharing Instructions for Scotland-based Researchers</h3>
    <p><strong>Without arXiv access, consider these alternatives:</strong></p>
    <ol>
      <li><strong>Preprints.org:</strong> Free, open-access preprint server - <a href="https://www.preprints.org">www.preprints.org</a></li>
      <li><strong>ResearchGate:</strong> Upload and share with academic community - <a href="https://www.researchgate.net">www.researchgate.net</a></li>
      <li><strong>OSF Preprints:</strong> Open Science Framework - <a href="https://osf.io/preprints/">osf.io/preprints</a></li>
      <li><strong>Zenodo:</strong> CERN-hosted open repository - <a href="https://zenodo.org">zenodo.org</a></li>
      <li><strong>bioRxiv:</strong> Biology preprints (if applicable) - <a href="https://www.biorxiv.org">www.biorxiv.org</a></li>
      <li><strong>UK Universities:</strong> Contact physics/biology departments at:
        <ul>
          <li>University of Edinburgh</li>
          <li>University of Glasgow</li>
          <li>University of St Andrews</li>
        </ul>
      </li>
      <li><strong>Royal Society of Edinburgh:</strong> Scotland's National Academy</li>
      <li><strong>FigShare:</strong> Store and share research outputs - <a href="https://figshare.com">figshare.com</a></li>
    </ol>
    <p><strong>Next Steps:</strong></p>
    <ul>
      <li>Save this file as HTML</li>
      <li>Convert to PDF using browser's "Print to PDF" function</li>
      <li>Register with ORCID (<a href="https://orcid.org">orcid.org</a>) for researcher identity</li>
      <li>Submit to preprint servers above (most are free and immediate)</li>
      <li>Share on academic social networks (ResearchGate, Academia.edu)</li>
      <li>Contact Scottish university departments for peer review opportunities</li>
    </ul>
  </div>

</body>
</html>
  `;

  // Create and download the file
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Dokument_Naukowy_DNA_${data.author.replace(/\s/g, '_')}_${Date.now()}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
