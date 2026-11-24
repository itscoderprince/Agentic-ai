"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import { cn } from "cn";

export function MessageDropdown({
  onRename,
  onDelete,
  className,
}) {
  const { isMobile } = useSidebar();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "size-6 rounded-md p-0 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-neutral-800 transition-all cursor-pointer opacity-0 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100",
              className
            )}
          />
        }
      >
        <MoreHorizontalIcon className="size-3.5" />
        <span className="sr-only">More options</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-36 rounded-lg"
        side={isMobile ? "bottom" : "right"}
        align={isMobile ? "end" : "start"}
        sideOffset={4}
      >
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
