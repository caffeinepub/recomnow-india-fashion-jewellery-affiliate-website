# Specification

## Summary
**Goal:** Improve mobile PageSpeed/Core Web Vitals and SEO accessibility basics by optimizing image delivery, caching, render-blocking resources, and serving valid static robots/sitemap files.

**Planned changes:**
- Add optimized above-the-fold hero and logo static assets (WebP/AVIF) and update UI to prefer them without changing layout or causing CLS; keep below-the-fold images lazy-loaded.
- Update `frontend/src/components/OptimizedImage.tsx` to deliver responsive, non-blocking images with eager/high-priority behavior for priority images, lazy loading for non-priority, async decoding, and WebP/AVIF preference with PNG fallback plus stable dimensions.
- Adjust `frontend/index.html` to preload only truly critical assets (including the optimized hero) and ensure analytics remains deferred and does not block first paint.
- Serve static `frontend/public/robots.txt` (with correct sitemap URL) and static `frontend/public/sitemap.xml` (valid XML with correct base URLs), avoiding React-route-based delivery.
- Improve cache efficiency via the existing `frontend/public/sw.js` (cache-first or stale-while-revalidate for core build/image assets, reliable cache cleanup, and avoid incorrect caching of robots/sitemap).
- Keep heavy UI areas code-split and on-demand (admin, login, blog, toaster) and remove production console logging via build configuration.
- Adjust theme color pairings to resolve contrast warnings and meet WCAG AA in light and dark modes without changing overall brand feel.

**User-visible outcome:** Faster first load on mobile (better LCP/FCP and reduced blocking), more reliable repeat-load performance via caching, valid crawlable robots/sitemap endpoints, and improved text contrast/readability across themes.
