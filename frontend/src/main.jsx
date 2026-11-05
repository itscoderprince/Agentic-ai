import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import { useThemeStore } from "@/store/useThemeStore";

// Expose store in browser console during development
if (import.meta.env.DEV) {
  window.useAuthStore = useAuthStore;
  window.useChatStore = useChatStore;
  window.useThemeStore = useThemeStore;
}

createRoot(document.getElementById("root")).render(
  <TooltipProvider>
    <App />
  </TooltipProvider>,
);
