import { useEffect, useState, useRef } from 'react';

/**
 * useIntersectionObserver - Hook to detect when element enters viewport
 *
 * Useful for lazy loading images, infinite scroll, or triggering animations
 * when elements become visible.
 *
 * @param {object} options - IntersectionObserver options
 * @param {number} options.threshold - Percentage of element visible (0-1)
 * @param {string} options.root - Root element (default: viewport)
 * @param {string} options.rootMargin - Margin around root
 * @returns {object} - { ref, isIntersecting, hasIntersected }
 *
 * @example
 * const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.5 });
 *
 * return (
 *   <div ref={ref}>
 *     {isIntersecting && <HeavyComponent />}
 *   </div>
 * );
 */
export function useIntersectionObserver(options = {}) {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0px',
    freezeOnceVisible = false
  } = options;

  const ref = useRef(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // If already intersected and frozen, don't observe
    if (freezeOnceVisible && hasIntersected) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting;

        setIsIntersecting(isElementIntersecting);

        if (isElementIntersecting) {
          setHasIntersected(true);

          // Disconnect if we only want to trigger once
          if (freezeOnceVisible) {
            observer.disconnect();
          }
        }
      },
      { threshold, root, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, root, rootMargin, freezeOnceVisible, hasIntersected]);

  return { ref, isIntersecting, hasIntersected };
}

export default useIntersectionObserver;
