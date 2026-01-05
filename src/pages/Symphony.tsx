import { Symphony18Gates } from "@/components/Symphony18Gates";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";

const SymphonyPage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-y-auto">
      {/* Navigation */}
      <div className="fixed top-4 left-4 z-50">
        <Button
          onClick={() => navigate("/")}
          variant="secondary"
          className="gap-2 shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <Home className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>
      
      <div className="container mx-auto px-4 py-8 pb-16 max-w-4xl">
        <div className="pt-16 md:pt-12">
          <Symphony18Gates />
        </div>
      </div>
    </div>
  );
};

export default SymphonyPage;
