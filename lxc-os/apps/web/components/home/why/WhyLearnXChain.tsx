import { motion } from "framer-motion";
import {
  Crown,
  Rocket,
  IndianRupee,
  ShieldCheck,
  Heart,
} from "lucide-react";

const reasons = [
  {
    icon: Crown,
    title: "Built for Bharat",
    desc: "Designed for Tier 2 & Tier 3 schools — low bandwidth, offline-first, multi-language support.",
    detail: "Works even with 2G connectivity",
    gradient: "from-[#FFC555] to-[#0057C8]",
    lightBg: "bg-[#FFC555]/5 dark:bg-[#FFC555]/10",
    iconColor: "text-[#E6B044] dark:text-[#FFC555]",
    borderHover: "hover:border-[#FFC555]/20 dark:hover:border-[#FFC555]/30",
  },
  {
    icon: Rocket,
    title: "Future-Ready Tech",
    desc: "AI, Blockchain, Automation — not just buzzwords. Real, deployed, production-grade technology.",
    detail: "22 AI modules live in production",
    gradient: "from-[#0057C8] to-[#1A9FFF]",
    lightBg: "bg-[#0057C8]/5 dark:bg-[#0057C8]/10",
    iconColor: "text-[#0057C8] dark:text-[#1A9FFF]",
    borderHover: "hover:border-[#0057C8]/20 dark:hover:border-[#0057C8]/30",
  },
  {
    icon: IndianRupee,
    title: "Radically Affordable",
    desc: "Premium enterprise-grade tech at a price that village schools and city chains can both afford.",
    detail: "70% cheaper than competitors",
    gradient: "from-[#5CDD2B] to-[#0057C8]",
    lightBg: "bg-[#5CDD2B]/5 dark:bg-[#5CDD2B]/10",
    iconColor: "text-[#4BBD22] dark:text-[#5CDD2B]",
    borderHover: "hover:border-[#5CDD2B]/20 dark:hover:border-[#5CDD2B]/30",
  },
  {
    icon: ShieldCheck,
    title: "Trust by Design",
    desc: "Every action is logged, auditable, and transparent. Parents see everything, trustees trust everything.",
    detail: "Blockchain-verified audit trails",
    gradient: "from-[#1A9FFF] to-[#55CFFF]",
    lightBg: "bg-[#1A9FFF]/5 dark:bg-[#1A9FFF]/10",
    iconColor: "text-[#1A9FFF] dark:text-[#55CFFF]",
    borderHover: "hover:border-[#1A9FFF]/20 dark:hover:border-[#1A9FFF]/30",
  },
];

export default function WhyLearnXChain() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-[#0057C8]/5 dark:from-[#000000] dark:via-[#0D1B2A] dark:to-[#000000] py-24 sm:py-32">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 45, 0], y: [0, 30, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[-200px] top-1/4 h-[500px] w-[500px] rounded-full bg-[#0057C8]/15 dark:bg-[#0057C8]/20 blur-[140px]"
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, -25, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-[-200px] bottom-1/4 h-[500px] w-[500px] rounded-full bg-[#1A9FFF]/12 dark:bg-[#1A9FFF]/18 blur-[140px]"
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
            <Heart
              size={14}
              className="text-[#0057C8] dark:text-[#1A9FFF]"
            />
            <span className="text-[#0057C8] dark:text-[#1A9FFF]">
              Trusted by 500+ Schools
            </span>
          </motion.div>

          <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
            Why Schools Choose
            <br />
            <span className="bg-gradient-to-r from-[#0057C8] via-[#1A9FFF] to-[#5CDD2B] dark:from-[#1A9FFF] dark:via-[#55CFFF] dark:to-[#5CDD2B] bg-clip-text text-transparent">
              LearnXChain
            </span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Four powerful reasons that make us the{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              smart choice
            </span>{" "}
            for modern Indian schools
          </p>
        </motion.div>

        {/* Reasons Grid — 2x2 on large */}
        <div className="grid gap-5 sm:grid-cols-2">
          {reasons.map((reason, i) => {
            const Icon = reason.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: i * 0.1,
                  type: "spring",
                  stiffness: 100,
                }}
                whileHover={{ y: -6 }}
                className="group relative"
              >
                <div
                  className={`relative h-full rounded-2xl border border-gray-200/70 dark:border-white/[0.06] bg-white/90 dark:bg-white/[0.03] backdrop-blur-xl p-7 transition-all duration-300 ${reason.borderHover} hover:shadow-xl hover:shadow-indigo-500/5 dark:hover:shadow-indigo-500/10`}
                >
                  {/* Glow */}
                  <div
                    className={`absolute -inset-px rounded-2xl bg-gradient-to-br ${reason.gradient} opacity-0 group-hover:opacity-[0.05] dark:group-hover:opacity-[0.1] transition-opacity duration-300`}
                  />

                  {/* Top row: icon + title + detail tag */}
                  <div className="relative flex items-start gap-4 mb-4">
                    <div
                      className={`rounded-xl ${reason.lightBg} p-3 flex-shrink-0 transition-transform duration-300 group-hover:scale-110`}
                    >
                      <Icon className={`h-5 w-5 ${reason.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {reason.title}
                        </h3>
                        <span
                          className={`hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider ${reason.iconColor} opacity-60 whitespace-nowrap`}
                        >
                          {reason.detail}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mt-1.5">
                        {reason.desc}
                      </p>
                    </div>
                  </div>

                  {/* Bottom gradient line */}
                  <motion.div
                    className={`absolute bottom-0 left-6 right-6 h-[2px] rounded-full bg-gradient-to-r ${reason.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Social Proof */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 flex justify-center"
        >
          <div className="inline-flex items-center gap-4 rounded-2xl border border-gray-200/50 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl px-7 py-4 shadow-lg shadow-indigo-500/5">
            <div className="flex -space-x-2">
              {["from-[#0057C8] to-[#1A9FFF]", "from-[#5CDD2B] to-[#0057C8]", "from-[#FFC555] to-[#0057C8]"].map(
                (g, i) => (
                  <div
                    key={i}
                    className={`h-9 w-9 rounded-full bg-gradient-to-br ${g} border-2 border-white dark:border-gray-800 shadow-sm`}
                  />
                )
              )}
              <div className="h-9 w-9 rounded-full bg-gray-100 dark:bg-white/10 border-2 border-white dark:border-gray-800 flex items-center justify-center">
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                  +497
                </span>
              </div>
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                Join 500+ Schools
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Transforming education across India
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
