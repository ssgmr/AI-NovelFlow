/**
 * 角色页面常量
 */

// 画面比例对应的 CSS 类名
export const ASPECT_RATIO_CLASSES: Record<string, string> = {
  '16:9': 'aspect-video',
  '9:16': 'aspect-[9/16]',
  '4:3': 'aspect-[4/3]',
  '3:4': 'aspect-[3/4]',
  '1:1': 'aspect-square',
  '21:9': 'aspect-[21/9]',
  '2.35:1': 'aspect-[2.35/1]',
};

// 允许上传的图片类型
export const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

// 允许上传的音频类型
export const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav',
  'audio/flac', 'audio/x-flac', 'audio/ogg', 'audio/x-ogg',
  'audio/mp4', 'audio/x-m4a', 'audio/m4a'];

// 最大音频文件大小 (10MB)
export const MAX_AUDIO_SIZE = 10 * 1024 * 1024;

// 轮询配置
export const POLL_CONFIG = {
  maxAttempts: 60,
  intervalMs: 3000,
  allIntervalMs: 5000,
};
