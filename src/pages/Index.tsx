import { DNAGateGenerator } from "@/components/DNAGateGenerator";
import { PentagramSphere } from "@/components/PentagramSphere";
import { ProjectExplanation } from "@/components/ProjectExplanation";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-y-auto">
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={() => navigate("/vault")}
          variant="secondary"
          className="gap-2 shadow-lg"
        >
          <Shield className="w-4 h-4" />
          Skarbiec Odkryć
        </Button>
      </div>
      
      <div className="container mx-auto px-4 py-8 pb-16 space-y-8 max-w-7xl">
        <div className="pt-12 md:pt-0">
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
