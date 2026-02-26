"""分镜相关的 Pydantic Schema 定义"""
from pydantic import BaseModel, Field
from typing import Optional


class TransitionVideoRequest(BaseModel):
    """生成转场视频请求"""
    from_index: int = Field(..., ge=1, description="起始分镜索引(1-based)")
    to_index: int = Field(..., ge=1, description="结束分镜索引(1-based)")
    frame_count: int = Field(49, description="总帧数（8的倍数+1）")
    workflow_id: Optional[str] = Field(None, description="指定工作流ID")


class BatchTransitionRequest(BaseModel):
    """批量生成转场视频请求"""
    frame_count: int = Field(49, description="总帧数（8的倍数+1）")
    workflow_id: Optional[str] = Field(None, description="指定工作流ID")


class MergeVideosRequest(BaseModel):
    """合并视频请求"""
    include_transitions: bool = Field(False, description="是否包含转场视频")
