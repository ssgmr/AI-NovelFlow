import { useState } from 'react';
import { Save, Loader2, Eye, EyeOff } from 'lucide-react';
import { useConfigStore } from '../stores/configStore';

export default function Settings() {
  const config = useConfigStore();
  const [formData, setFormData] = useState({
    deepseekApiKey: config.deepseekApiKey,
    deepseekApiUrl: config.deepseekApiUrl,
    comfyUIHost: config.comfyUIHost,
    outputResolution: config.outputResolution,
    outputFrameRate: config.outputFrameRate,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // 模拟保存延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    config.setConfig(formData);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const resolutions = [
    { value: '1920x1080', label: '1920x1080 (1080p)' },
    { value: '1280x720', label: '1280x720 (720p)' },
    { value: '3840x2160', label: '3840x2160 (4K)' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">系统配置</h1>
        <p className="mt-1 text-sm text-gray-500">
          配置 AI 服务和输出参数
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* AI 配置 */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">AI 服务配置</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="deepseekApiUrl" className="block text-sm font-medium text-gray-700">
                DeepSeek API 地址
              </label>
              <input
                type="url"
                id="deepseekApiUrl"
                value={formData.deepseekApiUrl}
                onChange={(e) => setFormData({ ...formData, deepseekApiUrl: e.target.value })}
                className="input-field mt-1"
                placeholder="https://api.deepseek.com"
              />
            </div>

            <div>
              <label htmlFor="deepseekApiKey" className="block text-sm font-medium text-gray-700">
                DeepSeek API Key
              </label>
              <div className="relative mt-1">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  id="deepseekApiKey"
                  value={formData.deepseekApiKey}
                  onChange={(e) => setFormData({ ...formData, deepseekApiKey: e.target.value })}
                  className="input-field pr-10"
                  placeholder="sk-..."
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                您的 API Key 仅存储在本地浏览器中
              </p>
            </div>

            <div>
              <label htmlFor="comfyUIHost" className="block text-sm font-medium text-gray-700">
                ComfyUI 地址
              </label>
              <input
                type="url"
                id="comfyUIHost"
                value={formData.comfyUIHost}
                onChange={(e) => setFormData({ ...formData, comfyUIHost: e.target.value })}
                className="input-field mt-1"
                placeholder="http://localhost:8188"
              />
              <p className="mt-1 text-xs text-gray-500">
                您的 ComfyUI 服务地址，例如：http://192.168.50.1:8288
              </p>
            </div>
          </div>
        </div>

        {/* 输出配置 */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">输出配置</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="resolution" className="block text-sm font-medium text-gray-700">
                输出分辨率
              </label>
              <select
                id="resolution"
                value={formData.outputResolution}
                onChange={(e) => setFormData({ ...formData, outputResolution: e.target.value })}
                className="input-field mt-1"
              >
                {resolutions.map((res) => (
                  <option key={res.value} value={res.value}>
                    {res.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="frameRate" className="block text-sm font-medium text-gray-700">
                帧率 (FPS)
              </label>
              <input
                type="number"
                id="frameRate"
                min="1"
                max="60"
                value={formData.outputFrameRate}
                onChange={(e) => setFormData({ ...formData, outputFrameRate: parseInt(e.target.value) })}
                className="input-field mt-1"
              />
            </div>
          </div>
        </div>

        {/* 工作流配置 */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">ComfyUI 工作流</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">人设生成</p>
                <p className="text-sm text-gray-500">工作流: z-image</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                已配置
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">分镜生图</p>
                <p className="text-sm text-gray-500">工作流: qwen-edit-2511</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                已配置
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">视频生成</p>
                <p className="text-sm text-gray-500">工作流: ltx-2</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                已配置
              </span>
            </div>
          </div>
        </div>

        {/* 保存按钮 */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : saved ? (
              <>
                <Save className="mr-2 h-4 w-4" />
                已保存
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                保存配置
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
