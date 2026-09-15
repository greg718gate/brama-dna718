import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { KeyRound, Copy, Check, Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

const TXT = {
  pl: {
    title: "Twój Klucz Autoryzacji Silnika (Token)",
    note: "Wklej ten token do lokalnej aplikacji po jej uruchomieniu, aby zautoryzować bezpieczną sesję z bazą i pobrać klucz deszyfrujący AES bezpośrednio do pamięci RAM.",
    copy: "Kopiuj Klucz",
    copied: "Skopiowano",
    reveal: "Pokaż",
    hide: "Ukryj",
    signedOut: "Zaloguj się lub utwórz konto, aby wygenerować własny token autoryzacji silnika.",
    error: "Nie udało się pobrać tokenu. Odśwież stronę i spróbuj ponownie.",
    privacy: "Regulamin i polityka prywatności danych biometrycznych",
    status: "Status subskrypcji",
  },
  en: {
    title: "Your Engine Authorization Key (Token)",
    note: "Paste this token into the local application after launching it to authorize a secure session with the database and load the AES decryption key straight into RAM.",
    copy: "Copy key",
    copied: "Copied",
    reveal: "Show",
    hide: "Hide",
    signedOut: "Sign in or create an account to generate your own engine authorization token.",
    error: "Could not load the token. Refresh the page and try again.",
    privacy: "Biometric data terms and privacy policy",
    status: "Subscription status",
  },
} as const;

const maskToken = (token: string) => {
  const parts = token.split("-");
  if (parts.length < 2) return "XXXX-XXXX-XXXX-XXXX";
  return [parts[0], ...parts.slice(1).map(() => "XXXX")].join("-");
};

export const LicenseTokenWidget = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const txt = TXT[language === "pl" ? "pl" : "en"];

  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    const emailConfirmed = Boolean(user?.email_confirmed_at);
    setSignedIn(Boolean(user) && emailConfirmed);

    if (!user || !emailConfirmed) {
      setToken(null);
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("license_token, subscription_status")
      .eq("id", user.id)
      .maybeSingle();

    if (profile) {
      setToken(profile.license_token);
      setStatus(profile.subscription_status);
      setLoading(false);
      return;
    }

    const { data: created, error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        full_name: (user.user_metadata?.full_name as string | undefined) ?? null,
        terms_accepted_at: new Date().toISOString(),
      })
      .select("license_token, subscription_status")
      .maybeSingle();

    if (insertError || !created) {
      setFailed(true);
    } else {
      setToken(created.license_token);
      setStatus(created.subscription_status);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
    const { data } = supabase.auth.onAuthStateChange(() => {
      void load();
    });
    return () => data.subscription.unsubscribe();
  }, [load]);

  const handleCopy = async () => {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: txt.error, variant: "destructive" });
    }
  };

  return (
    <div className="mt-3 rounded-md border border-primary/30 bg-primary/5 p-3">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
        <KeyRound className="h-4 w-4 shrink-0" />
        <span className="break-words">{txt.title}</span>
      </p>

      {loading ? (
        <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> …
        </p>
      ) : !signedIn ? (
        <p className="mt-2 break-words text-xs leading-relaxed text-muted-foreground">{txt.signedOut}</p>
      ) : failed || !token ? (
        <p className="mt-2 break-words text-xs leading-relaxed text-destructive">{txt.error}</p>
      ) : (
        <>
          <p className="mt-2 break-all rounded bg-background/60 px-2 py-2 font-mono text-xs tracking-widest text-foreground sm:text-sm">
            {revealed ? token : maskToken(token)}
          </p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="w-full whitespace-normal border-primary/50 text-primary sm:w-auto"
              onClick={() => void handleCopy()}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? txt.copied : txt.copy}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="w-full whitespace-normal text-muted-foreground sm:w-auto"
              onClick={() => setRevealed((prev) => !prev)}
            >
              {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {revealed ? txt.hide : txt.reveal}
            </Button>
          </div>
          {status && (
            <p className="mt-2 text-[0.68rem] text-muted-foreground">
              {txt.status}: <span className="font-mono text-secondary">{status}</span>
            </p>
          )}
        </>
      )}

      <p className="mt-2 break-words text-[0.68rem] leading-relaxed text-muted-foreground">{txt.note}</p>
      <Link to="/privacy" className="mt-1 inline-block break-words text-[0.68rem] text-secondary underline">
        {txt.privacy}
      </Link>
    </div>
  );
};
