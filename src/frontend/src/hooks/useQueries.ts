import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { toast } from 'sonner';
import type { ProductInput, ProductCategory, FashionCategory } from '../backend';

// Optimized stale time and cache time for better performance
const DEFAULT_STALE_TIME = 5 * 60 * 1000; // 5 minutes
const DEFAULT_CACHE_TIME = 10 * 60 * 1000; // 10 minutes

// Admin Check Query
export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.isCallerAdmin();
      } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_CACHE_TIME,
    retry: 1,
  });
}

// Product Queries
export function useGetProducts() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getAllProducts();
      } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_CACHE_TIME,
    retry: 2,
  });
}

export function useGetAllProducts() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['allProducts'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getAllProducts();
      } catch (error) {
        console.error('Error fetching all products:', error);
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_CACHE_TIME,
    retry: 2,
  });
}

export function useGetFashionProducts(category?: FashionCategory) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: category ? ['fashionProducts', category] : ['fashionProducts'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        if (category) {
          return await actor.getFashionProducts(category);
        }
        // Get all products and filter fashion ones
        const allProducts = await actor.getAllProducts();
        return allProducts.filter(p => p.category.__kind__ === 'fashion');
      } catch (error) {
        console.error('Error fetching fashion products:', error);
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_CACHE_TIME,
    retry: 2,
  });
}

export function useGetProductsByCategory(category: ProductCategory) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['products', 'category', category],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getProductsByCategory(category);
      } catch (error) {
        console.error(`Error fetching products for category:`, error);
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_CACHE_TIME,
    retry: 2,
  });
}

export function useFilterProducts(
  category: ProductCategory | null,
  minPrice: bigint | null,
  maxPrice: bigint | null
) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['products', 'filter', category, minPrice?.toString(), maxPrice?.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.filterProducts(category, minPrice, maxPrice, null, null);
      } catch (error) {
        console.error('Error filtering products:', error);
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_CACHE_TIME,
    retry: 2,
  });
}

// Helper function to extract and format error details
function extractErrorDetails(error: any): { message: string; isAuthError: boolean; fullError: any } {
  console.group('🔍 ERROR DETAILS EXTRACTION');
  console.log('Raw error object:', error);
  console.log('Error type:', typeof error);
  console.log('Error constructor:', error?.constructor?.name);
  console.log('Error keys:', error ? Object.keys(error) : 'null');
  
  let message = 'An unknown error occurred';
  let isAuthError = false;

  // Check various error formats
  if (error?.message) {
    message = error.message;
    console.log('Error message found:', message);
  } else if (typeof error === 'string') {
    message = error;
    console.log('Error is string:', message);
  } else if (error?.toString && typeof error.toString === 'function') {
    message = error.toString();
    console.log('Error toString():', message);
  }

  // Check if it's an authorization error
  const authKeywords = ['unauthorized', 'permission', 'admin', 'access denied', 'forbidden'];
  const lowerMessage = message.toLowerCase();
  isAuthError = authKeywords.some(keyword => lowerMessage.includes(keyword));
  
  console.log('Is authorization error:', isAuthError);
  console.log('Final extracted message:', message);
  console.groupEnd();

  return { message, isAuthError, fullError: error };
}

// Product Mutations
export function useAddProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ProductInput) => {
      console.group('🚀 ADD PRODUCT MUTATION');
      console.log('Timestamp:', new Date().toISOString());
      console.log('Product Input:', {
        title: input.title,
        category: input.category,
        price: input.price.toString(),
        mrp: input.mrp.toString(),
        discountPercentage: input.discountPercentage.toString(),
        isFeatured: input.isFeatured,
      });

      if (!actor) {
        console.error('❌ Actor not available');
        console.groupEnd();
        throw new Error('Actor not available');
      }

      console.log('✅ Actor available, calling actor.addProduct...');

      try {
        const result = await actor.addProduct(input);
        console.log('✅ actor.addProduct succeeded');
        console.log('Result:', result.toString());
        console.groupEnd();
        return result;
      } catch (error: any) {
        console.error('❌ actor.addProduct FAILED');
        console.error('Error object:', error);
        console.error('Error message:', error?.message);
        console.error('Error type:', typeof error);
        console.error('Error stack:', error?.stack);
        
        // Try to extract more details
        if (error?.reject_message) {
          console.error('Reject message:', error.reject_message);
        }
        if (error?.reject_code) {
          console.error('Reject code:', error.reject_code);
        }
        
        console.groupEnd();
        throw error;
      }
    },
    onSuccess: () => {
      console.log('✅ [useAddProduct] Mutation onSuccess callback');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['allProducts'] });
      queryClient.invalidateQueries({ queryKey: ['fashionProducts'] });
      toast.success('Product added successfully!');
    },
    onError: (error: any) => {
      console.group('❌ ADD PRODUCT ERROR HANDLER');
      console.log('Timestamp:', new Date().toISOString());
      
      const { message, isAuthError, fullError } = extractErrorDetails(error);
      
      console.log('Processed error details:', {
        message,
        isAuthError,
        fullError,
      });

      if (isAuthError) {
        console.error('🔒 AUTHORIZATION ERROR DETECTED');
        console.error('This is an authorization/permission error');
        toast.error(`Authorization Error: ${message}`);
      } else {
        console.error('⚠️ GENERAL ERROR');
        toast.error(`Error: ${message}`);
      }
      
      console.groupEnd();
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: ProductInput & { id: bigint }) => {
      console.group('🔄 UPDATE PRODUCT MUTATION');
      console.log('Timestamp:', new Date().toISOString());
      console.log('Product ID:', id.toString());
      console.log('Product Input:', input);

      if (!actor) {
        console.error('❌ Actor not available');
        console.groupEnd();
        throw new Error('Actor not available');
      }

      try {
        const result = await actor.updateProduct(id, input);
        console.log('✅ actor.updateProduct succeeded');
        console.groupEnd();
        return result;
      } catch (error: any) {
        console.error('❌ actor.updateProduct FAILED');
        console.error('Error:', error);
        console.groupEnd();
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['allProducts'] });
      queryClient.invalidateQueries({ queryKey: ['fashionProducts'] });
      toast.success('Product updated successfully!');
    },
    onError: (error: any) => {
      console.group('❌ UPDATE PRODUCT ERROR HANDLER');
      const { message, isAuthError } = extractErrorDetails(error);
      
      if (isAuthError) {
        console.error('🔒 AUTHORIZATION ERROR DETECTED');
        toast.error(`Authorization Error: ${message}`);
      } else {
        console.error('⚠️ GENERAL ERROR');
        toast.error(`Error: ${message}`);
      }
      
      console.groupEnd();
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      console.group('🗑️ DELETE PRODUCT MUTATION');
      console.log('Timestamp:', new Date().toISOString());
      console.log('Product ID:', id.toString());

      if (!actor) {
        console.error('❌ Actor not available');
        console.groupEnd();
        throw new Error('Actor not available');
      }

      try {
        const result = await actor.deleteProduct(id);
        console.log('✅ actor.deleteProduct succeeded');
        console.groupEnd();
        return result;
      } catch (error: any) {
        console.error('❌ actor.deleteProduct FAILED');
        console.error('Error:', error);
        console.groupEnd();
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['allProducts'] });
      queryClient.invalidateQueries({ queryKey: ['fashionProducts'] });
      toast.success('Product deleted successfully!');
    },
    onError: (error: any) => {
      console.group('❌ DELETE PRODUCT ERROR HANDLER');
      const { message, isAuthError } = extractErrorDetails(error);
      
      if (isAuthError) {
        console.error('🔒 AUTHORIZATION ERROR DETECTED');
        toast.error(`Authorization Error: ${message}`);
      } else {
        console.error('⚠️ GENERAL ERROR');
        toast.error(`Error: ${message}`);
      }
      
      console.groupEnd();
    },
  });
}

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: { name: string }) => {
      if (!actor) throw new Error('Actor not available');
      return await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile saved successfully!');
    },
    onError: (error: any) => {
      console.error('Save profile error:', error);
      toast.error(error?.message || 'Failed to save profile. Please try again.');
    },
  });
}
