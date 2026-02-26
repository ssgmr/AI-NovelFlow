/**
 * 图片预览 Hook
 * 提供图片预览弹窗的状态管理和导航功能
 */
import { useState, useCallback } from 'react';

export interface ImagePreviewState {
  isOpen: boolean;
  url: string | null;
  name: string;
  id: string | null;
}

const initialState: ImagePreviewState = {
  isOpen: false,
  url: null,
  name: '',
  id: null,
};

export function useImagePreview<T extends { id: string; imageUrl?: string; name: string }>() {
  const [preview, setPreview] = useState<ImagePreviewState>(initialState);

  const openPreview = useCallback((url: string, name: string, id: string) => {
    setPreview({ isOpen: true, url, name, id });
  }, []);

  const closePreview = useCallback(() => {
    setPreview(initialState);
  }, []);

  const navigatePreview = useCallback((direction: 'prev' | 'next', items: T[]) => {
    if (!preview.id) return;
    
    const itemsWithImages = items.filter(item => item.imageUrl);
    const currentIndex = itemsWithImages.findIndex(item => item.id === preview.id);
    
    if (currentIndex === -1) return;
    
    let newIndex: number;
    if (direction === 'prev') {
      newIndex = currentIndex === 0 ? itemsWithImages.length - 1 : currentIndex - 1;
    } else {
      newIndex = currentIndex === itemsWithImages.length - 1 ? 0 : currentIndex + 1;
    }
    
    const newItem = itemsWithImages[newIndex];
    setPreview({
      isOpen: true,
      url: newItem.imageUrl!,
      name: newItem.name,
      id: newItem.id
    });
  }, [preview.id]);

  return {
    preview,
    openPreview,
    closePreview,
    navigatePreview,
  };
}
