import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Download, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { exportAcademicDocument, AcademicExportOptions } from "@/lib/academicExport";

interface AcademicExportButtonProps {
  variant?: "default" | "compact";
}

export const AcademicExportButton = ({ variant = "default" }: AcademicExportButtonProps) => {
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [institution, setInstitution] = useState("");
  const [email, setEmail] = useState("");
  const [exportLanguage, setExportLanguage] = useState<"pl" | "en">(language as "pl" | "en");

  const handleExport = () => {
    if (!authorName.trim()) {
      toast({
        title: language === "pl" ? "Wymagane pole" : "Required field",
        description: language === "pl" 
          ? "Podaj imię i nazwisko autora" 
          : "Please enter author name",
        variant: "destructive",
      });
      return;
    }

    const options: AcademicExportOptions = {
      authorName: authorName.trim(),
      institution: institution.trim() || undefined,
      email: email.trim() || undefined,
      language: exportLanguage,
    };

    exportAcademicDocument(options);

    toast({
      title: language === "pl" ? "Dokument wygenerowany!" : "Document generated!",
      description: language === "pl"
        ? "Plik HTML został pobrany. Otwórz go w przeglądarce i wydrukuj do PDF."
        : "HTML file downloaded. Open in browser and print to PDF.",
    });

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {variant === "compact" ? (
          <Button variant="outline" size="sm" className="gap-2">
            <GraduationCap className="w-4 h-4" />
            {language === "pl" ? "Eksport naukowy" : "Academic Export"}
          </Button>
        ) : (
          <Button 
            variant="glow" 
            size="lg" 
            className="gap-3 h-14 px-8"
          >
            <FileText className="w-5 h-5" />
            {language === "pl" 
              ? "Eksportuj dokument naukowy" 
              : "Export Academic Document"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            {language === "pl" 
              ? "Eksport dokumentu naukowego" 
              : "Academic Document Export"}
          </DialogTitle>
          <DialogDescription>
            {language === "pl"
              ? "Wygeneruj kompletny dokument naukowy do wysłania do uczelni i instytucji badawczych."
              : "Generate a complete academic document to send to universities and research institutions."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="author">
              {language === "pl" ? "Imię i nazwisko autora *" : "Author name *"}
            </Label>
            <Input
              id="author"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder={language === "pl" ? "Jan Kowalski" : "John Smith"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="institution">
              {language === "pl" ? "Instytucja (opcjonalnie)" : "Institution (optional)"}
            </Label>
            <Input
              id="institution"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder={language === "pl" ? "Uniwersytet Warszawski" : "University of Cambridge"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              {language === "pl" ? "Email kontaktowy (opcjonalnie)" : "Contact email (optional)"}
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label>{language === "pl" ? "Język dokumentu" : "Document language"}</Label>
            <Select value={exportLanguage} onValueChange={(v) => setExportLanguage(v as "pl" | "en")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pl">🇵🇱 Polski</SelectItem>
                <SelectItem value="en">🇬🇧 English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {language === "pl" ? "Anuluj" : "Cancel"}
          </Button>
          <Button onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" />
            {language === "pl" ? "Pobierz dokument" : "Download document"}
          </Button>
        </DialogFooter>

        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          {language === "pl"
            ? "Zawiera: 18 Bram DNA, Równanie Wyjścia, GATCA ζ, UNIFIED, kod Python"
            : "Includes: 18 DNA Gates, Equation of Exit, GATCA ζ, UNIFIED, Python code"}
        </div>
      </DialogContent>
    </Dialog>
  );
};
