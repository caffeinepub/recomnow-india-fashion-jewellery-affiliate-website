import { useState } from 'react';
import { X, Package, FileText, Users, LogOut, FileEdit } from 'lucide-react';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { useAuth } from '../hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import ProductManagement from './admin/ProductManagement';
import BlogManagement from './admin/BlogManagement';
import NewsletterManagement from './admin/NewsletterManagement';
import SitePagesManagement from './admin/SitePagesManagement';

interface AdminPanelProps {
  onClose: () => void;
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const { data: isAdmin, isLoading } = useIsCallerAdmin();
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'products' | 'blog' | 'newsletter' | 'pages'>('products');

  const handleLogout = async () => {
    await logout();
    queryClient.clear();
    onClose();
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="bg-card border border-border rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center space-y-4">
            <div className="text-4xl">🔒</div>
            <h2 className="text-2xl font-bold text-foreground">Access Denied</h2>
            <p className="text-muted-foreground">You don't have permission to access the admin panel.</p>
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-full bg-gradient-rainbow text-white font-medium hover:opacity-90 transition-opacity"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'products' as const, name: 'Products', icon: Package },
    { id: 'blog' as const, name: 'Blog Posts', icon: FileText },
    { id: 'newsletter' as const, name: 'Newsletter', icon: Users },
    { id: 'pages' as const, name: 'Site Pages', icon: FileEdit },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-foreground">Admin Panel</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-border text-foreground hover:bg-muted transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-4 border-b border-border overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-rainbow text-white'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'products' && <ProductManagement />}
          {activeTab === 'blog' && <BlogManagement />}
          {activeTab === 'newsletter' && <NewsletterManagement />}
          {activeTab === 'pages' && <SitePagesManagement />}
        </div>
      </div>
    </div>
  );
}
