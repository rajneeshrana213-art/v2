import Head from 'next/head'
import dynamic from 'next/dynamic'
import { motion } from "framer-motion";
import Navbar from "@/components/home/navbar/Navbar";
import Footer from "@/components/home/footer/Footer";
import ResourcesHero from "@/components/resources/Hero";

// Dynamic imports for below-fold sections
const ResourcesCategories = dynamic(() => import("@/components/resources/Categories"), { ssr: true });
const ResourcesFeatured = dynamic(() => import("@/components/resources/Featured"), { ssr: true });
const ResourcesGuides = dynamic(() => import("@/components/resources/Guides"), { ssr: false });
const ResourcesCaseStudies = dynamic(() => import("@/components/resources/CaseStudies"), { ssr: false });
const ResourcesDownloads = dynamic(() => import("@/components/resources/Downloads"), { ssr: false });
const ResourcesCommunity = dynamic(() => import("@/components/resources/Community"), { ssr: false });
const ResourcesCTA = dynamic(() => import("@/components/resources/CTA"), { ssr: true });

export default function ResourcesPage() {
    return (
        <>
            <Head>
                <title>Resources - LearnXChain</title>
                <meta name="description" content="Resources and guides for LearnXChain - Learn how to get the most out of your school management platform." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div className="min-h-screen bg-white dark:bg-[#0B0E14] transition-colors duration-300 relative">
                {/* Global Page Background Architecture */}
                <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                    {/* Radial Mesh Gradient */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#0057C815_0%,transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_-20%,#0057C820_0%,transparent_50%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_40%,#5CDD2B08_0%,transparent_40%)] dark:bg-[radial-gradient(circle_at_80%_40%,#5CDD2B10_0%,transparent_40%)]" />
                    
                    {/* Static Grid Pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
                    
                    {/* Animated Ambient Light Orbs */}
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.1, 0.2, 0.1],
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#0057C8] rounded-full blur-[120px]"
                    />
                </div>

                <div className="relative z-10">
                    <Navbar />
                    
                    {/* Section wrappers with alternating gradients */}
                    <div className="bg-transparent">
                        <ResourcesHero />
                    </div>

                    <div className="bg-gradient-to-b from-transparent via-[#0057C8]/5 to-transparent dark:via-[#0057C8]/5">
                        <ResourcesCategories />
                    </div>

                    <div className="bg-transparent">
                        <ResourcesFeatured />
                    </div>

                    <div className="bg-gradient-to-b from-transparent via-[#5CDD2B]/5 to-transparent dark:via-[#5CDD2B]/5">
                        <ResourcesGuides />
                    </div>

                    <div className="bg-transparent">
                        <ResourcesCaseStudies />
                    </div>

                    <div className="bg-gradient-to-b from-transparent via-[#0057C8]/5 to-transparent dark:via-[#0057C8]/5">
                        <ResourcesDownloads />
                    </div>

                    <div className="bg-transparent">
                        <ResourcesCommunity />
                    </div>

                    <div className="bg-gradient-to-b from-transparent via-[#1A9FFF]/5 to-transparent dark:via-[#1A9FFF]/5">
                        <ResourcesCTA />
                    </div>

                    <Footer />
                </div>
            </div>
        </>
    );
}
