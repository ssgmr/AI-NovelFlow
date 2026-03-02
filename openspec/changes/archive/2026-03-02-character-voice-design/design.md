## Context

AI-NovelFlow 目前支持角色视觉形象（人设图），但缺少语音身份支持。近期添加的 `voice_design` 工作流类型可通过 Qwen3-TTS 实现文本转语音和音色设计能力。本功能扩展角色模型以存储音色特征，并将音色样本生成集成到角色库工作流中。

**当前状态**:
- Character 模型存储：name、description、appearance、image_url
- 角色解析通过 LLM 从小说文本提取 name、description、appearance
- ComfyUI 工作流支持 `voice_design` 类型，节点映射包含 voice_prompt_node_id、ref_text_node_id、save_audio_node_id

**约束**:
- 必须遵循现有 Repository 模式进行数据访问
- 音色生成遵循与形象生成相同的异步任务模式
- 必须支持 5 种语言（zh-CN、en-US、ja-JP、ko-KR、zh-TW）

## Goals / Non-Goals

**Goals:**
- 为每个角色存储音色提示词用于语音身份识别
- 使用现有 voice_design 工作流生成音色样本
- 在角色库 UI 中显示音色提示词和音频播放器
- 支持在角色编辑模态框中编辑音色提示词（与其他角色信息合并）
- 生成音色按钮与人设图生成按钮并排显示

**Non-Goals:**
- 对话/台词的音频生成（后续功能）
- 从上传音频文件进行声音克隆（独立工作流）
- 批量生成所有角色的音色

## Decisions

### 1. 数据模型扩展

**决策**: 在 Character 模型中添加 `voice_prompt` 和 `reference_audio_url` 字段。

**理由**: 将音色身份数据与角色实体放在一起，遵循 image_url 的现有模式。使用独立 VoiceProfile 表的方案会增加不必要的复杂性，因为这是 1:1 关系。

**字段**:
- `voice_prompt` (Text): 音色描述，如"温柔女声，略带沙哑"
- `reference_audio_url` (String): 生成的音色样本音频文件 URL

### 2. 音色生成任务模式

**决策**: 遵循现有形象生成的异步任务模式。

**理由**: 与现有角色形象生成保持一致，复用 Task 模型、轮询机制和状态追踪。

**流程**:
1. 用户点击"生成音色"按钮
2. 创建 type="character_voice" 的 Task
3. 异步任务通过 ComfyUIService 调用 voice_design 工作流
4. 轮询任务状态直到完成
5. 将音频 URL 存储到 character.reference_audio_url

### 3. LLM 音色提示词提取

**决策**: 扩展 character_parse 提示词模板，要求在 JSON 响应中返回 voice_prompt。

**理由**: LLM 可以从角色描述（年龄、性别、性格）推断音色特征。默认系统模板将包含 voice_prompt 字段，用户可自定义模板以适应不同音色风格。

### 4. 音频存储

**决策**: 使用现有 file_storage 服务，存储在 `files/{novel_id}/voices/` 目录。

**理由**: 与图片存储模式一致，音频文件通过现有静态文件端点 `/api/files/` 提供服务。

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| LLM 可能生成无用的音色提示词 | 提供带示例的回退模板；允许手动编辑 |
| 音频生成可能较慢 | 使用带进度追踪的异步任务；显示生成中状态 |
| 音色样本可能不符合角色预期 | 允许重新生成；提供音色提示词编辑功能 |
| 音频文件存储空间 | 重新生成时清理旧音频 |

## Migration Plan

1. **数据库迁移**: 在 characters 表添加 voice_prompt 和 reference_audio_url 列（可为空）
2. **默认模板更新**: 更新系统默认 character_parse 模板以包含 voice_prompt 字段
3. **向后兼容**: 现有角色在没有音色数据的情况下正常工作；voice_prompt 是可选的

**回滚**: 迁移仅添加新列（可为空），无数据丢失风险。