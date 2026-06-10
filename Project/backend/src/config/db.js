const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://postgres:password@localhost:5432/multiagent_db',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client:', err.message);
});

async function initDB() {
  const client = await pool.connect();
  try {
    console.log('Initializing database...');

    // ── users — must be first (other tables FK reference it) ──────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        name          TEXT        NOT NULL,
        email         TEXT        NOT NULL UNIQUE,
        password_hash TEXT        NOT NULL,
        created_at    TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✓ users table ready');

    // ── documents ─────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
        name       TEXT NOT NULL,
        type       TEXT NOT NULL CHECK (type IN ('csv','json','chat','text')),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await client.query(`ALTER TABLE documents ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE`);
    await client.query(`CREATE INDEX IF NOT EXISTS documents_user_idx ON documents (user_id)`);
    console.log('✓ documents table ready');

    // ── chunks ────────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS chunks (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
        content     TEXT NOT NULL,
        embedding   FLOAT8[],
        metadata    JSONB DEFAULT '{}',
        created_at  TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✓ chunks table ready');

    // ── chat_history ──────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_history (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
        session_id TEXT NOT NULL,
        role       TEXT NOT NULL CHECK (role IN ('user','assistant')),
        content    TEXT NOT NULL,
        agent_used TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await client.query(`ALTER TABLE chat_history ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE`);
    await client.query(`CREATE INDEX IF NOT EXISTS chat_history_session_idx ON chat_history (session_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS chat_history_user_idx ON chat_history (user_id)`);
    console.log('✓ chat_history table ready');

    console.log('✅ Database initialization complete');
  } catch (err) {
    console.error('Database initialization error:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { pool, initDB };
