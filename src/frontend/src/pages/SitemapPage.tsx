import { useEffect } from 'react';

export default function SitemapPage() {
  useEffect(() => {
    // Generate a basic sitemap XML
    const canisterId = import.meta.env.VITE_CANISTER_ID_BACKEND || 'unknown';
    const baseUrl = `https://${canisterId}.icp0.io`;
    
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/products</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;

    // Replace the entire document with the XML
    document.open();
    document.write(sitemapXml);
    document.close();
  }, []);

  return null;
}
