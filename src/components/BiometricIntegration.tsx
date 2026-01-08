import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Heart, Calendar, Play, Pause, RotateCcw, Waves, Zap, Sparkles } from "lucide-react";
import { ToneGenerator } from "@/components/ToneGenerator";
import { CircularTimer } from "@/components/CircularTimer";

type SyncStatus = {
  label: string;
  text: string;
  type: "high" | "low" | "optimal";
} | null;

type CoherenceState = "ideal" | "chaos" | "transitional" | null;

const getSyncStatus = (bpm: number): SyncStatus => {
  if (bpm > 88) {
    return {
      label: "STATUS: MODULACJA HARMONIZUJĄCA (e)",
      text: "Twoje tętno wskazuje na wysoką dynamikę pola. System aktywuje algorytm wygładzający oparty na stałej e, aby przywrócić homeostazę wzdłuż 18 bram DNA.",
      type: "high",
    };
  } else if (bpm < 66) {
    return {
      label: "STATUS: GŁĘBOKA KOHERENCJA (GATCA-0)",
      text: "Osiągnięto stan stabilności bazowej. Twoja funkcja falowa rezonuje bezpośrednio z punktem inicjacji mitochondrialnej. Maksymalna podatność na zapis rCRS.",
      type: "low",
    };
  } else {
    return {
      label: "STATUS: REZONANS TOROIDALNY (π)",
      text: "Optymalny przepływ energii. Twoje serce idealnie cyrkuluje informację między bazą 7.83 Hz a rezonansem 718 Hz. Pełna synchronizacja z geometrią złotej proporcji.",
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

  // Ritual timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
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
          Integracja Biometryczna Ψ
        </CardTitle>
        <p className="text-center text-muted-foreground text-sm mt-2">
          System łączy Twoją stałą (data urodzenia) ze zmienną (tętno), aby pokazać drogę powrotną do harmonii.
        </p>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Input Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-[#ffd700] flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              DATA URODZENIA (Twoja stała):
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
              AKTUALNE BPM (Twoja zmienna):
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
          AKTYWUJ DOSTROJENIE
        </Button>

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
              Prędkość fali: {waveSpeed.toFixed(1)}x
            </div>
            <div className="absolute bottom-2 right-2 text-xs text-[#ffd700]/70">
              {coherenceState === 'ideal' ? '🌟 Koherencja' : coherenceState === 'chaos' ? '⚡ Aktywacja' : '🌊 Tranzycja'}
            </div>
          </div>
        )}

        {/* Sync Status Message */}
        {syncStatus && (
          <div className="p-4 bg-black/50 rounded-lg border-l-4 border-[#ffd700] animate-fade-in">
            <div className="text-[#ffd700] font-bold text-sm">{syncStatus.label}</div>
            <div className="text-white text-sm mt-2">{syncStatus.text}</div>
          </div>
        )}

        {/* Synchronization Bar */}
        {syncPercentage !== null && (
          <div className="space-y-3 p-4 bg-black/40 rounded-lg border border-[#00f2ff]/20">
            <div className="flex justify-between items-center">
              <span className="text-[#00f2ff] text-sm font-semibold">PASEK SYNCHRONIZACJI</span>
              <span className="text-[#ffd700] font-bold text-lg">{syncPercentage}%</span>
            </div>
            <Progress 
              value={syncPercentage} 
              className="h-4 bg-black/60"
            />
            <p className="text-xs text-gray-400 text-center">
              Wskaźnik pokazuje, na ile Twoje ciało "nadaje" na tej samej fali co 718 Hz
            </p>
            
            {/* Coherence State Message */}
            <div className={`mt-3 p-3 rounded-lg text-center ${
              coherenceState === 'ideal' 
                ? 'bg-[#ffd700]/10 border border-[#ffd700]/30' 
                : coherenceState === 'chaos'
                ? 'bg-red-500/10 border border-red-500/30'
                : 'bg-[#00f2ff]/10 border border-[#00f2ff]/30'
            }`}>
              {coherenceState === 'ideal' && (
                <p className="text-[#ffd700] text-sm">
                  <Sparkles className="w-4 h-4 inline mr-2" />
                  Twoje pole jest w pełnej koherencji. Twoje DNA regeneruje się w rytmie 718/144.
                </p>
              )}
              {coherenceState === 'chaos' && (
                <p className="text-red-400 text-sm">
                  <Zap className="w-4 h-4 inline mr-2" />
                  Wykryto szum entropowy. Twoja funkcja falowa jest rozproszona. Użyj dźwięku, aby przywrócić porządek.
                </p>
              )}
              {coherenceState === 'transitional' && (
                <p className="text-[#00f2ff] text-sm">
                  <Waves className="w-4 h-4 inline mr-2" />
                  Stan przejściowy. System kalibruje parametry dla optymalnej synchronizacji.
                </p>
              )}
            </div>

            {personalVibration !== null && (
              <div className="text-center text-xs text-gray-400 mt-2">
                Twoja wibracja osobista: <span className="text-[#ffd700] font-bold">{personalVibration}</span> | 
                Idealne BPM: <span className="text-[#00f2ff] font-bold">{Math.round(60 + (personalVibration / 9) * 20)}</span>
              </div>
            )}
          </div>
        )}

        {/* Source Protocol Section */}
        {syncPercentage !== null && (
          <div className="p-5 bg-gradient-to-b from-[#1a1a3e] to-black/60 rounded-lg border border-[#ffd700]/30 space-y-6">
            <h3 className="text-[#ffd700] font-bold text-center text-lg uppercase tracking-wider">
              ✦ PROTOKÓŁ ŹRÓDŁA ✦
              <span className="block text-sm font-normal text-gray-400 mt-1">Powrót do Boskiego Potencjału (Ψ)</span>
            </h3>
            
            {/* Ritual Phases */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-black/40 rounded-lg border border-[#00f2ff]/30 text-center">
                <div className="text-2xl mb-2">🔍</div>
                <div className="text-[#00f2ff] font-bold text-sm">DIAGNOZA</div>
                <div className="text-xl font-mono text-white">60s</div>
                <div className="text-xs text-gray-400 mt-1">Ustalasz punkt wyjścia. Gdzie jesteś teraz?</div>
              </div>
              <div className="p-3 bg-black/40 rounded-lg border border-[#ffd700]/30 text-center">
                <div className="text-2xl mb-2">🕯️</div>
                <div className="text-[#ffd700] font-bold text-sm">SESJA</div>
                <div className="text-xl font-mono text-white">108s</div>
                <div className="text-xs text-gray-400 mt-1">Czas świętej geometrii. Łączysz puls z Matrycą.</div>
              </div>
              <div className="p-3 bg-black/40 rounded-lg border border-purple-500/30 text-center">
                <div className="text-2xl mb-2">💎</div>
                <div className="text-purple-400 font-bold text-sm">STABILIZACJA</div>
                <div className="text-xl font-mono text-white">3 min</div>
                <div className="text-xs text-gray-400 mt-1">Zapisujesz informację w wodzie i komórkach.</div>
              </div>
            </div>

            {/* Circular Timer Display */}
            <div className="flex flex-col items-center py-6 bg-black/50 rounded-lg border border-[#ffd700]/20">
              <div className="text-xs text-gray-400 mb-4">🕯️ RYTUAŁ 108 SEKUND</div>
              
              <CircularTimer
                totalSeconds={108}
                remainingSeconds={ritualTime}
                isActive={isRitualActive}
                isComplete={ritualComplete}
                size={220}
              />
              
              {ritualComplete && (
                <p className="text-[#ffd700] text-sm mt-4 animate-fade-in text-center">
                  ✨ Rytuał zakończony. Twoja woda i komórki zostały zaprogramowane.
                </p>
              )}
            </div>
            
            {/* 718 Hz Tone Generator */}
            <div className="space-y-2">
              <div className="text-center text-xs text-gray-400">🎵 CZĘSTOTLIWOŚĆ DOSTROJENIA</div>
              <ToneGenerator
                frequency={718}
                isPlaying={isTonePlaying}
                onPlayingChange={setIsTonePlaying}
                showControls={true}
              />
            </div>

            {/* Timer Controls */}
            <div className="flex justify-center gap-3">
              {!isRitualActive && ritualTime === 108 && (
                <Button
                  onClick={startRitual}
                  className="bg-[#ffd700] hover:bg-[#ffed4a] text-black font-bold"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Rozpocznij Rytuał
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
                    {isRitualActive ? 'Pauza' : 'Kontynuuj'}
                  </Button>
                  <Button
                    onClick={resetRitual}
                    variant="outline"
                    className="border-gray-500 text-gray-400 hover:bg-gray-500/20"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </>
              )}
              {ritualComplete && (
                <Button
                  onClick={resetRitual}
                  className="bg-[#00f2ff] hover:bg-[#00d4e0] text-black font-bold"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Rozpocznij Ponownie
                </Button>
              )}
            </div>

            {/* Benefits Section */}
            <div className="mt-4 p-4 bg-gradient-to-r from-[#ffd700]/10 to-purple-500/10 rounded-lg border border-[#ffd700]/20">
              <h4 className="text-[#ffd700] font-bold text-center mb-3 text-sm uppercase tracking-wider">
                ✦ Co to daje? Wyjście poza biologię ✦
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <span className="text-[#00f2ff] font-bold shrink-0">⚡</span>
                  <div>
                    <span className="text-[#00f2ff] font-semibold">DOSTROJENIE DO ŹRÓDŁA:</span>
                    <span className="text-gray-300"> Przestajesz walczyć z życiem. Zaczynasz płynąć w nurcie kreacji. Rozwiązania przychodzą same (synchroniczność).</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-[#ffd700] font-bold shrink-0">✨</span>
                  <div>
                    <span className="text-[#ffd700] font-semibold">MOC KREACJI:</span>
                    <span className="text-gray-300"> Jezus powiedział: „Będziecie czynić rzeczy większe". Osiągnięcie stanu 718 Hz to zdjęcie blokady z Twojej woli. Twoje słowa i myśli zaczynają mieć realną moc sprawczą.</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-purple-400 font-bold shrink-0">💜</span>
                  <div>
                    <span className="text-purple-400 font-semibold">KONIEC ILUZJI ODDZIELENIA:</span>
                    <span className="text-gray-300"> Czujesz, że nie jesteś sam. Jesteś częścią inteligentnego Pola, które Cię wspiera i chroni.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 18 DNA Gates */}
            <div className="mt-4 space-y-4">
              <h4 className="text-[#ffd700] font-bold text-center text-sm uppercase tracking-wider">
                🧬 18 BRAM DNA – Klucze do Cudów 🧬
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Gates 1-6 */}
                <div className="p-3 bg-black/40 rounded-lg border border-green-500/30">
                  <div className="text-green-400 font-bold text-sm mb-2 text-center">BRAMY 1-6</div>
                  <div className="text-xs text-green-400/80 text-center mb-2">REGENERACJA ŚWIĄTYNI</div>
                  <p className="text-xs text-gray-400 text-center italic">
                    „Twoje ciało to Świątynia. Bramy te usuwają skazę chaosu, przywracając pierwotną czystość biologii."
                  </p>
                </div>

                {/* Gates 7-12 */}
                <div className="p-3 bg-black/40 rounded-lg border border-[#00f2ff]/30">
                  <div className="text-[#00f2ff] font-bold text-sm mb-2 text-center">BRAMY 7-12</div>
                  <div className="text-xs text-[#00f2ff]/80 text-center mb-2">OTWARCIE WZROKU</div>
                  <p className="text-xs text-gray-400 text-center italic">
                    „Brama 9: Widzenie poza materią. Zaczynasz dostrzegać okazje i powiązania, których inni nie widzą."
                  </p>
                </div>

                {/* Gates 13-18 */}
                <div className="p-3 bg-black/40 rounded-lg border border-[#ffd700]/30">
                  <div className="text-[#ffd700] font-bold text-sm mb-2 text-center">BRAMY 13-18</div>
                  <div className="text-xs text-[#ffd700]/80 text-center mb-2">JEDNOŚĆ ZE ŹRÓDŁEM</div>
                  <p className="text-xs text-gray-400 text-center italic">
                    „Brama 17: Stan Cudotwórczy. Moment, w którym Twoje pole Ψ jest tak silne, że wpływasz na materię i ludzi wokół Ciebie."
                  </p>
                </div>
              </div>
            </div>

            {/* Ritual Instructions */}
            <div className="mt-4 space-y-3 text-sm">
              <h4 className="text-gray-400 text-center text-xs uppercase tracking-wider mb-3">Instrukcja Rytuału</h4>
              <div className={`flex gap-3 p-2 rounded ${syncPercentage !== null ? 'bg-green-500/10 border-l-2 border-green-500' : 'opacity-50'}`}>
                <span className="text-[#ffd700] font-bold">KROK 1:</span>
                <span className="text-gray-300">Wpisz tętno i datę, by zobaczyć swoją energię. ✓</span>
              </div>
              <div className={`flex gap-3 p-2 rounded ${syncPercentage !== null ? 'bg-green-500/10 border-l-2 border-green-500' : 'opacity-50'}`}>
                <span className="text-[#ffd700] font-bold">KROK 2:</span>
                <span className="text-gray-300">Spójrz na wygenerowany obraz – to Twój stan kwantowy. ✓</span>
              </div>
              <div className={`flex gap-3 p-2 rounded ${isRitualActive || ritualComplete ? 'bg-[#00f2ff]/10 border-l-2 border-[#00f2ff]' : 'opacity-70'}`}>
                <span className="text-[#ffd700] font-bold">KROK 3:</span>
                <span className="text-gray-300">Przez 108 sekund słuchaj częstotliwości, programując wodę i komórki na powrót do Matrycy Źródłowej.</span>
              </div>
            </div>

            {/* Seeker's Suggestion */}
            <div className="mt-4 p-4 bg-gradient-to-b from-purple-900/30 to-black/40 rounded-lg border border-purple-500/30">
              <p className="text-sm text-gray-300 italic text-center leading-relaxed">
                Nie szukaj cudów na zewnątrz. One są wynikiem Twojego porządku wewnętrznego. 
                Kiedy Twój wykres staje się stabilny i złoty, oznacza to, że Twoja „antena" jest ustawiona na Głos Źródła. 
                Wtedy to, co inni nazywają cudem, dla Ciebie staje się codziennością.
              </p>
              <p className="text-[#ffd700] font-bold text-center mt-3 text-sm">
                „Uwierz, a ujrzysz. Dostrój się, a poczujesz."
              </p>
            </div>
          </div>
        )}

        {/* MANIFEST JEDNOŚCI */}
        <div className="pt-6 border-t border-[#ffd700]/30 space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-[#ffd700] via-purple-400 to-[#00f2ff] bg-clip-text text-transparent uppercase tracking-widest">
              ✦ MANIFEST JEDNOŚCI ✦
            </h3>
            <p className="text-lg text-[#ffd700]">NAUKA + BÓG = RZECZYWISTOŚĆ</p>
            <p className="text-xs text-gray-500 italic">By: Grzegorz</p>
          </div>

          {/* 1. Jeden język, dwie dialekty */}
          <div className="p-4 bg-gradient-to-r from-purple-900/30 to-[#00f2ff]/10 rounded-lg border border-purple-500/30">
            <h4 className="text-purple-400 font-bold mb-3 flex items-center gap-2">
              <span className="text-xl">1.</span> JEDEN JĘZYK, DWIE DIALEKTY
            </h4>
            <div className="space-y-2 text-sm">
              <p className="text-gray-300"><span className="text-[#00f2ff] font-semibold">Matematyka</span> to słownictwo Boga.</p>
              <p className="text-gray-300"><span className="text-[#ffd700] font-semibold">Fizyka</span> to Jego gramatyka.</p>
              <p className="text-gray-300"><span className="text-green-400 font-semibold">Biologia</span> to Jego poezja.</p>
              <p className="text-gray-300"><span className="text-purple-400 font-semibold">Świadomość</span> to Jego głos.</p>
            </div>
          </div>

          {/* 2. Mostek Kwantowy */}
          <div className="p-4 bg-gradient-to-r from-[#00f2ff]/10 to-[#ffd700]/10 rounded-lg border border-[#00f2ff]/30">
            <h4 className="text-[#00f2ff] font-bold mb-3 flex items-center gap-2">
              <span className="text-xl">2.</span> MOSTEK KWANTOWY
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex gap-2">
                <span className="text-[#ffd700] font-bold shrink-0">💡</span>
                <p className="text-gray-300"><span className="text-[#ffd700]">"Niech stanie się światłość"</span> = Wielki Wybuch i inicjacja fotonów.</p>
              </div>
              <div className="flex gap-2">
                <span className="text-[#00f2ff] font-bold shrink-0">🧬</span>
                <p className="text-gray-300"><span className="text-[#00f2ff]">"Obraz i podobieństwo"</span> = Złoty Podział (φ) w Twoim DNA.</p>
              </div>
              <div className="flex gap-2">
                <span className="text-purple-400 font-bold shrink-0">✨</span>
                <p className="text-gray-300"><span className="text-purple-400">"Cuda"</span> = Dostęp do głębszych praw fizyki, których jeszcze nie nazwaliśmy.</p>
              </div>
            </div>
          </div>

          {/* 3. Twoja rola w systemie */}
          <div className="p-4 bg-gradient-to-r from-[#ffd700]/10 to-purple-900/30 rounded-lg border border-[#ffd700]/30">
            <h4 className="text-[#ffd700] font-bold mb-3 flex items-center gap-2">
              <span className="text-xl">3.</span> TWOJA ROLA W SYSTEMIE
            </h4>
            <p className="text-sm text-gray-300 leading-relaxed">
              Nie jesteś tylko biologiczną maszyną. Jesteś <span className="text-[#00f2ff] font-semibold">obserwatorem</span>, 
              który poprzez swoją wiarę i częstotliwość (<span className="text-[#ffd700] font-bold">718 Hz</span>) 
              wybiera rzeczywistość z nieskończonego pola potencjału.
            </p>
          </div>

          {/* 4. Wniosek końcowy */}
          <div className="p-5 bg-gradient-to-b from-black/60 to-purple-900/40 rounded-lg border border-[#ffd700]/50">
            <h4 className="text-[#ffd700] font-bold mb-3 flex items-center gap-2">
              <span className="text-xl">4.</span> WNIOSEK KOŃCOWY
            </h4>
            <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
              <p>
                <span className="text-purple-400 font-semibold">Laboratorium</span> to Twoja katedra. 
                <span className="text-[#00f2ff] font-semibold"> Modlitwa</span> to Twój eksperyment. 
                Gdy Twoje tętno synchronizuje się z Matrycą, przestajesz tylko wierzyć – zaczynasz <span className="text-[#ffd700] font-bold">WIEDZIEĆ</span>.
              </p>
            </div>
            <blockquote className="mt-4 pt-4 border-t border-[#ffd700]/30 text-center">
              <p className="text-[#ffd700] italic text-lg font-semibold">
                "Tam, gdzie kończy się lęk przed nieznanym, zaczyna się matematyka cudów."
              </p>
            </blockquote>
          </div>
        </div>

        {/* SEKRET REZONANSU */}
        <div className="pt-6 border-t border-[#00f2ff]/30 space-y-5">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-[#00f2ff] via-[#ffd700] to-purple-400 bg-clip-text text-transparent uppercase tracking-widest">
              ✦ SEKRET REZONANSU ✦
            </h3>
            <p className="text-lg text-[#00f2ff]">DLACZEGO MODLITWA DZIAŁA?</p>
          </div>

          {/* 1. Wiara jako impuls kwantowy */}
          <div className="p-4 bg-gradient-to-r from-[#ffd700]/10 to-[#00f2ff]/10 rounded-lg border border-[#ffd700]/30">
            <h4 className="text-[#ffd700] font-bold mb-3 flex items-center gap-2">
              <span className="text-xl">1.</span> WIARA JAKO IMPULS KWANTOWY
            </h4>
            <p className="text-sm text-gray-300 leading-relaxed">
              Twoja wiara to nie tylko myśl – to <span className="text-[#ffd700] font-semibold">najsilniejszy znany we wszechświecie 
              generator fali spójnej</span>. Kiedy wierzysz bez wątpienia, Twoje serce 
              wysyła sygnał, który <span className="text-[#00f2ff]">"zagina"</span> prawdopodobieństwo rzeczywistości.
            </p>
          </div>

          {/* 2. Dostrojenie do Źródła */}
          <div className="p-4 bg-gradient-to-r from-[#00f2ff]/10 to-purple-900/30 rounded-lg border border-[#00f2ff]/30">
            <h4 className="text-[#00f2ff] font-bold mb-3 flex items-center gap-2">
              <span className="text-xl">2.</span> DOSTROJENIE DO ŹRÓDŁA
            </h4>
            <p className="text-sm text-gray-300 leading-relaxed">
              Modlitwa to proces synchronizacji Twojego tętna z Matrycą <span className="text-[#ffd700] font-bold">718 Hz</span>. 
              Gdy osiągasz ten stan (<span className="text-[#ffd700]">złoty wykres</span> na naszej stronie), Twoje 
              pole Ψ staje się <span className="text-[#00f2ff] font-semibold">"nadprzewodnikiem"</span> dla boskiej woli.
            </p>
          </div>

          {/* 3. Twoja wewnętrzna moc */}
          <div className="p-4 bg-gradient-to-r from-purple-900/30 to-[#ffd700]/10 rounded-lg border border-purple-500/30">
            <h4 className="text-purple-400 font-bold mb-3 flex items-center gap-2">
              <span className="text-xl">3.</span> TWOJA WEWNĘTRZNA MOC
            </h4>
            <p className="text-sm text-gray-300 leading-relaxed mb-3">
              Pamiętaj: Bóg nie działa <span className="text-gray-400">"zamiast"</span> Ciebie, ale <span className="text-[#ffd700] font-bold">"poprzez"</span> Ciebie. 
              To Twoja wewnętrzna moc, Twoja częstotliwość i Twoja wiara są 
              narzędziami, którymi kształtujesz świat.
            </p>
            <blockquote className="pt-3 border-t border-purple-500/30 text-center">
              <p className="text-purple-300 italic">
                "Królestwo Boże jest wewnątrz was"
              </p>
              <p className="text-xs text-gray-400 mt-2">
                – to znaczy, że masz w sobie <span className="text-[#ffd700]">generator cudów</span>. Musisz go tylko poprawnie nastroić.
              </p>
            </blockquote>
          </div>
        </div>

        {/* Scientific Explanation */}
        <div className="pt-4 border-t border-[#00f2ff]/20 space-y-4 text-sm text-gray-300">
          <h3 className="text-[#ffd700] font-semibold flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Twoje serce to oscylator kwantowy
          </h3>
          <p className="leading-relaxed">
            Używając tętna, znajdujemy Twoje osobiste <strong className="text-[#00f2ff]">'zero'</strong> w funkcji Zeta Riemanna. 
            To punkt, w którym znika stres, a zaczyna się życie. System porównuje Twoją stałą (datę urodzenia) 
            ze zmienną (tętno), aby sprawdzić, jak bardzo Twój obecny stres oddala Cię od Twojej idealnej matrycy energetycznej.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            <div className="p-3 bg-black/40 rounded-lg border border-[#00f2ff]/20 text-center">
              <div className="text-2xl mb-1">🧬</div>
              <div className="text-xs text-[#00f2ff]">Personalizacja DNA</div>
              <div className="text-xs text-gray-400 mt-1">Unikalny odcisk w Matrycy 718</div>
            </div>
            <div className="p-3 bg-black/40 rounded-lg border border-[#ffd700]/20 text-center">
              <div className="text-2xl mb-1">💧</div>
              <div className="text-xs text-[#ffd700]">Programowanie Wody</div>
              <div className="text-xs text-gray-400 mt-1">Geometria φ i rytm 7.83 Hz</div>
            </div>
            <div className="p-3 bg-black/40 rounded-lg border border-[#00f2ff]/20 text-center">
              <div className="text-2xl mb-1">⚡</div>
              <div className="text-xs text-[#00f2ff]">Koherencja Serca</div>
              <div className="text-xs text-gray-400 mt-1">Częstotliwość 718 Hz</div>
            </div>
          </div>

          <p className="text-center text-[#ffd700] font-bold pt-4 border-t border-[#ffd700]/20">
            PRAWDA JEST MATEMATYKĄ. MATEMATYKA JEST KWANTOWA. JESTEŚ FUNKCJĄ FALOWĄ.
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
