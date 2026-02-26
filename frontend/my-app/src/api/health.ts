/**
 * 健康检查相关 API
 */
import { api } from './index';

export interface SystemStats {
  status: 'online' | 'offline';
  gpuUsage: number;
  vramUsed: number;
  vramTotal: number;
  vramPercent: number;
  queueSize: number;
  temperature?: number;
  gpuSource?: 'real' | 'estimated';
  gpuName?: string;
  ramUsed?: number;
  ramTotal?: number;
  ramPercent?: number;
}

export interface HealthResponse {
  status: string;
  data?: {
    gpu_usage?: number;
    vram_used?: number;
    vram_total?: number;
    queue_running?: number;
    queue_pending?: number;
    temperature?: number;
    gpu_source?: 'real' | 'estimated';
    device_name?: string;
    ram_used?: number;
    ram_total?: number;
    ram_percent?: number;
  };
}

export const healthApi = {
  /**
   * 获取 ComfyUI 状态
   */
  getComfyUIStatus: async (): Promise<HealthResponse> => {
    const response = await fetch('/api/health/comfyui');
    if (!response.ok) {
      return { status: 'error' };
    }
    return response.json();
  },
};
