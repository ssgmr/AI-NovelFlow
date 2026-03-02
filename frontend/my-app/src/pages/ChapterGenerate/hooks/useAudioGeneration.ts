/**
 * 音频生成 Hook
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { chapterApi, type DialogueData } from '../../../api/chapters';
import { toast } from '../../../stores/toastStore';
import { useTranslation } from '../../../stores/i18nStore';
import { API_BASE } from '../constants';

interface AudioTask {
  shotIndex: number;
  characterName: string;
  taskId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

interface AudioWarning {
  shot_index?: number;
  character_name: string;
  reason: string;
}

interface AudioTaskResult {
  task_id: string;
  status: string;
  result_url?: string;
  name?: string;
  chapterId?: string;
}

export default function useAudioGeneration() {
  const { t } = useTranslation();
  const [generatingAudios, setGeneratingAudios] = useState<Set<string>>(new Set());
  const [audioWarnings, setAudioWarnings] = useState<AudioWarning[]>([]);
  const [audioTasks, setAudioTasks] = useState<AudioTask[]>([]);
  const [audioUrls, setAudioUrls] = useState<Record<string, string>>({}); // key: "shotIndex_characterName"
  const [audioSources, setAudioSources] = useState<Record<string, string>>({}); // key: "shotIndex_characterName"
  const [uploadingAudios, setUploadingAudios] = useState<Set<string>>(new Set()); // 正在上传的音频
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * 为单个分镜生成音频
   */
  const generateShotAudio = useCallback(async (
    novelId: string,
    chapterId: string,
    shotIndex: number,
    dialogues: DialogueData[]
  ) => {
    if (!novelId || !chapterId || dialogues.length === 0) {
      toast.error(t('chapterGenerate.noDialoguesToGenerate'));
      return;
    }

    // 添加生成中状态
    const taskKey = `${shotIndex}`;
    setGeneratingAudios(prev => new Set(prev).add(taskKey));

    try {
      const result = await chapterApi.generateShotAudio(novelId, chapterId, shotIndex, dialogues);

      if (result.success && result.data) {
        // 记录任务
        const newTasks: AudioTask[] = result.data.tasks.map((task: { character_name: string; task_id: string; status: string }) => ({
          shotIndex,
          characterName: task.character_name,
          taskId: task.task_id,
          status: task.status as AudioTask['status']
        }));
        setAudioTasks(prev => [...prev, ...newTasks]);

        // 显示警告
        if (result.data.warnings.length > 0) {
          setAudioWarnings(prev => [...prev, ...result.data!.warnings]);
          toast.warning(t('chapterGenerate.audioWarnings', { count: result.data.warnings.length }));
        }

        toast.success(t('chapterGenerate.audioTasksCreated', { count: result.data.tasks.length }));
      } else {
        toast.error(t('chapterGenerate.audioGenerateFailed'));
      }
    } catch (error) {
      console.error('Generate shot audio error:', error);
      toast.error(t('chapterGenerate.audioGenerateFailed'));
    } finally {
      // 延迟移除生成中状态
      setTimeout(() => {
        setGeneratingAudios(prev => {
          const newSet = new Set(prev);
          newSet.delete(taskKey);
          return newSet;
        });
      }, 1000);
    }
  }, [t]);

  /**
   * 批量生成章节所有分镜的音频
   */
  const generateAllAudio = useCallback(async (
    novelId: string,
    chapterId: string
  ) => {
    if (!novelId || !chapterId) {
      return;
    }

    setGeneratingAudios(prev => new Set(prev).add('all'));

    try {
      const result = await chapterApi.generateAllAudio(novelId, chapterId);

      if (result.success && result.data) {
        // 记录任务
        const newTasks: AudioTask[] = result.data.tasks.map((task: { shot_index?: number; character_name: string; task_id: string; status: string }) => ({
          shotIndex: task.shot_index || 0,
          characterName: task.character_name,
          taskId: task.task_id,
          status: task.status as AudioTask['status']
        }));
        setAudioTasks(prev => [...prev, ...newTasks]);

        // 显示警告
        if (result.data.warnings.length > 0) {
          setAudioWarnings(result.data.warnings);
        }

        toast.success(t('chapterGenerate.audioTasksCreated', { count: result.data.total_tasks }));

        if (result.data.total_warnings > 0) {
          toast.warning(t('chapterGenerate.audioWarnings', { count: result.data.total_warnings }));
        }
      } else {
        toast.error(t('chapterGenerate.audioGenerateFailed'));
      }
    } catch (error) {
      console.error('Generate all audio error:', error);
      toast.error(t('chapterGenerate.audioGenerateFailed'));
    } finally {
      setTimeout(() => {
        setGeneratingAudios(prev => {
          const newSet = new Set(prev);
          newSet.delete('all');
          return newSet;
        });
      }, 1000);
    }
  }, [t]);

  /**
   * 清除警告
   */
  const clearWarnings = useCallback(() => {
    setAudioWarnings([]);
  }, []);

  /**
   * 检查是否正在生成
   */
  const isGenerating = (shotIndex?: number | string) => {
    if (shotIndex !== undefined) {
      return generatingAudios.has(`${shotIndex}`);
    }
    return generatingAudios.size > 0;
  };

  /**
   * 检查音频任务状态
   */
  const checkAudioTaskStatus = useCallback(async (
    chapterId: string | undefined,
    onRefresh?: () => void
  ) => {
    if (audioTasks.length === 0 || !chapterId) return;

    const pendingTaskIds = audioTasks
      .filter(t => t.status === 'pending' || t.status === 'running')
      .map(t => t.taskId);

    if (pendingTaskIds.length === 0) return;

    try {
      const res = await fetch(`${API_BASE}/tasks/?type=character_audio&limit=100`);
      const data = await res.json();

      if (data.success) {
        const chapterTasks = data.data.filter((task: AudioTaskResult) =>
          task.chapterId === chapterId &&
          pendingTaskIds.includes(task.task_id)
        );

        let hasCompleted = false;
        const updatedTasks: AudioTask[] = [];

        chapterTasks.forEach((task: AudioTaskResult) => {
          const existingTask = audioTasks.find(t => t.taskId === task.task_id);
          if (!existingTask) return;

          if (task.status === 'completed' && task.result_url) {
            // 更新音频 URL
            const key = `${existingTask.shotIndex}_${existingTask.characterName}`;
            setAudioUrls(prev => ({ ...prev, [key]: task.result_url! }));
            hasCompleted = true;

            updatedTasks.push({
              ...existingTask,
              status: 'completed'
            });
          } else if (task.status === 'failed') {
            hasCompleted = true;
            updatedTasks.push({
              ...existingTask,
              status: 'failed'
            });
          } else if (task.status === 'running') {
            updatedTasks.push({
              ...existingTask,
              status: 'running'
            });
          } else {
            updatedTasks.push(existingTask);
          }
        });

        // 更新任务状态
        if (hasCompleted || updatedTasks.length > 0) {
          setAudioTasks(prev =>
            prev.map(t => {
              const updated = updatedTasks.find(u => u.taskId === t.taskId);
              return updated || t;
            })
          );
        }

        if (hasCompleted && onRefresh) {
          onRefresh();
        }
      }
    } catch (error) {
      console.error('Check audio task status error:', error);
    }
  }, [audioTasks]);

  /**
   * 启动任务轮询
   */
  const startPolling = useCallback((chapterId: string | undefined, onRefresh?: () => void) => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    pollingRef.current = setInterval(() => {
      checkAudioTaskStatus(chapterId, onRefresh);
    }, 3000);
  }, [checkAudioTaskStatus]);

  /**
   * 停止任务轮询
   */
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  /**
   * 获取音频 URL
   */
  const getAudioUrl = useCallback((shotIndex: number, characterName: string) => {
    const key = `${shotIndex}_${characterName}`;
    return audioUrls[key];
  }, [audioUrls]);

  /**
   * 获取指定分镜的音频任务状态
   */
  const getShotAudioTasks = useCallback((shotIndex: number) => {
    return audioTasks.filter(t => t.shotIndex === shotIndex);
  }, [audioTasks]);

  /**
   * 检查指定分镜是否有正在生成的音频
   */
  const isShotAudioGenerating = useCallback((shotIndex: number) => {
    return audioTasks.some(t =>
      t.shotIndex === shotIndex &&
      (t.status === 'pending' || t.status === 'running')
    );
  }, [audioTasks]);

  /**
   * 重新生成音频
   */
  const regenerateAudio = useCallback(async (
    novelId: string,
    chapterId: string,
    shotIndex: number,
    characterName: string,
    dialogue: DialogueData
  ) => {
    // 先清除旧的音频 URL
    const key = `${shotIndex}_${characterName}`;
    setAudioUrls(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });

    // 移除旧任务
    setAudioTasks(prev => prev.filter(t =>
      !(t.shotIndex === shotIndex && t.characterName === characterName)
    ));

    // 创建新任务
    await generateShotAudio(novelId, chapterId, shotIndex, [{ ...dialogue, character_name: characterName }]);
  }, [generateShotAudio]);

  /**
   * 上传台词音频
   */
  const uploadDialogueAudio = useCallback(async (
    novelId: string,
    chapterId: string,
    shotIndex: number,
    characterName: string,
    file: File,
    onRefresh?: () => void
  ) => {
    const key = `${shotIndex}_${characterName}`;
    setUploadingAudios(prev => new Set(prev).add(key));

    try {
      const result = await chapterApi.uploadDialogueAudio(novelId, chapterId, shotIndex, characterName, file);

      if (result.success && result.data) {
        // 更新本地音频 URL 和来源
        setAudioUrls(prev => ({ ...prev, [key]: result.data!.audio_url }));
        setAudioSources(prev => ({ ...prev, [key]: 'uploaded' }));

        toast.success(t('chapterGenerate.audioUploadSuccess'));

        if (onRefresh) {
          onRefresh();
        }
      } else {
        toast.error(t('chapterGenerate.audioUploadFailed'));
      }
    } catch (error: any) {
      console.error('Upload dialogue audio error:', error);
      const errorMsg = error?.response?.data?.detail || t('chapterGenerate.audioUploadFailed');
      toast.error(errorMsg);
    } finally {
      setUploadingAudios(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    }
  }, [t]);

  /**
   * 删除台词音频
   */
  const deleteDialogueAudio = useCallback(async (
    novelId: string,
    chapterId: string,
    shotIndex: number,
    characterName: string,
    onRefresh?: () => void
  ) => {
    const key = `${shotIndex}_${characterName}`;

    try {
      const result = await chapterApi.deleteDialogueAudio(novelId, chapterId, shotIndex, characterName);

      if (result.success) {
        // 清除本地音频 URL 和来源
        setAudioUrls(prev => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
        setAudioSources(prev => {
          const next = { ...prev };
          delete next[key];
          return next;
        });

        toast.success(t('chapterGenerate.audioDeleteSuccess'));

        if (onRefresh) {
          onRefresh();
        }
      } else {
        toast.error(t('chapterGenerate.audioDeleteFailed'));
      }
    } catch (error: any) {
      console.error('Delete dialogue audio error:', error);
      const errorMsg = error?.response?.data?.detail || t('chapterGenerate.audioDeleteFailed');
      toast.error(errorMsg);
    }
  }, [t]);

  /**
   * 检查是否正在上传
   */
  const isUploading = useCallback((shotIndex: number, characterName: string) => {
    const key = `${shotIndex}_${characterName}`;
    return uploadingAudios.has(key);
  }, [uploadingAudios]);

  /**
   * 获取音频来源
   */
  const getAudioSource = useCallback((shotIndex: number, characterName: string) => {
    const key = `${shotIndex}_${characterName}`;
    return audioSources[key];
  }, [audioSources]);

  /**
   * 从章节数据初始化音频 URL 和来源
   */
  const initAudioFromShots = useCallback((shots: Array<{ dialogues?: DialogueData[] }>) => {
    const urls: Record<string, string> = {};
    const sources: Record<string, string> = {};

    shots.forEach((shot, shotIndex) => {
      if (shot.dialogues) {
        shot.dialogues.forEach(dialogue => {
          if (dialogue.audio_url) {
            const key = `${shotIndex}_${dialogue.character_name}`;
            urls[key] = dialogue.audio_url;
            if (dialogue.audio_source) {
              sources[key] = dialogue.audio_source;
            }
          }
        });
      }
    });

    setAudioUrls(urls);
    setAudioSources(sources);
  }, []);

  // 清理轮询
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    generatingAudios,
    audioWarnings,
    audioTasks,
    audioUrls,
    audioSources,
    uploadingAudios,
    generateShotAudio,
    generateAllAudio,
    clearWarnings,
    isGenerating,
    checkAudioTaskStatus,
    startPolling,
    stopPolling,
    getAudioUrl,
    getShotAudioTasks,
    isShotAudioGenerating,
    regenerateAudio,
    uploadDialogueAudio,
    deleteDialogueAudio,
    isUploading,
    getAudioSource,
    initAudioFromShots,
  };
}