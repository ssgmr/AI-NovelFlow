import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from '../../../stores/i18nStore';

interface ImagePreviewModalProps {
  imageUrl: string;
  onClose: () => void;
}

export function ImagePreviewModal({ imageUrl, onClose }: ImagePreviewModalProps) {
  const { t } = useTranslation();
  const [info, setInfo] = useState<{ width: number; height: number; size?: string } | null>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setInfo(prev => ({ ...prev, width: img.naturalWidth, height: img.naturalHeight }));
    };
    img.src = imageUrl;

    fetch(imageUrl, { method: 'HEAD' })
      .then(res => {
        const contentLength = res.headers.get('content-length');
        if (contentLength) {
          const size = parseInt(contentLength);
          const sizeStr = size > 1024 * 1024
            ? `${(size / 1024 / 1024).toFixed(2)} MB`
            : size > 1024 ? `${(size / 1024).toFixed(1)} KB` : `${size} B`;
          setInfo(prev => ({ ...prev, size: sizeStr } as any));
        }
      })
      .catch(() => {});
  }, [imageUrl]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center">
        <img
          src={imageUrl}
          alt={t('tasks.preview')}
          className="max-w-full max-h-[80vh] object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />
        {info && (
          <div className="mt-3 text-white text-sm opacity-80 flex items-center gap-4">
            <span>{t('tasks.dimensions')}: {info.width} × {info.height} px</span>
            {info.size && <span>{t('tasks.size')}: {info.size}</span>}
          </div>
        )}
        <button onClick={onClose} className="absolute -top-10 right-0 p-2 text-white hover:text-gray-300 transition-colors">
          <X className="h-6 w-6" />
        </button>
        <div className="mt-4 text-white text-sm opacity-60">{t('tasks.clickOutsideToClose')}</div>
      </div>
    </div>
  );
}

interface VideoPreviewModalProps {
  videoUrl: string;
  onClose: () => void;
}

export function VideoPreviewModal({ videoUrl, onClose }: VideoPreviewModalProps) {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center w-full">
        <video src={videoUrl} controls autoPlay className="max-w-full max-h-[80vh] rounded-lg" onClick={(e) => e.stopPropagation()} />
        <button onClick={onClose} className="absolute -top-10 right-0 p-2 text-white hover:text-gray-300 transition-colors">
          <X className="h-6 w-6" />
        </button>
        <div className="mt-4 text-white text-sm opacity-60">{t('tasks.clickOutsideToCloseVideo')}</div>
      </div>
    </div>
  );
}
