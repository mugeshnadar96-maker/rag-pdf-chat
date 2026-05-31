import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, FileUp, Sparkles } from "lucide-react";
import { Chat } from "../types";
import { MessageBubble } from "./MessageBubble";

interface ChatWindowProps {
  chat: Chat | null;
  onSend: (message: string) => void;
  uploadedPDFCount: number;
  onUpload: (files: File[]) => void;
}

export function ChatWindow({ chat, onSend, uploadedPDFCount, onUpload }: ChatWindowProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isLoading = chat?.messages.some((m) => m.isLoading) ?? false;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    onSend(text);
  }, [input, isLoading, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) onUpload(files);
    e.target.value = "";
  };

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 160) + "px";
    }
  }, [input]);

  const isEmpty = !chat || chat.messages.length === 0;

  return (
    <div className="flex flex-col h-full min-w-0" style={{ position: "relative", zIndex: 1 }}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 min-h-0">
        <AnimatePresence mode="wait">
          {isEmpty ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center text-center pb-16"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                style={{
                  background: "linear-gradient(135deg, rgba(61,126,255,0.15), rgba(159,94,255,0.15))",
                  border: "1px solid rgba(61,126,255,0.2)",
                }}
              >
                <Sparkles size={28} style={{ color: "var(--accent-blue)" }} />
              </div>
              <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                Ask your documents anything
              </h2>
              <p className="text-sm max-w-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {uploadedPDFCount === 0
                  ? "Upload PDF files in the sidebar to get started. All answers are grounded strictly in your documents."
                  : `${uploadedPDFCount} document${uploadedPDFCount > 1 ? "s" : ""} loaded. Ask a question to begin.`}
              </p>

              {uploadedPDFCount > 0 && (
                <div className="mt-6 grid grid-cols-1 gap-2 w-full max-w-sm">
                  {["What are the main topics covered?", "Summarize the key findings", "What conclusions are drawn?"].map((q) => (
                    <button
                      key={q}
                      onClick={() => onSend(q)}
                      className="px-4 py-2.5 rounded-xl text-sm text-left transition-all"
                      style={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border-bright)",
                        color: "var(--text-secondary)",
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLButtonElement).style.borderColor = "rgba(61,126,255,0.3)";
                        (e.target as HTMLButtonElement).style.color = "var(--text-primary)";
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLButtonElement).style.borderColor = "var(--border-bright)";
                        (e.target as HTMLButtonElement).style.color = "var(--text-secondary)";
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="messages" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {chat.messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              <div ref={bottomRef} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input bar */}
      <div className="px-4 md:px-8 pb-6 pt-3 flex-shrink-0">
        <div
          className="flex items-end gap-3 px-4 py-3 rounded-2xl transition-all"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid var(--border-bright)",
            backdropFilter: "blur(20px)",
          }}
        >
          <label className="flex-shrink-0 cursor-pointer" title="Upload PDF">
            <input type="file" accept=".pdf" multiple className="hidden" onChange={handleFileUpload} />
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--accent-blue)")}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--text-muted)")}
            >
              <FileUp size={17} />
            </div>
          </label>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={uploadedPDFCount === 0 ? "Upload PDFs first to start chatting…" : "Ask a question about your documents…"}
            disabled={isLoading}
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none text-sm leading-relaxed"
            style={{
              color: "var(--text-primary)",
              minHeight: "24px",
              maxHeight: "160px",
            }}
          />

          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all btn-primary disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Send size={14} className="text-white" />
          </button>
        </div>
        <div className="text-center mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
          Answers grounded strictly in uploaded documents · Enter to send
        </div>
      </div>
    </div>
  );
}
