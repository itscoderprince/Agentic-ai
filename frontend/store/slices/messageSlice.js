import api from "@/utils/axios";
import { normalizeChat } from "./conversationSlice";

const isMongoId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
const normalizeMsg = (m) => (!m ? m : { ...m, id: String(m._id || m.id) });

let streamAbortController = null;

export const createMessageSlice = (set, get) => ({
  messages: [],
  isMessagesLoading: false,
  isSending: false,
  selectedAgent: "auto",

  // Sets the active agent specialist for incoming messages
  setSelectedAgent: (agent) => set({ selectedAgent: agent || "auto" }, false, "message/setSelectedAgent"),

  // Stops ongoing AI stream generation
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
      set({ messages: [] }, false, "message/fetchMessages/reset");
      return;
    }

    set({ isMessagesLoading: true }, false, "message/fetchMessages/pending");
    try {
      const { data } = await api.get(`/chat/conversations/${id}/messages`);
      const list = data.messages || data.data?.messages || [];
      set({ messages: list.map(normalizeMsg) }, false, "message/fetchMessages/success");
    } catch (err) {
      console.error("Failed to fetch messages:", err?.message || err);
      set({ messages: [] }, false, "message/fetchMessages/error");
    } finally {
      set({ isMessagesLoading: false }, false, "message/fetchMessages/settled");
    }
  },

  // Sends user message and streams AI response with smooth typewriter pacing
  sendMessage: async (content) => {
    const text = content?.trim();
    if (!text || get().isSending) return;

    let activeId = get().activeId;
    if (!activeId) {
      const title = text.length > 32 ? `${text.slice(0, 30)}...` : text;
      try {
        const { data } = await api.post("/chat/conversations", { title });
        const created = normalizeChat(data.conversation || data.data?.conversation);
        activeId = created.id;
        set((s) => ({ chats: [created, ...s.chats], activeId }), false, "message/createChat");
        window.history.replaceState(null, "", `/c/${created.id}`);
      } catch {
        activeId = Date.now().toString();
        set((s) => ({ chats: [{ id: activeId, title }, ...s.chats], activeId }), false, "message/createFallback");
        window.history.replaceState(null, "", `/c/${activeId}`);
      }
    } else {
      const activeChat = get().chats.find((c) => c.id === activeId);
      if (activeChat?.title === "New chat") {
        get().renameChat(activeId, text.length > 32 ? `${text.slice(0, 30)}...` : text);
      }
    }

    const tempId = `temp-${Date.now()}`;
    const userMsg = { id: tempId, role: "user", content: text, createdAt: new Date().toISOString() };
    set((s) => ({ messages: [...s.messages, userMsg], isSending: true }), false, "message/send/pending");

    if (isMongoId(activeId)) {
      api.post(`/chat/conversations/${activeId}/messages`, { role: "user", content: text })
        .then(({ data }) => {
          const saved = (data.messages || data.data?.messages)?.[0];
          if (saved) {
            set((s) => ({
              messages: s.messages.map((m) => (m.id === tempId ? normalizeMsg(saved) : m)),
            }), false, "message/user/persisted");
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
      }), false, "message/stream/start");

      // Smooth typewriter pacing: reveals characters smoothly without jarring chunk bursts
      const typingPromise = new Promise((resolve) => {
        ticker = setInterval(() => {
          const backlog = fullReply.length - displayedReply.length;
          if (backlog > 0) {
            const step = backlog > 70 ? Math.ceil(backlog / 6) : backlog > 25 ? 3 : backlog > 8 ? 2 : 1;
            displayedReply = fullReply.slice(0, displayedReply.length + step);
            set((s) => ({
              messages: s.messages.map((m) => (m.id === assistantId ? { ...m, content: displayedReply } : m)),
            }), false, "message/stream/token");
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
              set((s) => ({
                messages: s.messages.map((m) => (m.id === assistantId ? { ...m, agent: parsed.agent } : m)),
              }), false, "message/stream/agent");
            } else if (parsed.type === "token" && parsed.chunk) {
              fullReply += parsed.chunk;
            } else if (parsed.type === "done" && parsed.fullResponse) {
              fullReply = parsed.fullResponse;
            } else if (parsed.type === "error") {
              throw new Error(parsed.message || "Agent generation failed");
            }
          } catch {
            // Ignore partial chunk parse failures
          }
        }
      }

      streamComplete = true;
      await typingPromise;

      if (!fullReply.trim()) {
        fullReply = "I was unable to generate a response. Please try asking again.";
        set((s) => ({
          messages: s.messages.map((m) => (m.id === assistantId ? { ...m, content: fullReply } : m)),
        }), false, "message/emptyFallback");
      }

      if (isMongoId(activeId) && fullReply.trim()) {
        api.post(`/chat/conversations/${activeId}/messages`, { role: "assistant", content: fullReply })
          .catch((err) => console.error("Failed to persist assistant message:", err?.message || err));
      }
    } catch (err) {
      if (ticker) clearInterval(ticker);
      if (err.name === "AbortError") {
        if (!displayedReply.trim()) {
          set((s) => ({
            messages: s.messages.filter((m) => m.id !== assistantId),
          }), false, "message/stream/abortedEmpty");
        } else if (isMongoId(activeId)) {
          api.post(`/chat/conversations/${activeId}/messages`, { role: "assistant", content: displayedReply })
            .catch(() => {});
        }
      } else {
        console.error("Agent error:", err?.message || err);
        const errorMsg = `⚠️ Failed to get AI response: ${err.message}. Please verify the Agent service on port 4000.`;
        set((s) => ({
          messages: s.messages.some((m) => m.id === assistantId)
            ? s.messages.map((m) => (m.id === assistantId ? { ...m, content: errorMsg } : m))
            : [...s.messages, { id: assistantId, role: "assistant", content: errorMsg, createdAt: new Date().toISOString() }],
        }), false, "message/stream/error");
      }
    } finally {
      if (ticker) clearInterval(ticker);
      streamAbortController = null;
      set({ isSending: false }, false, "message/send/settled");
    }
  },
});
