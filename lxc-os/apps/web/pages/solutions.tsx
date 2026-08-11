import Head from 'next/head'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Navbar from '@/components/home/navbar/Navbar'
import Footer from '@/components/home/footer/Footer'
import SolutionsHero from "@/components/solutions/Hero/Hero";
import { useTheme } from '@/hooks/useTheme'

// Dynamic imports for heavy sections
const SolutionsByRole = dynamic(() => import("@/components/solutions/ByRole/ByRole"), { ssr: true });
const SolutionsByProblem = dynamic(() => import("@/components/solutions/ByProblem/ByProblem"), { ssr: true });
const SolutionsWorkflow = dynamic(() => import("@/components/solutions/Workflow/Workflow"), { ssr: false });
const SolutionsImpact = dynamic(() => import("@/components/solutions/Impact/Impact"), { ssr: false });
const SolutionsCTA = dynamic(() => import("@/components/solutions/CTA/CTA"), { ssr: true });

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.6, -0.05, 0.01, 0.99],
    },
  },
}

export default function SolutionsPage() {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      <Head>
        <title>Solutions - LearnXChain | Real School Solutions</title>
        <meta name="description" content="LearnXChain solves day-to-day school chaos with intelligence, transparency, and automation. Discover solutions for every stakeholder - school owners, principals, teachers, and parents." />
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
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(0,87,200,0.15),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(0,87,200,0.1),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,rgba(26,159,255,0.12),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,rgba(26,159,255,0.08),transparent)]" />

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

        {/* Smooth Scroll Container */}
        <div className="relative z-0">
          <Navbar />

          {/* Hero Section */}
          <motion.div
            initial="hidden"
            animate={mounted ? "visible" : "hidden"}
            variants={sectionVariants}
          >
            <SolutionsHero />
          </motion.div>

          {/* ByRole Section */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={sectionVariants}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0057C8]/5 to-transparent dark:via-[#0057C8]/10" />
            <div className="relative z-10">
              <SolutionsByRole />
            </div>
          </motion.div>

          {/* ByProblem Section */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={sectionVariants}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/50 to-transparent dark:via-[#0F1419]/50" />
            <div className="relative z-10">
              <SolutionsByProblem />
            </div>
          </motion.div>

          {/* Workflow Section */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={sectionVariants}
          >
            <SolutionsWorkflow />
          </motion.div>

          {/* Impact Section */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={sectionVariants}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0057C8]/5 to-transparent dark:via-[#0057C8]/10" />
            <div className="relative z-10">
              <SolutionsImpact />
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={sectionVariants}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1A9FFF]/5 to-transparent dark:via-[#1A9FFF]/10" />
            <div className="relative z-10">
              <SolutionsCTA />
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
          >
            <Footer />
          </motion.div>
        </div>

        {/* Smooth Theme Transition Overlay */}
        <motion.div
          key={theme}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.1, 0] }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 bg-white dark:bg-black pointer-events-none z-50"
        />
      </motion.div>
    </>
  );
}

