## 2026-03-04: Architecture Decision - Prompt-based Mock Routing (Issue#4)

### Context
We needed a way to distinguish between different mock response formats (Analyzer, Explainer, etc.) without changing the core LLM caller signature `(prompt: str) -> str`.

### Decision
We will use metadata tags (e.g., `###FEATURE:ANALYZER###`) embedded at the beginning of the prompt string.

## 2026-03-05 i18n Support (Issue #6)

### Centext
We need to add a Session-Level Language Lock, to switch language for both UI and llm output

### Decision
- Insert language into prompt of service modules (backend\app\services)
- Introduce new type TargetLang in frontend/lib/types.ts
- Add new file frontend/lib/i18n.ts as a dictionary for UI text, allow future extension of more languages
- Add switch language button in inputPanel.tsx, which open a confirmation modal to let user know session will be refreshed after switching, this is a session-level lock 

## 2026-03-08 PDF Exporter Enhancement and i18n Support (Issue #10)

### Context
After adding Chinese, PDF exporter doesnot support specific Chinese character, so enhancement with i18n support in PDFExporter necessary

### Decision
- Add new NotoSansSC
- Parse New targetLang parameter for PDF exporter 
- Adapative title in PDF with i18n dictionary

## 2026-03-12 LLM Service Refactor and Structured Output Support (Issue #12)

### Context
While changing into the new qwen3.5 model, `call_ollama()` always lead to timeout. Additionally, it's observed that the previous LLM integration used a single prompt parameter and relied on prompt engineering to enforce JSON output.

### Decision
- Change api/generate into api/chat in `call_ollama()`
- Refactor `call_llm_json` interface, Replace single prompt argument with structured parameters:
system_prompt, user_prompt, response_model

## 2026-03-19 Automated Retry and Robust LLM Integration  (Issue #9)

### Context
Previous LLM integartion lacks error handling and retry mechanism. Furthermore, there is a tight coupling between the service layer and raw LLM responses, requiring manual JSON extraction and validation in every business logic function
### Decision
- Integrate tenacity library in llm.py for automated retry 
- Refactor `call_llm_json`, error handling moved to lowest layer, service layer don't handle `extract_json` and pythantic validation anymore, it get safe response model directly
- Add dictionary for LLM providers, discard if-case distinctions

## 2026-03-21 Add Deepseek API  (Issue #14)

### Context
Previous local llm (ollama qwen) responses with slow speed and depends strictly on hardware, it can be a demo but not practical for common use
### Decision
- Add `_call_deepseek` in llm, and update accordingly dictionary, config.py and .env

## 2026-03-21 Refactor Page Logic into Feature Hooks and Pure Helpers (Issue #11)

### Context
The main page (page.tsx) component had grown too large and was mixing multiple responsibilities, including UI state, persistence, async actions, and result transformation logic. This made the file harder to read, test, and extend safely.

### Decision
- Extract theme state and persistence into `useTheme`
- Extract target language persistence into `useTargetLang`
- Extract analyze flow into `useAnalyzeFeature`
- Extract explain flow into `useExplainFeature`
- Extract PDF export flow into `useExportPdf`
- Move pure result transformation logic into `result-helpers`
- Keep `page.tsx` focused on feature orchestration and component composition

## 2026-03-25 Add AI Text Generator Feature in Frontend (Issue #15)

### Context
The application required users to manually find and paste Japanese text before analysis. 

### Decision
- Introduce AI text generation as a new feature 
#### Frontend
- Add generator UI inside `InputPanel` via a modal-based interaction
- Move generation logic into `useGenerateTextFeature` for consistency with existing feature hooks
- Store generation parameters (`topic`, `length`, `style`) in page-level state, add input validation of topic field
- Use page-level orchestration (`handleGenerateRequest`) to connect UI and feature logic
- Reuse existing `text` as the single source of truth for analysis input
- Align generation level with global `level` instead of duplicating it in generator state
#### Backend
- Add new endpoint: POST /api/generate-text
- Introduce `GenerateTextRequest` (which include `level` inside, different as in frontend) and `GenerateTextResponse` schemas using Pydantic
- Implement `text_generator` service following existing analyzer pattern

## 2026-03-27 Refactor InputPanel into smaller Components (Issue #17)

### Context
`InputPanel` had grown too large and was handling too much UI structure directly, including modal markup and styling css. This made the component harder to read and maintain safely on the frontend.

### Decision
- Keep `InputPanel` as the owner of state and business decisions and existing handlers
- Extract `LanguageConfirmModal` and `TextGeneratorModal` from `InputPanel` as separate component
- Move `InputPanel` styles into `InputPanel.module.css` 

## 2026-04-11 Add Persistent Result Storage with SQLModel Layers (Issue #18)

### Context
The app needed a persistent way to save analyzed reading results and retrieve them later. The previous flow only handled in-memory request and response data, without a database-backed structure for saved results, vocab items, and grammar items.

### Decision
- Add SQLite persistence with SQLModel under `backend/app/db`
- Introduce table models `Result`, `Vocab`, and `Grammar` under `backend/app/models`
- Introduce `ResultRepository` to isolate raw database read/write operations
- Introduce `ResultService` to coordinate save, list, detail, and delete flows
- Add request and response schemas for saved results in `backend/app/schemas.py`
- Add REST endpoints for saved results in `backend/app/api/routes.py`

## 2026-04-13 Add Frontend Saved History Flow (Issue #19)

### Context
After adding persistent storage, frontend needed a way to browse, load, refresh, and delete saved reading results from database.

### Decision
- Add saved history panel UI for listing database-backed results
- Add frontend API and feature-hook flow for save, list, detail, and delete actions
- Keep `page.tsx` as orchestration layer for history open, load, and delete handlers
- Support i18n

## 2026-04-13 Refine Saved Result Title Ownership and Backend Title Generation

### Context
After adding database-backed saved results, title ownership became unclear. The frontend always sent `title: null` when saving, while `/generate-text` also returned a `title` that was never used.

### Decision
- Move saved-result title generation fully to backend `ResultService`
- Add dedicated `title_generator` service for database save flow
- Remove `title` from `SaveResultRequest` and `GenerateTextResponse` in both frontend and backend schemas
- Keep `title` in saved-result response models because history UI still depends on it
- Keep fallback preview title in `ResultService` if LLM title generation fails





