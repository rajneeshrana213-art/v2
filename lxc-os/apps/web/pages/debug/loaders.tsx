import React from 'react';
import Head from 'next/head';
import { Loader } from '@/components/ui/feedback/Loader';

export default function LoaderPreviewPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-8 sm:p-20">
            <Head>
                <title>Loader Preview | LearnXChain</title>
            </Head>

            <div className="max-w-4xl mx-auto space-y-12">
                <header>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Loader Preview</h1>
                    <p className="text-gray-500 mt-2 font-medium">Testing the custom spinning arc loader component</p>
                </header>

                {/* Primary Variant */}
                <section className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-white/10 pb-2">Primary Variant (Indigo)</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-end bg-white dark:bg-white/5 p-10 rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm">
                        <div className="flex flex-col items-center gap-4">
                            <Loader size="sm" />
                            <span className="text-xs font-bold text-gray-400 uppercase">Small (sm)</span>
                        </div>
                        <div className="flex flex-col items-center gap-4">
                            <Loader size="md" />
                            <span className="text-xs font-bold text-gray-400 uppercase">Medium (md)</span>
                        </div>
                        <div className="flex flex-col items-center gap-4">
                            <Loader size="lg" />
                            <span className="text-xs font-bold text-gray-400 uppercase">Large (lg)</span>
                        </div>
                        <div className="flex flex-col items-center gap-4">
                            <Loader size="xl" />
                            <span className="text-xs font-bold text-gray-400 uppercase">Extra Large (xl)</span>
                        </div>
                    </div>
                </section>

                {/* White Variant */}
                <section className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-white/10 pb-2">White Variant (On Dark)</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-end bg-indigo-600 p-10 rounded-3xl shadow-xl shadow-indigo-500/20">
                        <div className="flex flex-col items-center gap-4">
                            <Loader size="sm" variant="white" />
                            <span className="text-xs font-bold text-indigo-200 uppercase">Small (sm)</span>
                        </div>
                        <div className="flex flex-col items-center gap-4">
                            <Loader size="md" variant="white" />
                            <span className="text-xs font-bold text-indigo-200 uppercase">Medium (md)</span>
                        </div>
                        <div className="flex flex-col items-center gap-4">
                            <Loader size="lg" variant="white" />
                            <span className="text-xs font-bold text-indigo-200 uppercase">Large (lg)</span>
                        </div>
                        <div className="flex flex-col items-center gap-4">
                            <Loader size="xl" variant="white" />
                            <span className="text-xs font-bold text-indigo-200 uppercase">Extra Large (xl)</span>
                        </div>
                    </div>
                </section>

                {/* Real World Usage Examples */}
                <section className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-white/10 pb-2">Usage Context</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 flex items-center justify-center min-h-[200px]">
                            <div className="text-center space-y-4">
                                <Loader size="lg" />
                                <p className="text-sm font-semibold text-gray-500">Loading your dashboard...</p>
                            </div>
                        </div>
                        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 flex items-center justify-center min-h-[200px]">
                            <button className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-3 shadow-lg shadow-indigo-500/30">
                                <Loader size="sm" variant="white" />
                                Processing Request...
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
