"use client";

import { useState } from "react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { MessageDropdown } from "@/components/message-dropdown";
import { PinIcon } from "lucide-react";
import { cn } from "cn";

export function NavChats({
  chats = [],
  activeId,
  onSelectChat,
  onPin,
  onRename,
  onDelete,
  label = "Recent",
}) {
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  if (!chats.length) {
    return (
      <SidebarGroup>
        {label && (
          <SidebarGroupLabel className="px-3 mb-1">
            {label}
          </SidebarGroupLabel>
        )}
        <div className="px-3 py-1 text-xs text-muted-foreground">
          No conversations yet
        </div>
      </SidebarGroup>
    );
  }

  const handleSaveEdit = (chat) => {
    const clean = editingTitle.trim();
    if (clean && clean !== chat.title) {
      onRename?.(chat, clean);
    }
    setEditingId(null);
  };

  return (
    <SidebarGroup>
      {label && (
        <SidebarGroupLabel className="px-3 mb-1 text-xs">
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarMenu className="gap-1">
        {chats.map((chat) => {
          const chatId = chat.id || chat._id;
          const isActive = activeId ? (activeId === chatId) : chat.isActive;
          const isEditing = editingId === chatId;

          // Inline editing state for sidebar item
          if (isEditing) {
            return (
              <SidebarMenuItem key={chatId} className="px-1.5 py-0.5">
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onBlur={() => handleSaveEdit(chat)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSaveEdit(chat);
                    } else if (e.key === "Escape") {
                      setEditingId(null);
                    }
                  }}
                  autoFocus
                  className="h-8 w-full rounded-md border border-blue-500 bg-background px-2.5 text-sm font-medium text-foreground outline-none shadow-xs"
                />
              </SidebarMenuItem>
            );
          }

          return (
            <SidebarMenuItem key={chatId} className="group/menu-item relative flex items-center">
              <SidebarMenuButton
                isActive={isActive}
                tooltip={chat.title}
                onClick={() => onSelectChat?.(chat)}
                className="h-9 px-3 py-2 pr-15 cursor-pointer justify-start rounded-lg text-sm group-hover/menu-item:bg-sidebar-accent group-hover/menu-item:text-sidebar-accent-foreground group-has-[[aria-expanded=true]]/menu-item:bg-sidebar-accent group-has-[[aria-expanded=true]]/menu-item:text-sidebar-accent-foreground"
              >
                <span className="truncate">{chat.title}</span>
              </SidebarMenuButton>

              {/* Action Buttons directly on the chat item (Image 2 reference) */}
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 z-10">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPin?.(chat);
                  }}
                  tooltip={chat.isPinned ? "Unpin chat" : "Pin chat"}
                  className={cn(
                    "size-6 rounded-md p-0 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-neutral-800 transition-all cursor-pointer",
                    chat.isPinned
                      ? "opacity-100 text-foreground"
                      : "opacity-0 group-hover/menu-item:opacity-100"
                  )}
                >
                  <PinIcon
                    className={cn(
                      "size-3.5 transition-transform",
                      chat.isPinned ? "fill-current text-primary" : ""
                    )}
                  />
                  <span className="sr-only">{chat.isPinned ? "Unpin" : "Pin"}</span>
                </Button>

                <MessageDropdown
                  onRename={() => {
                    setEditingId(chatId);
                    setEditingTitle(chat.title);
                  }}
                  onDelete={() => onDelete?.(chat)}
                />
              </div>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

export default NavChats;
