# Performance Optimization Action Plan
## RecomNow India - Mobile 90+ & Desktop 95+ Lighthouse Scores

**Target Metrics:**
- Mobile Lighthouse: 90+
- Desktop Lighthouse: 95+
- LCP < 2.5s
- FID/INP: Good (< 200ms)
- CLS < 0.1

---

## 📊 Current Performance Summary

### Mobile Issues (High Priority)
1. **Large JavaScript bundles** blocking initial render
2. **Unoptimized images** without modern formats (AVIF/WebP)
3. **Render-blocking CSS** delaying First Contentful Paint
4. **No resource hints** for critical origins (DNS/TLS overhead)
5. **Layout shifts** from images without dimensions
6. **Long JavaScript tasks** exceeding 50ms (TBT impact)

### Desktop Issues (Medium Priority)
1. **Suboptimal chunk splitting** causing duplicate code
2. **Missing cache headers** for static assets
3. **No prefetching** for lazy-loaded routes
4. **Unused CSS/JS** in initial bundle

---

## 🚀 Phase 1: Quick Wins (1 Day)
**Target: Mobile +15 points, Desktop +10 points**

### ✅ Non-Developer Safe Tasks

#### 1.1 Enable Cloudflare Optimizations (30 min)
**What:** Configure Cloudflare CDN settings  
**Why:** Reduces TTFB, enables compression, improves caching  
**Impact:** LCP -0.5s, TTFB -200ms  

**Steps:**
1. Log into Cloudflare dashboard
2. Navigate to Speed → Optimization
3. Enable:
   - Auto Minify (JS, CSS, HTML)
   - Brotli compression
   - Rocket Loader (defer JS)
   - HTTP/3 (QUIC)
4. Navigate to Caching → Configuration
5. Set Browser Cache TTL: 1 year
6. Create Page Rule for `/assets/*`:
   - Cache Level: Cache Everything
   - Edge Cache TTL: 1 month
   - Browser Cache TTL: 1 year

**Verification:**
