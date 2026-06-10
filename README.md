# Instaboot

An AI-powered assistant that generates install scripts for 70+ tools across Windows, macOS, and Linux, runs prompt pipelines from uploaded files, and answers questions about your documents — all with per-user privacy and JWT authentication.

**Stack:** React 18 · Tailwind CSS · Node.js · Express · PostgreSQL · Groq LLM · @xenova/transformers

---

## Features

- **Install Script Generator** — Ask to install any software on Windows, macOS, or Linux and get ready-to-run terminal commands
- **File Prompt Runner** — Upload a CSV/JSON file containing prompts; the agent runs each one in order and returns the results in chat
- **Document Q&A** — Upload CSV/JSON files, index them as embeddings, and ask questions about their contents
- **Per-user Privacy** — Chat history and uploaded documents are scoped to the logged-in user; other users cannot access your data
- **JWT Authentication** — Register/login with email + password; tokens are stored in localStorage and sent on every request

---

## Prerequisites

- **Node.js 18+** and **npm**
- **PostgreSQL 14+** running locally (or via Docker)
- A **GROQ_API_KEY** from [console.groq.com](https://console.groq.com) for LLM responses

---

## Quick Start

### 1. Clone and configure

```bash
cd instaboot

# Backend environment
copy backend\.env.example backend\.env
# Open backend/.env and set your GROQ_API_KEY and DATABASE_URL
```

### 2. PostgreSQL setup

```sql
-- Run in psql as the postgres user:
CREATE DATABASE multiagent_db;
```

The application creates all tables automatically on first startup via `initDB()`. No manual migration needed.

### 3. Backend

```bash
cd backend
npm install
npm run dev
# Server starts at http://localhost:5000
```

### 4. Frontend

```bash
cd frontend
npm install
npm start
# Opens http://localhost:3000 automatically
```

---

## Environment Variables

All variables go in `backend/.env`. Copy from `backend/.env.example`.

| Variable         | Default                                                  | Description                                    |
|------------------|----------------------------------------------------------|------------------------------------------------|
| `PORT`           | `5000`                                                   | Backend HTTP port                              |
| `DATABASE_URL`   | `postgresql://postgres:password@localhost:5432/multiagent_db` | PostgreSQL connection string            |
| `JWT_SECRET`     | *(required)*                                             | Secret used to sign JWT tokens — set a strong random string |
| `GROQ_API_KEY`   | *(required)*                                             | Groq API key for LLM responses                 |
| `GROQ_MODEL`     | `llama3-8b-8192`                                         | Groq model name                                |
| `CORS_ORIGIN`    | `http://localhost:3000`                                  | Allowed frontend origin                        |
| `CHUNK_SIZE`     | `500`                                                    | Characters per text chunk                      |
| `CHUNK_OVERLAP`  | `50`                                                     | Overlap characters between adjacent chunks     |
| `TOP_K`          | `5`                                                      | Number of similar chunks to retrieve per query |

---

## API Documentation

All routes except `/api/auth/*` and `/api/health` require a `Authorization: Bearer <token>` header.

### Auth

#### `POST /api/auth/register`
```json
// Request
{ "name": "Jane Doe", "email": "jane@example.com", "password": "secret123" }

// Response 201
{ "success": true, "token": "eyJ...", "user": { "id": "uuid", "name": "Jane Doe", "email": "jane@example.com" } }
```

#### `POST /api/auth/login`
```json
// Request
{ "email": "jane@example.com", "password": "secret123" }

// Response 200
{ "success": true, "token": "eyJ...", "user": { "id": "uuid", "name": "Jane Doe", "email": "jane@example.com" } }
```

#### `GET /api/auth/me`
Returns the user decoded from the current token.

---

### Health Check

```
GET /api/health
Response: { "status": "ok", "timestamp": "2024-06-01T12:00:00.000Z" }
```

---

### Upload

All upload routes require authentication. Documents are stored per-user and never visible to other users.

#### `POST /api/upload/analyze` *(recommended)*
Upload a CSV/JSON file containing prompts. The agent runs each prompt through the pipeline in order and saves all results to the current chat session.

```
Content-Type: multipart/form-data
Body: file=<file>, sessionId=<uuid>

Response:
{
  "success": true,
  "documentId": "uuid",
  "chunksCreated": 12,
  "promptCount": 3,
  "results": [
    { "index": 1, "prompt": "Install Docker on Windows", "response": "...", "agentUsed": "Script Generator Agent", "script": "..." },
    { "index": 2, "prompt": "Install Python on Ubuntu", "response": "...", "agentUsed": "Script Generator Agent", "script": "..." }
  ],
  "message": "\"prompts.csv\" — 3 prompts processed."
}
```

**Supported prompt column names** (priority order): `prompt`, `query`, `question`, `text`, `input`, `message`, `content`, or the first string column.

#### `POST /api/upload`
Upload and index a file without running the prompt pipeline.

```
Content-Type: multipart/form-data
Body: file=<.csv or .json file>

Response:
{ "success": true, "documentId": "uuid", "chunksCreated": 42, "message": "..." }
```

#### `POST /api/upload/text`
Index plain text directly.

```json
// Request
{ "text": "some content to index", "name": "my-note" }

// Response
{ "success": true, "documentId": "uuid", "chunksCreated": 3, "message": "..." }
```

#### `GET /api/upload` or `GET /api/documents`
List all documents uploaded by the currently authenticated user.

```json
{
  "success": true,
  "documents": [
    { "id": "uuid", "user_id": "uuid", "name": "data.csv", "type": "csv", "created_at": "..." }
  ]
}
```

---

### Chat

All chat routes require authentication. Sessions and history are scoped to the authenticated user.

#### `POST /api/chat`
```json
// Request
{ "message": "Install Docker on Windows 11", "sessionId": "uuid" }

// Response
{
  "success": true,
  "response": "## Installing Docker on Windows (PowerShell)...",
  "agentUsed": "Script Generator Agent",
  "script": "winget install --id Docker.DockerDesktop ...",
  "sessionId": "uuid",
  "software": "docker",
  "os": "Windows (PowerShell)",
  "version": "26.1.3"
}
```

#### `GET /api/chat/history/:sessionId`
Returns only messages belonging to the authenticated user for that session.

```json
{
  "success": true,
  "sessionId": "uuid",
  "history": [
    { "id": "uuid", "user_id": "uuid", "session_id": "uuid", "role": "user", "content": "...", "agent_used": null, "created_at": "..." }
  ]
}
```

#### `GET /api/chat/sessions`
List all sessions for the authenticated user only.

```json
{
  "success": true,
  "sessions": [
    { "session_id": "uuid", "message_count": "6", "started_at": "...", "last_message_at": "...", "first_message": "Install Docker..." }
  ]
}
```

---

## Architecture & Workflow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          INSTABOOT ARCHITECTURE                         │
│              Multi-Agent Chatbot with RAG, Groq LLM & Document Querying │
└─────────────────────────────────────────────────────────────────────────┘

USER
 │  Ask questions / upload documents
 ▼
FRONTEND (React)
 │  Chat interface · File upload · Display responses
 │  HTTP / REST
 ▼
BACKEND (Node.js + Express)
 │  API endpoints · Request validation · JWT auth · Response handling
 │
 ├──────────────────────────────► DATABASE (PostgreSQL)
 │                                 Users · Chat history · File metadata
 │
 ▼
AGENT ROUTER  —  classifies the user request and routes to the right agent
 │
 ├──── General / Non-Document Query ──────► CHAT AGENT
 │                                          Handles general conversation
 │                                                │
 └──── Document / Knowledge Search ───────► DOCUMENT AGENT (RAG)
                                             Handles document queries
                                             using the RAG pipeline
                                                  │
                                         ┌────────▼──────────┐
                                         │  SEMANTIC SEARCH  │
                                         │  (find similar    │
                                         │   chunks)         │
                                         └────────┬──────────┘
                                                  │
                                         ┌────────▼──────────┐
                                         │ RETRIEVE TOP-K    │
                                         │ CONTEXT           │
                                         │ (relevant chunks) │
                                         └────────┬──────────┘
                                                  │
                                         ┌────────▼──────────┐
                                         │ AUGMENTED PROMPT  │
                                         │ (question +       │
                                         │  context)         │
                                         └────────┬──────────┘
                                                  │
                                         ◄────────┘
GROQ LLM API (Llama 3.x models)
 │  Generate response from Chat Agent or augmented RAG prompt
 ▼
RESPONSE PROCESSING
 │  Format response · Add sources (if RAG) · Handle errors
 ▼
RESPONSE TO USER — displayed in the UI


DOCUMENT INGESTION PIPELINE (runs on file upload)
─────────────────────────────────────────────────
  Upload (CSV / JSON)
       │
  Text Extraction
       │
  Text Chunking  (split into small overlapping chunks)
       │
  Embedding Generation  (@xenova/all-MiniLM-L6-v2 → 384-dim vectors)
       │
  Vector Storage  (FLOAT8[] in PostgreSQL, scoped to user)
```

### Workflow Summary

1. User interacts via the React frontend
2. Request goes to the Node.js/Express backend API
3. Agent Router classifies the request (install script / document query / general chat)
4. Routed to the Script Generator Agent, Knowledge Query Agent, or General Chat Agent
5. For document queries — RAG pipeline retrieves relevant chunks via cosine similarity
6. Context + query are sent to the Groq LLM API
7. Response is processed and sent back to the UI

---

## Assumptions

- **Single-tenant deployment** — the app is intended to run for a team or personal use; it is not hardened for high-scale public deployment out of the box
- **PostgreSQL is available locally** — the setup guide assumes a locally running PostgreSQL 14+ instance; no managed DB setup is included
- **Groq API access** — LLM responses require a valid Groq API key; without it the chat agent falls back to canned keyword-based responses only
- **CSV/JSON prompt files** — the file prompt pipeline assumes the input file contains a column named `prompt`, `query`, `question`, `text`, `input`, `message`, or `content`; arbitrary column names may not be detected correctly
- **English-language prompts** — the intent agent uses English keyword and regex patterns; non-English queries will mostly fall through to the general chat handler
- **Trusted internal network** — CORS is locked to a single origin; the app assumes frontend and backend run on the same trusted network
- **Modern browsers** — the UI uses ES2020+ features and modern CSS; Internet Explorer and legacy browsers are not supported

---

## Limitations

- **No streaming responses** — Groq responses are returned as a complete payload; there is no token-by-token streaming, so long responses have a visible delay before appearing
- **Keyword-based intent detection** — the Intent Agent uses regex/keyword matching, not an LLM classifier; it can misroute ambiguous messages and has no context memory across turns for intent detection
- **Embedding search is global** — the vector similarity search queries all chunks in the database, not just the current user's documents; document-level access control is enforced at the metadata layer but embeddings are searched globally
- **No file deletion** — uploaded documents can be listed but not deleted through the UI; removal requires direct database access
- **CSV/JSON only** — the upload pipeline accepts only `.csv` and `.json` files; PDF, DOCX, TXT, and other formats from the architecture diagram are not yet supported
- **No conversation memory in LLM calls** — each chat message is sent to Groq as a standalone prompt; the LLM does not receive prior conversation turns as context, so it cannot refer back to earlier messages in a session
- **Static version data** — software version lookups use a static fallback table for most tools; only Node.js and Python fetch live version data; others may be outdated
- **Single embedding model** — the `Xenova/all-MiniLM-L6-v2` model is hardcoded; switching models would require re-embedding all stored documents
- **No rate limiting** — the API has no per-user or global rate limiting; in a production environment this should be added to prevent abuse
- **Docker config is outdated** — the `docker-compose.yml` still targets the legacy Python/Flask backend; it needs to be updated before Docker deployment works with the Node.js backend

---

## How the Agents Work

```
User Message / Uploaded File
          │
          ▼
  ┌───────────────────┐
  │   Intent Agent    │  Regex + keyword classification
  │  detectIntent()   │  → install_software / query_knowledge / general_chat
  └────────┬──────────┘
           │
   ┌───────┼───────────────┐
   ▼       ▼               ▼
Script   Knowledge      General
Generator  Query Agent  Chat Agent
Agent    (vector search) (responses)
   │
   ├── Version Check Agent  (live API / static fallback)
   └── Script Templates     (winget / brew / apt / dnf / rpm)
```

### Agent Routing Logic

| Intent | Trigger | Agent Used |
|--------|---------|------------|
| `install_software` | Known software name + install keyword | Script Generator Agent |
| `query_knowledge` | Search/query keyword detected | Knowledge Query Agent |
| `general_chat` | Everything else | General Chat Agent |

### File Prompt Pipeline

When a file is uploaded via `/api/upload/analyze`:

1. Prompts are extracted from the file in order
2. Each prompt is passed through `processMessage()` — the same pipeline as typed messages
3. Results (including install scripts) are returned in sequence and saved to chat history

---

## Supported Software (70+)

Scripts are available for all 4 platforms: Windows (winget/Scoop), macOS (Homebrew), Ubuntu/Debian (apt), Fedora/RHEL (dnf).

| Category | Tools |
|----------|-------|
| Containers & VMs | Docker, Kubernetes/kubectl/minikube, Vagrant, VirtualBox, Podman |
| Languages | Node.js, Python, Java (OpenJDK 21), Go, Rust, Ruby, PHP, .NET 8, Scala, Kotlin, R |
| Version Control | Git |
| Editors & IDEs | VSCode, Vim/Neovim, Sublime Text, IntelliJ IDEA, PyCharm |
| Databases | PostgreSQL, MySQL, MongoDB, Redis, SQLite, MariaDB, Elasticsearch |
| Web Servers | Nginx, Apache, Caddy |
| Build Tools | CMake, Maven, Gradle |
| Cloud CLIs | AWS CLI, Google Cloud SDK, Azure CLI, Terraform, Ansible |
| Browsers | Chrome, Firefox, Brave, Opera |
| Communication | Zoom, Slack, Discord, Teams, Telegram, Signal, Notion, Obsidian |
| Media & Utilities | VLC, 7-Zip, FFmpeg, GIMP, Inkscape, Steam, Spotify, OBS Studio |
| System Tools | curl, wget, htop, neofetch, nmap, Wireshark, OpenSSH, UFW, fail2ban, Certbot |
| WSL / Ubuntu | WSL 2, Ubuntu on Windows |

---

## Database Schema

Tables are created automatically on startup. No manual migration needed.

```
users           — id, name, email, password_hash, created_at
documents       — id, user_id, name, type, created_at
chunks          — id, document_id, content, embedding (FLOAT8[]), metadata, created_at
chat_history    — id, user_id, session_id, role, content, agent_used, created_at
```

Embeddings are stored as `FLOAT8[]` arrays (384 dimensions from `Xenova/all-MiniLM-L6-v2`) — no pgvector extension required.

---

## Project Structure

```
instaboot/
├── backend/
│   ├── src/
│   │   ├── agents/           # intentAgent, scriptGeneratorAgent, versionCheckAgent, fileAnalysisAgent
│   │   ├── config/           # db.js — PostgreSQL pool + initDB()
│   │   ├── context/          # (frontend) AuthContext
│   │   ├── middleware/        # auth.js — JWT requireAuth middleware
│   │   ├── models/           # Document.js, Chunk.js, ChatHistory.js
│   │   ├── pipeline/         # chunker.js, embedder.js, vectorStore.js
│   │   ├── routes/           # auth.js, chat.js, upload.js
│   │   └── utils/            # fileParser.js, scriptTemplates.js, groqClient.js
│   ├── migrations/           # init.sql (reference only — app uses initDB())
│   ├── .env.example
│   ├── package.json
│   └── requirements.txt      # Python deps for legacy app.py (not used by Node server)
├── frontend/
│   └── src/
│       ├── api/              # client.js — axios instance + all API functions
│       ├── components/       # ChatWindow, MessageBubble, Sidebar, FileUpload, ScriptModal
│       │                     # LoginPage, RegisterPage
│       ├── context/          # AuthContext.js
│       └── hooks/            # useChat.js, useAuth.js (legacy)
├── docker-compose.yml        # Note: Docker config targets the Python backend — needs update for Node
└── README.md
```

---

## Troubleshooting

**Login returns 404**
The backend server is not running. Start it with `npm run dev` in the `backend/` folder.

**"JWT_SECRET is not set" error**
Copy `backend/.env.example` to `backend/.env` and set a value for `JWT_SECRET`.

**Chat responses fail with "GROQ_API_KEY is not set"**
Add your Groq API key to `backend/.env`. Get a free key at [console.groq.com](https://console.groq.com).

**First message is slow**
The embedding model (`Xenova/all-MiniLM-L6-v2`, ~23 MB quantized) is downloaded on first use via `@xenova/transformers`. Subsequent requests use the cached model.

**Cannot connect to PostgreSQL**
Ensure PostgreSQL is running (`net start postgresql-x64-17` on Windows) and that `DATABASE_URL` in `backend/.env` matches your credentials.

**CORS errors in browser**
Make sure `CORS_ORIGIN` in `backend/.env` exactly matches the frontend URL including port (default: `http://localhost:3000`).

**Documents showing from other users**
Restart the backend — this applies the `ALTER TABLE documents ADD COLUMN IF NOT EXISTS user_id` migration that scopes documents per user.
