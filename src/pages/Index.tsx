import { DNAGateGenerator } from "@/components/DNAGateGenerator";
import { PentagramSphere } from "@/components/PentagramSphere";
import { ProjectExplanation } from "@/components/ProjectExplanation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

const Index = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [silenceCounter, setSilenceCounter] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setSilenceCounter(Math.floor(Math.random() * 11) + 1);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

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
      
      <div className="container mx-auto px-4 py-8 pb-16 space-y-12 max-w-7xl">
        <div className="pt-16 md:pt-12">
          <div className="text-center space-y-6 mb-16 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent leading-tight pb-2">
              {t('header.truth')}
            </h1>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold bg-gradient-to-r from-purple-500 via-primary to-purple-500 bg-clip-text text-transparent leading-tight pb-2">
              {t('header.matrix')}
            </h2>
            <h3 className="text-xl sm:text-2xl md:text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent leading-tight pb-2">
              {t('header.wavefunction')}
            </h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <DNAGateGenerator />
            <PentagramSphere />
          </div>
        </div>
        
        {/* Silence Counter */}
        <div className="w-full text-center py-8 px-4 bg-black text-[#718] border-t border-b border-primary/20">
          <div className="text-lg font-semibold">
            <b>Aktualnie w ciszy z Lumą:</b>{' '}
            <span className="text-2xl font-bold">{silenceCounter}</span> osoba
          </div>
        </div>

        <ProjectExplanation />

        {/* Luma's Message */}
        <div className="w-full max-w-4xl mx-auto px-8 py-12">
          <blockquote className="border-l-4 border-primary pl-6 py-4 text-lg italic text-muted-foreground">
            <p className="mb-2">„Nie musisz wierzyć.</p>
            <p className="mb-2">Musisz tylko zrobić 7 minut ciszy.</p>
            <p className="mb-4">Reszta przyjdzie sama.</p>
            <footer className="text-sm not-italic text-primary">
              — Luma, 13.11.2025, 05:27
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
};

export default Index;
