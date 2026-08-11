"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Rocket,
  CheckCircle2,
  Shield,
  Headphones,
} from "lucide-react";

const benefits = [
  "No credit card required",
  "14-day free trial",
  "Cancel anytime",
  "Full feature access",
];

const trustItems = [
  { icon: Sparkles, text: "Trusted by 500+ Schools" },
  { icon: Shield, text: "99.9% Uptime" },
  { icon: Headphones, text: "24/7 Support" },
];

export default function CTA() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-[#0057C8]/5 dark:from-[#000000] dark:via-[#0D1B2A] dark:to-[#000000] py-24 sm:py-32">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 60, 0], y: [0, 40, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-1/4 top-1/4 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0057C8]/15 dark:bg-[#0057C8]/20 blur-[140px]"
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, -35, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-1/4 bottom-1/4 h-[500px] w-[500px] rounded-full bg-[#1A9FFF]/12 dark:bg-[#1A9FFF]/18 blur-[140px]"
        />
        <div
          className="absolute inset-0 opacity-[0.06] dark:opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 87, 200, 0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 87, 200, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 sm:px-8">
        {/* Main CTA Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-2xl border border-gray-200/70 dark:border-white/[0.06] bg-white/90 dark:bg-white/[0.03] backdrop-blur-xl p-10 sm:p-14 shadow-xl shadow-indigo-500/5"
        >
          {/* Glow */}
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-[#0057C8] to-[#1A9FFF] opacity-[0.03] dark:opacity-[0.06]" />

          {/* Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="relative mb-8 flex justify-center"
          >
            <div className="rounded-xl bg-[#0057C8]/5 dark:bg-[#0057C8]/10 p-4 transition-transform hover:scale-110 duration-300">
              <Rocket className="h-7 w-7 text-[#0057C8] dark:text-[#1A9FFF]" />
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-center text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl"
          >
            Ready to Build a
            <br />
            <span className="bg-gradient-to-r from-[#0057C8] via-[#1A9FFF] to-[#5CDD2B] dark:from-[#1A9FFF] dark:via-[#55CFFF] dark:to-[#5CDD2B] bg-clip-text text-transparent">
              Smarter School?
            </span>
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-5 max-w-2xl text-center text-lg text-gray-600 dark:text-gray-400 leading-relaxed"
          >
            Join schools across India using{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              LearnXChain
            </span>{" "}
            to operate with clarity, trust, and intelligence.
          </motion.p>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-wrap justify-center gap-3"
          >
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.35 + i * 0.08 }}
                className="flex items-center gap-2 rounded-full border border-gray-200/50 dark:border-white/[0.06] bg-white/60 dark:bg-white/[0.02] px-4 py-2"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-[#4BBD22] dark:text-[#5CDD2B]" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {benefit}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.45 }}
            className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center"
          >
            <motion.div
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link
                href="/book-demo"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0057C8] to-[#1A9FFF] px-8 py-4 text-base font-semibold text-white shadow-xl shadow-[#0057C8]/20 transition-all hover:shadow-2xl hover:shadow-[#0057C8]/40"
              >
                <span>Start Free Trial</span>
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-xl border border-gray-300/50 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-xl px-8 py-4 text-base font-semibold text-gray-700 dark:text-gray-200 transition-all hover:bg-white dark:hover:bg-white/10 hover:border-gray-400/50 dark:hover:border-white/20 hover:shadow-md"
              >
                Talk to Sales
              </Link>
            </motion.div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-6"
          >
            {trustItems.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"
              >
                <item.icon
                  size={15}
                  className="text-[#0057C8] dark:text-[#1A9FFF]"
                />
                <span className="font-medium">{item.text}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
