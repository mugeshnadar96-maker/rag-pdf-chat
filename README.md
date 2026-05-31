# DocuMind — RAG PDF Chat System

Chat with multiple PDFs using AI. Answers are strictly grounded in your documents — no hallucination.

![Stack](https://img.shields.io/badge/React-TypeScript-blue) ![Stack](https://img.shields.io/badge/Node.js-Express-green) ![Stack](https://img.shields.io/badge/Python-FastAPI-orange) ![Stack](https://img.shields.io/badge/ChromaDB-Vector_DB-purple)

## Architecture

```
React UI (5173) → Node.js API (3001) → Python RAG (8001) → ChromaDB
```

## Prerequisites

Before starting, make sure you have:

- [Node.js 18+](https://nodejs.org/)
- [Python 3.10+](https://www.python.org/downloads/)
- A free Groq API key → [console.groq.com](https://console.groq.com) (sign up, no credit card needed)

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/rag-pdf-chat.git
cd rag-pdf-chat
```

---

### 2. Python RAG Service

**Windows (PowerShell):**
```powershell
cd rag-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

**Mac/Linux:**
```bash
cd rag-service
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

> If you get a PowerShell execution policy error on Windows, run this first:
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```

**Create your `.env` file inside `rag-service/`:**

```
GROQ_API_KEY=your_groq_api_key_here
```

> Get your free Groq API key at [console.groq.com](https://console.groq.com) → API Keys → Create Key

**Start the RAG service:**

```powershell
uvicorn main:app --port 8001
```

You should see:
```
INFO: Application startup complete.
```

---

### 3. Node.js Backend

Open a **new terminal window**:

```powershell
cd backend
npm install
npm run dev
```

You should see:
```
Backend running on http://localhost:3001
```

---

### 4. Frontend

Open a **new terminal window**:

```powershell
cd frontend
npm install
npm run dev
```

You should see:
```
Local: http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## How to Use

1. **Upload PDFs** — drag and drop PDF files into the left sidebar (minimum 2 recommended)
2. **Ask questions** — type any question about your documents
3. **View sources** — every answer shows which document and page it came from
4. **New Chat** — clears current documents and starts fresh
5. **Sources Panel** — click the panel icon (top right) to see retrieved chunks and similarity scores

---

## Project Structure

```
rag-pdf-chat/
├── frontend/                  # React + TypeScript + Vite
│   └── src/
│       ├── components/
│       │   ├── Sidebar.tsx        # Upload, chat history, PDF list
│       │   ├── ChatWindow.tsx     # Chat messages + input
│       │   ├── MessageBubble.tsx  # Message + source cards
│       │   └── SourcePanel.tsx    # Retrieved chunks inspector
│       ├── hooks/useChat.ts       # State management
│       └── utils/api.ts           # API calls
├── backend/                   # Node.js + Express API gateway
│   ├── server.js
│   └── .env
└── rag-service/               # Python + FastAPI RAG engine
    ├── main.py
    ├── .env                   # ← your GROQ_API_KEY goes here
    └── services/
        ├── ingest.py          # PDF → chunks → embeddings → ChromaDB
        └── query.py           # Query → retrieve → Groq LLM → answer
```

---

## Environment Variables

### `rag-service/.env`
```
GROQ_API_KEY=gsk_your_key_here
```

### `backend/.env`
```
PORT=3001
RAG_SERVICE_URL=http://localhost:8001
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express, Multer |
| RAG Service | Python, FastAPI, sentence-transformers |
| Embeddings | all-MiniLM-L6-v2 (runs locally, no API needed) |
| Vector DB | ChromaDB (persistent local storage) |
| PDF Parsing | pypdf |
| LLM | Llama 3.1 via Groq API (free tier) |

---

## How It Works

1. **Upload** — PDFs are parsed page by page, split into 800-character chunks with 150-character overlap
2. **Embed** — Each chunk is converted to a 384-dimensional vector using MiniLM (runs on your CPU)
3. **Store** — Vectors stored in ChromaDB on disk (`rag-service/chroma_db/`)
4. **Query** — Your question is embedded, top-4 similar chunks retrieved via cosine similarity
5. **Answer** — Groq LLM generates an answer using ONLY the retrieved chunks as context

## No-Hallucination Guarantee

- Similarity threshold of 0.3 — chunks below this are rejected
- LLM prompt strictly instructs: use ONLY provided context
- If no relevant chunks found → responds: *"I don't have enough information in the uploaded documents."*
- Every answer includes source document name and page number

---

## Troubleshooting

**Blank white screen on frontend:**
- Open browser console (F12) and check for errors
- Delete Vite cache: `Remove-Item -Recurse -Force node_modules/.vite` then `npm run dev`

**"0 new chunks" after upload:**
- Delete old ChromaDB data: `Remove-Item -Recurse -Force chroma_db` (inside `rag-service/`)
- Re-upload your PDFs in the frontend

**Always getting "I don't have enough information":**
- Check uvicorn terminal for `GROQ KEY FOUND: True`
- If False, make sure `rag-service/.env` has your key and `main.py` has `load_dotenv()` at the top

**PowerShell execution policy error:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**`uvicorn` not found:**
```powershell
python -m uvicorn main:app --port 8001
```

---

