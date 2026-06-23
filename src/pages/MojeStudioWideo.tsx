import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
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
// TRANSCRIPTION (Whisper via @xenova/transformers)
// ============================================================================
function TranscriptionSection() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const pipelineRef = useRef<any>(null);

  const decodeAudio = async (f: File): Promise<Float32Array> => {
    const arrayBuf = await f.arrayBuffer();
    const Ctx = (window.AudioContext || (window as any).webkitAudioContext);
    const ctx = new Ctx({ sampleRate: 16000 });
    const audio = await ctx.decodeAudioData(arrayBuf.slice(0));
    // mix to mono
    if (audio.numberOfChannels === 1) return audio.getChannelData(0);
    const left = audio.getChannelData(0);
    const right = audio.getChannelData(1);
    const out = new Float32Array(left.length);
    for (let i = 0; i < left.length; i++) out[i] = (left[i] + right[i]) / 2;
    return out;
  };

  const run = async () => {
    if (!file) return;
    setBusy(true);
    setText("");
    setProgress(2);
    setStatus("Inicjalizacja modelu Whisper (lokalnie w przeglądarce)…");

    try {
      const { pipeline, env } = await import("@xenova/transformers");
      env.allowLocalModels = false;

      if (!pipelineRef.current) {
        pipelineRef.current = await pipeline(
          "automatic-speech-recognition",
          "Xenova/whisper-tiny",
          {
            progress_callback: (p: any) => {
              if (p.status === "progress" && p.progress) {
                setProgress(Math.min(40, Math.round(p.progress * 0.4)));
                setStatus(`Pobieranie modelu: ${p.file} (${Math.round(p.progress)}%)`);
              }
            },
          } as any,
        );
      }
      setProgress(45);
      setStatus("Dekodowanie audio…");
      const audio = await decodeAudio(file);

      setProgress(55);
      setStatus("Transkrypcja w toku (lokalnie, bez wysyłania pliku)…");
      const result: any = await pipelineRef.current(audio, {
        chunk_length_s: 30,
        stride_length_s: 5,
        language: "polish",
        task: "transcribe",
        return_timestamps: false,
        callback_function: (beams: any) => {
          // streaming-ish update
          if (beams?.[0]?.output_token_ids) {
            setProgress((p) => Math.min(95, p + 1));
          }
        },
      });
      setText(result?.text?.trim() || "");
      setProgress(100);
      setStatus("Gotowe.");
      toast({ title: "Transkrypcja ukończona" });
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Błąd transkrypcji",
        description: e?.message || "Spróbuj krótszego pliku lub innego formatu.",
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
    <Card className="bg-[#120a1f]/70 border-fuchsia-500/20 p-6 backdrop-blur">
      <div className="flex items-center gap-2 mb-4">
        <FileAudio className="w-5 h-5 text-fuchsia-400" />
        <h2 className="text-lg font-semibold text-white">Sekcja 1 · Wideo/Audio → Tekst</h2>
      </div>
      <p className="text-xs text-fuchsia-200/60 mb-4">
        Lokalna transkrypcja przez Whisper (Transformers.js). Plik nigdy nie opuszcza Twojej przeglądarki.
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
// OCR (tesseract.js) → kinetic typography slides (canvas + MediaRecorder)
// ============================================================================
type Duration = 60 | 120 | 300;

function VideoGenSection() {
  const { toast } = useToast();
  const [images, setImages] = useState<File[]>([]);
  const [extractedText, setExtractedText] = useState("");
  const [narration, setNarration] = useState("");
  const [includeImages, setIncludeImages] = useState(false);
  const [duration, setDuration] = useState<Duration>(60);
  const [ocrBusy, setOcrBusy] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
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
    const u = new SpeechSynthesisUtterance(txt);
    u.lang = "pl-PL";
    const pl = speechSynthesis.getVoices().find((v) => v.lang.startsWith("pl"));
    if (pl) u.voice = pl;
    speechSynthesis.speak(u);
  };

  // ---------- OCR ----------
  const runOCR = async () => {
    if (images.length === 0) {
      toast({ title: "Najpierw dodaj zrzuty ekranu", variant: "destructive" });
      return;
    }
    setOcrBusy(true);
    setOcrProgress(0);
    setExtractedText("");
    try {
      const Tesseract = (await import("tesseract.js")).default;
      setOcrStatus("Inicjalizacja silnika OCR (pol+eng)…");
      const worker = await Tesseract.createWorker(["pol", "eng"], 1, {
        logger: (m: any) => {
          if (m.status) setOcrStatus(m.status);
          if (typeof m.progress === "number")
            setOcrProgress(Math.round(m.progress * 100));
        },
      });
      const all: string[] = [];
      for (let i = 0; i < images.length; i++) {
        setOcrStatus(`Analiza obrazu ${i + 1}/${images.length}…`);
        const { data } = await worker.recognize(images[i]);
        const clean = data.text.replace(/\s+\n/g, "\n").replace(/[ \t]+/g, " ").trim();
        if (clean) all.push(clean);
      }
      await worker.terminate();
      const joined = all.join("\n\n");
      setExtractedText(joined);
      if (!narration.trim()) setNarration(joined);
      toast({ title: "Tekst odczytany", description: `${joined.length} znaków` });
    } catch (e: any) {
      console.error(e);
      toast({ title: "Błąd OCR", description: e?.message, variant: "destructive" });
    } finally {
      setOcrBusy(false);
      setOcrStatus("");
    }
  };

  // ---------- SLIDE BUILDER ----------
  const buildSlides = (text: string): { title?: string; body: string }[] => {
    const clean = text.replace(/\s+/g, " ").trim();
    if (!clean) return [{ body: "Brak tekstu" }];
    // split into sentences
    const sentences = clean
      .split(/(?<=[.!?])\s+|\n+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 2);
    // group into chunks of ~120 chars
    const slides: { title?: string; body: string }[] = [];
    let buf = "";
    for (const s of sentences) {
      if ((buf + " " + s).length > 140 && buf) {
        slides.push({ body: buf.trim() });
        buf = s;
      } else {
        buf = buf ? buf + " " + s : s;
      }
    }
    if (buf) slides.push({ body: buf.trim() });
    return slides.length ? slides : [{ body: clean.slice(0, 140) }];
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

      const slides = buildSlides(source);
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

      // narration plays live (audible during render)
      if (narration.trim()) speak(narration);

      const drawBg = (t: number, slideIdx: number) => {
        // animated gradient
        const a = (slideIdx * 47 + t * 30) % 360;
        const g = ctx.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, `hsl(${a}, 55%, 8%)`);
        g.addColorStop(0.5, `hsl(${(a + 40) % 360}, 60%, 6%)`);
        g.addColorStop(1, `hsl(${(a + 80) % 360}, 65%, 10%)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        // soft glow orbs
        for (let i = 0; i < 3; i++) {
          const cx = W * (0.2 + 0.3 * i) + Math.sin(t * 0.6 + i) * 60;
          const cy = H * (0.3 + 0.2 * Math.sin(i)) + Math.cos(t * 0.5 + i) * 40;
          const rad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 600);
          rad.addColorStop(0, `hsla(${(a + i * 60) % 360}, 80%, 60%, 0.18)`);
          rad.addColorStop(1, "transparent");
          ctx.fillStyle = rad;
          ctx.fillRect(0, 0, W, H);
        }
        // grain / vignette
        const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75);
        vg.addColorStop(0, "transparent");
        vg.addColorStop(1, "rgba(0,0,0,0.55)");
        ctx.fillStyle = vg;
        ctx.fillRect(0, 0, W, H);
      };

      const drawSlide = (slide: { body: string }, localT: number, slideIdx: number, globalT: number) => {
        drawBg(globalT, slideIdx);

        // optional faded reference image
        if (refImgs.length) {
          const img = refImgs[slideIdx % refImgs.length];
          const r = Math.min(W / img.width, H / img.height) * 0.9;
          const iw = img.width * r;
          const ih = img.height * r;
          ctx.globalAlpha = 0.12;
          ctx.drawImage(img, (W - iw) / 2, (H - ih) / 2, iw, ih);
          ctx.globalAlpha = 1;
        }

        // animation timings (localT = 0..1)
        const fadeIn = Math.min(1, localT / 0.18);
        const fadeOut = Math.min(1, (1 - localT) / 0.18);
        const alpha = Math.max(0, Math.min(1, Math.min(fadeIn, fadeOut)));
        const slide_y = (1 - fadeIn) * 30; // slide up

        // counter
        ctx.globalAlpha = 0.55 * alpha;
        ctx.fillStyle = "#f0abfc";
        ctx.font = "500 24px 'Inter', sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(`${String(slideIdx + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`, 80, 80);

        // accent line
        ctx.globalAlpha = alpha;
        const lineW = 120 + 200 * fadeIn;
        const grad = ctx.createLinearGradient(80, 0, 80 + lineW, 0);
        grad.addColorStop(0, "#d946ef");
        grad.addColorStop(1, "#8b5cf6");
        ctx.fillStyle = grad;
        ctx.fillRect(80, H / 2 - 180 + slide_y, lineW, 4);

        // body text
        ctx.fillStyle = "#ffffff";
        const baseSize = slide.body.length > 100 ? 56 : slide.body.length > 60 ? 72 : 92;
        ctx.font = `700 ${baseSize}px 'Inter', 'Helvetica Neue', sans-serif`;
        const maxW = W - 160;
        const lines = wrapText(ctx, slide.body, maxW);
        const lh = baseSize * 1.2;
        const totalH = lines.length * lh;
        let y = H / 2 - totalH / 2 + lh + slide_y;
        ctx.shadowColor = "rgba(217,70,239,0.35)";
        ctx.shadowBlur = 30;
        for (let i = 0; i < lines.length; i++) {
          const lineAlpha = Math.max(0, Math.min(1, fadeIn * 3 - i * 0.3)) * fadeOut;
          ctx.globalAlpha = lineAlpha;
          ctx.fillText(lines[i], 80, y);
          y += lh;
        }
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        // footer mark
        ctx.globalAlpha = 0.4 * alpha;
        ctx.fillStyle = "#f0abfc";
        ctx.font = "400 20px 'Inter', sans-serif";
        ctx.textAlign = "right";
        ctx.fillText("MOJE STUDIO · 2026", W - 80, H - 60);
        ctx.textAlign = "left";
        ctx.globalAlpha = 1;
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
    <Card className="bg-[#120a1f]/70 border-fuchsia-500/20 p-6 backdrop-blur">
      <div className="flex items-center gap-2 mb-4">
        <Film className="w-5 h-5 text-fuchsia-400" />
        <h2 className="text-lg font-semibold text-white">Sekcja 2 · OCR → elegancki film</h2>
      </div>
      <p className="text-xs text-fuchsia-200/60 mb-4">
        Wrzuć zrzuty ekranu — odczytam z nich tekst (OCR pol+eng) i zmontuję kinetyczny film typograficzny.
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
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
          {images.map((f, i) => (
            <img
              key={i}
              src={URL.createObjectURL(f)}
              alt=""
              className="h-16 w-16 object-cover rounded border border-fuchsia-500/30"
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

      {(ocrBusy || ocrProgress > 0) && (
        <div className="mt-3">
          <Progress value={ocrProgress} className="h-2 bg-fuchsia-950" />
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

      <div className="mt-4 flex gap-2">
        <Input
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCommand(command)}
          placeholder='Komenda: „Zrób film 2 min" / „Przeczytaj tekst"'
          className="bg-black/40 border-fuchsia-500/30 text-white placeholder:text-fuchsia-200/30 focus-visible:ring-fuchsia-500"
        />
        <Button
          type="button"
          onClick={toggleMic}
          variant="outline"
          className={`border-fuchsia-500/40 hover:bg-fuchsia-500/10 ${
            listening ? "bg-fuchsia-500/20 text-fuchsia-200" : "text-fuchsia-200"
          }`}
        >
          {listening ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </Button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button
          onClick={renderVideo}
          disabled={rendering || !(narration.trim() || extractedText.trim())}
          className="bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white border-0"
        >
          {rendering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Film className="w-4 h-4" />}
          Wygeneruj film ({duration === 60 ? "1 min" : duration === 120 ? "2 min" : "5 min"})
        </Button>
        <Button
          onClick={() => speak(narration || extractedText)}
          variant="outline"
          className="border-fuchsia-500/40 text-fuchsia-200 hover:bg-fuchsia-500/10 hover:text-white"
        >
          <Volume2 className="w-4 h-4" /> Przeczytaj tekst
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
          Whisper przez @xenova/transformers · Web Speech API · canvas + MediaRecorder
        </footer>
      </div>
    </div>
  );
}
