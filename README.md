# JP Reading Assistant

JP Reading Assistant 是一个面向日语阅读学习的全栈项目。它支持输入或生成日语文章，调用 LLM 提取词汇和语法要点，进一步做单词或句子解释，并把整理后的结果保存到本地历史数据库中，方便后续回看和复习。

当前项目已经包含完整的“生成 -> 编辑 -> 分析 -> 保存 -> 历史加载 -> PDF 导出”闭环。

## 核心功能

- 输入日语原文，按 JLPT 等级分析重点词汇和语法
- 用 AI 按主题、长度、风格生成日语阅读材料
- 高亮单词或句子，触发更细粒度的解释
- 手动编辑分析结果，整理个人学习清单
- 导出当前结果为 PDF
- 支持中英文输出切换
- 支持浅色/深色主题切换
- 支持历史记录保存、列表浏览、详情加载和删除

## 项目结构

```text
jp-reading-assistant/
├─ backend/
│  ├─ app/
│  │  ├─ api/            # FastAPI 路由
│  │  ├─ db/             # SQLite / SQLModel 初始化
│  │  ├─ models/         # Result / Vocab / Grammar 表模型
│  │  ├─ repositories/   # 数据访问层
│  │  ├─ services/       # Analyzer / Explainer / ResultService / PDF 等
│  │  ├─ schemas.py      # 请求响应模型
│  │  └─ main.py         # FastAPI 入口
│  └─ .env.example
├─ frontend/
│  ├─ app/               # Next.js App Router
│  ├─ components/        # 页面组件与历史面板
│  ├─ hooks/             # Feature hooks
│  └─ lib/               # API、类型、i18n、纯函数工具
└─ docs/
   ├─ decision_log.md
   └─ architecture.md
```

## 后端能力概览

后端基于 FastAPI，主要接口包括：

- `POST /api/analyze`：分析文章，输出词汇和语法
- `POST /api/explain`：解释单词或句子
- `POST /api/generate-text`：生成阅读材料
- `POST /api/export_pdf`：导出 PDF
- `POST /api/results`：保存当前结果到数据库
- `GET /api/results`：获取历史记录列表
- `GET /api/results/{result_id}`：获取历史详情
- `DELETE /api/results/{result_id}`：删除历史记录
- `GET /health`：健康检查

LLM 调用统一通过 `backend/app/services/llm.py` 处理，已支持：

- `mock`
- `ollama`
- `openai`
- `gemini`
- `deepseek`

并带有结构化输出和自动重试能力。

## 数据与持久化概览

项目使用本地 `SQLite` 持久化已保存的阅读结果，数据层基于 `SQLModel`。数据库文件位于 `backend/app/app.db`，FastAPI 启动时会自动执行建表逻辑。

当前保存结构分为三层：

- `Result`：原文、JLPT 等级、标题、创建时间
- `Vocab`：词汇条目
- `Grammar`：语法条目

后端按分层组织这部分逻辑：

- `backend/app/models/result.py`：表模型
- `backend/app/db/session.py`：数据库连接与 Session
- `backend/app/repositories/result_repository.py`：数据库读写
- `backend/app/services/result_service.py`：保存、列表、详情、删除流程

保存时标题由后端生成；如果标题生成失败，会回退到正文截断预览。

## 前端能力概览

前端基于 Next.js App Router + TypeScript，主要采用 feature hook 组织页面逻辑：

- `useAnalyzeFeature`
- `useExplainFeature`
- `useGenerateTextFeature`
- `useExportPdf`
- `useSavedResultsFeature`
- `useTheme`
- `useTargetLang`

这让 `page.tsx` 主要负责状态编排和组件组合，异步业务流分散到各自 hook 中。

## 环境变量

### backend/.env

先复制：

```bash
cd backend
cp .env.example .env
```

当前后端配置项实际包括：

```env
LLM_PROVIDER_ANALYZER=gemini
LLM_PROVIDER_EXPLAINER=ollama
LLM_PROVIDER_TRANSLATOR=ollama
LLM_PROVIDER_TEXT_GENERATOR=ollama

OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o-mini

GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-3-flash-preview

DEEPSEEK_API_KEY=your_key_here
DEEPSEEK_MODEL=deepseek-chat

OLLAMA_MODEL=qwen2.5:7b
```

注意：

- `.env.example` 里目前没有把所有 provider 变量都列全，但代码里已经支持上面这些字段
- 如果使用 OpenAI / Gemini / DeepSeek，需要填对应 API Key

### frontend/.env

前端至少需要：

```env
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000
```

## 本地启动

### 1. 启动后端

```bash
cd backend
python -m venv .venv
```

Windows:

```bash
.\.venv\Scripts\Activate.ps1
```

macOS / Linux:

```bash
source .venv/bin/activate
```

安装依赖：

```bash
pip install -r ..\requirements.txt
```

或在 macOS / Linux:

```bash
pip install -r ../requirements.txt
```

启动服务：

```bash
uvicorn app.main:app --reload
```

启动时会自动初始化 SQLite 数据库和缺失表。

### 2. 启动前端

```bash
cd frontend
npm install
npm run dev
```

默认访问：

- 前端：`http://localhost:3000`
- 后端：`http://127.0.0.1:8000`

### Windows quick start

Use the helper scripts in the project root:
```powershell
.\start-dev.ps1
```
First-time setup:
```powershell
.\start-dev.ps1 -Install
```
Skip opening the browser:
```powershell
.\start-dev.ps1 -NoBrowser
```


## 技术栈

- Backend: FastAPI, Pydantic v2, SQLModel, Uvicorn, Tenacity
- Frontend: Next.js 16, React 19, TypeScript
- Database: SQLite
- LLM Providers: Ollama, OpenAI, Gemini, DeepSeek, Mock
- PDF: ReportLab 字体资源方案（Noto Sans JP / SC）

## 当前状态

根据 `docs/decision_log.md`，项目已完成这些关键演进：

- Prompt metadata routing
- i18n 支持
- PDF 导出增强
- LLM 结构化输出与自动重试
- DeepSeek 接入
- 前端 feature hooks 重构
- AI 阅读文本生成
- 输入面板拆分
- SQLite 持久化历史记录
- 前端历史面板与保存流
- 保存标题改为后端生成

## 相关文档

- [架构草稿](docs/architecture.md)
- [决策记录](docs/decision_log.md)
