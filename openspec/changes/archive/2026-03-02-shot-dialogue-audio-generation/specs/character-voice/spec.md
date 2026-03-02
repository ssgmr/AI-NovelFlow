# character-voice Delta Specification

## Purpose
扩展现有角色音色能力，支持在分镜音频生成时引用角色参考音频。

## ADDED Requirements

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