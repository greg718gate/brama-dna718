import { ResearchVaultComponent } from "@/components/ResearchVault";
import { ScientificPaperExport } from "@/components/ScientificPaperExport";

const ResearchVault = () => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <ScientificPaperExport />
      <ResearchVaultComponent />
    </div>
  );
};

export default ResearchVault;
