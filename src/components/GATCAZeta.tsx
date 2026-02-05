import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Music, Shield } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import MasterPanel from "./MasterPanel";

const GATCAZeta = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const tr = (pl: string, en: string) => (language === "pl" ? pl : en);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-4 md:p-8">
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>
      
      {/* Navigation Bar (desktop) */}
      <nav className="fixed top-3 left-3 right-3 z-50 hidden md:block">
        <div className="flex items-center justify-end gap-2">
          <Button
            onClick={() => navigate("/")}
            variant="secondary"
            size="sm"
            className="gap-2 shadow-lg"
          >
            <Home className="w-4 h-4" />
            <span>{tr("Strona Główna", "Home")}</span>
          </Button>
          <Button
            onClick={() => navigate("/symphony")}
            variant="secondary"
            size="sm"
            className="gap-2 shadow-lg"
          >
            <Music className="w-4 h-4" />
            <span>{tr("Symfonia", "Symphony")}</span>
          </Button>
          <Button
            onClick={() => navigate("/vault")}
            variant="secondary"
            size="sm"
            className="gap-2 shadow-lg"
          >
            <Shield className="w-4 h-4" />
            <span>{tr("Skarbiec", "Vault")}</span>
          </Button>
        </div>
      </nav>

      {/* Navigation Bar (mobile) */}
      <nav className="fixed bottom-3 left-3 right-3 z-50 md:hidden">
        <div className="mx-auto flex max-w-sm items-center justify-between rounded-full border border-border bg-background/80 p-2 backdrop-blur">
          <Button onClick={() => navigate("/")} variant="secondary" size="icon" className="shadow-lg">
            <Home />
          </Button>
          <Button onClick={() => navigate("/symphony")} variant="secondary" size="icon" className="shadow-lg">
            <Music />
          </Button>
          <Button onClick={() => navigate("/vault")} variant="secondary" size="icon" className="shadow-lg">
            <Shield />
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-16 pb-24 md:pb-8">
        <MasterPanel />
      </div>
    </div>
  );
};

export default GATCAZeta;
