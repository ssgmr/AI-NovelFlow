import { useState, useEffect } from 'react';
import { useTranslation } from '../../../stores/i18nStore';
import { toast } from '../../../stores/toastStore';
import JSONEditor from '../../../components/JSONEditor';
import { workflowApi } from '../../../api/workflows';
import type { Workflow } from '../types';

interface EditModalProps {
  workflow: Workflow | null;
  onClose: () => void;
  onSuccess: () => void;
  extensionConfigs: Record<string, any>;
}

export function EditModal({ workflow, onClose, onSuccess, extensionConfigs }: EditModalProps) {
  const { t } = useTranslation();
  const [editForm, setEditForm] = useState({ name: '', description: '', workflowJson: '' });
  const [editExtension, setEditExtension] = useState<Record<string, string> | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    if (workflow) {
      loadWorkflowDetail(workflow);
    }
  }, [workflow]);

  const loadWorkflowDetail = async (wf: Workflow) => {
    setLoadingEdit(true);
    try {
      const result = await workflowApi.fetch(wf.id);
      if (result.success && result.data) {
        const wfData = result.data as any;
        let formattedJson = '';
        if (wfData.workflowJson) {
          try {
            const parsed = JSON.parse(wfData.workflowJson);
            formattedJson = JSON.stringify(parsed, null, 2);
          } catch {
            formattedJson = wfData.workflowJson;
          }
        }
        const displayName = wfData.isSystem && wfData.nameKey 
          ? t(wfData.nameKey, { defaultValue: wfData.name })
          : wfData.name;
        const displayDescription = wfData.isSystem && wfData.descriptionKey
          ? t(wfData.descriptionKey, { defaultValue: wfData.description || '' })
          : wfData.description || '';
        
        setEditForm({
          name: displayName,
          description: displayDescription,
          workflowJson: formattedJson
        });
        
        if (wfData.extension) {
          setEditExtension(wfData.extension);
        } else {
          setEditExtension(null);
        }
      } else {
        toast.error(result.message || t('systemSettings.workflow.loadingFailed'));
        onClose();
      }
    } catch (error) {
      console.error('加载工作流详情失败:', error);
      toast.error(t('systemSettings.workflow.loadingFailed'));
      onClose();
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!workflow) return;
    
    setSavingEdit(true);
    
    try {
      let payload: any = {
        name: editForm.name,
        description: editForm.description
      };
      
      if (!workflow.isSystem && editForm.workflowJson) {
        try {
          JSON.parse(editForm.workflowJson);
          payload.workflowJson = editForm.workflowJson;
        } catch {
          toast.error('JSON ' + t('common.error'));
          setSavingEdit(false);
          return;
        }
      }
      
      if (editExtension) {
        payload.extension = editExtension;
      }
      
      const data = await workflowApi.update(workflow.id, payload);
      if (data.success) {
        onClose();
        onSuccess();
        toast.success(t('systemSettings.configSaved'));
      } else {
        toast.error((data as any).detail || t('systemSettings.configSaveFailed'));
      }
    } catch (error) {
      console.error('保存失败:', error);
      toast.error(t('systemSettings.configSaveFailed'));
    } finally {
      setSavingEdit(false);
    }
  };

  if (!workflow) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-medium mb-4">{t('common.edit')}</h3>
        {loadingEdit ? (
          <div className="text-center py-8">{t('common.loading')}</div>
        ) : (
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('systemSettings.workflow.name')}
              </label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('systemSettings.workflow.description')}
              </label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="input-field"
                rows={2}
              />
            </div>
            {/* 扩展属性编辑 */}
            {extensionConfigs[workflow.type] && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t(extensionConfigs[workflow.type].labelKey, { defaultValue: extensionConfigs[workflow.type].label })}
                </label>
                <div className="flex gap-2">
                  {extensionConfigs[workflow.type].options.map((option: any) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        const config = extensionConfigs[workflow.type];
                        setEditExtension({ [config.name]: option.value });
                      }}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        editExtension?.[extensionConfigs[workflow.type].name] === option.value
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {t(option.labelKey, { defaultValue: option.label })}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Workflow JSON
              </label>
              <JSONEditor
                value={editForm.workflowJson}
                onChange={(value) => setEditForm({ ...editForm, workflowJson: value })}
                readOnly={workflow.isSystem}
                height={"300px"}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                {workflow.isSystem ? t('common.close') : t('common.cancel')}
              </button>
              {!workflow.isSystem && (
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="btn-primary"
                >
                  {savingEdit ? t('common.loading') : t('common.save')}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
