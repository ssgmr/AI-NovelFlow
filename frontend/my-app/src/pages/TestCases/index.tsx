import { FlaskConical, Loader2, Play, Trash2, BookOpen, Users, Sparkles, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { useTranslation } from '../../stores/i18nStore';
import type { TestCase } from '../../types';
import { useTestCasesState } from './hooks/useTestCasesState';
import { TestCaseDetail } from './components/TestCaseDetail';

function PresetTestCard({ testCase, runningId, onRun, getTestCaseName, getTestCaseDescription, getTestCaseNotes, getTypeName, getTypeColor }: {
  testCase: TestCase; runningId: string | null; onRun: () => void;
  getTestCaseName: (t: TestCase) => string; getTestCaseDescription: (t: TestCase) => string;
  getTestCaseNotes: (t: TestCase) => string; getTypeName: (t: string) => string; getTypeColor: (t: string) => string;
}) {
  const { t } = useTranslation();
  return (
    <div className="card bg-gradient-to-r from-primary-50 to-purple-50 border-primary-200">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary-100 rounded-lg"><Sparkles className="h-6 w-6 text-primary-600" /></div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">{getTestCaseName(testCase)}</h2>
            <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full">{t('testCases.presetTest')}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{getTestCaseDescription(testCase)}</p>
          <div className="flex items-center gap-6 mt-3 text-sm">
            <span className="flex items-center gap-1 text-gray-600"><BookOpen className="h-4 w-4" />{t('testCases.chapterCount', { count: testCase.chapterCount })}</span>
            <span className="flex items-center gap-1 text-gray-600"><Users className="h-4 w-4" />{t('testCases.characterCount', { count: testCase.characterCount })}</span>
            <span className={`px-2 py-0.5 rounded text-xs ${getTypeColor(testCase.type)}`}>{getTypeName(testCase.type)}</span>
          </div>
          {testCase.notes && <div className="mt-3 p-2 bg-white/50 rounded text-sm text-gray-600"><strong>{t('testCases.notes')}</strong>{getTestCaseNotes(testCase)}</div>}
          <div className="mt-4">
            <button onClick={onRun} disabled={runningId === testCase.id} className="btn-primary">
              {runningId === testCase.id ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t('testCases.running')}</> : <><Play className="h-4 w-4 mr-2" />{t('testCases.runTest')}</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TestCaseRow({ testCase, isExpanded, runningId, onToggle, onRun, onDelete, detail, getTestCaseName, getTypeName, getTypeColor }: {
  testCase: TestCase; isExpanded: boolean; runningId: string | null; onToggle: () => void; onRun: () => void; onDelete: () => void;
  detail: any; getTestCaseName: (t: TestCase) => string; getTypeName: (t: string) => string; getTypeColor: (t: string) => string;
}) {
  const { t } = useTranslation();
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer" onClick={onToggle}>
        <div className="flex items-center gap-4">
          {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
          {testCase.isPreset ? <Sparkles className="h-5 w-5 text-primary-500" /> : <FlaskConical className="h-5 w-5 text-gray-400" />}
          <div>
            <h3 className="font-medium text-gray-900">{getTestCaseName(testCase)}</h3>
            <p className="text-xs text-gray-500">{testCase.novelTitle}</p>
          </div>
          <span className={`px-2 py-0.5 rounded text-xs ${getTypeColor(testCase.type)}`}>{getTypeName(testCase.type)}</span>
          {testCase.isPreset && <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full">{t('testCases.preset')}</span>}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" />{testCase.chapterCount}</span>
            <span className="flex items-center gap-1"><Users className="h-4 w-4" />{testCase.characterCount}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={(e) => { e.stopPropagation(); onRun(); }} disabled={runningId === testCase.id}
              className="p-2 text-gray-400 hover:text-primary-600 transition-colors" title={t('testCases.runTest')}>
              {runningId === testCase.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            </button>
            {!testCase.isPreset && (
              <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors" title={t('common.delete')}>
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
      {isExpanded && detail && <TestCaseDetail testCase={testCase} detail={detail} getTestCaseName={getTestCaseName} />}
    </div>
  );
}

export default function TestCases() {
  const { t } = useTranslation();
  const state = useTestCasesState();
  const presets = state.testCases.filter(tc => tc.isPreset);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('testCases.title')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('testCases.subtitle')}</p>
      </div>

      {/* Preset Test Cases */}
      {presets.map(preset => (
        <PresetTestCard key={preset.id} testCase={preset} runningId={state.runningId} onRun={() => state.runTestCase(preset)}
          getTestCaseName={state.getTestCaseName} getTestCaseDescription={state.getTestCaseDescription}
          getTestCaseNotes={state.getTestCaseNotes} getTypeName={state.getTypeName} getTypeColor={state.getTypeColor} />
      ))}

      {/* All Test Cases */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('testCases.allTestCases')}</h2>
        {state.isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></div>
        ) : state.testCases.length === 0 ? (
          <div className="text-center py-12">
            <FlaskConical className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">{t('testCases.noTestCases')}</h3>
          </div>
        ) : (
          <div className="space-y-3">
            {state.testCases.map(testCase => (
              <TestCaseRow key={testCase.id} testCase={testCase} isExpanded={state.expandedId === testCase.id}
                runningId={state.runningId} onToggle={() => state.fetchTestCaseDetail(testCase.id)}
                onRun={() => state.runTestCase(testCase)} onDelete={() => state.handleDelete(testCase)}
                detail={state.details[testCase.id]} getTestCaseName={state.getTestCaseName}
                getTypeName={state.getTypeName} getTypeColor={state.getTypeColor} />
            ))}
          </div>
        )}
      </div>

      {/* Usage Guide */}
      <div className="card bg-yellow-50 border-yellow-200">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-600" />{t('testCases.usageGuide')}
        </h3>
        <ul className="mt-2 text-sm text-gray-600 space-y-1 list-disc list-inside">
          <li dangerouslySetInnerHTML={{ __html: t('testCases.guide.presetTest') }} />
          <li dangerouslySetInnerHTML={{ __html: t('testCases.guide.runTest') }} />
          <li dangerouslySetInnerHTML={{ __html: t('testCases.guide.checkProgress') }} />
          <li dangerouslySetInnerHTML={{ __html: t('testCases.guide.viewResults') }} />
        </ul>
      </div>
    </div>
  );
}
