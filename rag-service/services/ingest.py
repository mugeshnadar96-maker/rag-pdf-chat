import io
import re
import hashlib
from typing import List
import logging

from pypdf import PdfReader
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)

CHUNK_SIZE = 800
CHUNK_OVERLAP = 150
COLLECTION_NAME = "pdf_documents"

_model = None
_client = None
_collection = None


def get_model():
    global _model
    if _model is None:
        logger.info("Loading embedding model...")
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


def extract_text_with_pages(pdf_bytes: bytes) -> List[dict]:
    reader = PdfReader(io.BytesIO(pdf_bytes))
    pages = []
    for i, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        text = re.sub(r"\s+", " ", text).strip()
        if text:
            pages.append({"page": i + 1, "text": text})
    return pages


def chunk_text(text: str, page: int, filename: str) -> List[dict]:
    chunks = []
    start = 0
    while start < len(text):
        end = start + CHUNK_SIZE
        chunk = text[start:end]
        if chunk.strip():
            chunks.append({
                "text": chunk.strip(),
                "page": page,
                "filename": filename,
            })
        start += CHUNK_SIZE - CHUNK_OVERLAP
    return chunks


async def ingest_pdf(pdf_bytes: bytes, filename: str) -> dict:
    collection = get_collection()
    model = get_model()

    pages = extract_text_with_pages(pdf_bytes)
    if not pages:
        return {"filename": filename, "chunks": 0, "pages": 0, "status": "empty"}

    all_chunks = []
    for page_data in pages:
        chunks = chunk_text(page_data["text"], page_data["page"], filename)
        all_chunks.extend(chunks)

    if not all_chunks:
        return {"filename": filename, "chunks": 0, "pages": len(pages), "status": "no_text"}

    texts = [c["text"] for c in all_chunks]
    embeddings = model.encode(texts, show_progress_bar=False).tolist()

    ids = []
    metadatas = []
    for i, chunk in enumerate(all_chunks):
        chunk_id = hashlib.md5(f"{filename}_{i}_{chunk['text'][:50]}".encode()).hexdigest()
        ids.append(chunk_id)
        metadatas.append({"filename": filename, "page": chunk["page"]})

    existing = set(collection.get(ids=ids)["ids"])
    new_ids, new_embeddings, new_texts, new_metas = [], [], [], []
    for i, cid in enumerate(ids):
        if cid not in existing:
            new_ids.append(cid)
            new_embeddings.append(embeddings[i])
            new_texts.append(texts[i])
            new_metas.append(metadatas[i])

    if new_ids:
        collection.add(
            ids=new_ids,
            embeddings=new_embeddings,
            documents=new_texts,
            metadatas=new_metas,
        )

    logger.info(f"Ingested {filename}: {len(new_ids)} new chunks from {len(pages)} pages")
    return {
        "filename": filename,
        "chunks": len(new_ids),
        "pages": len(pages),
        "status": "ok",
    }
