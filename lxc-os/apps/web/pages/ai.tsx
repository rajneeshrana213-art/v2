import Head from 'next/head'
import dynamic from 'next/dynamic'
import Navbar from '@/components/home/navbar/Navbar'
import Footer from '@/components/home/footer/Footer'
import AIHero from "@/components/ai/Hero/Hero";

// Dynamic imports for heavy components
const AIWhy = dynamic(() => import("@/components/ai/Why/Why"), { ssr: true });
const AICapabilities = dynamic(() => import("@/components/ai/Capabilities/Capabilities"), { ssr: true });
const AIUseCases = dynamic(() => import("@/components/ai/UseCases/UseCases"), { ssr: false });
const AIArchitecture = dynamic(() => import("@/components/ai/Architecture/Architecture"), { ssr: false });
const AITrust = dynamic(() => import("@/components/ai/Trust/Trust"), { ssr: false });
const AICTA = dynamic(() => import("@/components/ai/CTA/CTA"), { ssr: true });

export default function AIPage() {
  return (
    <>
      <Head>
        <title>RIT AI - LearnXChain | India's First AI Student Growth Operating System</title>
        <meta name="description" content="LXC-AI V1.0 — 22 AI modules across 6 macro layers. Academic intelligence, adaptive learning, career discovery, gamification, Bharat Mode, and skill economy in one unified platform for Indian schools." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen bg-white dark:bg-[#0B0E14] transition-colors duration-300">
        <Navbar />
        <AIHero />
        <AIWhy />
        <AICapabilities />
        <AIUseCases />
        <AIArchitecture />
        <AITrust />
        <AICTA />
        <Footer />
      </div>
    </>
  );
}

