import { motion } from "framer-motion";
import {
  GraduationCap,
  Wallet,
  Users,
  Brain,
  Shield,
  BarChart3,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

const modules = [
  {
    icon: GraduationCap,
    title: "Academics OS",
    desc: "Classes, exams, attendance, homework — fully digitized with AI-driven scheduling and smart timetables.",
    gradient: "from-[#0057C8] to-[#1A9FFF]",
    lightBg: "bg-[#0057C8]/5 dark:bg-[#0057C8]/10",
    iconColor: "text-[#0057C8] dark:text-[#1A9FFF]",
    borderHover: "hover:border-[#0057C8]/20 dark:hover:border-[#0057C8]/30",
    tag: "Core",
  },
  {
    icon: Wallet,
    title: "Fee & Finance",
    desc: "Transparent fee tracking with zero leakage. Auto-reminders, online payments, and blockchain receipts.",
    gradient: "from-[#5CDD2B] to-[#1A9FFF]",
    lightBg: "bg-[#5CDD2B]/5 dark:bg-[#5CDD2B]/10",
    iconColor: "text-[#5CDD2B] dark:text-[#5CDD2B]",
    borderHover: "hover:border-[#5CDD2B]/20 dark:hover:border-[#5CDD2B]/30",
    tag: "Finance",
  },
  {
    icon: Users,
    title: "Parents & Teachers",
    desc: "Real-time communication, performance visibility, and instant notifications across the community.",
    gradient: "from-[#1A9FFF] to-[#55CFFF]",
    lightBg: "bg-[#1A9FFF]/5 dark:bg-[#1A9FFF]/10",
    iconColor: "text-[#1A9FFF] dark:text-[#55CFFF]",
    borderHover: "hover:border-[#1A9FFF]/20 dark:hover:border-[#1A9FFF]/30",
    tag: "Communication",
  },
  {
    icon: Brain,
    title: "RIT AI Intelligence",
    desc: "22 smart AI modules — predictions, risk analysis, auto-workflows, and performance optimization.",
    gradient: "from-[#1A9FFF] via-[#5CDD2B] to-[#0057C8]",
    lightBg: "bg-[#1A9FFF]/5 dark:bg-[#1A9FFF]/10",
    iconColor: "text-[#1A9FFF] dark:text-[#1A9FFF]",
    borderHover: "hover:border-[#1A9FFF]/20 dark:hover:border-[#1A9FFF]/30",
    tag: "AI Powered",
  },
  {
    icon: Shield,
    title: "Blockchain Trust",
    desc: "Tamper-proof records, verified certificates, immutable audit trails — trust built into every transaction.",
    gradient: "from-[#5CDD2B] to-[#0057C8]",
    lightBg: "bg-[#5CDD2B]/5 dark:bg-[#5CDD2B]/10",
    iconColor: "text-[#5CDD2B] dark:text-[#5CDD2B]",
    borderHover: "hover:border-[#5CDD2B]/20 dark:hover:border-[#5CDD2B]/30",
    tag: "Security",
  },
  {
    icon: BarChart3,
    title: "Admin Analytics",
    desc: "Decision-ready dashboards for leadership. Real-time KPIs, trends, and school health monitoring.",
    gradient: "from-[#55CFFF] to-[#0057C8]",
    lightBg: "bg-[#55CFFF]/5 dark:bg-[#55CFFF]/10",
    iconColor: "text-[#55CFFF] dark:text-[#55CFFF]",
    borderHover: "hover:border-[#55CFFF]/20 dark:hover:border-[#55CFFF]/30",
    tag: "Analytics",
  },
];

export default function Modules() {
  return (
    <section
      id="product"
      className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-[#0057C8]/5 dark:from-[#000000] dark:via-[#0D1B2A] dark:to-[#000000] py-24 sm:py-32"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 60, 0], y: [0, 35, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-[-200px] top-1/4 h-[500px] w-[500px] rounded-full bg-[#0057C8]/15 dark:bg-[#0057C8]/20 blur-[140px]"
        />
        <motion.div
          animate={{ x: [0, -45, 0], y: [0, -30, 0], scale: [1, 1.18, 1] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[-200px] bottom-1/3 h-[500px] w-[500px] rounded-full bg-[#1A9FFF]/12 dark:bg-[#1A9FFF]/18 blur-[140px]"
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
            <Sparkles
              size={14}
              className="text-[#0057C8] dark:text-[#1A9FFF]"
            />
            <span className="text-[#0057C8] dark:text-[#1A9FFF]">
              Modular Architecture
            </span>
          </motion.div>

          <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
            Everything a School Needs.
            <br />
            <span className="bg-gradient-to-r from-[#0057C8] via-[#1A9FFF] to-[#5CDD2B] dark:from-[#1A9FFF] dark:via-[#55CFFF] dark:to-[#5CDD2B] bg-clip-text text-transparent">
              One Platform.
            </span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            6 powerful modules working together seamlessly — from{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              admissions to analytics
            </span>
          </p>
        </motion.div>

        {/* Modules Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: i * 0.08,
                  type: "spring",
                  stiffness: 100,
                }}
                whileHover={{ y: -6 }}
                className="group relative"
              >
                <div
                  className={`relative h-full rounded-2xl border border-gray-200/70 dark:border-white/[0.06] bg-white/90 dark:bg-white/[0.03] backdrop-blur-xl p-7 transition-all duration-300 ${m.borderHover} hover:shadow-xl hover:shadow-indigo-500/5 dark:hover:shadow-indigo-500/10`}
                >
                  {/* Gradient glow */}
                  <div
                    className={`absolute -inset-px rounded-2xl bg-gradient-to-br ${m.gradient} opacity-0 group-hover:opacity-[0.05] dark:group-hover:opacity-[0.1] transition-opacity duration-300`}
                  />

                  {/* Tag */}
                  <div className="relative flex items-center justify-between mb-5">
                    <div
                      className={`rounded-xl ${m.lightBg} p-3 transition-transform duration-300 group-hover:scale-110`}
                    >
                      <Icon className={`h-5 w-5 ${m.iconColor}`} />
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest ${m.iconColor} opacity-60`}
                    >
                      {m.tag}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="relative text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {m.title}
                  </h3>

                  {/* Description */}
                  <p className="relative text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                    {m.desc}
                  </p>

                  {/* Learn More */}
                  <div className="relative flex items-center gap-1.5 text-xs font-semibold text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                    <span>Learn more</span>
                    <ArrowRight
                      size={12}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </div>

                  {/* Bottom gradient line */}
                  <motion.div
                    className={`absolute bottom-0 left-6 right-6 h-[2px] rounded-full bg-gradient-to-r ${m.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.08, duration: 0.6 }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-14 text-center"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            Want to see all modules working together?
          </p>
          <motion.div
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="inline-block"
          >
            <Link
              href="/product"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0057C8] to-[#1A9FFF] hover:from-[#0057C8] hover:to-[#1A9FFF] text-white px-7 py-3.5 font-semibold shadow-xl shadow-[#0057C8]/20 hover:shadow-2xl hover:shadow-[#0057C8]/40 transition-all duration-300"
            >
              Explore All Modules
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
