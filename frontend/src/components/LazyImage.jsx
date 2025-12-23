import { useState } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

/**
 * LazyImage - Image component with lazy loading
 *
 * Only loads the image when it enters the viewport, improving initial page load
 * performance. Shows a placeholder while loading.
 *
 * @param {object} props
 * @param {string} props.src - Image source URL
 * @param {string} props.alt - Alt text
 * @param {string} props.className - CSS classes
 * @param {string} props.placeholderSrc - Placeholder image (optional)
 * @param {function} props.onLoad - Callback when image loads
 * @param {function} props.onError - Callback on load error
 */
const LazyImage = ({
  src,
  alt = '',
  className = '',
  placeholderSrc = null,
  onLoad = null,
  onError = null,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Only start loading when image enters viewport
  const { ref, isIntersecting, hasIntersected } = useIntersectionObserver({
    threshold: 0.01,
    freezeOnceVisible: true
  });

  const handleLoad = (e) => {
    setIsLoaded(true);
    onLoad && onLoad(e);
  };

  const handleError = (e) => {
    setHasError(true);
    onError && onError(e);
  };

  // Determine which image to show
  const shouldLoadImage = isIntersecting || hasIntersected;
  const imageSrc = shouldLoadImage ? src : (placeholderSrc || '');

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      {/* Loading placeholder */}
      {!isLoaded && !hasError && shouldLoadImage && (
        <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 animate-pulse" />
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <div className="text-center text-slate-500 dark:text-slate-400">
            <svg
              className="w-12 h-12 mx-auto mb-2 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm">Failed to load image</p>
          </div>
        </div>
      )}

      {/* Actual image */}
      {shouldLoadImage && (
        <img
          src={imageSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`
            w-full h-full object-cover transition-opacity duration-300
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
          `}
          loading="lazy" // Native lazy loading as fallback
        />
      )}

      {/* Placeholder when not in viewport */}
      {!shouldLoadImage && (
        <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700" />
      )}
    </div>
  );
};

export default LazyImage;
