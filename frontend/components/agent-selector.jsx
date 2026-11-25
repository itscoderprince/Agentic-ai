import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useChatStore } from "@/store/useChatStore";
import { AGENTS } from "@/configs/agents";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "cn";

export function AgentSelector({ className }) {
  const selectedAgent = useChatStore((s) => s.selectedAgent || "auto");
  const setSelectedAgent = useChatStore((s) => s.setSelectedAgent);

  const currentAgent = AGENTS.find((a) => a.id === selectedAgent) || AGENTS[0];
  const ActiveIcon = currentAgent.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-[32px] px-2.5 rounded-full shrink-0 flex items-center gap-1.5 text-[12.5px] font-medium text-foreground/80 hover:text-foreground hover:bg-neutral-700/20 dark:hover:bg-neutral-800 transition-all border border-border/40 dark:border-white/[0.08]",
              className
            )}
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
  );
}

export default AgentSelector;
