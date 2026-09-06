# PRODUCT REQUIREMENTS DOCUMENT
# GroundWork AI — An Evidence-Grounded Business Transformation Copilot
### Prepared for: Team submission to Chaos2Commit (Futurrizon × CHARUSAT), Business Transformation AI (AI Solution Builder) track
### Version 1.0 | August 29, 2026

---

## 0. DOCUMENT CONTROL

| | |
|---|---|
| Document type | Product Requirements Document (PRD) — build-ready |
| Companion document | `Chaos2Commit_Winning_Strategy.md` (deep research report; this PRD is self-contained but that report has the full source list) |
| Owner | Team (assign a DRI — "directly responsible individual" — per section) |
| Status | Ready to execute |
| Read this document top to bottom once, then use Part G as your daily working checklist |

**How this PRD is organized:**
- **Part A** — the research and reasoning for *why* we picked this problem (self-contained; you should be able to defend every sentence of this to a judge from memory).
- **Part B** — product vision, goals, users.
- **Part C** — every feature, specified precisely enough that two different people would build the same thing from it.
- **Part D** — non-functional requirements (security, performance, compliance).
- **Part E** — the actual system and AI architecture, with technology choices justified by 2026 research, not vibes.
- **Part F** — every screen the user will see.
- **Part G** — the literal, step-by-step, day-by-day build plan. **This is the part you should print out.**
- **Part H** — demo, video, and pitch deck, written almost word-for-word.
- **Part I** — risk register.
- **Part J** — judge Q&A drill.
- **Part K** — what happens after the hackathon (shows judges we're thinking past the demo).

---

# PART A — WHY THIS PROBLEM STATEMENT (FULL RESEARCH RATIONALE)

You will be asked, on camera and possibly live, "why did you pick this one?" Everyone on the team needs to be able to answer this without reading from a slide. This section is written so you can.

## A.1 The three options, and the one-line verdict on each

| Track | One-line verdict |
|---|---|
| **Business Transformation AI (AI Solution Builder)** — **CHOSEN** | Legally clean, technically deep, and it is functionally the organizer's own product category. |
| AI Reels (Next-Gen Social Entertainment Platform) | Its headline feature — aggregating short videos across platforms — is not honestly buildable without paid licensing deals; everything else is a thin, unfunded clone of Instagram/TikTok. |
| AI Sales Agent Platform | Good demo potential (a live AI phone call is a crowd-pleaser) but sits in the most saturated market of the three, built on a lead-discovery method (scraping LinkedIn/X posts) that is actively being litigated. |

## A.2 The decision framework we used

We scored all three tracks against five weighted dimensions that map to the *only* rubric the organizer actually published — the five required elements of the registration video (Understanding, Innovation, Technical Approach, Monetization, Business Value) — and then applied a legal/feasibility risk modifier on top, because a brilliant idea that cannot be honestly demonstrated scores zero on "Technical Approach" no matter how good the slide looks.

| Dimension (20 pts each) | Business Transformation AI | AI Reels | AI Sales Agent |
|---|---:|---:|---:|
| Problem Understanding | 17 | 12 | 15 |
| Innovation potential | 17 | 10 | 12 |
| Technical Approach | 18 | 8 | 14 |
| Monetization clarity | 16 | 9 | 15 |
| Business Value / Impact | 16 | 10 | 15 |
| **Legal/feasibility risk modifier** | **0** | **−15** | **−8** |
| **TOTAL /100** | **84** | **34** | **63** |

## A.3 Why Business Transformation AI wins — five independent reasons that all point the same way

**Reason 1 — It is legally the safest of the three.** Every feature we plan to build reads the user's *own uploaded documents*. Nothing depends on scraping a third party's platform. This matters because both other tracks fail specifically on this point (see A.4 and A.5).

**Reason 2 — The organizer is, functionally, the exact buyer for this product.** Futurrizon Technologies is a registered Microsoft Solutions Partner headquartered in Ahmedabad, specializing in Dynamics 365 Business Central, Power Platform, and Azure-based digital transformation, serving clients in media, education, and financial services. The Business Transformation AI brief they published isn't a hypothetical case study — it reads like their own product roadmap. Every judge in the room will be evaluating this pitch against their own professional instincts about what a real digital-transformation client actually needs, which means depth and correctness will be rewarded more than surface polish.

**Reason 3 — There is a real, confirmed market gap, not an assumed one.** We researched every adjacent category before concluding this:
- **BRD/requirements generators** (EltegraAI, Clappia, Cohesive) turn conversation or an existing BRD into a document or a no-code app — and stop there. No architecture, no wireframes, no estimation.
- **AI-first enterprise architecture platforms** (Ardoq, which shipped a major AI-first release in May 2026, and LeanIX) ground their AI agents in an organization's *existing*, already-modeled IT estate — the opposite starting point from a new business idea with no existing architecture to model.
- **AI wireframe/UI generators** (Uizard, Galileo AI, UX Pilot, v0, Figma Make) are excellent at turning a prompt into a screen, and stop there — no requirements layer underneath, no architecture, no database design, and critically, no traceability back to *why* a given screen exists.
- **Generic LLM chat** (ChatGPT, Copilot) can produce any single one of these artifacts if prompted well, but has no persistent, shared, cited context object that keeps five different artifact types consistent with each other over an extended working session.

None of the above combine all five layers — requirements, architecture, UI, data model, estimate — grounded in one shared, auditable trail of evidence. That combination is the whitespace.

**Reason 4 — The technical ceiling is high enough to reward a real team.** Multi-agent orchestration, retrieval-augmented generation, and grounding/verification design are all active, fast-moving 2026 engineering topics with real published research and real production patterns to draw on (Part E cites the specific frameworks and papers). This is a track where a technically strong team can visibly out-build a team that just wraps a single prompt — which is exactly the differentiation a judging panel of working engineers will notice.

**Reason 5 — The organizer told us, in writing, what to build on top of the minimum.** Every one of the three problem-statement PDFs ends with the same note: the listed features are a *floor*, and teams are explicitly invited to propose additional USPs and differentiators. For the Business Transformation AI brief specifically, the "Important Notes" section states that AI-generated recommendations are advisory and *must be validated before implementation*. That sentence, sitting in the middle of the compliance boilerplate, is effectively a hint about what the organizer cares about — and it is exactly the feature most competing teams will skip, because "the AI might be wrong" is an uncomfortable thing to build a demo around. We are building our entire differentiator on top of it (Part C, the Verifier module).

## A.4 Why we eliminated AI Reels

The brief's flagship module, "AI Universal Reels Discovery," requires aggregating and recommending short-form video content sourced from other platforms. Our research found this significantly harder than it sounds to do honestly:
- Instagram, TikTok, and YouTube Shorts all actively detect and algorithmically suppress re-hosted or watermark-stripped cross-platform content — Instagram's 2026 "Originality Score" specifically targets this.
- Copyright exposure on re-served third-party content is real and independent of any in-app attribution note; a platform's own usage guidelines (e.g., "personal use only" music licenses) do not extend to redistribution elsewhere.
- The legitimate path — official platform APIs with licensing/revenue-share agreements — is a business-development and legal process measured in months, not something a student team can stand up credibly by a hackathon deadline.

Strip out that one module and what remains (native video upload, AI companion/avatar, gamified streaks, creator/business tools) is a well-executed but generic social app competing directly against products with billions of dollars of infrastructure behind them — a weak position for a 5-minute pitch to defend on "Innovation" or "Technical Approach."

## A.5 Why we eliminated AI Sales Agent Platform

This is the strongest of the two alternatives, and the closest runner-up, for a specific reason: a live AI voice call is one of the best "wow" demos available in any hackathon. But two structural problems outweigh that:

1. **Market saturation.** Apollo.io (210M+ contacts, its own agentic assistant shipped March 2026), Clay (with "Claygent," a purpose-built AI research agent, recently repriced to be more accessible), and fully autonomous AI SDR products like Artisan's "Ava" and 11x's "Alice" already do most of what the brief describes, at real scale, with real funding. A judge who works in enterprise software will likely know several of these by name.
2. **A documented trust problem in the exact category we'd be entering.** Fully autonomous AI SDR products have had real quality issues in market — one major player reportedly lost 70–80% of its customers within months, with users describing generic-feeling output despite detailed targeting data. That's a warning sign for anyone pitching "autonomous AI sales agent" as differentiation.
3. **The data-acquisition method sits on contested legal ground.** The brief's "AI Lead Discovery" module explicitly relies on finding prospect requirement posts on LinkedIn and X. LinkedIn's User Agreement explicitly prohibits scraping, and LinkedIn has actively litigated this — including a 2025–2026 suit against a data-scraping vendor (Proxycurl/Nubela) that ended in a settlement requiring permanent data deletion and a court injunction. The often-cited "hiQ v. LinkedIn" precedent only protects against one specific U.S. criminal statute (the CFAA); LinkedIn has separately and successfully sued on breach-of-contract grounds even for public-data scraping.

Both are mitigable with real engineering effort and legal review — but neither is the safest starting point for a week-long build.

## A.6 What we owe the organizer: full spec coverage, not just the novel part

Because the brief explicitly frames its feature list as a **minimum**, Part C of this PRD deliberately covers the *entire* published feature set (AI Discovery Sessions, prompt-based solutioning, document upload, chat assistant, solution architecture, BPMN workflows, wireframes, database/API recommendations, roadmaps/estimates, collaboration, version history, exports, enterprise integrations) — not just our headline differentiator. A judge who re-reads the original PDF while watching our demo should see every listed module represented, plus the Verifier layer we're adding on top.

---

# PART B — PRODUCT VISION & STRATEGY

## B.1 Vision statement

*Every business transformation starts as a mess of half-written notes, old SOPs, and someone's voice memo. GroundWork AI turns that mess into an implementation-ready blueprint — and, unlike every tool that already does something like this, it shows exactly which part of the blueprint it actually knows, and which part it's guessing.*

## B.2 Problem statement (refined)

**For** business analysts, solution architects, and digital-transformation consultants **who** need to convert unstructured business input into implementation-ready specifications, **GroundWork AI** is an AI business-transformation copilot **that** generates a fully connected requirements → architecture → UX → data → roadmap blueprint from raw source material, with every claim traceable to its evidence. **Unlike** BRD generators, EA platforms, and wireframe tools that each solve one layer in isolation with no shared, auditable context, **GroundWork AI** keeps all five artifact layers consistent and shows its work.

## B.3 Goals (hackathon) vs. Non-Goals (explicitly out of scope for the hackathon build)

| In scope for the hackathon MVP | Explicitly out of scope for the hackathon (roadmap only — see Part K) |
|---|---|
| Document/voice/image ingestion for a small demo corpus | Enterprise SSO / full multi-tenant security hardening |
| Requirements extraction, gap detection | Full BPMN-standard-compliant workflow engine |
| Architecture diagram generation (Mermaid-based) | Native Jira/Azure DevOps two-way sync |
| Wireframe generation (structured JSON → rendered screens) | Production-grade multilingual translation (demo can show the *design* for it — see D.5 — without full localization) |
| ER diagram / API surface generation | Live billing/subscription system |
| Rough effort/cost/timeline estimation with ranges | Full audit-log/compliance certification (SOC2 etc.) |
| The Verifier: citation + confidence + "unsupported" flagging | Blueprint Drift Detector fully working end-to-end (build a partial/demo version at most — see Part K) |
| Basic export (PDF/Markdown) | Full PDF/Word/Excel/PPT export fidelity matching the brief's "Export Reports" list |

## B.4 Success metrics

**Hackathon success metrics (what we're actually optimizing for by Sept 6):**
1. A working, click-through demo covering the full pipeline (ingestion → all five artifacts → Verifier flag) on the chosen demo dataset (Part C.9 / Part H).
2. The 5-minute video, scripted to hit all five required elements, submitted before the deadline.
3. Every checklist item complete: team name, leader, challenge selected, all members' names/year/semester, resumes, GitHub links, LinkedIn profiles.

**Product success metrics (stated in the pitch, clearly labeled as targets, not measured facts):**
| Metric | Target | Status |
|---|---|---|
| Time from raw source docs to reviewable first-draft blueprint | Under 10 minutes | Demo target |
| Share of generated claims carrying a visible citation or "unsupported" flag | 100% | Design goal, enforced architecturally (Part E.4) |
| Cross-artifact consistency (architecture ↔ wireframe ↔ ER diagram agree) | No contradictions in demo run | Enforced by shared context graph, to be shown live |

## B.5 Personas

**Persona 1 — Priya, Business Analyst at a mid-size IT consultancy (primary user)**
Spends most of her week translating client interviews and old SOPs into BRDs by hand. Her biggest fear isn't writing the document — it's missing a requirement the client mentioned once, in passing, in meeting three. She needs a tool that never quietly drops something she said, and that clearly tells her which parts of a generated document are solid and which need a follow-up question.

**Persona 2 — Kabir, Solution Architect (secondary user)**
Reviews Priya's BRDs and turns them into architecture diagrams. He's skeptical of AI-generated architecture because he's been burned before by confident-sounding but wrong recommendations. He will only trust a tool that shows its reasoning and lets him challenge any individual decision.

**Persona 3 — Meera, small-business owner (the eventual end client, non-technical)**
Has a business idea and a folder of messy notes. She doesn't know what a BRD or an ER diagram is — she just wants someone to tell her what to build and roughly what it will cost. GroundWork AI's output has to be reviewable by Priya/Kabir but also legible enough that Meera can look at the roadmap and estimate and understand it.

---

# PART C — DETAILED FUNCTIONAL REQUIREMENTS

Every requirement below has an ID, so the team can reference exact scope in standups and in the video ("we implemented FR-VER-01 through 04 live, FR-EXP-02 is stubbed"). Priority uses MoSCoW: **M**ust have for the hackathon demo, **S**hould have if time allows, **C**ould have (stretch), **W**on't have this round (Part K).

## C.1 Module: Discovery (Ingestion)

| ID | Requirement | Priority |
|---|---|---|
| FR-DISC-01 | User can upload one or more documents (PDF, DOCX, TXT) as source material for a workspace | M |
| FR-DISC-02 | User can upload/paste a transcript of a voice note (live audio transcription is a stretch goal — pre-transcribed text is acceptable for the demo) | M |
| FR-DISC-03 | System chunks and embeds every uploaded source document into a vector store, tagged with source-document ID and location (page/paragraph) | M |
| FR-DISC-04 | User can upload a screenshot of a legacy application screen; system extracts visible text/labels via OCR as additional context | S |
| FR-DISC-05 | System supports at least English for the hackathon demo; UI copy and prompts are written to be easily localized (see D.5) | M |
| FR-DISC-06 | User can add free-text context directly (a chat box) in addition to uploaded files, matching the brief's "AI Chat Assistant" / "prompt-based solution" requirement | M |

## C.2 Module: Analyst (Requirements & Gap Extraction)

| ID | Requirement | Priority |
|---|---|---|
| FR-ANLY-01 | System extracts a structured list of functional requirements from the ingested context, each tagged with its supporting source citation(s) | M |
| FR-ANLY-02 | System performs gap analysis: identifies information a complete BRD would need but that is missing from the source material, and lists it as open questions for the user | M |
| FR-ANLY-03 | System detects direct contradictions across source documents (e.g., two different numeric thresholds for the same rule) and surfaces them explicitly rather than silently picking one | M |
| FR-ANLY-04 | User can answer an open question or resolve a contradiction inline, and the system re-runs downstream generation incorporating the new input | S |
| FR-ANLY-05 | Current/future-state summary: a short structured comparison of "how it works today" vs. "what's being proposed," matching the brief's "digital maturity assessment" and "current & future state analysis" language | S |

## C.3 Module: Architect (Solution Architecture)

| ID | Requirement | Priority |
|---|---|---|
| FR-ARCH-01 | System generates a high-level architecture diagram (as Mermaid diagram-as-code, not a static image) from the Analyst's requirement set | M |
| FR-ARCH-02 | Every architectural decision (e.g., "uses a message queue here") is individually clickable and shows its supporting citation or an "inferred, not directly stated" flag with a confidence score | M |
| FR-ARCH-03 | User can regenerate the architecture with an explicit constraint (e.g., "must be Azure-only," matching the brief's "Microsoft ecosystem solutions" requirement) | S |
| FR-ARCH-04 | System generates a simple process/workflow diagram (swimlane or flowchart style, Mermaid-based) for at least one key business process identified by the Analyst, mapping to the brief's "Process Workflows & BPMN" requirement | M |

## C.4 Module: UX Designer (Wireframes)

| ID | Requirement | Priority |
|---|---|---|
| FR-UX-01 | System generates a structured (JSON) wireframe spec for at least 2–3 key screens implied by the requirements, rendered as a low-fidelity UI in the frontend | M |
| FR-UX-02 | Each generated screen element traces back to the specific requirement that justified it | S |
| FR-UX-03 | User can request a regeneration of a single screen without regenerating the whole set | C |

## C.5 Module: Data & Integration Designer

| ID | Requirement | Priority |
|---|---|---|
| FR-DATA-01 | System generates an ER diagram (Mermaid) from the requirement set, showing key entities and relationships | M |
| FR-DATA-02 | System proposes a minimal REST API surface (endpoint list with method + purpose) consistent with the ER diagram and the architecture | S |

## C.6 Module: Estimator

| ID | Requirement | Priority |
|---|---|---|
| FR-EST-01 | System produces an effort/cost/timeline estimate expressed as a **range**, never a single false-precise number | M |
| FR-EST-02 | Every estimate is shown alongside the comparable reference case(s) the system used to calibrate it | S |
| FR-EST-03 | Estimate updates automatically if the requirement set changes materially | C |

## C.7 Module: Verifier (the core differentiator — build this first, protect it hardest)

| ID | Requirement | Priority |
|---|---|---|
| FR-VER-01 | Every generated statement across every artifact (BRD line, architecture decision, wireframe element, ER field, estimate line) is classified as exactly one of: **Verified** (directly supported by a cited source passage), **Inferred** (a reasonable extrapolation, shown with a confidence score), or **Unsupported** (no source basis found — must be validated by a human) | M |
| FR-VER-02 | Clicking any generated claim opens a side panel showing the exact source sentence(s) it is grounded in, or the explicit "no supporting source found" message | M |
| FR-VER-03 | The Verifier check is implemented as an **independent model call** that only sees the generated claim plus the retrieved source chunks — never the original generation prompt — so it cannot simply "agree with itself" | M |
| FR-VER-04 | Contradictions detected in FR-ANLY-03 propagate as visible warnings on every downstream artifact that depended on the contradictory input | S |
| FR-VER-05 | A workspace-level summary shows the percentage of Verified / Inferred / Unsupported claims, so a reviewer can gauge overall confidence in the blueprint at a glance | S |

## C.8 Module: Workspace, Collaboration & Export

| ID | Requirement | Priority |
|---|---|---|
| FR-WS-01 | User can edit any generated artifact directly; edits are tracked with a simple version history | S |
| FR-WS-02 | Basic commenting on any artifact element | C |
| FR-WS-03 | Export the full blueprint (or any single artifact) to Markdown/PDF | M |
| FR-WS-04 | Export to Word/Excel/PPT formats, matching the brief's stated export list | W (post-hackathon; mention on roadmap slide) |
| FR-WS-05 | Enterprise API integration hooks (stub/mocked for demo) | W |

## C.9 Demo dataset requirements (supports Part H)

| ID | Requirement | Priority |
|---|---|---|
| FR-DEMO-01 | A "normal" source set: one clean, well-written SOP for a simple approval workflow | M |
| FR-DEMO-02 | A "difficult" source set: a messy transcript with a genuine numeric contradiction (e.g., two different approval thresholds) | M |
| FR-DEMO-03 | An "edge" source: a low-quality scanned document requiring OCR | S |
| FR-DEMO-04 | All demo data must be synthetic/fictional — no real client or company data, to avoid confidentiality and copyright issues | M |

---

# PART D — NON-FUNCTIONAL REQUIREMENTS

| Category | Requirement |
|---|---|
| **D.1 Security** | Workspace-scoped storage; no cross-workspace data leakage even at prototype stage, since the product's entire subject matter is client business documents. Role-based access is a stated design principle even if only partially implemented for the demo. |
| **D.2 Performance** | Full pipeline (ingestion → all five artifacts) should complete within a few minutes for the demo dataset; parallelize the Architect/UX/Data agent calls rather than running them sequentially. |
| **D.3 Reliability / grounding** | This is the most important NFR in the whole document. Published 2026 research on RAG systems is consistent on the pattern to follow: ground every claim in retrieved source passages, require the model to explicitly abstain (mark "unsupported") rather than guess when no passage supports a claim, and layer a second, independent verification pass on top of generation rather than trusting a single model call — published benchmarks (e.g., FActScore, RAGTruth) show a disciplined retrieval-plus-citation approach measurably reduces unsupported claims compared to an ungrounded, closed-book baseline. Multi-step agent workflows are also documented to be the failure mode most prone to compounding errors across steps, which is exactly why the Verifier (C.7) is architected as an independent, separately-scoped check rather than a final "review your own work" instruction bolted onto the same agent. |
| **D.4 Auditability** | Every artifact should be reproducible: given the same source documents and the same version of the pipeline, the citation trail should be inspectable and explainable to a human reviewer after the fact. |
| **D.5 Multilingual readiness** | All three problem-statement PDFs explicitly require the eventual product to be multilingual. For the hackathon, build the UI copy and prompt templates so that swapping in a translation layer later is straightforward (no hardcoded English strings baked into generation logic) — and say so explicitly in the pitch as a stated design principle, even though full localization is out of scope for the 8-day build. |
| **D.6 Data handling** | Enterprise-grade encryption and org-level security policy are explicitly called out in the source brief; document this as the intended production posture in the architecture slide even where the prototype implements a simplified version. |
| **D.7 Accessibility** | Basic accessible color contrast and keyboard navigation in the demo UI — low effort, easy win in a UI review. |

---

# PART E — SYSTEM & AI ARCHITECTURE

## E.1 High-level architecture

```
[User] → [Frontend: workspace UI + live agent-trace panel]
              ↓
        [Orchestration layer: agent pipeline]
              ↓
   ┌─────────────────────────────────────────────┐
   │ Discovery Agent → Analyst Agent → (parallel: │
   │ Architect Agent | UX Agent | Data Agent) →   │
   │ Estimator Agent → Verifier Agent             │
   └─────────────────────────────────────────────┘
              ↓                          ↓
     [Vector store: chunked,      [Postgres: structured
      embedded source docs]        requirement/context graph]
              ↓
        [Export layer: Markdown/PDF]
```

## E.2 Tech stack, with justification

| Layer | Choice | Why |
|---|---|---|
| Frontend | React | Fast to build a workspace UI + a live "agent trace" panel; team likely already knows it |
| Backend/orchestration | Python (FastAPI) | Best ecosystem support for the agent framework below and for embeddings/RAG tooling |
| **Agent orchestration framework** | **CrewAI for the hackathon build** | Multiple independent 2026 comparisons of agent frameworks converge on the same conclusion: CrewAI has the fastest path from zero to a working multi-agent demo ("something working in 30 minutes" per hands-on comparisons) because it's built specifically around role-based agent teams — which is exactly our Discovery/Analyst/Architect/UX/Data/Estimator/Verifier structure. LangGraph offers more precise control and is the more common choice for production-grade, long-running systems, but has a steeper learning curve; it's the right *next* step, not the right *first* step, for an 8-day build. |
| **Production migration path (for the roadmap slide, not the hackathon build)** | **Microsoft Foundry Agent Service + Microsoft Agent Framework** | Microsoft's current (2026) agent platform explicitly supports deploying agents built with CrewAI, AutoGen, and Semantic Kernel, adds enterprise governance/observability/identity, and includes "Foundry IQ" for grounding agents in enterprise knowledge sources (SharePoint, Fabric, Bing). Microsoft Agent Framework itself is described as converging AutoGen and Semantic Kernel into one commercial-grade orchestration layer with native support for the Model Context Protocol (MCP) and Agent2Agent (A2A) interoperability. Naming this as the production destination directly supports the brief's own "Microsoft ecosystem solutions" requirement and Futurrizon's identity as a Microsoft Solutions Partner — say this explicitly in the pitch. |
| Vector store / RAG | Any standard embeddings + vector DB (e.g., pgvector inside the same Postgres instance, to avoid adding an extra service under time pressure) | Simplicity under a tight deadline beats a dedicated vector DB the team hasn't used before |
| LLM | Any strong general-purpose model available to the team via API | The architecture (agent separation + grounding + independent verification) is model-agnostic by design — this is a deliberate answer to "why not just a bigger model" (Part J) |
| Diagram generation | LLM outputs **Mermaid syntax**, rendered client-side | Keeps every diagram text-based, versionable, and editable — never a generated image the user can't modify, and trivially exportable |
| Database | Postgres | Structured requirement/context graph, workspace metadata, version history |
| Storage | Local/object storage for uploaded source documents | Simple for a prototype; note S3/Azure Blob as the production choice |

## E.3 Why a multi-agent pipeline instead of one big prompt

A single prompt asked to "read these documents and produce a BRD, architecture, wireframes, ER diagram, and estimate" has two structural problems: its context window gets diluted across five very different reasoning tasks, and — most importantly — **it cannot credibly fact-check itself**, because the same context and the same "mindset" that generated a claim is being asked to grade that claim. Splitting the pipeline into agents with narrow, role-specific context, and adding a Verifier agent that is deliberately *not* given the original generation prompt, is what makes independent verification possible at all (see FR-VER-03). This is the single most important architectural decision in the whole system and the one most worth explaining clearly to a judge.

## E.4 Grounding & verification design, in detail

1. **Retrieval-first generation:** every agent that makes a claim about the business only sees retrieved chunks relevant to its specific task, not the full document dump.
2. **Citation contract:** every generated statement must either cite a specific retrieved passage or be explicitly labeled as not grounded. This "cite-or-abstain" contract is the single technique most consistently identified across 2026 RAG literature as the most effective lever against unsupported/hallucinated claims, and it works by catching the problem at generation time rather than relying on a reader to notice later.
3. **Independent verification pass:** the Verifier agent re-checks each claim against the retrieved evidence in a separate call, without seeing the generation agent's reasoning — closer to a second reviewer than a self-review.
4. **Explicit confidence, not false precision:** "Inferred" claims carry a numeric confidence score and are visually distinct (e.g., color-coded) from "Verified" claims, rather than being presented identically.
5. **Human is always the final gate:** nothing auto-exports or auto-publishes; the Verifier's job is to make review faster and better-targeted, not to remove the human reviewer, which is also the honest answer to give a judge who asks "what if the Verifier itself is wrong" (Part J).

## E.5 Data model (simplified, hackathon scope)

- `Workspace` (id, name, owner, created_at)
- `SourceDocument` (id, workspace_id, filename, raw_text, uploaded_at)
- `SourceChunk` (id, source_document_id, text, embedding, location_ref)
- `Requirement` (id, workspace_id, text, status[verified/inferred/unsupported], citations[SourceChunk ids], confidence)
- `Artifact` (id, workspace_id, type[architecture/wireframe/erd/estimate/roadmap], content[Mermaid/JSON], version)
- `ArtifactClaim` (id, artifact_id, text, status, citations, confidence) — the atomic unit the Verifier operates on
- `Contradiction` (id, workspace_id, description, source_chunk_ids[])

## E.6 Minimal API surface

| Endpoint | Purpose |
|---|---|
| `POST /workspaces` | Create a new workspace |
| `POST /workspaces/{id}/sources` | Upload a source document |
| `POST /workspaces/{id}/generate` | Trigger the agent pipeline |
| `GET /workspaces/{id}/requirements` | Fetch extracted requirements + citations |
| `GET /workspaces/{id}/artifacts/{type}` | Fetch a specific artifact (architecture/wireframe/erd/estimate) |
| `GET /artifacts/{id}/claims` | Fetch the claim-level breakdown for the Verifier UI |
| `POST /workspaces/{id}/export` | Export current state to Markdown/PDF |

---

# PART F — UX / SCREEN-BY-SCREEN REQUIREMENTS

| Screen | Purpose | Key elements |
|---|---|---|
| **1. Workspace home** | Entry point | Create workspace, list existing workspaces |
| **2. Ingestion screen** | FR-DISC-01–06 | Drag-and-drop upload, free-text/chat input box, list of uploaded sources with status |
| **3. Agent trace panel** (persistent side panel during generation) | This is the demo's signature visual — protect build time for this | Live list of agents currently running, what each is doing, streaming citations as they're found |
| **4. Requirements & gaps view** | FR-ANLY-01–05 | Structured requirement list, each with a citation chip; separate "open questions" and "contradictions" sections |
| **5. Architecture view** | FR-ARCH-01–04 | Rendered Mermaid diagram; click any node/edge → citation side panel |
| **6. Wireframe view** | FR-UX-01–03 | Rendered low-fidelity screens; click any element → citation side panel |
| **7. Data/API view** | FR-DATA-01–02 | ER diagram + endpoint list |
| **8. Roadmap & estimate view** | FR-EST-01–03 | Range-based estimate, reference cases shown, phased roadmap |
| **9. Verifier summary** | FR-VER-05 | Workspace-level Verified/Inferred/Unsupported breakdown, most useful single screen to show a judge |
| **10. Export screen** | FR-WS-03–05 | Export current workspace or a single artifact |

---

# PART G — STEP-BY-STEP EXECUTION PLAN (READ THIS DAILY)

**Reality check on timing:** registration closes **September 6, 2026**. Today is **August 29**. That is an **8-day window**, not a multi-week hackathon. The actual on-campus build round's dates are not published anywhere in the organizer's material — do not plan around dates that don't exist yet. This plan is for what's actually due next: a strong video plus a working proof-of-concept.

## Day-by-day plan

### Day 1 (Aug 29) — Lock scope, stand up the skeleton
- [ ] Finalize team roles (Part G, team roles table below)
- [ ] Write the demo scenario and author the synthetic demo dataset (FR-DEMO-01–04) — do this **first**, before any code, because every other agent's output will be judged against this data
- [ ] Set up the repo, environments, CI-free simple deploy target (local + one shared dev instance is enough)
- [ ] Stand up the vector store + chunking/embedding pipeline for uploaded documents (FR-DISC-03)
- [ ] Get one CrewAI "hello world" agent call working end-to-end so the team isn't debugging framework setup on day 3

### Day 2 (Aug 30) — Discovery + Analyst agents
- [ ] Implement FR-DISC-01, 02, 06 (upload + chat input)
- [ ] Implement FR-ANLY-01 (requirement extraction with citations) — get this working on the "normal" demo dataset first
- [ ] Implement FR-ANLY-02 (gap detection) and FR-ANLY-03 (contradiction detection) against the "difficult" demo dataset
- [ ] **Checkpoint:** by end of day 2, you should be able to upload the demo docs and see a structured, cited requirement list

### Day 3 (Aug 31) — Architect / UX / Data agents (parallel build if team size allows)
- [ ] FR-ARCH-01, 02, 04 (architecture + process diagram, Mermaid, clickable citations)
- [ ] FR-UX-01, 02 (wireframe JSON → rendered screens)
- [ ] FR-DATA-01, 02 (ER diagram + API list)
- [ ] **Checkpoint:** three artifacts generating from the same requirement set, visibly consistent with each other

### Day 4 (Sept 1) — Estimator + start of Verifier
- [ ] FR-EST-01, 02 (range-based estimate with reference cases)
- [ ] Begin FR-VER-01–03 — this is the highest-priority remaining feature in the entire PRD; if anything has to be cut later in the week, cut somewhere else first
- [ ] **Checkpoint:** every artifact has a raw Verified/Inferred/Unsupported label attached, even if the UI isn't polished yet

### Day 5 (Sept 2) — Protect this day for the Verifier UI
- [ ] Finish FR-VER-01–04: click-a-claim-see-its-source flow, contradiction propagation warnings
- [ ] FR-VER-05 (workspace-level summary screen)
- [ ] This is the single day most likely to get squeezed by other work — do not let that happen. This feature is the entire differentiation argument in Part A.

### Day 6 (Sept 3) — Frontend polish + agent trace panel
- [ ] Build screen 3 (live agent trace panel) — this is the visual "wow" moment for the demo
- [ ] Full run-through with all three demo datasets (normal / difficult / edge); fix whatever breaks
- [ ] Basic export (FR-WS-03)

### Day 7 (Sept 4) — Record the video
- [ ] Rehearse the demo script (Part H) at least twice before recording
- [ ] Record the 5-minute Solution Video, following the shot list in Part H exactly
- [ ] Draft the optional visual presentation slides if using them
- [ ] Complete every checklist item: team name, leader, challenge selected, all members' names + year/semester, resumes, GitHub links, LinkedIn profiles

### Day 8 (Sept 5, buffer before Sept 6 close) — Review and submit
- [ ] Fresh-eyes review of the video against the required 5 elements (Part H.2 checklist)
- [ ] Confirm file size under 1GB
- [ ] Submit the registration form with all attachments
- [ ] Do not wait until the literal deadline hour — submit with buffer in case of upload issues

## Team roles

| Role | Owns | Non-negotiable deliverable |
|---|---|---|
| Product/research lead | Problem framing, competitive positioning (Part A), monetization slide, video script/narration | The "why" the whole team can defend from memory |
| AI/backend lead | Agent pipeline, RAG setup (E.2–E.4) | Working Discovery → Analyst → Verifier chain |
| Frontend lead | Workspace UI, agent trace panel, citation click-through (Part F) | Screens 2, 3, 9 working smoothly for the demo |
| 4th member (if available) | Diagram-as-code generation (Architect/UX/Data agents), demo dataset authoring (FR-DEMO) | Screens 5–8 |

If the team is only 2–3 people, merge the product/research role into whoever is strongest at articulating the pitch, and merge the 4th-member scope into the AI/backend lead — but do **not** cut the Verifier (Day 4–5 work) to make room; cut FR-WS-04, FR-WS-05, FR-ARCH-03, or FR-UX-03 first (all marked C/W above).

## MUST / SHOULD / COULD, restated as a single checklist

**MUST have on stage:** document ingestion → at least one full artifact chain (requirements → architecture → wireframe) → the Verifier's Verified/Inferred/Unsupported distinction, visibly clickable.
**SHOULD have:** contradiction detection shown live (the "wow" moment in Part H), range-based estimate.
**COULD have:** Blueprint Drift Detector concept slide (doesn't need to work — a roadmap slide is enough, see Part K), multilingual toggle mockup.

---

# PART H — DEMO, VIDEO & PITCH PLAN

## H.1 Demo script (3–5 minutes, timestamped)

| Time | Beat | What's on screen |
|---|---|---|
| 0:00–0:45 | **Problem** | Narrate a specific, realistic scenario (a small manufacturing company's ops lead has three voice notes, an old process PDF, and a half-written email). Show the actual messy source material, not a clean slide. |
| 0:45–1:15 | **Input** | Upload the three sources live, on screen, with zero cleanup. |
| 1:15–2:30 | **Intelligence** | Agent trace panel lights up — Discovery, then Analyst, then Architect/UX/Data running, each visibly citing a source sentence as it works. |
| 2:30–3:15 | **Decision** | The blueprint assembles on screen — architecture diagram, wireframe, ER diagram, roadmap. |
| 3:15–3:45 | **Verification (the differentiator moment — do not rush this)** | Click one architecture claim → highlights its exact source sentence. Click a second claim, shown in a different color → "Unsupported — AI inference, confidence 44%, recommend validating with the client." Then show the contradiction case: "Source 1 says $1,000 threshold, Source 3 says $5,000 — flagged for clarification" instead of the system silently picking one. |
| 3:45–4:15 | **Impact** | Show the estimate range and state the monetization model in one sentence. |
| 4:15–5:00 | **Close** | State the differentiator in one sentence and name the specific gap it fills (Part A.3, Reason 3), then one forward-looking sentence about the roadmap (Part K). |

## H.2 Checklist: does the video hit all five required elements?

- [ ] **Understanding of the project** — a specific scenario, not a restatement of the PDF
- [ ] **Innovation** — the Verifier is named explicitly and compared to a named competitor gap (Ardoq/EltegraAI/ChatGPT)
- [ ] **Technical approach** — architecture is walked through, agent trace is shown live, "why multi-agent instead of one prompt" is stated in one sentence
- [ ] **Monetization** — a specific pricing model, anchored to a comparable real product's pricing tier
- [ ] **Business value** — a quantified estimate, clearly labeled as a demo target rather than an audited metric

## H.3 Monetization slide — specifics to state on camera

Seat-based or usage-based SaaS pricing aimed at consultancies and internal digital-transformation/IT teams, positioned against the same buyer as EltegraAI, Clappia, and Ardoq — i.e., anchor the pricing story to real, comparable products the judges can mentally check against, rather than inventing a number from nothing.

## H.4 Pitch deck outline (if using the optional visual presentation)

1. Hook — the messy-input moment
2. Problem — the real workflow and its pain point
3. Existing solutions — the competitive table from Part A.3, Reason 3
4. The gap — stated in one sentence
5. Our insight — "advisory recommendations need to be validated" is already in the brief; we built the tool that does that validation visibly
6. Solution overview — the five-artifact pipeline
7. Architecture — the multi-agent diagram (E.1)
8. Live demo screenshots — the Verifier click-through moment
9. Business value — quantified, labeled
10. Monetization
11. Roadmap (Part K)
12. Team + ask

---

# PART I — RISK REGISTER

| Risk | Likelihood | Impact | Mitigation | Owner |
|---|---|---|---|---|
| Verifier feature runs out of time | Medium | High — this is the whole differentiator | Protect Day 4–5 explicitly; cut C/W-priority items first (Part G checklist) | AI/backend lead |
| Demo breaks live during recording | Medium | Medium | Record video in advance (not live), rehearse twice, have a pre-recorded backup take | Whole team |
| Diagram generation produces invalid Mermaid syntax | Medium | Low–Medium | Add a simple syntax-validation retry loop; keep a static fallback diagram for the exact demo dataset as insurance | AI/backend lead |
| Team underestimates RAG/embedding setup time | Medium | Medium | Get the vector store working on Day 1, before any agent logic, per Part G | AI/backend lead |
| Judges ask about IP overlap with Futurrizon's own product | Low–Medium | Medium | Be upfront and enthusiastic about it in Q&A — framing it as "we designed this to extend your own roadmap" is a strength, not a liability, given the internship incentive structure | Product lead |
| Verifier itself mislabels a claim (false "Verified") | Certain, at some rate | Medium | Acknowledge this openly as a known limitation in the pitch (Part J) rather than overclaiming accuracy | Product lead |
| Scope creep into export formats (Word/Excel/PPT) or full BPMN | Medium | Medium | These are explicitly W-priority (Part C); do not touch them before all M-priority items are done | Whole team |

---

# PART J — JUDGE Q&A DRILL

Practice answering these out loud, not just reading them.

**"Isn't this just ChatGPT with extra steps?"**
No — ChatGPT has no persistent, shared, cited context graph across five artifact types, and a single model call cannot credibly fact-check its own output. The Verifier is architected as an independent call that never sees the original generation prompt, specifically so it can't just agree with itself.

**"What happens if the Verifier is wrong?"**
It will be, sometimes — no verification layer is perfect, and we say that openly rather than overclaiming. The mitigation is architectural, not a promise: nothing auto-publishes, every claim is shown with its evidence (or lack of it) so a human reviewer can check it fast, and the whole point of the product is making that human review faster and better-targeted, not eliminating it.

**"Why five separate agents instead of one better prompt?"**
Context-window dilution and self-grading are the two failure modes we're specifically avoiding. Narrow, role-scoped context per agent, plus an independently-scoped Verifier, is what makes credible fact-checking possible at all.

**"Why not just use Microsoft Copilot Studio — doesn't Microsoft already have this?"**
Copilot Studio (and Microsoft Foundry Agent Service more broadly) is a platform to build agents on, not a finished product with this specific requirements-to-blueprint verification workflow. Our answer is to say plainly that GroundWork AI is an application layer that could itself deploy on Foundry Agent Service in production — which strengthens the Microsoft-ecosystem story rather than undercutting it.

**"Who actually pays for this?"**
Consultancies and internal IT/digital-transformation teams — the same buyer segment as EltegraAI, Clappia, and Ardoq, with comparable seat/usage-based pricing.

**"What's your accuracy rate?"**
We don't claim a statistically validated accuracy number from a one-week hackathon build on synthetic data — that would be overclaiming. What we can show, live, is the *mechanism*: every claim is either grounded in a citation or explicitly flagged as unverified, which is a structural guarantee about transparency, not an unproven accuracy percentage.

**"What happens with a much larger, real client document set?"**
Chunked retrieval and a persistent context graph scale horizontally in principle; the honest limitation at prototype stage is we haven't load-tested against enterprise-scale document volumes, and we say that directly rather than promising performance we haven't measured.

**"Can a competitor copy this in a weekend?"**
The idea, yes. The plumbing — a persistent, cited, cross-artifact context graph plus an independently-scoped verification pass — is deliberate architecture, not a clever prompt, and that's the part that actually takes engineering effort to replicate.

---

# PART K — POST-HACKATHON ROADMAP (for the closing slide)

State this briefly and confidently — it signals the team is thinking like a product team, not just a hackathon team, which matters for the internship-interview incentive specifically.

1. **Blueprint Drift Detector** — connect a live GitHub/Azure DevOps repo and continuously compare its actual structure against the original blueprint, flagging architectural drift over time (ties directly to the brief's "continuously supports organizations throughout their transformation journey" note).
2. **Full multilingual support**, per the brief's explicit requirement, once the UI/prompt layer groundwork laid in D.5 is in place.
3. **Production deployment on Microsoft Foundry Agent Service**, using Microsoft Agent Framework for orchestration, Foundry IQ for enterprise-knowledge grounding (SharePoint/Fabric), and Entra-based identity/access control — a natural extension of the hackathon architecture, not a rewrite.
4. **Full export fidelity** (Word/Excel/PPT) and native Jira/Azure DevOps integration, completing the brief's "Collaboration & Delivery" feature column.
5. **A second, independent grounding-verification model** running alongside the primary Verifier agent, to reduce the "Verifier is wrong sometimes" risk named openly in Part J.

---

# APPENDIX — SOURCES

Full source list and citations for every research claim in Part A are in the companion document `Chaos2Commit_Winning_Strategy.md`. Additional sources used specifically for Part E (technical architecture) of this PRD:

- Multi-agent framework comparison (CrewAI vs. LangGraph vs. AutoGen, 2026): turing.com, pickaxe.co, dev.to (pockit_tools), instinctools.com, gurusup.com, pecollective.com, openagents.org
- Microsoft Foundry Agent Service / Microsoft Agent Framework (2026): devblogs.microsoft.com (×2), learn.microsoft.com (×2), azure.microsoft.com (×2), infoq.com
- RAG grounding/hallucination-reduction research and industry benchmarks: futureagi.com, getzep.com, and the academic literature on RAG faithfulness (FActScore, RAGTruth, Auto-GDA) — arxiv.org