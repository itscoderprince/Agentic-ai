import { create } from "zustand";
import { devtools } from "zustand/middleware";

// Extracts chat ID from /c/:id URL path
export const getUrlChatId = () => {
  if (typeof window === "undefined") return null;
  const match = window.location.pathname.match(/\/c\/([a-zA-Z0-9_-]+)/);
  return match?.[1] || null;
};

// Updates browser URL cleanly without page reloads
export const navigateTo = (path, replace = false) => {
  if (typeof window !== "undefined" && window.location.pathname !== path) {
    window.history[replace ? "replaceState" : "pushState"](null, "", path);
  }
};

// Zustand now owns ONLY pure client UI state (TanStack Query owns server data)
export const useChatStore = create(
  devtools(
    (set, get) => ({
      activeId: getUrlChatId(),
      searchOpen: false,
      selectedAgent: "auto",
      isSending: false,

      setSearchOpen: (searchOpen) => set({ searchOpen }),
      setSelectedAgent: (selectedAgent) => set({ selectedAgent: selectedAgent || "auto" }),
      setIsSending: (isSending) => set({ isSending }),

      selectChat: (id, syncUrl = true) => {
        if (!id || id === get().activeId) return;
        set({ activeId: id });
        if (syncUrl) navigateTo(`/c/${id}`);
      },

      newChat: (syncUrl = true) => {
        if (!get().activeId) {
          if (syncUrl) navigateTo("/");
          return;
        }
        set({ activeId: null });
        if (syncUrl) navigateTo("/");
      },
    }),
    { name: "AgenticAI", store: "chatUI", enabled: true }
  )
);

export default useChatStore;
