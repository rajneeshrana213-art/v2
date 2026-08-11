import Head from 'next/head'
import dynamic from 'next/dynamic'
import Navbar from '@/components/home/navbar/Navbar'
import Footer from '@/components/home/footer/Footer'
import AboutHero from "@/components/about/Hero";

// Dynamic imports for below-fold sections
const AboutVision = dynamic(() => import("@/components/about/Vision"), { ssr: true });
const AboutStory = dynamic(() => import("@/components/about/Story"), { ssr: true });
const AboutValues = dynamic(() => import("@/components/about/Values"), { ssr: false });
const AboutTeam = dynamic(() => import("@/components/about/Team"), { ssr: false });
const AboutCulture = dynamic(() => import("@/components/about/Culture"), { ssr: false });
const AboutJourney = dynamic(() => import("@/components/about/Journey"), { ssr: false });
const AboutCTA = dynamic(() => import("@/components/about/CTA"), { ssr: true });

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>About Us - LearnXChain | Building the Future of Indian Education</title>
        <meta name="description" content="LearnXChain is not just a company — it's a mission to bring transparency, intelligence, and dignity to every school in India." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen relative overflow-hidden bg-white dark:bg-[#0A0E14] transition-colors duration-500">
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

          {/* Ambient Light Orbs */}
          <div
            className="absolute top-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-[#0057C8]/20 via-[#1A9FFF]/15 to-transparent blur-[120px] dark:from-[#0057C8]/10 dark:via-[#1A9FFF]/8 dark:to-transparent animate-pulse"
            style={{ animationDuration: '8s' }}
          />
        </div>

        <Navbar />

        <main className="relative pt-20">
          <AboutHero />

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/50 to-transparent dark:via-[#0C1018]/50" />
            <div className="relative z-10">
              <AboutVision />
            </div>
          </div>

          <AboutStory />

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0057C8]/5 to-transparent dark:via-[#0057C8]/10" />
            <div className="relative z-10">
              <AboutValues />
            </div>
          </div>

          <AboutJourney />

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/50 to-transparent dark:via-[#0C1018]/50" />
            <div className="relative z-10">
              <AboutTeam />
            </div>
          </div>

          <AboutCulture />

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0057C8]/5 to-transparent dark:via-[#0057C8]/10" />
            <div className="relative z-10">
              <AboutCTA />
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}

