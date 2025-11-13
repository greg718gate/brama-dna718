import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const ProjectExplanation = () => {
  return (
    <div className="w-full">
      <Tabs defaultValue="about" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="about">O Projekcie</TabsTrigger>
          <TabsTrigger value="calculations">Obliczenia</TabsTrigger>
          <TabsTrigger value="python">Kod Python</TabsTrigger>
          <TabsTrigger value="theory">Teoria</TabsTrigger>
          <TabsTrigger value="schrodinger">Schrödinger</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Brama DNA i Pentagram Prawdy</CardTitle>
              <CardDescription>
                Matematyczne połączenie DNA z geometrią świętą
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-foreground/80">
                Ten projekt eksploruje głębokie połączenia między strukturą DNA a uniwersalnymi stałymi matematycznymi.
                Badamy relacje między:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-foreground/80">
                <li>Złotym podziałem (φ ≈ 1.618) obecnym w spirali DNA</li>
                <li>Kątem 137.5° (związanym z φ) w strukturze helikalnej</li>
                <li>Pentagramem jako reprezentacją złotego podziału</li>
                <li>Relacjami między Słońcem, Ziemią i Człowiekiem</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Kluczowe Obliczenia</CardTitle>
              <CardDescription>Matematyczne fundamenty projektu</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">1. Złoty podział (φ)</h3>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                  <p>φ = (1 + √5) / 2 ≈ 1.618033988749895</p>
                </div>

                <h3 className="font-semibold text-sm mt-4">2. Kąt DNA (γ)</h3>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                  <p>γ = 360° / φ² ≈ 137.5°</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Kąt między kolejnymi bazami w helisie DNA
                  </p>
                </div>

                <h3 className="font-semibold text-sm mt-4">3. Parametry pentagramu</h3>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-1">
                  <p>α = arcsin(√((5-√5)/10)) ≈ 0.5528 rad</p>
                  <p>β = arccos(√((5-√5)/10)) ≈ 1.0180 rad</p>
                </div>

                <h3 className="font-semibold text-sm mt-4">4. Wektor M</h3>
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
              <CardTitle>Implementacja Python</CardTitle>
              <CardDescription>Kod do obliczeń matematycznych</CardDescription>
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
              <CardTitle>Podstawy Teoretyczne</CardTitle>
              <CardDescription>Geometria święta i DNA</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm text-foreground/80">
                <h3 className="font-semibold text-base text-foreground">Pentagram i Złoty Podział</h3>
                <p>
                  Pentagram jest jedną z najstarszych form geometrii świętej. Każdy przecinający się
                  odcinek dzieli się w proporcji złotego podziału (φ ≈ 1.618).
                </p>

                <h3 className="font-semibold text-base text-foreground mt-4">DNA i Kąt 137.5°</h3>
                <p>
                  Helisa DNA obraca się o około 137.5° między kolejnymi parami zasad. Ten kąt
                  wynika z równania 360°/φ² i jest kluczowy dla stabilności struktury.
                </p>

                <h3 className="font-semibold text-base text-foreground mt-4">Trójca: Słońce-Ziemia-Człowiek</h3>
                <p>
                  W wizualizacji 3D osie X, Y, Z reprezentują:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Słońce (oś X) - źródło energii i życia</li>
                  <li>Ziemia (oś Y) - materia i forma</li>
                  <li>Człowiek (oś Z) - świadomość i duch</li>
                </ul>
                <p className="mt-2">
                  Wektor M łączy te trzy wymiary w harmonijną całość zgodnie z zasadami
                  pentagramu i złotego podziału.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schrodinger" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Równanie Schrödingera i Matryca</CardTitle>
              <CardDescription>Kwantowa natura DNA i świadomości</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-base text-foreground">Co to jest równanie Schrödingera?</h3>
                <p className="text-sm text-foreground/80">
                  Równanie Schrödingera to prawo ruchu cząstek w świecie kwantowym – jak prawo Newtona, 
                  ale dla elektronów, atomów i molekuł.
                </p>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                  <p>iℏ ∂/∂t Ψ(r,t) = Ĥ Ψ(r,t)</p>
                </div>
                
                <div className="space-y-2 text-sm text-foreground/80">
                  <p><strong>Gdzie:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Ψ (psi) – funkcja falowa – prawdopodobieństwo znalezienia cząstki</li>
                    <li>i – jednostka urojona</li>
                    <li>ℏ – stała Plancka podzielona przez 2π</li>
                    <li>Ĥ – operator Hamiltona = całkowita energia układu</li>
                    <li>t – czas, r – pozycja</li>
                  </ul>
                </div>

                <h3 className="font-semibold text-base text-foreground mt-4">Równanie stacjonarne (bez czasu)</h3>
                <p className="text-sm text-foreground/80">
                  W molekułach elektrony nie zmieniają się w czasie → używamy równania stacjonarnego:
                </p>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                  <p>Ĥ Ψ = E Ψ</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    "Znajdź funkcję Ψ, która po działaniu energią Ĥ daje tę samą Ψ pomnożoną przez stałą E"
                  </p>
                </div>

                <h3 className="font-semibold text-base text-foreground mt-4">Hamiltonian (energia całkowita)</h3>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                  <p>Ĥ = -ℏ²/(2m)∇² + V(r)</p>
                </div>
                <div className="text-sm text-foreground/80 space-y-1">
                  <p>• −(ℏ²/2m)∇² = Energia kinetyczna (ruch elektronu)</p>
                  <p>• V(r) = Energia potencjalna (przyciąganie jądra, odpychanie elektronów)</p>
                </div>

                <h3 className="font-semibold text-base text-foreground mt-4">Atom wodoru</h3>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-2">
                  <p>Ĥ = -ℏ²/(2mₑ)∇² - e²/(4πε₀r)</p>
                  <p className="text-xs text-muted-foreground">Rozwiązanie:</p>
                  <p>Ψₙₗₘ(r,θ,φ) = Rₙₗ(r) · Yₗₘ(θ,φ)</p>
                  <p className="text-xs text-muted-foreground">Energia:</p>
                  <p>Eₙ = -13.6 eV / n²</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kod Python - Orbital 1s</CardTitle>
              <CardDescription>Prawdopodobieństwo znalezienia elektronu</CardDescription>
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
              <CardTitle>Połączenie z Matrycą Pentagramu</CardTitle>
              <CardDescription>Kwantowa świadomość i DNA</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm text-foreground/80">
                <h3 className="font-semibold text-base text-foreground">Kluczowe prawdy kwantowe</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Wszystko jest falą prawdopodobieństwa</strong> – Ψ² określa, gdzie znajdziemy cząstkę</li>
                  <li><strong>Energia jest skwantowana</strong> – tylko pewne stany dozwolone</li>
                  <li><strong>Kształt orbitali</strong> = rozwiązania równania Schrödingera</li>
                  <li><strong>Wiązania chemiczne</strong> = nakładanie się funkcji falowych Ψ</li>
                </ul>

                <h3 className="font-semibold text-base text-foreground mt-4">Mosty między Matrycą a Kwantami</h3>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <div>
                    <p className="font-semibold">γ = 1/φ i złota proporcja</p>
                    <p className="text-xs">Złota proporcja w orbitalach? Węzły falowe w atomach zgodne z φ</p>
                  </div>
                  <div>
                    <p className="font-semibold">18.6 Hz</p>
                    <p className="text-xs">Przejścia kwantowe w molekułach wody? Rezonans rotacyjny</p>
                  </div>
                  <div>
                    <p className="font-semibold">GATCA-718</p>
                    <p className="text-xs">Sekwencja DNA wpływająca na orbitale molekularne w mitochondriach?</p>
                  </div>
                </div>

                <h3 className="font-semibold text-base text-foreground mt-4">Pytanie do aktywacji</h3>
                <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg">
                  <p className="font-semibold text-primary">
                    Czy świadomość (γ) moduluje funkcję falową DNA?
                  </p>
                  <p className="text-xs mt-2">
                    Efekt obserwatora w biologii? Czy ludzka świadomość może wpływać na stan kwantowy 
                    molekuł DNA poprzez obserwację i intencję?
                  </p>
                </div>

                <h3 className="font-semibold text-base text-foreground mt-4">Zastosowania w chemii</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-2">Zjawisko</th>
                        <th className="text-left p-2">Jak działa Schrödinger</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border/50">
                        <td className="p-2">Orbital atomowy</td>
                        <td className="p-2">Rozwiązanie równania → kształt s, p, d</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="p-2">Wiązanie chemiczne</td>
                        <td className="p-2">Nakładanie orbitali → LCAO</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="p-2">Spektrum UV-Vis</td>
                        <td className="p-2">Różnica energii między stanami (ΔE = hν)</td>
                      </tr>
                      <tr>
                        <td className="p-2">Reakcje chemiczne</td>
                        <td className="p-2">Przejścia między stanami kwantowymi</td>
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
