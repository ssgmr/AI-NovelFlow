/**
 * 提示词模板相关 API
 */
import { api } from './index';
import type { PromptTemplate } from '../types';

export const promptTemplateApi = {
  /** 获取模板列表 */
  fetchList: (type: 'character' | 'chapter_split') => 
    api.get<PromptTemplate[]>(`/prompt-templates/?type=${type}`),

  /** 创建模板 */
  create: (data: { name: string; description: string; template: string; type: string }) => 
    api.post<PromptTemplate>('/prompt-templates/', data),

  /** 更新模板 */
  update: (id: string, data: { name: string; description: string; template: string; type: string }) => 
    api.put<PromptTemplate>(`/prompt-templates/${id}/`, data),

  /** 删除模板 */
  delete: (id: string) => api.delete(`/prompt-templates/${id}/`),

  /** 复制模板 */
  copy: (id: string) => api.post<PromptTemplate>(`/prompt-templates/${id}/copy`),
};
