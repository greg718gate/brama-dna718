import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  Zap, 
  Target, 
  Download, 
  Play, 
  BarChart3,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react";
import { generateSymphony } from "@/lib/symphonyGenerator";
import { 
  analyzeCorrelation, 
  exportCorrelationPythonCode,
  AnalysisResult,
} from "@/lib/riemannCorrelationAnalyzer";
import { GAMMA } from "@/lib/bramaUnificationEngine";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const RiemannCorrelationAnalyzer = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const { language } = useLanguage();
  const tr = (pl: string, en: string) => (language === "pl" ? pl : en);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setProgress(10);
    
    try {
      // 1. Generowanie symfonii
      setProgress(20);
      const audioContext = new AudioContext();
      
      setProgress(40);
      const { audioBuffer } = await generateSymphony(audioContext);
      
      setProgress(70);
      
      // 2. Analiza korelacji
      const result = analyzeCorrelation(audioBuffer, 0);
      
      setProgress(100);
      setAnalysisResult(result);
      
      toast({
        title: tr("Analiza zakończona", "Analysis complete"),
        description: `${tr("Skuteczność unifikacji", "Unification effectiveness")}: ${result.successRate.toFixed(2)}%`,
      });
      
      await audioContext.close();
    } catch (error) {
      console.error("Błąd analizy:", error);
      toast({
        title: tr("Błąd analizy", "Analysis error"),
        description: tr("Nie udało się przeprowadzić analizy korelacji", "Could not complete the correlation analysis"),
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadPythonScript = () => {
    const code = exportCorrelationPythonCode();
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'riemann_correlation_analyzer.py';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: tr("Pobrano skrypt Python", "Python script downloaded"),
      description: "riemann_correlation_analyzer.py",
    });
  };

  const getSuccessColor = (rate: number) => {
    if (rate >= 70) return "text-green-400";
    if (rate >= 40) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <Card className="bg-black/40 border-purple-500/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-300">
          <Activity className="w-5 h-5" />
          {tr("Analiza Korelacji: Symfonia vs. Funkcja Zeta", "Correlation Analysis: Symphony vs. Zeta Function")}
        </CardTitle>
        <p className="text-sm text-gray-400">
          {tr(
            "Szukanie punktów wspólnych między dźwiękiem a linią krytyczną Riemanna (s = 1/2 + iE/ħ)",
            "Searching for common points between sound and the Riemann critical line (s = 1/2 + iE/ħ)",
          )}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Control Panel */}
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={runAnalysis}
            disabled={isAnalyzing}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {tr("Analizuję...", "Analyzing...")}
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                {tr("Uruchom Analizę", "Run Analysis")}
              </>
            )}
          </Button>
          
          <Button
            onClick={downloadPythonScript}
            variant="outline"
            className="border-purple-500/50"
          >
            <Download className="w-4 h-4 mr-2" />
            {tr("Pobierz Skrypt Python", "Download Python Script")}
          </Button>
        </div>

        {/* Progress Bar */}
        {isAnalyzing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-400">
              <span>{tr("Postęp analizy", "Analysis progress")}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Results */}
        {analysisResult && (
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-black/50">
              <TabsTrigger value="summary">{tr("Podsumowanie", "Summary")}</TabsTrigger>
              <TabsTrigger value="details">{tr("Szczegóły", "Details")}</TabsTrigger>
              <TabsTrigger value="peaks">{tr("Bramy (Szczyty)", "Gates (Peaks)")}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary" className="space-y-4 mt-4">
              {/* Main Result */}
              <div className="text-center p-6 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg border border-purple-500/30">
                <p className="text-gray-400 mb-2">{tr("SKUTECZNOŚĆ UNIFIKACJI", "UNIFICATION EFFECTIVENESS")}</p>
                <p className={`text-5xl font-bold ${getSuccessColor(analysisResult.successRate)}`}>
                  {analysisResult.successRate.toFixed(2)}%
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {tr("trafień blisko zera Riemanna", "hits near a Riemann zero")}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-black/30 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <Zap className="w-4 h-4" />
                    <span className="text-xs">{tr("Wykryte Bramy", "Detected Gates")}</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {analysisResult.totalPeaks}
                  </p>
                </div>
                
                <div className="bg-black/30 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <Target className="w-4 h-4" />
                    <span className="text-xs">{tr("Blisko Zera", "Near Zero")}</span>
                  </div>
                  <p className="text-2xl font-bold text-green-400">
                    {analysisResult.nearZeroCount}
                  </p>
                </div>
                
                <div className="bg-black/30 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <BarChart3 className="w-4 h-4" />
                    <span className="text-xs">{tr("Średnia |ζ(s)|", "Average |ζ(s)|")}</span>
                  </div>
                  <p className="text-lg font-bold text-blue-400">
                    {analysisResult.averageZetaMagnitude.toFixed(4)}
                  </p>
                </div>
                
                <div className="bg-black/30 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <Activity className="w-4 h-4" />
                    <span className="text-xs">{tr("Próg γ", "γ threshold")}</span>
                  </div>
                  <p className="text-lg font-bold text-purple-400">
                    {GAMMA.toFixed(4)}
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="bg-black/30 p-4 rounded-lg border border-gray-700 space-y-3">
                <h4 className="text-purple-300 font-medium">{tr("Parametry Analizy", "Analysis Parameters")}</h4>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">{tr("Próg koherencji (γ):", "Coherence threshold (γ):")}</span>
                    <span className="ml-2 text-white">{GAMMA.toFixed(6)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">{tr("Próg zera Riemanna:", "Riemann zero threshold:")}</span>
                    <span className="ml-2 text-white">0.1</span>
                  </div>
                  <div>
                    <span className="text-gray-400">{tr("Częstotliwość bazowa:", "Base frequency:")}</span>
                    <span className="ml-2 text-white">718.57 Hz</span>
                  </div>
                  <div>
                    <span className="text-gray-400">{tr("Stała Plancka (ħ):", "Planck constant (ħ):")}</span>
                    <span className="ml-2 text-white">1.0545718e-34 J·s</span>
                  </div>
                </div>
                
                <div className="border-t border-gray-700 pt-3 mt-3">
                  <h4 className="text-purple-300 font-medium mb-2">{tr("Statystyki |ζ(s)|", "|ζ(s)| Statistics")}</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Min:</span>
                      <span className="ml-2 text-green-400">
                        {analysisResult.minZetaMagnitude.toFixed(6)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">{tr("Średnia:", "Average:")}</span>
                      <span className="ml-2 text-blue-400">
                        {analysisResult.averageZetaMagnitude.toFixed(6)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Max:</span>
                      <span className="ml-2 text-red-400">
                        {analysisResult.maxZetaMagnitude.toFixed(6)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-700 pt-3 mt-3">
                  <h4 className="text-purple-300 font-medium mb-2">{tr("Równanie Analizy", "Analysis Equation")}</h4>
                  <code className="text-xs bg-black/50 p-2 rounded block text-gray-300 break-words whitespace-normal">
                    s = 1/2 + i(E/ħ), {tr("gdzie", "where")} E = t × 718.57 × ħ
                  </code>
                  <p className="text-[10px] text-gray-500 italic mt-1">
                    718.57 Hz = 718.57012515426885574359120304128340312332181477461 Hz ({tr("50 miejsc po przecinku", "50 decimal places")})
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {tr("Dla każdego szczytu t, obliczamy |ζ(s)| i sprawdzamy, czy < 0.1", "For each peak t, |ζ(s)| is calculated and checked for < 0.1")}
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="peaks" className="mt-4">
              <div className="max-h-80 overflow-y-auto bg-black/30 rounded-lg border border-gray-700">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-black/80">
                    <tr className="text-gray-400 border-b border-gray-700">
                      <th className="p-2 text-left">#</th>
                      <th className="p-2 text-left">{tr("Czas (s)", "Time (s)")}</th>
                      <th className="p-2 text-left">{tr("Energia (J)", "Energy (J)")}</th>
                      <th className="p-2 text-left">|ζ(s)|</th>
                      <th className="p-2 text-center">{tr("Status", "Status")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysisResult.correlations.slice(0, 50).map((corr, index) => (
                      <tr 
                        key={index} 
                        className="border-b border-gray-800 hover:bg-purple-900/20"
                      >
                        <td className="p-2 text-gray-400">{index + 1}</td>
                        <td className="p-2 text-white">{corr.peakTime.toFixed(4)}</td>
                        <td className="p-2 text-blue-300">{corr.energy.toExponential(2)}</td>
                        <td className="p-2 text-purple-300">{corr.zetaValue.toFixed(4)}</td>
                        <td className="p-2 text-center">
                          {corr.isNearZero ? (
                            <Badge className="bg-green-600/20 text-green-400 border-green-500/30">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Zero
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-600/20 text-gray-400 border-gray-500/30">
                              <XCircle className="w-3 h-3 mr-1" />
                              —
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {analysisResult.correlations.length > 50 && (
                  <p className="text-center text-gray-500 py-2 text-sm">
                    {tr("Pokazano 50 z", "Showing 50 of")} {analysisResult.correlations.length} {tr("wyników", "results")}
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Info */}
        {!analysisResult && !isAnalyzing && (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{tr('Kliknij "Uruchom Analizę" aby rozpocząć', 'Click "Run Analysis" to begin')}</p>
            <p className="text-xs mt-2">
              {tr(
                "Analiza wygeneruje Symfonię 18 Bram DNA i sprawdzi korelację z linią krytyczną Riemanna",
                "The analysis will generate the 18 DNA Gates Symphony and check correlation with the Riemann critical line",
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RiemannCorrelationAnalyzer;
