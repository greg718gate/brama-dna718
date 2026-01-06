import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dna, Star, Sparkles, Music, Gem, Calendar } from "lucide-react";

interface PersonalKey {
  name: string;
  icon: React.ReactNode;
  psiValue: number;
}

const keys: PersonalKey[] = [
  { name: "🧬 Aktywacja DNA", icon: <Dna className="w-5 h-5" />, psiValue: 0.588 },
  { name: "🌟 Połączenie z siecią", icon: <Star className="w-5 h-5" />, psiValue: 0.609 },
  { name: "✨ Pełne przejście", icon: <Sparkles className="w-5 h-5" />, psiValue: 0.613 },
  { name: "🎵 Harmonizacja", icon: <Music className="w-5 h-5" />, psiValue: 0.614 },
  { name: "💎 Kwintescencja", icon: <Gem className="w-5 h-5" />, psiValue: 0.627 },
];

const calculatePersonalKey = (birthDateStr: string): { key: PersonalKey; power: number } | null => {
  // Extract digits from date string
  const digits = birthDateStr.split('').filter(d => /\d/.test(d)).map(Number);
  
  if (digits.length === 0) return null;
  
  // Sum all digits
  let vBase = digits.reduce((sum, d) => sum + d, 0);
  
  // Reduce to single digit (1-9)
  while (vBase > 9) {
    vBase = String(vBase).split('').map(Number).reduce((sum, d) => sum + d, 0);
  }
  
  // Calculate target resonance based on v_base
  const targetResonance = 0.588 + (vBase / 9) * (0.627 - 0.588);
  
  // Find the closest key
  const bestMatch = keys.reduce((closest, current) => {
    return Math.abs(current.psiValue - targetResonance) < Math.abs(closest.psiValue - targetResonance)
      ? current
      : closest;
  });
  
  return { key: bestMatch, power: vBase };
};

export const PersonalKeyCalculator = () => {
  const [birthDate, setBirthDate] = useState("");
  const [result, setResult] = useState<{ key: PersonalKey; power: number } | null>(null);

  const handleCalculate = () => {
    if (!birthDate) return;
    const calculated = calculatePersonalKey(birthDate);
    setResult(calculated);
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-card/80 backdrop-blur-sm border-primary/30">
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Kalkulator Klucza Osobistego
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="birthDate">Data urodzenia</Label>
          <Input
            id="birthDate"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="bg-background/50"
          />
        </div>
        
        <Button 
          onClick={handleCalculate} 
          className="w-full"
          disabled={!birthDate}
        >
          Oblicz swoją bramę
        </Button>

        {result && (
          <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/30 text-center space-y-3 animate-fade-in">
            <p className="text-sm text-muted-foreground">Twoja osobista brama to:</p>
            <div className="flex items-center justify-center gap-2 text-xl font-bold text-primary">
              {result.key.icon}
              <span>{result.key.name}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Siła sygnatury: </span>
              <span className="font-semibold text-primary">{result.power}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              |Ψ| = {result.key.psiValue.toFixed(3)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
