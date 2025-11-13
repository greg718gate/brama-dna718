import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Languages } from "lucide-react";

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setLanguage(language === 'pl' ? 'en' : 'pl')}
      className="gap-2"
    >
      <Languages className="w-4 h-4" />
      {language === 'pl' ? 'EN' : 'PL'}
    </Button>
  );
};
