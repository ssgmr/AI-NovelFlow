import { Loader2, Plus, Save, X, FileText, BookOpen } from 'lucide-react';
import { useTranslation } from '../../stores/i18nStore';
import type { PromptTemplate } from '../../types';
import type { TemplateType } from './types';
import { usePromptConfigState } from './hooks/usePromptConfigState';
import { TemplateCard } from './components/TemplateCard';
import { EditModal } from './components/EditModal';
import { ViewModal } from './components/ViewModal';

// 获取模板显示名称
const getTemplateDisplayName = (template: PromptTemplate, t: any): string => {
  if (template.isSystem && template.nameKey) return t(template.nameKey, { defaultValue: template.name });
  return template.name;
};

// 获取模板显示描述
const getTemplateDisplayDescription = (template: PromptTemplate, t: any): string => {
  if (template.isSystem && template.descriptionKey) return t(template.descriptionKey, { defaultValue: template.description });
  return template.description;
};

// 渲染模板列表
function TemplateList({
  templates, loading, type, onView, onEdit, onCopy, onDelete, getDisplayName, getDisplayDescription
}: {
  templates: PromptTemplate[];
  loading: boolean;
  type: TemplateType;
  onView: (t: PromptTemplate) => void;
  onEdit: (type: TemplateType, t: PromptTemplate) => void;
  onCopy: (t: PromptTemplate) => void;
  onDelete: (t: PromptTemplate) => void;
  getDisplayName: (t: PromptTemplate) => string;
  getDisplayDescription: (t: PromptTemplate) => string;
}) {
  const { t } = useTranslation();
  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>;
  if (templates.length === 0) return <p className="text-sm text-gray-500 py-4">{t('promptConfig.noTemplates')}</p>;
  return (
    <div className="space-y-3">
      {templates.map((template) => (
        <TemplateCard key={template.id} template={template} type={type} onView={onView} onEdit={onEdit}
          onCopy={onCopy} onDelete={onDelete} getDisplayName={getDisplayName} getDisplayDescription={getDisplayDescription} />
      ))}
    </div>
  );
}

export default function PromptConfig() {
  const { t } = useTranslation();
  const state = usePromptConfigState();
  const displayName = (tp: PromptTemplate) => getTemplateDisplayName(tp, t);
  const displayDesc = (tp: PromptTemplate) => getTemplateDisplayDescription(tp, t);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('promptConfig.title')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('promptConfig.subtitle')}</p>
      </div>

      {/* AI解析角色系统提示词 */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 className="text-lg font-semibold text-gray-900">{t('promptConfig.parseCharactersPrompt')}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={state.handleResetParsePrompt}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
              <X className="h-4 w-4" />{t('promptConfig.resetToDefault')}
            </button>
            <button onClick={state.handleSaveParsePrompt} disabled={state.savingParsePrompt}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors disabled:opacity-50">
              <Save className="h-4 w-4" />{state.savingParsePrompt ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </div>
        <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-md">
          <p className="text-xs text-red-600 font-medium flex items-center gap-1">
            <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {t('promptConfig.jsonStructureWarning')}
          </p>
        </div>
        <textarea rows={12} value={state.parsePrompt} onChange={(e) => state.setParsePrompt(e.target.value)}
          className="input-field font-mono text-sm w-full" placeholder="输入 AI 解析角色时的系统提示词..." />
        <p className="text-xs text-gray-500 mt-2">{t('promptConfig.promptTip')}</p>
      </div>

      {/* AI角色提示词管理 */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">{t('promptConfig.characterPrompts')}</h2>
          </div>
          <button onClick={() => state.openModal('character')}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors">
            <Plus className="h-4 w-4" />{t('promptConfig.newPrompt')}
          </button>
        </div>
        <TemplateList templates={state.characterTemplates} loading={state.loadingCharacter} type="character"
          onView={state.openViewModal} onEdit={state.openModal} onCopy={state.handleCopy} onDelete={state.handleDelete}
          getDisplayName={displayName} getDisplayDescription={displayDesc} />
      </div>

      {/* AI拆分分镜提示词管理 */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-900">{t('promptConfig.chapterSplitPrompts')}</h2>
          </div>
          <button onClick={() => state.openModal('chapter_split')}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors">
            <Plus className="h-4 w-4" />{t('promptConfig.newPrompt')}
          </button>
        </div>
        <TemplateList templates={state.chapterSplitTemplates} loading={state.loadingChapterSplit} type="chapter_split"
          onView={state.openViewModal} onEdit={state.openModal} onCopy={state.handleCopy} onDelete={state.handleDelete}
          getDisplayName={displayName} getDisplayDescription={displayDesc} />
      </div>

      <EditModal show={state.showModal} onClose={() => state.setShowModal(false)} onSave={state.handleSave}
        modalType={state.modalType} editingPrompt={state.editingPrompt} form={state.form} setForm={state.setForm} saving={state.saving} />

      <ViewModal show={state.showViewModal} template={state.viewingPrompt} onClose={() => state.setShowViewModal(false)}
        onCopy={state.handleCopy} getDisplayName={displayName} getDisplayDescription={displayDesc} />
    </div>
  );
}
