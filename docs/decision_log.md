## 2026-03-04: Architecture Decision - Prompt-based Mock Routing (Issue#4)

### Context
We needed a way to distinguish between different mock response formats (Analyzer, Explainer, etc.) without changing the core LLM caller signature `(prompt: str) -> str`.

### Decision
We will use metadata tags (e.g., `###FEATURE:ANALYZER###`) embedded at the beginning of the prompt string.

