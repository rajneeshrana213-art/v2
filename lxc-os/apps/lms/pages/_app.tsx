import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { Inter } from 'next/font/google';
import { Provider } from 'react-redux';
import { SessionProvider } from 'next-auth/react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { store } from '../lib/state/store';
import '../styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});


// Configure Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <div className={`${inter.variable} font-sans`}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Rit LMS</title>
        <link rel="icon" href="/favicon.png" />
      </Head>
      <QueryClientProvider client={queryClient}>
        <SessionProvider session={session}>
          <Provider store={store}>
            <div className="flex min-h-screen w-screen flex-col bg-richblack-900 font-inter">
              <Component {...pageProps} />
              <Toaster position="top-center" />
            </div>
          </Provider>
        </SessionProvider>
      </QueryClientProvider>
    </div>
  );
}
