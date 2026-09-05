import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Atom, Code2, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

interface QuantumTranslationCardProps {
  reference: string;
  text: string;
  gematriaTotal: number;
  gateName: string;
  gatePosition: number;
  coherence: number; // 0..1
}

interface QuantumTranslation {
  title: string;
  subtitle: string;
  scriptureQuote: string;
  pseudocode: string;
  bridge: string;
  sourceCode: { label: string; explanation: string }[];
  closing: string;
}

/** Deterministic fallback so the section always renders, even without AI. */
function fallbackTranslation(
  p: QuantumTranslationCardProps,
  pl: boolean,
): QuantumTranslation {
  const fnName = p.reference
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "") || "verse_event";

  const pseudocode = [
    `def ${fnName}():`,
    `    quantum_fluctuation = vacuum_energy.fluctuate()`,
    `    intention_field.activate(sigma=${p.gematriaTotal})`,
    `    gate = dna.open(position=${p.gatePosition})   # ${p.gateName}`,
    `    psi = wavefunction.collapse(coherence=${(p.coherence * 100).toFixed(1)})`,
    ``,
    `    # "${(p.text || p.reference).slice(0, 60)}"`,
    `    return particle_factory.create("photon", carrier=psi)`,
  ].join("\n");

  return pl
    ? {
        title: "TŁUMACZENIE KWANTOWE",
        subtitle: `${p.reference} spotyka fizykę kwantową`,
        scriptureQuote: p.text || p.reference,
        pseudocode,
        bridge:
          "Zapis i fizyka opisują tę samą sekwencję: informacja (intencja) poprzedza materię, a stan kwantowy zostaje zredukowany do zdarzenia obserwowalnego.",
        sourceCode: [
          {
            label: '„Bóg powiedział" = intencja / informacja',
            explanation:
              "Wypowiedziane słowo pełni rolę operatora informacji — nadaje polu warunek początkowy, zanim pojawi się cokolwiek materialnego.",
          },
          {
            label: '„Niech stanie się światłość" = pierwsza fluktuacja',
            explanation:
              "Zanim powstały atomy, planety czy komórki, musiało pojawić się spektrum elektromagnetyczne. Fotony — czyste światło — to pierwsze stabilne nośniki informacji w naszym wszechświecie.",
          },
          {
            label: `Brama ${p.gatePosition} (${p.gateName}) = kanał rezonansu`,
            explanation: `Suma gematryczna Σ=${p.gematriaTotal} wyznacza kanał sprzężenia, a koherencja ${(p.coherence * 100).toFixed(1)}% określa, jak stabilnie zapis utrzymuje strukturę.`,
          },
        ],
        closing:
          "Ten sam program, dwa języki: jeden używa języka archaicznego, drugi języka matematyki i kodu — particle_factory.create(\"photon\").",
      }
    : {
        title: "QUANTUM TRANSLATION",
        subtitle: `${p.reference} meets quantum physics`,
        scriptureQuote: p.text || p.reference,
        pseudocode,
        bridge:
          "Scripture and physics describe the same sequence: information (intention) precedes matter, and the quantum state is reduced to an observable event.",
        sourceCode: [
          {
            label: '"God said" = intention / information',
            explanation:
              "The spoken word acts as an information operator — it imposes an initial condition on the field before anything material exists.",
          },
          {
            label: '"Let there be light" = the first fluctuation',
            explanation:
              "Before atoms, planets or cells, the electromagnetic spectrum had to appear. Photons — pure light — are the first stable information carriers in our universe.",
          },
          {
            label: `Gate ${p.gatePosition} (${p.gateName}) = resonance channel`,
            explanation: `The gematria sum Σ=${p.gematriaTotal} selects the coupling channel, and coherence ${(p.coherence * 100).toFixed(1)}% describes how stably the text holds its structure.`,
          },
        ],
        closing:
          'The same program in two languages: one archaic, the other mathematical — particle_factory.create("photon").',
      };
}

export const QuantumTranslationCard = (props: QuantumTranslationCardProps) => {
  const { language } = useLanguage();
  const pl = language === "pl";
  const [data, setData] = useState<QuantumTranslation | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setData(null);
      try {
        const { data: res, error } = await supabase.functions.invoke("generate-interpretation", {
          body: {
            mode: "quantum_translation",
            reference: props.reference,
            text: props.text,
            lang: language,
            gematriaTotal: props.gematriaTotal,
            gateName: props.gateName,
            gatePosition: props.gatePosition,
            coherence: (props.coherence * 100).toFixed(1),
          },
        });
        if (cancelled) return;
        if (error) throw error;
        if (res && res.pseudocode && Array.isArray(res.sourceCode)) {
          setData(res as QuantumTranslation);
        } else {
          setData(fallbackTranslation(props, pl));
        }
      } catch (e) {
        console.warn("Quantum translation fallback:", e);
        if (!cancelled) setData(fallbackTranslation(props, pl));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.reference, props.text, props.gatePosition, language]);

  if (loading && !data) {
    return (
      <Card className="border-primary/30 bg-card/80">
        <CardContent className="py-10 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-7 h-7 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">
            {pl ? "Przygotowuję tłumaczenie kwantowe..." : "Preparing quantum translation..."}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card className="border-2 border-primary/40 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="text-base md:text-lg font-mono flex items-center gap-2 text-primary">
          <Atom className="w-5 h-5" />
          {data.title}
        </CardTitle>
        <CardDescription className="text-xs md:text-sm font-mono">{data.subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* SCRIPTURE */}
        <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
          <div className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
            {pl ? "Pismo" : "Scripture"}
          </div>
          <p className="text-sm md:text-base italic leading-relaxed break-words">
            &ldquo;{data.scriptureQuote}&rdquo;
          </p>
          <div className="mt-2 text-xs font-mono uppercase tracking-wider text-primary">
            {props.reference}
          </div>
        </div>

        {/* QUANTUM PHYSICS PSEUDOCODE */}
        <div className="rounded-lg border border-primary/30 bg-background/80 p-4 overflow-hidden">
          <div className="flex items-center gap-1.5 mb-2">
            <Code2 className="w-4 h-4 text-primary" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-primary">
              {pl ? "Fizyka kwantowa" : "Quantum physics"}
            </span>
          </div>
          <pre className="text-[11px] md:text-xs font-mono text-emerald-300/90 whitespace-pre-wrap break-words leading-relaxed">
            {data.pseudocode}
          </pre>
        </div>

        {/* BRIDGE */}
        <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
          <div className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
            {pl ? "Most" : "Bridge"}
          </div>
          <p className="text-sm leading-relaxed break-words">{data.bridge}</p>
        </div>

        {/* SOURCE CODE OF REALITY */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-primary">
              {pl ? "Kod źródłowy rzeczywistości" : "Source code of reality"}
            </span>
          </div>
          {data.sourceCode.map((item, i) => (
            <div key={i} className="rounded-lg border border-border/50 bg-card/60 p-3">
              <div className="text-sm font-semibold text-foreground break-words">{item.label}</div>
              <p className="mt-1 text-xs md:text-sm text-muted-foreground leading-relaxed break-words">
                {item.explanation}
              </p>
            </div>
          ))}
        </div>

        <p className="text-xs md:text-sm text-center font-mono text-primary/80 break-words">
          {data.closing}
        </p>
      </CardContent>
    </Card>
  );
};
