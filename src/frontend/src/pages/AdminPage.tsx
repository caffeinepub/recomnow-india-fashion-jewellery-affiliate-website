import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../hooks/useQueries';
import AdminLogin from '../components/AdminLogin';
import AdminPanel from '../components/AdminPanel';
import { Loader2, ShieldAlert } from 'lucide-react';

export default function AdminPage() {
  const { isAuthenticated: customAuthActive } = useAuth();
  const { identity, isInitializing } = useInternetIdentity();
  const { data: isAdmin, isLoading: isCheckingAdmin, isFetched } = useIsCallerAdmin();
  const [showLogin, setShowLogin] = useState(false);
  const [showPanel, setShowPanel] = useState(false);

  const isIIAuthenticated = !!identity;
  const isAuthenticated = customAuthActive || isIIAuthenticated;

  useEffect(() => {
    // Show login if not authenticated
    if (!isInitializing && !isAuthenticated) {
      setShowLogin(true);
      setShowPanel(false);
    }
    // For custom auth, show panel immediately after login
    else if (customAuthActive) {
      setShowLogin(false);
      setShowPanel(true);
    }
    // For II auth, wait for admin check
    else if (isIIAuthenticated && isFetched) {
      setShowLogin(false);
      if (isAdmin) {
        setShowPanel(true);
      }
    }
  }, [isAuthenticated, customAuthActive, isIIAuthenticated, isAdmin, isFetched, isInitializing]);

  const handleLoginSuccess = () => {
    setShowLogin(false);
    if (customAuthActive) {
      setShowPanel(true);
    }
  };

  const handleClosePanel = () => {
    setShowPanel(false);
    window.history.back();
  };

  // Loading state
  if (isInitializing || (isIIAuthenticated && isCheckingAdmin)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-magenta mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Access denied for II users who are not admin
  if (isIIAuthenticated && isFetched && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 mb-6">
            <ShieldAlert className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You don't have permission to access the admin panel. Please contact an administrator if you believe this is an error.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 rounded-full bg-gradient-rainbow text-white font-medium hover:opacity-90 transition-opacity"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {showLogin && (
        <AdminLogin
          onClose={() => window.history.back()}
          onSuccess={handleLoginSuccess}
        />
      )}
      {showPanel && <AdminPanel onClose={handleClosePanel} />}
    </>
  );
}
