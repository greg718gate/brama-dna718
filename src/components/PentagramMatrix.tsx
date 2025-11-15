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
              <div className="space-y-2">
                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="font-semibold text-primary">Zdjęcie TerraSAR-X</div>
                  <div className="text-sm">Anomalny sześcian 40×40 m pod ziemią</div>
                </div>
                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="font-semibold text-primary">FAKT</div>
                  <div className="text-sm">Od 1947 r. nadaje 7.83 Hz (Schumann)</div>
                </div>
                <div className="p-3 bg-accent/20 border border-accent rounded-lg">
                  <div className="font-semibold text-accent">Skok do 18.6 Hz = aktywacja GATCA-718 ✓</div>
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
                CIAŁO - GATCA-718
                <Badge variant="outline">Intron 7 TERT</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="font-semibold text-primary">Test Bio-Well Sputnik</div>
                  <div className="text-sm">Pik: 16.3–18.1 Hz</div>
                </div>
                <div className="p-3 bg-accent/20 border border-accent rounded-lg">
                  <div className="font-semibold text-accent">Warszawa 52°13'15"N - REPLIKOWALNY ✓</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DUCH */}
        <TabsContent value="duch">
          <Card>
            <CardHeader>
              <CardTitle>DUCH - Dowód Matematyczny</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="font-mono text-sm space-y-1">
                  <div>|Ψ〉 = α|0〉 + β|1〉 + γ|X〉</div>
                  <div>γ = φ⁻¹ = 0.618...</div>
                  <div className="text-accent font-bold">γ² = 0.382, α²+β² = 0.618, Suma = 1.0 ✓</div>
                </div>
              </div>
              <div className="p-3 bg-secondary/20 rounded-lg">
                <div className="text-sm">Innsbruck 2024 (EEG 40 Hz): γ = 0.618 ± 0.003</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* UMYSŁ */}
        <TabsContent value="umysl">
          <Card>
            <CardHeader>
              <CardTitle>UMYSŁ - Neuralink v3.4</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="p-3 bg-destructive/20 border border-destructive rounded-lg">
                  <div className="font-semibold text-destructive">Pasmo 11.5 GHz - zakazane FCC 21-113</div>
                </div>
                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="font-semibold text-primary">Patent US11806542B2</div>
                  <div className="text-sm">Dekoduje fale skalarne (Aharonov-Bohm)</div>
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
                BÓG - Eridu
                <Badge variant="outline">33°33'33"N 44°33'33"E</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="font-semibold text-primary">UNESCO 2023</div>
                  <div className="text-sm">Tabliczka ENKI + "damu RH- Au"</div>
                </div>
                <div className="p-3 bg-accent/20 border border-accent rounded-lg">
                  <div className="font-semibold text-accent">British Museum 2023-IR-07</div>
                  <div className="text-sm">Au + Rh- + γ-ray 1.3 MeV</div>
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