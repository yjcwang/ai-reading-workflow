# Development Setup

This document keeps the full local development setup outside the main README.

## Docker Quick Start

First-time Docker setup:

```bash
git clone https://github.com/yjcwang/ai-reading-workflow.git
cd ai-reading-workflow
cp .env.example .env
docker compose up --build
```

Open the app at `http://localhost:3000`. The backend is exposed at
`http://localhost:8000`.

After the first build, daily startup can use:

```bash
docker compose up
```

The root `.env` file is for Docker Compose only. The default values use `mock`
providers so the app can start without API keys. To use a real provider, edit
`.env`.

SQLite data is stored in the Docker volume `backend_data`.

## Backend

If you want to use the `jpread` conda environment:

```bash
conda activate jpread
cd backend
pip install -r ../requirements.txt
uvicorn app.main:app --reload
```

If you prefer the local virtual environment:

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
pip install -r ../requirements.txt
```

Create `backend/.env` from `backend/.env.example`, then start the server:

```bash
uvicorn app.main:app --reload
```

## Frontend

Create `frontend/.env` or `frontend/.env.local`:

```env
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000
```

Then run:

```bash
cd frontend
npm install
npm run dev
```

## Windows Quick Start

The repository includes a helper script that can bootstrap local development:

```powershell
.\start-dev.ps1
```

First-time dependency install:

```powershell
.\start-dev.ps1 -Install
```
