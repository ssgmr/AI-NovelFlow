"""
角色数据仓库

封装角色相关的数据库查询逻辑
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models.novel import Character


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
    
    def create(self, novel_id: str, name: str, description: str = "", 
               appearance: str = "", start_chapter: int = None, 
               end_chapter: int = None, source_range: str = None) -> Character:
        """创建角色"""
        character = Character(
            novel_id=novel_id,
            name=name,
            description=description,
            appearance=appearance,
            start_chapter=start_chapter,
            end_chapter=end_chapter,
            source_range=source_range,
        )
        self.db.add(character)
        self.db.commit()
        self.db.refresh(character)
        return character
    
    def update(self, character: Character, **kwargs) -> Character:
        """更新角色"""
        for key, value in kwargs.items():
            if hasattr(character, key):
                setattr(character, key, value)
        self.db.commit()
        self.db.refresh(character)
        return character
    
    def delete(self, character: Character) -> None:
        """删除角色"""
        self.db.delete(character)
        self.db.commit()
    
    def list_all(self) -> List[Character]:
        """获取所有角色（按创建时间倒序）"""
        return self.db.query(Character).order_by(Character.created_at.desc()).all()
    
    def delete_by_novel(self, novel_id: str) -> int:
        """删除小说的所有角色，返回删除数量"""
        count = self.db.query(Character).filter(Character.novel_id == novel_id).delete()
        self.db.commit()
        return count
    
    def create_from_schema(self, novel_id: str, name: str, description: str = "", 
                          appearance: str = "") -> Character:
        """从 Schema 数据创建角色"""
        return self.create(
            novel_id=novel_id,
            name=name,
            description=description,
            appearance=appearance
        )
    
    def update_from_schema(self, character: Character, name: str = None, 
                          description: str = None, appearance: str = None) -> Character:
        """从 Schema 数据更新角色"""
        update_data = {}
        if name is not None:
            update_data["name"] = name
        if description is not None:
            update_data["description"] = description
        if appearance is not None:
            update_data["appearance"] = appearance
        return self.update(character, **update_data)
    
    def update_appearance(self, character: Character, appearance: str) -> Character:
        """更新角色外貌"""
        return self.update(character, appearance=appearance)
    
    def update_image(self, character: Character, image_url: str, generating_status: str = "completed") -> Character:
        """更新角色图片"""
        return self.update(character, image_url=image_url, generating_status=generating_status)
