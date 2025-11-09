import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Research } from "@/components/ResearchVault";
import { Trash2, Calendar, User, Fingerprint } from "lucide-react";

export { ResearchEntry };

const categoryLabels: Record<string, string> = {
  quantum: "Fizyka kwantowa",
  chemistry: "Chemia",
  dna: "DNA / Genetyka",
  time: "Podróże w czasie",
  math: "Matematyka",
  physics: "Fizyka",
  other: "Inne",
};

const ResearchEntry = ({ research, onDelete }: { research: Research; onDelete: (id: string) => void }) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="p-6 border-2 border-primary/10 hover:border-primary/30 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary">{categoryLabels[research.category]}</Badge>
            <span className="text-xs text-muted-foreground">ID: {research.id}</span>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-1">{research.title}</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(research.id)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm font-semibold text-muted-foreground mb-1">OPIS</p>
          <p className="text-foreground whitespace-pre-wrap">{research.description}</p>
        </div>

        {research.equations && (
          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-1">RÓWNANIA / WZORY</p>
            <pre className="bg-secondary/20 p-3 rounded-lg text-xs overflow-x-auto border border-secondary/30">
              {research.equations}
            </pre>
          </div>
        )}

        {research.verification && (
          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-1">WERYFIKACJA</p>
            <pre className="bg-secondary/20 p-3 rounded-lg text-xs overflow-x-auto border border-secondary/30">
              {research.verification}
            </pre>
          </div>
        )}

        {/* Watermark & Metadata */}
        <div className="pt-4 border-t border-border space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <User className="w-3 h-3" />
            <span className="font-semibold">{research.author}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(research.timestamp)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono bg-primary/5 p-2 rounded border border-primary/20">
            <Fingerprint className="w-3 h-3 text-primary" />
            <span className="text-primary font-semibold">{research.watermark}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export const ResearchList = ({
  researches,
  onDelete,
}: {
  researches: Research[];
  onDelete: (id: string) => void;
}) => {
  return (
    <div className="space-y-4">
      {researches.map((research) => (
        <ResearchEntry key={research.id} research={research} onDelete={onDelete} />
      ))}
    </div>
  );
};
