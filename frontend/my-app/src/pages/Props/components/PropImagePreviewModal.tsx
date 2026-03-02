/**
 * 道具图片预览弹窗组件
 */
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '../../../stores/i18nStore';
import type { Prop } from '../../../types';

interface PropImagePreviewModalProps {
  isOpen: boolean;
  url: string | null;
  name: string;
  propId: string | null;
  propsWithImages: Prop[];
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export function PropImagePreviewModal({
  isOpen,
  url,
  name,
  propId,
  propsWithImages,
  onClose,
  onNavigate,
}: PropImagePreviewModalProps) {
  const { t } = useTranslation();

  if (!isOpen || !url) return null;

  const currentIndex = propsWithImages.findIndex(p => p.id === propId);
  const hasMultiple = propsWithImages.length > 1;

  // 键盘导航
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      onNavigate('prev');
    } else if (e.key === 'ArrowRight') {
      onNavigate('next');
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div 
        className="relative max-w-4xl max-h-[90vh] w-full"
        onClick={e => e.stopPropagation()}
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        {/* 图片信息 */}
        <div className="text-white text-center mb-2">
          <span className="font-medium">{name}</span>
          {hasMultiple && (
            <span className="text-gray-400 ml-2">
              ({currentIndex + 1} / {propsWithImages.length})
            </span>
          )}
        </div>

        {/* 图片容器 */}
        <div className="bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center" style={{ maxHeight: 'calc(90vh - 60px)' }}>
          <img
            src={url}
            alt={name}
            className="max-w-full max-h-[calc(90vh-80px)] object-contain"
          />
        </div>

        {/* 导航按钮 */}
        {hasMultiple && (
          <>
            <button
              onClick={() => onNavigate('prev')}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              title={t('props.previous')}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={() => onNavigate('next')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              title={t('props.next')}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* 导航提示 */}
        {hasMultiple && (
          <div className="text-center mt-4 text-gray-400 text-sm">
            {t('props.previous')} / {t('props.next')}
          </div>
        )}
      </div>
    </div>
  );
}
