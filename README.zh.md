# JP Reading Assistant

[English](README.md) | [简体中文](README.zh.md)

JP Reading Assistant 是一个面向日语阅读学习的全栈项目，目标不是做一个“调用翻译 API 的 Demo”，而是做出一个可持续使用的阅读辅助工具。用户既可以粘贴自己的日语文本，也可以直接生成符合 JLPT 难度的阅读材料；系统会进一步提取词汇和语法要点，支持对单词或句子做上下文相关解释，并将结果保存为可回看的学习记录。

当前项目已经形成完整的学习闭环：

`输入 / 生成文本 -> 分析词汇与语法 -> 解释词语 / 句子 -> 保存历史 -> 加载复习 -> 导出 PDF`

## 适合谁用

- 想把日语阅读、查词、整理笔记放到一个流程里的学习者
- 想按 JLPT 难度生成练习材料，而不是自己到处找文章的用户
- 想看一个从产品闭环、AI 接入到部署上线都相对完整的个人项目的读者

## 核心能力

- 输入日语原文并按 JLPT 等级分析重点词汇和语法
- 用 AI 按主题、长度、风格生成阅读材料，降低找素材成本
- 对选中的词语或句子进行上下文相关解释，而不是只做静态词典查询
- 手动增删分析结果，整理个人学习清单
- 将分析结果保存到本地数据库，支持列表浏览、详情加载和删除
- 将当前学习结果导出为 PDF，方便离线复习或归档
- 支持中英文输出切换、浅色/深色主题切换

## 项目亮点

- 完整产品闭环：覆盖从阅读材料准备到复习归档的全流程，而不是单点功能展示
- 上下文相关阅读辅助：`/analyze`、`/explain`、`/generate-text` 分别承担不同职责，句子解释会组合翻译与分析能力
- 多 LLM provider 抽象：统一接入 `gemini`、`openai`、`deepseek`、`ollama`、`mock`，并提供结构化输出、JSON 校验和自动重试
- 持久化历史系统：使用 `SQLite + SQLModel` 保存 `Result / Vocab / Grammar` 三层数据，支持保存、列表、详情和删除
- 可维护前端结构：主页面主要负责编排，分析、解释、导出、历史、主题和语言切换拆分到独立 feature hooks
- 交付与可用性：支持前后端分离部署、环境变量配置、CORS、health check、本地一键启动脚本

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

## 后端接口

后端基于 FastAPI，核心接口包括：

- `POST /api/analyze`：分析文章，输出词汇和语法
- `POST /api/explain`：解释单词或句子
- `POST /api/generate-text`：生成阅读材料
- `POST /api/export_pdf`：导出 PDF
- `POST /api/results`：保存当前结果到数据库
- `GET /api/results`：获取历史记录列表
- `GET /api/results/{result_id}`：获取历史详情
- `DELETE /api/results/{result_id}`：删除历史记录
- `GET /health`：健康检查

LLM 调用统一通过 `backend/app/services/llm.py` 处理，支持多 provider 切换、结构化输出和自动重试。

## 数据与持久化

项目使用本地 `SQLite` 持久化已保存的阅读结果，数据层基于 `SQLModel`。数据库文件位于 `backend/app/app.db`，FastAPI 启动时会自动执行建表逻辑。

当前保存结构分为三层：

- `Result`：原文、JLPT 等级、标题、创建时间
- `Vocab`：词汇条目
- `Grammar`：语法条目

后端按分层组织这部分逻辑：

- `backend/app/models/result_models.py`：表模型
- `backend/app/db/session.py`：数据库连接与 Session
- `backend/app/repositories/result_repository.py`：数据库读写
- `backend/app/services/result_service.py`：保存、列表、详情、删除流程

保存时标题由后端生成；如果标题生成失败，会回退到正文截断预览。

## 前端组织

前端基于 Next.js App Router + TypeScript，采用 feature hook 组织页面逻辑：

- `useAnalyzeFeature`
- `useExplainFeature`
- `useGenerateTextFeature`
- `useExportPdf`
- `useSavedResultsFeature`
- `useTheme`
- `useTargetLang`

这让 `page.tsx` 主要负责状态编排和组件组合，异步业务流分散到各自 hook 中，降低了页面耦合度，也更方便继续扩展功能。

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

使用项目根目录下的辅助脚本：

```powershell
.\start-dev.ps1
```

首次安装依赖：

```powershell
.\start-dev.ps1 -Install
```

跳过自动打开浏览器：

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

根据 `docs/decision_log.md`，项目已经完成这些关键演进：

- Prompt metadata routing，用于在统一 LLM 调用层中区分不同功能
- i18n 支持，包括 UI、Prompt 输出和 PDF 导出
- LLM 结构化输出、自动重试和多 provider 集成
- AI 阅读文本生成能力
- 前端 feature hooks 重构与输入面板拆分
- SQLite 持久化历史记录与历史面板保存流
- 保存标题改为后端生成
- 首次公网部署，完成前后端分离上线

## 相关文档

- [架构草稿](docs/architecture.md)
- [决策记录](docs/decision_log.md)
