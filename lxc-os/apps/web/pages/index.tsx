import Head from 'next/head'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Navbar from '@/components/home/navbar/Navbar'
import Hero from '@/components/home/hero/Hero'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth, ROLE_DASHBOARDS } from '@/lib/context/AuthContext'
import { useTheme } from '@/hooks/useTheme'
import DynamicSEO from '@/components/seo/DynamicSEO'
import { getSeoMetadata, SeoData } from '@/lib/seo/MetadataEngine'

// Dynamic imports for below-fold sections - these are lazy loaded
const Stats = dynamic(() => import('@/components/home/stats/Stats'), { ssr: false })
const ProblemSolution = dynamic(() => import('@/components/home/problem/ProblemSolution'), { ssr: false })
const Modules = dynamic(() => import('@/components/home/modules/Modules'), { ssr: false })
const AIBlockchain = dynamic(() => import('@/components/home/ai/AIBlockchain'), { ssr: false })
const WhyLearnXChain = dynamic(() => import('@/components/home/why/WhyLearnXChain'), { ssr: false })
const Pricing = dynamic(() => import('@/components/home/pricing/Pricing'), { ssr: false })
const Testimonials = dynamic(() => import('@/components/home/testimonials/Testimonials'), { ssr: false })
const DownloadApp = dynamic(() => import('@/components/home/downloadapp/DownloadApp'), { ssr: false })
const StudentLifecycle = dynamic(() => import('@/components/home/lifecycle/StudentLifecycle'), { ssr: false })
const CTA = dynamic(() => import('@/components/home/cta/CTA'), { ssr: false })
const Footer = dynamic(() => import('@/components/home/footer/Footer'), { ssr: false })

export async function getStaticProps() {
  const seo = await getSeoMetadata('/');
  return {
    props: {
      seo
    },
    revalidate: 60, // revalidate every 60 seconds
  };
}

interface HomeProps {
  seo: SeoData | null;
}

// import MaintenancePage from '@/components/home/MaintenancePage'

// export default function Home() {
//   return <MaintenancePage />
// }



export default function Home({ seo }: HomeProps) {
  const [showScrollTop, setShowScrollTop] = useState(false)
  const { theme } = useTheme()

  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 600)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <DynamicSEO seo={seo} />
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div
        className="min-h-screen relative overflow-hidden bg-gradient-to-b from-white via-gray-50/50 to-white dark:from-[#0A0E14] dark:via-[#0F1419] dark:to-[#0A0E14] transition-colors duration-500"
      >
        {/* Lightweight Background Layer */}
        <div className="fixed inset-0 -z-10 pointer-events-none">
          {/* Single gradient mesh */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(0,87,200,0.15),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(0,87,200,0.08),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,rgba(26,159,255,0.12),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,rgba(26,159,255,0.06),transparent)]" />

          {/* Static Grid Pattern */}
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

          {/* Single Ambient Light Orb - CSS animation instead of framer-motion */}
          <div
            className="absolute top-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-[#0057C8]/20 via-[#1A9FFF]/15 to-transparent blur-[120px] dark:from-[#0057C8]/10 dark:via-[#1A9FFF]/8 dark:to-transparent animate-pulse"
            style={{ animationDuration: '8s' }}
          />
        </div>

        {/* Content */}
        <div className="relative z-0">
          <Navbar />
          <Hero />
          <Stats />

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/50 to-transparent dark:via-[#0F1419]/50" />
            <div className="relative z-10">
              <ProblemSolution />
            </div>
          </div>

          <Modules />

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-50/30 to-transparent dark:via-indigo-950/20" />
            <div className="relative z-10">
              <AIBlockchain />
            </div>
          </div>

          <WhyLearnXChain />

          <StudentLifecycle />

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/50 to-transparent dark:via-[#0F1419]/50" />
            <div className="relative z-10">
              <Pricing />
            </div>
          </div>

          <Testimonials />

          <DownloadApp />

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-50/40 to-transparent dark:via-purple-950/30" />
            <div className="relative z-10">
              <CTA />
            </div>
          </div>

          <Footer />
        </div>

        {/* Scroll Progress Indicator - lightweight CSS */}
        <div
          className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0057C8] via-[#1A9FFF] to-[#5CDD2B] dark:from-[#1A9FFF] dark:via-[#55CFFF] dark:to-[#5CDD2B] z-40 origin-left"
          style={{ transform: 'scaleX(0)' }}
          id="scroll-progress"
        />

        {/* Scroll To Top Button */}
        {showScrollTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 z-40 rounded-full bg-white/90 dark:bg-[#050814]/95 border border-gray-200/70 dark:border-white/15 shadow-lg shadow-indigo-500/20 backdrop-blur-xl px-4 py-3 flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100 transition-all duration-300 hover:scale-105"
            aria-label="Scroll to top"
          >
            <span className="flex h-5 w-5 rounded-full bg-gradient-to-b from-[#0057C8] to-[#1A9FFF] items-center justify-center text-white text-xs">
              ↑
            </span>
            <span className="hidden sm:inline">Back to top</span>
          </button>
        )}
      </div>
    </>
  )
}


