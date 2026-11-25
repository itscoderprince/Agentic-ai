import api from "@/utils/axios";

const isMongoId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

// Normalizes MongoDB _id to standard id
export const normalizeChat = (chat) =>
  chat ? { ...chat, id: String(chat.id || chat._id) } : chat;

// Updates browser URL cleanly without page reloads
const navigateTo = (path) => {
  if (typeof window !== "undefined" && window.location.pathname !== path) {
    window.history.pushState(null, "", path);
  }
};

export const createConversationSlice = (set, get) => ({
  chats: [],
  activeId: null,
  isLoading: false,
  searchOpen: false,

  setSearchOpen: (searchOpen) => set({ searchOpen }),

  // Selects chat, fetches its messages, and updates URL to /c/:id
  selectChat: (id, syncUrl = true) => {
    if (!id || id === get().activeId) return;
    set({ activeId: id });
    if (syncUrl) navigateTo(`/c/${id}`);
    get().fetchMessages(id);
  },

  // Resets to fresh empty chat at /
  newChat: (syncUrl = true) => {
    if (!get().activeId && get().messages.length === 0) return;
    set({ activeId: null, messages: [] });
    if (syncUrl) navigateTo("/");
  },

  // Fetches conversation list and restores active chat from URL if on /c/:id
  fetchChats: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get("/chat/conversations");
      const list = data.conversations || data.data?.conversations || [];
      const chats = list.map(normalizeChat);

      const match = window.location.pathname.match(/\/c\/([a-zA-Z0-9_-]+)/);
      const urlId = match?.[1];
      const activeId = urlId && chats.some((c) => c.id === urlId) ? urlId : null;

      if (urlId && !activeId) navigateTo("/");

      set({ chats, activeId });
      if (activeId) get().fetchMessages(activeId);
    } catch (err) {
      console.error("Failed to fetch chats:", err?.message || err);
    } finally {
      set({ isLoading: false });
    }
  },

  // Optimistic update helper with rollback on failure
  updateChat: (id, updates) => {
    if (!id) return;
    const prevChats = get().chats;
    set({ chats: prevChats.map((c) => (c.id === id ? { ...c, ...updates } : c)) });

    if (isMongoId(id)) {
      api.patch(`/chat/conversations/${id}`, updates).catch(() => {
        set({ chats: prevChats });
      });
    }
  },

  renameChat: (id, title) => {
    const clean = title?.trim();
    if (id && clean) get().updateChat(id, { title: clean });
  },

  pinChat: (id) => {
    const chat = get().chats.find((c) => c.id === id);
    if (id && chat) get().updateChat(id, { isPinned: !chat.isPinned });
  },

  deleteChat: (id) => {
    if (!id) return;
    const prevChats = get().chats;
    const remaining = prevChats.filter((c) => c.id !== id);
    const nextActiveId = get().activeId === id ? remaining[0]?.id || null : get().activeId;

    set({ chats: remaining, activeId: nextActiveId });

    if (nextActiveId) {
      get().fetchMessages(nextActiveId);
      navigateTo(`/c/${nextActiveId}`);
    } else {
      set({ messages: [] });
      navigateTo("/");
    }

    if (isMongoId(id)) {
      api.delete(`/chat/conversations/${id}`).catch(() => {
        set({ chats: prevChats });
      });
    }
  },
});

export default createConversationSlice;
