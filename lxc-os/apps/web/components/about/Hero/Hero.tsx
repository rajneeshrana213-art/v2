"use client";
import { motion } from "framer-motion";

export default function AboutHero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-transparent">
      <div className="relative max-w-6xl px-6 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-[#0057C8]/5 dark:bg-[#0057C8]/10 text-[#0057C8] dark:text-[#1A9FFF] text-sm font-medium border border-[#0057C8]/20 dark:border-[#0057C8]/30">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5CDD2B] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5CDD2B]"></span>
            </span>
            About LearnXChain
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-[var(--font-grotesk)] text-5xl sm:text-6xl md:text-7xl bg-gradient-to-r from-gray-900 via-[#0057C8] to-[#1A9FFF] dark:from-white dark:via-[#1A9FFF] dark:to-[#5CDD2B] bg-clip-text text-transparent mb-8 leading-tight"
        >
          We're Building the
          <br />
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-gradient-to-r from-[#0057C8] to-[#1A9FFF] dark:from-[#1A9FFF] dark:to-[#5CDD2B] bg-clip-text text-transparent"
          >
            Future of Indian Education
          </motion.span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-8 text-xl md:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto"
        >
          LearnXChain is not just a company — it's a mission to bring
          transparency, intelligence, and dignity to every school in India.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <div className="flex items-center gap-6 text-sm font-semibold text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <svg className="w-5 h-5 text-[#5CDD2B]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>AI-Powered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-5 h-5 text-[#5CDD2B]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Blockchain Secured</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-5 h-5 text-[#5CDD2B]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Made for Bharat</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

