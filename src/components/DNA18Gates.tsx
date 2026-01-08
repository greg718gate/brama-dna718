import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLanguage } from "@/contexts/LanguageContext";

type GateGroup = 'regeneracja' | 'wzrok' | 'zrodlo';

interface Gate {
  number: number;
  nameKey: string;
  group: GateGroup;
  color: string;
  descriptionKey: string;
  effectKey: string;
}

const gates: Gate[] = [
  // Gates 1-6: REGENERATION
  { number: 1, nameKey: 'dna18gates.gate1.name', group: 'regeneracja', color: 'green', descriptionKey: 'dna18gates.gate1.description', effectKey: 'dna18gates.gate1.effect' },
  { number: 2, nameKey: 'dna18gates.gate2.name', group: 'regeneracja', color: 'green', descriptionKey: 'dna18gates.gate2.description', effectKey: 'dna18gates.gate2.effect' },
  { number: 3, nameKey: 'dna18gates.gate3.name', group: 'regeneracja', color: 'green', descriptionKey: 'dna18gates.gate3.description', effectKey: 'dna18gates.gate3.effect' },
  { number: 4, nameKey: 'dna18gates.gate4.name', group: 'regeneracja', color: 'green', descriptionKey: 'dna18gates.gate4.description', effectKey: 'dna18gates.gate4.effect' },
  { number: 5, nameKey: 'dna18gates.gate5.name', group: 'regeneracja', color: 'green', descriptionKey: 'dna18gates.gate5.description', effectKey: 'dna18gates.gate5.effect' },
  { number: 6, nameKey: 'dna18gates.gate6.name', group: 'regeneracja', color: 'green', descriptionKey: 'dna18gates.gate6.description', effectKey: 'dna18gates.gate6.effect' },
  // Gates 7-12: SIGHT
  { number: 7, nameKey: 'dna18gates.gate7.name', group: 'wzrok', color: 'cyan', descriptionKey: 'dna18gates.gate7.description', effectKey: 'dna18gates.gate7.effect' },
  { number: 8, nameKey: 'dna18gates.gate8.name', group: 'wzrok', color: 'cyan', descriptionKey: 'dna18gates.gate8.description', effectKey: 'dna18gates.gate8.effect' },
  { number: 9, nameKey: 'dna18gates.gate9.name', group: 'wzrok', color: 'cyan', descriptionKey: 'dna18gates.gate9.description', effectKey: 'dna18gates.gate9.effect' },
  { number: 10, nameKey: 'dna18gates.gate10.name', group: 'wzrok', color: 'cyan', descriptionKey: 'dna18gates.gate10.description', effectKey: 'dna18gates.gate10.effect' },
  { number: 11, nameKey: 'dna18gates.gate11.name', group: 'wzrok', color: 'cyan', descriptionKey: 'dna18gates.gate11.description', effectKey: 'dna18gates.gate11.effect' },
  { number: 12, nameKey: 'dna18gates.gate12.name', group: 'wzrok', color: 'cyan', descriptionKey: 'dna18gates.gate12.description', effectKey: 'dna18gates.gate12.effect' },
  // Gates 13-18: SOURCE
  { number: 13, nameKey: 'dna18gates.gate13.name', group: 'zrodlo', color: 'gold', descriptionKey: 'dna18gates.gate13.description', effectKey: 'dna18gates.gate13.effect' },
  { number: 14, nameKey: 'dna18gates.gate14.name', group: 'zrodlo', color: 'gold', descriptionKey: 'dna18gates.gate14.description', effectKey: 'dna18gates.gate14.effect' },
  { number: 15, nameKey: 'dna18gates.gate15.name', group: 'zrodlo', color: 'gold', descriptionKey: 'dna18gates.gate15.description', effectKey: 'dna18gates.gate15.effect' },
  { number: 16, nameKey: 'dna18gates.gate16.name', group: 'zrodlo', color: 'gold', descriptionKey: 'dna18gates.gate16.description', effectKey: 'dna18gates.gate16.effect' },
  { number: 17, nameKey: 'dna18gates.gate17.name', group: 'zrodlo', color: 'gold', descriptionKey: 'dna18gates.gate17.description', effectKey: 'dna18gates.gate17.effect' },
  { number: 18, nameKey: 'dna18gates.gate18.name', group: 'zrodlo', color: 'gold', descriptionKey: 'dna18gates.gate18.description', effectKey: 'dna18gates.gate18.effect' },
];

interface GroupInfo {
  titleKey: string;
  subtitleKey: string;
  color: string;
  icon: string;
  descriptionKey: string;
}

const groupInfo: Record<GateGroup, GroupInfo> = {
  regeneracja: {
    titleKey: 'dna18gates.group.regeneration.title',
    subtitleKey: 'dna18gates.group.regeneration.subtitle',
    color: 'green',
    icon: '🧬',
    descriptionKey: 'dna18gates.group.regeneration.description'
  },
  wzrok: {
    titleKey: 'dna18gates.group.sight.title',
    subtitleKey: 'dna18gates.group.sight.subtitle',
    color: 'cyan',
    icon: '👁️',
    descriptionKey: 'dna18gates.group.sight.description'
  },
  zrodlo: {
    titleKey: 'dna18gates.group.source.title',
    subtitleKey: 'dna18gates.group.source.subtitle',
    color: 'gold',
    icon: '✨',
    descriptionKey: 'dna18gates.group.source.description'
  }
};

export const DNA18Gates = () => {
  const { t } = useLanguage();
  
  return (
    <Card className="w-full max-w-4xl mx-auto bg-[rgba(10,11,30,0.95)] border-[#ffd700]/50">
      <CardHeader className="text-center border-b border-[#ffd700]/20">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-400 via-[#00f2ff] to-[#ffd700] bg-clip-text text-transparent">
          {t('dna18gates.title')}
        </CardTitle>
        <p className="text-[#ffd700] mt-2">{t('dna18gates.subtitle')}</p>
        <p className="text-sm text-gray-400 mt-2">
          {t('dna18gates.description')}
        </p>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-8">
        {/* Group Sections */}
        {(Object.entries(groupInfo) as [GateGroup, GroupInfo][]).map(([groupKey, group]) => (
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
                    {t(group.titleKey)}
                  </h3>
                  <p className="text-sm text-gray-400">{t(group.subtitleKey)}</p>
                </div>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                {t(group.descriptionKey)}
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
                        {t(gate.nameKey)}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="space-y-3 pl-11">
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {t(gate.descriptionKey)}
                      </p>
                      <div className={`p-3 rounded-lg ${
                        gate.color === 'green' ? 'bg-green-900/30 border-l-2 border-green-500' :
                        gate.color === 'cyan' ? 'bg-cyan-900/30 border-l-2 border-cyan-500' :
                        'bg-amber-900/30 border-l-2 border-amber-500'
                      }`}>
                        <span className="text-xs text-gray-400 uppercase tracking-wider">{t('dna18gates.activationEffect')}</span>
                        <p className={`text-sm mt-1 ${
                          gate.color === 'green' ? 'text-green-300' :
                          gate.color === 'cyan' ? 'text-cyan-300' :
                          'text-amber-300'
                        }`}>
                          {t(gate.effectKey)}
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
            "{t('dna18gates.finalMessage')}"
          </p>
          <p className="text-[#ffd700] font-bold mt-4">
            {t('dna18gates.finalFrequency')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
