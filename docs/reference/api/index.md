# API Reference

This page lists the backend interfaces exposed by `backend/app/api/routes.py`
and `backend/app/main.py`.

Base URL in local development:

- Backend: `http://127.0.0.1:8000`
- API prefix: `/api`

## Backend Interfaces

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/analyze` | Analyze Japanese text into vocabulary and grammar items. |
| `POST` | `/api/explain` | Explain a selected word or sentence in context. |
| `POST` | `/api/generate-text` | Generate a Japanese reading passage. |
| `POST` | `/api/export_pdf` | Export the current text and analysis result as a PDF file. |
| `POST` | `/api/history/articles` | Save an analyzed reading session. |
| `GET` | `/api/history/articles` | List saved reading sessions. |
| `GET` | `/api/history/articles/search` | Search saved reading sessions. |
| `GET` | `/api/history/articles/{article_id}` | Load one saved reading session. |
| `DELETE` | `/api/history/articles/{article_id}` | Delete one saved reading session. |
| `GET` | `/api/history/vocab` | List saved vocabulary history items. |
| `GET` | `/api/history/vocab/search` | Search saved vocabulary history items. |
| `GET` | `/api/history/grammar` | List saved grammar history items. |
| `GET` | `/api/history/grammar/search` | Search saved grammar history items. |
| `GET` | `/health` | Check backend health. |
