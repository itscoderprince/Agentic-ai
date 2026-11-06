"use client";

import { useEffect } from "react";
import { MessageSquareIcon, SettingsIcon } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useChatStore } from "@/store/useChatStore";

export function SearchDialog({ open, onOpenChange }) {
  const chats = useChatStore((s) => s.chats);
  const selectChat = useChatStore((s) => s.selectChat);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange?.((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onOpenChange]);

  const handleSelect = (id) => {
    selectChat(id);
    onOpenChange?.(false);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      className="sm:max-w-xl"
    >
      <Command>
        <CommandInput placeholder="Search conversations..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {chats.length > 0 && (
            <CommandGroup heading="Conversations">
              {chats.map((chat) => (
                <CommandItem
                  key={chat.id}
                  value={chat.title}
                  onSelect={() => handleSelect(chat.id)}
                  className="cursor-pointer gap-2"
                >
                  <MessageSquareIcon className="size-4 text-muted-foreground" />
                  <span className="truncate">{chat.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          <CommandGroup heading="Quick Actions">
            <CommandItem className="cursor-pointer gap-2">
              <SettingsIcon className="size-4 text-muted-foreground" />
              <span>Settings</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}

export default SearchDialog;
