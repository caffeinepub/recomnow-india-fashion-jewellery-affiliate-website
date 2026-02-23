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
      setSession: (token: string, username: string) => {
        console.log('[useAuth] setSession called', {
          timestamp: new Date().toISOString(),
          username,
          tokenLength: token.length,
          tokenPreview: token.substring(0, 10) + '...',
        });
        set({ 
          sessionToken: token, 
          username, 
          isAuthenticated: true,
          loginTimestamp: Date.now()
        });
        console.log('[useAuth] Session set successfully', {
          isAuthenticated: true,
          loginTimestamp: Date.now(),
        });
      },
      clearSession: () => {
        console.log('[useAuth] clearSession called', {
          timestamp: new Date().toISOString(),
          previousUsername: get().username,
        });
        set({ 
          sessionToken: null, 
          username: null, 
          isAuthenticated: false,
          loginTimestamp: null
        });
        console.log('[useAuth] Session cleared successfully');
      },
      isSessionExpired: () => {
        const { loginTimestamp } = get();
        if (!loginTimestamp) {
          console.log('[useAuth] isSessionExpired: No login timestamp found');
          return true;
        }
        const expired = Date.now() - loginTimestamp > SESSION_DURATION;
        console.log('[useAuth] isSessionExpired check', {
          loginTimestamp,
          currentTime: Date.now(),
          timeSinceLogin: Date.now() - loginTimestamp,
          sessionDuration: SESSION_DURATION,
          expired,
        });
        return expired;
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
    console.log('[useAuth] Session expired, clearing...');
    clearSession();
  }

  const currentState = {
    sessionToken,
    username,
    isAuthenticated: isAuthenticated && !isSessionExpired(),
    setSession,
    clearSession,
  };

  console.log('[useAuth] Current auth state', {
    hasSessionToken: !!sessionToken,
    tokenLength: sessionToken?.length,
    username,
    isAuthenticated: currentState.isAuthenticated,
  });

  return currentState;
}
