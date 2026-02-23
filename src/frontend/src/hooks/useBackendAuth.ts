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
      
      try {
        await actor.addUser(username, password);
      } catch (error: any) {
        // Extract the actual error message from the backend
        const errorMessage = error?.message || error?.toString() || 'Unknown error';
        console.error('Backend registration error:', errorMessage);
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Account created successfully! You can now log in.');
    },
    onError: (error: any) => {
      console.error('Registration error:', error);
      const errorMessage = error?.message || 'Failed to create account. Please try again.';
      
      // Handle specific error cases
      if (errorMessage.includes('already exists')) {
        toast.error('Username already taken. Please choose a different username.');
      } else if (errorMessage.includes('reserved')) {
        toast.error('This username is reserved. Please choose a different username.');
      } else {
        // Show the actual backend error message
        toast.error(`Registration failed: ${errorMessage}`);
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
      
      try {
        const sessionToken = await actor.authenticateUser(username, password);
        
        if (!sessionToken) {
          throw new Error('Invalid credentials');
        }
        
        return { sessionToken, username };
      } catch (error: any) {
        const errorMessage = error?.message || error?.toString() || 'Authentication failed';
        console.error('Backend authentication error:', errorMessage);
        throw new Error(errorMessage);
      }
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
        toast.error(`Login failed: ${errorMessage}`);
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
