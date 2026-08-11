import { useState, useEffect, Profiler } from 'react';
import Head from 'next/head';
import type { ProfilerOnRenderCallback } from 'react';
import { Inter, Outfit } from 'next/font/google';
import '@/styles/globals.css'
import 'react-toastify/dist/ReactToastify.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
});
import type { AppProps } from 'next/app'
import { ToastContainer } from 'react-toastify'
import { ThemeProvider, useTheme } from '@/hooks/useTheme'
import { AuthProvider } from '@/lib/context/AuthContext';
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"

function ToastWrapper() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const { theme } = useTheme()

  if (!mounted) return null;

  return (
    <ToastContainer
      position="top-center"
      autoClose={4000}
      hideProgressBar={false}
      newestOnTop={true}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={theme}
      toastClassName="glass-toast"
      className="glass-toast-body"
      progressClassName="glass-toast-progress"
    />
  )
}

function GlobalErrorListener() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const report = {
        message: event.message,
        stack: event.error?.stack || 'No stack trace',
        component: 'GlobalWindowListener',
        url: window.location.href,
        userAgent: navigator.userAgent,
        additionalInfo: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          timestamp: new Date().toISOString()
        }
      };

      fetch('/api/v1/report-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report)
      }).catch(err => console.error("Failed to report global error:", err));
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const report = {
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack || 'No stack trace',
        component: 'GlobalPromiseListener',
        url: window.location.href,
        userAgent: navigator.userAgent,
        additionalInfo: {
          reason: event.reason,
          timestamp: new Date().toISOString()
        }
      };

      fetch('/api/v1/report-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report)
      }).catch(err => console.error("Failed to report promise rejection:", err));
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  return null;
}

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const SLOW_RENDER_THRESHOLD_MS = 50;

const onRenderCallback: ProfilerOnRenderCallback = (
  id,
  _phase,
  actualDuration,
) => {
  if (actualDuration > SLOW_RENDER_THRESHOLD_MS) {
    console.warn(`[PERF][UI] ${id} - ${actualDuration.toFixed(2)}ms`);
  }
};

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.performance) {
      performance.mark('app-render-start');
      const onLoad = () => {
        performance.mark('app-render-end');
        performance.measure('app-render', 'app-render-start', 'app-render-end');
        const [entry] = performance.getEntriesByName('app-render');
        if (entry) {
          console.info(`[PERF][UI] App - ${entry.duration.toFixed(2)}ms`);
        }
      };
      if (document.readyState === 'complete') {
        onLoad();
      } else {
        window.addEventListener('load', onLoad, { once: true });
      }
    }
  }, []);

  return (
    <main className={`${inter.variable} ${outfit.variable} font-sans`}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Analytics />
      <SpeedInsights />
      <QueryClientProvider client={queryClient}>
        <SessionProvider session={session}>
          <AuthProvider>
            <ThemeProvider>
              <GlobalErrorListener />
              <Profiler id="App" onRender={onRenderCallback}>
                <Component {...pageProps} />
              </Profiler>
              <ToastWrapper />
            </ThemeProvider>
          </AuthProvider>
        </SessionProvider>
      </QueryClientProvider>
    </main>
  );
}

export function reportWebVitals(metric: any) {
  // Disabled custom fetch because it causes an infinite loop in some scenarios, 
  // and Vercel Analytics/SpeedInsights are already handling Web Vitals natively.
  // console.log(metric);
}

