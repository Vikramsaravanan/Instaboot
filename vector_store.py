import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from config import Config
from document_processing.downloadorg import extract_file_text
from document_processing.preprocess import chunk_text
from langchain_core.documents import Document

config = Config()

class LocalChromaDb:
    def __init__(self):
        self.embed_model = None
        self.vectorstore = None

    def init_vectorstore(self):
        if self.vectorstore is None:
            # Load HuggingFace embedding model (local, no API key required)
            self.embed_model = HuggingFaceEmbeddings(
                model_name="sentence-transformers/all-MiniLM-L6-v2"
            )

            self.vectorstore = Chroma(
                collection_name=config.COLLECTION_NAME,
                persist_directory=config.PERSIST_DIRECTORY,
                embedding_function=self.embed_model
            )

    def store_the_chunk(self, text_or_path):
        self.init_vectorstore()

        if text_or_path is None:
            raise ValueError("No text or file path provided for storage.")

        if isinstance(text_or_path, str) and os.path.exists(text_or_path):
            text_or_path = extract_file_text(text_or_path)

        if not isinstance(text_or_path, str) or not text_or_path.strip():
            raise ValueError("The provided document text is empty or invalid.")

        chunks = chunk_text(text_or_path)
        docs = [Document(page_content=chunk) for chunk in chunks]

        self.vectorstore.add_documents(docs)
        return "Documents stored in ChromaDB"

    def response_query(self, user_query, k=2):
        self.init_vectorstore()
        results = self.vectorstore.similarity_search(user_query, k=k)
        return [doc.page_content for doc in results]
    
    def vectorstore_cleanup(self):
        self.init_vectorstore()
        if self.vectorstore is not None:
            self.vectorstore.delete_collection(config.COLLECTION_NAME)