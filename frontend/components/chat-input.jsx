import { useState, useRef, useEffect } from "react";
import { useChatStore } from "@/store/useChatStore";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowUpIcon,
  PlusIcon,
  Square,
  ChevronDown,
  Check,
  Compass,
  MessageSquare,
  Code2,
  Globe,
  FileText,
  Presentation,
  Eye,
} from "lucide-react";
import { cn } from "cn";

export const AGENTS = [
  {
    id: "auto",
    name: "Auto Detect",
    shortName: "Auto",
    icon: Compass,
    color: "text-blue-500",
    placeholder: "Ask Agentic AI...",
  },
  {
    id: "chat",
    name: "Chat Agent",
    shortName: "Chat",
    icon: MessageSquare,
    color: "text-sky-500",
    placeholder: "Chat with Agentic AI...",
  },
  {
    id: "coding",
    name: "Coding Agent",
    shortName: "Coding",
    icon: Code2,
    color: "text-emerald-500",
    placeholder: "Ask a coding or debugging question...",
  },
  {
    id: "search",
    name: "Search Agent",
    shortName: "Search",
    icon: Globe,
    color: "text-amber-500",
    placeholder: "Search web facts, climate, or news...",
  },
  {
    id: "pdf",
    name: "PDF Agent",
    shortName: "PDF",
    icon: FileText,
    color: "text-rose-500",
    placeholder: "Ask about documents or PDFs...",
  },
  {
    id: "ppt",
    name: "PPT Agent",
    shortName: "PPT",
    icon: Presentation,
    color: "text-purple-500",
    placeholder: "Describe slides or presentation topic...",
  },
  {
    id: "vision",
    name: "Vision Agent",
    shortName: "Vision",
    icon: Eye,
    color: "text-teal-500",
    placeholder: "Ask about visual concepts or images...",
  },
];

export function ChatInput() {
  const [content, setContent] = useState("");
  const textareaRef = useRef(null);

  const sendMessage = useChatStore((s) => s.sendMessage);
  const stopGenerating = useChatStore((s) => s.stopGenerating);
  const isSending = useChatStore((s) => s.isSending);
  const selectedAgent = useChatStore((s) => s.selectedAgent || "auto");
  const setSelectedAgent = useChatStore((s) => s.setSelectedAgent);

  const currentAgent = AGENTS.find((a) => a.id === selectedAgent) || AGENTS[0];
  const ActiveIcon = currentAgent.icon;

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
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-[32px] px-2.5 rounded-full shrink-0 flex items-center gap-1.5 text-[12.5px] font-medium text-foreground/80 hover:text-foreground hover:bg-neutral-700/20 dark:hover:bg-neutral-800 transition-all border border-border/40 dark:border-white/[0.08]"
                />
              }
            >
              <ActiveIcon className={cn("size-3.5", currentAgent.color)} />
              <span className="hidden sm:inline">{currentAgent.shortName}</span>
              <ChevronDown className="size-3 text-muted-foreground/70" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="end"
              sideOffset={8}
              className="w-44 p-1 rounded-xl border border-border/60 bg-popover text-popover-foreground shadow-xl"
            >
              <DropdownMenuGroup className="space-y-0.5">
                {AGENTS.map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedAgent === item.id;
                  return (
                    <DropdownMenuItem
                      key={item.id}
                      onClick={() => setSelectedAgent(item.id)}
                      className={cn(
                        "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[13px] cursor-pointer transition-colors",
                        isSelected
                          ? "bg-accent text-accent-foreground font-medium"
                          : "text-foreground/80 hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon className={cn("size-4 shrink-0", item.color)} />
                        <span className="truncate">{item.name}</span>
                      </div>
                      {isSelected && <Check className="size-3.5 text-primary shrink-0 ml-1.5" />}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

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
