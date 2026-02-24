"""统一异常处理"""
from typing import Any, Optional
from fastapi import HTTPException, Request, status
from fastapi.responses import JSONResponse


class AppException(Exception):
    """
    应用自定义异常
    
    Usage:
        raise AppException(
            code="CHARACTER_NOT_FOUND",
            message="角色不存在",
            status_code=404
        )
    """
    
    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        data: Optional[Any] = None
    ):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.data = data
        super().__init__(message)


class NotFoundException(AppException):
    """资源未找到异常"""
    
    def __init__(self, resource: str = "资源", resource_id: Optional[str] = None):
        message = f"{resource}不存在"
        if resource_id:
            message = f"{resource} (ID: {resource_id}) 不存在"
        super().__init__(
            code="NOT_FOUND",
            message=message,
            status_code=status.HTTP_404_NOT_FOUND
        )


class ValidationException(AppException):
    """验证异常"""
    
    def __init__(self, message: str, field: Optional[str] = None):
        super().__init__(
            code="VALIDATION_ERROR",
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
            data={"field": field} if field else None
        )


class ServiceException(AppException):
    """服务异常（如外部 API 调用失败）"""
    
    def __init__(self, service: str, message: str):
        super().__init__(
            code="SERVICE_ERROR",
            message=f"{service} 服务异常: {message}",
            status_code=status.HTTP_502_BAD_GATEWAY
        )


class ConfigurationException(AppException):
    """配置异常"""
    
    def __init__(self, message: str):
        super().__init__(
            code="CONFIGURATION_ERROR",
            message=message,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    """
    AppException 全局处理器
    
    在 main.py 中注册:
        app.add_exception_handler(AppException, app_exception_handler)
    """
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.message,
            "code": exc.code,
            "data": exc.data
        }
    )


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """
    HTTPException 全局处理器
    
    在 main.py 中注册:
        app.add_exception_handler(HTTPException, http_exception_handler)
    """
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail,
            "code": "HTTP_ERROR"
        }
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    通用异常处理器（捕获未处理的异常）
    
    在 main.py 中注册:
        app.add_exception_handler(Exception, generic_exception_handler)
    """
    # 打印异常信息用于调试
    import traceback
    traceback.print_exc()
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": "服务器内部错误",
            "code": "INTERNAL_ERROR"
        }
    )


def register_exception_handlers(app):
    """
    注册所有异常处理器到 FastAPI 应用
    
    Usage:
        from app.core.exceptions import register_exception_handlers
        register_exception_handlers(app)
    """
    app.add_exception_handler(AppException, app_exception_handler)
    app.add_exception_handler(HTTPException, http_exception_handler)
    # 生产环境可以启用通用异常处理器
    # app.add_exception_handler(Exception, generic_exception_handler)
