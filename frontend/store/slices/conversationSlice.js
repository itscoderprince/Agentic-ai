import api from "@/utils/axios";

const isMongoId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

// Normalizes MongoDB _id to standard id
export const normalizeChat = (chat) =>
  chat ? { ...chat, id: String(chat.id || chat._id) } : chat;

export const createConversationSlice = (set, get) => ({
  chats: [],
  activeId: null,
  isLoading: false,
  searchOpen: false,

  // Toggles command palette search modal
  setSearchOpen: (searchOpen) =>
    set({ searchOpen }, false, "conversation/setSearchOpen"),

  // Selects conversation, syncs URL to /c/:id, and fetches messages
  selectChat: (id, updateUrl = true) => {
    if (!id || id === get().activeId) return;
    set({ activeId: id }, false, "conversation/selectChat");
    if (updateUrl && window.location.pathname !== `/c/${id}`) {
      window.history.pushState(null, "", `/c/${id}`);
    }
    get().fetchMessages(id);
  },

  // Fetches all conversations and restores chat from /c/:id URL if present
  fetchChats: async () => {
    set({ isLoading: true }, false, "conversation/fetchChats/pending");
    try {
      const { data } = await api.get("/chat/conversations");
      const list = data.conversations || data.data?.conversations || [];
      const chats = list.map(normalizeChat);

      const urlMatch = window.location.pathname.match(/\/c\/([a-zA-Z0-9_-]+)/);
      const urlId = urlMatch?.[1];

      let activeId = null;
      if (urlId && chats.some((c) => c.id === urlId)) {
        activeId = urlId;
      } else if (urlId) {
        window.history.replaceState(null, "", "/");
        activeId = null;
      } else {
        activeId = get().activeId;
      }

      set({ chats, activeId }, false, "conversation/fetchChats/success");
      if (activeId) get().fetchMessages(activeId);
    } catch {
      // Keep existing state if offline
    } finally {
      set({ isLoading: false }, false, "conversation/fetchChats/settled");
    }
  },

  // Opens a fresh empty chat at / without ghost DB records
  newChat: (updateUrl = true) => {
    const { activeId, messages, chats } = get();
    if (messages.length === 0) {
      if (!activeId) return;
      const current = chats.find((c) => c.id === activeId);
      if (current?.title === "New chat") return;
    }
    set({ activeId: null, messages: [] }, false, "conversation/openNewChat");
    if (updateUrl && window.location.pathname !== "/") {
      window.history.pushState(null, "", "/");
    }
  },

  // Updates chat optimistically with rollback on failure
  updateChat: (id, updates, actionName = "conversation/updateChat") => {
    if (!id) return;
    const prevChats = get().chats;

    set(
      { chats: prevChats.map((c) => (c.id === id ? { ...c, ...updates } : c)) },
      false,
      actionName
    );

    if (!isMongoId(id)) return;
    api.patch(`/chat/conversations/${id}`, updates).catch((err) => {
      if (err?.response?.status === 404) return;
      console.error("Failed to update chat:", err?.message || err);
      set({ chats: prevChats }, false, `${actionName}/rollback`);
    });
  },

  // Renames conversation title
  renameChat: (id, newTitle) => {
    const title = newTitle?.trim();
    if (title && id) get().updateChat(id, { title }, "conversation/renameChat");
  },

  // Toggles pinned state of conversation
  pinChat: (id) => {
    const chat = get().chats.find((c) => c.id === id);
    if (chat && id) get().updateChat(id, { isPinned: !chat.isPinned }, "conversation/pinChat");
  },

  // Deletes conversation and selects next available chat
  deleteChat: (id) => {
    if (!id) return;
    const prevChats = get().chats;
    const remaining = prevChats.filter((c) => c.id !== id);
    const nextActiveId = get().activeId === id ? remaining[0]?.id || null : get().activeId;

    set({ chats: remaining, activeId: nextActiveId }, false, "conversation/deleteChat");

    if (nextActiveId) {
      get().fetchMessages(nextActiveId);
      window.history.replaceState(null, "", `/c/${nextActiveId}`);
    } else {
      set({ messages: [] }, false, "conversation/deleteChat/clearMessages");
      window.history.replaceState(null, "", "/");
    }

    if (!isMongoId(id)) return;
    api.delete(`/chat/conversations/${id}`).catch((err) => {
      if (err?.response?.status === 404) return;
      console.error("Failed to delete chat:", err?.message || err);
      set({ chats: prevChats }, false, "conversation/deleteChat/rollback");
    });
  },
});
