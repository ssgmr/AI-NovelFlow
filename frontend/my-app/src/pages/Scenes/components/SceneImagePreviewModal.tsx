/**
 * 场景图片预览弹窗组件
 */
import { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '../../../stores/i18nStore';
import type { Scene } from '../../../types';

interface SceneImagePreviewModalProps {
  isOpen: boolean;
  url: string | null;
  name: string;
  sceneId: string | null;
  scenesWithImages: Scene[];
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export function SceneImagePreviewModal({
  isOpen,
  url,
  name,
  sceneId,
  scenesWithImages,
  onClose,
  onNavigate,
}: SceneImagePreviewModalProps) {
  const { t } = useTranslation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onNavigate('prev');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNavigate('next');
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, sceneId, onNavigate, onClose]);

  if (!isOpen || !url) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center">
        <img 
          src={url} 
          alt={name}
          className="max-w-full max-h-[80vh] object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />
        
        {/* 导航按钮 */}
        {scenesWithImages.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onNavigate('prev'); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onNavigate('next'); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
        
        {/* 场景名称 */}
        <div className="mt-3 text-white text-lg font-medium">
          {name}
        </div>
        
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 p-2 text-white hover:text-gray-300 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
        
        <div className="mt-4 text-white text-sm opacity-60">
          {t('scenes.previous')} / {t('scenes.next')}
        </div>
      </div>
    </div>
  );
}
