import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import GoogleLoginCard from "@/components/ui/GoogleLoginCard";
import Page from "@/pages/ChatPage";

export default function App() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const checkAuth = useAuthStore((s) => s.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <GoogleLoginCard />;
  }

  return <Page />;
}
