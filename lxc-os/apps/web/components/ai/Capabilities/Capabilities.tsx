"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const layers = [
  {
    id: "L1",
    label: "Layer 1",
    title: "Academic Intelligence",
    icon: "🏫",
    gradient: "from-indigo-500 to-violet-600",
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-500/10",
    border: "border-indigo-200/60 dark:border-indigo-500/25",
    modules: [
      {
        num: "01",
        icon: "📝",
        title: "AI Exam Evaluation Engine",
        desc: "Automate grading with deep feedback across MCQs and subjective answers.",
        features: [
          "MCQ auto grading with instant scoring",
          "Descriptive answer analysis & rubric scoring",
          "Grammar + concept gap correction",
          "Improvement suggestions per question",
          "Handwriting OCR — Phase 2",
        ],
        kpi: "< 5 sec response · 90% accuracy vs teacher benchmark",
      },
      {
        num: "02",
        icon: "💡",
        title: "Homework & Doubt Assistant",
        desc: "Step-by-step AI explanations in Hindi, Hinglish, and English at any depth.",
        features: [
          "Step-by-step concept explanations",
          "Multi-language: Hindi / Hinglish / English",
          "Simplified vs. advanced explanation modes",
          "Voice input support",
          "Vector DB concept retrieval",
        ],
        kpi: "Instant · Multi-level · Voice support",
      },
      {
        num: "03",
        icon: "📖",
        title: "AI Lesson Companion",
        desc: "Ask doubts anytime, get topic summaries and smart revision notes.",
        features: [
          "Anytime doubt resolution",
          "Topic summarization in 30 seconds",
          "Smart AI revision notes generation",
          "Board exam-aligned concept mapping",
          "Class-specific content library",
        ],
        kpi: "Always-on · Board aligned",
      },
    ],
  },
  {
    id: "L2",
    label: "Layer 2",
    title: "Personalized Learning & Adaptivity",
    icon: "📅",
    gradient: "from-violet-500 to-purple-600",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-500/10",
    border: "border-violet-200/60 dark:border-violet-500/25",
    modules: [
      {
        num: "04",
        icon: "🗺️",
        title: "Personalized Study Roadmap",
        desc: "AI-generated daily study plans based on your exam date, performance, and time.",
        features: [
          "Exam countdown planner with daily tasks",
          "Smart spaced-repetition scheduling",
          "Missed day recovery plan",
          "Subject priority adjustment",
          "Focus time optimization",
        ],
        kpi: "Daily adaptive · Spaced repetition · Dynamic adjustment",
      },
      {
        num: "05",
        icon: "⚙️",
        title: "Adaptive Difficulty Engine",
        desc: "Core AI intelligence that automatically changes difficulty based on student performance.",
        features: [
          "Harder if student progresses fast",
          "Easier + practice loops if struggling",
          "Accuracy rate & response time tracking",
          "Item Response Theory (IRT) algorithm",
          "Mastery Threshold Model",
        ],
        kpi: "Real-time adaptation · IRT-based · Personalized loops",
      },
      {
        num: "06",
        icon: "🧪",
        title: "Adaptive Mock & Practice Engine",
        desc: "AI-generated tests with difficulty calibration, speed/accuracy analysis, and board prediction.",
        features: [
          "Difficulty-based question generation",
          "Weak topic reinforcement tests",
          "Speed vs accuracy analysis",
          "Exam readiness score",
          "Board exam outcome prediction",
        ],
        kpi: "AI-generated · Board-calibrated · Readiness score",
      },
    ],
  },
  {
    id: "L3",
    label: "Layer 3",
    title: "Performance & Cognitive Intelligence",
    icon: "📊",
    gradient: "from-cyan-500 to-blue-600",
    color: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-50 dark:bg-cyan-500/10",
    border: "border-cyan-200/60 dark:border-cyan-500/25",
    modules: [
      {
        num: "07",
        icon: "📈",
        title: "Student Performance Intelligence",
        desc: "Deep analytics tracking every dimension of academic performance.",
        features: [
          "Learning speed & accuracy trend tracking",
          "Retention rate & confidence levels",
          "Error pattern identification",
          "AI performance report generation",
          "Risk alerts for at-risk students",
        ],
        kpi: "Real-time dashboard · AI report · Risk alerts",
      },
      {
        num: "08",
        icon: "🧠",
        title: "Cognitive Optimization Engine",
        desc: "Brain-based AI tracking focus, fatigue, and forgetting curves.",
        features: [
          "Memory retention & forgetting curve prediction",
          "Smart revision timing recommendations",
          "Focus span & learning fatigue detection",
          "Smart break recommendations",
          "Productivity score",
        ],
        kpi: "Brain-optimized · Forgetting curve · Fatigue detection",
      },
      {
        num: "09",
        icon: "🪞",
        title: "Digital Twin Student Model",
        desc: "Each student's complete learning profile — academic graph, skills, behavior signals.",
        features: [
          "Individual academic graph & skill map",
          "Behavior signals & interest evolution",
          "Dropout risk prediction",
          "Career alignment probability",
          "Growth & talent forecasting",
        ],
        kpi: "Per-student · Predictive · Evolution tracking",
      },
    ],
  },
  {
    id: "L4",
    label: "Layer 4",
    title: "Career & Self-Enhancement",
    icon: "🧭",
    gradient: "from-amber-500 to-orange-600",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-500/10",
    border: "border-amber-200/60 dark:border-amber-500/25",
    modules: [
      {
        num: "10",
        icon: "🎯",
        title: "Career Discovery Engine",
        desc: "Micro quizzes, behavior tracking, and personality mapping to uncover the right career.",
        features: [
          "Micro interest quizzes & skill signal tracking",
          "Personality mapping & strength detection",
          "Top 5 career suggestions output",
          "Required skills roadmap",
          "Decision Simulator: Science vs Commerce, Degree vs Skill",
        ],
        kpi: "Behaviour-driven · Data-backed · Personalized",
      },
      {
        num: "11",
        icon: "🎤",
        title: "Communication & Life Skills Coach",
        desc: "Speaking practice, pronunciation correction, confidence scoring, and life skills training.",
        features: [
          "Speaking practice with pronunciation feedback",
          "English conversation & interview simulation",
          "Confidence scoring via voice analytics",
          "Time management & leadership basics",
          "Financial literacy & problem solving",
        ],
        kpi: "Speech-to-text · LLM evaluation · Confidence scoring",
      },
      {
        num: "12",
        icon: "💛",
        title: "Emotional Intelligence & Motivation AI",
        desc: "Detects stress, low engagement, and motivates students with positive reinforcement.",
        features: [
          "Stress detection & low engagement signals",
          "Exam anxiety detection & help",
          "Positive reinforcement & encouragement system",
          "Motivational exercises & easier task routing",
          "Inactivity alerts to teachers/parents",
        ],
        kpi: "Emotion-aware · Proactive · Supportive",
      },
    ],
  },
  {
    id: "L5",
    label: "Layer 5",
    title: "Gamification & Skill Economy",
    icon: "🎮",
    gradient: "from-rose-500 to-pink-600",
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-500/10",
    border: "border-rose-200/60 dark:border-rose-500/25",
    modules: [
      {
        num: "13",
        icon: "🏆",
        title: "Gamified Learning Engine",
        desc: "Learning through XP, skill trees, quiz battles, and achievement rewards.",
        features: [
          "XP system & level progression",
          "Skill tree unlock & quiz battles",
          "AI opponents for practice challenges",
          "Achievement badges & learning streaks",
          "Leaderboard & competitive rewards",
        ],
        kpi: "Engagement-driven · Streak-based · Competitive",
      },
      {
        num: "14",
        icon: "🔬",
        title: "Real World Project Engine",
        desc: "AI assigns mini projects, coding challenges, science experiments & business simulations.",
        features: [
          "Mini business & coding project assignment",
          "Science experiments & community challenges",
          "AI rubric + creativity scoring",
          "Local problem-solving tasks",
          "Portfolio-ready project output",
        ],
        kpi: "Real-world skills · AI evaluated · Portfolio-ready",
      },
      {
        num: "15",
        icon: "🏅",
        title: "Skill Economy & Certification",
        desc: "Blockchain-backed skill badges, digital portfolios, and verifiable certificates.",
        features: [
          "AI-evaluated skill badges",
          "Blockchain-certified credentials on-chain",
          "Digital skill passport",
          "Portfolio builder & public profile",
          "Talent leaderboard",
        ],
        kpi: "Blockchain-verified · Portable · Trustless",
      },
    ],
  },
  {
    id: "L6",
    label: "Layer 6",
    title: "Accessibility, Community & Bharat Mode",
    icon: "🌍",
    gradient: "from-emerald-500 to-teal-600",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    border: "border-emerald-200/60 dark:border-emerald-500/25",
    modules: [
      {
        num: "16",
        icon: "🇮🇳",
        title: "Bharat Mode (Rural Focus AI)",
        desc: "Voice-first, offline-capable AI learning designed for Tier 2/3 and rural India.",
        features: [
          "Hinglish & regional language explanations",
          "Voice-first learning interface",
          "Low bandwidth & offline sync mode",
          "Real-life examples from rural context",
          "Vernacular content library",
        ],
        kpi: "Rural-ready · Offline · Voice-first · 10+ languages",
      },
      {
        num: "17",
        icon: "👨‍👩‍👧",
        title: "Parent Intelligence Module",
        desc: "Simple progress summaries, growth analysis, and career guidance for parents.",
        features: [
          "Simple monthly progress summary",
          "Growth analysis without jargon",
          "Career guidance tips for parents",
          "Monthly action plan for home support",
          "Risk alerts for struggling students",
        ],
        kpi: "Parent-friendly · Actionable · Monthly cadence",
      },
      {
        num: "18",
        icon: "🤝",
        title: "Peer Intelligence Network",
        desc: "AI-matched study partners, group competitions, and skill-based communities.",
        features: [
          "AI-matched study partner recommendations",
          "Group study challenges & competitions",
          "Collaborative learning projects",
          "Community discussion boards",
          "Skill-based learning circles",
        ],
        kpi: "AI-matched · Social learning · Community-driven",
      },
    ],
  },
];

const advancedModules = [
  {
    icon: "🎤",
    title: "AI Teacher / Avatar System",
    desc: "Voice interaction, video avatar, emotion-based responses with subject-specific personalities.",
    gradient: "from-purple-500 to-violet-600",
    phase: "Phase 3",
  },
  {
    icon: "🕶️",
    title: "Immersive Learning (AR/VR)",
    desc: "AR science labs, virtual history tours, 3D math visualizations.",
    gradient: "from-cyan-500 to-indigo-600",
    phase: "Phase 3+",
  },
  {
    icon: "🏛️",
    title: "Government & CSR Analytics",
    desc: "District heatmaps, skill gap analysis, employability index, education improvement dashboards.",
    gradient: "from-slate-500 to-gray-600",
    phase: "Phase 2",
  },
  {
    icon: "🧬",
    title: "Learning DNA Profile",
    desc: "After 6–12 months: AI generates strength map, learning style, career readiness score.",
    gradient: "from-rose-500 to-pink-600",
    phase: "Ongoing",
  },
  {
    icon: "🧑‍🎓",
    title: "Talent Incubator Mode",
    desc: "Olympiad prep, research tasks, startup challenges, advanced coding for high achievers.",
    gradient: "from-amber-500 to-orange-600",
    phase: "Phase 2",
  },
  {
    icon: "🪙",
    title: "Skill Economy Passport",
    desc: "Portable blockchain-verified skill portfolio visible to employers and institutions.",
    gradient: "from-emerald-500 to-teal-600",
    phase: "Phase 2",
  },
];

export default function AICapabilities() {
  const [selectedLayer, setSelectedLayer] = useState(0);
  const layer = layers[selectedLayer];

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-[#0B0E14] dark:to-[#0E1117] transition-colors duration-300 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <span className="inline-block px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-sm font-semibold mb-4 border border-indigo-200 dark:border-indigo-500/30">
            🧠 22 AI Modules · 6 Macro Layers
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
            LXC-AI{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              Module System
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            India's first <span className="font-semibold text-indigo-600 dark:text-indigo-400">AI Student Growth Operating System</span> — combining academic intelligence, adaptive learning, career discovery, gamification, and rural accessibility in one unified platform.
          </p>
        </motion.div>

        {/* Layer Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {layers.map((l, i) => (
            <motion.button
              key={l.id}
              onClick={() => setSelectedLayer(i)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 ${selectedLayer === i
                  ? `bg-gradient-to-r ${l.gradient} text-white border-transparent shadow-lg shadow-indigo-500/20`
                  : `${l.bg} ${l.color} ${l.border} hover:opacity-80`
                }`}
            >
              <span>{l.icon}</span>
              <span className="hidden sm:inline">{l.label}:</span>
              <span className="hidden md:inline">{l.title}</span>
              <span className="md:hidden">{l.title.split(" ")[0]}</span>
            </motion.button>
          ))}
        </div>

        {/* Module Cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedLayer}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
          >
            {layer.modules.map((mod, i) => (
              <motion.div
                key={mod.num}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className={`relative rounded-2xl border ${layer.border} bg-white/80 dark:bg-gray-800/40 backdrop-blur-sm p-7 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300`}
              >
                {/* Module number */}
                <div className={`absolute top-5 right-5 text-5xl font-black opacity-[0.06] dark:opacity-[0.08] bg-gradient-to-r ${layer.gradient} bg-clip-text text-transparent select-none`}>
                  {mod.num}
                </div>

                <div className="text-3xl mb-3">{mod.icon}</div>
                <h3 className={`text-lg font-bold text-gray-900 dark:text-white mb-2 ${layer.color}`}>{mod.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{mod.desc}</p>

                <ul className="space-y-1.5 mb-4">
                  {mod.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${layer.gradient} flex-shrink-0 mt-1.5`} />
                      {f}
                    </li>
                  ))}
                </ul>

                <div className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${layer.bg} ${layer.color} border ${layer.border}`}>
                  {mod.kpi}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Advanced AI Layer */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8">
          <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
            🎤 Advanced AI Layer
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Next-generation features rolling out in Phases 2 & 3</p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {advancedModules.map((mod, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-gray-200/60 dark:border-white/10 bg-white/70 dark:bg-white/5 p-4 text-center hover:shadow-lg hover:border-indigo-300/50 dark:hover:border-indigo-500/30 transition-all"
            >
              <div className="text-2xl mb-2">{mod.icon}</div>
              <div className="text-sm font-bold text-gray-900 dark:text-white mb-1 leading-tight">{mod.title}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 leading-snug">{mod.desc}</div>
              <span className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded-full bg-gradient-to-r ${mod.gradient} text-white`}>
                {mod.phase}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
