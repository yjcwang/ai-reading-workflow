# JP Reading Assistant

[English](README.md) | [简体中文](README.zh.md)

JP Reading Assistant is a full-stack project for Japanese reading practice. It is designed not as a simple translation API demo, but as a usable reading support tool with a complete study workflow. Users can either paste their own Japanese text or generate JLPT-aligned reading material, then analyze vocabulary and grammar, request context-aware explanations for words or sentences, and save the results for later review.

The project currently supports a full study loop:

`Input / Generate Text -> Analyze Vocabulary & Grammar -> Explain Word / Sentence -> Save History -> Reload for Review -> Export PDF`

## Who This Is For

- Learners who want reading, lookup, note-taking, and review in one workflow
- Users who want JLPT-level reading material without manually searching for articles
- Readers who want to inspect a personal project covering product workflow, AI integration, and deployment

## Core Capabilities

- Analyze pasted Japanese text and extract vocabulary and grammar aligned with JLPT levels
- Generate reading material by topic, length, and style with AI to reduce the cost of finding practice content
- Provide context-aware explanations for selected words or sentences instead of acting like a static dictionary
- Let users manually add or remove analyzed items to build their own study list
- Save analyzed results into a local database with list, detail, reload, and delete flows
- Export current study results as PDF for offline review or archiving
- Support bilingual output and light/dark theme switching

## Project Highlights

- Complete product loop: covers content preparation, analysis, explanation, review, and export instead of showcasing one isolated feature
- Context-aware reading assistance: `/analyze`, `/explain`, and `/generate-text` have separate responsibilities, and sentence explanation combines translation with analysis
- Multi-provider LLM abstraction: supports `gemini`, `openai`, `deepseek`, `ollama`, and `mock` behind one integration layer with structured output, JSON validation, and retry logic
- Persistent history system: stores `Result / Vocab / Grammar` data with `SQLite + SQLModel` and supports save, list, detail, and delete flows
- Maintainable frontend structure: the main page mainly orchestrates state while analysis, explanation, export, history, theme, and language switching are split into feature hooks
- Delivery and usability: includes separated frontend/backend deployment support, environment-based config, CORS, health check, and a local bootstrap script

## Project Structure

```text
jp-reading-assistant/
├─ backend/
│  ├─ app/
│  │  ├─ api/            # FastAPI routes
│  │  ├─ db/             # SQLite / SQLModel initialization
│  │  ├─ models/         # Result / Vocab / Grammar table models
│  │  ├─ repositories/   # Data access layer
│  │  ├─ services/       # Analyzer / Explainer / ResultService / PDF
│  │  ├─ schemas.py      # Request/response schemas
│  │  └─ main.py         # FastAPI entry point
│  └─ .env.example
├─ frontend/
│  ├─ app/               # Next.js App Router
│  ├─ components/        # Page components and history panel
│  ├─ hooks/             # Feature hooks
│  └─ lib/               # API, types, i18n, and helper utilities
└─ docs/
   ├─ decision_log.md
   └─ architecture.md
```

## Backend Endpoints

The backend is built with FastAPI. Core endpoints include:

- `POST /api/analyze`: analyze text and return vocabulary and grammar items
- `POST /api/explain`: explain a selected word or sentence
- `POST /api/generate-text`: generate reading material
- `POST /api/export_pdf`: export a PDF
- `POST /api/results`: save the current result into the database
- `GET /api/results`: fetch saved result summaries
- `GET /api/results/{result_id}`: fetch saved result details
- `DELETE /api/results/{result_id}`: delete a saved result
- `GET /health`: health check

LLM calls are centralized in `backend/app/services/llm.py`, with provider switching, structured output handling, and automatic retry support.

## Data and Persistence

The project uses local `SQLite` with `SQLModel` to persist saved reading results. The database file is stored at `backend/app/app.db`, and tables are initialized automatically when FastAPI starts.

The saved data is organized into three layers:

- `Result`: source text, JLPT level, title, created time
- `Vocab`: vocabulary items
- `Grammar`: grammar items

The backend keeps this flow layered:

- `backend/app/models/result_models.py`: table models
- `backend/app/db/session.py`: database connection and session management
- `backend/app/repositories/result_repository.py`: raw database reads and writes
- `backend/app/services/result_service.py`: save, list, detail, and delete workflows

Titles are generated on the backend during save; if generation fails, the service falls back to a truncated text preview.

## Frontend Organization

The frontend uses Next.js App Router + TypeScript and organizes page logic with feature hooks:

- `useAnalyzeFeature`
- `useExplainFeature`
- `useGenerateTextFeature`
- `useExportPdf`
- `useSavedResultsFeature`
- `useTheme`
- `useTargetLang`

This keeps `page.tsx` focused on orchestration and component composition while moving async business flows into dedicated hooks, which reduces coupling and makes future extension easier.

## Environment Variables

### backend/.env

Copy first:

```bash
cd backend
cp .env.example .env
```

Current backend settings include:

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

Notes:

- `.env.example` does not yet list every provider-related variable, but the code already supports them
- If you use OpenAI, Gemini, or DeepSeek, you need to provide the corresponding API key

### frontend/.env

Frontend requires at least:

```env
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000
```

## Local Development

### 1. Start the Backend

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

Install dependencies:

```bash
pip install -r ..\requirements.txt
```

Or on macOS / Linux:

```bash
pip install -r ../requirements.txt
```

Start the server:

```bash
uvicorn app.main:app --reload
```

The app will initialize the SQLite database and any missing tables on startup.

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Default URLs:

- Frontend: `http://localhost:3000`
- Backend: `http://127.0.0.1:8000`

### Windows Quick Start

Use the helper script in the project root:

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

## Tech Stack

- Backend: FastAPI, Pydantic v2, SQLModel, Uvicorn, Tenacity
- Frontend: Next.js 16, React 19, TypeScript
- Database: SQLite
- LLM Providers: Ollama, OpenAI, Gemini, DeepSeek, Mock
- PDF: ReportLab with Noto Sans JP / SC font assets

## Current Status

According to `docs/decision_log.md`, the project has already gone through these major iterations:

- Prompt metadata routing for distinguishing feature-specific behavior inside the shared LLM layer
- i18n support across UI, prompt output, and PDF export
- Structured LLM output, automatic retry, and multi-provider integration
- AI-generated reading text
- Frontend refactor into feature hooks and smaller input-related components
- SQLite-backed saved history and frontend save/load flows
- Backend-generated save titles
- First public deployment with separated frontend and backend hosting

## Related Docs

- [Architecture Notes](docs/architecture.md)
- [Decision Log](docs/decision_log.md)
