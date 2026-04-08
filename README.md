

# JP Reading Assistant (日语阅读助手)

[](https://www.google.com/search?q=https://github.com/yjcwang/jp-reading-assistant)
[](https://www.python.org/)

**JP Reading Assistant** 是一款基于大语言模型（LLM）驱动的智能化日语学习工具。它能够深度解析日文长篇文本，自动提取核心词汇与关键语法，并提供高质量的释义与示例，旨在为学习者构建从阅读到习得的闭环体验。

-----

## ✨ 功能介绍 (Feature Overview)

JP Reading Assistant 面向真实的日语阅读学习场景，围绕“获取文章、锁定内容、AI 分析、手动整理、导出复习”构建完整流程，帮助用户把一篇日语文章快速转化为可操作的学习材料。

- **自由输入或生成文章**：用户可以直接粘贴自己的日语文章，也可以让 AI 按指定主题生成对应内容，作为阅读练习素材。
- **锁定当前文章并提取重点词汇与语法**：当文章确定后，用户可以将其锁定，AI 会分析已锁定文章，识别其中符合JLPT等级的单词和语法点，并生成结构化结果。
- **右侧列表支持自由编辑**：用户可以根据自己的学习目标，对右侧的词汇和语法列表自由增删改
- **支持高亮单个单词进行解释**：在阅读过程中，用户可以高亮某个单词，查看释义、用法或说明，并选择加入右侧列表。
- **支持高亮语法或单句进行分析**：用户也可以针对单个语法点或某一句内容发起解释请求，获取更细粒度的句子分析，再决定是否添加到学习列表。
- **支持 PDF 导出**：整理完成后的右侧学习列表可以导出为 PDF，方便离线复习、打印和归档。
- **支持中英双语与暗色模式**：整个应用支持中文与英文界面切换，并提供暗色模式，以适配不同用户习惯和使用环境。

-----

## 🏗️ 详细架构设计 (Detailed Architecture)

项目采用前后端分离的现代 Web 架构，核心设计原则为 **关注点分离 (SoC)** 与 **类型驱动开发**。

### 1\. 后端架构 (FastAPI)

后端位于 `backend/` 目录下，采用 Service 模式进行解耦：

  * **API 路由层 (`app/api/routes.py`)**: 负责处理 HTTP 请求、输入验证及响应分发。
  * **服务层 (`app/services/`)**:
      * **Analyzer**: 负责长文本分析，提取符合难度的单词与语法列表。
      * **Explainer**: 针对特定词汇或语法点生成深度解析。
      * **LLM Module**: 核心抽象层。支持 Ollama、Deepseek、OpenAI 和 Gemini，集成了 `tenacity` 自动重试机制，并强制要求 LLM 返回基于 Pydantic 的结构化 JSON 数据。
      * **PDF Exporter**: 集成 `NotoSansSC` 字体支持，生成支持多语言的离线学习笔记。

### 2\. 前端架构 (Next.js + TypeScript)

前端位于 `frontend/` 目录下，采用 **Feature Hooks** 模式：

  * **Feature Hooks (`hooks/`)**: 将复杂的异步业务逻辑（如分析流、解释流、PDF 导出）从 UI 组件中抽离。例如 `useAnalyzeFeature` 封装了状态转换与 API 调用逻辑。
  * **Pure Helpers (`lib/`)**: 包含 `item-helpers` 等纯函数，负责处理结果转换与数据格式化，确保 UI 组件仅负责渲染。
  * **i18n 引擎**: 支持 Session 级别的语言锁定，确保 UI 文字与 LLM 输出语言同步切换。

-----

## 🔄 数据流向 (Data Flow)

一个典型的请求从发起分析到生成结果的过程如下：

1.  **用户触发**: 用户在 `InputPanel` 输入日文文本并点击“分析”。
2.  **前端分发**: `useAnalyzeFeature` Hook 捕获输入，发送包含原始文本与 `targetLang`（目标语言）的 POST 请求至后端 `/api/analyze` 接口。
3.  **Prompt 路由**: 后端 `Analyzer` 服务接收请求，根据预定义的 System Prompt 和 Metadata Tags（如 `###FEATURE:ANALYZER###`）构造 LLM 调用参数。
4.  **LLM 处理**:
      * `llm.py` 调度配置好的 Provider（如 Deepseek）。
      * 通过 `response_model` 确保 LLM 返回的内容严格符合 `AnalyzeResponse` 模型。
      * 若发生超时或格式错误，`tenacity` 将自动触发指数退避重试。
5.  **结果转换**: 后端返回结构化 JSON。前端 `ResultPanel` 接收数据，通过 `item-helpers` 进行渲染处理，并实时更新 UI 状态。
6.  **持久化与扩展**: 用户可点击分析结果中的卡片。此时 `useExplainFeature` 将发起二次请求，调用 `Explainer` 服务获取更详细的语法上下文。

-----

## 🚀 快速运行指南

### 1\. 后端准备 (Python 3.10+)

```bash
cd backend
python -m venv .venv
# 激活环境: Windows 使用 .\.venv\Scripts\Activate.ps1 | macOS/Linux 使用 source .venv/bin/activate
pip install -r requirements.txt

# 配置文件
cp .env.example .env
# 编辑 .env 设置 LLM_PROVIDER_ANALYZER=deepseek 等
```

### 2\. 启动服务

**后端 (Default: 8000):**

```bash
uvicorn app.main:app --reload
```

**前端 (Default: 3000):**

```bash
cd frontend
npm install
npm run dev
```

-----

## 🛠️ 技术栈总结

  * **Backend**: FastAPI, Pydantic, Tenacity, Uvicorn.
  * **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, Lucide Icons.
  * **LLM**: Ollama (Qwen), Deepseek, Google Gemini, OpenAI.
