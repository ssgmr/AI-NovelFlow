from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.novel import Character

router = APIRouter()


@router.get("/", response_model=dict)
async def list_characters(novel_id: str = None, db: Session = Depends(get_db)):
    """获取角色列表"""
    query = db.query(Character)
    if novel_id:
        query = query.filter(Character.novel_id == novel_id)
    characters = query.all()
    return {
        "success": True,
        "data": [
            {
                "id": c.id,
                "novelId": c.novel_id,
                "name": c.name,
                "description": c.description,
                "appearance": c.appearance,
                "imageUrl": c.image_url,
            }
            for c in characters
        ]
    }
