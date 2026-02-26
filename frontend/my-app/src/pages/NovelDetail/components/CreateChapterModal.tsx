import { X } from 'lucide-react';
import { useTranslation } from '../../../stores/i18nStore';

interface CreateChapterModalProps {
  show: boolean;
  newChapter: { title: string; content: string; number: number };
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  setNewChapter: React.Dispatch<React.SetStateAction<{ title: string; content: string; number: number }>>;
}

export function CreateChapterModal({ show, newChapter, onClose, onSubmit, setNewChapter }: CreateChapterModalProps) {
  const { t } = useTranslation();
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{t('novelDetail.addChapter')}</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('novelDetail.chapterNumber')}</label>
            <input type="number" min={1} value={newChapter.number}
              onChange={(e) => setNewChapter({ ...newChapter, number: parseInt(e.target.value) })} className="input-field mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('novelDetail.chapterName')}</label>
            <input type="text" required value={newChapter.title}
              onChange={(e) => setNewChapter({ ...newChapter, title: e.target.value })}
              className="input-field mt-1" placeholder={t('novelDetail.chapterNamePlaceholder')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('novelDetail.chapterContent')}</label>
            <textarea rows={6} value={newChapter.content}
              onChange={(e) => setNewChapter({ ...newChapter, content: e.target.value })}
              className="input-field mt-1" placeholder={t('novelDetail.chapterContentPlaceholder')} />
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
