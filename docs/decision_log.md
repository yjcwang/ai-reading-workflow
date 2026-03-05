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




