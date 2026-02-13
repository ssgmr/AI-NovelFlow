# AI-NovelFlow

AI 驱动的小说转视频平台

## 项目概述

NovelFlow 是一个将小说自动转换为视频的 AI 平台，核心流程：

```
小说文本 → DeepSeek API → JSON结构化 → 人设图(z-image) → 分镜图(qwen-edit) → 分镜视频(ltx-2) → 合成视频
```

## 技术栈

- **前端**: React + TypeScript + Tailwind CSS + Vite
- **后端**: FastAPI + SQLAlchemy + SQLite
- **AI**: DeepSeek API + ComfyUI

## 项目结构

```
AI-NovelFlow/
├── backend/              # FastAPI 后端
│   ├── app/
│   │   ├── api/         # API 路由
│   │   ├── core/        # 核心配置
│   │   ├── models/      # 数据库模型
│   │   ├── schemas/     # Pydantic 模型
│   │   └── services/    # 业务逻辑
│   ├── venv/            # Python 虚拟环境
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

1. **DeepSeek API**: 在系统配置页面输入 API Key
2. **ComfyUI**: 默认地址 http://192.168.50.1:8288

## 开发路线图

- [x] 项目初始化
- [x] 基础页面（欢迎、配置、小说列表）
- [x] 后端 API 框架
- [ ] DeepSeek API 集成（文本解析）
- [ ] ComfyUI API 集成（生图/生视频）
- [ ] 任务队列系统
- [ ] 视频合成功能
- [ ] 角色库管理

## 环境变量

创建 `backend/.env` 文件：

```env
DEEPSEEK_API_KEY=your_api_key_here
DEEPSEEK_API_URL=https://api.deepseek.com
COMFYUI_HOST=http://192.168.50.1:8288
```

## License

MIT
