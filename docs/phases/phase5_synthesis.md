# Phase 5: Synthesis and Final UI Visualization

**Goal**: Unify the findings from the Orchestrator into compelling visual stories, timelines, and empirical comparisons that map directly to the User's persona.

## 1. Backend API (Synthesizer)
- **Results Aggregation API**: Fetch the completed investigation from the SQLite Knowledgebase (using UUID joins).
- **Synthesizer Engine**: Prompt the final output using **Structured Options (Pydantic schema)** to guarantee predictable frontend parsing:
  - `TimelineEvent[]`: Extract a dynamic timeline of improvements matching the subdomain.
  - `ModelRank[]`: Stack rank recommended LLMs specific to the user's requirement.
  - `ParetoDataPoint[]`: Calculate Capability vs Cost for visual mapping.
- **"What If" Endpoints**: Generate a fast response if a user asks "What if I swapped Model A for Model B".

## 2. Frontend Components (Storytelling UI)
- **Data Management**: Utilize `@tanstack/react-query` to fetch, cache, and manage loading states of the synthesis data robustly.
- **Timeline Component**: An interactive scrollable timeline showing event granularity matching the domain. Clicking an event expands details.
- **Stack Ranked Recommendation View**: Display models visually using Shadcn UI cards, clearly indicating rationale tied directly back to the timeline and knowledgebase link.
- **Pareto Frontier Chart**: A scatter plot using **Recharts** plotting `Cost` vs `Capabilities (based on one-shot capability)`. Make sure tooltips map to the `ModelRank` data.
- **"What If" Simulator**: Free-form chat embedded next to the recommendations to ask follow up comparisons.

## 3. Verification criteria
- Timeline properly responds to zoom/scroll gestures and maps events to actual AI developments.
- The Pareto chart renders correctly, providing clear visual distinctions between models.
- "What if" prompts execute successfully, fetching localized comparisons based on existing knowledge.
