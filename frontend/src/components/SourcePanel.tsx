import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Hash, Percent } from "lucide-react";
import { Message } from "../types";

interface SourcePanelProps {
  lastMessage: Message | null;
  open: boolean;
  onClose: () => void;
}

export function SourcePanel({ lastMessage, open, onClose }: SourcePanelProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 300, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 35 }}
          className="flex-shrink-0 h-full overflow-hidden"
          style={{ borderLeft: "1px solid var(--border)", zIndex: 5 }}
        >
          <div className="w-[300px] h-full flex flex-col" style={{ background: "rgba(8,11,20,0.92)", backdropFilter: "blur(20px)" }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Sources & Context</span>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5"
                style={{ color: "var(--text-muted)" }}
              >
                <X size={15} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
              {!lastMessage || !lastMessage.chunks?.length ? (
                <div className="text-center pt-12">
                  <FileText size={28} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    Ask a question to see retrieved chunks here
                  </p>
                </div>
              ) : (
                <>
                  <div className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
                    {lastMessage.chunks.length} chunks retrieved
                  </div>
                  {lastMessage.chunks.map((chunk, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="rounded-xl p-3"
                      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <FileText size={11} style={{ color: "var(--accent-blue)" }} />
                          <span className="text-xs truncate max-w-[120px]" style={{ color: "var(--accent-blue)" }}>
                            {chunk.filename}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                            <Hash size={10} />
                            <span>{chunk.page}</span>
                          </div>
                          <div
                            className="flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded"
                            style={{
                              background: "rgba(0,210,255,0.08)",
                              color: "var(--accent-cyan)",
                              fontFamily: "JetBrains Mono, monospace",
                            }}
                          >
                            <Percent size={9} />
                            {(chunk.similarity * 100).toFixed(0)}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs leading-relaxed line-clamp-5" style={{ color: "var(--text-secondary)" }}>
                        {chunk.text}
                      </p>
                    </motion.div>
                  ))}
                </>
              )}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
