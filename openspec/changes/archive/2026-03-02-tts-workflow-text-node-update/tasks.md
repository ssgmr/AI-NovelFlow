## 1. 节点映射配置更新

- [x] 1.1 更新 `DEFAULT_WORKFLOW_NODE_MAPPINGS` 中的 `voice_design` 节点映射
  - `voice_prompt_node_id`: "23" → "53"
  - `ref_text_node_id`: "23" → "54"
- [x] 1.2 更新 `DEFAULT_WORKFLOW_NODE_MAPPINGS` 中的 `audio` 节点映射
  - `text_node_id`: "31" → "32"
  - `emotion_prompt_node_id`: "31" → "33"
  - `save_audio_node_id`: "56" → "30"
- [x] 1.3 更新 `EXTRA_SYSTEM_WORKFLOWS` 中音色设计工作流的节点映射
- [x] 1.4 更新 `EXTRA_SYSTEM_WORKFLOWS` 中音频生成工作流的节点映射

## 2. 工作流构建器更新

- [x] 2.1 重构 `build_voice_design_workflow` 方法，使用 `_set_prompt` 设置文本内容
- [x] 2.2 更新 `_build_default_voice_design_workflow` 方法，使用独立的 CR Prompt Text 节点
- [x] 2.3 新增 `build_audio_workflow` 方法处理带参考音频的语音克隆
- [x] 2.4 新增 `_build_default_audio_workflow` 方法构建默认音频工作流

## 3. 音频输出解析更新

- [x] 3.1 更新 `_parse_audio_outputs` 方法，支持 `PreviewAudio` 节点

## 4. 文档更新

- [x] 4.1 更新 design.md 添加实现总结
- [x] 4.2 标记提案状态为已完成