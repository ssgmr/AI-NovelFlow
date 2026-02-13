from sqlalchemy import Column, String, DateTime, Text, Boolean, Integer
from sqlalchemy.sql import func
import uuid

from app.core.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)  # 工作流名称
    description = Column(Text, nullable=True)  # 描述
    type = Column(String, nullable=False)  # character(人设), shot(分镜), video(视频)
    
    # 工作流JSON内容
    workflow_json = Column(Text, nullable=False)
    
    # 是否系统预设
    is_system = Column(Boolean, default=False)
    
    # 是否激活
    is_active = Column(Boolean, default=True)
    
    # 文件路径（系统工作流）
    file_path = Column(String, nullable=True)
    
    # 创建者（用户上传的）
    created_by = Column(String, nullable=True)
    
    # 时间戳
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
