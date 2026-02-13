// API 基础配置
// 开发环境使用 Vite 代理，生产环境使用完整 URL

const getBaseUrl = () => {
  // 如果定义了 VITE_API_URL 环境变量，直接使用
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL + '/api';
  }
  // 否则使用相对路径（通过 Vite 代理）
  return '/api';
};

export const API_BASE_URL = getBaseUrl();

// 统一的 fetch 封装
export async function apiFetch(url: string, options: RequestInit = {}) {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  
  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
}
