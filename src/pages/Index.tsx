import { DNAGateGenerator } from "@/components/DNAGateGenerator";
import { PentagramSphere } from "@/components/PentagramSphere";
import { EquationOfExit } from "@/components/EquationOfExit";
import { ProjectExplanation } from "@/components/ProjectExplanation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Comments } from "@/components/Comments";
import { ContactForm } from "@/components/ContactForm";
import { PersonalKeyCalculator } from "@/components/PersonalKeyCalculator";
import { BiometricIntegration } from "@/components/BiometricIntegration";
import { StartGuide } from "@/components/StartGuide";
import { DNA18Gates } from "@/components/DNA18Gates";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Shield, Sigma, Heart, Music } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState, useRef } from "react";

const Index = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [silenceCounter, setSilenceCounter] = useState(1);
  const biometricRef = useRef<HTMLDivElement>(null);
  const gatesRef = useRef<HTMLDivElement>(null);

  const handleStartGuideNavigate = (section: string) => {
    if (section === "biometric" || section === "ritual") {
      biometricRef.current?.scrollIntoView({ behavior: "smooth" });
    } else if (section === "gates") {
      gatesRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setSilenceCounter(Math.floor(Math.random() * 11) + 1);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen overflow-y-auto">
      <div className="fixed top-4 right-4 z-50 flex flex-wrap gap-2 justify-end">
        <LanguageSwitcher />
        <Button
          onClick={() => document.getElementById("biometric")?.scrollIntoView({ behavior: "smooth" })}
          variant="secondary"
          className="gap-2 shadow-lg"
        >
          <Heart className="w-4 h-4" />
          Integracja Ψ
        </Button>
        <Button
          onClick={() => navigate("/symphony")}
          variant="secondary"
          className="gap-2 shadow-lg"
        >
          <Music className="w-4 h-4" />
          Symfonia
        </Button>
        <Button
          onClick={() => navigate("/gatca-zeta")}
          variant="secondary"
          className="gap-2 shadow-lg"
        >
          <Sigma className="w-4 h-4" />
          GATCA ζ
        </Button>
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
          
          {/* START GUIDE - dla nowych użytkowników */}
          <div className="w-full flex justify-center">
            <StartGuide onNavigate={handleStartGuideNavigate} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <DNAGateGenerator />
            <PentagramSphere />
          </div>

          {/* Equation of Exit - Full Width */}
          <div className="w-full">
            <EquationOfExit />
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

        {/* Personal Key Calculator */}
        <div className="w-full flex justify-center">
          <PersonalKeyCalculator />
        </div>

        {/* Biometric Integration */}
        <div id="biometric" ref={biometricRef} className="w-full flex justify-center scroll-mt-24">
          <BiometricIntegration />
        </div>
        
        {/* 18 DNA Gates - Full Guide */}
        <div id="gates" ref={gatesRef} className="w-full flex justify-center scroll-mt-24">
          <DNA18Gates />
        </div>

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

        {/* Subtle Support Button */}
        <div className="w-full max-w-4xl mx-auto px-8 flex justify-end">
          <form 
            action="https://www.paypal.com/cgi-bin/webscr" 
            method="post" 
            target="_top"
          >
            <input type="hidden" name="cmd" value="_donations" />
            <input type="hidden" name="business" value="brama718@proton.me" />
            <input type="hidden" name="currency_code" value="GBP" />
            <input type="hidden" name="amount" value="1" />
            
            <Button 
              type="submit"
              variant="outline"
              className="gap-2 opacity-75 hover:opacity-100 transition-all border-primary/30 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)]"
            >
              <Heart className="w-4 h-4 animate-pulse" />
              Wesprzyj projekt
            </Button>
          </form>
        </div>

        <section className="py-12">
          <ContactForm />
        </section>

        <section className="py-12">
          <Comments />
        </section>
      </div>
    </div>
  );
};

export default Index;
