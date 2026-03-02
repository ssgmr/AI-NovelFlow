## Why

Qwen3-TTS-Voice-Clone.json 和 Qwen3-TTS-Voice-Design.json 两个工作流文件已更新，所有文本输入改为通过独立的文本节点（如 CR Prompt Text）进行，以提高兼容性。当前代码中的节点映射配置和工作流执行逻辑未同步更新，导致无法正确替换文本内容。

## What Changes

- 更新 `backend/app/constants/workflow.py` 中 `voice_design` 和 `audio` 类型工作流的节点映射配置
- 修改 `backend/app/services/comfyui/workflows.py` 中的 `build_voice_design_workflow` 方法，支持文本节点内容替换
- 更新 `EXTRA_SYSTEM_WORKFLOWS` 列表中的节点映射配置

### 具体变更

**Qwen3-TTS-Voice-Clone.json（音频生成/语音克隆）**：
- 新增节点 32（CR Prompt Text）：用于设置生成文本
- 新增节点 33（CR Prompt Text）：用于设置情感提示词/参考文本
- 节点映射需从指向 TDQwen3TTSVoiceClone（31）改为指向独立的文本节点

**Qwen3-TTS-Voice-Design.json（音色设计）**：
- 需新增独立的文本节点用于 text 和 instruct 字段
- 更新节点映射以指向新的文本节点

## Capabilities

### New Capabilities

无新增能力

### Modified Capabilities

- `workflow-node-mapping`: 节点映射配置结构变更，支持文本节点映射
- `voice-workflow-builder`: 音色工作流构建器变更，支持文本节点内容替换

## Impact

- **后端代码**：
  - `backend/app/constants/workflow.py` - 节点映射配置
  - `backend/app/services/comfyui/workflows.py` - 工作流构建逻辑
- **工作流文件**：
  - `backend/workflows/Qwen3-TTS-Voice-Clone.json`
  - `backend/workflows/Qwen3-TTS-Voice-Design.json`
- **兼容性**：旧工作流需同步更新节点映射，否则文本替换功能失效