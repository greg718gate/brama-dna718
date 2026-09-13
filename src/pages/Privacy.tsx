import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const T = {
  pl: {
    title: "✦ REGULAMIN I POLITYKA PRYWATNOŚCI PRZETWARZANIA DANYCH BIOMETRYCZNYCH Ψ ✦",
    subtitle: "Brama DNA 718 — SENTINEL-718 v3.0",
    back: "Powrót na stronę główną",
    updated: "Ostatnia aktualizacja: 13.09.2026",
    items: [
      {
        h: "1. Administrator Danych",
        p: "Brama DNA 718 (Grzegorz, Aberdeen). Kontakt: bramadna718@gmail.com.",
      },
      {
        h: "2. Charakter Przetwarzania",
        p: "System przetwarza odstępy między uderzeniami serca (RR-intervals) oraz tętno z pasa Polar H10.",
      },
      {
        h: "3. Cel Przetwarzania",
        p: "Wykorzystanie w czasie rzeczywistym do obliczania koherencji w pętli DPLL i modulacji audio.",
      },
      {
        h: "4. Przechowywanie Danych",
        p: "Platforma nie gromadzi surowego zapisu EKG. Zapisywane są wyłącznie końcowe wskaźniki statystyczne sesji w bazie danych platformy, w celu prezentacji wykresów postępów.",
      },
      {
        h: "5. Zrzeczenie się Odpowiedzialności Medycznej",
        p: "SENTINEL-718 nie jest wyrobem medycznym. Służy wyłącznie do celów edukacyjnych, biohackingu i redukcji szumu stresowego.",
      },
    ],
  },
  en: {
    title: "✦ TERMS AND PRIVACY POLICY FOR BIOMETRIC DATA PROCESSING Ψ ✦",
    subtitle: "Brama DNA 718 — SENTINEL-718 v3.0",
    back: "Back to the main page",
    updated: "Last updated: 13 Sep 2026",
    items: [
      {
        h: "1. Data Controller",
        p: "Brama DNA 718 (Grzegorz, Aberdeen). Contact: bramadna718@gmail.com.",
      },
      {
        h: "2. Nature of Processing",
        p: "The system processes inter-beat intervals (RR-intervals) and heart rate from the Polar H10 chest strap.",
      },
      {
        h: "3. Purpose of Processing",
        p: "Real-time use for coherence computation inside the DPLL loop and for audio modulation.",
      },
      {
        h: "4. Data Retention",
        p: "The platform does not collect raw ECG recordings. Only final statistical session indicators are stored in the platform database, for the purpose of displaying progress charts.",
      },
      {
        h: "5. Medical Disclaimer",
        p: "SENTINEL-718 is not a medical device. It serves educational, biohacking and stress-noise-reduction purposes only.",
      },
    ],
  },
} as const;

const Privacy = () => {
  const { language } = useLanguage();
  const copy = T[language === "pl" ? "pl" : "en"];

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <Button asChild variant="secondary" size="sm" className="gap-2">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            <span className="break-words">{copy.back}</span>
          </Link>
        </Button>

        <Card className="glass-panel border-secondary/30">
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2 text-secondary">
              <ShieldCheck className="h-5 w-5 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-widest">{copy.subtitle}</span>
            </div>
            <CardTitle className="break-words text-lg leading-snug text-foreground sm:text-2xl">
              {copy.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {copy.items.map((item) => (
              <section key={item.h} className="space-y-1">
                <h2 className="break-words text-sm font-semibold text-accent sm:text-base">{item.h}</h2>
                <p className="break-words text-sm leading-relaxed text-foreground/85">{item.p}</p>
              </section>
            ))}
            <p className="text-xs text-muted-foreground">{copy.updated}</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Privacy;
