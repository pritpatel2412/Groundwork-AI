# GROUNDWORK AI — V3 PROMPT PACK (prototype → product companies pay for)
Target agent: Antigravity / Cursor. Date written: 2026-10-07.
Inputs read: PRD, BUILD_BRIEF, PRODUCTION_HARDENING_BRIEF (== v2.md, byte-identical), AUDIT_V2, FULL_AUDIT, RESEARCH, `cornell_po_vendor_baseline.md`.

**How to use:** Paste §1 (Preamble) + ONE prompt (P0…P10) per agent session, in order. Each prompt ends with a report file the agent must write; paste that report back to me before starting the next prompt.

---

## 0. HONEST ASSESSMENT (read before spending agent time)

### 0.1 What the evidence in your own files says

| # | Finding | Evidence | Consequence |
|---|---|---|---|
| F1 | **Citations show text that doesn't support the claim.** Citation = whole chunk (14 chunks for 27K chars ≈ 1.9K chars/chunk); the UI/report shows the chunk's first ~200 chars. | Baseline reqs #1,#2 show an identical SOP-header quote. #14,#15,#16,#20 (PaymentWorks / roles / Vendor Reviewer) all show the same "Requestor is an optional…" quote. | The product's only differentiator (trust) fails on the first reviewer click. **This is the #1 fix (P2).** |
| F2 | **22.6% of claims Contested, 16.8% Unsupported, only 2 Inferred** (155 claims; 59.4% "grounded"). | Baseline header: 92 V / 2 I / 35 C / 26 U. | Reviewer must manually adjudicate ~40% of claims → no time saved. Likely cause: consensus pair is Nemotron-120B vs **Llama-3.2-11B** (a weak co-judge; brief specified two comparable families). Fix: stronger pair + tie-break (P1) + sentence-level evidence (P2). |
| F3 | Executive summary is **one ~190-word sentence**. Cover says `Generated: Recently`, workspace name `Test - 2`, and leaks internal "NVIDIA NIM Verifier" protocol text. | Baseline lines 1–6. | Not client-grade. P5. |
| F4 | **112 flat requirements** for a 23-page SOP. | Baseline §3. | Nobody reviews 112 flat rows. Worth-paying-for = fast *review workflow*, not generation. P3/P6. |
| F5 | **Spec drift on wireframes.** Brief's closed schema = `header,text,input,button,table,card,list,image_placeholder,nav_bar`. FULL_AUDIT says renderer supports `header,form,data-table,stat-cards,activity-feed,button-row`. Verified by "Vite build succeeds" only — no screenshot. | FULL_AUDIT row FR-UX-01 + Resolution Log #1. | "Working" is unproven. You independently say UI/UX is not proper. P4. |
| F6 | **The audits were written by the build agent grading itself** (every row "Working"). AUDIT_V2 and FULL_AUDIT are both dated Sept 6 and contradict each other on auth (V2: none; Full: working) — V2 is the pre-fix snapshot. Today is Oct 7; I have not seen the code. | — | Treat all "Working" as unverified. P0 re-audits with runtime evidence. |
| F7 | PDF export is **ambiguous**: one FULL_AUDIT row cites "PDF download", another says only Markdown exists. | FULL_AUDIT FR-WS-03 vs FR-WS-04 rows. | Verify in P0; real PDF in P5. |
| F8 | Not implemented: inline edit/accept/reject (FR-WS-01), inline contradiction resolution (FR-ANLY-04), rate limiting, mobile layout (8-tab nav overflows), frontend error toasts. | FULL_AUDIT. | Without these it's a viewer, not a workflow tool. P3/P6/P7. |

### 0.2 Provider decision: Gemini → Groq → NVIDIA — sound for quality, **blocked for real customer data on free tiers**

Verified Oct 2026 (searched):
- **Gemini API free tier:** prompts/outputs may be used to improve Google products and human reviewers may read them; paid tier excludes this. Google says treat free tier as off-limits for customer data. Pro-class models have also effectively left the free tier (third-party source; verify).
- **NVIDIA hosted catalog (build.nvidia.com):** "prototyping, research, development and testing only." NVIDIA's FAQ defines production as any use *serving real end-users*; production requires AI Enterprise license or self-host/partner endpoints. **Your consensus Verifier currently runs only on this → cannot legally serve paying customers.**
- **Groq:** Free plan = prototyping; Developer plan = production. ZDR toggle exists in Data Controls. Third-party summary says no training on API data by default — verify against Groq's ToS/DPA before promising it to a customer.

**Therefore:** two modes enforced in Python (P1). `demo` = free tiers, synthetic/public data only. `prod` = paid-tier providers only; router refuses free/prototype providers at startup. Cost of going paid is small relative to a subscription, but it must be measured (P9), not assumed.

**Independence rule change:** with Gemini as generator, verifiers must be **non-Gemini families** (Groq-hosted OpenAI-OSS / Llama / Qwen in prod). If a fallback provider generated the claim, verifiers exclude *that* family. Python selects verifiers (`pick_verifiers`), never the LLM.

### 0.3 Interpretation I'm assuming
"UI/UX it builds inside our webapp is not proper" = (a) the **wireframe/UX-agent output** is weak, and/or (b) the **app's own UI** is weak. Swapping to Gemini can improve (a). It cannot fix (b); that's a design/IA problem → separate prompt P6. Both are covered.

### 0.4 Feasibility (my estimate, solo + agents; adjust after P0)
- Credible paid pilot with 3–5 consultancies/internal-IT users: **P0–P7 + P9 ≈ 4–6 weeks** of focused work. The long poles are P2 (evidence engine), P4 (wireframes), P6 (UX), P7 (multi-tenant/jobs).
- **Not achievable near-term:** SOC 2, enterprise SSO/SCIM, on-prem. Position for SMB consultancies and mid-size internal IT; say so on the security page (P10).
- **No prompt can replace:** getting 3–5 real BAs to use it on a real project and measuring time saved. P10 defines the pilot. Until that happens "companies actually use it" is a hypothesis.
- **Willingness-to-pay is unvalidated.** Competitors cited in your RESEARCH.md (EltegraAI, Clappia, Ardoq) are vendor claims, not proof of demand. Pricing is set only after P9 gives COGS per blueprint.

### 0.5 MoSCoW

| Pri | Item | Prompt |
|---|---|---|
| **Must** | Runtime-evidence re-audit | P0 |
| **Must** | Provider layer: Gemini→Groq→NVIDIA, mode gate, verifier independence, tie-break | P1 |
| **Must** | Sentence-span citations, Python-validated quotes | P2 |
| **Must** | Wireframe system + visual QA | P4 |
| **Must** | Client-grade report + real PDF | P5 |
| **Must** | Review-first app UX (accept/reject/edit, attention queue, evidence panel) | P6 |
| **Must** | Orgs/roles, RLS, job queue, deletion, quotas, observability | P7 |
| **Must** | Eval harness + cost model + provider A/B | P9 |
| **Must** | Truthful launch assets + pilot protocol | P10 |
| **Should** | Analyst hierarchy, obligation-level tagging, gap questions | P3 |
| **Should** | Billing/plans | P8 |
| **Should** | DOCX export, read-only client share link | P5/P7 |
| **Could** | PII redaction pre-LLM, constraint-based regeneration (FR-ARCH-03), process/sequence diagram (FR-ARCH-04), estimate widening from Contested counts | P3/P7 |
| **Won't (now)** | SOC 2, SSO/SCIM, Jira/ADO sync, Drift Detector, native mobile | — |

### 0.6 Not verified by me
Repo state (I haven't seen code); exact current Gemini model IDs/quotas (P1 makes the agent list them from the API); Groq/NVIDIA terms beyond sources above; whether PDF export exists; Sarvam free credits (also free-tier → paid needed in prod for STT/translate).

---

## 1. PREAMBLE — paste at the top of EVERY prompt

```
PROJECT: GroundWork AI (FastAPI + Supabase/pgvector backend, React/Vite/TS/Tailwind/zustand frontend).
READ FIRST: CLAUDE.md, docs/PRD.md, docs/BUILD_BRIEF.md, docs/PRODUCTION_HARDENING_BRIEF.md, docs/AUDIT_V3.md (once it exists).

INVARIANTS (supersede CLAUDE.md where they conflict; update CLAUDE.md in the same PR):
I1  Cite-or-abstain at SENTENCE level: every claim carries verbatim quote(s) from source. Python verifies the quote is a substring of the source (whitespace-normalised). If not → claim is rejected or marked unsupported. Never trust the LLM's quote.
I2  Verifier independence enforced in Python by model FAMILY: verifier families != generator family, and the two verifiers differ from each other. Verifiers never see the generation prompt or reasoning.
I3  Contradictions are surfaced, never silently resolved.
I4  Diagrams are text (Mermaid). Wireframes are validated JSON → React renderer. Never raster generation.
I5  (REPLACES "free-tier only") GROUNDWORK_MODE=demo|prod. demo: free tiers allowed, synthetic/public data only. prod: paid-tier providers only; router refuses to start otherwise.
I6  Fail closed. No fabricated fallback content, no boilerplate diagrams/entities. Empty/invalid upstream → stage fails with a human-readable error.
I7  PYTHON OWNS DETERMINISTIC LOGIC. LLMs only classify or generate text/structure. Python computes: status derivation, quote validation, similarity/confidence, verifier selection, tie-break, diagram status classes, obligation-level tagging, wireframe layout/status, rate limits, quotas, mode gating, totals/percentages, schema validation. No LLM-invented numbers, colors, or percentages anywhere.
I8  Nothing exports without passing the Verifier and a human confirmation.
I9  NOTHING IS "DONE" WITHOUT RUNTIME PROOF: command output, test results, Playwright screenshots (1440px and 375px). A passing build is not proof. Self-reported "Working" without artifacts counts as failed.
I10 Never log API keys or full document text. Never put secrets in the browser bundle.

OUTPUT PROTOCOL:
- Work in small commits on a branch `v3/<prompt-id>`.
- Write tests before or with the code. All pre-existing tests must still pass.
- At the end write `docs/reports/<PROMPT_ID>_REPORT.md`: what changed (files), commands run + raw output, screenshots paths, acceptance checklist with PASS/FAIL per item, known gaps. Be adversarial toward your own work; list what you could NOT verify.
- If a requirement conflicts with reality (library missing, API differs), STOP and record it in the report instead of improvising a fake.
```

---

## P0 — RUNTIME-EVIDENCE RE-AUDIT (Must) — no feature code

```
GOAL: Replace the self-reported audits with an evidence-backed baseline. Change NO product code except adding scripts under backend/scripts/ and tests/audit/.

DO:
1. Repo recon: print tree (depth 3), list every backend route, every frontend route/component, current model IDs and providers in backend/app/llm_clients/router.py, current verifier models, DB constraints on status columns, migrations present.
2. Boot backend + frontend locally. With Playwright capture full-page screenshots of EVERY screen/tab at 1440x900 and 375x812 for: landing, login, signup, dashboard, workspace (each tab: ingestion, trace, requirements, architecture, wireframes, data, roadmap, verifier, export). Save to docs/audit_v3/screens/. Record console errors and failed network calls per screen.
3. Run the pipeline on demo_data normal_case, difficult_case, edge_case, real_world_case (Cornell). Record wall time, per-stage time, token counts if available, failures.
4. Write backend/scripts/citation_audit.py (deterministic, no LLM): for every requirement and artifact claim, load its cited chunk(s) and compute
   a) quote_substring_ok (does any displayed quote appear verbatim in cited source text)
   b) lexical_support: fraction of the claim's content words (lowercased, stopwords removed, numbers kept) found in the displayed quote
   c) duplicate_quote_count: how many distinct claims show the identical quote
   Output CSV + summary: % claims with lexical_support < 0.3, top 10 most-reused quotes.
5. Export the Cornell report (md and, if it exists, PDF). Check: Does PDF export exist? Are diagrams images? Any UUIDs? "Recently" date? Executive-summary length in words and sentence count?
6. Wireframes: for each dataset, dump the UX agent's raw JSON, validate against the brief's closed schema AND the schema the renderer actually accepts; list mismatches. Screenshot the rendered result.
7. Security: attempt cross-tenant access with two real accounts against EVERY route (script, not manual). Attempt unauthenticated access. Report any non-401/403/404.
8. Write docs/AUDIT_V3.md: table per area with columns [Item | Expected | Observed (evidence path) | PASS/FAIL | Severity]. Include a section "Claims in FULL_AUDIT.md that are FALSE or UNPROVEN".

ACCEPTANCE: every row has an evidence path (screenshot, log, CSV). citation_audit.py runs in CI-able form. No product code changed.
REPORT: docs/reports/P0_REPORT.md
```

---

## P1 — PROVIDER LAYER: GEMINI → GROQ → NVIDIA (Must)

```
GOAL: Rebuild backend/app/llm_clients/ as a config-driven provider layer. Gemini is primary for generation. Groq then NVIDIA are fallbacks. Verification uses non-generator families. Python owns every routing decision (I2, I5, I7).

CONFIG (providers.yaml + env; no model ID hardcoded in code):
  providers:
    gemini: {sdk: google-genai, key_env: GEMINI_API_KEY, tier: paid|free, models: {primary: $GEMINI_MODEL_PRIMARY, fast: $GEMINI_MODEL_FAST}, family: google}
    groq:   {base_url: https://api.groq.com/openai/v1, key_env: GROQ_API_KEY, tier: paid|free, models: [{id: $GROQ_MODEL_A, family: openai-oss}, {id: $GROQ_MODEL_B, family: meta}, {id: $GROQ_MODEL_C, family: alibaba}]}
    nvidia: {base_url: https://integrate.api.nvidia.com/v1, key_env: NVIDIA_API_KEY, tier: prototype, models: [...], family per model}
  generate_order: [gemini, groq, nvidia]
  GROUNDWORK_MODE: demo|prod
  In prod: any provider with tier in {free, prototype} is DISABLED; startup fails with an explicit message if fewer than 1 generator and 3 distinct verifier families remain enabled. Add a manual-checklist doc: "Gemini key must belong to a billing-enabled project (Google's paid terms exclude prompts from product improvement); Groq org on Developer plan with ZDR enabled in Data Controls". The code cannot verify billing; do not pretend it can — log the operator's explicit GEMINI_BILLING_CONFIRMED=true / GROQ_PLAN_CONFIRMED=true env assertions at startup in prod.

IMPLEMENT:
1. At startup call each provider's list-models endpoint (Gemini models.list; Groq/NVIDIA /models). Validate every configured model ID exists; fail fast (prod) or disable that model with a warning (demo). This replaces guessing model names.
2. Gemini via native google-genai SDK with structured output (response_mime_type=application/json + response_schema from a Pydantic model). Groq/NVIDIA via OpenAI-compatible client with json_mode. Single interface:
     call_structured(schema: type[BaseModel], messages, purpose: "generate"|"verify"|"summarize", exclude_families: set[str]=()) -> LLMResult[T]
   LLMResult = {parsed, provider, model, family, tokens_in, tokens_out, latency_ms, est_cost_usd, attempts: [{provider, model, outcome, error_class}]}
   For extraction/classification calls set minimal reasoning/thinking where the chosen model supports it (check SDK docs; do not assume).
3. Error taxonomy: rate_limit (429/RESOURCE_EXHAUSTED → honor Retry-After, cooldown that provider), server_error/timeout (retry w/ jitter, max 2), safety_block (Gemini finish_reason SAFETY/blocked → fall through immediately), schema_invalid (one repair retry on the same provider with the validation error appended, then fall through), auth_error (disable provider for the process, loud log).
4. Per-provider circuit breaker (open after N failures in window; half-open probe). Persist state in memory; expose GET /internal/providers (admin only) with health, cooldowns, today's token/cost totals.
5. verifier selection — pure function, unit-tested:
     pick_verifiers(generator_family, enabled) -> (family_a, family_b, tiebreak_family)
   Rules: none equals generator_family; a != b != tiebreak; if <3 eligible families → raise VerifierPoolExhausted → verifier stage ends `degraded`, claims stay `pending` (new internal status, UI shows "checking", never rendered as a verdict), export gated.
6. Consensus + tie-break in Python:
     v_a, v_b verdicts run concurrently. agree → that verdict. disagree → call tiebreak; majority wins; if tie-break also disagrees with both (3-way split) → `contested`. Record all verdicts + reasons on the claim (verifier_votes jsonb).
   Verifier prompt must receive ONLY: claim text + quoted source span(s) (+/-1 neighbouring sentences from P2 once available; until then the cited chunk). Rubric: paraphrase is OK; altered numbers/entities/modal strength (must vs may) are NOT.
7. Persist on every claim/artifact: generator_provider, generator_model, generator_family, verifier_votes, status. DB migration: status enum = verified|inferred|contested|unsupported|pending. Update Pydantic, TS types, ClaimChip, summary counts together (single source of truth: a shared status enum file; generate TS from it).
8. Token/cost ledger table llm_calls(workspace_id, stage, provider, model, tokens_in, tokens_out, est_cost_usd, latency_ms, created_at). Price table in providers.yaml (operator-maintained; log a warning if absent).
9. Response cache for dev only: key = hash(model, messages, schema); disabled in prod; never caches errors.
10. Deprecate the old router; keep a thin shim until all agents migrate; delete after P1 tests pass.

TESTS (fake providers, no network): fallback order Gemini→Groq→NVIDIA; Gemini 429 → Groq; schema_invalid repair path; safety_block fall-through; prod mode refuses free/prototype providers; verifier independence for every generator family; 3-way split → contested; VerifierPoolExhausted → degraded + export blocked.
Plus scripts/live_smoke.py (behind --live) that makes 1 tiny call per enabled provider and prints provider/model/latency.

ACCEPTANCE: all tests green; kill GEMINI key → run Cornell → generation falls to Groq and verifier excludes the Groq family used; no key in logs/browser; /internal/providers shows real data.
REPORT: docs/reports/P1_REPORT.md (include a table: stage × provider actually used on a full Cornell run).
```

---

## P2 — EVIDENCE ENGINE: SENTENCE-SPAN CITATIONS (Must) — fixes F1/F2

```
GOAL: Make every citation point to the exact supporting sentence(s), validated by Python, and make the UI/report show that sentence in context. Depends on P1.

DO:
1. Re-ingest pipeline: parse → normalise → sentence-segment (pysbd or spaCy sentencizer; handle SOP bullets/numbering/tables) → store `source_sentences(id, source_document_id, workspace_id, idx, text, char_start, char_end, page, heading_path, embedding)`. Keep `source_chunks` for retrieval windows (<= ~600 chars, sentence-aligned, with sentence id range). Local embeddings unchanged. Migration + backfill script; old workspaces must be re-ingestable with one command.
2. Retrieval returns chunks WITH their sentence ids. Agents must output, per claim: `evidence: [{sentence_id, quote}]`, where quote is verbatim.
3. quote validation (Python, deterministic): normalise whitespace/hyphenation/quotes; require quote ⊂ sentence text (allow ellipsis-joined segments ≤ 2). Fail → one repair retry with the failing quote → else the claim becomes `unsupported` (kept visible, flagged "quote could not be located"). Never display an unvalidated quote.
4. Confidence = max cosine(claim_embedding, evidence_sentence_embedding) — sentence, not chunk. Store as `similarity` (0–1). Only show a percent on Inferred/Contested; label it "evidence similarity", never "probability".
5. Verifier input (P1 hook): claim + evidence sentences + ±1 neighbours. Nothing else.
6. Obligation level (deterministic): regex over the evidence sentence modals → {must|shall|required → "required", should|recommended → "recommended", may|can|optional → "optional", none → "unspecified"}. Store on requirement as `source_obligation`. Label in UI as "source says: required", NOT as MoSCoW priority (that is a human decision).
7. Citation API: GET /claims/{id}/evidence → [{document, page, heading_path, sentence, context_before, context_after, char_start, char_end}]. Frontend ClaimModal/side panel renders the document text with the span highlighted and scrolled into view.
8. Report/export uses: `> "<quote>" — <document>, p.<page>, §<heading>`. Zero UUIDs anywhere user-visible.
9. Metrics script (extend P0 citation_audit.py) runs on Cornell: invalid_quote_rate, duplicate_quote_reuse (distinct claims sharing one quote), lexical_support distribution, grounded/contested/unsupported %.

ACCEPTANCE (targets are proposals; record actuals, tune after P9): invalid_quote_rate = 0% displayed; no quote reused by >3 distinct requirements unless the sentences are genuinely identical; Cornell contested% materially below the 22.6% baseline and unsupported% below 16.8% WITH an explanation of any remaining ones in the report; Playwright screenshot of the evidence panel highlighting a span for one Verified, one Inferred, one Contested claim.
REPORT: docs/reports/P2_REPORT.md with before/after metric table vs docs/BASELINE_OUTPUTS/cornell_po_vendor_baseline.md.
```

---

## P3 — ANALYST QUALITY, HIERARCHY, GAPS (Should)

```
GOAL: Turn 100+ flat requirements into a reviewable hierarchy with useful gap questions. Depends on P1, P2.

DO:
1. Keep Map-Reduce coverage extraction. After dedupe (cos 0.85, union citations), cluster into Capability → Requirement using a Gemini structured call that ONLY assigns existing requirement ids to named capabilities (it may not create or reword requirements). Python validates: every id assigned exactly once; no empty capabilities; cap at ~12 capabilities, else merge by embedding centroid similarity (Python).
2. Requirement typing via LLM classification into a closed enum {functional, business_rule, compliance, data, integration, role_permission, non_functional}; Python rejects out-of-enum values.
3. Gap analysis: Gemini proposes open questions ONLY of the form {question, why_it_matters, related_requirement_ids, suggested_owner_role}; Python drops questions with no related ids. Dedupe questions by embedding.
4. Contradictions: keep the detection; add deterministic numeric pre-check in Python (same noun-phrase + differing numbers/units across sentences) as a recall booster; LLM only adjudicates candidates. Persist both sentences as evidence.
5. FR-ANLY-04: contradiction resolution API {contradiction_id, chosen_sentence_id | custom_value, note, resolved_by}. Resolution marks dependent claims `stale` (Python graph walk over claim→requirement links) and queues a partial regeneration of only the affected artifacts.
6. Reviewer state on each requirement: {pending, accepted, rejected, edited}; edits create versions (FR-WS-01). Accepted/edited-by-human claims keep their Verifier status separately (human acceptance ≠ verified).

ACCEPTANCE: Cornell yields <= ~12 capabilities, every requirement under exactly one; planted contradictions in difficult_case recalled 100%; resolving a contradiction marks only the dependent artifacts stale (test with a graph fixture); unit tests for clustering validator and numeric pre-check.
REPORT: docs/reports/P3_REPORT.md
```

---

## P4 — WIREFRAME SYSTEM (Must) — addresses "UI/UX not proper"

```
GOAL: Gemini-generated, schema-validated, deterministically laid-out, visually QA'd wireframes with per-component evidence status. Depends on P1, P2.

1. SINGLE SOURCE OF TRUTH: docs/schemas/wireframe.schema.json. Generate Pydantic (backend) and TypeScript (frontend) from it; CI fails if they drift. Resolve the F5 drift by DEFINING the closed list here: header, nav_bar, tabs, search_filter, form(fields[]), table(columns[], sample_rows[]), stat_cards(items[]), list, detail_panel, button_row, empty_state, modal_stub, text. Anything else → validation error.
2. Screen model: {screen_id, name, purpose, persona, device: desktop|mobile, layout: enum(single_column|sidebar_content|master_detail|dashboard_grid), components[], navigates_to[screen_id], requirement_ids[]}. Gemini chooses layout enum + component order + labels + sample data. It does NOT choose pixels, colors, or sizes.
3. Generation: first call plans the screen list (3–6 screens) from capabilities/requirements (each screen must reference >=1 requirement id); second call (parallel per screen) fills components. Sample data must be domain-plausible and every sample row flagged `placeholder:true` (shown as such in UI). Fail closed on invalid JSON after 1 repair retry; never ship a generic template screen.
4. Per-component status — Python: component.status = aggregate of its requirement_ids' claim statuses (any contested→contested; else any unsupported→unsupported; else any inferred→inferred; else verified). No requirement_ids → inferred with reason "no source requirement". Never LLM-assigned.
5. Screen-flow diagram: Python builds a Mermaid flowchart from navigates_to; node classes by screen status.
6. Renderer `WireframeRenderer.tsx`: one React component per type, low-fi (greyscale, system font, 12-col grid from layout enum), desktop and mobile frames, hover shows requirement ids, click opens the evidence side panel. No `[object Object]`, no hardcoded demo numbers anywhere (grep CI check for the strings "1,248", "94.2%").
7. Visual QA (Playwright, per screen, both viewports): deterministic checks — non-empty render, no component with zero bounding box, no horizontal overflow, all text non-empty, every component has a status class. Then ONE Gemini vision call per screenshot returning {legible: bool, overlapping: bool, looks_like_ui: bool, issues: []} — classification only. Any failure → regenerate that screen once; second failure → screen flagged `needs_review` (visible), pipeline continues.
8. Export: server-side PNG per screen (Playwright) for the PDF in P5. Downloadable ZIP of PNG + JSON.
9. Regression: golden JSON fixtures for all 4 datasets; a test asserts each renders non-blank and the difficult_case has >=1 non-verified component.

ACCEPTANCE: screenshots (1440 & 375) of all screens for Cornell and difficult_case attached in report; schema drift CI check passes; zero React object-as-child errors; Cornell wireframes visibly about vendor management (assert domain nouns from requirements appear in labels).
REPORT: docs/reports/P4_REPORT.md
```

---

## P5 — CLIENT-GRADE REPORT + REAL PDF (Must)

```
GOAL: A deliverable a consultancy can send to a client unchanged. Depends on P2, P4.

1. Pipeline: structured report model (Pydantic ReportDocument) → HTML (Jinja2 templates + print CSS) → PDF via Playwright/Chromium page.pdf (A4, margins, page numbers, running header/footer, TOC with working links). Also emit Markdown from the same model. DOCX (Should): python-docx from the same model.
2. Executive summary: Gemini structured output {context, objectives[], scope_in[], scope_out[], key_decisions[], top_risks[], needs_clarification[]}. Each bullet <= 30 words and must list >=1 supporting requirement_id; Python drops bullets without valid ids. Hard cap on the summary: 1 page. No run-on paragraphs (assert max sentence length <= 40 words).
3. Cover: workspace display name (user-editable at export), real generation date (ISO + localized), version number, prepared-by/org + optional logo (white-label), confidentiality line. Remove internal "NVIDIA NIM / Nemotron / Llama" text from the cover and body; put a plain-language Verification Statement in §9 and a Methodology note in the appendix (provider names allowed ONLY there, from the llm_calls ledger so it is factual).
4. Sections (keep the 10 from the hardening brief, order unchanged): Exec summary; Source index (document, type, pages, date ingested); Requirements grouped by Capability with priority = human-set (if unset: show source obligation level) + status badge + quoted evidence (P2 format); Open questions & contradictions as action items with owner roles; Architecture (rendered SVG + decisions table with status); Wireframes (PNGs + caption + linked requirements); Data model (ER SVG) + API table; Estimate range + reference-case ranges + phased roadmap; Verifier summary in plain language with Python-computed percentages; Appendix: full citation index.
5. Diagrams: render Mermaid → SVG server-side (mermaid-cli/Playwright) using the status classDefs from the existing diagram_styler; include a legend (Verified / Inferred / Contested / Unsupported).
6. Gate: export requires human_confirmed=true AND no `pending` claims AND stage `verifier` completed (I8). If degraded, the report states it prominently.
7. Estimator honesty: reference cases stay synthetic and labeled "illustrative scope bands, not historical projects". (Could) widen the estimate range as a Python function of contested+unsupported share; show the formula in the appendix.

TESTS (golden/structural): PDF opens; page count > N; regex finds 0 UUIDs; 0 occurrences of "Recently", "Test -", "NIM", "Nemotron" outside the Methodology appendix; image count >= (diagrams + screens); every requirement quote validated against the source (reuse P2 validator); TOC entries == section headings.
ACCEPTANCE: Cornell PDF attached; side-by-side with baseline listed in the report with specific improvements; I read the PDF page images via Playwright/pdf2image and describe layout defects found.
REPORT: docs/reports/P5_REPORT.md
```

---

## P6 — REVIEW-FIRST APP UX (Must) — the app's own UI/UX

```
GOAL: Redesign the app shell and workspace around the user's real job: reviewing and signing off a blueprint fast. Depends on P2–P5 APIs. Read the frontend-design skill / principles before starting; pick ONE deliberate visual direction (professional, calm, data-dense; not a templated landing-page look), define tokens (type scale, spacing, color, radius, shadows, status colors with AA contrast) in one file, and use them everywhere. Tailwind + shadcn/ui.

INFORMATION ARCHITECTURE (replace the 8-tab overflow):
 Dashboard (workspaces, status, last activity) → Workspace with a left stepper: 1 Sources → 2 Generate → 3 Review → 4 Deliverables.
 Review has sub-views: Requirements, Architecture, Screens, Data & API, Estimate, Open items. Max 6 visible; no horizontal tab overflow at 375px.

KEY SCREENS/BEHAVIOUR:
 a) Sources: drag-drop, per-file status (parsing/embedding/ready/failed with reason), type/size limits shown BEFORE upload, remove file, text paste.
 b) Generate: real stage progress from SSE with ETA based on historical stage durations, cancel, resumable after refresh (relies on P7 job queue), failure messages in plain language with a "retry stage" action.
 c) Review: split view — left list (grouped by Capability, collapsible), right evidence panel with the source document and highlighted sentence. "Needs attention" queue first: Contested, Unsupported, Contradictions, open questions; then the rest. Filters: status, capability, type, source obligation, reviewer state. Bulk accept (only for Verified), reject, inline edit with version history. Keyboard: j/k move, a accept, r reject, e edit, / search, ? help.
 d) Summary header always visible: % reviewed, counts by status (Python numbers), blockers to export.
 e) Deliverables: preview of the report, confirm checkbox + name/logo fields, download PDF/MD/DOCX, history of exports.
 f) Global: toast system for every failed request, skeleton loaders, empty states with one primary action, error boundary per view, offline/expired-session handling, undo for destructive actions.
 g) Accessibility: WCAG 2.1 AA — contrast, focus rings, ARIA for chips/panels, reduced motion; status never conveyed by color alone (icon + label).
 h) Responsive: usable at 375px (review list → full-screen evidence sheet).

TESTS: Playwright e2e for the full journey (signup → upload → generate → review → accept → export); visual regression snapshots (1440/768/375); axe-core accessibility scan with zero serious/critical violations; Lighthouse performance/a11y scores recorded (report actuals; do not claim targets that weren't measured).
ACCEPTANCE: screenshots of every screen before/after; time-to-first-meaningful-review measured (clicks from upload to first accept); no horizontal overflow at 375px on any screen; all old "Working" claims re-proven.
REPORT: docs/reports/P6_REPORT.md
```

---

## P7 — MULTI-TENANT SAAS FOUNDATIONS (Must)

```
GOAL: Make it safe and operable for multiple companies. Depends on P1; coordinate with P6.

1. Orgs: tables organizations, memberships(user_id, org_id, role: owner|editor|viewer), invitations (token, expiry). Workspaces belong to an org. RLS rewritten: access via membership; viewers read-only. Tests: two orgs, three roles, direct-ID API probing, storage object paths scoped by org.
2. Job queue: generation currently streams over a request. Add a durable `jobs` table + worker process (Postgres SKIP LOCKED is enough; no Redis). States: queued/running/succeeded/failed/cancelled; per-stage checkpoints so a restart resumes at the failed stage; idempotency key per (workspace, input_hash); SSE reads job events from DB so refresh/reconnect works. One concurrent generation per workspace.
3. Quotas & rate limits (Python, persistent in Postgres): per-org monthly generation count and per-day token budget from a plans table; per-user burst limit on /generate; HTTP 429 with Retry-After and a human message. Metering from the llm_calls ledger (P1).
4. Data lifecycle: DELETE workspace = purge rows, vectors, storage objects, caches, and write a deletion receipt; org-level retention setting; export-all-data endpoint. Document what each sub-processor receives (Gemini, Groq, Sarvam…) in docs/DATA_FLOW.md.
5. Audit log: who did what (login, upload, generate, accept/reject/edit, export, invite, delete) — append-only table, viewable by owners.
6. Optional pre-LLM redaction (Could): deterministic regex for emails/phones/govt-ID patterns → placeholders, reversible mapping stored encrypted; toggle per workspace; clearly labeled best-effort.
7. Ops: request-ID middleware, structured JSON logs (no secrets/doc text), Sentry (or equivalent) for FE+BE, /healthz + /readyz, DB migrations versioned (alembic or supabase migrations) with a one-command apply, backup/restore runbook, secrets via env only, CORS locked to the real origin, upload limits + MIME sniffing + AV-scan hook (clamav optional).
8. Hosting: write docs/DEPLOY.md for always-on backend + worker (free sleeping instances are NOT acceptable for customers; list 2–3 options, verify current pricing yourself before recommending) with GROUNDWORK_MODE=prod checklist.

TESTS: cross-org isolation suite; role matrix; job resume after kill -9 mid-stage; quota 429 behavior; deletion leaves zero rows/objects (assert via queries).
REPORT: docs/reports/P7_REPORT.md
```

---

## P8 — BILLING & PLANS (Should)

```
GOAL: Charge money, deterministically. Depends on P7 quotas.
- Payment provider: choose between Stripe and Razorpay based on what your legal entity can actually onboard TODAY (verify; do not assume). Abstract behind a BillingProvider interface.
- plans table drives quotas (generations/mo, seats, retention). Python computes entitlements; frontend only displays them.
- Flows: free trial (hard-capped, demo-mode providers NOT allowed for real data), checkout, customer portal, webhook handlers (signature verified, idempotent), dunning state → read-only (never delete data on non-payment), invoices.
- Pricing is NOT decided here. Implement plans as data. Pricing hypotheses come from P9 COGS + pilot feedback.
TESTS: webhook replay idempotency, entitlement changes on upgrade/downgrade, read-only on past_due.
REPORT: docs/reports/P8_REPORT.md
```

---

## P9 — EVAL HARNESS, PROVIDER A/B, COST MODEL (Must)

```
GOAL: Prove quality with numbers and decide "Gemini first" with data. Depends on P1, P2.

1. Datasets (docs/eval/): Cornell SOP + >=4 more synthetic domains (e.g., HR onboarding, claims intake, clinic scheduling, logistics dispatch). Each with a hand-written ground-truth file: planted contradictions (>=3), planted gaps (>=5), and 30 hand-labeled "gold" requirements with exact source sentences.
2. Metrics (all Python, reproducible): invalid_quote_rate; grounded/inferred/contested/unsupported %; gold-requirement recall (embedding match >= 0.8 AND quote overlap); planted-contradiction recall; planted-gap recall; verifier agreement rate; tie-break rate; wireframe QA pass rate; latency per stage; tokens and est. cost per blueprint (from llm_calls).
3. HUMAN-LABELED SAMPLE (cannot be automated): script exports 100 random Verified claims + their evidence to a CSV for YOU to label correct/incorrect. Compute observed precision of "Verified" with a confidence interval. This is the only honest basis for any accuracy claim. Until it exists, no marketing copy may state an accuracy number.
4. Provider A/B: run the same datasets with generate_order = [gemini,groq,nvidia] vs [groq,gemini,nvidia] vs gemini-only fast model; report quality metrics, cost, latency. Output docs/eval/PROVIDER_AB.md with a recommendation.
5. CI gate: `make eval-smoke` (1 small dataset, cached/fake providers) on every PR; nightly `make eval-full` writes metrics to a table; fail PR if invalid_quote_rate > 0 or gold recall drops > a configurable delta.
6. Cost model: spreadsheet-ready CSV of COGS per blueprint by provider and by document size; sensitivity at 10/50/200 blueprints per org per month. Show gross-margin math for 3 hypothetical price points — labeled hypotheses.
REPORT: docs/reports/P9_REPORT.md (include the metric table and what the numbers do NOT show).
```

---

## P10 — TRUTHFUL LAUNCH ASSETS + PILOT PROTOCOL (Must)

```
GOAL: Ship something a skeptical buyer can verify. Depends on P5–P9.

1. Landing copy audit: every claim maps to a shipped, tested feature (keep a claim→test table in docs/CLAIMS.md). Remove or reword anything unproven. No accuracy numbers unless P9 human-labeled precision supports them, with the sample size shown. No "SOC 2", "enterprise-grade security" or "zero hallucination" language.
2. Pages: pricing (plans from P8 data), security & data-handling (honest: sub-processors, retention, ZDR status, what you do NOT have yet), sample blueprint (public synthetic Cornell-like report PDF), docs/how-it-works, changelog, status.
3. Legal drafts: Terms, Privacy Policy, DPA template, sub-processor list generated from providers.yaml. Mark clearly "template — needs review by a qualified lawyer before use". I am not a lawyer.
4. Onboarding: first-run sample workspace pre-generated (synthetic data), 3-step checklist, in-app feedback widget, product analytics events for: upload, generate success/fail, % requirements accepted without edit, time from upload to export, export count.
5. PILOT PROTOCOL (docs/PILOT.md): recruit 3–5 consultancies/internal IT teams; run on a REAL (consented) project in prod mode; pre-register success metrics BEFORE the pilot: baseline hours for their manual BRD, hours with GroundWork, % requirements accepted unchanged, # critical misses found by their reviewer, would-they-pay + price they name. Include a consent form and a data-handling summary. Define a kill/continue decision rule in advance.
6. Support loop: weekly review of failed jobs, contested rates, and every reviewer edit (edits are labeled training data for P9's gold set).
REPORT: docs/reports/P10_REPORT.md
```

---

## 2. EXECUTION ORDER & GATES

```
P0 ──► P1 ──► P2 ──► (P3 ∥ P4) ──► P5 ──► P6 ──► P7 ──► P9 ──► P10
                                              └──► P8 (after P7)
GATE A (after P2): Cornell citations all valid; contested%/unsupported% reported vs baseline.   → continue only if Gate A is explained.
GATE B (after P6): full journey e2e green; screenshots reviewed by you.
GATE C (after P9): human-labeled precision measured; provider A/B decided; COGS known.        → only now set prices.
GATE D (after P10 pilot): continue/kill per pre-registered rule.
```

## 3. ENV CHECKLIST (prod mode)
```
GROUNDWORK_MODE=prod
GEMINI_API_KEY=… (billing-enabled project)   GEMINI_BILLING_CONFIRMED=true
GEMINI_MODEL_PRIMARY=<from models.list>      GEMINI_MODEL_FAST=<from models.list>
GROQ_API_KEY=… (Developer plan, ZDR on)       GROQ_PLAN_CONFIRMED=true
GROQ_MODEL_A/B/C=<three distinct families from /models>
NVIDIA_API_KEY=…  (demo mode only unless you hold a production license/partner endpoint)
SARVAM_API_KEY=…  (paid credits for prod)
SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / DATABASE_URL / VITE_SUPABASE_ANON_KEY
SENTRY_DSN, APP_ORIGIN
```
