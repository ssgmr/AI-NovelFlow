import zhCN from './locales/zh-CN';
import zhTW from './locales/zh-TW';
import enUS from './locales/en-US';
import jaJP from './locales/ja-JP';
import koKR from './locales/ko-KR';

export type Language = 'zh-CN' | 'zh-TW' | 'en-US' | 'ja-JP' | 'ko-KR';

export const translations = {
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  'en-US': enUS,
  'ja-JP': jaJP,
  'ko-KR': koKR,
};

export type Translations = typeof zhCN;
