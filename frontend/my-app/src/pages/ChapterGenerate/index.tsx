import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../stores/i18nStore';
import { 
  ArrowLeft, 
  Loader2,
  RefreshCw,
  Image as ImageIcon,
  Play,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Film,
  Settings,
  AlertTriangle,
  Upload,
  Clock,
  Grid3x3
} from 'lucide-react';
import { toast } from '../../stores/toastStore';
import ComfyUIStatus from '../../components/ComfyUIStatus';

// 导入拆分后的组件和 hooks
import { STEPS_CONFIG, API_BASE } from './constants';
import type { ParsedData, Character, Scene } from './types';
import DownloadMaterialsCard from './components/DownloadMaterialsCard';
import MergeVideosCard from './components/MergeVideosCard';
import TransitionVideoItem from './components/TransitionVideoItem';
import useChapterData from './hooks/useChapterData';
import useShotGeneration from './hooks/useShotGeneration';
import useVideoGeneration from './hooks/useVideoGeneration';
import useTransitionGeneration from './hooks/useTransitionGeneration';
import useChapterGenerateState from './hooks/useChapterGenerateState';
import useTaskPolling from './hooks/useTaskPolling';
import useChapterActions from './hooks/useChapterActions';

// 导入组件
import { FullTextModal, MergedImageModal, ImagePreviewModal, SplitConfirmDialog } from './components/Modals';
import { StepIndicator } from './components/StepIndicator';
import { TabContent } from './components/TabContent';
import { Tabs } from './components/Tabs';
import { JsonEditor } from './components/JsonEditor';
import { CharacterImages } from './components/CharacterImages';
import { SceneImages } from './components/SceneImages';
import { getAspectRatioStyle, getInvalidSceneShots as getInvalidSceneShotsUtil } from './utils';

// Shot 工作流类型
interface ShotWorkflow {
  id: string;
  name: string;
  isActive: boolean;
  extension?: {
    reference_image_count?: string;
  };
}

export default function ChapterGenerate() {
  const { t } = useTranslation();
  const { id, cid } = useParams<{ id: string; cid: string }>();
  const navigate = useNavigate();

  // 使用自定义 hooks
  const {
    chapter,
    novel,
    parsedData,
    editableJson,
    characters,
    scenes,
    loading,
    fetchNovel,
    fetchChapter,
    fetchCharacters,
    fetchScenes,
    setParsedData,
    setEditableJson,
    getCharacterImage,
    getSceneImage,
  } = useChapterData();

  const {
    generatingShots,
    pendingShots,
    shotImages,
    isGeneratingAll,
    uploadingShotIndex,
    handleGenerateShotImage,
    handleGenerateAllShots,
    triggerShotFileUpload,
    handleUploadShotImage,
    setShotImages,
    setPendingShots,
    checkShotTaskStatus,
    shotFileInputRef,
  } = useShotGeneration();

  const {
    generatingVideos,
    pendingVideos,
    shotVideos,
    handleGenerateShotVideo,
    handleGenerateAllVideos,
    setShotVideos,
    setPendingVideos,
    checkVideoTaskStatus,
  } = useVideoGeneration();

  const {
    transitionVideos,
    generatingTransitions,
    currentTransition,
    transitionWorkflows,
    selectedTransitionWorkflow,
    transitionDuration,
    handleGenerateTransition,
    handleGenerateAllTransitions,
    setTransitionVideos,
    setGeneratingTransitions,
    setCurrentTransition,
    setSelectedTransitionWorkflow,
    setTransitionDuration,
    fetchTransitionWorkflows,
    fetchTransitionTasks,
    checkTransitionTaskStatus,
  } = useTransitionGeneration();

  // UI 状态管理
  const uiState = useChapterGenerateState();
  const {
    activeTab, setActiveTab,
    currentShot, setCurrentShot,
    currentVideo, setCurrentVideo,
    jsonEditMode, setJsonEditMode,
    editorKey, setEditorKey,
    showFullTextModal, setShowFullTextModal,
    showMergedImageModal, setShowMergedImageModal,
    showImagePreview, setShowImagePreview,
    previewImageUrl, setPreviewImageUrl,
    previewImageIndex, setPreviewImageIndex,
    mergedImage, setMergedImage,
    isMerging, setIsMerging,
    splitConfirmDialog, setSplitConfirmDialog,
    showTransitionConfig, setShowTransitionConfig,
    isGenerating, setIsGenerating,
    isSplitting, setIsSplitting,
    isSavingJson, setIsSavingJson,
  } = uiState;

  // Shot 工作流状态
  const [shotWorkflows, setShotWorkflows] = useState<ShotWorkflow[]>([]);
  const [activeShotWorkflow, setActiveShotWorkflow] = useState<ShotWorkflow | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 验证分镜场景是否在场景库中
  const invalidSceneShots = getInvalidSceneShotsUtil(editableJson, scenes);
  const hasInvalidScenesInShots = invalidSceneShots.length > 0;

  // 业务操作函数
  const actions = useChapterActions({
    id,
    cid,
    characters,
    scenes,
    parsedData,
    shotImages,
    shotVideos,
    transitionVideos,
    mergedImage,
    getCharacterImage,
    setParsedData,
    setEditableJson,
    setShotImages,
    setShotVideos,
    setTransitionVideos,
    setMergedImage,
    setEditorKey,
    setActiveTab,
    setIsSplitting,
    setIsSavingJson,
    setIsMerging,
    setSplitConfirmDialog,
    fetchChapter,
    currentShot,
  });

  // 任务轮询
  useTaskPolling({
    cid,
    id,
    pendingShots,
    pendingVideos,
    generatingTransitions,
    checkShotTaskStatus,
    checkVideoTaskStatus,
    checkTransitionTaskStatus,
    fetchChapter,
  });

  // 获取真实章节数据和角色列表
  useEffect(() => {
    if (cid && id) {
      fetchNovel(id);
      fetchCharacters(id);
      fetchScenes(id);
      fetchChapter(id, cid);
      fetchTransitionWorkflows();
      fetchShotWorkflows();
    }
  }, [cid, id]);

  // 从章节数据初始化状态
  useEffect(() => {
    if (chapter) {
      setShotImages(prev => {
        const images = { ...prev };
        if (chapter.shotImages && Array.isArray(chapter.shotImages)) {
          chapter.shotImages.forEach((url: string | null, index: number) => {
            if (url) images[index + 1] = url;
          });
        }
        if (chapter.parsedData) {
          try {
            const parsed = typeof chapter.parsedData === 'string' 
              ? JSON.parse(chapter.parsedData) 
              : chapter.parsedData;
            if (parsed?.shots && Array.isArray(parsed.shots)) {
              parsed.shots.forEach((shot: any, index: number) => {
                const shotNum = index + 1;
                if (!images[shotNum] && shot?.image_url) {
                  images[shotNum] = shot.image_url;
                }
              });
            }
          } catch (e) {
            console.error('解析 parsedData 失败:', e);
          }
        }
        return images;
      });
      
      if (chapter.shotVideos && Array.isArray(chapter.shotVideos)) {
        setShotVideos(prev => {
          const videos = { ...prev };
          chapter.shotVideos!.forEach((url: string | null, index: number) => {
            if (url) videos[index + 1] = url;
          });
          return videos;
        });
      }
      
      if (chapter.transitionVideos && typeof chapter.transitionVideos === 'object') {
        setTransitionVideos(prev => ({ ...prev, ...chapter.transitionVideos}));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter?.id, chapter?.shotImages, chapter?.shotVideos, chapter?.transitionVideos]);

  // 切换分镜时更新合并角色图
  useEffect(() => {
    if (parsedData?.shots && parsedData.shots.length >= currentShot) {
      const shot = parsedData.shots[currentShot - 1];
      setMergedImage(shot?.merged_character_image || null);
    }
  }, [currentShot, parsedData, setMergedImage]);

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showImagePreview && previewImageUrl) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          navigateImagePreview('prev');
          return;
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          navigateImagePreview('next');
          return;
        } else if (e.key === 'Escape') {
          e.preventDefault();
          setShowImagePreview(false);
          return;
        }
      }
      
      if (!parsedData?.shots || parsedData.shots.length === 0) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      if (e.key === 'ArrowLeft') {
        setCurrentShot(prev => Math.max(1, prev - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentShot(prev => Math.min(parsedData?.shots?.length || 1, prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [parsedData?.shots?.length, showImagePreview, previewImageUrl, previewImageIndex, setCurrentShot, setShowImagePreview]);

  // 图片预览导航
  const navigateImagePreview = (direction: 'prev' | 'next') => {
    const allImages = parsedData?.shots?.map((_shot: any, idx: number) => {
      const shotNum = idx + 1;
      return shotImages[shotNum] || parsedData?.shots?.[idx]?.image_url;
    }).filter(Boolean) as string[] || [];
    
    if (allImages.length <= 1) return;
    
    let newIndex: number;
    if (direction === 'prev') {
      newIndex = previewImageIndex === 0 ? allImages.length - 1 : previewImageIndex - 1;
    } else {
      newIndex = previewImageIndex === allImages.length - 1 ? 0 : previewImageIndex + 1;
    }
    
    setPreviewImageIndex(newIndex);
    setPreviewImageUrl(allImages[newIndex] || null);
    setCurrentShot(newIndex + 1);
  };

  // 获取 shot 工作流列表
  const fetchShotWorkflows = async () => {
    try {
      const res = await fetch(`${API_BASE}/workflows/?type=shot`);
      const data = await res.json();
      if (data.success) {
        setShotWorkflows(data.data || []);
        const activeWorkflow = data.data.find((w: ShotWorkflow) => w.isActive);
        if (activeWorkflow) setActiveShotWorkflow(activeWorkflow);
      }
    } catch (error) {
      console.error('获取 shot 工作流失败:', error);
    }
  };

  // 根据画面比例计算图片容器尺寸
  const aspectStyle = getAspectRatioStyle(novel?.aspectRatio || '16:9');

  // 步骤标签翻译
  const getStepLabel = (key: string) => {
    const labels: Record<string, string> = {
      'content': t('chapterGenerate.stepContent'),
      'ai-parse': t('chapterGenerate.stepAiParse'),
      'json': t('chapterGenerate.stepJson'),
      'character': t('chapterGenerate.stepCharacter'),
      'shots': t('chapterGenerate.stepShots'),
      'videos': t('chapterGenerate.stepVideos'),
      'transitions': t('chapterGenerate.stepTransitions'),
      'compose': t('chapterGenerate.stepCompose'),
    };
    return labels[key] || key;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            to={`/novels/${id}`}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {loading ? t('chapterGenerate.loading') : chapter?.title || t('chapterGenerate.unnamedChapter')}
            </h1>
          </div>
        </div>
      </div>

      {/* 步骤指示器 */}
      <StepIndicator />

      <div className="grid grid-cols-12 gap-6">
        {/* 左侧内容区 */}
        <div className="col-span-8 space-y-6">
          {/* 原文内容 */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">{t('chapterGenerate.originalContent')}</h3>
              <button 
                onClick={() => setShowFullTextModal(true)}
                className="text-sm text-blue-600 hover:underline"
              >
                {t('chapterGenerate.expandFullText')}
              </button>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
              {loading ? t('chapterGenerate.loading') : chapter?.content || t('chapterGenerate.noContent')}
            </p>
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
              {hasInvalidScenesInShots && !isSplitting && activeShotWorkflow?.extension?.reference_image_count === 'dual' && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-700">
                      {t('chapterGenerate.sceneValidation.warning')}
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      {t('chapterGenerate.sceneValidation.detected', { count: invalidSceneShots.length })}
                    </p>
                  </div>
                </div>
              )}
              <button 
                onClick={actions.handleSplitChapterClick}
                disabled={isSplitting}
                className={`w-full py-3 px-4 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  hasInvalidScenesInShots && !isSplitting && activeShotWorkflow?.extension?.reference_image_count === 'dual'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                }`}
              >
                {isSplitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Sparkles className="h-5 w-5" />
                )}
                {isSplitting ? t('chapterGenerate.aiSplitting') : t('chapterGenerate.aiSplitShots')}
              </button>
            </div>
          </div>

          {/* JSON 编辑器 */}
          <div className="card">
            <JsonEditor
              value={editableJson}
              onChange={setEditableJson}
              onSave={() => actions.handleSaveJson(editableJson)}
              editMode={jsonEditMode}
              onEditModeChange={setJsonEditMode}
              isSaving={isSavingJson}
              editorKey={editorKey}
              availableScenes={scenes.map(s => s.name)}
              availableCharacters={characters.map(c => c.name)}
              activeShotWorkflow={activeShotWorkflow}
            />
          </div>

          {/* 人设图片 */}
          <CharacterImages
            parsedData={parsedData}
            currentShot={currentShot}
            novelAspectRatio={novel?.aspectRatio || '16:9'}
            novelId={id}
            getCharacterImage={getCharacterImage}
            onRegenerateCharacter={actions.handleRegenerateCharacter}
            aspectStyle={aspectStyle}
          />

          {/* 场景图片 */}
          <SceneImages
            parsedData={parsedData}
            currentShot={currentShot}
            novelAspectRatio={novel?.aspectRatio || '16:9'}
            novelId={id}
            getSceneImage={getSceneImage}
            onRegenerateScene={actions.handleRegenerateScene}
            onImageClick={(url) => {
              setPreviewImageUrl(url);
              setShowImagePreview(true);
            }}
            aspectStyle={aspectStyle}
            activeShotWorkflow={activeShotWorkflow}
          />

          {/* 分镜图片 */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">{t('chapterGenerate.shotImages')} ({parsedData?.shots?.length || 0}{t('chapterGenerate.unit')})</h3>
              <div className="flex items-center gap-3">
                {(parsedData?.shots?.length ?? 0) > 0 && (
                  <>
                    <button 
                      onClick={() => handleGenerateAllShots(parsedData, id, cid)}
                      disabled={isGeneratingAll || pendingShots.size > 0}
                      className="btn-secondary text-sm py-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                    >
                      {isGeneratingAll ? (
                        <><Loader2 className="h-3 w-3 mr-1 animate-spin" />{t('chapterGenerate.batchSubmitting')}</>
                      ) : (
                        <><RefreshCw className="h-3 w-3 mr-1" />{t('chapterGenerate.generateAllShots')}</>
                      )}
                    </button>
                    <button 
                      onClick={() => handleGenerateAllVideos(parsedData, shotImages, id, cid)}
                      disabled={generatingVideos.size > 0 || pendingVideos.size > 0}
                      className="btn-secondary text-sm py-1.5 text-purple-600 hover:text-purple-700 hover:bg-purple-50 disabled:opacity-50"
                      title={t('chapterGenerate.generateVideoForShotsWithImages')}
                    >
                      <Film className="h-3 w-3 mr-1" />
                      {t('chapterGenerate.generateAllShotVideos')}
                    </button>
                  </>
                )}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentShot(Math.max(1, currentShot - 1))}
                    className="p-1 rounded hover:bg-gray-100"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-gray-500">{currentShot}/{parsedData?.shots?.length || 0}</span>
                  <button 
                    onClick={() => setCurrentShot(Math.min(parsedData?.shots?.length || 1, currentShot + 1))}
                    className="p-1 rounded hover:bg-gray-100"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            {(parsedData?.shots?.length ?? 0) > 0 ? (
              <>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {parsedData?.shots?.map((shot: any, index: number) => {
                    const shotNum = index + 1;
                    const isSubmitting = generatingShots.has(shotNum);
                    const isPending = pendingShots.has(shotNum);
                    const imageUrl = (!isSubmitting && !isPending) ? (shotImages[shotNum] || shot.image_url) : null;
                    const hasImage = !!imageUrl;
                    
                    return (
                      <div 
                        key={shot.id}
                        onClick={() => setCurrentShot(shotNum)}
                        className={`relative flex-shrink-0 w-32 h-24 rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105 ${
                          currentShot === shotNum ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                        }`}
                      >
                        {hasImage ? (
                          <img src={imageUrl} alt={`镜${shot.id}`} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-white/70" />
                          </div>
                        )}
                        
                        {isSubmitting && (
                          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                            <Loader2 className="h-5 w-5 text-white animate-spin mb-1" />
                            <span className="text-[10px] text-white font-medium">{t('chapterGenerate.submitting')}</span>
                          </div>
                        )}
                        
                        {isPending && !isSubmitting && (
                          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                            <div className="flex items-center gap-1 mb-1">
                              <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
                              <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse delay-75" />
                              <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse delay-150" />
                            </div>
                            <span className="text-[10px] text-white font-medium">{t('chapterGenerate.inQueue')}</span>
                          </div>
                        )}
                        
                        {(isSubmitting || isPending) && (
                          <div className="absolute top-1 right-1">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
                          </div>
                        )}
                        
                        <span className="absolute bottom-1 left-2 text-xs text-white font-bold bg-blue-600/90 px-1.5 py-0.5 rounded shadow-lg">
                          {t('chapterGenerate.shot')}{shot.id}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {generatingShots.has(currentShot) || pendingShots.has(currentShot) ? (
                  <div className="mt-4 mb-4">
                    <div className="aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center border-2 border-dashed border-blue-200">
                      <Loader2 className="h-12 w-12 text-blue-400 mb-3 animate-spin" />
                      <span className="text-blue-500 text-sm font-medium">
                        {generatingShots.has(currentShot) ? t('chapterGenerate.submitting') : t('chapterGenerate.inQueue')}
                      </span>
                    </div>
                  </div>
                ) : (shotImages[currentShot] || parsedData?.shots?.[currentShot - 1]?.image_url) ? (
                  <div className="mt-4 mb-4">
                    <div 
                      className="aspect-video rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
                      onClick={() => {
                        const url = shotImages[currentShot] || parsedData?.shots?.[currentShot - 1]?.image_url;
                        if (url) {
                          setPreviewImageUrl(url);
                          setPreviewImageIndex(currentShot - 1);
                          setShowImagePreview(true);
                        }
                      }}
                    >
                      <img 
                        src={shotImages[currentShot] || parsedData?.shots?.[currentShot - 1]?.image_url}
                        alt={`${t('chapterGenerate.shot')}${currentShot}`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 mb-4">
                    <div className="aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 flex flex-col items-center justify-center border-2 border-dashed border-purple-200">
                      <ImageIcon className="h-16 w-16 text-purple-300 mb-2" />
                      <span className="text-purple-400 text-sm">{t('chapterGenerate.shotImageNotGenerated')}</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-4 flex-wrap">
                  <button 
                    onClick={() => handleGenerateShotImage(currentShot, id, cid)}
                    disabled={generatingShots.has(currentShot) || pendingShots.has(currentShot)}
                    className="btn-secondary text-sm py-1.5 disabled:opacity-50"
                  >
                    {generatingShots.has(currentShot) ? (
                      <><Loader2 className="h-3 w-3 mr-1 animate-spin" />{t('chapterGenerate.submitting')}</>
                    ) : pendingShots.has(currentShot) ? (
                      <><Clock className="h-3 w-3 mr-1" />{t('chapterGenerate.inQueue')}</>
                    ) : (
                      <><RefreshCw className="h-3 w-3 mr-1" />{t('chapterGenerate.regenerateShotImage')}</>
                    )}
                  </button>
                  <button 
                    onClick={() => triggerShotFileUpload(currentShot)}
                    disabled={uploadingShotIndex === currentShot || generatingShots.has(currentShot) || pendingShots.has(currentShot)}
                    className="btn-secondary text-sm py-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 disabled:opacity-50"
                    title={t('chapterGenerate.orUploadLocal')}
                  >
                    {uploadingShotIndex === currentShot ? (
                      <><Loader2 className="h-3 w-3 mr-1 animate-spin" />{t('common.upload')}...</>
                    ) : (
                      <><Upload className="h-3 w-3 mr-1" />{t('chapterGenerate.uploadImage')}</>
                    )}
                  </button>
                  <button 
                    onClick={() => handleGenerateShotVideo(currentShot, id, cid)}
                    disabled={
                      !(shotImages[currentShot] || parsedData?.shots?.[currentShot - 1]?.image_url) ||
                      generatingVideos.has(currentShot) || 
                      pendingVideos.has(currentShot)
                    }
                    className="btn-secondary text-sm py-1.5 text-purple-600 hover:text-purple-700 hover:bg-purple-50 disabled:opacity-50"
                    title={
                      !(shotImages[currentShot] || parsedData?.shots?.[currentShot - 1]?.image_url)
                        ? t('chapterGenerate.generateShotImageFirst')
                        : pendingVideos.has(currentShot)
                        ? t('chapterGenerate.videoGenerating')
                        : t('chapterGenerate.generateVideoBasedOnImage')
                    }
                  >
                    {generatingVideos.has(currentShot) ? (
                      <><Loader2 className="h-3 w-3 mr-1 animate-spin" />{t('chapterGenerate.submitting')}</>
                    ) : pendingVideos.has(currentShot) ? (
                      <><Clock className="h-3 w-3 mr-1" />{t('chapterGenerate.generating')}</>
                    ) : (
                      <><Film className="h-3 w-3 mr-1" />{t('chapterGenerate.generateShotVideo')}</>
                    )}
                  </button>
                  <button 
                    onClick={() => setShowMergedImageModal(true)}
                    disabled={!mergedImage}
                    className="btn-secondary text-sm py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
                    title={mergedImage ? t('chapterGenerate.viewMergedImage') : t('chapterGenerate.generateMergedImageFirst')}
                  >
                    <Grid3x3 className="h-3 w-3 mr-1" />
                    {t('chapterGenerate.viewMergedImage')}
                  </button>
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-sm py-4">{t('chapterGenerate.noShotImages')}</p>
            )}
          </div>

          {/* 分镜视频 */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-gray-900">
                  {currentTransition && transitionVideos[currentTransition] 
                    ? t('chapterGenerate.transitionPreview', { transition: currentTransition })
                    : t('chapterGenerate.shotVideosTitle')}
                </h3>
                {currentTransition && transitionVideos[currentTransition] && (
                  <button
                    onClick={() => setCurrentTransition('')}
                    className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
                  >
                    {t('chapterGenerate.backToShotVideos')}
                  </button>
                )}
              </div>
              {parsedData?.shots && parsedData.shots.length > 1 && (
                <button
                  onClick={() => handleGenerateAllTransitions(parsedData, id, cid)}
                  disabled={generatingTransitions.size > 0}
                  className="btn-secondary text-sm py-1.5 text-orange-600 hover:text-orange-700 hover:bg-orange-50 disabled:opacity-50"
                  title={t('chapterGenerate.generateTransitionsForAll')}
                >
                  {generatingTransitions.size > 0 ? (
                    <><Loader2 className="h-3 w-3 mr-1 animate-spin" />{t('chapterGenerate.generating')}</>
                  ) : (
                    <><RefreshCw className="h-3 w-3 mr-1" />{t('chapterGenerate.generateAllTransitions')}</>
                  )}
                </button>
              )}
            </div>
            <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
              {currentTransition && transitionVideos[currentTransition] ? (
                <video
                  key={`transition-${currentTransition}`}
                  src={transitionVideos[currentTransition]}
                  controls
                  autoPlay
                  className="w-full h-full"
                  poster={shotImages[parseInt(currentTransition.split('-')[0])]}
                />
              ) : shotVideos[currentVideo] ? (
                <video
                  key={currentVideo}
                  src={shotVideos[currentVideo]}
                  controls
                  className="w-full h-full"
                  poster={shotImages[currentVideo]}
                />
              ) : (
                <div className="text-center">
                  <Play className="h-16 w-16 text-white/50 mx-auto mb-2" />
                  <p className="text-white/50 text-sm">
                    {generatingVideos.has(currentVideo) ? t('chapterGenerate.generating') : pendingVideos.has(currentVideo) ? t('chapterGenerate.inQueue') : t('chapterGenerate.noVideo')}
                  </p>
                </div>
              )}
            </div>
            
            {/* 转场配置面板 */}
            {parsedData?.shots && parsedData.shots.length > 1 && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">{t('chapterGenerate.transitionConfig')}</span>
                    {showTransitionConfig && (
                      <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded">{t('chapterGenerate.customEnabled')}</span>
                    )}
                  </div>
                  <button
                    onClick={() => setShowTransitionConfig(!showTransitionConfig)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    {showTransitionConfig ? t('chapterGenerate.collapseConfig') : t('chapterGenerate.expandConfig')}
                  </button>
                </div>
                
                {showTransitionConfig && (
                  <div className="space-y-3 pt-2 border-t border-gray-200">
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-gray-600 whitespace-nowrap">{t('chapterGenerate.workflow')}:</label>
                      <select
                        value={selectedTransitionWorkflow}
                        onChange={(e) => setSelectedTransitionWorkflow(e.target.value)}
                        className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      >
                        {transitionWorkflows.map((wf) => {
                          const displayName = wf.nameKey ? t(wf.nameKey, { defaultValue: wf.name }) : wf.name;
                          return (
                            <option key={wf.id} value={wf.id}>
                              {displayName} {wf.isActive ? `(${t('chapterGenerate.default')})` : ''}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-gray-600 whitespace-nowrap">{t('chapterGenerate.duration')}:</label>
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="range"
                          min="1"
                          max="5"
                          step="0.5"
                          value={transitionDuration}
                          onChange={(e) => setTransitionDuration(parseFloat(e.target.value))}
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-sm text-gray-700 w-16 text-right">{transitionDuration}{t('chapterGenerate.second')}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500">{t('chapterGenerate.configTip')}</p>
                      <button
                        onClick={() => {
                          const defaultWorkflow = transitionWorkflows.find((w: any) => w.isActive);
                          if (defaultWorkflow) {
                            setSelectedTransitionWorkflow(defaultWorkflow.id);
                          } else if (transitionWorkflows.length > 0) {
                            setSelectedTransitionWorkflow(transitionWorkflows[0].id);
                          }
                          setTransitionDuration(2);
                          toast.info(t('chapterGenerate.resetToDefault'));
                        }}
                        className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                      >
                        {t('chapterGenerate.reset')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* 分镜视频列表 + 转场入口 */}
            <div className="flex gap-2 overflow-x-auto pb-2 items-center">
              {parsedData?.shots?.map((shot: any, index: number) => {
                const shotNum = index + 1;
                const isImagePending = pendingShots.has(shotNum) || generatingShots.has(shotNum);
                const imageUrl = !isImagePending ? (shotImages[shotNum] || shot.image_url) : null;
                const hasVideo = !!shotVideos[shotNum];
                const isPending = pendingVideos.has(shotNum);
                const isGenerating = generatingVideos.has(shotNum);
                const duration = shot.duration || 4;
                
                return (
                  <div key={shot.id} className="flex items-center gap-2">
                    <div
                      onClick={() => {
                        if (currentTransition) setCurrentTransition('');
                        setCurrentVideo(shotNum);
                      }}
                      className={`relative flex-shrink-0 w-32 h-24 rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105 ${
                        currentVideo === shotNum && !currentTransition ? 'ring-2 ring-offset-2 ring-purple-500' : ''
                      }`}
                    >
                      {imageUrl ? (
                        <img src={imageUrl} alt={`${t('chapterGenerate.shot')}${shot.id}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-white/70" />
                        </div>
                      )}
                      
                      {hasVideo && <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" />}
                      {(isPending || isGenerating) && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Loader2 className="h-4 w-4 text-white animate-spin" />
                        </div>
                      )}
                      
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-1 flex items-center justify-between">
                        <span className="text-xs text-white font-bold bg-blue-600/90 px-1.5 py-0.5 rounded">{t('chapterGenerate.shot')}{shot.id}</span>
                        <span className="text-[10px] text-white/90 font-medium">{duration}{t('chapterGenerate.second')}</span>
                      </div>
                    </div>
                    
                    {index < (parsedData?.shots?.length || 0) - 1 && (
                      <TransitionVideoItem
                        fromIndex={shotNum}
                        toIndex={shotNum + 1}
                        fromVideo={shotVideos[shotNum]}
                        toVideo={shotVideos[shotNum + 1]}
                        fromImage={(!pendingShots.has(shotNum) && !generatingShots.has(shotNum)) ? (shotImages[shotNum] || shot.image_url) : undefined}
                        toImage={(!pendingShots.has(shotNum + 1) && !generatingShots.has(shotNum + 1)) ? (shotImages[shotNum + 1] || parsedData?.shots?.[shotNum]?.image_url) : undefined}
                        transitionVideo={transitionVideos[`${shotNum}-${shotNum + 1}`]}
                        isGenerating={generatingTransitions.has(`${shotNum}-${shotNum + 1}`)}
                        onGenerate={() => handleGenerateTransition(shotNum, shotNum + 1, true, id, cid)}
                        onRegenerate={() => handleGenerateTransition(shotNum, shotNum + 1, true, id, cid)}
                        onClick={() => {
                          if (transitionVideos[`${shotNum}-${shotNum + 1}`]) {
                            setCurrentTransition(`${shotNum}-${shotNum + 1}`);
                          }
                        }}
                        isActive={currentTransition === `${shotNum}-${shotNum + 1}`}
                      />
                    )}
                  </div>
                );
              }) || <p className="text-gray-500 text-sm">{t('chapterGenerate.noVideos')}</p>}
            </div>
          </div>
        </div>

        {/* 右侧边栏 */}
        <div className="col-span-4 space-y-6">
          <div className="sticky top-6 space-y-4">
            <ComfyUIStatus />
            
            <MergeVideosCard
              novelId={id || ''}
              chapterId={cid || ''}
              shotVideos={shotVideos}
              transitionVideos={transitionVideos}
              chapter={chapter}
              aspectRatio={novel?.aspectRatio || '16:9'}
            />
            
            <DownloadMaterialsCard 
              novelId={id || ''} 
              chapterId={cid || ''}
              chapterTitle={chapter?.title || t('chapterGenerate.unnamedChapter')}
            />
          </div>
        </div>
      </div>

      {/* 弹窗组件 */}
      <FullTextModal
        isOpen={showFullTextModal}
        onClose={() => setShowFullTextModal(false)}
        chapterTitle={chapter?.title}
        chapterContent={chapter?.content}
      />

      <MergedImageModal
        isOpen={showMergedImageModal}
        onClose={() => setShowMergedImageModal(false)}
        mergedImage={mergedImage}
        currentShot={currentShot}
      />

      <ImagePreviewModal
        isOpen={showImagePreview}
        onClose={() => setShowImagePreview(false)}
        previewImageUrl={previewImageUrl}
        previewImageIndex={previewImageIndex}
        currentShot={currentShot}
        totalImages={parsedData?.shots?.length || 0}
        onNavigate={navigateImagePreview}
        parsedDataShots={parsedData?.shots || []}
        shotImages={shotImages}
      />

      <input
        type="file"
        ref={shotFileInputRef}
        onChange={(e) => handleUploadShotImage(e, id, cid, currentShot)}
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
      />

      <SplitConfirmDialog
        isOpen={splitConfirmDialog.isOpen}
        onClose={() => setSplitConfirmDialog({ isOpen: false, hasResources: false })}
        onConfirm={actions.doSplitChapter}
      />

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
