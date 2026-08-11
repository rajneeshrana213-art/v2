import Head from 'next/head'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Navbar from '@/components/home/navbar/Navbar'
import Footer from '@/components/home/footer/Footer'
import ProductHero from "@/components/product/Hero/Hero";
import { useTheme } from '@/hooks/useTheme'

// Dynamic imports for heavy components - loaded on demand
const ProductOverview = dynamic(() => import("@/components/product/Overview/Overview"), { ssr: true });
const ProductModules = dynamic(() => import("@/components/product/Modules/Modules"), { ssr: true });
const ProductAI = dynamic(() => import("@/components/product/AI/AI"), { ssr: false });
const ProductBlockchain = dynamic(() => import("@/components/product/Blockchain/Blockchain"), { ssr: false });
const ProductWorkflow = dynamic(() => import("@/components/product/Workflow/Workflow"), { ssr: false });
const ProductSecurity = dynamic(() => import("@/components/product/Security/Security"), { ssr: true });
const ProductCTA = dynamic(() => import("@/components/product/CTA/CTA"), { ssr: true });

export default function ProductPage() {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      <Head>
        <title>Product - LearnXChain | AI-First School Operating System</title>
        <meta name="description" content="LearnXChain product overview - Discover how our AI-powered platform transforms school management with integrated modules, blockchain trust, and intelligent automation." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen relative overflow-hidden bg-gradient-to-b from-white via-gray-50/50 to-white dark:from-[#0A0E14] dark:via-[#0F1419] dark:to-[#0A0E14] transition-colors duration-500"
      >
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
          <ProductHero />
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/50 to-transparent dark:via-[#0F1419]/50" />
            <div className="relative z-10">
              <ProductOverview />
            </div>
          </div>

          <ProductModules />

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0057C8]/5 to-transparent dark:via-[#0057C8]/10" />
            <div className="relative z-10">
              <ProductAI />
            </div>
          </div>

          <ProductBlockchain />

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/50 to-transparent dark:via-[#0F1419]/50" />
            <div className="relative z-10">
              <ProductWorkflow />
            </div>
          </div>

          <ProductSecurity />

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1A9FFF]/5 to-transparent dark:via-[#1A9FFF]/10" />
            <div className="relative z-10">
              <ProductCTA />
            </div>
          </div>

          <Footer />
        </div>
      </motion.div>
    </>
  );
}

