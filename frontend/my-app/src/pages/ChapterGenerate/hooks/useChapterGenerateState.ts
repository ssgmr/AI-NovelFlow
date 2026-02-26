import { useState } from 'react';

/**
 * 章节生成页面的 UI 状态管理 Hook
 */
export default function useChapterGenerateState() {
  // 标签页状态
  const [activeTab, setActiveTab] = useState<'json' | 'characters' | 'scenes' | 'script'>('json');
  
  // 分镜/视频导航状态
  const [currentShot, setCurrentShot] = useState(1);
  const [currentVideo, setCurrentVideo] = useState(1);
  
  // JSON 编辑器状态
  const [jsonEditMode, setJsonEditMode] = useState<'text' | 'table'>('text');
  const [editorKey, setEditorKey] = useState<number>(0);
  
  // 弹窗状态
  const [showFullTextModal, setShowFullTextModal] = useState(false);
  const [showMergedImageModal, setShowMergedImageModal] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [previewImageIndex, setPreviewImageIndex] = useState<number>(0);
  
  // 合并图片状态
  const [mergedImage, setMergedImage] = useState<string | null>(null);
  const [isMerging, setIsMerging] = useState(false);
  
  // 确认对话框状态
  const [splitConfirmDialog, setSplitConfirmDialog] = useState<{ isOpen: boolean; hasResources: boolean }>({
    isOpen: false,
    hasResources: false
  });
  
  // 转场配置状态
  const [showTransitionConfig, setShowTransitionConfig] = useState<boolean>(false);
  
  // 生成状态
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSplitting, setIsSplitting] = useState(false);
  const [isSavingJson, setIsSavingJson] = useState(false);

  return {
    // 标签页
    activeTab,
    setActiveTab,
    
    // 导航
    currentShot,
    setCurrentShot,
    currentVideo,
    setCurrentVideo,
    
    // JSON 编辑器
    jsonEditMode,
    setJsonEditMode,
    editorKey,
    setEditorKey,
    
    // 弹窗
    showFullTextModal,
    setShowFullTextModal,
    showMergedImageModal,
    setShowMergedImageModal,
    showImagePreview,
    setShowImagePreview,
    previewImageUrl,
    setPreviewImageUrl,
    previewImageIndex,
    setPreviewImageIndex,
    
    // 合并图片
    mergedImage,
    setMergedImage,
    isMerging,
    setIsMerging,
    
    // 确认对话框
    splitConfirmDialog,
    setSplitConfirmDialog,
    
    // 转场配置
    showTransitionConfig,
    setShowTransitionConfig,
    
    // 生成状态
    isGenerating,
    setIsGenerating,
    isSplitting,
    setIsSplitting,
    isSavingJson,
    setIsSavingJson,
  };
}
