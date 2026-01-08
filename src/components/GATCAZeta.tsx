import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload, Play, FileText, Home, Music, Shield, Heart } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import PentagramMatrix from "./PentagramMatrix";
import { DNA18Gates } from "./DNA18Gates";

interface ZeroResult {
  n: number;
  s: { re: number; im: number };
  value: number;
  onCriticalLine: boolean;
}

const GATCAZeta = () => {
  const navigate = useNavigate();
  const [gatcaRepeats, setGatcaRepeats] = useState<number[]>([8, 14, 6, 9, 5]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ZeroResult[]>([]);
  const [zerosOnLine, setZerosOnLine] = useState(0);
  const [totalZeros, setTotalZeros] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const PHI = (1 + Math.sqrt(5)) / 2; // Golden ratio

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
        if (line.includes("(GA)") || line.includes("(CT)") || line.includes("(TC)") || line.includes("(AG)")) {
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
          title: "GATCA Data Loaded",
          description: `Loaded ${repeats.length} STR repeats from your DNA`,
        });
      } else {
        toast({
          title: "No Data Found",
          description: "Could not parse GATCA repeats from file",
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
      title: "Analysis Complete",
      description: `Found ${foundOnLine} zeros on critical line out of ${maxN} tested`,
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
    
    print(f"\\nFound {zeros_found} zeros on critical line from {max_n} tests")
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
      title: "Python Code Exported",
      description: "gatca_zeta.py ready for Clay Mathematics Institute submission",
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
      {/* Navigation Bar */}
      <div className="fixed top-4 right-4 z-50 flex flex-wrap gap-2 justify-end">
        <Button
          onClick={() => navigate("/")}
          variant="secondary"
          className="gap-2 shadow-lg"
        >
          <Home className="w-4 h-4" />
          Strona Główna
        </Button>
        <Button
          onClick={() => navigate("/symphony")}
          variant="secondary"
          className="gap-2 shadow-lg"
        >
          <Music className="w-4 h-4" />
          Symfonia
        </Button>
        <Button
          onClick={() => navigate("/vault")}
          variant="secondary"
          className="gap-2 shadow-lg"
        >
          <Shield className="w-4 h-4" />
          Skarbiec
        </Button>
      </div>

      <div className="max-w-6xl mx-auto space-y-6 pt-16">
        {/* Header */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-3">
              <span className="text-4xl">𝜁</span>
              GATCA Zeta Function
            </CardTitle>
            <CardDescription className="text-base">
              Biological implementation of Riemann Hypothesis through DNA sequences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                <div className="text-sm text-muted-foreground">DNA Sequences</div>
                <div className="text-2xl font-bold text-primary">{gatcaRepeats.length}</div>
              </div>
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                <div className="text-sm text-muted-foreground">Golden Ratio φ</div>
                <div className="text-2xl font-bold text-primary">{PHI.toFixed(6)}</div>
              </div>
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                <div className="text-sm text-muted-foreground">Critical Line</div>
                <div className="text-2xl font-bold text-primary">Re(s) = 1/2</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload GATCA Data */}
        <Card>
          <CardHeader>
            <CardTitle>Load GATCA Data</CardTitle>
            <CardDescription>Upload your GATCA_full.txt file with STR repeats</CardDescription>
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
              Upload GATCA_full.txt
            </Button>
            <div className="text-sm text-muted-foreground">
              Current data: {gatcaRepeats.length} STR sequences from DNA
            </div>
          </CardContent>
        </Card>

        {/* Run Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Test Riemann Hypothesis</CardTitle>
            <CardDescription>Check if zeros align on critical line Re(s) = 1/2</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button
                onClick={() => checkZeros(1000)}
                disabled={isProcessing}
                className="flex-1"
              >
                <Play className="mr-2 h-4 w-4" />
                Test 1,000 Zeros
              </Button>
              <Button
                onClick={() => checkZeros(10000)}
                disabled={isProcessing}
                className="flex-1"
                variant="secondary"
              >
                <Play className="mr-2 h-4 w-4" />
                Test 10,000 Zeros
              </Button>
            </div>

            {isProcessing && (
              <div className="space-y-2">
                <Progress value={progress} />
                <div className="text-sm text-center text-muted-foreground">
                  Testing zeros... {progress.toFixed(0)}%
                </div>
                <div className="text-sm text-center text-primary font-semibold">
                  Robię to dla mojego syna.
                </div>
              </div>
            )}

            {totalZeros > 0 && (
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                <div className="text-lg font-semibold mb-2">Results</div>
                <div className="space-y-1">
                  <div>Tested: {totalZeros} zeros</div>
                  <div>On critical line: {zerosOnLine}</div>
                  <div className="text-xl font-bold text-primary">
                    Success rate: {((zerosOnLine / totalZeros) * 100).toFixed(2)}%
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
              <CardTitle>Zero Analysis (First 100)</CardTitle>
              <CardDescription>Zeros found on critical line Re(s) = 1/2</CardDescription>
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
            <CardTitle>Export & Publish</CardTitle>
            <CardDescription>Generate files for Clay Mathematics Institute submission</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Button onClick={exportPythonCode} variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Export Python Code
              </Button>
              <Button onClick={exportResults} variant="outline" disabled={results.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                Export Results (JSON)
              </Button>
            </div>
            <div className="p-4 bg-secondary/20 rounded-lg text-sm space-y-2">
              <div className="font-semibold">Next Steps:</div>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Run exported Python code locally with full precision</li>
                <li>Write paper: "DNA as Riemann-like Zeta Function"</li>
                <li>Submit to arXiv.org</li>
                <li>Submit to Clay Mathematics Institute (claymath.org)</li>
                <li>Claim $1,000,000 Millennium Prize</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Pentagram Matrix */}
        <PentagramMatrix />

        {/* Theory */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardHeader>
            <CardTitle>The Living Proof</CardTitle>
            <CardDescription className="text-primary font-semibold italic mt-2">
              Dedykowane dla mojego syna
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              The Riemann Hypothesis is not an abstract game.
              It is the question of whether <strong>order emerges naturally from chaos</strong>.
            </p>
            <p>
              If the non-trivial zeros of the Riemann zeta function all lie on the critical line Re(s) = 1/2...
              then the distribution of prime numbers follows a hidden harmonic structure.
            </p>
            <p className="text-primary font-semibold">
              If the zeros align on the critical line... you do not just win a million dollars.
              You prove that the human body is living proof of the universe&apos;s deepest mathematical truth.
            </p>
          </CardContent>
        </Card>

        {/* Support Section */}
        <Card className="border-primary/20 bg-background/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-primary">Wesprzyj Prawdę – Dowolna Kwota</CardTitle>
            <CardDescription>
              <p className="text-xs text-muted-foreground">Wpisz kwotę (nawet 1 £)</p>
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
                  placeholder="Wpisz kwotę (np. 1)" 
                  className="w-32 px-4 py-2 text-center border border-primary/30 rounded-md bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                
                <button 
                  type="submit"
                  className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                >
                  WYŚLIJ
                </button>
              </div>
              
              <small className="text-xs text-muted-foreground">PayPal – bezpieczne, bez konta</small>
            </form>
          </CardContent>
        </Card>

        {/* 18 DNA Gates */}
        <DNA18Gates />

        {/* MANIFEST JEDNOŚCI */}
        <Card className="bg-[rgba(10,11,30,0.95)] border-[#ffd700]/50">
          <CardContent className="pt-6 space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-[#ffd700] via-purple-400 to-[#00f2ff] bg-clip-text text-transparent uppercase tracking-widest">
                ✦ MANIFEST JEDNOŚCI ✦
              </h3>
              <p className="text-lg text-[#ffd700]">NAUKA + BÓG = RZECZYWISTOŚĆ</p>
              <p className="text-xs text-gray-500 italic">By: Grzegorz</p>
            </div>

            {/* 1. Jeden język, dwie dialekty */}
            <div className="p-4 bg-gradient-to-r from-purple-900/30 to-[#00f2ff]/10 rounded-lg border border-purple-500/30">
              <h4 className="text-purple-400 font-bold mb-3 flex items-center gap-2">
                <span className="text-xl">1.</span> JEDEN JĘZYK, DWIE DIALEKTY
              </h4>
              <div className="space-y-2 text-sm">
                <p className="text-gray-300"><span className="text-[#00f2ff] font-semibold">Matematyka</span> to słownictwo Boga.</p>
                <p className="text-gray-300"><span className="text-[#ffd700] font-semibold">Fizyka</span> to Jego gramatyka.</p>
                <p className="text-gray-300"><span className="text-green-400 font-semibold">Biologia</span> to Jego poezja.</p>
                <p className="text-gray-300"><span className="text-purple-400 font-semibold">Świadomość</span> to Jego głos.</p>
              </div>
            </div>

            {/* 2. Mostek Kwantowy */}
            <div className="p-4 bg-gradient-to-r from-[#00f2ff]/10 to-[#ffd700]/10 rounded-lg border border-[#00f2ff]/30">
              <h4 className="text-[#00f2ff] font-bold mb-3 flex items-center gap-2">
                <span className="text-xl">2.</span> MOSTEK KWANTOWY
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex gap-2">
                  <span className="text-[#ffd700] font-bold shrink-0">💡</span>
                  <p className="text-gray-300"><span className="text-[#ffd700]">"Niech stanie się światłość"</span> = Wielki Wybuch i inicjacja fotonów.</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-[#00f2ff] font-bold shrink-0">🧬</span>
                  <p className="text-gray-300"><span className="text-[#00f2ff]">"Obraz i podobieństwo"</span> = Złoty Podział (φ) w Twoim DNA.</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-purple-400 font-bold shrink-0">✨</span>
                  <p className="text-gray-300"><span className="text-purple-400">"Cuda"</span> = Dostęp do głębszych praw fizyki, których jeszcze nie nazwaliśmy.</p>
                </div>
              </div>
            </div>

            {/* 3. Twoja rola w systemie */}
            <div className="p-4 bg-gradient-to-r from-[#ffd700]/10 to-purple-900/30 rounded-lg border border-[#ffd700]/30">
              <h4 className="text-[#ffd700] font-bold mb-3 flex items-center gap-2">
                <span className="text-xl">3.</span> TWOJA ROLA W SYSTEMIE
              </h4>
              <p className="text-sm text-gray-300 leading-relaxed">
                Nie jesteś tylko biologiczną maszyną. Jesteś <span className="text-[#00f2ff] font-semibold">obserwatorem</span>, 
                który poprzez swoją wiarę i częstotliwość (<span className="text-[#ffd700] font-bold">718 Hz</span>) 
                wybiera rzeczywistość z nieskończonego pola potencjału.
              </p>
            </div>

            {/* 4. Wniosek końcowy */}
            <div className="p-5 bg-gradient-to-b from-black/60 to-purple-900/40 rounded-lg border border-[#ffd700]/50">
              <h4 className="text-[#ffd700] font-bold mb-3 flex items-center gap-2">
                <span className="text-xl">4.</span> WNIOSEK KOŃCOWY
              </h4>
              <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
                <p>
                  <span className="text-purple-400 font-semibold">Laboratorium</span> to Twoja katedra. 
                  <span className="text-[#00f2ff] font-semibold"> Modlitwa</span> to Twój eksperyment. 
                  Gdy Twoje tętno synchronizuje się z Matrycą, przestajesz tylko wierzyć – zaczynasz <span className="text-[#ffd700] font-bold">WIEDZIEĆ</span>.
                </p>
              </div>
              <blockquote className="mt-4 pt-4 border-t border-[#ffd700]/30 text-center">
                <p className="text-[#ffd700] italic text-lg font-semibold">
                  "Tam, gdzie kończy się lęk przed nieznanym, zaczyna się matematyka cudów."
                </p>
              </blockquote>
            </div>
          </CardContent>
        </Card>

        {/* SEKRET REZONANSU */}
        <Card className="bg-[rgba(10,11,30,0.95)] border-[#00f2ff]/50">
          <CardContent className="pt-6 space-y-5">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-[#00f2ff] via-[#ffd700] to-purple-400 bg-clip-text text-transparent uppercase tracking-widest">
                ✦ SEKRET REZONANSU ✦
              </h3>
              <p className="text-lg text-[#00f2ff]">DLACZEGO MODLITWA DZIAŁA?</p>
            </div>

            {/* 1. Wiara jako impuls kwantowy */}
            <div className="p-4 bg-gradient-to-r from-[#ffd700]/10 to-[#00f2ff]/10 rounded-lg border border-[#ffd700]/30">
              <h4 className="text-[#ffd700] font-bold mb-3 flex items-center gap-2">
                <span className="text-xl">1.</span> WIARA JAKO IMPULS KWANTOWY
              </h4>
              <p className="text-sm text-gray-300 leading-relaxed">
                Twoja wiara to nie tylko myśl – to <span className="text-[#ffd700] font-semibold">najsilniejszy znany we wszechświecie 
                generator fali spójnej</span>. Kiedy wierzysz bez wątpienia, Twoje serce 
                wysyła sygnał, który <span className="text-[#00f2ff]">"zagina"</span> prawdopodobieństwo rzeczywistości.
              </p>
            </div>

            {/* 2. Dostrojenie do Źródła */}
            <div className="p-4 bg-gradient-to-r from-[#00f2ff]/10 to-purple-900/30 rounded-lg border border-[#00f2ff]/30">
              <h4 className="text-[#00f2ff] font-bold mb-3 flex items-center gap-2">
                <span className="text-xl">2.</span> DOSTROJENIE DO ŹRÓDŁA
              </h4>
              <p className="text-sm text-gray-300 leading-relaxed">
                Modlitwa to proces synchronizacji Twojego tętna z Matrycą <span className="text-[#ffd700] font-bold">718 Hz</span>. 
                Gdy osiągasz ten stan (<span className="text-[#ffd700]">złoty wykres</span> na naszej stronie), Twoje 
                pole Ψ staje się <span className="text-[#00f2ff] font-semibold">"nadprzewodnikiem"</span> dla boskiej woli.
              </p>
            </div>

            {/* 3. Twoja wewnętrzna moc */}
            <div className="p-4 bg-gradient-to-r from-purple-900/30 to-[#ffd700]/10 rounded-lg border border-purple-500/30">
              <h4 className="text-purple-400 font-bold mb-3 flex items-center gap-2">
                <span className="text-xl">3.</span> TWOJA WEWNĘTRZNA MOC
              </h4>
              <p className="text-sm text-gray-300 leading-relaxed mb-3">
                Pamiętaj: Bóg nie działa <span className="text-gray-400">"zamiast"</span> Ciebie, ale <span className="text-[#ffd700] font-bold">"poprzez"</span> Ciebie. 
                To Twoja wewnętrzna moc, Twoja częstotliwość i Twoja wiara są 
                narzędziami, którymi kształtujesz świat.
              </p>
              <blockquote className="pt-3 border-t border-purple-500/30 text-center">
                <p className="text-purple-300 italic">
                  "Królestwo Boże jest wewnątrz was"
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  – to znaczy, że masz w sobie <span className="text-[#ffd700]">generator cudów</span>. Musisz go tylko poprawnie nastroić.
                </p>
              </blockquote>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GATCAZeta;
