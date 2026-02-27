import React, { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useAuth } from '../hooks/useAuth';
import { useLogoutUser } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import ProductManagement from './admin/ProductManagement';
import BlogManagement from './admin/BlogManagement';
import NewsletterManagement from './admin/NewsletterManagement';
import SitePagesManagement from './admin/SitePagesManagement';
import { Button } from './ui/button';
import { LogOut, Package, FileText, Mail, Layout } from 'lucide-react';

type AdminTab = 'products' | 'blog' | 'newsletter' | 'sitepages';

const TABS: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
  { id: 'products', label: 'Products', icon: <Package className="w-4 h-4" /> },
  { id: 'blog', label: 'Blog', icon: <FileText className="w-4 h-4" /> },
  { id: 'newsletter', label: 'Newsletter', icon: <Mail className="w-4 h-4" /> },
  { id: 'sitepages', label: 'Site Pages', icon: <Layout className="w-4 h-4" /> },
];

export default function AdminPanel() {
  const { clear: iiClear, identity } = useInternetIdentity();
  const { clearSession, sessionToken } = useAuth();
  const logoutMutation = useLogoutUser();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<AdminTab>('products');

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync(sessionToken || undefined);
    } catch {
      // ignore backend errors on logout
    }
    clearSession();
    if (identity) {
      await iiClear();
    }
    queryClient.clear();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/assets/generated/recomnow-logo.dim_200x200.png"
              alt="RecomNow"
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="font-bold text-foreground text-lg">Admin Panel</span>
          </div>
          <Button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="bg-pink-hot hover:bg-pink-hot-dark text-white gap-2"
            size="sm"
          >
            <LogOut className="w-4 h-4" />
            {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tab navigation */}
        <nav className="flex gap-1 mb-6 bg-muted rounded-lg p-1 w-fit">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-pink-hot text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Tab content */}
        <main>
          {activeTab === 'products' && <ProductManagement />}
          {activeTab === 'blog' && <BlogManagement />}
          {activeTab === 'newsletter' && <NewsletterManagement />}
          {activeTab === 'sitepages' && <SitePagesManagement />}
        </main>
      </div>
    </div>
  );
}
