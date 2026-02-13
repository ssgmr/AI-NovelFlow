from fastapi import APIRouter, HTTPException
import httpx

from app.core.config import get_settings

router = APIRouter()
settings = get_settings()


@router.get("/deepseek")
async def check_deepseek():
    """检查 DeepSeek API 连接状态"""
    if not settings.DEEPSEEK_API_KEY:
        raise HTTPException(status_code=503, detail="DeepSeek API Key 未配置")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.DEEPSEEK_API_URL}/models",
                headers={"Authorization": f"Bearer {settings.DEEPSEEK_API_KEY}"},
                timeout=5.0
            )
            if response.status_code == 200:
                return {"status": "ok", "message": "DeepSeek API 连接正常"}
            else:
                raise HTTPException(status_code=503, detail="DeepSeek API 连接失败")
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"DeepSeek API 连接失败: {str(e)}")


@router.get("/comfyui")
async def check_comfyui():
    """检查 ComfyUI 连接状态"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.COMFYUI_HOST}/system_stats",
                timeout=5.0
            )
            if response.status_code == 200:
                data = response.json()
                # 提取有用的系统信息
                system_info = {
                    "device_name": data.get("devices", [{}])[0].get("name", "Unknown"),
                    "vram_total": data.get("devices", [{}])[0].get("vram_total", 0) / (1024**3),  # 转换为GB
                    "vram_used": data.get("devices", [{}])[0].get("vram_used", 0) / (1024**3),
                    "gpu_usage": data.get("devices", [{}])[0].get("gpu_usage", 0),
                }
                return {"status": "ok", "message": "ComfyUI 连接正常", "data": system_info}
            else:
                raise HTTPException(status_code=503, detail="ComfyUI 连接失败")
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"ComfyUI 连接失败: {str(e)}")


@router.get("/comfyui-queue")
async def get_comfyui_queue():
    """获取 ComfyUI 队列信息"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.COMFYUI_HOST}/queue",
                timeout=5.0
            )
            if response.status_code == 200:
                data = response.json()
                queue_running = data.get("queue_running", [])
                queue_pending = data.get("queue_pending", [])
                return {
                    "status": "ok",
                    "queue_running": len(queue_running),
                    "queue_pending": len(queue_pending),
                    "queue_size": len(queue_running) + len(queue_pending)
                }
            else:
                return {"status": "ok", "queue_size": 0, "error": "无法获取队列信息"}
    except Exception as e:
        return {"status": "error", "queue_size": 0, "error": str(e)}


@router.get("/")
async def health_check():
    """基础健康检查"""
    return {"status": "ok", "service": "NovelFlow API"}
