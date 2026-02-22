import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  sessionToken: string | null;
  isAuthenticated: boolean;
  setSession: (token: string) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      sessionToken: null,
      isAuthenticated: false,
      setSession: (token: string) => set({ sessionToken: token, isAuthenticated: true }),
      clearSession: () => set({ sessionToken: null, isAuthenticated: false }),
    }),
    {
      name: 'recomnow-auth',
    }
  )
);

export function useAuth() {
  const { sessionToken, isAuthenticated, setSession, clearSession } = useAuthStore();

  const login = async (username: string, password: string) => {
    // Custom authentication removed - using Internet Identity instead
    throw new Error('Custom authentication not available. Please use Internet Identity.');
  };

  const logout = async () => {
    clearSession();
  };

  return {
    sessionToken,
    isAuthenticated,
    isLoggingIn: false,
    loginError: null,
    login,
    logout,
  };
}
