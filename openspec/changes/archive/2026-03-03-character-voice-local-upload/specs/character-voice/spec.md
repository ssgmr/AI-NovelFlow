## ADDED Requirements

### Requirement: 用户可上传本地音频作为参考音频

系统 SHALL 允许用户从本地上传音频文件作为角色的参考音频。

#### Scenario: 上传音频文件成功
- **WHEN** 用户上传有效的音频文件（MP3/WAV/FLAC/OGG/M4A，≤10MB）
- **THEN** 系统 SHALL 保存音频到本地存储
- **AND** 角色 `reference_audio_url` SHALL 更新为新音频路径
- **AND** 返回成功响应

#### Scenario: 上传不支持的文件格式
- **WHEN** 用户上传非音频格式的文件
- **THEN** 系统 SHALL 返回错误消息，提示支持的格式
- **AND** 不创建任何文件

#### Scenario: 上传文件过大
- **WHEN** 用户上传超过 10MB 的音频文件
- **THEN** 系统 SHALL 返回错误消息，提示文件大小限制

### Requirement: 角色库提供上传音频按钮

角色库 UI SHALL 为每个角色提供"上传音频"按钮，用于上传本地音频。

#### Scenario: 显示上传音频按钮
- **WHEN** 角色卡片渲染时
- **THEN** 在音色区域 SHALL 显示"上传音频"按钮
- **AND** 按钮 SHALL 与"生成音色"按钮并列显示

#### Scenario: 点击上传音频按钮触发文件选择
- **WHEN** 用户点击"上传音频"按钮
- **THEN** 系统 SHALL 打开文件选择对话框
- **AND** 文件类型过滤器 SHALL 限制为音频格式

#### Scenario: 上传成功后更新 UI
- **WHEN** 音频上传成功完成
- **THEN** 角色卡片 SHALL 显示"音色已就绪"状态
- **AND** 音频播放按钮 SHALL 显示并可播放新音频

#### Scenario: 上传失败显示错误提示
- **WHEN** 音频上传失败
- **THEN** 系统 SHALL 显示错误提示信息
- **AND** 角色卡片状态 SHALL 保持不变

### Requirement: 上传音频与生成音频可互换

系统 SHALL 允许用户在上传音频和生成音频之间自由切换。

#### Scenario: 上传音频替换生成音频
- **WHEN** 角色已有通过 ComfyUI 生成的参考音频
- **AND** 用户上传新音频
- **THEN** 旧音频 SHALL 被新上传音频替换
- **AND** `reference_audio_url` SHALL 更新为新音频路径

#### Scenario: 生成音频替换上传音频
- **WHEN** 角色已有用户上传的参考音频
- **AND** 用户点击"生成音色"按钮
- **THEN** 新生成的音频 SHALL 替换已上传音频
- **AND** `reference_audio_url` SHALL 更新为新音频路径

### Requirement: 角色库 i18n 翻译键扩展

系统 SHALL 提供音频上传相关的翻译键。

#### Scenario: 翻译键定义
- **WHEN** 显示音频上传相关 UI
- **THEN** 系统 SHALL 使用以下翻译键：
  - `characters.uploadAudio`: "上传音频"
  - `characters.uploadingAudio`: "上传中..."
  - `characters.uploadAudioSuccess`: "音频上传成功"
  - `characters.uploadAudioFailed`: "音频上传失败"
  - `characters.audioFormatError`: "不支持的音频格式，请上传 MP3/WAV/FLAC/OGG/M4A 格式"
  - `characters.audioSizeError`: "音频文件大小不能超过 10MB"