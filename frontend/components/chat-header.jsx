import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { SearchDialog } from "@/components/search-dialog";
import { HeaderTitle } from "@/components/header-title";
import { useChatStore } from "@/store/useChatStore";
import { useChats, useUpdateChat } from "@/store/slices/conversationSlice";
import {
  BrainCircuit,
  PanelLeftIcon,
  SearchIcon,
  MessageSquarePlusIcon,
  Share2Icon,
} from "lucide-react";
import { cn } from "cn";

export function ChatHeader() {
  const { open, isMobile, openMobile, toggleSidebar } = useSidebar();
  const isOpen = isMobile ? openMobile : open;

  const { data: chats = [] } = useChats();
  const { mutate: updateChat } = useUpdateChat();
  const activeId = useChatStore((s) => s.activeId);
  const activeChat = activeId
    ? chats.find((c) => (c.id || c._id) === activeId) || null
    : null;
  const newChat = useChatStore((s) => s.newChat);
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
      onClick: toggleSidebar,
    },
    {
      label: "Search (⌘K)",
      icon: SearchIcon,
      onClick: () => setSearchOpen(true),
    },
    {
      label: "New chat",
      icon: MessageSquarePlusIcon,
      onClick: () => newChat(),
    },
  ];

  return (
    <>
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 px-3 sm:px-4 border-b border-border/60">
        <div className="flex items-center min-w-0 flex-1">
          {/* Collapsed sidebar quick-action capsule */}
          <div
            className={cn(
              "flex items-center h-10 shrink-0 transition-all duration-300 ease-in-out",
              isOpen
                ? "opacity-0 pointer-events-none -translate-x-4 max-w-0 mr-0 overflow-hidden"
                : "opacity-100 pointer-events-auto translate-x-0 max-w-[220px] mr-3"
            )}
          >
            <div className="flex items-center gap-2.5 shrink-0">
              <div
                className="flex items-center justify-center size-8.5 rounded-lg cursor-pointer hover:bg-secondary dark:hover:bg-neutral-800 transition-all active:scale-95"
                onClick={toggleSidebar}
              >
                <BrainCircuit className="size-5.5 text-blue-600 dark:text-blue-400" />
              </div>

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

          {/* Current Conversation Title */}
          <HeaderTitle
            chat={activeChat}
            onRename={(newTitle) => {
              const clean = newTitle?.trim();
              if (activeChat && clean) updateChat({ id: activeChat.id || activeChat._id, updates: { title: clean } });
            }}
          />
        </div>

        {/* Share Action */}
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

export default ChatHeader;
