from app.schemas.novel import (
    NovelBase, NovelCreate, NovelUpdate, NovelResponse,
    ChapterBase, ChapterCreate, ChapterResponse,
    CharacterBase, CharacterCreate, CharacterResponse,
)
from app.schemas.test_case import (
    TestCaseBase, TestCaseCreate, TestCaseUpdate, TestCaseResponse,
)
from app.schemas.scene import (
    SceneBase, SceneCreate, SceneUpdate, SceneResponse, ParseScenesRequest,
)
from app.schemas.character import (
    CharacterBase as CharacterSchemaBase,
    CharacterCreate as CharacterSchemaCreate,
    CharacterUpdate as CharacterSchemaUpdate,
    CharacterResponse as CharacterSchemaResponse,
)
from app.schemas.shot import (
    TransitionVideoRequest, BatchTransitionRequest, MergeVideosRequest,
)

__all__ = [
    # Novel
    "NovelBase", "NovelCreate", "NovelUpdate", "NovelResponse",
    "ChapterBase", "ChapterCreate", "ChapterResponse",
    "CharacterBase", "CharacterCreate", "CharacterResponse",
    # TestCase
    "TestCaseBase", "TestCaseCreate", "TestCaseUpdate", "TestCaseResponse",
    # Scene
    "SceneBase", "SceneCreate", "SceneUpdate", "SceneResponse", "ParseScenesRequest",
    # Character Schema (aliased)
    "CharacterSchemaBase", "CharacterSchemaCreate", "CharacterSchemaUpdate", "CharacterSchemaResponse",
    # Shot
    "TransitionVideoRequest", "BatchTransitionRequest", "MergeVideosRequest",
]
