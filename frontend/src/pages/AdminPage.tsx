import React, { useState, useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useAuth } from '../hooks/useAuth';
import { useIsCallerAdmin } from '../hooks/useQueries';
import AdminLogin from '../components/AdminLogin';
import AdminPanel from '../components/AdminPanel';

export default function AdminPage() {
  const { identity, isInitializing: iiInitializing } = useInternetIdentity();
  const { sessionToken, isSessionValid } = useAuth();
  const { data: isAdmin, isLoading: adminCheckLoading } = useIsCallerAdmin();

  const isIIAuthenticated = !!identity;
  const isCustomAuthenticated = !!sessionToken && isSessionValid();

  // Show panel if:
  // 1. Custom auth is active (session valid) - always allow
  // 2. II auth is active and user is confirmed admin
  const showPanel = isCustomAuthenticated || (isIIAuthenticated && isAdmin === true);

  // Show access denied if II authenticated but not admin
  const showAccessDenied = isIIAuthenticated && !isCustomAuthenticated && isAdmin === false && !adminCheckLoading;

  // Show loading while II is initializing or admin check is in progress for II users
  const showLoading = iiInitializing || (isIIAuthenticated && !isCustomAuthenticated && adminCheckLoading);

  const handleLoginSuccess = () => {
    // The auth state will update reactively via Zustand/useInternetIdentity
    // No manual state needed - the component will re-render with updated auth state
  };

  if (showLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (showAccessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-900 px-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🚫</span>
          </div>
          <h2 className="text-2xl font-bold text-navy-900 mb-2">Access Denied</h2>
          <p className="text-navy-600 mb-6">
            Your Internet Identity does not have admin privileges. Please use admin credentials to log in.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-2 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-lg transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (showPanel) {
    return <AdminPanel />;
  }

  return <AdminLogin onSuccess={handleLoginSuccess} />;
}
