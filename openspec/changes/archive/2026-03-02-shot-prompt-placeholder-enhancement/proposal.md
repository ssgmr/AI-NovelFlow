# 分镜提示词占位符增强

## 概述

扩展分镜图生成的提示词占位符系统，支持自动注入角色外貌、场景设定、道具外观等描述信息，以提升分镜图与角色/场景库的一致性。

## 背景与动机

### 当前问题

分镜图生成时，`shot_image_service.py` 仅使用分镜的 `description` 字段作为提示词，同时通过角色/场景名称查询对应的参考图片。但角色表（Character）的 `appearance` 字段和场景表（Scene）的 `setting` 字段未被利用。

这导致：
1. 角色外貌一致性依赖 LLM 生成的分镜描述，而非角色库中的权威数据
2. 场景环境描述分散在多处，难以保持统一
3. 用户需要手动在分镜描述中重复输入角色/场景设定

### 现有机制

项目已有 `##STYLE##` 占位符替换机制，在 `WorkflowBuilder._replace_style_placeholder()` 中实现。本提案在此基础上扩展。

## 提案

### 新增占位符

| 占位符 | 替换内容 | 数据来源 |
|--------|----------|----------|
| `##STYLE##` | 风格提示词 | 已有实现 |
| `##SCENE##` | 当前镜头场景的环境设定 | Scene.setting |
| `##CHARACTERS##` | 当前镜头所有角色的外貌描述（逗号合并） | Character.appearance |
| `##PROPS##` | 当前镜头所有道具的外观描述（逗号合并） | Prop.appearance |

### 使用示例

分镜 `description` 字段：
```
Scene: ##SCENE##
Characters: ##CHARACTERS##
Action: 一个少年站在大厅中央，目光坚定
```

替换后：
```
Scene: 古色古香的大厅，雕花木柱，青石地面，庄严肃穆的氛围
Characters: 剑眉星目，身材修长，玄色长袍，气质沉稳
Action: 一个少年站在大厅中央，目光坚定
```

### 替换模式

采用**替换模式**：以角色/场景库中的数据为准，保证数据一致性。

如果工作流中没有对应占位符，则不做任何替换，保持向后兼容。

## 设计方案

### 后端修改

#### 1. WorkflowBuilder 扩展

文件：`backend/app/services/comfyui/workflows.py`

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
    # 新增参数
    character_appearances: Optional[Dict[str, str]] = None,
    scene_setting: Optional[str] = None,
    prop_appearances: Optional[Dict[str, str]] = None
) -> Dict[str, Any]:
```

#### 2. 新增占位符替换方法

```python
def _replace_scene_placeholder(self, workflow: Dict[str, Any], scene_setting: Optional[str]):
    """替换 ##SCENE## 占位符"""
    if not scene_setting:
        return
    for node_id, node in workflow.items():
        if not isinstance(node, dict):
            continue
        inputs = node.get("inputs", {})
        for key, value in inputs.items():
            if isinstance(value, str) and "##SCENE##" in value:
                inputs[key] = value.replace("##SCENE##", scene_setting)

def _replace_characters_placeholder(self, workflow: Dict[str, Any], character_appearances: Optional[Dict[str, str]]):
    """替换 ##CHARACTERS## 占位符"""
    if not character_appearances:
        return
    # 合并所有角色外貌描述
    merged = ", ".join([app for app in character_appearances.values() if app])
    if not merged:
        return
    for node_id, node in workflow.items():
        if not isinstance(node, dict):
            continue
        inputs = node.get("inputs", {})
        for key, value in inputs.items():
            if isinstance(value, str) and "##CHARACTERS##" in value:
                inputs[key] = value.replace("##CHARACTERS##", merged)

def _replace_props_placeholder(self, workflow: Dict[str, Any], prop_appearances: Optional[Dict[str, str]]):
    """替换 ##PROPS## 占位符"""
    if not prop_appearances:
        return
    merged = ", ".join([app for app in prop_appearances.values() if app])
    if not merged:
        return
    for node_id, node in workflow.items():
        if not isinstance(node, dict):
            continue
        inputs = node.get("inputs", {})
        for key, value in inputs.items():
            if isinstance(value, str) and "##PROPS##" in value:
                inputs[key] = value.replace("##PROPS##", merged)
```

#### 3. shot_image_service 修改

文件：`backend/app/services/shot_image_service.py`

在 `generate_shot_image_task()` 中添加：

```python
# 查询角色外貌描述
character_appearances = {}
for char_name in shot_characters:
    character = db.query(Character).filter(
        Character.novel_id == novel_id,
        Character.name == char_name
    ).first()
    if character and character.appearance:
        character_appearances[char_name] = character.appearance

# 查询场景设定
scene_setting = None
if shot_scene:
    scene = db.query(Scene).filter(
        Scene.novel_id == novel_id,
        Scene.name == shot_scene
    ).first()
    if scene and scene.setting:
        scene_setting = scene.setting

# 查询道具外观
prop_appearances = {}
for prop_name in shot_props:
    prop = db.query(Prop).filter(
        Prop.novel_id == novel_id,
        Prop.name == prop_name
    ).first()
    if prop and prop.appearance:
        prop_appearances[prop_name] = prop.appearance

# 构建工作流时传入
submitted_workflow = comfyui_service.builder.build_shot_workflow(
    prompt=shot_description,
    workflow_json=workflow.workflow_json,
    node_mapping=node_mapping,
    aspect_ratio=novel.aspect_ratio or "16:9",
    style=style,
    character_appearances=character_appearances,
    scene_setting=scene_setting,
    prop_appearances=prop_appearances
)
```

### 前端修改

#### 1. 占位符提示组件

文件：`frontend/my-app/src/pages/ChapterGenerate/components/JsonTableEditor.tsx`

在分镜 `description` 输入框下方添加占位符提示：

```tsx
<div className="mt-1 p-2 bg-blue-50 rounded-md">
  <p className="text-xs text-blue-600 font-medium mb-1">💡 可用占位符：</p>
  <div className="flex flex-wrap gap-2 text-xs text-blue-500">
    <span className="px-1.5 py-0.5 bg-blue-100 rounded">##STYLE## - 风格提示词</span>
    <span className="px-1.5 py-0.5 bg-blue-100 rounded">##SCENE## - 场景环境设定</span>
    <span className="px-1.5 py-0.5 bg-blue-100 rounded">##CHARACTERS## - 角色外貌描述</span>
    <span className="px-1.5 py-0.5 bg-blue-100 rounded">##PROPS## - 道具外观描述</span>
  </div>
</div>
```

#### 2. 国际化文案

文件：`frontend/my-app/src/i18n/locales/zh-CN/chapters.ts`

```typescript
placeholderHint: '💡 可用占位符：',
placeholderStyle: '##STYLE## - 风格提示词',
placeholderScene: '##SCENE## - 场景环境设定',
placeholderCharacters: '##CHARACTERS## - 角色外貌描述',
placeholderProps: '##PROPS## - 道具外观描述',
```

更新所有 5 种语言文件。

## 影响范围

### 后端
- `backend/app/services/comfyui/workflows.py` - 新增占位符替换方法
- `backend/app/services/shot_image_service.py` - 查询并传入角色/场景描述

### 前端
- `frontend/my-app/src/pages/ChapterGenerate/components/JsonTableEditor.tsx` - 占位符提示 UI
- `frontend/my-app/src/i18n/locales/*/chapters.ts` - 国际化文案（5种语言）

## 非目标

- 不修改分镜拆分提示词模板（LLM 生成分镜时不需要使用占位符）
- 不修改现有工作流 JSON 文件（占位符在 description 字段中使用）
- 不实现按角色名单独注入（如 `##CHARACTER:萧炎##`），统一使用合并模式

## 验收标准

1. 分镜 description 中使用 `##SCENE##` 时，生成图片时自动替换为场景设定
2. 分镜 description 中使用 `##CHARACTERS##` 时，自动替换为所有角色的外貌描述
3. 分镜 description 中使用 `##PROPS##` 时，自动替换为所有道具的外观描述
4. 没有占位符时分镜图正常生成（向后兼容）
5. 前端显示占位符提示信息
6. 5 种语言国际化完整