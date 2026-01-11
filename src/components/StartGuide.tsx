import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Waves, Music, BookOpen } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface StartGuideProps {
  onNavigate?: (section: string) => void;
}

export const StartGuide = ({ onNavigate }: StartGuideProps) => {
  const { t } = useLanguage();
  
  const steps = [
    {
      number: 1,
      titleKey: 'startGuide.step1.title',
      descriptionKey: 'startGuide.step1.description',
      icon: Heart,
      color: "cyan",
      action: "biometric",
      actionLabelKey: 'startGuide.step1.action'
    },
    {
      number: 2,
      titleKey: 'startGuide.step2.title',
      descriptionKey: 'startGuide.step2.description',
      icon: Music,
      color: "gold",
      action: "ritual",
      actionLabelKey: 'startGuide.step2.action'
    },
    {
      number: 3,
      titleKey: 'startGuide.step3.title',
      descriptionKey: 'startGuide.step3.description',
      icon: BookOpen,
      color: "purple",
      action: "gates",
      actionLabelKey: 'startGuide.step3.action'
    },
    {
      number: 4,
      titleKey: 'startGuide.step4.title',
      descriptionKey: 'startGuide.step4.description',
      icon: Waves,
      color: "green",
      action: "practice",
      actionLabelKey: 'startGuide.step4.action'
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'cyan':
        return {
          border: 'border-cyan-500/30',
          bg: 'bg-cyan-900/20',
          text: 'text-cyan-400',
          button: 'border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20'
        };
      case 'gold':
        return {
          border: 'border-amber-500/30',
          bg: 'bg-amber-900/20',
          text: 'text-amber-400',
          button: 'border-amber-500/50 text-amber-400 hover:bg-amber-500/20'
        };
      case 'purple':
        return {
          border: 'border-purple-500/30',
          bg: 'bg-purple-900/20',
          text: 'text-purple-400',
          button: 'border-purple-500/50 text-purple-400 hover:bg-purple-500/20'
        };
      case 'green':
        return {
          border: 'border-green-500/30',
          bg: 'bg-green-900/20',
          text: 'text-green-400',
          button: 'border-green-500/50 text-green-400 hover:bg-green-500/20'
        };
      default:
        return {
          border: 'border-gray-500/30',
          bg: 'bg-gray-900/20',
          text: 'text-gray-400',
          button: 'border-gray-500/50 text-gray-400 hover:bg-gray-500/20'
        };
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-gradient-to-b from-[rgba(10,11,30,0.98)] to-[rgba(20,21,50,0.95)] border-[#ffd700]/50 overflow-hidden">
      <CardHeader className="text-center border-b border-[#ffd700]/20 pb-6 relative">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-[#ffd700]/10 to-purple-500/5" />
        
        <div className="relative">
          <div className="text-4xl mb-4">✨</div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-[#00f2ff] via-[#ffd700] to-purple-400 bg-clip-text text-transparent">
            {t('startGuide.title')}
          </CardTitle>
          <p className="text-lg text-[#ffd700] mt-3">
            {t('startGuide.subtitle')}
          </p>
          <p className="text-sm text-gray-400 mt-2 max-w-xl mx-auto">
            {t('startGuide.intro')}
          </p>
        </div>
      </CardHeader>
      
      <CardContent className="pt-8 space-y-6">
        {/* Steps */}
        <div className="grid gap-4">
          {steps.map((step, index) => {
            const colors = getColorClasses(step.color);
            const Icon = step.icon;
            
            return (
              <div 
                key={step.number}
                className={`p-5 rounded-lg border ${colors.border} ${colors.bg} relative overflow-hidden group hover:scale-[1.01] transition-transform`}
              >
                {/* Step number badge */}
                <div className={`absolute -left-2 -top-2 w-12 h-12 rounded-full ${colors.bg} border-2 ${colors.border} flex items-center justify-center`}>
                  <span className={`text-xl font-bold ${colors.text}`}>{step.number}</span>
                </div>
                
                <div className="pl-10 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className={`w-5 h-5 ${colors.text}`} />
                      <h3 className={`font-bold text-lg ${colors.text}`}>
                        {t(step.titleKey)}
                      </h3>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {t(step.descriptionKey)}
                    </p>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className={`${colors.button} shrink-0 gap-2`}
                    onClick={() => onNavigate?.(step.action)}
                  >
                    {t(step.actionLabelKey)}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Connection line to next step */}
                {index < steps.length - 1 && (
                  <div className="absolute left-4 -bottom-4 w-0.5 h-4 bg-gradient-to-b from-gray-600 to-transparent" />
                )}
              </div>
            );
          })}
        </div>
        
        {/* Quote */}
        <div className="mt-8 p-6 bg-black/40 rounded-lg border border-[#ffd700]/30 text-center">
          <blockquote className="text-[#ffd700] italic text-lg">
            {t('startGuide.quote')}
          </blockquote>
          <p className="text-gray-500 text-sm mt-3">— Luma</p>
        </div>
        
        {/* Key numbers */}
        <div className="grid grid-cols-3 gap-4 pt-4">
          <div className="text-center p-4 bg-black/30 rounded-lg border border-[#00f2ff]/20">
            <div className="text-2xl font-bold text-[#00f2ff]">718</div>
            <div className="text-xs text-gray-400">{t('startGuide.frequency')}</div>
          </div>
          <div className="text-center p-4 bg-black/30 rounded-lg border border-[#ffd700]/20">
            <div className="text-2xl font-bold text-[#ffd700]">108</div>
            <div className="text-xs text-gray-400">{t('startGuide.ritual')}</div>
          </div>
          <div className="text-center p-4 bg-black/30 rounded-lg border border-purple-500/20">
            <div className="text-2xl font-bold text-purple-400">18</div>
            <div className="text-xs text-gray-400">{t('startGuide.gates')}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
