# JP Reading Assistant

An AI-powered Japanese reading assistant that transforms any Japanese text into
structured, learnable vocabulary and grammar units.

## Features (MVP)
- Analyze arbitrary Japanese text
- Extract key vocabulary worth learning (context-based)
- Extract grammar patterns with explanations and examples
- Structured JSON output for downstream usage

## Run
- open Anaconda shell
- conda activate jpread
- direct to /backend
- uvicorn app.main:app --reload --port 8000
- (open http://127.0.0.1:8000/docs)
- open terminal
- direct to /frontend
- npm run dev
- open http://localhost:3000
