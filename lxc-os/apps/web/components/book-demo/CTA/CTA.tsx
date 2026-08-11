"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function DemoCTA() {
  return (
    <section className="py-32 bg-transparent transition-colors duration-300 relative overflow-hidden">
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
            className="inline-block px-6 py-2 rounded-full bg-[#0057C8]/10 dark:bg-[#0057C8]/20 text-[#0057C8] dark:text-[#1A9FFF] text-sm font-bold mb-8 tracking-wider uppercase"
          >
            Ready to Get Started?
          </motion.span>
          
          <h2 className="font-[var(--font-grotesk)] text-4xl md:text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
            Ready to See the <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0057C8] to-[#1A9FFF]">Difference?</span>
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
            Book your personalized demo today and discover how LearnXChain can transform your school's operations.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-6 mb-16">
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center"
            >
              <Link
                href="#form"
                className="relative inline-flex items-center justify-center px-10 py-5 bg-gradient-to-r from-[#0057C8] to-[#1A9FFF] text-white font-bold rounded-2xl shadow-xl shadow-[#0057C8]/20 transition-all duration-300 overflow-hidden group"
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
                <span className="relative z-10">Book Your Demo Now</span>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center"
            >
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-10 py-5 bg-white/60 dark:bg-[#0C1018] border-2 border-gray-100 dark:border-white/5 text-gray-700 dark:text-gray-300 font-bold rounded-2xl hover:border-[#0057C8]/30 transition-all duration-300 backdrop-blur-xl shadow-lg"
              >
                Talk to Our Team
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center"
            >
              <Link
                href="/product"
                className="inline-flex items-center justify-center px-10 py-5 bg-white/60 dark:bg-[#0C1018] border-2 border-gray-100 dark:border-white/5 text-gray-700 dark:text-gray-300 font-bold rounded-2xl hover:border-[#0057C8]/30 transition-all duration-300 backdrop-blur-xl shadow-lg"
              >
                Explore Platform
              </Link>
            </motion.div>
          </div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center items-center gap-12 text-base font-bold text-gray-600 dark:text-gray-400"
          >
            <div className="flex items-center gap-3">
              <span className="text-[#5CDD2B] text-xl">✓</span>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[#5CDD2B] text-xl">✓</span>
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[#5CDD2B] text-xl">✓</span>
              <span>Cancel anytime</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
