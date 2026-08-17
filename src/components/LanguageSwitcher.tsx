import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Languages } from "lucide-react";

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  const nextLang = language === "pl" ? "en" : "pl";
  const label = nextLang === "en" ? "English" : "Polski";

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setLanguage(nextLang)}
      className="gap-2"
      aria-label={`Switch language to ${label}`}
      title={`English / Polski`}
    >
      <Languages className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">{nextLang === "en" ? "EN" : "PL"}</span>
    </Button>
  );
};
