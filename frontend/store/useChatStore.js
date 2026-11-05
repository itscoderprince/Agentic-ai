import { create } from "zustand";
import { devtools } from "zustand/middleware";

const INITIAL_CHATS = [
  { id: "1", title: "Fix missing folders" },
  { id: "2", title: "System Design Roadmap" },
  { id: "3", title: "Ollama Qwen setup uses" },
  { id: "4", title: "Popular Jarvis AI repos" },
];

export const useChatStore = create(
  devtools(
    (set) => ({
      chats: INITIAL_CHATS,
      activeId: "1",
      searchOpen: false,

      setSearchOpen: (searchOpen) => set({ searchOpen }),

      selectChat: (id) => set({ activeId: id }),

      newChat: () => {
        const chat = {
          id: Date.now().toString(),
          title: "New chat",
        };
        set((state) => ({
          chats: [chat, ...state.chats],
          activeId: chat.id,
        }));
        return chat;
      },

      renameChat: (id, newTitle) => {
        const title = newTitle?.trim();
        if (!title) return;
        set((state) => ({
          chats: state.chats.map((c) => (c.id === id ? { ...c, title } : c)),
        }));
      },

      pinChat: (id) => {
        set((state) => ({
          chats: state.chats.map((c) =>
            c.id === id ? { ...c, isPinned: !c.isPinned } : c
          ),
        }));
      },

      deleteChat: (id) => {
        set((state) => {
          const remaining = state.chats.filter((c) => c.id !== id);
          return {
            chats: remaining,
            activeId:
              state.activeId === id ? remaining[0]?.id || null : state.activeId,
          };
        });
      },
    }),
    { name: "ChatStore", enabled: true }
  )
);

export default useChatStore;

