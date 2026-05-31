const BASE = "/api";

export async function uploadPDFs(files: File[]): Promise<{ ingested: Array<{ filename: string; chunks: number; pages: number; status: string }> }> {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));
  const res = await fetch(`${BASE}/upload-pdf`, { method: "POST", body: form });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Upload failed");
  }
  return res.json();
}

export async function clearDocuments(): Promise<void> {
  await fetch(`${BASE}/clear`, { method: "POST" });
}

export async function askQuestion(
  question: string,
  chat_history: Array<{ role: string; content: string }> = []
): Promise<{ answer: string; sources: Array<{ filename: string; page: number }>; retrieved_chunks: Array<{ text: string; filename: string; page: number; similarity: number }> }> {
  const res = await fetch(`${BASE}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, chat_history }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Query failed");
  }
  return res.json();
}
