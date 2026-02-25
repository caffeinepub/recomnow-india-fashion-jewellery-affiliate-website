# Cloudflare CDN Configuration Guide

This guide provides instructions for configuring Cloudflare CDN to optimize the RecomNow India website for speed and mobile performance.

## Prerequisites
- Active Cloudflare account
- Domain configured with Cloudflare DNS

## Configuration Steps

### 1. Auto Minify
Enable automatic minification of CSS, JavaScript, and HTML:

1. Log in to your Cloudflare dashboard
2. Select your domain
3. Navigate to **Speed** → **Optimization**
4. Under **Auto Minify**, enable:
   - ✅ JavaScript
   - ✅ CSS
   - ✅ HTML

### 2. Brotli Compression
Enable Brotli compression for better compression ratios:

1. In the Cloudflare dashboard, go to **Speed** → **Optimization**
2. Enable **Brotli** compression

### 3. Rocket Loader
Enable Rocket Loader to prioritize page content loading:

1. Navigate to **Speed** → **Optimization**
2. Enable **Rocket Loader**
3. Note: Monitor your site after enabling to ensure JavaScript functionality is not affected

### 4. Caching Configuration
Configure caching rules for static assets:

1. Go to **Caching** → **Configuration**
2. Set **Browser Cache TTL** to **1 year** for static assets
3. Create **Page Rules** for static assets:
   - Pattern: `*recomnowindia-2gi.caffeine.xyz/assets/*`
   - Settings:
     - Cache Level: Cache Everything
     - Edge Cache TTL: 1 month
     - Browser Cache TTL: 1 year

### 5. Image Optimization (Polish)
Enable image optimization:

1. Navigate to **Speed** → **Optimization**
2. Under **Image Optimization**, enable **Polish**
3. Select **Lossless** or **Lossy** based on your preference
4. Enable **WebP** conversion

### 6. HTTP/3 (QUIC)
Enable HTTP/3 for improved performance:

1. Go to **Network**
2. Enable **HTTP/3 (with QUIC)**

### 7. Early Hints
Enable Early Hints for faster page loads:

1. Navigate to **Speed** → **Optimization**
2. Enable **Early Hints**

### 8. Mobile Optimization
Configure mobile-specific optimizations:

1. Go to **Speed** → **Optimization**
2. Enable **Mobile Redirect** if you have a separate mobile site (optional)
3. Ensure **Mirage** is enabled for mobile image optimization

### 9. Page Rules for Performance
Create additional page rules:

1. Go to **Rules** → **Page Rules**
2. Create rule for homepage:
   - Pattern: `recomnowindia-2gi.caffeine.xyz/`
   - Settings:
     - Cache Level: Cache Everything
     - Edge Cache TTL: 2 hours
3. Create rule for API endpoints (if applicable):
   - Pattern: `*recomnowindia-2gi.caffeine.xyz/api/*`
   - Settings:
     - Cache Level: Bypass

### 10. Security Settings
Configure security without impacting performance:

1. Navigate to **Security** → **Settings**
2. Set **Security Level** to **Medium**
3. Enable **Bot Fight Mode** (free plan) or **Super Bot Fight Mode** (paid plans)

## Verification

After configuration, verify the optimizations:

1. Use **Google PageSpeed Insights** to test performance
2. Check **GTmetrix** for detailed performance metrics
3. Test on mobile devices using **Chrome DevTools** mobile emulation
4. Verify image formats using browser developer tools (Network tab)

## Monitoring

Monitor your site's performance:

1. Use Cloudflare **Analytics** to track performance metrics
2. Monitor **Cache Hit Ratio** (aim for >80%)
3. Check **Bandwidth Savings** from optimization features
4. Review **Web Analytics** for user experience metrics

## Troubleshooting

If you encounter issues:

1. **JavaScript not working**: Disable Rocket Loader temporarily
2. **Images not loading**: Check Polish settings and image URLs
3. **Slow API responses**: Verify cache bypass rules for dynamic content
4. **Mobile issues**: Test with different devices and adjust settings

## Additional Recommendations

1. **Purge Cache** after major updates
2. **Use Development Mode** when testing changes
3. **Monitor Error Logs** in Cloudflare dashboard
4. **Enable Always Online** for better uptime
5. **Configure Custom Error Pages** for better UX

## Performance Targets

After implementing these optimizations, aim for:

- **PageSpeed Score**: 90+ (mobile and desktop)
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **Cumulative Layout Shift**: < 0.1

## Support

For additional help:
- Cloudflare Documentation: https://developers.cloudflare.com/
- Cloudflare Community: https://community.cloudflare.com/
- Contact Cloudflare Support (paid plans)
