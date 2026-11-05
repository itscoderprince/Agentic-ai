import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "@/utils/firebase";
import api from "@/utils/axios";

export const useAuthStore = create(
  devtools(
    (set) => ({
      user: null,
      isLoading: true,
      error: null,

      // Check existing session on load
      checkAuth: async () => {
        try {
          const { data } = await api.get("/auth/me");
          set({ user: data.user, isLoading: false }, false, "checkAuth/success");
        } catch {
          set({ user: null, isLoading: false }, false, "checkAuth/fail");
        }
      },

      // Google Sign In
      loginWithGoogle: async () => {
        set({ isLoading: true, error: null }, false, "login/pending");
        try {
          const { user: firebaseUser } = await signInWithPopup(auth, googleProvider);
          const token = await firebaseUser.getIdToken();
          const { data } = await api.post("/auth/login", { token });

          set({ user: data.user, isLoading: false }, false, "login/success");
        } catch (err) {
          if (err.code === "auth/popup-closed-by-user") {
            set({ isLoading: false }, false, "login/cancelled");
            return;
          }
          set(
            {
              error: err.response?.data?.message || err.message || "Failed to sign in",
              isLoading: false,
            },
            false,
            "login/error"
          );
        }
      },

      // Logout
      logout: async () => {
        try {
          await api.post("/auth/logout");
          await signOut(auth);
        } finally {
          set({ user: null }, false, "logout/success");
        }
      },
    }),
    { name: "AuthStore", enabled: true }
  )
);
