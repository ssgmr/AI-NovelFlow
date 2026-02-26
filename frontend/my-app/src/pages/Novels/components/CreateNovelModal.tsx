import { useTranslation } from '../../../stores/i18nStore';
import { ASPECT_RATIO_OPTIONS } from '../../../utils';
import type { PromptTemplate } from '../../../types';
import type { NovelFormData } from '../types';

interface CreateNovelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: NovelFormData;
  setFormData: React.Dispatch<React.SetStateAction<NovelFormData>>;
  promptTemplates: PromptTemplate[];
  chapterSplitTemplates: PromptTemplate[];
  getTemplateDisplayName: (template: PromptTemplate | undefined) => string;
}

export function CreateNovelModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  promptTemplates,
  chapterSplitTemplates,
  getTemplateDisplayName,
}: CreateNovelModalProps) {
  const { t } = useTranslation();

  const aspectRatioOptions = ASPECT_RATIO_OPTIONS.map(opt => ({
    value: opt.value,
    label: `${opt.value} (${t(opt.labelKey)})`,
    description: t(opt.descKey)
  }));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('novels.createNovelTitle')}</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('novels.titleLabel')}</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-field mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('novels.authorLabel')}</label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="input-field mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('novels.descriptionLabel')}</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('novels.characterPromptLabel')}</label>
            <select
              value={formData.promptTemplateId}
              onChange={(e) => setFormData({ ...formData, promptTemplateId: e.target.value })}
              className="input-field mt-1"
            >
              {promptTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {getTemplateDisplayName(template)} {template.isSystem ? t('novels.systemTemplate') : t('novels.customTemplate')}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">{t('novels.characterPromptHint')}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('novels.splitPromptLabel')}</label>
            <select
              value={formData.chapterSplitPromptTemplateId}
              onChange={(e) => setFormData({ ...formData, chapterSplitPromptTemplateId: e.target.value })}
              className="input-field mt-1"
            >
              {chapterSplitTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {getTemplateDisplayName(template)} {template.isSystem ? t('novels.systemTemplate') : t('novels.customTemplate')}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">{t('novels.splitPromptHint')}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('novels.aspectRatioLabel')}</label>
            <select
              value={formData.aspectRatio}
              onChange={(e) => setFormData({ ...formData, aspectRatio: e.target.value })}
              className="input-field mt-1"
            >
              {aspectRatioOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {aspectRatioOptions.find(o => o.value === formData.aspectRatio)?.description}
            </p>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} className="btn-secondary">{t('common.cancel')}</button>
            <button type="submit" className="btn-primary">{t('common.create')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
