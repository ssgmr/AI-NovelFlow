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
                return {"status": "ok", "message": "ComfyUI 连接正常", "data": response.json()}
            else:
                raise HTTPException(status_code=503, detail="ComfyUI 连接失败")
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"ComfyUI 连接失败: {str(e)}")


@router.get("/")
async def health_check():
    """基础健康检查"""
    return {"status": "ok", "service": "NovelFlow API"}
