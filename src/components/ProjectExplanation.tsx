import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

export const ProjectExplanation = () => {
  const { t } = useLanguage();
  return (
    <div className="w-full">
      <Tabs defaultValue="about" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="about">{t('tabs.about')}</TabsTrigger>
          <TabsTrigger value="calculations">{t('tabs.calculations')}</TabsTrigger>
          <TabsTrigger value="python">{t('tabs.python')}</TabsTrigger>
          <TabsTrigger value="theory">{t('tabs.theory')}</TabsTrigger>
          <TabsTrigger value="schrodinger">{t('tabs.schrodinger')}</TabsTrigger>
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
      </Tabs>
    </div>
  );
};
