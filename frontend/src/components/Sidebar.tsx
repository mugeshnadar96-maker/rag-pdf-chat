import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  MessageSquare,
  FileText,
  Upload,
  ChevronRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Chat, UploadedPDF } from "../types";

interface SidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  uploadedPDFs: UploadedPDF[];
  onUpload: (files: File[]) => void;
  isUploading: boolean;
  uploadError: string | null;
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  uploadedPDFs,
  onUpload,
  isUploading,
  uploadError,
  collapsed,
  onToggle,
}: SidebarProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files).filter((f) => f.type === "application/pdf");
      if (files.length) onUpload(files);
    },
    [onUpload]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (files.length) onUpload(files);
      e.target.value = "";
    },
    [onUpload]
  );

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 0 : 280 }}
      transition={{ type: "spring", stiffness: 300, damping: 35 }}
      className="relative flex-shrink-0 h-full overflow-hidden"
      style={{ zIndex: 10 }}
    >
      <div className="h-full w-[280px] flex flex-col" style={{ background: "rgba(8,11,20,0.95)", borderRight: "1px solid var(--border)" }}>
        {/* Logo */}
        <div className="px-5 pt-6 pb-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl btn-primary flex items-center justify-center flex-shrink-0">
            <Sparkles size={15} className="text-white" />
          </div>
          <div>
            <div className="font-semibold text-sm gradient-text tracking-wide">DocuMind</div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>RAG PDF Chat</div>
          </div>
          <button
            onClick={onToggle}
            className="ml-auto w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5"
            style={{ color: "var(--text-muted)" }}
          >
            <ChevronRight size={14} className={collapsed ? "" : "rotate-180"} />
          </button>
        </div>

        {/* New Chat */}
        <div className="px-3 pb-3">
          <button
            onClick={onNewChat}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all btn-primary"
          >
            <Plus size={16} />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-1 min-h-0">
          {/* Chat History */}
          {chats.length > 0 && (
            <div className="pb-2">
              <div className="px-2 py-1.5 text-xs font-medium uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                Conversations
              </div>
              {chats.map((chat) => (
                <motion.button
                  key={chat.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => onSelectChat(chat.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-left transition-all group"
                  style={{
                    background: activeChatId === chat.id ? "rgba(61, 126, 255, 0.12)" : "transparent",
                    color: activeChatId === chat.id ? "var(--accent-blue)" : "var(--text-secondary)",
                    border: activeChatId === chat.id ? "1px solid rgba(61, 126, 255, 0.2)" : "1px solid transparent",
                  }}
                >
                  <MessageSquare size={14} className="flex-shrink-0" />
                  <span className="truncate">{chat.title || "Untitled"}</span>
                </motion.button>
              ))}
            </div>
          )}

          {/* PDF Upload */}
          <div className="pb-2">
            <div className="px-2 py-1.5 text-xs font-medium uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              Documents
            </div>

            <label
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className="block cursor-pointer"
            >
              <input type="file" accept=".pdf" multiple onChange={handleFileInput} className="hidden" />
              <div
                className="rounded-xl p-4 text-center transition-all"
                style={{
                  background: isDragging ? "rgba(61, 126, 255, 0.1)" : "var(--bg-card)",
                  border: `1px dashed ${isDragging ? "var(--accent-blue)" : "var(--border-bright)"}`,
                  boxShadow: isDragging ? "0 0 20px rgba(61, 126, 255, 0.15)" : "none",
                }}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 size={20} className="animate-spin" style={{ color: "var(--accent-blue)" }} />
                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Processing PDFs…</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload size={18} style={{ color: isDragging ? "var(--accent-blue)" : "var(--text-muted)" }} />
                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      Drop PDFs or <span style={{ color: "var(--accent-blue)" }}>browse</span>
                    </span>
                  </div>
                )}
              </div>
            </label>

            <AnimatePresence>
              {uploadError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 px-3 py-2 rounded-lg flex items-center gap-2 text-xs"
                  style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#f87171" }}
                >
                  <AlertCircle size={13} />
                  {uploadError}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Uploaded PDFs list */}
            <div className="mt-2 space-y-1">
              <AnimatePresence>
                {uploadedPDFs.map((pdf) => (
                  <motion.div
                    key={pdf.filename}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                  >
                    <FileText size={13} style={{ color: "var(--accent-blue)", flexShrink: 0 }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs truncate" style={{ color: "var(--text-primary)" }}>{pdf.filename}</div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {pdf.pages}p · {pdf.chunks} chunks
                      </div>
                    </div>
                    {pdf.status === "ok" && <CheckCircle2 size={12} style={{ color: "#34d399", flexShrink: 0 }} />}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>
            {uploadedPDFs.length > 0
              ? `${uploadedPDFs.length} document${uploadedPDFs.length > 1 ? "s" : ""} loaded`
              : "No documents yet"}
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
