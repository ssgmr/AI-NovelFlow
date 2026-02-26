import type { PromptTemplate } from '../../types';

export type TemplateType = 'character' | 'chapter_split';

export interface PromptForm {
  name: string;
  description: string;
  template: string;
  wordCount: number;
}
