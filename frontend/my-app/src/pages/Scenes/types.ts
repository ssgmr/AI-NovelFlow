/**
 * 场景页面类型定义
 */
import type { Scene } from '../../types';

export interface SceneWithNovel extends Scene {
  novelName?: string;
}

export interface ScenePrompt {
  prompt: string;
  templateName: string;
  templateId?: string;
  isSystem?: boolean;
}

export interface PreviewImageState {
  isOpen: boolean;
  url: string | null;
  name: string;
  sceneId: string | null;
}

export interface DeleteAllConfirmDialog {
  isOpen: boolean;
}
