import { useState } from 'react';
import { X, Package, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useLogout } from '../hooks/useBackendAuth';
import { useQueryClient } from '@tanstack/react-query';
import ProductManagement from './admin/ProductManagement';
import BlogManagement from './admin/BlogManagement';
import NewsletterManagement from './admin/NewsletterManagement';
import SitePagesManagement from './admin/SitePagesManagement';

interface AdminPanelProps {
  onClose: () => void;
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'blog' | 'newsletter' | 'pages'>('products');
  const { isAuthenticated: customAuthActive, username, clearSession } = useAuth();
  const { identity, clear: clearII } = useInternetIdentity();
  const logoutMutation = useLogout();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    if (customAuthActive) {
      // Custom auth logout
      await logoutMutation.mutateAsync();
    } else if (identity) {
      // Internet Identity logout
      await clearII();
      queryClient.clear();
    }
    onClose();
  };

  const tabs = [
    { id: 'products' as const, label: 'Products', icon: Package },
    { id: 'blog' as const, label: 'Blog', icon: Package },
    { id: 'newsletter' as const, label: 'Newsletter', icon: Package },
    { id: 'pages' as const, label: 'Site Pages', icon: Package },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-rainbow">
          <div>
            <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
            {username && (
              <p className="text-sm text-white/80 mt-1">Logged in as: {username}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors disabled:opacity-50"
            >
              <LogOut className="h-4 w-4 text-blue-600" />
              <span className="text-blue-600 font-medium">Log Out</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/20 transition-colors text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border bg-muted/30">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-foreground border-b-2 border-primary-magenta bg-background'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
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
