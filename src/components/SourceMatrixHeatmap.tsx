import { useLanguage } from "@/contexts/LanguageContext";
import { GATCA_GATES, GATE_NAMES, SOURCE_MATRIX_WINDOW, type SourceMatrixMapping } from "@/lib/biblicalDecoder";

const SCRIPT_LABEL: Record<SourceMatrixMapping["script"], { pl: string; en: string }> = {
  hebrew: { pl: "hebrajski (oryginał)", en: "Hebrew (original)" },
  greek: { pl: "grecki (oryginał)", en: "Greek (original)" },
  mixed: { pl: "hebrajski + grecki", en: "Hebrew + Greek" },
  latin: { pl: "łaciński (transliteracja / tłumaczenie)", en: "Latin (transliteration / translation)" },
  none: { pl: "brak danych", en: "no data" },
};

export const SourceMatrixHeatmap = ({ data }: { data: SourceMatrixMapping }) => {
  const { language } = useLanguage();
  const pl = language === "pl";
  const tr = (p: string, e: string) => (pl ? p : e);

  const max = Math.max(...data.matrix.flat(), 1e-12);
  const dominantGatePos = GATCA_GATES[data.dominantGateIdx];

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <h3 className="font-mono text-sm text-primary break-words">
          {tr("Macierz znaków źródłowych 18×18 (gematria hebrajska)", "Source-script matrix 18×18 (Hebrew gematria)")}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed break-words">
          {tr(
            `Pierwsze ${SOURCE_MATRIX_WINDOW} znaków tekstu oryginalnego mapowanych jest bezpośrednio na rozkład macierzowy 18×18: wiersz = pozycja znaku modulo 18 (brama DNA), kolumna = klasa wartości gematrycznej, waga = wartość znaku z modulacją fazową φ. Alfabet łaciński służy wyłącznie jako awaryjny zapas, gdy oryginał jest niedostępny.`,
            `The first ${SOURCE_MATRIX_WINDOW} characters of the original text are mapped directly onto an 18×18 matrix distribution: row = character position modulo 18 (DNA gate), column = gematria value class, weight = character value with φ phase modulation. The Latin alphabet is only a fallback when the original is unavailable.`,
          )}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        <div>
          <span className="text-muted-foreground">{tr("Pismo", "Script")}: </span>
          <span className={data.usedOriginalScript ? "text-primary" : "text-amber-400"}>
            {pl ? SCRIPT_LABEL[data.script].pl : SCRIPT_LABEL[data.script].en}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">{tr("Znaki", "Chars")}: </span>
          <span className="text-primary">{data.recognized}/{data.charsAnalyzed}</span>
        </div>
        <div>
          <span className="text-muted-foreground">{tr("Entropia", "Entropy")}: </span>
          <span className="text-primary">{(data.normalizedEntropy * 100).toFixed(2)}%</span>
        </div>
        <div>
          <span className="text-muted-foreground">{tr("Ślad", "Trace")}: </span>
          <span className="text-primary">{data.trace.toFixed(4)}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-grid gap-[2px]" style={{ gridTemplateColumns: `repeat(18, minmax(12px, 1fr))` }}>
          {data.matrix.map((row, r) =>
            row.map((value, c) => {
              const intensity = value / max;
              return (
                <div
                  key={`${r}-${c}`}
                  title={`${tr("Brama", "Gate")} ${r + 1} × ${tr("klasa", "class")} ${c + 1} = ${(value * 100).toFixed(3)}%`}
                  className="aspect-square rounded-[2px] border border-border/40"
                  style={{
                    backgroundColor: `hsla(183, 100%, ${12 + intensity * 38}%, ${0.25 + intensity * 0.75})`,
                    boxShadow: intensity > 0.75 ? "0 0 6px hsla(51, 100%, 50%, 0.7)" : undefined,
                  }}
                />
              );
            }),
          )}
        </div>
      </div>

      <div className="text-xs font-mono text-muted-foreground break-words">
        {tr("Brama dominująca", "Dominant gate")}:{" "}
        <span className="text-primary">
          {data.dominantGateIdx + 1} — {GATE_NAMES[dominantGatePos] ?? `Gate-${data.dominantGateIdx + 1}`} ({tr("poz.", "pos.")} {dominantGatePos})
        </span>
        {" · "}
        {tr("komórka maks.", "peak cell")}:{" "}
        <span className="text-primary">
          [{data.dominantCell.row + 1}, {data.dominantCell.col + 1}] = {(data.dominantCell.value * 100).toFixed(3)}%
        </span>
      </div>

      <div className="flex flex-wrap gap-1">
        {data.gateWeights.map((w, i) => (
          <span key={i} className="text-[10px] font-mono rounded px-1.5 py-0.5 bg-primary/10 text-primary">
            {i + 1}: {(w * 100).toFixed(0)}%
          </span>
        ))}
      </div>
    </div>
  );
};

export default SourceMatrixHeatmap;
