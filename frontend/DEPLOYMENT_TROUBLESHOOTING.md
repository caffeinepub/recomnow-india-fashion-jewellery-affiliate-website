# Deployment Troubleshooting Guide

## Production Deployment Failure - January 2026

### Issue Description
Production deployment failed after successful build completion. The build process succeeded, but the deployment to production network encountered errors.

### Root Cause Analysis
The deployment failure was traced to a missing static asset reference in `frontend/index.html`:

**Error:** The favicon link referenced `/vite.svg` (line 14), which did not exist in the project's public directory or assets folder.

### Resolution
Updated `frontend/index.html` to reference the correct favicon path: `/assets/generated/recomnow-logo.dim_200x200.png`

---

## Version 84 Go-Live Checklist

### Pre-Deployment Verification

#### 1. Static Assets Check
- [ ] Verify favicon exists at `frontend/public/assets/generated/recomnow-logo.dim_200x200.png`
- [ ] Verify hero banner exists at `frontend/public/assets/generated/hero-banner.dim_1200x400.png`
- [ ] Verify PNG versions exist for both critical assets (WebP is optional enhancement)
- [ ] Check all image references in components resolve correctly
- [ ] Ensure `frontend/index.html` preloads only existing PNG assets
- [ ] Ensure `frontend/public/sw.js` caches only existing PNG assets

#### 2. Build Verification
- [ ] Run `npm run build` locally without errors
- [ ] Verify `dist/` directory contains all expected assets
- [ ] Check that `dist/assets/generated/` contains required PNG image files
- [ ] Confirm no 404 errors in browser console after local build preview
- [ ] Test service worker installation succeeds (no failed cache.addAll())

#### 3. Critical Routes Test
After production deployment, verify these routes load successfully:
- [ ] `/` - Home page with hero banner and product grid
- [ ] `/admin` - Admin login modal appears automatically
- [ ] `/sitemap.xml` - XML sitemap renders correctly
- [ ] `/robots.txt` - Robots.txt serves plain text

#### 4. Service Worker Registration
- [ ] Check browser DevTools → Application → Service Workers
- [ ] Verify service worker is registered and active
- [ ] Confirm cache version is `v3`
- [ ] Verify STATIC_ASSETS array contains only existing files
- [ ] Test offline functionality (reload page with network disabled)

#### 5. Visual Sanity Checks
- [ ] Header logo displays correctly
- [ ] Hero banner loads without broken image icon
- [ ] Product images render (or show placeholder if none uploaded)
- [ ] Footer displays with correct branding and links
- [ ] Mobile responsive layout works (test at 375px, 768px, 1024px)

#### 6. Functionality Verification
- [ ] Newsletter signup form submits successfully
- [ ] Product filtering works (category, price, discount)
- [ ] Blog posts load and display correctly
- [ ] Admin login works with correct credentials
- [ ] Admin panel loads after authentication
- [ ] `/admin` route automatically triggers admin login/panel

#### 7. Performance Checks
- [ ] Google Analytics tracking fires (check Network tab for gtag requests)
- [ ] WebP images load on supported browsers (if available)
- [ ] PNG fallback works on all browsers
- [ ] Page load time < 3 seconds on 3G connection

#### 8. SEO Verification
- [ ] Meta tags present in page source
- [ ] Sitemap accessible and valid XML
- [ ] Robots.txt accessible and properly formatted
- [ ] Favicon displays in browser tab

### Common Issues and Solutions

#### Issue: "Deployment error" (generic)
**Cause:** Missing static assets, invalid file references, service worker cache failures, or canister upgrade limits exceeded.

**Solution:**
1. Check all asset references in `frontend/index.html` (especially preload links)
2. Verify all referenced files exist in `frontend/public/assets/generated/`
3. Check `frontend/public/sw.js` STATIC_ASSETS array contains only existing files
4. Remove any WebP references if WebP files don't exist; use PNG only
5. Run fresh build + redeploy to force clean upgrade path
6. Check browser console for 404 errors or service worker install failures after deployment

#### Issue: Blank screen after deployment
**Cause:** JavaScript errors, missing routes, failed service worker registration, or route handling issues.

**Solution:**
1. Open browser DevTools → Console
2. Check for JavaScript errors or failed network requests
3. Verify `App.tsx` renders a valid component for default route
4. Check that `/admin` route is properly handled in route detection logic
5. Clear browser cache and service worker, then reload

#### Issue: Images not loading
**Cause:** Incorrect asset paths, missing files in build output, or preload/cache mismatches.

**Solution:**
1. Verify asset paths use `/assets/generated/` prefix
2. Check `dist/assets/generated/` contains all images after build
3. Use browser Network tab to see actual requested URLs
4. Ensure preloaded assets in `index.html` match cached assets in `sw.js`
5. Use PNG versions for critical assets; WebP is optional enhancement

#### Issue: Service worker not updating or install fails
**Cause:** Browser caching old service worker version or cache.addAll() failing on missing assets.

**Solution:**
1. Check DevTools → Console for service worker errors
2. Verify STATIC_ASSETS array in `sw.js` contains only existing files
3. Update cache version in `frontend/public/sw.js` if needed
4. Clear browser cache and service workers
5. Hard reload (Ctrl+Shift+R or Cmd+Shift+R)
6. Check DevTools → Application → Service Workers → Update on reload

#### Issue: /admin route not working
**Cause:** Route detection logic not recognizing `/admin` path.

**Solution:**
1. Verify `App.tsx` includes `/admin` in route detection useEffect
2. Check that admin login/panel modals open automatically on `/admin` route
3. Test navigation to `/admin` directly in browser address bar
4. Ensure authentication state is checked before showing admin panel

### Prevention Guidelines

1. **Always verify asset references before deployment:**
   - Run `npm run build` locally
   - Check `dist/` directory for all referenced assets
   - Preview build output with `npm run preview` or local server
   - Verify service worker installs without errors

2. **Keep asset references synchronized:**
   - `frontend/index.html` preload links
   - `frontend/public/sw.js` STATIC_ASSETS array
   - Component image imports
   - All must reference the same existing files

3. **Use conservative asset formats for critical resources:**
   - PNG for favicon and preloaded images (universal compatibility)
   - WebP as progressive enhancement (optional, loaded dynamically)
   - Never preload or cache non-existent files

4. **Test in production-like environment:**
   - Build locally and serve from `dist/` directory
   - Test with browser cache disabled
   - Verify all routes and functionality work
   - Check service worker registration succeeds

5. **Monitor deployment logs:**
   - Check for warnings during build process
   - Verify canister upgrade succeeds
   - Test production URL immediately after deployment
   - Check browser console for errors

---

## Deployment Success Criteria

Version 84 deployment is considered successful when:

1. ✅ Production URL loads without errors
2. ✅ All critical routes render correctly (/, /admin, /sitemap.xml, /robots.txt)
3. ✅ Service worker registers and caches assets without install failures
4. ✅ Images display (logo, hero banner, products)
5. ✅ Admin panel accessible via `/admin` route and header button
6. ✅ Newsletter signup works
7. ✅ SEO assets (sitemap, robots.txt) accessible
8. ✅ No console errors in browser DevTools
9. ✅ Mobile responsive layout works
10. ✅ Google Analytics tracking fires

If any criterion fails, investigate using the troubleshooting steps above before considering the deployment complete.
