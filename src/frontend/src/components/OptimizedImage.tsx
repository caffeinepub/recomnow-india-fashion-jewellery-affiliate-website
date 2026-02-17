import { useState, useEffect, useRef } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
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
  sizes,
  onError,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Enhanced Intersection Observer with optimized threshold for preloading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.disconnect();
          }
        });
      },
      {
        rootMargin: '200px', // Preload images 200px before viewport entry
        threshold: 0.01,
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setHasError(true);
    const img = e.currentTarget;
    
    // Try fallback chain: AVIF -> WebP -> PNG
    if (img.src.includes('.avif')) {
      img.src = img.src.replace('.avif', '.webp');
    } else if (img.src.includes('.webp')) {
      img.src = img.src.replace('.webp', '.png');
    } else if (onError) {
      onError(e);
    }
  };

  // Generate optimized sizes attribute for responsive images
  const defaultSizes = sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';

  // For external URLs, use as-is; for local assets, generate responsive versions
  const isExternalUrl = src.startsWith('http://') || src.startsWith('https://');

  // Prefer AVIF, then WebP for local PNG assets
  const avifSrc = !isExternalUrl && src.endsWith('.png') ? src.replace('.png', '.avif') : null;
  const webpSrc = !isExternalUrl && src.endsWith('.png') ? src.replace('.png', '.webp') : null;
  const fallbackSrc = src;

  // For priority images, ensure they're visible immediately (no opacity transition)
  const imageClassName = priority 
    ? className 
    : `${className} ${!isLoaded && isInView ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`;

  return (
    <picture>
      {/* AVIF format for best compression (modern browsers) */}
      {isInView && !hasError && avifSrc && (
        <source
          type="image/avif"
          srcSet={avifSrc}
          sizes={defaultSizes}
        />
      )}
      
      {/* WebP format for good compression (most browsers) */}
      {isInView && !hasError && webpSrc && (
        <source
          type="image/webp"
          srcSet={webpSrc}
          sizes={defaultSizes}
        />
      )}
      
      {/* Fallback to original format */}
      <img
        ref={imgRef}
        src={isInView ? fallbackSrc : ''}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        className={imageClassName}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          contentVisibility: priority ? 'visible' : 'auto',
          containIntrinsicSize: width && height ? `${width}px ${height}px` : 'auto',
        }}
        sizes={defaultSizes}
      />
    </picture>
  );
}
