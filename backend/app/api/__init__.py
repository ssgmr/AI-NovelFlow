"""
API 路由模块

包含所有 API 路由的定义，统一从 deps.py 获取依赖注入函数。
"""
from app.api.deps import (
    get_novel_repo,
    get_chapter_repo,
    get_character_repo,
    get_scene_repo,
    get_prop_repo,
    get_task_repo,
    get_workflow_repo,
    get_prompt_template_repo,
    get_llm_service,
    get_comfyui_service,
)

__all__ = [
    "get_novel_repo",
    "get_chapter_repo",
    "get_character_repo",
    "get_scene_repo",
    "get_prop_repo",
    "get_task_repo",
    "get_workflow_repo",
    "get_prompt_template_repo",
    "get_llm_service",
    "get_comfyui_service",
]