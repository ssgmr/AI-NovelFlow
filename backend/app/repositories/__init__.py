"""
Repository 层

封装数据库查询逻辑，避免 N+1 查询问题
"""
from .novel import (
    NovelRepository,
    ChapterRepository,
    CharacterRepository,
    SceneRepository,
)

__all__ = [
    "NovelRepository",
    "ChapterRepository",
    "CharacterRepository",
    "SceneRepository",
]
