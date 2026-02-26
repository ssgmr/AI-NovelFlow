"""
TestCase Repository 层

封装测试用例相关的数据库查询逻辑
"""
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session

from app.models.test_case import TestCase
from app.models.novel import Novel, Chapter, Character


class TestCaseRepository:
    """测试用例数据仓库"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def list_all(self) -> List[TestCase]:
        """获取所有测试用例（按创建时间倒序）"""
        return self.db.query(TestCase).order_by(TestCase.created_at.desc()).all()
    
    def list_by_type(self, test_type: str) -> List[TestCase]:
        """按类型获取测试用例"""
        return self.db.query(TestCase).filter(
            TestCase.type == test_type
        ).order_by(TestCase.created_at.desc()).all()
    
    def list_presets(self) -> List[TestCase]:
        """获取所有预设测试用例"""
        return self.db.query(TestCase).filter(
            TestCase.is_preset == True
        ).order_by(TestCase.created_at.desc()).all()
    
    def list_by_filters(
        self, 
        test_type: Optional[str] = None, 
        is_preset: Optional[bool] = None
    ) -> List[TestCase]:
        """按筛选条件获取测试用例"""
        query = self.db.query(TestCase).order_by(TestCase.created_at.desc())
        
        if test_type:
            query = query.filter(TestCase.type == test_type)
        if is_preset is not None:
            query = query.filter(TestCase.is_preset == is_preset)
        
        return query.all()
    
    def get_by_id(self, test_case_id: str) -> Optional[TestCase]:
        """根据 ID 获取测试用例"""
        return self.db.query(TestCase).filter(TestCase.id == test_case_id).first()
    
    def get_by_novel_id(self, novel_id: str) -> Optional[TestCase]:
        """根据小说ID获取测试用例"""
        return self.db.query(TestCase).filter(TestCase.novel_id == novel_id).first()
    
    def get_preset_names(self) -> List[str]:
        """获取所有预设测试用例的名称"""
        results = self.db.query(TestCase.name).filter(
            TestCase.is_preset == True
        ).all()
        return [r[0] for r in results]
    
    def create(self, test_case: TestCase) -> TestCase:
        """创建测试用例"""
        self.db.add(test_case)
        self.db.commit()
        self.db.refresh(test_case)
        return test_case
    
    def update(self, test_case: TestCase) -> TestCase:
        """更新测试用例"""
        self.db.commit()
        self.db.refresh(test_case)
        return test_case
    
    def delete(self, test_case: TestCase) -> None:
        """删除测试用例"""
        self.db.delete(test_case)
        self.db.commit()
    
    def exists_by_id(self, test_case_id: str) -> bool:
        """检查测试用例是否存在"""
        return self.db.query(TestCase).filter(TestCase.id == test_case_id).first() is not None
    
    def get_test_case_with_novel(self, test_case_id: str) -> Optional[Dict[str, Any]]:
        """
        获取测试用例详情，包含小说、章节和角色信息
        
        Returns:
            包含测试用例、小说、章节、角色信息的字典
        """
        tc = self.get_by_id(test_case_id)
        if not tc:
            return None
        
        # 获取小说
        novel = self.db.query(Novel).filter(Novel.id == tc.novel_id).first()
        
        # 获取章节
        chapters = self.db.query(Chapter).filter(
            Chapter.novel_id == tc.novel_id
        ).order_by(Chapter.number).all()
        
        # 获取角色
        characters = self.db.query(Character).filter(
            Character.novel_id == tc.novel_id
        ).all()
        
        return {
            "test_case": tc,
            "novel": novel,
            "chapters": chapters,
            "characters": characters,
        }
    
    def get_test_case_statistics(self, novel_id: str) -> Dict[str, int]:
        """
        获取小说的统计数据（章节数、角色数）
        
        Args:
            novel_id: 小说ID
            
        Returns:
            包含 chapter_count 和 character_count 的字典
        """
        chapter_count = self.db.query(Chapter).filter(Chapter.novel_id == novel_id).count()
        character_count = self.db.query(Character).filter(Character.novel_id == novel_id).count()
        
        return {
            "chapter_count": chapter_count,
            "character_count": character_count,
        }
    
    def get_novel_by_id(self, novel_id: str) -> Optional[Novel]:
        """根据ID获取小说"""
        return self.db.query(Novel).filter(Novel.id == novel_id).first()
    
    def list_test_cases_with_details(self, test_type: Optional[str] = None, is_preset: Optional[bool] = None) -> List[Dict[str, Any]]:
        """
        获取测试用例列表，包含小说信息和统计数据
        
        Returns:
            测试用例列表，每个元素包含详细信息
        """
        test_cases = self.list_by_filters(test_type=test_type, is_preset=is_preset)
        
        result = []
        for tc in test_cases:
            novel = self.get_novel_by_id(tc.novel_id)
            stats = self.get_test_case_statistics(tc.novel_id)
            
            result.append({
                "test_case": tc,
                "novel": novel,
                "chapter_count": stats["chapter_count"],
                "character_count": stats["character_count"],
            })
        
        return result
