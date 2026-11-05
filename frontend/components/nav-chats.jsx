"use client";

import * as React from "react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { MessageDropdown } from "@/components/message-dropdown";
import { PinIcon } from "lucide-react";

export function NavChats({
  chats = [],
  activeId,
  onSelectChat,
  onPin,
  onRename,
  onDelete,
  label = "Recent",
}) {
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

  return (
    <SidebarGroup>
      {label && (
        <SidebarGroupLabel className="px-3 mb-1 text-xs">
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarMenu className="gap-1">
        {chats.map((chat) => {
          const isActive = activeId ? chat.id === activeId : chat.isActive;
          return (
            <SidebarMenuItem key={chat.id}>
              <SidebarMenuButton
                isActive={isActive}
                tooltip={chat.title}
                onClick={() => onSelectChat?.(chat)}
                className="h-9 px-3 py-2 pr-9 cursor-pointer justify-start rounded-lg text-sm group-hover/menu-item:bg-sidebar-accent group-hover/menu-item:text-sidebar-accent-foreground group-has-[[aria-expanded=true]]/menu-item:bg-sidebar-accent group-has-[[aria-expanded=true]]/menu-item:text-sidebar-accent-foreground"
              >
                {chat.isPinned && (
                  <PinIcon className="size-3.5 text-muted-foreground shrink-0" />
                )}
                <span className="truncate">{chat.title}</span>
              </SidebarMenuButton>
              <MessageDropdown
                isPinned={chat.isPinned}
                onPin={() => onPin?.(chat)}
                onRename={() => onRename?.(chat)}
                onDelete={() => onDelete?.(chat)}
              />
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

export default NavChats;

