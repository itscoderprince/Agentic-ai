import { useChatStore } from "@/store/useChatStore";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AgentSelector } from "@/components/agent-selector";
import { useChatInput } from "@/hooks/use-chat-input";
import { AGENTS } from "@/configs/agents";
import { ArrowUpIcon, PlusIcon, Square } from "lucide-react";
import { cn } from "cn";

export { AGENTS } from "@/configs/agents";

export function ChatInput() {
  const {
    content,
    setContent,
    textareaRef,
    isSending,
    isMultiline,
    handleSend,
    handleKeyDown,
    stopGenerating,
  } = useChatInput();

  const selectedAgent = useChatStore((s) => s.selectedAgent || "auto");
  const currentAgent = AGENTS.find((a) => a.id === selectedAgent) || AGENTS[0];

  return (
    <div className="shrink-0 px-4 pb-4 pt-1 bg-transparent">
      <div className="max-w-3xl mx-auto w-full relative">
        <p className="text-[12px] text-muted-foreground/75 text-center mb-2 select-none">
          Agentic AI can make mistakes. Check important info.
        </p>

        <div
          className={cn(
            "relative flex border border-border/50 dark:border-white/[0.08] bg-secondary/50 dark:bg-[#212121] shadow-xs focus-within:border-ring/60 focus-within:ring-2 focus-within:ring-ring/20 transition-all",
            isMultiline
              ? "rounded-[28px] pl-2.5 pr-2 py-2 items-end"
              : "rounded-full min-h-[52px] pl-2 pr-1.5 py-1.5 items-center"
          )}
        >
          {/* Action / Attachment Plus Button (Left) */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            tooltip="Attach file or action"
            className="size-[34px] rounded-full shrink-0 text-muted-foreground hover:text-foreground hover:bg-neutral-700/30 dark:hover:bg-neutral-700/50"
          >
            <PlusIcon className="size-5" />
            <span className="sr-only">Attach</span>
          </Button>

          {/* Clean Textarea (Center) */}
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={currentAgent.placeholder}
            rows={1}
            className="min-h-[24px] max-h-40 w-full resize-none border-0 border-transparent bg-transparent dark:bg-transparent rounded-none px-2.5 py-1 text-[15.5px] leading-relaxed text-foreground placeholder:text-muted-foreground/60 outline-none ring-0 shadow-none focus-visible:ring-0 focus-visible:border-transparent focus:outline-none"
          />

          {/* Specialist Agent Selector Dropdown (Right) */}
          <AgentSelector />

          {/* Dynamic Send / Stop Button (Far Right) */}
          <Button
            type="button"
            size="icon"
            disabled={!isSending && !content.trim()}
            onClick={isSending ? stopGenerating : handleSend}
            tooltip={isSending ? "Stop generating" : "Send message (Enter)"}
            className={cn(
              "size-[34px] rounded-full shrink-0 ml-1.5 transition-all",
              isSending || content.trim()
                ? "bg-primary text-primary-foreground hover:opacity-90 active:scale-95 shadow-xs cursor-pointer"
                : "bg-muted text-muted-foreground/40 hover:bg-muted cursor-not-allowed opacity-50"
            )}
          >
            {isSending ? (
              <Square className="size-3.5 fill-current" />
            ) : (
              <ArrowUpIcon className="size-4.5 stroke-[2.2]" />
            )}
            <span className="sr-only">{isSending ? "Stop" : "Send"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ChatInput;
