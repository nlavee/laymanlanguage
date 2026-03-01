<div align="center">

# layman.ai

**Enterprise-Grade AI Architectural Research & Strategy Platform**

[![Alpha](https://img.shields.io/badge/status-alpha-orange)](https://github.com/nlavee/laymanlanguage)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Next.js](https://img.shields.io/badge/frontend-Next.js%2015-black)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/backend-FastAPI-009688)](https://fastapi.tiangolo.com)

*Translating technical complexity into actionable enterprise strategy.*

</div>

---

## Overview

**layman.ai** is an AI-powered research orchestration platform that takes a high-level technical objective and autonomously expands it into a multi-domain research strategy. It performs deep-dive analysis across relevant technology domains and synthesizes the findings into a ranked, Pareto-optimal recommendation report — tailored to the user's technical background.

The platform is designed for **engineering leads, CTOs, and enterprise architects** who need fast, structured, and defensible technology decisions.

---

## How It Works

```
User Query → Domain Expansion → Parallel Research → Synthesis Report
```

1. **Ingest**: The user provides a high-level technical objective (e.g., *"Design a real-time ML inference platform at scale"*).
2. **Orchestrate**: Claude Haiku autonomously expands the query into 3–5 research domains and generates targeted sub-queries.
3. **Research**: Each domain is investigated in parallel by the AI research specialist, with real-time streaming logs.
4. **Synthesize**: Claude Sonnet (or Gemini 3 Pro / GPT-5) synthesizes all findings into a ranked model comparison, Pareto frontier visualization, and implementation timeline.

---

## Key Features

| Feature | Description |
|---|---|
| 🧠 **Multi-Model Orchestration** | Claude Haiku handles fast task planning; Claude Sonnet drives deep synthesis |
| 📊 **Pareto Analysis** | Trade-off visualization across capability, cost, and complexity |
| 📅 **Timeline Generation** | Historical context + forward-looking implementation roadmap |
| ⚡ **Real-time Streaming** | Server-Sent Events (SSE) for live orchestrator activity logs |
| 🔐 **Auth & Personalization** | JWT-secured accounts with configurable technical personas per user |
| 🎨 **Premium UI** | Glassmorphism, micro-animations, and dark-mode-first design |

---

## Application Routes

| URL | Description |
|---|---|
| `/` | Main search interface — enter a research objective |
| `/profile` | Configure your technical persona & background depth |
| `/login` | Sign in to unlock full orchestration |
| `/signup` | Create an account |

---

## Tech Stack

**Frontend** · Next.js 15 (App Router) · TanStack Query · Framer Motion · Recharts · Tailwind CSS

**Backend** · FastAPI · Python 3.12 · SQLite (`sqlite-utils`) · JWT (HS256)

**LLM Providers** · Anthropic (Claude 4.5 Haiku / Claude 4.6 Sonnet) · Google Gemini 3 Pro · OpenAI GPT-5

---

## Local Development

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cd ..
PYTHONPATH=. python backend/main.py
# API running at http://localhost:8000
# Interactive API docs at http://localhost:8000/docs
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# App running at http://localhost:3000
```

### Environment Variables
Create a `.env` file at the root:
```env
JWT_SECRET=your-secret-here
CLAUDE_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...
OPENAI_API_KEY=sk-...
```

---

## Deployment

The project is containerized and optimized for **Google Cloud Platform**:

- **Compute**: Cloud Run (serverless, auto-scaling)
- **Persistence**: GCS Fuse for SQLite database mounting
- **Secrets**: Google Secret Manager for all API keys and JWT secrets

See `docs/deployment_gcp.md` for the complete step-by-step guide.

---

## Project Structure

```
laymanlanguage/
├── backend/
│   ├── api/               # FastAPI route handlers
│   ├── core/              # Auth, logging utilities
│   ├── llm/               # LLM provider adapters (Anthropic, Gemini, OpenAI)
│   ├── orchestrator/      # Research orchestration agent
│   ├── storage/           # Workspace, profile, user managers (SQLite)
│   └── main.py            # Application entry point
├── frontend/
│   ├── src/
│   │   ├── app/           # Next.js App Router pages
│   │   ├── api/           # API client and type definitions
│   │   ├── components/    # UI components (Task, Synthesis, Profile, Orchestration)
│   │   └── providers/     # Auth and Query providers
│   └── public/            # Static assets (favicon, logo)
└── docs/                  # Technical documentation (gitignored deployment configs)
```

---

## Author

Built with ❤️ by **[vuishere.com](https://www.vuishere.com)**

> For enterprise licensing, private deployment inquiries, or collaborations,  
> please reach out through the official website.

---

<div align="center">
  <sub>layman.ai — Making technical complexity accessible.</sub>
</div>
