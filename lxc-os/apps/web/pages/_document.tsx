import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
    return (
        <Html lang="en">
            <Head>

                {/* Preconnect to critical origins */}

                {/* Preconnect to critical origins */}
                <link rel="icon" href="/favicon.ico" />
                <meta name="theme-color" content="#071B2C" />
            </Head>
            <body className="antialiased bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}
