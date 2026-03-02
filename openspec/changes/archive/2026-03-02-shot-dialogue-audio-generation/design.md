## Context

### 背景与现状
章节分镜生成页面（`ChapterGenerate`）当前支持：
- 解析分镜数据：角色名列表、场景、道具、描述等
- 编辑分镜信息：在 `JsonTableEditor` 组件中修改描述、场景、角色等
- 生成分镜图片和视频

**缺失能力**：
- 无法解析和存储角色台词（dialogue）
- 无法解析和存储情感提示词（emotion_prompt）
- 无法为分镜中的角色对话生成音频

### 相关技术组件
- **前端编辑器**：`JsonTableEditor.tsx` 已支持分镜 Tab 列表和单个分镜编辑
- **音频工作流**：`build_audio_workflow` 已支持带参考音频的语音克隆
- **角色音色**：角色已有 `voicePrompt` 和 `referenceAudioUrl` 字段

### 约束条件
- 分镜数据存储在章节的 `parsedData` JSON 字段中，扩展需兼容现有数据
- 音频生成依赖角色已有参考音频（需先在角色库生成音色）
- 工作流使用 `Qwen3-TTS-Voice-Design.json`（audio 类型）

## Goals / Non-Goals

**Goals:**
1. 扩展分镜数据结构，支持存储角色台词列表
2. 在分镜编辑器中展示和编辑每个角色的台词和情感提示词
3. 支持为单个分镜的所有角色台词生成音频
4. 支持批量生成章节所有分镜的音频
5. 在分镜编辑区域展示生成的音频列表，支持播放

**Non-Goals:**
- 不涉及自动解析台词（由分镜拆分提示词模板控制，另行处理）
- 不涉及音频与视频的合成（属于后期合成流程）
- 不支持一个角色在同一段落有多次台词（简化数据结构）

## Decisions

### D1: 分镜数据结构扩展

**决策**：在 `ShotData` 中新增 `dialogues` 字段，数组类型。

```typescript
interface DialogueData {
  character_name: string;    // 角色名称
  text: string;              // 台词文本
  emotion_prompt?: string;   // 情感提示词（可选）
  audio_url?: string;        // 生成的音频 URL
  audio_task_id?: string;    // 音频生成任务 ID
}

interface ShotData {
  // ... 现有字段
  dialogues?: DialogueData[]; // 新增：台词列表
}
```

**理由**：
- 使用数组支持多角色台词
- 与现有 `characters` 字段独立，避免破坏现有逻辑
- `emotion_prompt` 可选，支持简单场景

**备选方案**：扩展 `characters` 为对象数组包含台词
- **否决理由**：修改核心字段影响面大，现有角色选择逻辑依赖字符串数组

### D2: 前端编辑器 UI 设计

**决策**：在分镜编辑区域新增「台词编辑」区块，位于角色选择器下方。

```
┌─────────────────────────────────────┐
│ 分镜描述 (textarea)                   │
│ 视频描述 (textarea)                   │
│ 场景选择 (select)                     │
│ 时长 (input)                          │
│ 角色标签 (tags)                       │
├─────────────────────────────────────┤
│ 台词编辑区 ← 新增                      │
│ ┌─────────────────────────────────┐ │
│ │ [角色名] [台词内容] [情感] [音频] │ │
│ │ [角色名] [台词内容] [情感] [音频] │ │
│ │ [+ 添加台词]                     │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ 道具标签 (tags)                       │
└─────────────────────────────────────┘
```

**交互设计**：
- 角色名从已选角色列表中选择（下拉框）
- 台词文本和情感提示词为输入框
- 音频列显示播放按钮或生成状态
- 支持添加/删除台词行

**理由**：复用现有编辑器模式，用户学习成本低

### D3: 后端 API 设计

**决策**：新增两个 API 端点。

1. **单分镜音频生成**
   ```
   POST /api/novels/{novel_id}/chapters/{chapter_id}/shots/{shot_index}/audio
   Request: {
     dialogues: [{ character_name, text, emotion_prompt }]
   }
   Response: {
     success: true,
     tasks: [{ character_name, task_id }]
   }
   ```

2. **批量章节音频生成**
   ```
   POST /api/novels/{novel_id}/chapters/{chapter_id}/audio/generate-all
   Response: {
     success: true,
     tasks: [{ shot_index, character_name, task_id }],
     warnings: [{ shot_index, character_name, reason }]
   }
   ```

**理由**：
- 与现有图片/视频生成 API 风格一致
- 异步任务模式，支持长时间生成
- 批量接口减少前端请求次数
- warnings 字段记录跳过的角色（如无参考音频）

### D4: 音频生成流程

**决策**：复用现有任务系统和 ComfyUI 服务。

```
前端发起请求 → 创建任务(character_audio 类型) → ComfyUI 队列
→ 轮询任务状态 → 更新 dialogues[].audio_url
```

**关键步骤**：
1. 检查角色是否有 `referenceAudioUrl`，无则报错
2. 构建 `audio` 工作流，设置参考音频、文本、情感提示词
3. 提交 ComfyUI 队列，返回任务 ID
4. 前端轮询任务状态
5. 完成后更新分镜数据的 `audio_url`

**理由**：与角色音色生成流程一致，复用现有基础设施

## Risks / Trade-offs

### R1: 角色无参考音频时无法生成
**风险**：用户可能忘记在角色库生成音色
**缓解**：
- 前端检查并显示警告提示
- API 返回明确错误信息：`角色 "{name}" 尚未生成音色，请先在角色库中生成`

### R2: 大量音频生成可能阻塞 ComfyUI 队列
**风险**：一个章节可能有数十个分镜，每个分镜可能有多个角色台词
**缓解**：
- 批量生成时按分镜顺序逐个提交
- 提供取消批量生成的能力
- 未来可考虑队列优先级或并行限制

### R3: 数据迁移兼容性
**风险**：现有分镜数据没有 `dialogues` 字段
**缓解**：
- `dialogues` 字段设为可选
- 编辑器正常处理无台词的分镜
- 不影响现有图片/视频生成流程

## Migration Plan

### 阶段 1：数据结构扩展（无破坏性）
- 扩展前端 `ShotData` 类型定义
- 扩展后端 Schema 定义
- 兼容现有数据，无需数据库迁移

### 阶段 2：前端编辑器更新
- 在 `JsonTableEditor` 中新增台词编辑区块
- 新增翻译键
- 支持添加/编辑/删除台词

### 阶段 3：后端 API 实现
- 新增音频生成 API
- 新增 `character_audio` 任务类型
- 集成 ComfyUI 音频工作流

### 阶段 4：音频播放与状态管理
- 在分镜编辑区域显示音频播放器
- 支持单个分镜生成音频
- 显示生成进度和状态

## Open Questions

1. **音频文件存储路径**：建议使用 `story_{novel_id}/shot_audio/shot_{shot_id}_{character_name}.flac` 格式，需要确认。
2. **情感提示词默认值**：建议默认为"自然"，是否需要根据场景/情绪自动推荐？
3. **音频时长限制**：是否需要限制单条台词的最大字符数？