# 分镜提示词占位符增强 - 任务清单

## 后端任务

### [x] 1. WorkflowBuilder 扩展占位符替换方法

**文件**: `backend/app/services/comfyui/workflows.py`

**内容**:
1. `build_shot_workflow()` 方法新增参数：
   - `character_appearances: Optional[Dict[str, str]] = None`
   - `scene_setting: Optional[str] = None`
   - `prop_appearances: Optional[Dict[str, str]] = None`

2. 新增占位符替换方法：
   - `_replace_scene_placeholder(workflow, scene_setting)`
   - `_replace_characters_placeholder(workflow, character_appearances)`
   - `_replace_props_placeholder(workflow, prop_appearances)`

3. 在 `build_shot_workflow()` 末尾调用新增方法

---

### [x] 2. shot_image_service 查询并传入角色/场景描述

**文件**: `backend/app/services/shot_image_service.py`

**内容**:
1. 在 `generate_shot_image_task()` 中查询角色外貌：
   ```python
   character_appearances = {}
   for char_name in shot_characters:
       character = db.query(Character).filter(...)
       if character and character.appearance:
           character_appearances[char_name] = character.appearance
   ```

2. 查询场景设定：
   ```python
   scene_setting = None
   if shot_scene:
       scene = db.query(Scene).filter(...)
       if scene and scene.setting:
           scene_setting = scene.setting
   ```

3. 查询道具外观：
   ```python
   prop_appearances = {}
   for prop_name in shot_props:
       prop = db.query(Prop).filter(...)
       if prop and prop.appearance:
           prop_appearances[prop_name] = prop.appearance
   ```

4. 传入 `build_shot_workflow()`

---

## 前端任务

### [x] 3. 添加占位符提示 UI

**文件**: `frontend/my-app/src/pages/ChapterGenerate/components/JsonTableEditor.tsx`

**内容**:
1. 在分镜 `description` textarea 下方添加占位符提示区域
2. 样式：浅蓝色背景，flex 布局展示各占位符标签
3. 使用 i18n 翻译 key

---

### [x] 4. 添加中文翻译

**文件**: `frontend/my-app/src/i18n/locales/zh-CN/chapters.ts`

**内容**:
```typescript
placeholderHint: '💡 可用占位符：',
placeholderStyle: '##STYLE## - 风格提示词',
placeholderScene: '##SCENE## - 场景环境设定',
placeholderCharacters: '##CHARACTERS## - 角色外貌描述',
placeholderProps: '##PROPS## - 道具外观描述',
```

---

### [x] 5. 添加英文翻译

**文件**: `frontend/my-app/src/i18n/locales/en-US/chapters.ts`

**内容**:
```typescript
placeholderHint: '💡 Available placeholders:',
placeholderStyle: '##STYLE## - Style prompt',
placeholderScene: '##SCENE## - Scene environment setting',
placeholderCharacters: '##CHARACTERS## - Character appearance description',
placeholderProps: '##PROPS## - Prop appearance description',
```

---

### [x] 6. 添加日文翻译

**文件**: `frontend/my-app/src/i18n/locales/ja-JP/chapters.ts`

**内容**:
```typescript
placeholderHint: '💡 利用可能なプレースホルダー：',
placeholderStyle: '##STYLE## - スタイルプロンプト',
placeholderScene: '##SCENE## - シーン環境設定',
placeholderCharacters: '##CHARACTERS## - キャラクター外見説明',
placeholderProps: '##PROPS## - 小道具外見説明',
```

---

### [x] 7. 添加韩文翻译

**文件**: `frontend/my-app/src/i18n/locales/ko-KR/chapters.ts`

**内容**:
```typescript
placeholderHint: '💡 사용 가능한 플레이스홀더:',
placeholderStyle: '##STYLE## - 스타일 프롬프트',
placeholderScene: '##SCENE## - 장면 환경 설정',
placeholderCharacters: '##CHARACTERS## - 캐릭터 외모 설명',
placeholderProps: '##PROPS## - 소품 외모 설명',
```

---

### [x] 8. 添加繁体中文翻译

**文件**: `frontend/my-app/src/i18n/locales/zh-TW/chapters.ts`

**内容**:
```typescript
placeholderHint: '💡 可用佔位符：',
placeholderStyle: '##STYLE## - 風格提示詞',
placeholderScene: '##SCENE## - 場景環境設定',
placeholderCharacters: '##CHARACTERS## - 角色外貌描述',
placeholderProps: '##PROPS## - 道具外觀描述',
```

---

## 验收测试

### [x] 9. 功能测试

1. 创建测试用例：
   - 分镜 description 含 `##SCENE##`，验证场景 setting 注入
   - 分镜 description 含 `##CHARACTERS##`，验证角色 appearance 注入
   - 分镜 description 含 `##PROPS##`，验证道具 appearance 注入
   - 无占位符时验证向后兼容

2. 边界测试：
   - 角色无 appearance 时不注入
   - 场景无 setting 时不注入
   - 角色不在角色库时跳过

3. 前端测试：
   - 占位符提示正确显示
   - 5 种语言切换正常