export interface Source {
  filename: string;
  page: number;
}

export interface RetrievedChunk {
  text: string;
  filename: string;
  page: number;
  similarity: number;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  chunks?: RetrievedChunk[];
  timestamp: Date;
  isLoading?: boolean;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

export interface UploadedPDF {
  filename: string;
  chunks: number;
  pages: number;
  status: string;
  uploadedAt: Date;
}
