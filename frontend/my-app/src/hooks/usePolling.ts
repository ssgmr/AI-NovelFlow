/**
 * 轮询状态 Hook
 * 提供任务状态轮询功能
 */
import { useRef, useCallback } from 'react';

interface PollConfig {
  maxAttempts: number;
  intervalMs: number;
}

const DEFAULT_CONFIG: PollConfig = {
  maxAttempts: 60,
  intervalMs: 3000,
};

export function usePolling() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startPolling = useCallback(<T>(
    fetchFn: () => Promise<T>,
    checkComplete: (data: T) => boolean,
    onComplete: (data: T) => void,
    onError: (error: Error) => void,
    config: Partial<PollConfig> = {}
  ) => {
    const { maxAttempts, intervalMs } = { ...DEFAULT_CONFIG, ...config };
    let attempts = 0;

    // 清除之前的轮询
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(async () => {
      attempts++;
      
      if (attempts > maxAttempts) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        onError(new Error('Polling timeout'));
        return;
      }

      try {
        const data = await fetchFn();
        if (checkComplete(data)) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          onComplete(data);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, intervalMs);
  }, []);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  return {
    startPolling,
    stopPolling,
  };
}
