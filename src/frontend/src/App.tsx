import { useState, useEffect, lazy, Suspense, memo } from 'react';
import { useAuth } from './hooks/useAuth';
import { useActor } from './hooks/useActor';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import Footer from './components/Footer';
import Spinner from './components/Spinner';

// Lazy load non-critical components for code splitting
const AdminPanel = lazy(() => import(/* webpackChunkName: "admin-panel" */ './components/AdminPanel'));
const AdminLogin = lazy(() => import(/* webpackChunkName: "admin-login" */ './components/AdminLogin'));
const BlogTeaser = lazy(() => import(/* webpackChunkName: "blog-teaser" */ './components/BlogTeaser'));
const Toaster = lazy(() => import(/* webpackChunkName: "toaster" */ './components/ui/sonner').then(m => ({ default: m.Toaster })));

// Memoized loading fallback component
const LoadingFallback = memo(({ message = 'Loading...' }: { message?: string }) => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center space-y-4" role="status" aria-live="polite">
      <Spinner className="h-12 w-12 text-primary-magenta mx-auto" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  </div>
));

LoadingFallback.displayName = 'LoadingFallback';

function App() {
  const { isAuthenticated } = useAuth();
  const { actor, isFetching } = useActor();
  const [showAdmin, setShowAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<'home' | 'admin'>('home');

  // Register service worker for caching
  useEffect(() => {
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.error('Service worker registration failed:', error);
      });
    }
  }, []);

  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/admin') {
      setCurrentRoute('admin');
      // Automatically show admin login when navigating to /admin
      if (isAuthenticated) {
        setShowAdmin(true);
      } else {
        setShowLogin(true);
      }
    } else {
      setCurrentRoute('home');
    }
  }, [isAuthenticated]);

  const handleAdminClick = () => {
    setShowAdmin(true);
  };

  const handleAdminLoginClick = () => {
    setShowLogin(true);
  };

  if (!actor && isFetching) {
    return <LoadingFallback message="Loading RecomNow India..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onAdminClick={handleAdminClick} 
        onAdminLoginClick={handleAdminLoginClick}
      />
      <main>
        <Hero />
        <ProductGrid />
        <Suspense fallback={null}>
          <BlogTeaser />
        </Suspense>
      </main>
      <Footer />
      
      <Suspense fallback={null}>
        {showLogin && (
          <AdminLogin 
            onClose={() => setShowLogin(false)} 
            onSuccess={() => {
              setShowLogin(false);
              setShowAdmin(true);
            }} 
          />
        )}
        {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
        <Toaster />
      </Suspense>
    </div>
  );
}

export default memo(App);
