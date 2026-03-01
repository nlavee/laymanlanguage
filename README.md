<div align="center">

# layman.vuishere.com

**Enterprise-Grade AI Architectural Research & Strategy Platform**

[![Alpha](https://img.shields.io/badge/status-alpha-orange)](https://github.com/nlavee/laymanlanguage)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Next.js](https://img.shields.io/badge/frontend-Next.js%2015-black)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/backend-FastAPI-009688)](https://fastapi.tiangolo.com)

*Translating technical complexity into actionable enterprise strategy.*

</div>

---

## Overview

**layman.vuishere.com** is an AI-powered research orchestration platform that takes a high-level technical objective and autonomously expands it into a multi-domain research strategy. It performs deep-dive analysis across relevant technology domains and synthesizes the findings into a ranked, Pareto-optimal recommendation report — tailored to the user's technical background.

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
| 🎵 **Premium Presentation Export**| Automated boardroom-ready slide generation with integrated charting via Presenton SDK |

---

## Application Routes

| URL | Description |
|---|---|
| `/` | Main search interface — enter a research objective |
| `/profile` | Configure your technical persona & background depth |
| `/login` | Sign in to unlock full orchestration |
| `/signup` | Create an account |
| `/api/export` | Internal Next.js API route proxying slide generation requests to Presenton |

---

## Tech Stack

**Frontend** · Next.js 15 (App Router) · TanStack Query · Framer Motion · Recharts · Tailwind CSS

**Backend** · FastAPI · Python 3.12 · SQLite (`sqlite-utils`) · JWT (HS256)

**LLM Providers** · Anthropic (Claude 4.5 Haiku / Claude 4.6 Sonnet) · Google Gemini 3 Pro · OpenAI GPT-5

**Presentation Engine** · Presenton SDK (with QuickChart.io integration)

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
PRESENTON_API_KEY=sk-presenton-...
```

---

## Google Cloud Platform (GCP) Deployment Architecture

The platform is designed to be fully containerized and deployed on Google Cloud Platform, adhering to strict enterprise security standards. **Local `.env` files are strictly excluded from source control and are replaced by Google Secret Manager in production.**

### Architecture Overview
- **Frontend Compute**: Cloud Run (Serverless, Auto-scaling container).
- **Backend Compute**: Cloud Run or Google Kubernetes Engine (GKE) for orchestrator workloads.
- **Persistence**: GCS Fuse mapped to Cloud Run for SQLite database mounting, or Cloud SQL.
- **Secret Management**: Google Secret Manager for all LLM API Keys, JWT Secrets, and Presenton keys.

### 1. GCP Project Setup & Config
1. Initialize a new GCP project.
2. Enable necessary APIs: `Secret Manager API`, `Cloud Build API`, `Cloud Run Admin API`, `Artifact Registry API`.
3. Separate GCP projects or resource labeling are used for defining distinct `dev`, `staging`, and `prod` environment configurations.

### 2. Secret Manager Integration
- **Storage**: Secrets are securely created in Google Secret Manager (`JWT_SECRET`, `CLAUDE_API_KEY`, `GOOGLE_API_KEY`, `OPENAI_API_KEY`, `PRESENTON_API_KEY`) with explicit versioning.
- **Injection**: The application containers fetch these secrets at runtime. In Cloud Run, this is achieved natively by mapping Secret Manager paths directly to environment variables, requiring zero SDK code changes in the app layer.
- **Access Control (IAM)**: Specific Service Accounts attached to the Cloud Run instances are granted the `Secret Manager Secret Accessor` role, enforcing the principle of least privilege.
- **Rotation**: Automated secret rotation policies are orchestrated using Cloud Scheduler and Cloud Functions to cycle API keys periodically without downtime.

### 3. CI/CD Pipeline (Cloud Build)
A fully automated CI/CD pipeline ensures secure, consistent deployments:
1. **Trigger**: A Git push to `master` (or a designated staging branch) triggers Cloud Build.
2. **Test**: Cloud Build runs `vitest` unit tests and any content transformation verifications.
3. **Build**: Docker images are constructed for both `frontend/Dockerfile` and `backend/Dockerfile`.
4. **Registry**: Immutable container images are pushed to Google Artifact Registry.
5. **Deploy**: Cloud Build executes the deployment to Cloud Run/GKE, automatically linking the necessary IAM service accounts and Secret Manager references.

*See `docs/deployment_gcp.md` for the complete step-by-step CLI setup guide.*

---

## Project Structure

```
laymanlanguage/
├── backend/
│   ├── api/               # FastAPI route handlers
│   ├── core/              # Auth, logging utilities
│   ├── llm/               # LLM provider adapters
│   ├── orchestrator/      # Research orchestration agent
│   ├── storage/           # Database managers
│   └── main.py            # Application entry point
├── frontend/
│   ├── src/
│   │   ├── app/           # Next.js App Router pages
│   │   ├── api/           # API client and Next.js server endpoints
│   │   ├── components/    # React components
│   │   ├── lib/           # Content transformers and utility functions
│   │   └── providers/     # Auth and Query providers
│   └── public/            # Static assets
└── docs/                  # Technical documentation and deployment guides
```

---

## Author

Built with ❤️ by **[vuishere.com](https://www.vuishere.com)**

> For enterprise licensing, private deployment inquiries, or collaborations,  
> please reach out through the official website.

---

<div align="center">
  <sub>layman.vuishere.com — Making technical complexity accessible.</sub>
</div>