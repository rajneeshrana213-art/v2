import { motion } from "framer-motion";
import { Sparkles, Zap, Shield } from "lucide-react";

export default function ProductHero() {
  return (
    <section className="relative min-h-[90vh] w-full flex items-center justify-center overflow-hidden bg-transparent pt-32 pb-20">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#0057C8]/20 via-[#1A9FFF]/10 to-transparent dark:from-[#0057C8]/10 dark:via-[#1A9FFF]/5 dark:to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-[#1A9FFF]/20 via-[#5CDD2B]/10 to-transparent dark:from-[#1A9FFF]/10 dark:via-[#5CDD2B]/5 dark:to-transparent" />
        
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-1/4 top-1/4 h-[600px] w-[600px] rounded-full bg-gradient-to-r from-[#0057C8]/40 to-[#1A9FFF]/40 blur-[100px] dark:from-[#0057C8]/30 dark:to-[#1A9FFF]/30"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, -60, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute right-1/4 bottom-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-r from-[#1A9FFF]/35 to-[#5CDD2B]/35 blur-[120px] dark:from-[#1A9FFF]/25 dark:to-[#5CDD2B]/25"
        />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)]" />

      <div className="relative z-10 text-center max-w-5xl px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0057C8]/5 dark:bg-[#0057C8]/20 text-[#0057C8] dark:text-[#1A9FFF] mb-8 text-sm font-medium"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI-First School Operating System</span>
          </motion.div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
              The Operating System
            </span>
            <br />
            <span className="bg-gradient-to-r from-[#0057C8] via-[#1A9FFF] to-[#5CDD2B] dark:from-[#1A9FFF] dark:via-[#55CFFF] dark:to-[#5CDD2B] bg-clip-text text-transparent">
              for Modern Schools
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            LearnXChain unifies academics, finance, AI intelligence, and trust
            into a single powerful platform built for India.
          </p>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-sm">
              <Zap className="w-4 h-4 text-[#FFC555]" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">AI-Powered</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-sm">
              <Shield className="w-4 h-4 text-[#5CDD2B]" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Blockchain Secured</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-sm">
              <Sparkles className="w-4 h-4 text-[#1A9FFF]" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Fully Integrated</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
