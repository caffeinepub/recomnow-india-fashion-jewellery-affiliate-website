# Specification

## Summary
**Goal:** Optimize the frontend for PageSpeed 90+ by improving image delivery, minification, render-blocking resources, layout stability, third-party script deferral, and font loading.

**Planned changes:**
- Update `OptimizedImage` component and all image tags to serve WebP format with PNG/JPEG fallback via `<picture>` elements; apply `loading="lazy"` to all below-the-fold images
- Set `fetchpriority="high"` on the hero/LCP image in `Hero.tsx` and remove any lazy loading from it
- Add explicit `width` and `height` attributes to all `<img>` tags and video containers across components (Hero.tsx, ProductGrid.tsx, ProductManagement.tsx, OptimizedImage.tsx, TrustBadges.tsx, etc.) to eliminate CLS
- Configure `vite.config.ts` with aggressive Terser minification (compress, mangle, remove comments) and enable CSS minification in the build pipeline
- Inline critical above-the-fold CSS into a `<style>` tag in `index.html` `<head>`; add `defer` or `async` to all non-essential script tags
- Update `delayedScripts.ts` to inject third-party tracking scripts (including Google Analytics) at least 3 seconds after the `window.load` event; move any inline GA initialization in `index.html` to use this mechanism
- Ensure all `@font-face` rules in `index.css` include `font-display: swap` and all Google Fonts URLs in `index.html` include `&display=swap`

**User-visible outcome:** The site loads faster with no render-blocking resources, no invisible text during font load, no layout shifts from images, and third-party scripts no longer impact initial page render — targeting a PageSpeed score of 90+.
