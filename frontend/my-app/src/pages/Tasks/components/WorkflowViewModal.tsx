import { Loader2, X } from 'lucide-react';
import { useTranslation } from '../../../stores/i18nStore';
import JSONEditor from '../../../components/JSONEditor';
import type { Task } from '../../../types';
import type { WorkflowData } from '../types';

interface WorkflowViewModalProps {
  viewingWorkflow: Task | null;
  workflowData: WorkflowData | null;
  loadingWorkflow: boolean;
  onClose: () => void;
  convertShotName: (name: string) => string;
}

export function WorkflowViewModal({
  viewingWorkflow,
  workflowData,
  loadingWorkflow,
  onClose,
  convertShotName,
}: WorkflowViewModalProps) {
  const { t } = useTranslation();

  if (!viewingWorkflow) return null;

  const getTaskLocalizedName = () => {
    const nameMatch = viewingWorkflow.name.match(/^[^:]+:\s*(.+)$/);
    const actualName = nameMatch ? nameMatch[1] : viewingWorkflow.name;
    const localizedName = convertShotName(actualName);
    switch (viewingWorkflow.type) {
      case 'character_portrait':
        return t('tasks.taskNames.characterPortrait', { name: localizedName });
      case 'shot_image':
        return t('tasks.taskNames.shotImage', { name: localizedName });
      case 'shot_video':
        return t('tasks.taskNames.shotVideo', { name: localizedName });
      case 'transition_video':
        return t('tasks.taskNames.transitionVideo', { from: localizedName, to: '' });
      case 'chapter_video':
        return t('tasks.taskNames.chapterVideo', { name: localizedName });
      default:
        return viewingWorkflow.name;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {t('tasks.workflowDetails')}
            <span className="ml-2 text-sm font-normal text-gray-500">{getTaskLocalizedName()}</span>
          </h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {loadingWorkflow ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        ) : workflowData ? (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">{t('tasks.generationPrompt')}</h4>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 font-mono whitespace-pre-wrap break-all">{workflowData.prompt}</p>
              </div>
            </div>
            {workflowData.workflow && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">{t('tasks.workflowJSON')}</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <JSONEditor
                    value={typeof workflowData.workflow === 'string' ? workflowData.workflow : JSON.stringify(workflowData.workflow, null, 2)}
                    onChange={() => {}}
                    readOnly={true}
                    height="50vh"
                  />
                </div>
              </div>
            )}
            <div className="flex justify-end pt-4">
              <button onClick={onClose} className="btn-secondary">{t('common.close')}</button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">{t('tasks.failedToLoadWorkflow')}</div>
        )}
      </div>
    </div>
  );
}
