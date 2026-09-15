import { useCallback, useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

type Row = {
  created_at: string;
  coherence: number | null;
  phase_error: number | null;
  mean_bpm: number | null;
  duration_seconds: number | null;
  breath_mode: string | null;
};

const TXT = {
  pl: {
    title: "Historia postępów koherencji Ψ",
    empty: "Brak zapisanych sesji. Po pierwszej sesji z pasem Polar H10 wykres pojawi się automatycznie.",
    signedOut: "Zaloguj się, aby zobaczyć historię swoich sesji.",
    error: "Nie udało się pobrać historii sesji.",
    coherence: "Koherencja",
    best: "Najlepsza sesja",
    avg: "Średnia",
    sessions: "Sesje",
    threshold: "Próg 94%",
    mode: "Tryb",
  },
  en: {
    title: "Coherence progress history Ψ",
    empty: "No stored sessions yet. The chart appears automatically after your first Polar H10 session.",
    signedOut: "Sign in to see your session history.",
    error: "Could not load the session history.",
    coherence: "Coherence",
    best: "Best session",
    avg: "Average",
    sessions: "Sessions",
    threshold: "94% threshold",
    mode: "Mode",
  },
} as const;

export const SessionHistoryChart = () => {
  const { language } = useLanguage();
  const txt = TXT[language === "pl" ? "pl" : "en"];

  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [failed, setFailed] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    const { data: userData } = await supabase.auth.getUser();
    setSignedIn(Boolean(userData.user));
    if (!userData.user) {
      setRows([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("sentinel_sessions")
      .select("created_at, coherence, phase_error, mean_bpm, duration_seconds, breath_mode")
      .order("created_at", { ascending: true })
      .limit(200);
    if (error) setFailed(true);
    setRows((data as Row[] | null) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
    const { data } = supabase.auth.onAuthStateChange(() => void load());
    const onSaved = () => void load();
    window.addEventListener("sentinel-session-saved", onSaved);
    return () => {
      data.subscription.unsubscribe();
      window.removeEventListener("sentinel-session-saved", onSaved);
    };
  }, [load]);


  const points = rows
    .filter((row) => row.coherence !== null && Number.isFinite(Number(row.coherence)))
    .map((row, index) => ({
      label: `${new Date(row.created_at).toLocaleDateString(language === "pl" ? "pl-PL" : "en-GB", {
        day: "2-digit",
        month: "2-digit",
      })} · ${index + 1}`,
      value: Number((Math.min(1, Math.max(0, Number(row.coherence))) * 100).toFixed(1)),
      mode: row.breath_mode ?? "—",
    }));

  const best = points.length ? Math.max(...points.map((p) => p.value)) : 0;
  const avg = points.length ? points.reduce((sum, p) => sum + p.value, 0) / points.length : 0;

  return (
    <div className="mt-3 rounded-md border border-secondary/30 bg-secondary/5 p-3">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-secondary">
        <Activity className="h-4 w-4 shrink-0" />
        <span className="break-words">{txt.title}</span>
      </p>

      {loading ? (
        <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> …
        </p>
      ) : !signedIn ? (
        <p className="mt-2 break-words text-xs leading-relaxed text-muted-foreground">{txt.signedOut}</p>
      ) : failed ? (
        <p className="mt-2 break-words text-xs leading-relaxed text-destructive">{txt.error}</p>
      ) : points.length === 0 ? (
        <p className="mt-2 break-words text-xs leading-relaxed text-muted-foreground">{txt.empty}</p>
      ) : (
        <>
          <div className="mt-2 grid grid-cols-3 gap-2 text-[0.68rem] text-muted-foreground">
            <p className="break-words">
              {txt.best}
              <span className="block font-mono text-sm text-secondary">{best.toFixed(1)}%</span>
            </p>
            <p className="break-words">
              {txt.avg}
              <span className="block font-mono text-sm text-foreground">{avg.toFixed(1)}%</span>
            </p>
            <p className="break-words">
              {txt.sessions}
              <span className="block font-mono text-sm text-foreground">{points.length}</span>
            </p>
          </div>
          <div className="mt-3 h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={points} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(value: number) => `${value}`}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(value: number, _name, item) => [
                    `${value}% · ${txt.mode}: ${String(item.payload?.mode ?? "—")}`,
                    txt.coherence,
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--secondary))"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-1 text-[0.68rem] text-muted-foreground">{txt.threshold}</p>
        </>
      )}
    </div>
  );
};
