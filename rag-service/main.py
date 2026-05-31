from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import logging

from services.ingest import ingest_pdf
from services.query import query_documents

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="RAG Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class QueryRequest(BaseModel):
    question: str
    chat_history: Optional[List[dict]] = []


class QueryResponse(BaseModel):
    answer: str
    sources: List[dict]
    retrieved_chunks: Optional[List[dict]] = []


@app.get("/health")
async def health():
    return {"status": "ok", "service": "rag"}


@app.post("/ingest")
async def ingest(files: List[UploadFile] = File(...)):
    results = []
    for file in files:
        if not file.filename.endswith(".pdf"):
            raise HTTPException(400, f"{file.filename} is not a PDF")
        content = await file.read()
        result = await ingest_pdf(content, file.filename)
        results.append(result)
    return {"ingested": results}


@app.post("/query", response_model=QueryResponse)
async def query(req: QueryRequest):
    if not req.question.strip():
        raise HTTPException(400, "Question cannot be empty")
    result = await query_documents(req.question, req.chat_history)
    return result


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
