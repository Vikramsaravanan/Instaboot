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

    // documents table
    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name       TEXT NOT NULL,
        type       TEXT NOT NULL CHECK (type IN ('csv','json','chat','text')),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✓ documents table ready');

    // chunks table — embedding stored as FLOAT8 array (no extension needed)
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

    // chat_history table
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_history (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id TEXT NOT NULL,
        role       TEXT NOT NULL CHECK (role IN ('user','assistant')),
        content    TEXT NOT NULL,
        agent_used TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    // index for fast session lookups
    await client.query(`
      CREATE INDEX IF NOT EXISTS chat_history_session_idx
        ON chat_history (session_id)
    `);
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
