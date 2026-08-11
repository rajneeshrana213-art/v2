"use client";
import { motion } from "framer-motion";
import { Sparkles, Target, Zap } from "lucide-react";

export default function SolutionsHero() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-transparent pt-32 pb-20">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-[#0057C8]/20 to-[#1A9FFF]/20 rounded-full blur-3xl dark:from-[#0057C8]/30 dark:to-[#1A9FFF]/30"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-r from-[#1A9FFF]/15 to-[#5CDD2B]/15 rounded-full blur-3xl dark:from-[#1A9FFF]/25 dark:to-[#5CDD2B]/25"
        />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)]" />

      <div className="relative max-w-6xl mx-auto px-6 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0057C8]/5 dark:bg-[#0057C8]/20 border border-[#0057C8]/20 dark:border-[#0057C8]/30 mb-6 backdrop-blur-sm"
        >
          <Sparkles className="w-4 h-4 text-[#0057C8] dark:text-[#1A9FFF]" />
          <span className="text-sm font-medium text-[#0057C8] dark:text-[#1A9FFF]">
            Comprehensive Solutions for Every Challenge
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
        >
          <span className="bg-gradient-to-r from-gray-900 via-[#0057C8] to-gray-900 dark:from-white dark:via-[#1A9FFF] dark:to-white bg-clip-text text-transparent">
            Real Problems.
          </span>
          <br />
          <span className="bg-gradient-to-r from-[#0057C8] via-[#1A9FFF] to-[#5CDD2B] dark:from-[#1A9FFF] dark:via-[#55CFFF] dark:to-[#5CDD2B] bg-clip-text text-transparent">
            Real School Solutions.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
        >
          LearnXChain solves day-to-day school chaos with intelligence,
          transparency, and automation. Discover solutions for every stakeholder.
        </motion.p>

        {/* Feature highlights */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-6"
        >
          {[
            { icon: Target, text: "Targeted Solutions" },
            { icon: Zap, text: "Smart Automation" },
            { icon: Sparkles, text: "AI-Powered Insights" },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/50 dark:border-white/10 shadow-sm"
            >
              <feature.icon className="w-4 h-4 text-[#0057C8] dark:text-[#1A9FFF] flex-shrink-0" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {feature.text}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

