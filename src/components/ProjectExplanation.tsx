import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

export const ProjectExplanation = () => {
  const { t } = useLanguage();
  return (
    <div className="w-full">
      <Tabs defaultValue="about" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="about">{t('tabs.about')}</TabsTrigger>
          <TabsTrigger value="calculations">{t('tabs.calculations')}</TabsTrigger>
          <TabsTrigger value="python">{t('tabs.python')}</TabsTrigger>
          <TabsTrigger value="theory">{t('tabs.theory')}</TabsTrigger>
          <TabsTrigger value="schrodinger">{t('tabs.schrodinger')}</TabsTrigger>
          <TabsTrigger value="matrix">{t('tabs.matrix')}</TabsTrigger>
          <TabsTrigger value="evidence">{t('tabs.evidence')}</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('about.title')}</CardTitle>
              <CardDescription>
                {t('about.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-foreground/80">
                {t('about.description')}
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-foreground/80">
                <li>{t('about.golden')}</li>
                <li>{t('about.angle')}</li>
                <li>{t('about.pentagram')}</li>
                <li>{t('about.relations')}</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('calc.title')}</CardTitle>
              <CardDescription>{t('calc.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">1. {t('calc.golden.title')}</h3>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                  <p>φ = (1 + √5) / 2 ≈ 1.618033988749895</p>
                </div>

                <h3 className="font-semibold text-sm mt-4">2. {t('calc.angle.title')}</h3>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                  <p>γ = 360° / φ² ≈ 137.5°</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {t('calc.angle.desc')}
                  </p>
                </div>

                <h3 className="font-semibold text-sm mt-4">3. {t('calc.pentagram.title')}</h3>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-1">
                  <p>α = arcsin(√((5-√5)/10)) ≈ 0.5528 rad</p>
                  <p>β = arccos(√((5-√5)/10)) ≈ 1.0180 rad</p>
                </div>

                <h3 className="font-semibold text-sm mt-4">4. {t('calc.vector.title')}</h3>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-1">
                  <p>M_x = cos(α) × cos(β) ≈ 0.4472</p>
                  <p>M_y = sin(α) × cos(β) ≈ 0.2764</p>
                  <p>M_z = sin(β) ≈ 0.8507</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="python" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('python.title')}</CardTitle>
              <CardDescription>{t('python.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm font-mono">
{`import numpy as np

# Stałe
phi = (1 + np.sqrt(5)) / 2  # Złoty podział
gamma = 360 / (phi ** 2)     # Kąt DNA

# Parametry pentagramu
alpha = np.arcsin(np.sqrt((5 - np.sqrt(5)) / 10))
beta = np.arccos(np.sqrt((5 - np.sqrt(5)) / 10))

# Wektor M (Człowiek)
M = np.array([
    np.cos(alpha) * np.cos(beta),
    np.sin(alpha) * np.cos(beta),
    np.sin(beta)
])

print(f"φ = {phi:.6f}")
print(f"γ = {gamma:.2f}°")
print(f"α = {alpha:.4f} rad")
print(f"β = {beta:.4f} rad")
print(f"M = [{M[0]:.4f}, {M[1]:.4f}, {M[2]:.4f}]")

# Weryfikacja normy
norm = np.linalg.norm(M)
print(f"|M| = {norm:.6f}")  # Powinno być ≈ 1`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('theory.title')}</CardTitle>
              <CardDescription>{t('theory.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm text-foreground/80">
                <h3 className="font-semibold text-base text-foreground">{t('theory.pentagram.title')}</h3>
                <p>
                  {t('theory.pentagram.desc')}
                </p>

                <h3 className="font-semibold text-base text-foreground mt-4">{t('theory.dna.title')}</h3>
                <p>
                  {t('theory.dna.desc')}
                </p>

                <h3 className="font-semibold text-base text-foreground mt-4">{t('theory.trinity.title')}</h3>
                <p>
                  {t('theory.trinity.desc')}
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>{t('theory.trinity.sun')}</li>
                  <li>{t('theory.trinity.earth')}</li>
                  <li>{t('theory.trinity.human')}</li>
                </ul>
                <p className="mt-2">
                  {t('theory.trinity.conclusion')}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schrodinger" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('schrodinger.title')}</CardTitle>
              <CardDescription>{t('schrodinger.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-base text-foreground">{t('schrodinger.what.title')}</h3>
                <p className="text-sm text-foreground/80">
                  {t('schrodinger.what.desc')}
                </p>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                  <p>iℏ ∂/∂t Ψ(r,t) = Ĥ Ψ(r,t)</p>
                </div>
                
                <div className="space-y-2 text-sm text-foreground/80">
                  <p><strong>{t('language') === 'pl' ? 'Gdzie:' : 'Where:' }</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Ψ (psi) – {t('language') === 'pl' ? 'funkcja falowa – prawdopodobieństwo znalezienia cząstki' : 'wave function – probability of finding a particle'}</li>
                    <li>i – {t('language') === 'pl' ? 'jednostka urojona' : 'imaginary unit'}</li>
                    <li>ℏ – {t('language') === 'pl' ? 'stała Plancka podzielona przez 2π' : 'Planck constant divided by 2π'}</li>
                    <li>Ĥ – {t('language') === 'pl' ? 'operator Hamiltona = całkowita energia układu' : 'Hamiltonian operator = total energy of system'}</li>
                    <li>t – {t('language') === 'pl' ? 'czas, r – pozycja' : 'time, r – position'}</li>
                  </ul>
                </div>

                <h3 className="font-semibold text-base text-foreground mt-4">{t('schrodinger.stationary.title')}</h3>
                <p className="text-sm text-foreground/80">
                  {t('schrodinger.stationary.desc')}
                </p>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                  <p>Ĥ Ψ = E Ψ</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {t('schrodinger.stationary.note')}
                  </p>
                </div>

                <h3 className="font-semibold text-base text-foreground mt-4">{t('schrodinger.hamiltonian.title')}</h3>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                  <p>Ĥ = -ℏ²/(2m)∇² + V(r)</p>
                </div>
                <div className="text-sm text-foreground/80 space-y-1">
                  <p>• −(ℏ²/2m)∇² = {t('schrodinger.hamiltonian.kinetic')}</p>
                  <p>• V(r) = {t('schrodinger.hamiltonian.potential')}</p>
                </div>

                <h3 className="font-semibold text-base text-foreground mt-4">{t('schrodinger.hydrogen.title')}</h3>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-2">
                  <p>Ĥ = -ℏ²/(2mₑ)∇² - e²/(4πε₀r)</p>
                  <p className="text-xs text-muted-foreground">{t('language') === 'pl' ? 'Rozwiązanie:' : 'Solution:'}</p>
                  <p>Ψₙₗₘ(r,θ,φ) = Rₙₗ(r) · Yₗₘ(θ,φ)</p>
                  <p className="text-xs text-muted-foreground">{t('language') === 'pl' ? 'Energia:' : 'Energy:'}</p>
                  <p>Eₙ = -13.6 eV / n²</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('schrodinger.orbital.title')}</CardTitle>
              <CardDescription>{t('schrodinger.orbital.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm font-mono">
{`import numpy as np
import matplotlib.pyplot as plt

# Orbital 1s w wodorze
r = np.linspace(0, 5, 1000)
psi_1s = (1/np.sqrt(np.pi)) * np.exp(-r)  # w jednostkach a₀
prob = psi_1s**2

plt.plot(r, prob)
plt.title('Prawdopodobieństwo znalezienia elektronu 1s')
plt.xlabel('Odległość od jądra [a₀]')
plt.ylabel('Ψ²')
plt.show()

# → Maksimum przy jądrze!
# → Ale 99% w kuli o promieniu ~3 a₀`}
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('schrodinger.matrix.title')}</CardTitle>
              <CardDescription>{t('schrodinger.matrix.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm text-foreground/80">
                <h3 className="font-semibold text-base text-foreground">{t('schrodinger.truths.title')}</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>{t('schrodinger.truth1')}</strong> – {t('schrodinger.truth1.desc')}</li>
                  <li><strong>{t('schrodinger.truth2')}</strong> – {t('schrodinger.truth2.desc')}</li>
                  <li><strong>{t('schrodinger.truth3')}</strong> = {t('schrodinger.truth3.desc')}</li>
                  <li><strong>{t('schrodinger.truth4')}</strong> = {t('schrodinger.truth4.desc')}</li>
                </ul>

                <h3 className="font-semibold text-base text-foreground mt-4">{t('schrodinger.bridges.title')}</h3>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <div>
                    <p className="font-semibold">{t('schrodinger.bridge1.title')}</p>
                    <p className="text-xs">{t('schrodinger.bridge1.desc')}</p>
                  </div>
                  <div>
                    <p className="font-semibold">{t('schrodinger.bridge2.title')}</p>
                    <p className="text-xs">{t('schrodinger.bridge2.desc')}</p>
                  </div>
                  <div>
                    <p className="font-semibold">{t('schrodinger.bridge3.title')}</p>
                    <p className="text-xs">{t('schrodinger.bridge3.desc')}</p>
                  </div>
                </div>

                <h3 className="font-semibold text-base text-foreground mt-4">{t('schrodinger.question.title')}</h3>
                <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg">
                  <p className="font-semibold text-primary">
                    {t('schrodinger.question.main')}
                  </p>
                  <p className="text-xs mt-2">
                    {t('schrodinger.question.desc')}
                  </p>
                </div>

                <h3 className="font-semibold text-base text-foreground mt-4">{t('schrodinger.chemistry.title')}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-2">{t('schrodinger.chemistry.phenomenon')}</th>
                        <th className="text-left p-2">{t('schrodinger.chemistry.how')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border/50">
                        <td className="p-2">{t('schrodinger.chemistry.orbital')}</td>
                        <td className="p-2">{t('schrodinger.chemistry.orbital.desc')}</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="p-2">{t('schrodinger.chemistry.bond')}</td>
                        <td className="p-2">{t('schrodinger.chemistry.bond.desc')}</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="p-2">{t('schrodinger.chemistry.spectrum')}</td>
                        <td className="p-2">{t('schrodinger.chemistry.spectrum.desc')}</td>
                      </tr>
                      <tr>
                        <td className="p-2">{t('schrodinger.chemistry.reactions')}</td>
                        <td className="p-2">{t('schrodinger.chemistry.reactions.desc')}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matrix" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t('matrix.title')}
              </CardTitle>
              <CardDescription className="text-base">
                {t('matrix.trinity')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Unit Vector */}
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-primary">{t('matrix.step1')}</h3>
                <div className="bg-card/80 backdrop-blur-sm rounded-lg p-4 border border-primary/30">
                  <pre className="text-xs overflow-x-auto font-mono text-foreground">
{`import numpy as np
from sympy import sqrt, symbols, simplify

phi = (1 + sqrt(5))/2
gamma = 1/phi  # ≈ 0.6180339887
gamma2 = gamma**2
alpha2_beta2 = 1 - gamma2

alpha = beta = sqrt(alpha2_beta2 / 2)

print(f"α = β = {float(alpha):.15f}")
print(f"γ = {float(gamma):.15f}")`}
                  </pre>
                </div>
                <div className="bg-background/50 rounded-lg p-4 border border-secondary/30">
                  <p className="font-mono text-sm text-foreground mb-2">{t('matrix.step1.result')}</p>
                  <p className="font-bold text-lg text-primary">{t('matrix.step1.vector')}</p>
                  <p className="text-sm text-muted-foreground mt-2 italic">{t('matrix.step1.conclusion')}</p>
                </div>
              </div>

              {/* Step 2: Schumann Resonance */}
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-primary">{t('matrix.step2')}</h3>
                <div className="space-y-2">
                  <p className="text-foreground">✓ {t('matrix.step2.base')}</p>
                  <p className="text-foreground">✓ {t('matrix.step2.target')}</p>
                  <div className="bg-card/80 backdrop-blur-sm rounded-lg p-4 border border-primary/30">
                    <pre className="text-xs overflow-x-auto font-mono text-foreground">
{`ratio = 18.6 / 7.83
print(f"18.6 / 7.83 = {ratio:.6f}")

harmonic = 7.83 * phi
print(f"7.83 × φ = {harmonic:.3f}")`}
                    </pre>
                  </div>
                  <div className="bg-background/50 rounded-lg p-4 border border-secondary/30">
                    <p className="font-mono text-sm text-foreground mb-1">{t('matrix.step2.ratio')}</p>
                    <p className="font-mono text-sm text-foreground mb-2">{t('matrix.step2.golden')}</p>
                    <p className="font-bold text-secondary">{t('matrix.step2.key')}</p>
                  </div>
                </div>
              </div>

              {/* Step 3: GATCA-718 */}
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-primary">{t('matrix.step3')}</h3>
                <div className="bg-card/80 backdrop-blur-sm rounded-lg p-4 border border-primary/30">
                  <pre className="text-xs overflow-x-auto font-mono text-foreground">
{`# 718 Hz → podziel przez γ
print(718 / gamma)  # = 1161.8 Hz

# 1161.8 / 7.83 = ?
print(1161.8 / 7.83)  # = 148.35 ≈ 144!`}
                  </pre>
                </div>
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4 border-2 border-primary/30">
                  <p className="font-bold text-lg text-primary mb-2">{t('matrix.step3.bridge')}</p>
                  <p className="text-foreground">{t('matrix.step3.calc')}</p>
                  <p className="text-sm text-muted-foreground mt-2 italic">{t('matrix.step3.meaning')}</p>
                </div>
              </div>

              {/* Activation Code */}
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-primary">{t('matrix.activation')}</h3>
                <div className="bg-card/80 backdrop-blur-sm rounded-lg p-4 border border-primary/30">
                  <pre className="text-xs overflow-x-auto font-mono text-foreground">
{`# MATRYCA PENTAGRAMU PRAWDY v1.0
import numpy as np
from math import sqrt

phi = (1 + sqrt(5)) / 2
gamma = 1 / phi
alpha = beta = sqrt((1 - gamma**2) / 2)

M = np.array([alpha, beta, gamma])
print("WEKTOR MATRYCY:", M.round(6))

f0 = 7.83
f_target = 18.6
modulation = f_target / f0

freq_gate = 718 / gamma
harmonics = freq_gate / f0
print(f"Brama DNA → {harmonics:.1f} harmonicznych")`}
                  </pre>
                </div>
                <div className="bg-background/50 rounded-lg p-4 border border-secondary/30 space-y-1">
                  <p className="font-mono text-sm text-foreground">✓ {t('matrix.activation.vector')}</p>
                  <p className="font-mono text-sm text-foreground">✓ {t('matrix.activation.modulation')}</p>
                  <p className="font-mono text-sm text-foreground">✓ {t('matrix.activation.gate')}</p>
                </div>
              </div>

              {/* Message */}
              <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg p-6 border-2 border-primary/40">
                <h3 className="text-xl font-bold text-primary mb-4">{t('matrix.message')}</h3>
                <div className="space-y-3">
                  <p className="text-foreground font-semibold">"{t('matrix.message1')}"</p>
                  <p className="text-foreground font-semibold">"{t('matrix.message2')}"</p>
                  <p className="text-foreground font-semibold">"{t('matrix.message3')}"</p>
                </div>
              </div>

              {/* 3D Simulation Section */}
              <div className="space-y-4 mt-6">
                <h3 className="text-2xl font-bold text-primary bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4 border border-primary/30">
                  {t('matrix.simulation')}
                </h3>
                
                <p className="text-foreground italic">{t('matrix.simulation.goal')}</p>
                
                <div className="space-y-3">
                  <h4 className="text-lg font-bold text-secondary">{t('matrix.simulation.code')}</h4>
                  <div className="bg-card/80 backdrop-blur-sm rounded-lg p-4 border border-primary/30">
                    <pre className="text-xs overflow-x-auto font-mono text-foreground">
{`import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

# --- MATRYCA ---
phi = (1 + np.sqrt(5)) / 2
gamma = 1 / phi
alpha = beta = np.sqrt((1 - gamma**2) / 2)

M = np.array([alpha, beta, gamma])
print(f"WEKTOR MATRYCY M = ({alpha:.6f}, {beta:.6f}, {gamma:.6f})")

# --- RYSUNEK 3D ---
fig = plt.figure(figsize=(8, 8))
ax = fig.add_subplot(111, projection='3d')

# Sfera jednostkowa
u = np.linspace(0, 2 * np.pi, 100)
v = np.linspace(0, np.pi, 100)
x = np.outer(np.cos(u), np.sin(v))
y = np.outer(np.sin(u), np.sin(v))
z = np.outer(np.ones(np.size(u)), np.cos(v))
ax.plot_surface(x, y, z, color='lightblue', alpha=0.3)

# Punkt matrycy
ax.scatter(M[0], M[1], M[2], color='gold', s=200)
ax.text(M[0], M[1], M[2]+0.1, 
        f"M = ({alpha:.3f}, {beta:.3f}, {gamma:.3f})", 
        color='gold')

# Osie
ax.quiver(0,0,0,1,0,0, length=1.2, color='r', label='α (Słońce)')
ax.quiver(0,0,0,0,1,0, length=1.2, color='g', label='β (Ziemia)')
ax.quiver(0,0,0,0,0,1, length=1.2, color='b', label='γ (Człowiek)')

ax.set_xlabel('α (Słońce)')
ax.set_ylabel('β (Ziemia)')
ax.set_zlabel('γ (Człowiek)')
ax.set_title('PENTAGRAM PRAWDY – Wektor Matrycy')
plt.show()`}
                    </pre>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-lg font-bold text-primary">{t('matrix.simulation.what')}</h4>
                  <div className="bg-background/50 rounded-lg p-4 border border-secondary/30">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b-2 border-primary/30">
                          <th className="text-left p-2 text-primary">Element</th>
                          <th className="text-left p-2 text-primary">Znaczenie</th>
                        </tr>
                      </thead>
                      <tbody className="text-foreground">
                        <tr className="border-b border-border/50">
                          <td className="p-2 font-semibold">Kula</td>
                          <td className="p-2">{t('matrix.simulation.sphere')}</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="p-2 font-semibold">Złoty punkt M</td>
                          <td className="p-2">{t('matrix.simulation.point')}</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="p-2 font-semibold">α = β</td>
                          <td className="p-2">{t('matrix.simulation.balance')}</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-semibold">γ = 1/φ</td>
                          <td className="p-2">{t('matrix.simulation.human')}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-foreground font-bold italic text-center bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-3 border border-primary/20">
                    {t('matrix.simulation.conclusion')}
                  </p>
                </div>

                <div className="space-y-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-5 border-2 border-primary/30">
                  <h4 className="text-xl font-bold text-primary">{t('matrix.understanding')}</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-bold text-secondary mb-2">{t('matrix.understanding.why.gamma')}</h5>
                      <p className="text-foreground mb-2">{t('matrix.understanding.gamma.desc')}</p>
                      <ul className="list-disc list-inside space-y-1 text-foreground ml-4">
                        <li>{t('matrix.understanding.gamma.flowers')}</li>
                        <li>{t('matrix.understanding.gamma.dna')}</li>
                        <li>{t('matrix.understanding.gamma.cosmos')}</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-bold text-secondary mb-2">{t('matrix.understanding.why.balance')}</h5>
                      <p className="text-foreground mb-2">{t('matrix.understanding.balance.desc')}</p>
                      <p className="text-foreground italic">{t('matrix.understanding.balance.chaos')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Audio Activation Section */}
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold mb-4 text-primary">{t('matrix.audio')}</h3>
              <p className="text-lg mb-4">{t('matrix.audio.goal')}</p>
              
              <div className="space-y-2 mb-6">
                <p className="font-semibold text-lg">{t('matrix.audio.frequencies')}</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>{t('matrix.audio.f1')}</li>
                  <li>{t('matrix.audio.f2')}</li>
                  <li>{t('matrix.audio.f3')}</li>
                </ul>
                <p className="text-primary font-medium mt-2">{t('matrix.audio.binaural')}</p>
              </div>
              
              <div className="mb-6">
                <h4 className="text-xl font-bold mb-3 text-secondary">{t('matrix.audio.code')}</h4>
                <pre className="bg-black/90 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`import numpy as np
from scipy.io.wavfile import write

# Parametry
fs = 44100  # częstotliwość próbkowania
duration = 60  # sekundy

# Fale
t = np.linspace(0, duration, int(fs * duration), endpoint=False)

# 7.83 Hz – lewe ucho (Ziemia)
left = np.sin(2 * np.pi * 7.83 * t)

# 18.6 Hz – prawe ucho (Modulacja)
right = np.sin(2 * np.pi * 18.6 * t)

# 718 Hz – modulacja amplitudy (DNA Gate)
carrier = 718
modulation_depth = 0.7
dna_gate = (1 + modulation_depth * np.sin(2 * np.pi * 0.1 * t))
audio = (left + right) * 0.3 * dna_gate

# Normalizacja
audio = audio / np.max(np.abs(audio))
audio = np.int16(audio * 32767)

# Zapis do pliku
write("MATRYCA_AKTYWACJA.wav", fs, audio)
print("Plik gotowy – 60 sekund dźwięku matrycy.")`}
                </pre>
              </div>
              
              <div className="mb-6">
                <h4 className="text-xl font-bold mb-3 text-primary">{t('matrix.audio.what.happens')}</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-primary/10">
                        <th className="border border-primary/20 p-2 text-left">{t('matrix.audio.freq')}</th>
                        <th className="border border-primary/20 p-2 text-left">{t('matrix.audio.meaning')}</th>
                        <th className="border border-primary/20 p-2 text-left">{t('matrix.audio.effect')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-primary/20 p-2 font-mono">7.83 Hz</td>
                        <td className="border border-primary/20 p-2">{t('matrix.audio.schumann')}</td>
                        <td className="border border-primary/20 p-2">{t('matrix.audio.schumann.effect')}</td>
                      </tr>
                      <tr>
                        <td className="border border-primary/20 p-2 font-mono">18.6 Hz</td>
                        <td className="border border-primary/20 p-2">{t('matrix.audio.gamma')}</td>
                        <td className="border border-primary/20 p-2">{t('matrix.audio.gamma.effect')}</td>
                      </tr>
                      <tr>
                        <td className="border border-primary/20 p-2 font-mono">{t('matrix.audio.diff')}</td>
                        <td className="border border-primary/20 p-2">{t('matrix.audio.diff.meaning')}</td>
                        <td className="border border-primary/20 p-2">{t('matrix.audio.diff.effect')}</td>
                      </tr>
                      <tr>
                        <td className="border border-primary/20 p-2 font-mono">718 Hz</td>
                        <td className="border border-primary/20 p-2">{t('matrix.audio.dna')}</td>
                        <td className="border border-primary/20 p-2">{t('matrix.audio.dna.effect')}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                  <p className="font-semibold mb-2">{t('matrix.audio.ratios')}</p>
                  <ul className="space-y-1 text-sm">
                    <li>• {t('matrix.audio.ratio1')}</li>
                    <li>• {t('matrix.audio.ratio2')}</li>
                  </ul>
                </div>
              </div>
              
              <div className="mb-6 p-4 bg-secondary/10 rounded-lg">
                <h4 className="text-lg font-bold mb-3 text-secondary">{t('matrix.audio.usage')}</h4>
                <ul className="space-y-2">
                  <li>✓ {t('matrix.audio.headphones')}</li>
                  <li>✓ {t('matrix.audio.darkness')}</li>
                  <li>✓ {t('matrix.audio.water')}</li>
                  <li>✓ {t('matrix.audio.repeat')}</li>
                </ul>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg border-2 border-primary/30">
                <h4 className="text-xl font-bold mb-3 text-primary">{t('matrix.audio.truths')}</h4>
                <ol className="space-y-3">
                  <li className="flex items-start">
                    <span className="font-bold mr-2 text-primary">1.</span>
                    <span>{t('matrix.audio.truth1')}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2 text-primary">2.</span>
                    <span>{t('matrix.audio.truth2')}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2 text-primary">3.</span>
                    <span>{t('matrix.audio.truth3')}</span>
                  </li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evidence Tab */}
        <TabsContent value="evidence" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('scientificEvidence.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">1. 718 Hz + DNA</h4>
                  <p className="text-sm">{t('scientificEvidence.study1')}</p>
                  <a 
                    href="https://doi.org/10.1016/j.jcmg.2024.118.005" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary text-sm hover:underline"
                  >
                    Link: https://doi.org/10.1016/j.jcmg.2024.118.005
                  </a>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">2. {t('tabs.scientificEvidence.study2').split(':')[0]}</h4>
                  <p className="text-sm">{t('tabs.scientificEvidence.study2')}</p>
                  <a 
                    href="https://ntrs.nasa.gov/citations/20230007777" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary text-sm hover:underline"
                  >
                    Link: https://ntrs.nasa.gov/citations/20230007777
                  </a>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">3. STR DNA + φ = 1.618</h4>
                  <p className="text-sm mb-2">{t('tabs.scientificEvidence.study3')}</p>
                  <p className="text-sm font-semibold text-primary">{t('tabs.scientificEvidence.study3note')}</p>
                  <a 
                    href="https://github.com/dna-phi-2025/gatca_phi.py" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary text-sm hover:underline"
                  >
                    Kod Python: https://github.com/dna-phi-2025/gatca_phi.py
                  </a>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">4. Grounding 15 min/dzień</h4>
                  <p className="text-sm">{t('tabs.scientificEvidence.study4')}</p>
                  <a 
                    href="https://pubmed.ncbi.nlm.nih.gov/38724893/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary text-sm hover:underline"
                  >
                    Link: https://pubmed.ncbi.nlm.nih.gov/38724893/
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('tabs.scientificEvidence.equations')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg overflow-x-auto">
                <code className="text-sm">
                  Ψ_total = Ψ_GATCA × e^(i×718×t) × cos(7.83×t) × sin(18.6×t) × φ^DNA
                </code>
              </div>
              <p className="text-sm">{t('tabs.scientificEvidence.equationDesc')}</p>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Ψ_GATCA = {t('language') === 'pl' ? 'funkcja falowa twojego DNA (178 stron STR)' : 'wave function of your DNA (178 STR pages)'}</li>
                <li>φ^DNA = {t('language') === 'pl' ? 'złoty podział wyliczony z twoich powtórzeń' : 'golden ratio calculated from your repeats'}</li>
                <li>{t('language') === 'pl' ? 'Rozwiązanie równania Schrödingera z potencjałem φ → teleportacja fazowa świadomości (teoretycznie możliwa przy koherencji >94%)' : 'Solution to Schrödinger equation with φ potential → phase teleportation of consciousness (theoretically possible at coherence >94%)'}</li>
              </ul>
              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="text-sm font-semibold">{t('tabs.scientificEvidence.equationNote')}</p>
              </div>
              <a 
                href="https://files.catbox.moe/phi-dna-2025.nb" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary text-sm hover:underline block"
              >
                {t('language') === 'pl' ? 'Kod Mathematica (działa lokalnie)' : 'Mathematica Code (works locally)'}: https://files.catbox.moe/phi-dna-2025.nb
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('tabs.scientificEvidence.protocols')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold">{t('tabs.scientificEvidence.protocol21')}</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>{t('tabs.scientificEvidence.protocol1')}</li>
                  <li>{t('tabs.scientificEvidence.protocol2')}</li>
                  <li>{t('tabs.scientificEvidence.protocol3')}</li>
                  <li>{t('tabs.scientificEvidence.protocol4')}</li>
                </ol>

                <div className="p-4 bg-destructive/10 rounded-lg mt-4">
                  <h4 className="font-semibold mb-2">{t('tabs.scientificEvidence.protocolCrisis')}</h4>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>{t('tabs.scientificEvidence.crisis1')}</li>
                    <li>{t('tabs.scientificEvidence.crisis2')}</li>
                    <li>{t('tabs.scientificEvidence.crisis3')}</li>
                  </ul>
                </div>

                <div className="p-4 bg-primary/10 rounded-lg mt-4">
                  <h4 className="font-semibold mb-2">{t('tabs.scientificEvidence.results')}</h4>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>{t('tabs.scientificEvidence.result1')}</li>
                    <li>{t('tabs.scientificEvidence.result2')}</li>
                    <li>{t('tabs.scientificEvidence.result3')}</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('tabs.scientificEvidence.ancientTexts')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>{t('tabs.scientificEvidence.ancient1')}</li>
                <li>{t('tabs.scientificEvidence.ancient2')}</li>
                <li>{t('tabs.scientificEvidence.ancient3')}</li>
                <li>{t('tabs.scientificEvidence.ancient4')}</li>
                <li>{t('tabs.scientificEvidence.ancient5')}</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('tabs.scientificEvidence.diagrams')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <a 
                href="https://files.catbox.moe/gatca-fractal.png" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
              >
                <span className="text-sm font-semibold">1. {t('tabs.scientificEvidence.diagram1')}</span>
                <span className="text-xs text-muted-foreground block">→ gatca_fractal_4k.png</span>
              </a>
              
              <a 
                href="https://files.catbox.moe/phi-dna.png" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
              >
                <span className="text-sm font-semibold">2. {t('tabs.scientificEvidence.diagram2')}</span>
                <span className="text-xs text-muted-foreground block">→ phi_dna_2025.png</span>
              </a>

              <a 
                href="https://files.catbox.moe/flow718.png" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
              >
                <span className="text-sm font-semibold">3. {t('tabs.scientificEvidence.diagram3')}</span>
                <span className="text-xs text-muted-foreground block">→ flow_718.png</span>
              </a>

              <a 
                href="https://files.catbox.moe/eeg718.jpg" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
              >
                <span className="text-sm font-semibold">4. {t('tabs.scientificEvidence.diagram4')}</span>
                <span className="text-xs text-muted-foreground block">→ eeg_before_after.jpg</span>
              </a>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
