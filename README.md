# AI-Powered Japanese Reading Workflow

Full-stack AI application for transforming Japanese text into structured learning material using LLM-powered analysis pipelines.

Built with FastAPI, Next.js, Docker, and multi-provider LLM integration.

## Tech Stack

* Frontend: Next.js, React, TypeScript
* Backend: FastAPI, Pydantic, SQLModel
* LLM APIs: Gemini, DeepSeek, Ollama
* Infrastructure: Docker Compose, Langfuse
* Evaluation: Custom dataset & LLM benchmarking
* Database: SQLite

## Demo
- [Demo Website (recommended)](https://ai-reading-workflow.vercel.app/)
- [Demo Video Link Here (old version)](https://youtu.be/NV0gn7CtJrc)

<p align="center">
  <img src="./docs/screenshot/ai-generator.png" alt="Main Interface and AI Text Generator" width="880"/>
  <br/>
  <em>Main Interface and AI Text Generator</em>
</p>
<p align="center">
  <img src="./docs/screenshot/analysis-result.png" alt="Analysis Results" width="880"/>
  <br/>
  <em>Analysis Results</em>
</p>

More screenshots: [`docs/screenshot/screenshots.md`](docs/screenshot/screenshots.md)

## Features

* Analyze Japanese text into vocabulary and grammar lists for a selected JLPT level
* Generate Japanese reading passages by topic, level, length, and style
* Chat with AI about the current article, selected text, vocabulary, or grammar, and turn useful explanations into study cards
* Edit, save, reload, search, and delete reading history
* Export study results as PDF
* Switch output language between English and Chinese
* Use light and dark mode

## Project Structure

<p align="center">
  <img src="./docs/reference/architecture/architecture-overview.png" alt="Architecture Overview" width="880"/>
  <br/>
  <em>Architecture Overview</em>
</p>

See [`docs/reference/architecture/project-structure.md`](docs/reference/architecture/project-structure.md)
for the repository structure.

## Technical Highlights

* FastAPI and Next.js full-stack architecture with clear service boundaries
* Structured LLM output pipeline with Pydantic validation and retry handling
* Multi-provider LLM support for Gemini, DeepSeek, and Ollama
* Langfuse tracing for provider calls, latency, previews, token estimates, and failures
* SQLite persistence for reading sessions, vocabulary, and grammar history
* Docker Compose setup for reproducible local deployment
* API summary: [`docs/reference/api/index.md`](docs/reference/api/index.md)

## Evaluation

The project includes a lightweight evaluation workflow for the analyze pipeline combining with Langfuse.

Evaluation pipeline and result: [`docs\reference\evaluation\evaluation-pipeline-table.png`](docs\reference\evaluation\evaluation-pipeline-table.png)

## Quick Start

```bash
git clone https://github.com/yjcwang/ai-reading-workflow.git
cd ai-reading-workflow
cp .env.example .env
docker compose up --build
```

More setup: [`docs/reference/developement.md`](docs/reference/developement.md)

[English](README.md) | [简体中文](README.zh.md)
