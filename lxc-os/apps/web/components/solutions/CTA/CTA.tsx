"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function SolutionsCTA() {
  return (
    <section className="py-32 bg-gradient-to-b from-white via-gray-50 to-white dark:from-[#0B0E14] dark:via-[#0E1117] dark:to-[#0B0E14] transition-colors duration-300 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full blur-3xl opacity-20 dark:opacity-30"
          style={{
            background: "radial-gradient(circle, #0057C8 0%, #1A9FFF 50%, transparent 70%)",
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, 100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-15 dark:opacity-20"
          style={{
            background: "radial-gradient(circle, #5CDD2B 0%, #0057C8 50%, transparent 70%)",
          }}
          animate={{
            x: [0, -100, 0],
            y: [0, -100, 0],
            scale: [1.2, 1, 1.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]" />

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
            className="inline-block px-4 py-2 rounded-full bg-[#0057C8]/5 dark:bg-[#0057C8]/20 text-[#0057C8] dark:text-[#1A9FFF] text-sm font-semibold mb-6"
          >
            Ready to Get Started?
          </motion.span>

          <motion.h2
            className="font-[var(--font-grotesk)] text-4xl md:text-5xl lg:text-6xl  text-gray-900 dark:text-white mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Solve School Challenges the{' '}
            <motion.span
              className="bg-gradient-to-r from-[#0057C8] via-[#1A9FFF] to-[#5CDD2B] dark:from-[#1A9FFF] dark:via-[#55CFFF] dark:to-[#5CDD2B] bg-clip-text text-transparent inline-block"
              animate={{
                backgroundPosition: ['0%', '100%'],
              }}
              transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
              style={{
                backgroundSize: '200% auto',
              }}
            >
              Smart Way
            </motion.span>
          </motion.h2>

          <motion.p
            className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Ready to transform your school operations? Get started today and experience the <span className="font-semibold text-gray-900 dark:text-white">future of education management</span>.
          </motion.p>

          <div className="flex flex-wrap justify-center items-center gap-4 mb-12">
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center"
            >
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#0057C8] to-[#1A9FFF] rounded-xl blur-xl opacity-50"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <Link
                  href="/book-demo"
                  className="relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-[#0057C8] to-[#1A9FFF] hover:from-[#0057C8] hover:to-[#1A9FFF] text-white font-semibold rounded-xl shadow-xl shadow-[#0057C8]/20 hover:shadow-2xl transition-all duration-300 overflow-hidden group"
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
                  <span className="relative z-10">Start Free Trial</span>
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center"
            >
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-white dark:bg-gray-800/50 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-[#0057C8]/30 dark:hover:border-[#0057C8]/30 transition-all duration-300 backdrop-blur-sm shadow-sm hover:shadow-md"
              >
                Talk to Expert
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center"
            >
              <Link
                href="/product"
                className="inline-flex items-center justify-center px-8 py-4 bg-white dark:bg-gray-800/50 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-[#0057C8]/30 dark:hover:border-[#0057C8]/30 transition-all duration-300 backdrop-blur-sm shadow-sm hover:shadow-md"
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
            className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600 dark:text-gray-400"
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
