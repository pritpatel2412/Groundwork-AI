-- GroundWork AI Database Schema
-- Supabase / Postgres with pgvector

create extension if not exists vector;

create table if not exists workspaces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  name text not null,
  created_at timestamptz default now()
);

create table if not exists source_documents (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  filename text,
  raw_text text,
  source_type text check (source_type in ('document','voice_transcript','screenshot_ocr','free_text')),
  uploaded_at timestamptz default now()
);

create table if not exists source_chunks (
  id uuid primary key default gen_random_uuid(),
  source_document_id uuid references source_documents(id) on delete cascade,
  workspace_id uuid references workspaces(id) on delete cascade,
  chunk_index int,
  text text not null,
  embedding vector(384) -- 384-dimensional embeddings (bge-small-en-v1.5 or all-MiniLM-L6-v2)
);

create index if not exists source_chunks_embedding_idx on source_chunks using ivfflat (embedding vector_cosine_ops);

create table if not exists requirements (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  text text not null,
  status text check (status in ('verified','inferred','contested','unsupported')) default 'unsupported',
  confidence float,
  citation_chunk_ids uuid[],
  created_at timestamptz default now()
);

create table if not exists contradictions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  description text,
  source_chunk_ids uuid[],
  created_at timestamptz default now()
);

create table if not exists artifacts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  type text check (type in ('architecture','workflow','wireframe','erd','api','estimate','roadmap')),
  content jsonb, -- Mermaid string or structured JSON depending on type
  version int default 1,
  created_at timestamptz default now()
);

create table if not exists artifact_claims (
  id uuid primary key default gen_random_uuid(),
  artifact_id uuid references artifacts(id) on delete cascade,
  text text not null,
  status text check (status in ('verified','inferred','contested','unsupported')) default 'unsupported',
  confidence float,
  citation_chunk_ids uuid[]
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES (PRODUCTION_HARDENING_BRIEF.md §2.2)
-- Enforced at the database level so a route bug cannot leak another user's data
-- ============================================================================

alter table workspaces enable row level security;
create policy "Users manage their own workspaces"
  on workspaces for all
  using (auth.uid() = user_id);

alter table source_documents enable row level security;
create policy "Users access their own workspace's documents"
  on source_documents for all
  using (workspace_id in (select id from workspaces where user_id = auth.uid()));

alter table source_chunks enable row level security;
create policy "Users access their own workspace's chunks"
  on source_chunks for all
  using (workspace_id in (select id from workspaces where user_id = auth.uid()));

alter table requirements enable row level security;
create policy "Users access their own workspace's requirements"
  on requirements for all
  using (workspace_id in (select id from workspaces where user_id = auth.uid()));

alter table contradictions enable row level security;
create policy "Users access their own workspace's contradictions"
  on contradictions for all
  using (workspace_id in (select id from workspaces where user_id = auth.uid()));

alter table artifacts enable row level security;
create policy "Users access their own workspace's artifacts"
  on artifacts for all
  using (workspace_id in (select id from workspaces where user_id = auth.uid()));

alter table artifact_claims enable row level security;
create policy "Users access their own artifact claims"
  on artifact_claims for all
  using (artifact_id in (select a.id from artifacts a join workspaces w on a.workspace_id = w.id where w.user_id = auth.uid()));

