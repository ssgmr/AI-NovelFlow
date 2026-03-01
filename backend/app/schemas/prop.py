"""道具相关的 Pydantic Schema 定义"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime


class PropBase(BaseModel):
    """道具基础字段"""
    novel_id: str = Field(..., alias="novelId", description="关联的小说ID")
    name: str = Field(..., description="道具名称")
    description: Optional[str] = Field("", description="道具描述")
    appearance: Optional[str] = Field("", description="道具外观描述")


class PropCreate(PropBase):
    """创建道具请求"""
    model_config = {"populate_by_name": True}


class PropUpdate(BaseModel):
    """更新道具请求"""
    name: Optional[str] = Field(None, description="道具名称")
    description: Optional[str] = Field(None, description="道具描述")
    appearance: Optional[str] = Field(None, description="道具外观描述")


class PropResponse(PropBase):
    """道具响应"""
    id: str
    image_url: Optional[str] = None
    generating_status: Optional[str] = None
    prop_task_id: Optional[str] = None
    start_chapter: Optional[int] = None
    end_chapter: Optional[int] = None
    is_incremental: bool = False
    source_range: Optional[str] = None
    last_parsed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True