import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Lock,
  Upload,
  Copy,
  Mic,
  Square,
  Film,
  Wand2,
  Volume2,
  Download,
  Loader2,
  FileAudio,
  Images,
  Eye,
  EyeOff,
} from "lucide-react";


const PASSWORD = "MojeStudio2026";
const STORAGE_KEY = "moje-studio-wideo-auth";

// ============================================================================
// PASSWORD GATE
// ============================================================================
function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [pwd, setPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd === PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      onUnlock();
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09060f] text-white p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm bg-[#120a1f]/80 border border-fuchsia-500/30 rounded-2xl p-8 shadow-[0_0_60px_-10px_rgba(217,70,239,0.5)] backdrop-blur"
      >
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-700 flex items-center justify-center shadow-[0_0_30px_rgba(217,70,239,0.6)]">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-semibold tracking-wide">Dostęp ograniczony</h1>
          <p className="text-xs text-fuchsia-200/60 text-center">
            Strefa prywatna. Wpisz hasło, aby kontynuować.
          </p>
        </div>
        <div className="relative">
          <Input
            type={showPwd ? "text" : "password"}
            autoFocus
            value={pwd}
            onChange={(e) => {
              setPwd(e.target.value);
              setError(false);
            }}
            placeholder="••••••••••"
            className="bg-black/40 border-fuchsia-500/30 text-white placeholder:text-fuchsia-200/30 focus-visible:ring-fuchsia-500 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-fuchsia-200/60 hover:text-white focus:outline-none"
            aria-label={showPwd ? "Ukryj hasło" : "Pokaż hasło"}
          >
            {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {error && (
          <p className="text-xs text-red-400 mt-2">Nieprawidłowe hasło.</p>
        )}
        <Button
          type="submit"
          className="w-full mt-4 bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white border-0"
        >
          Odblokuj
        </Button>
      </form>
    </div>
  );
}


// ============================================================================
// TRANSCRIPTION (Lovable AI Gateway via edge function)
// ============================================================================
// Encode a Float32 PCM buffer (mono) as a 16-bit WAV Blob
function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeStr = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, samples.length * 2, true);
  let off = 44;
  for (let i = 0; i < samples.length; i++, off += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([buffer], { type: "audio/wav" });
}

// Downsample mono Float32 to target rate (simple averaging)
function downsample(input: Float32Array, inRate: number, outRate: number): Float32Array {
  if (outRate === inRate) return input;
  const ratio = inRate / outRate;
  const newLen = Math.floor(input.length / ratio);
  const out = new Float32Array(newLen);
  for (let i = 0; i < newLen; i++) {
    const start = Math.floor(i * ratio);
    const end = Math.min(input.length, Math.floor((i + 1) * ratio));
    let sum = 0;
    for (let j = start; j < end; j++) sum += input[j];
    out[i] = sum / Math.max(1, end - start);
  }
  return out;
}

function TranscriptionSection() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const SR = 16000; // 16 kHz mono
  const CHUNK_SECONDS = 600; // 10 min per chunk → ~19 MB WAV (< 25 MB limit)

  const sendChunk = async (blob: Blob, idx: number): Promise<string> => {
    const fd = new FormData();
    fd.append("file", blob, `chunk-${idx}.wav`);
    const projectId = (import.meta as any).env.VITE_SUPABASE_PROJECT_ID;
    const anon = (import.meta as any).env.VITE_SUPABASE_PUBLISHABLE_KEY;
    const url = `https://${projectId}.supabase.co/functions/v1/transcribe-audio`;
    const r = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${anon}`, apikey: anon },
      body: fd,
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data?.error || `HTTP ${r.status}`);
    return (data?.text || "").trim();
  };

  const run = async () => {
    if (!file) return;
    if (file.size > 500 * 1024 * 1024) {
      toast({ title: "Plik za duży", description: "Maks. 500 MB.", variant: "destructive" });
      return;
    }
    setBusy(true);
    setText("");
    setProgress(2);
    setStatus("Wczytuję plik…");

    try {
      const arrayBuf = await file.arrayBuffer();
      setProgress(8);
      setStatus("Dekoduję ścieżkę dźwiękową (lokalnie w przeglądarce)…");

      const AC: typeof AudioContext =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx = new AC();
      const audio = await ctx.decodeAudioData(arrayBuf.slice(0));
      await ctx.close().catch(() => {});

      // Mono mix
      const ch0 = audio.getChannelData(0);
      let mono: Float32Array;
      if (audio.numberOfChannels > 1) {
        const ch1 = audio.getChannelData(1);
        mono = new Float32Array(ch0.length);
        for (let i = 0; i < ch0.length; i++) mono[i] = (ch0[i] + ch1[i]) * 0.5;
      } else {
        mono = ch0;
      }

      setProgress(20);
      setStatus("Konwertuję do 16 kHz mono…");
      const down = downsample(mono, audio.sampleRate, SR);

      const chunkSamples = CHUNK_SECONDS * SR;
      const totalChunks = Math.max(1, Math.ceil(down.length / chunkSamples));
      const parts: string[] = [];

      for (let i = 0; i < totalChunks; i++) {
        const slice = down.subarray(i * chunkSamples, Math.min(down.length, (i + 1) * chunkSamples));
        const wav = encodeWav(slice, SR);
        setStatus(
          `Wysyłam fragment ${i + 1}/${totalChunks} (${(wav.size / 1024 / 1024).toFixed(1)} MB) do transkrypcji…`
        );
        const piece = await sendChunk(wav, i + 1);
        parts.push(piece);
        setText(parts.join(" "));
        setProgress(20 + Math.round(((i + 1) / totalChunks) * 78));
      }

      setProgress(100);
      setStatus(`Gotowe. Fragmentów: ${totalChunks}.`);
      toast({ title: "Transkrypcja ukończona" });
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Błąd transkrypcji",
        description: e?.message || "Spróbuj innego formatu (mp4/m4a/mp3/wav).",
        variant: "destructive",
      });
      setStatus("Błąd: " + (e?.message || "nieznany"));
    } finally {
      setBusy(false);
    }
  };

  const copyText = async () => {
    await navigator.clipboard.writeText(text);
    toast({ title: "Skopiowano do schowka" });
  };

  return (
    <Card className="bg-[#120a1f]/70 border-fuchsia-500/20 p-4 sm:p-6 backdrop-blur overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <FileAudio className="w-5 h-5 text-fuchsia-400" />
        <h2 className="text-lg font-semibold text-white">Sekcja 1 · Wideo/Audio → Tekst</h2>
      </div>
      <p className="text-xs text-fuchsia-200/60 mb-4">
        Obsługa dużych plików (do ~500 MB). Telefon wyciąga sam dźwięk, konwertuje do 16 kHz mono i dzieli na 10-minutowe fragmenty — każdy wysyłany osobno do transkrypcji w chmurze (gpt-4o-mini-transcribe), a wyniki sklejane.
      </p>

      <label className="block border-2 border-dashed border-fuchsia-500/40 rounded-xl p-8 text-center cursor-pointer hover:border-fuchsia-400 hover:bg-fuchsia-500/5 transition">
        <input
          type="file"
          accept="video/mp4,video/quicktime,video/*,audio/*"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <Upload className="w-8 h-8 mx-auto text-fuchsia-400 mb-2" />
        <p className="text-sm text-white">
          {file ? file.name : "Upuść lub kliknij — mp4 / mov / mp3 / wav"}
        </p>
        {file && (
          <p className="text-xs text-fuchsia-200/50 mt-1">
            {(file.size / 1024 / 1024).toFixed(1)} MB
          </p>
        )}
      </label>

      <Button
        onClick={run}
        disabled={!file || busy}
        className="w-full mt-4 bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white border-0"
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
        {busy ? "Pracuję…" : "Transkrybuj"}
      </Button>

      {(busy || progress > 0) && (
        <div className="mt-4">
          <Progress value={progress} className="h-2 bg-fuchsia-950" />
          <p className="text-xs text-fuchsia-200/60 mt-2">{status}</p>
        </div>
      )}

      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Transkrypcja pojawi się tutaj…"
        className="mt-4 min-h-[200px] bg-black/40 border-fuchsia-500/20 text-white placeholder:text-fuchsia-200/30"
      />

      <Button
        onClick={copyText}
        disabled={!text}
        variant="outline"
        className="mt-3 border-fuchsia-500/40 text-fuchsia-200 hover:bg-fuchsia-500/10 hover:text-white"
      >
        <Copy className="w-4 h-4" /> Kopiuj tekst do schowka
      </Button>
    </Card>
  );
}

// ============================================================================
// ELEGANT TEXT-VIDEO GENERATOR
// Vision OCR (Gemini 2.5 Flash via Lovable Cloud) → typed kinetic slides
// ============================================================================
type Duration = 60 | 120 | 300;
type Slide =
  | { kind: "title"; text: string; sub?: string; imageIndex?: number }
  | { kind: "point"; text: string; accent?: string; imageIndex?: number; source?: string }
  | { kind: "quote"; text: string; imageIndex?: number; source?: string }
  | { kind: "stat"; value: string; label: string; imageIndex?: number; source?: string }
  | { kind: "formula"; formula: string; explanation?: string; imageIndex?: number; source?: string }
  | { kind: "calculation"; title: string; lines: string[]; result?: string; imageIndex?: number; source?: string }
  | { kind: "sketch"; title: string; caption?: string; imageIndex?: number; source?: string }
  | { kind: "evidence"; text: string; imageIndex?: number; source?: string }
  | { kind: "outro"; text: string; imageIndex?: number };

type Script = {
  title?: string;
  subtitle?: string;
  slides: Slide[];
};

function VideoGenSection() {
  const { toast } = useToast();
  const [images, setImages] = useState<File[]>([]);
  const [extractedText, setExtractedText] = useState("");
  const [narration, setNarration] = useState("");
  const [script, setScript] = useState<Script | null>(null);
  const [includeImages, setIncludeImages] = useState(true);
  const [duration, setDuration] = useState<Duration>(60);
  const [ocrBusy, setOcrBusy] = useState(false);
  const [ocrStatus, setOcrStatus] = useState("");
  const [rendering, setRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [command, setCommand] = useState("");
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // ---------- VOICE COMMAND ----------
  const toggleMic = () => {
    const SR: any =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast({
        title: "Brak Web Speech API",
        description: "Użyj Chrome/Edge dla komend głosowych.",
        variant: "destructive",
      });
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const r = new SR();
    r.lang = "pl-PL";
    r.onresult = (e: any) => {
      const txt = e.results[0][0].transcript;
      setCommand(txt);
      handleCommand(txt);
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    r.start();
    recognitionRef.current = r;
    setListening(true);
  };

  const handleCommand = (raw: string) => {
    const cmd = raw.toLowerCase();
    if (/(5|pięć).*min/.test(cmd)) setDuration(300);
    else if (/(2|dwa|dwie).*min/.test(cmd)) setDuration(120);
    else if (/(1|jedn|minut)/.test(cmd)) setDuration(60);
    if (/(film|zrób|stwórz|wygeneruj|montaż)/.test(cmd)) renderVideo();
    else if (/(przeczytaj|lektor|powiedz)/.test(cmd)) speak(narration || extractedText);
  };

  const speak = (txt: string) => {
    if (!txt.trim()) {
      toast({ title: "Brak tekstu", variant: "destructive" });
      return;
    }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(txt);
    u.lang = "pl-PL";
    u.rate = 0.95;
    const pl = speechSynthesis.getVoices().find((v) => v.lang.startsWith("pl"));
    if (pl) u.voice = pl;
    speechSynthesis.speak(u);
  };

  // ---------- AI VISION: OCR + SCRIPT ----------
  const fileToBase64 = (f: File): Promise<string> =>
    new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.onerror = rej;
      r.readAsDataURL(f);
    });

  const runOCR = async () => {
    if (images.length === 0) {
      toast({ title: "Najpierw dodaj zrzuty ekranu", variant: "destructive" });
      return;
    }
    setOcrBusy(true);
    setOcrStatus("Wysyłam obrazy do Gemini Vision…");
    try {
      const b64s = await Promise.all(images.map(fileToBase64));
      setOcrStatus("Gemini czyta tekst i pisze scenariusz filmu…");
      const { data, error } = await supabase.functions.invoke("video-script-from-images", {
        body: { images: b64s, duration },
      });
      if (error) throw new Error(error.message);
      if ((data as any)?.error) throw new Error((data as any).error);

      const raw = (data as any).rawText || "";
      const narr = (data as any).narration || raw;
      const sc = (data as any).script as Script | undefined;

      setExtractedText(raw);
      setNarration(narr);
      if (sc?.slides?.length) setScript(sc);

      toast({
        title: "Tekst i scenariusz gotowe",
        description: `${raw.length} znaków · ${sc?.slides?.length ?? 0} ujęć`,
      });
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Błąd analizy",
        description: e?.message || "Spróbuj ponownie.",
        variant: "destructive",
      });
    } finally {
      setOcrBusy(false);
      setOcrStatus("");
    }
  };

  // ---------- FALLBACK: build slides from raw text if no script ----------
  const buildFallbackScript = (text: string): Script => {
    const clean = text.replace(/\s+/g, " ").trim();
    const sentences = clean
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 2);
    const slides: Slide[] = [{ kind: "title", text: "Manifest" }];
    for (const s of sentences) slides.push({ kind: "point", text: s.slice(0, 140) });
    slides.push({ kind: "outro", text: "·" });
    return { title: "Manifest", slides };
  };


  // ---------- RENDER ----------
  const loadImage = (file: File): Promise<HTMLImageElement> =>
    new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = rej;
      img.src = URL.createObjectURL(file);
    });

  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
  ): string[] => {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let line = "";
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = w;
      } else line = test;
    }
    if (line) lines.push(line);
    return lines;
  };

  const renderVideo = async () => {
    const source = (narration.trim() || extractedText).trim();
    if (!source) {
      toast({ title: "Brak tekstu", description: "Najpierw zrób OCR lub wpisz tekst.", variant: "destructive" });
      return;
    }
    setRendering(true);
    setVideoUrl(null);
    setRenderProgress(0);

    try {
      const W = 1920;
      const H = 1080;
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d")!;

      const sc: Script = script ?? buildFallbackScript(source);
      const slides = sc.slides;
      const refImgs = includeImages ? await Promise.all(images.map(loadImage)) : [];
      const totalSec = duration;
      const perSlide = totalSec / slides.length;
      const FPS = 30;

      const stream = canvas.captureStream(FPS);
      const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
        ? "video/webm;codecs=vp9,opus"
        : "video/webm";
      const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 6_000_000 });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
      const done = new Promise<Blob>((resolve) => {
        recorder.onstop = () => resolve(new Blob(chunks, { type: "video/webm" }));
      });
      recorder.start();

      if (narration.trim()) speak(narration);

      const drawBg = (t: number, slideIdx: number, kind: Slide["kind"]) => {
        const palettes: Record<Slide["kind"], [number, number, number]> = {
          title: [285, 270, 250],
          point: [275, 250, 230],
          quote: [220, 260, 290],
          stat:  [310, 285, 260],
          outro: [260, 240, 220],
        };
        const [h1, h2, h3] = palettes[kind];
        const wob = Math.sin(t * 0.4 + slideIdx) * 8;
        const g = ctx.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, `hsl(${h1 + wob}, 60%, 7%)`);
        g.addColorStop(0.5, `hsl(${h2}, 55%, 5%)`);
        g.addColorStop(1, `hsl(${h3 - wob}, 65%, 9%)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        for (let i = 0; i < 3; i++) {
          const cx = W * (0.2 + 0.3 * i) + Math.sin(t * 0.5 + i) * 80;
          const cy = H * (0.3 + 0.25 * Math.sin(i)) + Math.cos(t * 0.4 + i) * 60;
          const rad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 700);
          rad.addColorStop(0, `hsla(${h1 + i * 30}, 80%, 60%, 0.20)`);
          rad.addColorStop(1, "transparent");
          ctx.fillStyle = rad;
          ctx.fillRect(0, 0, W, H);
        }
        const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.78);
        vg.addColorStop(0, "transparent");
        vg.addColorStop(1, "rgba(0,0,0,0.6)");
        ctx.fillStyle = vg;
        ctx.fillRect(0, 0, W, H);
      };

      const drawChrome = (slideIdx: number, alpha: number) => {
        ctx.globalAlpha = 0.5 * alpha;
        ctx.fillStyle = "#f0abfc";
        ctx.font = "500 24px 'Inter', sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(
          `${String(slideIdx + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`,
          80, 80,
        );
        ctx.globalAlpha = 0.35 * alpha;
        ctx.font = "400 20px 'Inter', sans-serif";
        ctx.textAlign = "right";
        ctx.fillText("MOJE STUDIO · 2026", W - 80, H - 60);
        ctx.textAlign = "left";
        ctx.globalAlpha = 1;
      };

      const drawAccentLine = (y: number, fadeIn: number, alpha: number) => {
        const lineW = 120 + 260 * fadeIn;
        const grad = ctx.createLinearGradient(80, 0, 80 + lineW, 0);
        grad.addColorStop(0, "#d946ef");
        grad.addColorStop(1, "#8b5cf6");
        ctx.globalAlpha = alpha;
        ctx.fillStyle = grad;
        ctx.fillRect(80, y, lineW, 4);
        ctx.globalAlpha = 1;
      };

      const drawCenteredText = (
        text: string,
        size: number,
        weight: number,
        cy: number,
        alpha: number,
        color = "#ffffff",
        offY = 0,
      ) => {
        ctx.fillStyle = color;
        ctx.font = `${weight} ${size}px 'Inter', 'Helvetica Neue', sans-serif`;
        ctx.textAlign = "center";
        const lines = wrapText(ctx, text, W - 200);
        const lh = size * 1.18;
        let y = cy - (lines.length - 1) * lh / 2 + offY;
        ctx.shadowColor = "rgba(217,70,239,0.4)";
        ctx.shadowBlur = 40;
        for (let i = 0; i < lines.length; i++) {
          const a = Math.max(0, Math.min(1, alpha * 3 - i * 0.25));
          ctx.globalAlpha = a;
          ctx.fillText(lines[i], W / 2, y);
          y += lh;
        }
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        ctx.textAlign = "left";
      };

      const drawSlide = (slide: Slide, localT: number, slideIdx: number, globalT: number) => {
        drawBg(globalT, slideIdx, slide.kind);

        if (refImgs.length) {
          const img = refImgs[slideIdx % refImgs.length];
          const r = Math.min(W / img.width, H / img.height) * 0.95;
          const iw = img.width * r;
          const ih = img.height * r;
          const zoom = 1 + 0.08 * localT;
          ctx.globalAlpha = 0.1;
          ctx.drawImage(img, (W - iw * zoom) / 2, (H - ih * zoom) / 2, iw * zoom, ih * zoom);
          ctx.globalAlpha = 1;
        }

        const fadeIn = Math.min(1, localT / 0.18);
        const fadeOut = Math.min(1, (1 - localT) / 0.18);
        const alpha = Math.min(fadeIn, fadeOut);
        const offY = (1 - fadeIn) * 30;

        drawChrome(slideIdx, alpha);

        switch (slide.kind) {
          case "title": {
            drawAccentLine(H / 2 - 60, fadeIn, alpha);
            drawCenteredText(slide.text, 120, 800, H / 2 + 30, alpha, "#ffffff", offY);
            if (slide.sub) {
              drawCenteredText(slide.sub, 36, 400, H / 2 + 160, alpha, "#f0abfc", offY);
            }
            break;
          }
          case "point": {
            drawAccentLine(H / 2 - 140, fadeIn, alpha);
            const t = slide.text;
            const size = t.length > 90 ? 56 : t.length > 50 ? 72 : 88;
            drawCenteredText(t, size, 700, H / 2 + 20, alpha, "#ffffff", offY);
            if (slide.accent) {
              drawCenteredText(slide.accent.toUpperCase(), 26, 600, H - 200, alpha, "#f0abfc", 0);
            }
            break;
          }
          case "quote": {
            // huge quotes mark
            ctx.globalAlpha = 0.25 * alpha;
            ctx.fillStyle = "#d946ef";
            ctx.font = `900 320px 'Georgia', serif`;
            ctx.textAlign = "center";
            ctx.fillText("\u201C", W / 2, H / 2 - 80);
            ctx.globalAlpha = 1;
            ctx.textAlign = "left";
            const t = slide.text;
            const size = t.length > 90 ? 52 : 68;
            drawCenteredText(t, size, 500, H / 2 + 80, alpha, "#ffffff", offY);
            break;
          }
          case "stat": {
            drawCenteredText(slide.value, 200, 900, H / 2 - 20, alpha, "#ffffff", offY);
            drawAccentLine(H / 2 + 100, fadeIn, alpha);
            drawCenteredText(slide.label, 38, 400, H / 2 + 180, alpha, "#f0abfc", offY);
            break;
          }
          case "outro": {
            const pulse = 1 + 0.04 * Math.sin(globalT * 2);
            ctx.save();
            ctx.translate(W / 2, H / 2);
            ctx.scale(pulse, pulse);
            ctx.translate(-W / 2, -H / 2);
            drawCenteredText(slide.text, 96, 700, H / 2, alpha, "#ffffff", offY);
            ctx.restore();
            break;
          }
        }
      };

      const start = performance.now();
      const totalMs = totalSec * 1000;
      await new Promise<void>((resolve) => {
        const tick = () => {
          const elapsed = performance.now() - start;
          if (elapsed >= totalMs) return resolve();
          const sec = elapsed / 1000;
          const idx = Math.min(slides.length - 1, Math.floor(sec / perSlide));
          const localT = (sec % perSlide) / perSlide;
          drawSlide(slides[idx], localT, idx, sec);
          setRenderProgress(Math.round((elapsed / totalMs) * 100));
          requestAnimationFrame(tick);
        };
        tick();
      });

      recorder.stop();
      const blob = await done;
      setVideoUrl(URL.createObjectURL(blob));
      setRenderProgress(100);
      toast({ title: "Film gotowy", description: `${slides.length} ujęć · ${totalSec}s` });
    } catch (e: any) {
      console.error(e);
      toast({ title: "Błąd renderowania", description: e?.message, variant: "destructive" });
    } finally {
      setRendering(false);
    }
  };


  return (
    <Card className="bg-[#120a1f]/70 border-fuchsia-500/20 p-4 sm:p-6 backdrop-blur overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <Film className="w-5 h-5 text-fuchsia-400" />
        <h2 className="text-lg font-semibold text-white">Sekcja 2 · OCR → elegancki film</h2>
      </div>
      <p className="text-xs text-fuchsia-200/60 mb-4">
        Wrzuć zrzuty — Gemini Vision odczyta tekst (polskie znaki OK) i napisze scenariusz filmu (tytuł · punkty · cytaty · puenta).
      </p>

      <label className="block border-2 border-dashed border-fuchsia-500/40 rounded-xl p-6 text-center cursor-pointer hover:border-fuchsia-400 hover:bg-fuchsia-500/5 transition">
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => setImages(Array.from(e.target.files || []))}
        />
        <Images className="w-8 h-8 mx-auto text-fuchsia-400 mb-2" />
        <p className="text-sm text-white">
          {images.length > 0 ? `Wybrano ${images.length} obrazów` : "Upuść lub kliknij — zrzuty ekranu"}
        </p>
      </label>

      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3 pb-1">
          {images.map((f, i) => (
            <img
              key={i}
              src={URL.createObjectURL(f)}
              alt=""
              className="h-14 w-14 object-cover rounded border border-fuchsia-500/30 shrink-0"
            />
          ))}
        </div>
      )}

      <Button
        onClick={runOCR}
        disabled={ocrBusy || images.length === 0}
        className="w-full mt-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0"
      >
        {ocrBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
        {ocrBusy ? "Czytam tekst…" : "Odczytaj tekst ze zrzutów (OCR)"}
      </Button>

      {ocrBusy && (
        <div className="mt-3">
          <Progress value={undefined} className="h-2 bg-fuchsia-950 animate-pulse" />
          <p className="text-xs text-fuchsia-200/60 mt-1">{ocrStatus}</p>
        </div>
      )}

      <div className="mt-4">
        <label className="text-xs text-fuchsia-200/60 mb-1 block">
          Tekst do filmu / lektora (edytowalny — pochodzi z OCR lub wpisz własny)
        </label>
        <Textarea
          value={narration}
          onChange={(e) => setNarration(e.target.value)}
          placeholder="Tu pojawi się odczytany tekst albo wpisz własny…"
          className="bg-black/40 border-fuchsia-500/20 text-white placeholder:text-fuchsia-200/30 min-h-[120px]"
        />
      </div>

      {/* duration selector */}
      <div className="mt-4">
        <label className="text-xs text-fuchsia-200/60 mb-2 block">Długość filmu</label>
        <div className="grid grid-cols-3 gap-2">
          {([60, 120, 300] as Duration[]).map((d) => (
            <Button
              key={d}
              type="button"
              onClick={() => setDuration(d)}
              variant={duration === d ? "default" : "outline"}
              className={
                duration === d
                  ? "bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white border-0"
                  : "border-fuchsia-500/40 text-fuchsia-200 hover:bg-fuchsia-500/10 hover:text-white"
              }
            >
              {d === 60 ? "1 min" : d === 120 ? "2 min" : "5 min"}
            </Button>
          ))}
        </div>
      </div>

      <label className="mt-4 flex items-center gap-2 text-xs text-fuchsia-200/70 cursor-pointer">
        <input
          type="checkbox"
          checked={includeImages}
          onChange={(e) => setIncludeImages(e.target.checked)}
          className="accent-fuchsia-500"
        />
        Pokaż oryginalne zrzuty w tle (delikatnie, 12% krycia)
      </label>

      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <Input
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCommand(command)}
          placeholder='Komenda: „Zrób film 2 min" / „Przeczytaj tekst"'
          className="bg-black/40 border-fuchsia-500/30 text-white placeholder:text-fuchsia-200/30 focus-visible:ring-fuchsia-500 min-w-0 flex-1"
        />
        <Button
          type="button"
          onClick={toggleMic}
          variant="outline"
          className={`border-fuchsia-500/40 hover:bg-fuchsia-500/10 shrink-0 ${
            listening ? "bg-fuchsia-500/20 text-fuchsia-200" : "text-fuchsia-200"
          }`}
        >
          {listening ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </Button>
      </div>

      {images.length > 0 && !extractedText.trim() && !narration.trim() && (
        <p className="mt-3 text-xs text-amber-300/80">
          Wskazówka: najpierw kliknij „Odczytaj tekst ze zrzutów (OCR)", potem przycisk generowania filmu się odblokuje.
        </p>
      )}

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Button
          onClick={renderVideo}
          disabled={rendering || !(narration.trim() || extractedText.trim())}
          className="bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white border-0 whitespace-normal h-auto py-3"
        >
          {rendering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Film className="w-4 h-4" />}
          <span className="ml-2">Wygeneruj film ({duration === 60 ? "1 min" : duration === 120 ? "2 min" : "5 min"})</span>
        </Button>
        <Button
          onClick={() => speak(narration || extractedText)}
          variant="outline"
          className="border-fuchsia-500/40 text-fuchsia-200 hover:bg-fuchsia-500/10 hover:text-white whitespace-normal h-auto py-3"
        >
          <Volume2 className="w-4 h-4" /> <span className="ml-2">Przeczytaj tekst</span>
        </Button>
      </div>

      {rendering && (
        <div className="mt-4">
          <Progress value={renderProgress} className="h-2 bg-fuchsia-950" />
          <p className="text-xs text-fuchsia-200/60 mt-2">Renderowanie: {renderProgress}% (potrwa tyle, ile długość filmu)</p>
        </div>
      )}

      {videoUrl && (
        <div className="mt-4 space-y-3">
          <video src={videoUrl} controls className="w-full rounded-lg border border-fuchsia-500/30" />
          <a href={videoUrl} download="moje-studio-wideo.webm">
            <Button className="w-full bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white border-0">
              <Download className="w-4 h-4" /> Pobierz film (.webm)
            </Button>
          </a>
        </div>
      )}
    </Card>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================
export default function MojeStudioWideo() {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === "1") setUnlocked(true);
    document.title = "Studio · prywatne";
    const meta = document.querySelector('meta[name="robots"]');
    if (meta) meta.setAttribute("content", "noindex, nofollow");
    else {
      const m = document.createElement("meta");
      m.name = "robots";
      m.content = "noindex, nofollow";
      document.head.appendChild(m);
    }
  }, []);

  if (!unlocked) return <PasswordGate onUnlock={() => setUnlocked(true)} />;

  return (
    <div className="min-h-screen bg-[#09060f] text-white">
      {/* neon background */}
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none opacity-60"
        style={{
          background:
            "radial-gradient(circle at 20% 10%, rgba(217,70,239,0.18), transparent 40%), radial-gradient(circle at 80% 80%, rgba(139,92,246,0.18), transparent 45%)",
        }}
      />
      <div className="relative max-w-5xl mx-auto p-4 sm:p-8">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
              Moje Studio Wideo
            </h1>
            <p className="text-xs text-fuchsia-200/60 mt-1">
              Prywatne narzędzia — transkrypcja i generator filmów. 100% lokalnie.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              sessionStorage.removeItem(STORAGE_KEY);
              setUnlocked(false);
            }}
            className="text-fuchsia-200/70 hover:text-white hover:bg-fuchsia-500/10"
          >
            <Lock className="w-4 h-4" /> Wyloguj
          </Button>
        </header>

        <div className="grid lg:grid-cols-2 gap-6">
          <TranscriptionSection />
          <VideoGenSection />
        </div>

        <footer className="mt-10 text-center text-xs text-fuchsia-200/40">
          Whisper (lokalnie) · Gemini Vision (Lovable Cloud) · canvas + MediaRecorder
        </footer>
      </div>
    </div>
  );
}
