from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db

router = APIRouter()


@router.get("/", response_model=dict)
async def list_tasks(status: str = None, db: Session = Depends(get_db)):
    """获取任务列表"""
    # 模拟数据
    return {
        "success": True,
        "data": []
    }


@router.post("/{chapter_id}/generate")
async def generate_chapter(chapter_id: str, db: Session = Depends(get_db)):
    """开始生成章节视频"""
    return {
        "success": True,
        "message": "任务已创建",
        "data": {
            "taskId": "mock-task-id",
            "status": "pending"
        }
    }
