import { useState, useCallback } from "react";
import { Chat, Message, UploadedPDF } from "../types";
import { uploadPDFs, askQuestion, clearDocuments } from "../utils/api";

function uid() {
  return Math.random().toString(36).slice(2);
}

export function useChat() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [uploadedPDFs, setUploadedPDFs] = useState<UploadedPDF[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const activeChat = chats.find((c) => c.id === activeChatId) ?? null;

  const createChat = useCallback(async () => {
    await clearDocuments();
    const chat: Chat = {
      id: uid(),
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
    };
    setChats((prev) => [chat, ...prev]);
    setActiveChatId(chat.id);
    setUploadedPDFs([]);
    return chat.id;
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      let chatId = activeChatId;
      if (!chatId) chatId = await createChat();

      const userMsg: Message = {
        id: uid(),
        role: "user",
        content,
        timestamp: new Date(),
      };
      const loadingMsg: Message = {
        id: uid(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isLoading: true,
      };

      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId
            ? {
                ...c,
                title: c.messages.length === 0 ? content.slice(0, 40) : c.title,
                messages: [...c.messages, userMsg, loadingMsg],
              }
            : c
        )
      );

      try {
        const history = (activeChat?.messages ?? [])
          .filter((m) => !m.isLoading)
          .map((m) => ({ role: m.role, content: m.content }));

        const result = await askQuestion(content, history);

        const assistantMsg: Message = {
          id: loadingMsg.id,
          role: "assistant",
          content: result.answer,
          sources: result.sources,
          chunks: result.retrieved_chunks,
          timestamp: new Date(),
        };

        setChats((prev) =>
          prev.map((c) =>
            c.id === chatId
              ? { ...c, messages: c.messages.map((m) => (m.id === loadingMsg.id ? assistantMsg : m)) }
              : c
          )
        );
      } catch (err) {
        const errMsg: Message = {
          id: loadingMsg.id,
          role: "assistant",
          content: `Error: ${err instanceof Error ? err.message : "Something went wrong"}`,
          timestamp: new Date(),
        };
        setChats((prev) =>
          prev.map((c) =>
            c.id === chatId
              ? { ...c, messages: c.messages.map((m) => (m.id === loadingMsg.id ? errMsg : m)) }
              : c
          )
        );
      }
    },
    [activeChatId, activeChat, createChat]
  );

  const handleUpload = useCallback(async (files: File[]) => {
    setIsUploading(true);
    setUploadError(null);
    try {
      const result = await uploadPDFs(files);
      const now = new Date();
      setUploadedPDFs((prev) => [
        ...result.ingested.map((r) => ({ ...r, uploadedAt: now })),
        ...prev.filter((p) => !result.ingested.find((r) => r.filename === p.filename)),
      ]);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }, []);

  return {
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
  };
}
