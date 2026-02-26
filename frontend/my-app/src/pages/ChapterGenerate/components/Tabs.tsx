import { useTranslation } from '../../../stores/i18nStore';

interface TabsProps {
  activeTab: 'json' | 'characters' | 'scenes' | 'script';
  onTabChange: (tab: 'json' | 'characters' | 'scenes' | 'script') => void;
}

/**
 * 标签页组件
 */
export function Tabs({ activeTab, onTabChange }: TabsProps) {
  const { t } = useTranslation();
  
  const tabs = [
    { key: 'characters' as const, label: t('chapterGenerate.characterList') },
    { key: 'scenes' as const, label: t('chapterGenerate.sceneList') },
    { key: 'script' as const, label: t('chapterGenerate.shotScript') }
  ];

  return (
    <div className="flex gap-4 mb-4 border-b border-gray-200">
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`pb-2 px-1 text-sm font-medium transition-colors ${
            activeTab === tab.key 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
