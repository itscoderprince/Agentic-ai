import { useEffect, useRef } from "react";
import { useChatStore } from "@/store/useChatStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message, MessageContent } from "@/components/ui/message";
import { Spinner } from "@/components/ui/spinner";
import { BrainCircuit } from "lucide-react";
import { AssistantMarkdown } from "@/components/assistant-markdown";

export function ChatMessages() {
  const messages = useChatStore((s) => s.messages);
  const isMessagesLoading = useChatStore((s) => s.isMessagesLoading);
  const isSending = useChatStore((s) => s.isSending);

  const bottomRef = useRef(null);

  // Smooth scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  // Loading state
  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-3 text-muted-foreground">
        <Spinner className="size-6 text-primary" />
        <span className="text-sm font-medium">Loading conversation...</span>
      </div>
    );
  }

  // Empty State (DeepSeek-style: clean, centered, no clutter)
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-2xl mx-auto w-full text-center select-none">
        <div className="flex items-center justify-center gap-3 text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
          <BrainCircuit className="size-7 sm:size-8 text-blue-500" />
          <span>Whenever you're ready</span>
        </div>
      </div>
    );
  }

  // Active Messages Thread
  return (
    <ScrollArea className="flex-1 min-h-0 h-full px-4">
      <div className="py-6 space-y-6 max-w-3xl mx-auto w-full">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          if (!isUser && !msg.content) return null;
          return (
            <Message
              key={msg.id || msg._id}
              align={isUser ? "end" : "start"}
              className="text-base"
            >
              <MessageContent className={isUser ? "items-end" : "items-start"}>
                {isUser ? (
                  <div className="whitespace-pre-wrap break-words select-text text-[15px] sm:text-[16px] leading-relaxed rounded-3xl bg-secondary text-secondary-foreground dark:bg-neutral-800 dark:text-neutral-100 px-5 py-3 max-w-[85%] sm:max-w-[75%] shadow-2xs">
                    {msg.content}
                  </div>
                ) : (
                  <div className="w-full min-w-0 text-[16px] sm:text-[17px] leading-[1.8] tracking-[-0.01em] text-foreground py-1.5 font-normal select-text">
                    <AssistantMarkdown content={msg.content} />
                  </div>
                )}
              </MessageContent>
            </Message>
          );
        })}

        {/* Antigravity Thinking Indicator: pure glowing text shimmer with no badge or icon */}
        {isSending &&
          (!messages.length ||
            messages[messages.length - 1]?.role !== "assistant" ||
            !messages[messages.length - 1]?.content) && (
            <Message align="start">
              <MessageContent className="items-start">
                <div className="py-1.5 select-none">
                  <span className="text-[16px] sm:text-[17px] font-normal tracking-[-0.01em] animate-text-shimmer">
                    Thinking
                  </span>
                </div>
              </MessageContent>
            </Message>
          )}

        <div ref={bottomRef} className="h-6" />
      </div>
    </ScrollArea>
  );
}

export default ChatMessages;
