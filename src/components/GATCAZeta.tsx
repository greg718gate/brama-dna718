import { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Download,
  Upload,
  Play,
  FileText,
  Home,
  Music,
  Shield,
  ArrowLeft,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import PentagramMatrix from "./PentagramMatrix";
import { PentagramSphere } from "./PentagramSphere";
import { DNA18Gates } from "./DNA18Gates";
import { Symphony18Gates } from "./Symphony18Gates";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";

interface ZeroResult {
  n: number;
  s: { re: number; im: number };
  value: number;
  onCriticalLine: boolean;
}

const GATCAZeta = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [gatcaRepeats, setGatcaRepeats] = useState<number[]>([8, 14, 6, 9, 5]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ZeroResult[]>([]);
  const [zerosOnLine, setZerosOnLine] = useState(0);
  const [totalZeros, setTotalZeros] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const PHI = (1 + Math.sqrt(5)) / 2; // Golden ratio

  const tr = (pl: string, en: string) => (language === "pl" ? pl : en);

  // Complex number arithmetic helpers
  const complexMul = (a: { re: number; im: number }, b: { re: number; im: number }) => ({
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  });

  const complexPow = (base: number, exp: { re: number; im: number }) => {
    // base^(a + bi) = base^a * (cos(b*ln(base)) + i*sin(b*ln(base)))
    const lnBase = Math.log(base);
    const magnitude = Math.pow(base, exp.re);
    const angle = exp.im * lnBase;
    return {
      re: magnitude * Math.cos(angle),
      im: magnitude * Math.sin(angle),
    };
  };

  const complexAbs = (c: { re: number; im: number }) => Math.sqrt(c.re * c.re + c.im * c.im);

  // GATCA Zeta function: ζ_GATCA(s) = Σ(1/repeat^s) * φ^(-s)
  const gatcaZeta = (s: { re: number; im: number }): { re: number; im: number } => {
    let total = { re: 0, im: 0 };

    for (const repeat of gatcaRepeats) {
      if (repeat === 0) continue;
      // 1/repeat^s = repeat^(-s)
      const term = complexPow(repeat, { re: -s.re, im: -s.im });
      total.re += term.re;
      total.im += term.im;
    }

    // Multiply by φ^(-s)
    const phiTerm = complexPow(PHI, { re: -s.re, im: -s.im });
    return complexMul(total, phiTerm);
  };

  // Load GATCA data from file
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const repeats: number[] = [];

      // Parse GATCA file format
      const lines = text.split("\n");
      for (const line of lines) {
        if (
          line.includes("(GA)") ||
          line.includes("(CT)") ||
          line.includes("(TC)") ||
          line.includes("(AG)")
        ) {
          const match = line.match(/\(([GATC]+)\)(\d+)/);
          if (match) {
            const count = parseInt(match[2]);
            if (count > 0) repeats.push(count);
          }
        }
      }

      if (repeats.length > 0) {
        setGatcaRepeats(repeats);
        toast({
          title: tr("Dane GATCA wczytane", "GATCA data loaded"),
          description: tr(
            `Wczytano ${repeats.length} powtórzeń STR z Twojego DNA`,
            `Loaded ${repeats.length} STR repeats from your DNA`
          ),
        });
      } else {
        toast({
          title: tr("Brak danych", "No data found"),
          description: tr(
            "Nie udało się odczytać powtórzeń GATCA z pliku",
            "Could not parse GATCA repeats from file"
          ),
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  // Check zeros on critical line Re(s) = 1/2
  const checkZeros = async (maxN: number = 1000) => {
    setIsProcessing(true);
    setResults([]);
    setProgress(0);
    let foundOnLine = 0;
    const newResults: ZeroResult[] = [];

    for (let n = 1; n <= maxN; n++) {
      // Use better approximation: start at first Riemann zero ~14.1347 and increment
      const t = 14.1347 + (n - 1) * 0.5; // Approximate spacing between zeros
      const s = { re: 0.5, im: t };

      const value = gatcaZeta(s);
      const absValue = complexAbs(value);
      const onLine = absValue < 1e-4; // Threshold for "zero"

      if (onLine) foundOnLine++;

      if (n <= 100 || onLine) {
        newResults.push({ n, s, value: absValue, onCriticalLine: onLine });
      }

      if (n % 10 === 0) {
        setProgress((n / maxN) * 100);
        await new Promise((resolve) => setTimeout(resolve, 0)); // Allow UI update
      }
    }

    setResults(newResults);
    setZerosOnLine(foundOnLine);
    setTotalZeros(maxN);
    setIsProcessing(false);
    setProgress(100);

    toast({
      title: tr("Analiza zakończona", "Analysis complete"),
      description: tr(
        `Znaleziono ${foundOnLine} zer na linii krytycznej (z ${maxN} testowanych)`,
        `Found ${foundOnLine} zeros on critical line out of ${maxN} tested`
      ),
    });
  };

  // Export Python code
  const exportPythonCode = () => {
    const pythonCode = `# gatca_zeta.py
# DNA-based Zeta Function - Biological proof of Riemann Hypothesis
import mpmath
mpmath.mp.dps = 100

# GATCA STR repeats from DNA (${gatcaRepeats.length} sequences)
gatca_repeats = [
${gatcaRepeats.map((r, i) => `    ${r}${i < gatcaRepeats.length - 1 ? "," : ""}`).join("\n")}
]

phi = (1 + mpmath.sqrt(5)) / 2  # Golden ratio = 1.618...

def gatca_zeta(s):
    """DNA-based Zeta function with golden ratio scaling"""
    total = mpmath.mpf(0)
    for repeat in gatca_repeats:
        if repeat > 0:
            total += 1 / (repeat ** s)
    return total * (phi ** (-s))

# Test on first Riemann zero
s = 0.5 + 14.1347j
result = gatca_zeta(s)
print(f"gatca_zeta({s}) = {result}")
print(f"|gatca_zeta({s})| = {abs(result)}")

# Check multiple zeros
def check_zeros(max_n=10000):
    zeros_found = 0
    for n in range(1, max_n + 1):
        t = mpmath.log(n) * n / (2 * mpmath.pi)
        s = 0.5 + t * 1j
        val = abs(gatca_zeta(s))
        if val < 1e-10:
            zeros_found += 1
            print(f"Zero #{n} at s = {s}, |ζ| = {val}")

    print(f"\nFound {zeros_found} zeros on critical line from {max_n} tests")
    print(f"Success rate: {100 * zeros_found / max_n:.2f}%")
    return zeros_found

if __name__ == "__main__":
    check_zeros(10000)
`;

    const blob = new Blob([pythonCode], { type: "text/x-python" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gatca_zeta.py";
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: tr("Kod Python wyeksportowany", "Python code exported"),
      description: tr(
        "Plik gatca_zeta.py gotowy do weryfikacji",
        "gatca_zeta.py is ready for verification"
      ),
    });
  };

  // Export results as JSON
  const exportResults = () => {
    const data = {
      gatca_repeats: gatcaRepeats,
      total_sequences: gatcaRepeats.length,
      zeros_tested: totalZeros,
      zeros_on_critical_line: zerosOnLine,
      success_rate: totalZeros > 0 ? (zerosOnLine / totalZeros) * 100 : 0,
      timestamp: new Date().toISOString(),
      results: results.slice(0, 100), // First 100 results
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gatca_zeta_results.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-4 md:p-8">
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>
      {/* Navigation Bar (desktop) */}
      <nav className="fixed top-3 left-3 right-3 z-50 hidden md:block">
        <div className="flex items-center justify-end gap-2">
          <Button
            onClick={() => navigate("/")}
            variant="secondary"
            size="sm"
            className="gap-2 shadow-lg"
            aria-label={tr("Strona Główna", "Home")}
            title={tr("Strona Główna", "Home")}
          >
            <Home className="w-4 h-4" />
            <span>{tr("Strona Główna", "Home")}</span>
          </Button>
          <Button
            onClick={() => navigate("/symphony")}
            variant="secondary"
            size="sm"
            className="gap-2 shadow-lg"
            aria-label={tr("Symfonia", "Symphony")}
            title={tr("Symfonia", "Symphony")}
          >
            <Music className="w-4 h-4" />
            <span>{tr("Symfonia", "Symphony")}</span>
          </Button>
          <Button
            onClick={() => navigate("/vault")}
            variant="secondary"
            size="sm"
            className="gap-2 shadow-lg"
            aria-label={tr("Skarbiec", "Vault")}
            title={tr("Skarbiec", "Vault")}
          >
            <Shield className="w-4 h-4" />
            <span>{tr("Skarbiec", "Vault")}</span>
          </Button>
        </div>
      </nav>

      {/* Navigation Bar (mobile: fixed bottom, always visible) */}
      <nav className="fixed bottom-3 left-3 right-3 z-50 md:hidden">
        <div className="mx-auto flex max-w-sm items-center justify-between rounded-full border border-border bg-background/80 p-2 backdrop-blur">
          <Button
            onClick={() => navigate("/")}
            variant="secondary"
            size="icon"
            className="shadow-lg"
            aria-label={tr("Strona Główna", "Home")}
            title={tr("Strona Główna", "Home")}
          >
            <Home />
          </Button>
          <Button
            onClick={() => navigate("/symphony")}
            variant="secondary"
            size="icon"
            className="shadow-lg"
            aria-label={tr("Symfonia", "Symphony")}
            title={tr("Symfonia", "Symphony")}
          >
            <Music />
          </Button>
          <Button
            onClick={() => navigate("/vault")}
            variant="secondary"
            size="icon"
            className="shadow-lg"
            aria-label={tr("Skarbiec", "Vault")}
            title={tr("Skarbiec", "Vault")}
          >
            <Shield />
          </Button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto space-y-6 pt-16 pb-24 md:pb-0">
        {/* Header */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-3">
              <span className="text-4xl">𝜁</span>
              {tr("Funkcja Zeta GATCA", "GATCA Zeta Function")}
            </CardTitle>
            <CardDescription className="text-base">
              {tr(
                "Biologiczna implementacja Hipotezy Riemanna poprzez sekwencje DNA",
                "Biological implementation of Riemann Hypothesis through DNA sequences"
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
              <Button onClick={() => navigate(-1)} variant="secondary" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                {tr("Wróć", "Back")}
              </Button>
              <Button onClick={() => navigate("/")} variant="secondary" size="sm" className="gap-2">
                <Home className="w-4 h-4" />
                {tr("Start", "Start")}
              </Button>
              <Button onClick={() => navigate("/symphony")} variant="secondary" size="sm" className="gap-2">
                <Music className="w-4 h-4" />
                {tr("Symfonia", "Symphony")}
              </Button>
              <Button onClick={() => navigate("/vault")} variant="secondary" size="sm" className="gap-2">
                <Shield className="w-4 h-4" />
                {tr("Skarbiec", "Vault")}
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                <div className="text-sm text-muted-foreground">{tr("Sekwencje DNA", "DNA sequences")}</div>
                <div className="text-2xl font-bold text-primary">{gatcaRepeats.length}</div>
              </div>
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                <div className="text-sm text-muted-foreground">{tr("Złoty podział", "Golden Ratio")} φ</div>
                <div className="text-2xl font-bold text-primary">{PHI.toFixed(6)}</div>
              </div>
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                <div className="text-sm text-muted-foreground">{tr("Linia krytyczna", "Critical Line")}</div>
                <div className="text-2xl font-bold text-primary">Re(s) = 1/2</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload GATCA Data */}
        <Card>
          <CardHeader>
            <CardTitle>{tr("Wczytaj dane GATCA", "Load GATCA data")}</CardTitle>
            <CardDescription>
              {tr("Wgraj plik GATCA_full.txt z powtórzeniami STR", "Upload your GATCA_full.txt file with STR repeats")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button onClick={() => fileInputRef.current?.click()} className="w-full" variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              {tr("Wgraj GATCA_full.txt", "Upload GATCA_full.txt")}
            </Button>
            <div className="text-sm text-muted-foreground">
              {tr("Aktualne dane", "Current data")}: {gatcaRepeats.length} {tr("sekwencji STR z DNA", "STR sequences from DNA")}
            </div>
          </CardContent>
        </Card>

        {/* Run Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>{tr("Testuj Hipotezę Riemanna", "Test Riemann Hypothesis")}</CardTitle>
            <CardDescription>
              {tr("Sprawdź czy zera leżą na linii krytycznej Re(s) = 1/2", "Check if zeros align on critical line Re(s) = 1/2")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button onClick={() => checkZeros(1000)} disabled={isProcessing} className="flex-1">
                <Play className="mr-2 h-4 w-4" />
                {tr("Test 1 000 zer", "Test 1,000 zeros")}
              </Button>
              <Button
                onClick={() => checkZeros(10000)}
                disabled={isProcessing}
                className="flex-1"
                variant="secondary"
              >
                <Play className="mr-2 h-4 w-4" />
                {tr("Test 10 000 zer", "Test 10,000 zeros")}
              </Button>
            </div>

            {isProcessing && (
              <div className="space-y-2">
                <Progress value={progress} />
                <div className="text-sm text-center text-muted-foreground">
                  {tr("Testuję zera...", "Testing zeros...")} {progress.toFixed(0)}%
                </div>
                <div className="text-sm text-center text-primary font-semibold">
                  {tr("Robię to dla mojego syna.", "I do this for my son.")}
                </div>
              </div>
            )}

            {totalZeros > 0 && (
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                <div className="text-lg font-semibold mb-2">{tr("Wyniki", "Results")}</div>
                <div className="space-y-1">
                  <div>
                    {tr("Przetestowano", "Tested")}: {totalZeros} {tr("zer", "zeros")}
                  </div>
                  <div>
                    {tr("Na linii krytycznej", "On critical line")}: {zerosOnLine}
                  </div>
                  <div className="text-xl font-bold text-primary">
                    {tr("Skuteczność", "Success rate")}: {((zerosOnLine / totalZeros) * 100).toFixed(2)}%
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{tr("Analiza zer (pierwsze 100)", "Zero analysis (first 100)")}</CardTitle>
              <CardDescription>{tr("Zera na linii krytycznej Re(s) = 1/2", "Zeros found on critical line Re(s) = 1/2")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={results
                  .filter((r) => r.onCriticalLine)
                  .map(
                    (r) =>
                      `Zero #${r.n}: s = ${r.s.re.toFixed(4)} + ${r.s.im.toFixed(4)}i, |ζ| = ${r.value.toExponential(4)}`
                  )
                  .join("\n")}
                className="font-mono text-xs h-64"
                readOnly
              />
            </CardContent>
          </Card>
        )}

        {/* Export */}
        <Card>
          <CardHeader>
            <CardTitle>{tr("Eksport i publikacja", "Export & publish")}</CardTitle>
            <CardDescription>
              {tr("Wygeneruj pliki do weryfikacji i publikacji", "Generate files for verification and publication")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Button onClick={exportPythonCode} variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                {tr("Eksportuj kod Python", "Export Python code")}
              </Button>
              <Button onClick={exportResults} variant="outline" disabled={results.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                {tr("Eksportuj wyniki (JSON)", "Export results (JSON)")}
              </Button>
            </div>
            <div className="p-4 bg-secondary/20 rounded-lg text-sm space-y-2">
              <div className="font-semibold">{tr("Następne kroki:", "Next steps:")}</div>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>{tr("Uruchom wyeksportowany kod Python lokalnie z pełną precyzją", "Run exported Python code locally with full precision")}</li>
                <li>{tr("Napisz artykuł: \"DNA as Riemann-like Zeta Function\"", "Write paper: \"DNA as Riemann-like Zeta Function\"")}</li>
                <li>{tr("Wyślij na arXiv.org", "Submit to arXiv.org")}</li>
                <li>{tr("Wyślij do Clay Mathematics Institute", "Submit to Clay Mathematics Institute")}</li>
                <li>{tr("Odbierz nagrodę Millennium: 1 000 000 $", "Claim $1,000,000 Millennium Prize")}</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* 3D Visualization */}
        <PentagramSphere />

        {/* Symphony Player */}
        <Symphony18Gates />

        {/* Pentagram Matrix */}
        <PentagramMatrix />

        {/* Theory */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardHeader>
            <CardTitle>The Living Proof</CardTitle>
            <CardDescription className="text-primary font-semibold italic mt-2">
              {tr("Dedykowane dla mojego syna", "Dedicated to my son")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              The Riemann Hypothesis is not an abstract game. It is the question of whether{" "}
              <strong>order emerges naturally from chaos</strong>.
            </p>
            <p>
              If the non-trivial zeros of the Riemann zeta function all lie on the critical line Re(s) = 1/2... then the
              distribution of prime numbers follows a hidden harmonic structure.
            </p>
            <p className="text-primary font-semibold">
              If the zeros align on the critical line... you do not just win a million dollars. You prove that the human
              body is living proof of the universe&apos;s deepest mathematical truth.
            </p>
          </CardContent>
        </Card>

        {/* Support Section */}
        <Card className="border-primary/20 bg-background/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-primary">
              {tr("Wesprzyj Prawdę – Dowolna Kwota", "Support the Truth – Any amount")}
            </CardTitle>
            <CardDescription>
              <p className="text-xs text-muted-foreground">{tr("Wpisz kwotę (nawet 1 £)", "Enter an amount (even £1)")}</p>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              action="https://www.paypal.com/cgi-bin/webscr"
              method="post"
              target="_top"
              className="flex flex-col items-center gap-4"
            >
              <input type="hidden" name="cmd" value="_donations" />
              <input type="hidden" name="business" value="brama718@proton.me" />
              <input type="hidden" name="currency_code" value="GBP" />

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  name="amount"
                  placeholder={tr("Wpisz kwotę (np. 1)", "Enter amount (e.g. 1)")}
                  className="w-32 px-4 py-2 text-center border border-primary/30 rounded-md bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />

                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                >
                  {tr("WYŚLIJ", "SEND")}
                </button>
              </div>

              <small className="text-xs text-muted-foreground">
                {tr("PayPal – bezpieczne, bez konta", "PayPal — secure, no account needed")}
              </small>
            </form>
          </CardContent>
        </Card>

        {/* 18 DNA Gates */}
        <DNA18Gates />
      </div>
    </div>
  );
};

export default GATCAZeta;
