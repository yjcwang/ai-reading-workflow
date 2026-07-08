# Project Structure

![Architecture overview](architecture-overview.png)

```text
ai-reading-workflow/
+-- .env.example         # Docker Compose environment template
+-- .dockerignore        # Docker build exclusions
+-- docker-compose.yml   # Local full-stack Docker orchestration
+-- backend/
|   +-- Dockerfile        # FastAPI production container
|   +-- app/
|   |   +-- api/            # FastAPI routes
|   |   +-- db/             # DB setup and session management
|   |   +-- models/         # SQLModel tables
|   |   +-- observability/  # Langfuse client and LLM tracing helpers
|   |   +-- repositories/   # Data access layer
|   |   +-- services/       # LLM, analysis, explanation, PDF, persistence
|   |   +-- schemas.py      # Request / response contracts
|   |   +-- main.py         # FastAPI entry point
|   +-- evals/
|       +-- datasets/       # Analyze API evaluation datasets
|       +-- runners/        # Local evaluation runners
+-- frontend/
|   +-- Dockerfile        # Next.js production container
|   +-- app/               # Next.js App Router
|   +-- components/        # UI panels and modals
|   +-- hooks/             # Feature hooks
|   +-- lib/               # API client, i18n, helpers, types
+-- docs/
    +-- decision_log.md
    +-- reference/
        +-- api/
        +-- architecture/
        +-- evaluation/
```
