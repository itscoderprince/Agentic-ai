"use client";

import * as React from "react";
import { NavChats } from "@/components/nav-chats";
import { NavUser } from "@/components/nav-user";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useChatStore } from "@/store/useChatStore";
import { BotIcon, Search, PlusCircle } from "lucide-react";

export function AppSidebar({ ...props }) {
  const { open, isMobile, openMobile } = useSidebar();
  const isOpen = isMobile ? openMobile : open;

  const chats = useChatStore((s) => s.chats);
  const activeId = useChatStore((s) => s.activeId);
  const selectChat = useChatStore((s) => s.selectChat);
  const newChat = useChatStore((s) => s.newChat);
  const pinChat = useChatStore((s) => s.pinChat);
  const renameChat = useChatStore((s) => s.renameChat);
  const deleteChat = useChatStore((s) => s.deleteChat);
  const setSearchOpen = useChatStore((s) => s.setSearchOpen);

  const handleRename = (chat) => {
    const nextTitle = window.prompt("Rename chat:", chat.title);
    if (nextTitle) renameChat(chat.id, nextTitle);
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 px-1">
              <BotIcon className="size-6 text-primary shrink-0" />
              <span className="font-bold text-[1.125rem] leading-none tracking-tight text-foreground select-none">
                Agentic AI
              </span>
            </div>
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                tooltip="Search (⌘K)"
                className="size-8 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer flex items-center justify-center p-0"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="size-4.5" />
                <span className="sr-only">Search</span>
              </Button>
              <SidebarTrigger className="size-8 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer flex items-center justify-center p-0 [&>svg]:size-4.5" />
            </div>
          </div>

          <Button
            variant="secondary"
            className="w-full justify-center items-center gap-2 rounded-full h-10 px-4 cursor-pointer font-medium text-sm transition-all shadow-xs active:scale-[0.99]"
            onClick={newChat}
          >
            <PlusCircle className="size-4.5" />
            <span>New chat</span>
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <NavChats
          chats={chats}
          activeId={activeId}
          onSelectChat={(chat) => selectChat(chat.id)}
          onPin={(chat) => pinChat(chat.id)}
          onRename={handleRename}
          onDelete={(chat) => deleteChat(chat.id)}
        />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
