import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  sessionToken: string | null;
  username: string | null;
  expiresAt: number | null;
  setSession: (token: string, username: string) => void;
  clearSession: () => void;
  isSessionValid: () => boolean;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      sessionToken: null,
      username: null,
      expiresAt: null,

      setSession: (token: string, username: string) => {
        const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        set({ sessionToken: token, username, expiresAt });
      },

      clearSession: () => {
        set({ sessionToken: null, username: null, expiresAt: null });
      },

      isSessionValid: () => {
        const { sessionToken, expiresAt } = get();
        if (!sessionToken || !expiresAt) return false;
        return Date.now() < expiresAt;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
