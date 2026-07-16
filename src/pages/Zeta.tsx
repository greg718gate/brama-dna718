import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from "recharts";
import { Upload, FileAudio, Download, Lock, Activity, AlertTriangle, CheckCircle2, Mic, Square, Radio } from "lucide-react";
import jsPDF from "jspdf";

const ACCESS_CODE = "ZETA-2026";

// ---------- Machine profiles + engine variants ----------
type ProfileId = "auto" | "motor50" | "motor60" | "pump" | "fan" | "bearing" | "gearbox";
type EngineVersion = "v1.0" | "v1.1" | "v2.0";
type Profile = {
  id: ProfileId;
  name: string;
  desc: string;
  targetFreq?: number; // Hz nominal
};
const PROFILES: Profile[] = [
  { id: "auto",    name: "Auto / Nieznana maszyna",       desc: "Engine picks dominant frequency automatically." },
  { id: "motor50", name: "Electric motor · 50 Hz / Silnik 50 Hz",  desc: "3-phase motor, EU/UK grid.",  targetFreq: 50 },
  { id: "motor60", name: "Electric motor · 60 Hz / Silnik 60 Hz",  desc: "3-phase motor, US/Asia grid.", targetFreq: 60 },
  { id: "pump",    name: "Pump / compressor / Pompa",            desc: "Rotational 20–60 Hz.",         targetFreq: 30 },
  { id: "fan",     name: "Fan / blower / Wentylator",                 desc: "Rotational 10–30 Hz.",         targetFreq: 20 },
  { id: "bearing", name: "Bearing / Łożysko",         desc: "Ball/roller bearing 100–500 Hz.", targetFreq: 200 },
  { id: "gearbox", name: "Gearbox / Przekładnia",            desc: "Gear-mesh 200–2000 Hz.",       targetFreq: 500 },
];

const ENGINES: { id: EngineVersion; name: string; desc: string; bestFor: string }[] = [
  { id: "v1.0", name: "v1.0 Standard Core", desc: "Stałe obroty / stable RPM", bestFor: "silnik, pompa, wentylator" },
  { id: "v1.1", name: "v1.1 Adaptive Engine", desc: "Zmienny sygnał / adaptive tracker", bestFor: "dłuższe pliki, falowniki, różne RPM" },
  { id: "v2.0", name: "v2.0 Spatial Multi-Axis", desc: "3 osie X/Y/Z / tri-axial", bestFor: "łożyska, przekładnie, czujniki 3-osiowe" },
];

type AxisSamples = { x: number[]; y: number[]; z: number[] };

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
  engineVersion?: EngineVersion;
  spatial?: {
    axisCoherence: { x: number; y: number; z: number };
    axisTf: { x: number; y: number; z: number };
    axisMc: { x: number; y: number; z: number };
    axisFrequencyHz: { x: number; y: number; z: number };
    globalSpatialFriction: number;
  } | null;
};

type TimelineEntry = {
  t: number;             // seconds from start (file) or unix ms (live)
  label: string;
  status: ZetaResult["status"];
  tf: number;
  mc: number;
  freq: number;
  coh: number;
};

const statusColor: Record<string, string> = {
  HEALTHY: "text-emerald-400 border-emerald-400",
  WATCH: "text-yellow-400 border-yellow-400",
  DEGRADED: "text-orange-400 border-orange-400",
  CRITICAL: "text-red-500 border-red-500",
};
const statusBg: Record<string, string> = {
  HEALTHY: "bg-emerald-500/10",
  WATCH: "bg-yellow-500/10",
  DEGRADED: "bg-orange-500/15",
  CRITICAL: "bg-red-500/20",
};
const statusText: Record<string, string> = {
  HEALTHY: "Machine operating within normal parameters.",
  WATCH: "Minor spectral anomalies detected. Continue monitoring.",
  DEGRADED: "Significant fault signature detected. Schedule inspection.",
  CRITICAL: "Severe fault detected. Immediate action recommended.",
};

// ---------- Audio decoding ----------
async function decodeAudioFull(file: File): Promise<{ channel: Float32Array; sampleRate: number; axes?: undefined }> {
  const buf = await file.arrayBuffer();
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  const ctx = new AudioCtx();
  const audio = await ctx.decodeAudioData(buf);
  const ch = audio.getChannelData(0);
  // Copy because ctx will be closed
  const out = new Float32Array(ch.length);
  out.set(ch);
  ctx.close();
  return { channel: out, sampleRate: audio.sampleRate };
}

async function decodeCsv(file: File, sampleRate: number): Promise<{ channel: Float32Array; sampleRate: number; axes?: { x: Float32Array; y: Float32Array; z: Float32Array } }> {
  const text = await file.text();
  const lines = text.split(/\r?\n/);
  const samples: number[] = [];
  const ax: number[] = [];
  const ay: number[] = [];
  const az: number[] = [];
  for (const line of lines) {
    if (!line.trim() || line.startsWith("#")) continue;
    const nums = line.split(/[,;\s\t]+/).filter(Boolean).map((part) => parseFloat(part)).filter((num) => Number.isFinite(num));
    if (nums.length === 0) continue;
    samples.push(nums[nums.length - 1]);
    if (nums.length >= 3) {
      ax.push(nums[nums.length - 3]);
      ay.push(nums[nums.length - 2]);
      az.push(nums[nums.length - 1]);
    }
  }
  if (samples.length < 512) throw new Error(`CSV too short: ${samples.length} samples (need 512+)`);
  const axes = ax.length >= 512 && ax.length === ay.length && ay.length === az.length
    ? { x: Float32Array.from(ax), y: Float32Array.from(ay), z: Float32Array.from(az) }
    : undefined;
  return { channel: Float32Array.from(samples), sampleRate, axes };
}

// Downsample if > 22050 Hz to keep payloads small (spectral content < 11 kHz preserved)
function maybeDownsample(ch: Float32Array, sr: number): { ch: Float32Array; sr: number } {
  if (sr <= 22050) return { ch, sr };
  const factor = Math.floor(sr / 22050);
  const newSr = Math.round(sr / factor);
  const outLen = Math.floor(ch.length / factor);
  const out = new Float32Array(outLen);
  for (let i = 0; i < outLen; i++) {
    let s = 0;
    for (let k = 0; k < factor; k++) s += ch[i * factor + k];
    out[i] = s / factor;
  }
  return { ch: out, sr: newSr };
}

function maybeDownsampleAxes(axes: { x: Float32Array; y: Float32Array; z: Float32Array } | undefined, sr: number, targetSr: number) {
  if (!axes) return undefined;
  const factor = Math.max(1, Math.round(sr / targetSr));
  const down = (input: Float32Array) => {
    if (factor <= 1) return input;
    const outLen = Math.floor(input.length / factor);
    const out = new Float32Array(outLen);
    for (let i = 0; i < outLen; i++) {
      let s = 0;
      for (let k = 0; k < factor; k++) s += input[i * factor + k];
      out[i] = s / factor;
    }
    return out;
  };
  return { x: down(axes.x), y: down(axes.y), z: down(axes.z) };
}

async function analyzeChunk(samples: number[], sampleRate: number, targetFreq: number | undefined, filename: string, engineVersion: EngineVersion, axes?: AxisSamples): Promise<ZetaResult> {
  const { data, error } = await supabase.functions.invoke("zeta-analyze", {
    body: { samples, axes, sampleRate, targetFreq, filename, engineVersion },
    headers: { "x-zeta-key": ACCESS_CODE },
  });
  if (error) throw new Error(error.message);
  if ((data as any)?.error) throw new Error((data as any).error);
  return data as ZetaResult;
}

export default function Zeta() {
  const [code, setCode] = useState("");
  const [authed, setAuthed] = useState(false);
  const [profile, setProfile] = useState<ProfileId>("auto");
  const [engineVersion, setEngineVersion] = useState<EngineVersion>("v1.1");
  const currentProfile = PROFILES.find((p) => p.id === profile)!;
  const currentEngine = ENGINES.find((e) => e.id === engineVersion)!;

  // File mode
  const [file, setFile] = useState<File | null>(null);
  const [csvSampleRate, setCsvSampleRate] = useState(1000);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [result, setResult] = useState<ZetaResult | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);

  // Live mode
  const [liveOn, setLiveOn] = useState(false);
  const [liveLog, setLiveLog] = useState<TimelineEntry[]>([]);
  const [liveLatest, setLiveLatest] = useState<ZetaResult | null>(null);
  const [liveDuration, setLiveDuration] = useState(0);
  const liveCtxRef = useRef<AudioContext | null>(null);
  const liveStreamRef = useRef<MediaStream | null>(null);
  const liveBufferRef = useRef<number[]>([]);
  const liveStartRef = useRef<number>(0);
  const liveTickRef = useRef<number | null>(null);
  const CHUNK_SECONDS = 5;

  const handleAuth = () => {
    if (code.trim() === ACCESS_CODE) {
      setAuthed(true);
      toast.success("Access granted");
    } else toast.error("Invalid access code");
  };

  // ---------- FILE ANALYSIS (long files → windowed timeline) ----------
  const handleAnalyze = async () => {
    if (!file) return toast.error("Select a file first");
    setAnalyzing(true);
    setProgress(5);
    setProgressLabel("Decoding signal…");
    setResult(null);
    setTimeline([]);

    try {
      const isAudio = /\.(wav|mp3|m4a|ogg|webm|flac)$/i.test(file.name);
      const isCsv = /\.(csv|txt|tsv)$/i.test(file.name);
      if (!isAudio && !isCsv) throw new Error("Unsupported file. Use WAV/MP3/M4A/OGG/FLAC or CSV/TXT.");

      const decoded = isAudio ? await decodeAudioFull(file) : await decodeCsv(file, csvSampleRate);
      const { ch, sr } = maybeDownsample(decoded.channel, decoded.sampleRate);
      const axesDownsampled = maybeDownsampleAxes(decoded.axes, decoded.sampleRate, sr);
      const totalSec = ch.length / sr;

      // Chunk length: 10s per window (min 2s), enough for stable spectrum
      const windowSec = Math.min(10, Math.max(2, Math.floor(totalSec / 24)));
      const windowLen = Math.floor(windowSec * sr);
      const nChunks = Math.max(1, Math.floor(ch.length / windowLen));

      setProgressLabel(`Analysing ${totalSec.toFixed(0)}s signal in ${nChunks} windows (${windowSec}s each)…`);

      const timelineOut: TimelineEntry[] = [];
      let worst: ZetaResult | null = null;

      for (let i = 0; i < nChunks; i++) {
        const seg = ch.subarray(i * windowLen, (i + 1) * windowLen);
        const samples = Array.from(seg);
        const axisChunk = axesDownsampled ? {
          x: Array.from(axesDownsampled.x.subarray(i * windowLen, (i + 1) * windowLen)),
          y: Array.from(axesDownsampled.y.subarray(i * windowLen, (i + 1) * windowLen)),
          z: Array.from(axesDownsampled.z.subarray(i * windowLen, (i + 1) * windowLen)),
        } : undefined;
        const r = await analyzeChunk(samples, sr, currentProfile.targetFreq, file.name, engineVersion, axisChunk);
        const tStart = i * windowSec;
        timelineOut.push({
          t: tStart,
          label: `${tStart.toFixed(0)}s`,
          status: r.status,
          tf: r.topologicalFriction,
          mc: r.faultCondensation,
          freq: r.trackedFrequencyHz,
          coh: r.phaseCoherence,
        });
        setTimeline([...timelineOut]);

        // Keep the "worst" chunk as headline result
        const sev = (s: string) => ["HEALTHY", "WATCH", "DEGRADED", "CRITICAL"].indexOf(s);
        if (!worst || sev(r.status) > sev(worst.status)) worst = r;

        setProgress(5 + Math.round(((i + 1) / nChunks) * 90));
      }

      setResult(worst);
      setProgress(100);
      setProgressLabel("Complete");
      toast.success(`Analysis complete: ${nChunks} windows, ${totalSec.toFixed(0)}s of signal`);
    } catch (e: any) {
      toast.error(e.message || "Analysis failed");
    } finally {
      setAnalyzing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  // ---------- LIVE MODE (microphone → rolling monitor) ----------
  const startLive = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      liveStreamRef.current = stream;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx: AudioContext = new AudioCtx();
      liveCtxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const processor = ctx.createScriptProcessor(4096, 1, 1);
      liveBufferRef.current = [];
      liveStartRef.current = Date.now();
      setLiveLog([]);
      setLiveLatest(null);
      setLiveDuration(0);

      processor.onaudioprocess = (ev) => {
        const input = ev.inputBuffer.getChannelData(0);
        const buf = liveBufferRef.current;
        for (let i = 0; i < input.length; i++) buf.push(input[i]);
      };
      src.connect(processor);
      processor.connect(ctx.destination);

      setLiveOn(true);
      toast.success("Live monitoring started");

      // Every CHUNK_SECONDS, analyse the accumulated buffer
      const tick = window.setInterval(async () => {
        const sr = ctx.sampleRate;
        const needed = sr * CHUNK_SECONDS;
        const buf = liveBufferRef.current;
        if (buf.length < needed) return;
        const chunk = buf.splice(0, needed);
        const { ch, sr: dsr } = maybeDownsample(Float32Array.from(chunk), sr);
        try {
          const r = await analyzeChunk(Array.from(ch), dsr, currentProfile.targetFreq, "live-mic", engineVersion);
          setLiveLatest(r);
          const entry: TimelineEntry = {
            t: Date.now(),
            label: new Date().toLocaleTimeString(),
            status: r.status,
            tf: r.topologicalFriction,
            mc: r.faultCondensation,
            freq: r.trackedFrequencyHz,
            coh: r.phaseCoherence,
          };
          setLiveLog((prev) => [entry, ...prev].slice(0, 500));
          setLiveDuration(Math.floor((Date.now() - liveStartRef.current) / 1000));
          if (r.status === "DEGRADED" || r.status === "CRITICAL") {
            toast.error(`⚠ ${r.status} · Tf=${r.topologicalFriction.toFixed(2)} · ${r.trackedFrequencyHz.toFixed(0)} Hz`);
          }
        } catch (e: any) {
          console.error("live chunk failed:", e);
        }
      }, CHUNK_SECONDS * 1000);
      liveTickRef.current = tick;
    } catch (e: any) {
      toast.error("Microphone access denied: " + (e.message || e));
    }
  };

  const stopLive = () => {
    if (liveTickRef.current) window.clearInterval(liveTickRef.current);
    liveTickRef.current = null;
    liveStreamRef.current?.getTracks().forEach((t) => t.stop());
    liveStreamRef.current = null;
    liveCtxRef.current?.close();
    liveCtxRef.current = null;
    liveBufferRef.current = [];
    setLiveOn(false);
    toast.info("Live monitoring stopped");
  };

  useEffect(() => () => { if (liveOn) stopLive(); }, []); // cleanup on unmount

  // ---------- PDF ----------
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
    doc.text(`Machine profile: ${currentProfile.name}`, m, y); y += 5;
    doc.text(`Engine: ${result.engine}`, m, y); y += 5;
    doc.text(`Analysed: ${new Date(result.timestampUtc).toUTCString()}`, m, y); y += 5;
    doc.text(`Samples: ${result.nSamples.toLocaleString()} @ ${result.sampleRateHz} Hz`, m, y); y += 10;

    doc.setFontSize(14); doc.setFont("helvetica", "bold");
    doc.text(`Worst-window status: ${result.status}`, m, y); y += 7;
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    const statusLines = doc.splitTextToSize(statusText[result.status], w - 2 * m);
    doc.text(statusLines, m, y); y += statusLines.length * 5 + 5;

    doc.setFontSize(11); doc.setFont("helvetica", "bold");
    doc.text("Diagnostic Metrics (worst window)", m, y); y += 6;
    doc.setFont("helvetica", "normal"); doc.setFontSize(10);
    const rows: [string, string][] = [
      ["Phase Coherence", result.phaseCoherence.toFixed(4)],
      ["Topological Friction (Tf)", result.topologicalFriction.toFixed(4)],
      ["Fault Condensation (Mc)", result.faultCondensation.toFixed(4)],
      ["Tracked Frequency", result.trackedFrequencyHz.toFixed(2) + " Hz"],
    ];
    if (result.spatial) {
      rows.push(["Spatial Friction X/Y/Z", `${result.spatial.axisTf.x.toFixed(3)} / ${result.spatial.axisTf.y.toFixed(3)} / ${result.spatial.axisTf.z.toFixed(3)}`]);
    }
    for (const [k, v] of rows) {
      doc.setFont("helvetica", "bold"); doc.text(k + ":", m, y);
      doc.setFont("helvetica", "normal"); doc.text(v, m + 60, y);
      y += 6;
    }
    y += 4;

    if (timeline.length > 1) {
      doc.setFont("helvetica", "bold"); doc.setFontSize(11);
      doc.text(`Timeline (${timeline.length} windows)`, m, y); y += 6;
      doc.setFont("helvetica", "normal"); doc.setFontSize(9);
      for (const e of timeline.slice(0, 30)) {
        doc.text(`${e.label.padEnd(8)}  ${e.status.padEnd(10)}  Tf=${e.tf.toFixed(3)}  Mc=${e.mc.toFixed(3)}  f=${e.freq.toFixed(1)} Hz`, m, y);
        y += 4;
        if (y > 270) { doc.addPage(); y = 20; }
      }
      y += 4;
    }

    doc.setFontSize(8); doc.setTextColor(120);
    doc.text("Zeta-Core Diagnostics \u2014 Confidential. Contact: bramadna718@gmail.com", m, 285);
    doc.save(`ZetaCore_Report_${result.filename.replace(/\.[^.]+$/, "")}.pdf`);
  };

  // ---------- Auth gate ----------
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
          <Input type="password" value={code} onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAuth()}
            className="bg-black/40 border-white/20" placeholder="Enter code" />
          <Button onClick={handleAuth} className="w-full mt-4 bg-cyan-600 hover:bg-cyan-500">Enter</Button>
          <p className="text-xs text-white/40 mt-6 text-center">
            Zeta-Core Diagnostics &mdash; Aberdeen, UK<br />Contact: bramadna718@gmail.com
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-5xl mx-auto p-4 md:p-8">
        <header className="mb-6 border-b border-white/10 pb-4 flex items-center gap-3">
          <Activity className="w-7 h-7 text-cyan-400" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">ZETA-CORE</h1>
            <p className="text-sm text-white/60">Machine Health Diagnostic Engine</p>
          </div>
        </header>

        {/* Machine profile selector */}
        <Card className="p-4 bg-black/40 border-white/10 mb-6">
          <label className="text-xs text-white/60 uppercase tracking-wider">Machine profile / profil maszyny</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
            {PROFILES.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setProfile(p.id);
                  if (p.id === "bearing" || p.id === "gearbox") setEngineVersion("v2.0");
                }}
                className={`text-left p-3 rounded border transition ${
                  profile === p.id
                    ? "border-cyan-400 bg-cyan-500/10"
                    : "border-white/10 bg-black/40 hover:border-white/30"
                }`}
              >
                <div className="text-sm font-semibold">{p.name}</div>
                <div className="text-xs text-white/50 mt-0.5">{p.desc}</div>
                <div className="text-[10px] text-cyan-300/70 mt-1 font-mono">
                  {p.targetFreq ? `target ≈ ${p.targetFreq} Hz` : "no prior"}
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-4 bg-black/40 border-white/10 mb-6">
          <label className="text-xs text-white/60 uppercase tracking-wider">Engine version / wersja silnika</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
            {ENGINES.map((engine) => (
              <button
                key={engine.id}
                onClick={() => setEngineVersion(engine.id)}
                className={`text-left p-3 rounded border transition ${
                  engineVersion === engine.id
                    ? "border-cyan-400 bg-cyan-500/10"
                    : "border-white/10 bg-black/40 hover:border-white/30"
                }`}
              >
                <div className="text-sm font-semibold">{engine.name}</div>
                <div className="text-xs text-white/50 mt-0.5">{engine.desc}</div>
                <div className="text-[10px] text-cyan-300/70 mt-1">{engine.bestFor}</div>
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-white/50">
            Active / aktywny: <span className="text-cyan-300">{currentEngine.name}</span>. v2.0 accepts CSV with 3 columns X,Y,Z; audio/microphone runs as mono fallback on all axes.
          </p>
        </Card>

        <Tabs defaultValue="file">
          <TabsList className="bg-black/40 border border-white/10">
            <TabsTrigger value="file"><FileAudio className="w-4 h-4 mr-2" />File analysis</TabsTrigger>
            <TabsTrigger value="live"><Radio className="w-4 h-4 mr-2" />Live monitoring (24/7)</TabsTrigger>
          </TabsList>

          {/* -------------------- FILE TAB -------------------- */}
          <TabsContent value="file" className="mt-4">
            <Card className="p-6 bg-black/40 border-white/10 mb-6">
              <h2 className="text-lg font-semibold mb-2">Upload machine signal</h2>
              <p className="text-sm text-white/60 mb-4">
                Any length — audio (WAV, MP3, M4A, OGG, FLAC) or CSV/TXT with sensor values.
                Long recordings are automatically split into 2–10 s windows and analysed as a timeline.
              </p>

              <div className="flex flex-col md:flex-row gap-3">
                <input ref={fileInput} type="file"
                  accept=".wav,.mp3,.m4a,.ogg,.webm,.flac,.csv,.txt,.tsv"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden" />
                <Button variant="outline" onClick={() => fileInput.current?.click()}
                  className="border-white/20 bg-black/40">
                  <Upload className="w-4 h-4 mr-2" />
                  {file ? file.name : "Choose file"}
                </Button>

                {file && /\.(csv|txt|tsv)$/i.test(file.name) && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-white/70">CSV sample rate (Hz):</label>
                    <Input type="number" value={csvSampleRate}
                      onChange={(e) => setCsvSampleRate(parseInt(e.target.value) || 1000)}
                      className="w-28 bg-black/40 border-white/20" />
                  </div>
                )}

                <Button onClick={handleAnalyze} disabled={!file || analyzing}
                  className="bg-cyan-600 hover:bg-cyan-500 md:ml-auto">
                  {analyzing ? "Analysing…" : "Run diagnostic"}
                </Button>
              </div>

              {progress > 0 && (
                <div className="mt-4">
                  <Progress value={progress} className="h-1" />
                  <p className="text-xs text-white/50 mt-1">{progressLabel}</p>
                </div>
              )}
            </Card>

            {result && (
              <>
                <Card className={`p-6 bg-black/40 border-2 mb-6 ${statusColor[result.status]}`}>
                  <div className="flex items-start gap-4">
                    {result.status === "HEALTHY"
                      ? <CheckCircle2 className="w-10 h-10 shrink-0" />
                      : <AlertTriangle className="w-10 h-10 shrink-0" />}
                    <div className="flex-1">
                      <div className="text-xs uppercase tracking-widest opacity-70">
                        Worst-window status · {timeline.length} windows analysed
                      </div>
                      <div className="text-3xl font-bold mt-1">{result.status}</div>
                      <p className="text-sm mt-2 text-white/70">{statusText[result.status]}</p>
                    </div>
                    <Button onClick={downloadPdf} variant="outline" className="border-white/20 text-white">
                      <Download className="w-4 h-4 mr-2" />PDF report
                    </Button>
                  </div>
                </Card>

                <Card className="p-6 bg-black/40 border-white/10 mb-6">
                  <h2 className="text-lg font-semibold mb-4">Metrics (worst window)</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Metric label="Phase Coherence" value={result.phaseCoherence.toFixed(4)} hint="0 = chaotic · 1 = pure tone" />
                    <Metric label="Topological Friction" value={result.topologicalFriction.toFixed(4)} hint="Tf · disorder index" />
                    <Metric label="Fault Condensation" value={result.faultCondensation.toFixed(4)} hint="Mc · sideband energy" />
                    <Metric label="Tracked Frequency" value={result.trackedFrequencyHz.toFixed(1) + " Hz"} hint="Dominant peak" />
                  </div>
                  <div className="mt-4 text-xs text-white/50 font-mono">{result.engine}</div>
                </Card>

                {result.spatial && (
                  <Card className="p-6 bg-black/40 border-white/10 mb-6">
                    <h2 className="text-lg font-semibold mb-4">v2.0 Spatial Multi-Axis / 3 osie X-Y-Z</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Metric label="Axis X" value={`Tf ${result.spatial.axisTf.x.toFixed(3)}`} hint={`C=${result.spatial.axisCoherence.x.toFixed(3)} · ${result.spatial.axisFrequencyHz.x.toFixed(1)} Hz`} />
                      <Metric label="Axis Y" value={`Tf ${result.spatial.axisTf.y.toFixed(3)}`} hint={`C=${result.spatial.axisCoherence.y.toFixed(3)} · ${result.spatial.axisFrequencyHz.y.toFixed(1)} Hz`} />
                      <Metric label="Axis Z" value={`Tf ${result.spatial.axisTf.z.toFixed(3)}`} hint={`C=${result.spatial.axisCoherence.z.toFixed(3)} · ${result.spatial.axisFrequencyHz.z.toFixed(1)} Hz`} />
                    </div>
                    <p className="mt-4 text-xs text-white/50">
                      Global Spatial Friction: <span className="text-cyan-300 font-mono">{result.spatial.globalSpatialFriction.toFixed(4)}</span>
                    </p>
                  </Card>
                )}

                {timeline.length > 1 && (
                  <Card className="p-6 bg-black/40 border-white/10 mb-6">
                    <h2 className="text-lg font-semibold mb-2">Timeline · Topological Friction over time</h2>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={timeline}>
                          <XAxis dataKey="label" stroke="#666" fontSize={10} />
                          <YAxis domain={[0, 1]} stroke="#666" fontSize={10} />
                          <Tooltip contentStyle={{ background: "#000", border: "1px solid #333" }} />
                          <ReferenceLine y={0.35} stroke="#10b981" strokeDasharray="3 3" />
                          <ReferenceLine y={0.55} stroke="#eab308" strokeDasharray="3 3" />
                          <ReferenceLine y={0.75} stroke="#ef4444" strokeDasharray="3 3" />
                          <Line type="monotone" dataKey="tf" stroke="#00CED1" dot strokeWidth={1.5} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 max-h-48 overflow-auto text-xs font-mono">
                      {timeline.map((e, i) => (
                        <div key={i} className={`flex justify-between py-1 border-b border-white/5 px-2 ${statusBg[e.status]}`}>
                          <span className="w-16 text-white/60">{e.label}</span>
                          <span className={`w-24 ${statusColor[e.status].split(" ")[0]}`}>{e.status}</span>
                          <span className="w-24 text-white/60">Tf={e.tf.toFixed(3)}</span>
                          <span className="w-24 text-white/60">Mc={e.mc.toFixed(3)}</span>
                          <span className="w-24 text-white/60">{e.freq.toFixed(1)} Hz</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                <Card className="p-6 bg-black/40 border-white/10">
                  <h2 className="text-lg font-semibold mb-4">Frequency spectrum (worst window)</h2>
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
                </Card>
              </>
            )}
          </TabsContent>

          {/* -------------------- LIVE TAB -------------------- */}
          <TabsContent value="live" className="mt-4">
            <Card className="p-6 bg-black/40 border-white/10 mb-6">
              <h2 className="text-lg font-semibold mb-2">Live 24/7 monitoring</h2>
              <p className="text-sm text-white/60 mb-4">
                Uses the device microphone or a connected sensor input. The engine analyses a {CHUNK_SECONDS}-second window
                every {CHUNK_SECONDS} seconds and triggers an alert on DEGRADED or CRITICAL status. Leave the browser tab open
                on a phone, tablet or industrial PC placed near the machine. Runs continuously.
              </p>

              <div className="flex items-center gap-3">
                {!liveOn ? (
                  <Button onClick={startLive} className="bg-red-600 hover:bg-red-500">
                    <Mic className="w-4 h-4 mr-2" />Start monitoring
                  </Button>
                ) : (
                  <Button onClick={stopLive} variant="outline" className="border-red-400 text-red-400">
                    <Square className="w-4 h-4 mr-2" />Stop
                  </Button>
                )}
                {liveOn && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-white/70">Monitoring · {Math.floor(liveDuration / 60)}m {liveDuration % 60}s · {currentProfile.name}</span>
                  </div>
                )}
              </div>
            </Card>

            {liveLatest && (
              <Card className={`p-6 bg-black/40 border-2 mb-6 ${statusColor[liveLatest.status]}`}>
                <div className="flex items-start gap-4">
                  {liveLatest.status === "HEALTHY"
                    ? <CheckCircle2 className="w-10 h-10 shrink-0" />
                    : <AlertTriangle className="w-10 h-10 shrink-0" />}
                  <div className="flex-1">
                    <div className="text-xs uppercase tracking-widest opacity-70">Current status</div>
                    <div className="text-3xl font-bold mt-1">{liveLatest.status}</div>
                    <p className="text-sm mt-2 text-white/70">{statusText[liveLatest.status]}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                  <Metric label="Coherence" value={liveLatest.phaseCoherence.toFixed(3)} hint="frequency stability" />
                  <Metric label="Tf" value={liveLatest.topologicalFriction.toFixed(3)} hint="disorder" />
                  <Metric label="Mc" value={liveLatest.faultCondensation.toFixed(3)} hint="sidebands" />
                  <Metric label="Freq" value={liveLatest.trackedFrequencyHz.toFixed(1) + " Hz"} hint="tracked" />
                </div>
              </Card>
            )}

            {liveLog.length > 1 && (
              <Card className="p-6 bg-black/40 border-white/10 mb-6">
                <h2 className="text-lg font-semibold mb-2">Live Tf trend (rolling)</h2>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[...liveLog].reverse()}>
                      <XAxis dataKey="label" stroke="#666" fontSize={9} />
                      <YAxis domain={[0, 1]} stroke="#666" fontSize={10} />
                      <Tooltip contentStyle={{ background: "#000", border: "1px solid #333" }} />
                      <ReferenceLine y={0.35} stroke="#10b981" strokeDasharray="3 3" />
                      <ReferenceLine y={0.55} stroke="#eab308" strokeDasharray="3 3" />
                      <ReferenceLine y={0.75} stroke="#ef4444" strokeDasharray="3 3" />
                      <Line type="monotone" dataKey="tf" stroke="#00CED1" dot={false} strokeWidth={1.5} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}

            {liveLog.length > 0 && (
              <Card className="p-6 bg-black/40 border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold">Event log</h2>
                  <Button variant="outline" size="sm" className="border-white/20"
                    onClick={() => {
                      const csv = "time,status,tf,mc,frequency_hz,coherence\n" +
                        liveLog.map(e => `${e.label},${e.status},${e.tf.toFixed(4)},${e.mc.toFixed(4)},${e.freq.toFixed(2)},${e.coh.toFixed(4)}`).join("\n");
                      const blob = new Blob([csv], { type: "text/csv" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url; a.download = `zeta_live_log_${Date.now()}.csv`; a.click();
                      URL.revokeObjectURL(url);
                    }}>
                    <Download className="w-3 h-3 mr-1" />CSV
                  </Button>
                </div>
                <div className="max-h-96 overflow-auto text-xs font-mono">
                  {liveLog.map((e, i) => (
                    <div key={i} className={`flex justify-between py-1 border-b border-white/5 px-2 ${statusBg[e.status]}`}>
                      <span className="w-20 text-white/60">{e.label}</span>
                      <span className={`w-24 ${statusColor[e.status].split(" ")[0]}`}>{e.status}</span>
                      <span className="w-24 text-white/60">Tf={e.tf.toFixed(3)}</span>
                      <span className="w-24 text-white/60">Mc={e.mc.toFixed(3)}</span>
                      <span className="w-24 text-white/60">{e.freq.toFixed(1)} Hz</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>

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
