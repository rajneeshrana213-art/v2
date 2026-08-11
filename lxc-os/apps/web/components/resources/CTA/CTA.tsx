"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ResourcesCTA() {
  return (
    <section className="py-32 bg-transparent relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-2 rounded-full bg-[#0057C8]/5 dark:bg-[#0057C8]/10 text-[#0057C8] dark:text-[#1A9FFF] text-sm font-semibold mb-6 border border-[#0057C8]/20"
          >
            Ready to Get Started?
          </motion.span>
          
          <h2 className="font-[var(--font-grotesk)] text-4xl md:text-5xl lg:text-6xl  text-gray-900 dark:text-white mb-6 leading-tight">
            Turn Knowledge Into Action
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
            Ready to transform your school? Start your journey with LearnXChain today and see the difference.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-4 mb-12">
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center"
            >
              <Link
                href="/book-demo"
                className="relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-[#0057C8] to-[#1A9FFF] text-white font-bold rounded-xl shadow-lg shadow-[#0057C8]/30 hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                <span className="relative z-10">Start with LearnXChain</span>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center"
            >
              <Link
                href="/product"
                className="inline-flex items-center justify-center px-8 py-4 bg-white dark:bg-[#0C1018] border-2 border-gray-300 dark:border-white/10 text-gray-700 dark:text-[#1A9FFF] font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-[#0C1018]/80 hover:border-[#0057C8]/50 dark:hover:border-[#0057C8]/50 transition-all duration-300 backdrop-blur-sm shadow-sm hover:shadow-md"
              >
                Explore Product
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center"
            >
              <Link
                href="/about"
                className="inline-flex items-center justify-center px-8 py-4 bg-white dark:bg-[#0C1018] border-2 border-gray-300 dark:border-white/10 text-gray-700 dark:text-[#1A9FFF] font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-[#0C1018]/80 hover:border-[#0057C8]/50 dark:hover:border-[#0057C8]/50 transition-all duration-300 backdrop-blur-sm shadow-sm hover:shadow-md"
              >
                About Us
              </Link>
            </motion.div>
          </div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center items-center gap-8 text-sm font-semibold text-gray-600 dark:text-gray-400"
          >
            <div className="flex items-center gap-2">
              <span className="text-[#5CDD2B]">✓</span>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#5CDD2B]">✓</span>
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#5CDD2B]">✓</span>
              <span>Cancel anytime</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
