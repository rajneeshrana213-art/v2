"use client";
import { motion } from "framer-motion";

export default function AboutStory() {
  return (
    <section className="relative py-24 md:py-32 bg-transparent overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-sm font-semibold text-[#0057C8] dark:text-[#1A9FFF] uppercase tracking-wider mb-4">
            Our Story
          </h2>
          <h3 className="font-[var(--font-grotesk)] text-4xl md:text-5xl  text-gray-900 dark:text-white mb-6">
            Why LearnXChain Exists
          </h3>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="relative">
              <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-[#0057C8] to-[#1A9FFF] rounded-full" />
              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed pl-6">
                Indian schools operate under immense pressure — limited resources,
                rising expectations, and zero technological support designed for
                their reality. Most software products ignore Tier 2 and Tier 3 schools.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-[#0057C8]/5 to-[#1A9FFF]/5 dark:from-[#0057C8]/10 dark:to-[#1A9FFF]/10 rounded-2xl p-8 border border-[#0057C8]/20 dark:border-white/10">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#0057C8] to-[#1A9FFF] flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg md:text-xl text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                    LearnXChain was born to change that. We believe every school —
                    regardless of location or budget — deserves access to world-class
                    systems that bring trust, efficiency, and intelligence.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

