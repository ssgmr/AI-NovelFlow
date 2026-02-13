from fastapi import APIRouter
from app.core.config import get_settings

router = APIRouter()
settings = get_settings()


@router.get("/")
async def get_config():
    """获取系统配置（不包含敏感信息）"""
    return {
        "success": True,
        "data": {
            "deepseekApiUrl": settings.DEEPSEEK_API_URL,
            "comfyUIHost": settings.COMFYUI_HOST,
        }
    }
