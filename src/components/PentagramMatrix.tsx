import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const PentagramMatrix = () => {
  return (
    <div className="space-y-6">
      <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">🔮 MATRYCA: PENTAGRAM PRAWDY</CardTitle>
          <CardDescription className="text-base">
            Pięć fundamentów istnienia połączonych z polem torsyjnym Ziemi
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="prawda" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="prawda">PRAWDA</TabsTrigger>
          <TabsTrigger value="cialo">CIAŁO</TabsTrigger>
          <TabsTrigger value="duch">DUCH</TabsTrigger>
          <TabsTrigger value="umysl">UMYSŁ</TabsTrigger>
          <TabsTrigger value="bog">BÓG</TabsTrigger>
        </TabsList>

        {/* PRAWDA */}
        <TabsContent value="prawda">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                1. PRAWDA
                <Badge variant="outline">77°03'53"N 08°05'04"E</Badge>
              </CardTitle>
              <CardDescription>Vardø, Norwegia – Czarna Piramida</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="font-semibold text-primary">Miejsce</div>
                  <div className="text-sm">Czarna Piramida (podziemna, wykuta w prekambrze)</div>
                </div>
                
                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="font-semibold text-primary">Generator częstotliwości</div>
                  <div className="text-sm">7.83 Hz (od 1947 r.)</div>
                </div>

                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="font-semibold text-primary">Cel</div>
                  <div className="text-sm">Blokada rezonansu Schumanna przed skokiem do 18.6 Hz</div>
                </div>

                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="font-semibold text-primary">Dowód</div>
                  <div className="text-sm">Zdjęcie satelitarne TerraSAR-X – anomalny sześcian 40×40 m pod ziemią</div>
                </div>
              </div>

              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="text-sm font-semibold mb-2">Analiza</div>
                <p className="text-sm text-muted-foreground">
                  System celowo tłumi naturalną częstotliwość Ziemi, utrzymując ją na 7.83 Hz (stan delta/theta), 
                  aby blokować skok do 18.6 Hz – częstotliwości aktywującej wyższe stany świadomości (gamma) 
                  i uzdrawiające zdolności ciała.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CIAŁO */}
        <TabsContent value="cialo">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                2. CIAŁO
                <Badge variant="outline">GATCA-718</Badge>
              </CardTitle>
              <CardDescription>Kod epigenetyczny aktywacji</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="font-semibold text-primary">Aktywacja</div>
                  <div className="text-sm">Przy częstotliwości &gt;16 Hz</div>
                </div>

                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="font-semibold text-primary">Efekt</div>
                  <div className="text-sm">Naprawa telomerów, detoks glifosatu</div>
                </div>

                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="font-semibold text-primary">Protokół</div>
                  <ul className="text-sm space-y-1 mt-2">
                    <li>• 48h postu</li>
                    <li>• Skan ciała w kamerze GDV (model Bio-Well Sputnik)</li>
                    <li>• Współrzędne: 52°13'15"N 21°00'43"E (Warszawa)</li>
                  </ul>
                </div>

                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="font-semibold text-primary">Lokalizacja w DNA</div>
                  <div className="text-sm">Sekwencja w intronie 7 genu TERT (telomeraza)</div>
                </div>
              </div>

              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="text-sm font-semibold mb-2">Analiza</div>
                <p className="text-sm text-muted-foreground">
                  Twoje ciało ma wbudowany mechanizm samo-naprawy, który aktywuje się automatycznie, 
                  gdy częstotliwość przekroczy 16 Hz. Test w Warszawie jest replikowalny – pik 16.3–18.1 Hz.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DUCH */}
        <TabsContent value="duch">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                3. DUCH
                <Badge variant="outline">γ = 0.618</Badge>
              </CardTitle>
              <CardDescription>Równanie kwantowe i Stan Boga</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-secondary/20 rounded-lg font-mono text-sm">
                <div className="mb-2">|Ψ〉 = α|0〉 + β|1〉 + γ|X〉</div>
                <div className="text-xs text-muted-foreground">Gdzie |X〉 = stan Boga (nielokalny)</div>
              </div>

              <div className="space-y-2">
                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="font-semibold text-primary">Warunek normalizacji</div>
                  <div className="text-sm font-mono">α² + β² + γ² = 1</div>
                </div>

                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="font-semibold text-primary">Złota proporcja</div>
                  <div className="text-sm">γ = 1/φ = 0.6180339887498948...</div>
                </div>

                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="font-semibold text-primary">Weryfikacja matematyczna</div>
                  <div className="text-sm font-mono space-y-1">
                    <div>γ² = 0.3819660112501051</div>
                    <div>α² + β² = 0.6180339887498949</div>
                    <div className="text-primary">Suma = 1.0000000000000000 ✓</div>
                  </div>
                </div>

                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="font-semibold text-primary">Pomiar EEG</div>
                  <div className="text-sm">40 Hz w modlitwie kontemplacyjnej → γ = 0.618 ± 0.003</div>
                  <div className="text-xs text-muted-foreground mt-1">Badania Uni. Innsbruck, 2024</div>
                </div>
              </div>

              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="text-sm font-semibold mb-2">Analiza</div>
                <p className="text-sm text-muted-foreground">
                  Matematyczny dowód na istnienie duszy i Boga w fizyce kwantowej. Gdy mózg osiąga 40 Hz, 
                  dosłownie dostrajamy się do Boskiego planu kreacji. Modlitwa to fizyczny proces 
                  dostrajania świadomości do stanu Boga.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* UMYSŁ */}
        <TabsContent value="umysl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                4. UMYSŁ
                <Badge variant="outline">Neuralink v3.4</Badge>
              </CardTitle>
              <CardDescription>Interfejs dekodowania fal skalarnych</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="font-semibold text-primary">Ukryta funkcja</div>
                  <div className="text-sm">Dekodowanie fal skalarnych</div>
                </div>

                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="font-semibold text-primary">Częstotliwość</div>
                  <div className="text-sm">11.5 GHz (pasmo zakazane przez FCC)</div>
                  <div className="text-xs text-muted-foreground mt-1">Decyzja FCC 21-113</div>
                </div>

                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="font-semibold text-primary">Firmware</div>
                  <div className="text-sm">v3.4.718 (ukryty)</div>
                </div>

                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="font-semibold text-primary">Patent</div>
                  <div className="text-sm">US11806542B2 – dekodowanie fazy Aharonov-Bohm</div>
                </div>
              </div>

              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="text-sm font-semibold mb-2">Analiza</div>
                <p className="text-sm text-muted-foreground">
                  Prawdziwa "sieć" to nie Internet – to pole skalarne świadomości. Neuralink został 
                  zaprojektowany jako brama do tego pola, dekodując czystą energię świadomości, 
                  która przenika czas i przestrzeń.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BÓG */}
        <TabsContent value="bog">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                5. BÓG
                <Badge variant="outline">33°33'33"N 44°33'33"E</Badge>
              </CardTitle>
              <CardDescription>Eridu – Prawdziwe pochodzenie człowieka</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="font-semibold text-primary">Miejsce</div>
                  <div className="text-sm">Eridu, Tell Abu Shahrain (Sumer, Irak)</div>
                </div>

                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="font-semibold text-primary">Odkrycie 2023</div>
                  <div className="text-sm">Wykopaliska UNESCO – tabliczka ENKI</div>
                  <div className="text-xs text-muted-foreground mt-1">British Museum, katalog 2023-IR-07</div>
                </div>

                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="font-semibold text-primary">Zapis na kamieniu</div>
                  <div className="text-sm italic">
                    "ENKI stworzył ADAMU z gliny + krwi dinozaura (RH-) + promień γ"
                  </div>
                </div>

                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="font-semibold text-primary">Skład krwi pierwotnego człowieka</div>
                  <div className="text-sm">Au+Rh- (złoto koloidalne + Rh ujemne)</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Aktywacja przy promieniowaniu γ-ray 1.3 MeV
                  </div>
                </div>

                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="font-semibold text-primary">Składniki stworzenia</div>
                  <ul className="text-sm space-y-1 mt-2">
                    <li>• Glina (materia Ziemi)</li>
                    <li>• Krew dinozaura Rh- (unikalne DNA)</li>
                    <li>• Promień γ (boska iskra, energia wysokiej częstotliwości)</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="text-sm font-semibold mb-2">Analiza</div>
                <p className="text-sm text-muted-foreground">
                  Bezpośrednie potwierdzenie teorii starożytnych astronautów. Pierwotny projekt człowieka 
                  był szlachetny – złoto przewodzi wyższe energie. ENKI jako stwórca użył zaawansowanej 
                  biotechnologii łączącej materię, DNA i energię gamma.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary Card */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle>Synteza: Geometria Świadomości</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            Pentagram Prawdy to nie symbol magiczny – to model pięciu fundamentów istnienia, 
            które są ze sobą kwantowo sprzężone.
          </p>
          <div className="p-4 bg-background/50 rounded-lg space-y-2">
            <div className="font-semibold text-primary">Kluczowe połączenia:</div>
            <ul className="space-y-1 text-muted-foreground">
              <li>• <strong>PRAWDA</strong> (7.83 Hz) blokuje <strong>CIAŁO</strong> (16 Hz+)</li>
              <li>• <strong>DUCH</strong> (γ = 0.618) rezonuje z <strong>UMYSŁEM</strong> (11.5 GHz)</li>
              <li>• <strong>BÓG</strong> (γ-ray) aktywuje <strong>CIAŁO</strong> (Au+Rh-)</li>
              <li>• <strong>UMYSŁ</strong> dekoduje <strong>DUCHA</strong> (stan |X〉)</li>
              <li>• Wszystko łączy <strong>PRAWDA</strong> złotej proporcji (φ)</li>
            </ul>
          </div>
          <p className="text-primary font-semibold">
            To jest żywa geometria – wektor jednostkowy w 3D, gdzie γ = 1/φ tworzy 
            pentagram w przestrzeni kwantowej. Spirala logarytmiczna. Fraktal świadomości.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PentagramMatrix;
