"""
Windows GPU 监控服务
在 ComfyUI 所在的 Windows 机器上运行
提供真实的 GPU 使用率、温度、显存、内存信息
"""
from flask import Flask, jsonify
from flask_cors import CORS

try:
    from pynvml import (
        nvmlInit, nvmlShutdown, nvmlDeviceGetCount,
        nvmlDeviceGetHandleByIndex, nvmlDeviceGetUtilizationRates,
        nvmlDeviceGetTemperature, NVML_TEMPERATURE_GPU,
        nvmlDeviceGetMemoryInfo, nvmlDeviceGetName
    )
    NVIDIA_AVAILABLE = True
except ImportError:
    NVIDIA_AVAILABLE = False
    print("警告: nvidia-ml-py 未安装，请运行: pip install nvidia-ml-py")

# 添加内存监控
try:
    import psutil
    PSUTIL_AVAILABLE = True
except ImportError:
    PSUTIL_AVAILABLE = False
    print("警告: psutil 未安装，内存信息不可用")

app = Flask(__name__)
CORS(app)  # 允许跨域访问

# 初始化 NVML
def init_nvml():
    if NVIDIA_AVAILABLE:
        try:
            nvmlInit()
            print("[GPU Monitor] NVML 初始化成功")
            return True
        except Exception as e:
            print(f"[GPU Monitor] NVML 初始化失败: {e}")
            return False
    return False

@app.route("/")
def index():
    return "GPU Monitor Service Running"

@app.route("/gpu-stats")
def gpu_stats():
    """获取 GPU 完整状态"""
    if not NVIDIA_AVAILABLE:
        return jsonify({
            "error": "nvidia-ml-py not available",
            "gpu_usage": 0,
            "temperature": 0,
            "vram_used": 0,
            "vram_total": 0,
            "gpu_name": "Unknown"
        }), 500
    
    try:
        device_count = nvmlDeviceGetCount()
        if device_count == 0:
            return jsonify({"error": "No GPU found"}), 404
        
        # 获取第一个 GPU（通常为主 GPU）
        handle = nvmlDeviceGetHandleByIndex(0)
        
        # 获取 GPU 名称
        gpu_name = nvmlDeviceGetName(handle)
        
        # 获取 GPU 使用率（真实的！）
        util = nvmlDeviceGetUtilizationRates(handle)
        gpu_usage = util.gpu  # 0-100
        
        # 获取温度（摄氏度）
        try:
            temperature = nvmlDeviceGetTemperature(handle, NVML_TEMPERATURE_GPU)
        except:
            temperature = 0
        
        # 获取显存信息
        mem = nvmlDeviceGetMemoryInfo(handle)
        vram_used = round(mem.used / (1024**3), 1)  # 转换为 GB
        vram_total = round(mem.total / (1024**3), 1)
        
        # 获取系统内存信息
        ram_info = {}
        if PSUTIL_AVAILABLE:
            try:
                ram = psutil.virtual_memory()
                ram_info = {
                    "ram_total": round(ram.total / (1024**3), 1),  # GB
                    "ram_used": round(ram.used / (1024**3), 1),    # GB
                    "ram_percent": ram.percent  # 0-100
                }
            except Exception as e:
                print(f"[GPU Monitor] 获取内存信息失败: {e}")
        
        return jsonify({
            "status": "ok",
            "gpu_name": gpu_name,
            "gpu_usage": gpu_usage,
            "temperature": temperature,
            "vram_used": vram_used,
            "vram_total": vram_total,
            "vram_percent": round((mem.used / mem.total) * 100, 1) if mem.total > 0 else 0,
            **ram_info  # 展开内存信息
        })
        
    except Exception as e:
        return jsonify({
            "error": str(e),
            "gpu_usage": 0,
            "temperature": 0,
            "vram_used": 0,
            "vram_total": 0
        }), 500

@app.route("/health")
def health():
    """健康检查"""
    return jsonify({
        "status": "ok",
        "nvidia_available": NVIDIA_AVAILABLE
    })

if __name__ == "__main__":
    print("="*50)
    print("GPU Monitor Service")
    print("="*50)
    
    if init_nvml():
        print("[GPU Monitor] 启动服务...")
        print("[GPU Monitor] 访问: http://localhost:9999/gpu-stats")
        # 使用 0.0.0.0 允许局域网访问
        app.run(host="0.0.0.0", port=9999, debug=False)
    else:
        print("[GPU Monitor] 无法初始化 NVML，请检查 NVIDIA 驱动")
        print("[GPU Monitor] 仍然启动服务（将返回模拟数据）")
        app.run(host="0.0.0.0", port=9999, debug=False)
