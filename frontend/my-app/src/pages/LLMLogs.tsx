import { useState, useEffect } from 'react';
import { 
  ScrollText, 
  ChevronLeft, 
  ChevronRight, 
  Filter,
  Eye,
  X,
  RefreshCw
} from 'lucide-react';
import { toast } from '../stores/toastStore';

interface LLMLog {
  id: string;
  created_at: string;
  provider: string;
  model: string;
  system_prompt: string;
  user_prompt: string;
  response: string;
  status: string;
  error_message: string;
  task_type: string;
  novel_id: string;
  chapter_id: string;
  character_id: string;
}

interface Pagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

export default function LLMLogs() {
  const [logs, setLogs] = useState<LLMLog[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, page_size: 20, total: 0, total_pages: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    provider: '',
    model: '',
    task_type: '',
    status: ''
  });
  const [filterOptions, setFilterOptions] = useState({
    providers: [] as string[],
    models: [] as string[],
    task_types: [] as string[]
  });
  const [selectedLog, setSelectedLog] = useState<LLMLog | null>(null);
  const [activePromptTab, setActivePromptTab] = useState<'system' | 'user' | 'response'>('user');

  useEffect(() => {
    fetchLogs();
    fetchFilterOptions();
  }, [pagination.page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', pagination.page.toString());
      params.append('page_size', pagination.page_size.toString());
      if (filters.provider) params.append('provider', filters.provider);
      if (filters.model) params.append('model', filters.model);
      if (filters.task_type) params.append('task_type', filters.task_type);
      if (filters.status) params.append('status', filters.status);

      const res = await fetch(`${API_BASE}/llm-logs/?${params}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.data.items);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('加载日志失败:', error);
      toast.error('加载日志失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const res = await fetch(`${API_BASE}/llm-logs/filters`);
      const data = await res.json();
      if (data.success) {
        setFilterOptions(data.data);
      }
    } catch (error) {
      console.error('加载筛选选项失败:', error);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const applyFilters = () => {
    fetchLogs();
  };

  const resetFilters = () => {
    setFilters({ provider: '', model: '', task_type: '', status: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
    setTimeout(fetchLogs, 0);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN');
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getTaskTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'parse_characters': '解析角色',
      'split_chapter': '拆分章节',
      'generate_character_appearance': '生成外貌',
      'expand_video_prompt': '扩写视频提示词'
    };
    return labels[type] || type || '-';
  };

  const getStatusBadge = (status: string) => {
    if (status === 'success') {
      return <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">成功</span>;
    }
    return <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">失败</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">JSON解析日志</h1>
        <p className="mt-1 text-sm text-gray-500">
          查看AI解析小说文本时调用LLM API的详细日志
        </p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">筛选条件</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">LLM厂商</label>
            <select
              value={filters.provider}
              onChange={(e) => handleFilterChange('provider', e.target.value)}
              className="input-field text-sm w-full"
            >
              <option value="">全部</option>
              {filterOptions.providers.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">模型</label>
            <select
              value={filters.model}
              onChange={(e) => handleFilterChange('model', e.target.value)}
              className="input-field text-sm w-full"
            >
              <option value="">全部</option>
              {filterOptions.models.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">任务类型</label>
            <select
              value={filters.task_type}
              onChange={(e) => handleFilterChange('task_type', e.target.value)}
              className="input-field text-sm w-full"
            >
              <option value="">全部</option>
              {filterOptions.task_types.map(t => (
                <option key={t} value={t}>{getTaskTypeLabel(t)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">状态</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="input-field text-sm w-full"
            >
              <option value="">全部</option>
              <option value="success">成功</option>
              <option value="error">失败</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={applyFilters}
            className="btn-primary text-sm"
          >
            应用筛选
          </button>
          <button
            onClick={resetFilters}
            className="btn-secondary text-sm"
          >
            重置
          </button>
          <button
            onClick={fetchLogs}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            刷新
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-6 w-6 border-2 border-primary-600 border-t-transparent rounded-full" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <ScrollText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>暂无日志记录</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">时间</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">LLM类型</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">模型</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">任务类型</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">提示词预览</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {log.provider}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {log.model}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {getTaskTypeLabel(log.task_type)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getStatusBadge(log.status)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-md">
                      <div className="truncate" title={log.user_prompt}>
                        {truncateText(log.user_prompt, 80)}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-primary-600 hover:text-primary-700 inline-flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        查看详情
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.total_pages > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              共 {pagination.total} 条记录，第 {pagination.page}/{pagination.total_pages} 页
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page <= 1}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= pagination.total_pages}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">日志详情</h3>
                <p className="text-sm text-gray-500">{formatDate(selectedLog.created_at)}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedLog(null);
                  setActivePromptTab('user');
                }}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-500">厂商:</span>
                <span className="font-medium">{selectedLog.provider}</span>
                <span className="text-gray-500">模型:</span>
                <span className="font-medium">{selectedLog.model}</span>
                <span className="text-gray-500">任务:</span>
                <span className="font-medium">{getTaskTypeLabel(selectedLog.task_type)}</span>
                <span>{getStatusBadge(selectedLog.status)}</span>
              </div>
              
              {selectedLog.error_message && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-red-700 mb-2">错误信息</h4>
                  <pre className="text-sm text-red-600 whitespace-pre-wrap">{selectedLog.error_message}</pre>
                </div>
              )}

              {/* Tab 切换 */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActivePromptTab('system')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activePromptTab === 'system'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  System Prompt
                </button>
                <button
                  onClick={() => setActivePromptTab('user')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activePromptTab === 'user'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  User Prompt
                </button>
                {selectedLog.response && (
                  <button
                    onClick={() => setActivePromptTab('response')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      activePromptTab === 'response'
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    LLM 响应
                  </button>
                )}
              </div>

              {/* Tab 内容 */}
              <div className="bg-gray-50 rounded-lg p-4">
                {activePromptTab === 'system' && (
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-x-auto">
                    {selectedLog.system_prompt || '-'}
                  </pre>
                )}
                {activePromptTab === 'user' && (
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-x-auto">
                    {selectedLog.user_prompt}
                  </pre>
                )}
                {activePromptTab === 'response' && selectedLog.response && (
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-x-auto max-h-96">
                    {selectedLog.response}
                  </pre>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
