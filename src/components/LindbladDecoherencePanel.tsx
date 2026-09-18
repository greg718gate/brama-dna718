import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Loader2, Thermometer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useResonance } from "@/contexts/ResonanceContext";
import { mathWorker } from "@/lib/mathWorkerClient";
import type { LindbladResult } from "@/lib/lindbladCore";
import { BODY_TEMPERATURE_K } from "@/lib/lindbladCore";

const Metric = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
  <div className="rounded-lg border border-border bg-background/40 p-3">
    <div className="text-[11px] uppercase tracking-wide text-muted-foreground break-words">{label}</div>
    <div className="font-mono text-base sm:text-lg text-primary break-all">{value}</div>
    {hint ? <div className="text-[10px] text-muted-foreground break-words">{hint}</div> : null}
  </div>
);

export const LindbladDecoherencePanel = () => {
  const { language } = useLanguage();
  const { coherence } = useResonance();
  const pl = language === "pl";
  const tr = (p: string, e: string) => (pl ? p : e);

  const [result, setResult] = useState<LindbladResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setIsRunning(true);
    setError(null);
    try {
      const data = await mathWorker.lindblad({ coherence, cycles: 12, samples: 80, substeps: 24 });
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lindblad error");
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coherence]);

  const chart = useMemo(() => result?.series ?? [], [result]);

  return (
    <section className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-4 sm:p-6 space-y-4">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <Thermometer className="w-5 h-5 shrink-0" />
          <h2 className="font-mono font-semibold text-sm sm:text-base break-words">
            {tr("Model dekoherencji Lindblada — otoczenie biologiczne 37 °C", "Lindblad decoherence model — biological environment at 37 °C")}
          </h2>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed break-words">
          {tr(
            "Równanie mistrzowskie dρ/dt = −i[H, ρ] + Σ γ_k (L_k ρ L_k† − ½{L_k†L_k, ρ}) opisuje macierz 18 Bram jako układ otwarty, sprzężony z otoczeniem o stałej temperaturze 310.15 K (37 °C). Bez tego członu Hamiltonian ewoluowałby w idealnej próżni; kanały defazowania i relaksacji termicznej nadają mu realność biologiczną.",
            "The master equation dρ/dt = −i[H, ρ] + Σ γ_k (L_k ρ L_k† − ½{L_k†L_k, ρ}) treats the 18-Gate matrix as an open system coupled to an environment at a constant 310.15 K (37 °C). Without this term the Hamiltonian would evolve in a perfect vacuum; dephasing and thermal relaxation channels give it biological realism.",
          )}
        </p>
        <p className="text-[10px] text-muted-foreground italic break-words">
          {tr(
            "Prostymi słowami: sprawdzamy, jak szybko ciepło ciała rozmywa uporządkowany stan matrycy i jak długo dwa skrajne punkty pozostają ze sobą powiązane.",
            "In simple words: we check how quickly body heat blurs the ordered state of the matrix and how long the two extreme points stay linked.",
          )}
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={run} disabled={isRunning} variant="outline" className="font-mono text-xs">
          {isRunning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          {tr("Przelicz ewolucję ρ(t)", "Recompute ρ(t) evolution")}
        </Button>
        <span className="font-mono text-xs text-muted-foreground">
          {tr("Koherencja wejściowa", "Input coherence")}: <span className="text-primary">{(coherence * 100).toFixed(2)}%</span>
        </span>
      </div>

      {error ? <p className="text-xs text-destructive font-mono break-words">{error}</p> : null}

      {result ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            <Metric label={tr("Temperatura", "Temperature")} value={`${result.temperatureK.toFixed(2)} K`} hint="37 °C" />
            <Metric
              label={tr("Obsadzenie termiczne n̄", "Thermal occupation n̄")}
              value={result.thermalOccupation.toExponential(3)}
              hint="k_B·T / (h·718.57 Hz)"
            />
            <Metric label={tr("Czas defazowania T₂", "Dephasing time T₂")} value={result.physicalT2Label} />
            <Metric label={tr("Czystość końcowa Tr(ρ²)", "Final purity Tr(ρ²)")} value={result.finalPurity.toFixed(6)} />
            <Metric
              label={tr("Entropia splątania Alpha↔Sigma", "Entanglement entropy Alpha↔Sigma")}
              value={`${result.finalEntanglementEntropy.toFixed(4)} ${tr("bit", "bit")}`}
              hint={tr("Brama 1 (poz. 1) ⊗ Brama 18 (poz. 16179)", "Gate 1 (pos. 1) ⊗ Gate 18 (pos. 16179)")}
            />
            <Metric
              label={tr("Maksimum splątania", "Peak entanglement")}
              value={`${result.peakEntanglementEntropy.toFixed(4)} ${tr("bit", "bit")}`}
              hint={tr("max S w oknie ewolucji (0…1 bit)", "max S over the evolution window (0…1 bit)")}
            />
            <Metric label={tr("Szybkość defazowania γ_φ", "Dephasing rate γ_φ")} value={result.dephasingRate.toExponential(3)} hint={tr("na cykl nośnej", "per carrier cycle")} />
            <Metric label={tr("Wymiar macierzy", "Matrix dimension")} value={`${result.size} × ${result.size}`} />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="lindbladPurity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="tMs" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" unit=" ms" />
                <YAxis domain={[0, 1]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 11 }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area
                  type="monotone"
                  dataKey="purity"
                  name={tr("Czystość Tr(ρ²)", "Purity Tr(ρ²)")}
                  stroke="hsl(var(--primary))"
                  fill="url(#lindbladPurity)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="entanglementEntropy"
                  name={tr("Entropia splątania S [bit]", "Entanglement entropy S [bit]")}
                  stroke="#FFD700"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="coherenceAlphaSigma"
                  name={tr("Koherencja Alpha↔Sigma", "Alpha↔Sigma coherence")}
                  stroke="#00CED1"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[10px] text-muted-foreground italic break-words">
            {tr(
              `Obliczenia wykonywane lokalnie w Web Workerze (faza testowa). Entropia splątania S = −Tr(ρ_AS log₂ ρ_AS) liczona na zredukowanej podprzestrzeni skrajnych bram matrycy. Temperatura odniesienia: ${BODY_TEMPERATURE_K} K. Model matematyczny — nie stanowi podstawy do klinicznej oceny stanu zdrowia.`,
              `All computations run locally in a Web Worker (test phase). Entanglement entropy S = −Tr(ρ_AS log₂ ρ_AS) is evaluated on the reduced subspace of the matrix boundary gates. Reference temperature: ${BODY_TEMPERATURE_K} K. Mathematical model — not a basis for clinical health assessment.`,
            )}
          </p>
        </>
      ) : (
        <p className="text-xs text-muted-foreground font-mono">{tr("Trwa całkowanie równania mistrzowskiego…", "Integrating the master equation…")}</p>
      )}
    </section>
  );
};

export default LindbladDecoherencePanel;
