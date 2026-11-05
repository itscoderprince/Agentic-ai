"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/store/useAuthStore";
import { useThemeStore } from "@/store/useThemeStore";
import {
  SettingsIcon,
  LifeBuoyIcon,
  SparklesIcon,
  LogOutIcon,
  ChevronRightIcon,
  MoonIcon,
  SunIcon,
} from "lucide-react";

export function NavUser() {
  const { isMobile } = useSidebar();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const isDark = theme === "dark";

  if (!user) return null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="h-11 rounded-xl px-2.5 cursor-pointer aria-expanded:bg-sidebar-accent"
              />
            }
          >
            <Avatar className="size-8 rounded-full">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="rounded-full font-medium">
                {user.name?.slice(0, 2).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <span className="truncate font-medium text-sm text-foreground">
              {user.name}
            </span>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-56 rounded-2xl p-1.5 shadow-lg"
            side={isMobile ? "bottom" : "top"}
            align="start"
            sideOffset={8}
          >
            {/* Header: User Email */}
            <div className="px-2.5 py-1.5 text-xs text-muted-foreground truncate select-none">
              {user.email}
            </div>

            <DropdownMenuGroup className="space-y-0.5">
              <DropdownMenuItem className="cursor-pointer gap-2.5 py-2 px-2.5 rounded-lg text-sm">
                <SettingsIcon className="size-4" />
                <span>Settings</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="cursor-pointer gap-2.5 py-2 px-2.5 rounded-lg text-sm">
                <LifeBuoyIcon className="size-4" />
                <span>Help</span>
                <ChevronRightIcon className="ml-auto size-4 text-muted-foreground" />
              </DropdownMenuItem>

              <DropdownMenuItem className="cursor-pointer gap-2.5 py-2 px-2.5 rounded-lg text-sm">
                <SparklesIcon className="size-4" />
                <span>Upgrade plan</span>
              </DropdownMenuItem>

              {/* Dark mode switch item */}
              <DropdownMenuItem
                closeOnClick={false}
                onClick={toggleTheme}
                className="cursor-pointer justify-between py-2 px-2.5 rounded-lg text-sm select-none"
              >
                <div className="flex items-center gap-2.5">
                  {isDark ? (
                    <MoonIcon className="size-4" />
                  ) : (
                    <SunIcon className="size-4" />
                  )}
                  <span>Dark mode</span>
                </div>
                <Switch checked={isDark} className="pointer-events-none" />
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator className="my-1" />

            <DropdownMenuItem
              onClick={logout}
              className="cursor-pointer gap-2.5 py-2 px-2.5 rounded-lg text-sm"
            >
              <LogOutIcon className="size-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export default NavUser;
