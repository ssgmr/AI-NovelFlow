import { Code, Grid3x3, Save, Loader2 } from 'lucide-react';
import { useTranslation } from '../../../stores/i18nStore';
import JsonTableEditor from './JsonTableEditor';

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
  activeShotWorkflow: any;
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
  activeShotWorkflow,
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
          activeShotWorkflow={activeShotWorkflow}
        />
      )}
    </div>
  );
}
