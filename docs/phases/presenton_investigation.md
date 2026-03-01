# Investigation: Presenton for Slide Generation

This document outlines the evaluation, integration strategy, and proof-of-concept requirements for adopting **Presenton** as the primary slide generation tool, replacing the current `pptxgenjs` implementation.

## 1. Investigation of Presenton
Presenton is a modern, API-first presentation generation engine designed to create highly customized, visually rich slide decks programmatically.

**Key Potential Benefits:**
- Superior visual template capabilities compared to basic client-side generation.
- Better handling of complex typography, absolute positioning, and dynamic data wrapping.
- Centralized template management (changes can be pushed without code deployments).

## 2. Integration Points with Existing Workflows
To integrate Presenton seamlessly into the `layman.vuishere.com` architecture:
- **Trigger Point:** The "Export Slides" button in `SynthesisReport.tsx`.
- **Backend Proxy:** The frontend will send the `SynthesisResponse` data and the `query` prop to a new backend endpoint (e.g., `POST /api/synthesis/export`).
- **Data Payload:** The payload must map the `summary`, `ranked_models`, `pareto_data`, `implementation_timeline`, and `appendix` into a JSON structure compliant with the Presenton API.
- **Delivery:** The backend will return a signed URL or a direct binary stream of the generated `.pptx` or `.pdf` for the user to download.

## 3. Template Customization Capabilities
Presenton allows for advanced template definitions:
- **Branding:** Easy injection of `layman.vuishere.com` logos, color palettes (`#0A0A0A`, `#10B981`, `#3B82F6`), and typography (Geist, Outfit).
- **Dynamic Content:** Capable of automatically scaling font sizes or creating overflow slides for lengthy deep-dive appendices, solving the manual text-wrapping math currently required in `pptxgenjs`.
- **Data Visualization:** Support for injecting dynamic charts (e.g., the Pareto Frontier) directly into the slide, rather than relying on standard text tables.

## 4. Performance Benchmarks vs. Current Methods
| Metric | `pptxgenjs` (Current) | Presenton (Proposed) |
|---|---|---|
| **Execution Location** | Client-side (Browser) | Server-side / API |
| **Generation Speed** | ~100-300ms | ~1-3 seconds (Network overhead) |
| **Bundle Size Impact** | +~250kb | 0kb (Handled by backend) |
| **Complexity** | High (manual coordinate math) | Low (API payload mapping) |

*Conclusion:* While Presenton will introduce a slight network delay, it significantly reduces client-side bundle size and offloads the complex coordinate calculation for the appendix text wrapping.

## 5. API and SDK Extensibility
The integration will utilize the Presenton REST API or Python SDK:
- **Auth:** Standard Bearer token authentication from our backend server.
- **Endpoints:** Primary usage of the `/v1/presentations/generate` endpoint.
- **Extensibility:** The API allows for defining base master slides centrally, meaning if `layman.vuishere.com` rebrands or updates its watermark, no frontend code changes are required—only the template ID needs to be updated.

## 6. Proof-of-Concept Integration
**Step 1:** Create a base template in the Presenton dashboard matching our current dark-mode aesthetic.
**Step 2:** Develop a backend route `POST /api/export` in FastAPI.
**Step 3:** Use the `httpx` client in Python to send the parsed `SynthesisResponse` to the Presenton API.
**Step 4:** Return the generated file buffer as a `StreamingResponse` to the Next.js frontend.

## 7. Success Metrics for Adoption
To fully adopt Presenton, the POC must meet the following criteria:
1. **Visual Fidelity:** The generated slides must be indistinguishable from or superior to the current `pptxgenjs` output.
2. **Reliability:** The API must maintain a 99.9% uptime and successfully handle the heavily text-dense appendix without truncating content.
3. **Latency:** Total time from clicking "Export Slides" to the file downloading must not exceed 5 seconds.
4. **Maintainability:** The lines of code responsible for slide generation should be reduced by at least 50%.