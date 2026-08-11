"use client";
import { motion } from "framer-motion";
import { Calendar, Sparkles } from "lucide-react";

export default function DemoHero() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-transparent">
      <div className="relative max-w-6xl px-6 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <span className="inline-flex items-center px-5 py-2 rounded-full bg-[#0057C8]/5 dark:bg-[#0057C8]/10 text-[#0057C8] dark:text-[#1A9FFF] text-xs font-bold uppercase tracking-widest border border-[#0057C8]/20 dark:border-[#0057C8]/30 backdrop-blur-md">
            <span className="relative flex h-2 w-2 mr-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0057C8] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0057C8]" />
            </span>
            Live Product Demo
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-[var(--font-grotesk)] text-5xl sm:text-7xl md:text-8xl bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent mb-8 leading-[1.1] tracking-tight"
        >
          See LearnXChain
          <br />
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-gradient-to-r from-[#0057C8] via-[#1A9FFF] to-[#0057C8] bg-clip-text text-transparent"
          >
            in Action
          </motion.span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-8 text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto font-medium"
        >
          Get a guided walkthrough of how LearnXChain simplifies operations, improves learning
          outcomes, and gives your team superpowers — tailored to your school&apos;s reality.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-12 flex flex-col sm:flex-row gap-6 justify-center items-center text-sm font-bold text-gray-500 dark:text-gray-500"
        >
          <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/50 dark:bg-white/5 border border-gray-100 dark:border-white/5 backdrop-blur-md">
            <Calendar className="w-5 h-5 text-[#0057C8] dark:text-[#1A9FFF]" />
            <span>30–45 min live session</span>
          </div>
          <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/50 dark:bg-white/5 border border-gray-100 dark:border-white/5 backdrop-blur-md">
            <Sparkles className="w-5 h-5 text-[#FFC555]" />
            <span>Customized for your school</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
