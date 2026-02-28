# Phase 2: User Profile Selection & Persistence

**Goal**: Create dynamic, tailored onboarding experiences that define user technical capabilities and save them persistently to drive future interactions.

## 1. Backend API (Profile Management)
- **Profile Generation Schema**: Define strictly typed `Pydantic` models for the API. Use LLM Structured Outputs (JSON mode) to ensure the LLM returns multiple-choice questions matching a strictly defined format.
- Create `/api/profile/questions` endpoint: Uses Gemini/GPT to generate multiple-choice questions targeting user's background (e.g., Hobbyist, Enterprise, Researcher) and domain preferences.
- Create `/api/profile/save` endpoint: Takes user answers, prompts the LLM to synthesize a concise "User Profile Trait Summary". Saves via `profile_manager.py` using **Markdown with YAML Frontmatter**. The frontmatter will contain structured metadata (e.g., `user_type: enterprise`, `technical_level: expert`) while the body contains nuanced text for LLM context.
- Create `/api/profile/manage` endpoints: Allows `GET`, `DELETE` (specific traits), and `DELETE` (entire profile reset) operations.

## 2. Frontend UI (Onboarding & Dashboard)
- **Onboarding Component**: A sleek, card-based multiple-choice questionnaire. Smooth transitions between questions without overwhelming text.
- **Dashboard Component**: A minimalist profile view allowing the user to read their saved markdown traits, hit an 'X' to delete specific traits, or 'Reset Profile' to restart the onboarding.

## 3. Verification criteria
- User can walk through sequential multiple choice questions on UI.
- Resulting profile is correctly saved as a markdown file on the local file system.
- Upon reload, the UI reads the markdown file and correctly identifies the user profile and displays the traits.
- User can successfully delete individual traits and see the markdown file automatically updated.
