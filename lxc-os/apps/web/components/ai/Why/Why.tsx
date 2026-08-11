"use client";
import { motion } from "framer-motion";

const visionPoints = [
  {
    icon: "📚",
    title: "From Marks → to Growth",
    description:
      "Move beyond exam results. Build a platform that tracks every dimension of student growth — academic, cognitive, emotional, and career-ready.",
    gradient: "from-indigo-500 to-violet-600",
  },
  {
    icon: "🇮🇳",
    title: "Built for Bharat",
    description:
      "Rural schools, Tier 2/3 cities, Hindi-medium learners — our Bharat Mode makes world-class AI accessible to every student in India.",
    gradient: "from-orange-500 to-amber-600",
  },
  {
    icon: "🔗",
    title: "Skill Economy Integration",
    description:
      "Blockchain-verified skill badges and a digital passport that students can carry from school to career — a first in Indian EdTech.",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    icon: "🧬",
    title: "Adaptive AI Core",
    description:
      "Every student learns differently. Our IRT-based adaptive engine continuously personalizes difficulty, pace, and content for each learner.",
    gradient: "from-cyan-500 to-blue-600",
  },
];

const macroLayers = [
  { num: "1", label: "Academic Intelligence", icon: "🏫", color: "from-indigo-500 to-violet-600" },
  { num: "2", label: "Personalized Learning & Adaptivity", icon: "📅", color: "from-violet-500 to-purple-600" },
  { num: "3", label: "Performance & Cognitive AI", icon: "📊", color: "from-cyan-500 to-blue-600" },
  { num: "4", label: "Career & Self-Enhancement", icon: "🧭", color: "from-amber-500 to-orange-600" },
  { num: "5", label: "Gamification & Skill Economy", icon: "🎮", color: "from-rose-500 to-pink-600" },
  { num: "6", label: "Accessibility & Bharat Mode", icon: "🌍", color: "from-emerald-500 to-teal-600" },
];

export default function AIWhy() {
  return (
    <section className="py-24 bg-white dark:bg-[#0E1117] transition-colors duration-300 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-transparent to-purple-50/50 dark:from-indigo-950/20 dark:via-transparent dark:to-purple-950/20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Product Vision */}
        <div className="grid lg:grid-cols-2 gap-14 items-center mb-20">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-sm font-semibold mb-6 border border-indigo-200 dark:border-indigo-500/30">
              🌟 Product Vision
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-5 leading-tight">
              India's First
              <br />
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                AI Student Growth OS
              </span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              LXC-AI V1.0 combines <span className="font-semibold text-indigo-600 dark:text-indigo-400">academic intelligence</span>, <span className="font-semibold text-purple-600 dark:text-purple-400">career discovery</span>, <span className="font-semibold text-emerald-600 dark:text-emerald-400">self-development</span>, <span className="font-semibold text-amber-600 dark:text-amber-400">adaptive learning</span>, <span className="font-semibold text-rose-600 dark:text-rose-400">rural accessibility</span>, and <span className="font-semibold text-cyan-600 dark:text-cyan-400">skill economy</span> in a single unified platform.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200/50 dark:border-indigo-800/50"
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">🎯</div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1 text-sm">
                    Goal: Move beyond marks
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    From a <strong className="text-red-500">marks-focused system</strong> → to a <strong className="text-emerald-600 dark:text-emerald-400">student growth & future readiness platform</strong> built for every school in India.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right - Vision cards */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="space-y-4"
          >
            {visionPoints.map((point, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02, x: 6 }}
                className="group flex items-start gap-4 p-5 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300 shadow-sm hover:shadow-md cursor-default"
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${point.gradient} flex items-center justify-center text-xl flex-shrink-0`}>
                  {point.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1 text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {point.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{point.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* 6 Macro Layers overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1">
            🧱 6 Macro Layers · 22 AI Modules
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Everything interconnected — data from one layer feeds intelligence into others</p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {macroLayers.map((layer, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ y: -4 }}
              className="flex flex-col items-center text-center rounded-2xl border border-gray-200/60 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-sm p-4 hover:border-indigo-300/60 dark:hover:border-indigo-500/30 hover:shadow-lg transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${layer.color} flex items-center justify-center text-xl mb-3`}>
                {layer.icon}
              </div>
              <div className={`text-sm font-black mb-1 bg-gradient-to-r ${layer.color} bg-clip-text text-transparent`}>
                L{layer.num}
              </div>
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 leading-snug">{layer.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
