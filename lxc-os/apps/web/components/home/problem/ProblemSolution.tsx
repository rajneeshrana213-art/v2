import { motion } from "framer-motion";
import {
  XCircle,
  CheckCircle2,
  ArrowRight,
  Zap,
  Shield,
  Brain,
  TrendingUp,
  FileSpreadsheet,
  AlertTriangle,
  EyeOff,
  IndianRupee,
} from "lucide-react";

const problems = [
  {
    text: "Manual registers & Excel chaos",
    detail: "Hours wasted on paper-based tracking that leads to errors",
    icon: FileSpreadsheet,
  },
  {
    text: "Fee leakage & zero transparency",
    detail: "Parents never trust the system, money gets lost",
    icon: IndianRupee,
  },
  {
    text: "No AI insights or analytics",
    detail: "Schools run blind without data-driven decisions",
    icon: EyeOff,
  },
  {
    text: "Expensive legacy software",
    detail: "Built for urban elites, not for Bharat",
    icon: AlertTriangle,
  },
];

const solutions = [
  {
    text: "One unified operating system",
    detail: "Everything from academics to finance in a single platform",
    icon: Zap,
    color: "text-[#0057C8] dark:text-[#1A9FFF]",
    bg: "bg-[#0057C8]/5 dark:bg-[#0057C8]/10",
  },
  {
    text: "Blockchain-backed trust",
    detail: "Every transaction is verified, immutable, and parent-visible",
    icon: Shield,
    color: "text-[#5CDD2B] dark:text-[#5CDD2B]",
    bg: "bg-[#5CDD2B]/5 dark:bg-[#5CDD2B]/10",
  },
  {
    text: "RIT AI-powered decisions",
    detail: "22 AI modules analyzing attendance, risk, performance & more",
    icon: Brain,
    color: "text-[#1A9FFF] dark:text-[#1A9FFF]",
    bg: "bg-[#1A9FFF]/5 dark:bg-[#1A9FFF]/10",
  },
  {
    text: "Affordable for every school",
    detail: "From village schools to city chains — scales with you",
    icon: TrendingUp,
    color: "text-[#55CFFF] dark:text-[#55CFFF]",
    bg: "bg-[#55CFFF]/5 dark:bg-[#55CFFF]/10",
  },
];

export default function ProblemSolution() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-[#0057C8]/5 dark:from-[#000000] dark:via-[#0D1B2A] dark:to-[#000000] py-24 sm:py-32">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, 25, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[-150px] top-1/4 h-[450px] w-[450px] rounded-full bg-[#0057C8]/10 dark:bg-[#0057C8]/15 blur-[140px]"
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, -25, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-[-150px] bottom-1/4 h-[450px] w-[450px] rounded-full bg-[#5CDD2B]/10 dark:bg-[#5CDD2B]/15 blur-[140px]"
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

      <div className="relative mx-auto max-w-7xl px-6 sm:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#0057C8]/20 dark:border-[#0057C8]/30 bg-white/80 dark:bg-white/5 backdrop-blur-xl px-5 py-2.5 text-sm font-semibold shadow-lg shadow-[#0057C8]/10"
          >
            <ArrowRight size={14} className="text-[#0057C8] dark:text-[#1A9FFF]" />
            <span className="text-[#0057C8] dark:text-[#1A9FFF]">
              The Transformation
            </span>
          </motion.div>

          <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
            From{" "}
            <span className="relative inline-block">
              <span className="text-red-500 dark:text-red-400">Chaos</span>
              <motion.div
                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-red-500/50"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5 }}
                style={{ transformOrigin: "left" }}
              />
            </span>{" "}
            to{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-[#5CDD2B] to-[#0057C8] dark:from-[#5CDD2B] dark:to-[#1A9FFF] bg-clip-text text-transparent">
                Clarity
              </span>
              <motion.div
                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-[#5CDD2B] to-[#0057C8]"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.5 }}
                style={{ transformOrigin: "left" }}
              />
            </span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            See how{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              LearnXChain
            </span>{" "}
            replaces outdated school workflows with{" "}
            <span className="text-[#0057C8] dark:text-[#1A9FFF] font-medium">
              intelligent automation
            </span>
          </p>
        </motion.div>

        {/* Two-column comparison */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* PROBLEM COLUMN */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative rounded-3xl border border-red-200/40 dark:border-red-500/15 bg-white/60 dark:bg-white/[0.02] backdrop-blur-xl p-8 h-full">
              {/* Corner accent */}
              <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-br from-red-500/8 to-transparent rounded-bl-3xl" />

              {/* Header */}
              <div className="relative flex items-center gap-3 mb-8">
                <div className="rounded-xl bg-red-100 dark:bg-red-500/15 p-3">
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    The Problem
                  </h3>
                  <p className="text-xs font-semibold text-red-500 dark:text-red-400 uppercase tracking-wider mt-0.5">
                    Schools are stuck in the past
                  </p>
                </div>
              </div>

              {/* Problem items */}
              <div className="space-y-3">
                {problems.map((problem, i) => {
                  const Icon = problem.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -15 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className="group flex gap-3 rounded-xl border border-red-100/50 dark:border-red-500/10 bg-red-50/30 dark:bg-red-500/[0.03] p-4 transition-all duration-200 hover:border-red-200/80 dark:hover:border-red-500/20"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        <Icon className="h-5 w-5 text-red-400 dark:text-red-500/70" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                          {problem.text}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                          {problem.detail}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* SOLUTION COLUMN */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="relative rounded-3xl border border-emerald-200/40 dark:border-emerald-500/15 bg-white/60 dark:bg-white/[0.02] backdrop-blur-xl p-8 h-full">
              {/* Corner accent */}
              <div className="absolute top-0 left-0 h-24 w-24 bg-gradient-to-br from-emerald-500/8 to-transparent rounded-br-3xl" />

              {/* Header */}
              <div className="relative flex items-center gap-3 mb-8">
                <div className="rounded-xl bg-[#5CDD2B]/10 dark:bg-[#5CDD2B]/15 p-3">
                  <CheckCircle2 className="h-5 w-5 text-[#4BBD22] dark:text-[#5CDD2B]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    The Solution
                  </h3>
                  <p className="text-xs font-semibold text-[#4BBD22] dark:text-[#5CDD2B] uppercase tracking-wider mt-0.5">
                    LearnXChain changes the game
                  </p>
                </div>
              </div>

              {/* Solution items */}
              <div className="space-y-3">
                {solutions.map((solution, i) => {
                  const Icon = solution.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 15 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className="group flex gap-3 rounded-xl border border-gray-100/50 dark:border-white/[0.04] bg-white/50 dark:bg-white/[0.02] p-4 transition-all duration-200 hover:border-[#0057C8]/30 dark:hover:border-[#0057C8]/30 hover:shadow-sm"
                    >
                      <div
                        className={`flex-shrink-0 rounded-lg ${solution.bg} p-2 transition-transform duration-200 group-hover:scale-110`}
                      >
                        <Icon className={`h-4 w-4 ${solution.color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                          {solution.text}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                          {solution.detail}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Join{" "}
            <span className="font-bold text-[#0057C8] dark:text-[#1A9FFF]">
              500+ schools
            </span>{" "}
            that made the switch from chaos to clarity
          </p>
        </motion.div>
      </div>
    </section>
  );
}
