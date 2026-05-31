import { motion } from "framer-motion";
import { User, Sparkles, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Message } from "../types";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const [showChunks, setShowChunks] = useState(false);
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center"
        style={{
          background: isUser
            ? "rgba(255,255,255,0.08)"
            : "linear-gradient(135deg, var(--accent-blue), var(--accent-purple))",
          border: "1px solid var(--border-bright)",
        }}
      >
        {isUser ? (
          <User size={14} style={{ color: "var(--text-secondary)" }} />
        ) : (
          <Sparkles size={13} className="text-white" />
        )}
      </div>

      <div className={`flex-1 max-w-[80%] ${isUser ? "flex flex-col items-end" : ""}`}>
        {/* Bubble */}
        <div
          className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
          style={{
            background: isUser
              ? "linear-gradient(135deg, rgba(61, 126, 255, 0.2), rgba(159, 94, 255, 0.15))"
              : "var(--bg-card)",
            border: `1px solid ${isUser ? "rgba(61,126,255,0.25)" : "var(--border)"}`,
            color: "var(--text-primary)",
            backdropFilter: "blur(20px)",
            borderRadius: isUser ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
          }}
        >
          {message.isLoading ? (
            <div className="flex items-center gap-1.5 py-0.5">
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          ) : (
            <span style={{ whiteSpace: "pre-wrap" }}>{message.content}</span>
          )}
        </div>

        {/* Sources */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-2 w-full"
          >
            <div className="flex items-center gap-2 flex-wrap">
              {message.sources.map((src, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs"
                  style={{
                    background: "rgba(61, 126, 255, 0.08)",
                    border: "1px solid rgba(61, 126, 255, 0.2)",
                    color: "var(--accent-blue)",
                  }}
                >
                  <FileText size={11} />
                  <span className="max-w-[140px] truncate">{src.filename}</span>
                  <span style={{ color: "var(--text-muted)" }}>p.{src.page}</span>
                </div>
              ))}
            </div>

            {/* Debug chunks toggle */}
            {message.chunks && message.chunks.length > 0 && (
              <div className="mt-1.5">
                <button
                  onClick={() => setShowChunks((v) => !v)}
                  className="flex items-center gap-1 text-xs transition-colors"
                  style={{ color: "var(--text-muted)" }}
                >
                  {showChunks ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  {showChunks ? "Hide" : "Show"} retrieved chunks ({message.chunks.length})
                </button>
                {showChunks && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-2 space-y-2"
                  >
                    {message.chunks.map((chunk, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl text-xs"
                        style={{
                          background: "rgba(255,255,255,0.025)",
                          border: "1px solid var(--border)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span style={{ color: "var(--accent-cyan)", fontFamily: "JetBrains Mono, monospace" }}>
                            {chunk.filename} · p.{chunk.page}
                          </span>
                          <span
                            className="px-1.5 py-0.5 rounded text-xs"
                            style={{
                              background: "rgba(0, 210, 255, 0.08)",
                              color: "var(--accent-cyan)",
                              fontFamily: "JetBrains Mono, monospace",
                            }}
                          >
                            {(chunk.similarity * 100).toFixed(1)}%
                          </span>
                        </div>
                        <p className="line-clamp-3 leading-relaxed">{chunk.text}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Timestamp */}
        <div className="mt-1 px-1 text-xs" style={{ color: "var(--text-muted)" }}>
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </motion.div>
  );
}
