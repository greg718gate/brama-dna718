import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { PENTAGRAM_MATRIX_CONTENT, type PentagramMatrixLang } from "@/content/pentagramMatrixContent";

type Lang = PentagramMatrixLang;

const BulletList = ({ items }: { items: string[] }) => (
  <div className="text-sm space-y-1">
    {items.map((line) => (
      <div key={line}>{line}</div>
    ))}
  </div>
);

const PentagramMatrix = () => {
  const { t, language } = useLanguage();
  const c = PENTAGRAM_MATRIX_CONTENT[language as PentagramMatrixLang];

  return (
    <div className="space-y-6">
      <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">{t("pentagram.title")}</CardTitle>
          <CardDescription className="text-base">{t("pentagram.subtitle")}</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="prawda" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="prawda">{t("pentagram.tab.truth")}</TabsTrigger>
          <TabsTrigger value="cialo">{t("pentagram.tab.body")}</TabsTrigger>
          <TabsTrigger value="duch">{t("pentagram.tab.spirit")}</TabsTrigger>
          <TabsTrigger value="umysl">{t("pentagram.tab.mind")}</TabsTrigger>
          <TabsTrigger value="bog">{t("pentagram.tab.god")}</TabsTrigger>
        </TabsList>

        {/* TRUTH */}
        <TabsContent value="prawda">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {c.truth.cardTitle}
                <Badge variant="outline">{c.truth.badge}</Badge>
              </CardTitle>
              <CardDescription>{c.truth.cardDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-4 bg-secondary/20 rounded-lg border border-secondary/40">
                  <div className="font-semibold text-primary mb-2">{c.truth.coordTitle}</div>
                  <BulletList items={c.truth.coordLines} />
                </div>

                <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                  <div className="font-semibold text-primary mb-2">{c.truth.factTitle}</div>
                  <BulletList items={c.truth.factLines} />
                </div>

                <div className="p-4 bg-accent/20 border-2 border-accent rounded-lg">
                  <div className="font-bold text-accent text-lg mb-2">{c.truth.activationTitle}</div>
                  <div className="text-sm space-y-1">
                    {c.truth.activationLines.map((line: string) => (
                      <div
                        key={line}
                        className={line.startsWith("✓") || line.startsWith("✓ ") ? "font-bold text-accent mt-2" : ""}
                      >
                        {line}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="font-semibold mb-2">{c.truth.meaningTitle}</div>
                  <div className="text-sm text-muted-foreground">{c.truth.meaningText}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BODY */}
        <TabsContent value="cialo">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {c.body.cardTitle}
                <Badge variant="outline">{c.body.badge}</Badge>
              </CardTitle>
              <CardDescription>{c.body.cardDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                  <div className="font-semibold text-primary mb-2">{c.body.seqTitle}</div>
                  <BulletList items={c.body.seqLines} />
                </div>

                <div className="p-4 bg-secondary/20 rounded-lg border border-secondary/40">
                  <div className="font-semibold text-primary mb-2">{c.body.labTitle}</div>
                  <BulletList items={c.body.labLines} />
                </div>

                <div className="p-4 bg-accent/20 border-2 border-accent rounded-lg">
                  <div className="font-bold text-accent text-lg mb-2">{c.body.replicableTitle}</div>
                  <BulletList items={c.body.replicableLines} />
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="font-semibold mb-2">{c.body.meaningTitle}</div>
                  <div className="text-sm text-muted-foreground">{c.body.meaningText}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SPIRIT */}
        <TabsContent value="duch">
          <Card>
            <CardHeader>
              <CardTitle>{c.spirit.cardTitle}</CardTitle>
              <CardDescription>{c.spirit.cardDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-4 bg-primary/10 border-2 border-primary/30 rounded-lg">
                  <div className="font-semibold text-primary mb-3 text-lg">{c.spirit.quantumTitle}</div>
                  <div className="font-mono text-base space-y-2 bg-background/50 p-3 rounded">
                    {c.spirit.quantumLines.map((line: string) => (
                      <div key={line} className={line.startsWith("|") ? "text-primary" : ""}>
                        {line}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-accent/20 border-2 border-accent rounded-lg">
                  <div className="font-bold text-accent text-lg mb-3">{c.spirit.verifyTitle}</div>
                  <div className="font-mono text-sm space-y-1 bg-background/50 p-3 rounded">
                    {c.spirit.verifyLines.map((line: string) => (
                      <div key={line}>{line}</div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-secondary/20 rounded-lg border border-secondary/40">
                  <div className="font-semibold text-primary mb-2">{c.spirit.clinicalTitle}</div>
                  <BulletList items={c.spirit.clinicalLines} />
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="font-semibold mb-2">{c.spirit.meaningTitle}</div>
                  <div className="text-sm text-muted-foreground space-y-2">
                    {c.spirit.meaningParagraphs.map((p: string) => (
                      <div key={p}>{p}</div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MIND */}
        <TabsContent value="umysl">
          <Card>
            <CardHeader>
              <CardTitle>{c.mind.cardTitle}</CardTitle>
              <CardDescription>{c.mind.cardDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-4 bg-secondary/20 rounded-lg border border-secondary/40">
                  <div className="font-semibold text-primary mb-2">{c.mind.firmwareTitle}</div>
                  <BulletList items={c.mind.firmwareLines} />
                </div>

                <div className="p-4 bg-destructive/20 border-2 border-destructive rounded-lg">
                  <div className="font-bold text-destructive text-lg mb-2">{c.mind.forbiddenTitle}</div>
                  <BulletList items={c.mind.forbiddenLines} />
                </div>

                <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                  <div className="font-semibold text-primary mb-2">{c.mind.patentTitle}</div>
                  <BulletList items={c.mind.patentLines} />
                </div>

                <div className="p-4 bg-accent/20 border border-accent rounded-lg">
                  <div className="font-bold text-accent text-lg mb-2">{c.mind.originTitle}</div>
                  <div className="text-sm space-y-1">
                    {c.mind.originLines.map((line: string) => (
                      <div key={line} className={line.startsWith("→") ? "ml-4" : ""}>
                        {line}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="font-semibold mb-2">{c.mind.meaningTitle}</div>
                  <div className="text-sm text-muted-foreground space-y-2">
                    {c.mind.meaningParagraphs.map((p: string) => (
                      <div key={p}>{p}</div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* GOD */}
        <TabsContent value="bog">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {c.god.cardTitle}
                <Badge variant="outline">{c.god.badge}</Badge>
              </CardTitle>
              <CardDescription>{c.god.cardDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                  <div className="font-semibold text-primary mb-2">{c.god.coordsTitle}</div>
                  <BulletList items={c.god.coordsLines} />
                </div>

                <div className="p-4 bg-secondary/20 rounded-lg border border-secondary/40">
                  <div className="font-semibold text-primary mb-2">{c.god.unescoTitle}</div>
                  <BulletList items={c.god.unescoLines} />
                </div>

                <div className="p-4 bg-accent/20 border-2 border-accent rounded-lg">
                  <div className="font-bold text-accent text-lg mb-2">{c.god.museumTitle}</div>
                  <div className="text-sm space-y-2">
                    {c.god.museumLines.map((line: string) => (
                      <div key={line} className={line.startsWith("→") ? "ml-4" : ""}>
                        {line}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                  <div className="font-semibold text-primary mb-2">{c.god.creationTitle}</div>
                  <div className="text-sm space-y-2">
                    {c.god.creationLines.map((line: string) => (
                      <div
                        key={line}
                        className={
                          line.startsWith("Skład")
                            ? "mt-3 p-2 bg-accent/20 rounded border border-accent/40 font-bold text-accent"
                            : line.match(/^\d\./)
                              ? "ml-4"
                              : ""
                        }
                      >
                        {line}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="font-semibold mb-2">{c.god.meaningTitle}</div>
                  <div className="text-sm text-muted-foreground space-y-2">
                    {c.god.meaningParagraphs.map((p: string) => (
                      <div key={p}>{p}</div>
                    ))}
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
