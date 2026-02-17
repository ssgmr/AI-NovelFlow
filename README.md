# AI-NovelFlow

AI 驱动的小说转视频平台

## 项目概述

NovelFlow 是一个将小说自动转换为视频的 AI 平台，核心流程：

```
小说文本 → DeepSeek API → JSON结构化 → 人设图 → 分镜图 → 分镜视频 → 合成视频
```

支持章回体小说解析、角色一致性保持、自动分镜生成和视频合成。

## 技术栈

- **前端**: React + TypeScript + Tailwind CSS + Vite
- **后端**: FastAPI + SQLAlchemy + SQLite
- **AI**: DeepSeek API / OpenAI API / Gemini API + ComfyUI
- **视频生成**: LTX-2 视频生成模型

## 主要功能

- **小说管理**: 支持新建、编辑、删除小说，自动章回体解析
- **角色库**: AI 自动解析角色，支持角色形象生成和一致性保持
- **分镜生成**: AI 自动拆分章节为分镜，支持批量生成图片和视频
- **转场视频**: 支持生成镜头转场、光线转场、遮挡转场视频
- **工作流管理**: 支持自定义 ComfyUI 工作流，节点映射配置
- **任务队列**: 后台异步任务处理，支持任务状态实时监控
- **预设测试用例**: 内置《小马过河》《小红帽》《皇帝的新装》等测试用例

## 项目结构

```
AI-NovelFlow/
├── backend/              # FastAPI 后端
│   ├── app/
│   │   ├── api/         # API 路由
│   │   ├── core/        # 核心配置
│   │   ├── models/      # 数据库模型
│   │   ├── schemas/     # Pydantic 模型
│   │   └── services/    # 业务逻辑（LLM、ComfyUI）
│   ├── user_story/      # 生成的图片/视频存储目录
│   └── main.py
├── frontend/            # React 前端
│   └── my-app/
│       ├── src/
│       │   ├── components/  # 组件
│       │   ├── pages/       # 页面
│       │   ├── stores/      # 状态管理
│       │   └── types/       # TypeScript 类型
│       └── package.json
└── README.md
```

## 快速开始

### 后端启动

```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

后端服务将在 http://localhost:8000 运行

### 前端启动

```bash
cd frontend/my-app
npm install
npm run dev
```

前端服务将在 http://localhost:5173 运行

## API 文档

启动后端后访问: http://localhost:8000/docs

## 配置说明

### 1. LLM API 配置

支持多种 LLM 提供商：
- **DeepSeek**（默认）: https://api.deepseek.com
- **OpenAI**: https://api.openai.com
- **Gemini**: https://generativelanguage.googleapis.com
- **Anthropic**: https://api.anthropic.com
- **Azure OpenAI**: 自定义 Azure 端点

在【系统配置】页面设置 API Key 和代理（如需）。

### 2. ComfyUI 配置

- **ComfyUI 地址**: 默认 http://localhost:8188
- **工作流配置**: 支持上传自定义工作流，需配置节点映射
  - 人设生成: 提示词节点 + 图片保存节点
  - 分镜生图: 提示词节点 + 图片保存节点 + 宽高节点
  - 分镜生视频: 提示词节点 + 视频保存节点 + 参考图节点
  - 转场视频: 首帧图节点 + 尾帧图节点 + 视频保存节点

### 3. 提示词模板配置

支持自定义：
- AI 解析角色系统提示词
- 角色生成提示词模板
- 章节拆分提示词模板

## 开发路线图

- [x] 项目初始化
- [x] 基础页面（欢迎、配置、小说列表）
- [x] 后端 API 框架
- [x] DeepSeek API 集成（文本解析）
- [x] ComfyUI API 集成（生图/生视频）
- [x] 任务队列系统
- [x] 角色库管理
- [x] 工作流管理系统
- [x] JSON 解析日志
- [x] 预设测试用例
- [ ] 视频合成功能（开发中）
- [ ] 多语言支持

## 环境变量（可选）

配置会存储在数据库中，环境变量仅作为默认值：

创建 `backend/.env` 文件：

```env
# LLM 配置
DEEPSEEK_API_KEY=your_api_key_here
DEEPSEEK_API_URL=https://api.deepseek.com

# ComfyUI 配置
COMFYUI_HOST=http://localhost:8188

# 代理配置（如需）
PROXY_ENABLED=false
HTTP_PROXY=
HTTPS_PROXY=
```

## 使用说明

### 1. 新建小说
- 点击【新建小说】创建小说
- 或选择预设测试用例快速体验

### 2. AI 解析
- 在章节页面点击【AI 拆分章节】
- 系统自动解析角色、场景和分镜

### 3. 生成角色形象
- 进入【角色库】页面
- 点击【AI 生成所有角色形象】

### 4. 生成分镜图片
- 进入【章节生成】页面
- 点击【生成全部分镜图】

### 5. 生成分镜视频
- 分镜图片生成完成后
- 点击【生成全部分镜视频】

### 6. 生成转场视频（可选）
- 在分镜之间生成转场过渡视频

## License

MIT
