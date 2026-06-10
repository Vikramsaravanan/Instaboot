from pathlib import Path
import json

import chromadb
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction

from config import Config


config = Config()


def split_text(text, chunk_size, overlap):
    cleaned = text.strip()
    if not cleaned:
        return []

    if len(cleaned) <= chunk_size:
        return [cleaned]

    chunks = []
    start = 0
    while start < len(cleaned):
        end = min(start + chunk_size, len(cleaned))
        chunk = cleaned[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end >= len(cleaned):
            break
        start = max(0, end - overlap)
    return chunks


def extract_file_text(file_path):
    path = Path(file_path)
    suffix = path.suffix.lower()

    if suffix in {".txt", ".md", ".csv"}:
        return path.read_text(encoding="utf-8", errors="replace")

    if suffix == ".json":
        raw_text = path.read_text(encoding="utf-8", errors="replace")
        try:
            return json.dumps(json.loads(raw_text), indent=2, ensure_ascii=False)
        except json.JSONDecodeError:
            return raw_text

    raise ValueError(f"Unsupported file type: {path.name}")


class LocalChromaDb:
    def __init__(self):
        self.client = None
        self.collection = None
        self.embedding_function = None

    def init_vectorstore(self):
        if self.collection is not None:
            return

        Path(config.PERSIST_DIRECTORY).mkdir(parents=True, exist_ok=True)
        self.embedding_function = SentenceTransformerEmbeddingFunction(
            model_name=config.EMBEDDING_MODEL
        )
        self.client = chromadb.PersistentClient(path=config.PERSIST_DIRECTORY)
        self.collection = self.client.get_or_create_collection(
            name=config.COLLECTION_NAME,
            embedding_function=self.embedding_function,
        )

    def store_text(self, text, source_name, document_id):
        self.init_vectorstore()

        chunks = split_text(text, config.CHUNK_SIZE, config.CHUNK_OVERLAP)
        if not chunks:
            raise ValueError("The provided document text is empty or invalid.")

        ids = [f"{document_id}-{index}" for index in range(len(chunks))]
        metadatas = [
            {
                "document_id": document_id,
                "source": source_name,
                "chunk_index": index,
            }
            for index in range(len(chunks))
        ]
        self.collection.add(ids=ids, documents=chunks, metadatas=metadatas)
        return len(chunks)

    def store_file(self, file_path, document_id):
        text = extract_file_text(file_path)
        return self.store_text(text, Path(file_path).name, document_id)

    def response_query(self, user_query, k=2):
        self.init_vectorstore()

        try:
            # ChromaDB throws if n_results > number of documents in collection
            count = self.collection.count()
            if count == 0:
                return []
            n = max(1, min(k, count))
            results = self.collection.query(query_texts=[user_query], n_results=n)
        except Exception:
            return []

        documents = results.get("documents", [[]])
        if not documents:
            return []
        return documents[0]