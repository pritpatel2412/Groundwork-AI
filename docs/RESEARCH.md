# CHAOS2COMMIT — WINNING STRATEGY REPORT
### Futurrizon × CHARUSAT Innovation Sprint | Prepared August 29, 2026

**How to use this document:** Part 0 is the verdict. Parts 1–4 are the research and reasoning behind it. Part 5 is the full build spec for the recommended solution. Every factual claim about the outside world is sourced (Part 6); everything else is explicitly labeled as our analysis, an assumption, or a proposed idea. No prior edition of Chaos2Commit exists to study (registration only opened Aug 24, 2026), so where the prompt asks for "what previous winners did," that data does not exist — we say so rather than inventing it, and substitute the strongest available proxy evidence instead.

---

## PART 0 — EXECUTIVE VERDICT

### 1. Chosen Problem Statement
**Business Transformation AI (AI Solution Builder)**

### 2. Why This One
It is the only one of the three where (a) the core data-acquisition method is legally clean, (b) a genuine, well-documented market gap exists rather than a crowded red ocean, (c) the technical surface rewards real AI/software architecture rather than UI polish, and (d) it is a near-exact match to the organizing company's own commercial DNA — Futurrizon is a registered Microsoft Solutions Partner specializing in Dynamics 365 Business Central, Power Platform, and Azure-based digital transformation for enterprise clients<cite index="13-1">, a Microsoft Solutions Partner based in India serving clients across the Middle East and Africa region, specialising in Dynamics 365 Business Central, and working with organisations in media, education, and financial services</cite>. This is, functionally, their own flagship product concept. Judges evaluating it will be evaluating something close to their own roadmap.

### 3. Core Idea
**GroundWork AI** — an agentic Business Transformation Copilot that converts messy, unstructured business input (a founder's voice note, a legacy SOP, a half-written BRD, a screenshot of an old app) into an implementation-ready blueprint — architecture, workflows, wireframes, database design, and a delivery roadmap — while showing its work. Every recommendation carries a visible chain of evidence back to the source material, a confidence score, and an explicit "assumption — needs validation" flag when the AI is inferring rather than citing. It doesn't just generate documents; it generates *defensible* documents.

### 4. The Big Differentiator
Every competitor in this space (BRD generators, EA tools, wireframe generators) either produces confident-sounding output with no traceability, or requires the user to already have structured data. GroundWork AI adds a **Provenance & Verification Layer** that the entire category is missing, and it does so by taking a line already buried in the problem statement — *"AI-generated recommendations are advisory and should be validated before implementation"* — and turning it from a disclaimer into the product's core mechanism.

### 5. The Wow Moment
A judge watches a scanned SOP and three rambling voice notes go in one side, and — in real time, with a visible multi-agent trace panel — a solution architecture diagram, a wireframe, an ER diagram, and a cost/timeline estimate assemble on screen, each element clickable to reveal exactly which sentence of which source document justified it, or flagged as "no source — AI inference, confidence 41%."

### 6. Existing Gap
No single tool spans discovery → requirements → architecture → wireframes → database design → estimation → roadmap grounded in one shared, auditable context. EA tools (Ardoq, LeanIX) model an *existing* IT estate, not a new idea<cite index="65-1,65-2">Ardoq uses machine-learning algorithms to help architects visualize dependencies between IT systems, business capabilities, and strategic goals, relying on structured data</cite>. BRD generators (EltegraAI, Clappia) stop at documents. Wireframe tools (Uizard, Galileo AI, v0, UX Pilot) stop at screens<cite index="30-1,30-2">AI wireframers like Visily, Uizard, and Banani produce editable wireframes but live in their own canvas as a stop on the way, not the destination, while vibe-coding tools like v0, Lovable, and Bolt.new skip wireframes entirely and emit code or a live site</cite>. None of them carry a shared, cited evidence trail across the whole pipeline.

### 7. How We Solve It
A five-agent pipeline (Discovery → Analyst → Architect/UX/Data → Estimator → Verifier) built on retrieval-augmented generation against the user's own uploaded material, with the Verifier agent acting as an internal adversary that checks every other agent's output against the source documents before it's shown to the user.

### 8. AI's Specific Role
Document/voice ingestion and structuring (LLM + RAG), gap and requirement inference (LLM reasoning over retrieved context), diagram-as-code generation (LLM → Mermaid/BPMN, not a drawing tool), and — critically — a second LLM pass that acts purely as fact-checker/grounding verifier against the retrieved source chunks, not as a generator.

### 9. Expected Impact
Vendor-reported industry baselines for this category claim requirements-gathering time reductions in the 40–75% range<cite index="26-1">EltegraAI claims its AI-powered platform reduces requirements gathering time by 75%</cite> and automation of a meaningful share of routine enterprise-architecture work<cite index="67-1">Ardoq's May 2026 AI-first platform launch claims new AI agents can automate an estimated 40% of routine EA work</cite> — both are vendor marketing claims, not independently audited, and are cited here only as category benchmarks to beat, not as our own numbers. Our demo target, explicitly labeled as a hackathon claim rather than a production SLA, is: turning ~3–5 unstructured source documents into a reviewable first-draft blueprint in under 10 minutes live on stage.

### 10. Biggest Risk
Judges (who run a real consulting business) will ask the hardest possible question: *"An LLM can already summarize a document — what exactly can't ChatGPT or Copilot Studio do here?"*

### 11. How We Mitigate It
The answer is not "we use a bigger model," it's architectural: a wrapper around a single LLM call cannot maintain a persistent, cross-artifact evidence graph, run a second adversarial verification pass against its own output, or detect *drift* when a delivered implementation diverges from the original blueprint over time. We build and demo exactly those three things, live, as proof they aren't hand-waved.

### 12. Why It Can Win
It is the only one of the three tracks where technical depth, legal safety, organizer-fit, and genuine whitespace all point the same direction at once. It will not be the flashiest 30-second clip of the day — the reels platform will win that. It has the best chance of being the project judges *trust*.

---

## PART 1 — HACKATHON STRUCTURE, DECODED

### 1A. What the source documents establish as fact

| Item | Detail |
|---|---|
| Organizer | Futurrizon Technologies Pvt. Ltd. (Microsoft Solutions Partner) in collaboration with CHARUSAT University |
| Eligibility | CHARUSAT students only, teams of 2–4 |
| Registration opens | 24 August 2026 |
| Registration closes | 6 September 2026 |
| Team selection declared | 8 September 2026 |
| Venue (for the eventual on-campus round) | CHARUSAT University campus, Changa, Gujarat |
| Mandatory registration artifact | A self-recorded, max-1GB, ~5-minute **Solution Video** |
| Video must cover | (1) Understanding of the project/problem, (2) Innovation — what's unique, (3) Technical approach — how you'll build it, (4) Monetization — how it generates revenue, (5) Business value — measurable value created |
| Required checklist items | Team name, team leader, challenge selected, all students' names + year/semester, resumes, GitHub links, LinkedIn profiles, the video |
| Stated methodology | Understand → Analyze → Ideate → Design → Build → Commit |
| Reward | Top 3 teams get a first-round internship interview at Futurrizon — not a guaranteed internship |
| Explicit organizer instruction | The feature lists in each problem PDF are a **floor**, not a ceiling — teams are explicitly asked to propose additional USPs, differentiators, and value propositions beyond what's listed |

### 1B. What is explicitly NOT yet known (do not assume these)

- **The actual on-campus build dates/duration are not disclosed anywhere in the provided material.** Only the registration→selection timeline (Aug 24–Sep 8) is public. Treat "8 September" as a selection announcement, not necessarily the hackathon start date.
- No numeric judging rubric or weight table is published.
- No named judges, no judging panel bios.
- No explicit tech-stack restrictions, no stated ban or allowance on using third-party APIs/pretrained models/no-code tools.
- No stated IP/ownership clause for submitted work (materially important if your idea overlaps with Futurrizon's own live product — flag this with organizers before committing team IP).
- No confirmation of whether the 5-minute video alone decides the Sept 8 shortlist, or whether it's paired with a written form response.

**Practical implication:** because this is a first edition with no track record, Part 2 below substitutes the best available proxy evidence instead of fabricated "past winner" analysis.

### 1C. The De Facto Judging Rubric (derived, not invented)

The organizer did not publish a scoring table, but they *did* publish something functionally equivalent: the five required elements of the video, in a specific order, plus the six-stage methodology. Treat this as the rubric until told otherwise.

| Inferred Criterion | Where It Comes From | What "9–10/10" Looks Like | What Scores Poorly |
|---|---|---|---|
| Problem Understanding | Video element #1 + "Understand" stage | Names the real user, the real workflow, the real root cause — not a restatement of the PDF's overview paragraph | Reciting the problem statement back verbatim |
| Innovation | Video element #2 | A capability genuinely absent from the PDF's "minimum functionality" list, defended against a named competitor | "We add a chatbot" as the entire pitch |
| Technical Approach | Video element #3 + "Build" stage | A specific, justified architecture (why this model, why this data flow) with a working or near-working artifact on screen | Slideware with no functioning component, or unexplained "we'll use AI" hand-waving |
| Monetization | Video element #4 | A pricing/business model that matches how the *actual buyer* (enterprise IT, consultants, sales teams) already pays for adjacent tools | Generic "freemium then subscription" with no anchor to comparable real pricing |
| Business Value | Video element #5 | Quantified, clearly labeled estimate vs. a stated baseline | Vague claims ("saves time," "boosts productivity") with no numbers |

---

## PART 2 — RESEARCH BASIS: WHAT WE ACTUALLY FOUND (AND DIDN'T)

**Searched and confirmed:** No public record of a prior Chaos2Commit event, prior Futurrizon-run hackathon, winner list, or judge commentary exists — this is genuinely a first edition. General CHARUSAT hackathon history exists (e.g., an Odoo × CHARUSAT hackathon in 2025) but is run by a different organizer with different judges and is not a reliable proxy for Futurrizon's evaluation style. **Not verified**, and we do not pretend otherwise.

**What we substituted instead, as the next-best evidence:**
1. Futurrizon's own registered business identity and public company filings (confirms their Microsoft/Dynamics 365/digital-transformation specialization — directly relevant to how a judge from that company will read a "Business Transformation AI" pitch).
2. The competitive and legal landscape of each of the three domains, researched independently and in depth (Part 3).
3. General, well-documented hackathon-judging literature and the structure the organizer *did* publish (Part 1C).

---

## PART 3 — DEEP DIVE ON ALL THREE PROBLEM STATEMENTS

For each: the real problem, the current workflow, the competitive landscape, and the honest gap — not "no one has done this," but specifically what existing solutions fail to do.

### 3.1 Business Transformation AI (AI Solution Builder)

**Core problem, in plain language:** Turning a vague business idea or a pile of legacy documents into something an engineering team can actually build normally requires weeks of business-analyst and solution-architect time — interviews, gap analysis, architecture decisions, wireframes, estimates — and each of those steps currently lives in a different tool, done by a different specialist, with no single connected trace of *why* a decision was made.

**Primary users:** Business analysts, solution architects, IT consultants, product managers, digital transformation leads at SMEs/consultancies (matches the PDF's stated target users exactly).

**Root cause (5-whys, condensed):** Documentation is slow → because each artifact (BRD, architecture, wireframe, estimate) is authored by a different specialist in a different tool → because no shared, structured context object exists that all of them can read from and write to → because business context capture (interviews, SOPs, legacy docs) has historically been unstructured text, not queryable data → because no affordable tool has combined RAG-grounded extraction with multi-artifact generation in one workspace until very recently (2024–2026 LLM capability curve).

**Competitive landscape:**

| Existing Solution | What It Actually Does | Strength | Weakness | Gap vs. Our Target |
|---|---|---|---|---|
| EltegraAI | Converts conversational input into code-ready BRDs with compliance checks<cite index="26-2">EltegraAI transforms conversations into comprehensive, code-ready Business Requirements Documents through intelligent AI interviewing</cite> | Strong at the BRD layer specifically | Stops at documents — no architecture, wireframes, or estimation | Document-only |
| Clappia | Turns an uploaded BRD directly into a no-code app | Fast idea-to-app | Component-based no-code output, not a real architecture/blueprint for a dev team to build against<cite index="22-1">Clappia employs a component-based architecture rather than generating code that requires ongoing maintenance</cite> | Skips architecture reasoning entirely |
| Ardoq (AI-first EA platform, launched May 2026) | Grounds AI agents in a live graph of an organization's *existing* architecture to automate EA work<cite index="67-2">Ardoq's AI agents reason on live architecture data rather than on whatever document happens to be in front of a generic assistant, unlike generic AI tools that reason on training data instead of the organization's actual relationships between applications and dependencies</cite> | Genuinely strong grounding concept, Gartner-recognized | Requires an *existing*, already-modeled estate — not built for a new idea/greenfield business transformation | Wrong starting point (existing IT, not new ideas) |
| LeanIX | Application portfolio + lifecycle management | Mature, SAP-integrated | Same category as Ardoq — inventory/rationalization, not idea-to-blueprint | Same as above |
| Uizard / Galileo AI / UX Pilot / v0 | Prompt-to-wireframe or prompt-to-code UI generation<cite index="30-2">These wireframers produce editable wireframes handed off to a designer or developer, while vibe-coding tools skip wireframes and emit code or a live site directly</cite> | Fast, high-fidelity UI output | UI-only — no requirements, architecture, DB, or estimation layer, and no traceability to a business document | UI-only silo |
| Generic ChatGPT/Copilot | Can draft any one artifact if prompted well | Zero cost to try | No persistent shared context object, no cross-artifact consistency, no verification pass, no diagram-as-code pipeline by default | This is the bar every judge will mentally compare us against |

**Ranked gaps (impact × feasibility × novelty × demonstrability):**
1. **Trust/explainability gap** — no tool shows *why* it generated a given architecture decision, tied to a source sentence.
2. **Cross-artifact consistency gap** — a BRD, architecture, wireframe, and estimate produced separately drift out of sync; nothing keeps them coherent.
3. **Human-in-the-loop gap** — most tools are single-shot generation, not an iterative pipeline with checkpoints.
4. **Integration gap with the Microsoft ecosystem** — explicitly called out in the source PDF ("Microsoft ecosystem solutions") and matches the organizer's actual specialization; competitors above are largely stack-agnostic or SAP-leaning (LeanIX), not Azure/Power-Platform-native.
5. **Drift/monitoring gap** — nothing in this category checks whether what got *built* still matches what was *planned*, over time.

**White space:** "Fragmented specialist tools → one shared, evidence-grounded context object that every artifact reads from" is a genuine, unclaimed combination — not "existing product + chatbot."

---

### 3.2 AI Reels (Next-Gen Social Entertainment Platform)

**Core problem, in plain language:** Short-video consumption is fragmented across apps and algorithm-optimized for endless scrolling rather than curated, social, or meaningful engagement.

**Primary users:** General consumers, students, creators, brands — an extremely broad, low-specificity user base.

**The disqualifying issue — read this before pursuing this track:** The platform's flagship module, **AI Universal Reels Discovery**, is explicitly described as discovering and recommending short-form videos *from other platforms* while "respecting copyright, platform policies, and licensing." Our research shows this constraint is far more severe than it sounds:

- Every major short-video platform (Instagram, TikTok, YouTube Shorts) actively detects and penalizes re-hosted or watermark-stripped cross-platform content via algorithmic suppression<cite index="37-1,37-2">Every major platform now detects identical uploads, and the algorithmic response is suppression, not amplification — Instagram's head confirmed this policy directly, and by 2026 Instagram added an Originality Score that detects recycled clips automatically, extending the penalty beyond visible watermarks to duplicate content patterns</cite>.
- Actually reproducing or re-serving that content (not just linking to it) without a licensing agreement is a direct copyright exposure, independent of any in-app "attribution" note<cite index="38-1">Copyright infringement is still infringement regardless of what a platform's own guidelines allow in the moment, and platforms often license content or audio for personal use only, not for redistribution or commercial promotion elsewhere</cite>.
- The legitimate way to aggregate this content is official platform APIs with paid licensing/revenue-share, not scraping<cite index="40-1">Platforms like YouTube and Instagram provide official embedding features to share content legally, and many offer paid licensing options for commercial use at scale, such as YouTube's paid API access and revenue sharing for qualifying sites</cite> — a real business-development and legal process, not something a student team can stand up in days.

**Competitive landscape (abbreviated given the disqualifying issue above):** Instagram Reels, YouTube Shorts, TikTok, and India-specific players (Moj, Josh) already own native short-video + AI recommendation + creator monetization at massive scale. A student team's "universal discovery" layer sitting on top of them is not a differentiated product — it's either (a) technically infeasible without official partnerships, or (b) a thin native-content social app with the "universal" framing quietly dropped, at which point it is a weaker, unfunded clone of Instagram Reels.

**Honest gap assessment:** The gaps that *do* exist in this category (AI companions/avatars, mood-based curation, gamified streaks) are real but are feature-level differentiators already being built by well-funded incumbents, not category-defining whitespace a hackathon team can own in a week.

**Verdict on this track:** Eliminated. Not because entertainment/AI isn't interesting, but because its core discovery mechanism is legally and operationally infeasible to demonstrate honestly, and everything else in the brief is a "dashboard + chatbot + gamification" surface that will read as generic against real platforms judges use daily.

---

### 3.3 AI Sales Agent Platform

**Core problem, in plain language:** Sales teams spend disproportionate time manually finding, qualifying, and calling prospects instead of closing deals.

**Primary users:** SDRs, sales managers, founders doing their own outbound at SMEs.

**Competitive landscape:** This is the most crowded of the three tracks by a wide margin.

| Existing Solution | What It Does | Gap |
|---|---|---|
| Apollo.io | 210M+ contact database + sequencing + a March-2026 agentic assistant<cite index="53-1">Apollo.io remains a top pick for founders with a free plan, 210M+ contacts, and a new agentic AI assistant launched in March 2026 that executes prospecting workflows from a natural-language prompt</cite> | Already does exactly what the brief describes, at scale |
| Clay | AI research agent ("Claygent") for bounded, custom enrichment questions<cite index="54-1">Claygent, Clay's AI research agent, is considered the most reliable agent in the category because it's bounded — it researches a specific question and returns a specific answer</cite> | Same category, well-funded, recently repriced down (more accessible, more entrenched) |
| Artisan (Ava) / 11x (Alice) | Fully autonomous outbound SDR agents — research, personalized outreach, meeting booking<cite index="50-1">Ava is an autonomous AI agent that acts as a full-stack outbound SDR, finding leads, researching them, writing personalized emails, managing deliverability, and booking meetings without needing external tools</cite> | Direct functional overlap with the brief's "AI Voice Agent" module |
| Cognism, ZoomInfo, Regie.ai, Instantly | Data/enrichment, engagement, or sequencing specialists | Same overall category, all well capitalized |

**A critical, judge-proof-question-generating finding:** Fully autonomous AI SDR products in this exact category have a documented trust/quality problem in the market right now — one major player reportedly lost 70–80% of its customers within months, with users describing generic-feeling AI outreach despite detailed targeting<cite index="54-2">Fully autonomous AI SDRs for complex B2B deals have struggled — one major player reportedly lost 70-80% of its customers within months, with users reporting that despite detailed ICP information, the output reads like generic AI-generated email</cite>. This is useful evidence either way: it shows real demand *and* a real, unsolved trust gap in the category — but it also means any team pitching "autonomous AI sales agent" invites the exact question a Futurrizon judge (who sells enterprise software for a living) will ask: *"11x already tried this and lost most of its customers — why will yours be different?"*

**The disqualifying issue on the data-acquisition side:** The brief's "AI Lead Discovery" module explicitly relies on discovering prospect requirement posts on LinkedIn and X. LinkedIn's User Agreement explicitly prohibits scraping or automated collection of profile/post data, and LinkedIn has actively litigated this in 2025–2026, including suing a scraping-data vendor and securing a settlement requiring permanent data deletion and an injunction<cite index="59-1,63-1">LinkedIn has sued scraping services repeatedly, including Proxycurl in 2026, and the founder of Proxycurl's parent company settled and agreed to permanently delete all LinkedIn data obtained through unauthorized means and accept a court-entered permanent injunction against future access</cite>. The often-cited "hiQ v. LinkedIn" precedent is narrower than commonly believed — it protects against one specific criminal statute (the CFAA), not against LinkedIn's ability to sue and win on breach-of-contract grounds<cite index="62-1">The hiQ Labs case ended with LinkedIn winning on contract grounds, confirming that even scraping of public data is a terms-of-service violation you can be sued over, even though it may survive a specific criminal-statute challenge</cite>.

**Verdict on this track:** Technically the most demo-friendly of the three (a live AI phone call is a genuine crowd-pleaser), but it sits in the most saturated market of the three, built on top of the most litigated data-acquisition method of the three, competing directly against well-funded incumbents any judge could name in the room. Real, but a much harder path to differentiation than Track 1.

---

## PART 4 — COMPARATIVE SCORING MATRIX

Weighted to the organizer's actual, published rubric proxy (Part 1C): Problem Understanding, Innovation, Technical Approach, Monetization, Business Value — each scored /20 for a 100-point total, with legal/feasibility risk applied as a modifier rather than hidden inside "innovation."

| Dimension (20 pts each) | Business Transformation AI | AI Reels | AI Sales Agent |
|---|---:|---:|---:|
| Problem Understanding | 17 — clear, well-documented enterprise pain, matches organizer's own business | 12 — broad, low-specificity consumer problem | 15 — clear, but extremely well-understood pain already solved by name-brand tools |
| Innovation potential | 17 — verification/traceability layer is genuinely unclaimed | 10 — "universal discovery" is the one interesting idea and it's the infeasible part | 12 — voice AI is impressive but not new; incumbents already ship it |
| Technical Approach | 18 — RAG + multi-agent + diagram-as-code + verification pass is deep, buildable, demonstrable | 8 — cross-platform aggregation is not realistically buildable in the time available; rest is CRUD + gamification | 14 — voice pipeline is real engineering; lead-discovery pipeline rests on a legally unstable foundation |
| Monetization clarity | 16 — enterprise/consultant seat-based pricing has direct market comparables (EltegraAI, Ardoq) | 9 — consumer social monetization (ads/sponsorship) is a multi-year cold-start problem, hard to credibly pitch in 5 minutes | 15 — usage-based (voice minutes, contacts) pricing is already the norm in this exact category, easy to justify |
| Business Value / Impact | 16 — quantifiable against BA/consultant hourly cost, cited category benchmarks exist | 10 — "more engaging scrolling" is a weak, hard-to-quantify value story | 15 — quantifiable against SDR hours/pipeline, but incumbents already publish these numbers, diluting novelty |
| **Legal/Feasibility risk modifier** | **0** (no scraping, no third-party IP dependency) | **−15** (core module is not honestly buildable/demoable without licensing deals) | **−8** (core data-acquisition step is ToS-hostile; mitigable but must be redesigned around public/consented sources) |
| **TOTAL /100** | **84** | **34** | **63** |

---

## PART 5 — THE WINNING SOLUTION: GROUNDWORK AI

### 5.1 Beyond the Obvious

| | Existing approach (what most teams will build) | Our approach |
|---|---|---|
| Input handling | "Upload a doc, get a summary" | Multi-source ingestion (docs + voice notes + screenshots of legacy apps) into one shared, queryable context graph |
| Output | A single generated document or wireframe | Five coordinated artifacts (BRD, architecture, wireframe, ER/API design, roadmap+estimate) that stay mutually consistent because they're generated from the same grounded context, not five separate prompts |
| Trust | Implicit — "the AI said so" | Explicit — every claim carries a citation back to a source sentence, or is flagged as an unverified assumption with a confidence score |
| Lifespan | One-shot generation, done | Persistent — a "Blueprint Drift Detector" can later compare a connected GitHub repo's actual structure against the original blueprint and flag divergence |

### 5.2 User Journey

`Input (docs/voice/screenshots) → Discovery Agent structures context → Analyst Agent extracts requirements + gaps → Architect/UX/Data Agents generate architecture + wireframes + ER diagrams in parallel, each citing the Analyst's output → Estimator Agent produces effort/cost/timeline → Verifier Agent cross-checks every artifact against the original source text and flags unsupported claims → Human reviews, edits, approves → Export (PDF/Word/PPT) or push to Jira/Azure DevOps.`

### 5.3 System Architecture

- **Frontend:** React (chat + document workspace + a live "agent trace" side panel showing which agent is running and what it's citing)
- **Backend:** FastAPI/Node orchestration layer coordinating agent calls
- **Vector store:** Chunked embeddings of every uploaded source document (for RAG)
- **LLM orchestration:** A router pattern — one model call per agent role, each with a narrow system prompt and only the retrieved context relevant to its job (not the whole document dump, which is how competitors lose coherence)
- **Diagram generation:** LLM outputs structured diagram-as-code (Mermaid for architecture/flow, a simple JSON schema for wireframes rendered by the frontend) rather than an image-generation model — this keeps every diagram editable, versionable, and exportable, and ties directly to the Microsoft ecosystem story (exportable to Visio/PowerPoint formats)
- **Database:** Postgres for the structured requirement/context graph; object storage for source documents
- **Auth/security:** Role-based access, since this explicitly handles client business documents

### 5.4 AI Architecture in Detail

| Agent | Input | Model role | Why AI (not rules) | Failure mode | Fallback |
|---|---|---|---|---|---|
| Discovery | Raw docs, transcribed voice notes, screenshots | Extraction + structuring LLM call, chunked + embedded | Business input is unstructured and highly variable in format — rules can't generalize | Misses context buried in a scanned/low-quality doc | OCR fallback + human "add context" field |
| Analyst | Structured context | Requirement + gap extraction, grounded via RAG | Requires reasoning about implied needs ("approval over $1,000" → workflow logic), not keyword matching | Infers a requirement not actually present | Verifier agent catches ungrounded claims (see below) |
| Architect/UX/Data | Analyst's requirements | Parallel generation of architecture (Mermaid), wireframe (JSON→rendered UI), ER diagram | Translating requirements into structural decisions is a reasoning task, not a template-fill task | Recommends an over-engineered or mismatched stack | Confidence score shown per decision; user can regenerate with constraints (e.g., "must be Azure-only") |
| Estimator | All prior artifacts | Effort/cost/timeline reasoning, calibrated against a small reference table of comparable project sizes | Judgment task combining scope + complexity signals | Anchors too optimistically (a known LLM failure mode) | Always shown as a *range*, never a single number, with the reference cases listed |
| **Verifier** | Every other agent's output + original source chunks | A *separate* LLM call whose only job is to check each claim against retrieved evidence and label it Verified / Inferred / Unsupported | This is the trust layer — without an independent check, the system is just a confident-sounding generator like every competitor | Verifier itself can miss a subtle unsupported claim | Human review is the final gate before export; nothing auto-publishes |

**Grounding/hallucination prevention specifics:** strict RAG (agents only see retrieved chunks relevant to their task, not the full corpus), inline citations rendered next to every generated statement, and the Verifier's independent pass — the single most defensible design choice in the whole system, and the one most worth spending demo time on.

### 5.5 Quantified Impact (clearly separated: cited vs. assumed)

| Claim | Status |
|---|---|
| "AI-powered BRD generation can cut requirements-gathering time by up to 75%" | **Cited vendor claim**<cite index="26-2,28-1">EltegraAI markets 75% faster requirements gathering, though industry coverage notes traditional BRDs already had roughly a 45% feature-waste problem and that AI tools bring their own risks like hallucinations and context blindness</cite> — not independently verified, presented only as a category benchmark |
| "AI EA agents can automate ~40% of routine EA work" | **Cited vendor claim**<cite index="67-1">Ardoq's 2026 platform launch claims new AI agents can automate an estimated 40% of routine EA work</cite> — same caveat |
| "GroundWork AI turns 3–5 source documents into a reviewable first-draft blueprint in under 10 minutes" | **Our hackathon demo target**, not a verified production metric |
| "Reduces unsupported/hallucinated architecture claims to near-zero in the demo" | **Our design goal**, to be shown live via the Verifier's Unsupported-claim flag, not claimed as a statistical accuracy rate without an actual eval run |

### 5.6 Demo Script (3–5 minutes, mapped to the required video structure)

1. **Problem (0:00–0:45):** A short, real-sounding scenario — a small manufacturing company's operations lead has three voice notes, an old process PDF, and a half-written email describing what they want automated. Show the actual mess.
2. **Input (0:45–1:15):** Upload the three sources live. No cleanup, no reformatting — that's the point.
3. **Intelligence (1:15–2:30):** The agent trace panel lights up — Discovery, then Analyst, then Architect/UX/Data running in parallel, each citing a specific sentence from the sources as it works.
4. **Decision (2:30–3:15):** The blueprint assembles — architecture diagram, wireframe, ER diagram, roadmap — on screen, editable.
5. **Verification (3:15–3:45):** Click one specific claim in the architecture diagram → it highlights the exact source sentence it came from. Click a second, flagged in orange → "Unsupported — AI inference, 44% confidence, recommend validating with the client." This is the moment the demo differentiates itself from every "AI generates a doc" pitch a judge has already seen.
6. **Impact (3:45–4:15):** Show the estimate range and the monetization slide (below).
7. **Close (4:15–5:00):** State the differentiator explicitly in one sentence, and name the specific competitor gap it fills.

### 5.7 Demo Dataset Plan

- **Normal case:** A clean, well-written SOP for a simple approval workflow.
- **Difficult case:** A messy voice-note transcript with contradictions (e.g., mentions two different approval thresholds).
- **Edge case:** A scanned, low-quality legacy document requiring OCR.
- **Failure case:** Deliberately withhold a key fact the Analyst would need — show the Verifier correctly flagging the resulting architecture decision as low-confidence rather than silently guessing.
- **Wow case:** The contradiction case above — show the system explicitly surfacing "Source 1 says $1,000 threshold, Source 3 says $5,000 — flagged for clarification" instead of silently picking one. This is a strong, memorable, judge-legible moment.

All sample data should be synthetic/fictional to avoid any real client-confidentiality or copyright issue.

### 5.8 Evaluation Framework

| Metric | Baseline (no tool) | With GroundWork AI (demo target) |
|---|---|---|
| Time: raw notes → first-draft blueprint | Days (manual BA work) | <10 minutes (live demo) |
| Claims with a visible source citation | N/A (manual docs don't cite) | Target: 100% of generated claims labeled Verified/Inferred/Unsupported |
| Cross-artifact consistency (does the wireframe match the ER diagram match the architecture?) | Manual reconciliation required | Enforced by shared context graph — demonstrate no contradiction across artifacts live |
| Estimate calibration | Ad hoc | Shown as a range with reference cases, not a false-precision single number |

### 5.9 Attacking Our Own Solution — Hardest Questions, Answered

**Technical**
- *Why five agents instead of one big prompt?* Separation of concerns keeps each context window narrow and grounded, and is what enables the independent Verifier pass — a single mega-prompt can't credibly fact-check itself.
- *What happens when the AI is wrong?* It's caught by the Verifier before the user ever sees it presented as fact, and flagged, not hidden.
- *What's the latency?* Parallelized agent calls for the generation stage; acceptable for a review workflow (minutes), not pitched as real-time.
- *How does it scale to large enterprises?* Chunked RAG and a persistent context graph per workspace scale horizontally; the harder scaling question is context-graph size for very large document sets, which is a real, honestly-acknowledged limitation for a hackathon-stage prototype.

**Product**
- *Who pays?* Consultancies and internal digital-transformation/IT teams — the same buyer as EltegraAI, Ardoq, and Clappia, with comparable seat/usage-based pricing.
- *Why would they switch from ChatGPT?* Because ChatGPT doesn't maintain a persistent, cited, cross-artifact context graph or run an independent verification pass — demonstrated live, not asserted.

**Innovation**
- *Is this just an LLM wrapper?* No — the Verifier's independent grounding pass and the persistent shared context graph across five artifact types are the parts a thin wrapper cannot replicate.
- *Can Microsoft/Google build this easily?* Possibly, eventually — but "a bigger company could build it too" is true of nearly every hackathon project and is why the demoable, working differentiator (the Verifier) matters more than the idea alone.

**Security**
- *What happens to sensitive client documents?* Workspace-scoped storage, role-based access, no cross-tenant data sharing — standard enterprise SaaS posture, explicitly designed in even at prototype stage given the business-document nature of the input.

### 5.10 Top 5 Fatal Weaknesses & Mitigations

| Weakness | Mitigation |
|---|---|
| Feels "too enterprise/boring" next to a flashy consumer demo | Lead with the contradiction-detection wow moment, not a features list |
| Verifier agent itself could hallucinate a "Verified" label | Explicitly acknowledge this in the pitch as a known limitation and describe the next step (a second independent model or rule-based citation-matching check) rather than hiding it |
| Judges ask "why not just use Copilot Studio" (Microsoft's own agent builder) | Answer honestly: Copilot Studio is a platform for building this on top of, not a finished product with this specific verification workflow — position GroundWork AI as an application layer that could itself run on Azure AI Foundry/Copilot Studio, which strengthens rather than undercuts the Microsoft-ecosystem story |
| Estimation agent could give false-precision numbers | Always show ranges + the reference cases used, never a bare number |
| Small hackathon dataset won't prove real accuracy | Be explicit in the pitch that the demo proves the *mechanism* (grounding + verification), not a statistically validated accuracy rate — don't overclaim |

### 5.11 The Winning Moat

Not the LLM (anyone can call the same APIs) — it's the **persistent, cited, cross-artifact context graph** plus the **independent Verifier pass**, both of which require deliberate architecture, not a clever prompt. A competitor copying the idea has to copy the plumbing, not just the pitch.

### 5.12 Realistic Build Plan (the actual available window is ~8 days: Aug 29 → Sep 6 registration close)

**Note again:** the on-campus build dates after Sep 8 selection are not yet published. This plan targets what's actually due next — a strong 5-minute video plus a working proof-of-concept, not a production system.

| Days | Focus | Must-ship |
|---|---|---|
| Day 1–2 | Lock scope, pick the demo scenario (Sec 5.7), set up RAG pipeline + basic Discovery/Analyst agents | A document upload → structured requirements pipeline that works end-to-end, even roughly |
| Day 3–4 | Architect/UX/Data agents (diagram-as-code output), Estimator | Architecture diagram + wireframe + ER diagram generated from the same context |
| Day 5 | Verifier agent + citation UI (this is the single highest-priority feature — protect this day above all else) | Click-a-claim-see-its-source working, even for a limited artifact set |
| Day 6 | Agent trace panel (frontend), polish, break/fix | Visually compelling live trace for the demo |
| Day 7 | Record the 5-minute video per the script in 5.6; write resumes/GitHub/LinkedIn checklist items | Submission-ready video |
| Day 8 (buffer) | Final review, backup recording, submit before Sep 6 | Registration complete |

**MUST HAVE:** document ingestion, at least one full artifact chain (context → architecture/wireframe), the Verifier's citation-vs-unsupported distinction visible in the UI.
**SHOULD HAVE:** the contradiction-detection wow moment, estimate ranges.
**NICE TO HAVE:** Blueprint Drift Detector (repo-comparison feature) — powerful in the pitch as a roadmap item even if only partially built; do not let it block the must-haves.

### 5.13 Team Roles (2–4 members)

- **Product/research lead:** owns the problem framing, competitive positioning, monetization/business-value slide, and the video script
- **AI/backend lead:** owns the agent pipeline, RAG setup, Verifier logic
- **Frontend lead:** owns the workspace UI, agent trace panel, citation click-through
- **(4th member, if available):** diagram-as-code + estimation logic, plus demo-data authoring (Sec 5.7)

If only 2–3 members: merge product/research into whoever is strongest at articulating the pitch; the Verifier and citation UI remain the non-negotiable must-haves regardless of team size.

### 5.14 Pitch/Video Structure (mapped exactly to the required 5 elements)

| Segment | Maps to required element | Time |
|---|---|---|
| Real, specific scenario | Understanding of the Project | 0:45 |
| The Verifier/citation mechanism, named explicitly as the differentiator vs. Ardoq/EltegraAI/ChatGPT | Innovation | 1:00 |
| Architecture walkthrough + live agent trace | Technical Approach | 1:30 |
| Seat/usage-based pricing anchored to comparable tools (Ardoq, EltegraAI, Clappia pricing tiers) | Monetization | 0:30 |
| Time-saved estimate (clearly labeled demo target, not a verified figure) + who benefits | Business Value | 0:45 |

### 5.15 Final Win-Probability Scorecard

| Dimension | Score /10 |
|---|---|
| Problem Fit | 9 |
| Innovation | 8 |
| Technical Depth | 9 |
| AI Usage (genuine, not decorative) | 9 |
| Feasibility in the available window | 7 |
| Impact | 8 |
| Differentiation | 8 |
| Demo Potential | 7 |
| Scalability | 8 |
| Judge Appeal (given organizer's Microsoft/enterprise identity) | 9 |

**Estimated Winning Strength: Strong.** Not "Exceptional" — that label is being withheld deliberately, because the on-campus round's actual format, judges, and rubric are still unknown (Part 1B), and because the demo's wow-factor will read as quieter than a consumer app's. This is the strategy with the best *evidence-backed* probability of winning, not a guaranteed win.

---

## PART 6 — SOURCES

- Futurrizon Technologies company profile / Microsoft Solutions Partner status: erpresearch.com, tracxn.com, thecompanycheck.com, cultusorbitjobs.com
- BRD/requirements AI generators: clappia.com, eltegra.ai (×2), cohesive.so
- AI wireframe tooling landscape: forasoft.com, blog.logrocket.com, uxcrush.com
- Enterprise architecture platforms: energent.ai, superblocks.com, ardoq.com, catio.tech
- Short-video cross-platform policy/copyright risk: syncstudio.ai, hornwright.com, scoredetect.com
- AI sales agent / lead-gen competitive landscape: calilio.com, salesforce.com, mutinyhq.com, lindy.ai, superframeworks.com, aitools-directory.com, callers.ai
- LinkedIn scraping legal status (hiQ v. LinkedIn, LinkedIn v. Proxycurl/Nubela): nubela.co, metaverselaw.com, communitytracker.ai, actuallyusefulextensions.com, connectsafely.ai, autoposting.ai, linkedrent.com

*No public information exists on prior Chaos2Commit editions, named judges, or a published numeric rubric — this report explicitly does not fabricate any of that.*