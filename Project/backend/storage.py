from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
import sqlite3
import uuid

from config import Config


config = Config()
Path(config.DB_PATH).parent.mkdir(parents=True, exist_ok=True)


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


@contextmanager
def get_connection():
    connection = sqlite3.connect(config.DB_PATH)
    connection.row_factory = sqlite3.Row
    try:
        yield connection
        connection.commit()
    finally:
        connection.close()


def init_storage():
    with get_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS documents (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                source_path TEXT,
                content TEXT,
                created_at TEXT NOT NULL
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS chat_messages (
                id TEXT PRIMARY KEY,
                session_id TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                agent_used TEXT,
                created_at TEXT NOT NULL
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS conversation_state (
                session_id TEXT PRIMARY KEY,
                step TEXT NOT NULL DEFAULT 'idle',
                software TEXT,
                os TEXT,
                os_version TEXT,
                updated_at TEXT NOT NULL
            )
            """
        )


def get_state(session_id: str) -> dict:
    with get_connection() as connection:
        row = connection.execute(
            "SELECT * FROM conversation_state WHERE session_id = ?",
            (session_id,),
        ).fetchone()
    if row:
        return dict(row)
    return {"session_id": session_id, "step": "idle", "software": None, "os": None, "os_version": None}


def set_state(session_id: str, step: str, software=None, os=None, os_version=None):
    with get_connection() as connection:
        connection.execute(
            """
            INSERT INTO conversation_state (session_id, step, software, os, os_version, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(session_id) DO UPDATE SET
                step=excluded.step,
                software=excluded.software,
                os=excluded.os,
                os_version=excluded.os_version,
                updated_at=excluded.updated_at
            """,
            (session_id, step, software, os, os_version, _utc_now()),
        )


def clear_state(session_id: str):
    with get_connection() as connection:
        connection.execute(
            "DELETE FROM conversation_state WHERE session_id = ?",
            (session_id,),
        )


def add_document(name, doc_type, source_path=None, content=None, document_id=None):
    document_id = document_id or str(uuid.uuid4())
    with get_connection() as connection:
        connection.execute(
            """
            INSERT INTO documents (id, name, type, source_path, content, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (document_id, name, doc_type, source_path, content, _utc_now()),
        )
    return document_id


def list_documents():
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT id, name, type, source_path, created_at
            FROM documents
            ORDER BY created_at DESC
            """
        ).fetchall()
    return [dict(row) for row in rows]


def save_message(session_id, role, content, agent_used=None):
    message_id = str(uuid.uuid4())
    with get_connection() as connection:
        connection.execute(
            """
            INSERT INTO chat_messages (id, session_id, role, content, agent_used, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (message_id, session_id, role, content, agent_used, _utc_now()),
        )
    return message_id


def get_chat_history(session_id):
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT id, session_id, role, content, agent_used, created_at
            FROM chat_messages
            WHERE session_id = ?
            ORDER BY created_at ASC
            """,
            (session_id,),
        ).fetchall()
    return [dict(row) for row in rows]


def list_sessions():
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT session_id,
                   COUNT(*) AS message_count,
                   MIN(created_at) AS started_at,
                   MAX(created_at) AS last_message_at
            FROM chat_messages
            GROUP BY session_id
            ORDER BY last_message_at DESC
            """
        ).fetchall()

        sessions = []
        for row in rows:
            first_message = connection.execute(
                """
                SELECT content
                FROM chat_messages
                WHERE session_id = ? AND role = 'user'
                ORDER BY created_at ASC
                LIMIT 1
                """,
                (row["session_id"],),
            ).fetchone()

            sessions.append(
                {
                    "session_id": row["session_id"],
                    "message_count": int(row["message_count"]),
                    "started_at": row["started_at"],
                    "last_message_at": row["last_message_at"],
                    "first_message": first_message["content"] if first_message else "",
                }
            )

    return sessions