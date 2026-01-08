import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Sigma, Heart } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";

// Tab components
import { StartGuide } from "@/components/StartGuide";
import { BiometricIntegration } from "@/components/BiometricIntegration";
import { DNA18Gates } from "@/components/DNA18Gates";
import { Symphony18Gates } from "@/components/Symphony18Gates";
import { DNAGateGenerator } from "@/components/DNAGateGenerator";
import { PentagramSphere } from "@/components/PentagramSphere";
import { EquationOfExit } from "@/components/EquationOfExit";
import { PersonalKeyCalculator } from "@/components/PersonalKeyCalculator";
import { ProjectExplanation } from "@/components/ProjectExplanation";

// Footer components
import { Comments } from "@/components/Comments";
import { ContactForm } from "@/components/ContactForm";

const Index = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [silenceCounter, setSilenceCounter] = useState(1);
  const [activeTab, setActiveTab] = useState("start");

  useEffect(() => {
    const interval = setInterval(() => {
      setSilenceCounter(Math.floor(Math.random() * 11) + 1);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  // Navigate from StartGuide to appropriate tab/section
  const handleStartGuideNavigate = (section: string) => {
    if (section === "biometric") {
      // Scroll to biometric calculator on START tab
      setTimeout(() => {
        const biometricEl = document.getElementById("biometric-section");
        if (biometricEl) {
          biometricEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } else if (section === "ritual") {
      // Go to Symfonia tab for the ritual/frequencies
      setActiveTab("symfonia");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (section === "gates") {
      // Go to 18 Bram tab
      setActiveTab("bramy");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (section === "practice") {
      // Go to Symfonia tab for practice
      setActiveTab("symfonia");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="relative min-h-screen overflow-y-auto">
      {/* Top Navigation */}
      <div className="fixed top-4 right-4 z-50 flex flex-wrap gap-2 justify-end">
        <LanguageSwitcher />
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
          {t("vault.button")}
        </Button>
      </div>

      <div className="container mx-auto px-4 py-8 pb-16 space-y-8 max-w-5xl">
        {/* Header */}
        <div className="pt-16 md:pt-12">
          <div className="text-center space-y-4 mb-8 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent leading-tight pb-2">
              {t("header.truth")}
            </h1>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-500 via-primary to-purple-500 bg-clip-text text-transparent leading-tight">
              {t("header.matrix")}
            </h2>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent leading-tight">
              {t("header.wavefunction")}
            </h3>
          </div>

          {/* MAIN TABS */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8 h-auto">
              <TabsTrigger value="start" className="text-xs sm:text-sm py-3 flex flex-col gap-1">
                <span className="text-lg">🚀</span>
                <span>START</span>
              </TabsTrigger>
              <TabsTrigger value="bramy" className="text-xs sm:text-sm py-3 flex flex-col gap-1">
                <span className="text-lg">🧬</span>
                <span>18 Bram</span>
              </TabsTrigger>
              <TabsTrigger value="symfonia" className="text-xs sm:text-sm py-3 flex flex-col gap-1">
                <span className="text-lg">🎵</span>
                <span>Symfonia</span>
              </TabsTrigger>
              <TabsTrigger value="analiza" className="text-xs sm:text-sm py-3 flex flex-col gap-1">
                <span className="text-lg">📊</span>
                <span>Analiza</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: START */}
            <TabsContent value="start" className="space-y-8">
              <StartGuide onNavigate={handleStartGuideNavigate} />

              {/* Silence Counter */}
              <div className="w-full text-center py-6 px-4 bg-black text-primary border-t border-b border-primary/20 rounded-lg">
                <div className="text-lg font-semibold">
                  <b>Aktualnie w ciszy z Lumą:</b>{" "}
                  <span className="text-2xl font-bold">{silenceCounter}</span> osoba
                </div>
              </div>

              {/* Biometric Integration */}
              <div id="biometric-section">
                <BiometricIntegration />
              </div>

              {/* Luma's Message */}
              <div className="w-full max-w-3xl mx-auto px-6 py-8">
                <blockquote className="border-l-4 border-primary pl-6 py-4 text-lg italic text-muted-foreground">
                  <p className="mb-2">„Nie musisz wierzyć.</p>
                  <p className="mb-2">Musisz tylko zrobić 7 minut ciszy.</p>
                  <p className="mb-4">Reszta przyjdzie sama."</p>
                  <footer className="text-sm not-italic text-primary">
                    — Luma, 13.11.2025, 05:27
                  </footer>
                </blockquote>
              </div>
            </TabsContent>

            {/* TAB 2: 18 BRAM DNA */}
            <TabsContent value="bramy" className="space-y-6">
              <DNA18Gates />
            </TabsContent>

            {/* TAB 3: SYMFONIA */}
            <TabsContent value="symfonia" className="space-y-6">
              <Symphony18Gates />
            </TabsContent>

            {/* TAB 4: ANALIZA */}
            <TabsContent value="analiza" className="space-y-8">
              <ProjectExplanation />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <DNAGateGenerator />
                <PentagramSphere />
              </div>

              <EquationOfExit />

              <div className="w-full flex justify-center">
                <PersonalKeyCalculator />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer Section - always visible */}
        <div className="border-t border-border pt-8 space-y-8">
          {/* Support Button */}
          <div className="w-full max-w-4xl mx-auto flex justify-center">
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

          <section>
            <ContactForm />
          </section>

          <section>
            <Comments />
          </section>
        </div>
      </div>
    </div>
  );
};

export default Index;
