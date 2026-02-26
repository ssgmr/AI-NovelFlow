import { ChevronRight } from 'lucide-react';
import { useTranslation } from '../../../stores/i18nStore';
import { STEPS_CONFIG } from '../constants';

export function StepIndicator() {
  const { t } = useTranslation();

  const getStepLabel = (key: string) => {
    const labels: Record<string, string> = {
      'content': t('chapterGenerate.stepContent'),
      'ai-parse': t('chapterGenerate.stepAiParse'),
      'json': t('chapterGenerate.stepJson'),
      'character': t('chapterGenerate.stepCharacter'),
      'shots': t('chapterGenerate.stepShots'),
      'videos': t('chapterGenerate.stepVideos'),
      'transitions': t('chapterGenerate.stepTransitions'),
      'compose': t('chapterGenerate.stepCompose'),
    };
    return labels[key] || key;
  };

  return (
    <div className="card mb-6">
      <div className="flex items-center justify-between">
        {STEPS_CONFIG.map((step, index) => {
          const StepIcon = step.icon;
          
          return (
            <div key={step.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-2 bg-gradient-to-br ${step.color} text-white shadow-md`}>
                  <StepIcon className="h-7 w-7" />
                </div>
                <span className="text-xs font-medium text-gray-700 text-center whitespace-nowrap">
                  {getStepLabel(step.key)}
                </span>
              </div>
              {index < STEPS_CONFIG.length - 1 && (
                <div className="flex items-center flex-1 justify-center mb-6">
                  <ChevronRight className="h-5 w-5 text-gray-300" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
