## MODIFIED Requirements

### Requirement: 音色设计工作流构建器支持文本节点替换

`build_voice_design_workflow` 方法 SHALL 支持通过独立的 CR Prompt Text 节点设置音色提示词和参考文本。

#### Scenario: 使用自定义工作流构建音色设计
- **WHEN** 调用 `build_voice_design_workflow` 并提供自定义工作流 JSON 和节点映射
- **THEN** 系统 SHALL 根据 `voice_prompt_node_id` 节点映射设置音色提示词
- **AND** 系统 SHALL 根据 `ref_text_node_id` 节点映射设置参考文本
- **AND** 文本内容 SHALL 写入 CR Prompt Text 节点的 `prompt` 字段

#### Scenario: 音色设计工作流设置保存路径
- **WHEN** 构建音色设计工作流并提供 novel_id 和 character_name
- **THEN** 系统 SHALL 设置 SaveAudio 节点的 `filename_prefix` 为 `story_{novel_id}/voices/{character_name}` 格式

### Requirement: 音频生成工作流构建器支持文本节点替换

`build_audio_workflow` 方法 SHALL 支持通过独立的 CR Prompt Text 节点设置生成文本和情感提示词。

#### Scenario: 使用自定义工作流构建音频生成
- **WHEN** 调用 `build_audio_workflow` 并提供自定义工作流 JSON 和节点映射
- **THEN** 系统 SHALL 根据 `text_node_id` 节点映射设置生成文本
- **AND** 系统 SHALL 根据 `emotion_prompt_node_id` 节点映射设置情感提示词
- **AND** 系统 SHALL 根据 `reference_audio_node_id` 节点映射设置参考音频
- **AND** 文本内容 SHALL 写入 CR Prompt Text 节点的 `prompt` 字段

#### Scenario: 音频生成工作流设置参考音频
- **WHEN** 构建音频生成工作流并提供 reference_audio_filename
- **THEN** 系统 SHALL 设置 LoadAudio 节点的 `audio` 字段为参考音频文件名

### Requirement: _set_prompt 方法支持 CR Prompt Text 节点

`_set_prompt` 辅助方法 SHALL 正确处理 CR Prompt Text 类型节点的文本设置。

#### Scenario: 设置 CR Prompt Text 节点内容
- **WHEN** 调用 `_set_prompt` 方法设置 CR Prompt Text 类型节点的文本
- **THEN** 系统 SHALL 将文本写入节点的 `prompt` 字段（而非 `text` 字段）