import Head from 'next/head'
import dynamic from 'next/dynamic'
import Navbar from '@/components/home/navbar/Navbar'
import Footer from '@/components/home/footer/Footer'
import ServicesHero from '@/components/services/ServicesHero'

// Dynamic imports for heavy sections
const ServicesGrid = dynamic(() => import('@/components/services/ServicesGrid'), { ssr: true });
const OurProcess = dynamic(() => import('@/components/services/OurProcess'), { ssr: true });
const TechStack = dynamic(() => import('@/components/services/TechStack'), { ssr: false });
const OurClients = dynamic(() => import('@/components/services/OurClients'), { ssr: false });
const OurProjects = dynamic(() => import('@/components/services/OurProjects'), { ssr: false });
const ServicesCTA = dynamic(() => import('@/components/services/ServicesCTA'), { ssr: true });

export default function ServicesPage() {
    return (
        <>
            <Head>
                <title>Our Services - LearnXChain | AI, Blockchain & Full-Stack Development</title>
                <meta
                    name="description"
                    content="LearnXChain offers end-to-end digital services: AI Development, Blockchain, Web & App Development, UI/UX Design, and Digital Marketing. 150+ projects delivered."
                />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
                {/* OG */}
                <meta property="og:title" content="Our Services - LearnXChain" />
                <meta property="og:description" content="AI, Blockchain, Web, App, UI/UX & Digital Marketing services. 50+ clients. 150+ projects. Let's build your digital future." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://learnxchain.io/services" />
            </Head>

            <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-white via-gray-50/50 to-white dark:from-[#0A0E14] dark:via-[#0F1419] dark:to-[#0A0E14] transition-colors duration-500">
                {/* Enhanced Background Layer */}
                <div className="fixed inset-0 -z-10 pointer-events-none">
                    {/* Gradient Mesh */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(0,87,200,0.15),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(0,87,200,0.08),transparent)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,rgba(26,159,255,0.12),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,rgba(26,159,255,0.06),transparent)]" />

                    {/* Subtle Grid Pattern */}
                    <div
                        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]"
                        style={{
                            backgroundImage: `
                            linear-gradient(rgba(0, 87, 200, 0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0, 87, 200, 0.1) 1px, transparent 1px)
                            `,
                            backgroundSize: '60px 60px',
                        }}
                    />

                    {/* Ambient Light Orbs */}
                    <div
                        className="absolute top-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-[#0057C8]/20 via-[#1A9FFF]/15 to-transparent blur-[120px] dark:from-[#0057C8]/10 dark:via-[#1A9FFF]/8 dark:to-transparent animate-pulse"
                        style={{ animationDuration: '8s' }}
                    />
                </div>

                <div className="relative z-0">
                    <Navbar />
                    <ServicesHero />
                    
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/50 to-transparent dark:via-[#0F1419]/50" />
                        <div className="relative z-10">
                            <ServicesGrid />
                        </div>
                    </div>

                    <OurProcess />

                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0057C8]/5 to-transparent dark:via-[#0057C8]/10" />
                        <div className="relative z-10">
                            <TechStack />
                        </div>
                    </div>

                    <OurClients />

                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/50 to-transparent dark:via-[#0F1419]/50" />
                        <div className="relative z-10">
                            <OurProjects />
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1A9FFF]/5 to-transparent dark:via-[#1A9FFF]/10" />
                        <div className="relative z-10">
                            <ServicesCTA />
                        </div>
                    </div>

                    <Footer />
                </div>
            </div>
        </>
    );
}
