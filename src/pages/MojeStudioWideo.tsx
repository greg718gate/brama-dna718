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
} from "lucide-react";

const PASSWORD = "MojeStudio2026";
const STORAGE_KEY = "moje-studio-wideo-auth";

// ============================================================================
// PASSWORD GATE
// ============================================================================
function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd === PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      onUnlock();
    } else {
      setError(true);
      setPwd("");
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
        <Input
          type="password"
          autoFocus
          value={pwd}
          onChange={(e) => {
            setPwd(e.target.value);
            setError(false);
          }}
          placeholder="••••••••••"
          className="bg-black/40 border-fuchsia-500/30 text-white placeholder:text-fuchsia-200/30 focus-visible:ring-fuchsia-500"
        />
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
// VIDEO GENERATOR (canvas + MediaRecorder + Web Speech API)
// ============================================================================
function VideoGenSection() {
  const { toast } = useToast();
  const [images, setImages] = useState<File[]>([]);
  const [command, setCommand] = useState("");
  const [narration, setNarration] = useState("");
  const [listening, setListening] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [renderProgress, setRenderProgress] = useState(0);
  const recognitionRef = useRef<any>(null);

  // ----- voice input -----
  const toggleMic = () => {
    const SR: any =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast({
        title: "Brak Web Speech API",
        description: "Twoja przeglądarka nie obsługuje rozpoznawania mowy. Użyj Chrome/Edge.",
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
    r.continuous = false;
    r.interimResults = false;
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

  // ----- command parser -----
  const handleCommand = (raw: string) => {
    const cmd = raw.toLowerCase().trim();
    if (/(film|scal|montaż|zrób|stwórz|wygeneruj)/.test(cmd)) {
      const min = /1.*min|jedn.*min|minut/.test(cmd) ? 60 : 30;
      renderVideo(min);
    } else if (/(przeczytaj|lektor|powiedz)/.test(cmd)) {
      speak(narration || command);
    } else {
      toast({
        title: "Nie rozpoznano komendy",
        description: 'Spróbuj: "Zrób film 1-minutowy" lub "Przeczytaj tekst".',
      });
    }
  };

  const speak = (txt: string) => {
    if (!txt.trim()) {
      toast({ title: "Brak tekstu do przeczytania", variant: "destructive" });
      return;
    }
    const u = new SpeechSynthesisUtterance(txt);
    u.lang = "pl-PL";
    const voices = speechSynthesis.getVoices();
    const pl = voices.find((v) => v.lang.startsWith("pl"));
    if (pl) u.voice = pl;
    speechSynthesis.speak(u);
  };

  // ----- render video from images + narration -----
  const loadImage = (file: File): Promise<HTMLImageElement> =>
    new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = rej;
      img.src = URL.createObjectURL(file);
    });

  const renderVideo = async (totalSeconds: number) => {
    if (images.length === 0) {
      toast({ title: "Dodaj zdjęcia", variant: "destructive" });
      return;
    }
    setRendering(true);
    setVideoUrl(null);
    setRenderProgress(0);

    try {
      const W = 1280;
      const H = 720;
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d")!;

      const imgs = await Promise.all(images.map(loadImage));
      const perSlide = totalSeconds / imgs.length;
      const FPS = 30;

      const stream = canvas.captureStream(FPS);

      // narration audio mix
      let audioDest: MediaStreamAudioDestinationNode | null = null;
      let audioCtx: AudioContext | null = null;
      if (narration.trim() && "speechSynthesis" in window) {
        try {
          audioCtx = new AudioContext();
          audioDest = audioCtx.createMediaStreamDestination();
          // SpeechSynthesis can't be captured directly; we route via getUserMedia of speech is impossible.
          // Fallback: just play the utterance live during recording (audible to user) and try to capture via
          // microphone-less route by piping through an oscillator silent track to keep audio channel.
          const silent = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          gain.gain.value = 0;
          silent.connect(gain).connect(audioDest);
          silent.start();
          audioDest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));
        } catch {
          /* ignore */
        }
      }

      const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
        ? "video/webm;codecs=vp9,opus"
        : "video/webm";
      const recorder = new MediaRecorder(stream, { mimeType: mime });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);

      const done = new Promise<Blob>((resolve) => {
        recorder.onstop = () => resolve(new Blob(chunks, { type: "video/webm" }));
      });

      recorder.start();

      // start narration in parallel (audible, not captured into stream reliably across browsers)
      if (narration.trim()) speak(narration);

      const drawFitted = (img: HTMLImageElement, scale: number, alpha: number) => {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = alpha;
        const r = Math.min(W / img.width, H / img.height) * scale;
        const w = img.width * r;
        const h = img.height * r;
        ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
        ctx.globalAlpha = 1;
      };

      const start = performance.now();
      const totalMs = totalSeconds * 1000;

      await new Promise<void>((resolve) => {
        const tick = () => {
          const elapsed = performance.now() - start;
          if (elapsed >= totalMs) return resolve();
          const idx = Math.min(imgs.length - 1, Math.floor(elapsed / 1000 / perSlide));
          const within = (elapsed / 1000) % perSlide; // 0..perSlide
          const t = within / perSlide;
          const zoom = 1.0 + 0.08 * t; // gentle ken-burns
          // fade-in first 0.4s, fade-out last 0.4s
          let alpha = 1;
          if (within < 0.4) alpha = within / 0.4;
          else if (within > perSlide - 0.4) alpha = (perSlide - within) / 0.4;
          drawFitted(imgs[idx], zoom, Math.max(0, Math.min(1, alpha)));
          setRenderProgress(Math.round((elapsed / totalMs) * 100));
          requestAnimationFrame(tick);
        };
        tick();
      });

      recorder.stop();
      const blob = await done;
      audioCtx?.close();
      setVideoUrl(URL.createObjectURL(blob));
      setRenderProgress(100);
      toast({ title: "Film gotowy", description: "Możesz go pobrać poniżej." });
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
        <h2 className="text-lg font-semibold text-white">Sekcja 2 · Generator filmów ze zdjęć</h2>
      </div>
      <p className="text-xs text-fuchsia-200/60 mb-4">
        Lokalny render canvas + MediaRecorder. Wszystko w przeglądarce, bez wysyłania danych.
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
          {images.length > 0 ? `Wybrano ${images.length} zdjęć` : "Upuść lub kliknij — zdjęcia"}
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

      <div className="mt-4">
        <label className="text-xs text-fuchsia-200/60 mb-1 block">
          Tekst lektora (czytany jako voiceover)
        </label>
        <Textarea
          value={narration}
          onChange={(e) => setNarration(e.target.value)}
          placeholder="Wpisz lub wklej tekst do przeczytania przez lektora…"
          className="bg-black/40 border-fuchsia-500/20 text-white placeholder:text-fuchsia-200/30 min-h-[80px]"
        />
      </div>

      <div className="mt-4 flex gap-2">
        <Input
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCommand(command)}
          placeholder='Komenda: „Zrób film 1-minutowy" lub „Przeczytaj tekst"'
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
          onClick={() => renderVideo(60)}
          disabled={rendering || images.length === 0}
          className="bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white border-0"
        >
          {rendering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Film className="w-4 h-4" />}
          Zrób film 1-min
        </Button>
        <Button
          onClick={() => speak(narration)}
          variant="outline"
          className="border-fuchsia-500/40 text-fuchsia-200 hover:bg-fuchsia-500/10 hover:text-white"
        >
          <Volume2 className="w-4 h-4" /> Przeczytaj tekst
        </Button>
      </div>

      {rendering && (
        <div className="mt-4">
          <Progress value={renderProgress} className="h-2 bg-fuchsia-950" />
          <p className="text-xs text-fuchsia-200/60 mt-2">Renderowanie: {renderProgress}%</p>
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
