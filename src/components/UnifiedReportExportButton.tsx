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
import { FileText, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { exportUnifiedReport, UnifiedReportOptions } from "@/lib/unifiedReportExport";

export const UnifiedReportExportButton = () => {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [authorName, setAuthorName] = useState("Grzegorz");
  const [email, setEmail] = useState("");
  const [exportLanguage, setExportLanguage] = useState<"pl" | "en">(language as "pl" | "en");

  const handleExport = () => {
    if (!authorName.trim()) {
      toast({
        title: language === "pl" ? "Wymagane pole" : "Required field",
        description: language === "pl" 
          ? "Podaj imię autora" 
          : "Please enter author name",
        variant: "destructive",
      });
      return;
    }

    const options: UnifiedReportOptions = {
      authorName: authorName.trim(),
      authorEmail: email.trim() || undefined,
      language: exportLanguage,
    };

    exportUnifiedReport(options);

    toast({
      title: language === "pl" ? "Raport wygenerowany!" : "Report generated!",
      description: language === "pl"
        ? "UNIFIED MATRIX MODEL v.1.0 został pobrany jako HTML."
        : "UNIFIED MATRIX MODEL v.1.0 has been downloaded as HTML.",
    });

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="glow" 
          size="lg" 
          className="gap-3 h-14 px-8 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        >
          <FileText className="w-5 h-5" />
          {language === "pl" 
            ? "UNIFIED MATRIX MODEL v.1.0" 
            : "UNIFIED MATRIX MODEL v.1.0"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            UNIFIED MATRIX MODEL v.1.0
          </DialogTitle>
          <DialogDescription>
            {language === "pl"
              ? "Profesjonalny raport techniczny dla instytucji naukowych. Zawiera wszystkie dane z Twojego projektu."
              : "Professional technical report for scientific institutions. Contains all data from your project."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="author">
              {language === "pl" ? "Imię autora *" : "Author name *"}
            </Label>
            <Input
              id="author"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Grzegorz"
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
          <Button onClick={handleExport} className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600">
            <Download className="w-4 h-4" />
            {language === "pl" ? "Pobierz raport" : "Download report"}
          </Button>
        </DialogFooter>

        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          {language === "pl"
            ? "Zawiera: Równanie Schrödingera, Wektor M, 18 Bram GATCA (pełna tabela), Kod Python/JS, Protokół 21-dniowy, Bibliografia"
            : "Contains: Schrödinger Equation, Vector M, 18 GATCA Gates (full table), Python/JS Code, 21-Day Protocol, Bibliography"}
        </div>
      </DialogContent>
    </Dialog>
  );
};
