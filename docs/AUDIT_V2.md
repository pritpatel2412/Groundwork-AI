# AUDIT V2 — Production Hardening & Completion Audit

**Project:** GroundWork AI  
**Audit Date:** September 6, 2026  
**Reference Document:** `docs/PRODUCTION_HARDENING_BRIEF.md` §1  
**Status:** Audit Completed — Awaiting confirmation before implementation

---

## 1. Route & Navigation Inventory

### 1.1 Frontend Route Architecture
The current frontend does not use a client-side router (`react-router-dom` is absent from `package.json`). Navigation is managed purely via local React component state (`viewMode: 'landing' | 'copilot'` in `App.tsx`).

| URL Route / Path | Implementation Status | Behavior / Destination | Issues Identified |
| :--- | :--- | :--- | :--- |
| `/` | **Working (Partial)** | Renders `SprintForgeLanding` if `viewMode === 'landing'`, or workspace shell if `copilot`. | Single URL hosts two entirely different views; no URL synchronization. |
| `/login` | **Missing (Nothing)** | None (returns default Vite `index.html` → loads landing page). | No auth screen exists. |
| `/signup` | **Missing (Nothing)** | None (returns default Vite `index.html` → loads landing page). | No registration screen exists. |
| `/forgot-password` | **Missing (Nothing)** | None (returns default Vite `index.html` → loads landing page). | No password recovery screen exists. |
| `/dashboard` | **Missing (Stub in state)** | Controlled via tab state `activeTab = 'home'` inside Copilot view. | Direct URL `/dashboard` is unhandled and results in landing page render. |
| `/workspace/:id` | **Missing (Stub in state)** | Controlled via Zustand `currentWorkspace` object in memory. | Reloading the browser or sharing a URL loses workspace context; no deep linking. |
| `*` (404 Fallback) | **Missing (Nothing)** | None. Any unmatched URL silently renders the default landing page. | No 404 error page. |

---

### 1.2 Landing Page Link & Button Inventory (`SprintForgeLanding.tsx`)

| Element | Type | Target / Handler | Current Result | Verdict |
| :--- | :--- | :--- | :--- | :--- |
| **Top Nav: Logo** | Branding | None | Static visual element, no navigation. | Acceptable |
| **Top Nav: Services** | Link (`<a>`) | `href="#services"` | Scrolls to `id="services"` section smoothly. | **Working** |
| **Top Nav: Capabilities** | Link (`<a>`) | `href="#capabilities"` | Scrolls to `id="capabilities"` section smoothly. | **Working** |
| **Top Nav: Case Studies** | Link (`<a>`) | `href="#work"` | Scrolls to `id="work"` section smoothly. | **Working** |
| **Top Nav: Packages** | Link (`<a>`) | `href="#packages"` | Scrolls to `id="packages"` section smoothly. | **Working** |
| **Top Nav: Studio** | Link (`<a>`) | `href="#studio"` | Scrolls to `id="studio"` section smoothly. | **Working** |
| **Top Nav: Open Copilot** | Button | `onClick={onOpenCopilot}` | Switches `viewMode` to `'copilot'` without authentication. | **Working (Unauthenticated)** |
| **Mobile Menu: Links** | Links (`<a>`) | Anchors (`#services`, etc.) | Closes menu, scrolls to section. | **Working** |
| **Mobile Menu: Launch** | Button | `onClick={onOpenCopilot}` | Switches `viewMode` to `'copilot'`. | **Working (Unauthenticated)** |
| **Hero: Launch Copilot Blueprint** | Button | `onClick={onOpenCopilot}` | Switches `viewMode` to `'copilot'`. | **Working (Unauthenticated)** |
| **Hero: Explore Sprints** | Link (`<a>`) | `href="#packages"` | Scrolls to `#packages`. | **Working** |
| **Hero: Live Copilot Tile** | Card | `onClick={onOpenCopilot}` | Switches `viewMode` to `'copilot'`. | **Working (Unauthenticated)** |
| **Services: 6 Feature Cards** | Cards | `onClick={onOpenCopilot}` | Each card triggers `onOpenCopilot()`; does not load card-specific context. | **Working (Generic)** |
| **Capabilities: Simulate Audit** | Button | `handleSimulateAudit` | Runs simulated 1-second timer animation. | **Working (Demo Stub)** |
| **Case Study: Open Blueprint** | Button | `onClick={onOpenCopilot}` | Switches `viewMode` to `'copilot'`. | **Working (Unauthenticated)** |
| **Packages: Select Prototype** | Button | `onClick={onOpenCopilot}` | Switches `viewMode` to `'copilot'`. | **Working (Unauthenticated)** |
| **Packages: Launch This Sprint** | Button | `onClick={onOpenCopilot}` | Switches `viewMode` to `'copilot'`. | **Working (Unauthenticated)** |
| **Packages: Schedule Enterprise**| Button | `onClick={onOpenCopilot}` | Switches `viewMode` to `'copilot'`. | **Working (Unauthenticated)** |
| **Studio: Contact Email** | Text | Static text | Displays `contact@groundwork.ai`; unlinked (no `mailto:` or contact modal). | **Stub** |
| **Footer: Start Sprint Form** | Form | `handleEmailSubmit` | Captures email, delays 600ms, calls `onOpenCopilot()`. Does not save email or create account. | **Stub** |
| **Footer: Nav Links** | Links | `#services`, `#work`, `#packages` | Scrolls to sections. | **Working** |
| **Footer: Open Copilot** | Button | `onClick={onOpenCopilot}` | Switches `viewMode` to `'copilot'`. | **Working (Unauthenticated)** |

---

## 2. Authentication & Authorization Inventory

### 2.1 Confirmation of Zero Access Control
* **Access Control Status:** **CONFIRMED ZERO ACCESS CONTROL.**
* Any anonymous HTTP client or browser visitor can read, create, modify, or delete any workspace and trigger heavy LLM pipeline runs without supplying any credentials, session tokens, or API keys.
* Workspaces and their child tables (`source_documents`, `source_chunks`, `requirements`, `artifacts`, `artifact_claims`, `contradictions`) contain no `user_id` foreign key.
* PostgreSQL Row Level Security (RLS) is **disabled** on all database tables.

### 2.2 Unprotected Backend Routes Inventory

| HTTP Method | Route | Missing Security & Ownership Check |
| :--- | :--- | :--- |
| `POST` | `/workspaces` | Anonymous creation of workspaces; no `user_id` recorded. |
| `GET` | `/workspaces` | **Critical Leak:** Returns every workspace in the entire database to anyone. |
| `GET` | `/workspaces/{id}` | Anonymous read of any workspace by ID without checking owner. |
| `POST` | `/workspaces/{id}/sources/upload` | Anyone can upload documents into any workspace. |
| `POST` | `/workspaces/{id}/sources/text` | Anyone can insert text into any workspace. |
| `GET` | `/workspaces/{id}/sources` | **Critical Leak:** Anyone can read private corporate documents across any workspace. |
| `POST` | `/workspaces/{id}/generate` | Anyone can invoke LLM generation, consuming free-tier quota. |
| `GET` | `/workspaces/{id}/generate` | SSE streaming endpoint completely unauthenticated. |
| `GET` | `/workspaces/{id}/requirements` | Anyone can view extracted client business requirements. |
| `GET` | `/workspaces/{id}/contradictions` | Anyone can view surfaced policy contradictions. |
| `GET` | `/workspaces/{id}/artifacts/{type}` | Anyone can view synthesized architectures, wireframes, ERDs, and estimates. |
| `GET` | `/workspaces/{id}/claims/summary` | Anyone can read workspace verifier audit summaries. |
| `POST` | `/workspaces/{id}/export` | Anyone can trigger report exports. |
| `POST` | `/workspaces/{id}/translate` | Anyone can trigger translation API calls. |

---

## 3. Report Content Inventory (Current vs. Deliverable)

Inspection of the current export handler in `backend/app/routes/workspaces.py` (lines 106–161) reveals that the current output is a raw debug markdown dump rather than a client deliverable.

### Deficiencies Identified in Current Report:
1. **No Cover Page & No Executive Summary:** The report immediately drops into a raw bulleted list of requirements. There is no executive-level synthesis explaining the business context, transformation objectives, or scope.
2. **Missing Source Material Index:** The report does not list the ingested files, memos, dates, or source document counts. A client reading the document cannot tell what inputs produced the blueprint.
3. **Raw UUID Citations:** Requirements and contradictions output raw 36-character chunk IDs (e.g. `(Citations: 8e0872d4-2cbb-40e6-a55b-31e4b003e5cb)`). These are unreadable to human stakeholders. Citations must include the actual quoted source excerpt and document origin.
4. **Unrendered Raw Mermaid Code Blocks:** Architecture and ER diagrams are printed as raw ```mermaid text blocks. In exported deliverables (especially PDF), raw code syntax cannot be interpreted by clients or non-technical readers. Diagrams must be rendered as embedded images/SVGs.
5. **Wireframes are Completely Omitted:** Although `wireframes = db_client.get_artifact(workspace_id, "wireframe")` is fetched on line 102, the wireframe screens are never appended to the export output. Zero wireframe screens appear in the document.
6. **No API Surface Specification:** The REST API endpoint design and contract specifications are absent from the export.
7. **No Plain-Language Verifier Trust Metrics:** The report does not explain the grounding statistics in business terms (e.g., *"78% of requirements are directly grounded in source documentation, 15% are inferred architectural decisions, and 7% require human confirmation"*).
8. **No Cross-Referenced Audit Appendix:** Lacks an appendix linking every generated claim back to its specific source document section.
9. **No PDF Export:** Export is restricted to raw `.md` download. Enterprise deliverables require styled PDF output.

---

## 4. Wireframe Bug Inventory & Root-Cause Diagnosis

### 4.1 Reproduction & Observed Behavior
* **Reproduction Steps:** Ingest demo document, trigger "Synthesize Grounded Blueprint", and open the **Wireframe Canvas** tab.
* **Observed UI Behavior:**
  1. The UI renders hardcoded, static mockup numbers (`Requests: 1,248`, `Auto-Approved: 94.2%`, `Audit Latency: 0.8s`) that have nothing to do with the ingested workspace.
  2. In the components list, element names render as `[object Object]` or throw a fatal React child error in strict environments because `{el.name || el}` attempts to render an entire object in JSX.
  3. No interactive UI layout or structured screen mockup actually renders.

### 4.2 Error Capture & Code Tracing
In `frontend/src/components/WireframeView.tsx` (lines 135–140):
```tsx
{currentScreen.elements.map((el: any, i: number) => (
  <div key={i} className="p-3 rounded-lg bg-[#F4F5F5] text-xs flex items-center justify-between">
    <span className="font-medium text-[#232427]">{el.name || el}</span>
    <span className="text-[10px] font-mono text-[#55575c]">{el.type || 'component'}</span>
  </div>
))}
```
* The UX Agent (`backend/app/agents/ux.py`) outputs elements with keys: `{ id, type, label, description, requirement_ids }`.
* The frontend looks for `el.name`. Since `el.name` is undefined, `{el.name || el}` evaluates to `el` (the raw JavaScript object).
* In React, rendering an object directly into JSX throws:  
  `Uncaught Error: Objects are not valid as a React child (found: object with keys {id, type, label, description, requirement_ids})`.

### 4.3 Root-Cause Diagnosis (Single Sentence)
> **The wireframe feature fails because the UX agent outputs a non-standard JSON structure while `WireframeView.tsx` attempts to render raw JavaScript element objects directly into JSX via `{el.name || el}` without validating against a closed component schema or providing dedicated UI renderers for headers, tables, inputs, buttons, and cards.**

---

## 5. Implementation Roadmap Based on Audit Findings

With the findings documented, the execution path proceeds according to `PRODUCTION_HARDENING_BRIEF.md`:

1. **Section 2 (Authentication & RLS):**
   - Install `@supabase/supabase-js` and `react-router-dom`.
   - Implement Supabase Auth (Email/Password, JWT storage, session listener).
   - Add routes: `/login`, `/signup`, `/forgot-password`, `/dashboard`, `/workspace/:id`, and `*`.
   - Update database schema: Add `user_id` to `workspaces`, enable RLS, and apply isolation policies across all tables.
   - Secure all backend FastAPI routes using JWT verification dependency (`get_current_user`).

2. **Section 3 (Report Redesign):**
   - Re-architect export generation to produce the 10-section deliverable structure (Executive Summary, Source Index, Quoted Citations, Embedded Images, Wireframes, Plain-Language Verifier Metrics, Appendix).
   - Implement server-side SVG rendering for Mermaid diagrams and PDF generation via headless renderer / PDF generation engine.

3. **Section 4 (Wireframe Fix):**
   - Enforce exact `WireframeSpec` JSON schema with closed component types (`header`, `text`, `input`, `button`, `table`, `card`, `list`, `image_placeholder`, `nav_bar`) with Pydantic validation on the backend.
   - Build `WireframeRenderer.tsx` with dedicated component mockups wrapped in `<ClaimChip>` for interactive citation inspection.

4. **Section 5 (Landing Page Link-by-Link Audit & Fix):**
   - Wire all CTAs to real authentication or workspace paths.
   - Distinguish logged-in vs. logged-out header states.
   - Ensure zero dead `#` or placeholder links remain.

5. **Section 6 (Cross-Cutting Robustness):**
   - Global loading spinners, toast error handling, startup environment variable validation, file upload validation, per-user generation rate-limiting, and sanitized logging.

6. **Section 6.5 (Capability Enhancements):**
   - Consensus Verification (two independent NVIDIA-hosted models agreeing on `verified`, surfacing `contested` upon disagreement).
   - Calibrated confidence computed via cosine similarity of embeddings.
   - Status-styled Mermaid architecture diagrams (`classDef` applied server-side).
