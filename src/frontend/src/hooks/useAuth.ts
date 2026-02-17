import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useActor } from './useActor';
import { useState, useEffect } from 'react';

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
  const { actor } = useActor();
  const { sessionToken, isAuthenticated, setSession, clearSession } = useAuthStore();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Verify session on mount if we have a token
  useEffect(() => {
    if (sessionToken && actor) {
      actor.checkAuth(sessionToken).then((isValid) => {
        if (!isValid) {
          clearSession();
        }
      }).catch(() => {
        clearSession();
      });
    }
  }, [actor, sessionToken, clearSession]);

  const login = async (username: string, password: string) => {
    if (!actor) {
      throw new Error('Actor not available');
    }

    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const token = await actor.login(username, password);
      setSession(token);
      return token;
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed';
      setLoginError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = async () => {
    if (!actor || !sessionToken) {
      clearSession();
      return;
    }

    try {
      await actor.logout(sessionToken);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearSession();
    }
  };

  return {
    sessionToken,
    isAuthenticated,
    isLoggingIn,
    loginError,
    login,
    logout,
  };
}
