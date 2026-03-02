## ADDED Requirements

### Requirement: 角色存储音色提示词

系统 SHALL 允许每个角色存储可选的音色提示词，描述音色特征。

#### Scenario: 创建角色时存储音色提示词
- **WHEN** 创建角色时提供了 voice_prompt 数据
- **THEN** voice_prompt 字段 SHALL 被存储到数据库

#### Scenario: 音色提示词可更新
- **WHEN** 用户编辑角色的音色提示词
- **THEN** 更新后的 voice_prompt SHALL 被保存

#### Scenario: 音色提示词可选
- **WHEN** 角色没有 voice_prompt
- **THEN** 角色记录 SHALL 仍有效，voice_prompt 为 null

### Requirement: 角色存储参考音频 URL

系统 SHALL 允许每个角色存储可选的参考音频 URL，指向生成的音色样本。

#### Scenario: 生成后存储参考音频 URL
- **WHEN** 音色生成成功完成
- **THEN** reference_audio_url 字段 SHALL 更新为音频文件 URL

#### Scenario: 参考音频可重新生成
- **WHEN** 用户为已有音频的角色重新生成音色
- **THEN** 旧音频文件 SHALL 被替换为新音频，URL 更新

### Requirement: 通过 voice_design 工作流生成音色样本

系统 SHALL 提供 API 端点使用 voice_design ComfyUI 工作流生成音色样本。

#### Scenario: 创建音色生成任务
- **WHEN** 用户为有 voice_prompt 的角色请求生成音色
- **THEN** 系统 SHALL 创建类型为 "character_voice" 的任务
- **AND** 任务 SHALL 使用 voice_design 工作流

#### Scenario: 音色生成需要音色提示词
- **WHEN** 用户为没有 voice_prompt 的角色请求生成音色
- **THEN** 系统 SHALL 返回错误消息，提示需要 voice_prompt

#### Scenario: 音色生成使用角色音色提示词
- **WHEN** 音色生成任务执行时
- **THEN** 角色的 voice_prompt SHALL 被注入到工作流的 voice_prompt_node_id 节点

### Requirement: 角色库显示音色提示词

角色库 UI SHALL 显示每个角色的音色提示词，并支持在编辑模态框中编辑。

#### Scenario: 角色卡片显示音色提示词
- **WHEN** 角色有 voice_prompt 值
- **THEN** 角色卡片 SHALL 显示音色提示词文本

#### Scenario: 编辑模态框编辑音色提示词
- **WHEN** 用户在编辑模态框中编辑角色的音色提示词并保存
- **THEN** 更新后的 voice_prompt SHALL 保存到数据库

### Requirement: 角色库提供音频播放

角色库 UI SHALL 为有参考音频的角色提供音频播放功能。

#### Scenario: 有音频的角色显示音频播放器
- **WHEN** 角色有 reference_audio_url
- **THEN** 角色卡片 SHALL 显示音频播放按钮

#### Scenario: 音频播放器播放参考音频
- **WHEN** 用户点击音频播放按钮
- **THEN** 参考音频 SHALL 通过浏览器播放

### Requirement: 生成音色按钮

角色库 UI SHALL 为每个角色提供"生成音色"按钮，与生成人设图按钮并排显示。

#### Scenario: 生成音色按钮触发生成
- **WHEN** 用户点击生成音色按钮
- **THEN** 系统 SHALL 调用该角色的音色生成 API

#### Scenario: 生成音色显示生成中状态
- **WHEN** 音色生成进行中
- **THEN** 按钮 SHALL 显示加载/生成中状态
- **AND** 系统 SHALL 轮询追踪任务进度

#### Scenario: 生成音色成功完成
- **WHEN** 音色生成任务完成
- **THEN** 角色的 reference_audio_url SHALL 更新
- **AND** 音频播放按钮 SHALL 显示并可播放新音频