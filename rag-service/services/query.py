import os
import logging
from typing import List, Optional
from groq import Groq

from sentence_transformers import SentenceTransformer
import chromadb

logger = logging.getLogger(__name__)

COLLECTION_NAME = "pdf_documents"
TOP_K = 4
SIMILARITY_THRESHOLD = 0.5

_model = None
_client = None
_collection = None


def get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def get_collection():
    global _client, _collection
    if _collection is None:
        _client = chromadb.PersistentClient(path="./chroma_db")
        _collection = _client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )
    return _collection


def build_prompt(question: str, context_chunks: List[dict]) -> str:
    context_str = ""
    for i, chunk in enumerate(context_chunks, 1):
        context_str += f"\n[Source {i}: {chunk['filename']}, Page {chunk['page']}]\n{chunk['text']}\n"

    return f"""You are a precise document assistant. Answer ONLY using the context below.

STRICT RULES:
1. Use ONLY information from the provided context.
2. Do NOT use any external knowledge or make assumptions.
3. If the answer is not in the context, respond EXACTLY: "I don't have enough information in the uploaded documents."
4. Every answer MUST reference the source documents.
5. Be concise and accurate.

CONTEXT:
{context_str}

QUESTION: {question}

ANSWER (based strictly on context above):"""


async def query_documents(question: str, chat_history: Optional[List[dict]] = None) -> dict:
    collection = get_collection()

    if collection.count() == 0:
        return {
            "answer": "No documents have been uploaded yet. Please upload PDF files first.",
            "sources": [],
            "retrieved_chunks": [],
        }

    model = get_model()
    query_embedding = model.encode([question])[0].tolist()

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=min(TOP_K, collection.count()),
        include=["documents", "metadatas", "distances"],
    )

    documents = results["documents"][0]
    metadatas = results["metadatas"][0]
    distances = results["distances"][0]

    filtered_chunks = []
    for doc, meta, dist in zip(documents, metadatas, distances):
        similarity = 1 - dist
        if similarity >= SIMILARITY_THRESHOLD:
            filtered_chunks.append({
                "text": doc,
                "filename": meta["filename"],
                "page": meta["page"],
                "similarity": round(similarity, 4),
            })

    if not filtered_chunks:
        return {
            "answer": "I don't have enough information in the uploaded documents.",
            "sources": [],
            "retrieved_chunks": [],
        }

    prompt = build_prompt(question, filtered_chunks)

    api_key = os.environ.get("GROQ_API_KEY", "")
    print("GROQ KEY FOUND:", bool(api_key))
    if not api_key:
        answer = generate_answer_fallback(question, filtered_chunks)
    else:
        try:
            client = Groq(api_key=api_key)
            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1024,
                temperature=0.2,
            )
            answer = response.choices[0].message.content
        except Exception as e:
            logger.error(f"Groq error: {e}")
            aanswer = generate_answer_fallback(question, filtered_chunks)

    seen = set()
    sources = []
    for chunk in filtered_chunks:
        key = (chunk["filename"], chunk["page"])
        if key not in seen:
            seen.add(key)
            sources.append({"filename": chunk["filename"], "page": chunk["page"]})

    return {
        "answer": answer,
        "sources": sources,
        "retrieved_chunks": filtered_chunks,
    }


def generate_answer_fallback(question: str, chunks: List[dict]) -> str:
    """Simple extractive fallback when no LLM key is set."""
    combined = " ".join(c["text"] for c in chunks)
    q_words = set(question.lower().split())
    sentences = [s.strip() for s in combined.split(".") if len(s.strip()) > 20]
    scored = [(sum(1 for w in s.lower().split() if w in q_words), s) for s in sentences]
    top = sorted(scored, reverse=True)[:3]
    relevant = [s for _, s in top if _ > 0]
    if relevant:
        return ". ".join(relevant) + "."
    return "I don't have enough information in the uploaded documents."
