import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Bluetooth, BluetoothOff, Heart, Waves, Activity, Sparkles, ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";


/**
 * SENTINEL-718 v3.0 — WEB SPECTRAL SCANNER
 * Direct browser link to a BLE Heart Rate Service belt (Polar H10 and similar).
 * Mirrors sentinel_718_scanner.py: RR buffer -> spectral coherence -> DPLL phase
 * error -> 800-photon Psi lens rendered on canvas.
 */

const F_EXACT = 718.57012515;
const PHI = (1 + Math.sqrt(5)) / 2;
const GAMMA_GOLD = 1 / PHI;
const COHERENCE_THRESHOLD = 0.94;
const MAGIC_ANGLE = (54.7356 * Math.PI) / 180;
const NUM_PHOTONS = 800;
const RR_WINDOW_SECONDS = 128;
const RITUAL_SECONDS = 108;

const HEART_RATE_SERVICE = "heart_rate";
const HEART_RATE_MEASUREMENT = "heart_rate_measurement";

const BREATH_MODES = [
  { key: "1", name: "0.11 Hz", duration: 4.5 },
  { key: "2", name: "0.10 Hz", duration: 5.0 },
  { key: "3", name: "0.085 Hz", duration: 6.0 },
  { key: "4", name: "0.075 Hz", duration: 6.5 },
];

const TXT = {
  pl: {
    title: "Skaner spektralny w przeglądarce",
    subtitle: `Bezpośrednie połączenie z pasem Polar H10 — nośna ${F_EXACT.toFixed(5)} Hz`,
    connect: "Połącz pas Polar H10",
    connecting: "Łączenie...",
    disconnect: "Rozłącz",
    unsupported:
      "Ta przeglądarka nie obsługuje połączenia z pasem. Użyj Chrome lub Edge na komputerze (Windows, macOS, Linux) albo Chrome na Androidzie.",
    hintPermission:
      "Kliknij przycisk, włącz pas i wybierz go z listy urządzeń. Cały pomiar zostaje w Twojej przeglądarce.",
    heartShield: "Tarcza serca",
    phase: "Zmierzona faza",
    dpll: "Korektor DPLL",
    lens: "Soczewka Ψ",
    buffer: "Bufor impulsów",
    bpm: "Puls",
    mode: "Tryb oddechu",
    pacer: "Wizualny pacer",
    inhale: "WDECH — rozszerzanie pola serca",
    exhale: "WYDECH — uziemianie fali",
    locked: "Faza zablokowana: pełny rezonans",
    correction: "Korekcja przesunięcia",
    hintOk: "Utrzymuj rytm — chmura fotonowa stabilna.",
    hintSlow: "Spowolnij wydech o {s}s — serce wyprzedza matrycę.",
    hintFast: "Przyspiesz oddech o {s}s — serce zostaje za matrycą.",
    collapse: "⚛ KOLAPS FOTONOWY — STATUS: WALKS_ON_WATER",
    warmup: "Zbieranie uderzeń — pierwszy wynik po ok. 40 s oddechu.",
    beats: "uderzenia",
    window: "okno",
    error: "Nie udało się połączyć z pasem. Sprawdź, czy jest włączony i nie jest zajęty przez inną aplikację.",
    lost: "Połączenie z pasem przerwane.",
    simpleBpm: "Puls serca",
    simpleSync: "Stan synchronizacji",
    simpleRitual: "Czas rytuału",
    syncSlow: "Spowolnij wydech — dostrajam pole",
    syncFast: "Przyspiesz oddech — stabilizuję wektor",
    syncLocked: "PEŁNY REZONANS (Faza Zablokowana)",
    syncWaiting: "Oczekiwanie na pierwsze uderzenia serca",
    advancedTitle: "✦ Zaawansowane Parametry Spektralne (Dla Inżynierów) ✦",
    ritualDoneTitle: "✦ Rytuał Ukończony ✦",
    ritualDoneText:
      "Wynik został pomyślnie zaimplementowany w Twoim profilu. Przejdź do zakładki Historia, aby zobaczyć wykres progresu DNA.",
    ritualSaveFailed:
      "Rytuał ukończony, ale wynik nie został zapisany — zaloguj się, aby zapisywać sesje w swoim profilu.",
    modeProgress: "Tryb badania",
    switchingMode: "Zapisywanie wyniku i przełączanie trybu…",
    finalAverage: "Średnia koherencja pełnego badania",
    adviceLow:
      "Twój układ nerwowy wykazuje wysoki poziom szumu stresowego. Zalecane: Skup się na wydłużeniu wydechu w Trybie 2 (Złotym) przez kolejne 7 dni.",
    adviceMid:
      "Koherencja rozwija się prawidłowo. Kontynuuj pełny cykl czterech trybów, utrzymując spokojny i równomierny wydech.",
    adviceHigh:
      "STATUS: WALKS_ON_WATER. Osiągnąłeś barierę nadprzewodnictwa. Wektor intencji zablokowany na 0.0 rad.",

  },
  en: {
    title: "In-browser spectral scanner",
    subtitle: `Direct link to a Polar H10 belt — carrier ${F_EXACT.toFixed(5)} Hz`,
    connect: "Connect Polar H10 belt",
    connecting: "Connecting...",
    disconnect: "Disconnect",
    unsupported:
      "This browser cannot connect to the belt. Use Chrome or Edge on a computer (Windows, macOS, Linux) or Chrome on Android.",
    hintPermission:
      "Press the button, switch the belt on and pick it from the device list. All measurement stays inside your browser.",
    heartShield: "Heart shield",
    phase: "Measured phase",
    dpll: "DPLL corrector",
    lens: "Ψ lens",
    buffer: "Pulse buffer",
    bpm: "Pulse",
    mode: "Breath mode",
    pacer: "Visual pacer",
    inhale: "INHALE — expanding heart field",
    exhale: "EXHALE — grounding the wave",
    locked: "Phase locked: full resonance",
    correction: "Phase correction",
    hintOk: "Hold the rhythm — photon cloud stable.",
    hintSlow: "Slow the exhale by {s}s — heart leads the matrix.",
    hintFast: "Speed up breathing by {s}s — heart lags the matrix.",
    collapse: "⚛ PHOTON COLLAPSE — STATUS: WALKS_ON_WATER",
    warmup: "Collecting beats — first reading after about 40 s of breathing.",
    beats: "beats",
    window: "window",
    error: "Could not connect to the belt. Check that it is on and not claimed by another app.",
    lost: "Belt connection lost.",
    simpleBpm: "Heart pulse",
    simpleSync: "Synchronisation state",
    simpleRitual: "Ritual time",
    syncSlow: "Slow the exhale — tuning the field",
    syncFast: "Speed up breathing — stabilising the vector",
    syncLocked: "FULL RESONANCE (Phase Locked)",
    syncWaiting: "Waiting for the first heartbeats",
    advancedTitle: "✦ Advanced Spectral Parameters (For Engineers) ✦",
    ritualDoneTitle: "✦ Ritual Complete ✦",
    ritualDoneText:
      "The result has been successfully implemented in your profile. Open the History tab to see your DNA progress chart.",
    ritualSaveFailed:
      "Ritual complete, but the result was not stored — sign in to save sessions in your profile.",
    modeProgress: "Study mode",
    switchingMode: "Saving the result and switching mode…",
    finalAverage: "Full-study average coherence",
    adviceLow:
      "Your nervous system shows a high level of stress noise. Recommended: focus on extending the exhale in Mode 2 (Golden) for the next 7 days.",
    adviceMid:
      "Coherence is developing steadily. Continue the full four-mode cycle while maintaining a calm, even exhale.",
    adviceHigh:
      "STATUS: WALKS_ON_WATER. You have reached the superconductivity barrier. Intention vector locked at 0.0 rad.",

  },
};

type PhotonBase = { phi: number; theta: number };

interface SentinelWebScannerProps {
  onPhaseErrorChange?: (phaseError: number) => void;
}

const buildPhotonBase = (): PhotonBase[] =>
  Array.from({ length: NUM_PHOTONS }, (_, i) => {
    const index = i + 0.5;
    return {
      phi: Math.acos(1 - (2 * index) / NUM_PHOTONS),
      theta: Math.PI * (1 + Math.sqrt(5)) * index,
    };
  });

/** Detrended linear interpolation of the RR series onto a 4 Hz grid. */
const resampleRr = (rr: number[]): number[] => {
  const times: number[] = [];
  let acc = 0;
  for (const v of rr) {
    acc += v;
    times.push(acc);
  }
  const start = times[0];
  const end = times[times.length - 1];
  const out: number[] = [];
  for (let t = start; t < end; t += 0.25) {
    let j = 1;
    while (j < times.length - 1 && times[j] < t) j += 1;
    const t0 = times[j - 1];
    const t1 = times[j];
    const w = t1 === t0 ? 0 : (t - t0) / (t1 - t0);
    out.push(rr[j - 1] + w * (rr[j] - rr[j - 1]));
  }
  const mean = out.reduce((s, v) => s + v, 0) / (out.length || 1);
  return out.map((v) => v - mean);
};

/** Hann-windowed periodogram (single-segment Welch estimate) at 4 Hz. */
const periodogram = (signal: number[], fs = 4.0) => {
  const n = signal.length;
  const windowed = signal.map((v, i) => v * (0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (n - 1))));
  const bins = Math.floor(n / 2);
  const freqs: number[] = [];
  const psd: number[] = [];
  for (let k = 1; k <= bins; k += 1) {
    let re = 0;
    let im = 0;
    for (let i = 0; i < n; i += 1) {
      const angle = (-2 * Math.PI * k * i) / n;
      re += windowed[i] * Math.cos(angle);
      im += windowed[i] * Math.sin(angle);
    }
    freqs.push((k * fs) / n);
    psd.push((re * re + im * im) / n);
  }
  return { freqs, psd };
};

export const SentinelWebScanner = ({ onPhaseErrorChange }: SentinelWebScannerProps) => {
  const { language } = useLanguage();
  const T = TXT[language === "pl" ? "pl" : "en"];

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const photonBase = useMemo(buildPhotonBase, []);
  const rrRef = useRef<number[]>([]);
  const phaseBufferRef = useRef<number[]>([]);
  const coherenceRef = useRef(0);
  const phaseErrorRef = useRef(0);
  const deviceRef = useRef<BluetoothDevice | null>(null);
  const pacerStartRef = useRef(Date.now());

  const [supported, setSupported] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [coherence, setCoherence] = useState(0);
  const [phaseError, setPhaseError] = useState(0);
  const [gamma, setGamma] = useState(GAMMA_GOLD);
  const [dpllStatus, setDpllStatus] = useState("");
  const [beats, setBeats] = useState(0);
  const [windowSeconds, setWindowSeconds] = useState(0);
  const [bpm, setBpm] = useState<number | null>(null);
  const [modeIndex, setModeIndex] = useState(0);
  const [pacerPhase, setPacerPhase] = useState({ inhale: true, percent: 0 });
  const [lensRadius, setLensRadius] = useState(10);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [ritualSeconds, setRitualSeconds] = useState(0);
  const [ritualDone, setRitualDone] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [switchingMode, setSwitchingMode] = useState(false);
  const [finalAverage, setFinalAverage] = useState<number | null>(null);

  const maxCoherenceRef = useRef(0);
  const bpmRef = useRef<number | null>(null);
  const transitionRef = useRef(false);
  const modeCoherencesRef = useRef<number[]>([]);

  const breathDuration = BREATH_MODES[modeIndex].duration;
  const breathDurationRef = useRef(breathDuration);
  breathDurationRef.current = breathDuration;
  const modeNameRef = useRef(BREATH_MODES[modeIndex].name);
  modeNameRef.current = BREATH_MODES[modeIndex].name;

  useEffect(() => {
    setSupported(typeof navigator !== "undefined" && "bluetooth" in navigator);
  }, []);

  /** Background write of one completed 108 s breath mode into session history. */
  const saveModeResult = useCallback(async (breathMode: string, modeCoherence: number) => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      setSaveFailed(true);
      return false;
    }
    const { error } = await supabase.from("sentinel_sessions").insert({
      user_id: user.id,
      coherence: Number(modeCoherence.toFixed(4)),
      phase_error: Number(phaseErrorRef.current.toFixed(4)),
      mean_bpm: bpmRef.current,
      duration_seconds: RITUAL_SECONDS,
      breath_mode: breathMode,
      source: "web_scanner",
    });
    if (!error) window.dispatchEvent(new Event("sentinel-session-saved"));
    if (error) setSaveFailed(true);
    return !error;
  }, []);

  const clearModeMeasurement = useCallback(() => {
    rrRef.current = [];
    phaseBufferRef.current = [];
    coherenceRef.current = 0;
    phaseErrorRef.current = 0;
    maxCoherenceRef.current = 0;
    bpmRef.current = null;
    pacerStartRef.current = Date.now();
    setCoherence(0);
    setPhaseError(0);
    setGamma(GAMMA_GOLD);
    setDpllStatus("");
    setBeats(0);
    setWindowSeconds(0);
    setBpm(null);
    onPhaseErrorChange?.(0);
  }, [onPhaseErrorChange]);

  const completeCurrentMode = useCallback(async () => {
    if (transitionRef.current || ritualDone) return;
    transitionRef.current = true;
    setSwitchingMode(true);

    const completedMode = BREATH_MODES[modeIndex];
    const modeCoherence = maxCoherenceRef.current;
    const completedScores = [...modeCoherencesRef.current, modeCoherence];
    modeCoherencesRef.current = completedScores;
    await saveModeResult(completedMode.name, modeCoherence);

    if (modeIndex < BREATH_MODES.length - 1) {
      clearModeMeasurement();
      setModeIndex(modeIndex + 1);
      setRitualSeconds(0);
      setSwitchingMode(false);
      transitionRef.current = false;
      return;
    }

    const average = completedScores.reduce((sum, value) => sum + value, 0) / completedScores.length;
    setFinalAverage(average);
    setRitualDone(true);
    setSwitchingMode(false);
  }, [clearModeMeasurement, modeIndex, ritualDone, saveModeResult]);

  // Continuous four-mode study: each mode runs for 108 seconds.
  useEffect(() => {
    if (!connected || ritualDone || switchingMode) return;
    const timer = window.setInterval(() => {
      setRitualSeconds((prev) => Math.min(prev + 1, RITUAL_SECONDS));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [connected, ritualDone, switchingMode]);

  useEffect(() => {
    if (connected && ritualSeconds === RITUAL_SECONDS && !ritualDone) {
      void completeCurrentMode();
    }
  }, [completeCurrentMode, connected, ritualDone, ritualSeconds]);



  const analyse = useCallback(() => {
    const rr = rrRef.current;
    const total = rr.reduce((s, v) => s + v, 0);
    if (total < 40) return;

    const series = resampleRr(rr);
    if (series.length < 32) return;

    const { freqs, psd } = periodogram(series);
    let peakFreq = 0;
    let peakPower = -1;
    freqs.forEach((f, i) => {
      if (f >= 0.04 && f <= 0.15 && psd[i] > peakPower) {
        peakPower = psd[i];
        peakFreq = f;
      }
    });
    if (peakFreq === 0) return;

    // DPLL: deviation between the operator's real HRV peak and the metronome.
    const targetBreathFreq = 1 / (breathDurationRef.current * 2);
    const err = 2 * Math.PI * (peakFreq - targetBreathFreq);
    if (Math.abs(err) < 0.01) {
      setGamma(PHI);
      setDpllStatus(T.locked);
    } else {
      setGamma(GAMMA_GOLD * Math.exp(-Math.abs(err)));
      setDpllStatus(`${T.correction}: ${err.toFixed(4)} rad`);
    }
    phaseErrorRef.current = err;
    setPhaseError(err);
    onPhaseErrorChange?.(err);
    const buf = phaseBufferRef.current;
    buf.push(err);
    if (buf.length > 10) buf.shift();

    let narrow = 0;
    let totalPower = 0;
    freqs.forEach((f, i) => {
      if (f <= 0.4) totalPower += psd[i];
      if (f >= peakFreq - 0.015 && f <= peakFreq + 0.015) narrow += psd[i];
    });
    if (totalPower > 0) {
      const value = Math.min(1, (narrow / totalPower) * 1.4);
      coherenceRef.current = value;
      if (value > maxCoherenceRef.current) maxCoherenceRef.current = value;
      setCoherence(value);
    }

    setBeats(rr.length);
    setWindowSeconds(total);
    const nextBpm = Math.round(60 / (total / rr.length));
    bpmRef.current = nextBpm;
    setBpm(nextBpm);

  }, [T.correction, T.locked, onPhaseErrorChange]);

  const handleMeasurement = useCallback(
    (event: Event) => {
      const value = (event.target as unknown as { value?: DataView }).value;
      if (!value || value.byteLength < 2) return;

      const flags = value.getUint8(0);
      const hrFormat16 = (flags & 0x01) === 1;
      const rrPresent = ((flags >> 4) & 0x01) === 1;
      const energyPresent = ((flags >> 3) & 0x01) === 1;

      let offset = 1 + (hrFormat16 ? 2 : 1);
      if (energyPresent) offset += 2;

      let added = false;
      while (rrPresent && value.byteLength >= offset + 2) {
        const rrSeconds = value.getUint16(offset, true) / 1024;
        offset += 2;
        if (rrSeconds > 0.3 && rrSeconds < 2.0) {
          rrRef.current.push(rrSeconds);
          added = true;
        }
      }

      while (rrRef.current.length > 1 && rrRef.current.reduce((s, v) => s + v, 0) > RR_WINDOW_SECONDS) {
        rrRef.current.shift();
      }

      if (added) {
        setBeats(rrRef.current.length);
        setWindowSeconds(rrRef.current.reduce((s, v) => s + v, 0));
        if (rrRef.current.length > 10) analyse();
      }
    },
    [analyse],
  );

  const disconnect = useCallback(() => {
    const device = deviceRef.current;
    if (device?.gatt?.connected) device.gatt.disconnect();
    deviceRef.current = null;
    rrRef.current = [];
    phaseBufferRef.current = [];
    coherenceRef.current = 0;
    setConnected(false);
    setCoherence(0);
    setBeats(0);
    setWindowSeconds(0);
    setBpm(null);
    setDpllStatus("");
    phaseErrorRef.current = 0;
    bpmRef.current = null;
    onPhaseErrorChange?.(0);

  }, [onPhaseErrorChange]);

  const connect = useCallback(async () => {
    if (!("bluetooth" in navigator)) {
      setSupported(false);
      return;
    }
    setConnecting(true);
    setStatusMessage(null);
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [HEART_RATE_SERVICE] }],
        optionalServices: [HEART_RATE_SERVICE],
      });
      deviceRef.current = device;
      device.addEventListener("gattserverdisconnected", () => {
        setConnected(false);
        setStatusMessage(T.lost);
      });
      const server = await device.gatt?.connect();
      const service = await server?.getPrimaryService(HEART_RATE_SERVICE);
      const characteristic = await service?.getCharacteristic(HEART_RATE_MEASUREMENT);
      await characteristic?.startNotifications();
      characteristic?.addEventListener("characteristicvaluechanged", handleMeasurement);
      pacerStartRef.current = Date.now();
      maxCoherenceRef.current = 0;
      modeCoherencesRef.current = [];
      transitionRef.current = false;
      setModeIndex(0);
      setRitualSeconds(0);
      setRitualDone(false);
      setSaveFailed(false);
      setSwitchingMode(false);
      setFinalAverage(null);
      setConnected(true);

    } catch (error) {
      if ((error as DOMException)?.name !== "NotFoundError") setStatusMessage(T.error);
    } finally {
      setConnecting(false);
    }
  }, [T.error, T.lost, handleMeasurement]);

  useEffect(() => () => disconnect(), [disconnect]);

  // 60 FPS photon lens + breathing pacer
  useEffect(() => {
    let frame = 0;
    const render = () => {
      frame = requestAnimationFrame(render);
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, width, height);

      const now = Date.now() / 1000;
      const c = coherenceRef.current;
      const collapsed = c >= COHERENCE_THRESHOLD;

      // Dynamic radius — implosion towards the singularity
      let rDynamic = 10 * (1 - c) ** 2;
      if (collapsed) rDynamic = Math.max(0.05, rDynamic * 0.1);

      const visualError = collapsed ? 0 : phaseErrorRef.current + Math.sin(now) * 0.1;
      const modPhase = now * 2 * Math.PI * 0.11;
      const scale = (Math.min(width, height) / 2) * 0.9;
      const cx = width / 2;
      const cy = height / 2;
      let radiusSum = 0;

      for (let i = 0; i < NUM_PHOTONS; i += 1) {
        let theta = photonBase[i].theta + visualError * Math.sin(modPhase);
        const phi = photonBase[i].phi + visualError * Math.cos(modPhase);
        if (c > 0.7) {
          const w = Math.min(1, (c - 0.7) / 0.3);
          theta = (1 - w) * theta + w * (photonBase[i].theta + MAGIC_ANGLE);
        }
        const x = rDynamic * Math.sin(phi) * Math.cos(theta);
        const y = rDynamic * Math.sin(phi) * Math.sin(theta);
        const z = rDynamic * Math.cos(phi);
        radiusSum += Math.sqrt(x * x + y * y + z * z);

        const rotated = x * Math.cos(now * 0.25) - z * Math.sin(now * 0.25);
        const depth = x * Math.sin(now * 0.25) + z * Math.cos(now * 0.25);
        const perspective = 1 / (1 + (10 - depth) / 40);
        const px = cx + (rotated / 10) * scale * perspective;
        const py = cy + (y / 10) * scale * perspective;

        const red = Math.round(255 * (1 - c));
        const green = Math.round(255 * c * 0.3);
        const blue = Math.round(255 * c);
        ctx.fillStyle = `rgba(${red},${green},${blue},${collapsed ? 1 : 0.6})`;
        ctx.fillRect(px, py, collapsed ? 2 : 1.4, collapsed ? 2 : 1.4);
      }

      if (collapsed) {
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, scale * 0.5);
        glow.addColorStop(0, "rgba(255,255,255,0.85)");
        glow.addColorStop(1, "rgba(0,242,255,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(cx, cy, scale * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      setLensRadius(radiusSum / NUM_PHOTONS);

      const duration = breathDurationRef.current;
      const cycleTime = ((Date.now() - pacerStartRef.current) / 1000) % (duration * 2);
      if (cycleTime < duration) {
        setPacerPhase({ inhale: true, percent: cycleTime / duration });
      } else {
        setPacerPhase({ inhale: false, percent: (duration * 2 - cycleTime) / duration });
      }
    };
    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, [photonBase]);

  const phaseHint = useMemo(() => {
    const buf = phaseBufferRef.current;
    const avg = buf.length ? buf.reduce((s, v) => s + v, 0) / buf.length : 0;
    const seconds = (Math.abs(avg) / (2 * Math.PI)) * (breathDuration * 2);
    if (Math.abs(avg) < 0.05) return T.hintOk;
    const s = Math.max(0.1, seconds).toFixed(1);
    return (avg > 0 ? T.hintSlow : T.hintFast).replace("{s}", s);
  }, [phaseError, breathDuration, T.hintOk, T.hintSlow, T.hintFast]);

  const syncState = useMemo(() => {
    if (!connected || beats <= 10) return T.syncWaiting;
    if (Math.abs(phaseError) < 0.05) return T.syncLocked;
    return phaseError < 0 ? T.syncSlow : T.syncFast;
  }, [connected, beats, phaseError, T.syncWaiting, T.syncLocked, T.syncSlow, T.syncFast]);

  const collapsed = coherence >= COHERENCE_THRESHOLD;


  return (
    <div className="space-y-4 rounded-lg border border-secondary/30 bg-background/50 p-4 sm:p-5">
      <div className="space-y-1">
        <p className="flex items-center gap-2 text-sm font-semibold text-secondary">
          <Waves className="h-4 w-4 shrink-0" />
          <span className="break-words">{T.title}</span>
        </p>
        <p className="break-words text-xs leading-relaxed text-muted-foreground">{T.subtitle}</p>
      </div>

      {!supported ? (
        <p className="break-words rounded-md border border-accent/30 bg-accent/5 p-3 text-xs leading-relaxed text-accent">
          {T.unsupported}
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant={connected ? "secondary" : "glow"}
              className="w-full whitespace-normal sm:w-auto"
              onClick={connected ? disconnect : () => void connect()}
              disabled={connecting}
            >
              {connected ? <BluetoothOff className="h-4 w-4" /> : <Bluetooth className="h-4 w-4" />}
              {connecting ? T.connecting : connected ? T.disconnect : T.connect}
            </Button>
            <div className="flex flex-wrap items-center gap-2">
              {BREATH_MODES.map((mode, index) => (
                <Button
                  key={mode.key}
                  type="button"
                  size="sm"
                  variant={index === modeIndex ? "secondary" : "outline"}
                  className="text-xs"
                  onClick={() => setModeIndex(index)}
                  disabled={connected}
                >
                  {mode.name}
                </Button>
              ))}
            </div>
          </div>

          {!connected && (
            <p className="break-words text-xs leading-relaxed text-muted-foreground">{T.hintPermission}</p>
          )}
          {statusMessage && (
            <p className="break-words text-xs leading-relaxed text-destructive">{statusMessage}</p>
          )}

          <canvas
            ref={canvasRef}
            className="h-56 w-full rounded-md border border-secondary/20 bg-[#0a0a0a] sm:h-72"
            aria-label={T.lens}
          />

          <div className="space-y-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                <Heart className="h-3.5 w-3.5 shrink-0 text-accent" />
                {T.heartShield}
              </span>
              <span className={`text-lg font-bold ${collapsed ? "text-secondary" : "text-accent"}`}>
                {(coherence * 100).toFixed(2)}%
              </span>
            </div>
            <Progress value={coherence * 100} className="h-2" />
          </div>

          <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
            <div className="rounded-md border border-accent/30 bg-accent/5 p-3">
              <p className="break-words text-[0.68rem] uppercase tracking-wider text-muted-foreground">{T.simpleBpm}</p>
              <p className="font-mono text-lg font-bold text-accent">{bpm ? `${bpm} BPM` : "—"}</p>
            </div>
            <div className="rounded-md border border-secondary/30 bg-secondary/5 p-3">
              <p className="break-words text-[0.68rem] uppercase tracking-wider text-muted-foreground">{T.simpleSync}</p>
              <p className="break-words text-sm font-semibold text-secondary">{syncState}</p>
            </div>
            <div className="rounded-md border border-border bg-background/40 p-3">
              <p className="break-words text-[0.68rem] uppercase tracking-wider text-muted-foreground">{T.simpleRitual}</p>
              <p className="font-mono text-lg font-bold text-foreground">
                {Math.min(ritualSeconds, RITUAL_SECONDS)} / {RITUAL_SECONDS}s
              </p>
              <Progress value={(Math.min(ritualSeconds, RITUAL_SECONDS) / RITUAL_SECONDS) * 100} className="mt-2 h-1.5" />
              <p className="mt-2 text-[0.68rem] text-muted-foreground">
                {T.modeProgress} {modeIndex + 1}/{BREATH_MODES.length} · {BREATH_MODES[modeIndex].name}
              </p>
            </div>
          </div>

          {switchingMode && (
            <p className="rounded-md border border-secondary/30 bg-secondary/5 p-3 text-xs text-secondary" role="status">
              {T.switchingMode}
            </p>
          )}

          {ritualDone && (
            <div className="space-y-2 rounded-md border border-primary/50 bg-primary/10 p-3">
              <p className="break-words text-sm font-bold text-primary">{T.ritualDoneTitle}</p>
              {finalAverage !== null && (
                <p className="text-xs text-foreground">
                  {T.finalAverage}: <span className="font-mono font-bold text-secondary">{(finalAverage * 100).toFixed(1)}%</span>
                </p>
              )}
              <p className="break-words text-xs leading-relaxed text-foreground/80">
                {saveFailed ? T.ritualSaveFailed : T.ritualDoneText}
              </p>
              {finalAverage !== null && (
                <p className="break-words border-t border-primary/30 pt-2 text-xs font-medium leading-relaxed text-primary">
                  {finalAverage >= COHERENCE_THRESHOLD ? T.adviceHigh : finalAverage < 0.5 ? T.adviceLow : T.adviceMid}
                </p>
              )}
            </div>
          )}

          <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button type="button" variant="outline" size="sm" className="w-full justify-between whitespace-normal text-left text-xs">
                <span className="break-words">{T.advancedTitle}</span>
                <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${advancedOpen ? "rotate-180" : ""}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <dl className="mt-2 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                {[
                  [T.phase, `${phaseError.toFixed(4)} rad`],
                  [T.dpll, `γ=${gamma.toFixed(4)}${dpllStatus ? ` — ${dpllStatus}` : ""}`],
                  [T.lens, `R=${lensRadius.toFixed(3)} — 800 φ — 54.7356°`],
                  [T.buffer, `${beats} ${T.beats} — ${T.window} ${windowSeconds.toFixed(1)}s`],
                  [T.bpm, bpm ? `${bpm} BPM` : "—"],
                  [T.mode, `${BREATH_MODES[modeIndex].name} — ${breathDuration.toFixed(1)}s`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-md border border-border bg-background/40 p-2">
                    <dt className="break-words text-[0.68rem] uppercase tracking-wider text-muted-foreground">{label}</dt>
                    <dd className="break-words font-mono text-foreground/90">{value}</dd>
                  </div>
                ))}
              </dl>
            </CollapsibleContent>
          </Collapsible>


          <div className="space-y-1">
            <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <Activity className="h-3.5 w-3.5 shrink-0" />
              {T.pacer}
            </p>
            <Progress value={pacerPhase.percent * 100} className="h-2" />
            <p className="break-words text-xs text-secondary">
              {pacerPhase.inhale ? T.inhale : T.exhale}
            </p>
            <p className="break-words text-xs leading-relaxed text-muted-foreground">
              {connected ? (beats > 10 ? phaseHint : T.warmup) : T.hintPermission}
            </p>
          </div>

          {collapsed && (
            <p className="flex items-center gap-2 break-words rounded-md border border-secondary/50 bg-secondary/10 p-3 text-sm font-bold text-secondary">
              <Sparkles className="h-4 w-4 shrink-0" />
              {T.collapse}
            </p>
          )}
        </>
      )}
    </div>
  );
};
