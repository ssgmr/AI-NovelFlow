/**
 * 小说相关 API
 */
import { api, API_BASE } from './index';
import type { Novel, Chapter } from '../types';

export const novelApi = {
  /** 获取小说列表 */
  fetchList: () => api.get<Novel[]>('/novels/'),

  /** 获取单个小说 */
  fetch: (id: string) => api.get<Novel>(`/novels/${id}/`),

  /** 创建小说 */
  create: (data: Partial<Novel>) => api.post<Novel>('/novels/', data),

  /** 更新小说 */
  update: (id: string, data: Partial<Novel>) => api.put<Novel>(`/novels/${id}/`, data),

  /** 删除小说 */
  delete: (id: string) => api.delete(`/novels/${id}/`),

  /** 获取章节列表 */
  fetchChapters: (novelId: string) => api.get<Chapter[]>(`/novels/${novelId}/chapters/`),

  /** 导入小说 */
  import: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.upload<Novel>('/novels/import/', formData);
  },

  /** 解析角色 */
  parseCharacters: (novelId: string, params: { sync: boolean; start_chapter?: number; end_chapter?: number; is_incremental: boolean }) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, String(value));
    });
    return api.post(`/novels/${novelId}/parse-characters/?${searchParams.toString()}`);
  },
};
