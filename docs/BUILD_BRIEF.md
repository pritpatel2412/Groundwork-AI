# END-TO-END BUILD BRIEF: GROUNDWORK AI
### A complete, step-by-step implementation runbook for an autonomous build agent (e.g. Google Antigravity)
### Constraint driving every technology choice in this document: $0 cost. Every service below has a genuine free tier, verified as of August 2026, with no credit card required to start.

---

## 0. READ THIS FIRST — MISSION, SCOPE, AND GROUND RULES

**Build this:** GroundWork AI, a web app where a user uploads messy business documents (and/or a voice-note transcript, and/or a screenshot of an old app screen), and a pipeline of AI agents produces five connected artifacts — requirements list, solution architecture diagram, wireframes, ER/API design, and a cost/timeline estimate — where **every generated statement is either linked to the exact source sentence that justifies it, or explicitly labeled as an unverified AI guess.** That labeling mechanism (the "Verifier") is the single most important feature in this entire build. If you have to cut scope anywhere under time pressure, cut somewhere else first.

**Full product spec:** see the companion `PRD.md` (Parts C and E especially) for feature-level detail and rationale. This document is the *how to actually build it* runbook; that document is the *what and why*.

**Non-negotiable invariants (do not violate these while building, even to save time):**
1. Every agent output must carry a citation or an explicit "unsupported" flag — never let a claim render with no status.
2. The Verifier must be an independently-scoped model call (different prompt context, ideally a different model provider) from whatever generated the claim it's checking.
3. Contradictions between source documents must be surfaced, never silently resolved.
4. Diagrams are generated as text (Mermaid syntax), never as raster images.
5. Everything must run on free-tier services only — flag it loudly if a step would require a paid plan or a credit card, and find a free substitute instead.

---

## 1. FREE-TIER SERVICE STACK — SIGN UP FOR THESE FIRST, BEFORE WRITING ANY CODE

Do this as literally step one. Each of these takes under 10 minutes and needs no credit card.

| # | Service | What it's used for | Free tier (verified Aug 2026) | Sign-up |
|---|---|---|---|---|
| 1 | **Groq** (GroqCloud) | Primary LLM for all reasoning agents (Discovery, Analyst, Architect, UX, Data, Estimator) — chosen for speed, which matters directly for the live-demo "agent trace" experience | No credit card. Free developer tier: full model catalog (Llama 3.3 70B, GPT-OSS 120B, Llama 4 Scout, Qwen 3, Kimi K2, etc.) at roughly 30 requests/min, 6,000 tokens/min, 14,400 requests/day per organization. Plenty for a hackathon demo. | console.groq.com — sign in with email or Google, generate an API key immediately |
| 2 | **NVIDIA Build (NIM API catalog)** | Secondary LLM provider, used specifically for the **Verifier agent**, so verification runs on a genuinely different model/provider than generation | No credit card. Free developer account grants an initial credit pool (historically ~1,000 credits; some models are fully free and don't consume credits at all, e.g. GLM-4). OpenAI-compatible endpoint. ~40 requests/min on the free tier. 100+ hosted models (DeepSeek, Llama, Qwen, Nemotron, GLM, Mistral). | build.nvidia.com — sign in, go to any model page, click "Get API Key" |
| 3 | **Sarvam AI** | Voice-note transcription (STT), translation for multilingual support, and optionally document/OCR intelligence for Indic-script scans | No credit card. New accounts receive free starting credits (public pricing page states ₹1,000; the rate-limit docs mention ₹100 — verify the current figure in your own dashboard after signup, and don't block the build on this number either way, since a small amount of STT/translation traffic is all a demo needs) | dashboard.sarvam.ai — sign up, generate an API key |
| 4 | **Supabase** | Postgres database + `pgvector` extension (vector store for RAG) + file storage (uploaded source documents) + auth, all in one free project | Free tier: one project, 500MB database, 1GB file storage, `pgvector` extension available out of the box | supabase.com — new project, note the project URL, anon key, and service role key |
| 5 | **Vercel** (optional, only if you want a shareable live link) | Frontend hosting | Free tier is generous for a hackathon-scale app | vercel.com |
| 6 | **Render.com** (optional, only if you want a shareable live link) | Backend hosting | Free web service tier (sleeps when idle — fine for a demo, just "wake it" a minute before recording/presenting) | render.com |

**Not signing up for anything:**
- **Embeddings** run locally via the open-source `sentence-transformers` Python package — zero API calls, zero cost, zero rate limit, works offline. This is deliberate: RAG chunk-embedding happens constantly during development, and you do not want to burn any provider's free-tier quota on it.
- **OCR** runs locally via `pytesseract` (a wrapper around the open-source Tesseract engine) — also zero cost.

---

## 2. REPOSITORY SETUP (STEP 0 — DO THIS BEFORE ANY FEATURE CODE)

```bash
mkdir groundwork-ai && cd groundwork-ai
git init

mkdir -p backend/app/{agents,rag,llm_clients,routes,models,db}
mkdir -p backend/scripts
mkdir -p frontend/src/{components,lib}
mkdir -p demo_data docs

touch backend/requirements.txt backend/.env.example
touch frontend/.env.example
touch docs/PRD.md docs/BUILD_BRIEF.md docs/RESEARCH.md
touch CLAUDE.md .gitignore
echo -e ".venv/\nnode_modules/\n.env\n__pycache__/\n*.pyc\ndist/" > .gitignore
```

Copy the PRD, this build brief, the research report, and CLAUDE.md into `/docs` and the repo root respectively (they were provided as separate files alongside this one).

### Backend dependencies (`backend/requirements.txt`)

```
fastapi
uvicorn[standard]
pydantic
python-dotenv
crewai
groq
openai              # used for both the NVIDIA NIM client and the local response schema (NVIDIA's endpoint is OpenAI-compatible)
sentence-transformers
pytesseract
pillow
pymupdf             # PDF text extraction
python-docx         # DOCX parsing
supabase
psycopg2-binary
pgvector
requests
```

### Frontend dependencies (`frontend`, via `npm create vite@latest frontend -- --template react-ts`)

```
npm install mermaid axios zustand tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

`zustand` is recommended for the Agent Trace Panel's streaming state (simple, no boilerplate) — see §5.3.

### `.env.example` (backend)

```
GROQ_API_KEY=
NVIDIA_API_KEY=
SARVAM_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
```

---

## 3. DATABASE SCHEMA (SUPABASE / POSTGRES + PGVECTOR)

Run this as a migration in the Supabase SQL editor (or via a migration script).

```sql
create extension if not exists vector;

create table workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

create table source_documents (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  filename text,
  raw_text text,
  source_type text check (source_type in ('document','voice_transcript','screenshot_ocr','free_text')),
  uploaded_at timestamptz default now()
);

create table source_chunks (
  id uuid primary key default gen_random_uuid(),
  source_document_id uuid references source_documents(id) on delete cascade,
  workspace_id uuid references workspaces(id) on delete cascade,
  chunk_index int,
  text text not null,
  embedding vector(384) -- matches all-MiniLM-L6-v2 / bge-small dimensionality
);

create index on source_chunks using ivfflat (embedding vector_cosine_ops);

create table requirements (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  text text not null,
  status text check (status in ('verified','inferred','unsupported')) default 'unsupported',
  confidence float,
  citation_chunk_ids uuid[],
  created_at timestamptz default now()
);

create table contradictions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  description text,
  source_chunk_ids uuid[]
);

create table artifacts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  type text check (type in ('architecture','workflow','wireframe','erd','api','estimate','roadmap')),
  content jsonb, -- Mermaid string or structured JSON, depending on type
  version int default 1,
  created_at timestamptz default now()
);

create table artifact_claims (
  id uuid primary key default gen_random_uuid(),
  artifact_id uuid references artifacts(id) on delete cascade,
  text text not null,
  status text check (status in ('verified','inferred','unsupported')) default 'unsupported',
  confidence float,
  citation_chunk_ids uuid[]
);
```

---

## 4. BACKEND BUILD — PHASE BY PHASE

### 4.1 LLM client router (`backend/app/llm_clients/router.py`) — build this before any agent

Both Groq and NVIDIA NIM expose OpenAI-compatible chat-completions endpoints, so one thin wrapper can target either by swapping `base_url` and `model`.

```python
import os, time
from openai import OpenAI

GROQ_CLIENT = OpenAI(api_key=os.environ["GROQ_API_KEY"], base_url="https://api.groq.com/openai/v1")
NVIDIA_CLIENT = OpenAI(api_key=os.environ["NVIDIA_API_KEY"], base_url="https://integrate.api.nvidia.com/v1")

GROQ_MODEL = "llama-3.3-70b-versatile"          # fast, high quality, generous free tier — used by generation agents
NVIDIA_VERIFIER_MODEL = "deepseek-ai/deepseek-v3.1"  # deliberately a different provider/model family — used ONLY by the Verifier

def call_llm(messages, purpose="generate", temperature=0.2, max_retries=2):
    """
    purpose="generate" -> Groq (fast, primary)
    purpose="verify"   -> NVIDIA (independent provider, for the Verifier agent only)
    Falls back Groq -> NVIDIA on rate limit / error, so a live demo doesn't die on one 429.
    """
    provider_order = (
        [(GROQ_CLIENT, GROQ_MODEL), (NVIDIA_CLIENT, NVIDIA_VERIFIER_MODEL)]
        if purpose == "generate"
        else [(NVIDIA_CLIENT, NVIDIA_VERIFIER_MODEL), (GROQ_CLIENT, GROQ_MODEL)]
    )
    last_err = None
    for client, model in provider_order:
        for attempt in range(max_retries):
            try:
                resp = client.chat.completions.create(
                    model=model, messages=messages, temperature=temperature
                )
                return resp.choices[0].message.content
            except Exception as e:
                last_err = e
                wait = getattr(e, "retry_after", 2 ** attempt)
                time.sleep(min(wait, 10))
        # move to next provider in the list
    raise RuntimeError(f"All LLM providers failed: {last_err}")
```

**Why this matters for the pitch, not just the code:** using NVIDIA-hosted DeepSeek for the Verifier while Groq-hosted Llama generates is not just a fallback pattern — it's the literal implementation of "the Verifier can't just agree with itself" (see `CLAUDE.md §2.2` and the PRD's Part E.3). Say this explicitly in the demo video.

### 4.2 RAG pipeline (`backend/app/rag/`)

`chunking.py` — split each `SourceDocument.raw_text` into ~300–500 token chunks with slight overlap (simple sentence-boundary-aware splitter is enough; don't over-engineer this).

`embeddings.py`:
```python
from sentence_transformers import SentenceTransformer
_model = SentenceTransformer("BAAI/bge-small-en-v1.5")  # local, free, 384-dim

def embed(texts: list[str]) -> list[list[float]]:
    return _model.encode(texts, normalize_embeddings=True).tolist()
```

`retrieval.py` — given a query string and a `workspace_id`, embed the query, run a cosine-similarity search against `source_chunks.embedding` via `pgvector`'s `<=>` operator, return the top-k chunks (k=5 is a reasonable default for a hackathon corpus size).

### 4.3 Ingestion (`backend/app/routes/ingestion.py`)

- PDF → text: `pymupdf` (`fitz`)
- DOCX → text: `python-docx`
- Plain text / pasted transcript: store as-is
- Screenshot → text: `pytesseract.image_to_string(image)`; if the screenshot is in an Indic script and Tesseract quality is poor, add a fallback call to Sarvam's document-intelligence endpoint (see §6)
- Voice-note transcript: if the user uploads raw audio rather than a pre-transcribed text, call Sarvam Saaras STT (see §6) before treating it like any other source document

After extraction: save a `source_documents` row, chunk the text, embed each chunk locally, save `source_chunks` rows with embeddings.

### 4.4 Agents (`backend/app/agents/`) — one file per agent, CrewAI-based

Each agent is a CrewAI `Agent` + `Task` pair with a narrow role and a narrow slice of retrieved context — never the full document dump. Below are the exact prompt-template skeletons to implement.

**`discovery.py`** — structures raw ingested material into a clean context summary (no citation requirement yet, this agent just organizes; citation enforcement starts at the Analyst).

**`analyst.py`** — the first agent that must obey the cite-or-abstain contract.
```
SYSTEM PROMPT (analyst.py):
You are a business analyst extracting requirements from source material.
For every requirement you output, you MUST include the exact chunk_id(s) it came from.
If you cannot point to a specific chunk that supports a requirement, do not include it as a
requirement — instead add it to a separate "open_questions" list.
If two chunks give conflicting information (e.g., different numeric thresholds for the same rule),
do NOT pick one — output both, under a "contradictions" list, with both chunk_ids.
Return strict JSON: { "requirements": [...], "open_questions": [...], "contradictions": [...] }
```

**`architect.py`**, **`ux.py`**, **`data.py`** — each receives the Analyst's requirement list (with citations) as input context, generates its artifact (Mermaid architecture diagram / wireframe JSON / ER diagram + API list respectively), and every individual decision must be tagged as either directly derived from a specific requirement (cite the requirement id, which itself traces back to a chunk) or `"inferred"` with a stated reason and confidence score. Run these three agents in parallel (they don't depend on each other, only on the Analyst's output) — use `asyncio.gather` or CrewAI's parallel task support.

Example architect output shape:
```json
{
  "diagram": "graph TD; A[Client Portal] --> B[Approval Service]; ...",
  "decisions": [
    {"text": "Approval Service enforces a $1000 threshold", "status": "verified", "requirement_ids": ["..."], "confidence": 0.95},
    {"text": "Recommend a message queue between Approval Service and Notification Service", "status": "inferred", "requirement_ids": [], "confidence": 0.4}
  ]
}
```

**`estimator.py`** — takes all upstream artifacts, outputs a range (never a single number) plus 1–3 reference cases used for calibration (these can be a small hardcoded lookup table of typical project sizes for the hackathon — label this openly as a simplification in the pitch, not something to hide).

**`verifier.py`** — the most important file in the repo.
```
SYSTEM PROMPT (verifier.py) — this call uses call_llm(purpose="verify"), i.e. the NVIDIA-hosted
model, and receives ONLY the following — never the original generation prompt or the generating
agent's chain of thought:
  1. The claim text being checked
  2. The full text of the source chunk(s) it claims to cite (if any)
You are an independent fact-checker. Given a claim and the source text it is supposed to be
grounded in, determine: does the source text actually support this claim?
Return strict JSON: { "verdict": "verified" | "unsupported", "explanation": "<one sentence>" }
If the claim cited no source chunk at all, skip the LLM call entirely and mark it "unsupported"
automatically — don't waste a call confirming the obvious.
```
Run this check for every single claim produced by the Analyst/Architect/UX/Data/Estimator agents before anything reaches the frontend. Store the verdict back onto the corresponding row (`requirements.status` / `artifact_claims.status`).

### 4.5 Orchestration endpoint (`backend/app/routes/generate.py`)

`POST /workspaces/{id}/generate` should:
1. Run Discovery → Analyst (sequential, Analyst depends on Discovery's structured output)
2. Run Architect, UX, Data agents in parallel (all depend only on the Analyst's output)
3. Run Estimator (depends on all three above)
4. Run the Verifier over every claim produced in steps 1–3
5. Stream progress events to the frontend as each stage completes (see §5.3 for the trace panel contract) — a simple Server-Sent Events (SSE) endpoint is enough; don't build a full WebSocket layer unless the team already knows one well.

### 4.6 Remaining routes

| Route | Behavior |
|---|---|
| `POST /workspaces` | Create workspace |
| `POST /workspaces/{id}/sources` | Upload + ingest a source (file or pasted text) |
| `GET /workspaces/{id}/requirements` | Return requirements with status + citations |
| `GET /workspaces/{id}/artifacts/{type}` | Return a specific artifact |
| `GET /artifacts/{id}/claims` | Return claim-level breakdown for the Verifier UI |
| `POST /workspaces/{id}/export` | Render current state to Markdown, offer as download |

---

## 5. FRONTEND BUILD — PHASE BY PHASE

### 5.1 Screens (build in this order — matches PRD Part F)

1. Workspace home (list/create workspaces)
2. Ingestion screen (upload + free-text chat box)
3. **Agent Trace Panel** — persistent side panel during generation; this is the demo's signature visual, so budget real time for it
4. Requirements & gaps view (citation chips, open questions, contradictions section)
5. Architecture view (render Mermaid; clicking a node/edge opens the citation side panel)
6. Wireframe view (render the JSON spec as simple boxes/labels; click-through to citations)
7. Data/API view (ER diagram + endpoint list)
8. Roadmap & estimate view (range, not a single number; show reference cases)
9. Verifier summary (workspace-level Verified/Inferred/Unsupported breakdown — arguably the single best screen to show a judge)
10. Export screen

### 5.2 Rendering Mermaid diagrams

```tsx
import mermaid from "mermaid";
useEffect(() => { mermaid.initialize({ startOnLoad: false }); }, []);
// then render on demand: mermaid.render(id, diagramString) and inject the resulting SVG
```
Make each node/edge clickable by post-processing the rendered SVG's `<g>` elements or by encoding a stable `id` into the Mermaid node label and attaching a click handler that looks up the claim by that id.

### 5.3 Agent Trace Panel — streaming state contract

Use a simple `zustand` store: `{ stages: [{name, status: 'pending'|'running'|'done', citationsFound: [...]}], currentStage }`. Consume the backend's SSE stream (§4.5) and push events into this store; render each stage as a row that lights up when `status` transitions, with citations appearing as small chips as they're produced. This is the visual that carries the "intelligence" beat of the demo script — see `PRD.md` Part H.1 — so make the transition between stages visibly obvious, not subtle.

### 5.4 Citation click-through UI (the core differentiator, visually)

Every claim in every view should be a clickable chip/pill styled by status:
- **Verified** → green, click reveals the exact source sentence + which document it came from
- **Inferred** → amber, click reveals the confidence score and the reasoning
- **Unsupported** → red/orange, click reveals "No supporting source found — recommend validating with the client"

Build this as one shared `<ClaimChip claim={claim} />` component used across every artifact view, so it only has to be built well once.

---

## 6. MULTILINGUAL & VOICE LAYER (SARVAM AI)

This section directly satisfies the hackathon brief's explicit "every application should be multilingual" requirement, using Sarvam AI's Indic-language stack — one provider, one free credit pool, three capabilities:

| Need | Sarvam endpoint | Notes |
|---|---|---|
| Voice-note ingestion (FR-DISC-02) | Saaras STT | Accepts audio, returns transcript; supports 22 Indian languages plus code-mixed speech (e.g., Hinglish) |
| Multilingual UI/output (D.5 in the PRD) | Sarvam Translate (Mayura model) | Translate generated requirement/artifact text into a user-selected Indian language on demand — implement as a simple "Translate this view" toggle rather than full app localization, which is enough to demonstrate the design intent within the hackathon window |
| OCR fallback for Indic-script scans (FR-DISC-04) | Sarvam document intelligence | Use only as a fallback when Tesseract's confidence is low on a non-Latin-script image |

Client wrapper pattern (`backend/app/llm_clients/sarvam_client.py`): a thin `requests`-based wrapper hitting Sarvam's REST endpoints with the API key in headers — no special SDK required, keep it simple.

**Framing for the pitch:** state explicitly in the demo video that the multilingual requirement from the brief is met via a dedicated Indic-language specialist stack (Sarvam) rather than a bolted-on generic translation call — this is a stronger, more specific answer than "we'll add i18n later."

---

## 7. DEMO DATA (BUILD THIS BEFORE ANY AGENT CODE — SEE `PRD.md` FR-DEMO-01–04)

Create four document sets in `/demo_data`:
1. `normal_case/` — one clean SOP describing a simple approval workflow (e.g., "purchase requests under $1,000 are auto-approved; above that, they require manager sign-off").
2. `difficult_case/` — a messy transcript-style text file that **contradicts itself** on a specific number (e.g., one paragraph says the threshold is $1,000, another says $5,000) — this is what produces the demo's best moment (the contradiction-flagging UI).
3. `edge_case/` — a deliberately lower-quality "scanned" image (render a screenshot of text at low resolution, or add visual noise) to exercise the OCR fallback path.
4. `real_world_case/` — `purch-po-vendor.pdf` (Cornell University Purchasing & Vendor SOP, 23 dense pages, 27,186 chars). Exercises Map-Reduce coverage RAG, dense domain extraction across vendor profile types, W-9/tax compliance, APO threshold routing workflows, KFS ERP integration, and multi-entity ERD generation with zero fallback boilerplate.

`backend/scripts/seed_demo_data.py` should create a workspace and ingest these automatically, so the whole team can reset to a known-good demo state at any time without re-uploading files by hand.

---

## 8. TESTING & QA CHECKLIST (RUN BEFORE EVERY REHEARSAL)

- [ ] Upload `normal_case/` → full pipeline runs → all five artifacts render → every claim has a status
- [ ] Upload `difficult_case/` → the contradiction is surfaced explicitly in the Requirements view, not silently resolved
- [ ] Upload `edge_case/` → OCR extracts usable text (Tesseract first, Sarvam fallback if needed)
- [ ] Ingest `real_world_case/purch-po-vendor.pdf` → Map-Reduce coverage extraction produces > 20 grounded requirements (typically 50-100+), 100% with chunk citations → ERD contains `VENDOR` entity (never generic `USER/REQUEST/RESPONSE`) → Architecture diagram contains domain concepts (vendor intake, approval routing, W-9 compliance, ERP)
- [ ] Click at least one Verified, one Inferred, and one Unsupported claim in the UI and confirm the citation panel shows correct, matching source text
- [ ] Kill the Groq API key temporarily and confirm the router falls back to NVIDIA without the app crashing (tests the resilience story you'll state in Q&A)
- [ ] Confirm nothing exports without passing through the Verifier stage first
- [ ] Confirm no API key appears in any committed file or console log

**Simple free-tier quota discipline during development:** cache LLM responses for the demo datasets locally (a dict keyed by a hash of the input + agent name is enough) so repeated rehearsal runs don't burn Groq/NVIDIA free-tier quota unnecessarily. Do not cache in a way that hides real pipeline bugs — only cache the external LLM call, not your own business logic.

---

## 9. DEPLOYMENT (OPTIONAL — ONLY IF A LIVE LINK IS WANTED IN ADDITION TO THE RECORDED VIDEO)

- Frontend → Vercel: connect the repo, set the build directory to `frontend`, add the frontend `.env` vars (API base URL) in Vercel's dashboard.
- Backend → Render.com: new Web Service from the repo, root directory `backend`, start command `uvicorn app.main:app --host 0.0.0.0 --port $PORT`, add all backend env vars in Render's dashboard. Free tier sleeps after inactivity — hit the health endpoint a minute before any live viewing to wake it.
- Supabase is already hosted — no deployment step needed for the database.

For the actual submitted video (`PRD.md` Part H), recording a local run is safer than depending on a live deployed link that might be cold-starting or rate-limited on camera.

---

## 10. DEFINITION OF DONE — MAP BACK TO THE PRD

Before considering the build finished, confirm every `M`-priority requirement in `PRD.md` Part C is implemented and demonstrated on all three demo datasets, with special emphasis on `FR-VER-01` through `FR-VER-05` (never de-prioritize these). Cross-check against `PRD.md` Part G's "MUST have on stage" checklist and Part I's risk register before recording the final video.

---

## 11. TROUBLESHOOTING / KNOWN FREE-TIER GOTCHAS

| Symptom | Likely cause | Fix |
|---|---|---|
| Groq returns HTTP 429 mid-demo | Free tier RPM/TPM limit hit (shared across the whole org, not per key) | Router should already fall back to NVIDIA automatically (§4.1); if rehearsing repeatedly, use the response cache from §8 |
| NVIDIA NIM call fails with an auth or quota error | Free credit pool exhausted, or wrong model string | Check the model catalog page on build.nvidia.com for the exact current model id string (these are occasionally renamed) and confirm remaining credits in the dashboard |
| Sarvam STT/translation call fails | Free credit balance is small — don't burn it on repeated rehearsal of the same transcript | Transcribe/translate the demo voice note once, cache the text output, and reuse it for all subsequent rehearsals |
| `pgvector` similarity search returns irrelevant chunks | Embedding dimension mismatch (schema assumes 384-dim from `bge-small`/`MiniLM`) | If you swap embedding models, update the `vector(384)` column definition to match the new model's output dimension |
| Mermaid fails to render a generated diagram | LLM produced syntactically invalid Mermaid | Add a simple validate-and-retry loop (attempt render client-side or via a Mermaid CLI check server-side; on failure, re-prompt the agent once with the error message); keep one static fallback diagram for the exact demo dataset as insurance for the recording session |