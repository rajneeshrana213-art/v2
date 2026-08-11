import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import 'animate.css';
import 'katex/dist/katex.min.css';
import { ThemeProvider } from '@/lib/hooks/use-theme';
import { I18nProvider } from '@/lib/hooks/use-i18n';
import { Toaster } from '@/components/ui/sonner';
import { ServerProvidersInit } from '@/components/server-providers-init';
import { Providers } from './providers';

import { Outfit, Syne, Kalam } from 'next/font/google';

const inter = localFont({
  src: '../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2',
  variable: '--font-sans',
  weight: '100 900',
});

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
});

const syne = Syne({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-syne',
});

const kalam = Kalam({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-kalam',
});

export const metadata: Metadata = {
  title: 'RIT — Powered By LearnXChain',
  description:
    'The RIT AI interactive classroom. Upload a PDF to instantly generate an immersive, multi-agent learning experience.',
  icons: {
    icon: '/logo.svg',
  },
  other: {
    google: 'notranslate',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" translate="no" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Blocking inline script — applies theme class BEFORE React hydrates to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var isDark = stored === 'dark' || ((!stored || stored === 'system') && prefersDark);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} ${outfit.variable} ${syne.variable} ${kalam.variable} antialiased notranslate`}
        suppressHydrationWarning
      >
        <Providers>
          <ThemeProvider>
            <I18nProvider>
              <ServerProvidersInit />
              {children}
              <Toaster position="top-center" />
            </I18nProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
