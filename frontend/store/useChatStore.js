import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { createConversationSlice } from "./slices/conversationSlice";
import { createMessageSlice } from "./slices/messageSlice";

export const useChatStore = create(
  devtools(
    (...a) => ({
      ...createConversationSlice(...a),
      ...createMessageSlice(...a),
    }),
    { name: "AgenticAI", store: "chat", enabled: true }
  )
);

export default useChatStore;
