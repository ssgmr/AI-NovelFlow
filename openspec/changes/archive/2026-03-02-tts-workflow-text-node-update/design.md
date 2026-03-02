## Context

Qwen3-TTS 工作流已更新，所有文本输入改为通过独立的 `CR Prompt Text` 节点进行。当前代码的节点映射配置指向 `TDQwen3TTSVoiceDesign` 和 `TDQwen3TTSVoiceClone` 节点本身，需要更新为指向独立的文本节点。

**当前状态**:
- `voice_design` 类型：`voice_prompt_node_id` 和 `ref_text_node_id` 都指向节点 23（TDQwen3TTSVoiceDesign）
- `audio` 类型：`text_node_id` 和 `emotion_prompt_node_id` 都指向节点 31（TDQwen3TTSVoiceClone）

**新工作流结构**:
- `Qwen3-TTS-Voice-Clone.json`（音频生成）：新增节点 32（CR Prompt Text）用于生成文本，节点 33（CR Prompt Text）用于情感提示词
- `Qwen3-TTS-Voice-Design.json`（音色设计）：新增节点 53（CR Prompt Text）用于音色提示词，节点 54（CR Prompt Text）用于文本

## Goals / Non-Goals

**Goals:**
- ✅ 更新节点映射配置，支持独立的文本节点映射
- ✅ 修改工作流构建器，正确处理 `CR Prompt Text` 节点的内容替换
- ✅ 确保向后兼容，支持旧版工作流（直接在主节点设置文本）

**Non-Goals:**
- 不修改工作流文件本身的结构（由用户/ComfyUI 管理）
- 不改变 API 接口或前端交互逻辑
- 不修改其他类型工作流的节点映射

## Decisions

### 决策 1：新增独立的文本节点映射键

**选择**: 更新现有键名指向新的 CR Prompt Text 节点

**理由**:
- 工作流已更新，旧节点映射不再有效
- 新键名语义明确，便于理解

**实现结果**:
- `voice_design`: `voice_prompt_node_id` → "53", `ref_text_node_id` → "54"
- `audio`: `text_node_id` → "32", `emotion_prompt_node_id` → "33"

### 决策 2：节点内容替换逻辑

**选择**: 使用现有的 `_set_prompt` 方法，自动检测节点类型并选择正确的字段

**理由**:
- `_set_prompt` 方法已支持 `CR Prompt Text` 节点（使用 `prompt` 字段）
- 保持代码一致性

### 决策 3：音频输出节点支持

**选择**: 更新 `_parse_audio_outputs` 方法，支持 `PreviewAudio` 节点

**理由**:
- `Qwen3-TTS-Voice-Clone.json` 使用 `PreviewAudio` 节点输出音频
- 原代码仅支持 `SaveAudio` 节点

## Risks / Trade-offs

**风险 1**: 用户自定义的工作流可能使用旧的节点映射
- 缓解：用户需要更新自定义工作流的节点映射配置

**风险 2**: 前端映射配置页面需要同步更新
- 缓解：前端会从后端获取节点映射配置，无需手动修改

## Implementation Summary

### 已完成更改

1. **`backend/app/constants/workflow.py`**
   - 更新 `DEFAULT_WORKFLOW_NODE_MAPPINGS` 中的 `voice_design` 和 `audio` 节点映射
   - 更新 `EXTRA_SYSTEM_WORKFLOWS` 中的节点映射配置

2. **`backend/app/services/comfyui/workflows.py`**
   - 重构 `build_voice_design_workflow` 方法，使用 `_set_prompt` 设置文本内容
   - 更新 `_build_default_voice_design_workflow` 方法，使用独立的 CR Prompt Text 节点
   - 新增 `build_audio_workflow` 方法处理带参考音频的语音克隆
   - 新增 `_build_default_audio_workflow` 方法构建默认音频工作流

3. **`backend/app/services/comfyui/client.py`**
   - 更新 `_parse_audio_outputs` 方法，同时支持 `SaveAudio` 和 `PreviewAudio` 节点

## Status

✅ **已完成** - 2026-03-02