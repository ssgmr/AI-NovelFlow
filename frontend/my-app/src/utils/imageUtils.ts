/**
 * 图片相关工具函数
 */

/**
 * 允许上传的图片类型
 */
export const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

/**
 * 验证文件是否为允许的图片类型
 */
export function isValidImageType(fileType: string): boolean {
  return ALLOWED_IMAGE_TYPES.includes(fileType);
}

/**
 * 获取图片尺寸信息
 */
export function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * 获取图片文件大小
 */
export async function getImageFileSize(url: string): Promise<number | null> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentLength = response.headers.get('content-length');
    return contentLength ? parseInt(contentLength) : null;
  } catch {
    return null;
  }
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes > 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  } else if (bytes > 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${bytes} B`;
}
