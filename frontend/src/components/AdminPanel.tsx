import React, { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useAuth } from '../hooks/useAuth';
import { useLogoutUser } from '../hooks/useBackendAuth';
import { useQueryClient } from '@tanstack/react-query';
import ProductManagement from './admin/ProductManagement';
import BlogManagement from './admin/BlogManagement';
import NewsletterManagement from './admin/NewsletterManagement';
import SitePagesManagement from './admin/SitePagesManagement';

type AdminTab = 'products' | 'blog' | 'newsletter' | 'pages';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<AdminTab>('products');
  const { identity, clear: iiClear } = useInternetIdentity();
  const { sessionToken, username, clearSession } = useAuth();
  const logoutMutation = useLogoutUser();
  const queryClient = useQueryClient();

  const isIIAuthenticated = !!identity;
  const isCustomAuthenticated = !!sessionToken;

  const handleLogout = async () => {
    if (isCustomAuthenticated) {
      await logoutMutation.mutateAsync();
    }
    if (isIIAuthenticated) {
      await iiClear();
    }
    queryClient.clear();
  };

  const displayName = username || (identity ? identity.getPrincipal().toString().slice(0, 12) + '...' : 'Admin');

  const tabs: { id: AdminTab; label: string }[] = [
    { id: 'products', label: 'Products' },
    { id: 'blog', label: 'Blog' },
    { id: 'newsletter', label: 'Newsletter' },
    { id: 'pages', label: 'Site Pages' },
  ];

  return (
    <div className="min-h-screen bg-navy-50">
      {/* Header */}
      <header className="bg-navy-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👑</span>
            <div>
              <h1 className="text-xl font-bold">Admin Panel</h1>
              <p className="text-navy-300 text-xs">Welcome, {displayName}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="px-4 py-2 bg-transparent border border-navy-400 hover:border-white text-blue-300 hover:text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
          >
            {logoutMutation.isPending ? 'Logging out...' : 'Log Out'}
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-navy-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-gold-500 text-gold-600'
                    : 'border-transparent text-navy-600 hover:text-navy-900 hover:border-navy-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'products' && <ProductManagement />}
        {activeTab === 'blog' && <BlogManagement />}
        {activeTab === 'newsletter' && <NewsletterManagement />}
        {activeTab === 'pages' && <SitePagesManagement />}
      </main>
    </div>
  );
}
