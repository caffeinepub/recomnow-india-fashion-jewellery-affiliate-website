import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  sessionToken: string | null;
  username: string | null;
  isAuthenticated: boolean;
  loginTimestamp: number | null;
  setSession: (token: string, username: string) => void;
  clearSession: () => void;
  isSessionExpired: () => boolean;
}

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      sessionToken: null,
      username: null,
      isAuthenticated: false,
      loginTimestamp: null,
      setSession: (token: string, username: string) => 
        set({ 
          sessionToken: token, 
          username, 
          isAuthenticated: true,
          loginTimestamp: Date.now()
        }),
      clearSession: () => 
        set({ 
          sessionToken: null, 
          username: null, 
          isAuthenticated: false,
          loginTimestamp: null
        }),
      isSessionExpired: () => {
        const { loginTimestamp } = get();
        if (!loginTimestamp) return true;
        return Date.now() - loginTimestamp > SESSION_DURATION;
      },
    }),
    {
      name: 'recomnow-auth',
    }
  )
);

export function useAuth() {
  const { 
    sessionToken, 
    username, 
    isAuthenticated, 
    setSession, 
    clearSession,
    isSessionExpired 
  } = useAuthStore();

  // Check if session is expired on access
  if (isAuthenticated && isSessionExpired()) {
    clearSession();
  }

  return {
    sessionToken,
    username,
    isAuthenticated: isAuthenticated && !isSessionExpired(),
    setSession,
    clearSession,
  };
}
