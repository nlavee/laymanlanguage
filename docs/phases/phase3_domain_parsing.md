# Phase 3: Task Description and Domain Expansions

**Goal**: Interpret user queries into structured domains for orchestration. Allowing the user to explicitly define and refine these technical subdomains.

## 1. Backend API (Free-form ingestion and domain expansion)
- **Task Parsing Engine**: Take raw user input (e.g. "I want to build a local PDF RAG calculator app").
- Prompt LLM with context: (1) System prompt as AI Guide, (2) User Profile Markdown content, (3) The user's query.
- **Structured Output Constraints**: Enforce the LLM to return an array of `DomainExpansion` Pydantic schemas (containing `name`, `rationale`, and `search_queries`).
- **Workspace State Management**: Provide a persistent Workspace UUID, saving the state in an SQLite database (associating the UUID with the active user profile and current domains).

## 2. Frontend UI (Workspace & Subdomains)
- **Input Page**: A central text area optimized for free-form input. Clean transitions into the Workspace view upon hitting enter.
- **Workspace Canvas**: Displays extracted domains as modifiable tiles/cards.
- **User Modification API Hookup**: Allow user to hit `+` to add new domains, `-` to delete domains, or edit existing ones.

## 3. Verification criteria
- Entering a complex query consistently yields 2-5 distinct subdomains matching the intent.
- Adding a custom domain persists it in the backend's workspace state.
- Expanding domains is contextualized correctly based on the loaded user profile (e.g., enterprise profiles see security/RBAC domains added).
- The state is correctly preserved allowing the user to begin phase 4.
