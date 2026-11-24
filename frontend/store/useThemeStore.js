import { create } from "zustand";
import { devtools } from "zustand/middleware";

const getInitialTheme = () => {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem("theme");
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

// Apply theme to <html> immediately
if (typeof window !== "undefined") {
  const initial = getInitialTheme();
  document.documentElement.classList.toggle("dark", initial === "dark");
}

export const useThemeStore = create(
  devtools(
    (set) => ({
      theme: getInitialTheme(),

      toggleTheme: () => {
        set(
          (state) => {
            const nextTheme = state.theme === "dark" ? "light" : "dark";
            localStorage.setItem("theme", nextTheme);
            document.documentElement.classList.toggle("dark", nextTheme === "dark");
            return { theme: nextTheme };
          },
          false,
          "theme/toggleTheme"
        );
      },

      setTheme: (theme) => {
        localStorage.setItem("theme", theme);
        document.documentElement.classList.toggle("dark", theme === "dark");
        set({ theme }, false, "theme/setTheme");
      },
    }),
    { name: "AgenticAI", store: "theme", enabled: true }
  )
);

export default useThemeStore;
