import type { Novel, PromptTemplate } from '../../types';

export interface NovelFormData {
  title: string;
  author: string;
  description: string;
  promptTemplateId: string;
  chapterSplitPromptTemplateId: string;
  aspectRatio: string;
}

export interface ChapterRange {
  startChapter: number | null;
  endChapter: number | null;
  isIncremental: boolean;
}

export interface ConfirmDialogState {
  isOpen: boolean;
  novelId: string | null;
  type: 'characters' | 'scenes';
}

export type ParseType = 'characters' | 'scenes';
