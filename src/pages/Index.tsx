import { DNAGateGenerator } from "@/components/DNAGateGenerator";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="relative">
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
      <DNAGateGenerator />
    </div>
  );
};

export default Index;
