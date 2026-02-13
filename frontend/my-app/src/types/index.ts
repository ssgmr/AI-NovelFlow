export interface SystemConfig {
  deepseekApiKey: string;
  deepseekApiUrl: string;
  comfyUIHost: string;
  outputResolution: string;
  outputFrameRate: number;
}

export interface Novel {
  id: string;
  title: string;
  author: string;
  description: string;
  cover?: string;
  chapterCount: number;
  status: 'pending' | 'processing' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  id: string;
  novelId: string;
  number: number;
  title: string;
  content?: string;
  status: 'pending' | 'parsing' | 'generating_characters' | 'generating_shots' | 'generating_videos' | 'compositing' | 'completed' | 'failed';
  progress: number;
  parsedData?: ParsedData;
  characterImages?: string[];
  shotImages?: string[];
  shotVideos?: string[];
  finalVideo?: string;
}

export interface ParsedData {
  characters: Character[];
  scenes: Scene[];
  shots: Shot[];
}

export interface Character {
  id: string;
  name: string;
  description: string;
  appearance: string;
  imageUrl?: string;
}

export interface Scene {
  id: string;
  title: string;
  description: string;
  shots: string[];
}

export interface Shot {
  id: string;
  sceneId: string;
  description: string;
  cameraAngle?: string;
  imageUrl?: string;
  videoUrl?: string;
}

export interface Task {
  id: string;
  type: 'parse' | 'generate_characters' | 'generate_shots' | 'generate_videos' | 'composite';
  novelId: string;
  chapterId?: string;
  step: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  message?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
