import { useRouter } from 'next/router'
import Head from 'next/head'

export default function NotFound() {
    const router = useRouter()

    return (
        <>
            <Head>
                <title>404 - Page Not Found</title>
                <meta name="description" content="Page not found" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
                <div className="text-center">
                    <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">Page not found</p>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                    >
                        Go back home
                    </button>
                </div>
            </div>
        </>
    )
}
