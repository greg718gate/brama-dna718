import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Upload, FileAudio, FileSpreadsheet, Download, Lock, Activity, AlertTriangle, CheckCircle2 } from "lucide-react";
import jsPDF from "jspdf";

const ACCESS_CODE = "ZETA-2026";

type ZetaResult = {
  phaseCoherence: number;
  topologicalFriction: number;
  faultCondensation: number;
  trackedFrequencyHz: number;
  sampleRateHz: number;
  nSamples: number;
  status: "HEALTHY" | "WATCH" | "DEGRADED" | "CRITICAL";
  spectrum: number[];
  freqAxis: number[];
  latencyMs: number;
  filename: string;
  timestampUtc: string;
  engine: string;
};

const statusColor: Record<string, string> = {
  HEALTHY: "text-emerald-400 border-emerald-400",
  WATCH: "text-yellow-400 border-yellow-400",
  DEGRADED: "text-orange-400 border-orange-400",
  CRITICAL: "text-red-500 border-red-500",
};

const statusText: Record<string, string> = {
  HEALTHY: "Machine operating within normal parameters.",
  WATCH: "Minor spectral anomalies detected. Continue monitoring.",
  DEGRADED: "Significant fault signature detected. Schedule inspection.",
  CRITICAL: "Severe fault detected. Immediate action recommended.",
};

async function decodeAudioFile(file: File): Promise<{ samples: number[]; sampleRate: number }> {
  const buf = await file.arrayBuffer();
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  const ctx = new AudioCtx();
  const audio = await ctx.decodeAudioData(buf);
  const ch = audio.getChannelData(0);
  const maxLen = Math.min(ch.length, ctx.sampleRate * 30); // cap 30s
  const out = new Array(maxLen);
  for (let i = 0; i < maxLen; i++) out[i] = ch[i];
  ctx.close();
  return { samples: out, sampleRate: audio.sampleRate };
}

async function decodeCsvFile(file: File, assumedSampleRate: number): Promise<{ samples: number[]; sampleRate: number }> {
  const text = await file.text();
  const lines = text.split(/\r?\n/);
  const samples: number[] = [];
  for (const line of lines) {
    if (!line.trim() || line.startsWith("#")) continue;
    // take last numeric column (time,value or value)
    const parts = line.split(/[,;\s\t]+/).filter(Boolean);
    const num = parseFloat(parts[parts.length - 1]);
    if (!isNaN(num)) samples.push(num);
  }
  if (samples.length < 512) throw new Error(`CSV too short: ${samples.length} samples (need 512+)`);
  return { samples, sampleRate: assumedSampleRate };
}

export default function Zeta() {
  const [code, setCode] = useState("");
  const [authed, setAuthed] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [csvSampleRate, setCsvSampleRate] = useState(1000);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ZetaResult | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const handleAuth = () => {
    if (code.trim() === ACCESS_CODE) {
      setAuthed(true);
      toast.success("Access granted");
    } else {
      toast.error("Invalid access code");
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast.error("Select a file first");
      return;
    }
    setAnalyzing(true);
    setProgress(15);
    setResult(null);
    try {
      const isAudio = /\.(wav|mp3|m4a|ogg|webm|flac)$/i.test(file.name);
      const isCsv = /\.(csv|txt|tsv)$/i.test(file.name);
      if (!isAudio && !isCsv) throw new Error("Unsupported file type. Use WAV/MP3/M4A or CSV/TXT.");

      setProgress(30);
      const { samples, sampleRate } = isAudio
        ? await decodeAudioFile(file)
        : await decodeCsvFile(file, csvSampleRate);

      setProgress(60);
      const { data, error } = await supabase.functions.invoke("zeta-analyze", {
        body: { samples, sampleRate, filename: file.name },
        headers: { "x-zeta-key": ACCESS_CODE },
      });

      setProgress(95);
      if (error) throw new Error(error.message);
      if ((data as any)?.error) throw new Error((data as any).error);

      setResult(data as ZetaResult);
      setProgress(100);
      toast.success("Analysis complete");
    } catch (e: any) {
      toast.error(e.message || "Analysis failed");
    } finally {
      setAnalyzing(false);
      setTimeout(() => setProgress(0), 800);
    }
  };

  const downloadPdf = () => {
    if (!result) return;
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const w = 210, m = 15;
    let y = 20;

    doc.setFontSize(18); doc.setFont("helvetica", "bold");
    doc.text("ZETA-CORE", m, y);
    doc.setFontSize(11); doc.setFont("helvetica", "normal");
    doc.text("Machine Health Diagnostic Report", m, y + 6);
    doc.setFontSize(9);
    doc.text("Zeta-Core Diagnostics  \u2014  Aberdeen, UK", m, y + 12);
    doc.setDrawColor(180); doc.line(m, y + 16, w - m, y + 16);
    y += 24;

    doc.setFontSize(10);
    doc.text(`File: ${result.filename}`, m, y); y += 5;
    doc.text(`Analysed: ${new Date(result.timestampUtc).toUTCString()}`, m, y); y += 5;
    doc.text(`Engine: ${result.engine}`, m, y); y += 5;
    doc.text(`Samples: ${result.nSamples.toLocaleString()} @ ${result.sampleRateHz} Hz`, m, y); y += 5;
    doc.text(`Compute time: ${result.latencyMs.toFixed(1)} ms`, m, y); y += 10;

    // Status box
    doc.setFontSize(14); doc.setFont("helvetica", "bold");
    doc.text(`Status: ${result.status}`, m, y); y += 7;
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    const statusLines = doc.splitTextToSize(statusText[result.status], w - 2 * m);
    doc.text(statusLines, m, y); y += statusLines.length * 5 + 5;

    // Metrics table
    doc.setFontSize(11); doc.setFont("helvetica", "bold");
    doc.text("Diagnostic Metrics", m, y); y += 6;
    doc.setFont("helvetica", "normal"); doc.setFontSize(10);
    const rows: [string, string][] = [
      ["Phase Coherence", result.phaseCoherence.toFixed(4) + "  (0 = chaotic, 1 = pure tone)"],
      ["Topological Friction (Tf)", result.topologicalFriction.toFixed(4) + "  (higher = more disorder)"],
      ["Fault Condensation (Mc)", result.faultCondensation.toFixed(4) + "  (higher = sideband defects)"],
      ["Tracked Frequency", result.trackedFrequencyHz.toFixed(2) + " Hz"],
    ];
    for (const [k, v] of rows) {
      doc.setFont("helvetica", "bold"); doc.text(k + ":", m, y);
      doc.setFont("helvetica", "normal"); doc.text(v, m + 55, y);
      y += 6;
    }
    y += 4;

    // Interpretation
    doc.setFont("helvetica", "bold"); doc.setFontSize(11);
    doc.text("Interpretation", m, y); y += 6;
    doc.setFont("helvetica", "normal"); doc.setFontSize(9);
    const interp = [
      "Phase Coherence measures how stable the dominant vibration frequency is across the recording. Values above 0.85 indicate a machine with consistent rotational behaviour.",
      "Topological Friction (Tf) reflects the spectral disorder of the signal. Healthy machines emit energy concentrated at a few harmonics; failing machines emit broadband noise, raising Tf.",
      "Fault Condensation (Mc) measures the energy in sideband frequencies around the main peak \u2014 the classical signature of bearing wear, gear-mesh faults, and imbalance.",
      "Thresholds: HEALTHY Tf<0.35 \u2014 WATCH <0.55 \u2014 DEGRADED <0.75 \u2014 CRITICAL \u22650.75.",
    ];
    for (const p of interp) {
      const l = doc.splitTextToSize(p, w - 2 * m);
      doc.text(l, m, y); y += l.length * 4 + 2;
    }

    // Footer
    doc.setFontSize(8); doc.setTextColor(120);
    doc.text("Zeta-Core Diagnostics \u2014 Confidential. Contact: bramadna718@gmail.com", m, 285);

    doc.save(`ZetaCore_Report_${result.filename.replace(/\.[^.]+$/, "")}.pdf`);
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-black/60 border-cyan-500/30">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-6 h-6 text-cyan-400" />
            <div>
              <h1 className="text-xl font-bold">ZETA-CORE</h1>
              <p className="text-xs text-white/60">Machine Health Diagnostic Portal</p>
            </div>
          </div>
          <label className="text-sm text-white/70 block mb-2">Access code</label>
          <Input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAuth()}
            className="bg-black/40 border-white/20"
            placeholder="Enter code"
          />
          <Button onClick={handleAuth} className="w-full mt-4 bg-cyan-600 hover:bg-cyan-500">
            Enter
          </Button>
          <p className="text-xs text-white/40 mt-6 text-center">
            Zeta-Core Diagnostics &mdash; Aberdeen, UK<br />
            Contact: bramadna718@gmail.com
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-5xl mx-auto p-4 md:p-8">
        <header className="mb-6 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <Activity className="w-7 h-7 text-cyan-400" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">ZETA-CORE</h1>
              <p className="text-sm text-white/60">Machine Health Diagnostic Engine &mdash; v1.1 adaptive</p>
            </div>
          </div>
        </header>

        <Card className="p-6 bg-black/40 border-white/10 mb-6">
          <h2 className="text-lg font-semibold mb-4">1. Upload machine signal</h2>
          <p className="text-sm text-white/60 mb-4">
            Supported: audio recordings (WAV, MP3, M4A, OGG) up to 30 seconds, or CSV/TXT files with numeric sensor values (one per line, or last column).
          </p>

          <div className="flex flex-col md:flex-row gap-3">
            <input
              ref={fileInput}
              type="file"
              accept=".wav,.mp3,.m4a,.ogg,.webm,.flac,.csv,.txt,.tsv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInput.current?.click()}
              className="border-white/20 bg-black/40"
            >
              <Upload className="w-4 h-4 mr-2" />
              {file ? file.name : "Choose file"}
            </Button>

            {file && /\.(csv|txt|tsv)$/i.test(file.name) && (
              <div className="flex items-center gap-2">
                <label className="text-sm text-white/70">CSV sample rate (Hz):</label>
                <Input
                  type="number"
                  value={csvSampleRate}
                  onChange={(e) => setCsvSampleRate(parseInt(e.target.value) || 1000)}
                  className="w-28 bg-black/40 border-white/20"
                />
              </div>
            )}

            <Button
              onClick={handleAnalyze}
              disabled={!file || analyzing}
              className="bg-cyan-600 hover:bg-cyan-500 md:ml-auto"
            >
              {analyzing ? "Analysing…" : "Run diagnostic"}
            </Button>
          </div>

          {progress > 0 && (
            <div className="mt-4">
              <Progress value={progress} className="h-1" />
              <p className="text-xs text-white/50 mt-1">
                {progress < 40 ? "Decoding signal…" : progress < 90 ? "Running spectral analysis on server…" : "Finalising report…"}
              </p>
            </div>
          )}

          <div className="mt-4 flex gap-4 text-xs text-white/50">
            <span className="flex items-center gap-1"><FileAudio className="w-3 h-3" /> Audio</span>
            <span className="flex items-center gap-1"><FileSpreadsheet className="w-3 h-3" /> CSV</span>
          </div>
        </Card>

        {result && (
          <>
            <Card className={`p-6 bg-black/40 border-2 mb-6 ${statusColor[result.status]}`}>
              <div className="flex items-start gap-4">
                {result.status === "HEALTHY" ? (
                  <CheckCircle2 className="w-10 h-10 shrink-0" />
                ) : (
                  <AlertTriangle className="w-10 h-10 shrink-0" />
                )}
                <div className="flex-1">
                  <div className="text-xs uppercase tracking-widest opacity-70">Diagnostic status</div>
                  <div className="text-3xl font-bold mt-1">{result.status}</div>
                  <p className="text-sm mt-2 text-white/70">{statusText[result.status]}</p>
                </div>
                <Button onClick={downloadPdf} variant="outline" className="border-white/20 text-white">
                  <Download className="w-4 h-4 mr-2" />
                  PDF report
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-black/40 border-white/10 mb-6">
              <h2 className="text-lg font-semibold mb-4">Diagnostic metrics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Metric label="Phase Coherence" value={result.phaseCoherence.toFixed(4)} hint="0 = chaotic · 1 = pure tone" />
                <Metric label="Topological Friction" value={result.topologicalFriction.toFixed(4)} hint="Tf · disorder index" />
                <Metric label="Fault Condensation" value={result.faultCondensation.toFixed(4)} hint="Mc · sideband energy" />
                <Metric label="Tracked Frequency" value={result.trackedFrequencyHz.toFixed(1) + " Hz"} hint="Dominant peak" />
              </div>
            </Card>

            <Card className="p-6 bg-black/40 border-white/10">
              <h2 className="text-lg font-semibold mb-4">Frequency spectrum</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={result.spectrum.map((v, i) => ({ f: result.freqAxis[i]?.toFixed(0), v }))}>
                    <XAxis dataKey="f" stroke="#666" fontSize={10} label={{ value: "Hz", position: "insideBottom", offset: -2, fill: "#888" }} />
                    <YAxis stroke="#666" fontSize={10} />
                    <Tooltip contentStyle={{ background: "#000", border: "1px solid #333" }} />
                    <Line type="monotone" dataKey="v" stroke="#00CED1" dot={false} strokeWidth={1.5} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-white/40 mt-2">
                Analysis: {result.latencyMs.toFixed(1)} ms &middot; {result.nSamples.toLocaleString()} samples @ {result.sampleRateHz} Hz
              </p>
            </Card>
          </>
        )}

        <footer className="mt-12 text-xs text-white/40 text-center border-t border-white/10 pt-4">
          Zeta-Core Diagnostics &mdash; Aberdeen, UK &middot; bramadna718@gmail.com
        </footer>
      </div>
    </div>
  );
}

function Metric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="bg-black/40 border border-white/10 rounded-lg p-4">
      <div className="text-xs text-white/50 uppercase tracking-wider">{label}</div>
      <div className="text-2xl font-bold text-cyan-300 mt-1 font-mono">{value}</div>
      <div className="text-[10px] text-white/40 mt-1">{hint}</div>
    </div>
  );
}
