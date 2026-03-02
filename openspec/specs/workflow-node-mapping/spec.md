# workflow-node-mapping Specification

## Purpose
Defines the requirements for workflow node mapping configuration, particularly for voice design and audio generation workflow types.

## Requirements
### Requirement: 工作流节点映射支持文本节点配置

节点映射配置 SHALL 支持独立的文本节点 ID 映射，用于 CR Prompt Text 类型的节点。

#### Scenario: 音色设计工作流节点映射
- **WHEN** 配置 voice_design 类型工作流的节点映射
- **THEN** 节点映射 SHALL 包含 `voice_prompt_node_id` 用于音色提示词文本节点
- **AND** 节点映射 SHALL 包含 `ref_text_node_id` 用于参考文本节点
- **AND** 节点映射 SHALL 包含 `save_audio_node_id` 用于音频保存节点

#### Scenario: 音频生成工作流节点映射
- **WHEN** 配置 audio 类型工作流的节点映射
- **THEN** 节点映射 SHALL 包含 `text_node_id` 用于生成文本节点
- **AND** 节点映射 SHALL 包含 `emotion_prompt_node_id` 用于情感提示词节点
- **AND** 节点映射 SHALL 包含 `reference_audio_node_id` 用于参考音频节点
- **AND** 节点映射 SHALL 包含 `save_audio_node_id` 用于音频保存节点

### Requirement: 默认工作流节点映射配置

`DEFAULT_WORKFLOW_NODE_MAPPINGS` 常量 SHALL 为 voice_design 和 audio 类型工作流提供默认节点映射。

#### Scenario: 获取默认音色设计节点映射
- **WHEN** 查询 voice_design 类型的默认节点映射
- **THEN** 系统 SHALL 返回包含 voice_prompt_node_id、ref_text_node_id、save_audio_node_id 的映射配置

#### Scenario: 获取默认音频生成节点映射
- **WHEN** 查询 audio 类型的默认节点映射
- **THEN** 系统 SHALL 返回包含 text_node_id、emotion_prompt_node_id、reference_audio_node_id、save_audio_node_id 的映射配置