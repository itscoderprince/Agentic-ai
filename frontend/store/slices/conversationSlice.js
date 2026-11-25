import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/utils/axios";
import { useChatStore } from "@/store/useChatStore";

const isMongoId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

export const chatKeys = {
  all: ["chats"],
};

// Normalizes MongoDB _id to standard id
export const normalizeChat = (chat) =>
  chat ? { ...chat, id: String(chat.id || chat._id) } : chat;

// Fetches & caches sidebar conversations automatically via TanStack Query
export function useChats() {
  return useQuery({
    queryKey: chatKeys.all,
    queryFn: async () => {
      const { data } = await api.get("/chat/conversations");
      const list = data.conversations || data.data?.conversations || [];
      return list.map(normalizeChat);
    },
  });
}

// Creates a new conversation (used lazily on first prompt)
export function useCreateChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (title) => {
      const { data } = await api.post("/chat/conversations", { title });
      return normalizeChat(data.conversation || data.data?.conversation);
    },
    onSuccess: (created) => {
      queryClient.setQueryData(chatKeys.all, (old = []) => [created, ...old]);
    },
  });
}

// Optimistically renames or pins a chat with automatic rollback on failure
export function useUpdateChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }) => {
      if (!isMongoId(id)) return null;
      const { data } = await api.patch(`/chat/conversations/${id}`, updates);
      return data;
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: chatKeys.all });
      const prevChats = queryClient.getQueryData(chatKeys.all);
      queryClient.setQueryData(chatKeys.all, (old = []) =>
        old.map((c) => (c.id === id ? { ...c, ...updates } : c))
      );
      return { prevChats };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prevChats) queryClient.setQueryData(chatKeys.all, ctx.prevChats);
    },
  });
}

// Optimistically deletes a chat, updates active selection, and clears message cache
export function useDeleteChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      if (isMongoId(id)) await api.delete(`/chat/conversations/${id}`);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: chatKeys.all });
      const prevChats = queryClient.getQueryData(chatKeys.all) || [];
      const remaining = prevChats.filter((c) => c.id !== id);
      queryClient.setQueryData(chatKeys.all, remaining);

      const { activeId, selectChat, newChat } = useChatStore.getState();
      if (activeId === id) {
        if (remaining[0]?.id) selectChat(remaining[0].id);
        else newChat();
      }

      return { prevChats };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prevChats) queryClient.setQueryData(chatKeys.all, ctx.prevChats);
    },
    onSettled: (_data, _err, id) => {
      queryClient.removeQueries({ queryKey: ["messages", id] });
    },
  });
}
