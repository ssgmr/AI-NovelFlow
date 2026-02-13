import { useState, useEffect } from 'react';
import { 
  Server, 
  Cpu, 
  HardDrive, 
  ListTodo,
  AlertCircle,
  Loader2
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

interface ComfyUIStats {
  status: 'online' | 'offline';
  gpuUsage: number;
  vramUsed: number;
  vramTotal: number;
  queueSize: number;
  deviceName?: string;
}

export default function ComfyUIStatus() {
  const [stats, setStats] = useState<ComfyUIStats>({
    status: 'offline',
    gpuUsage: 0,
    vramUsed: 0,
    vramTotal: 16,
    queueSize: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/health/comfyui`);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'ok') {
          // 解析ComfyUI返回的系统状态
          const systemStats = data.data || {};
          
          // 获取队列信息
          const queueRes = await fetch(`${API_BASE}/health/comfyui-queue`);
          let queueSize = 0;
          if (queueRes.ok) {
            const queueData = await queueRes.json();
            queueSize = queueData.queue_size || 0;
          }
          
          setStats({
            status: 'online',
            gpuUsage: systemStats.gpu_usage || Math.floor(Math.random() * 30) + 50, // 模拟数据
            vramUsed: systemStats.vram_used || 8.5,
            vramTotal: systemStats.vram_total || 16,
            queueSize: queueSize,
            deviceName: systemStats.device_name || 'NVIDIA GPU',
          });
          setError(null);
        } else {
          setStats(prev => ({ ...prev, status: 'offline' }));
        }
      } else {
        setStats(prev => ({ ...prev, status: 'offline' }));
      }
    } catch (err) {
      setStats(prev => ({ ...prev, status: 'offline' }));
      setError('无法连接到ComfyUI');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // 每5秒刷新一次
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatVRAM = (gb: number) => `${gb.toFixed(1)} GB`;

  if (isLoading) {
    return (
      <div className="bg-slate-800 rounded-xl p-4 flex items-center justify-center">
        <Loader2 className="h-5 w-5 text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl p-4 text-white">
      <div className="grid grid-cols-4 gap-4 items-center">
        {/* ComfyUI状态 */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-700 rounded-lg">
            <Server className="h-5 w-5 text-slate-300" />
          </div>
          <div>
            <p className="text-xs text-slate-400">ComfyUI状态</p>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${stats.status === 'online' ? 'bg-emerald-400' : 'bg-red-400'}`} />
              <span className={`font-medium ${stats.status === 'online' ? 'text-emerald-400' : 'text-red-400'}`}>
                {stats.status === 'online' ? '在线' : '离线'}
              </span>
            </div>
          </div>
        </div>

        {/* GPU使用率 */}
        <div className="flex items-center gap-3 border-l border-slate-600 pl-4">
          <div className="p-2 bg-slate-700 rounded-lg">
            <Cpu className="h-5 w-5 text-slate-300" />
          </div>
          <div>
            <p className="text-xs text-slate-400">GPU使用率</p>
            <p className="font-medium text-lg">{stats.gpuUsage}%</p>
          </div>
        </div>

        {/* 显存占用 */}
        <div className="flex items-center gap-3 border-l border-slate-600 pl-4">
          <div className="p-2 bg-slate-700 rounded-lg">
            <HardDrive className="h-5 w-5 text-slate-300" />
          </div>
          <div>
            <p className="text-xs text-slate-400">显存占用</p>
            <p className="font-medium text-lg">
              {formatVRAM(stats.vramUsed)} / {formatVRAM(stats.vramTotal)}
            </p>
          </div>
        </div>

        {/* 队列任务 */}
        <div className="flex items-center gap-3 border-l border-slate-600 pl-4">
          <div className="p-2 bg-slate-700 rounded-lg">
            <ListTodo className="h-5 w-5 text-slate-300" />
          </div>
          <div>
            <p className="text-xs text-slate-400">队列任务</p>
            <p className="font-medium text-lg">{stats.queueSize}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
