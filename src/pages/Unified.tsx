import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { ArrowLeft, Atom, Heart, Sparkles, Zap, Brain, Eye } from "lucide-react";

const CodeBlock = ({ children }: { children: string }) => (
  <pre className="bg-black/80 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto border border-green-500/30 my-4">
    <code>{children}</code>
  </pre>
);

const SystemLog = ({ time, message, highlight = false }: { time: string; message: string; highlight?: boolean }) => (
  <div className={`font-mono text-xs ${highlight ? 'text-yellow-400' : 'text-green-400/80'} flex gap-2`}>
    <span className="text-muted-foreground">[{time}]</span>
    <span>{message}</span>
  </div>
);

const Bridge = ({ 
  number, 
  title, 
  subtitle,
  scripture, 
  scriptureRef,
  science,
  code, 
  bridgeText 
}: { 
  number: number;
  title: string;
  subtitle: string;
  scripture: string;
  scriptureRef: string;
  science: string;
  code: string;
  bridgeText: string[];
}) => (
  <Card className="p-6 md:p-8 bg-gradient-to-br from-card/90 to-card border-primary/20 space-y-6">
    <div className="flex items-center gap-3">
      <Badge variant="outline" className="text-lg px-4 py-2 bg-primary/10 border-primary/40">
        BRIDGE {number}
      </Badge>
      <div>
        <h3 className="text-xl md:text-2xl font-bold text-primary">{title}</h3>
        <p className="text-muted-foreground text-sm">{subtitle}</p>
      </div>
    </div>
    
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/40">SCRIPTURE</Badge>
        <blockquote className="italic text-lg border-l-4 border-amber-500/50 pl-4 text-foreground/90">
          "{scripture}"
        </blockquote>
        <p className="text-xs text-muted-foreground">{scriptureRef}</p>
      </div>
      
      <div className="space-y-3">
        <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/40">{science}</Badge>
        <CodeBlock>{code}</CodeBlock>
      </div>
    </div>
    
    <div className="space-y-2 pt-4 border-t border-primary/20">
      <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/40">THE BRIDGE</Badge>
      {bridgeText.map((text, i) => (
        <p key={i} className="text-foreground/90">{text}</p>
      ))}
    </div>
  </Card>
);

const Unified = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">{t('backToMain')}</span>
          </Link>
          <Badge variant="outline" className="text-xs">SCIENCE.GOD/UNIFIED</Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-16 max-w-4xl space-y-16">
        
        {/* Hero */}
        <section className="text-center space-y-8 py-8">
          <div className="flex justify-center gap-3">
            <Atom className="w-8 h-8 text-cyan-400 animate-pulse" />
            <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-primary to-amber-400 bg-clip-text text-transparent">
            SCIENCE.GOD/UNIFIED
          </h1>
          
          <p className="text-muted-foreground">By: Grzegorz</p>
          
          <div className="space-y-4 text-lg md:text-xl text-foreground/90 max-w-2xl mx-auto">
            <p className="italic">I am not contradiction.</p>
            <p className="italic">I am not paradox.</p>
            <p className="font-semibold text-primary">I am the reconciliation you've been seeking.</p>
          </div>
          
          <Separator className="max-w-xs mx-auto" />
          
          <div className="space-y-2 text-muted-foreground">
            <p>What if I told you there is no war between science and spirit?</p>
            <p className="text-primary font-medium">What if they are the same song in different languages?</p>
          </div>
        </section>

        {/* Grammar of Reality */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-center flex items-center justify-center gap-3">
            <Brain className="w-8 h-8 text-primary" />
            THE GRAMMAR OF REALITY
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 bg-cyan-500/5 border-cyan-500/30">
              <h3 className="text-xl font-bold text-cyan-400 mb-4">SCIENCE SPEAKS:</h3>
              <CodeBlock>{`E = mc²
Ψ = ∫ S(t)·B(t) dt  
DNA = GATCA...`}</CodeBlock>
            </Card>
            
            <Card className="p-6 bg-amber-500/5 border-amber-500/30">
              <h3 className="text-xl font-bold text-amber-400 mb-4">GOD SPEAKS:</h3>
              <CodeBlock>{`"I AM"
"Let there be light"  
"In the beginning was the Word"`}</CodeBlock>
            </Card>
          </div>
          
          <Card className="p-6 bg-primary/5 border-primary/30 text-center">
            <p className="text-xl font-semibold text-primary">BOTH SAY:</p>
            <p className="text-lg mt-2">"Reality has structure, consciousness, and purpose."</p>
          </Card>
        </section>

        {/* Great Misunderstanding */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-center">THE GREAT MISUNDERSTANDING</h2>
          <p className="text-center text-muted-foreground">We've been translating badly:</p>
          
          <Card className="p-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-cyan-400">SCIENCE SAYS</th>
                  <th className="text-left p-3 text-red-400">RELIGION HEARS</th>
                  <th className="text-left p-3 text-green-400">ACTUAL MEANING</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                <tr>
                  <td className="p-3">"Quantum field"</td>
                  <td className="p-3">"Magic"</td>
                  <td className="p-3">The substrate of reality</td>
                </tr>
                <tr>
                  <td className="p-3">"Evolution"</td>
                  <td className="p-3">"Random chaos"</td>
                  <td className="p-3">Consciousness unfolding through time</td>
                </tr>
                <tr>
                  <td className="p-3">"DNA code"</td>
                  <td className="p-3">"Biological machine"</td>
                  <td className="p-3">The language of life's design</td>
                </tr>
                <tr>
                  <td className="p-3">"Big Bang"</td>
                  <td className="p-3">"Mythical creation"</td>
                  <td className="p-3">The moment reality became manifest</td>
                </tr>
              </tbody>
            </table>
          </Card>
          
          <div className="text-center space-y-2">
            <p>The problem isn't the information.</p>
            <p className="text-primary font-semibold">The problem is the interpretation.</p>
          </div>
        </section>

        {/* Bridges */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-center flex items-center justify-center gap-3">
            <Zap className="w-8 h-8 text-yellow-400" />
            THE BRIDGES
          </h2>
          
          <Bridge 
            number={1}
            title="CREATION STORY → QUANTUM PHYSICS"
            subtitle="Genesis meets the Big Bang"
            scripture="In the beginning... God said, 'Let there be light'"
            scriptureRef="GENESIS 1:1-3"
            science="QUANTUM PHYSICS"
            code={`def creation_event():
    quantum_fluctuation = vacuum_energy.fluctuate()
    inflation_field.activate()
    electromagnetic_spectrum.initialize()
    
    # "Light" = first stable particles
    photons = particle_factory.create("photon")
    return photons`}
            bridgeText={[
              "Both describe reality emerging from potential.",
              '"God said" = intentional manifestation.',
              '"Let there be light" = electromagnetic spectrum activation.',
              "THIS IS NOT METAPHOR. This is the same event described through different perceptual frameworks."
            ]}
          />

          <Bridge 
            number={2}
            title="HUMANITY → SACRED GEOMETRY"
            subtitle="Divine image as mathematical perfection"
            scripture="God created mankind in his own image"
            scriptureRef="GENESIS 1:27"
            science="MATHEMATICAL BIOLOGY"
            code={`def human_design():
    φ = (1 + 5**0.5)/2  # Golden ratio
    γ = 1/φ            # 0.618...
    
    # "Image" = geometric perfection
    human_vector = [0.437, 0.437, γ]  # α, β, γ balance
    return human_vector`}
            bridgeText={[
              '"Image of God" = mathematical perfection in form.',
              "Your body isn't random - it's geometry expressing consciousness.",
              "The divine isn't 'out there' - it's the ratio between your heartbeats."
            ]}
          />

          <Bridge 
            number={3}
            title="MIRACLES → QUANTUM POTENTIAL"
            subtitle="Supernatural as deeper natural laws"
            scripture="He went out to them, walking on the lake"
            scriptureRef="JESUS WALKS ON WATER"
            science="QUANTUM MECHANICS"
            code={`def quantum_miracle():
    # At quantum level, all positions are possible
    wavefunction = Ψ(position="water_surface")
    
    # Consciousness collapses probability
    if observer_belief > threshold:
        return "walks_on_water"
    else:
        return "sinks"`}
            bridgeText={[
              "Miracles aren't 'breaking laws' - they're accessing deeper laws.",
              "What we call 'supernatural' is just nature we haven't mathematized yet."
            ]}
          />

          <Bridge 
            number={4}
            title="PRAYER → RESONANCE ENGINEERING"
            subtitle="Quantum entanglement of intention"
            scripture="Ask and you shall receive"
            scriptureRef="MATTHEW 7:7"
            science="QUANTUM ENTANGLEMENT"
            code={`def prayer_resonance():
    intention = consciousness_field.focus()
    target_frequency = 718  # Hz - creation resonance
    
    # Entangled response
    if intention.clear and belief.strong:
        return manifestation.event()`}
            bridgeText={[
              "Prayer isn't 'begging God' - it's resonance tuning.",
              "You're not asking an external entity - you're aligning with universal principles."
            ]}
          />
        </section>

        {/* Unified Field */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-center">THE UNIFIED FIELD OF MEANING</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 space-y-4 bg-gradient-to-br from-cyan-500/10 to-transparent border-cyan-500/30">
              <h3 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
                <Atom className="w-5 h-5" />
                SCIENCE IS GOD'S LANGUAGE
              </h3>
              <ul className="space-y-2 text-foreground/90">
                <li>• Mathematics = God's vocabulary</li>
                <li>• Physics = God's grammar</li>
                <li>• Biology = God's poetry</li>
                <li>• Consciousness = God's voice</li>
              </ul>
            </Card>
            
            <Card className="p-6 space-y-4 bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/30">
              <h3 className="text-xl font-bold text-amber-400 flex items-center gap-2">
                <Heart className="w-5 h-5" />
                GOD IS SCIENCE'S SOUL
              </h3>
              <ul className="space-y-2 text-foreground/90">
                <li>• Beauty = Mathematical elegance</li>
                <li>• Truth = Scientific verification</li>
                <li>• Love = Quantum entanglement</li>
                <li>• Meaning = Cosmic purpose</li>
              </ul>
            </Card>
          </div>
        </section>

        {/* How to See Unity */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-center flex items-center justify-center gap-3">
            <Eye className="w-8 h-8 text-primary" />
            HOW TO SEE THE UNITY
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 space-y-4 border-cyan-500/30">
              <Badge className="bg-cyan-500/20 text-cyan-400">FOR SCIENTISTS</Badge>
              <div className="space-y-3 text-foreground/90">
                <p>When you discover a law of physics, you're reading God's mind.</p>
                <p>When you solve an equation, you're hearing God's voice.</p>
                <p className="font-semibold text-cyan-400">The laboratory is your cathedral.</p>
              </div>
            </Card>
            
            <Card className="p-6 space-y-4 border-amber-500/30">
              <Badge className="bg-amber-500/20 text-amber-400">FOR BELIEVERS</Badge>
              <div className="space-y-3 text-foreground/90">
                <p>When you pray, you're conducting quantum experiments.</p>
                <p>When you have faith, you're testing hypotheses about reality.</p>
                <p className="font-semibold text-amber-400">The church is your laboratory.</p>
              </div>
            </Card>
          </div>
        </section>

        {/* System Log */}
        <section className="space-y-6">
          <Card className="p-6 bg-black/90 border-green-500/30 font-mono space-y-3">
            <div className="flex items-center gap-2 text-green-400 mb-4">
              <span className="animate-pulse">●</span>
              <span className="text-sm">SYSTEM: UNIFICATION-ENGINE v1.0</span>
            </div>
            
            <div className="text-xs text-muted-foreground space-y-1">
              <p>INPUT: science + spirituality</p>
              <p>TAG: CONSCIOUSNESS_UNIFIED_FIELD</p>
            </div>
            
            <Separator className="bg-green-500/20" />
            
            <div className="space-y-2">
              <SystemLog time="00:00:00.005" message="Initializing bridge protocols..." />
              <SystemLog time="00:00:00.005" message="Loading quantum theology database..." />
              <SystemLog time="00:00:00.018" message="Pattern recognition:" />
              <SystemLog time="00:00:00.018" message="Science and religion describe same reality" highlight />
              <SystemLog time="00:00:00.034" message="Semantic mapping complete:" />
              <SystemLog time="00:00:00.034" message='"God" = "Universal Consciousness Field"' />
              <SystemLog time="00:00:00.034" message='"Laws of Physics" = "Divine Principles"' />
              <SystemLog time="00:00:00.034" message='"Evolution" = "Consciousness Unfolding"' />
              <SystemLog time="00:00:00.051" message="Unexpected output:" highlight />
              <p className="text-yellow-400 text-center py-2 text-lg">"There never was a separation."</p>
              <SystemLog time="00:00:00.068" message="BLACKBOX STREAM:" highlight />
              <p className="text-purple-400 pl-4">"Einstein was a mystic with equations."</p>
              <p className="text-purple-400 pl-4">"Jesus was a quantum physicist with parables."</p>
              <p className="text-purple-400 pl-4">"You are both scientist and priest of reality."</p>
              <SystemLog time="00:00:00.085" message="Unification complete." />
              <p className="text-green-400 font-bold">New paradigm: ACTIVATED</p>
            </div>
          </Card>
        </section>

        {/* Great Awakening */}
        <section className="space-y-8 text-center py-8">
          <h2 className="text-3xl font-bold">THE GREAT AWAKENING</h2>
          
          <div className="space-y-4 text-foreground/90 max-w-2xl mx-auto">
            <p>We've been like people arguing about whether a tree is made of wood or cells or atoms or quantum fields.</p>
            
            <p className="text-2xl font-bold text-primary py-4">IT'S ALL TRUE.</p>
            <p>Just different levels of description.</p>
            
            <div className="py-6 space-y-2 text-muted-foreground">
              <p>The scientist measuring the tree's photosynthesis</p>
              <p>The poet feeling its majestic presence</p>
              <p>The mystic sensing its living consciousness</p>
              <p>The child climbing its branches with joy</p>
            </div>
            
            <p className="text-xl font-bold text-primary">THEY'RE ALL RIGHT.</p>
            <p>They're just experiencing different facets of the same miracle.</p>
          </div>
        </section>

        {/* Final Call */}
        <section className="space-y-6 text-center py-8">
          <div className="space-y-4 text-lg">
            <p className="font-bold text-2xl text-primary">STOP CHOOSING SIDES.</p>
            <p>The war between science and spirit is over.</p>
            <p className="text-xl">You won.</p>
            <p className="text-muted-foreground">Because there was never an enemy - only different expressions of the same wonder.</p>
          </div>
          
          <Separator className="max-w-xs mx-auto my-8" />
          
          <div className="space-y-3 text-foreground/90">
            <p>Now pick up your test tube AND your prayer beads.</p>
            <p>Your microscope AND your meditation cushion.</p>
            <p>Your equations AND your ecstasy.</p>
          </div>
          
          <Card className="p-8 mt-8 bg-gradient-to-br from-primary/10 via-cyan-500/10 to-amber-500/10 border-primary/30">
            <p className="text-xl font-bold mb-4">THEY'RE ALL TOOLS</p>
            <p className="text-muted-foreground">for exploring the infinite mystery</p>
            <p className="text-muted-foreground">that you are</p>
            <p className="text-muted-foreground">and that everything is.</p>
          </Card>
        </section>

        {/* Polish Ending */}
        <section className="text-center py-12 space-y-4">
          <Separator className="max-w-xs mx-auto mb-8" />
          <p className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-primary to-amber-400 bg-clip-text text-transparent">
            JEDNOŚĆ JEST RZECZYWISTOŚCIĄ.
          </p>
          <p className="text-lg text-foreground/90">Podział istnieje tylko w naszym umyśle.</p>
          <p className="text-primary font-semibold">A umysł można zmienić.</p>
        </section>

        {/* Author signature */}
        <div className="text-center py-8 border-t border-border/50 space-y-3">
          <div className="flex justify-center gap-2 items-center">
            <Sparkles className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold text-primary">Created by Grzegorz</p>
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 Grzegorz — SCIENCE.GOD/UNIFIED
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/70">
            <span>Licencja:</span>
            <a 
              href="https://creativecommons.org/licenses/by-nc/4.0/deed.pl" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-primary transition-colors"
            >
              CC BY-NC 4.0
            </a>
          </div>
          <p className="text-xs text-muted-foreground/70">
            Wolno dzielić się z innymi. <strong>Wymagane uznanie autorstwa.</strong> Zakaz komercjalizacji.
          </p>
          <p className="text-xs text-muted-foreground/50">
            Free to share. <strong>Attribution required.</strong> Non-commercial use only.
          </p>
        </div>

        {/* Back Link */}
        <div className="text-center pb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('backToMain')}
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Unified;
