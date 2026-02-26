/**
 * 场景相关 API
 */
import { api, API_BASE } from './index';
import type { Scene } from '../types';

export const sceneApi = {
  /** 获取场景列表 */
  fetchList: (novelId: string) => api.get<Scene[]>(`/scenes?novel_id=${novelId}`),

  /** 获取单个场景 */
  fetch: (id: string) => api.get<Scene>(`/scenes/${id}`),

  /** 创建场景 */
  create: (data: Partial<Scene>) => api.post<Scene>('/scenes/', data),

  /** 更新场景 */
  update: (id: string, data: Partial<Scene>) => api.put<Scene>(`/scenes/${id}/`, data),

  /** 删除场景 */
  delete: (id: string) => api.delete(`/scenes/${id}/`),

  /** 删除小说下所有场景 */
  deleteAll: (novelId: string) => api.delete(`/scenes/?novel_id=${novelId}`),

  /** 获取场景提示词 */
  fetchPrompt: (sceneId: string) => 
    api.get<{ prompt: string; templateName: string; templateId?: string; isSystem?: boolean }>(`/scenes/${sceneId}/prompt`),

  /** 生成场景设定 */
  generateSetting: (sceneId: string) => 
    api.post<Scene>(`/scenes/${sceneId}/generate-setting`),

  /** 生成场景图任务 */
  generateImage: (sceneId: string) => 
    api.post(`/tasks/scene/${sceneId}/generate-image`),

  /** 上传场景图片 */
  uploadImage: async (sceneId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.upload<Scene>(`/scenes/${sceneId}/upload-image`, formData);
  },

  /** 清空场景图片目录 */
  clearImagesDir: (novelId: string) => 
    api.post(`/scenes/clear-scenes-dir?novel_id=${novelId}`),

  /** 解析场景 */
  parseScenes: (novelId: string, mode: 'incremental' | 'full') => 
    api.post('/scenes/parse-scenes', { novel_id: novelId, chapter_ids: [], mode }),
};
