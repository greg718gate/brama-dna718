import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Loader2, Play, Radio, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { mathWorker } from "@/lib/mathWorkerClient";
import { renderStereoWav, type GateResonatorResult } from "@/lib/riemannHolographicMatrix";
import { CARRIER_FREQ, GATCA_POSITIONS } from "@/lib/gatca718Constants";

const Metric = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
  <div className="rounded-lg border border-border bg-background/40 p-3">
    <div className="text-[11px] uppercase tracking-wide text-muted-foreground break-words">{label}</div>
    <div className="font-mono text-base sm:text-lg text-primary break-all">{value}</div>
    {hint ? <div className="text-[10px] text-muted-foreground break-words">{hint}</div> : null}
  </div>
);

export const RiemannGateResonator = () => {
  const { language } = useLanguage();
  const pl = language === "pl";
  const tr = (p: string, e: string) => (pl ? p : e);

  const [gate, setGate] = useState(2);
  const [result, setResult] = useState<GateResonatorResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ctxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode[]>([]);

  const stopAudio = useCallback(() => {
    oscRef.current.forEach((o) => {
      try {
        o.stop();
        o.disconnect();
      } catch {
        /* already stopped */
      }
    });
    oscRef.current = [];
    if (ctxRef.current) {
      ctxRef.current.close();
      ctxRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  useEffect(() => () => stopAudio(), [stopAudio]);

  const run = async (target: number) => {
    setIsRunning(true);
    setError(null);
    stopAudio();
    try {
      const data = await mathWorker.gateResonator(target, 98);
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Resonator error");
    } finally {
      setIsRunning(false);
    }
  };

  const play = () => {
    if (!result || result.stableLines === 0) return;
    stopAudio();
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    ctxRef.current = ctx;
    const merger = ctx.createChannelMerger(2);
    const master = ctx.createGain();
    master.gain.value = 0.25;
    merger.connect(master);
    master.connect(ctx.destination);

    ([result.fExact, result.fTuning] as const).forEach((freq, channel) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      gain.gain.value = 0.5;
      osc.connect(gain);
      gain.connect(merger, 0, channel);
      osc.start();
      oscRef.current.push(osc);
    });
    setIsPlaying(true);
  };

  const exportWav = async () => {
    if (!result || result.stableLines === 0) return;
    setIsExporting(true);
    try {
      const blob = renderStereoWav(result.fExact, result.fTuning, 60);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `BRAMA_${result.gate}_RIEMANN_RESONATOR.wav`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-4 sm:p-6 space-y-4">
      <div className="flex items-center gap-2 text-primary">
        <Radio className="w-5 h-5 shrink-0" />
        <h2 className="font-mono font-semibold text-sm sm:text-base break-words">
          {tr("✦ Rezonator Holograficzny Riemanna (Δφ → Hz) ✦", "✦ Riemann Holographic Resonator (Δφ → Hz) ✦")}
        </h2>
      </div>

      <p className="text-xs text-muted-foreground break-words">
        {tr(
          `Nośna f_exact = 448. nietrywialne zero ζ Riemanna (${CARRIER_FREQ.toFixed(11)} Hz). Profil harmoniczny bramy wyznacza średni wektor przesunięcia fazy Δφ, a ten przelicza się na korekcyjną nośną f_tuning = f_exact · (1 + Δφ / 2π). Różnica obu nośnych to dudnienie różnicowe (binaural beat).`,
          `Carrier f_exact = 448th non-trivial zero of ζ (${CARRIER_FREQ.toFixed(11)} Hz). The gate harmonic profile yields the mean phase-shift vector Δφ, which maps to the corrective carrier f_tuning = f_exact · (1 + Δφ / 2π). The difference between carriers is the binaural beat.`,
        )}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {GATCA_POSITIONS.map((pos, i) => (
          <Button
            key={pos}
            size="sm"
            variant={gate === i + 1 ? "default" : "outline"}
            className="h-8 px-2 font-mono text-[11px]"
            onClick={() => {
              setGate(i + 1);
              void run(i + 1);
            }}
            disabled={isRunning}
          >
            B{i + 1}
          </Button>
        ))}
      </div>

      <Button onClick={() => void run(gate)} disabled={isRunning} className="w-full font-mono">
        {isRunning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
        {tr(`Generuj impuls fali dla Anteny B${gate}`, `Generate wave impulse for Antenna B${gate}`)}
      </Button>

      {error ? <div className="text-xs text-destructive break-words">{error}</div> : null}

      {result ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Metric
              label={tr("Stabilne linie (koherencja >98%)", "Stable lines (coherence >98%)")}
              value={`${result.stableLines}`}
              hint={tr(`Brama B${result.gate} — pozycja rCRS ${result.position}`, `Gate B${result.gate} — rCRS position ${result.position}`)}
            />
            <Metric
              label={tr("Średni wektor przesunięcia (Δφ)", "Mean phase-shift vector (Δφ)")}
              value={`${result.meanPhaseImpulse >= 0 ? "+" : ""}${result.meanPhaseImpulse.toFixed(6)} rad`}
            />
            <Metric
              label={tr("Korekcyjna częstotliwość nośna", "Corrective carrier frequency")}
              value={`${result.fTuning.toFixed(10)} Hz`}
              hint={tr("prawe ucho", "right ear")}
            />
            <Metric
              label={tr("Dudnienie różnicowe (Binaural Δ)", "Differential beat (Binaural Δ)")}
              value={`${result.binauralDelta.toFixed(10)} Hz`}
              hint={tr(`lewe ucho: ${result.fExact.toFixed(4)} Hz`, `left ear: ${result.fExact.toFixed(4)} Hz`)}
            />
          </div>

          {result.stableLines === 0 ? (
            <div className="text-xs text-amber-400 break-words">
              {tr(
                "STATUS: Brak punktów krytycznych o koherencji >98% dla tego węzła w tej sieci.",
                "STATUS: No critical points above 98% coherence for this node in this network.",
              )}
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={isPlaying ? stopAudio : play}
                  variant="outline"
                  className="flex-1 font-mono"
                >
                  {isPlaying ? <Square className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {isPlaying ? tr("Zatrzymaj strumień", "Stop stream") : tr("Odtwórz strumień stereo", "Play stereo stream")}
                </Button>
                <Button onClick={() => void exportWav()} variant="outline" disabled={isExporting} className="flex-1 font-mono">
                  {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                  {tr("Zapisz WAV 60 s (RAW PCM)", "Save 60 s WAV (RAW PCM)")}
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-[11px] sm:text-xs font-mono">
                  <thead className="text-muted-foreground">
                    <tr className="border-b border-border">
                      <th className="text-left py-1 pr-2">{tr("POŁĄCZENIE", "LINK")}</th>
                      <th className="text-left py-1 pr-2">{tr("GEOMETRIA ODNIESIENIA", "REFERENCE GEOMETRY")}</th>
                      <th className="text-right py-1 pr-2">{tr("KOHERENCJA", "COHERENCE")}</th>
                      <th className="text-right py-1">{tr("KOREKTA FAZY", "PHASE CORRECTION")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.critical.map((r) => (
                      <tr key={r.targetGate} className="border-b border-border/40">
                        <td className="py-1 pr-2 text-primary whitespace-nowrap">B{result.gate} ↔ B{r.targetGate}</td>
                        <td className="py-1 pr-2 break-words">{pl ? r.ratioLabelPl : r.ratioLabelEn}</td>
                        <td className="py-1 pr-2 text-right">{r.coherence.toFixed(4)}%</td>
                        <td className="py-1 text-right">{r.correction >= 0 ? "+" : ""}{r.correction.toFixed(6)} rad</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <p className="text-[10px] text-muted-foreground break-words">
            {tr(
              "Status subskrypcji: test_phase — dostęp otwarty, bez opłat. Sygnał jest generowany lokalnie w przeglądarce (Web Audio, RAW PCM 44100 Hz), bez kompresji i bez wysyłania danych. Prezentowane parametry są wynikiem numerycznego mapowania wzorów matematycznych i nie stanowią klinicznej oceny stanu zdrowia.",
              "Subscription status: test_phase — open access, no fees. The signal is generated locally in the browser (Web Audio, RAW PCM 44100 Hz), uncompressed and without any data upload. The parameters shown result from numerical mapping of mathematical formulas and are not a clinical health assessment.",
            )}
          </p>
        </div>
      ) : null}
    </section>
  );
};
