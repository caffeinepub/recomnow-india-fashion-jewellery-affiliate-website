/**
 * OptimizedImage component for Core Web Vitals optimization.
 * - Uses native browser lazy loading (loading="lazy") for below-fold images
 * - Hero/LCP images use loading="eager" + fetchpriority="high"
 * - <picture> element with WebP source + PNG/JPEG fallback
 * - Explicit width/height to prevent CLS (Cumulative Layout Shift)
 * - aspect-ratio CSS for layout space reservation
 */

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  /** Set to true for the hero/LCP image to apply fetchpriority="high" and loading="eager" */
  priority?: boolean;
  /** Override loading attribute; defaults to "lazy" for non-priority, "eager" for priority */
  loading?: 'lazy' | 'eager';
  sizes?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

export default function OptimizedImage({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  loading,
  sizes,
  onError,
}: OptimizedImageProps) {
  // Determine loading strategy: priority images are always eager
  const loadingAttr: 'lazy' | 'eager' = loading ?? (priority ? 'eager' : 'lazy');

  // For external URLs, use as-is; for local PNG assets, generate WebP variant
  const isExternalUrl = src.startsWith('http://') || src.startsWith('https://');
  const webpSrc = !isExternalUrl && src.endsWith('.png') ? src.replace('.png', '.webp') : null;

  // Responsive sizes hint
  const defaultSizes = sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';

  // Inline aspect-ratio to reserve layout space and prevent CLS
  const containerStyle: React.CSSProperties = width && height
    ? { aspectRatio: `${width} / ${height}`, width: '100%' }
    : {};

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    // Fallback chain: WebP → PNG
    if (img.src.includes('.webp')) {
      img.src = img.src.replace('.webp', '.png');
    } else if (onError) {
      onError(e);
    }
  };

  return (
    <picture style={containerStyle}>
      {/* WebP source for modern browsers */}
      {webpSrc && (
        <source
          type="image/webp"
          srcSet={webpSrc}
          sizes={defaultSizes}
          width={width}
          height={height}
        />
      )}
      {/* Fallback to original format (PNG/JPEG) */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={loadingAttr}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        className={className}
        onError={handleError}
        sizes={defaultSizes}
        style={
          width && height
            ? { width: '100%', height: '100%', objectFit: 'cover' }
            : undefined
        }
      />
    </picture>
  );
}
