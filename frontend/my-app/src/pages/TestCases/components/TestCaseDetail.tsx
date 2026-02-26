import { CheckCircle, BookOpen, Users } from 'lucide-react';
import { useTranslation } from '../../../stores/i18nStore';
import type { TestCase } from '../../../types';

interface TestCaseDetailProps {
  testCase: TestCase;
  detail: any;
  getTestCaseName: (t: TestCase) => string;
}

export function TestCaseDetail({ testCase, detail, getTestCaseName }: TestCaseDetailProps) {
  const { t } = useTranslation();
  return (
    <div className="border-t border-gray-200 p-4 bg-gray-50">
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <h4 className="font-medium text-gray-900 mb-2">{t('testCases.novelInfo')}</h4>
          <div className="bg-white rounded p-3">
            <p><strong>{t('testCases.novelTitle')}</strong>{detail.novel.title}</p>
            <p><strong>{t('testCases.novelAuthor')}</strong>{detail.novel.author || t('testCases.unknown')}</p>
            <p className="text-sm text-gray-600 mt-1">{detail.novel.description}</p>
          </div>
          <h4 className="font-medium text-gray-900 mt-4 mb-2">{t('testCases.chapterList')} ({detail.chapters.length})</h4>
          <div className="bg-white rounded p-3 max-h-40 overflow-y-auto">
            {detail.chapters.map((ch: any) => (
              <div key={ch.id} className="py-1 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-500">{t('testCases.chapterNumber', { number: ch.number })}</span>
                <span className="ml-2">{ch.title}</span>
                <span className="text-xs text-gray-400 ml-2">({ch.contentLength} {t('testCases.words')})</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-medium text-gray-900 mb-2">{t('testCases.characterList')} ({detail.characters.length})</h4>
          <div className="bg-white rounded p-3">
            {detail.characters.map((char: any) => (
              <div key={char.id} className="flex items-center gap-2 py-1">
                <span className="text-sm">{char.name}</span>
                {char.hasImage && <CheckCircle className="h-3 w-3 text-green-500" />}
              </div>
            ))}
            {detail.characters.length === 0 && <p className="text-sm text-gray-400">{t('testCases.noCharacters')}</p>}
          </div>
          {testCase.expectedCharacterCount && (
            <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
              <strong>{t('testCases.expectedCharacterCount')}</strong>{testCase.expectedCharacterCount}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
