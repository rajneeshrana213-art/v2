"use client";
import { motion } from "framer-motion";

const targetUsers = [
  {
    icon: "🧑‍🏫",
    title: "Students (Class 6–12)",
    type: "Primary",
    color: "from-indigo-500 to-violet-600",
    bg: "bg-indigo-50 dark:bg-indigo-500/10",
    border: "border-indigo-200/60 dark:border-indigo-500/25",
    useCases: [
      "AI-powered daily study roadmap",
      "Adaptive difficulty practice tests",
      "Career discovery & path planning",
      "Gamified learning with XP rewards",
      "Exam readiness score in real-time",
    ],
  },
  {
    icon: "🌾",
    title: "Rural & Semi-Urban Learners",
    type: "Primary",
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    border: "border-emerald-200/60 dark:border-emerald-500/25",
    useCases: [
      "Hinglish & regional language explanations",
      "Voice-first learning interface",
      "Offline sync — no internet required",
      "Low-bandwidth optimized content",
      "Real-life local context examples",
    ],
  },
  {
    icon: "👩‍🏫",
    title: "Teachers & School Admin",
    type: "Secondary",
    color: "from-blue-500 to-cyan-600",
    bg: "bg-blue-50 dark:bg-blue-500/10",
    border: "border-blue-200/60 dark:border-blue-500/25",
    useCases: [
      "Auto-graded exam evaluations",
      "Per-student performance reports",
      "At-risk student alerts & interventions",
      "Class-level weak topic identification",
      "Automated homework correction",
    ],
  },
  {
    icon: "👨‍👩‍👧",
    title: "Parents",
    type: "Secondary",
    color: "from-amber-500 to-orange-600",
    bg: "bg-amber-50 dark:bg-amber-500/10",
    border: "border-amber-200/60 dark:border-amber-500/25",
    useCases: [
      "Simple monthly progress summary",
      "Career guidance tips at home",
      "Stress and engagement alerts",
      "Monthly action plan for support",
      "Child's growth analysis report",
    ],
  },
  {
    icon: "🏛️",
    title: "Government & CSR Partners",
    type: "Secondary",
    color: "from-slate-500 to-gray-700",
    bg: "bg-slate-50 dark:bg-slate-500/10",
    border: "border-slate-200/60 dark:border-slate-500/25",
    useCases: [
      "District-level education heatmaps",
      "Skill gap analysis by region",
      "Employability index dashboards",
      "Rural education improvement metrics",
      "CSR impact reporting",
    ],
  },
  {
    icon: "🚀",
    title: "Advanced Students",
    type: "Talent Track",
    color: "from-rose-500 to-pink-600",
    bg: "bg-rose-50 dark:bg-rose-500/10",
    border: "border-rose-200/60 dark:border-rose-500/25",
    useCases: [
      "Olympiad preparation module",
      "Research task assignment by AI",
      "Startup challenge simulations",
      "Advanced coding & problem solving",
    ],
  },
];

const differentiators = [
  {
    icon: "❌",
    title: "NOT a Coaching App",
    desc: "We don't replace teachers. We amplify them with intelligence.",
    color: "text-red-500",
  },
  {
    icon: "❌",
    title: "NOT an LMS Platform",
    desc: "We don't just host content. We build personalized growth pathways.",
    color: "text-red-500",
  },
  {
    icon: "❌",
    title: "NOT an ERP System",
    desc: "We don't just manage operations. We optimize student outcomes.",
    color: "text-red-500",
  },
  {
    icon: "✅",
    title: "AI Student Growth OS",
    desc: "India's first system that combines academic AI + career discovery + skill economy + rural access.",
    color: "text-emerald-500",
  },
];

export default function AIUseCases() {
  return (
    <section className="py-24 bg-white dark:bg-[#0E1117] transition-colors duration-300 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-transparent to-purple-50/30 dark:from-indigo-950/10 dark:via-transparent dark:to-purple-950/10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <span className="inline-block px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-sm font-semibold mb-4 border border-indigo-200 dark:border-indigo-500/30">
            👥 Target Users
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
            Built for{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              Every Stakeholder
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            LXC-AI serves students, teachers, parents, and policymakers — each with their own intelligent experience.
          </p>
        </motion.div>

        {/* User Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {targetUsers.map((user, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className={`rounded-2xl border ${user.border} ${user.bg} backdrop-blur-sm p-6 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300`}
            >
              <div className="flex items-start gap-3 mb-4">
                <div className={`text-3xl w-12 h-12 rounded-xl bg-gradient-to-br ${user.color} flex items-center justify-center`}>
                  {user.icon}
                </div>
                <div>
                  <div className={`text-sm font-bold uppercase tracking-wider bg-gradient-to-r ${user.color} bg-clip-text text-transparent`}>
                    {user.type}
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight mt-1">{user.title}</h3>
                </div>
              </div>
              <ul className="space-y-2">
                {user.useCases.map((uc, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${user.color} flex-shrink-0 mt-2`} />
                    {uc}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Competitive Advantage */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
          <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
            🎯 Our{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              Competitive Advantage
            </span>
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-lg">We are building AI Student Growth Infrastructure for Bharat — nothing else exists like this.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {differentiators.map((d, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-gray-200/60 dark:border-white/10 bg-white/80 dark:bg-gray-800/30 backdrop-blur-sm p-6 text-center"
            >
              <div className={`text-4xl mb-4 ${d.color}`}>{d.icon}</div>
              <h4 className="font-bold text-base text-gray-900 dark:text-white mb-2">{d.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{d.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
