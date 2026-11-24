import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import { SearchDialog } from "@/components/search-dialog";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/store/useChatStore";
import { ChatMessages } from "@/components/chat-messages";
import { ChatInput } from "@/components/chat-input";
import {
  BrainCircuit,
  PanelLeftIcon,
  SearchIcon,
  MessageSquarePlusIcon,
  Share2Icon,
} from "lucide-react";
import { cn } from "cn";

function HeaderTitle({ chat, onRename }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(chat?.title || "");

  const [prevChatId, setPrevChatId] = useState(chat?.id);
  if (chat?.id !== prevChatId) {
    setPrevChatId(chat?.id);
    setTitle(chat?.title || "");
    setIsEditing(false);
  }

  const handleSave = () => {
    setIsEditing(false);
    const clean = title.trim();
    if (clean && clean !== chat.title) {
      onRename(clean);
    } else {
      setTitle(chat.title);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setTitle(chat.title);
      setIsEditing(false);
    }
  };

  if (!chat) {
    return (
      <div className="min-w-0 flex items-center">
        <span className="text-[0.9375rem] font-semibold text-foreground select-none py-1 px-1">
          New chat
        </span>
      </div>
    );
  }

  // Editing state (Image 2 reference: blue bordered pill input auto-sized strictly to text)
  if (isEditing) {
    return (
      <div className="min-w-0 flex items-center">
        <div className="relative inline-flex items-center min-w-[60px] max-w-[340px] sm:max-w-[420px]">
          {/* Invisible mirror span driving exact pixel width */}
          <span
            aria-hidden="true"
            className="invisible whitespace-pre px-3.5 py-1 text-[0.9375rem] font-semibold select-none pointer-events-none"
          >
            {title || "\u00A0"}
          </span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            autoFocus
            className="absolute inset-0 w-full h-full rounded-full border bg-secondary/40 dark:bg-neutral-900/90 px-3.5 py-1 text-[0.9375rem] font-semibold text-foreground outline-none ring-0 shadow-xs"
          />
        </div>
      </div>
    );
  }

  // Normal state (Image 1 reference: clean text title)
  return (
    <div className="min-w-0 flex items-center">
      <span
        onClick={() => setIsEditing(true)}
        title="Click to rename"
        className="text-[0.9375rem] font-semibold text-foreground truncate cursor-pointer hover:opacity-80 transition-opacity select-none py-1 px-1 rounded-sm"
      >
        {chat.title}
      </span>
    </div>
  );
}

function ChatHeader() {
  const { open, isMobile, openMobile, toggleSidebar } = useSidebar();
  const isOpen = isMobile ? openMobile : open;

  const chats = useChatStore((s) => s.chats);
  const activeId = useChatStore((s) => s.activeId);
  const activeChat = activeId
    ? chats.find((c) => (c.id || c._id) === activeId) || null
    : null;
  const newChat = useChatStore((s) => s.newChat);
  const renameChat = useChatStore((s) => s.renameChat);
  const searchOpen = useChatStore((s) => s.searchOpen);
  const setSearchOpen = useChatStore((s) => s.setSearchOpen);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert("Chat link copied to clipboard!");
    }
  };

  const capsuleActions = [
    {
      label: "Open sidebar (⌘B)",
      icon: PanelLeftIcon,
      onClick: toggleSidebar
    },
    {
      label: "Search (⌘K)",
      icon: SearchIcon,
      onClick: () => setSearchOpen(true)
    },
    {
      label: "New chat",
      icon: MessageSquarePlusIcon,
      onClick: newChat
    },
  ];

  return (
    <>
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 px-3 sm:px-4 border-b border-border/60">
        <div className="flex items-center min-w-0 flex-1">
          {/* DeepSeek-inspired closed-sidebar capsule */}
          <div
            className={cn(
              "flex items-center h-10 shrink-0 transition-all duration-300 ease-in-out",
              isOpen
                ? "opacity-0 pointer-events-none -translate-x-4 max-w-0 mr-0 overflow-hidden"
                : "opacity-100 pointer-events-auto translate-x-0 max-w-[220px] mr-3"
            )}
          >
            <div className="flex items-center gap-2.5 shrink-0">
              {/* Logo */}
              <div
                className="flex items-center justify-center size-8.5 rounded-lg cursor-pointer hover:bg-secondary dark:hover:bg-neutral-800 transition-all active:scale-95"
                onClick={toggleSidebar}
              >
                <BrainCircuit className="size-5.5 text-blue-600 dark:text-blue-400" />
              </div>

              {/* Pill Capsule: Sidebar Toggle | Search | New Chat */}
              <div className="flex items-center bg-secondary dark:bg-neutral-800 border border-border dark:border-neutral-700 rounded-full h-10 p-1 gap-0.5 shadow-xs transition-colors">
                {capsuleActions.map(({ label, icon: Icon, onClick }) => (
                  <Button
                    key={label}
                    variant="ghost"
                    size="icon"
                    tooltip={label}
                    className="size-8 rounded-full p-0 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background dark:hover:bg-neutral-700/80 hover:shadow-2xs active:scale-95 transition-all duration-150 cursor-pointer"
                    onClick={onClick}
                  >
                    <Icon className="size-4.5" />
                    <span className="sr-only">{label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Current Conversation Title (DeepSeek inline editable: Image 1 & 2 references) */}
          <HeaderTitle
            chat={activeChat}
            onRename={(newTitle) => {
              if (activeChat) renameChat(activeChat.id || activeChat._id, newTitle);
            }}
          />
        </div>

        {/* Right side Share button */}
        <div className="flex items-center gap-1.5 ml-auto shrink-0">
          <Button
            variant="outline"
            size="sm"
            tooltip="Share chat"
            className="h-8.5 rounded-full px-3 gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground border-border dark:border-neutral-700 shadow-xs cursor-pointer"
            onClick={handleShare}
          >
            <Share2Icon className="size-3.5" />
            <span className="hidden sm:inline">Share</span>
          </Button>
        </div>
      </header>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}

export default function Page() {
  const fetchChats = useChatStore((s) => s.fetchChats);
  const selectChat = useChatStore((s) => s.selectChat);
  const newChat = useChatStore((s) => s.newChat);

  useEffect(() => {
    fetchChats();

    const handlePopState = () => {
      const match = window.location.pathname.match(/\/c\/([a-zA-Z0-9_-]+)/);
      if (match?.[1]) {
        selectChat(match[1], false);
      } else {
        newChat(false);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [fetchChats, selectChat, newChat]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="h-svh overflow-hidden">
        <ChatHeader />
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          <ChatMessages />
          <ChatInput />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
