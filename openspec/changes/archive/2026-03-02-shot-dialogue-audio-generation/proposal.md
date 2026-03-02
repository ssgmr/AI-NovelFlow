## Why

当前章节分镜生成页面解析分镜数据时，仅提取角色名称列表，无法识别角色的台词内容和情感表达需求。这导致无法利用已有的音频生成工作流（基于角色音色样本）为每个分镜中的角色对话生成对应的语音音频，影响最终视频的完整性。

## What Changes

- 扩展分镜数据结构，新增台词列表字段，支持存储每个角色的台词文本和情感提示词
- 更新分镜解析提示词模板，让 LLM 在解析时自动提取角色台词和情感
- 在章节分镜生成页面新增音频生成功能入口，支持批量生成各分镜的角色台词音频
- 新增分镜音频生成 API，调用音频生成工作流，使用角色的参考音频生成语音

## Capabilities

### New Capabilities

- `shot-dialogue-parse`: 分镜数据解析时提取角色台词和情感提示词的能力要求
- `shot-audio-generation`: 基于分镜台词和角色音色生成语音音频的能力要求

### Modified Capabilities

- `character-voice`: 扩展角色音色能力，支持在分镜音频生成时引用角色参考音频

## Impact

### 前端
- `frontend/my-app/src/pages/ChapterGenerate/types.ts` - 扩展 `ShotData` 类型定义
- `frontend/my-app/src/pages/ChapterGenerate/components/` - 新增音频生成相关 UI 组件
- `frontend/my-app/src/i18n/locales/*/chapters.ts` - 新增翻译键

### 后端
- `backend/app/schemas/novel.py` - 扩展分镜数据 Schema
- `backend/app/services/novel_service.py` - 扩展分镜解析逻辑
- `backend/app/api/` - 新增分镜音频生成 API 端点
- `backend/app/services/comfyui/service.py` - 支持批量音频生成任务

### 数据库
- 分镜数据结构变更通过 JSON 字段扩展，无需数据库迁移

### 工作流
- 复用现有 `audio` 类型工作流（`Qwen3-TTS-Voice-Design.json`）
- 依赖角色的 `reference_audio_url` 作为参考音频