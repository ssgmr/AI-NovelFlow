"""
Repository 层

封装数据库查询逻辑，避免 N+1 查询问题
"""
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy import and_, or_

from app.models.novel import Novel, Chapter, Character, Scene


class NovelRepository:
    """小说数据仓库"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def list_with_cover(self) -> List[Dict[str, Any]]:
        """
        获取小说列表，预加载关联数据避免 N+1 查询
        
        Returns:
            小说列表，包含封面信息
        """
        # 使用子查询获取每个小说的第一章节
        novels = self.db.query(Novel).order_by(Novel.created_at.desc()).all()
        
        if not novels:
            return []
        
        novel_ids = [n.id for n in novels]
        
        # 批量查询所有小说的第一章节
        first_chapters = {}
        chapters = self.db.query(Chapter).filter(
            Chapter.novel_id.in_(novel_ids)
        ).order_by(Chapter.novel_id, Chapter.number).all()
        
        for chapter in chapters:
            if chapter.novel_id not in first_chapters:
                first_chapters[chapter.novel_id] = chapter
        
        # 构建结果
        result = []
        for n in novels:
            cover = n.cover
            if not cover:
                first_chapter = first_chapters.get(n.id)
                if first_chapter and first_chapter.shot_images:
                    try:
                        import json
                        shot_images = json.loads(first_chapter.shot_images)
                        if isinstance(shot_images, list) and len(shot_images) > 0:
                            cover = shot_images[0]
                    except json.JSONDecodeError:
                        pass
            
            result.append({
                "id": n.id,
                "title": n.title,
                "author": n.author,
                "description": n.description,
                "cover": cover,
                "status": n.status,
                "chapterCount": n.chapter_count,
                "promptTemplateId": n.prompt_template_id,
                "chapterSplitPromptTemplateId": n.chapter_split_prompt_template_id,
                "aspectRatio": n.aspect_ratio if n.aspect_ratio and n.aspect_ratio.strip() else "16:9",
                "createdAt": n.created_at.isoformat() if n.created_at else None,
                "updatedAt": n.updated_at.isoformat() if n.updated_at else None,
            })
        
        return result
    
    def get_by_id(self, novel_id: str) -> Optional[Novel]:
        """根据 ID 获取小说"""
        return self.db.query(Novel).filter(Novel.id == novel_id).first()
    
    def get_with_chapters(self, novel_id: str) -> Optional[Novel]:
        """获取小说及其章节（预加载）"""
        return self.db.query(Novel).options(
            selectinload(Novel.chapters)
        ).filter(Novel.id == novel_id).first()
    
    def get_with_characters(self, novel_id: str) -> Optional[Novel]:
        """获取小说及其角色（预加载）"""
        return self.db.query(Novel).options(
            selectinload(Novel.characters)
        ).filter(Novel.id == novel_id).first()
    
    def get_with_scenes(self, novel_id: str) -> Optional[Novel]:
        """获取小说及其场景（预加载）"""
        return self.db.query(Novel).options(
            selectinload(Novel.scenes)
        ).filter(Novel.id == novel_id).first()
    
    def get_full(self, novel_id: str) -> Optional[Novel]:
        """获取小说及其所有关联数据（预加载）"""
        return self.db.query(Novel).options(
            selectinload(Novel.chapters),
            selectinload(Novel.characters),
            selectinload(Novel.scenes)
        ).filter(Novel.id == novel_id).first()


class ChapterRepository:
    """章节数据仓库"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def list_by_novel(self, novel_id: str) -> List[Chapter]:
        """获取小说的所有章节"""
        return self.db.query(Chapter).filter(
            Chapter.novel_id == novel_id
        ).order_by(Chapter.number).all()
    
    def get_by_id(self, chapter_id: str, novel_id: str = None) -> Optional[Chapter]:
        """根据 ID 获取章节"""
        query = self.db.query(Chapter).filter(Chapter.id == chapter_id)
        if novel_id:
            query = query.filter(Chapter.novel_id == novel_id)
        return query.first()
    
    def get_first_by_novel(self, novel_id: str) -> Optional[Chapter]:
        """获取小说的第一个章节"""
        return self.db.query(Chapter).filter(
            Chapter.novel_id == novel_id
        ).order_by(Chapter.number.asc()).first()
    
    def get_by_range(
        self, 
        novel_id: str, 
        start_chapter: int = None, 
        end_chapter: int = None
    ) -> List[Chapter]:
        """获取指定章节范围的章节"""
        query = self.db.query(Chapter).filter(Chapter.novel_id == novel_id)
        
        if start_chapter is not None:
            query = query.filter(Chapter.number >= start_chapter)
        if end_chapter is not None:
            query = query.filter(Chapter.number <= end_chapter)
        
        return query.order_by(Chapter.number).all()


class CharacterRepository:
    """角色数据仓库"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def list_by_novel(self, novel_id: str) -> List[Character]:
        """获取小说的所有角色"""
        return self.db.query(Character).filter(
            Character.novel_id == novel_id
        ).all()
    
    def get_by_id(self, character_id: str) -> Optional[Character]:
        """根据 ID 获取角色"""
        return self.db.query(Character).filter(Character.id == character_id).first()
    
    def get_by_name(self, novel_id: str, name: str) -> Optional[Character]:
        """根据名称获取角色"""
        return self.db.query(Character).filter(
            and_(Character.novel_id == novel_id, Character.name == name)
        ).first()
    
    def get_names_by_novel(self, novel_id: str) -> List[str]:
        """获取小说所有角色名称（优化：只查询需要的列）"""
        results = self.db.query(Character.name).filter(
            Character.novel_id == novel_id
        ).all()
        return [r[0] for r in results]


class SceneRepository:
    """场景数据仓库"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def list_by_novel(self, novel_id: str) -> List[Scene]:
        """获取小说的所有场景"""
        return self.db.query(Scene).filter(
            Scene.novel_id == novel_id
        ).all()
    
    def get_by_id(self, scene_id: str) -> Optional[Scene]:
        """根据 ID 获取场景"""
        return self.db.query(Scene).filter(Scene.id == scene_id).first()
    
    def get_by_name(self, novel_id: str, name: str) -> Optional[Scene]:
        """根据名称获取场景"""
        return self.db.query(Scene).filter(
            and_(Scene.novel_id == novel_id, Scene.name == name)
        ).first()
    
    def get_names_by_novel(self, novel_id: str) -> List[str]:
        """获取小说所有场景名称（优化：只查询需要的列）"""
        results = self.db.query(Scene.name).filter(
            Scene.novel_id == novel_id
        ).all()
        return [r[0] for r in results]
    
    def get_dict_by_novel(self, novel_id: str) -> Dict[str, Scene]:
        """获取场景名称到场景对象的映射"""
        scenes = self.list_by_novel(novel_id)
        return {s.name: s for s in scenes}
