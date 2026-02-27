import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useAuth } from '../hooks/useAuth';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import { useQueryClient } from '@tanstack/react-query';
import AdminLogin from '../components/AdminLogin';
import AdminPanel from '../components/AdminPanel';
import Spinner from '../components/Spinner';

export default function AdminPage() {
  const { identity, loginStatus, clear } = useInternetIdentity();
  const { sessionToken, isSessionValid, clearSession } = useAuth();
  const { actor, isFetching: actorFetching } = useActor();
  const { data: isAdmin, isLoading: adminCheckLoading, isError: adminCheckError, error: adminError, refetch } = useIsCallerAdmin();
  const queryClient = useQueryClient();

  const isIIAuthenticated = !!identity;
  const isCustomAuthenticated = !!sessionToken && isSessionValid();
  const isLoggingIn = loginStatus === 'logging-in';

  const actorReady = !!actor;

  // For custom auth: show panel as soon as session is valid (backend protects mutations)
  // For II auth: show panel when isAdmin is confirmed true
  const iiShowPanel = isIIAuthenticated && isAdmin === true;
  const showPanel = isCustomAuthenticated || iiShowPanel;

  // Loading while: II login in progress, actor still fetching for II user, or admin check running
  const showLoading =
    isLoggingIn ||
    (isIIAuthenticated && !isCustomAuthenticated && actorFetching) ||
    (isIIAuthenticated && !isCustomAuthenticated && actorReady && adminCheckLoading);

  // Error state: admin check timed out or failed
  const showAdminCheckError =
    isIIAuthenticated &&
    !isCustomAuthenticated &&
    !showPanel &&
    !showLoading &&
    adminCheckError;

  // Access denied: II authenticated, actor ready, admin check done, not admin
  const showAccessDenied =
    isIIAuthenticated &&
    !isCustomAuthenticated &&
    !showPanel &&
    !showLoading &&
    !showAdminCheckError &&
    actorReady &&
    isAdmin === false;

  const showLogin = !showPanel && !showLoading && !showAccessDenied && !showAdminCheckError;

  const handleRetry = () => {
    queryClient.removeQueries({ queryKey: ['isCallerAdmin'] });
    refetch();
  };

  const handleLogoutAndRetry = async () => {
    await clear();
    clearSession();
    queryClient.clear();
  };

  return (
    <div className="min-h-screen bg-navy-50">
      {showLoading && (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <Spinner />
          <p className="text-navy-600 text-sm">
            {isLoggingIn ? 'Connecting to Internet Identity…' : 'Verifying admin access…'}
          </p>
        </div>
      )}

      {showAdminCheckError && (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-navy-900 mb-2">Verification Failed</h2>
            <p className="text-navy-600 text-sm mb-6">
              {adminError instanceof Error
                ? adminError.message
                : 'Unable to verify admin access. Please try again.'}
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleRetry}
                className="w-full py-2.5 bg-pink-hot hover:bg-pink-hot-dark text-white font-semibold rounded-lg transition-colors"
              >
                Retry Verification
              </button>
              <button
                onClick={handleLogoutAndRetry}
                className="w-full py-2.5 bg-navy-100 hover:bg-navy-200 text-navy-700 font-semibold rounded-lg transition-colors"
              >
                Sign Out &amp; Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {showAccessDenied && (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h2 className="text-xl font-bold text-navy-900 mb-2">Access Denied</h2>
            <p className="text-navy-600 text-sm mb-6">
              Your account does not have admin privileges. Please contact the site administrator.
            </p>
            <button
              onClick={handleLogoutAndRetry}
              className="w-full py-2.5 bg-navy-100 hover:bg-navy-200 text-navy-700 font-semibold rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {showPanel && <AdminPanel />}

      {showLogin && <AdminLogin />}
    </div>
  );
}
