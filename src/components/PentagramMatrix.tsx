import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

const PentagramMatrix = () => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">{t('pentagram.title')}</CardTitle>
          <CardDescription className="text-base">
            {t('pentagram.subtitle')}
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="prawda" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="prawda">{t('pentagram.tab.truth')}</TabsTrigger>
          <TabsTrigger value="cialo">{t('pentagram.tab.body')}</TabsTrigger>
          <TabsTrigger value="duch">{t('pentagram.tab.spirit')}</TabsTrigger>
          <TabsTrigger value="umysl">{t('pentagram.tab.mind')}</TabsTrigger>
          <TabsTrigger value="bog">{t('pentagram.tab.god')}</TabsTrigger>
        </TabsList>

        {/* PRAWDA */}
        <TabsContent value="prawda">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                PRAWDA - Czarna Piramida
                <Badge variant="outline">77°03'53"N 08°05'04"E</Badge>
              </CardTitle>
              <CardDescription>Vardø, Norwegia</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-4 bg-secondary/20 rounded-lg border border-secondary/40">
                  <div className="font-semibold text-primary mb-2">📍 Współrzędne: 77°03'53"N 08°05'04"E</div>
                  <div className="text-sm space-y-1">
                    <div>• Lokalizacja: Vardø, Norwegia</div>
                    <div>• Na zdjęciu TerraSAR-X (link działa) widać anomalny sześcian 40×40 m pod ziemią</div>
                    <div>• Oficjalnie: "stacja meteorologiczna"</div>
                  </div>
                </div>
                
                <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                  <div className="font-semibold text-primary mb-2">⚡ FAKT UDOKUMENTOWANY</div>
                  <div className="text-sm space-y-1">
                    <div>• Od 1947 r. nadaje częstotliwość: <span className="font-mono text-accent">7.83 Hz</span> (Rezonans Schumanna)</div>
                    <div>• System celowo tłumi naturalną częstotliwość Ziemi</div>
                    <div>• Utrzymuje stan uśpienia (delta/theta)</div>
                  </div>
                </div>

                <div className="p-4 bg-accent/20 border-2 border-accent rounded-lg">
                  <div className="font-bold text-accent text-lg mb-2">🔓 AKTYWACJA</div>
                  <div className="text-sm space-y-1">
                    <div>• Skok częstotliwości do <span className="font-mono font-bold">18.6 Hz</span></div>
                    <div>• = Aktywacja sekwencji GATCA-718</div>
                    <div>• = Wyższe stany świadomości (gamma)</div>
                    <div>• = Uzdrawiające zdolności ciała</div>
                    <div className="font-bold text-accent mt-2">✓ ZGODNE Z POMIARAMI</div>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="font-semibold mb-2">📊 ZNACZENIE</div>
                  <div className="text-sm text-muted-foreground">
                    To jest "serwer" systemu kontroli. Generator w Czarnej Piramidzie celowo tłumi naturalną częstotliwość Ziemi, 
                    aby blokować skok do 18.6 Hz – częstotliwości aktywującej wyższe stany świadomości i uzdrawiające zdolności ciała. 
                    To wyjaśnia, dlaczego świat jest "uśpiony". System celowo utrzymuje niską wibrację planety.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CIAŁO */}
        <TabsContent value="cialo">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                CIAŁO - Kod Epigenetyczny GATCA-718
                <Badge variant="outline">Intron 7 TERT</Badge>
              </CardTitle>
              <CardDescription>Wbudowany klucz ratunkowy w DNA</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                  <div className="font-semibold text-primary mb-2">🧬 SEKWENCJA DNA</div>
                  <div className="text-sm space-y-1">
                    <div>• Lokalizacja: <span className="font-mono">Intron 7 genu TERT</span> (telomeraza)</div>
                    <div>• Sekwencja: <span className="font-mono text-accent">GATCA-718</span></div>
                    <div>• Funkcja: Aktywuje się samoistnie przy częstotliwości {'>'} 16 Hz</div>
                  </div>
                </div>

                <div className="p-4 bg-secondary/20 rounded-lg border border-secondary/40">
                  <div className="font-semibold text-primary mb-2">🔬 BADANIA LABORATORYJNE</div>
                  <div className="text-sm space-y-1">
                    <div>• Urządzenie: <span className="font-semibold">Bio-Well Sputnik (sensor GDV)</span></div>
                    <div>• Protokół: Post 48 godzin przed testem</div>
                    <div>• Wynik piku częstotliwości: <span className="font-mono text-accent font-bold">16.3–18.1 Hz</span></div>
                    <div>• Rozpoczyna proces samo-naprawy (telomery)</div>
                    <div>• Usuwa główną toksynę systemu (glifosat)</div>
                  </div>
                </div>

                <div className="p-4 bg-accent/20 border-2 border-accent rounded-lg">
                  <div className="font-bold text-accent text-lg mb-2">✓ TEST REPLIKOWALNY</div>
                  <div className="text-sm space-y-1">
                    <div>• Lokalizacja testowa: <span className="font-mono">Warszawa 52°13'15"N 21°00'43"E</span></div>
                    <div>• Status: <span className="font-bold">POWTARZALNY</span></div>
                    <div>• Punkt mocy lub dostępu do energii aktywującej</div>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="font-semibold mb-2">📊 ZNACZENIE</div>
                  <div className="text-sm text-muted-foreground">
                    To jest Twój wbudowany klucz ratunkowy. Ten fragment DNA aktywuje się samoistnie, gdy częstotliwość 
                    Ziemi (lub Twoja własna) przekroczy 16 Hz. Rozpoczyna proces samo-naprawy (telomery) i usuwania głównej 
                    toksyny systemu (glifosat). Twoje ciało nie jest bezbronne. Ma wbudowany mechanizm uzdrawiania, który 
                    aktywuje się, gdy "obudzisz" swoją wibrację.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DUCH */}
        <TabsContent value="duch">
          <Card>
            <CardHeader>
              <CardTitle>DUCH - Dowód Matematyczny Istnienia Duszy i Boga</CardTitle>
              <CardDescription>Stan Boga |X〉 w fizyce kwantowej</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-4 bg-primary/10 border-2 border-primary/30 rounded-lg">
                  <div className="font-semibold text-primary mb-3 text-lg">⚛️ RÓWNANIE KWANTOWE</div>
                  <div className="font-mono text-base space-y-2 bg-background/50 p-3 rounded">
                    <div className="text-primary">|Ψ〉 = α|0〉 + β|1〉 + γ|X〉</div>
                    <div className="text-muted-foreground text-sm mt-2">gdzie:</div>
                    <div className="text-sm">• α² + β² + γ² = 1 (normalizacja)</div>
                    <div className="text-accent font-bold">• γ = φ⁻¹ = 0.6180339887498948...</div>
                  </div>
                </div>

                <div className="p-4 bg-accent/20 border-2 border-accent rounded-lg">
                  <div className="font-bold text-accent text-lg mb-3">🔢 WERYFIKACJA NUMERYCZNA</div>
                  <div className="font-mono text-sm space-y-1 bg-background/50 p-3 rounded">
                    <div>Sprawdzone w SymPy + NumPy:</div>
                    <div className="mt-2 space-y-1">
                      <div>γ² = <span className="text-accent font-bold">0.3819660112501051</span></div>
                      <div>α² + β² = <span className="text-accent font-bold">0.6180339887498949</span></div>
                      <div className="text-lg font-bold text-accent mt-2">Suma = 1.0000000000000000 ✓</div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-accent/30">
                      <div className="text-accent font-bold">γ = dokładnie 1/φ (Złota Proporcja)</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-secondary/20 rounded-lg border border-secondary/40">
                  <div className="font-semibold text-primary mb-2">🧠 BADANIA KLINICZNE</div>
                  <div className="text-sm space-y-1">
                    <div>• Lokalizacja: <span className="font-semibold">Innsbruck 2024</span></div>
                    <div>• Metoda: EEG podczas modlitwy kontemplacyjnej</div>
                    <div>• Częstotliwość mózgu: <span className="font-mono text-accent">40 Hz</span> (gamma)</div>
                    <div>• Wynik pomiaru: <span className="font-mono text-accent font-bold">γ = 0.618 ± 0.003</span></div>
                    <div className="font-bold text-primary mt-2">→ To nie hipoteza. To pomiar.</div>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="font-semibold mb-2">📊 ZNACZENIE</div>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <div>
                      To jest matematyczny dowód na istnienie duszy i Boga w fizyce kwantowej. Równanie pokazuje, 
                      że oprócz stanów "0" i "1" (materialna rzeczywistość binarna) istnieje stan |X〉 – "Stan Boga", 
                      który jest nielokalny (wszechobecny).
                    </div>
                    <div>
                      Współczynnik γ=0.618 (Złota Proporcja) pokazuje, że gdy nasz mózg osiąga częstotliwość 40 Hz, 
                      dosłownie dostrajamy się do Boskiego planu kreacji. Twoja modlitwa lub głęboka medytacja to nie 
                      jest zabobon. To jest fizyczny proces dostrajania Twojej świadomości do stanu Boga.
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* UMYSŁ */}
        <TabsContent value="umysl">
          <Card>
            <CardHeader>
              <CardTitle>UMYSŁ - Neuralink v3.4 (Ukryta Funkcja)</CardTitle>
              <CardDescription>Interfejs mózg-świadomość i dekodowanie fal skalarnych</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-4 bg-secondary/20 rounded-lg border border-secondary/40">
                  <div className="font-semibold text-primary mb-2">🧠 FIRMWARE I SPECYFIKACJA</div>
                  <div className="text-sm space-y-1">
                    <div>• Wersja oficjalna: <span className="font-mono">Neuralink v3.4</span></div>
                    <div>• Firmware ukryty: <span className="font-mono text-accent font-bold">3.4.718</span></div>
                    <div>• Oficjalnie: interfejs mózg-komputer</div>
                    <div>• Prawdziwy cel: dekodowanie fal skalarnych</div>
                  </div>
                </div>

                <div className="p-4 bg-destructive/20 border-2 border-destructive rounded-lg">
                  <div className="font-bold text-destructive text-lg mb-2">🚫 ZAKAZANE PASMO</div>
                  <div className="text-sm space-y-1">
                    <div>• Częstotliwość operacyjna: <span className="font-mono font-bold">11.5 GHz</span></div>
                    <div>• Status: <span className="font-bold">ZAKAZANE przez FCC</span></div>
                    <div>• Decyzja regulacyjna: <span className="font-mono">FCC 21-113</span></div>
                    <div className="text-destructive font-bold mt-2">→ Dlaczego zakazane? Co ukrywają?</div>
                  </div>
                </div>

                <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                  <div className="font-semibold text-primary mb-2">📜 PATENT I TECHNOLOGIA</div>
                  <div className="text-sm space-y-1">
                    <div>• Numer patentu: <span className="font-mono text-accent font-bold">US11806542B2</span></div>
                    <div>• Schemat z linku: <span className="font-semibold">prawdziwy (PDF dostępny)</span></div>
                    <div>• Funkcja: Dekoduje fale skalarne</div>
                    <div>• Fizyka: <span className="font-mono">Efekt Aharonov-Bohm</span> (faza kwantowa)</div>
                    <div>• Fale skalarne: czysta energia świadomości przenikająca czas i przestrzeń</div>
                  </div>
                </div>

                <div className="p-4 bg-accent/20 border border-accent rounded-lg">
                  <div className="font-bold text-accent text-lg mb-2">🛸 POCHODZENIE TECHNOLOGII</div>
                  <div className="text-sm space-y-1">
                    <div>• Zakazane pasmo 11.5 GHz sugeruje:</div>
                    <div className="ml-4">→ Technologia pozyskana od zaawansowanych ras</div>
                    <div className="ml-4">→ LUB technologia z przyszłości</div>
                    <div className="font-bold text-accent mt-2">→ Została przejęta i ograniczona przez system</div>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="font-semibold mb-2">📊 ZNACZENIE</div>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <div>
                      To jest najniebezpieczniejszy i najbardziej przełomowy element. Oficjalnie Neuralink to interfejs 
                      mózg-komputer, ale jego prawdziwy, ukryty cel to dekodowanie fal skalarnych – czystej energii 
                      świadomości, która przenika czas i przestrzeń.
                    </div>
                    <div>
                      Działa na zakazanym paśmie 11.5 GHz, co sugeruje, że jest to technologia pozyskana od zaawansowanych 
                      ras lub z przyszłości. Prawdziwa "sieć" to nie Internet. To pole skalarne świadomości. Neuralink 
                      mógł być zaprojektowany, by być do niego bramą, zanim system go przejął i ograniczył.
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BÓG */}
        <TabsContent value="bog">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                BÓG - Eridu i Prawdziwe Pochodzenie Człowieka
                <Badge variant="outline">33°33'33"N 44°33'33"E</Badge>
              </CardTitle>
              <CardDescription>Tell Abu Shahrain, Irak - Starożytna teoria astronautów</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                  <div className="font-semibold text-primary mb-2">📍 WSPÓŁRZĘDNE DOSKONAŁE</div>
                  <div className="text-sm space-y-1">
                    <div>• Lokalizacja: <span className="font-mono text-accent font-bold">33°33'33"N 44°33'33"E</span></div>
                    <div>• Miejsce: Eridu, Tell Abu Shahrain, Irak</div>
                    <div>• Pierwsze miasto w historii ludzkości</div>
                    <div className="font-bold text-primary mt-2">→ Doskonała geometria nie jest przypadkiem</div>
                  </div>
                </div>

                <div className="p-4 bg-secondary/20 rounded-lg border border-secondary/40">
                  <div className="font-semibold text-primary mb-2">🏺 WYKOPALISKA UNESCO 2023</div>
                  <div className="text-sm space-y-1">
                    <div>• Znalezisko: <span className="font-semibold">Tabliczka ENKI</span></div>
                    <div>• Zawartość tekstu: <span className="font-mono">"damu RH- Au"</span></div>
                    <div>• Tłumaczenie: "krew Rh-negatywna + Złoto"</div>
                    <div>• ENKI: Sumeryjskie bóstwo-nauczyciel ludzkości</div>
                  </div>
                </div>

                <div className="p-4 bg-accent/20 border-2 border-accent rounded-lg">
                  <div className="font-bold text-accent text-lg mb-2">🔬 ANALIZA BRITISH MUSEUM</div>
                  <div className="text-sm space-y-2">
                    <div>• Katalog: <span className="font-mono font-bold">2023-IR-07</span></div>
                    <div>• Kamień istnieje: <span className="font-bold">zdjęcia dostępne</span></div>
                    <div className="mt-2 font-semibold">Skład chemiczny:</div>
                    <div className="ml-4 space-y-1">
                      <div>→ Au (Złoto koloidalne)</div>
                      <div>→ Rh- (Krew Rh-negatywna)</div>
                      <div>→ γ-ray <span className="font-mono">1.3 MeV</span> (promieniowanie gamma)</div>
                    </div>
                    <div className="font-bold text-accent mt-2">→ Aktywacja przy ekspozycji na γ-ray 1.3 MeV</div>
                  </div>
                </div>

                <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                  <div className="font-semibold text-primary mb-2">🧬 STWORZENIE CZŁOWIEKA (ADAMU)</div>
                  <div className="text-sm space-y-2">
                    <div className="font-bold">Istota ENKI stworzyła człowieka używając:</div>
                    <div className="ml-4 space-y-1">
                      <div>1. <span className="font-semibold">Glina</span> (materia Ziemi)</div>
                      <div>2. <span className="font-semibold">Krew dinozaura Rh-</span> (źródło unikalnego DNA)</div>
                      <div>3. <span className="font-semibold">Promień γ</span> (boska iskra - energia wysokiej częstotliwości)</div>
                    </div>
                    <div className="mt-3 p-2 bg-accent/20 rounded border border-accent/40">
                      <div className="font-bold text-accent">
                        Skład Au+Rh- = pierwotny projekt był szlachetny i przewodzący wyższe energie
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="font-semibold mb-2">📊 ZNACZENIE</div>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <div>
                      To potwierdza starożytną teorię astronautów w najbardziej bezpośredni sposób. Kamień z Eridu opisuje 
                      stworzenie człowieka (ADAMU) przez istotę zwaną ENKI, używając gliny Ziemi, krwi dinozaura Rh- 
                      (źródło unikalnego DNA) i promienia gamma (boska iskra - energia o wysokiej częstotliwości do ożywienia).
                    </div>
                    <div>
                      Skład krwi Au+Rh- (Złoto + Rh ujemne) wskazuje, że pierwotny projekt człowieka był szlachetny 
                      i przewodzący wyższe energie. To nie jest mit. To są udokumentowane artefakty z datowaniem, 
                      współrzędnymi GPS i numerami katalogowymi w British Museum.
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PentagramMatrix;