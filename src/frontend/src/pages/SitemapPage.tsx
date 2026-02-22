import { memo, useEffect } from 'react';
import { useGetSitemap } from '../hooks/useQueries';
import Spinner from '../components/Spinner';

const SitemapPage = memo(() => {
  const { data: sitemapXml, isLoading, error } = useGetSitemap();

  useEffect(() => {
    if (sitemapXml) {
      // Replace the entire document with the XML content
      // This serves the sitemap as pure XML without HTML wrapper
      document.open();
      document.write(sitemapXml);
      document.close();
    }
  }, [sitemapXml]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner className="h-12 w-12 text-gold-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-bold">Error loading sitemap</p>
          <p className="text-sm text-gray-600 mt-2">Please try again later</p>
        </div>
      </div>
    );
  }

  // This will be replaced by the XML content via useEffect
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Spinner className="h-12 w-12 text-gold-600" />
    </div>
  );
});

SitemapPage.displayName = 'SitemapPage';

export default SitemapPage;
