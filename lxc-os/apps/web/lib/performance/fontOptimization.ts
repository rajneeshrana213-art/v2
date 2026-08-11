/**
 * Font Optimization Utilities
 * Implements optimal font loading strategies
 */

/**
 * Font loading strategy for Next.js
 * Use font-display: swap for best performance
 */
export const fontLoadingStrategy = {
  swap: "font-display: swap;",
  fallback: "font-display: fallback;",
  optional: "font-display: optional;",
} as const;

/**
 * Preload critical fonts for faster text rendering
 */
export const preloadCriticalFonts = (): void => {
  if (typeof document !== "undefined") {
    const criticalFonts = [
      {
        href: "/fonts/inter-var-latin.woff2",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
    ];

    criticalFonts.forEach((font) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.href = font.href;
      link.as = font.as;
      link.type = font.type;
      link.crossOrigin = font.crossOrigin;
      document.head.appendChild(link);
    });
  }
};

/**
 * Font subset optimization for reducing file sizes
 */
export const fontSubsets = {
  latin: "Latin characters for English and European languages",
  "latin-ext": "Extended Latin for Central/Eastern European languages",
  cyrillic: "For Russian and other Cyrillic languages",
  greek: "For Greek language support",
  vietnamese: "For Vietnamese language support",
} as const;

/**
 * Get optimal font weight and style combinations
 */
export const getOptimalFontVariants = () => {
  return [
    { weight: 400, style: "normal", priority: true }, // Regular - most critical
    { weight: 500, style: "normal", priority: true }, // Medium
    { weight: 600, style: "normal", priority: false }, // Semi-bold
    { weight: 700, style: "normal", priority: false }, // Bold
  ];
};

/**
 * CSS for font loading optimization
 */
export const fontOptimizationCSS = `
  /* Prevent FOUT (Flash of Unstyled Text) */
  @font-face {
    font-family: 'InterVar';
    src: url('/fonts/inter-var-latin.woff2') format('woff2-variations');
    font-weight: 100 900;
    font-style: normal;
    font-display: swap;
  }

  /* Fallback for older browsers */
  @supports not (font-variation-settings: normal) {
    @font-face {
      font-family: 'InterVar';
      src: url('/fonts/inter-400.woff2') format('woff2');
      font-weight: 400;
      font-style: normal;
      font-display: swap;
    }
  }

  /* Critical font priority */
  body {
    font-family: 'InterVar', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-weight: 400;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
  }
`;

/**
 * Monitor font loading performance
 */
export const monitorFontPerformance = (): void => {
  if (typeof document !== "undefined" && "fonts" in document) {
    (document as any).fonts.ready.then(() => {
      console.log("All fonts loaded");
      // Track in analytics
      if (window.performance?.mark) {
        window.performance.mark("fonts-ready");
      }
    });
  }
};
