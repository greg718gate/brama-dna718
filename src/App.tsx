import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ResonanceProvider } from "@/contexts/ResonanceContext";
import Index from "./pages/Index";
import ResearchVault from "./pages/ResearchVault";
import GATCAZeta from "./pages/GATCAZeta";
import Symphony from "./pages/Symphony";
import Auth from "./pages/Auth";
import Unified from "./pages/Unified";
import Letter from "./pages/Letter";
import BiblicalDecoder from "./pages/BiblicalDecoder";
import GatesAtlas from "./pages/GatesAtlas";
import Prng from "./pages/Prng";
import QuantumFilterDashboard from "./pages/QuantumFilterDashboard";
import SourceArchive from "./pages/SourceArchive";
import MojeStudioWideo from "./pages/MojeStudioWideo";
import Zeta from "./pages/Zeta";
import ZetaIntegration from "./pages/ZetaIntegration";
import ZetaFAQ from "./pages/ZetaFAQ";
import ZetaLegal from "./pages/ZetaLegal";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <ResonanceProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              {/* Accept trailing slashes and any nested path */}
              <Route path="/vault" element={<ResearchVault />} />
              <Route path="/vault/*" element={<ResearchVault />} />

              <Route path="/gatca-zeta" element={<GATCAZeta />} />
              <Route path="/gatca-zeta/*" element={<GATCAZeta />} />

              <Route path="/symphony" element={<Symphony />} />
              <Route path="/symphony/*" element={<Symphony />} />

              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/*" element={<Auth />} />

              <Route path="/unified" element={<Unified />} />
              <Route path="/unified/*" element={<Unified />} />

              <Route path="/letter" element={<Letter />} />
              <Route path="/letter/*" element={<Letter />} />

              <Route path="/decoder" element={<BiblicalDecoder />} />
              <Route path="/decoder/*" element={<BiblicalDecoder />} />

              <Route path="/gates" element={<GatesAtlas />} />
              <Route path="/gates/*" element={<GatesAtlas />} />

              <Route path="/prng" element={<Prng />} />

              <Route path="/qf" element={<QuantumFilterDashboard />} />
              <Route path="/qf/*" element={<QuantumFilterDashboard />} />

              <Route path="/archive" element={<SourceArchive />} />
              <Route path="/archive/*" element={<SourceArchive />} />

              <Route path="/moje-studio-wideo" element={<MojeStudioWideo />} />
              <Route path="/moje-studio-wideo/*" element={<MojeStudioWideo />} />

              <Route path="/zeta/integration" element={<ZetaIntegration />} />
              <Route path="/zeta/faq" element={<ZetaFAQ />} />
              <Route path="/zeta" element={<Zeta />} />
              <Route path="/zeta/*" element={<Zeta />} />



              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ResonanceProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
