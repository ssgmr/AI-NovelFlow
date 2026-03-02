# character-voice Specification

## Purpose
定义角色音色能力要求，包括音色提示词存储、参考音频生成与存储、角色库音色管理界面，以及分镜台词音频生成时引用角色参考音频的能力。
## Requirements
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

### Requirement: 角色参考音频用于分镜台词生成

系统 SHALL 允许分镜音频生成功能引用角色的参考音频作为语音克隆的音色来源。

#### Scenario: 分镜音频生成引用角色参考音频
- **WHEN** 为分镜角色台词生成音频
- **THEN** 系统 SHALL 使用角色的 `reference_audio_url` 作为 ComfyUI 工作流的参考音频输入
- **AND** 参考音频 SHALL 通过 `LoadAudio` 节点加载

#### Scenario: 角色无参考音频时的错误处理
- **WHEN** 为分镜台词生成音频时角色没有 `reference_audio_url`
- **THEN** 系统 SHALL 返回错误信息：`角色 "{name}" 尚未生成音色，请先在角色库中生成`
- **AND** 任务 SHALL 不被创建

#### Scenario: 参考音频下载到本地
- **WHEN** 音频生成任务执行时
- **THEN** 系统 SHALL 先将参考音频下载到本地
- **AND** 若参考音频是本地路径（`/api/files/` 前缀），系统 SHALL 直接使用
- **AND** 若参考音频是远程 URL，系统 SHALL 下载到临时目录

### Requirement: 分镜音频生成查询角色信息

系统 SHALL 在分镜音频生成时查询角色的完整信息，包括参考音频 URL。

#### Scenario: 查询角色参考音频
- **WHEN** 创建分镜音频生成任务
- **THEN** 系统 SHALL 通过角色名称查询角色的 `reference_audio_url`
- **AND** 若角色不在角色库中，系统 SHALL 返回警告信息

#### Scenario: 角色不存在时的处理
- **WHEN** 台词中的角色名称在角色库中找不到
- **THEN** 系统 SHALL 返回警告：`角色 "{name}" 不存在于角色库中`
- **AND** 系统 SHALL 不为该台词创建任务

### Requirement: 角色库显示参考音频状态用于分镜生成

角色库 UI SHALL 显示角色的参考音频状态，帮助用户了解该角色是否可用于分镜音频生成。

#### Scenario: 角色无参考音频时提示
- **WHEN** 角色没有 `reference_audio_url`
- **THEN** 角色卡片 SHALL 显示"未生成音色"提示（灰色标签）
- **AND** 提示 SHALL 使用 `voiceNotGenerated` 翻译键

#### Scenario: 角色有参考音频时显示可用状态
- **WHEN** 角色有 `reference_audio_url`
- **THEN** 角色卡片 SHALL 显示"音色已就绪"状态（绿色标签）
- **AND** 提示 SHALL 使用 `voiceReady` 翻译键

#### Scenario: 角色卡片显示音频播放按钮
- **WHEN** 角色有 `reference_audio_url`
- **THEN** 角色卡片 SHALL 显示"播放音频"按钮
- **AND** 点击按钮 SHALL 播放/停止参考音频

### Requirement: 角色库 i18n 翻译键

系统 SHALL 提供角色音色状态相关的翻译键。

#### Scenario: 翻译键定义
- **WHEN** 显示角色音色状态
- **THEN** 系统 SHALL 使用以下翻译键：
  - `characters.voiceReady`: "音色已就绪"
  - `characters.voiceNotGenerated`: "未生成音色"
  - `characters.playAudio`: "播放"
  - `characters.stopAudio`: "停止"
  - `characters.regenerateVoice`: "重新生成音色"
  - `characters.generateVoice`: "生成音色"

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

