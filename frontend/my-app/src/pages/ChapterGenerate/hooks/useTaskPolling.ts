import { useEffect } from 'react';

interface UseTaskPollingParams {
  cid: string | undefined;
  id: string | undefined;
  pendingShots: Set<number>;
  pendingVideos: Set<number>;
  generatingTransitions: Set<string>;
  audioTasks: Array<{ taskId: string; status: string }>;
  checkShotTaskStatus: (chapterId: string | undefined, onRefresh: () => void) => Promise<void>;
  checkVideoTaskStatus: (chapterId: string | undefined, onRefresh: () => void) => Promise<void>;
  checkTransitionTaskStatus: (chapterId: string | undefined, onRefresh: () => void) => Promise<void>;
  checkAudioTaskStatus: (chapterId: string | undefined, onRefresh: () => void) => Promise<void>;
  fetchChapter: (novelId: string, chapterId: string) => void;
}

/**
 * 任务状态轮询 Hook
 */
export default function useTaskPolling({
  cid,
  id,
  pendingShots,
  pendingVideos,
  generatingTransitions,
  audioTasks,
  checkShotTaskStatus,
  checkVideoTaskStatus,
  checkTransitionTaskStatus,
  checkAudioTaskStatus,
  fetchChapter,
}: UseTaskPollingParams) {
  useEffect(() => {
    if (!cid || !id) return;

    let isRunning = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const hasPendingAudioTasks = audioTasks.some(t => t.status === 'pending' || t.status === 'running');

    const poll = async () => {
      if (pendingShots.size === 0 && pendingVideos.size === 0 && generatingTransitions.size === 0 && !hasPendingAudioTasks) {
        timeoutId = setTimeout(poll, 3000);
        return;
      }

      if (isRunning) {
        timeoutId = setTimeout(poll, 3000);
        return;
      }

      isRunning = true;
      try {
        await Promise.all([
          checkShotTaskStatus(cid, () => fetchChapter(id, cid)),
          checkVideoTaskStatus(cid, () => fetchChapter(id, cid)),
          checkTransitionTaskStatus(cid, () => fetchChapter(id, cid)),
          checkAudioTaskStatus(cid, () => fetchChapter(id, cid)),
        ]);
      } finally {
        isRunning = false;
        timeoutId = setTimeout(poll, 3000);
      }
    };

    timeoutId = setTimeout(poll, 3000);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [cid, id, pendingShots.size, pendingVideos.size, generatingTransitions.size, audioTasks]);
}
