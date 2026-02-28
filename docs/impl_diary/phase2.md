# Implementation Diary - Phase 2

## Thought Process
- **Pydantic Schemas:** Enforcing strictly typed output via Pydantic (`ProfileQuestionnaireResponse` and `ProfileSynthesisResponse`) ensures that the frontend doesn't break when parsing LLM outputs. Gemini's `response_schema` directly consumes this.
- **Markdown Persistence:** I implemented `ProfileManager` to save files with YAML Frontmatter. This keeps it highly readable for humans while allowing the system to rapidly query the structured `traits` without needing an LLM to parse the summary.
- **Frontend Architecture:** Utilized `@tanstack/react-query` to neatly abstract the loading/error states of the LLM generation. Framer Motion is used for the onboarding cards to deliver the requested "premium" feel. The layout swaps seamlessly to the Dashboard based on profile existence.
