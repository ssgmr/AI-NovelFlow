import { useEffect, useState } from 'react';
import { 
  Sparkles, 
  CheckCircle, 
  XCircle, 
  Loader2,
  ArrowRight,
  Zap,
  Film,
  Image
} from 'lucide-react';
import { useConfigStore } from '../stores/configStore';
import { Link } from 'react-router-dom';

export default function Welcome() {
  const { checkConnection, deepseekApiKey, comfyUIHost } = useConfigStore();
  const [status, setStatus] = useState<{ deepseek: boolean; comfyui: boolean } | null>(null);
  const [checking, setChecking] = useState(false);

  const handleCheck = async () => {
    setChecking(true);
    const result = await checkConnection();
    setStatus(result);
    setChecking(false);
  };

  useEffect(() => {
    handleCheck();
  }, []);

  const isConfigured = deepseekApiKey && comfyUIHost;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-primary-100 rounded-2xl">
            <Sparkles className="h-16 w-16 text-primary-600" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          欢迎使用 NovelFlow
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          AI 驱动的小说转视频平台。将您的小说自动转换为精彩的视觉作品。
        </p>
      </div>

      {/* Workflow Overview */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">工作流程</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { icon: Zap, title: '文本解析', desc: 'DeepSeek AI' },
            { icon: Image, title: '人设生成', desc: 'z-image' },
            { icon: Image, title: '分镜生图', desc: 'qwen-edit' },
            { icon: Film, title: '视频生成', desc: 'ltx-2' },
            { icon: Sparkles, title: '视频合成', desc: 'FFmpeg' },
          ].map((step, index) => (
            <div key={step.title} className="flex items-center">
              <div className="flex-1 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 mb-3">
                  <step.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="font-medium text-gray-900">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </div>
              {index < 4 && (
                <ArrowRight className="hidden md:block h-5 w-5 text-gray-300 mx-2" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* System Status */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">系统状态</h2>
          <button
            onClick={handleCheck}
            disabled={checking}
            className="btn-secondary text-sm"
          >
            {checking ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                检查中...
              </>
            ) : (
              '重新检查'
            )}
          </button>
        </div>

        <div className="space-y-4">
          {/* DeepSeek API */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${status?.deepseek ? 'bg-green-100' : 'bg-red-100'}`}>
                {status?.deepseek ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">DeepSeek API</p>
                <p className="text-sm text-gray-500">
                  {status?.deepseek ? '连接正常' : deepseekApiKey ? '连接失败' : '未配置 API Key'}
                </p>
              </div>
            </div>
            <Link to="/settings" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              配置
            </Link>
          </div>

          {/* ComfyUI */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${status?.comfyui ? 'bg-green-100' : 'bg-red-100'}`}>
                {status?.comfyui ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">ComfyUI</p>
                <p className="text-sm text-gray-500">
                  {status?.comfyui ? '连接正常' : comfyUIHost ? '连接失败' : '未配置地址'}
                </p>
              </div>
            </div>
            <Link to="/settings" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              配置
            </Link>
          </div>
        </div>

        {!isConfigured && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>提示：</strong> 请先完成系统配置，才能开始使用 NovelFlow。
            </p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex justify-center gap-4">
        <Link
          to="/novels"
          className={`btn-primary ${!isConfigured ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={(e) => !isConfigured && e.preventDefault()}
        >
          开始创作
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
        <Link to="/settings" className="btn-secondary">
          系统配置
        </Link>
      </div>
    </div>
  );
}
