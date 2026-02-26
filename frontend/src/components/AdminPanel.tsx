import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useAuth } from '../hooks/useAuth';
import { useLogoutUser } from '../hooks/useBackendAuth';
import { useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import ProductManagement from './admin/ProductManagement';
import BlogManagement from './admin/BlogManagement';
import NewsletterManagement from './admin/NewsletterManagement';
import SitePagesManagement from './admin/SitePagesManagement';

export default function AdminPanel() {
  const { identity, clear: clearII } = useInternetIdentity();
  const { username, clearSession } = useAuth();
  const logoutMutation = useLogoutUser();
  const queryClient = useQueryClient();

  const displayName = username || (identity ? identity.getPrincipal().toString().slice(0, 12) + '…' : 'Admin');

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch {
      // Force logout even on error
      clearSession();
      queryClient.clear();
    }
    if (identity) {
      try { await clearII(); } catch { /* ignore */ }
    }
  };

  return (
    <div className="min-h-screen bg-navy-50">
      {/* Top bar */}
      <div className="bg-navy-900 text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-xl">🛡️</span>
          <div>
            <h1 className="font-bold text-lg leading-tight">Admin Panel</h1>
            <p className="text-navy-300 text-xs">Welcome, {displayName}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="px-4 py-2 bg-navy-700 hover:bg-navy-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {logoutMutation.isPending ? 'Logging out…' : 'Logout'}
        </button>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="products">
          <TabsList className="mb-6 bg-white border border-navy-100 shadow-sm">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
            <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
            <TabsTrigger value="pages">Site Pages</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <ProductManagement />
          </TabsContent>
          <TabsContent value="blog">
            <BlogManagement />
          </TabsContent>
          <TabsContent value="newsletter">
            <NewsletterManagement />
          </TabsContent>
          <TabsContent value="pages">
            <SitePagesManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
