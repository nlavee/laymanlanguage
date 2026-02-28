# Phase 4: Orchestration, Subtasks, and Knowledgebase Integration

**Goal**: Let an overarching LLM manage specific sub-tasks per domain, querying external sources (Reddit, benchmarks, etc.), verifying facts, and streaming its reasoning back to the user.

## 1. Backend Core (The Orchestrator)
- **Orchestration Loop API**: Implement a robust **Server-Sent Events (SSE)** endpoint using FastAPI `StreamingResponse`. Wait on an `asyncio.Queue` populated by the Orchestrator loop.
- **Agent Separation**: Decouple the `Planner Agent` (determines what needs searching based on domains) from the `Worker Agents` (execute web searches and extract facts).
- **Log Streaming Interface**: `backend/core/logger.py` will publish structured JSON logs (Event Types: `THOUGHT`, `TOOL_CALL`, `TOOL_RESULT`) to the SSE queue to guarantee the UI reflects the exact brain state.

## 2. Sub-Task execution and Discovery
- **Knowledgebase (FTS5)**: Implement SQLite with the `FTS5` virtual table extension. This allows extremely fast full-text semantic search over scraped pages and Reddit threads. Store origin URLs to maintain strict citations.
- **Search & Scrape Tools**: Implement a tool utilizing DuckDuckGo/Tavily for search, integrated with beautifulsoup for extracting page content. 
- Implement a **Retry/Backoff mechanism** using `Tenacity` to prevent API rate limit failures in the sub-agents and a disk-based cache (using `diskcache`) to prevent re-searching the same canonical query twice.
- Link all assertions to the Knowledgebase layer for factual verification.

## 3. Frontend Visualization (The "Brain in Action")
- **Live Logs UI**: A non-intrusive sidebar or bottom drawer that updates live as the Orchestrator coordinates tasks. Allows transparency into the AI's "brain" as requested.
- Progress bars indicating completion of discovery across all domains.

## 4. Verification criteria
- Starting Orchestration accurately spins up logs visible in the UI in real-time.
- The Orchestrator correctly synthesizes discoveries from sub-tasks and populates them into the knowledgebase layer for rendering later.
- Proper error handling ensures one failed sub-task doesn't crash the entire orchestration loop.
