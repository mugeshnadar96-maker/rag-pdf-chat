import { useState } from "react";
import { PanelLeft, PanelRight } from "lucide-react";
import { Sidebar } from "./components/Sidebar";
import { ChatWindow } from "./components/ChatWindow";
import { SourcePanel } from "./components/SourcePanel";
import { useChat } from "./hooks/useChat";
import "./index.css";

export default function App() {
  const {
    chats,
    activeChat,
    activeChatId,
    setActiveChatId,
    createChat,
    sendMessage,
    uploadedPDFs,
    isUploading,
    uploadError,
    handleUpload,
  } = useChat();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);

  const lastAssistantMessage =
    activeChat?.messages.filter((m) => m.role === "assistant" && !m.isLoading).at(-1) ?? null;

  const handleNewChat = () => {
    createChat();
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: "var(--bg-deep)", position: "relative" }}>
      {/* Background orbs */}
      <div
        className="orb"
        style={{
          width: 600,
          height: 600,
          top: -200,
          left: -100,
          background: "radial-gradient(circle, rgba(61,126,255,0.06) 0%, transparent 70%)",
        }}
      />
      <div
        className="orb"
        style={{
          width: 500,
          height: 500,
          bottom: -150,
          right: -50,
          background: "radial-gradient(circle, rgba(159,94,255,0.05) 0%, transparent 70%)",
        }}
      />
      <div className="pdf-watermark" />

      {/* Sidebar */}
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
        onNewChat={handleNewChat}
        uploadedPDFs={uploadedPDFs}
        onUpload={handleUpload}
        isUploading={isUploading}
        uploadError={uploadError}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
      />

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 h-full" style={{ position: "relative", zIndex: 1 }}>
        {/* Topbar */}
        <header
          className="flex items-center justify-between px-5 py-3 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--border)", background: "rgba(8,11,20,0.7)", backdropFilter: "blur(12px)" }}
        >
          <div className="flex items-center gap-3">
            {sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5"
                style={{ color: "var(--text-muted)" }}
              >
                <PanelLeft size={16} />
              </button>
            )}
            <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              {activeChat?.title || "DocuMind"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {uploadedPDFs.length > 0 && (
              <div
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs"
                style={{
                  background: "rgba(61,126,255,0.1)",
                  border: "1px solid rgba(61,126,255,0.2)",
                  color: "var(--accent-blue)",
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-current" />
                {uploadedPDFs.length} doc{uploadedPDFs.length > 1 ? "s" : ""} active
              </div>
            )}
            <button
              onClick={() => setRightPanelOpen((v) => !v)}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5"
              style={{ color: rightPanelOpen ? "var(--accent-blue)" : "var(--text-muted)" }}
              title="Toggle sources panel"
            >
              <PanelRight size={16} />
            </button>
          </div>
        </header>

        {/* Chat */}
        <div className="flex flex-1 min-h-0">
          <div className="flex-1 min-w-0">
            <ChatWindow
              chat={activeChat}
              onSend={sendMessage}
              uploadedPDFCount={uploadedPDFs.length}
              onUpload={handleUpload}
            />
          </div>

          {/* Right panel */}
          <SourcePanel
            lastMessage={lastAssistantMessage}
            open={rightPanelOpen}
            onClose={() => setRightPanelOpen(false)}
          />
        </div>
      </div>
    </div>
  );
}
