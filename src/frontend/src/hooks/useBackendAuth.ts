import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useRegisterUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addUser(username, password);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Account created successfully!');
    },
    onError: (error: any) => {
      console.error('Registration error:', error);
      const errorMessage = error?.message || 'Failed to create account. Please try again.';
      
      if (errorMessage.includes('already exists')) {
        toast.error('Username already taken. Please choose a different username.');
      } else if (errorMessage.includes('Unauthorized')) {
        toast.error('Registration is currently restricted to administrators.');
      } else {
        toast.error(errorMessage);
      }
      throw error;
    },
  });
}

export function useAuthenticateUser() {
  const { actor } = useActor();
  const { setSession } = useAuth();

  return useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      if (!actor) throw new Error('Actor not available');
      const sessionToken = await actor.authenticateUser(username, password);
      
      if (!sessionToken) {
        throw new Error('Invalid credentials');
      }
      
      return { sessionToken, username };
    },
    onSuccess: ({ sessionToken, username }) => {
      setSession(sessionToken, username);
      toast.success(`Welcome back, ${username}!`);
    },
    onError: (error: any) => {
      console.error('Authentication error:', error);
      const errorMessage = error?.message || 'Login failed. Please try again.';
      
      if (errorMessage.includes('Invalid credentials')) {
        toast.error('Invalid username or password.');
      } else {
        toast.error(errorMessage);
      }
      throw error;
    },
  });
}

export function useLogout() {
  const { actor } = useActor();
  const { sessionToken, clearSession } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor || !sessionToken) return;
      await actor.logout(sessionToken);
    },
    onSuccess: () => {
      clearSession();
      queryClient.clear();
      toast.success('Logged out successfully');
    },
    onError: (error: any) => {
      console.error('Logout error:', error);
      // Clear session anyway on error
      clearSession();
      queryClient.clear();
    },
  });
}
