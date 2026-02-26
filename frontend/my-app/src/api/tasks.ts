/**
 * 任务相关 API
 */
import { api } from './index';

export interface Task {
  id: string;
  type: string;
  status: string;
  progress: number;
  novel_id: string;
  chapter_id: string;
  character_id: string;
  scene_id: string;
  shot_id: string;
  error_message: string;
  created_at: string;
  updated_at: string;
  workflow_id?: string;
}

export const taskApi = {
  /** 获取任务列表 */
  fetchList: (limit = 1000) => api.get<Task[]>(`/tasks/?limit=${limit}`),

  /** 获取单个任务 */
  fetch: (id: string) => api.get<Task>(`/tasks/${id}/`),

  /** 删除任务 */
  delete: (id: string) => api.delete(`/tasks/${id}/`),

  /** 取消所有任务 */
  cancelAll: () => api.post('/tasks/cancel-all/'),

  /** 获取任务工作流 */
  fetchWorkflow: (id: string) => api.get(`/tasks/${id}/workflow/`),

  /** 重试任务 */
  retry: (id: string) => api.post(`/tasks/${id}/retry/`),
};
