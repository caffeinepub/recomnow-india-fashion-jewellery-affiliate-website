import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useAuth } from './useAuth';
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
  const { sessionToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productInput: ProductInput) => {
      if (!actor) throw new Error('Actor not available');
      if (!sessionToken) throw new Error('Not authenticated');
      try {
        return await actor.addProduct(sessionToken, productInput);
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
  const { sessionToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...productInput }: ProductInput & { id: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      if (!sessionToken) throw new Error('Not authenticated');
      try {
        return await actor.updateProduct(sessionToken, id, productInput);
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
  const { sessionToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      if (!sessionToken) throw new Error('Not authenticated');
      try {
        await actor.deleteProduct(sessionToken, id);
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

// Blog Post Queries
export function useGetBlogPosts() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['blogPosts'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getBlogPosts();
      } catch (error) {
        console.error('Error fetching blog posts:', error);
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_CACHE_TIME,
    retry: 2,
  });
}

export function useGetFeaturedBlogPosts() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['featuredBlogPosts'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getFeaturedBlogPosts();
      } catch (error) {
        console.error('Error fetching featured blog posts:', error);
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_CACHE_TIME,
    retry: 2,
  });
}

export function useGetBlogPostById(id: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['blogPost', id.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getBlogPostById(id);
      } catch (error) {
        console.error('Error fetching blog post:', error);
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_CACHE_TIME,
    retry: 2,
  });
}

export function useAddBlogPost() {
  const { actor } = useActor();
  const { sessionToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      content,
      author,
      isFeatured,
    }: {
      title: string;
      content: string;
      author: string;
      isFeatured: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      if (!sessionToken) throw new Error('Not authenticated');
      try {
        return await actor.addBlogPost(sessionToken, title, content, author, isFeatured);
      } catch (error) {
        console.error('Error adding blog post:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
      queryClient.invalidateQueries({ queryKey: ['featuredBlogPosts'] });
      toast.success('Blog post added successfully!');
    },
    onError: (error: any) => {
      console.error('Add blog post mutation error:', error);
      toast.error(error?.message || 'Failed to add blog post');
    },
  });
}

export function useUpdateBlogPost() {
  const { actor } = useActor();
  const { sessionToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      title,
      content,
      author,
      isFeatured,
    }: {
      id: bigint;
      title: string;
      content: string;
      author: string;
      isFeatured: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      if (!sessionToken) throw new Error('Not authenticated');
      try {
        return await actor.updateBlogPost(sessionToken, id, title, content, author, isFeatured);
      } catch (error) {
        console.error('Error updating blog post:', error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
      queryClient.invalidateQueries({ queryKey: ['featuredBlogPosts'] });
      queryClient.invalidateQueries({ queryKey: ['blogPost', variables.id.toString()] });
      toast.success('Blog post updated successfully!');
    },
    onError: (error: any) => {
      console.error('Update blog post mutation error:', error);
      toast.error(error?.message || 'Failed to update blog post');
    },
  });
}

export function useDeleteBlogPost() {
  const { actor } = useActor();
  const { sessionToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      if (!sessionToken) throw new Error('Not authenticated');
      try {
        await actor.deleteBlogPost(sessionToken, id);
      } catch (error) {
        console.error('Error deleting blog post:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
      queryClient.invalidateQueries({ queryKey: ['featuredBlogPosts'] });
      toast.success('Blog post deleted successfully!');
    },
    onError: (error: any) => {
      console.error('Delete blog post mutation error:', error);
      toast.error(error?.message || 'Failed to delete blog post');
    },
  });
}

// Newsletter Queries
export function useSubscribeNewsletter() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (email: string) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.subscribeNewsletter(email);
      } catch (error) {
        console.error('Error subscribing to newsletter:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('Successfully subscribed to newsletter!');
    },
    onError: (error: any) => {
      console.error('Subscribe newsletter mutation error:', error);
      toast.error(error?.message || 'Failed to subscribe to newsletter');
    },
  });
}

export function useGetNewsletterSignups() {
  const { actor, isFetching } = useActor();
  const { sessionToken } = useAuth();

  return useQuery({
    queryKey: ['newsletterSignups'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      if (!sessionToken) throw new Error('Not authenticated');
      try {
        return await actor.getNewsletterSignups(sessionToken);
      } catch (error) {
        console.error('Error fetching newsletter signups:', error);
        throw error;
      }
    },
    enabled: !!actor && !isFetching && !!sessionToken,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_CACHE_TIME,
    retry: 2,
  });
}

// Site Pages Queries
export function useGetPage(pageKey: string) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['page', pageKey],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getPage(pageKey);
      } catch (error) {
        console.error(`Error fetching page ${pageKey}:`, error);
        return null;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_CACHE_TIME,
    retry: 1,
  });
}

export function useGetAllPages() {
  const { actor, isFetching } = useActor();
  const { sessionToken } = useAuth();

  return useQuery({
    queryKey: ['allPages'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      if (!sessionToken) throw new Error('Not authenticated');
      try {
        return await actor.getAllPages(sessionToken);
      } catch (error) {
        console.error('Error fetching all pages:', error);
        throw error;
      }
    },
    enabled: !!actor && !isFetching && !!sessionToken,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_CACHE_TIME,
    retry: 2,
  });
}

export function useBulkUpdatePages() {
  const { actor } = useActor();
  const { sessionToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pages: Array<[string, string, string]>) => {
      if (!actor) throw new Error('Actor not available');
      if (!sessionToken) throw new Error('Not authenticated');
      try {
        await actor.bulkUpdatePages(sessionToken, pages);
      } catch (error) {
        console.error('Error updating pages:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page'] });
      queryClient.invalidateQueries({ queryKey: ['allPages'] });
      toast.success('Pages updated successfully!');
    },
    onError: (error: any) => {
      console.error('Bulk update pages mutation error:', error);
      toast.error(error?.message || 'Failed to update pages');
    },
  });
}

// Sitemap Query
export function useGetSitemap() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['sitemap'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getSitemap();
      } catch (error) {
        console.error('Error fetching sitemap:', error);
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_CACHE_TIME,
    retry: 2,
  });
}

// Robots.txt Query
export function useGetRobotsTxt() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['robotsTxt'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getRobotsTxt();
      } catch (error) {
        console.error('Error fetching robots.txt:', error);
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_CACHE_TIME,
    retry: 2,
  });
}
