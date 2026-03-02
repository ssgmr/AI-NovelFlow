import { Code, Grid3x3, Save, Loader2 } from 'lucide-react';
import { useTranslation } from '../../../stores/i18nStore';
import JsonTableEditor from './JsonTableEditor';
import type { DialogueData } from '../types';

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  editMode: 'text' | 'table';
  onEditModeChange: (mode: 'text' | 'table') => void;
  isSaving: boolean;
  editorKey: number;
  availableScenes: string[];
  availableCharacters: string[];
  availableProps: string[];
  activeShotWorkflow: any;
  // 音频相关
  audioUrls?: Record<string, string>;
  audioSources?: Record<string, string>;
  isShotAudioGenerating?: (shotIndex: number) => boolean;
  getShotAudioTasks?: (shotIndex: number) => Array<{ characterName: string; status: string; taskId: string }>;
  onRegenerateAudio?: (shotIndex: number, characterName: string, dialogue: DialogueData) => void;
  onGenerateDialogueAudio?: (shotIndex: number, dialogue: DialogueData) => void;
  // 音频上传相关
  onUploadDialogueAudio?: (shotIndex: number, characterName: string, file: File) => void;
  onDeleteDialogueAudio?: (shotIndex: number, characterName: string) => void;
  isAudioUploading?: (shotIndex: number, characterName: string) => boolean;
}

/**
 * JSON 编辑器组件
 */
export function JsonEditor({
  value,
  onChange,
  onSave,
  editMode,
  onEditModeChange,
  isSaving,
  editorKey,
  availableScenes,
  availableCharacters,
  availableProps,
  activeShotWorkflow,
  audioUrls,
  audioSources,
  isShotAudioGenerating,
  getShotAudioTasks,
  onRegenerateAudio,
  onGenerateDialogueAudio,
  onUploadDialogueAudio,
  onDeleteDialogueAudio,
  isAudioUploading,
}: JsonEditorProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onEditModeChange('text')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              editMode === 'text' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Code className="h-4 w-4" />
            {t('chapterGenerate.jsonText')}
          </button>
          <button
            onClick={() => onEditModeChange('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              editMode === 'table' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Grid3x3 className="h-4 w-4" />
            {t('chapterGenerate.tableEdit')}
          </button>
        </div>
        <button
          onClick={onSave}
          disabled={isSaving || !value.trim()}
          className="btn-primary text-sm py-2 px-4 disabled:opacity-50"
        >
          {isSaving ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t('common.saving')}</>
          ) : (
            <><Save className="h-4 w-4 mr-2" />{t('chapterGenerate.saveChanges')}</>
          )}
        </button>
      </div>
      
      {editMode === 'text' ? (
        <textarea
          className="w-full h-64 bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t('chapterGenerate.jsonPlaceholder')}
          spellCheck={false}
        />
      ) : (
        <JsonTableEditor
          key={editorKey}
          value={value}
          onChange={onChange}
          availableScenes={availableScenes}
          availableCharacters={availableCharacters}
          availableProps={availableProps}
          activeShotWorkflow={activeShotWorkflow}
          audioUrls={audioUrls}
          audioSources={audioSources}
          isShotAudioGenerating={isShotAudioGenerating}
          getShotAudioTasks={getShotAudioTasks}
          onRegenerateAudio={onRegenerateAudio}
          onGenerateDialogueAudio={onGenerateDialogueAudio}
          onUploadDialogueAudio={onUploadDialogueAudio}
          onDeleteDialogueAudio={onDeleteDialogueAudio}
          isAudioUploading={isAudioUploading}
        />
      )}
    </div>
  );
}