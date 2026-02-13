from sqlalchemy import Column, String, DateTime, Text, Boolean
from sqlalchemy.sql import func
import uuid

from app.core.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class PromptTemplate(Base):
    """人设提示词模板"""
    __tablename__ = "prompt_templates"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)  # 提示词名称
    description = Column(Text, default="")  # 描述
    template = Column(Text, nullable=False)  # 提示词模板内容
    is_system = Column(Boolean, default=False)  # 是否系统预设（不可编辑）
    is_active = Column(Boolean, default=True)  # 是否启用
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
