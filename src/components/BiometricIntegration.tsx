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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Heart, Calendar, Play, Pause, RotateCcw, Waves, Zap, Sparkles, Activity, Check, Crown, Lock, Mail, User, Bluetooth, Monitor, ScanLine, Loader2, CreditCard, ChevronDown, Info, ShieldCheck, Eye, EyeOff, Github } from "lucide-react";
import { ToneGenerator } from "@/components/ToneGenerator";
import { CircularTimer } from "@/components/CircularTimer";
import { SentinelWebScanner } from "@/components/SentinelWebScanner";
import { AudioModeSelector, type AudioStreamMode } from "@/components/AudioModeSelector";
import { SessionHistoryChart } from "@/components/SessionHistoryChart";
import { Link } from "react-router-dom";
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

// Sprzedaż dostępu PRO wstrzymana do czasu ukończenia całości systemu.
// Ustaw na true, aby ponownie włączyć subskrypcję £19/mies.
const PRO_SALES_ENABLED = false;
const DEVELOPMENT_ADMIN_EMAIL = "grzegorzniepsuj47@gmail.com";

interface BiometricIntegrationProps {
  pricingRequest?: number;
}

export const BiometricIntegration = ({ pricingRequest = 0 }: BiometricIntegrationProps) => {
  const { t, language } = useLanguage();
  const isTestPhase = true; // test_phase — sprzedaż i aktywacja PRO wstrzymane
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
  const [showProPassword, setShowProPassword] = useState(false);
  const [proTermsAccepted, setProTermsAccepted] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [signedInEmail, setSignedInEmail] = useState<string | null>(null);
  const [engineReady, setEngineReady] = useState(false);
  const [isSpecOpen, setIsSpecOpen] = useState(false);
  const [audioMode, setAudioMode] = useState<AudioStreamMode>("static");
  const [scannerPhaseError, setScannerPhaseError] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const isDevelopmentAdmin = signedInEmail?.toLowerCase() === DEVELOPMENT_ADMIN_EMAIL;

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
    const { data, error } = await supabase.auth.signUp({
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

    if (data.session) {
      await supabase.auth.signOut();
    }

    setRegistrationComplete(true);
    toast({
      title: t("biometric.pro.registrationSuccess"),
      description: t("biometric.pro.registrationSuccessText"),
    });
  };

  const handlePromoCode = () => {
    const valid = promoCode.trim().toUpperCase() === "LAUNCH718";
    setPromoApplied(valid);
    toast({
      title: valid ? t("biometric.pro.promoApplied") : t("biometric.pro.promoInvalid"),
      variant: valid ? "default" : "destructive",
    });
  };

  const checkSubscription = useCallback(async () => {
    setIsCheckingSubscription(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const signedIn = Boolean(sessionData.session);
    setIsSignedIn(signedIn);
    setSignedInEmail(sessionData.session?.user.email ?? null);

    if (!signedIn) {
      setIsSubscribed(false);
      setIsCheckingSubscription(false);
      return false;
    }

    const sessionEmail = sessionData.session?.user.email?.toLowerCase() ?? "";
    if (sessionEmail === DEVELOPMENT_ADMIN_EMAIL) {
      setIsSubscribed(true);
      setIsCheckingSubscription(false);
      return true;
    }

    const { data, error } = await supabase.functions.invoke("check-sentinel-subscription", { body: {} });
    const subscribed = !error && data?.subscribed === true;
    setIsSubscribed(subscribed);
    setIsCheckingSubscription(false);
    return subscribed;
  }, []);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      setIsSignedIn(Boolean(data.user));
      setSignedInEmail(data.user?.email ?? null);
    });
    const { data } = supabase.auth.onAuthStateChange((_, session) => {
      setIsSignedIn(Boolean(session?.user));
      setSignedInEmail(session?.user.email ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const openProDashboard = async () => {
    setIsProModalOpen(true);
    await checkSubscription();
  };

  const handleStartScanner = async () => {
    if (PRO_SALES_ENABLED && !isDevelopmentAdmin) {
      const subscribed = await checkSubscription();
      if (!subscribed) {
        setIsPaymentModalOpen(true);
        return;
      }
    }
    setEngineReady(true);
  };

  const handleCheckout = async () => {
    if (!PRO_SALES_ENABLED) {
      toast({ title: t("biometric.pro.betaPaymentPaused") });
      return;
    }
    setIsStartingCheckout(true);
    const { data, error } = await supabase.functions.invoke("create-sentinel-checkout", { body: {} });
    setIsStartingCheckout(false);

    if (error || !data?.url) {
      toast({
        title: t("biometric.pro.paymentError"),
        description: t("biometric.pro.paymentErrorText"),
        variant: "destructive",
      });
      return;
    }
    window.location.assign(data.url);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("sentinel_checkout") === "success") {
      setIsProModalOpen(true);
      void checkSubscription();
    }
  }, [checkSubscription]);

  useEffect(() => {
    if (pricingRequest > 0) setIsPaymentModalOpen(true);
  }, [pricingRequest]);

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
        <section className="space-y-3 rounded-md border border-secondary/40 bg-secondary/5 p-4" aria-label="test_phase">
          <p className="flex items-center gap-2 text-sm font-bold text-secondary"><ShieldCheck className="h-4 w-4" />{t("biometric.testPhaseStatus")}</p>
          <p className="text-xs leading-relaxed text-foreground/85">{t("biometric.testPhaseDisclaimer")}</p>
          <p className="text-xs leading-relaxed text-muted-foreground">{t("biometric.semanticModelDisclaimer")}</p>
        </section>
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
              <Button
                type="button"
                variant="glow"
                className="w-full sm:w-auto"
                disabled={isTestPhase}
                aria-disabled={isTestPhase}
                title={language === "pl" ? "Faza testowa / W trakcie prac rozwojowych" : "Test phase / Under development"}
              >
                <Crown className="h-4 w-4" />
                {language === "pl"
                  ? "Faza testowa / W trakcie prac rozwojowych"
                  : "Test phase / Under development"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Dialog open={isProModalOpen} onOpenChange={setIsProModalOpen}>
          <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto border-secondary/40 bg-card p-0 shadow-[var(--glow-secondary)] sm:rounded-lg">
            <div className="border-b border-border bg-secondary/10 p-6 pr-12">
              <DialogHeader>
                <DialogTitle className="text-center text-2xl text-foreground sm:text-left">
                  {t("biometric.pro.dashboardTitle")}
                </DialogTitle>
                <DialogDescription className="text-center leading-relaxed sm:text-left">
                  {t("biometric.pro.dashboardDescription")}
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="space-y-6 p-5 sm:p-7">
              <ol className="grid gap-3 sm:grid-cols-3">
                {[
                  [Bluetooth, "biometric.pro.stepPolar"],
                  [Monitor, "biometric.pro.stepEngine"],
                  [ScanLine, "biometric.pro.stepStart"],
                ].map(([Icon, key], index) => (
                  <li key={key as string} className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-md border border-border bg-background/40 p-4 text-center">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-secondary/40 text-secondary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-xs font-bold text-accent">0{index + 1}</span>
                    <span className="text-sm leading-snug text-foreground/90">{t(key as string)}</span>
              </li>
            ))}
          </ol>

          <Collapsible open={isSpecOpen} onOpenChange={setIsSpecOpen} className="rounded-lg border border-secondary/20 bg-background/40">
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-secondary/5"
                aria-expanded={isSpecOpen}
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-foreground/90">
                  <Info className="h-4 w-4 text-secondary" />
                  {t("biometric.pro.specTitle")}
                </span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isSpecOpen ? "rotate-180" : ""}`} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pb-4">
              <div className="space-y-3 text-sm text-foreground/80">
                {[
                  ["biometric.pro.specWhatIsSystem", "biometric.pro.specWhatIsSystemText"],
                  ["biometric.pro.specMethod", "biometric.pro.specMethodText"],
                  ["biometric.pro.specGoal", "biometric.pro.specGoalText"],
                ].map(([labelKey, textKey]) => (
                  <div key={labelKey as string} className="rounded-md border-l-2 border-secondary/40 bg-secondary/5 p-3">
                    <p className="mb-1 font-medium text-secondary">{t(labelKey as string)}</p>
                    <p className="leading-relaxed">{t(textKey as string)}</p>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          <section className="rounded-lg border border-primary/30 bg-primary/5 p-4 sm:p-5" aria-labelledby="audio-architecture-title">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary" aria-hidden="true">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <div className="min-w-0 space-y-2">
                <h3 id="audio-architecture-title" className="break-words text-sm font-bold text-primary sm:text-base">
                  {t("biometric.pro.audioArchitectureTitle")}
                </h3>
                <p className="break-words text-xs leading-relaxed text-foreground/80 sm:text-sm">
                  {t("biometric.pro.audioArchitectureText")}
                </p>
                <p className="flex items-center gap-2 text-[0.68rem] text-secondary">
                  <Lock className="h-3.5 w-3.5 shrink-0" />
                  {t("biometric.pro.losslessLock")}
                </p>
              </div>
            </div>
          </section>

          <div data-audio-mode={audioMode}>
            <AudioModeSelector onModeChange={setAudioMode} currentPhaseError={scannerPhaseError} />
          </div>

          <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-accent"><Github className="h-4 w-4" />{t("biometric.pro.openSourceTitle")}</p>
            <p className="mt-2 text-sm leading-relaxed text-foreground/80">{t("biometric.pro.openSourceText")}</p>
            <a href="https://github.com/greg718gate/brama-dna718" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-secondary underline underline-offset-4">github.com/greg718gate/brama-dna718</a>
            <SessionHistoryChart />
            {!PRO_SALES_ENABLED && (
              <p className="mt-2 text-xs leading-relaxed text-secondary">
                {t("biometric.pro.betaOpen")}
              </p>
            )}
          </div>


          <Button
            type="button"
            variant={engineReady ? "secondary" : "glow"}
                size="xl"
                className={`min-h-20 w-full whitespace-normal px-5 text-center text-base font-bold sm:text-lg ${engineReady ? "" : "animate-pulse"}`}
                onClick={handleStartScanner}
                disabled={isCheckingSubscription || engineReady}
              >
                {isCheckingSubscription ? <Loader2 className="h-6 w-6 animate-spin" /> : engineReady ? <Check className="h-6 w-6" /> : <ScanLine className="h-6 w-6" />}
                {engineReady ? t("biometric.pro.engineReady") : t("biometric.pro.startScanner")}
              </Button>

              {engineReady && <SentinelWebScanner onPhaseErrorChange={setScannerPhaseError} />}

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground" role="status">
                <span className={`h-2 w-2 rounded-full ${isSubscribed || !PRO_SALES_ENABLED ? "bg-secondary" : "bg-accent"}`} />
                {!PRO_SALES_ENABLED
                  ? t("biometric.pro.betaAccess")
                  : isSubscribed
                    ? t("biometric.pro.accessActive")
                    : t("biometric.pro.accessCheck")}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
          <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] max-w-6xl overflow-y-auto border-premium/40 bg-card p-0 shadow-[var(--glow-premium)] sm:rounded-lg">
            <div className="border-b border-border bg-accent/10 p-6 pr-12">
              <DialogHeader>
                <div className="mb-2 flex items-center justify-center gap-2 text-accent sm:justify-start">
                  <Crown className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-widest">BRAMA DNA 718 PRO</span>
                </div>
                <DialogTitle className="text-center text-2xl text-foreground sm:text-left">{t("biometric.pro.modalTitle")}</DialogTitle>
                <DialogDescription className="text-center leading-relaxed sm:text-left">{t("biometric.pro.modalDescription")}</DialogDescription>
              </DialogHeader>
            </div>
            <div className="space-y-5 p-4 sm:p-6">
              <section className="rounded-md border border-secondary/35 bg-secondary/5 p-4 sm:p-5" aria-labelledby="pro-project-specification">
                <h3 id="pro-project-specification" className="text-center text-base font-bold text-secondary sm:text-left sm:text-lg">
                  {t("biometric.pro.projectSpecTitle")}
                </h3>
                <div className="mt-3 space-y-2 text-xs leading-relaxed text-foreground/85 sm:text-sm">
                  <p>{t("biometric.pro.projectSpecMatrix")}</p>
                  <p>{t("biometric.pro.projectSpecResearch")}</p>
                  <p>{t("biometric.pro.projectSpecPurpose")}</p>
                </div>
              </section>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { id: "monthly", name: t("biometric.pro.planMonth"), price: "£19", period: t("biometric.pro.planMonthPeriod"), detail: t("biometric.pro.planMonthDetail") },
                  { id: "quarterly", name: t("biometric.pro.planQuarter"), price: "£48", period: t("biometric.pro.planQuarterPeriod"), detail: t("biometric.pro.planQuarterDetail") },
                  { id: "halfYear", name: t("biometric.pro.planHalfYear"), price: "£84", period: t("biometric.pro.planHalfYearPeriod"), detail: t("biometric.pro.planHalfYearDetail") },
                  { id: "yearly", name: t("biometric.pro.planYear"), price: "£114", period: t("biometric.pro.planYearPeriod"), detail: t("biometric.pro.planYearDetail"), badge: t("biometric.pro.bestValue") },
                ].map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`relative min-h-44 rounded-md border p-4 text-left transition-colors ${selectedPlan === plan.id ? "border-premium bg-premium/10 shadow-[var(--glow-premium)]" : "border-border bg-background/40 hover:border-premium/50"}`}
                    aria-pressed={selectedPlan === plan.id}
                  >
                    {plan.badge && <span className="mb-3 inline-block rounded-sm bg-accent px-2 py-1 text-[0.65rem] font-bold text-accent-foreground">{plan.badge}</span>}
                    <span className="block text-sm font-bold text-foreground">{plan.name}</span>
                    <span className="mt-3 block text-3xl font-bold text-premium">{plan.price}</span>
                    <span className="block text-xs text-muted-foreground">{plan.period}</span>
                    <span className="mt-3 block text-xs font-medium text-secondary">{plan.detail}</span>
                  </button>
                ))}
              </div>
              <div className="rounded-md border border-border bg-background/40 p-3">
                <Label htmlFor="pro-promo" className="text-xs text-foreground">{t("biometric.pro.promoLabel")}</Label>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <Input
                    id="pro-promo"
                    value={promoCode}
                    onChange={(event) => { setPromoCode(event.target.value.slice(0, 24)); setPromoApplied(false); }}
                    placeholder="LAUNCH718"
                    className="uppercase"
                    maxLength={24}
                  />
                  <Button type="button" variant="outline" onClick={handlePromoCode}>{t("biometric.pro.applyPromo")}</Button>
                </div>
                <p className={`mt-2 text-xs ${promoApplied ? "text-secondary" : "text-muted-foreground"}`}>
                  {promoApplied ? t("biometric.pro.promoDiscount") : t("biometric.pro.promoNote")}
                </p>
              </div>
              <ul className="space-y-2 text-sm text-foreground/85">
                {["biometric.pro.benefitPolar", "biometric.pro.benefitCoherence", "biometric.pro.benefitDecoder"].map((key) => (
                  <li key={key} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-secondary" /><span>{t(key)}</span></li>
                ))}
              </ul>
              {isSignedIn || registrationComplete ? (
                <div className="space-y-3">
                  {isSignedIn && (
                    <p className="break-all rounded-md border border-secondary/30 bg-secondary/5 p-3 text-center text-xs text-secondary">
                      {isDevelopmentAdmin ? t("biometric.pro.adminAccess") : `${t("biometric.pro.signedInAs")}: ${signedInEmail ?? ""}`}
                    </p>
                  )}
                  {registrationComplete && <p className="rounded-md border border-premium/40 bg-premium/10 p-3 text-center text-sm leading-relaxed text-premium">{t("biometric.pro.registrationSuccessText")}</p>}
                  <Button type="button" variant={isDevelopmentAdmin ? "glow" : "outline"} className="w-full" onClick={isDevelopmentAdmin ? () => { setIsPaymentModalOpen(false); void openProDashboard(); } : handleCheckout} disabled={(!PRO_SALES_ENABLED && !isDevelopmentAdmin) || isStartingCheckout || registrationComplete}>
                    {isStartingCheckout ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                    {registrationComplete ? t("biometric.pro.confirmEmail") : isDevelopmentAdmin ? t("biometric.pro.activateAdminAccess") : t("biometric.pro.betaPaymentPaused")}
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
                      <Input id="pro-password" type={showProPassword ? "text" : "password"} value={proPassword} onChange={(event) => setProPassword(event.target.value)} className="pl-10 pr-10" minLength={6} maxLength={72} autoComplete="new-password" required />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowProPassword((visible) => !visible)}
                        className="absolute right-1 top-1 h-8 w-8 text-muted-foreground hover:text-foreground"
                        aria-label={showProPassword ? t("biometric.pro.hidePassword") : t("biometric.pro.showPassword")}
                        title={showProPassword ? t("biometric.pro.hidePassword") : t("biometric.pro.showPassword")}
                      >
                        {showProPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Checkbox id="pro-terms" checked={proTermsAccepted} onCheckedChange={(checked) => setProTermsAccepted(checked === true)} className="mt-0.5" required />
                    <Label htmlFor="pro-terms" className="cursor-pointer break-words text-xs font-normal leading-relaxed text-muted-foreground">
                      {t("biometric.pro.terms")}{" "}
                      <Link to="/privacy" target="_blank" className="text-secondary underline">
                        /privacy
                      </Link>
                    </Label>
                  </div>
                  <Button type="submit" variant="glow" className="w-full" disabled={isRegistering}>
                    <Crown className="h-4 w-4" />
                    {isRegistering ? t("biometric.pro.registering") : t("biometric.pro.register")}
                  </Button>
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
