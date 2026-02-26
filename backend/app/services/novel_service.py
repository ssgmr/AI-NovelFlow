"""
小说服务层

封装小说相关的业务逻辑
"""
import json
import os
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple
from PIL import Image, ImageDraw, ImageFont

from sqlalchemy.orm import Session

from app.models.novel import Novel, Chapter, Character, Scene
from app.models.prompt_template import PromptTemplate
from app.core.database import SessionLocal
from app.utils.time_utils import format_datetime
from app.services.llm_service import LLMService
from app.services.comfyui import ComfyUIService
from app.services.file_storage import file_storage


class NovelService:
    """小说服务"""
    
    def __init__(self, db: Session = None):
        self.db = db
        self.comfyui_service = ComfyUIService()
    
    def get_llm_service(self) -> LLMService:
        """获取 LLMService 实例（每次调用创建新实例以获取最新配置）"""
        return LLMService()
    
    # ==================== 角色解析 ====================
    
    async def parse_characters(
        self,
        novel_id: str,
        chapters: List[Chapter],
        start_chapter: int = None,
        end_chapter: int = None,
        is_incremental: bool = False,
        character_repo = None
    ) -> Dict[str, Any]:
        """
        解析小说内容，自动提取角色信息
        
        Args:
            novel_id: 小说ID
            chapters: 章节列表
            start_chapter: 起始章节号
            end_chapter: 结束章节号
            is_incremental: 是否增量更新
            character_repo: 角色仓库
            
        Returns:
            解析结果
        """
        # 构造章节范围描述
        source_range = None
        if start_chapter is not None or end_chapter is not None:
            start_desc = f"第{start_chapter}章" if start_chapter is not None else "第1章"
            end_desc = f"第{end_chapter}章" if end_chapter is not None else f"第{chapters[-1].number}章"
            source_range = f"{start_desc}至{end_desc}"
        
        full_text = "\n\n".join([c.content for c in chapters if c.content])
        if not full_text.strip():
            return {"success": False, "message": "章节内容为空"}
        
        try:
            # 调用 LLM 解析文本提取角色
            result = await self.get_llm_service().parse_novel_text(full_text, novel_id=novel_id, source_range=source_range)
            
            if "error" in result:
                return {"success": False, "message": f"解析失败: {result['error']}"}
            
            characters_data = result.get("characters", [])
            if not characters_data:
                return {"success": True, "data": [], "message": "未识别到角色"}
            
            # 创建角色记录
            created_characters = []
            updated_characters = []
            
            for char_data in characters_data:
                name = char_data.get("name", "").strip()
                if not name:
                    continue
                
                # 检查是否已存在
                existing = character_repo.get_by_name(novel_id, name)
                
                if existing:
                    # 增量更新模式：保留原有信息，只更新新解析的信息
                    if is_incremental:
                        if not existing.description and char_data.get("description"):
                            existing.description = char_data.get("description")
                        if not existing.appearance and char_data.get("appearance"):
                            existing.appearance = char_data.get("appearance")
                        if source_range:
                            if existing.source_range:
                                existing.source_range += f", {source_range}"
                            else:
                                existing.source_range = source_range
                    else:
                        # 全量更新模式：直接覆盖
                        existing.description = char_data.get("description", existing.description)
                        existing.appearance = char_data.get("appearance", existing.appearance)
                        existing.source_range = source_range
                    
                    existing.last_parsed_at = datetime.utcnow()
                    updated_characters.append(existing)
                else:
                    # 创建新角色
                    character = Character(
                        novel_id=novel_id,
                        name=name,
                        description=char_data.get("description", ""),
                        appearance=char_data.get("appearance", ""),
                        start_chapter=start_chapter,
                        end_chapter=end_chapter,
                        is_incremental=is_incremental,
                        source_range=source_range,
                        last_parsed_at=datetime.utcnow()
                    )
                    self.db.add(character)
                    created_characters.append(character)
            
            self.db.commit()
            
            # 刷新对象以获取 ID
            for char in created_characters + updated_characters:
                self.db.refresh(char)
            
            # 构造响应消息
            message_parts = []
            if created_characters:
                message_parts.append(f"新增 {len(created_characters)} 个角色")
            if updated_characters:
                message_parts.append(f"更新 {len(updated_characters)} 个角色")
            
            return {
                "success": True,
                "data": [
                    {
                        "id": c.id,
                        "name": c.name,
                        "description": c.description,
                        "appearance": c.appearance,
                        "startChapter": c.start_chapter,
                        "endChapter": c.end_chapter,
                        "isIncremental": c.is_incremental,
                        "sourceRange": c.source_range,
                        "lastParsedAt": format_datetime(c.last_parsed_at)
                    }
                    for c in created_characters + updated_characters
                ],
                "message": "，".join(message_parts) if message_parts else "未识别到角色",
                "statistics": {
                    "created": len(created_characters),
                    "updated": len(updated_characters),
                    "total": len(created_characters) + len(updated_characters)
                }
            }
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return {"success": False, "message": f"解析异常: {str(e)}"}
    
    # ==================== 场景解析 ====================
    
    async def parse_scenes(
        self,
        novel_id: str,
        chapter: Chapter,
        is_incremental: bool = True,
        scene_repo = None
    ) -> Dict[str, Any]:
        """
        解析单章节内容，提取场景信息
        
        Args:
            novel_id: 小说ID
            chapter: 章节对象
            is_incremental: 是否增量更新
            scene_repo: 场景仓库
            
        Returns:
            解析结果
        """
        if not chapter.content:
            return {"success": False, "message": "章节内容为空"}
        
        # 获取场景解析提示词模板
        template = self.db.query(PromptTemplate).filter(
            PromptTemplate.type == 'scene_parse',
            PromptTemplate.is_system == True
        ).order_by(PromptTemplate.created_at.asc()).first()
        
        prompt_template = template.template if template else None
        
        try:
            source_range = f"第{chapter.number}章"
            
            # 调用 LLM 解析场景
            result = await self.get_llm_service().parse_scenes(
                novel_id=novel_id,
                chapter_content=chapter.content[:20000],  # 限制长度
                chapter_title=source_range,
                prompt_template=prompt_template
            )
            
            if result.get("error"):
                return {"success": False, "message": result["error"]}
            
            scenes_data = result.get("scenes", [])
            
            # 获取现有场景
            existing_scene_names = scene_repo.get_dict_by_novel(novel_id)
            
            created_scenes = []
            updated_scenes = []
            
            for scene_data in scenes_data:
                name = scene_data.get("name", "")
                if not name:
                    continue
                
                if name in existing_scene_names:
                    # 更新现有场景
                    existing = existing_scene_names[name]
                    
                    if is_incremental:
                        if not existing.description and scene_data.get("description"):
                            existing.description = scene_data.get("description")
                        if not existing.setting and scene_data.get("setting"):
                            existing.setting = scene_data.get("setting")
                        if existing.source_range:
                            if source_range not in existing.source_range:
                                existing.source_range += f", {source_range}"
                        else:
                            existing.source_range = source_range
                    else:
                        existing.description = scene_data.get("description", existing.description)
                        existing.setting = scene_data.get("setting", existing.setting)
                        existing.source_range = source_range
                    
                    existing.is_incremental = is_incremental
                    existing.last_parsed_at = datetime.utcnow()
                    updated_scenes.append(existing)
                else:
                    # 创建新场景
                    scene = Scene(
                        novel_id=novel_id,
                        name=name,
                        description=scene_data.get("description", ""),
                        setting=scene_data.get("setting", ""),
                        start_chapter=chapter.number,
                        end_chapter=chapter.number,
                        is_incremental=is_incremental,
                        source_range=source_range,
                        last_parsed_at=datetime.utcnow()
                    )
                    self.db.add(scene)
                    created_scenes.append(scene)
            
            self.db.commit()
            
            # 刷新对象
            for s in created_scenes + updated_scenes:
                self.db.refresh(s)
            
            # 构造响应消息
            message_parts = []
            if created_scenes:
                message_parts.append(f"新增 {len(created_scenes)} 个场景")
            if updated_scenes:
                message_parts.append(f"更新 {len(updated_scenes)} 个场景")
            
            return {
                "success": True,
                "data": [
                    {
                        "id": s.id,
                        "name": s.name,
                        "description": s.description,
                        "setting": s.setting,
                        "startChapter": s.start_chapter,
                        "endChapter": s.end_chapter,
                        "isIncremental": s.is_incremental,
                        "sourceRange": s.source_range,
                        "lastParsedAt": format_datetime(s.last_parsed_at)
                    }
                    for s in created_scenes + updated_scenes
                ],
                "message": "，".join(message_parts) if message_parts else "未识别到场景",
                "statistics": {
                    "created": len(created_scenes),
                    "updated": len(updated_scenes),
                    "total": len(created_scenes) + len(updated_scenes)
                }
            }
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return {"success": False, "message": f"解析异常: {str(e)}"}
    
    # ==================== 章节拆分 ====================
    
    async def split_chapter(
        self,
        novel: Novel,
        chapter: Chapter,
        character_names: List[str],
        scene_names: List[str]
    ) -> Dict[str, Any]:
        """
        使用小说配置的拆分提示词将章节拆分为分镜
        
        Args:
            novel: 小说对象
            chapter: 章节对象
            character_names: 角色名称列表
            scene_names: 场景名称列表
            
        Returns:
            拆分结果
        """
        # 检查 LLM 配置
        llm_service = self.get_llm_service()
        if not llm_service.api_key and llm_service.provider != "ollama":
            return {
                "success": False,
                "data": {
                    "error": "LLM API Key 未配置，请在系统设置中配置 API Key",
                    "chapter": chapter.title,
                    "characters": [],
                    "scenes": [],
                    "shots": []
                }
            }
        
        if not llm_service.api_url:
            return {
                "success": False,
                "data": {
                    "error": "LLM API URL 未配置，请在系统设置中配置 API URL",
                    "chapter": chapter.title,
                    "characters": [],
                    "scenes": [],
                    "shots": []
                }
            }
        
        # 获取拆分提示词模板
        prompt_template = None
        if novel.chapter_split_prompt_template_id:
            prompt_template = self.db.query(PromptTemplate).filter(
                PromptTemplate.id == novel.chapter_split_prompt_template_id
            ).first()
        
        # 如果没有配置，使用默认模板
        if not prompt_template:
            prompt_template = self.db.query(PromptTemplate).filter(
                PromptTemplate.type == "chapter_split",
                PromptTemplate.is_system == True
            ).first()
        
        if not prompt_template:
            return {"success": False, "message": "未找到章节拆分提示词模板"}
        
        # 获取小说配置的角色提示词模板 style
        style = "anime style, high quality, detailed"  # 默认风格
        if novel.prompt_template_id:
            character_prompt_template = self.db.query(PromptTemplate).filter(
                PromptTemplate.id == novel.prompt_template_id
            ).first()
            if character_prompt_template and character_prompt_template.template:
                style = self._extract_style_from_template(character_prompt_template.template)
                print(f"[SplitChapter] Using style from character prompt template: {style}")
        
        # 调用 LLM 进行拆分
        result = await llm_service.split_chapter_with_prompt(
            chapter_title=chapter.title,
            chapter_content=chapter.content or "",
            prompt_template=prompt_template.template,
            word_count=50,
            character_names=character_names,
            scene_names=scene_names,
            style=style
        )
        
        # 保存解析结果到章节
        chapter.parsed_data = json.dumps(result, ensure_ascii=False)
        self.db.commit()
        
        return {
            "success": True,
            "data": result
        }
    
    def _extract_style_from_template(self, template: str) -> str:
        """从模板中提取 style"""
        import re
        try:
            template_data = json.loads(template)
            if isinstance(template_data, dict) and "style" in template_data:
                return template_data["style"]
            else:
                style = template.replace("{appearance}", "").replace("{description}", "").strip(", ")
        except json.JSONDecodeError:
            style = template.replace("{appearance}", "").replace("{description}", "").strip(", ")
            style = re.sub(r',\s*,', ',', style)
            style = re.sub(r'\s+', ' ', style)
            style = style.strip(", ")
        return style
    
    # ==================== 图片合并 ====================
    
    def merge_character_images(
        self,
        novel_id: str,
        chapter_id: str,
        shot_index: int,
        character_images: List[Tuple[str, str]]
    ) -> Optional[str]:
        """
        合并多个角色图片为一个参考图
        
        Args:
            novel_id: 小说ID
            chapter_id: 章节ID
            shot_index: 分镜索引
            character_images: [(角色名, 图片路径), ...]
            
        Returns:
            合并后的图片路径，失败返回 None
        """
        if not character_images:
            return None
        
        try:
            # 删除旧的合并角色图
            story_dir = file_storage._get_story_dir(novel_id)
            chapter_short = chapter_id[:8] if chapter_id else "unknown"
            merged_dir = story_dir / f"chapter_{chapter_short}" / "merged_characters"
            if merged_dir.exists():
                import glob
                old_files = glob.glob(str(merged_dir / f"shot_{shot_index:03d}_*_characters.png"))
                for old_file in old_files:
                    try:
                        os.remove(old_file)
                        print(f"[MergeCharacters] Removed old merged character image: {old_file}")
                    except Exception as e:
                        print(f"[MergeCharacters] Failed to remove old file {old_file}: {e}")
            
            # 获取角色名列表
            character_names = [name for name, _ in character_images]
            merged_path = file_storage.get_merged_characters_path(novel_id, chapter_id, shot_index, character_names)
            
            # 计算布局
            count = len(character_images)
            if count == 1:
                cols, rows = 1, 1
            elif count <= 3:
                cols, rows = 1, count
            elif count == 4:
                cols, rows = 2, 2
            elif count <= 6:
                cols, rows = 3, 2
            else:
                cols = 3
                rows = (count + 2) // 3
            
            # 加载所有图片
            images = []
            for char_name, img_path in character_images:
                img = Image.open(img_path)
                images.append((char_name, img))
            
            # 设置布局参数
            name_height = 24
            padding = 15
            img_spacing = 10
            text_offset = 5
            
            # 使用原图，不进行缩放
            processed_images = [(char_name, img.copy()) for char_name, img in images]
            
            # 计算每列的最大宽度
            col_widths = []
            for col in range(cols):
                max_w = 0
                for idx in range(col, len(processed_images), cols):
                    _, img = processed_images[idx]
                    max_w = max(max_w, img.width)
                col_widths.append(max_w)
            
            # 计算每行的实际高度
            row_heights = []
            for row in range(rows):
                max_h = 0
                for idx in range(row * cols, min((row + 1) * cols, len(processed_images))):
                    _, img = processed_images[idx]
                    max_h = max(max_h, img.height)
                row_heights.append(max_h + name_height + text_offset)
            
            # 计算画布尺寸
            canvas_width = sum(col_widths) + (cols - 1) * img_spacing + 2 * padding
            canvas_height = sum(row_heights) + 2 * padding
            canvas = Image.new('RGB', (canvas_width, canvas_height), (255, 255, 255))
            draw = ImageDraw.Draw(canvas)
            
            # 加载字体
            font = self._load_chinese_font(16)
            
            # 绘制每个角色
            current_y = padding
            for idx, (char_name, img) in enumerate(processed_images):
                col = idx % cols
                row = idx // cols
                
                x = padding + sum(col_widths[:col]) + col * img_spacing
                y = current_y
                
                img_x = x + (col_widths[col] - img.width) // 2
                img_y = y + (row_heights[row] - name_height - text_offset - img.height) // 2
                canvas.paste(img, (img_x, img_y))
                
                text_bbox = draw.textbbox((0, 0), char_name, font=font)
                text_width = text_bbox[2] - text_bbox[0]
                text_x = x + (col_widths[col] - text_width) // 2
                text_y = img_y + img.height + text_offset
                draw.text((text_x, text_y), char_name, fill=(51, 51, 51), font=font)
                
                if col == cols - 1 or idx == len(processed_images) - 1:
                    current_y += row_heights[row]
            
            # 保存合并图片
            canvas.save(merged_path, "PNG")
            print(f"[MergeCharacters] Merged character image saved: {merged_path}")
            
            return str(merged_path)
            
        except Exception as e:
            print(f"[MergeCharacters] Failed to merge character images: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def _load_chinese_font(self, size: int) -> ImageFont:
        """加载中文字体"""
        font_paths = [
            # macOS
            "/System/Library/Fonts/PingFang.ttc",
            "/System/Library/Fonts/STHeiti Light.ttc",
            "/Library/Fonts/Arial Unicode.ttf",
            # Windows
            "C:/Windows/Fonts/simhei.ttf",
            "C:/Windows/Fonts/simsun.ttc",
            "C:/Windows/Fonts/msyh.ttc",
            "C:/Windows/Fonts/msyhbd.ttc",
            # Linux
            "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        ]
        
        for font_path in font_paths:
            try:
                return ImageFont.truetype(font_path, size)
            except:
                continue
        
        return ImageFont.load_default()
    
    # ==================== 路径转换工具 ====================
    
    @staticmethod
    def url_to_local_path(url: str) -> Optional[str]:
        """将 URL 转换为本地路径"""
        if not url or not url.startswith("/api/files/"):
            return None
        
        relative_path = url.replace("/api/files/", "")
        relative_path = relative_path.lstrip("\\/")
        relative_path = relative_path.replace("\\", "/")
        path_parts = relative_path.split("/")
        
        full_path = os.path.join(
            os.path.dirname(__file__), "..", "..", "user_story", *path_parts
        )
        full_path = os.path.abspath(full_path)
        
        if os.path.exists(full_path):
            return full_path
        return None


# 后台任务函数已移至 media_task_service.py
# 从 media_task_service 导入以保持兼容性
from app.services.media_task_service import (
    generate_shot_task,
    generate_shot_video_task,
    generate_transition_video_task
)
