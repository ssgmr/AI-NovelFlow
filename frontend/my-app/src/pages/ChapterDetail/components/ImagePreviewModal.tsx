import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useTranslation } from '../../../stores/i18nStore';
import type { PreviewImageState } from '../types';

interface ImagePreviewModalProps {
  previewImage: PreviewImageState;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export function ImagePreviewModal({ previewImage, onClose, onNavigate }: ImagePreviewModalProps) {
  const { t } = useTranslation();
  if (!previewImage.isOpen || !previewImage.url) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="relative max-w-5xl max-h-[90vh] w-full flex items-center">
        <button onClick={(e) => { e.stopPropagation(); onNavigate('prev'); }}
          className="absolute -left-16 top-1/2 -translate-y-1/2 p-3 text-white hover:text-gray-300 hover:bg-white/10 rounded-full transition-all" title={t('chapterDetail.prevImage')}>
          <ChevronLeft className="h-10 w-10" />
        </button>
        <div className="flex-1">
          <button onClick={onClose} className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors">
            <X className="h-8 w-8" />
          </button>
          <img src={previewImage.url} alt={t('chapterDetail.imagePreview')}
            className="w-full h-full object-contain max-h-[80vh] rounded-lg" onClick={(e) => e.stopPropagation()} />
          <div className="mt-4 text-center text-gray-400 text-sm">
            <span className="inline-flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">←</kbd>
              <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">→</kbd>
              <span>{t('chapterDetail.keyboardNavigation')}</span>
              <span className="mx-2">|</span>
              <span>{previewImage.index + 1} / {previewImage.images.length}</span>
            </span>
          </div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onNavigate('next'); }}
          className="absolute -right-16 top-1/2 -translate-y-1/2 p-3 text-white hover:text-gray-300 hover:bg-white/10 rounded-full transition-all" title={t('chapterDetail.nextImage')}>
          <ChevronRight className="h-10 w-10" />
        </button>
      </div>
    </div>
  );
}
