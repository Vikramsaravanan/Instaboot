import sys
import os


sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


from flask import Flask, request, jsonify
from config import Config
from vector_store import LocalChromaDb
from chat_response import generate_response_groq

chromadb_initalization_azure = LocalChromaDb()

config = Config()
app = Flask(__name__)


@app.route("/chatbot/store/chromadb", methods=["POST"])
def store_document_azure():

    try:
        file_path = config.FILE_PATH
        if not file_path:
            raise ValueError("FILE_PATH is not configured in the environment.")

        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Configured FILE_PATH not found: {file_path}")

        message = chromadb_initalization_azure.store_the_chunk(file_path)
        return jsonify({"message": message})
    
    except Exception as e:
        return jsonify({"Error": str(e)})

    
@app.route("/chatbot/llm/response/chromadb", methods=["POST"])
def chatbot_llm_response():
    try:
        data = request.get_json(force=True, silent=True) or {}
        query = data.get("query")
        if not query:
            raise ValueError("Please send a JSON body with a 'query' field.")

        generate_llm_response = generate_response_groq(query)
        return jsonify({"ChatBot": generate_llm_response})
    except Exception as e:
        return jsonify({"Error": str(e)})


@app.route("/", methods=["GET"])
def health_check():
    return jsonify({"status": "running", "message": "Use POST /chatbot/store/chromadb and POST /chatbot/llm/response/chromadb"})


if __name__ == "__main__":
    app.run(debug=True)