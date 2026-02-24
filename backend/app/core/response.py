"""统一 API 响应工具"""
from typing import Any, Optional, Union
from pydantic import BaseModel


class APIResponse(BaseModel):
    """统一 API 响应格式"""
    success: bool = True
    data: Optional[Any] = None
    message: Optional[str] = None
    error: Optional[str] = None
    
    class Config:
        arbitrary_types_allowed = True


def success(
    data: Any = None, 
    message: Optional[str] = None
) -> dict:
    """
    构建成功响应
    
    Args:
        data: 响应数据
        message: 成功消息
        
    Returns:
        标准化的成功响应字典
        
    Example:
        return success({"id": 1, "name": "test"})
        # {"success": True, "data": {"id": 1, "name": "test"}, "message": None, "error": None}
    """
    return APIResponse(
        success=True,
        data=data,
        message=message
    ).model_dump()


def error(
    message: str, 
    data: Any = None
) -> dict:
    """
    构建错误响应
    
    Args:
        message: 错误消息
        data: 附加数据（可选）
        
    Returns:
        标准化的错误响应字典
        
    Example:
        return error("角色不存在")
        # {"success": False, "data": None, "message": None, "error": "角色不存在"}
    """
    return APIResponse(
        success=False,
        data=data,
        error=message
    ).model_dump()


def paginated(
    items: list,
    total: int,
    page: int = 1,
    page_size: int = 20,
    message: Optional[str] = None
) -> dict:
    """
    构建分页响应
    
    Args:
        items: 当前页数据列表
        total: 总记录数
        page: 当前页码
        page_size: 每页数量
        message: 消息
        
    Returns:
        包含分页信息的成功响应
    """
    total_pages = (total + page_size - 1) // page_size if page_size > 0 else 0
    
    return success(
        data={
            "items": items,
            "pagination": {
                "page": page,
                "pageSize": page_size,
                "total": total,
                "totalPages": total_pages,
                "hasNext": page < total_pages,
                "hasPrev": page > 1
            }
        },
        message=message
    )


def created(
    data: Any = None, 
    message: str = "创建成功"
) -> dict:
    """构建创建成功响应"""
    return success(data=data, message=message)


def updated(
    data: Any = None, 
    message: str = "更新成功"
) -> dict:
    """构建更新成功响应"""
    return success(data=data, message=message)


def deleted(
    message: str = "删除成功",
    deleted_count: Optional[int] = None
) -> dict:
    """构建删除成功响应"""
    data = {"deletedCount": deleted_count} if deleted_count is not None else None
    return success(data=data, message=message)
