import { memo, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useIsCallerAdmin } from '../hooks/useQueries';
import AdminPanel from '../components/AdminPanel';
import AdminLogin from '../components/AdminLogin';
import Spinner from '../components/Spinner';

const AdminPage = memo(() => {
  const { isAuthenticated } = useAuth();
  const { data: isAdmin, isLoading: isCheckingAdmin } = useIsCallerAdmin();
  const [showLogin, setShowLogin] = useState(!isAuthenticated);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      setShowLogin(false);
      setShowPanel(true);
    } else if (isAuthenticated && isAdmin === false) {
      // User is authenticated but not admin
      setShowLogin(false);
      setShowPanel(false);
    } else if (!isAuthenticated) {
      setShowLogin(true);
      setShowPanel(false);
    }
  }, [isAuthenticated, isAdmin]);

  const handleLoginSuccess = () => {
    setShowLogin(false);
    // Wait for admin check to complete before showing panel
    setTimeout(() => setShowPanel(true), 100);
  };

  const handleClosePanel = () => {
    setShowPanel(false);
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleCloseLogin = () => {
    setShowLogin(false);
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // Show loading state while checking authentication and admin status
  if (isCheckingAdmin || (isAuthenticated && isAdmin === undefined)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Spinner className="h-12 w-12 text-gold-600 mx-auto" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Show access denied if authenticated but not admin
  if (isAuthenticated && isAdmin === false) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="bg-card border border-border rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center space-y-4">
            <div className="text-4xl">🔒</div>
            <h2 className="text-2xl font-bold text-foreground">Access Denied</h2>
            <p className="text-muted-foreground">
              You don't have permission to access the admin panel.
            </p>
            <button
              onClick={handleCloseLogin}
              className="px-6 py-2 rounded-full bg-gradient-to-r from-gold-600 to-gold-700 text-white font-medium hover:from-gold-700 hover:to-gold-800 transition-all"
            >
              Go Back Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {showLogin && (
        <AdminLogin 
          onClose={handleCloseLogin} 
          onSuccess={handleLoginSuccess} 
        />
      )}
      {showPanel && <AdminPanel onClose={handleClosePanel} />}
    </div>
  );
});

AdminPage.displayName = 'AdminPage';

export default AdminPage;
