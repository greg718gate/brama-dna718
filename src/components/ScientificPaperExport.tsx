import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Download } from "lucide-react";
import { exportScientificPaper } from "@/lib/scientificPaperExport";
import { toast } from "sonner";

export const ScientificPaperExport = () => {
  const [author, setAuthor] = useState("");
  const [affiliation, setAffiliation] = useState("");
  const [email, setEmail] = useState("");
  const [abstract, setAbstract] = useState(
    "This research explores mathematical connections between DNA structure, the golden ratio (φ ≈ 1.618), and sacred geometry principles. Analysis reveals that DNA's helical structure incorporates the golden ratio through base pair angles (137.5° = 360°/φ²) and spatial relationships. The pentagram geometry serves as a visual and mathematical framework for understanding molecular organization. Additionally, frequency analysis identifies relationships between biological resonance (718 Hz) and Earth's Schumann resonance (7.83 Hz). Results show geometric measurement accuracy within 0.2% of theoretical predictions, suggesting fundamental organizational principles in biological systems."
  );
  const [keywords, setKeywords] = useState(
    "DNA structure, golden ratio, sacred geometry, pentagram, Schumann resonance, mathematical biology, quantum mechanics"
  );

  const handleExport = () => {
    if (!author.trim()) {
      toast.error("Proszę podać nazwisko autora");
      return;
    }

    if (!abstract.trim()) {
      toast.error("Proszę dodać abstrakt");
      return;
    }

    const keywordArray = keywords.split(',').map(k => k.trim()).filter(k => k);
    
    exportScientificPaper({
      author,
      affiliation: affiliation || undefined,
      email: email || undefined,
      abstract,
      keywords: keywordArray,
    });

    toast.success("Dokument naukowy został wygenerowany!", {
      description: "Zapisz jako PDF używając 'Drukuj do PDF' w przeglądarce"
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6" />
          <CardTitle>Eksport Dokumentu Naukowego</CardTitle>
        </div>
        <CardDescription>
          Wygeneruj profesjonalny dokument do przedstawienia w społeczności naukowej
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="author">Autor / Badacz *</Label>
          <Input
            id="author"
            placeholder="np. Jan Kowalski"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="affiliation">Afiliacja / Instytucja (opcjonalne)</Label>
          <Input
            id="affiliation"
            placeholder="np. Uniwersytet w Edynburgu, Szkocja"
            value={affiliation}
            onChange={(e) => setAffiliation(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email kontaktowy (opcjonalny)</Label>
          <Input
            id="email"
            type="email"
            placeholder="np. j.kowalski@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="abstract">Abstrakt *</Label>
          <Textarea
            id="abstract"
            rows={6}
            value={abstract}
            onChange={(e) => setAbstract(e.target.value)}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Krótkie podsumowanie badań (150-250 słów)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="keywords">Słowa kluczowe (oddzielone przecinkami)</Label>
          <Input
            id="keywords"
            placeholder="DNA, golden ratio, pentagram..."
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
          />
        </div>

        <div className="bg-muted p-4 rounded-lg space-y-2">
          <h4 className="font-semibold text-sm">🏴󠁧󠁢󠁳󠁣󠁴󠁿 Dla badaczy w Szkocji:</h4>
          <p className="text-sm text-muted-foreground">
            Dokument zawiera instrukcje publikacji bez dostępu do arXiv:
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
          Generuj Dokument Naukowy
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Po wygenerowaniu użyj funkcji "Drukuj do PDF" w przeglądarce, aby zapisać jako PDF
        </p>
      </CardContent>
    </Card>
  );
};
