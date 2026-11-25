import api from "@/utils/axios";
import { normalizeChat } from "./conversationSlice";

const isMongoId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
const normalizeMsg = (m) => (!m ? m : { ...m, id: String(m._id || m.id) });
const toTitle = (text) => (text.length > 32 ? `${text.slice(0, 30)}...` : text);

// Immutably updates a single message by ID
const updateMsg = (messages, id, patch) =>
  messages.map((m) => (m.id === id ? { ...m, ...patch } : m));

// Persists message to MongoDB if conversation is stored in DB
const persistMessage = (chatId, role, content) => {
  if (isMongoId(chatId) && content?.trim()) {
    api.post(`/chat/conversations/${chatId}/messages`, { role, content: content.trim() })
      .catch((err) => console.error(`Failed to persist ${role} message:`, err?.message || err));
  }
};

let streamAbortController = null;

export const createMessageSlice = (set, get) => ({
  messages: [],
  isMessagesLoading: false,
  isSending: false,
  selectedAgent: "auto",

  // Sets active agent specialist for incoming messages
  setSelectedAgent: (agent) => set({ selectedAgent: agent || "auto" }),

  // Aborts ongoing AI stream generation
  stopGenerating: () => {
    if (streamAbortController) {
      streamAbortController.abort();
      streamAbortController = null;
    }
  },

  // Fetches message history for active conversation
  fetchMessages: async (conversationId) => {
    const id = conversationId || get().activeId;
    if (!id || !isMongoId(id)) {
      set({ messages: [] });
      return;
    }

    set({ isMessagesLoading: true });
    try {
      const { data } = await api.get(`/chat/conversations/${id}/messages`);
      const list = data.messages || data.data?.messages || [];
      set({ messages: list.map(normalizeMsg) });
    } catch (err) {
      console.error("Failed to fetch messages:", err?.message || err);
      set({ messages: [] });
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // Sends user message and streams AI response with typewriter pacing
  sendMessage: async (content) => {
    const text = content?.trim();
    if (!text || get().isSending) return;

    let activeId = get().activeId;
    if (!activeId) {
      const title = toTitle(text);
      try {
        const { data } = await api.post("/chat/conversations", { title });
        const created = normalizeChat(data.conversation || data.data?.conversation);
        activeId = created.id;
        set((s) => ({ chats: [created, ...s.chats], activeId }));
      } catch {
        activeId = Date.now().toString();
        set((s) => ({ chats: [{ id: activeId, title }, ...s.chats], activeId }));
      }
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", `/c/${activeId}`);
      }
    } else {
      const activeChat = get().chats.find((c) => c.id === activeId);
      if (activeChat?.title === "New chat") {
        get().renameChat(activeId, toTitle(text));
      }
    }

    const tempId = `temp-${Date.now()}`;
    const userMsg = { id: tempId, role: "user", content: text, createdAt: new Date().toISOString() };
    set((s) => ({ messages: [...s.messages, userMsg], isSending: true }));

    if (isMongoId(activeId)) {
      api.post(`/chat/conversations/${activeId}/messages`, { role: "user", content: text })
        .then(({ data }) => {
          const saved = (data.messages || data.data?.messages)?.[0];
          if (saved) {
            set((s) => ({ messages: updateMsg(s.messages, tempId, normalizeMsg(saved)) }));
          }
        })
        .catch((err) => console.error("Failed to persist user message:", err?.message || err));
    }

    streamAbortController = new AbortController();
    const assistantId = `assistant-${Date.now()}`;
    let fullReply = "";
    let displayedReply = "";
    let streamComplete = false;
    let ticker = null;

    try {
      const serverUrl = api.defaults.baseURL || "http://localhost:1000";
      const selectedAgent = get().selectedAgent;
      const res = await fetch(`${serverUrl}/agent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal: streamAbortController.signal,
        body: JSON.stringify({
          prompt: text,
          conversationId: activeId,
          ...(selectedAgent && selectedAgent !== "auto" ? { agent: selectedAgent } : {}),
        }),
      });

      if (!res.ok || !res.body) throw new Error(`Agent error: ${res.statusText || res.status}`);

      set((s) => ({
        messages: [...s.messages, { id: assistantId, role: "assistant", content: "", createdAt: new Date().toISOString() }],
      }));

      // Typewriter pacing: smoothly reveals response without sudden chunk bursts
      const typingPromise = new Promise((resolve) => {
        ticker = setInterval(() => {
          const backlog = fullReply.length - displayedReply.length;
          if (backlog > 0) {
            const step = backlog > 70 ? Math.ceil(backlog / 6) : backlog > 25 ? 3 : backlog > 8 ? 2 : 1;
            displayedReply = fullReply.slice(0, displayedReply.length + step);
            set((s) => ({ messages: updateMsg(s.messages, assistantId, { content: displayedReply }) }));
          } else if (streamComplete) {
            clearInterval(ticker);
            resolve();
          }
        }, 18);
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith("data:")) continue;
          const dataStr = line.slice(5).trim();
          if (dataStr === "[DONE]") continue;

          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.type === "agent" && parsed.agent) {
              set((s) => ({ messages: updateMsg(s.messages, assistantId, { agent: parsed.agent }) }));
            } else if (parsed.type === "token" && parsed.chunk) {
              fullReply += parsed.chunk;
            } else if (parsed.type === "done" && parsed.fullResponse) {
              fullReply = parsed.fullResponse;
            } else if (parsed.type === "error") {
              throw new Error(parsed.message || "Agent generation failed");
            }
          } catch {
            // Ignore partial SSE chunk parse errors
          }
        }
      }

      streamComplete = true;
      await typingPromise;

      if (!fullReply.trim()) {
        fullReply = "I was unable to generate a response. Please try asking again.";
        set((s) => ({ messages: updateMsg(s.messages, assistantId, { content: fullReply }) }));
      }

      persistMessage(activeId, "assistant", fullReply);
    } catch (err) {
      if (ticker) clearInterval(ticker);
      if (err.name === "AbortError") {
        if (!displayedReply.trim()) {
          set((s) => ({ messages: s.messages.filter((m) => m.id !== assistantId) }));
        } else {
          persistMessage(activeId, "assistant", displayedReply);
        }
      } else {
        console.error("Agent error:", err?.message || err);
        const errorMsg = `⚠️ Failed to get AI response: ${err.message}. Please verify the Agent service on port 4000.`;
        set((s) => ({
          messages: s.messages.some((m) => m.id === assistantId)
            ? updateMsg(s.messages, assistantId, { content: errorMsg })
            : [...s.messages, { id: assistantId, role: "assistant", content: errorMsg, createdAt: new Date().toISOString() }],
        }));
      }
    } finally {
      if (ticker) clearInterval(ticker);
      streamAbortController = null;
      set({ isSending: false });
    }
  },
});

export default createMessageSlice;
