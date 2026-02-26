/**
 * 角色页面类型定义
 */
import type { Character } from '../../types';

export interface CharacterWithNovel extends Character {
  novelName?: string;
}

export interface CharacterPrompt {
  prompt: string;
  templateName: string;
  templateId?: string;
  isSystem?: boolean;
}

export interface PreviewImageState {
  isOpen: boolean;
  url: string | null;
  name: string;
  characterId: string | null;
}

export interface DeleteAllConfirmDialog {
  isOpen: boolean;
}
