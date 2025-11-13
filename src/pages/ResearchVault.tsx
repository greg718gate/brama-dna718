import { useState, useEffect } from "react";
import { ResearchVaultComponent, Research } from "@/components/ResearchVault";
import { ScientificPaperExport } from "@/components/ScientificPaperExport";

const ResearchVault = () => {
  const [researches, setResearches] = useState<Research[]>([]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("research_vault");
    if (saved) {
      setResearches(JSON.parse(saved));
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <ScientificPaperExport researches={researches} />
      <ResearchVaultComponent onResearchesChange={setResearches} />
    </div>
  );
};

export default ResearchVault;
