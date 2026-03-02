# 分镜提示词占位符增强 - 设计文档

## 技术架构

### 数据流

```
┌─────────────────────────────────────────────────────────────────────┐
│                     占位符替换数据流                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. 数据准备阶段 (shot_image_service.py)                            │
│  ────────────────────────────────────────────────────────────────   │
│                                                                     │
│  parsed_data                                                        │
│  ┌────────────────────────────┐                                    │
│  │ shot: {                    │                                    │
│  │   characters: ["萧炎"],    │─────┐                              │
│  │   scene: "萧家大厅",       │──┐  │                              │
│  │   props: ["玄重尺"]        │┐ │  │                              │
│  │ }                          ││ │  │                              │
│  └────────────────────────────┘│ │  │                              │
│                                │ │  │                              │
│  ┌────────────────────────────┐│ │  │  ┌────────────────────────┐ │
│  │ Character 表               ││ │  └─▶│ character_appearances │ │
│  │ name: "萧炎"               ││ │     │ {"萧炎": "剑眉星目..."}│ │
│  │ appearance: "剑眉星目..."  │┘ │     └────────────────────────┘ │
│  └────────────────────────────┘  │                              │
│                                  │                              │
│  ┌────────────────────────────┐  │  ┌────────────────────────┐  │
│  │ Scene 表                   │  └─▶│ scene_setting          │  │
│  │ name: "萧家大厅"           │     │ "古色古香的大厅..."     │  │
│  │ setting: "古色古香..."     │     └────────────────────────┘  │
│  └────────────────────────────┘                                 │
│                                                                  │
│  ┌────────────────────────────┐     ┌────────────────────────┐  │
│  │ Prop 表                    │────▶│ prop_appearances       │  │
│  │ name: "玄重尺"             │     │ {"玄重尺": "黑色巨剑"} │  │
│  │ appearance: "黑色巨剑..."  │     └────────────────────────┘  │
│  └────────────────────────────┘                                 │
│                                                                  │
│  2. 工作流构建阶段 (WorkflowBuilder.build_shot_workflow)          │
│  ────────────────────────────────────────────────────────────────│
│                                                                  │
│  shot_description: "Scene: ##SCENE##\nCharacters: ##CHARACTERS##"│
│                          │                                       │
│                          ▼                                       │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ _replace_scene_placeholder(workflow, scene_setting)        │  │
│  │ _replace_characters_placeholder(workflow, character_...)   │  │
│  │ _replace_props_placeholder(workflow, prop_appearances)     │  │
│  └────────────────────────────────────────────────────────────┘  │
│                          │                                       │
│                          ▼                                       │
│  最终提示词: "Scene: 古色古香的大厅...\nCharacters: 剑眉星目..." │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 关键接口变更

#### WorkflowBuilder.build_shot_workflow

```python
def build_shot_workflow(
    self,
    prompt: str,
    workflow_json: str,
    node_mapping: Dict[str, str],
    aspect_ratio: str = "16:9",
    seed: Optional[int] = None,
    style: str = "anime style, high quality, detailed",
    reference_images: Dict[str, str] = None,
    # ========== 新增参数 ==========
    character_appearances: Optional[Dict[str, str]] = None,  # 角色名 → 外貌描述
    scene_setting: Optional[str] = None,                      # 场景设定
    prop_appearances: Optional[Dict[str, str]] = None         # 道具名 → 外观描述
) -> Dict[str, Any]:
```

### 占位符替换逻辑

```python
# 在 build_shot_workflow 方法末尾调用
def _replace_all_placeholders(
    self,
    workflow: Dict[str, Any],
    style: str,
    character_appearances: Optional[Dict[str, str]],
    scene_setting: Optional[str],
    prop_appearances: Optional[Dict[str, str]]
):
    """统一替换所有占位符"""
    # 已有：风格占位符
    self._replace_style_placeholder(workflow, style)

    # 新增：场景占位符
    self._replace_scene_placeholder(workflow, scene_setting)

    # 新增：角色占位符
    self._replace_characters_placeholder(workflow, character_appearances)

    # 新增：道具占位符
    self._replace_props_placeholder(workflow, prop_appearances)
```

## 前端设计

### 占位符提示组件

位置：分镜 description 输入框下方

```
┌─────────────────────────────────────────────────────────────────┐
│ 分镜描述（用于生图）                                             │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Scene: ##SCENE##                                            │ │
│ │ Characters: ##CHARACTERS##                                  │ │
│ │ Action: 一个少年站在大厅中央                                 │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 💡 可用占位符：                                              │ │
│ │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │ │
│ │ │##STYLE## │ │##SCENE## │ │##CHARACTERS## │##PROPS## │       │ │
│ │ │风格提示词 │ │场景环境设定│ │角色外貌描述 │ │道具外观描述│       │ │
│ │ └──────────┘ └──────────┘ └──────────┘ └──────────┘       │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 国际化 Key 设计

```typescript
// chapters.ts
placeholderHint: '💡 可用占位符：',
placeholderStyle: '##STYLE## - 风格提示词',
placeholderScene: '##SCENE## - 场景环境设定',
placeholderCharacters: '##CHARACTERS## - 角色外貌描述',
placeholderProps: '##PROPS## - 道具外观描述',
```

## 边界情况处理

### 1. 角色无 appearance 数据

```python
# 只合并非空的 appearance
merged = ", ".join([app for app in character_appearances.values() if app])
if not merged:
    return  # 不替换
```

### 2. 场景无 setting 数据

```python
if not scene_setting:
    return  # 不替换
```

### 3. 工作流无占位符

```python
# 遍历所有节点，如果没有找到占位符则不做任何修改
if isinstance(value, str) and "##SCENE##" in value:
    inputs[key] = value.replace("##SCENE##", scene_setting)
# 没有 ##SCENE## 则不修改
```

### 4. 角色不在角色库中

```python
# 查询不到角色时跳过
character = db.query(Character).filter(...).first()
if character and character.appearance:
    character_appearances[char_name] = character.appearance
```

## 性能考虑

- 占位符替换在内存中进行，遍历工作流节点一次
- 数据库查询已在现有流程中存在（用于获取图片），仅额外获取 `appearance`/`setting` 字段
- 无额外网络请求

## 测试要点

1. **基本功能**
   - description 含 `##SCENE##`，场景有 setting → 替换成功
   - description 含 `##CHARACTERS##`，角色有 appearance → 替换成功
   - description 含 `##PROPS##`，道具有 appearance → 替换成功

2. **边界情况**
   - description 无占位符 → 原样传入
   - 场景无 setting → 不替换
   - 角色无 appearance → 不替换
   - 道具无 appearance → 不替换

3. **向后兼容**
   - 现有工作流无占位符 → 正常生成
   - 现有分镜数据 → 正常生成