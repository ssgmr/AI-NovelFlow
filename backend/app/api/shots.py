"""
分镜路由 - 分镜图/视频/转场生成相关接口
"""
import json
import asyncio
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.novel import Novel, Chapter
from app.models.task import Task
from app.models.workflow import Workflow
from app.services.comfyui import ComfyUIService
from app.services.file_storage import file_storage
from app.services.novel_service import NovelService, generate_shot_task, generate_shot_video_task, generate_transition_video_task
from app.services.task_service import TaskService
from app.repositories import NovelRepository, ChapterRepository, TaskRepository, WorkflowRepository
from app.schemas.shot import TransitionVideoRequest, BatchTransitionRequest, MergeVideosRequest
from app.api.deps import get_novel_repo, get_chapter_repo, get_task_repo, get_workflow_repo
from app.utils.time_utils import format_datetime

router = APIRouter()
comfyui_service = ComfyUIService()


# ==================== 分镜图生成 ====================

@router.post("/{novel_id}/chapters/{chapter_id}/shots/{shot_index}/generate", response_model=dict)
async def generate_shot_image(
    novel_id: str,
    chapter_id: str,
    shot_index: int,
    db: Session = Depends(get_db),
    novel_repo: NovelRepository = Depends(get_novel_repo),
    chapter_repo: ChapterRepository = Depends(get_chapter_repo),
    task_repo: TaskRepository = Depends(get_task_repo),
    workflow_repo: WorkflowRepository = Depends(get_workflow_repo)
):
    """为指定分镜生成图片（创建后台任务）"""
    # 获取章节
    chapter = chapter_repo.get_by_id(chapter_id, novel_id)
    
    if not chapter:
        raise HTTPException(status_code=404, detail="章节不存在")
    
    # 获取小说
    novel = novel_repo.get_by_id(novel_id)
    if not novel:
        raise HTTPException(status_code=404, detail="小说不存在")
    
    # 解析章节数据
    if not chapter.parsed_data:
        raise HTTPException(status_code=400, detail="章节未拆分，请先进行AI拆分")
    
    parsed_data = json.loads(chapter.parsed_data) if isinstance(chapter.parsed_data, str) else chapter.parsed_data
    shots = parsed_data.get("shots", [])
    
    if shot_index < 1 or shot_index > len(shots):
        raise HTTPException(status_code=400, detail="分镜索引超出范围")
    
    shot = shots[shot_index - 1]
    shot_description = shot.get("description", "")
    
    # 检查是否已有进行中的任务
    existing_task = task_repo.get_active_shot_task(novel_id, chapter_id, shot_index, "shot_image")
    
    if existing_task:
        return {
            "success": True,
            "message": "已有进行中的生成任务",
            "data": {
                "taskId": existing_task.id,
                "status": existing_task.status
            }
        }
    
    # 获取激活的分镜生图工作流
    workflow = workflow_repo.get_active_by_type("shot")
    
    if not workflow:
        raise HTTPException(status_code=400, detail="未配置分镜生图工作流")
    
    # 验证工作流节点映射配置
    is_valid, error_msg = TaskService.validate_workflow_node_mapping(workflow, "shot")
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)
    
    # 清除旧的图片数据和文件
    file_storage.delete_shot_image(novel_id, chapter_id, shot_index)
    
    shot_images = json.loads(chapter.shot_images) if chapter.shot_images else []
    if isinstance(shot_images, list) and len(shot_images) >= shot_index:
        shot_images[shot_index - 1] = None
        chapter.shot_images = json.dumps(shot_images, ensure_ascii=False)
    
    if "shots" in parsed_data and len(parsed_data["shots"]) >= shot_index:
        if "image_url" in parsed_data["shots"][shot_index - 1]:
            del parsed_data["shots"][shot_index - 1]["image_url"]
        if "image_path" in parsed_data["shots"][shot_index - 1]:
            del parsed_data["shots"][shot_index - 1]["image_path"]
        chapter.parsed_data = json.dumps(parsed_data, ensure_ascii=False)
    
    db.commit()
    
    # 使用 Repository 创建任务记录
    task = task_repo.create_shot_image_task(
        novel_id=novel_id,
        chapter_id=chapter_id,
        shot_index=shot_index,
        chapter_title=chapter.title,
        workflow_id=workflow.id,
        workflow_name=workflow.name
    )
    
    print(f"[GenerateShot] Created task {task.id} for shot {shot_index}")
    
    # 启动后台任务
    asyncio.create_task(
        generate_shot_task(
            task.id,
            novel_id,
            chapter_id,
            shot_index,
            shot_description,
            workflow.id
        )
    )
    
    return {
        "success": True,
        "message": "分镜图生成任务已创建",
        "data": {
            "taskId": task.id,
            "status": "pending"
        }
    }


# ==================== 分镜视频生成 ====================

@router.post("/{novel_id}/chapters/{chapter_id}/shots/{shot_index}/generate-video", response_model=dict)
async def generate_shot_video(
    novel_id: str,
    chapter_id: str,
    shot_index: int,
    db: Session = Depends(get_db),
    novel_repo: NovelRepository = Depends(get_novel_repo),
    chapter_repo: ChapterRepository = Depends(get_chapter_repo),
    task_repo: TaskRepository = Depends(get_task_repo),
    workflow_repo: WorkflowRepository = Depends(get_workflow_repo)
):
    """为指定分镜生成视频（基于已生成的分镜图片）"""
    # 获取章节
    chapter = chapter_repo.get_by_id(chapter_id, novel_id)
    
    if not chapter:
        raise HTTPException(status_code=404, detail="章节不存在")
    
    # 获取小说
    novel = novel_repo.get_by_id(novel_id)
    if not novel:
        raise HTTPException(status_code=404, detail="小说不存在")
    
    # 解析章节数据
    if not chapter.parsed_data:
        raise HTTPException(status_code=400, detail="章节未拆分，请先进行AI拆分")
    
    parsed_data = json.loads(chapter.parsed_data) if isinstance(chapter.parsed_data, str) else chapter.parsed_data
    shots = parsed_data.get("shots", [])
    
    if shot_index < 1 or shot_index > len(shots):
        raise HTTPException(status_code=400, detail="分镜索引超出范围")
    
    shot = shots[shot_index - 1]
    shot_duration = shot.get("duration", 4)
    
    # 检查是否有已生成的分镜图片
    shot_images = json.loads(chapter.shot_images) if chapter.shot_images else []
    shot_image_url = None
    
    if isinstance(shot_images, list) and len(shot_images) >= shot_index:
        shot_image_url = shot_images[shot_index - 1]
    
    if not shot_image_url:
        shot_image_url = shot.get("image_url")
    
    if not shot_image_url:
        raise HTTPException(status_code=400, detail="该分镜尚未生成图片，请先生成分镜图片")
    
    # 检查是否已有进行中的视频生成任务
    existing_task = task_repo.get_active_shot_task(novel_id, chapter_id, shot_index, "shot_video")
    
    if existing_task:
        return {
            "success": True,
            "message": "已有进行中的视频生成任务",
            "data": {
                "taskId": existing_task.id,
                "status": existing_task.status
            }
        }
    
    # 检查是否有失败的任务，如果有则删除旧任务以便重新生成
    failed_task = task_repo.get_failed_shot_task(novel_id, chapter_id, shot_index, "shot_video")
    
    if failed_task:
        print(f"[GenerateVideo] Deleting failed task {failed_task.id} for shot {shot_index} to allow regeneration")
        task_repo.delete(failed_task)
    
    # 清除该分镜的旧视频记录
    shot_videos = json.loads(chapter.shot_videos) if chapter.shot_videos else []
    if isinstance(shot_videos, list) and len(shot_videos) >= shot_index:
        old_video_url = shot_videos[shot_index - 1]
        if old_video_url:
            print(f"[GenerateVideo] Clearing old video record for shot {shot_index}: {old_video_url}")
            shot_videos[shot_index - 1] = None
            chapter.shot_videos = json.dumps(shot_videos)
            db.commit()
    
    # 获取激活的视频生成工作流
    workflow = workflow_repo.get_active_by_type("video")
    
    if not workflow:
        raise HTTPException(status_code=400, detail="未配置视频生成工作流，请在系统设置中配置")
    
    # 验证工作流节点映射配置
    is_valid, error_msg = TaskService.validate_workflow_node_mapping(workflow, "video")
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)
    
    # 使用 Repository 创建任务记录
    task = task_repo.create_shot_video_task(
        novel_id=novel_id,
        chapter_id=chapter_id,
        shot_index=shot_index,
        shot_duration=shot_duration,
        chapter_title=chapter.title,
        workflow_id=workflow.id,
        workflow_name=workflow.name
    )
    
    print(f"[GenerateVideo] Created task {task.id} for shot {shot_index}")
    
    # 启动后台任务
    asyncio.create_task(
        generate_shot_video_task(
            task.id,
            novel_id,
            chapter_id,
            shot_index,
            workflow.id,
            shot_image_url
        )
    )
    
    return {
        "success": True,
        "message": "视频生成任务已创建",
        "data": {
            "taskId": task.id,
            "status": "pending"
        }
    }


# ==================== 转场视频生成 ====================

@router.post("/{novel_id}/chapters/{chapter_id}/transitions", response_model=dict)
async def generate_transition_video(
    novel_id: str,
    chapter_id: str,
    data: TransitionVideoRequest,
    chapter_repo: ChapterRepository = Depends(get_chapter_repo),
    task_repo: TaskRepository = Depends(get_task_repo),
    workflow_repo: WorkflowRepository = Depends(get_workflow_repo)
):
    """
    生成转场视频（两个分镜之间）
    """
    chapter = chapter_repo.get_by_id(chapter_id, novel_id)
    
    if not chapter:
        raise HTTPException(status_code=404, detail="章节不存在")
    
    from_index = data.from_index
    to_index = data.to_index
    frame_count = data.frame_count
    workflow_id = data.workflow_id
    
    # 解析分镜数据
    parsed_data = json.loads(chapter.parsed_data) if chapter.parsed_data else {}
    shots = parsed_data.get("shots", [])
    
    if from_index < 1 or to_index > len(shots) or from_index >= to_index:
        raise HTTPException(status_code=400, detail="无效的分镜索引")
    
    # 获取分镜视频
    shot_videos = json.loads(chapter.shot_videos) if chapter.shot_videos else []
    
    first_video = shot_videos[from_index - 1] if from_index <= len(shot_videos) else None
    second_video = shot_videos[to_index - 1] if to_index <= len(shot_videos) else None
    
    if not first_video or not second_video:
        raise HTTPException(status_code=400, detail="分镜视频尚未生成，请先生成分镜视频")
    
    # 检查是否已有进行中的转场视频任务
    existing_task = task_repo.get_transition_task(novel_id, chapter_id, from_index, to_index)
    
    if existing_task:
        return {
            "success": True,
            "message": "转场视频生成任务已在进行中",
            "task_id": existing_task.id,
            "status": existing_task.status
        }
    
    # 获取转场视频工作流
    if workflow_id:
        workflow = workflow_repo.get_by_id(workflow_id)
        if not workflow:
            raise HTTPException(status_code=400, detail="指定的工作流不存在")
    else:
        workflow = workflow_repo.get_active_by_type("transition")
    
    if not workflow:
        raise HTTPException(status_code=400, detail="未配置转场视频工作流，请在系统设置中配置")
    
    # 验证工作流节点映射配置
    is_valid, error_msg = TaskService.validate_workflow_node_mapping(workflow, "transition")
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)
    
    # 使用 Repository 创建任务记录
    task = task_repo.create_transition_video_task(
        novel_id=novel_id,
        chapter_id=chapter_id,
        from_index=from_index,
        to_index=to_index,
        chapter_title=chapter.title,
        workflow_id=workflow.id,
        workflow_name=workflow.name,
        frame_count=frame_count
    )
    
    print(f"[Transition] Created task {task.id} for transition {from_index}->{to_index} using workflow {workflow.name}")
    
    # 启动后台任务
    asyncio.create_task(
        generate_transition_video_task(
            task.id,
            novel_id,
            chapter_id,
            from_index,
            to_index,
            workflow.id,
            frame_count
        )
    )
    
    return {
        "success": True,
        "message": "转场视频生成任务已创建",
        "task_id": task.id,
        "status": "pending"
    }


@router.post("/{novel_id}/chapters/{chapter_id}/transitions/batch", response_model=dict)
async def generate_all_transitions(
    novel_id: str,
    chapter_id: str,
    data: BatchTransitionRequest = BatchTransitionRequest(),
    db: Session = Depends(get_db),
    chapter_repo: ChapterRepository = Depends(get_chapter_repo),
    task_repo: TaskRepository = Depends(get_task_repo),
    workflow_repo: WorkflowRepository = Depends(get_workflow_repo)
):
    """一键生成所有相邻分镜之间的转场视频"""
    chapter = chapter_repo.get_by_id(chapter_id, novel_id)
    
    if not chapter:
        raise HTTPException(status_code=404, detail="章节不存在")
    
    # 解析分镜数据
    parsed_data = json.loads(chapter.parsed_data) if chapter.parsed_data else {}
    shots = parsed_data.get("shots", [])
    
    if len(shots) < 2:
        raise HTTPException(status_code=400, detail="分镜数量不足，无法生成转场")
    
    # 获取分镜视频
    shot_videos = json.loads(chapter.shot_videos) if chapter.shot_videos else []
    
    if len(shot_videos) < len(shots):
        raise HTTPException(status_code=400, detail="部分分镜视频尚未生成，请先生成所有分镜视频")
    
    frame_count = data.frame_count
    workflow_id = data.workflow_id
    
    # 获取转场视频工作流
    if workflow_id:
        workflow = workflow_repo.get_by_id(workflow_id)
        if not workflow:
            raise HTTPException(status_code=400, detail="指定的工作流不存在")
    else:
        workflow = workflow_repo.get_active_by_type("transition")
    
    if not workflow:
        raise HTTPException(status_code=400, detail="未配置转场视频工作流")
    
    # 为每对相邻分镜创建任务
    task_ids = []
    for i in range(1, len(shots)):
        from_idx = i
        to_idx = i + 1
        
        # 检查是否已有进行中的任务
        existing_task = task_repo.get_transition_task(novel_id, chapter_id, from_idx, to_idx)
        
        if existing_task:
            task_ids.append(existing_task.id)
            continue
        
        task = task_repo.create_transition_video_task(
            novel_id=novel_id,
            chapter_id=chapter_id,
            from_index=from_idx,
            to_index=to_idx,
            chapter_title=chapter.title,
            workflow_id=workflow.id,
            workflow_name=workflow.name,
            frame_count=frame_count
        )
        task_ids.append(task.id)
        
        asyncio.create_task(
            generate_transition_video_task(
                task.id,
                novel_id,
                chapter_id,
                from_idx,
                to_idx,
                workflow.id,
                frame_count
            )
        )
    
    return {
        "success": True,
        "message": f"已创建 {len(task_ids)} 个转场视频生成任务",
        "task_count": len(task_ids),
        "task_ids": task_ids
    }


# ==================== 素材下载与合并 ====================

@router.get("/{novel_id}/chapters/{chapter_id}/download-materials", response_model=dict)
async def download_chapter_materials(
    novel_id: str,
    chapter_id: str,
    novel_repo: NovelRepository = Depends(get_novel_repo),
    chapter_repo: ChapterRepository = Depends(get_chapter_repo)
):
    """下载章节素材 ZIP 包"""
    novel = novel_repo.get_by_id(novel_id)
    if not novel:
        raise HTTPException(status_code=404, detail="小说不存在")
    
    chapter = chapter_repo.get_by_id(chapter_id, novel_id)
    if not chapter:
        raise HTTPException(status_code=404, detail="章节不存在")
    
    # 生成 ZIP 文件
    zip_path = file_storage.zip_chapter_materials(novel_id, chapter_id)
    
    if not zip_path:
        raise HTTPException(status_code=404, detail="章节素材不存在或打包失败")
    
    chapter_short = chapter_id[:8] if chapter_id else "unknown"
    filename = f"{novel.title}_chapter_{chapter_short}_materials.zip"
    
    return FileResponse(
        zip_path,
        media_type="application/zip",
        filename=filename
    )


@router.post("/{novel_id}/chapters/{chapter_id}/merge-videos", response_model=dict)
async def merge_chapter_videos(
    novel_id: str,
    chapter_id: str,
    data: MergeVideosRequest,
    novel_repo: NovelRepository = Depends(get_novel_repo),
    chapter_repo: ChapterRepository = Depends(get_chapter_repo)
):
    """合并章节视频"""
    novel = novel_repo.get_by_id(novel_id)
    if not novel:
        raise HTTPException(status_code=404, detail="小说不存在")
    
    chapter = chapter_repo.get_by_id(chapter_id, novel_id)
    if not chapter:
        raise HTTPException(status_code=404, detail="章节不存在")
    
    include_transitions = data.include_transitions
    
    # 获取视频列表
    shot_videos = json.loads(chapter.shot_videos) if chapter.shot_videos else []
    transition_videos = json.loads(chapter.transition_videos) if chapter.transition_videos else {}
    
    if not shot_videos or len(shot_videos) == 0:
        return {
            "success": False,
            "message": "没有分镜视频可以合并"
        }
    
    # 转换 URL 为本地路径
    video_paths = []
    for video_url in shot_videos:
        if video_url and video_url.startswith("/api/files/"):
            full_path = NovelService.url_to_local_path(video_url)
            if full_path:
                video_paths.append(full_path)
    
    if len(video_paths) == 0:
        return {
            "success": False,
            "message": "视频文件不存在"
        }
    
    
    # 获取转场视频路径
    trans_paths = []
    if include_transitions and transition_videos:
        for i in range(len(shot_videos) - 1):
            key = f"{i+1}-{i+2}"
            trans_url = transition_videos.get(key)
            if trans_url and trans_url.startswith("/api/files/"):
                full_path = NovelService.url_to_local_path(trans_url)
                if full_path:
                    trans_paths.append(full_path)
                else:
                    trans_paths.append(None)
            else:
                trans_paths.append(None)
    
    # 生成输出路径
    story_dir = file_storage._get_story_dir(novel_id)
    chapter_short = chapter_id[:8] if chapter_id else "unknown"
    output_filename = f"chapter_{chapter_short}_merged{'_with_trans' if include_transitions else ''}.mp4"
    output_path = str(story_dir / output_filename)
    
    # 合并视频
    result = await file_storage.merge_videos(
        video_paths, 
        output_path, 
        trans_paths if include_transitions else None
    )
    
    if result.get("success"):
        relative_path = output_path.replace(str(file_storage.base_dir), "").replace("\\", "/")
        video_url = f"/api/files/{relative_path.lstrip('/')}"
        
        return {
            "success": True,
            "video_url": video_url,
            "message": result.get("message", "合并成功")
        }
    else:
        return {
            "success": False,
            "message": result.get("message", "合并失败")
        }


# ==================== 资源管理 ====================

@router.post("/{novel_id}/chapters/{chapter_id}/clear-resources", response_model=dict)
async def clear_chapter_resources(
    novel_id: str,
    chapter_id: str,
    db: Session = Depends(get_db),
    novel_repo: NovelRepository = Depends(get_novel_repo),
    chapter_repo: ChapterRepository = Depends(get_chapter_repo)
):
    """清除章节的所有生成资源（用于重新拆分分镜头前）"""
    novel = novel_repo.get_by_id(novel_id)
    if not novel:
        raise HTTPException(status_code=404, detail="小说不存在")
    
    chapter = chapter_repo.get_by_id(chapter_id, novel_id)
    if not chapter:
        raise HTTPException(status_code=404, detail="章节不存在")
    
    # 删除物理文件
    print(f"[ClearResources] Deleting physical files for chapter {chapter_id}")
    file_deleted = file_storage.delete_chapter_directory(novel_id, chapter_id)
    
    # 清除数据库记录
    chapter.parsed_data = None
    chapter.shot_images = None
    chapter.shot_videos = None
    chapter.transition_videos = None
    chapter.merged_image = None
    
    db.commit()
    
    print(f"[ClearResources] Chapter resources cleared. Files deleted: {file_deleted}")
    
    return {
        "success": True,
        "message": "章节资源已清除" + ("（包含物理文件）" if file_deleted else "（物理文件清除失败）"),
        "files_deleted": file_deleted
    }


@router.post("/{novel_id}/chapters/{chapter_id}/shots/{shot_index}/upload-image", response_model=dict)
async def upload_shot_image(
    novel_id: str,
    chapter_id: str,
    shot_index: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    chapter_repo: ChapterRepository = Depends(get_chapter_repo)
):
    """上传分镜图片"""
    # 验证文件类型
    allowed_types = ["image/png", "image/jpeg", "image/jpg", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"不支持的文件类型: {file.content_type}，仅支持 PNG, JPG, WEBP"
        )

    # 获取章节
    chapter = chapter_repo.get_by_id(chapter_id, novel_id)

    if not chapter:
        raise HTTPException(status_code=404, detail="章节不存在")

    # 解析章节数据
    if not chapter.parsed_data:
        raise HTTPException(status_code=400, detail="章节未拆分，请先进行AI拆分")

    parsed_data = json.loads(chapter.parsed_data) if isinstance(chapter.parsed_data, str) else chapter.parsed_data
    shots = parsed_data.get("shots", [])

    if shot_index < 1 or shot_index > len(shots):
        raise HTTPException(status_code=400, detail="分镜索引超出范围")

    try:
        # 删除旧图片
        file_storage.delete_shot_image(novel_id, chapter_id, shot_index)

        # 获取保存路径
        file_path = file_storage.get_shot_image_path(
            novel_id=novel_id,
            chapter_id=chapter_id,
            shot_number=shot_index
        )

        # 保存文件
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)

        # 计算访问URL
        relative_path = file_path.relative_to(file_storage.base_dir)
        image_url = f"/api/files/{relative_path}"

        # 更新 parsed_data
        parsed_data["shots"][shot_index - 1]["image_url"] = image_url
        parsed_data["shots"][shot_index - 1]["image_path"] = str(file_path)
        chapter.parsed_data = json.dumps(parsed_data, ensure_ascii=False)

        # 更新 shot_images 数组
        shot_images = json.loads(chapter.shot_images) if chapter.shot_images else []
        while len(shot_images) < shot_index:
            shot_images.append(None)
        shot_images[shot_index - 1] = image_url
        chapter.shot_images = json.dumps(shot_images, ensure_ascii=False)

        db.commit()
        db.refresh(chapter)

        return {
            "success": True,
            "data": {
                "shotIndex": shot_index,
                "imageUrl": image_url,
                "parsedData": parsed_data
            },
            "message": "分镜图片上传成功"
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"上传失败: {str(e)}")


# ==================== 台词音频生成 ====================

@router.post("/{novel_id}/chapters/{chapter_id}/shots/{shot_index}/audio", response_model=dict)
async def generate_shot_audio(
    novel_id: str,
    chapter_id: str,
    shot_index: int,
    data: dict,
    db: Session = Depends(get_db),
    novel_repo: NovelRepository = Depends(get_novel_repo),
    chapter_repo: ChapterRepository = Depends(get_chapter_repo),
    task_repo: TaskRepository = Depends(get_task_repo),
    workflow_repo: WorkflowRepository = Depends(get_workflow_repo)
):
    """
    为指定分镜的角色台词生成音频

    Request Body:
    {
        "dialogues": [
            {
                "character_name": "角色名",
                "text": "台词文本",
                "emotion_prompt": "情感提示词（可选）"
            }
        ]
    }
    """
    from app.repositories.character_repository import CharacterRepository
    from app.services.shot_audio_service import ShotAudioService

    # 获取章节
    chapter = chapter_repo.get_by_id(chapter_id, novel_id)
    if not chapter:
        raise HTTPException(status_code=404, detail="章节不存在")

    # 获取小说
    novel = novel_repo.get_by_id(novel_id)
    if not novel:
        raise HTTPException(status_code=404, detail="小说不存在")

    # 解析章节数据
    if not chapter.parsed_data:
        raise HTTPException(status_code=400, detail="章节未拆分，请先进行AI拆分")

    parsed_data = json.loads(chapter.parsed_data) if isinstance(chapter.parsed_data, str) else chapter.parsed_data
    shots = parsed_data.get("shots", [])

    if shot_index < 1 or shot_index > len(shots):
        raise HTTPException(status_code=400, detail="分镜索引超出范围")

    # 获取台词数据
    dialogues = data.get("dialogues", [])
    if not dialogues:
        raise HTTPException(status_code=400, detail="请提供要生成的台词数据")

    # 获取音频工作流
    workflow = workflow_repo.get_active_by_type("audio")
    if not workflow:
        raise HTTPException(status_code=400, detail="未配置音频生成工作流，请在系统设置中配置")

    # 验证工作流节点映射
    is_valid, error_msg = TaskService.validate_workflow_node_mapping(workflow, "character_audio")
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)

    # 初始化服务和仓库
    character_repo = CharacterRepository(db)
    audio_service = ShotAudioService(db)

    # 创建任务
    result = audio_service.create_shot_audio_tasks(
        novel_id=novel_id,
        chapter_id=chapter_id,
        shot_index=shot_index,
        dialogues=dialogues,
        chapter_title=chapter.title,
        workflow=workflow,
        character_repo=character_repo,
        task_repo=task_repo
    )

    return result


@router.post("/{novel_id}/chapters/{chapter_id}/audio/generate-all", response_model=dict)
async def generate_all_shot_audio(
    novel_id: str,
    chapter_id: str,
    db: Session = Depends(get_db),
    novel_repo: NovelRepository = Depends(get_novel_repo),
    chapter_repo: ChapterRepository = Depends(get_chapter_repo),
    task_repo: TaskRepository = Depends(get_task_repo),
    workflow_repo: WorkflowRepository = Depends(get_workflow_repo)
):
    """
    批量生成章节所有分镜的角色台词音频

    遍历所有分镜的 dialogues 字段，为每个角色台词创建音频生成任务。
    跳过没有参考音频的角色，并在返回结果中记录警告。
    """
    from app.repositories.character_repository import CharacterRepository
    from app.services.shot_audio_service import ShotAudioService

    # 获取章节
    chapter = chapter_repo.get_by_id(chapter_id, novel_id)
    if not chapter:
        raise HTTPException(status_code=404, detail="章节不存在")

    # 获取小说
    novel = novel_repo.get_by_id(novel_id)
    if not novel:
        raise HTTPException(status_code=404, detail="小说不存在")

    # 解析章节数据
    if not chapter.parsed_data:
        raise HTTPException(status_code=400, detail="章节未拆分，请先进行AI拆分")

    parsed_data = json.loads(chapter.parsed_data) if isinstance(chapter.parsed_data, str) else chapter.parsed_data
    shots = parsed_data.get("shots", [])

    if not shots:
        raise HTTPException(status_code=400, detail="章节没有分镜数据")

    # 获取音频工作流
    workflow = workflow_repo.get_active_by_type("audio")
    if not workflow:
        raise HTTPException(status_code=400, detail="未配置音频生成工作流，请在系统设置中配置")

    # 验证工作流节点映射
    is_valid, error_msg = TaskService.validate_workflow_node_mapping(workflow, "character_audio")
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)

    # 初始化服务和仓库
    character_repo = CharacterRepository(db)
    audio_service = ShotAudioService(db)

    # 批量创建任务
    result = audio_service.create_batch_audio_tasks(
        novel_id=novel_id,
        chapter_id=chapter_id,
        shots=shots,
        chapter_title=chapter.title,
        workflow=workflow,
        character_repo=character_repo,
        task_repo=task_repo
    )

    return result


# ==================== 台词音频上传 ====================

# 支持的音频格式
ALLOWED_AUDIO_TYPES = {
    "audio/mpeg": ".mp3",
    "audio/mp3": ".mp3",
    "audio/wav": ".wav",
    "audio/x-wav": ".wav",
    "audio/flac": ".flac",
    "audio/x-flac": ".flac",
}
MAX_AUDIO_SIZE = 10 * 1024 * 1024  # 10MB


@router.post("/{novel_id}/chapters/{chapter_id}/shots/{shot_index}/dialogues/{character_name}/audio/upload", response_model=dict)
async def upload_dialogue_audio(
    novel_id: str,
    chapter_id: str,
    shot_index: int,
    character_name: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    chapter_repo: ChapterRepository = Depends(get_chapter_repo)
):
    """
    上传分镜台词音频

    Args:
        novel_id: 小说ID
        chapter_id: 章节ID
        shot_index: 分镜索引（1-based）
        character_name: 角色名称（URL编码）
        file: 音频文件（mp3、wav、flac，最大10MB）

    Returns:
        上传结果，包含音频URL和更新后的分镜数据
    """
    from urllib.parse import unquote

    # 解码角色名（URL编码）
    character_name = unquote(character_name)

    # 验证文件类型
    if file.content_type not in ALLOWED_AUDIO_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"不支持的文件类型: {file.content_type}，仅支持 mp3、wav、flac 格式"
        )

    # 验证文件大小
    content = await file.read()
    if len(content) > MAX_AUDIO_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"文件大小超过限制（最大 10MB），当前文件大小: {len(content) / 1024 / 1024:.2f}MB"
        )

    # 获取章节
    chapter = chapter_repo.get_by_id(chapter_id, novel_id)
    if not chapter:
        raise HTTPException(status_code=404, detail="章节不存在")

    # 解析章节数据
    if not chapter.parsed_data:
        raise HTTPException(status_code=400, detail="章节未拆分，请先进行AI拆分")

    parsed_data = json.loads(chapter.parsed_data) if isinstance(chapter.parsed_data, str) else chapter.parsed_data
    shots = parsed_data.get("shots", [])

    if shot_index < 1 or shot_index > len(shots):
        raise HTTPException(status_code=400, detail="分镜索引超出范围")

    # 查找指定角色的台词
    shot = shots[shot_index - 1]
    dialogues = shot.get("dialogues", [])
    target_dialogue = None
    for dialogue in dialogues:
        if dialogue.get("character_name") == character_name:
            target_dialogue = dialogue
            break

    if not target_dialogue:
        raise HTTPException(
            status_code=404,
            detail=f"分镜 {shot_index} 中未找到角色 '{character_name}' 的台词"
        )

    try:
        # 保存音频文件
        ext = ALLOWED_AUDIO_TYPES.get(file.content_type, ".flac")
        audio_path = file_storage.save_shot_audio(
            novel_id=novel_id,
            shot_index=shot_index,
            character_name=character_name,
            content=content,
            ext=ext
        )

        # 计算访问 URL
        relative_path = audio_path.relative_to(file_storage.base_dir)
        audio_url = f"/api/files/{relative_path}"

        # 更新 parsed_data 中的音频信息
        target_dialogue["audio_url"] = audio_url
        target_dialogue["audio_source"] = "uploaded"
        target_dialogue["audio_task_id"] = None  # 清除任务ID

        chapter.parsed_data = json.dumps(parsed_data, ensure_ascii=False)
        db.commit()

        return {
            "success": True,
            "data": {
                "shot_index": shot_index,
                "character_name": character_name,
                "audio_url": audio_url,
                "audio_source": "uploaded",
                "parsed_data": parsed_data
            },
            "message": "音频上传成功"
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"上传失败: {str(e)}")


@router.delete("/{novel_id}/chapters/{chapter_id}/shots/{shot_index}/dialogues/{character_name}/audio", response_model=dict)
async def delete_dialogue_audio(
    novel_id: str,
    chapter_id: str,
    shot_index: int,
    character_name: str,
    db: Session = Depends(get_db),
    chapter_repo: ChapterRepository = Depends(get_chapter_repo)
):
    """
    删除分镜台词音频

    Args:
        novel_id: 小说ID
        chapter_id: 章节ID
        shot_index: 分镜索引（1-based）
        character_name: 角色名称（URL编码）

    Returns:
        删除结果
    """
    from urllib.parse import unquote

    # 解码角色名（URL编码）
    character_name = unquote(character_name)

    # 获取章节
    chapter = chapter_repo.get_by_id(chapter_id, novel_id)
    if not chapter:
        raise HTTPException(status_code=404, detail="章节不存在")

    # 解析章节数据
    if not chapter.parsed_data:
        raise HTTPException(status_code=400, detail="章节未拆分，请先进行AI拆分")

    parsed_data = json.loads(chapter.parsed_data) if isinstance(chapter.parsed_data, str) else chapter.parsed_data
    shots = parsed_data.get("shots", [])

    if shot_index < 1 or shot_index > len(shots):
        raise HTTPException(status_code=400, detail="分镜索引超出范围")

    # 查找指定角色的台词
    shot = shots[shot_index - 1]
    dialogues = shot.get("dialogues", [])
    target_dialogue = None
    for dialogue in dialogues:
        if dialogue.get("character_name") == character_name:
            target_dialogue = dialogue
            break

    if not target_dialogue:
        raise HTTPException(
            status_code=404,
            detail=f"分镜 {shot_index} 中未找到角色 '{character_name}' 的台词"
        )

    try:
        # 删除物理文件
        old_audio_url = target_dialogue.get("audio_url")
        if old_audio_url and old_audio_url.startswith("/api/files/"):
            file_storage.delete_shot_audio(novel_id, shot_index, character_name)

        # 清除 parsed_data 中的音频信息
        target_dialogue["audio_url"] = None
        target_dialogue["audio_source"] = None
        target_dialogue["audio_task_id"] = None

        chapter.parsed_data = json.dumps(parsed_data, ensure_ascii=False)
        db.commit()

        return {
            "success": True,
            "data": {
                "shot_index": shot_index,
                "character_name": character_name
            },
            "message": "音频删除成功"
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"删除失败: {str(e)}")
