import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message;
    // Extract the actual error message from IC trap messages
    const trapMatch = msg.match(/Canister trapped explicitly: (.+)/);
    if (trapMatch) return trapMatch[1];
    const rejectMatch = msg.match(/Call was rejected.*Reject message: (.+)/s);
    if (rejectMatch) return rejectMatch[1].trim();
    return msg;
  }
  return String(error);
}

export function useRegisterUser() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addUser(username, password);
    },
    onError: (error) => {
      const msg = extractErrorMessage(error);
      toast.error(`Registration failed: ${msg}`);
    },
  });
}

export function useLoginUser() {
  const { actor } = useActor();
  const { setSession } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      if (!actor) throw new Error('Actor not available');
      const token = await actor.authenticateUser(username, password);
      if (!token) throw new Error('Invalid username or password');
      return { token, username };
    },
    onSuccess: ({ token, username }) => {
      setSession(token, username);
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
    onError: (error) => {
      const msg = extractErrorMessage(error);
      toast.error(`Login failed: ${msg}`);
    },
  });
}

export function useLogoutUser() {
  const { actor } = useActor();
  const { sessionToken, clearSession } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (actor && sessionToken) {
        try {
          await actor.logout(sessionToken);
        } catch {
          // Ignore logout errors - clear local session regardless
        }
      }
      clearSession();
    },
    onSuccess: () => {
      queryClient.clear();
    },
    onError: () => {
      // Still clear local session even if backend call fails
      clearSession();
      queryClient.clear();
    },
  });
}
