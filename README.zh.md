# AI-Powered Japanese Reading Workflow

面向日语阅读学习的 AI 工作流应用，把真实日语文本转化为结构化学习材料。

[English](README.md) | [简体中文](README.zh.md)

AI-Powered Japanese Reading Workflow 是一个围绕真实阅读流程构建的全栈 Web 应用：输入或生成日语文本，分析其中的词汇和语法，针对难点做上下文解释，整理学习列表，并保存阅读记录供后续复习。

## 项目亮点

- 词汇、语法、翻译、标题生成等任务都通过结构化输出管线完成
- 分析、解释、翻译、文本生成、PDF 导出、历史记录持久化职责清晰
- 具备真实产品体验：结果可编辑、历史记录可回载、语言切换、深色模式、加载与错误状态
- 后端通过统一抽象层支持多个 LLM provider

## Demo

- [Demo 视频链接](https://youtu.be/NV0gn7CtJrc)

<p align="center">
  <img src="./docs/assets/ai-generator.png" alt="Main Interface and AI Text Generator" width="880"/>
  <br/>
  <em>主界面和 AI 文本生成</em>
</p>
<p align="center">
  <img src="./docs/assets/analysis-result.png" alt="Analysis Results" width="880"/>
  <br/>
  <em>分析结果</em>
</p>
<p align="center">
  <img src="./docs/assets/explain-modal.png" alt="Context Explain Modal" width="880"/>
  <br/>
  <em>上下文解释面板</em>
</p>
<p align="center">
  <img src="./docs/assets/save-history.png" alt="History" width="880"/>
  <br/>
  <em>历史记录保存</em>
</p>

## 核心功能

- 输入日语文本，并按所选 JLPT 等级分析词汇和语法
- 按主题、等级、长度、风格生成日语阅读材料
- 对选中文本做上下文解释
- 短词解释和整句解释使用不同流程
- 支持把解释结果加入学习列表，或手动删除分析项
- 将分析结果保存到本地 SQLite 数据库
- 在历史面板中浏览、刷新、回载、删除已保存记录
- 将当前学习列表导出为 PDF
- 在英文和中文之间切换解释/输出语言
- 支持浅色和深色模式

## 工作流程

1. 手动输入日语文本，或通过 AI 生成阅读材料。
2. 锁定当前文本并发送到分析管线。
3. 后端返回结构化的词汇和语法列表。
4. 选中单词或句子，请求上下文解释。
5. 句子解释会组合翻译和分析两个步骤。
6. 在前端编辑最终学习列表。
7. 将结果保存到 SQLite，或导出为 PDF。

## 技术栈

- Frontend: Next.js 16, React 19, TypeScript
- Backend: Python FastAPI, Pydantic v2, SQLModel, Uvicorn
- Database: SQLite
- LLM integration: Ollama, OpenAI, Gemini, DeepSeek, Mock provider
- Reliability: 基于 Tenacity 的 LLM 自动重试
- PDF export: ReportLab + Noto Sans JP / SC 字体

## 技术实现重点

### 结构化 LLM 输出

- 后端服务要求 LLM 返回 JSON 结构，并使用 Pydantic 模型校验
- `backend/app/services/llm.py` 统一处理 JSON 提取、结构校验和重试逻辑
- Provider 切换通过策略映射完成，避免业务模块里散落大量分支逻辑

### LLM Observability and Evaluation

- Langfuse 记录每次 provider 调用的 service、provider、model、prompt/output preview、duration、估算 token usage、success/failure metadata
- 轻量 analyze evaluation runner 使用自定义 N2 语法/词汇 benchmark dataset，对 Gemini、DeepSeek、Ollama 等模型比较 precision、recall、F1 和 latency，报告保存在 `backend/evals/reports`

### 模块化前后端设计

- `frontend/app/page.tsx` 主要负责页面编排和 feature 组合
- 主要异步流程拆分为 `useAnalyzeFeature`、`useExplainFeature`、`useGenerateTextFeature`、`useExportPdf`、`useSavedResultsFeature`
- 后端按 API routes、services、repositories、models、schemas 分层组织

### 持久化、历史记录与导出

- 阅读记录保存在 SQLite 中，使用 `Result`、`Vocab`、`Grammar` 等表结构
- 历史面板支持文章、词汇、语法三个视图
- 保存标题由后端生成；标题生成失败时会回退到文本预览标题
- 当前结果可以导出为 PDF，方便离线复习

## 项目结构

```text
ai-reading-workflow/
|-- backend/
|   |-- app/
|   |   |-- api/            # FastAPI routes
|   |   |-- db/             # 数据库初始化和 session 管理
|   |   |-- models/         # SQLModel 表模型
|   |   |-- observability/  # Langfuse client 和 LLM tracing helpers
|   |   |-- repositories/   # 数据访问层
|   |   |-- services/       # LLM、分析、解释、PDF、持久化
|   |   |-- schemas.py      # 请求/响应契约
|   |   `-- main.py         # FastAPI 入口
|   `-- evals/
|       |-- datasets/       # Analyze API evaluation datasets
|       |-- reports/        # 本地 evaluation 报告
|       `-- runners/        # 本地 evaluation runner
|-- frontend/
|   |-- app/                # Next.js App Router
|   |-- components/         # UI 面板和弹窗
|   |-- hooks/              # Feature hooks
|   `-- lib/                # API client、i18n、helpers、types
`-- docs/
    |-- architecture.md
    `-- decision_log.md
```

## API 概览

- `POST /api/analyze`
- `POST /api/explain`
- `POST /api/generate-text`
- `POST /api/export_pdf`
- `POST /api/history/articles`
- `GET /api/history/articles`
- `GET /api/history/articles/search`
- `GET /api/history/articles/{article_id}`
- `DELETE /api/history/articles/{article_id}`
- `GET /api/history/vocab`
- `GET /api/history/vocab/search`
- `GET /api/history/grammar`
- `GET /api/history/grammar/search`
- `GET /health`

## 本地运行

### Docker 快速启动

第一次使用 Docker：

```bash
git clone https://github.com/yjcwang/ai-reading-workflow.git
cd ai-reading-workflow
cp .env.example .env
docker compose up --build
```

打开 `http://localhost:3000` 访问前端。后端会暴露在 `http://localhost:8000`

第一次构建完成后，日常启动可以直接运行：

```bash
docker compose up
```

根目录 `.env` 只给 Docker Compose 使用。默认配置会将所有 LLM provider 设置为 `mock`，因此没有 API key 也可以启动应用。如果要使用真实 provider，编辑 `.env`

SQLite 数据会保存在 Docker volume `backend_data` 中。

### Backend

如果使用 `jpread` conda 环境：

```bash
conda activate jpread
cd backend
pip install -r ../requirements.txt
uvicorn app.main:app --reload
```

如果使用本地虚拟环境：

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
pip install -r ../requirements.txt
```

从 `backend/.env.example` 创建 `backend/.env`，然后启动服务：

```bash
uvicorn app.main:app --reload
```

### Frontend

创建 `frontend/.env` 或 `frontend/.env.local`：

```env
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000
```

然后运行：

```bash
cd frontend
npm install
npm run dev
```

### Windows 快速启动

项目根目录提供了本地启动脚本：

```powershell
.\start-dev.ps1
```

首次安装依赖：

```powershell
.\start-dev.ps1 -Install
```

## 环境配置说明

当前后端支持分别配置以下 provider：

- analyzer
- explainer
- translator
- text generator

已支持的 provider：

- `ollama`
- `openai`
- `gemini`
- `deepseek`
- `mock`

## 后续改进方向

- 完善 provider 配置说明，补全文档中的环境变量说明
- 增强历史记录能力，例如搜索、筛选、标签、去重
- 将本地 evaluation 结果同步到 Langfuse 或其他实验追踪系统

## 工程挑战与经验总结

- 将 JSON 提取、schema 校验、重试逻辑下沉到统一 LLM 层后，整体稳定性比在各个 service 中重复处理更高
- 将前端页面逻辑拆分为 feature hooks 后，职责边界更清晰，后续扩展成本更低
- 句子解释采用“翻译 + 分析”的组合流程，比让一个超大 prompt 同时完成所有任务更容易维护
- 明确标题生成、持久化、解释、分析等职责边界后，接口和模块设计更稳定

## 补充说明

- 当前历史记录保存在本地 SQLite 中
- 项目包含健康检查接口和基于环境变量的 CORS 配置，方便部署
- 相关记录见 [docs/decision_log.md](docs/decision_log.md)
