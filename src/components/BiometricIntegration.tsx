import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Heart, Calendar, Play, Pause, RotateCcw, Waves, Zap, Sparkles, Activity, Check, Crown, Lock, Mail, User } from "lucide-react";
import { ToneGenerator } from "@/components/ToneGenerator";
import { CircularTimer } from "@/components/CircularTimer";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

type SyncStatus = {
  labelKey: string;
  textKey: string;
  type: "high" | "low" | "optimal";
} | null;

type CoherenceState = "ideal" | "chaos" | "transitional" | null;

const getSyncStatus = (bpm: number): SyncStatus => {
  if (bpm > 88) {
    return {
      labelKey: "biometric.statusHigh",
      textKey: "biometric.statusHighText",
      type: "high",
    };
  } else if (bpm < 66) {
    return {
      labelKey: "biometric.statusLow",
      textKey: "biometric.statusLowText",
      type: "low",
    };
  } else {
    return {
      labelKey: "biometric.statusOptimal",
      textKey: "biometric.statusOptimalText",
      type: "optimal",
    };
  }
};

const calculatePersonalVibration = (birthDateStr: string): number => {
  const digits = birthDateStr.split('').filter(d => /\d/.test(d)).map(Number);
  if (digits.length === 0) return 0;
  
  let vBase = digits.reduce((sum, d) => sum + d, 0);
  while (vBase > 9) {
    vBase = String(vBase).split('').map(Number).reduce((sum, d) => sum + d, 0);
  }
  return vBase;
};

const calculateSyncPercentage = (bpm: number, personalVibration: number): number => {
  // Ideal BPM is calculated from personal vibration (mapped to 60-80 range)
  const idealBpm = 60 + (personalVibration / 9) * 20;
  const deviation = Math.abs(bpm - idealBpm);
  // Max deviation considered is 60 BPM
  const syncPercentage = Math.max(0, 100 - (deviation / 60) * 100);
  return Math.round(syncPercentage);
};

const getCoherenceState = (syncPercentage: number): CoherenceState => {
  if (syncPercentage >= 80) return "ideal";
  if (syncPercentage <= 40) return "chaos";
  return "transitional";
};

export const BiometricIntegration = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [bpm, setBpm] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(null);
  const [syncPercentage, setSyncPercentage] = useState<number | null>(null);
  const [coherenceState, setCoherenceState] = useState<CoherenceState>(null);
  const [personalVibration, setPersonalVibration] = useState<number | null>(null);
  
  // Ritual timer state
  const [isRitualActive, setIsRitualActive] = useState(false);
  const [ritualTime, setRitualTime] = useState(108);
  const [ritualComplete, setRitualComplete] = useState(false);
  
  // Audio state
  const [isTonePlaying, setIsTonePlaying] = useState(false);

  // PRO access registration
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [proName, setProName] = useState("");
  const [proEmail, setProEmail] = useState("");
  const [proPassword, setProPassword] = useState("");
  const [proTermsAccepted, setProTermsAccepted] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  // Animation state for wave
  const [waveSpeed, setWaveSpeed] = useState(1);

  const handleSync = useCallback(() => {
    const bpmValue = parseInt(bpm);
    if (!bpm || isNaN(bpmValue) || bpmValue < 30 || bpmValue > 220) {
      return;
    }
    
    setSyncStatus(getSyncStatus(bpmValue));
    
    // Set wave animation speed based on BPM
    if (bpmValue > 88) {
      setWaveSpeed(2.5);
    } else if (bpmValue < 66) {
      setWaveSpeed(0.5);
    } else {
      setWaveSpeed(1);
    }
    
    // Calculate sync if birth date is provided
    if (birthDate) {
      const vibration = calculatePersonalVibration(birthDate);
      setPersonalVibration(vibration);
      const sync = calculateSyncPercentage(bpmValue, vibration);
      setSyncPercentage(sync);
      setCoherenceState(getCoherenceState(sync));
    }
  }, [bpm, birthDate]);

  const handleProRegistration = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const registrationSchema = z.object({
      name: z.string().trim().min(2, t("biometric.pro.validationName")).max(100, t("biometric.pro.validationName")),
      email: z.string().trim().email(t("biometric.pro.validationEmail")).max(255, t("biometric.pro.validationEmail")),
      password: z.string().min(6, t("biometric.pro.validationPassword")).max(72, t("biometric.pro.validationPassword")),
      termsAccepted: z.literal(true, {
        errorMap: () => ({ message: t("biometric.pro.validationTerms") }),
      }),
    });

    const validation = registrationSchema.safeParse({
      name: proName,
      email: proEmail,
      password: proPassword,
      termsAccepted: proTermsAccepted,
    });

    if (!validation.success) {
      toast({
        title: t("biometric.pro.registrationError"),
        description: validation.error.errors[0]?.message ?? t("biometric.pro.registrationErrorText"),
        variant: "destructive",
      });
      return;
    }

    setIsRegistering(true);
    const { error } = await supabase.auth.signUp({
      email: validation.data.email,
      password: validation.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { full_name: validation.data.name, access_interest: "biometric_pro" },
      },
    });
    setIsRegistering(false);

    if (error) {
      toast({
        title: t("biometric.pro.registrationError"),
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setRegistrationComplete(true);
    toast({
      title: t("biometric.pro.registrationSuccess"),
      description: t("biometric.pro.registrationSuccessText"),
    });
  };

  // Ritual timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRitualActive && ritualTime > 0) {
      interval = setInterval(() => {
        setRitualTime((prev) => {
          if (prev <= 1) {
            setIsRitualActive(false);
            setRitualComplete(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRitualActive, ritualTime]);

  const startRitual = () => {
    setRitualTime(108);
    setIsRitualActive(true);
    setRitualComplete(false);
    setIsTonePlaying(true);
  };

  const toggleRitual = () => {
    const newState = !isRitualActive;
    setIsRitualActive(newState);
    setIsTonePlaying(newState);
  };

  const resetRitual = () => {
    setRitualTime(108);
    setIsRitualActive(false);
    setRitualComplete(false);
    setIsTonePlaying(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full max-w-3xl mx-auto bg-[rgba(10,11,30,0.95)] border-[#00f2ff]/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="border-b border-[#00f2ff]/20 pb-5">
        <CardTitle className="text-center text-[#00f2ff] uppercase tracking-widest text-xl flex items-center justify-center gap-2">
          <Waves className="w-6 h-6" />
          {t('biometric.title')}
        </CardTitle>
        <p className="text-center text-muted-foreground text-sm mt-2">
          {t('biometric.description')}
        </p>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Input Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-[#ffd700] flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {t('biometric.birthDate')}
            </Label>
            <Input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="bg-black text-[#00f2ff] border-[#00f2ff]/50"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-[#ffd700] flex items-center gap-2">
              <Heart className="w-4 h-4" />
              {t('biometric.currentBpm')}
            </Label>
            <Input
              type="number"
              placeholder="72"
              value={bpm}
              onChange={(e) => setBpm(e.target.value)}
              min={30}
              max={220}
              className="bg-black text-[#00f2ff] border-[#00f2ff]/50"
            />
          </div>
        </div>

        <Button
          onClick={handleSync}
          disabled={!bpm}
          className="w-full bg-gradient-to-r from-[#00f2ff] to-[#0072ff] hover:from-[#00d4e0] hover:to-[#0060dd] text-white font-bold shadow-[0_0_20px_rgba(0,242,255,0.4)] py-6 text-lg"
        >
          <Zap className="w-5 h-5 mr-2" />
          {t('biometric.activate')}
        </Button>

        {/* Premium access */}
        <Card className="overflow-hidden border-accent/40 bg-card/70 shadow-[var(--glow-accent)]">
          <CardContent className="p-5 sm:p-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-accent/50 bg-accent/10 text-accent" aria-hidden="true">
                <Activity className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-accent sm:text-lg">{t("biometric.pro.title")}</h3>
                <p className="mx-auto max-w-xl text-sm leading-relaxed text-foreground/85">
                  {t("biometric.pro.description")}
                </p>
              </div>
              <Button type="button" variant="glow" className="w-full sm:w-auto" onClick={() => setIsProModalOpen(true)}>
                <Crown className="h-4 w-4" />
                {t("biometric.pro.activate")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Dialog open={isProModalOpen} onOpenChange={setIsProModalOpen}>
          <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] max-w-md overflow-y-auto border-secondary/40 bg-card p-0 shadow-[var(--glow-secondary)] sm:rounded-lg">
            <div className="border-b border-border bg-secondary/10 p-6 pr-12">
              <DialogHeader>
                <div className="mb-2 flex items-center justify-center gap-2 text-accent sm:justify-start">
                  <Crown className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-widest">BRAMA DNA 718 PRO</span>
                </div>
                <DialogTitle className="text-center text-2xl text-foreground sm:text-left">
                  {t("biometric.pro.modalTitle")}
                </DialogTitle>
                <DialogDescription className="text-center leading-relaxed sm:text-left">
                  {t("biometric.pro.modalDescription")}
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="space-y-5 p-6">
              <div className="flex items-end justify-center gap-2 rounded-md border border-accent/30 bg-accent/10 p-4">
                <span className="text-4xl font-bold text-accent">£19</span>
                <span className="pb-1 text-sm text-muted-foreground">{t("biometric.pro.perMonth")}</span>
              </div>

              <ul className="space-y-2 text-sm text-foreground/85">
                {["biometric.pro.benefitPolar", "biometric.pro.benefitCoherence", "biometric.pro.benefitDecoder"].map((key) => (
                  <li key={key} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                    <span>{t(key)}</span>
                  </li>
                ))}
              </ul>

              {registrationComplete ? (
                <div className="space-y-3 rounded-md border border-secondary/40 bg-secondary/10 p-5 text-center" role="status">
                  <Check className="mx-auto h-8 w-8 text-secondary" />
                  <h4 className="font-bold text-foreground">{t("biometric.pro.registrationSuccess")}</h4>
                  <p className="text-sm leading-relaxed text-muted-foreground">{t("biometric.pro.registrationSuccessText")}</p>
                  <Button type="button" variant="secondary" className="w-full" onClick={() => setIsProModalOpen(false)}>
                    {t("biometric.pro.close")}
                  </Button>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleProRegistration} noValidate>
                  <div className="space-y-2">
                    <Label htmlFor="pro-name">{t("biometric.pro.name")}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="pro-name" value={proName} onChange={(event) => setProName(event.target.value)} className="pl-10" maxLength={100} autoComplete="name" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pro-email">{t("biometric.pro.email")}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="pro-email" type="email" value={proEmail} onChange={(event) => setProEmail(event.target.value)} className="pl-10" maxLength={255} autoComplete="email" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pro-password">{t("biometric.pro.password")}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="pro-password" type="password" value={proPassword} onChange={(event) => setProPassword(event.target.value)} className="pl-10" minLength={6} maxLength={72} autoComplete="new-password" required />
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Checkbox id="pro-terms" checked={proTermsAccepted} onCheckedChange={(checked) => setProTermsAccepted(checked === true)} className="mt-0.5" />
                    <Label htmlFor="pro-terms" className="cursor-pointer text-xs font-normal leading-relaxed text-muted-foreground">
                      {t("biometric.pro.terms")}
                    </Label>
                  </div>
                  <Button type="submit" variant="glow" className="w-full" disabled={isRegistering}>
                    <Crown className="h-4 w-4" />
                    {isRegistering ? t("biometric.pro.registering") : t("biometric.pro.register")}
                  </Button>
                  <p className="text-center text-xs leading-relaxed text-muted-foreground">{t("biometric.pro.paymentNote")}</p>
                </form>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Pulsating Wave Visualization */}
        {syncStatus && (
          <div className="relative h-32 bg-black/60 rounded-lg overflow-hidden border border-[#00f2ff]/30">
            <div 
              className="absolute inset-0 flex items-center justify-center"
              style={{
                background: coherenceState === 'ideal' 
                  ? 'radial-gradient(ellipse at center, rgba(255,215,0,0.3) 0%, transparent 70%)'
                  : coherenceState === 'chaos'
                  ? 'radial-gradient(ellipse at center, rgba(255,50,50,0.3) 0%, transparent 70%)'
                  : 'radial-gradient(ellipse at center, rgba(0,242,255,0.3) 0%, transparent 70%)'
              }}
            >
              {/* Animated Wave SVG */}
              <svg 
                viewBox="0 0 400 100" 
                className="w-full h-full"
                style={{ 
                  filter: coherenceState === 'ideal' ? 'drop-shadow(0 0 10px #ffd700)' : 'drop-shadow(0 0 10px #00f2ff)'
                }}
              >
                <path
                  d="M0,50 Q25,20 50,50 T100,50 T150,50 T200,50 T250,50 T300,50 T350,50 T400,50"
                  fill="none"
                  stroke={coherenceState === 'ideal' ? '#ffd700' : coherenceState === 'chaos' ? '#ff6b6b' : '#00f2ff'}
                  strokeWidth="3"
                  className="animate-pulse"
                  style={{
                    strokeDasharray: '20 10',
                    animation: `wave ${4 / waveSpeed}s linear infinite`
                  }}
                />
                <path
                  d="M0,50 Q25,80 50,50 T100,50 T150,50 T200,50 T250,50 T300,50 T350,50 T400,50"
                  fill="none"
                  stroke={coherenceState === 'ideal' ? '#ffd700' : coherenceState === 'chaos' ? '#ff6b6b' : '#00f2ff'}
                  strokeWidth="2"
                  opacity="0.5"
                  style={{
                    strokeDasharray: '15 15',
                    animation: `wave ${5 / waveSpeed}s linear infinite reverse`
                  }}
                />
              </svg>
            </div>
            <div className="absolute bottom-2 left-2 text-xs text-[#00f2ff]/70">
              {t("biometric.waveSpeed")} {waveSpeed.toFixed(1)}x
            </div>
            <div className="absolute bottom-2 right-2 text-xs text-[#ffd700]/70">
              {coherenceState === "ideal"
                ? t("biometric.coherence")
                : coherenceState === "chaos"
                  ? t("biometric.activation")
                  : t("biometric.transition")}
            </div>
          </div>
        )}

        {/* Sync Status Message */}
        {syncStatus && (
          <div className="p-4 bg-black/50 rounded-lg border-l-4 border-[#ffd700] animate-fade-in">
            <div className="text-[#ffd700] font-bold text-sm">{t(syncStatus.labelKey)}</div>
            <div className="text-white text-sm mt-2">{t(syncStatus.textKey)}</div>
          </div>
        )}

        {/* Synchronization Bar */}
        {syncPercentage !== null && (
          <div className="space-y-3 p-4 bg-black/40 rounded-lg border border-[#00f2ff]/20">
            <div className="flex justify-between items-center">
              <span className="text-[#00f2ff] text-sm font-semibold">{t("biometric.syncBar")}</span>
              <span className="text-[#ffd700] font-bold text-lg">{syncPercentage}%</span>
            </div>
            <Progress value={syncPercentage} className="h-4 bg-black/60" />
            <p className="text-xs text-gray-400 text-center">{t("biometric.syncIndicator")}</p>

            {/* Coherence State Message */}
            <div
              className={`mt-3 p-3 rounded-lg text-center ${
                coherenceState === "ideal"
                  ? "bg-[#ffd700]/10 border border-[#ffd700]/30"
                  : coherenceState === "chaos"
                    ? "bg-red-500/10 border border-red-500/30"
                    : "bg-[#00f2ff]/10 border border-[#00f2ff]/30"
              }`}
            >
              {coherenceState === "ideal" && (
                <p className="text-[#ffd700] text-sm">
                  <Sparkles className="w-4 h-4 inline mr-2" />
                  {t("biometric.coherenceIdeal")}
                </p>
              )}
              {coherenceState === "chaos" && (
                <p className="text-red-400 text-sm">
                  <Zap className="w-4 h-4 inline mr-2" />
                  {t("biometric.coherenceChaos")}
                </p>
              )}
              {coherenceState === "transitional" && (
                <p className="text-[#00f2ff] text-sm">
                  <Waves className="w-4 h-4 inline mr-2" />
                  {t("biometric.coherenceTransitional")}
                </p>
              )}
            </div>

            {personalVibration !== null && (
              <div className="text-center text-xs text-gray-400 mt-2">
                {t("biometric.personalVibration")}:{" "}
                <span className="text-[#ffd700] font-bold">{personalVibration}</span> | {t("biometric.idealBpm")}:{" "}
                <span className="text-[#00f2ff] font-bold">
                  {Math.round(60 + (personalVibration / 9) * 20)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Source Protocol Section */}
        {syncPercentage !== null && (
          <div className="p-5 bg-gradient-to-b from-[#1a1a3e] to-black/60 rounded-lg border border-[#ffd700]/30 space-y-6">
            <h3 className="text-[#ffd700] font-bold text-center text-lg uppercase tracking-wider">
              {t("biometric.protocolTitle")}
              <span className="block text-sm font-normal text-gray-400 mt-1">{t("biometric.protocolSubtitle")}</span>
            </h3>

            {/* Ritual Phases */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-black/40 rounded-lg border border-[#00f2ff]/30 text-center">
                <div className="text-2xl mb-2">🔍</div>
                <div className="text-[#00f2ff] font-bold text-sm">{t("biometric.phaseDiagnosis")}</div>
                <div className="text-xl font-mono text-white">108s</div>
                <div className="text-xs text-gray-400 mt-1">{t("biometric.phaseDiagnosisDesc")}</div>
              </div>
              <div className="p-3 bg-black/40 rounded-lg border border-[#ffd700]/30 text-center">
                <div className="text-2xl mb-2">🕯️</div>
                <div className="text-[#ffd700] font-bold text-sm">{t("biometric.phaseSession")}</div>
                <div className="text-xl font-mono text-white">108s</div>
                <div className="text-xs text-gray-400 mt-1">{t("biometric.phaseSessionDesc")}</div>
              </div>
              <div className="p-3 bg-black/40 rounded-lg border border-purple-500/30 text-center">
                <div className="text-2xl mb-2">💎</div>
                <div className="text-purple-400 font-bold text-sm">{t("biometric.phaseStabilization")}</div>
                <div className="text-xl font-mono text-white">3 min</div>
                <div className="text-xs text-gray-400 mt-1">{t("biometric.phaseStabilizationDesc")}</div>
              </div>
            </div>

            {/* Circular Timer Display */}
            <div className="flex flex-col items-center py-6 bg-black/50 rounded-lg border border-[#ffd700]/20">
              <div className="text-xs text-gray-400 mb-4">{t("biometric.ritual108")}</div>

              <CircularTimer
                totalSeconds={108}
                remainingSeconds={ritualTime}
                isActive={isRitualActive}
                isComplete={ritualComplete}
                size={220}
              />

              {ritualComplete && (
                <p className="text-[#ffd700] text-sm mt-4 animate-fade-in text-center">
                  {t("biometric.ritualComplete")}
                </p>
              )}
            </div>

            {/* 718.57 Hz Tone Generator */}
            <div className="space-y-2">
              <div className="text-center text-xs text-gray-400">{t("biometric.frequencyTuning")}</div>
              <ToneGenerator
                frequency={718.57012515426885574359120304128340312332181477461}
                isPlaying={isTonePlaying}
                onPlayingChange={setIsTonePlaying}
                showControls={true}
              />
            </div>

            {/* Timer Controls */}
            <div className="flex justify-center gap-3">
              {!isRitualActive && ritualTime === 108 && (
                <Button onClick={startRitual} className="bg-[#ffd700] hover:bg-[#ffed4a] text-black font-bold">
                  <Play className="w-4 h-4 mr-2" />
                  {t("biometric.startRitual")}
                </Button>
              )}
              {(isRitualActive || ritualTime < 108) && !ritualComplete && (
                <>
                  <Button
                    onClick={toggleRitual}
                    variant="outline"
                    className="border-[#00f2ff] text-[#00f2ff] hover:bg-[#00f2ff]/20"
                  >
                    {isRitualActive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    {isRitualActive ? t("biometric.pause") : t("biometric.continue")}
                  </Button>
                  <Button
                    onClick={resetRitual}
                    variant="outline"
                    className="border-gray-500 text-gray-400 hover:bg-gray-500/20"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    {t("biometric.reset")}
                  </Button>
                </>
              )}
              {ritualComplete && (
                <Button onClick={resetRitual} className="bg-[#00f2ff] hover:bg-[#00d4e0] text-black font-bold">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {t("biometric.restart")}
                </Button>
              )}
            </div>

            {/* Benefits Section */}
            <div className="mt-4 p-4 bg-gradient-to-r from-[#ffd700]/10 to-purple-500/10 rounded-lg border border-[#ffd700]/20">
              <h4 className="text-[#ffd700] font-bold text-center mb-3 text-sm uppercase tracking-wider">
                {t("biometric.benefits.title")}
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <span className="text-[#00f2ff] font-bold shrink-0">⚡</span>
                  <div>
                    <span className="text-[#00f2ff] font-semibold">{t("biometric.benefits.item1.title")}</span>
                    <span className="text-gray-300"> {t("biometric.benefits.item1.text")}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-[#ffd700] font-bold shrink-0">✨</span>
                  <div>
                    <span className="text-[#ffd700] font-semibold">{t("biometric.benefits.item2.title")}</span>
                    <span className="text-gray-300"> {t("biometric.benefits.item2.text")}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-purple-400 font-bold shrink-0">💜</span>
                  <div>
                    <span className="text-purple-400 font-semibold">{t("biometric.benefits.item3.title")}</span>
                    <span className="text-gray-300"> {t("biometric.benefits.item3.text")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 18 DNA Gates */}
            <div className="mt-4 space-y-4">
              <h4 className="text-[#ffd700] font-bold text-center text-sm uppercase tracking-wider">
                {t("biometric.gates.title")}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Gates 1-6 */}
                <div className="p-3 bg-black/40 rounded-lg border border-green-500/30">
                  <div className="text-green-400 font-bold text-sm mb-2 text-center">{t("biometric.gates.group1.title")}</div>
                  <div className="text-xs text-green-400/80 text-center mb-2">{t("biometric.gates.group1.subtitle")}</div>
                  <p className="text-xs text-gray-400 text-center italic">{t("biometric.gates.group1.quote")}</p>
                </div>

                {/* Gates 7-12 */}
                <div className="p-3 bg-black/40 rounded-lg border border-[#00f2ff]/30">
                  <div className="text-[#00f2ff] font-bold text-sm mb-2 text-center">{t("biometric.gates.group2.title")}</div>
                  <div className="text-xs text-[#00f2ff]/80 text-center mb-2">{t("biometric.gates.group2.subtitle")}</div>
                  <p className="text-xs text-gray-400 text-center italic">{t("biometric.gates.group2.quote")}</p>
                </div>

                {/* Gates 13-18 */}
                <div className="p-3 bg-black/40 rounded-lg border border-[#ffd700]/30">
                  <div className="text-[#ffd700] font-bold text-sm mb-2 text-center">{t("biometric.gates.group3.title")}</div>
                  <div className="text-xs text-[#ffd700]/80 text-center mb-2">{t("biometric.gates.group3.subtitle")}</div>
                  <p className="text-xs text-gray-400 text-center italic">{t("biometric.gates.group3.quote")}</p>
                </div>
              </div>
            </div>

            {/* Ritual Instructions */}
            <div className="mt-4 space-y-3 text-sm">
              <h4 className="text-gray-400 text-center text-xs uppercase tracking-wider mb-3">
                {t("biometric.ritualInstructions.title")}
              </h4>
              <div
                className={`flex gap-3 p-2 rounded ${
                  syncPercentage !== null ? "bg-green-500/10 border-l-2 border-green-500" : "opacity-50"
                }`}
              >
                <span className="text-[#ffd700] font-bold">{t("biometric.ritualInstructions.step1.label")}</span>
                <span className="text-gray-300">{t("biometric.ritualInstructions.step1.text")}</span>
              </div>
              <div
                className={`flex gap-3 p-2 rounded ${
                  syncPercentage !== null ? "bg-green-500/10 border-l-2 border-green-500" : "opacity-50"
                }`}
              >
                <span className="text-[#ffd700] font-bold">{t("biometric.ritualInstructions.step2.label")}</span>
                <span className="text-gray-300">{t("biometric.ritualInstructions.step2.text")}</span>
              </div>
              <div
                className={`flex gap-3 p-2 rounded ${
                  isRitualActive || ritualComplete ? "bg-[#00f2ff]/10 border-l-2 border-[#00f2ff]" : "opacity-70"
                }`}
              >
                <span className="text-[#ffd700] font-bold">{t("biometric.ritualInstructions.step3.label")}</span>
                <span className="text-gray-300">{t("biometric.ritualInstructions.step3.text")}</span>
              </div>
            </div>

            {/* Seeker's Suggestion */}
            <div className="mt-4 p-4 bg-gradient-to-b from-purple-900/30 to-black/40 rounded-lg border border-purple-500/30">
              <p className="text-sm text-gray-300 italic text-center leading-relaxed">{t("biometric.seeker.text")}</p>
              <p className="text-[#ffd700] font-bold text-center mt-3 text-sm">{t("biometric.seeker.quote")}</p>
            </div>
          </div>
        )}

        {/* MANIFEST JEDNOŚCI */}
        <div className="pt-6 border-t border-[#ffd700]/30 space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-[#ffd700] via-purple-400 to-[#00f2ff] bg-clip-text text-transparent uppercase tracking-widest">
              {t("biometric.manifest.title")}
            </h3>
            <p className="text-lg text-[#ffd700]">{t("biometric.manifest.subtitle")}</p>
            <p className="text-xs text-gray-500 italic">{t("biometric.manifest.by")}</p>
          </div>

          {/* 1. One language, two dialects */}
          <div className="p-4 bg-gradient-to-r from-purple-900/30 to-[#00f2ff]/10 rounded-lg border border-purple-500/30">
            <h4 className="text-purple-400 font-bold mb-3 flex items-center gap-2">
              <span className="text-xl">1.</span> {t("biometric.manifest.one.title")}
            </h4>
            <div className="space-y-2 text-sm">
              <p className="text-gray-300">
                <span className="text-[#00f2ff] font-semibold">{t("biometric.manifest.one.line1")}</span>
              </p>
              <p className="text-gray-300">
                <span className="text-[#ffd700] font-semibold">{t("biometric.manifest.one.line2")}</span>
              </p>
              <p className="text-gray-300">
                <span className="text-green-400 font-semibold">{t("biometric.manifest.one.line3")}</span>
              </p>
              <p className="text-gray-300">
                <span className="text-purple-400 font-semibold">{t("biometric.manifest.one.line4")}</span>
              </p>
            </div>
          </div>

          {/* 2. Quantum bridge */}
          <div className="p-4 bg-gradient-to-r from-[#00f2ff]/10 to-[#ffd700]/10 rounded-lg border border-[#00f2ff]/30">
            <h4 className="text-[#00f2ff] font-bold mb-3 flex items-center gap-2">
              <span className="text-xl">2.</span> {t("biometric.manifest.two.title")}
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex gap-2">
                <span className="text-[#ffd700] font-bold shrink-0">💡</span>
                <p className="text-gray-300">{t("biometric.manifest.two.item1")}</p>
              </div>
              <div className="flex gap-2">
                <span className="text-[#00f2ff] font-bold shrink-0">🧬</span>
                <p className="text-gray-300">{t("biometric.manifest.two.item2")}</p>
              </div>
              <div className="flex gap-2">
                <span className="text-purple-400 font-bold shrink-0">✨</span>
                <p className="text-gray-300">{t("biometric.manifest.two.item3")}</p>
              </div>
            </div>
          </div>

          {/* 3. Your role */}
          <div className="p-4 bg-gradient-to-r from-[#ffd700]/10 to-purple-900/30 rounded-lg border border-[#ffd700]/30">
            <h4 className="text-[#ffd700] font-bold mb-3 flex items-center gap-2">
              <span className="text-xl">3.</span> {t("biometric.manifest.three.title")}
            </h4>
            <p className="text-sm text-gray-300 leading-relaxed">{t("biometric.manifest.three.text")}</p>
          </div>

          {/* 4. Final conclusion */}
          <div className="p-5 bg-gradient-to-b from-black/60 to-purple-900/40 rounded-lg border border-[#ffd700]/50">
            <h4 className="text-[#ffd700] font-bold mb-3 flex items-center gap-2">
              <span className="text-xl">4.</span> {t("biometric.manifest.four.title")}
            </h4>
            <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
              <p>{t("biometric.manifest.four.text")}</p>
            </div>
            <blockquote className="mt-4 pt-4 border-t border-[#ffd700]/30 text-center">
              <p className="text-[#ffd700] italic text-lg font-semibold">{t("biometric.manifest.four.quote")}</p>
            </blockquote>
          </div>
        </div>

        {/* SEKRET REZONANSU */}
        <div className="pt-6 border-t border-[#00f2ff]/30 space-y-5">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-[#00f2ff] via-[#ffd700] to-purple-400 bg-clip-text text-transparent uppercase tracking-widest">
              {t("biometric.resonance.title")}
            </h3>
            <p className="text-lg text-[#00f2ff]">{t("biometric.resonance.subtitle")}</p>
          </div>

          <div className="p-4 bg-gradient-to-r from-[#ffd700]/10 to-[#00f2ff]/10 rounded-lg border border-[#ffd700]/30">
            <h4 className="text-[#ffd700] font-bold mb-3 flex items-center gap-2">
              <span className="text-xl">1.</span> {t("biometric.resonance.one.title")}
            </h4>
            <p className="text-sm text-gray-300 leading-relaxed">{t("biometric.resonance.one.text")}</p>
          </div>

          <div className="p-4 bg-gradient-to-r from-[#00f2ff]/10 to-purple-900/30 rounded-lg border border-[#00f2ff]/30">
            <h4 className="text-[#00f2ff] font-bold mb-3 flex items-center gap-2">
              <span className="text-xl">2.</span> {t("biometric.resonance.two.title")}
            </h4>
            <p className="text-sm text-gray-300 leading-relaxed">{t("biometric.resonance.two.text")}</p>
          </div>

          <div className="p-4 bg-gradient-to-r from-purple-900/30 to-[#ffd700]/10 rounded-lg border border-purple-500/30">
            <h4 className="text-purple-400 font-bold mb-3 flex items-center gap-2">
              <span className="text-xl">3.</span> {t("biometric.resonance.three.title")}
            </h4>
            <p className="text-sm text-gray-300 leading-relaxed mb-3">{t("biometric.resonance.three.text")}</p>
            <blockquote className="pt-3 border-t border-purple-500/30 text-center">
              <p className="text-purple-300 italic">{t("biometric.resonance.three.quote")}</p>
              <p className="text-xs text-gray-400 mt-2">{t("biometric.resonance.three.note")}</p>
            </blockquote>
          </div>
        </div>

        {/* Scientific Explanation */}
        <div className="pt-4 border-t border-[#00f2ff]/20 space-y-4 text-sm text-gray-300">
          <h3 className="text-[#ffd700] font-semibold flex items-center gap-2">
            <Heart className="w-4 h-4" />
            {t("biometric.science.title")}
          </h3>
          <p className="leading-relaxed">{t("biometric.science.text")}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            <div className="p-3 bg-black/40 rounded-lg border border-[#00f2ff]/20 text-center">
              <div className="text-2xl mb-1">🧬</div>
              <div className="text-xs text-[#00f2ff]">{t("biometric.science.card1.title")}</div>
              <div className="text-xs text-gray-400 mt-1">{t("biometric.science.card1.subtitle")}</div>
            </div>
            <div className="p-3 bg-black/40 rounded-lg border border-[#ffd700]/20 text-center">
              <div className="text-2xl mb-1">💧</div>
              <div className="text-xs text-[#ffd700]">{t("biometric.science.card2.title")}</div>
              <div className="text-xs text-gray-400 mt-1">{t("biometric.science.card2.subtitle")}</div>
            </div>
            <div className="p-3 bg-black/40 rounded-lg border border-[#00f2ff]/20 text-center">
              <div className="text-2xl mb-1">⚡</div>
              <div className="text-xs text-[#00f2ff]">{t("biometric.science.card3.title")}</div>
              <div className="text-xs text-gray-400 mt-1">{t("biometric.science.card3.subtitle")}</div>
            </div>
          </div>

          <p className="text-center text-[#ffd700] font-bold pt-4 border-t border-[#ffd700]/20">
            {t("header.truth")} {t("header.matrix")} {t("header.wavefunction")}
          </p>
        </div>
      </CardContent>

      {/* CSS for wave animation */}
      <style>{`
        @keyframes wave {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 60; }
        }
      `}</style>
    </Card>
  );
};
