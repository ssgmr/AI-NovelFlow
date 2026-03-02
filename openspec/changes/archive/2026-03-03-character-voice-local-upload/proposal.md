## Why

当前角色库只支持通过 ComfyUI 工作流生成角色参考音频，用户无法上传自己准备好的音频文件作为角色的参考音色。这限制了用户使用外部录制或购买的音色素材的灵活性，也增加了对 ComfyUI TTS 工作流的依赖。

本变更允许用户直接上传本地音频文件作为角色参考音频，与现有的生成功能形成互补，提升用户体验和灵活性。

## What Changes

- 新增角色音频上传 API 端点，支持上传音频文件并保存到本地存储
- 角色库卡片新增"上传音频"按钮，支持点击上传或拖拽上传
- 支持常见音频格式（MP3、WAV、FLAC、OGG、M4A）
- 上传成功后自动更新角色的 `reference_audio_url` 字段
- 前端显示上传进度和状态反馈

## Capabilities

### New Capabilities
无新增能力规格（此变更仅为现有 `character-voice` 能力的功能增强，不改变规格要求）

### Modified Capabilities
- `character-voice`: 新增用户上传音频作为参考音频的需求场景

## Impact

**后端**:
- `backend/app/api/characters.py`: 新增音频上传端点
- `backend/app/services/character_service.py`: 新增音频保存逻辑
- `backend/app/services/file_storage.py`: 可复用现有音频存储逻辑

**前端**:
- `frontend/my-app/src/pages/Characters/index.tsx`: 新增音频上传状态和处理函数
- `frontend/my-app/src/pages/Characters/components/CharacterCard.tsx`: 新增上传音频按钮
- `frontend/my-app/src/api/characters.ts`: 新增上传音频 API 调用
- `frontend/my-app/src/i18n/locales/*/characters.ts`: 新增翻译键

**数据库**: 无结构变更