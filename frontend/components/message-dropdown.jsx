"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuAction, useSidebar } from "@/components/ui/sidebar";
import {
  MoreHorizontalIcon,
  PinIcon,
  PinOffIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import { cn } from "cn";

export function MessageDropdown({
  onPin,
  onRename,
  onDelete,
  isPinned = false,
  className,
}) {
  const { isMobile } = useSidebar();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <SidebarMenuAction
            showOnHover
            className={cn(
              "top-1/2! -translate-y-1/2! peer-data-[size=default]/menu-button:top-1/2! right-2! size-6! rounded-full! flex! items-center! justify-center! p-0!",
              "bg-transparent hover:bg-muted/90 dark:hover:bg-neutral-700/80 aria-expanded:bg-muted/90 dark:aria-expanded:bg-neutral-700/80",
              "text-muted-foreground hover:text-foreground aria-expanded:text-foreground",
              "transition-all duration-150 peer-data-active/menu-button:opacity-100 aria-expanded:opacity-100",
              className
            )}
          />
        }
      >
        <MoreHorizontalIcon className="size-3.5" />
        <span className="sr-only">More options</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-40 rounded-lg"
        side={isMobile ? "bottom" : "right"}
        align={isMobile ? "end" : "start"}
        sideOffset={4}
      >
        <DropdownMenuItem
          className="cursor-pointer gap-2"
          onClick={(e) => {
            e.stopPropagation();
            onPin?.();
          }}
        >
          {isPinned ? (
            <PinOffIcon className="size-4" />
          ) : (
            <PinIcon className="size-4" />
          )}
          <span>{isPinned ? "Unpin" : "Pin"}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer gap-2"
          onClick={(e) => {
            e.stopPropagation();
            onRename?.();
          }}
        >
          <PencilIcon className="size-4" />
          <span>Rename</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          className="cursor-pointer gap-2"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
        >
          <Trash2Icon className="size-4" />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default MessageDropdown;
