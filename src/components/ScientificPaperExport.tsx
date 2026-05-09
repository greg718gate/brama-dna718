import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Download } from "lucide-react";
import { exportScientificPaper } from "@/lib/scientificPaperExport";
import { toast } from "sonner";
import { Research } from "./ResearchVault";
import { useLanguage } from "@/contexts/LanguageContext";

interface ScientificPaperExportProps {
  researches: Research[];
}

export const ScientificPaperExport = ({ researches }: ScientificPaperExportProps) => {
  const { t, language } = useLanguage();
  const [author, setAuthor] = useState("");
  const [affiliation, setAffiliation] = useState("");
  const [email, setEmail] = useState("");
  const [abstract, setAbstract] = useState(
    language === 'pl' 
      ? "Te badania eksplorują matematyczne połączenia między strukturą DNA, złotym współczynnikiem (φ ≈ 1.618) i zasadami świętej geometrii. Analiza ujawnia, że helikalna struktura DNA zawiera złoty współczynnik poprzez kąty między parami zasad (137.5° = 360°/φ²) i relacje przestrzenne. Geometria pentagramu służy jako wizualna i matematyczna rama do zrozumienia organizacji molekularnej. Dodatkowo, analiza częstotliwości identyfikuje związki między rezonansem biologicznym (718.57 Hz) a rezonansem Schumanna Ziemi (7.83 Hz). Wyniki pokazują dokładność pomiarów geometrycznych w granicach 0.2% wartości teoretycznych, sugerując fundamentalne zasady organizacyjne w systemach biologicznych."
      : "This research explores mathematical connections between DNA structure, the golden ratio (φ ≈ 1.618), and sacred geometry principles. Analysis reveals that DNA's helical structure incorporates the golden ratio through base pair angles (137.5° = 360°/φ²) and spatial relationships. The pentagram geometry serves as a visual and mathematical framework for understanding molecular organization. Additionally, frequency analysis identifies relationships between biological resonance (718.57 Hz) and Earth's Schumann resonance (7.83 Hz). Results show geometric measurement accuracy within 0.2% of theoretical predictions, suggesting fundamental organizational principles in biological systems."
  );
  const [keywords, setKeywords] = useState(
    language === 'pl'
      ? "struktura DNA, złoty współczynnik, święta geometria, pentagram, rezonans Schumanna, biologia matematyczna, mechanika kwantowa"
      : "DNA structure, golden ratio, sacred geometry, pentagram, Schumann resonance, mathematical biology, quantum mechanics"
  );

  const getDiscoveryWord = (count: number) => {
    if (count === 1) return t('paper.discovery');
    if (count >= 2 && count <= 4) return t('paper.discoveries2to4');
    return t('paper.discoveries5plus');
  };

  const handleExport = () => {
    if (!author.trim()) {
      toast.error(t('paper.errorAuthor'));
      return;
    }

    if (!abstract.trim()) {
      toast.error(t('paper.errorAbstract'));
      return;
    }

    if (researches.length === 0) {
      toast.error(t('paper.errorNoResearch'));
      return;
    }

    const keywordArray = keywords.split(',').map(k => k.trim()).filter(k => k);
    
    exportScientificPaper({
      author,
      affiliation: affiliation || undefined,
      email: email || undefined,
      abstract,
      keywords: keywordArray,
      researches,
    });

    toast.success(t('paper.success'), {
      description: t('paper.successDesc')
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6" />
          <CardTitle>{t('paper.title')}</CardTitle>
        </div>
        <CardDescription>
          {t('paper.subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="author">{t('paper.authorLabel')}</Label>
          <Input
            id="author"
            placeholder={t('paper.authorPlaceholder')}
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="affiliation">{t('paper.affiliationLabel')}</Label>
          <Input
            id="affiliation"
            placeholder={t('paper.affiliationPlaceholder')}
            value={affiliation}
            onChange={(e) => setAffiliation(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t('paper.emailLabel')}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t('paper.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="abstract">{t('paper.abstractLabel')}</Label>
          <Textarea
            id="abstract"
            rows={6}
            value={abstract}
            onChange={(e) => setAbstract(e.target.value)}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            {t('paper.abstractHint')}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="keywords">{t('paper.keywordsLabel')}</Label>
          <Input
            id="keywords"
            placeholder={t('paper.keywordsPlaceholder')}
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
          />
        </div>

        <div className="bg-muted p-4 rounded-lg space-y-2">
          <h4 className="font-semibold text-sm">📊 {t('paper.stats')}</h4>
          <p className="text-sm text-muted-foreground">
            {t('paper.containsDiscoveries')} {researches.length} {getDiscoveryWord(researches.length)} {t('paper.fromVault')}
          </p>
          <h4 className="font-semibold text-sm mt-3">🏴󠁧󠁢󠁳󠁣󠁴󠁿 {t('paper.forScotland')}</h4>
          <p className="text-sm text-muted-foreground">
            {t('paper.scotlandInfo')}
          </p>
          <ul className="text-xs text-muted-foreground space-y-1 ml-4">
            <li>• Preprints.org (bezpłatny serwer preprintów)</li>
            <li>• ResearchGate i Academia.edu</li>
            <li>• OSF Preprints i Zenodo</li>
            <li>• Kontakt z uniwersytetami szkockimi</li>
            <li>• Royal Society of Edinburgh</li>
          </ul>
        </div>

        <Button 
          onClick={handleExport} 
          className="w-full"
          size="lg"
        >
          <Download className="h-4 w-4 mr-2" />
          {t('paper.generateButton')}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          {t('paper.downloadInfo')}
        </p>
      </CardContent>
    </Card>
  );
};