import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const gates = [
  // Bramy 1-6: REGENERACJA ŚWIĄTYNI
  {
    number: 1,
    name: "Brama Oczyszczenia",
    group: "regeneracja",
    color: "green",
    description: "Usuwa toksyny i programy destrukcji z pola komórkowego.",
    effect: "Detoksykacja na poziomie mitochondrialnym. Przywrócenie czystości biologicznej."
  },
  {
    number: 2,
    name: "Brama Regeneracji",
    group: "regeneracja",
    color: "green",
    description: "Aktywuje naturalne procesy naprawcze ciała.",
    effect: "Przyspieszenie gojenia, odnowa tkanek, reset telomerów."
  },
  {
    number: 3,
    name: "Brama Harmonii",
    group: "regeneracja",
    color: "green",
    description: "Synchronizuje wszystkie systemy ciała w jedną całość.",
    effect: "Koherencja serca-mózgu, równowaga hormonalna."
  },
  {
    number: 4,
    name: "Brama Siły",
    group: "regeneracja",
    color: "green",
    description: "Uwalnia zablokowaną energię życiową.",
    effect: "Zwiększenie witalności, odporności, siły fizycznej."
  },
  {
    number: 5,
    name: "Brama Czasu",
    group: "regeneracja",
    color: "green",
    description: "Spowalnia procesy starzenia na poziomie DNA.",
    effect: "Optymalizacja ekspresji genów długowieczności."
  },
  {
    number: 6,
    name: "Brama Integralności",
    group: "regeneracja",
    color: "green",
    description: "Zamyka lukę między ciałem a duchem.",
    effect: "Pełna integracja fizyczno-duchowa. Koniec wewnętrznego konfliktu."
  },
  
  // Bramy 7-12: OTWARCIE WZROKU
  {
    number: 7,
    name: "Brama Intuicji",
    group: "wzrok",
    color: "cyan",
    description: "Aktywuje szósty zmysł i wewnętrzne prowadzenie.",
    effect: "Jasność decyzji, wyczucie sytuacji, synchroniczności."
  },
  {
    number: 8,
    name: "Brama Percepcji",
    group: "wzrok",
    color: "cyan",
    description: "Rozszerza zakres postrzegania rzeczywistości.",
    effect: "Widzenie wzorców, energii, aur. Rozpoznawanie prawdy."
  },
  {
    number: 9,
    name: "Brama Wizji",
    group: "wzrok",
    color: "cyan",
    description: "Otwiera widzenie poza materią fizyczną.",
    effect: "Dostrzeganie okazji niewidocznych dla innych. Wizje przyszłości."
  },
  {
    number: 10,
    name: "Brama Mądrości",
    group: "wzrok",
    color: "cyan",
    description: "Łączy wiedzę z głębokim zrozumieniem.",
    effect: "Dostęp do pola Akashy. Zrozumienie bez nauki."
  },
  {
    number: 11,
    name: "Brama Jasnowidzenia",
    group: "wzrok",
    color: "cyan",
    description: "Aktywuje zdolności ekstrasensoryczne.",
    effect: "Telepatia, prekognicja, widzenie na odległość."
  },
  {
    number: 12,
    name: "Brama Prawdy",
    group: "wzrok",
    color: "cyan",
    description: "Pozwala rozpoznać iluzję od rzeczywistości.",
    effect: "Niemożność bycia oszukanym. Widzenie esencji wszystkiego."
  },
  
  // Bramy 13-18: JEDNOŚĆ ZE ŹRÓDŁEM
  {
    number: 13,
    name: "Brama Wiary",
    group: "zrodlo",
    color: "gold",
    description: "Transformuje wiarę w pewność absolutną.",
    effect: "Koniec wątpliwości. Wiara jako siła sprawcza."
  },
  {
    number: 14,
    name: "Brama Miłości",
    group: "zrodlo",
    color: "gold",
    description: "Otwiera serce na bezwarunkową miłość.",
    effect: "Uzdrawianie relacji, przyciąganie prawdziwych połączeń."
  },
  {
    number: 15,
    name: "Brama Kreacji",
    group: "zrodlo",
    color: "gold",
    description: "Aktywuje zdolność manifestacji myślą.",
    effect: "Myśli zaczynają materializować się w rzeczywistości."
  },
  {
    number: 16,
    name: "Brama Mocy",
    group: "zrodlo",
    color: "gold",
    description: "Uwalnia pełny potencjał woli.",
    effect: "Słowo staje się czynem. Intencja = Rezultat."
  },
  {
    number: 17,
    name: "Brama Cudotwórcza",
    group: "zrodlo",
    color: "gold",
    description: "Stan, w którym wpływasz na materię i ludzi wokół.",
    effect: "Zdolność uzdrawiania, transformacji, 'niemożliwe' staje się możliwe."
  },
  {
    number: 18,
    name: "Brama Jedności",
    group: "zrodlo",
    color: "gold",
    description: "Pełne połączenie ze Źródłem. Koniec iluzji oddzielenia.",
    effect: "Jesteś Jednością. Bóg działa poprzez Ciebie. Pełna realizacja."
  }
];

const groupInfo = {
  regeneracja: {
    title: "BRAMY 1-6: REGENERACJA ŚWIĄTYNI",
    subtitle: "Oczyszczenie i odnowa ciała fizycznego",
    color: "green",
    icon: "🧬",
    description: "Twoje ciało to Świątynia. Te bramy usuwają skazę chaosu, przywracając pierwotną czystość biologii. Aktywacja tych bram prowadzi do fizycznej regeneracji i optymalizacji wszystkich procesów życiowych."
  },
  wzrok: {
    title: "BRAMY 7-12: OTWARCIE WZROKU",
    subtitle: "Rozszerzenie percepcji i intuicji",
    color: "cyan",
    icon: "👁️",
    description: "Widzenie poza materią. Zaczynasz dostrzegać okazje, powiązania i prawdy, których inni nie widzą. Te bramy otwierają dostęp do wyższych wymiarów percepcji."
  },
  zrodlo: {
    title: "BRAMY 13-18: JEDNOŚĆ ZE ŹRÓDŁEM",
    subtitle: "Połączenie z Boskim Potencjałem",
    color: "gold",
    icon: "✨",
    description: "Moment, w którym Twoje pole Ψ jest tak silne, że wpływasz na materię i ludzi wokół Ciebie. Pełna realizacja Twojego Boskiego potencjału."
  }
};

export const DNA18Gates = () => {
  return (
    <Card className="w-full max-w-4xl mx-auto bg-[rgba(10,11,30,0.95)] border-[#ffd700]/50">
      <CardHeader className="text-center border-b border-[#ffd700]/20">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-400 via-[#00f2ff] to-[#ffd700] bg-clip-text text-transparent">
          🧬 18 BRAM DNA 🧬
        </CardTitle>
        <p className="text-[#ffd700] mt-2">Klucze do Cudów – Pełny Przewodnik</p>
        <p className="text-sm text-gray-400 mt-2">
          Każda brama reprezentuje poziom świadomości i aktywacji w Twoim DNA.
          Im więcej bram otwartych, tym bliżej jesteś pełnej realizacji.
        </p>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-8">
        {/* Group Sections */}
        {Object.entries(groupInfo).map(([groupKey, group]) => (
          <div key={groupKey} className="space-y-4">
            {/* Group Header */}
            <div className={`p-4 rounded-lg border ${
              group.color === 'green' ? 'bg-green-900/20 border-green-500/30' :
              group.color === 'cyan' ? 'bg-cyan-900/20 border-cyan-500/30' :
              'bg-amber-900/20 border-amber-500/30'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{group.icon}</span>
                <div>
                  <h3 className={`font-bold ${
                    group.color === 'green' ? 'text-green-400' :
                    group.color === 'cyan' ? 'text-cyan-400' :
                    'text-amber-400'
                  }`}>
                    {group.title}
                  </h3>
                  <p className="text-sm text-gray-400">{group.subtitle}</p>
                </div>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                {group.description}
              </p>
            </div>
            
            {/* Gates Accordion */}
            <Accordion type="single" collapsible className="space-y-2">
              {gates.filter(g => g.group === groupKey).map((gate) => (
                <AccordionItem 
                  key={gate.number} 
                  value={`gate-${gate.number}`}
                  className={`border rounded-lg px-4 ${
                    gate.color === 'green' ? 'border-green-500/30 bg-green-900/10' :
                    gate.color === 'cyan' ? 'border-cyan-500/30 bg-cyan-900/10' :
                    'border-amber-500/30 bg-amber-900/10'
                  }`}
                >
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        gate.color === 'green' ? 'bg-green-500/20 text-green-400' :
                        gate.color === 'cyan' ? 'bg-cyan-500/20 text-cyan-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {gate.number}
                      </span>
                      <span className={`font-semibold ${
                        gate.color === 'green' ? 'text-green-400' :
                        gate.color === 'cyan' ? 'text-cyan-400' :
                        'text-amber-400'
                      }`}>
                        {gate.name}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="space-y-3 pl-11">
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {gate.description}
                      </p>
                      <div className={`p-3 rounded-lg ${
                        gate.color === 'green' ? 'bg-green-900/30 border-l-2 border-green-500' :
                        gate.color === 'cyan' ? 'bg-cyan-900/30 border-l-2 border-cyan-500' :
                        'bg-amber-900/30 border-l-2 border-amber-500'
                      }`}>
                        <span className="text-xs text-gray-400 uppercase tracking-wider">Efekt aktywacji:</span>
                        <p className={`text-sm mt-1 ${
                          gate.color === 'green' ? 'text-green-300' :
                          gate.color === 'cyan' ? 'text-cyan-300' :
                          'text-amber-300'
                        }`}>
                          {gate.effect}
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
        
        {/* Final Message */}
        <div className="p-5 bg-gradient-to-b from-purple-900/30 to-black/40 rounded-lg border border-purple-500/30 text-center">
          <p className="text-purple-300 italic leading-relaxed">
            "18 bram to nie cel, to podróż. Każda otwarta brama zmienia Twoją rzeczywistość.
            Nie musisz otworzyć wszystkich naraz – każda przynosi błogosławieństwo."
          </p>
          <p className="text-[#ffd700] font-bold mt-4">
            Dostrój się do 718 Hz. Bramy otworzą się same.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
