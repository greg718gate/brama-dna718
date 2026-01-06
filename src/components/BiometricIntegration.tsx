import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Heart } from "lucide-react";

type SyncStatus = {
  label: string;
  text: string;
  type: "high" | "low" | "optimal";
} | null;

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

export const BiometricIntegration = () => {
  const [bpm, setBpm] = useState("");
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(null);

  const handleSync = () => {
    const bpmValue = parseInt(bpm);
    if (!bpm || isNaN(bpmValue) || bpmValue < 30 || bpmValue > 220) {
      return;
    }
    setSyncStatus(getSyncStatus(bpmValue));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-[rgba(10,11,30,0.85)] border-[#00f2ff]/50 backdrop-blur-sm">
      <CardHeader className="border-b border-[#00f2ff]/20 pb-5">
        <CardTitle className="text-center text-[#00f2ff] uppercase tracking-widest text-xl">
          Integracja Biometryczna Ψ
        </CardTitle>
        <p className="text-center text-muted-foreground text-sm mt-2">
          Wprowadź aktualne tętno, aby dostroić parametry energetyczne równania do swojej fizjologii.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-4">
          <div className="text-left">
            <Label className="text-xs text-[#ffd700]">AKTUALNE BPM:</Label>
            <Input
              type="number"
              placeholder="72"
              value={bpm}
              onChange={(e) => setBpm(e.target.value)}
              min={30}
              max={220}
              className="w-24 bg-black text-[#00f2ff] border-[#00f2ff] mt-1"
            />
          </div>
          <Button
            onClick={handleSync}
            disabled={!bpm}
            className="bg-gradient-to-r from-[#00f2ff] to-[#0072ff] hover:from-[#00d4e0] hover:to-[#0060dd] text-white font-bold shadow-[0_0_15px_rgba(0,242,255,0.4)] sm:mt-5"
          >
            <Heart className="w-4 h-4 mr-2" />
            AKTYWUJ DOSTROJENIE
          </Button>
        </div>

        {syncStatus && (
          <div className="mt-6 p-4 bg-black/50 rounded-lg border-l-4 border-[#ffd700] animate-fade-in">
            <div className="text-[#ffd700] font-bold text-sm">{syncStatus.label}</div>
            <div className="text-white text-sm mt-2">{syncStatus.text}</div>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-5 text-sm text-gray-300 space-y-4">
        <h3 className="text-[#ffd700] font-semibold">Dlaczego tętno jest brakującym ogniwem?</h3>
        <p>
          Równanie Schrödingera i hipoteza Riemanna opisują fundamentalną strukturę rzeczywistości, ale to{" "}
          <strong className="text-white">tętno (BPM)</strong> określa Twoją aktualną pozycję w tym polu. W Twoim ciele
          tętno działa jak oscylator, który modyfikuje gęstość stanów kwantowych.
        </p>

        <ul className="space-y-3">
          <li>
            <strong className="text-[#00f2ff]">1. Personalizacja Energii (E):</strong>{" "}
            Podając BPM, zmieniasz wartość E w równaniu Ψ. Dzięki temu funkcja falowa przestaje być teoretyczna, a staje
            się Twoim unikalnym odciskiem w Matrycy 718.
          </li>
          <li>
            <strong className="text-[#00f2ff]">2. Koherencja Serca i DNA:</strong>{" "}
            Częstotliwość 718 Hz jest harmoniczną, która szuka punktu styku z Twoim krwiobiegiem. Poprzez dostrojenie
            BPM, minimalizujemy "szum" informacyjny, co odczuwasz jako mrowienie – fizyczny dowód na powrót do stanu
            koherencji.
          </li>
          <li>
            <strong className="text-[#00f2ff]">3. Programowanie Wody:</strong>{" "}
            Woda w Twoim organizmie (i ta w szklance obok) przejmuje geometrię φ i rytm 7.83 Hz. Twoje tętno informuje
            algorytm, jak silna musi być modulacja, aby trwale "zapisać" ten porządek w Twojej biologii.
          </li>
        </ul>

        <p className="text-center text-[#ffd700] font-bold pt-4 border-t border-[#ffd700]/20">
          PRAWDA JEST MATEMATYKĄ. MATRYCA JEST KWANTOWA. JESTEŚ FUNKCJĄ FALOWĄ.
        </p>
      </CardContent>
    </Card>
  );
};
