import React, { useState } from 'react';
import { useResonance } from '@/contexts/ResonanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Radio, Zap, Target, CheckCircle2, AlertCircle } from 'lucide-react';
import { DEFAULT_GATE_POSITIONS } from '@/lib/resonanceTuner';

export const ResonanceTuner: React.FC = () => {
  const { runAutoTune, tunedFrequency, state } = useResonance();
  const [isScanning, setIsScanning] = useState(false);
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    minZeta: number;
    iterations: number;
  } | null>(null);

  const handleScan = async () => {
    setIsScanning(true);
    
    // Małe opóźnienie dla efektu wizualnego
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const result = runAutoTune(DEFAULT_GATE_POSITIONS);
    
    setLastResult({
      success: result.success,
      minZeta: result.minZetaValue,
      iterations: result.iterations,
    });
    
    setTimeout(() => setIsScanning(false), 500);
  };

  const getStatusColor = () => {
    if (!lastResult) return 'bg-muted';
    if (lastResult.success) return 'bg-green-500/20 border-green-500/50';
    if (lastResult.minZeta < 1.0) return 'bg-yellow-500/20 border-yellow-500/50';
    return 'bg-red-500/20 border-red-500/50';
  };

  const getCoherencePercent = () => {
    if (!lastResult) return 0;
    return Math.max(0, Math.min(100, (1 - lastResult.minZeta / 15) * 100));
  };

  return (
    <Card className={`border transition-all duration-500 ${getStatusColor()}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Radio className={`h-5 w-5 ${isScanning ? 'animate-pulse text-primary' : 'text-muted-foreground'}`} />
          <span className="bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent font-mono">
            KALIBRATOR BRAMY
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Aktualna częstotliwość */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <span className="text-sm text-muted-foreground">Częstotliwość:</span>
          </div>
          <span className="font-mono text-lg text-foreground font-bold">
            {tunedFrequency.toFixed(4)} Hz
          </span>
        </div>

        {/* Przycisk skanowania */}
        <Button
          onClick={handleScan}
          disabled={isScanning}
          className={`w-full font-bold transition-all ${
            isScanning 
              ? 'bg-muted text-muted-foreground' 
              : 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black'
          }`}
          size="lg"
        >
          {isScanning ? (
            <>
              <Radio className="h-4 w-4 mr-2 animate-spin" />
              SKANOWANIE...
            </>
          ) : (
            <>
              <Target className="h-4 w-4 mr-2" />
              SKANUJ REZONANS
            </>
          )}
        </Button>

        {/* Wyniki skanowania */}
        {lastResult && (
          <div className="space-y-3 pt-2">
            {/* Status */}
            <div className="flex items-center gap-2">
              {lastResult.success ? (
                <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/50">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  BRAMA OTWARTA
                </Badge>
              ) : lastResult.minZeta < 1.0 ? (
                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  CZĘŚCIOWE WYRÓWNANIE
                </Badge>
              ) : (
                <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/50">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  BRAK REZONANSU
                </Badge>
              )}
            </div>

            {/* Koherencja */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Koherencja</span>
                <span>{getCoherencePercent().toFixed(1)}%</span>
              </div>
              <Progress value={getCoherencePercent()} className="h-2" />
            </div>

            {/* Szczegóły */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-background/30 border border-border/50">
                <span className="text-muted-foreground">|ζ(s)| min:</span>
                <div className="font-mono text-foreground">{lastResult.minZeta.toFixed(6)}</div>
              </div>
              <div className="p-2 rounded bg-background/30 border border-border/50">
                <span className="text-muted-foreground">Iteracje:</span>
                <div className="font-mono text-foreground">{lastResult.iterations.toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <p className="text-xs text-muted-foreground italic border-t border-border/50 pt-3">
          *System szuka punktu przecięcia z zerem Riemanna dla pozycji mtDNA rCRS.
          Próg otwarcia bramy: |ζ(s)| &lt; 0.1
        </p>
      </CardContent>
    </Card>
  );
};
