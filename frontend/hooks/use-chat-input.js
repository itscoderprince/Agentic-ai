import { useState, useRef, useEffect } from "react";
import { useChatStore } from "@/store/useChatStore";
import { useSendMessage, stopGenerating } from "@/store/slices/messageSlice";

/**
 * Handles chat textarea state, keydown bindings, and submission orchestration.
 */
export function useChatInput() {
  const [content, setContent] = useState("");
  const textareaRef = useRef(null);

  const isSending = useChatStore((s) => s.isSending);
  const { mutate: sendMessage } = useSendMessage();

  const handleSend = () => {
    const text = content.trim();
    if (!text || isSending) return;
    sendMessage(text);
    setContent("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const isMultiline = content.includes("\n") || content.length > 80;

  return {
    content,
    setContent,
    textareaRef,
    isSending,
    isMultiline,
    handleSend,
    handleKeyDown,
    stopGenerating,
  };
}

export default useChatInput;
