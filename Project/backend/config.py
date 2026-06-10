from pathlib import Path
import os

from dotenv import load_dotenv


load_dotenv()

BASE_DIR = Path(__file__).resolve().parent


class Config:
    def __init__(self):
        self.PORT = int(os.getenv("PORT", "5000"))
        self.CORS_ORIGIN = os.getenv("CORS_ORIGIN", "http://localhost:3000")
        self.GROQ_API_KEY = os.getenv("GROQ_API_KEY")
        self.GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")

        self.EMBEDDING_MODEL = os.getenv(
            "EMBEDDING_MODEL",
            "sentence-transformers/all-MiniLM-L6-v2",
        )
        self.COLLECTION_NAME = os.getenv("COLLECTION_NAME", "instaboot_docs")
        self.PERSIST_DIRECTORY = os.getenv(
            "PERSIST_DIRECTORY",
            str(BASE_DIR / "data" / "chroma"),
        )
        self.UPLOAD_DIR = os.getenv("UPLOAD_DIR", str(BASE_DIR / "uploads"))
        self.DB_PATH = os.getenv("DB_PATH", str(BASE_DIR / "data" / "app.db"))

        self.CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "800"))
        self.CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "120"))
        self.TOP_K = int(os.getenv("TOP_K", "3"))