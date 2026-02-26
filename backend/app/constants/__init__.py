"""
常量定义模块
"""
from app.constants.workflow import (
    WORKFLOW_TYPES,
    DEFAULT_WORKFLOWS,
    EXTRA_SYSTEM_WORKFLOWS,
    # 辅助函数
    get_workflow_name_key,
    get_workflow_desc_key,
    find_workflow_config_by_name,
    get_workflow_i18n_keys,
)

__all__ = [
    "WORKFLOW_TYPES",
    "DEFAULT_WORKFLOWS",
    "EXTRA_SYSTEM_WORKFLOWS",
    "get_workflow_name_key",
    "get_workflow_desc_key",
    "find_workflow_config_by_name",
    "get_workflow_i18n_keys",
]
