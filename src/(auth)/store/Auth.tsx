import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "../types/user";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

let hydrationPromise: Promise<void> | null = null;

export const awaitAuthRehydration = () => {
  if (hydrationPromise) {
    return hydrationPromise;
  }
  hydrationPromise = new Promise((resolve) => {
    const { onFinishHydration } = useAuthStore.persist;

    if (useAuthStore.persist.hasHydrated()) {
      resolve();
    } else {
      const unsub = onFinishHydration(() => {
        resolve();
        unsub();
      });
    }
  });
  return hydrationPromise;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: true,

      login: (user, token) => {
        set({ user, token });
      },

      logout: () => {
        set({ user: null, token: null });
      },
    }),
    {
      name: "auth-storage",

      storage: createJSONStorage(() => localStorage),

      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),

      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoading = false;
        }
      },
    }
  )
);
