import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import PrngPanel from "@/components/PrngPanel";

const PRNG_PASSWORD = "2912";

const Prng = () => {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState(false);

  const handleUnlock = () => {
    if (password === PRNG_PASSWORD) {
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-4 text-center">
          <Lock className="w-12 h-12 mx-auto text-muted-foreground" />
          <h1 className="text-xl font-mono font-bold text-foreground">Dostęp chroniony</h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUnlock();
            }}
            className="space-y-3"
          >
            <Input
              type="password"
              placeholder="Wprowadź hasło"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              className={`font-mono text-center ${error ? "border-destructive" : ""}`}
              autoFocus
            />
            {error && (
              <p className="text-sm text-destructive">Nieprawidłowe hasło</p>
            )}
            <Button type="submit" className="w-full">
              Odblokuj
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <PrngPanel />
    </div>
  );
};

export default Prng;
