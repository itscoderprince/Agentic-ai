import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ChatHeader } from "@/components/chat-header";
import { ChatMessages } from "@/components/chat-messages";
import { ChatInput } from "@/components/chat-input";
import { useChatNavigation } from "@/hooks/use-chat-navigation";

export default function ChatPage() {
  useChatNavigation();

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
