import { CheckCircle, XCircle, Loader2, ChevronRight, Book, Users, FileText, FileJson, Image as ImageIcon, Video, Film, Sparkles } from 'lucide-react';
import { useTranslation } from '../../../stores/i18nStore';

const workflowSteps = [
  { icon: Book, color: 'from-sky-500 to-blue-500' },
  { icon: Sparkles, color: 'from-violet-500 to-purple-500' },
  { icon: Sparkles, color: 'from-fuchsia-500 to-pink-500' },
  { icon: Users, color: 'from-orange-500 to-amber-500' },
  { icon: ImageIcon, color: 'from-teal-500 to-cyan-500' },
  { icon: FileText, color: 'from-blue-500 to-cyan-500' },
  { icon: Sparkles, color: 'from-purple-500 to-pink-500' },
  { icon: FileJson, color: 'from-emerald-500 to-teal-500' },
  { icon: ImageIcon, color: 'from-rose-500 to-pink-500' },
  { icon: Video, color: 'from-indigo-500 to-violet-500' },
  { icon: Film, color: 'from-amber-500 to-orange-500' },
  { icon: Film, color: 'from-cyan-500 to-blue-500' },
  { icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
];

export function WorkflowOverview() {
  const { t } = useTranslation();
  const titles = [
    t('welcome.workflow.importNovel'), t('welcome.workflow.parseCharacters'), t('welcome.workflow.parseScenes'),
    t('welcome.workflow.generateCharacters'), t('welcome.workflow.generateScenes'), t('welcome.workflow.editChapter'),
    t('welcome.workflow.splitShots'), t('welcome.workflow.jsonStructure'), t('welcome.workflow.generateShotImages'),
    t('welcome.workflow.generateShotVideos'), t('welcome.workflow.generateTransitions'), t('welcome.workflow.mergeVideo'), t('common.success')
  ];

  return (
    <div className="flex items-center justify-between overflow-x-auto pb-2">
      {workflowSteps.map((step, index) => (
        <div key={index} className="flex items-center flex-shrink-0">
          <div className="flex flex-col items-center">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-2 bg-gradient-to-br ${step.color} text-white shadow-md`}>
              <step.icon className="h-7 w-7" />
            </div>
            <span className="text-xs font-medium text-gray-700 text-center whitespace-nowrap">{titles[index]}</span>
          </div>
          {index < 12 && <div className="flex items-center flex-1 justify-center mx-1 mb-6"><ChevronRight className="h-5 w-5 text-gray-300" /></div>}
        </div>
      ))}
    </div>
  );
}
