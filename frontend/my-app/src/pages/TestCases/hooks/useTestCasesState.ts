import { useState, useEffect } from 'react';
import { toast } from '../../../stores/toastStore';
import { useTranslation } from '../../../stores/i18nStore';
import { testCaseApi } from '../../../api/testCases';
import type { TestCase } from '../../../types';

export function useTestCasesState() {
  const { t } = useTranslation();
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, any>>({});

  useEffect(() => { fetchTestCases(); }, []);

  const fetchTestCases = async () => {
    setIsLoading(true);
    try {
      const data = await testCaseApi.fetchList();
      if (data.success && data.data) setTestCases(data.data as TestCase[]);
    } catch (error) {
      console.error('获取测试用例失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTestCaseDetail = async (id: string) => {
    if (details[id]) { setExpandedId(expandedId === id ? null : id); return; }
    try {
      const data = await testCaseApi.fetch(id);
      if (data.success && data.data) { setDetails({ ...details, [id]: data.data }); setExpandedId(id); }
    } catch (error) {
      console.error('获取详情失败:', error);
    }
  };

  const runTestCase = async (testCase: TestCase) => {
    setRunningId(testCase.id);
    try {
      const data = await testCaseApi.run(testCase.id);
      if (data.success) {
        toast.success(t('testCases.testStarted', { name: getTestCaseName(testCase) }));
        window.location.href = '/tasks';
      } else {
        toast.error('启动失败: ' + data.message);
      }
    } catch (error) {
      console.error('运行测试用例失败:', error);
      toast.error('运行失败');
    } finally {
      setRunningId(null);
    }
  };

  const handleDelete = async (testCase: TestCase) => {
    if (testCase.isPreset) { toast.warning(t('testCases.cannotDeletePreset')); return; }
    if (!confirm(t('testCases.confirmDelete'))) return;
    try {
      await testCaseApi.delete(testCase.id);
      setTestCases(testCases.filter(t => t.id !== testCase.id));
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  const getTypeName = (type: string) => t(`testCases.types.${type}`, { defaultValue: type });

  const getTestCaseName = (testCase: TestCase): string => {
    if (testCase.isPreset && testCase.nameKey) return t(testCase.nameKey, { defaultValue: testCase.name });
    return testCase.name;
  };

  const getTestCaseDescription = (testCase: TestCase): string => {
    if (testCase.isPreset && testCase.descriptionKey) return t(testCase.descriptionKey, { defaultValue: testCase.description || '' });
    return testCase.description || '';
  };

  const getTestCaseNotes = (testCase: TestCase): string => {
    if (testCase.isPreset && testCase.notesKey) return t(testCase.notesKey, { defaultValue: testCase.notes || '' });
    return testCase.notes || '';
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'full': 'bg-purple-100 text-purple-800', 'character': 'bg-blue-100 text-blue-800',
      'shot': 'bg-green-100 text-green-800', 'video': 'bg-orange-100 text-orange-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return {
    testCases, isLoading, expandedId, runningId, details,
    fetchTestCaseDetail, runTestCase, handleDelete, getTypeName, getTestCaseName,
    getTestCaseDescription, getTestCaseNotes, getTypeColor
  };
}
