import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Activity, TrendingUp, TrendingDown, Pause, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

interface Signal {
  timestamp: string;
  decision: number;
  decisionLabel: "BUY" | "SELL" | "WAIT";
  confidence: number;
  compositeSignal: number;
  price: number | null;
  layers: {
    correlation: number;
    harmonicStrength: number;
    phaseCoherence: number;
  };
  gateSignature: string;
  source?: string;
}

const MAX_HISTORY = 100;
const REFRESH_INTERVAL = 5000;

const QuantumFilterDashboard = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const tr = (pl: string, en: string) => (language === "pl" ? pl : en);

  const [signals, setSignals] = useState<Signal[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [lastSignal, setLastSignal] = useState<Signal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ buy: 0, sell: 0, wait: 0, total: 0 });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchSignal = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/quantum-filter`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-qf-key": "2912",
          },
          body: JSON.stringify({
            live: true,
            threshold: 0.98,
          }),
        }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const result: Signal = await response.json();
      
      setLastSignal(result);
      setSignals((prev) => [result, ...prev].slice(0, MAX_HISTORY));
      setStats((prev) => ({
        buy: prev.buy + (result.decisionLabel === "BUY" ? 1 : 0),
        sell: prev.sell + (result.decisionLabel === "SELL" ? 1 : 0),
        wait: prev.wait + (result.decisionLabel === "WAIT" ? 1 : 0),
        total: prev.total + 1,
      }));
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const startEngine = useCallback(() => {
    if (intervalRef.current) return;
    setIsRunning(true);
    fetchSignal();
    intervalRef.current = setInterval(fetchSignal, REFRESH_INTERVAL);
  }, [fetchSignal]);

  const stopEngine = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const getDecisionColor = (label: string) => {
    switch (label) {
      case "BUY": return "text-green-400";
      case "SELL": return "text-red-400";
      default: return "text-yellow-400";
    }
  };

  const getDecisionBg = (label: string) => {
    switch (label) {
      case "BUY": return "bg-green-500/20 border-green-500/50";
      case "SELL": return "bg-red-500/20 border-red-500/50";
      default: return "bg-yellow-500/20 border-yellow-500/50";
    }
  };

  const getDecisionIcon = (label: string) => {
    switch (label) {
      case "BUY": return <TrendingUp className="w-8 h-8 text-green-400" />;
      case "SELL": return <TrendingDown className="w-8 h-8 text-red-400" />;
      default: return <Pause className="w-8 h-8 text-yellow-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-4">
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <LanguageSwitcher />
        <Button onClick={() => navigate("/")} variant="secondary" size="sm" className="gap-2">
          <Home className="w-4 h-4" />
          {tr("Główna", "Home")}
        </Button>
        <Button onClick={() => navigate("/gatca-zeta")} variant="secondary" size="sm" className="gap-2">
          GATCA ζ
        </Button>
      </div>

      <div className="container mx-auto max-w-5xl pt-16 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-primary to-purple-500 bg-clip-text text-transparent">
            ⚛ Quantum Filter — Live BTC/USDT
          </h1>
          <p className="text-muted-foreground text-sm">
            GATCA-718 QF v2.1.0 • {tr("Prawdziwe dane z Binance", "Real Binance data")} • {tr("Odświeżanie co 5s", "Refresh every 5s")}
          </p>
        </div>

        <div className="flex justify-center gap-4">
          {!isRunning ? (
            <Button onClick={startEngine} className="gap-2 bg-green-600 hover:bg-green-700 text-white px-8">
              <Activity className="w-4 h-4" />
              {tr("URUCHOM SILNIK", "START ENGINE")}
            </Button>
          ) : (
            <Button onClick={stopEngine} variant="destructive" className="gap-2 px-8">
              <Pause className="w-4 h-4" />
              {tr("ZATRZYMAJ", "STOP")}
            </Button>
          )}
          <Button onClick={fetchSignal} variant="outline" className="gap-2" disabled={isRunning}>
            <RefreshCw className="w-4 h-4" />
            {tr("Jeden sygnał", "Single signal")}
          </Button>
        </div>

        {error && (
          <div className="text-center text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded p-2">
            {tr("Błąd", "Error")}: {error}
          </div>
        )}

        {lastSignal && (
          <Card className={`border-2 ${getDecisionBg(lastSignal.decisionLabel)}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  {getDecisionIcon(lastSignal.decisionLabel)}
                  <div>
                    <div className={`text-4xl font-bold ${getDecisionColor(lastSignal.decisionLabel)}`}>
                      {lastSignal.decisionLabel}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(lastSignal.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-bold text-foreground">
                    {lastSignal.confidence.toFixed(2)}%
                  </div>
                  <div className="text-sm text-muted-foreground">{tr("Pewność", "Confidence")}</div>
                </div>

                {lastSignal.price && (
                  <div className="text-right">
                    <div className="text-2xl font-mono text-foreground">
                      ${lastSignal.price.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">BTC/USDT</div>
                  </div>
                )}
              </div>

              {lastSignal.source && (
                <div className="mt-2 text-center">
                  <Badge variant="outline" className="text-xs bg-cyan-500/10 border-cyan-500/50 text-cyan-400">
                    {lastSignal.source === "BINANCE_LIVE" ? "🔴 LIVE BINANCE" : "CUSTOM"}
                  </Badge>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border/50">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">{tr("Korelacja GATCA", "GATCA Correlation")}</div>
                  <div className="font-mono text-sm">{lastSignal.layers.correlation.toFixed(6)}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">{tr("Rezonans harmoniczny", "Harmonic Resonance")}</div>
                  <div className="font-mono text-sm">{lastSignal.layers.harmonicStrength.toFixed(6)}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">{tr("Koherencja fazowa", "Phase Coherence")}</div>
                  <div className="font-mono text-sm">{lastSignal.layers.phaseCoherence.toFixed(6)}</div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground mt-2 text-center font-mono">
                {lastSignal.gateSignature}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{stats.total}</div>
              <div className="text-xs text-muted-foreground">{tr("Sygnałów", "Signals")}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{stats.buy}</div>
              <div className="text-xs text-muted-foreground">BUY</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-400">{stats.sell}</div>
              <div className="text-xs text-muted-foreground">SELL</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">{stats.wait}</div>
              <div className="text-xs text-muted-foreground">WAIT</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{tr("Historia sygnałów", "Signal History")}</CardTitle>
          </CardHeader>
          <CardContent>
            {signals.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {tr("Kliknij URUCHOM SILNIK żeby zacząć", "Click START ENGINE to begin")}
              </p>
            ) : (
              <div className="max-h-[400px] overflow-y-auto space-y-1">
                {signals.map((s, i) => (
                  <div
                    key={`${s.timestamp}-${i}`}
                    className="flex items-center justify-between px-3 py-2 rounded bg-secondary/30 text-sm font-mono"
                  >
                    <span className="text-muted-foreground text-xs">
                      {new Date(s.timestamp).toLocaleTimeString()}
                    </span>
                    <Badge
                      variant="outline"
                      className={`${getDecisionBg(s.decisionLabel)} ${getDecisionColor(s.decisionLabel)} font-bold min-w-[60px] justify-center`}
                    >
                      {s.decisionLabel}
                    </Badge>
                    <span className="text-foreground">{s.confidence.toFixed(2)}%</span>
                    <span className="text-muted-foreground text-xs">
                      {s.price ? `$${s.price.toFixed(0)}` : "—"}
                    </span>
                    <span className="text-muted-foreground text-xs hidden sm:inline">
                      {s.gateSignature}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuantumFilterDashboard;
