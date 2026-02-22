import { useState, useEffect, lazy, Suspense, memo } from 'react';
import { useAuth } from './hooks/useAuth';
import { useActor } from './hooks/useActor';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import SocialProof from './components/SocialProof';
import Footer from './components/Footer';
import Spinner from './components/Spinner';

// Lazy load non-critical components for code splitting
const AdminPanel = lazy(() => import(/* webpackChunkName: "admin-panel", webpackPrefetch: true */ './components/AdminPanel'));
const AdminLogin = lazy(() => import(/* webpackChunkName: "admin-login", webpackPrefetch: true */ './components/AdminLogin'));
const BlogTeaser = lazy(() => import(/* webpackChunkName: "blog-teaser" */ './components/BlogTeaser'));
const BlogPostModal = lazy(() => import(/* webpackChunkName: "blog-post-modal" */ './components/BlogPostModal'));
const Toaster = lazy(() => import(/* webpackChunkName: "toaster" */ './components/ui/sonner').then(m => ({ default: m.Toaster })));
const ProductsPage = lazy(() => import(/* webpackChunkName: "products-page" */ './pages/ProductsPage'));
const AdminPage = lazy(() => import(/* webpackChunkName: "admin-page" */ './pages/AdminPage'));
const SitemapPage = lazy(() => import(/* webpackChunkName: "sitemap-page" */ './pages/SitemapPage'));

// Memoized loading fallback component
const LoadingFallback = memo(({ message = 'Loading...' }: { message?: string }) => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center space-y-4" role="status" aria-live="polite">
      <Spinner className="h-12 w-12 text-gold-600 mx-auto" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  </div>
));

LoadingFallback.displayName = 'LoadingFallback';

// Home page component
const HomePage = memo(({ onReadMore }: { onReadMore: (post: any) => void }) => (
  <>
    <Hero />
    <ProductGrid />
    <SocialProof />
    <Suspense fallback={null}>
      <BlogTeaser onReadMore={onReadMore} />
    </Suspense>
  </>
));

HomePage.displayName = 'HomePage';

// 404 Not Found page
const NotFoundPage = memo(() => (
  <div className="min-h-screen bg-background flex items-center justify-center px-4">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-navy-900 mb-4">404</h1>
      <p className="text-xl text-navy-700 mb-6">Page not found</p>
      <a
        href="/"
        className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-gradient-to-r from-gold-600 to-gold-700 text-white font-bold hover:from-gold-700 hover:to-gold-800 transition-all"
      >
        Go back home
      </a>
    </div>
  </div>
));

NotFoundPage.displayName = 'NotFoundPage';

function App() {
  const { isAuthenticated } = useAuth();
  const { actor, isFetching } = useActor();
  const [currentRoute, setCurrentRoute] = useState<string>('/');
  const [showAdmin, setShowAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [selectedBlogPost, setSelectedBlogPost] = useState<bigint | null>(null);

  // Handle route changes
  useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname;
      setCurrentRoute(path);
    };

    handleRouteChange();
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  const handleReadMore = (post: any) => {
    setSelectedBlogPost(post.id);
  };

  if (!actor && isFetching) {
    return <LoadingFallback message="Loading RecomNow India..." />;
  }

  // Route rendering logic
  const renderRoute = () => {
    const path = currentRoute;

    if (path === '/sitemap.xml') {
      return <SitemapPage />;
    }

    if (path === '/products') {
      return <ProductsPage />;
    }

    if (path === '/admin') {
      return <AdminPage />;
    }

    if (path === '/' || path === '') {
      return <HomePage onReadMore={handleReadMore} />;
    }

    // 404 for unknown routes
    return <NotFoundPage />;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header currentRoute={currentRoute} />
      <main>
        <Suspense fallback={<LoadingFallback />}>
          {renderRoute()}
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
        {selectedBlogPost && (
          <BlogPostModal 
            postId={selectedBlogPost} 
            onClose={() => setSelectedBlogPost(null)} 
          />
        )}
        <Toaster />
      </Suspense>
    </div>
  );
}

export default memo(App);
