import type { Chapter, Novel } from '../../types';

export interface ParseResultData {
  created: number;
  updated: number;
  total: number;
}

export interface PreviewImageState {
  isOpen: boolean;
  url: string | null;
  index: number;
  images: string[];
}

export interface StatusInfo {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  text: string;
}
