# CLAUDE.md
### Persistent project context for any Claude / Claude Code session working in this repository

This file is read automatically at the start of a session. Follow it exactly. If any instruction here conflicts with a one-off request in chat, prefer this file unless the person explicitly says they're changing project policy (not just asking for a quick exception).

---

## 1. What this project is

**GroundWork AI** — an evidence-grounded Business Transformation Copilot built for the Chaos2Commit hackathon (Futurrizon × CHARUSAT). It converts unstructured business input (documents, voice-note transcripts, scanned screenshots, free-text chat) into a connected blueprint: requirements → solution architecture → wireframes → ER/API design → effort estimate → roadmap — with **every generated claim traceable to a source citation, or explicitly flagged as an unverified AI inference.**

The single most important product idea in this repo: **nothing gets shown to the user as fact unless it's grounded.** Every other decision in this codebase should protect that guarantee. See `/docs/PRD.md` for the full spec — this file is the operating manual for how to work in the code, that file is the source of truth for what to build.

## 2. Non-negotiable architectural invariants

Do not violate these, even under time pressure, even if a shortcut looks tempting:

1. **Cite-or-abstain contract.** Every agent-generated claim (a requirement, an architecture decision, a wireframe element, an ER field, an estimate line) must carry either (a) a citation to a specific source chunk, or (b) an explicit `status: "unsupported"` label with a confidence score. Never let a claim render in the UI with no status at all.
2. **The Verifier agent is independently scoped.** It must never receive the original generation agent's prompt or reasoning — only the claim text plus the retrieved source chunks. If you're tempted to have the same agent "double-check its own work" in one call, stop — that defeats the entire point of the product. Prefer using a **different model/provider** for the Verifier than for the generator whenever both are available (e.g., a Groq-hosted model generates, an NVIDIA-hosted model verifies) — this is a deliberate design choice, not an accident, so don't "simplify" it away.
3. **No silent conflict resolution.** If two source documents contradict each other, surface the contradiction explicitly. Never have an agent quietly pick one value and discard the other.
4. **Nothing auto-publishes.** Every export or "final" action requires an explicit human confirmation step. There is no code path where AI output reaches an export file without passing through the Verifier stage first.
5. **Diagrams are text, not images.** Architecture, workflow, and ER diagrams are generated as Mermaid syntax and rendered client-side — never as generated raster images. This keeps them editable, diffable, and exportable.
6. **Free-tier-first.** This project intentionally uses only free-tier APIs (see §4). Do not introduce a paid API or a paid-only SDK feature without flagging it clearly first — the whole point of the stack choice is a $0 hackathon build.
7. **Fail-closed on ungrounded requirements.** If the Analyst agent produces zero requirements, or produces requirements with zero citations, the pipeline must halt after that stage — it must not proceed to Architect/UX/Data/Estimator. The user must see an explicit failure state ('Could not extract grounded requirements from your source material — try uploading more detail, or a different format') instead of a generated blueprint. No artifact, anywhere in this system, may render as if it's grounded when it isn't, even in a degraded/fallback form.

## 3. Tech stack (see `/docs/BUILD_BRIEF.md` for full justification and setup steps)

| Layer | Choice |
|---|---|
| Frontend | React + Vite, Tailwind, `mermaid` npm package for diagram rendering |
| Backend | Python, FastAPI |
| Agent orchestration | CrewAI |
| Primary LLM | Groq (`llama-3.3-70b-versatile` or `openai/gpt-oss-120b`) |
| Secondary/Verifier LLM | NVIDIA NIM catalog (`build.nvidia.com`, e.g. `deepseek-ai/deepseek-v3.1` or `nvidia/nemotron-3-super-...`) — deliberately a different provider than the primary, for independence |
| Voice STT | Sarvam AI Saaras (voice-note transcription) |
| Translation / multilingual layer | Sarvam AI Translate (Mayura model) |
| Embeddings | Local, free, open-source — `sentence-transformers` (`BAAI/bge-small-en-v1.5` or `all-MiniLM-L6-v2`), no external API call, no rate limit |
| Vector store + DB + Auth + file storage | Supabase free tier (Postgres + `pgvector` + Storage + Auth) |
| OCR (scanned docs) | Tesseract (`pytesseract`), free/local; Sarvam Document Intelligence as an enhancement path for Indic-script scans |
| Hosting (optional, for a live demo link) | Frontend: Vercel free tier. Backend: Render.com free tier |

All API keys are free-tier, no credit card required for any of Groq, NVIDIA Build, or Sarvam's initial credit grant. See `.env.example` and `/docs/BUILD_BRIEF.md §1` for signup links and exact env var names.

## 4. Repository structure

```
/backend
  /app
    /agents          # one file per agent: discovery.py, analyst.py, architect.py, ux.py, data.py, estimator.py, verifier.py
    /rag              # chunking, embedding, retrieval
    /llm_clients      # thin wrappers: groq_client.py, nvidia_client.py, sarvam_client.py + a router with fallback
    /routes           # FastAPI route handlers, one file per resource
    /models           # Pydantic schemas
    /db               # Supabase/Postgres access, migrations
    main.py
  requirements.txt
  .env.example
/frontend
  /src
    /components       # WorkspaceHome, IngestionPanel, AgentTracePanel, RequirementsView, ArchitectureView, WireframeView, DataView, RoadmapView, VerifierSummary, ExportPanel
    /lib              # API client, mermaid render helpers
    App.tsx
  .env.example
/demo_data            # synthetic demo documents (normal / difficult / edge cases) — see PRD FR-DEMO-01–04
/docs
  PRD.md              # full product spec (copy of the PRD the team was given)
  BUILD_BRIEF.md       # the detailed build runbook
  RESEARCH.md          # the "why this problem" strategy report
```

## 5. Environment variables (`.env.example` — copy to `.env`, never commit the real `.env`)

```
GROQ_API_KEY=
NVIDIA_API_KEY=
SARVAM_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ANON_KEY=
DATABASE_URL=
```

Never hardcode a key in source. Never print a key to logs. Never commit `.env`.

## 6. Coding conventions

- Python: type-hint everything; Pydantic models for every API request/response body; one agent = one file = one class with a single `run()` entrypoint.
- Every agent's `run()` method returns a structured object with a `claims: list[Claim]` field, where `Claim` always has `{text, status, citations, confidence}` — this is the shape the Verifier and the frontend both depend on, so don't let any agent return a bare string.
- React: functional components + hooks only. Keep the Agent Trace Panel's streaming state in one place (a single context or store), not scattered across components.
- Commit messages: `[module] short description` (e.g., `[verifier] add independent NVIDIA-backed grounding check`).
- Prefer small, working increments over large unmerged branches — this is an 8-day build (see `/docs/BUILD_BRIEF.md` for the day-by-day plan); always keep `main` demoable.

## 7. LLM call discipline (important given free-tier rate limits)

- Route all LLM calls through `/backend/app/llm_clients/router.py`. Never call a provider SDK directly from an agent file.
- The router tries Groq first (fast, generous free RPM); on a 429 or timeout, it falls back to the NVIDIA NIM endpoint (OpenAI-compatible, same request shape, just a different base URL and model string). Both are free-tier — this fallback exists for resilience during a live demo, not for cost reasons.
- Cache/dedupe repeated calls during development so you don't burn free-tier quota re-running the same demo document forty times a day — see `/docs/BUILD_BRIEF.md §8` for a simple response-cache pattern.
- Never write a retry loop that ignores a 429's `Retry-After` header — read it and back off accordingly.

## 8. Things to explicitly avoid

- Do not scrape LinkedIn, X, or any third-party platform for any feature — this is a legal risk this project has deliberately designed around (see `/docs/RESEARCH.md`).
- Do not aggregate or re-serve third-party video content.
- Do not fabricate example statistics, competitor names, or "verified" accuracy numbers anywhere in generated docs, code comments, or the pitch deck. If a number isn't measured, label it as a target/estimate.
- Do not let the Verifier and the generator share a prompt, a context window, or (ideally) a model provider.
- Do not add a paid API dependency without flagging it first.

## 9. Common commands

```bash
# Backend
cd backend && python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd frontend && npm install && npm run dev

# Seed demo data into the local/Supabase DB
python backend/scripts/seed_demo_data.py
```

## 10. Definition of done for the hackathon MVP

Before recording the demo video, confirm every item in `/docs/PRD.md` Part G's "MUST have on stage" checklist is actually working end-to-end on the three demo datasets in `/demo_data`, not just on a happy-path single document. If something must be cut, cut from `/docs/PRD.md` Part C's `W`/`C`-priority rows first — never cut anything under the Verifier module (`FR-VER-*`).