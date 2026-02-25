"""
工作流扩展属性配置

为不同类型的工作流定义可用的扩展属性选项
"""

from typing import Dict, List, Optional, Any


# 扩展属性定义
# 每种工作流类型可以有自己的扩展属性配置
WORKFLOW_EXTENSIONS: Dict[str, Dict[str, Any]] = {
    "shot": {
        "name": "reference_image_count",
        "label": "参考图数量",
        "labelKey": "workflow.extension.referenceImageCount",
        "options": [
            {"value": "single", "label": "单图", "labelKey": "workflow.extension.single"},
            {"value": "dual", "label": "双图", "labelKey": "workflow.extension.dual"},
            {"value": "triple", "label": "三图", "labelKey": "workflow.extension.triple"},
        ],
        "default": "single"
    },
    # 其他类型可以在这里添加扩展属性
    # "character": { ... },
    # "scene": { ... },
    # "video": { ... },
    # "transition": { ... },
}


def get_extension_config(workflow_type: str) -> Optional[Dict[str, Any]]:
    """
    获取指定工作流类型的扩展属性配置
    
    Args:
        workflow_type: 工作流类型 (character, scene, shot, video, transition)
        
    Returns:
        扩展属性配置字典，如果没有配置则返回 None
    """
    return WORKFLOW_EXTENSIONS.get(workflow_type)


def get_default_extension(workflow_type: str, workflow_name: str = "") -> Optional[Dict[str, Any]]:
    """
    获取指定工作流类型的默认扩展属性值
    
    对于分镜生图类型:
    - "Flux2-Klein-9B 分镜生图双图参考" 默认为 "dual"
    - 其他分镜生图工作流默认为 "single"
    
    Args:
        workflow_type: 工作流类型
        workflow_name: 工作流名称（用于判断特殊默认值）
        
    Returns:
        默认扩展属性值字典，如 {"reference_image_count": "single"}
    """
    config = get_extension_config(workflow_type)
    if not config:
        return None
    
    # 获取属性名
    prop_name = config.get("name", "type")
    
    # 特殊默认值逻辑
    if workflow_type == "shot":
        if "双图" in workflow_name or "dual" in workflow_name.lower():
            return {prop_name: "dual"}
    
    # 返回配置的默认值
    default_value = config.get("default", "single")
    return {prop_name: default_value}


def validate_extension(workflow_type: str, extension: Dict[str, Any]) -> tuple[bool, str]:
    """
    验证扩展属性值是否有效
    
    Args:
        workflow_type: 工作流类型
        extension: 扩展属性值字典
        
    Returns:
        (是否有效, 错误信息)
    """
    config = get_extension_config(workflow_type)
    if not config:
        # 该类型没有扩展属性配置，允许任何值（或空）
        return True, ""
    
    if not extension:
        return True, ""
    
    prop_name = config.get("name", "type")
    valid_values = [opt["value"] for opt in config.get("options", [])]
    
    value = extension.get(prop_name)
    if value is not None and value not in valid_values:
        return False, f"无效的扩展属性值 '{value}'，可选值: {valid_values}"
    
    return True, ""


def get_all_extension_configs() -> Dict[str, Dict[str, Any]]:
    """
    获取所有扩展属性配置（用于前端展示）
    
    Returns:
        所有工作流类型的扩展属性配置
    """
    return WORKFLOW_EXTENSIONS.copy()
