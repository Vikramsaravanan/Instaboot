# Instaboot

An AI-powered assistant that generates install scripts for any software across Windows, macOS, and Linux, and answers questions from your uploaded documents.

**Stack:** React.js · Tailwind CSS · Node.js · Express · PostgreSQL · Groq · pgvector

---

## Features

- **Chatbot Agent** – Answers general questions and retrieves relevant context from uploaded files
- **Document Query** – Embeds uploaded CSV/JSON/text files and answers questions using semantic similarity search (ChromaDB)
- **Upload Support** – Index documents through the UI and keep them available for later chat sessions

---

## Prerequisites

- **Python 3.10+** and **pip** if you want to run the backend outside Docker
- **Docker Desktop** for the Docker Compose setup
- A **GROQ_API_KEY** if you want live model responses

---

## Quick Start with Docker Compose

```bash
# 1. Clone / navigate to the project
cd d:\vikram\multiagent-chatbot

# 2. Start all services (backend + frontend)
docker-compose up --build

# 3. Open the app
#    Frontend:  http://localhost:3000
#    Backend:   http://localhost:5000/api/health
```

The first startup downloads the ~90 MB embedding model. Subsequent starts use the cached model volume.

---

## Manual Setup (without Docker)

### 1. PostgreSQL Setup

```sql
-- In psql, create the database and enable pgvector:
CREATE DATABASE multiagent_db;
\c multiagent_db
CREATE EXTENSION IF NOT EXISTS vector;
```

### 2. Backend

```bash
cd backend

# Copy and fill in your environment variables
copy .env.example .env
# Edit .env — at minimum set GROQ_API_KEY if you want live responses

# Install dependencies
pip install -r requirements.txt

# Start in development mode (with auto-reload)
python app.py

# OR build and run with Docker Compose from the project root
docker-compose up --build
```

### 3. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
# Opens http://localhost:3000 automatically
```

---

## Environment Variables

| Variable          | Default                                                   | Description                                       |
|-------------------|-----------------------------------------------------------|---------------------------------------------------|
| `PORT`            | `5000`                                                    | Backend HTTP port                                 |
| `GROQ_API_KEY`    | none                                                      | Enables live chatbot responses                    |
| `GROQ_MODEL`      | `openai/gpt-oss-120b`                                     | Groq chat model                                   |
| `EMBEDDING_MODEL` | `sentence-transformers/all-MiniLM-L6-v2`                 | Model for document embeddings                     |
| `COLLECTION_NAME` | `instaboot_docs`                                          | ChromaDB collection name                          |
| `PERSIST_DIRECTORY` | `backend/data/chroma`                                   | Location for persisted vector data                |
| `DB_PATH`         | `backend/data/app.db`                                     | SQLite file for sessions and document metadata    |
| `TOP_K`           | `3`                                                       | Number of similar chunks to retrieve per query    |
| `CHUNK_SIZE`      | `800`                                                     | Characters per text chunk                         |
| `CHUNK_OVERLAP`   | `120`                                                     | Overlap characters between adjacent chunks        |
| `CORS_ORIGIN`     | `http://localhost:3000`                                   | Allowed frontend origin                           |

---

## API Documentation

### Health Check

```
GET /api/health
Response: { "status": "ok", "timestamp": "2024-06-01T12:00:00.000Z" }
```

### Upload

#### `POST /api/upload`
Upload a CSV or JSON file for indexing.

```
Content-Type: multipart/form-data
Body: file = <your .csv or .json file>

Response:
{
  "success": true,
  "documentId": "uuid",
  "chunksCreated": 42,
  "message": "Successfully ingested \"data.csv\" — 42 chunks stored."
}
```

#### `POST /api/upload/text`
Ingest plain text directly.

```json
// Request
{ "text": "Node.js is a JavaScript runtime...", "name": "my-note" }

// Response
{ "success": true, "documentId": "uuid", "chunksCreated": 3, "message": "..." }
```

#### `GET /api/documents`
List all uploaded documents.

```json
{
  "success": true,
  "documents": [
    { "id": "uuid", "name": "data.csv", "type": "csv", "created_at": "..." }
  ]
}
```

### Chat

#### `POST /api/chat`
Send a message and get an agent response.

```json
// Request
{ "message": "Install Docker on Windows 11", "sessionId": "uuid" }

// Response
{
  "success": true,
  "response": "## Installing Docker on Windows...",
  "agentUsed": "Script Generator Agent",
  "script": "# Install Docker Desktop...\nwinget install ...",
  "sessionId": "uuid",
  "software": "docker",
  "os": "Windows (PowerShell / CMD)",
  "version": "26.1.3"
}
```

#### `GET /api/chat/history/:sessionId`
Retrieve message history for a session.

```json
{
  "success": true,
  "sessionId": "uuid",
  "history": [
    { "id": "uuid", "session_id": "uuid", "role": "user", "content": "...", "agent_used": null, "created_at": "..." },
    { "id": "uuid", "session_id": "uuid", "role": "assistant", "content": "...", "agent_used": "Script Generator Agent", "created_at": "..." }
  ]
}
```

#### `GET /api/chat/sessions`
List all chat sessions with summary metadata.

```json
{
  "success": true,
  "sessions": [
    { "session_id": "uuid", "message_count": "6", "started_at": "...", "last_message_at": "...", "first_message": "Install Docker..." }
  ]
}
```

---

## How the Agents Work

```
User Message
     │
     ▼
┌─────────────────────┐
│   Intent Agent      │  Regex/keyword classification
│  detectIntent()     │  → install_software / query_knowledge / general_chat
└────────┬────────────┘
         │
    ┌────┴─────┐──────────────────┐
    │          │                  │
    ▼          ▼                  ▼
Script     Knowledge          General
Generator  Query Agent        Chat Agent
Agent      (pgvector search)  (canned responses)
    │
    ├── Version Check Agent  (live API or static lookup)
    └── Script Templates     (winget / brew / apt / dnf commands)
```

### Agent Routing Logic

| Intent Detected | Trigger Condition | Agent Used |
|----------------|-------------------|------------|
| `install_software` | Message contains a known software name + install keywords | Script Generator Agent |
| `query_knowledge` | Message contains search/query keywords | Knowledge Query Agent |
| `general_chat` | Everything else | General Chat Agent |

---

## Supported Software

| Software | Windows (winget) | macOS (brew) | Ubuntu/Debian (apt) | Fedora (dnf) |
|----------|:---:|:---:|:---:|:---:|
| Ubuntu / WSL | ✅ | ✅ | ✅ | ✅ |
| Docker | ✅ | ✅ | ✅ | ✅ |
| Node.js | ✅ | ✅ | ✅ | ✅ |
| Python | ✅ | ✅ | ✅ | ✅ |
| Git | ✅ | ✅ | ✅ | ✅ |
| VSCode | ✅ | ✅ | ✅ | ✅ |
| Google Chrome | ✅ | ✅ | ✅ | ✅ |
| Firefox | ✅ | ✅ | ✅ | ✅ |
| Zoom | ✅ | ✅ | ✅ | ✅ |
| VLC | ✅ | ✅ | ✅ | ✅ |
| 7-Zip | ✅ | ✅ | ✅ | ✅ |
| Steam | ✅ | ✅ | ✅ | ✅ |

---

## Example Chat Interactions

### Install Script Generation

**User:** `I want to install Docker on my Windows 11 machine`

**Bot:** Detects intent=`install_software`, software=`docker`, os=`windows`, returns latest version info and a "View Install Script" button showing:
```powershell
winget install --id Docker.DockerDesktop --source winget --accept-package-agreements --accept-source-agreements
docker --version
docker run hello-world
```

---

**User:** `how do I get Python on linux ubuntu`

**Bot:** Detects intent=`install_software`, software=`python`, os=`linux`, distro=`ubuntu`, shows apt-get install commands with deadsnakes PPA.

---

**User:** `install homebrew and node on mac`

**Bot:** Detects intent=`install_software`, software=`nodejs`, os=`macos`, shows Homebrew + nvm install commands.

---

### Document Q&A

1. Upload a CSV file via the sidebar (e.g., a product catalog)
2. Ask: `What products are available under $50?`
3. Bot retrieves semantically similar chunks and returns relevant rows from your data

---

## Project Structure

```
multiagent-chatbot/
├── backend/
│   ├── src/
│   │   ├── agents/           # Intent, VersionCheck, ScriptGenerator agents
│   │   ├── config/           # PostgreSQL pool + initDB
│   │   ├── models/           # Document, Chunk, ChatHistory DB models
│   │   ├── pipeline/         # Chunker, Embedder, VectorStore
│   │   ├── routes/           # Express routes (upload, chat)
│   │   └── utils/            # File parser, script templates
│   └── migrations/init.sql
├── frontend/
│   └── src/
│       ├── api/              # Axios client
│       ├── components/       # ChatWindow, MessageBubble, Sidebar, FileUpload, ScriptModal
│       └── hooks/            # useChat
└── docker-compose.yml
```

---

## Troubleshooting

**"Error: relation 'chunks' does not exist"**
The pgvector extension may not be installed. Run `CREATE EXTENSION vector;` in your database, or use the Docker Compose setup which installs it automatically.

**First message is slow**
The first request triggers the embedding model download (~90 MB). Subsequent requests use the cached model.

**Embeddings fail with dimension mismatch**
Make sure your `EMBEDDING_MODEL` env var hasn't changed after data was already stored. The model produces 384-dimensional vectors; the schema is hard-coded to `vector(384)`.

**CORS errors in browser**
Make sure `CORS_ORIGIN` in the backend `.env` matches your frontend URL exactly (including port).
