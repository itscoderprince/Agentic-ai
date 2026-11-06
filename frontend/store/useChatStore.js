import { create } from "zustand";
import { devtools } from "zustand/middleware";
import api from "@/utils/axios";

// Helper to normalize Mongo _id to id for UI consistency
const normalizeChat = (chat) => ({
  ...chat,
  id: chat._id || chat.id,
});

export const useChatStore = create(
  devtools(
    (set, get) => ({
      chats: [],
      activeId: null,
      isLoading: false,
      searchOpen: false,

      setSearchOpen: (searchOpen) => set({ searchOpen }),
      selectChat: (id) => set({ activeId: id }),

      // Load all conversations for authenticated user
      fetchChats: async () => {
        set({ isLoading: true });
        try {
          const { data } = await api.get("/chat/conversations");
          const conversations = (data.data?.conversations || []).map(normalizeChat);
          set({
            chats: conversations,
            activeId: get().activeId || conversations[0]?.id || null,
            isLoading: false,
          });
        } catch {
          set({ isLoading: false });
        }
      },

      // Create new conversation
      newChat: async () => {
        try {
          const { data } = await api.post("/chat/conversations", {
            title: "New chat",
          });
          const chat = normalizeChat(data.data?.conversation);
          set((state) => ({
            chats: [chat, ...state.chats],
            activeId: chat.id,
          }));
          return chat;
        } catch {
          const fallback = { id: Date.now().toString(), title: "New chat" };
          set((state) => ({
            chats: [fallback, ...state.chats],
            activeId: fallback.id,
          }));
          return fallback;
        }
      },

      // Rename conversation with optimistic update
      renameChat: async (id, newTitle) => {
        const title = newTitle?.trim();
        if (!title) return;
        set((state) => ({
          chats: state.chats.map((c) => (c.id === id ? { ...c, title } : c)),
        }));
        try {
          await api.patch(`/chat/conversations/${id}`, { title });
        } catch {
          // ignore error
        }
      },

      // Toggle pin status with optimistic update & rollback
      pinChat: async (id) => {
        const chat = get().chats.find((c) => c.id === id);
        if (!chat) return;
        const nextPinned = !chat.isPinned;
        set((state) => ({
          chats: state.chats.map((c) =>
            c.id === id ? { ...c, isPinned: nextPinned } : c
          ),
        }));
        try {
          await api.patch(`/chat/conversations/${id}`, { isPinned: nextPinned });
        } catch {
          set((state) => ({
            chats: state.chats.map((c) =>
              c.id === id ? { ...c, isPinned: !nextPinned } : c
            ),
          }));
        }
      },

      // Delete conversation with optimistic update & rollback
      deleteChat: async (id) => {
        const prevChats = get().chats;
        const remaining = prevChats.filter((c) => c.id !== id);
        set({
          chats: remaining,
          activeId:
            get().activeId === id ? remaining[0]?.id || null : get().activeId,
        });
        try {
          await api.delete(`/chat/conversations/${id}`);
        } catch {
          set({ chats: prevChats });
        }
      },
    }),
    { name: "ChatStore", enabled: true }
  )
);

export default useChatStore;
