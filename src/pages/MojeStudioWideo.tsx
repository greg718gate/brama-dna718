import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
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
  const { language } = useLanguage();
  const [pwd, setPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState(false);
  const tr = (pl: string, en: string) => (language === "pl" ? pl : en);

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
          <h1 className="text-xl font-semibold tracking-wide">{tr("Dostęp ograniczony", "Restricted access")}</h1>
          <p className="text-xs text-fuchsia-200/60 text-center">
            {tr("Strefa prywatna. Wpisz hasło, aby kontynuować.", "Private area. Enter the password to continue.")}
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
            aria-label={showPwd ? tr("Ukryj hasło", "Hide password") : tr("Pokaż hasło", "Show password")}
          >
            {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {error && (
          <p className="text-xs text-red-400 mt-2">{tr("Nieprawidłowe hasło.", "Invalid password.")}</p>
        )}
        <Button
          type="submit"
          className="w-full mt-4 bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white border-0"
        >
          {tr("Odblokuj", "Unlock")}
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
  const { language } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const SR = 16000; // 16 kHz mono
  const CHUNK_SECONDS = 600; // 10 min per chunk → ~19 MB WAV (< 25 MB limit)
  const tr = (pl: string, en: string) => (language === "pl" ? pl : en);

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
      toast({ title: tr("Plik za duży", "File too large"), description: tr("Maks. 500 MB.", "Max. 500 MB."), variant: "destructive" });
      return;
    }
    setBusy(true);
    setText("");
    setProgress(2);
    setStatus(tr("Wczytuję plik…", "Loading file…"));

    try {
      const arrayBuf = await file.arrayBuffer();
      setProgress(8);
      setStatus(tr("Dekoduję ścieżkę dźwiękową (lokalnie w przeglądarce)…", "Decoding the audio track locally in the browser…"));

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
      setStatus(tr("Konwertuję do 16 kHz mono…", "Converting to 16 kHz mono…"));
      const down = downsample(mono, audio.sampleRate, SR);

      const chunkSamples = CHUNK_SECONDS * SR;
      const totalChunks = Math.max(1, Math.ceil(down.length / chunkSamples));
      const parts: string[] = [];

      for (let i = 0; i < totalChunks; i++) {
        const slice = down.subarray(i * chunkSamples, Math.min(down.length, (i + 1) * chunkSamples));
        const wav = encodeWav(slice, SR);
        setStatus(
          language === "pl"
            ? `Wysyłam fragment ${i + 1}/${totalChunks} (${(wav.size / 1024 / 1024).toFixed(1)} MB) do transkrypcji…`
            : `Sending chunk ${i + 1}/${totalChunks} (${(wav.size / 1024 / 1024).toFixed(1)} MB) for transcription…`
        );
        const piece = await sendChunk(wav, i + 1);
        parts.push(piece);
        setText(parts.join(" "));
        setProgress(20 + Math.round(((i + 1) / totalChunks) * 78));
      }

      setProgress(100);
      setStatus(language === "pl" ? `Gotowe. Fragmentów: ${totalChunks}.` : `Done. Chunks: ${totalChunks}.`);
      toast({ title: tr("Transkrypcja ukończona", "Transcription complete") });
    } catch (e: any) {
      console.error(e);
      toast({
        title: tr("Błąd transkrypcji", "Transcription error"),
        description: e?.message || tr("Spróbuj innego formatu (mp4/m4a/mp3/wav).", "Try another format (mp4/m4a/mp3/wav)."),
        variant: "destructive",
      });
      setStatus(tr("Błąd: ", "Error: ") + (e?.message || tr("nieznany", "unknown")));
    } finally {
      setBusy(false);
    }
  };

  const copyText = async () => {
    await navigator.clipboard.writeText(text);
    toast({ title: tr("Skopiowano do schowka", "Copied to clipboard") });
  };

  return (
    <Card className="bg-[#120a1f]/70 border-fuchsia-500/20 p-4 sm:p-6 backdrop-blur overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <FileAudio className="w-5 h-5 text-fuchsia-400" />
        <h2 className="text-lg font-semibold text-white">{tr("Sekcja 1 · Wideo/Audio → Tekst", "Section 1 · Video/Audio → Text")}</h2>
      </div>
      <p className="text-xs text-fuchsia-200/60 mb-4">
        {tr(
          "Obsługa dużych plików (do ~500 MB). Telefon wyciąga sam dźwięk, konwertuje do 16 kHz mono i dzieli na 10-minutowe fragmenty — każdy wysyłany osobno do transkrypcji w chmurze, a wyniki sklejane.",
          "Supports large files (up to ~500 MB). The browser extracts audio, converts it to 16 kHz mono, splits it into 10-minute chunks, sends each chunk for cloud transcription, and merges the results."
        )}
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
          {file ? file.name : tr("Upuść lub kliknij — mp4 / mov / mp3 / wav", "Drop or click — mp4 / mov / mp3 / wav")}
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
        {busy ? tr("Pracuję…", "Working…") : tr("Transkrybuj", "Transcribe")}
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
        placeholder={tr("Transkrypcja pojawi się tutaj…", "The transcription will appear here…")}
        className="mt-4 min-h-[200px] bg-black/40 border-fuchsia-500/20 text-white placeholder:text-fuchsia-200/30"
      />

      <Button
        onClick={copyText}
        disabled={!text}
        variant="outline"
        className="mt-3 border-fuchsia-500/40 text-fuchsia-200 hover:bg-fuchsia-500/10 hover:text-white"
      >
        <Copy className="w-4 h-4" /> {tr("Kopiuj tekst do schowka", "Copy text to clipboard")}
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
  | ({ kind: "title"; text: string; sub?: string; imageIndex?: number } & VisualPlan)
  | ({ kind: "point"; text: string; accent?: string; imageIndex?: number; source?: string } & VisualPlan)
  | ({ kind: "quote"; text: string; imageIndex?: number; source?: string } & VisualPlan)
  | ({ kind: "stat"; value: string; label: string; imageIndex?: number; source?: string } & VisualPlan)
  | ({ kind: "formula"; formula: string; explanation?: string; imageIndex?: number; source?: string } & VisualPlan)
  | ({ kind: "calculation"; title: string; lines: string[]; result?: string; imageIndex?: number; source?: string } & VisualPlan)
  | ({ kind: "sketch"; title: string; caption?: string; imageIndex?: number; source?: string } & VisualPlan)
  | ({ kind: "evidence"; text: string; imageIndex?: number; source?: string } & VisualPlan)
  | ({ kind: "outro"; text: string; imageIndex?: number } & VisualPlan);

type VisualMode = "source" | "hybrid" | "thematic";
type VisualCue =
  | "forest_trees"
  | "engineering_blueprint"
  | "dna_biology"
  | "cosmic_physics"
  | "water_waves"
  | "fire_energy"
  | "abstract_technical";

type VisualPlan = {
  visualMode?: VisualMode;
  visualCue?: VisualCue | string;
};

type Script = {
  title?: string;
  subtitle?: string;
  slides: Slide[];
};

function VideoGenSection() {
  const { toast } = useToast();
  const { language } = useLanguage();
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
  const tr = (pl: string, en: string) => (language === "pl" ? pl : en);

  // ---------- VOICE COMMAND ----------
  const toggleMic = () => {
    const SR: any =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast({
        title: tr("Brak Web Speech API", "Web Speech API unavailable"),
        description: tr("Użyj Chrome/Edge dla komend głosowych.", "Use Chrome/Edge for voice commands."),
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
    r.lang = language === "pl" ? "pl-PL" : "en-US";
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
    if (/(5|pięć|five).*min/.test(cmd)) setDuration(300);
    else if (/(2|dwa|dwie|two).*min/.test(cmd)) setDuration(120);
    else if (/(1|jedn|minut|one).*min?/.test(cmd)) setDuration(60);
    if (/(film|video|zrób|stwórz|wygeneruj|montaż|create|generate|render)/.test(cmd)) renderVideo();
    else if (/(przeczytaj|lektor|powiedz|read|narrate|speak)/.test(cmd)) speak(narration || extractedText);
  };

  const speak = (txt: string) => {
    if (!txt.trim()) {
      toast({ title: tr("Brak tekstu", "No text"), variant: "destructive" });
      return;
    }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(txt);
    u.lang = language === "pl" ? "pl-PL" : "en-US";
    u.rate = 0.95;
    const voicePrefix = language === "pl" ? "pl" : "en";
    const voice = speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith(voicePrefix));
    if (voice) u.voice = voice;
    speechSynthesis.speak(u);
  };

  // ---------- AI VISION: OCR + SCRIPT ----------
  const fileToBase64 = (f: File): Promise<string> =>
    new Promise((res, rej) => {
      const img = new Image();
      const url = URL.createObjectURL(f);
      img.onload = () => {
        try {
          const maxSide = 1500;
          const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(img.width * scale));
          canvas.height = Math.max(1, Math.round(img.height * scale));
          const c = canvas.getContext("2d")!;
          c.fillStyle = "#ffffff";
          c.fillRect(0, 0, canvas.width, canvas.height);
          c.drawImage(img, 0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(url);
          res(canvas.toDataURL("image/jpeg", 0.86));
        } catch (e) {
          URL.revokeObjectURL(url);
          rej(e);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
          rej(new Error(tr("Nie udało się wczytać obrazu", "Could not load image")));
      };
      img.src = url;
    });

  const runOCR = async () => {
    if (images.length === 0) {
      toast({ title: tr("Najpierw dodaj zrzuty ekranu", "Add screenshots first"), variant: "destructive" });
      return;
    }
    setOcrBusy(true);
    setOcrStatus(tr("Przygotowuję zrzuty do dokładnej analizy…", "Preparing screenshots for detailed analysis…"));
    try {
      const b64s = await Promise.all(images.map(fileToBase64));
      setOcrStatus(tr("AI czyta wzory, obliczenia, szkice i buduje film źródłowy…", "AI is reading formulas, calculations, sketches, and building the source-based film…"));
      const { data, error } = await supabase.functions.invoke("video-script-from-images", {
        body: { images: b64s, duration, instruction: command.trim(), lang: language },
      });
      if (error) throw new Error(error.message);
      if ((data as any)?.error) throw new Error((data as any).error);

      const raw = (data as any).rawText || "";
      const narr = (data as any).narration || raw;
      const sc = (data as any).script as Script | undefined;

      setExtractedText(raw);
      setNarration(narr);
      const normalized = normalizeScript(sc);
      if (normalized) setScript(normalized);
      if ((data as any)?.warning) {
        toast({ title: tr("Tryb awaryjny", "Fallback mode"), description: String((data as any).warning) });
      }

      toast({
        title: tr("Tekst i scenariusz gotowe", "Text and script ready"),
        description: language === "pl" ? `${raw.length} znaków · ${sc?.slides?.length ?? 0} ujęć` : `${raw.length} characters · ${sc?.slides?.length ?? 0} shots`,
      });
    } catch (e: any) {
      console.error(e);
      const fallbackSource = command.trim() || images.map((f, i) => `${tr("Ekran", "Screen")} ${i + 1}: ${f.name}`).join(". ");
      const fallback = buildFallbackScript(fallbackSource || tr("Analiza materiału ze zrzutów ekranu", "Screenshot material analysis"));
      setExtractedText(
        `${tr("Tryb awaryjny lokalny: funkcja AI nie odpowiedziała poprawnie.", "Local fallback mode: AI function did not respond correctly.")}\n\n${fallbackSource || tr("Brak opisu — film zostanie zbudowany na podstawie miniatur i tematycznych plansz.", "No description — the film will be built from thumbnails and thematic boards.")}`,
      );
      setNarration(fallbackSource || tr("Film pokazuje materiał źródłowy i tematyczne plansze, bez dopowiadania niepotwierdzonych faktów.", "The film shows source material and thematic boards without adding unverified facts."));
      setScript(fallback);
      toast({
        title: tr("AI nie odpowiedziało — włączono tryb awaryjny", "AI did not respond — fallback mode enabled"),
        description: tr("Możesz od razu wygenerować film z tematycznymi planszami i miniaturami źródeł.", "You can generate a film immediately using thematic boards and source thumbnails."),
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
    const formulaLike = clean.match(/[^.!?\n]*(?:=|≈|≤|≥|√|∑|∆|Δ|Ω|µ|φ|π|\bHz\b|\bmm\b|\bcm\b|\bkg\b|\bN\b|\bV\b|\bA\b|\bm\/s\b)[^.!?\n]*/g) || [];
    const baseCue = inferVisualCue(clean);
    const slides: Slide[] = [{ kind: "title", text: tr("Analiza materiału", "Material analysis"), sub: tr("źródła · temat · wizualizacja", "sources · topic · visualization"), imageIndex: 1, visualMode: "thematic", visualCue: baseCue }];
    formulaLike.slice(0, 12).forEach((f, i) => {
      slides.push({ kind: "formula", formula: f.trim().slice(0, 180), explanation: tr("Fragment wzoru lub obliczenia z materiału źródłowego.", "Formula or calculation fragment from the source material."), imageIndex: i + 1, source: `${tr("Ekran", "Screen")} ${i + 1}`, visualMode: "hybrid", visualCue: "engineering_blueprint" });
    });
    for (const [i, s] of sentences.entries()) {
      if (slides.length > 34) break;
      slides.push({ kind: "point", text: s.slice(0, 140), imageIndex: (i % Math.max(1, images.length)) + 1, source: `${tr("Ekran", "Screen")} ${(i % Math.max(1, images.length)) + 1}`, visualMode: "hybrid", visualCue: inferVisualCue(s) });
    }
    slides.push({ kind: "outro", text: tr("Koniec analizy źródłowej", "End of source analysis"), imageIndex: 1, visualMode: "thematic", visualCue: baseCue });
    return { title: tr("Analiza materiału", "Material analysis"), slides };
  };

  const inferVisualCue = (text: string): VisualCue => {
    const t = text.toLowerCase();
    if (/(drzew|las|liść|liście|gałą|korze|korzeń|roślin|natura|forest|tree)/.test(t)) return "forest_trees";
    if (/(wz[oó]r|równ|oblicz|sił|moment|napręż|prąd|napię|hz|mm|cm|kg|newton|schemat|inżyn|engineer)/.test(t)) return "engineering_blueprint";
    if (/(dna|gen|chromosom|mitochond|komór|biolog)/.test(t)) return "dna_biology";
    if (/(gwiazd|kosmos|planeta|orbita|światło|foton|kwant)/.test(t)) return "cosmic_physics";
    if (/(woda|rzeka|morze|ocean|fala)/.test(t)) return "water_waves";
    if (/(ogień|płomień|temperatur|ciepł)/.test(t)) return "fire_energy";
    return "abstract_technical";
  };

  const normalizeVisualMode = (mode: unknown, kind: Slide["kind"]): VisualMode => {
    if (mode === "source" || mode === "hybrid" || mode === "thematic") return mode;
    if (kind === "formula" || kind === "calculation" || kind === "sketch") return "hybrid";
    if (kind === "evidence") return "source";
    return "thematic";
  };

  const normalizeVisualCue = (cue: unknown, text: string): VisualCue => {
    const value = String(cue || "") as VisualCue;
    const allowed: VisualCue[] = ["forest_trees", "engineering_blueprint", "dna_biology", "cosmic_physics", "water_waves", "fire_energy", "abstract_technical"];
    return allowed.includes(value) ? value : inferVisualCue(text);
  };

  const normalizeScript = (candidate: unknown): Script | null => {
    const input = candidate as Partial<Script> | undefined;
    if (!input || !Array.isArray(input.slides)) return null;
    const slides = input.slides
      .map((slide: any, i): Slide | null => {
        const imageIndex = Number.isFinite(Number(slide?.imageIndex))
          ? Number(slide.imageIndex)
          : images.length
            ? (i % images.length) + 1
            : undefined;
        const source = typeof slide?.source === "string" ? slide.source : imageIndex ? `${tr("Ekran", "Screen")} ${imageIndex}` : undefined;
        const visualText = String(slide?.text || slide?.title || slide?.formula || slide?.caption || slide?.label || input.title || "");
        const visualMode = normalizeVisualMode(slide?.visualMode, slide?.kind || "point");
        const visualCue = normalizeVisualCue(slide?.visualCue, visualText);
        const visual = { visualMode, visualCue };
        switch (slide?.kind) {
          case "title":
            return { kind: "title", text: String(slide.text || input.title || tr("Analiza materiału", "Material analysis")), sub: slide.sub ? String(slide.sub) : input.subtitle, imageIndex, ...visual };
          case "formula":
            return { kind: "formula", formula: String(slide.formula || slide.text || tr("[wzór nieczytelny]", "[formula unreadable]")), explanation: slide.explanation ? String(slide.explanation) : undefined, imageIndex, source, ...visual };
          case "calculation":
            return { kind: "calculation", title: String(slide.title || tr("Obliczenie", "Calculation")), lines: Array.isArray(slide.lines) ? slide.lines.map(String) : [String(slide.text || slide.result || tr("[krok nieczytelny]", "[step unreadable]"))], result: slide.result ? String(slide.result) : undefined, imageIndex, source, ...visual };
          case "sketch":
            return { kind: "sketch", title: String(slide.title || tr("Szkic / schemat", "Sketch / diagram")), caption: slide.caption ? String(slide.caption) : undefined, imageIndex, source, ...visual };
          case "stat":
            return { kind: "stat", value: String(slide.value || slide.text || tr("[wartość]", "[value]")), label: String(slide.label || tr("Wartość z materiału źródłowego", "Value from source material")), imageIndex, source, ...visual };
          case "evidence":
            return { kind: "evidence", text: String(slide.text || tr("[fragment nieczytelny]", "[fragment unreadable]")), imageIndex, source, ...visual };
          case "quote":
            return { kind: "quote", text: String(slide.text || tr("[fragment źródłowy]", "[source fragment]")), imageIndex, source, ...visual };
          case "outro":
            return { kind: "outro", text: String(slide.text || tr("Koniec analizy źródłowej", "End of source analysis")), imageIndex, ...visual };
          case "point":
          default:
            return { kind: "point", text: String(slide?.text || slide?.title || tr("Fragment materiału źródłowego", "Source material fragment")), accent: slide?.accent ? String(slide.accent) : undefined, imageIndex, source, ...visual };
        }
      })
      .filter((slide): slide is Slide => Boolean(slide));
    if (!slides.length) return null;
    return { title: input.title, subtitle: input.subtitle, slides };
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
      toast({ title: tr("Brak tekstu", "No text"), description: tr("Najpierw zrób OCR lub wpisz tekst.", "Run OCR first or enter text."), variant: "destructive" });
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

      const sc: Script = normalizeScript(script) ?? buildFallbackScript(source);
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
          title: [190, 170, 45],
          point: [185, 205, 45],
          quote: [190, 160, 45],
          stat: [45, 185, 205],
          formula: [185, 45, 205],
          calculation: [45, 190, 170],
          sketch: [190, 205, 45],
          evidence: [170, 190, 45],
          outro: [180, 160, 45],
        };
        const [h1, h2, h3] = palettes[kind];
        const wob = Math.sin(t * 0.4 + slideIdx) * 8;
        const g = ctx.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, `hsl(${h1 + wob}, 42%, 8%)`);
        g.addColorStop(0.5, `hsl(${h2}, 32%, 5%)`);
        g.addColorStop(1, `hsl(${h3 - wob}, 48%, 9%)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 0.12;
        ctx.strokeStyle = `hsl(${h1}, 80%, 62%)`;
        ctx.lineWidth = 1;
        for (let x = 0; x < W; x += 80) {
          ctx.beginPath();
          ctx.moveTo(x + (slideIdx % 3) * 10, 0);
          ctx.lineTo(x - 180, H);
          ctx.stroke();
        }
        for (let y = 0; y < H; y += 80) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(W, y + Math.sin(t + y) * 20);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.78);
        vg.addColorStop(0, "transparent");
        vg.addColorStop(1, "rgba(0,0,0,0.6)");
        ctx.fillStyle = vg;
        ctx.fillRect(0, 0, W, H);
      };

      const drawImageContain = (img: HTMLImageElement, x: number, y: number, w: number, h: number) => {
        const scale = Math.min(w / img.width, h / img.height);
        const iw = img.width * scale;
        const ih = img.height * scale;
        const ix = x + (w - iw) / 2;
        const iy = y + (h - ih) / 2;
        ctx.drawImage(img, ix, iy, iw, ih);
      };

      const drawImageCover = (img: HTMLImageElement, x: number, y: number, w: number, h: number) => {
        const scale = Math.max(w / img.width, h / img.height);
        const iw = img.width * scale;
        const ih = img.height * scale;
        const ix = x + (w - iw) / 2;
        const iy = y + (h - ih) / 2;
        ctx.drawImage(img, ix, iy, iw, ih);
      };

      const drawThematicVisual = (cue: string | undefined, t: number, slideIdx: number, alpha: number) => {
        const visual = cue || "abstract_technical";
        ctx.save();
        ctx.globalAlpha = 0.95 * alpha;

        if (visual === "forest_trees") {
          const sky = ctx.createLinearGradient(0, 0, 0, H);
          sky.addColorStop(0, "#04130c");
          sky.addColorStop(0.52, "#082315");
          sky.addColorStop(1, "#020806");
          ctx.fillStyle = sky;
          ctx.fillRect(0, 0, W, H);
          for (let i = 0; i < 34; i++) {
            const x = ((i * 173 + slideIdx * 41) % (W + 260)) - 130;
            const base = H - ((i % 5) * 18);
            const trunkH = 390 + (i % 7) * 55;
            const sway = Math.sin(t * 0.7 + i) * 12;
            ctx.globalAlpha = (0.22 + (i % 6) * 0.045) * alpha;
            ctx.strokeStyle = i % 3 === 0 ? "#8b5a2b" : "#14532d";
            ctx.lineWidth = 16 + (i % 4) * 5;
            ctx.beginPath();
            ctx.moveTo(x, base);
            ctx.bezierCurveTo(x + sway, base - trunkH * 0.35, x - sway, base - trunkH * 0.7, x + sway * 0.4, base - trunkH);
            ctx.stroke();
            const crownY = base - trunkH - 30;
            const crownR = 82 + (i % 5) * 24;
            const leaf = ctx.createRadialGradient(x, crownY, 8, x, crownY, crownR);
            leaf.addColorStop(0, "rgba(74,222,128,0.75)");
            leaf.addColorStop(1, "rgba(20,83,45,0.08)");
            ctx.fillStyle = leaf;
            ctx.beginPath();
            ctx.arc(x + sway, crownY, crownR, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 0.18 * alpha;
          ctx.fillStyle = "#bbf7d0";
          for (let i = 0; i < 90; i++) {
            const x = (i * 71 + t * 25) % W;
            const y = 90 + ((i * 47 + slideIdx * 33) % 760);
            ctx.beginPath();
            ctx.ellipse(x, y, 13, 5, Math.sin(i), 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (visual === "engineering_blueprint") {
          ctx.fillStyle = "#04111f";
          ctx.fillRect(0, 0, W, H);
          ctx.globalAlpha = 0.24 * alpha;
          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = 1;
          for (let x = 0; x < W; x += 48) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
          }
          for (let y = 0; y < H; y += 48) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
          }
          ctx.globalAlpha = 0.62 * alpha;
          ctx.strokeStyle = "#67e8f9";
          ctx.lineWidth = 6;
          const cx = 700 + Math.sin(t * 0.4) * 30;
          const cy = 520;
          ctx.strokeRect(cx - 280, cy - 170, 560, 340);
          ctx.beginPath();
          ctx.arc(cx, cy, 150, 0, Math.PI * 2);
          ctx.moveTo(cx - 420, cy); ctx.lineTo(cx + 420, cy);
          ctx.moveTo(cx, cy - 260); ctx.lineTo(cx, cy + 260);
          ctx.stroke();
          ctx.font = "700 54px 'Inter', sans-serif";
          ctx.fillStyle = "#e0f2fe";
          ctx.fillText("Σ F = m · a", 240, 250);
          ctx.fillText("Δx / Δt", 1160, 820);
        } else if (visual === "dna_biology") {
          ctx.fillStyle = "#061014";
          ctx.fillRect(0, 0, W, H);
          for (let i = 0; i < 52; i++) {
            const y = i * 28 - 80;
            const phase = t * 1.2 + i * 0.35;
            const x1 = W * 0.5 + Math.sin(phase) * 240;
            const x2 = W * 0.5 + Math.sin(phase + Math.PI) * 240;
            ctx.globalAlpha = 0.58 * alpha;
            ctx.strokeStyle = i % 2 ? "#22d3ee" : "#facc15";
            ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y + 18); ctx.stroke();
            ctx.fillStyle = "#cffafe";
            ctx.beginPath(); ctx.arc(x1, y, 9, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(x2, y + 18, 9, 0, Math.PI * 2); ctx.fill();
          }
        } else if (visual === "cosmic_physics") {
          ctx.fillStyle = "#030712";
          ctx.fillRect(0, 0, W, H);
          ctx.globalAlpha = 0.85 * alpha;
          for (let i = 0; i < 150; i++) {
            ctx.fillStyle = i % 9 === 0 ? "#fde68a" : "#cffafe";
            ctx.fillRect((i * 127 + slideIdx * 19) % W, (i * 83) % H, i % 3 + 1, i % 3 + 1);
          }
          ctx.strokeStyle = "#22d3ee";
          ctx.lineWidth = 3;
          for (let r = 120; r <= 420; r += 90) {
            ctx.globalAlpha = (0.45 - r / 1400) * alpha;
            ctx.beginPath(); ctx.ellipse(W / 2, H / 2, r * 1.8, r, t * 0.15, 0, Math.PI * 2); ctx.stroke();
          }
        } else if (visual === "water_waves") {
          const g = ctx.createLinearGradient(0, 0, 0, H);
          g.addColorStop(0, "#042f2e");
          g.addColorStop(1, "#020617");
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, W, H);
          ctx.strokeStyle = "#67e8f9";
          for (let y = 160; y < H; y += 58) {
            ctx.globalAlpha = 0.25 * alpha;
            ctx.lineWidth = 4;
            ctx.beginPath();
            for (let x = 0; x <= W; x += 24) {
              const yy = y + Math.sin(x * 0.011 + t * 1.6 + y) * 22;
              x === 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
            }
            ctx.stroke();
          }
        } else if (visual === "fire_energy") {
          ctx.fillStyle = "#120807";
          ctx.fillRect(0, 0, W, H);
          for (let i = 0; i < 26; i++) {
            const x = 160 + i * 70;
            const h = 280 + Math.sin(t * 2 + i) * 90;
            const flame = ctx.createRadialGradient(x, H - 210, 10, x, H - 260, h);
            flame.addColorStop(0, "rgba(250,204,21,0.8)");
            flame.addColorStop(0.45, "rgba(249,115,22,0.36)");
            flame.addColorStop(1, "rgba(127,29,29,0)");
            ctx.globalAlpha = 0.7 * alpha;
            ctx.fillStyle = flame;
            ctx.beginPath();
            ctx.ellipse(x, H - 230, 52, h, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          ctx.globalAlpha = 0.42 * alpha;
          ctx.strokeStyle = "#00CED1";
          ctx.lineWidth = 5;
          for (let i = 0; i < 14; i++) {
            ctx.beginPath();
            const r = 90 + i * 42 + Math.sin(t + i) * 10;
            ctx.arc(W / 2, H / 2, r, 0, Math.PI * 2);
            ctx.stroke();
          }
        }

        ctx.globalAlpha = 0.62 * alpha;
        const shade = ctx.createLinearGradient(0, 0, W, H);
        shade.addColorStop(0, "rgba(0,0,0,0.12)");
        shade.addColorStop(0.55, "rgba(0,0,0,0.34)");
        shade.addColorStop(1, "rgba(0,0,0,0.72)");
        ctx.fillStyle = shade;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      };

      const slideImage = (slide: Slide, fallbackIdx: number) => {
        if (!refImgs.length) return null;
        const wanted = typeof slide.imageIndex === "number" ? slide.imageIndex - 1 : fallbackIdx;
        const idx = Math.max(0, Math.min(refImgs.length - 1, wanted));
        return refImgs[idx];
      };

      const drawSourceFrame = (slide: Slide, slideIdx: number, alpha: number, mode: "side" | "full" | "mini" = "side") => {
        const img = slideImage(slide, slideIdx % Math.max(1, refImgs.length));
        if (!img) return;

        ctx.save();
        if (mode === "full") {
          ctx.globalAlpha = 0.98 * alpha;
          drawImageCover(img, 0, 0, W, H);
          ctx.globalAlpha = 0.44 * alpha;
          ctx.fillStyle = "#030712";
          ctx.fillRect(0, 0, W, H);
          ctx.restore();
          return;
        }

        if (mode === "mini") {
          const x = 80;
          const y = 700;
          const w = 455;
          const h = 300;
          ctx.globalAlpha = 0.9 * alpha;
          ctx.fillStyle = "rgba(2,6,23,0.76)";
          ctx.fillRect(x - 14, y - 14, w + 28, h + 28);
          ctx.strokeStyle = "rgba(0,206,209,0.45)";
          ctx.lineWidth = 2;
          ctx.strokeRect(x - 14, y - 14, w + 28, h + 28);
          drawImageContain(img, x, y, w, h);
          ctx.globalAlpha = 1;
          ctx.restore();
          return;
        }

        const x = 70;
        const y = 135;
        const w = 1080;
        const h = 810;
        ctx.globalAlpha = 0.98 * alpha;
        ctx.fillStyle = "rgba(2,6,23,0.72)";
        ctx.fillRect(x - 18, y - 18, w + 36, h + 36);
        ctx.strokeStyle = "rgba(0,206,209,0.45)";
        ctx.lineWidth = 3;
        ctx.strokeRect(x - 18, y - 18, w + 36, h + 36);
        drawImageContain(img, x, y, w, h);
        ctx.globalAlpha = 1;
        ctx.restore();
      };

      const drawPanel = (alpha: number, x = 1210, y = 135, w = 640, h = 810) => {
        ctx.globalAlpha = 0.86 * alpha;
        ctx.fillStyle = "rgba(2,6,23,0.82)";
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = "rgba(255,215,0,0.36)";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);
        ctx.globalAlpha = 1;
      };

      const drawChrome = (slideIdx: number, alpha: number) => {
        ctx.globalAlpha = 0.5 * alpha;
        ctx.fillStyle = "#67e8f9";
        ctx.font = "500 24px 'Inter', sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(
          `${String(slideIdx + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`,
          80, 80,
        );
        ctx.globalAlpha = 0.35 * alpha;
        ctx.font = "400 20px 'Inter', sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(tr("ANALIZA ŹRÓDŁOWA", "SOURCE ANALYSIS"), W - 80, H - 60);
        ctx.textAlign = "left";
        ctx.globalAlpha = 1;
      };

      const drawAccentLine = (y: number, fadeIn: number, alpha: number) => {
        const lineW = 120 + 260 * fadeIn;
        const grad = ctx.createLinearGradient(80, 0, 80 + lineW, 0);
        grad.addColorStop(0, "#00CED1");
        grad.addColorStop(1, "#FFD700");
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
        ctx.shadowColor = "rgba(0,206,209,0.35)";
        ctx.shadowBlur = 30;
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

      const drawBlockText = (text: string, x: number, y: number, maxWidth: number, size: number, weight: number, alpha: number, color = "#ffffff", maxLines = 10) => {
        ctx.fillStyle = color;
        ctx.font = `${weight} ${size}px 'Inter', 'Helvetica Neue', sans-serif`;
        ctx.textAlign = "left";
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 20;
        const lines = wrapText(ctx, text, maxWidth).slice(0, maxLines);
        const lh = size * 1.28;
        ctx.globalAlpha = alpha;
        lines.forEach((line, i) => ctx.fillText(line, x, y + i * lh));
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      };

      const drawSourceLabel = (source: string | undefined, x: number, y: number, alpha: number) => {
        if (!source) return;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = "rgba(0,206,209,0.18)";
        ctx.fillRect(x, y - 34, 210, 44);
        ctx.strokeStyle = "rgba(0,206,209,0.55)";
        ctx.strokeRect(x, y - 34, 210, 44);
        ctx.fillStyle = "#67e8f9";
        ctx.font = "600 22px 'Inter', sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(source, x + 16, y - 5);
        ctx.globalAlpha = 1;
      };

      const drawSlide = (slide: Slide, localT: number, slideIdx: number, globalT: number) => {
        drawBg(globalT, slideIdx, slide.kind);

        const fadeIn = Math.min(1, localT / 0.18);
        const fadeOut = Math.min(1, (1 - localT) / 0.18);
        const alpha = Math.min(fadeIn, fadeOut);
        const offY = (1 - fadeIn) * 30;

        const visualMode = slide.visualMode ?? (slide.kind === "evidence" ? "source" : "hybrid");
        const fullSource = visualMode === "source" && (slide.kind === "title" || slide.kind === "outro");
        if (visualMode === "source" && refImgs.length) {
          drawSourceFrame(slide, slideIdx, alpha, fullSource ? "full" : "side");
        } else {
          drawThematicVisual(slide.visualCue, globalT, slideIdx, alpha);
          if (visualMode === "hybrid" && refImgs.length) drawSourceFrame(slide, slideIdx, alpha, "mini");
        }
        drawChrome(slideIdx, alpha);

        switch (slide.kind) {
          case "title": {
            ctx.globalAlpha = 0.62 * alpha;
            ctx.fillStyle = "rgba(2,6,23,0.72)";
            ctx.fillRect(120, 300, W - 240, 390);
            ctx.globalAlpha = 1;
            drawAccentLine(H / 2 - 120, fadeIn, alpha);
            drawCenteredText(slide.text, 112, 800, H / 2 - 10, alpha, "#ffffff", offY);
            if (slide.sub) {
              drawCenteredText(slide.sub, 36, 500, H / 2 + 135, alpha, "#67e8f9", offY);
            }
            break;
          }
          case "point": {
            drawPanel(alpha);
            drawSourceLabel(slide.source, 1238, 190, alpha);
            drawAccentLine(260, fadeIn, alpha);
            const t = slide.text;
            const size = t.length > 90 ? 46 : t.length > 50 ? 56 : 68;
            drawBlockText(t, 1250, 340 + offY, 555, size, 750, alpha, "#ffffff", 6);
            if (slide.accent) {
              drawBlockText(slide.accent.toUpperCase(), 1250, 785, 530, 34, 800, alpha, "#facc15", 2);
            }
            break;
          }
          case "quote": {
            drawPanel(alpha);
            drawSourceLabel(slide.source, 1238, 190, alpha);
            ctx.globalAlpha = 0.2 * alpha;
            ctx.fillStyle = "#00CED1";
            ctx.font = `900 220px 'Inter', sans-serif`;
            ctx.textAlign = "left";
            ctx.fillText("≡", 1250, 350);
            ctx.globalAlpha = 1;
            const t = slide.text;
            const size = t.length > 90 ? 38 : 48;
            drawBlockText(t, 1250, 430 + offY, 540, size, 520, alpha, "#ffffff", 8);
            break;
          }
          case "stat": {
            drawPanel(alpha);
            drawSourceLabel(slide.source, 1238, 190, alpha);
            drawBlockText(slide.value, 1250, 350 + offY, 555, 110, 900, alpha, "#ffffff", 3);
            drawAccentLine(585, fadeIn, alpha);
            drawBlockText(slide.label, 1250, 650 + offY, 540, 38, 500, alpha, "#67e8f9", 4);
            break;
          }
          case "formula": {
            drawPanel(alpha);
            drawSourceLabel(slide.source, 1238, 190, alpha);
            drawBlockText(tr("WZÓR", "FORMULA"), 1250, 270, 540, 28, 800, alpha, "#67e8f9", 1);
            drawBlockText(slide.formula, 1250, 365 + offY, 540, slide.formula.length > 90 ? 42 : 54, 760, alpha, "#ffffff", 6);
            if (slide.explanation) {
              drawAccentLine(690, fadeIn, alpha);
              drawBlockText(slide.explanation, 1250, 760 + offY, 540, 32, 450, alpha, "#d1d5db", 4);
            }
            break;
          }
          case "calculation": {
            drawPanel(alpha);
            drawSourceLabel(slide.source, 1238, 190, alpha);
            drawBlockText(slide.title, 1250, 275 + offY, 540, 44, 760, alpha, "#ffffff", 2);
            const lines = Array.isArray(slide.lines) ? slide.lines.slice(0, 7) : [];
            ctx.font = "520 31px 'Inter', sans-serif";
            ctx.textAlign = "left";
            lines.forEach((line, i) => {
              const y = 400 + i * 58 + offY;
              ctx.globalAlpha = 0.13 * alpha;
              ctx.fillStyle = "#00CED1";
              ctx.fillRect(1250, y - 36, 540, 48);
              ctx.globalAlpha = alpha;
              ctx.fillStyle = "#e5e7eb";
              ctx.fillText(line.slice(0, 46), 1270, y);
            });
            ctx.globalAlpha = 1;
            if (slide.result) drawBlockText(slide.result, 1250, 835, 540, 40, 850, alpha, "#facc15", 2);
            break;
          }
          case "sketch": {
            drawPanel(alpha, 1200, 705, 650, 235);
            drawSourceLabel(slide.source, 1238, 190, alpha);
            drawBlockText(slide.title, 1235, 770 + offY, 580, 40, 800, alpha, "#ffffff", 2);
            if (slide.caption) drawBlockText(slide.caption, 1235, 870 + offY, 575, 28, 450, alpha, "#d1d5db", 2);
            break;
          }
          case "evidence": {
            drawPanel(alpha);
            drawSourceLabel(slide.source, 1238, 190, alpha);
            drawBlockText(tr("FRAGMENT ŹRÓDŁOWY", "SOURCE FRAGMENT"), 1250, 275, 540, 26, 800, alpha, "#67e8f9", 1);
            drawBlockText(slide.text, 1250, 355 + offY, 540, 38, 520, alpha, "#ffffff", 10);
            break;
          }
          case "outro": {
            const pulse = 1 + 0.04 * Math.sin(globalT * 2);
            ctx.save();
            ctx.translate(W / 2, H / 2);
            ctx.scale(pulse, pulse);
            ctx.translate(-W / 2, -H / 2);
            ctx.globalAlpha = 0.62 * alpha;
            ctx.fillStyle = "rgba(2,6,23,0.75)";
            ctx.fillRect(180, 360, W - 360, 280);
            ctx.globalAlpha = 1;
            drawCenteredText(slide.text, 86, 700, H / 2, alpha, "#ffffff", offY);
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
      toast({ title: tr("Film gotowy", "Film ready"), description: language === "pl" ? `${slides.length} ujęć · ${totalSec}s` : `${slides.length} shots · ${totalSec}s` });
    } catch (e: any) {
      console.error(e);
      toast({ title: tr("Błąd renderowania", "Rendering error"), description: e?.message, variant: "destructive" });
    } finally {
      setRendering(false);
    }
  };


  return (
    <Card className="bg-[#120a1f]/70 border-fuchsia-500/20 p-4 sm:p-6 backdrop-blur overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <Film className="w-5 h-5 text-fuchsia-400" />
        <h2 className="text-lg font-semibold text-white">{tr("Sekcja 2 · Zrzuty → film techniczny", "Section 2 · Screenshots → Technical film")}</h2>
      </div>
      <p className="text-xs text-fuchsia-200/60 mb-4">
        {tr(
          "Wrzuć zrzuty — AI ma zachować fakty, wzory, liczby, obliczenia i szkice, a film pokazuje obrazy źródłowe zamiast samego czarnego tła z tekstem.",
          "Upload screenshots — AI preserves facts, formulas, numbers, calculations, and sketches, while the film shows source visuals instead of only text on a dark background."
        )}
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
          {images.length > 0
            ? language === "pl" ? `Wybrano ${images.length} obrazów` : `Selected ${images.length} images`
            : tr("Upuść lub kliknij — do 40 zrzutów / szkiców / wzorów", "Drop or click — up to 40 screenshots / sketches / formulas")}
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
        {ocrBusy ? tr("Analizuję materiał…", "Analyzing material…") : tr("Odczytaj zrzuty i zbuduj scenariusz techniczny", "Read screenshots and build a technical script")}
      </Button>

      {ocrBusy && (
        <div className="mt-3">
          <Progress value={undefined} className="h-2 bg-fuchsia-950 animate-pulse" />
          <p className="text-xs text-fuchsia-200/60 mt-1">{ocrStatus}</p>
        </div>
      )}

      <div className="mt-4">
        <label className="text-xs text-fuchsia-200/60 mb-1 block">
          {tr("Lektor filmu (edytowalny — ma trzymać się faktów ze zrzutów)", "Film narration (editable — must stay tied to screenshot facts)")}
        </label>
        <Textarea
          value={narration}
          onChange={(e) => setNarration(e.target.value)}
          placeholder={tr("Tu pojawi się rzeczowy lektor na podstawie zrzutów…", "A factual narration based on the screenshots will appear here…")}
          className="bg-black/40 border-fuchsia-500/20 text-white placeholder:text-fuchsia-200/30 min-h-[120px]"
        />
      </div>

      <div className="mt-3">
        <label className="text-xs text-fuchsia-200/60 mb-1 block">
          {tr("Odczyt źródłowy OCR (do kontroli wzorów, liczb i polskich znaków)", "Source OCR reading (for checking formulas, numbers, and characters)")}
        </label>
        <Textarea
          value={extractedText}
          onChange={(e) => setExtractedText(e.target.value)}
          placeholder={tr("Tu pojawi się pełny odczyt ekran po ekranie…", "The full screen-by-screen reading will appear here…")}
          className="bg-black/40 border-cyan-400/20 text-white placeholder:text-cyan-100/30 min-h-[150px]"
        />
      </div>

      {/* duration selector */}
      <div className="mt-4">
        <label className="text-xs text-fuchsia-200/60 mb-2 block">{tr("Długość filmu", "Film length")}</label>
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
        {tr("Pokazuj oryginalne zrzuty jako główny materiał wizualny filmu", "Show original screenshots as the main visual material of the film")}
      </label>

      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <Input
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCommand(command)}
          placeholder={tr('Komenda: „Zrób film 2 min" / „Przeczytaj tekst"', 'Command: “Create a 2 min video” / “Read the text”')}
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
          {tr("Wskazówka: najpierw kliknij „Odczytaj tekst ze zrzutów (OCR)\", potem przycisk generowania filmu się odblokuje.", "Tip: first click “Read screenshots and build a technical script”; then the film generation button will unlock.")}
        </p>
      )}

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Button
          onClick={renderVideo}
          disabled={rendering || !(narration.trim() || extractedText.trim())}
          className="bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white border-0 whitespace-normal h-auto py-3"
        >
          {rendering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Film className="w-4 h-4" />}
          <span className="ml-2">{tr("Wygeneruj film", "Generate film")} ({duration === 60 ? "1 min" : duration === 120 ? "2 min" : "5 min"})</span>
        </Button>
        <Button
          onClick={() => speak(narration || extractedText)}
          variant="outline"
          className="border-fuchsia-500/40 text-fuchsia-200 hover:bg-fuchsia-500/10 hover:text-white whitespace-normal h-auto py-3"
        >
          <Volume2 className="w-4 h-4" /> <span className="ml-2">{tr("Przeczytaj tekst", "Read text")}</span>
        </Button>
      </div>

      {rendering && (
        <div className="mt-4">
          <Progress value={renderProgress} className="h-2 bg-fuchsia-950" />
          <p className="text-xs text-fuchsia-200/60 mt-2">{tr("Renderowanie", "Rendering")}: {renderProgress}% {tr("(potrwa tyle, ile długość filmu)", "(takes as long as the film length)")}</p>
        </div>
      )}

      {videoUrl && (
        <div className="mt-4 space-y-3">
          <video src={videoUrl} controls className="w-full rounded-lg border border-fuchsia-500/30" />
          <a href={videoUrl} download="moje-studio-wideo.webm">
            <Button className="w-full bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white border-0">
              <Download className="w-4 h-4" /> {tr("Pobierz film (.webm)", "Download film (.webm)")}
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
  const { language } = useLanguage();
  const [unlocked, setUnlocked] = useState(false);
  const tr = (pl: string, en: string) => (language === "pl" ? pl : en);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === "1") setUnlocked(true);
    document.title = language === "pl" ? "Studio · prywatne" : "Studio · private";
    const meta = document.querySelector('meta[name="robots"]');
    if (meta) meta.setAttribute("content", "noindex, nofollow");
    else {
      const m = document.createElement("meta");
      m.name = "robots";
      m.content = "noindex, nofollow";
      document.head.appendChild(m);
    }
  }, [language]);

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
              {tr("Moje Studio Wideo", "My Video Studio")}
            </h1>
            <p className="text-xs text-fuchsia-200/60 mt-1">
              {tr("Prywatne narzędzia — transkrypcja i generator filmów technicznych.", "Private tools — transcription and technical film generator.")}
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
            <Lock className="w-4 h-4" /> {tr("Wyloguj", "Log out")}
          </Button>
        </header>

        <div className="grid lg:grid-cols-2 gap-6">
          <TranscriptionSection />
          <VideoGenSection />
        </div>

        <footer className="mt-10 text-center text-xs text-fuchsia-200/40">
          {tr("Analiza wizualna · transkrypcja audio · render canvas + MediaRecorder", "Visual analysis · audio transcription · canvas render + MediaRecorder")}
        </footer>
      </div>
    </div>
  );
}
