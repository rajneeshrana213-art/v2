import Head from 'next/head'
import dynamic from 'next/dynamic'
import Navbar from '@/components/home/navbar/Navbar'
import Footer from '@/components/home/footer/Footer'
import { ProjectMarquee } from '@/components/projects/ProjectMarquee'
import { projects } from '@/lib/projectsData'
import { motion } from 'framer-motion'

// Dynamic import for CTA section
const ServicesCTA = dynamic(() => import('@/components/services/ServicesCTA'), { ssr: false })

export default function ProjectsPage() {
    const row1 = [...projects];
    const row2 = [...projects].reverse();

    return (
        <>
            <Head>
                <title>Our Projects - LearnXChain | AI, Blockchain & Full-Stack Development</title>
                <meta
                    name="description"
                    content="Experience the excellence of LearnXChain through our diverse portfolio of 150+ successfully delivered projects across AI, Blockchain, and Web Development."
                />
            </Head>

            <div className="min-h-screen bg-white dark:bg-[#0A0E14] transition-colors duration-300 w-full overflow-x-hidden">
                <Navbar />

                <main className="pt-32 pb-20 w-full overflow-x-hidden">
                    {/* Hero Section */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <span className="inline-block px-4 py-1.5 text-sm font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 rounded-full border border-indigo-200/60 dark:border-indigo-500/20 mb-6">
                                150+ Projects Delivered
                            </span>
                            <h1 className="text-5xl sm:text-7xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
                                Our <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">Creative</span> Portfolio
                            </h1>
                            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                                From revolutionary AI operating systems to premium law firm platforms, we build digital experiences that drive growth and innovation.
                            </p>
                        </motion.div>
                    </div>

                    {/* Infinite Marquees */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden rounded-[2rem] border border-gray-100 dark:border-white/5 py-8">
                        <div className="space-y-8">
                            <ProjectMarquee projects={row1} direction="left" speed={50} />
                            <ProjectMarquee projects={row2} direction="right" speed={60} />
                        </div>
                    </div>

                    {/* Bottom CTA Area */}
                    <div className="mt-20">
                        <ServicesCTA />
                    </div>
                </main>

                <Footer />
            </div>
        </>
    );
}
