import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Mail, Lock, User } from "lucide-react";
import { z } from "zod";
import { useLanguage } from "@/contexts/LanguageContext";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language, t } = useLanguage();
  const tr = (pl: string, en: string) => (language === "pl" ? pl : en);

  const authSchema = z.object({
    email: z.string().email(tr("Nieprawidłowy adres email", "Invalid email address")),
    password: z.string().min(6, tr("Hasło musi mieć minimum 6 znaków", "Password must be at least 6 characters")),
  });

  // Sprawdź czy użytkownik jest już zalogowany
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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

        toast({
          title: tr("Zalogowano pomyślnie", "Signed in successfully"),
          description: tr("Witaj z powrotem!", "Welcome back!"),
        });
      } else {
        const { error } = await supabase.auth.signUp({
          email: validated.email,
          password: validated.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) {
          if (error.message.includes("already registered")) {
            throw new Error(tr("Ten email jest już zarejestrowany", "This email is already registered"));
          }
          throw error;
        }

        toast({
          title: tr("Konto utworzone", "Account created"),
          description: tr("Możesz się teraz zalogować", "You can now sign in"),
        });
        setIsLogin(true);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: tr("Błąd walidacji", "Validation error"),
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else if (error instanceof Error) {
        toast({
          title: tr("Błąd", "Error"),
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute top-4 left-4">
        <Button
          onClick={() => navigate("/")}
          variant="secondary"
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('backToMain')}
        </Button>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <User className="w-6 h-6 text-primary" />
            {isLogin ? tr("Logowanie", "Sign in") : tr("Rejestracja", "Register")}
          </CardTitle>
          <CardDescription>
            {isLogin
              ? tr("Zaloguj się, aby dodawać komentarze", "Sign in to add comments")
              : tr("Utwórz konto, aby dołączyć do społeczności", "Create an account to join the community")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder={tr("Hasło (min. 6 znaków)", "Password (min. 6 characters)")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  minLength={6}
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? tr("Proszę czekać...", "Please wait...")
                : isLogin
                ? tr("Zaloguj się", "Sign in")
                : tr("Zarejestruj się", "Register")}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-primary hover:underline"
            >
              {isLogin
                ? tr("Nie masz konta? Zarejestruj się", "No account? Register")
                : tr("Masz już konto? Zaloguj się", "Already have an account? Sign in")}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
