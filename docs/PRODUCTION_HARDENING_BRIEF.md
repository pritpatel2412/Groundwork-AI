# PRODUCTION HARDENING & COMPLETION BRIEF — GroundWork AI v2
### Companion to CLAUDE.md, docs/PRD.md, and docs/BUILD_BRIEF.md — read all four before touching code

## 0. WHY THIS DOCUMENT EXISTS

The v1 build proved the concept but is not a working product yet. Specifically, as of now:
- There is **no authentication** — anyone can open the app and see/use anyone else's workspace.
- The **generated report is basic** — it reads like a raw data dump, not something you'd hand to a client.
- **Wireframes do not render** — the feature is broken, not just unpolished.
- The **landing page** references features and sections that don't actually lead anywhere or aren't fully wired up.

This document's job is to close every one of those gaps, and to do a general robustness/efficiency pass so the app behaves like a real product under normal use, not just under a rehearsed demo. Nothing in here contradicts CLAUDE.md's invariants (cite-or-abstain, independent Verifier, no silent conflict resolution, no auto-publish, Mermaid-as-text diagrams, free-tier-only) — everything below is built inside those constraints.

## 1. AUDIT PHASE — DO THIS FIRST, BEFORE FIXING ANYTHING

Do not start patching code blind. First produce a short written audit (a markdown file, `docs/AUDIT_V2.md`, checked into the repo) covering:

1. **Route inventory:** every frontend route/page that exists today, and every link/button on the landing page — for each, state whether it currently leads to a real, working page, a stub, or nothing (404 / dead link / does nothing on click).
2. **Auth inventory:** confirm there is currently zero access control (state this explicitly even though we already know it), and list every backend route that currently has no ownership check.
3. **Report inventory:** open the current exported report output and list, concretely, what's missing or weak (e.g., "no executive summary," "citations shown as raw chunk IDs instead of readable text," "diagrams not embedded, just described").
4. **Wireframe inventory:** reproduce the wireframe bug, capture the actual error (browser console error, blank render, malformed JSON from the agent — whatever it actually is), and state the root cause in one sentence before writing any fix. Common root causes to check first: (a) the UX agent's output JSON doesn't match whatever shape the frontend renderer expects, (b) there is no real renderer component at all — only a Mermaid call, and Mermaid is not built for UI wireframes, (c) the agent is returning invalid/truncated JSON that isn't being validated before render.

Only after this audit exists should you move to sections 2–6. Reference the audit file's findings when you fix each item, so it's traceable that the specific reported bug was actually addressed, not just "improved."

---

## 2. AUTHENTICATION & AUTHORIZATION (NEW — BUILD THIS FIRST OF THE FOUR FIXES)

**Use Supabase Auth.** It's already in the stack (same free project as the database), so this adds no new service and no new cost.

### 2.1 What to implement

| Piece | Detail |
|---|---|
| Sign-up / Login | Email + password at minimum. Add Google OAuth if time allows (Supabase Auth supports it natively with a few config clicks) — not required for MVP. |
| Session handling | Supabase issues a JWT on login; frontend stores it via Supabase's client SDK (handles refresh automatically — don't hand-roll token refresh). |
| Protected routes (frontend) | Every workspace-related page (`/workspaces`, `/workspace/:id/*`) must redirect to `/login` if there is no active session. The landing page itself (`/`) stays public. |
| Protected routes (backend) | Every FastAPI route under `/workspaces/*` must verify the incoming Supabase JWT (validate against Supabase's JWKS endpoint, or use `supabase-py`'s built-in verification) and reject with 401 if missing/invalid. Attach the resolved `user_id` to the request context. |
| Ownership | Add a `user_id` column to the `workspaces` table (references `auth.users`). Every workspace create/read/update/delete must filter by the requesting user's `user_id` — a user must never be able to see or act on a workspace they don't own. |
| Row Level Security | Turn on Postgres RLS on `workspaces`, `source_documents`, `source_chunks`, `requirements`, `artifacts`, `artifact_claims`, `contradictions` — policy: a row is visible/writable only if it (directly or via its `workspace_id`) belongs to `auth.uid()`. Do this at the database level, not just in application code, so a bug in a route handler can't leak another user's data. |
| Logout | Clear the session client-side and redirect to `/`. |
| Password reset | Use Supabase's built-in "forgot password" email flow — don't build this from scratch. |

### 2.2 Database migration addition

```sql
alter table workspaces add column user_id uuid references auth.users(id) not null;

alter table workspaces enable row level security;
create policy "Users manage their own workspaces"
  on workspaces for all
  using (auth.uid() = user_id);

-- Repeat an equivalent policy on every child table, scoped through workspace_id, e.g.:
alter table source_documents enable row level security;
create policy "Users access their own workspace's documents"
  on source_documents for all
  using (workspace_id in (select id from workspaces where user_id = auth.uid()));
-- Apply the same pattern to source_chunks, requirements, artifacts, artifact_claims, contradictions.
```

### 2.3 Frontend additions

New pages: `/login`, `/signup`, `/forgot-password`. A shared `AuthProvider`/store holding the current session, consumed by a `ProtectedRoute` wrapper component around every workspace page. Show a clear loading state while the session is being resolved on app load — don't flash the login page for a fraction of a second for an already-logged-in user.

---

## 3. REPORT GENERATION — REDESIGN (CURRENT VERSION IS TOO BASIC)

The exported report is the artifact a real user would actually hand to a client or a dev team. It needs to read like a professional deliverable, not a data export.

### 3.1 Required report structure (in this order)

1. **Cover section** — workspace name, generation date, one-paragraph auto-generated executive summary (a short LLM call summarizing the requirement set in plain language — this alone will make the report feel dramatically more finished).
2. **Source material index** — list of every source document/transcript ingested, so the reader knows what the blueprint is based on.
3. **Requirements** — each requirement written as a full readable sentence (not a raw JSON fragment), with its status badge (Verified/Inferred/Unsupported) and, for Verified/Inferred items, the actual quoted source sentence underneath it in a smaller/quoted style — not just a chunk ID number.
4. **Open questions & contradictions** — a clearly separated section, phrased as action items ("Needs client clarification: ...").
5. **Solution architecture** — the Mermaid diagram rendered as an embedded image (see 3.2), followed by a short prose explanation of the key decisions and their verification status.
6. **Wireframes** — rendered screens (see Section 4) embedded as images, with a one-line caption per screen.
7. **Data & API design** — ER diagram (embedded image) + endpoint table.
8. **Estimate & roadmap** — the range, the reference cases used, and a simple phased roadmap list.
9. **Verifier summary** — the workspace-level Verified/Inferred/Unsupported percentages, stated in plain language ("78% of this blueprint is directly grounded in your source material; 15% is a reasonable AI inference; 7% could not be verified and needs your input before implementation").
10. **Appendix** — full citation index (which source document/sentence backs which requirement), for anyone who wants to audit the whole trail.

### 3.2 Implementation notes

- Generate the report as Markdown first (matches the existing export path), then render Markdown → PDF using a free/open-source library (`weasyprint` or `md-to-pdf` equivalents) so diagrams can be embedded as actual images rather than raw text.
- To embed Mermaid diagrams as images in a PDF, render them to SVG/PNG server-side (headless render via a Mermaid CLI/Puppeteer step, or render client-side and upload the resulting image blob to Supabase Storage, then reference it in the PDF generation step) — don't just paste raw Mermaid syntax into the PDF, it won't mean anything to a non-technical reader.
- Keep the underlying Markdown export available too (some users will want the raw, editable version) — PDF is an additional output, not a replacement.
- This satisfies `PRD.md` FR-WS-03/04 more completely than the v1 stub did.

---

## 4. WIREFRAME RENDERING — FIX THE ROOT CAUSE, NOT JUST THE SYMPTOM

Mermaid is a diagramming library (flowcharts, ER diagrams, sequence diagrams) — **it is not built to render UI wireframes**, and the audit phase (Section 1) should confirm whether this mismatch is the actual root cause here. Wireframes need their own schema and their own renderer.

### 4.1 Exact wireframe JSON schema the UX agent must output

```json
{
  "screen_name": "Approval Dashboard",
  "layout": "single_column",
  "components": [
    { "id": "c1", "type": "header", "label": "Purchase Approvals" },
    { "id": "c2", "type": "input", "label": "Search requests", "placeholder": "Search..." },
    { "id": "c3", "type": "table", "label": "Pending Requests", "columns": ["Requester", "Amount", "Status"] },
    { "id": "c4", "type": "button", "label": "Approve Selected", "style": "primary" },
    { "id": "c5", "type": "card", "label": "Summary", "content": "3 requests pending" }
  ]
}
```
Supported `type` values (keep this list small and closed — don't let the agent invent arbitrary types the renderer can't handle): `header`, `text`, `input`, `button`, `table`, `card`, `list`, `image_placeholder`, `nav_bar`.

### 4.2 Validation before render

Before sending the UX agent's output to the frontend, validate it against a Pydantic schema on the backend (`WireframeSpec`, `WireframeComponent` with a `Literal` type field matching the closed list above). If validation fails, retry the agent call once with the validation error appended to the prompt ("your last output used an unsupported component type X — only use: header, text, input, button, table, card, list, image_placeholder, nav_bar"). Never forward invalid JSON to the frontend and let it fail silently there.

### 4.3 Frontend renderer (`WireframeRenderer.tsx`)

Build an actual React component that maps each `type` to a simple, low-fidelity styled block — plain Tailwind boxes, not a real design system, since the point is showing structure, not polish:

```tsx
function WireframeRenderer({ spec }: { spec: WireframeSpec }) {
  return (
    <div className="border rounded-lg p-4 space-y-3 bg-white">
      <div className="text-xs text-gray-400">{spec.screen_name}</div>
      {spec.components.map((c) => (
        <ClaimAwareComponent key={c.id} component={c} />
      ))}
    </div>
  );
}
```
Where `ClaimAwareComponent` renders a simple placeholder per `type` (an `<h2>` for `header`, a disabled `<input>` for `input`, a styled `<button>` for `button`, a bordered `<table>` skeleton for `table`, etc.) **and** wraps it in the shared `<ClaimChip>` component from the existing citation system, so every wireframe element is clickable and shows its Verified/Inferred/Unsupported status exactly like every other artifact in the app. This is also what makes the wireframe screen consistent with the rest of the product instead of feeling bolted on.

### 4.4 Regression test for this fix specifically

After the fix, confirm: uploading each of the three demo datasets produces a wireframe that actually renders (not blank, not an error), every component is clickable, and at least one component in the "difficult case" dataset correctly shows as "Inferred" or "Unsupported" rather than everything defaulting to "Verified."

---

## 5. LANDING PAGE — FULL NAVIGATION & CONTENT AUDIT

Every claim, feature mention, nav item, and call-to-action on the landing page must lead somewhere real. Go through the landing page section by section and apply this rule: **if it's on the landing page, it must be either (a) a working link to a real page/section, or (b) removed.** No placeholder "Coming soon" links presented as if they work, no nav items that 404, no feature bullet that isn't actually reachable in the product.

### 5.1 Concrete checklist

- [ ] Every item in the top nav bar routes to a real page (Home, Login/Signup or Dashboard depending on auth state, Docs/How-it-works if it exists, etc.) — no dead `#` links.
- [ ] Every "feature" callout on the landing page (e.g., "AI-generated architecture," "Wireframes," "Verifier & citations," "Multilingual support," "Voice-note ingestion," "Export reports") links or scrolls to a section that actually explains it, and that feature is genuinely present and working in the app itself — do not describe a feature on the landing page that the product doesn't actually do yet; either finish the feature or remove the claim.
- [ ] The primary CTA ("Get Started" / "Try it now" / similar) goes to signup if logged out, or straight to the workspace dashboard if already logged in — never to a dead end.
- [ ] Footer links (if present) are real — no `mailto:` or social links that go nowhere, or remove them.
- [ ] A proper 404 page exists for any unmatched route, instead of a blank screen or a crash.
- [ ] Logged-in vs logged-out states of the landing page/header are visually distinct and correct (don't show "Sign up" to someone already logged in).
- [ ] Mobile/narrow-viewport check: nav collapses sensibly, nothing overlaps.

### 5.2 Suggested minimal page set (build any that don't exist yet)

`/` (landing), `/login`, `/signup`, `/forgot-password`, `/dashboard` (workspace list — this is the post-login home), `/workspace/:id` (the main app: ingestion → agents → artifacts, as already specified in `BUILD_BRIEF.md` §5.1), `*` (404).

---

## 6. CROSS-CUTTING ROBUSTNESS & EFFICIENCY PASS

Do this across the whole app, not as a separate feature:

| Area | Requirement |
|---|---|
| Loading states | Every async action (login, upload, generate, export) shows a visible loading/spinner state — no silent waiting that looks frozen. |
| Error handling | Every API call failure surfaces a real, human-readable message to the user (toast/banner), not a silent console error or a blank screen. |
| Env var validation | Backend should fail fast on startup with a clear message if any required env var (`GROQ_API_KEY`, `NVIDIA_API_KEY`, `SARVAM_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`) is missing — don't let it fail confusingly later mid-request. |
| Input validation | File upload size/type limits enforced both client- and server-side; reject unsupported file types with a clear message instead of letting ingestion silently fail. |
| Rate/abuse protection | Basic per-user rate limiting on the `/generate` endpoint (e.g., a simple in-memory or Postgres-backed counter) so one user can't exhaust the shared free-tier Groq/NVIDIA quota for everyone else. |
| Logging | Structured backend logs for each pipeline stage (useful for debugging live), with API keys and full document text explicitly excluded from any log line. |
| Empty states | Workspace list with zero workspaces, or a workspace with zero sources uploaded yet, should show a clear "get started" prompt — not a blank page. |
| Consistency check | Confirm the CLAUDE.md invariants still hold after all these changes: nothing exports without passing the Verifier, nothing renders with an unset status, the Verifier is still an independently-scoped call. |

---

## 6.5 CAPABILITY ENHANCEMENTS — BUILD THESE ALONGSIDE SECTIONS 2–5, NOT AFTER

These three are chosen specifically because each builds on infrastructure that already exists (the Verifier, the retrieval pipeline, the Mermaid renderer) rather than requiring a new subsystem, and each one directly strengthens the "our AI shows its work" story that is this product's core differentiator against every BRD/wireframe/EA tool researched in `docs/RESEARCH.md`. Treat these as part of the same build pass as Sections 2–5 — they change what the Verifier and diagrams actually do, not just how they look, so bolting them on afterward would mean re-touching the same code twice.

### 6.5.1 Consensus verification — two independent checkers instead of one

Today: Groq generates a claim → one NVIDIA-hosted model checks it. Change to: the claim is checked independently by **two different NVIDIA-hosted model families** (e.g., `deepseek-ai/deepseek-v3.1` and a genuinely different family such as a Qwen or GLM model on the same free catalog — not two sizes of the same model). Neither checker sees the other's verdict. Resulting status:
- **Verified** — both checkers agree the source supports the claim
- **Contested** — the two checkers disagree (new status — must be added everywhere status is used)
- **Unsupported** — both checkers agree the source does not support it

This changes the status enum from three values to four (`verified | inferred | contested | unsupported`) across the Postgres check constraints on `requirements` and `artifact_claims`, the Pydantic schemas, the frontend `ClaimChip` component (give `contested` its own distinct visual treatment, e.g. a split/striped chip), and the Verifier summary screen's percentage breakdown. Update all four layers together — don't let any of them fall out of sync with the others.

**Why it's worth the code churn:** "two independent AI models must agree before we call something verified" is a materially stronger, harder-to-poke-a-hole-in claim than "a second AI checked it," and it's a small change on top of the router already built in `BUILD_BRIEF.md §4.1` — call it twice with two different `model` strings and compare the two JSON verdicts.

### 6.5.2 Calibrated confidence from retrieval similarity, not the model's self-report

Stop asking any LLM to invent a confidence percentage — LLMs are unreliable at self-assessing certainty. Use the cosine similarity between the claim's embedding and its cited source chunk's embedding (already computed during retrieval in `backend/app/rag/retrieval.py`) as the confidence score instead. If a claim cites multiple chunks, use the maximum similarity among them.

```python
# backend/app/rag/confidence.py
def calibrated_confidence(claim_embedding, cited_chunk_embeddings: list) -> float:
    if not cited_chunk_embeddings:
        return 0.0
    sims = [cosine_similarity(claim_embedding, c) for c in cited_chunk_embeddings]
    return round(max(sims) * 100, 1)
```

Store this alongside the Verifier's categorical status — the Verifier decides Verified/Contested/Unsupported, this score is the confidence number attached specifically to `inferred` claims. This is the answer to give if a judge asks how confidence is calculated: point at the similarity math, not at "the model said so."

### 6.5.3 Bake status into the diagrams themselves, not just behind a click

Extend the Architect/Data agents' output step so every Mermaid node/edge is styled by its claim's status using Mermaid's native `classDef`/`class` syntax — solid green for Verified, dashed amber for Inferred, striped purple for Contested, dashed red for Unsupported:

```
graph TD
  A[Client Portal] --> B[Approval Service]
  classDef verified fill:#e6f4ea,stroke:#1e7e34,stroke-width:2px;
  classDef inferred fill:#fff8e1,stroke:#b8860b,stroke-width:2px,stroke-dasharray:4 2;
  classDef contested fill:#fdf0ff,stroke:#8e44ad,stroke-width:2px,stroke-dasharray:2 2;
  classDef unsupported fill:#fdecea,stroke:#c0392b,stroke-width:2px,stroke-dasharray:4 2;
  class A verified;
  class B inferred;
```

Generate the `class` assignments server-side from each node's stored status in `artifact_claims` right before sending the diagram string to the frontend — don't let the LLM pick its own colors, compute this deterministically from data already in the database. Result: a judge can read the trustworthiness of the whole architecture at a glance, with zero clicks.

**Explicit stretch goals, only if 2–5 and 6.5.1–6.5.3 are solid and tested with time left over:** (a) feed the Verifier's Contested/Unsupported counts into the Estimator so a shakier blueprint visibly widens the estimate range, and (b) turn the citation graph into a real dependency graph so editing one requirement highlights every artifact that's now potentially stale. Both are larger builds than the three above — do not start them at the expense of Sections 2–5.

---

## 7. REGRESSION / QA CHECKLIST (RUN BEFORE CALLING THIS DONE)

- [ ] Sign up as a new user, confirm email/password flow works end to end
- [ ] Log out, log back in, confirm session persists correctly on refresh
- [ ] Create two separate user accounts; confirm User A cannot see or access User B's workspace via the UI or by guessing a workspace ID directly against the API
- [ ] Run all three demo datasets (`normal_case`, `difficult_case`, `edge_case`) end to end post-auth-changes; confirm the full pipeline still produces correct results
- [ ] Confirm the wireframe screen renders correctly for all three datasets, with correct per-component status
- [ ] Export a report; open the resulting PDF and confirm it reads like a real document — executive summary present, diagrams appear as images, citations are readable sentences, not chunk IDs
- [ ] Click every link in the landing page nav and footer; confirm none are dead
- [ ] Try navigating directly to `/workspace/:id` while logged out — confirm it redirects to `/login` rather than showing data or erroring
- [ ] Try an unsupported file type on upload — confirm a clear error message, not a silent failure
- [ ] Confirm no API key or secret appears in browser dev tools network tab, console, or committed code
- [ ] Confirm at least one claim across the three demo datasets lands as **Contested** (craft one deliberately ambiguous sentence in a demo doc if needed) and renders with its own distinct chip style
- [ ] Confirm displayed confidence scores on Inferred claims match the computed cosine-similarity value, not a number invented by the LLM
- [ ] Confirm the architecture diagram visually distinguishes Verified/Inferred/Contested/Unsupported by color/style without requiring a click

---

## 8. DEFINITION OF DONE — V2

The product is done for this pass when: authentication fully gates workspace access (with RLS enforced at the database level, not just in application code), the exported report reads as a professional, image-embedded document rather than a data dump, wireframes render correctly and are clickable with citation status like every other artifact, every single link/claim on the landing page corresponds to a real, working page or feature, the Verifier requires two independent models to agree before marking anything Verified, confidence scores are computed from retrieval similarity rather than self-reported by the model, and diagrams visually communicate status without a click — with the full regression checklist in Section 7 passing.