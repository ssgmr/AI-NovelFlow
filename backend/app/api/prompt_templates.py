from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from app.core.database import get_db
from app.models.prompt_template import PromptTemplate

router = APIRouter(tags=["prompt_templates"])


# 系统预设的人设提示词模板
SYSTEM_PROMPT_TEMPLATES = [
    {
        "name": "标准动漫风格",
        "description": "适合大多数动漫角色的标准人设生成",
        "template": "character portrait, anime style, high quality, detailed, {appearance}, {description}, single character, centered, clean background, professional artwork, 8k"
    },
    {
        "name": "写实风格",
        "description": "写实风格的角色人设",
        "template": "character portrait, realistic style, photorealistic, highly detailed, {appearance}, {description}, single character, centered, professional photography, studio lighting, 8k"
    },
    {
        "name": "Q版卡通",
        "description": "可爱Q版卡通风格",
        "template": "chibi character, cute cartoon style, kawaii, {appearance}, {description}, single character, centered, colorful, clean background, professional artwork, 4k"
    },
    {
        "name": "水墨风格",
        "description": "中国传统水墨画风格",
        "template": "character portrait, Chinese ink painting style, traditional art, {appearance}, {description}, single character, centered, elegant, artistic, high quality"
    }
]


def init_system_prompt_templates(db: Session):
    """初始化系统预设提示词模板"""
    # 检查是否已有系统模板
    existing = db.query(PromptTemplate).filter(PromptTemplate.is_system == True).first()
    if existing:
        return
    
    # 创建系统预设模板
    for tmpl_data in SYSTEM_PROMPT_TEMPLATES:
        template = PromptTemplate(
            name=tmpl_data["name"],
            description=tmpl_data["description"],
            template=tmpl_data["template"],
            is_system=True,
            is_active=True
        )
        db.add(template)
    
    db.commit()
    print("[初始化] 已创建系统预设人设提示词模板")


class PromptTemplateCreate(BaseModel):
    name: str
    description: str = ""
    template: str


class PromptTemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    template: Optional[str] = None


class PromptTemplateResponse(BaseModel):
    id: str
    name: str
    description: str
    template: str
    isSystem: bool
    isActive: bool
    createdAt: str
    
    class Config:
        from_attributes = True


@router.get("/", response_model=dict)
def list_prompt_templates(db: Session = Depends(get_db)):
    """获取所有提示词模板"""
    templates = db.query(PromptTemplate).order_by(
        PromptTemplate.is_system.desc(),
        PromptTemplate.created_at.desc()
    ).all()
    
    return {
        "success": True,
        "data": [
            {
                "id": t.id,
                "name": t.name,
                "description": t.description,
                "template": t.template,
                "isSystem": t.is_system,
                "isActive": t.is_active,
                "createdAt": t.created_at.isoformat() if t.created_at else None,
            }
            for t in templates
        ]
    }


@router.get("/{template_id}", response_model=dict)
def get_prompt_template(template_id: str, db: Session = Depends(get_db)):
    """获取单个提示词模板"""
    template = db.query(PromptTemplate).filter(PromptTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="提示词模板不存在")
    
    return {
        "success": True,
        "data": {
            "id": template.id,
            "name": template.name,
            "description": template.description,
            "template": template.template,
            "isSystem": template.is_system,
            "isActive": template.is_active,
            "createdAt": template.created_at.isoformat() if template.created_at else None,
        }
    }


@router.post("/", response_model=dict)
def create_prompt_template(data: PromptTemplateCreate, db: Session = Depends(get_db)):
    """创建用户自定义提示词模板"""
    template = PromptTemplate(
        name=data.name,
        description=data.description,
        template=data.template,
        is_system=False,  # 用户创建的默认为非系统
        is_active=True
    )
    db.add(template)
    db.commit()
    db.refresh(template)
    
    return {
        "success": True,
        "message": "提示词模板创建成功",
        "data": {
            "id": template.id,
            "name": template.name,
            "description": template.description,
            "template": template.template,
            "isSystem": template.is_system,
            "isActive": template.is_active,
            "createdAt": template.created_at.isoformat() if template.created_at else None,
        }
    }


@router.post("/{template_id}/copy", response_model=dict)
def copy_prompt_template(template_id: str, db: Session = Depends(get_db)):
    """复制系统提示词模板为用户自定义模板"""
    source = db.query(PromptTemplate).filter(PromptTemplate.id == template_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="源提示词模板不存在")
    
    # 创建副本
    new_template = PromptTemplate(
        name=f"{source.name} (副本)",
        description=source.description,
        template=source.template,
        is_system=False,  # 复制出来的为用户类型
        is_active=True
    )
    db.add(new_template)
    db.commit()
    db.refresh(new_template)
    
    return {
        "success": True,
        "message": "提示词模板复制成功",
        "data": {
            "id": new_template.id,
            "name": new_template.name,
            "description": new_template.description,
            "template": new_template.template,
            "isSystem": new_template.is_system,
            "isActive": new_template.is_active,
            "createdAt": new_template.created_at.isoformat() if new_template.created_at else None,
        }
    }


@router.put("/{template_id}", response_model=dict)
def update_prompt_template(
    template_id: str, 
    data: PromptTemplateUpdate, 
    db: Session = Depends(get_db)
):
    """更新提示词模板（仅用户自定义可编辑）"""
    template = db.query(PromptTemplate).filter(PromptTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="提示词模板不存在")
    
    if template.is_system:
        raise HTTPException(status_code=403, detail="系统预设提示词不可编辑")
    
    if data.name is not None:
        template.name = data.name
    if data.description is not None:
        template.description = data.description
    if data.template is not None:
        template.template = data.template
    
    db.commit()
    db.refresh(template)
    
    return {
        "success": True,
        "message": "提示词模板更新成功",
        "data": {
            "id": template.id,
            "name": template.name,
            "description": template.description,
            "template": template.template,
            "isSystem": template.is_system,
            "isActive": template.is_active,
            "createdAt": template.created_at.isoformat() if template.created_at else None,
        }
    }


@router.delete("/{template_id}", response_model=dict)
def delete_prompt_template(template_id: str, db: Session = Depends(get_db)):
    """删除提示词模板（仅用户自定义可删除）"""
    template = db.query(PromptTemplate).filter(PromptTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="提示词模板不存在")
    
    if template.is_system:
        raise HTTPException(status_code=403, detail="系统预设提示词不可删除")
    
    db.delete(template)
    db.commit()
    
    return {"success": True, "message": "提示词模板删除成功"}


@router.get("/system/default", response_model=dict)
def get_default_system_template(db: Session = Depends(get_db)):
    """获取默认的系统提示词模板"""
    template = db.query(PromptTemplate).filter(
        PromptTemplate.is_system == True
    ).order_by(PromptTemplate.created_at.asc()).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="未找到系统提示词模板")
    
    return {
        "success": True,
        "data": {
            "id": template.id,
            "name": template.name,
            "description": template.description,
            "template": template.template,
            "isSystem": template.is_system,
            "isActive": template.is_active,
            "createdAt": template.created_at.isoformat() if template.created_at else None,
        }
    }
