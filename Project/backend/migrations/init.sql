-- Instaboot — Reference Schema
-- The application creates and migrates all tables automatically via initDB() on startup.
-- This file is for reference only. To apply manually:
--   psql -U postgres -d multiagent_db -f migrations/init.sql

-- ─── Users ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT        NOT NULL,
  email         TEXT        NOT NULL UNIQUE,
  password_hash TEXT        NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Documents ────────────────────────────────────────────────────────────────
-- Each document is owned by a user. Other users cannot see or query it.
CREATE TABLE IF NOT EXISTS documents (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        REFERENCES users(id) ON DELETE CASCADE,
  name       TEXT        NOT NULL,
  type       TEXT        NOT NULL CHECK (type IN ('csv', 'json', 'chat', 'text')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS documents_user_idx ON documents (user_id);

-- ─── Chunks ───────────────────────────────────────────────────────────────────
-- Text chunks with 384-dimensional embeddings from Xenova/all-MiniLM-L6-v2.
-- Stored as FLOAT8[] — no pgvector extension required.
CREATE TABLE IF NOT EXISTS chunks (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID        NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  content     TEXT        NOT NULL,
  embedding   FLOAT8[],
  metadata    JSONB       DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Chat History ─────────────────────────────────────────────────────────────
-- Every message is scoped to a user. Sessions are user-private.
CREATE TABLE IF NOT EXISTS chat_history (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT        NOT NULL,
  role       TEXT        NOT NULL CHECK (role IN ('user', 'assistant')),
  content    TEXT        NOT NULL,
  agent_used TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS chat_history_session_idx ON chat_history (session_id);
CREATE INDEX IF NOT EXISTS chat_history_user_idx    ON chat_history (user_id);
CREATE INDEX IF NOT EXISTS chat_history_created_idx ON chat_history (created_at DESC);
