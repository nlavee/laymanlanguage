# Phase 1: Foundation and Core Infrastructure

**Goal**: Establish the base projects for the backend and frontend, integrating the core abstractions (LLMs, storage, and logging) that will power the application.

## 1. Project Initialization
- Initialize virtual environment (`venv`) and install core backend dependencies (FastAPI, uvicorn, google-genai, pytest, pydantic, sqlite3 wrapper).
- Initialize frontend application using `npx create-next-app@latest frontend --tailwind --ts --eslint --app`.
- Set up standard Tailwind configuration, prioritizing premium aesthetic guidelines (clean typography, subtle gradients, fluid spacing, shadcn/ui or similar dense data components).

## 2. Core Abstractions (Backend)
- **LLM Provider Interface**: Create `backend/llm/provider.py` with an abstract base class dictating methods like `generate_json`, `stream_response`, and `orchestrate_tools`.
- **Provider Implementations**:
  - Create `backend/llm/gemini.py` wrapping the `google-genai` library (handling the `gemini-3-pro-preview` model by default). Ensure API keys and parameters are cleanly managed by reading the existing `.env` file (do not modify it).
  - Create `backend/llm/openai_provider.py` wrapping the `openai` library (handling the `gpt-5.2-2025-12-11` model by default). Ensure API keys and parameters are cleanly managed by reading the existing `.env` file (do not modify it).
- **Data Persistence Strategy**:
  - Profiles: Setup `backend/storage/profile_manager.py` capable of reading/writing user profiles as Markdown files in a dedicated `brain/profiles` directory.
  - Knowledge Base: Setup `backend/storage/knowledgebase.py` interacting with a lightweight SQLite database (or JSON lines) for fast factual retrieval.
- **Logging/CoT Streaming**: Implement custom logger `backend/core/logger.py` that intercepts LLM Tool Calls and Chain of Thought. Structure these logs to be easily streamable via WebSockets or Server-Sent Events (SSE).

## 3. Verification criteria
- FastAPI server starts successfully and exposes a `/health` endpoint.
- Next.js dev server starts successfully.
- Unit tests verify that the Gemini wrapper can instantiate and return a mocked response.
- File system permissions allow creation of markdown profiles and the SQLite database.
