"""
工作流 API 路由

只负责请求/响应处理，业务逻辑委托给 WorkflowService
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.repositories import WorkflowRepository
from app.services.workflow_service import WorkflowService
from app.constants.workflow import WORKFLOW_TYPES

router = APIRouter()


def get_workflow_repo(db: Session = Depends(get_db)) -> WorkflowRepository:
    """获取 WorkflowRepository 实例"""
    return WorkflowRepository(db)


def get_workflow_service(db: Session = Depends(get_db)) -> WorkflowService:
    """获取 WorkflowService 实例"""
    return WorkflowService(db)


# ==================== 工作流列表 ====================

@router.get("/", response_model=dict)
async def list_workflows(
    type: Optional[str] = None,
    db: Session = Depends(get_db),
    workflow_service: WorkflowService = Depends(get_workflow_service),
    workflow_repo: WorkflowRepository = Depends(get_workflow_repo)
):
    """获取工作流列表"""
    # 确保默认工作流已加载
    workflow_service.load_default_workflows()

    if type:
        workflows = workflow_repo.list_by_type(type)
    else:
        workflows = workflow_repo.list_all()

    return {
        "success": True,
        "data": WorkflowService.format_workflow_list(workflows)
    }


@router.get("/{workflow_id}/", response_model=dict)
async def get_workflow(
    workflow_id: str,
    workflow_repo: WorkflowRepository = Depends(get_workflow_repo)
):
    """获取工作流详情"""
    workflow = workflow_repo.get_by_id(workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="工作流不存在")

    return {
        "success": True,
        "data": WorkflowService.format_workflow_detail(workflow)
    }


# ==================== 工作流上传 ====================

@router.post("/upload/", response_model=dict)
async def upload_workflow(
    name: str = Form(...),
    type: str = Form(...),
    description: Optional[str] = Form(None),
    extension: Optional[str] = Form(None),
    file: UploadFile = File(...),
    workflow_service: WorkflowService = Depends(get_workflow_service)
):
    """上传自定义工作流"""
    content = await file.read()
    result = workflow_service.upload_workflow(name, type, description, extension, content)

    if result.get("status_code"):
        raise HTTPException(status_code=result["status_code"], detail=result.get("message"))

    return result


# ==================== 工作流更新 ====================

@router.put("/{workflow_id}/", response_model=dict)
async def update_workflow(
    workflow_id: str,
    data: dict,
    workflow_service: WorkflowService = Depends(get_workflow_service)
):
    """更新工作流信息"""
    try:
        result = workflow_service.update_workflow(workflow_id, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))

    if result.get("status_code"):
        raise HTTPException(status_code=result["status_code"], detail=result.get("message"))

    return result


# ==================== 工作流删除 ====================

@router.delete("/{workflow_id}/")
async def delete_workflow(
    workflow_id: str,
    workflow_service: WorkflowService = Depends(get_workflow_service)
):
    """删除工作流"""
    result = workflow_service.delete_workflow(workflow_id)

    if result.get("status_code"):
        raise HTTPException(status_code=result["status_code"], detail=result.get("message"))

    return result


# ==================== 默认工作流设置 ====================

@router.post("/{workflow_id}/set-default/")
async def set_default_workflow(
    workflow_id: str,
    workflow_service: WorkflowService = Depends(get_workflow_service)
):
    """设置默认工作流（将该类型的工作流设为激活状态，其他同类型的设为非激活）"""
    result = workflow_service.set_default_workflow(workflow_id)

    if result.get("status_code"):
        raise HTTPException(status_code=result["status_code"], detail=result.get("message"))

    return result


# ==================== 扩展属性配置 ====================

@router.get("/extensions/config/", response_model=dict)
async def get_extension_configs(
    workflow_service: WorkflowService = Depends(get_workflow_service)
):
    """获取所有工作流类型的扩展属性配置"""
    configs = workflow_service.get_extension_configs()
    return {
        "success": True,
        "data": configs
    }


@router.get("/extensions/{workflow_type}/", response_model=dict)
async def get_extension_config_by_type(
    workflow_type: str,
    workflow_service: WorkflowService = Depends(get_workflow_service)
):
    """获取指定工作流类型的扩展属性配置"""
    if workflow_type not in WORKFLOW_TYPES:
        raise HTTPException(status_code=400, detail=f"无效的工作流类型，可选: {list(WORKFLOW_TYPES.keys())}")

    result = workflow_service.get_extension_config_by_type(workflow_type)
    return {
        "success": True,
        "data": result
    }


# ==================== 激活工作流 ====================

@router.get("/active/{workflow_type}", response_model=dict)
async def get_active_workflow(
    workflow_type: str,
    db: Session = Depends(get_db),
    workflow_service: WorkflowService = Depends(get_workflow_service),
    workflow_repo: WorkflowRepository = Depends(get_workflow_repo)
):
    """获取当前激活的工作流"""
    # 确保默认工作流已加载
    workflow_service.load_default_workflows()

    workflow = workflow_repo.get_active_by_type(workflow_type)

    if not workflow:
        # 如果没有激活的，返回该类型的第一个系统工作流
        workflow = workflow_repo.get_first_system_by_type(workflow_type)

    if not workflow:
        raise HTTPException(
            status_code=404,
            detail=f"没有找到{WORKFLOW_TYPES.get(workflow_type, workflow_type)}工作流"
        )

    return {
        "success": True,
        "data": WorkflowService.format_active_workflow(workflow)
    }
