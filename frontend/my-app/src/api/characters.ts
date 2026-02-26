/**
 * 角色相关 API
 */
import { api, API_BASE } from './index';
import type { Character } from '../types';

export const characterApi = {
  /** 获取角色列表 */
  fetchList: (novelId: string) => api.get<Character[]>(`/characters?novel_id=${novelId}`),

  /** 获取单个角色 */
  fetch: (id: string) => api.get<Character>(`/characters/${id}`),

  /** 创建角色 */
  create: (data: Partial<Character>) => api.post<Character>('/characters/', data),

  /** 更新角色 */
  update: (id: string, data: Partial<Character>) => api.put<Character>(`/characters/${id}/`, data),

  /** 删除角色 */
  delete: (id: string) => api.delete(`/characters/${id}/`),

  /** 删除小说下所有角色 */
  deleteAll: (novelId: string) => api.delete(`/characters/?novel_id=${novelId}`),

  /** 获取角色提示词 */
  fetchPrompt: (characterId: string) => 
    api.get<{ prompt: string; templateName: string; templateId?: string; isSystem?: boolean }>(`/characters/${characterId}/prompt/`),

  /** 生成外貌描述 */
  generateAppearance: (characterId: string) => 
    api.post<Character>(`/characters/${characterId}/generate-appearance/`),

  /** 生成人设图任务 */
  generatePortrait: (characterId: string) => 
    api.post(`/tasks/character/${characterId}/generate-portrait/`),

  /** 上传角色图片 */
  uploadImage: async (characterId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.upload<Character>(`/characters/${characterId}/upload-image`, formData);
  },

  /** 清空角色图片目录 */
  clearImagesDir: (novelId: string) => 
    api.post(`/characters/clear-characters-dir?novel_id=${novelId}`),
};
