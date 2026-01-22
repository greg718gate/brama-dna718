import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import ResearchVault from "./pages/ResearchVault";
import GATCAZeta from "./pages/GATCAZeta";
import Symphony from "./pages/Symphony";
import Auth from "./pages/Auth";
import Unified from "./pages/Unified";
import Letter from "./pages/Letter";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
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

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
