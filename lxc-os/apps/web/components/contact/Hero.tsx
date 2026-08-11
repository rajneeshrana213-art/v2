"use client";
import { motion } from "framer-motion";
import { Calendar, Sparkles, ArrowDown, CheckCircle2 } from "lucide-react";

export default function ContactHero() {
  return (
    <section className="relative min-h-[85vh] bg-transparent flex items-center justify-center overflow-hidden pt-24">
      <div className="relative max-w-6xl mx-auto px-6 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0057C8]/5 dark:bg-[#0057C8]/10 border border-[#0057C8]/20 mb-6 backdrop-blur-md"
        >
          <Sparkles className="w-4 h-4 text-[#0057C8] dark:text-[#1A9FFF]" />
          <span className="text-sm font-bold text-[#0057C8] dark:text-[#1A9FFF]">
            Book Your Free Demo Today
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight font-[var(--font-grotesk)]"
        >
          <span className="text-gray-900 dark:text-white">
            Experience{" "}
          </span>
          <span className="bg-gradient-to-r from-[#0057C8] via-[#1A9FFF] to-[#5CDD2B] dark:from-[#1A9FFF] dark:via-[#1A9FFF] dark:to-[#5CDD2B] bg-clip-text text-transparent">
            LearnXChain
          </span>
          <br />
          <span className="text-gray-900 dark:text-white">
            in Action
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed font-medium"
        >
          See how our AI-powered platform transforms school management and learning.
          Schedule a personalized demo tailored to your school's needs.
        </motion.p>

        {/* Feature highlights */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-6 mb-20"
        >
          {[
            "30-minute personalized demo",
            "See real school use cases",
            "Q&A with our experts",
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/60 dark:bg-[#0C1018] backdrop-blur-md border border-gray-200/50 dark:border-white/10 shadow-sm transition-all duration-300 hover:border-[#0057C8]/50"
            >
              <CheckCircle2 className="w-4 h-4 text-[#5CDD2B] flex-shrink-0" />
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                {feature}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, repeat: Infinity, repeatType: "reverse", duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20"
      >
        <span className="text-sm font-bold text-gray-500 dark:text-gray-400">Scroll to book</span>
        <ArrowDown className="w-5 h-5 text-[#0057C8] dark:text-[#1A9FFF]" />
      </motion.div>
    </section>
  );
}

