from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.novel import Novel, Chapter
from app.schemas.novel import NovelCreate, NovelResponse, ChapterCreate, ChapterResponse

router = APIRouter()


@router.get("/", response_model=dict)
async def list_novels(db: Session = Depends(get_db)):
    """获取小说列表"""
    novels = db.query(Novel).order_by(Novel.created_at.desc()).all()
    return {
        "success": True,
        "data": [
            {
                "id": n.id,
                "title": n.title,
                "author": n.author,
                "description": n.description,
                "cover": n.cover,
                "status": n.status,
                "chapterCount": n.chapter_count,
                "createdAt": n.created_at.isoformat() if n.created_at else None,
                "updatedAt": n.updated_at.isoformat() if n.updated_at else None,
            }
            for n in novels
        ]
    }


@router.post("/", response_model=dict)
async def create_novel(novel: NovelCreate, db: Session = Depends(get_db)):
    """创建新小说"""
    db_novel = Novel(
        title=novel.title,
        author=novel.author,
        description=novel.description,
    )
    db.add(db_novel)
    db.commit()
    db.refresh(db_novel)
    return {
        "success": True,
        "data": {
            "id": db_novel.id,
            "title": db_novel.title,
            "author": db_novel.author,
            "description": db_novel.description,
            "cover": db_novel.cover,
            "status": db_novel.status,
            "chapterCount": db_novel.chapter_count,
            "createdAt": db_novel.created_at.isoformat() if db_novel.created_at else None,
        }
    }


@router.get("/{novel_id}", response_model=dict)
async def get_novel(novel_id: str, db: Session = Depends(get_db)):
    """获取小说详情"""
    novel = db.query(Novel).filter(Novel.id == novel_id).first()
    if not novel:
        raise HTTPException(status_code=404, detail="小说不存在")
    return {
        "success": True,
        "data": {
            "id": novel.id,
            "title": novel.title,
            "author": novel.author,
            "description": novel.description,
            "cover": novel.cover,
            "status": novel.status,
            "chapterCount": novel.chapter_count,
            "createdAt": novel.created_at.isoformat() if novel.created_at else None,
        }
    }


@router.delete("/{novel_id}")
async def delete_novel(novel_id: str, db: Session = Depends(get_db)):
    """删除小说"""
    novel = db.query(Novel).filter(Novel.id == novel_id).first()
    if not novel:
        raise HTTPException(status_code=404, detail="小说不存在")
    db.delete(novel)
    db.commit()
    return {"success": True, "message": "删除成功"}


@router.post("/import")
async def import_novel(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """导入 TXT 小说文件"""
    content = await file.read()
    text = content.decode('utf-8')
    
    # 简单解析：第一行作为标题
    lines = text.strip().split('\n')
    title = lines[0][:50] if lines else "未命名"
    
    # 创建小说
    novel = Novel(
        title=title,
        description=f"从 {file.filename} 导入",
    )
    db.add(novel)
    db.commit()
    db.refresh(novel)
    
    return {
        "success": True,
        "data": {
            "id": novel.id,
            "title": novel.title,
            "chapterCount": 0,
        }
    }


@router.get("/{novel_id}/chapters", response_model=dict)
async def list_chapters(novel_id: str, db: Session = Depends(get_db)):
    """获取章节列表"""
    chapters = db.query(Chapter).filter(Chapter.novel_id == novel_id).order_by(Chapter.number).all()
    return {
        "success": True,
        "data": [
            {
                "id": c.id,
                "novelId": c.novel_id,
                "number": c.number,
                "title": c.title,
                "status": c.status,
                "progress": c.progress,
            }
            for c in chapters
        ]
    }


@router.post("/{novel_id}/chapters", response_model=dict)
async def create_chapter(novel_id: str, chapter: ChapterCreate, db: Session = Depends(get_db)):
    """创建章节"""
    novel = db.query(Novel).filter(Novel.id == novel_id).first()
    if not novel:
        raise HTTPException(status_code=404, detail="小说不存在")
    
    db_chapter = Chapter(
        novel_id=novel_id,
        title=chapter.title,
        number=chapter.number,
        content=chapter.content,
    )
    db.add(db_chapter)
    
    # 更新章节数
    novel.chapter_count = db.query(Chapter).filter(Chapter.novel_id == novel_id).count() + 1
    
    db.commit()
    db.refresh(db_chapter)
    return {
        "success": True,
        "data": {
            "id": db_chapter.id,
            "title": db_chapter.title,
            "status": db_chapter.status,
            "progress": db_chapter.progress,
        }
    }
