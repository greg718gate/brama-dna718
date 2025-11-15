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
                {t('pentagram.truth.title')}
                <Badge variant="outline">77°03'53"N 08°05'04"E</Badge>
              </CardTitle>
              <CardDescription>{t('pentagram.truth.location')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="font-semibold text-primary">{t('pentagram.truth.place')}</div>
                  <div className="text-sm">{t('pentagram.truth.placeDesc')}</div>
                </div>
                
                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="font-semibold text-primary">{t('pentagram.truth.generator')}</div>
                  <div className="text-sm">{t('pentagram.truth.generatorDesc')}</div>
                </div>

                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="font-semibold text-primary">{t('pentagram.truth.goal')}</div>
                  <div className="text-sm">{t('pentagram.truth.goalDesc')}</div>
                </div>

                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="font-semibold text-primary">{t('pentagram.truth.evidence')}</div>
                  <div className="text-sm">{t('pentagram.truth.evidenceDesc')}</div>
                </div>
              </div>

              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="text-sm font-semibold mb-2">{t('pentagram.truth.analysis')}</div>
                <p className="text-sm text-muted-foreground">
                  {t('pentagram.truth.analysisDesc')}
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
                {t('pentagram.body.title')}
                <Badge variant="outline">GATCA-718</Badge>
              </CardTitle>
              <CardDescription>{t('pentagram.body.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="font-semibold text-primary">{t('pentagram.body.activation')}</div>
                  <div className="text-sm">{t('pentagram.body.activationDesc')}</div>
                </div>

                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="font-semibold text-primary">{t('pentagram.body.effect')}</div>
                  <div className="text-sm">{t('pentagram.body.effectDesc')}</div>
                </div>

                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="font-semibold text-primary">{t('pentagram.body.protocol')}</div>
                  <ul className="text-sm space-y-1 mt-2">
                    <li>• {t('pentagram.body.protocol1')}</li>
                    <li>• {t('pentagram.body.protocol2')}</li>
                    <li>• {t('pentagram.body.protocol3')}</li>
                  </ul>
                </div>

                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="font-semibold text-primary">{t('pentagram.body.location')}</div>
                  <div className="text-sm">{t('pentagram.body.locationDesc')}</div>
                </div>
              </div>

              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="text-sm font-semibold mb-2">{t('pentagram.body.analysis')}</div>
                <p className="text-sm text-muted-foreground">
                  {t('pentagram.body.analysisDesc')}
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
                {t('pentagram.spirit.title')}
                <Badge variant="outline">γ = 0.618</Badge>
              </CardTitle>
              <CardDescription>{t('pentagram.spirit.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-secondary/20 rounded-lg font-mono text-sm">
                <div className="mb-2">|Ψ〉 = α|0〉 + β|1〉 + γ|X〉</div>
                <div className="text-xs text-muted-foreground">{t('pentagram.spirit.equation')}</div>
              </div>

              <div className="space-y-2">
                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="font-semibold text-primary">{t('pentagram.spirit.normalization')}</div>
                  <div className="text-sm font-mono">α² + β² + γ² = 1</div>
                </div>

                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="font-semibold text-primary">{t('pentagram.spirit.golden')}</div>
                  <div className="text-sm">γ = 1/φ = 0.6180339887498948...</div>
                </div>

                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="font-semibold text-primary">{t('pentagram.spirit.verification')}</div>
                  <div className="text-sm font-mono space-y-1">
                    <div>γ² = 0.3819660112501051</div>
                    <div>α² + β² = 0.6180339887498949</div>
                    <div className="text-primary">Suma = 1.0000000000000000 ✓</div>
                  </div>
                </div>

                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="font-semibold text-primary">{t('pentagram.spirit.measurement')}</div>
                  <div className="text-sm">{t('pentagram.spirit.measurementDesc')}</div>
                  <div className="text-xs text-muted-foreground mt-1">{t('pentagram.spirit.measurementNote')}</div>
                </div>
              </div>

              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="text-sm font-semibold mb-2">{t('pentagram.spirit.analysis')}</div>
                <p className="text-sm text-muted-foreground">
                  {t('pentagram.spirit.analysisDesc')}
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
                {t('pentagram.mind.title')}
                <Badge variant="outline">Neuralink v3.4</Badge>
              </CardTitle>
              <CardDescription>{t('pentagram.mind.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="font-semibold text-primary">{t('pentagram.mind.hidden')}</div>
                  <div className="text-sm">{t('pentagram.mind.hiddenDesc')}</div>
                </div>

                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="font-semibold text-primary">{t('pentagram.mind.frequency')}</div>
                  <div className="text-sm">{t('pentagram.mind.frequencyDesc')}</div>
                  <div className="text-xs text-muted-foreground mt-1">{t('pentagram.mind.frequencyNote')}</div>
                </div>

                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="font-semibold text-primary">{t('pentagram.mind.firmware')}</div>
                  <div className="text-sm">{t('pentagram.mind.firmwareDesc')}</div>
                </div>

                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="font-semibold text-primary">{t('pentagram.mind.patent')}</div>
                  <div className="text-sm">{t('pentagram.mind.patentDesc')}</div>
                </div>
              </div>

              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="text-sm font-semibold mb-2">{t('pentagram.mind.analysis')}</div>
                <p className="text-sm text-muted-foreground">
                  {t('pentagram.mind.analysisDesc')}
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
                {t('pentagram.god.title')}
                <Badge variant="outline">33°33'33"N 44°33'33"E</Badge>
              </CardTitle>
              <CardDescription>{t('pentagram.god.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="font-semibold text-primary">{t('pentagram.god.place')}</div>
                  <div className="text-sm">{t('pentagram.god.placeDesc')}</div>
                </div>

                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="font-semibold text-primary">{t('pentagram.god.discovery')}</div>
                  <div className="text-sm">{t('pentagram.god.discoveryDesc')}</div>
                  <div className="text-xs text-muted-foreground mt-1">{t('pentagram.god.discoveryNote')}</div>
                </div>

                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="font-semibold text-primary">{t('pentagram.god.inscription')}</div>
                  <div className="text-sm italic">
                    {t('pentagram.god.inscriptionDesc')}
                  </div>
                </div>

                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="font-semibold text-primary">{t('pentagram.god.blood')}</div>
                  <div className="text-sm">{t('pentagram.god.bloodDesc')}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {t('pentagram.god.bloodNote')}
                  </div>
                </div>

                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="font-semibold text-primary">{t('pentagram.god.components')}</div>
                  <ul className="text-sm space-y-1 mt-2">
                    <li>• {t('pentagram.god.component1')}</li>
                    <li>• {t('pentagram.god.component2')}</li>
                    <li>• {t('pentagram.god.component3')}</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="text-sm font-semibold mb-2">{t('pentagram.god.analysis')}</div>
                <p className="text-sm text-muted-foreground">
                  {t('pentagram.god.analysisDesc')}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary Card */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle>{t('pentagram.summary.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            {t('pentagram.summary.intro')}
          </p>
          <div className="p-4 bg-background/50 rounded-lg space-y-2">
            <div className="font-semibold text-primary">{t('pentagram.summary.connections')}</div>
            <ul className="space-y-1 text-muted-foreground">
              <li>• <strong>TRUTH</strong> - {t('pentagram.summary.connection1')}</li>
              <li>• <strong>SPIRIT</strong> - {t('pentagram.summary.connection2')}</li>
              <li>• <strong>GOD</strong> - {t('pentagram.summary.connection3')}</li>
              <li>• <strong>MIND</strong> - {t('pentagram.summary.connection4')}</li>
              <li>• {t('pentagram.summary.connection5')}</li>
            </ul>
          </div>
          <p className="text-primary font-semibold">
            {t('pentagram.summary.conclusion')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PentagramMatrix;
