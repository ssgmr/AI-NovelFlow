# character-parse Specification

## Purpose
TBD - created by archiving change character-voice-design. Update Purpose after archive.
## Requirements
### Requirement: 角色解析提取音色提示词

系统 SHALL 从 LLM 角色解析响应中提取 voice_prompt 字段并存储到角色记录。

#### Scenario: 从解析结果提取音色提示词
- **WHEN** LLM 在角色解析期间返回带有 voice_prompt 字段的角色数据
- **THEN** voice_prompt 值 SHALL 存储到角色记录

#### Scenario: 解析结果中音色提示词可选
- **WHEN** LLM 返回的角色数据没有 voice_prompt 字段
- **THEN** 角色 SHALL 以 null voice_prompt 创建
- **AND** 解析 SHALL 成功完成不报错

#### Scenario: 已有角色更新音色提示词
- **WHEN** 为已有角色运行角色解析
- **AND** LLM 返回新的 voice_prompt 值
- **THEN** 角色的 voice_prompt SHALL 更新为新值

### Requirement: 角色解析提示词模板支持音色提示词

character_parse 提示词模板类型 SHALL 支持在 LLM 响应格式中请求 voice_prompt。

#### Scenario: 默认模板包含音色提示词字段
- **WHEN** 使用系统默认 character_parse 模板
- **THEN** 模板 SHALL 指示 LLM 在响应 JSON 中返回 voice_prompt

#### Scenario: 自定义模板可包含音色提示词
- **WHEN** 自定义 character_parse 模板在预期响应格式中包含 voice_prompt
- **THEN** 解析 SHALL 提取并存储 voice_prompt 值

