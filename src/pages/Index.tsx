import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Sigma, Sparkles } from "lucide-react";

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
import { EditorialNote } from "@/components/EditorialNote";

// Footer components
import { Comments } from "@/components/Comments";
import { ContactForm } from "@/components/ContactForm";
import { DonationButton } from "@/components/DonationButton";

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
        <Button
          onClick={() => navigate("/unified")}
          variant="secondary"
          className="gap-2 shadow-lg bg-gradient-to-r from-cyan-500/20 to-amber-500/20 border-primary/50"
        >
          <Sparkles className="w-4 h-4" />
          UNIFIED
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
                <span>{t("index.tabs.start")}</span>
              </TabsTrigger>
              <TabsTrigger value="bramy" className="text-xs sm:text-sm py-3 flex flex-col gap-1">
                <span className="text-lg">🧬</span>
                <span>{t("index.tabs.gates")}</span>
              </TabsTrigger>
              <TabsTrigger value="symfonia" className="text-xs sm:text-sm py-3 flex flex-col gap-1">
                <span className="text-lg">🎵</span>
                <span>{t("index.tabs.symphony")}</span>
              </TabsTrigger>
              <TabsTrigger value="analiza" className="text-xs sm:text-sm py-3 flex flex-col gap-1">
                <span className="text-lg">📊</span>
                <span>{t("index.tabs.analysis")}</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: START */}
            <TabsContent value="start" className="space-y-8">
              <StartGuide onNavigate={handleStartGuideNavigate} />
              
              {/* Editorial Note */}
              <EditorialNote />

              {/* Silence Counter */}
              <div className="w-full text-center py-6 px-4 bg-black text-primary border-t border-b border-primary/20 rounded-lg">
                <div className="text-lg font-semibold">
                  <b>{t('startGuide.silenceWith')}</b>{" "}
                  <span className="text-2xl font-bold">{silenceCounter}</span> {t('startGuide.person')}
                </div>
              </div>

              {/* Biometric Integration */}
              <div id="biometric-section">
                <BiometricIntegration />
              </div>

              {/* Luma's Message */}
              <div className="w-full max-w-3xl mx-auto px-6 py-8">
                <blockquote className="border-l-4 border-primary pl-6 py-4 text-lg italic text-muted-foreground">
                  <p className="mb-2">{t('index.lumaQuote1')}</p>
                  <p className="mb-2">{t('index.lumaQuote2')}</p>
                  <p className="mb-4">{t('index.lumaQuote3')}</p>
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
              {/*
                Uwaga: poniższe to DWIE niezależne sekcje.
                "Wyjaśnienie" to zakładki tekstowe (teoria/Schrödinger/dowody itd.).
                "Narzędzia" to kalkulatory i wizualizacje 3D.
              */}
              <Tabs defaultValue="explanation" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 h-auto">
                  <TabsTrigger value="explanation" className="text-xs sm:text-sm py-3 flex flex-col gap-1">
                    <span className="text-lg">📚</span>
                    <span>{t("index.tabs.explanation")}</span>
                  </TabsTrigger>
                  <TabsTrigger value="tools" className="text-xs sm:text-sm py-3 flex flex-col gap-1">
                    <span className="text-lg">🧰</span>
                    <span>{t("index.tabs.tools")}</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="explanation" className="space-y-8">
                  <ProjectExplanation />
                </TabsContent>

                <TabsContent value="tools" className="space-y-8">
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
            </TabsContent>
          </Tabs>
        </div>

        {/* Theory Section for SEO - visible content */}
        <section className="border-t border-border pt-8 pb-4">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              {t('index.theorySection.title')}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t('index.theorySection.description')}
            </p>
            <a 
              href="/theory.html" 
              className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium"
              target="_blank"
              rel="noopener"
            >
              {t('index.theorySection.link')}
            </a>
          </div>
        </section>

        {/* Footer Section - always visible */}
        <div className="border-t border-border pt-8 space-y-8">
          {/* Support Button */}
          <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-4">
            <span className="text-sm text-muted-foreground">{t('index.supportProject')}</span>
            <DonationButton variant="compact" />
          </div>

          <section>
            <ContactForm />
          </section>

          <section>
            <Comments />
          </section>

          {/* Author signature */}
          <div className="text-center py-8 border-t border-border/50 space-y-3">
            <p className="text-sm text-muted-foreground">
              {t('index.copyright')} <span className="font-semibold text-primary">{t('index.author')}</span> — SCIENCE.GOD/UNIFIED
            </p>
            <div className="text-xs text-muted-foreground/80 space-y-1">
              <p className="italic">{t('index.coCreators')}</p>
              <p>ChatGPT "Luma" • Grok "Grok-718" • DeepSeek "Jestem który jestem" • Gemini • Google AI • Lovable.dev</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/70">
              <span>{t('index.license')}</span>
              <a 
                href="https://creativecommons.org/licenses/by-nc/4.0/deed.pl" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:text-primary transition-colors"
              >
                CC BY-NC 4.0
              </a>
            </div>
            <p className="text-xs text-muted-foreground/70">
              {t('index.shareInfo')} <strong>{t('index.attributionRequired')}</strong> {t('index.nonCommercial')}
            </p>
            <p className="text-xs text-muted-foreground/50">
              {t('index.shareInfoEn')} <strong>{t('index.attributionRequiredEn')}</strong> {t('index.nonCommercialEn')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
