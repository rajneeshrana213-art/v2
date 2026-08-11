import { motion } from "framer-motion";
import {
  Brain,
  ShieldCheck,
  Zap,
  Sparkles,
  Activity,
  Eye,
  LineChart,
  Database,
  Lock,
  FileCheck,
  Award,
  Link2,
} from "lucide-react";

const aiFeatures = [
  {
    icon: Activity,
    text: "Predict student dropouts & performance risks",
    detail: "AI analyzes patterns across attendance, grades & behavior",
  },
  {
    icon: Sparkles,
    text: "Smart timetables & workload balancing",
    detail: "Auto-optimized schedules for teachers and classrooms",
  },
  {
    icon: LineChart,
    text: "Auto-generated reports & insights",
    detail: "One-click analytics for principals and trustees",
  },
  {
    icon: Eye,
    text: "Personalized learning paths",
    detail: "Adaptive recommendations for every student's growth",
  },
];

const blockchainFeatures = [
  {
    icon: Database,
    text: "Tamper-proof academic & financial records",
    detail: "Every record is hashed, timestamped, and verifiable",
  },
  {
    icon: Lock,
    text: "Transparent fee & audit trails",
    detail: "Parents and auditors can verify every transaction",
  },
  {
    icon: Award,
    text: "Lifetime student credentials & certificates",
    detail: "Digital certificates that never expire or get lost",
  },
  {
    icon: FileCheck,
    text: "Future-ready for DAO & EdTech economy",
    detail: "Web3-native architecture for tomorrow's education",
  },
];

export default function AIBlockchain() {
  return (
    <section
      id="ai"
      className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-[#0057C8]/5 dark:from-[#000000] dark:via-[#0D1B2A] dark:to-[#000000] py-24 sm:py-32"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[-200px] top-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-[#0057C8]/12 dark:bg-[#0057C8]/20 blur-[140px]"
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-[-200px] top-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-[#5CDD2B]/10 dark:bg-[#5CDD2B]/18 blur-[140px]"
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
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#0057C8]/20 dark:border-[#0057C8]/30 bg-white/80 dark:bg-white/5 backdrop-blur-xl px-5 py-2.5 text-sm font-semibold shadow-lg shadow-[#0057C8]/10"
          >
            <Zap
              size={14}
              className="text-[#0057C8] dark:text-[#1A9FFF]"
            />
            <span className="text-[#0057C8] dark:text-[#1A9FFF]">
              Powered by RIT AI + Blockchain
            </span>
          </motion.div>

          <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
            Not Just Software.
            <br />
            <span className="bg-gradient-to-r from-[#0057C8] via-[#1A9FFF] to-[#5CDD2B] dark:from-[#1A9FFF] dark:via-[#55CFFF] dark:to-[#5CDD2B] bg-clip-text text-transparent">
              An Intelligent School OS
            </span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            <span className="font-semibold text-gray-900 dark:text-white">
              LearnXChain
            </span>{" "}
            blends AI intelligence with blockchain trust — a system that thinks,
            learns, and earns trust{" "}
            <span className="text-[#0057C8] dark:text-[#1A9FFF] font-medium">
              automatically
            </span>
            .
          </p>
        </motion.div>

        {/* Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          {/* AI SIDE */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="group"
          >
            <div className="relative h-full rounded-2xl border border-gray-200/70 dark:border-white/[0.06] bg-white/90 dark:bg-white/[0.03] backdrop-blur-xl p-7 sm:p-8 transition-all duration-300 hover:border-[#0057C8]/30 dark:hover:border-[#0057C8]/30 hover:shadow-xl hover:shadow-[#0057C8]/5">
              {/* Glow */}
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-[#0057C8] to-[#1A9FFF] opacity-0 group-hover:opacity-[0.04] dark:group-hover:opacity-[0.08] transition-opacity duration-300" />

              {/* Header */}
              <div className="relative flex items-center gap-4 mb-7">
                <div className="rounded-xl bg-[#0057C8]/5 dark:bg-[#0057C8]/10 p-3.5 transition-transform duration-300 group-hover:scale-110">
                  <Brain className="h-6 w-6 text-[#0057C8] dark:text-[#1A9FFF]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    RIT AI that runs the school
                  </h3>
                  <p className="text-xs font-semibold text-[#0057C8] dark:text-[#1A9FFF] uppercase tracking-wider mt-0.5">
                    22 Intelligent Modules
                  </p>
                </div>
              </div>

              {/* Features List */}
              <div className="relative space-y-3">
                {aiFeatures.map((feature, i) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -15 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + i * 0.08 }}
                      className="flex gap-3 rounded-xl border border-[#0057C8]/10 dark:border-[#0057C8]/10 bg-[#0057C8]/5 dark:bg-[#0057C8]/5 p-4 transition-all duration-200 hover:border-[#0057C8]/20 dark:hover:border-[#0057C8]/20"
                    >
                      <div className="flex-shrink-0 rounded-lg bg-[#0057C8]/10 dark:bg-[#0057C8]/10 p-2">
                        <Icon className="h-4 w-4 text-[#0057C8] dark:text-[#1A9FFF]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                          {feature.text}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                          {feature.detail}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* BLOCKCHAIN SIDE */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="group"
          >
            <div className="relative h-full rounded-2xl border border-gray-200/70 dark:border-white/[0.06] bg-white/90 dark:bg-white/[0.03] backdrop-blur-xl p-7 sm:p-8 transition-all duration-300 hover:border-[#5CDD2B]/30 dark:hover:border-[#5CDD2B]/20 hover:shadow-xl hover:shadow-[#5CDD2B]/5">
              {/* Glow */}
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-[#5CDD2B] to-[#1A9FFF] opacity-0 group-hover:opacity-[0.04] dark:group-hover:opacity-[0.08] transition-opacity duration-300" />

              {/* Header */}
              <div className="relative flex items-center gap-4 mb-7">
                <div className="rounded-xl bg-[#5CDD2B]/5 dark:bg-[#5CDD2B]/10 p-3.5 transition-transform duration-300 group-hover:scale-110">
                  <ShieldCheck className="h-6 w-6 text-[#4BBD22] dark:text-[#5CDD2B]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Blockchain that builds trust
                  </h3>
                  <p className="text-xs font-semibold text-[#4BBD22] dark:text-[#5CDD2B] uppercase tracking-wider mt-0.5">
                    Immutable Records
                  </p>
                </div>
              </div>

              {/* Features List */}
              <div className="relative space-y-3">
                {blockchainFeatures.map((feature, i) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 15 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + i * 0.08 }}
                      className="flex gap-3 rounded-xl border border-[#5CDD2B]/10 dark:border-[#5CDD2B]/10 bg-[#5CDD2B]/5 dark:bg-[#5CDD2B]/5 p-4 transition-all duration-200 hover:border-[#5CDD2B]/20 dark:hover:border-[#5CDD2B]/20"
                    >
                      <div className="flex-shrink-0 rounded-lg bg-[#5CDD2B]/10 dark:bg-[#5CDD2B]/10 p-2">
                        <Icon className="h-4 w-4 text-[#4BBD22] dark:text-[#5CDD2B]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                          {feature.text}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                          {feature.detail}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Connection Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, type: "spring" }}
          className="mt-10 flex items-center justify-center"
        >
          <div className="flex items-center gap-3 rounded-full border border-gray-200/50 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl px-6 py-3 shadow-lg shadow-[#0057C8]/5">
            <div className="h-2 w-2 rounded-full bg-[#0057C8] animate-pulse" />
            <Link2 className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            <div className="h-2 w-2 rounded-full bg-[#5CDD2B] animate-pulse" />
            <span className="ml-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
              Seamlessly Integrated
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
