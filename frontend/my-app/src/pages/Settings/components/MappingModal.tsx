import { useState, useEffect } from 'react';
import { useTranslation } from '../../../stores/i18nStore';
import { toast } from '../../../stores/toastStore';
import { workflowApi } from '../../../api/workflows';
import type { Workflow, MappingForm, AvailableNodes } from '../types';

interface MappingModalProps {
  workflow: Workflow | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function MappingModal({ workflow, onClose, onSuccess }: MappingModalProps) {
  const { t } = useTranslation();
  const [mappingForm, setMappingForm] = useState<MappingForm>({
    promptNodeId: '', 
    saveImageNodeId: '',
    widthNodeId: '',
    heightNodeId: '',
    videoSaveNodeId: '',
    maxSideNodeId: '',
    referenceImageNodeId: '',
    frameCountNodeId: '',
    firstImageNodeId: '',
    lastImageNodeId: '',
    characterReferenceImageNodeId: '',
    sceneReferenceImageNodeId: ''
  });
  const [availableNodes, setAvailableNodes] = useState<AvailableNodes>({ 
    clipTextEncode: [], 
    saveImage: [], 
    easyInt: [],
    crPromptText: [],
    vhsVideoCombine: [],
    loadImage: []
  });
  const [workflowJsonData, setWorkflowJsonData] = useState<Record<string, any>>({});
  const [selectedNodeId, setSelectedNodeId] = useState<string>('');
  const [savingMapping, setSavingMapping] = useState(false);

  useEffect(() => {
    if (workflow) {
      loadWorkflowMapping(workflow);
    }
  }, [workflow]);

  const loadWorkflowMapping = async (wf: Workflow) => {
    try {
      const result = await workflowApi.fetch(wf.id);
      if (result.success && result.data) {
        const wfData = result.data as any;
        const mapping = wfData.nodeMapping || {};
        const workflowJson = wfData.workflowJson;
        
        if (workflowJson) {
          try {
            const workflowObj = typeof workflowJson === 'string' ? JSON.parse(workflowJson) : workflowJson;
            
            setWorkflowJsonData(workflowObj);
            
            const clipTextEncode: string[] = [];
            const saveImage: string[] = [];
            const easyInt: string[] = [];
            const crPromptText: string[] = [];
            const vhsVideoCombine: string[] = [];
            const loadImage: string[] = [];
            
            for (const [nodeId, node] of Object.entries(workflowObj)) {
              if (typeof node === 'object' && node !== null) {
                const classType = (node as any).class_type || '';
                const metaTitle = (node as any)._meta?.title || '';
                
                if (classType === 'CLIPTextEncode' || classType === 'CR Text') {
                  clipTextEncode.push(`${nodeId} (${metaTitle || classType})`);
                } else if (classType === 'SaveImage') {
                  saveImage.push(`${nodeId} (${metaTitle || classType})`);
                } else if (classType === 'easy int' || classType === 'JWInteger') {
                  easyInt.push(`${nodeId} (${metaTitle || classType})`);
                } else if (classType === 'CR Prompt Text') {
                  crPromptText.push(`${nodeId} (${metaTitle || classType})`);
                } else if (classType === 'VHS_VideoCombine') {
                  vhsVideoCombine.push(`${nodeId} (${metaTitle || classType})`);
                } else if (classType === 'LoadImage') {
                  loadImage.push(`${nodeId} (${metaTitle || classType})`);
                }
              }
            }
            
            setAvailableNodes({ clipTextEncode, saveImage, easyInt, crPromptText, vhsVideoCombine, loadImage });
            
            if (wf.type === 'video') {
              setMappingForm({
                promptNodeId: mapping.prompt_node_id || '',
                saveImageNodeId: '',
                widthNodeId: '',
                heightNodeId: '',
                videoSaveNodeId: mapping.video_save_node_id || '',
                maxSideNodeId: mapping.max_side_node_id || '',
                referenceImageNodeId: mapping.reference_image_node_id || '',
                frameCountNodeId: mapping.frame_count_node_id || '',
                firstImageNodeId: '',
                lastImageNodeId: '',
                characterReferenceImageNodeId: '',
                sceneReferenceImageNodeId: ''
              });
            } else if (wf.type === 'transition') {
              setMappingForm({
                promptNodeId: '',
                saveImageNodeId: '',
                widthNodeId: '',
                heightNodeId: '',
                videoSaveNodeId: mapping.video_save_node_id || '',
                maxSideNodeId: '',
                referenceImageNodeId: '',
                frameCountNodeId: mapping.frame_count_node_id || '',
                firstImageNodeId: mapping.first_image_node_id || '',
                lastImageNodeId: mapping.last_image_node_id || '',
                characterReferenceImageNodeId: '',
                sceneReferenceImageNodeId: ''
              });
            } else if (wf.type === 'shot') {
              setMappingForm({
                promptNodeId: mapping.prompt_node_id || '',
                saveImageNodeId: mapping.save_image_node_id || '',
                widthNodeId: mapping.width_node_id || '',
                heightNodeId: mapping.height_node_id || '',
                videoSaveNodeId: '',
                maxSideNodeId: '',
                referenceImageNodeId: mapping.reference_image_node_id || '',
                frameCountNodeId: '',
                firstImageNodeId: '',
                lastImageNodeId: '',
                characterReferenceImageNodeId: mapping.character_reference_image_node_id || '',
                sceneReferenceImageNodeId: mapping.scene_reference_image_node_id || ''
              });
            } else {
              setMappingForm({
                promptNodeId: mapping.prompt_node_id || '',
                saveImageNodeId: mapping.save_image_node_id || '',
                widthNodeId: '',
                heightNodeId: '',
                videoSaveNodeId: '',
                maxSideNodeId: '',
                referenceImageNodeId: '',
                frameCountNodeId: '',
                firstImageNodeId: '',
                lastImageNodeId: '',
                characterReferenceImageNodeId: '',
                sceneReferenceImageNodeId: ''
              });
            }
          } catch (e) {
            console.error('解析工作流 JSON 失败:', e);
          }
        }
      }
    } catch (error) {
      console.error('加载工作流映射失败:', error);
    }
  };

  const handleSaveMapping = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!workflow) return;
    
    setSavingMapping(true);
    try {
      let nodeMapping: Record<string, string | null> = {};
      
      if (workflow.type === 'video') {
        nodeMapping = {
          prompt_node_id: mappingForm.promptNodeId || null,
          video_save_node_id: mappingForm.videoSaveNodeId || null,
          max_side_node_id: mappingForm.maxSideNodeId || null,
          reference_image_node_id: mappingForm.referenceImageNodeId || null,
          frame_count_node_id: mappingForm.frameCountNodeId || null
        };
      } else if (workflow.type === 'transition') {
        nodeMapping = {
          first_image_node_id: mappingForm.firstImageNodeId || null,
          last_image_node_id: mappingForm.lastImageNodeId || null,
          frame_count_node_id: mappingForm.frameCountNodeId || null,
          video_save_node_id: mappingForm.videoSaveNodeId || null
        };
      } else if (workflow.type === 'shot') {
        nodeMapping = {
          prompt_node_id: mappingForm.promptNodeId || null,
          save_image_node_id: mappingForm.saveImageNodeId || null,
          width_node_id: mappingForm.widthNodeId || null,
          height_node_id: mappingForm.heightNodeId || null,
          reference_image_node_id: mappingForm.referenceImageNodeId || null,
          character_reference_image_node_id: mappingForm.characterReferenceImageNodeId || null,
          scene_reference_image_node_id: mappingForm.sceneReferenceImageNodeId || null
        };
      } else {
        nodeMapping = {
          prompt_node_id: mappingForm.promptNodeId || null,
          save_image_node_id: mappingForm.saveImageNodeId || null
        };
      }
      
      const data = await workflowApi.update(workflow.id, { nodeMapping } as any);
      
      if (data.success) {
        onClose();
        onSuccess();
        toast.success(t('systemSettings.configSaved'));
      } else {
        const errorMsg = (data as any)?.detail || t('systemSettings.configSaveFailed');
        console.error('保存映射配置失败:', data);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('保存映射配置失败:', error);
      toast.error(t('systemSettings.configSaveFailed'));
    } finally {
      setSavingMapping(false);
    }
  };

  const handleNodeSelect = (value: string, field: keyof MappingForm) => {
    setMappingForm({ ...mappingForm, [field]: value });
    if (value) setSelectedNodeId(value);
  };

  const handleNodeFocus = (value: string) => {
    if (value) setSelectedNodeId(value);
  };

  if (!workflow) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <h3 className="text-lg font-medium mb-4">
          {t('systemSettings.workflow.nodeMapping')} - {workflow.name}
        </h3>
        <div className="flex gap-4 flex-1 min-h-0">
          {/* 左侧: 选中节点的 JSON 数据显示 */}
          <div className="w-1/2 border rounded-lg overflow-hidden flex flex-col">
            <div className="bg-gray-50 px-3 py-2 border-b text-sm font-medium text-gray-700">
              {selectedNodeId ? `Node: ${selectedNodeId}` : t('systemSettings.workflow.selectNodeToView')}
            </div>
            <div className="flex-1 overflow-auto p-2 bg-gray-900">
              <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono">
                {selectedNodeId && workflowJsonData[selectedNodeId]
                  ? JSON.stringify({ [selectedNodeId]: workflowJsonData[selectedNodeId] }, null, 2)
                  : selectedNodeId 
                    ? t('systemSettings.workflow.nodeNotFound')
                    : t('systemSettings.workflow.selectNodeToView')}
              </pre>
            </div>
          </div>
          
          {/* 右侧: 映射表单 */}
          <div className="w-1/2 overflow-y-auto">
            <form onSubmit={handleSaveMapping} className="space-y-4">
              {/* 根据工作流类型显示不同的映射字段 */}
              {(workflow.type === 'character' || workflow.type === 'scene') && (
                <>
                  <NodeSelectField
                    label={t('systemSettings.workflow.promptInputNode')}
                    value={mappingForm.promptNodeId}
                    options={[...availableNodes.clipTextEncode, ...availableNodes.crPromptText]}
                    onChange={(v) => handleNodeSelect(v, 'promptNodeId')}
                    onFocus={handleNodeFocus}
                    t={t}
                  />
                  <NodeSelectField
                    label={t('systemSettings.workflow.imageSaveNode')}
                    value={mappingForm.saveImageNodeId}
                    options={availableNodes.saveImage}
                    onChange={(v) => handleNodeSelect(v, 'saveImageNodeId')}
                    onFocus={handleNodeFocus}
                    t={t}
                  />
                </>
              )}

              {workflow.type === 'shot' && (
                <>
                  <NodeSelectField
                    label={t('systemSettings.workflow.promptInputNode')}
                    value={mappingForm.promptNodeId}
                    options={[...availableNodes.clipTextEncode, ...availableNodes.crPromptText]}
                    onChange={(v) => handleNodeSelect(v, 'promptNodeId')}
                    onFocus={handleNodeFocus}
                    t={t}
                  />
                  <NodeSelectField
                    label={t('systemSettings.workflow.imageSaveNode')}
                    value={mappingForm.saveImageNodeId}
                    options={availableNodes.saveImage}
                    onChange={(v) => handleNodeSelect(v, 'saveImageNodeId')}
                    onFocus={handleNodeFocus}
                    t={t}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <NodeSelectField
                      label={t('systemSettings.workflow.widthNode')}
                      value={mappingForm.widthNodeId}
                      options={availableNodes.easyInt}
                      onChange={(v) => handleNodeSelect(v, 'widthNodeId')}
                      onFocus={handleNodeFocus}
                      t={t}
                    />
                    <NodeSelectField
                      label={t('systemSettings.workflow.heightNode')}
                      value={mappingForm.heightNodeId}
                      options={availableNodes.easyInt}
                      onChange={(v) => handleNodeSelect(v, 'heightNodeId')}
                      onFocus={handleNodeFocus}
                      t={t}
                    />
                  </div>
                  <NodeSelectField
                    label={`${t('systemSettings.workflow.referenceImageNode')} (${t('common.optional')})`}
                    value={mappingForm.referenceImageNodeId}
                    options={availableNodes.loadImage}
                    onChange={(v) => handleNodeSelect(v, 'referenceImageNodeId')}
                    onFocus={handleNodeFocus}
                    t={t}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <NodeSelectField
                      label={t('systemSettings.workflow.characterReferenceNode')}
                      value={mappingForm.characterReferenceImageNodeId}
                      options={availableNodes.loadImage}
                      onChange={(v) => handleNodeSelect(v, 'characterReferenceImageNodeId')}
                      onFocus={handleNodeFocus}
                      t={t}
                    />
                    <NodeSelectField
                      label={t('systemSettings.workflow.sceneReferenceNode')}
                      value={mappingForm.sceneReferenceImageNodeId}
                      options={availableNodes.loadImage}
                      onChange={(v) => handleNodeSelect(v, 'sceneReferenceImageNodeId')}
                      onFocus={handleNodeFocus}
                      t={t}
                    />
                  </div>
                </>
              )}

              {workflow.type === 'video' && (
                <>
                  <NodeSelectField
                    label={t('systemSettings.workflow.promptInputNode')}
                    value={mappingForm.promptNodeId}
                    options={[...availableNodes.clipTextEncode, ...availableNodes.crPromptText]}
                    onChange={(v) => handleNodeSelect(v, 'promptNodeId')}
                    onFocus={handleNodeFocus}
                    t={t}
                  />
                  <NodeSelectField
                    label={t('systemSettings.workflow.videoSaveNode')}
                    value={mappingForm.videoSaveNodeId}
                    options={availableNodes.vhsVideoCombine}
                    onChange={(v) => handleNodeSelect(v, 'videoSaveNodeId')}
                    onFocus={handleNodeFocus}
                    t={t}
                  />
                  <NodeSelectField
                    label={t('systemSettings.workflow.maxSideNode')}
                    value={mappingForm.maxSideNodeId}
                    options={availableNodes.easyInt}
                    onChange={(v) => handleNodeSelect(v, 'maxSideNodeId')}
                    onFocus={handleNodeFocus}
                    t={t}
                  />
                  <NodeSelectField
                    label={t('systemSettings.workflow.referenceImageNode')}
                    value={mappingForm.referenceImageNodeId}
                    options={availableNodes.loadImage}
                    onChange={(v) => handleNodeSelect(v, 'referenceImageNodeId')}
                    onFocus={handleNodeFocus}
                    t={t}
                  />
                  <NodeSelectField
                    label={t('systemSettings.workflow.frameCountNode')}
                    value={mappingForm.frameCountNodeId}
                    options={availableNodes.easyInt}
                    onChange={(v) => handleNodeSelect(v, 'frameCountNodeId')}
                    onFocus={handleNodeFocus}
                    t={t}
                  />
                </>
              )}

              {workflow.type === 'transition' && (
                <>
                  <NodeSelectField
                    label={t('systemSettings.workflow.firstImageNode')}
                    value={mappingForm.firstImageNodeId}
                    options={availableNodes.loadImage}
                    onChange={(v) => handleNodeSelect(v, 'firstImageNodeId')}
                    onFocus={handleNodeFocus}
                    t={t}
                  />
                  <NodeSelectField
                    label={t('systemSettings.workflow.lastImageNode')}
                    value={mappingForm.lastImageNodeId}
                    options={availableNodes.loadImage}
                    onChange={(v) => handleNodeSelect(v, 'lastImageNodeId')}
                    onFocus={handleNodeFocus}
                    t={t}
                  />
                  <NodeSelectField
                    label={t('systemSettings.workflow.videoSaveNode')}
                    value={mappingForm.videoSaveNodeId}
                    options={availableNodes.vhsVideoCombine}
                    onChange={(v) => handleNodeSelect(v, 'videoSaveNodeId')}
                    onFocus={handleNodeFocus}
                    t={t}
                  />
                  <NodeSelectField
                    label={t('systemSettings.workflow.frameCountNode')}
                    value={mappingForm.frameCountNodeId}
                    options={availableNodes.easyInt}
                    onChange={(v) => handleNodeSelect(v, 'frameCountNodeId')}
                    onFocus={handleNodeFocus}
                    t={t}
                  />
                </>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={savingMapping}
                  className="btn-primary"
                >
                  {savingMapping ? t('common.loading') : t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// 节点选择字段组件
interface NodeSelectFieldProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  onFocus: (value: string) => void;
  t: (key: string, options?: any) => string;
}

function NodeSelectField({ label, value, options, onChange, onFocus, t }: NodeSelectFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => onFocus(value)}
        className="input-field"
      >
        <option value="">-- {t('common.select')} --</option>
        {options.map(node => (
          <option key={node} value={node.split(' ')[0]}>{node}</option>
        ))}
      </select>
    </div>
  );
}
