"""测试用例相关的 Pydantic Schema 定义"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class TestCaseBase(BaseModel):
    """测试用例基础字段"""
    name: str = Field(..., description="测试用例名称")
    description: Optional[str] = Field(None, description="描述")
    novel_id: str = Field(..., description="关联的小说ID")
    type: str = Field("full", description="测试类型: full/character/shot/video")
    is_active: bool = Field(True, description="是否启用")
    expected_character_count: Optional[int] = Field(None, description="预期角色数量")
    expected_shot_count: Optional[int] = Field(None, description="预期分镜数量")
    notes: Optional[str] = Field(None, description="备注")


class TestCaseCreate(TestCaseBase):
    """创建测试用例请求"""
    pass


class TestCaseUpdate(BaseModel):
    """更新测试用例请求"""
    name: Optional[str] = Field(None, description="测试用例名称")
    description: Optional[str] = Field(None, description="描述")
    type: Optional[str] = Field(None, description="测试类型")
    is_active: Optional[bool] = Field(None, description="是否启用")
    expected_character_count: Optional[int] = Field(None, description="预期角色数量")
    expected_shot_count: Optional[int] = Field(None, description="预期分镜数量")
    notes: Optional[str] = Field(None, description="备注")


class TestCaseResponse(TestCaseBase):
    """测试用例响应"""
    id: str
    is_preset: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
