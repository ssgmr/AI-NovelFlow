## Why

角色目前缺少语音身份支持。生成视频内容音频时，用户需要为每个角色关联独特的声音。本功能将音色设计融入角色创建流程，允许用户在角色库中直接生成和预览角色音色样本。

## What Changes

- 扩展角色解析，从 LLM 响应中提取音色提示词（voice_prompt）
- 在 Character 模型中添加 `voice_prompt` 字段存储音色特征描述
- 在 Character 模型中添加 `reference_audio_url` 字段存储生成的音色样本音频
- 扩展角色库页面展示各角色音色提示词，支持编辑
- 添加"生成音色"按钮，调用 voice_design 工作流生成音色参考音频
- 在角色库页面展示各角色参考音频播放器
- 添加 5 种语言的国际化支持

## Capabilities

### New Capabilities

- `character-voice`: 角色音色提示词存储、通过 voice_design 工作流生成音色样本、角色库音频播放

### Modified Capabilities

- `character-parse`: 扩展角色解析以提取并存储 voice_prompt 字段

## Impact

**后端**:
- `app/models/novel.py` - Character 模型添加 voice_prompt、reference_audio_url 字段
- `app/schemas/character.py` - 响应/更新 schema 添加音色字段
- `app/services/novel_service.py` - 解析结果中提取 voice_prompt
- `app/services/character_service.py` - 添加音色生成任务方法
- `app/api/characters.py` - 添加音色生成端点
- 数据库迁移脚本

**前端**:
- `src/pages/Characters/index.tsx` - 音色生成和播放 UI
- `src/pages/Characters/components/CharacterCard.tsx` - 音色提示词显示、音频播放器
- `src/api/characters.ts` - 音色生成 API 调用
- `src/types/index.ts` - Character 类型添加音色字段
- i18n 文件（5 种语言）- 音色相关翻译