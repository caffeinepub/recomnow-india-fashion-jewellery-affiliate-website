import React, { Suspense, lazy, useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import SocialProof from './components/SocialProof';
import Footer from './components/Footer';
import BlogTeaser from './components/BlogTeaser';
import BlogPostModal from './components/BlogPostModal';
import PageModal from './components/PageModal';

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
      <SocialProof />
      <BlogTeaser onReadMore={() => {}} />
    </>
  );
}

export default function App() {
  const pathname = window.location.pathname;
  const [openPage, setOpenPage] = useState<string | null>(null);

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
        <Header currentRoute={pathname} />
      )}

      <main className="flex-1">
        {renderPage()}
      </main>

      {!isAdminPage && !isSitemapPage && (
        <Footer />
      )}

      {openPage && (
        <PageModal pageKey={openPage} onClose={() => setOpenPage(null)} />
      )}
    </div>
  );
}
