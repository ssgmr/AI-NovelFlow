import { Sparkles, Loader2 } from 'lucide-react';
import { useTranslation } from '../../../stores/i18nStore';
import type { ChapterRange, ConfirmDialogState } from '../types';

interface ParseConfirmDialogProps {
  isOpen: boolean;
  confirmDialog: ConfirmDialogState;
  chapterRange: ChapterRange;
  parsingNovelId: string | null;
  parsingScenesNovelId: string | null;
  onClose: () => void;
  onConfirmCharacters: () => void;
  onConfirmScenes: () => void;
  onChapterRangeChange: (range: ChapterRange) => void;
}

export function ParseConfirmDialog({
  isOpen,
  confirmDialog,
  chapterRange,
  parsingNovelId,
  parsingScenesNovelId,
  onClose,
  onConfirmCharacters,
  onConfirmScenes,
  onChapterRangeChange,
}: ParseConfirmDialogProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const isCharacters = confirmDialog.type === 'characters';
  const isParsing = isCharacters
    ? parsingNovelId === confirmDialog.novelId
    : parsingScenesNovelId === confirmDialog.novelId;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-full ${isCharacters ? 'bg-purple-100' : 'bg-teal-100'}`}>
            <Sparkles className={`h-6 w-6 ${isCharacters ? 'text-purple-600' : 'text-teal-600'}`} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {isCharacters ? t('novels.aiParseCharactersTitle') : t('novels.aiParseScenesTitle')}
          </h3>
        </div>

        <p className="text-gray-600 mb-4">
          {isCharacters ? t('novels.parseConfirmMessage') : t('novels.parseScenesConfirmMessage')}
        </p>

        <div className="mb-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('novels.chapterRange')}</label>
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="number"
                  min="1"
                  placeholder={t('novels.startChapter')}
                  value={chapterRange.startChapter || ''}
                  onChange={(e) => onChapterRangeChange({
                    ...chapterRange,
                    startChapter: e.target.value ? parseInt(e.target.value) : null
                  })}
                  className="input-field w-full text-sm"
                />
              </div>
              <div className="flex items-center text-gray-400">-</div>
              <div className="flex-1">
                <input
                  type="number"
                  min="1"
                  placeholder={t('novels.endChapter')}
                  value={chapterRange.endChapter || ''}
                  onChange={(e) => onChapterRangeChange({
                    ...chapterRange,
                    endChapter: e.target.value ? parseInt(e.target.value) : null
                  })}
                  className="input-field w-full text-sm"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{t('novels.parseEntireNovel')}</p>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={chapterRange.isIncremental}
                onChange={(e) => onChapterRangeChange({
                  ...chapterRange,
                  isIncremental: e.target.checked
                })}
                className={`rounded focus:ring-0 ${isCharacters ? 'text-purple-600 focus:ring-purple-500' : 'text-teal-600 focus:ring-teal-500'}`}
              />
              <span className="text-sm text-gray-700">{t('novels.incrementalUpdate')}</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">{t('novels.incrementalUpdateDesc')}</p>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-6">{t('novels.parseConfirmHint')}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={isCharacters ? onConfirmCharacters : onConfirmScenes}
            className={`px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2 ${isCharacters ? 'bg-purple-600 hover:bg-purple-700' : 'bg-teal-600 hover:bg-teal-700'}`}
          >
            {isParsing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('novels.parseInProgress')}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {t('common.confirm')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
