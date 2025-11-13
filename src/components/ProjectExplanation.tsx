import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const ProjectExplanation = () => {
  return (
    <div className="w-full">
      <Tabs defaultValue="about" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="about">O Projekcie</TabsTrigger>
          <TabsTrigger value="calculations">Obliczenia</TabsTrigger>
          <TabsTrigger value="python">Kod Python</TabsTrigger>
          <TabsTrigger value="theory">Teoria</TabsTrigger>
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
      </Tabs>
    </div>
  );
};
