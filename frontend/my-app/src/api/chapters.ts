/**
 * 章节相关 API
 */
import { api } from './index';
import type { Chapter, Novel } from '../types';

export interface ParseResult {
  created: number;
  updated: number;
  total: number;
}

export const chapterApi = {
  /** 获取章节信息 */
  fetch: (novelId: string, chapterId: string) => 
    api.get<Chapter>(`/novels/${novelId}/chapters/${chapterId}/`),

  /** 更新章节 */
  update: (novelId: string, chapterId: string, data: { title: string; content: string }) => 
    api.put<Chapter>(`/novels/${novelId}/chapters/${chapterId}/`, data),

  /** 删除章节 */
  delete: (novelId: string, chapterId: string) => 
    api.delete(`/novels/${novelId}/chapters/${chapterId}/`),

  /** 获取小说所有章节 */
  fetchByNovel: (novelId: string) => 
    api.get<Chapter[]>(`/novels/${novelId}/chapters/`),

  /** 创建章节 */
  create: (novelId: string, data: Partial<Chapter>) => 
    api.post<Chapter>(`/novels/${novelId}/chapters/`, data),

  /** 解析章节角色 */
  parseCharacters: (novelId: string, chapterId: string, isIncremental = true) => 
    api.post<{ statistics: ParseResult }>(`/novels/${novelId}/chapters/${chapterId}/parse-characters/`, { is_incremental: isIncremental }),

  /** 解析章节场景 */
  parseScenes: (novelId: string, chapterId: string, isIncremental = true) => 
    api.post<{ statistics: ParseResult }>(`/novels/${novelId}/chapters/${chapterId}/parse-scenes/`, { is_incremental: isIncremental }),

  /** 拆分章节 */
  split: (novelId: string, chapterId: string) => 
    api.post<Chapter[]>(`/novels/${novelId}/chapters/${chapterId}/split/`),

  /** 清理章节资源 */
  clearResources: (novelId: string, chapterId: string) => 
    api.post(`/novels/${novelId}/chapters/${chapterId}/clear-resources`),

  /** 下载章节素材 */
  downloadMaterials: (novelId: string, chapterId: string) => 
    `/api/novels/${novelId}/chapters/${chapterId}/download-materials/`,

  /** 合并章节视频 */
  mergeVideos: (novelId: string, chapterId: string) => 
    api.post(`/novels/${novelId}/chapters/${chapterId}/merge-videos/`),
};
