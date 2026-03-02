## Context

角色库当前已支持通过 ComfyUI 工作流生成角色参考音频，音频存储在 `user_story/story_{novel_id}/voices/` 目录下，数据库记录在 `characters.reference_audio_url` 字段。

现有架构：
- **后端**: FastAPI 提供 REST API，文件存储使用 `FileStorageService`
- **前端**: React + TypeScript，角色卡片组件已有图片上传功能
- **存储**: 本地文件系统，通过 `/api/files/` 端点提供静态文件访问

本变更复用现有架构，新增音频上传能力。

## Goals / Non-Goals

**Goals:**
- 支持用户从本地上传音频文件作为角色参考音频
- 支持 MP3、WAV、FLAC、OGG、M4A 等常见音频格式
- 上传成功后自动更新角色的 `reference_audio_url` 字段
- 提供清晰的上传状态反馈（上传中、成功、失败）
- 与现有"生成音色"功能共存，用户可二选一或互换

**Non-Goals:**
- 不支持远程 URL 音频上传（仅限本地文件）
- 不做音频格式转换或压缩
- 不实现音频波形预览或可视化
- 不支持批量上传

## Decisions

### 1. 音频存储位置
**决策**: 复用现有 `FileStorageService.download_audio()` 的存储逻辑，音频保存到 `user_story/story_{novel_id}/voices/` 目录

**理由**:
- 与现有生成音频存储位置一致
- 便于统一管理和打包下载
- 无需修改数据库结构

**备选方案**: 新建独立目录 `user_audio/` —— 被否决，因为增加管理复杂度

### 2. 上传端点设计
**决策**: 新增独立端点 `POST /api/characters/{character_id}/upload-audio`

**理由**:
- 与现有图片上传端点 `POST /api/characters/{character_id}/upload-image` 保持一致
- 职责单一，便于维护
- 复用现有 `UploadFile` 处理模式

### 3. 文件大小限制
**决策**: 限制上传音频文件最大 10MB

**理由**:
- 参考音频通常为短语音样本，10MB 足够
- 避免服务器存储压力过大
- 与 FastAPI 默认配置兼容

### 4. 前端交互设计
**决策**: 在角色卡片音色区域添加"上传音频"按钮，点击触发文件选择

**理由**:
- 与现有"生成音色"按钮并列显示，用户可自由选择
- 复用现有 `fileInputRef` 模式处理文件选择
- 一致的用户体验

## Risks / Trade-offs

**[风险] 音频文件格式兼容性**
→ 缓解：仅支持主流格式，前端做格式校验，后端做二次校验

**[风险] 大文件上传耗时**
→ 缓解：限制最大 10MB，前端显示上传进度

**[权衡] 不做音频预览**
→ 用户已有播放按钮可试听，无需额外预览功能