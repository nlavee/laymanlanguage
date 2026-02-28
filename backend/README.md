# Layman Lang Disclosed - Backend Service

This directory contains the Python FastAPI backend responsible for orchestrating LLM logic, managing the FTS5 Knowledgebase, and streaming live CoT reasoning to the frontend.

## 🏗️ Architecture Stack
1. **Web Framework**: FastAPI & Uvicorn (Asynchronous API endpoints)
2. **LLM Abstraction**: Strict `Provider` Base Class. Currently supports Google Gemini (`gemini-3-pro-preview`) and OpenAI (`gpt-5.2-2025-12-11`).
3. **Event Streaming**: `asyncio.Queue` combined with FastAPI's `StreamingResponse` to push Server-Sent Events (SSE) live to the Next.js React client.
4. **Data Schemas**: Handled strictly via Pydantic (`models/`) enforcing output parsing on all LLM JSON generation.
5. **Persistence/Storage**:
    *   **User Profiles**: Markdown files with explicit YAML Frontmatter stored locally.
    *   **Knowledgebase/Workspaces**: SQLite Database utilizing `sqlite-utils` and compiled FTS5 extensions for high-density semantic matching.

## 🗂️ Directory Structure
- `api/`: FastAPI route definitions (`profile.py`, `workspace.py`, `orchestrator.py`, `synthesis.py`).
- `core/`: Config loaders and the custom `StreamLogger` class.
- `llm/`: Provider interfaces binding directly to external Frontier LLM APIs.
- `models/`: High-level Pydantic data schemas defining the contract between LLM JSON strings and Python objects.
- `orchestrator/`: The core Agent loop wrapping LLM sub-tool calls in `Tenacity` retry logic.
- `prompts/`: Version-controlled Staff-level Markdown files dictating explicit system constraints to the LLMs.
- `storage/`: Database interaction layers controlling Profile IO and SQLite querying.

## 🚀 Running Locally
1. Ensure the root `.env` file is populated with `GEMINI_API_KEY` and `OPENAI_API_KEY`.
2. Activate the python Virtual Environment:
   ```bash
   source ../venv/bin/activate
   ```
3. Run the Uvicorn ASGI server:
   ```bash
   PYTHONPATH=. uvicorn backend.main:app --reload --port 8000
   ```
4. Verify Health Status: `http://localhost:8000/health`
