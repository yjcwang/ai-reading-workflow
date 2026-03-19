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
While changing into the new qwen3.5 model, call_ollama() always lead to timeout. Additionally, it's observed that the previous LLM integration used a single prompt parameter and relied on prompt engineering to enforce JSON output.

### Decision
- Change api/generate into api/chat in call_ollama()
- Refactor call_llm_json interface, Replace single prompt argument with structured parameters:
system_prompt, user_prompt, response_model

## 2026-03-19 Automated Retry and Robust LLM Integration  (Issue #9)

### Context
Previous LLM integartion lacks error handling and retry mechanism. Furthermore, there is a tight coupling between the service layer and raw LLM responses, requiring manual JSON extraction and validation in every business logic function
### Decision
- Integrate tenacity library in llm.py for automated retry 
- Refactor call_llm_json, error handling moved to lowest layer, service layer don't handle extract_json and pythantic validation anymore, it get safe response model directly
- Add dictionary for LLM providers, discard if-case distinctions




