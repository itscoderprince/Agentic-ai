import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/utils/axios";
import { useChatStore, navigateTo } from "@/store/useChatStore";
import { chatKeys, useCreateChat, useUpdateChat } from "./conversationSlice";

const isMongoId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
const normalizeMsg = (m) => (!m ? m : { ...m, id: String(m._id || m.id) });
const toTitle = (text) => (text.length > 32 ? `${text.slice(0, 30)}...` : text);

export const messageKeys = {
  byChat: (chatId) => ["messages", chatId],
};

// Immutably updates a single message in cache
const updateMsg = (list = [], id, patch) =>
  list.map((m) => (m.id === id ? { ...m, ...patch } : m));

// Persists message to MongoDB when conversation exists on server
const persistMessage = (chatId, role, content) => {
  if (isMongoId(chatId) && content?.trim()) {
    api.post(`/chat/conversations/${chatId}/messages`, { role, content: content.trim() })
      .catch((err) => console.error(`Failed to persist ${role} message:`, err?.message || err));
  }
};

let streamAbortController = null;

// Aborts active AI SSE stream
export const stopGenerating = () => {
  if (streamAbortController) {
    streamAbortController.abort();
    streamAbortController = null;
  }
};

// Fetches & caches messages declaratively (auto-skips when activeId is null/local)
export function useMessages(conversationId) {
  return useQuery({
    queryKey: messageKeys.byChat(conversationId),
    queryFn: async () => {
      const { data } = await api.get(`/chat/conversations/${conversationId}/messages`);
      const list = data.messages || data.data?.messages || [];
      return list.map(normalizeMsg);
    },
    enabled: Boolean(conversationId && isMongoId(conversationId)),
  });
}

// Sends user prompt and streams AI response directly into TanStack Query cache
export function useSendMessage() {
  const queryClient = useQueryClient();
  const createChat = useCreateChat();
  const updateChat = useUpdateChat();

  return useMutation({
    mutationFn: async (content) => {
      const text = content?.trim();
      const { activeId: currentId, selectedAgent, isSending, setIsSending } = useChatStore.getState();
      if (!text || isSending) return;

      setIsSending(true);
      let ticker = null;

      try {
        // 1. Ensure conversation exists (lazy creation or rename "New chat")
        let activeId = currentId;
        if (!activeId) {
          const title = toTitle(text);
          try {
            const created = await createChat.mutateAsync(title);
            activeId = created.id;
          } catch {
            activeId = `local-${Date.now()}`;
            queryClient.setQueryData(chatKeys.all, (old = []) => [{ id: activeId, title }, ...old]);
          }
          await queryClient.cancelQueries({ queryKey: messageKeys.byChat(activeId) });
          queryClient.setQueryData(messageKeys.byChat(activeId), []);
          useChatStore.setState({ activeId });
          navigateTo(`/c/${activeId}`, true);
        } else {
          const chats = queryClient.getQueryData(chatKeys.all) || [];
          if (chats.find((c) => c.id === activeId)?.title === "New chat") {
            updateChat.mutate({ id: activeId, updates: { title: toTitle(text) } });
          }
        }

        const queryKey = messageKeys.byChat(activeId);
        const setMessages = (updater) => queryClient.setQueryData(queryKey, updater);

        // 2. Optimistically append user message to cache
        const tempId = `temp-${Date.now()}`;
        const userMsg = { id: tempId, role: "user", content: text, createdAt: new Date().toISOString() };
        setMessages((old = []) => [...old, userMsg]);

        if (isMongoId(activeId)) {
          api.post(`/chat/conversations/${activeId}/messages`, { role: "user", content: text })
            .then(({ data }) => {
              const saved = (data.messages || data.data?.messages)?.[0];
              if (saved) setMessages((old = []) => updateMsg(old, tempId, normalizeMsg(saved)));
            })
            .catch((err) => console.error("Failed to persist user message:", err?.message || err));
        }

        // 3. Stream assistant response with smooth typewriter pacing
        streamAbortController = new AbortController();
        const assistantId = `assistant-${Date.now()}`;
        let fullReply = "";
        let displayedReply = "";
        let streamComplete = false;

        try {
          const serverUrl = api.defaults.baseURL || "http://localhost:1000";
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

          setMessages((old = []) => [
            ...old,
            { id: assistantId, role: "assistant", content: "", createdAt: new Date().toISOString() },
          ]);

          const typingPromise = new Promise((resolve) => {
            ticker = setInterval(() => {
              const backlog = fullReply.length - displayedReply.length;
              if (backlog > 0) {
                const step = backlog > 70 ? Math.ceil(backlog / 6) : backlog > 25 ? 3 : backlog > 8 ? 2 : 1;
                displayedReply = fullReply.slice(0, displayedReply.length + step);
                setMessages((old = []) => updateMsg(old, assistantId, { content: displayedReply }));
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

              let parsed;
              try {
                parsed = JSON.parse(dataStr);
              } catch {
                continue;
              }

              if (parsed.type === "agent" && parsed.agent) {
                setMessages((old = []) => updateMsg(old, assistantId, { agent: parsed.agent }));
              } else if (parsed.type === "token" && parsed.chunk) {
                fullReply += parsed.chunk;
              } else if (parsed.type === "done" && parsed.fullResponse) {
                fullReply = parsed.fullResponse;
              } else if (parsed.type === "error") {
                throw new Error(parsed.message || "Agent generation failed");
              }
            }
          }

          streamComplete = true;
          await typingPromise;

          if (!fullReply.trim()) {
            fullReply = "I was unable to generate a response. Please try asking again.";
            setMessages((old = []) => updateMsg(old, assistantId, { content: fullReply }));
          }

          persistMessage(activeId, "assistant", fullReply);
        } catch (err) {
          if (ticker) clearInterval(ticker);
          if (err.name === "AbortError") {
            if (!displayedReply.trim()) {
              setMessages((old = []) => old.filter((m) => m.id !== assistantId));
            } else {
              persistMessage(activeId, "assistant", displayedReply);
            }
          } else {
            console.error("Agent error:", err?.message || err);
            const errorMsg = `⚠️ Failed to get AI response: ${err.message}. Please verify the Agent service on port 4000.`;
            setMessages((old = []) =>
              old.some((m) => m.id === assistantId)
                ? updateMsg(old, assistantId, { content: errorMsg })
                : [...old, { id: assistantId, role: "assistant", content: errorMsg, createdAt: new Date().toISOString() }]
            );
          }
        }
      } finally {
        if (ticker) clearInterval(ticker);
        streamAbortController = null;
        setIsSending(false);
      }
    },
  });
}
