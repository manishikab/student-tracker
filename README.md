# AI-Powered Student Life Dashboard

## What it is

AI-Powered Student Life Dashboard is a full-stack wellness and productivity tracker for students. It brings tasks, sleep, exercise, and wellness check-ins into one dashboard and calendar, with an optional AI coach for context-aware guidance.

Built as a personal full-stack project.

Visit the site at https://ai-student-coach-frontend.onrender.com/.

## Features

- Create, complete, and organize tasks
- Log sleep, exercise, and daily wellness entries
- Review activities in a calendar view
- View dashboard summaries across each category
- Ask an optional AI coach for guidance grounded in the dashboard context

## Architecture

- **Frontend:** React + Vite
- **Data API:** FastAPI + SQLAlchemy + SQLite
- **AI service:** Express + OpenAI API

## Prerequisites

- Python 3.10+
- Node.js 20 for the optional AI service

## Run locally

### 1. Start the FastAPI data service

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python init_db.py
uvicorn app.main:app --reload --port 8000
```

### 2. Start the AI service (optional)

```bash
cd app
npm install
cp .env.example .env
npm start
```

Set `OPENAI_API_KEY` in `app/.env` to enable chat. The rest of the dashboard works without it.

### 3. Start the frontend

In another terminal:

```bash
cd student-coach-frontend
npm install
cp .env.example .env.local
npm run dev
```

The frontend opens at `http://localhost:5173`. Its default local configuration connects to the FastAPI service at port 8000 and the optional AI service at port 3001.

## Notes

Local SQLite databases, environment files, and service-account credentials are intentionally excluded from Git. `python init_db.py` creates a fresh empty dashboard database after cloning.
