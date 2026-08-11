/**
 * Performance Monitoring and Web Vitals
 * Tracks Core Web Vitals (LCP, FID, CLS) and custom metrics
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  url: string;
}

/**
 * Report Web Vitals to analytics
 */
export const reportWebVitals = (metric: any): void => {
  // Only send in production
  if (process.env.NODE_ENV === "production") {
    const payload: PerformanceMetric = {
      name: metric.name,
      value: metric.value,
      timestamp: Date.now(),
      url: typeof window !== "undefined" ? window.location.href : "",
    };

    // Send to analytics endpoint
    fetch("/api/v1/web-vitals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch((err) => console.error("Failed to report vitals:", err));
  }
};

/**
 * Measure component render time
 */
export const measureComponentRender = (
  componentName: string,
): {
  start: () => void;
  end: () => number;
} => {
  let startTime = 0;

  return {
    start: () => {
      startTime = performance.now();
    },
    end: () => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      if (process.env.NODE_ENV === "development") {
        console.log(`${componentName} rendered in ${duration.toFixed(2)}ms`);
      }

      return duration;
    },
  };
};

/**
 * Lazy load images using Intersection Observer API
 */
export const setupLazyLoading = (): void => {
  if (typeof window !== "undefined" && "IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute("data-src");
              imageObserver.unobserve(img);
            }
          }
        });
      },
      {
        rootMargin: "50px",
      },
    );

    document.querySelectorAll("img[data-src]").forEach((img) => {
      imageObserver.observe(img);
    });
  }
};

/**
 * Optimize animations and transitions
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

/**
 * Measure and report Network Information
 */
export const getNetworkStatus = (): {
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
} | null => {
  if (typeof navigator === "undefined") return null;

  const connection =
    (navigator as any).connection || (navigator as any).mozConnection;
  if (!connection) return null;

  return {
    effectiveType: connection.effectiveType,
    downlink: connection.downlink,
    rtt: connection.rtt,
    saveData: connection.saveData,
  };
};

/**
 * Defer non-critical tasks to idle time
 */
export const deferTask = (callback: () => void, timeout = 2000): void => {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    requestIdleCallback(callback, { timeout });
  } else {
    setTimeout(callback, timeout);
  }
};

/**
 * Pre-connect to external domains
 */
export const preconnectToDomain = (domain: string): void => {
  if (typeof document !== "undefined") {
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = domain;
    document.head.appendChild(link);
  }
};
