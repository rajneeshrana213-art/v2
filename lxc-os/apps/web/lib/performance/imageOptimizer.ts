/**
 * Image Optimization Utilities
 * Provides helpers for responsive images and lazy loading
 */

export interface ImageConfig {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
  sizes?: string;
}

/**
 * Generate responsive sizes string for adaptive image loading
 * Usage: <Image sizes={getResponsiveSizes('full')} ... />
 */
export const getResponsiveSizes = (
  variant: "full" | "half" | "third" | "quarter" = "full",
): string => {
  const sizeMap = {
    full: "(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 100vw",
    half: "(max-width: 640px) 100vw, (max-width: 1024px) 45vw, 50vw",
    third: "(max-width: 640px) 100vw, (max-width: 1024px) 30vw, 33vw",
    quarter: "(max-width: 640px) 100vw, (max-width: 1024px) 22vw, 25vw",
  };
  return sizeMap[variant];
};

/**
 * Determine if an image should be prioritized in LCP
 * Priority images load eagerly, others load lazily
 */
export const shouldPrioritizeImage = (
  imageIndex: number,
  isAboveFold: boolean,
): boolean => {
  return isAboveFold && imageIndex < 2;
};

/**
 * Get optimized image quality for different contexts
 */
export const getImageQuality = (
  context: "thumbnail" | "card" | "hero" | "fullscreen",
): number => {
  const qualityMap = {
    thumbnail: 70,
    card: 75,
    hero: 85,
    fullscreen: 90,
  };
  return qualityMap[context];
};

/**
 * Preload critical images for faster rendering
 */
export const preloadImage = (src: string): void => {
  if (typeof window !== "undefined") {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = src;
    document.head.appendChild(link);
  }
};

/**
 * Generate srcSet for multiple resolutions
 */
export const generateSrcSet = (
  src: string,
  resolutions: number[] = [1, 2],
): string => {
  return resolutions
    .map(
      (resolution) => `${src}?w=${Math.round(800 * resolution)} ${resolution}x`,
    )
    .join(", ");
};
