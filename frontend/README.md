# Layman Lang Disclosed - Frontend Client

This directory houses the Next.js frontend application tailored for rendering dense, research-driven LLM insights into an accessible, premium user interface.

## 🎨 Tech Stack
1. **Framework**: Next.js (App Router enabled)
2. **Core Language**: TypeScript & React
3. **Data Fetching / State**: `@tanstack/react-query` & Axios API Client
4. **Styling Engine**: TailwindCSS 
5. **Interactive Animations**: Framer Motion (page transitions, hover reveals, and layout morphing)
6. **Data Visualization**: Recharts (Customized Scatter Plot Pareto Frontiers)

## 🗂️ Directory Structure
- `src/api/client.ts`: Exclusively handles formatting TypeScript schemas against the FastAPI backend endpoints.
- `src/app/`: The Next.js generic router bounds (`layout.tsx`, `page.tsx`). Wraps the entire hierarchy in `ErrorBoundary` blocks to prevent cascading React crashes.
- `src/components/profile/`: Interactive Framer UI guiding users through dynamic persona questioning.
- `src/components/task/`: Modifiable workspace environments capturing text input and generating explicit `DomainExpansion` cards.
- `src/components/orchestration/LiveLogs.tsx`: Native Javascript `EventSource` subscriber pushing Server-Sent Events identically to the DOM.
- `src/components/synthesis/`: Results engines orchestrating stacked rank scorecards, `ParetoFrontier` trade-off visualizations, and Dual-Timelines.

## 🚀 Running Locally
1. Ensure the Python backend is actively serving on `http://localhost:8000`.
2. Install NodeJS deps (if not already done):
   ```bash
   npm install
   ```
3. Boot the Next.js Development Server:
   ```bash
   npm run dev
   ```
4. Navigate to [http://localhost:3000](http://localhost:3000)
