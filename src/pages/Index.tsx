import { DNAGateGenerator } from "@/components/DNAGateGenerator";
import { PentagramSphere } from "@/components/PentagramSphere";
import { ProjectExplanation } from "@/components/ProjectExplanation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="relative min-h-screen overflow-y-auto">
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <LanguageSwitcher />
        <Button
          onClick={() => navigate("/vault")}
          variant="secondary"
          className="gap-2 shadow-lg"
        >
          <Shield className="w-4 h-4" />
          {t('vault.button')}
        </Button>
      </div>
      
      <div className="container mx-auto px-4 py-8 pb-16 space-y-8 max-w-7xl">
        <div className="pt-12 md:pt-8">
          <div className="text-center space-y-4 mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
              {t('header.truth')}
            </h1>
            <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-purple-500 via-primary to-purple-500 bg-clip-text text-transparent">
              {t('header.matrix')}
            </h2>
            <h3 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
              {t('header.wavefunction')}
            </h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DNAGateGenerator />
            <PentagramSphere />
          </div>
        </div>
        
        <ProjectExplanation />
      </div>
    </div>
  );
};

export default Index;
