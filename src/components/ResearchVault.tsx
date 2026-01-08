import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResearchEntry, ResearchList } from "@/components/research/ResearchList";
import { exportToPDF } from "@/lib/pdfExport";
import { Download, Plus, Shield, Lock } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

export interface Research {
  id: string;
  title: string;
  category: string;
  description: string;
  equations: string;
  verification: string;
  author: string;
  timestamp: number;
  watermark: string;
}

interface ResearchVaultProps {
  onResearchesChange?: (researches: Research[]) => void;
}

export const ResearchVaultComponent = ({ onResearchesChange }: ResearchVaultProps = {}) => {
  const { t } = useLanguage();
  const [researches, setResearches] = useState<Research[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [author, setAuthor] = useState("");
  const [newResearch, setNewResearch] = useState({
    title: "",
    category: "quantum",
    description: "",
    equations: "",
    verification: "",
  });

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("research_vault");
    if (saved) {
      setResearches(JSON.parse(saved));
    }
    const savedAuthor = localStorage.getItem("research_author");
    if (savedAuthor) {
      setAuthor(savedAuthor);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (researches.length > 0) {
      localStorage.setItem("research_vault", JSON.stringify(researches));
    }
    if (onResearchesChange) {
      onResearchesChange(researches);
    }
  }, [researches, onResearchesChange]);

  const generateWatermark = (author: string, timestamp: number) => {
    const date = new Date(timestamp).toISOString();
    return `© ${author} | ${date} | ID: ${timestamp.toString(36).toUpperCase()}`;
  };

  const handleAddResearch = () => {
    if (!author.trim()) {
      toast.error(t('vault.enterName'));
      return;
    }
    if (!newResearch.title.trim() || !newResearch.description.trim()) {
      toast.error(t('vault.fillRequired'));
      return;
    }

    localStorage.setItem("research_author", author);

    const timestamp = Date.now();
    const research: Research = {
      id: `RES-${timestamp}`,
      ...newResearch,
      author,
      timestamp,
      watermark: generateWatermark(author, timestamp),
    };

    setResearches([research, ...researches]);
    setNewResearch({
      title: "",
      category: "quantum",
      description: "",
      equations: "",
      verification: "",
    });
    setShowForm(false);
    toast.success(t('vault.saved'));
  };

  const handleExportAll = () => {
    if (researches.length === 0) {
      toast.error(t('vault.noResearches'));
      return;
    }
    exportToPDF(researches, author);
    toast.success(t('vault.pdfGenerated'));
  };

  const handleDelete = (id: string) => {
    setResearches(researches.filter(r => r.id !== id));
    toast.success(t('vault.deleted'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="p-6 border-2 border-primary/20 bg-gradient-to-r from-primary/5 via-background to-secondary/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {t('vault.title')}
                </h1>
                <p className="text-sm text-muted-foreground">{t('vault.subtitle')}</p>
              </div>
            </div>
            <Lock className="w-6 h-6 text-primary/50" />
          </div>

          {/* Author Input */}
          <div className="space-y-2 bg-secondary/10 p-4 rounded-lg border border-secondary/30">
            <Label htmlFor="author" className="text-sm font-semibold">{t('vault.authorLabel')}</Label>
            <Input
              id="author"
              value={author}
              onChange={(e) => {
                setAuthor(e.target.value);
                localStorage.setItem("research_author", e.target.value);
              }}
              placeholder={t('vault.authorPlaceholder')}
              className="font-medium"
              maxLength={100}
            />
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={() => setShowForm(!showForm)}
            className="flex-1 gap-2"
            disabled={!author}
          >
            <Plus className="w-4 h-4" />
            {showForm ? t('vault.cancel') : t('vault.addNew')}
          </Button>
          <Button
            onClick={handleExportAll}
            variant="secondary"
            className="gap-2"
            disabled={researches.length === 0}
          >
            <Download className="w-4 h-4" />
            {t('vault.exportPdf')} ({researches.length})
          </Button>
        </div>

        {/* Add Form */}
        {showForm && (
          <Card className="p-6 border-2 border-primary/30 shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-primary">{t('vault.newDiscovery')}</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">{t('vault.titleLabel')}</Label>
                <Input
                  id="title"
                  value={newResearch.title}
                  onChange={(e) => setNewResearch({ ...newResearch, title: e.target.value })}
                  placeholder={t('vault.titlePlaceholder')}
                />
              </div>

              <div>
                <Label htmlFor="category">{t('vault.categoryLabel')}</Label>
                <Select
                  value={newResearch.category}
                  onValueChange={(value) => setNewResearch({ ...newResearch, category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quantum">{t('vault.category.quantum')}</SelectItem>
                    <SelectItem value="chemistry">{t('vault.category.chemistry')}</SelectItem>
                    <SelectItem value="dna">{t('vault.category.dna')}</SelectItem>
                    <SelectItem value="time">{t('vault.category.time')}</SelectItem>
                    <SelectItem value="math">{t('vault.category.math')}</SelectItem>
                    <SelectItem value="physics">{t('vault.category.physics')}</SelectItem>
                    <SelectItem value="frequency">{t('vault.category.frequency')}</SelectItem>
                    <SelectItem value="geometry">{t('vault.category.geometry')}</SelectItem>
                    <SelectItem value="other">{t('vault.category.other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">{t('vault.descriptionLabel')}</Label>
                <Textarea
                  id="description"
                  value={newResearch.description}
                  onChange={(e) => setNewResearch({ ...newResearch, description: e.target.value })}
                  placeholder={t('vault.descriptionPlaceholder')}
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="equations">{t('vault.equationsLabel')}</Label>
                <Textarea
                  id="equations"
                  value={newResearch.equations}
                  onChange={(e) => setNewResearch({ ...newResearch, equations: e.target.value })}
                  placeholder={t('vault.equationsPlaceholder')}
                  rows={4}
                  className="font-mono text-sm"
                />
              </div>

              <div>
                <Label htmlFor="verification">{t('vault.verificationLabel')}</Label>
                <Textarea
                  id="verification"
                  value={newResearch.verification}
                  onChange={(e) => setNewResearch({ ...newResearch, verification: e.target.value })}
                  placeholder={t('vault.verificationPlaceholder')}
                  rows={4}
                  className="font-mono text-sm"
                />
              </div>

              <Button onClick={handleAddResearch} className="w-full">
                {t('vault.saveButton')}
              </Button>
            </div>
          </Card>
        )}

        {/* Research List */}
        <ResearchList researches={researches} onDelete={handleDelete} />

        {researches.length === 0 && !showForm && (
          <Card className="p-12 text-center border-2 border-dashed border-primary/20">
            <Shield className="w-16 h-16 mx-auto mb-4 text-primary/30" />
            <p className="text-muted-foreground">{t('vault.empty')}</p>
          </Card>
        )}
      </div>
    </div>
  );
};