-- MultiAgent Chatbot - Database Initialization Script
-- Run this manually with: psql -U postgres -d multiagent_db -f migrations/init.sql
-- Or let the application run initDB() on startup.

-- Enable the pgvector extension (must be installed on your PostgreSQL instance)
CREATE EXTENSION IF NOT EXISTS vector;

-- ─── Documents ────────────────────────────────────────────────────────────────
-- Stores metadata for each uploaded document (CSV, JSON, or text/chat input).
CREATE TABLE IF NOT EXISTS documents (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL,
  type       TEXT        NOT NULL CHECK (type IN ('csv', 'json', 'chat', 'text')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Chunks ───────────────────────────────────────────────────────────────────
-- Stores text chunks and their 384-dimensional embeddings (from all-MiniLM-L6-v2).
CREATE TABLE IF NOT EXISTS chunks (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID        NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  content     TEXT        NOT NULL,
  embedding   vector(384),
  metadata    JSONB       DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- IVFFlat index for fast approximate nearest-neighbor cosine similarity search.
-- NOTE: ivfflat requires at least 100 rows to create. Run after seeding data:
--   CREATE INDEX IF NOT EXISTS chunks_embedding_idx
--     ON chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ─── Chat History ─────────────────────────────────────────────────────────────
-- Stores conversation messages per session.
CREATE TABLE IF NOT EXISTS chat_history (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT        NOT NULL,
  role       TEXT        NOT NULL CHECK (role IN ('user', 'assistant')),
  content    TEXT        NOT NULL,
  agent_used TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast session lookups
CREATE INDEX IF NOT EXISTS chat_history_session_idx ON chat_history (session_id);
CREATE INDEX IF NOT EXISTS chat_history_created_idx ON chat_history (created_at DESC);

-- ─── Useful views ─────────────────────────────────────────────────────────────

-- Session summary view
CREATE OR REPLACE VIEW session_summary AS
SELECT
  session_id,
  COUNT(*)                             AS message_count,
  MIN(created_at)                      AS started_at,
  MAX(created_at)                      AS last_message_at
FROM chat_history
GROUP BY session_id;
