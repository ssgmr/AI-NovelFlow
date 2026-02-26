/**
 * 测试用例相关 API
 */
import { api } from './index';

export interface TestCaseDetail {
  novel: {
    id: string;
    title: string;
    author: string;
    description: string;
  };
  chapters: Array<{
    id: string;
    number: number;
    title: string;
    contentLength: number;
  }>;
  characters: Array<{
    id: string;
    name: string;
    hasImage: boolean;
  }>;
}

export const testCaseApi = {
  /** 获取测试用例列表 */
  fetchList: () => api.get('/test-cases/'),

  /** 获取测试用例详情 */
  fetch: (id: string) => api.get<TestCaseDetail>(`/test-cases/${id}/`),

  /** 运行测试用例 */
  run: (id: string) => api.post(`/test-cases/${id}/run/`),

  /** 删除测试用例 */
  delete: (id: string) => api.delete(`/test-cases/${id}/`),
};
