import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { toast } from 'sonner';
import type { ProductInput, ProductCategory } from '../backend';

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

export function useGetFashionProducts() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['fashionProducts'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getFashionProducts();
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
        console.error(`Error fetching products for category ${category}:`, error);
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

export function useAddProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productInput: ProductInput) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.addProduct(productInput);
      } catch (error) {
        console.error('Error adding product:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['fashionProducts'] });
      toast.success('Product added successfully!');
    },
    onError: (error: any) => {
      console.error('Add product mutation error:', error);
      toast.error(error?.message || 'Failed to add product');
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...productInput }: ProductInput & { id: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.updateProduct(id, productInput);
      } catch (error) {
        console.error('Error updating product:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['fashionProducts'] });
      toast.success('Product updated successfully!');
    },
    onError: (error: any) => {
      console.error('Update product mutation error:', error);
      toast.error(error?.message || 'Failed to update product');
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.deleteProduct(id);
      } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['fashionProducts'] });
      toast.success('Product deleted successfully!');
    },
    onError: (error: any) => {
      console.error('Delete product mutation error:', error);
      toast.error(error?.message || 'Failed to delete product');
    },
  });
}

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: { name: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile saved successfully!');
    },
    onError: (error: any) => {
      console.error('Save profile mutation error:', error);
      toast.error(error?.message || 'Failed to save profile');
    },
  });
}
