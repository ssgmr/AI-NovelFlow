import httpx
import json
from typing import Dict, Any, List
from app.core.config import get_settings

settings = get_settings()


class DeepSeekService:
    """DeepSeek API 服务封装"""
    
    def __init__(self):
        self.api_url = settings.DEEPSEEK_API_URL
        self.api_key = settings.DEEPSEEK_API_KEY
    
    async def check_health(self) -> bool:
        """检查 DeepSeek API 状态"""
        if not self.api_key:
            return False
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.api_url}/models",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    timeout=5.0
                )
                return response.status_code == 200
        except Exception:
            return False
    
    async def parse_novel_text(self, text: str) -> Dict[str, Any]:
        """
        解析小说文本，提取角色、场景、分镜信息
        
        Returns:
            {
                "characters": [...],
                "scenes": [...],
                "shots": [...]
            }
        """
        system_prompt = """你是一个专业的小说解析助手。请分析提供的小说文本，提取以下信息并以JSON格式返回：

1. characters: 角色列表，每个角色包含 name（姓名）、description（描述）、appearance（外貌特征）
2. scenes: 场景列表，每个场景包含 title（标题）、description（描述）
3. shots: 分镜列表，每个分镜包含 scene_id（所属场景）、description（画面描述）、camera_angle（镜头角度）

注意：
- 角色外貌特征要详细，用于AI绘图
- 分镜描述要具体，包含画面构图、角色动作、环境细节
- 返回必须是合法的JSON格式
"""
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.api_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "deepseek-chat",
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": f"请解析以下小说文本：\n\n{text[:8000]}"}  # 限制长度
                        ],
                        "temperature": 0.7,
                        "max_tokens": 4000,
                        "response_format": {"type": "json_object"}
                    },
                    timeout=60.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    content = data["choices"][0]["message"]["content"]
                    return json.loads(content)
                else:
                    return {
                        "error": f"API返回错误: {response.status_code}",
                        "characters": [],
                        "scenes": [],
                        "shots": []
                    }
                    
        except Exception as e:
            return {
                "error": str(e),
                "characters": [],
                "scenes": [],
                "shots": []
            }
    
    async def generate_character_appearance(
        self, 
        character_name: str, 
        description: str,
        style: str = "anime"  # anime, realistic, 3d, etc.
    ) -> str:
        """
        根据角色描述生成详细的外貌描述（用于AI绘图）
        
        Args:
            character_name: 角色名称
            description: 角色背景描述
            style: 画风风格
            
        Returns:
            详细的外貌描述文本
        """
        system_prompt = f"""你是一个专业的角色设定助手。请根据提供的角色信息，生成一段详细的外貌描述，用于AI绘图生成角色形象。

要求：
1. 描述要具体、详细，包含：发型、发色、眼睛、服装、配饰、表情、姿态
2. 使用英文（AI绘图模型对英文理解更好）
3. 添加画风提示词，如：{style} style, high quality, detailed
4. 避免模糊词汇，使用具体的颜色和样式描述

示例输出格式：
Young female character, long flowing silver hair with blue highlights, sharp blue eyes, delicate features, wearing traditional Chinese hanfu in white and blue colors, jade hairpin, gentle smile, standing pose, clean background, anime style, high quality, detailed, 8k"""
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.api_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "deepseek-chat",
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": f"角色名称：{character_name}\n角色描述：{description}\n\n请生成详细的外貌描述："}
                        ],
                        "temperature": 0.8,
                        "max_tokens": 1000
                    },
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data["choices"][0]["message"]["content"].strip()
                else:
                    return f"{character_name}, detailed character, high quality"
                    
        except Exception as e:
            return f"{character_name}, detailed character, high quality"
    
    async def generate_shot_prompt(
        self,
        scene_description: str,
        characters: List[Dict[str, str]],
        shot_type: str = "medium"  # close-up, medium, wide, etc.
    ) -> str:
        """
        生成AI绘图用的分镜提示词
        
        Args:
            scene_description: 场景描述
            characters: 场景中的角色列表 [{"name": "...", "appearance": "..."}]
            shot_type: 镜头类型
            
        Returns:
            优化后的英文提示词
        """
        system_prompt = """你是一个专业的分镜描述助手。请将场景描述转换为适合AI绘图使用的英文提示词。

要求：
1. 使用英文描述
2. 包含镜头角度、构图、光影、氛围
3. 描述角色动作、表情、位置关系
4. 添加画风和质量提示词
5. 使用逗号分隔各个描述元素

示例输出：
Wide shot, two characters standing in ancient Chinese palace courtyard, golden hour lighting, warm atmosphere, traditional architecture in background, soft shadows, cinematic composition, anime style, high quality, detailed, 8k"""
        
        characters_info = "\n".join([
            f"- {c['name']}: {c.get('appearance', 'unknown appearance')}"
            for c in characters
        ])
        
        user_prompt = f"""场景描述：{scene_description}

角色信息：
{characters_info}

镜头类型：{shot_type}

请生成AI绘图提示词："""
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.api_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "deepseek-chat",
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt}
                        ],
                        "temperature": 0.7,
                        "max_tokens": 1000
                    },
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data["choices"][0]["message"]["content"].strip()
                else:
                    return scene_description
                    
        except Exception as e:
            return scene_description
    
    async def enhance_prompt(self, prompt: str, prompt_type: str = "character") -> str:
        """
        优化提示词，添加质量标签
        
        Args:
            prompt: 原始提示词
            prompt_type: character（角色）| scene（场景）| shot（分镜）
        """
        quality_tags = {
            "character": "high quality, detailed, professional artwork, masterpiece",
            "scene": "high quality, detailed background, cinematic lighting, masterpiece",
            "shot": "cinematic composition, dramatic lighting, high quality, detailed, masterpiece"
        }
        
        base_tags = quality_tags.get(prompt_type, "high quality, detailed")
        
        # 确保提示词以合适的标签结尾
        enhanced = prompt.strip()
        if not any(tag in enhanced.lower() for tag in ["high quality", "detailed", "masterpiece"]):
            enhanced += f", {base_tags}"
        
        return enhanced
