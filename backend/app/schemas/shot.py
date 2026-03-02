"""分镜相关的 Pydantic Schema 定义"""
from pydantic import BaseModel, Field
from typing import Optional, List


class DialogueData(BaseModel):
    """台词数据"""
    character_name: str = Field(..., description="角色名称")
    text: str = Field(..., description="台词文本")
    emotion_prompt: Optional[str] = Field(None, description="情感提示词")
    audio_url: Optional[str] = Field(None, description="音频URL")
    audio_task_id: Optional[str] = Field(None, description="音频生成任务ID")
    audio_source: Optional[str] = Field(None, description="音频来源：ai_generated 或 uploaded")


class ShotAudioRequest(BaseModel):
    """单分镜音频生成请求"""
    dialogues: List[DialogueData] = Field(..., description="台词列表")


class BatchShotAudioRequest(BaseModel):
    """批量章节音频生成请求"""
    pass


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
