import { useEffect } from "react";
import { useChatStore, getUrlChatId } from "@/store/useChatStore";
import { useChats } from "@/store/slices/conversationSlice";

/**
 * Validates URL conversation ID against cached chats and syncs browser back/forward history.
 */
export function useChatNavigation() {
  const activeId = useChatStore((s) => s.activeId);
  const selectChat = useChatStore((s) => s.selectChat);
  const newChat = useChatStore((s) => s.newChat);
  const { data: chats = [], isSuccess } = useChats();

  useEffect(() => {
    if (isSuccess && activeId && !String(activeId).startsWith("local-") && !chats.some((c) => c.id === activeId)) {
      newChat(true);
    }
  }, [isSuccess, chats, activeId, newChat]);

  useEffect(() => {
    const handlePopState = () => {
      const id = getUrlChatId();
      if (id) selectChat(id, false);
      else newChat(false);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [selectChat, newChat]);
}

export default useChatNavigation;
