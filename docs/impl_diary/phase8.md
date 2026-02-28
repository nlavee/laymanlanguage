# Implementation Diary - Phase 8: Deep Research & Polish

## Thought Process
- **UI Nomenclature**: Changing "Final Disclosures" to "Research Outcome" anchors the user's focus on the deliverable rather than legalistic phrasing.
- **Orchestrator Logs Persistence**: React's conditional rendering was unmounting the `LiveLogs` component during the phase transition, destroying the internal Server-Sent Events log array. Instead of a complex Re-fetch architecture, I lifted the DOM persistence by using a unified root layout and swapping CSS `hidden` vs `block` classes. This visually creates a new "Page" while keeping the SSE Queue alive in the DOM.
- **Pareto Tradeoffs Axis Fix**: Recharts requires explicit margin adjustments and label offsets when dealing with long axis text string boundaries; tweaked `bottom`, `left`, and `offset` props heavily.
- **Critical Research Rigor**: I drastically overhauled the System Prompts in `backend/prompts/` to enforce a Staff+ technical persona. The LLM is now explicitly instructed to identify implicit user constraints, extract extreme technical hurdles, and forcefully evaluate State of the Art (SOTA) edge models like Claude Opus 4.6 and GPT-5.2 over generic older models.
- **Documentation**: Wrote robust markdown README files for both micro-services reflecting the final stack state.
