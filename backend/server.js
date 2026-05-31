import express from "express";
import cors from "cors";
import multer from "multer";
import FormData from "form-data";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || "http://localhost:8001";

app.use(cors({ origin: "*" }));
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files allowed"), false);
  },
});

app.get("/health", (_, res) => {
  res.json({ status: "ok", service: "backend" });
});

app.post("/upload-pdf", upload.array("files", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No PDF files provided" });
    }

    const form = new FormData();
    for (const file of req.files) {
      form.append("files", file.buffer, {
        filename: file.originalname,
        contentType: "application/pdf",
      });
    }

    const response = await fetch(`${RAG_SERVICE_URL}/ingest`, {
      method: "POST",
      body: form,
      headers: form.getHeaders(),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/ask", async (req, res) => {
  try {
    const { question, chat_history = [] } = req.body;
    if (!question?.trim()) {
      return res.status(400).json({ error: "Question is required" });
    }

    const response = await fetch(`${RAG_SERVICE_URL}/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, chat_history }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Query error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.use((err, _, res, __) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
