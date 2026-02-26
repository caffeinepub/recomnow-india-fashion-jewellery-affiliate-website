import React, { Suspense, lazy, useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import SocialProof from './components/SocialProof';
import Footer from './components/Footer';
import BlogTeaser from './components/BlogTeaser';
import PageModal from './components/PageModal';
import ProductGrid from './components/ProductGrid';

const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const SitemapPage = lazy(() => import('./pages/SitemapPage'));

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto mb-4"></div>
        <p className="text-navy-600">Loading...</p>
      </div>
    </div>
  );
}

function HomePage() {
  return (
    <>
      <Hero />
      <section className="bg-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-2">Our Products</h2>
            <p className="text-navy-500 text-sm sm:text-base">Curated fashion & jewellery deals from Amazon</p>
          </div>
          <ProductGrid />
        </div>
      </section>
      <SocialProof />
      <BlogTeaser onReadMore={() => {}} />
    </>
  );
}

export default function App() {
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const [openPage, setOpenPage] = useState<string | null>(null);

  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setPathname(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    if (pathname === '/products') {
      return (
        <Suspense fallback={<LoadingFallback />}>
          <ProductsPage />
        </Suspense>
      );
    }
    if (pathname === '/admin') {
      return (
        <Suspense fallback={<LoadingFallback />}>
          <AdminPage />
        </Suspense>
      );
    }
    if (pathname === '/sitemap.xml' || pathname === '/sitemap') {
      return (
        <Suspense fallback={<LoadingFallback />}>
          <SitemapPage />
        </Suspense>
      );
    }
    return <HomePage />;
  };

  const isAdminPage = pathname === '/admin';
  const isSitemapPage = pathname === '/sitemap.xml' || pathname === '/sitemap';

  return (
    <div className="min-h-screen flex flex-col">
      {!isAdminPage && !isSitemapPage && (
        <Header currentRoute={pathname} onNavigate={navigate} />
      )}

      <main className="flex-1">
        {renderPage()}
      </main>

      {!isAdminPage && !isSitemapPage && (
        <Footer onNavigate={navigate} onOpenPage={setOpenPage} />
      )}

      {openPage && (
        <PageModal pageKey={openPage} onClose={() => setOpenPage(null)} />
      )}
    </div>
  );
}
