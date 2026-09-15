import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ShieldCheck } from "lucide-react";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AuthDialog = ({ open, onOpenChange }: AuthDialogProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificationPending, setVerificationPending] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();
  const tr = (pl: string, en: string) => (language === "pl" ? pl : en);

  const authSchema = z.object({
    email: z.string().email(tr("Nieprawidłowy adres email", "Invalid email address")),
    password: z.string().min(6, tr("Hasło musi mieć minimum 6 znaków", "Password must be at least 6 characters")),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validated = authSchema.parse({ email, password });

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: validated.email,
          password: validated.password,
        });
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            throw new Error(tr("Nieprawidłowy email lub hasło", "Invalid email or password"));
          }
          throw error;
        }
        toast({ title: tr("Zalogowano pomyślnie", "Signed in successfully"), description: tr("Witaj z powrotem!", "Welcome back!") });
        onOpenChange(false);
      } else {
        if (!termsAccepted) {
          throw new Error(tr(
            "Zaakceptuj Regulamin i Politykę Prywatności danych biometrycznych, aby kontynuować.",
            "Accept the Terms and Privacy Policy for biometric data to continue.",
          ));
        }
        const { data, error } = await supabase.auth.signUp({
          email: validated.email,
          password: validated.password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (data.session) {
          await supabase.auth.signOut();
        }
        setVerificationPending(true);
        toast({
          title: tr("✦ Weryfikacja Matrycy ✦", "✦ Matrix Verification ✦"),
          description: tr(
            "Na Twój adres e-mail wysłaliśmy link aktywacyjny. Potwierdź go, aby wygenerować swój Token Autoryzacji Silnika.",
            "We sent an activation link to your email address. Confirm it to generate your Engine Authorization Token.",
          ),
        });
      }
    } catch (err) {
      toast({
        title: tr("Błąd", "Error"),
        description: err instanceof Error ? err.message : tr("Wystąpił nieznany błąd", "An unknown error occurred"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-sm border-border bg-background/95 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="text-primary">
            {isLogin ? tr("Logowanie Operatora", "Operator Sign In") : tr("Rejestracja Operatora", "Operator Registration")}
          </DialogTitle>
          <DialogDescription>
            {isLogin
              ? tr("Uzyskaj dostęp do panelu SENTINEL-718.", "Access the SENTINEL-718 panel.")
              : tr("Utwórz konto, aby zapisywać sesje i klucz autoryzacji.", "Create an account to save sessions and your authorization key.")}
          </DialogDescription>
        </DialogHeader>

        {verificationPending ? (
          <div className="rounded-md border border-premium/50 bg-premium/10 p-4 text-center" role="status">
            <p className="font-bold text-premium">{tr("✦ Weryfikacja Matrycy ✦", "✦ Matrix Verification ✦")}</p>
            <p className="mt-2 text-sm leading-relaxed text-foreground/85">
              {tr(
                "Na Twój adres e-mail wysłaliśmy link aktywacyjny. Potwierdź go, aby wygenerować swój Token Autoryzacji Silnika.",
                "We sent an activation link to your email address. Confirm it to generate your Engine Authorization Token.",
              )}
            </p>
          </div>
        ) : <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dialog-auth-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="dialog-auth-email"
                type="email"
                placeholder="operator@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dialog-auth-password">{tr("Hasło", "Password")}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="dialog-auth-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute right-1 top-1 h-8 w-8 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? tr("Ukryj hasło", "Hide password") : tr("Pokaż hasło", "Show password")}
                title={showPassword ? tr("Ukryj hasło", "Hide password") : tr("Pokaż hasło", "Show password")}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {!isLogin && (
            <div className="flex items-start gap-2">
              <Checkbox
                id="dialog-auth-terms"
                checked={termsAccepted}
                onCheckedChange={(c) => setTermsAccepted(c === true)}
              />
              <Label htmlFor="dialog-auth-terms" className="text-xs font-normal leading-snug text-muted-foreground">
                {tr("Akceptuję ", "I accept the ")}
                <Link to="/privacy" className="text-primary underline" onClick={() => onOpenChange(false)}>
                  {tr("Regulamin i Politykę Prywatności danych biometrycznych", "Terms and Privacy Policy for biometric data")}
                </Link>
                .
              </Label>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            <ShieldCheck className="h-4 w-4" />
            {loading
              ? tr("Przetwarzanie…", "Processing…")
              : isLogin
                ? tr("Zaloguj się", "Sign in")
                : tr("Zarejestruj się", "Create account")}
          </Button>
        </form>}

        {!verificationPending && <button
          type="button"
          onClick={() => setIsLogin((v) => !v)}
          className="w-full text-center text-xs text-muted-foreground underline-offset-2 hover:text-primary hover:underline"
        >
          {isLogin
            ? tr("Nie masz konta? Zarejestruj się", "No account? Register")
            : tr("Masz już konto? Zaloguj się", "Already have an account? Sign in")}
        </button>}
      </DialogContent>
    </Dialog>
  );
};
