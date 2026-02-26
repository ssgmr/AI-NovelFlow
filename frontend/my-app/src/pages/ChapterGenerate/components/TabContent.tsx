import { Users, MapPin } from 'lucide-react';
import { useTranslation } from '../../../stores/i18nStore';
import type { ParsedData } from '../types';

interface TabContentProps {
  activeTab: 'json' | 'characters' | 'scenes' | 'script';
  parsedData: ParsedData | null;
}

export function TabContent({ activeTab, parsedData }: TabContentProps) {
  const { t } = useTranslation();

  switch (activeTab) {
    case 'characters':
      return (
        <div className="space-y-2">
          {parsedData?.characters?.map((name: string, idx: number) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="font-medium">{name}</span>
            </div>
          )) || <p className="text-gray-500 text-sm py-4">{t('chapterGenerate.noCharacterData')}</p>}
        </div>
      );
    case 'scenes':
      return (
        <div className="space-y-2">
          {parsedData?.scenes?.map((name: string, idx: number) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <MapPin className="h-5 w-5 text-green-500" />
              <span className="font-medium">{name}</span>
            </div>
          )) || <p className="text-gray-500 text-sm py-4">{t('chapterGenerate.noSceneData')}</p>}
        </div>
      );
    case 'script':
      return (
        <div className="space-y-3">
          {parsedData?.shots?.map((shot: any) => (
            <div key={shot.id} className="p-3 bg-gray-50 rounded-lg border-l-4 border-purple-500">
              <div className="flex justify-between items-start mb-1">
                <span className="font-medium text-sm">镜{shot.id}</span>
                <span className="text-xs text-gray-500">{shot.duration}秒</span>
              </div>
              <p className="text-sm text-gray-700">{shot.description}</p>
              <div className="flex gap-2 mt-2">
                {shot.characters?.map((c: string) => (
                  <span key={c} className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded">{c}</span>
                ))}
              </div>
            </div>
          )) || <p className="text-gray-500 text-sm py-4">{t('chapterGenerate.noShotDataYet')}</p>}
        </div>
      );
    default:
      return null;
  }
}
