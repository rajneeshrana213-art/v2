"use client";
import { motion } from "framer-motion";

export default function AboutVision() {
  return (
    <section className="relative py-24 md:py-32 bg-transparent overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-sm font-semibold text-[#0057C8] dark:text-[#1A9FFF] uppercase tracking-wider mb-4">
            Vision & Mission
          </h2>
          <p className="text-2xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium">
            Our guiding principles that shape everything we build
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Vision Card */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="group relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#0057C8] to-[#1A9FFF] rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300 dark:opacity-30 dark:group-hover:opacity-40" />
            <div className="relative bg-white dark:bg-[#0C1018] rounded-2xl p-8 lg:p-10 border border-gray-200 dark:border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-[#0057C8] to-[#1A9FFF] mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="font-[var(--font-grotesk)] text-3xl lg:text-4xl  text-gray-900 dark:text-white mb-6">
                Our Vision
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                To create India's first truly intelligent School Operating System —
                one that understands students, empowers teachers, supports parents,
                and gives school leaders absolute clarity and control.
              </p>
            </div>
          </motion.div>

          {/* Mission Card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="group relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#1A9FFF] to-[#5CDD2B] rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300 dark:opacity-30 dark:group-hover:opacity-40" />
            <div className="relative bg-white dark:bg-[#0C1018] rounded-2xl p-8 lg:p-10 border border-gray-200 dark:border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-[#1A9FFF] to-[#5CDD2B] mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-[var(--font-grotesk)] text-3xl lg:text-4xl  text-gray-900 dark:text-white mb-6">
                Our Mission
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                We aim to eliminate inefficiency, mistrust, and guesswork from
                school operations by combining AI, automation, and blockchain —
                while keeping the platform affordable for Bharat.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

