"use client";
import { motion } from "framer-motion";

const archLayers = [
  {
    layer: "Presentation Layer",
    icon: "🖥️",
    color: "from-cyan-500 to-blue-600",
    tech: ["Next.js Web App", "React Native Mobile", "Voice Interface", "AR/VR (Phase 3)"],
    desc: "Student, Teacher, Parent & Admin interfaces",
  },
  {
    layer: "Real-Time Layer",
    icon: "⚡",
    color: "from-violet-500 to-indigo-600",
    tech: ["WebSockets", "Event-Driven Microservices", "Push Notifications", "Live Q&A"],
    desc: "Live data sync, instant feedback & notifications",
  },
  {
    layer: "AI Intelligence Layer",
    icon: "🧠",
    color: "from-indigo-500 to-violet-600",
    tech: ["Base LLM API (Phase 1)", "Fine-tuned Open Source Model (Phase 2)", "Vector DB (Pinecone / Weaviate)", "Knowledge Graph (Neo4j)", "STT / TTS API"],
    desc: "Core AI reasoning, adaptation & generation",
  },
  {
    layer: "Adaptive Engine",
    icon: "⚙️",
    color: "from-purple-500 to-pink-600",
    tech: ["Student Behavior Model", "IRT Algorithm", "Spaced Repetition Engine", "Forgetting Curve Model", "Gamification Logic"],
    desc: "Personalization, difficulty calibration & learning paths",
  },
  {
    layer: "Backend Services",
    icon: "🔧",
    color: "from-blue-500 to-cyan-600",
    tech: ["Node.js / Python AI Services", "Prisma ORM", "GraphQL + REST API", "Auth & RBAC", "File Processing"],
    desc: "Business logic, APIs & service orchestration",
  },
  {
    layer: "Data Layer",
    icon: "🗄️",
    color: "from-emerald-500 to-teal-600",
    tech: ["PostgreSQL (Primary)", "Redis (Cache)", "Pinecone (Vectors)", "S3 / File Store", "Event Log Store"],
    desc: "Persistent data, caching & vector embeddings",
  },
  {
    layer: "Blockchain Layer",
    icon: "⛓️",
    color: "from-amber-500 to-orange-600",
    tech: ["Skill Badge NFTs", "Certificate Smart Contracts", "Digital Passport", "On-chain Verification", "Polygon / L2"],
    desc: "Verifiable credentials & skill economy",
  },
  {
    layer: "Infrastructure",
    icon: "☁️",
    color: "from-slate-500 to-gray-600",
    tech: ["AWS / GCP Cloud", "Docker + Kubernetes", "CI/CD Pipeline", "Auto-scaling", "99.9% Uptime SLA"],
    desc: "Scalable, secure cloud deployment",
  },
];

const phaseData = [
  {
    id: "P1",
    title: "Phase 1",
    timeline: "0–6 Months",
    icon: "🚀",
    color: "from-indigo-500 to-violet-600",
    border: "border-indigo-200/60 dark:border-indigo-500/25",
    modules: [
      "Study Roadmap Engine",
      "Adaptive Mock & Practice Engine",
      "Adaptive Difficulty Engine",
      "Student Performance Dashboard",
      "Career Discovery (Basic)",
      "Bharat Mode (Hinglish)",
    ],
  },
  {
    id: "P2",
    title: "Phase 2",
    timeline: "6–12 Months",
    icon: "📈",
    color: "from-violet-500 to-purple-600",
    border: "border-violet-200/60 dark:border-violet-500/25",
    modules: [
      "Communication Coach",
      "Gamification Engine",
      "Life Skills AI",
      "Parent Intelligence Module",
      "Emotional AI",
      "Talent Incubator Mode",
      "Peer Network",
      "Govt & CSR Analytics",
    ],
  },
  {
    id: "P3",
    title: "Phase 3",
    timeline: "12–24 Months",
    icon: "🌟",
    color: "from-purple-500 to-pink-600",
    border: "border-purple-200/60 dark:border-purple-500/25",
    modules: [
      "AI Avatar Teacher",
      "Digital Twin Student Model",
      "Skill Economy + Blockchain",
      "Immersive AR/VR Learning",
      "Government Dashboard",
      "Learning DNA Profile",
      "Real World Project Engine",
    ],
  },
];

const kpis = [
  {
    group: "Student KPIs", icon: "👨‍🎓", items: [
      { label: "Daily Active Usage", target: "> 60 min/day" },
      { label: "Module Completion Rate", target: "> 80%" },
      { label: "Knowledge Retention", target: "+40% vs baseline" },
      { label: "Skill Growth Score", target: "Tracked monthly" },
    ]
  },
  {
    group: "School KPIs", icon: "🏫", items: [
      { label: "Result Improvement", target: "+20% YoY" },
      { label: "Engagement Rate", target: "> 70% DAU" },
      { label: "Parent Satisfaction", target: "> 90% CSAT" },
      { label: "Dropout Risk Reduction", target: "-30%" },
    ]
  },
  {
    group: "Platform KPIs", icon: "📊", items: [
      { label: "AI Response Time", target: "< 5 seconds" },
      { label: "Grading Accuracy", target: "90% vs teacher" },
      { label: "System Uptime", target: "99.9% SLA" },
      { label: "Predictions Accuracy", target: "> 85% on outcomes" },
    ]
  },
];

export default function AIArchitecture() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50 dark:from-[#0E1117] dark:to-[#0B0E14] transition-colors duration-300 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ── Tech Architecture ── */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <span className="inline-block px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-sm font-semibold mb-4 border border-indigo-200 dark:border-indigo-500/30">
            🧱 Core Architecture
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
            Technical{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              Architecture
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            A layered, microservice AI-OS built for scale, reliability, and India-first accessibility.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-24">
          {archLayers.map((layer, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ y: -5 }}
              className="rounded-2xl border border-gray-200/60 dark:border-white/10 bg-white/80 dark:bg-gray-800/40 backdrop-blur-sm p-5 hover:shadow-xl hover:shadow-indigo-500/10 transition-all"
            >
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r ${layer.color} text-white text-sm font-bold mb-3`}>
                <span>{layer.icon}</span>
                {layer.layer}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 leading-snug">{layer.desc}</p>
              <ul className="space-y-1">
                {layer.tech.map((t, j) => (
                  <li key={j} className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                    <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${layer.color} flex-shrink-0`} />
                    {t}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* ── Development Phases ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <span className="inline-block px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 text-sm font-semibold mb-4 border border-violet-200 dark:border-violet-500/30">
            🗓️ Roadmap
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-3">
            Development{" "}
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent">
              Phases
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          {phaseData.map((phase, i) => (
            <motion.div
              key={phase.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              whileHover={{ y: -5 }}
              className={`rounded-2xl border ${phase.border} bg-white/80 dark:bg-gray-800/30 backdrop-blur-sm overflow-hidden`}
            >
              <div className={`bg-gradient-to-r ${phase.color} p-5`}>
                <div className="text-3xl mb-1">{phase.icon}</div>
                <div className="text-white font-black text-xl">{phase.title}</div>
                <div className="text-white/70 text-sm">{phase.timeline}</div>
              </div>
              <div className="p-5">
                <ul className="space-y-2">
                  {phase.modules.map((mod, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${phase.color} flex-shrink-0`} />
                      {mod}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── KPIs ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <span className="inline-block px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-semibold mb-4 border border-emerald-200 dark:border-emerald-500/30">
            📈 KPIs
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-3">
            Success{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
              Metrics
            </span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400">How we measure platform impact and student growth</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {kpis.map((group, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-gray-200/60 dark:border-white/10 bg-white/80 dark:bg-gray-800/30 backdrop-blur-sm p-6"
            >
              <div className="flex items-center gap-2 mb-5">
                <span className="text-2xl">{group.icon}</span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{group.group}</h3>
              </div>
              <div className="space-y-3">
                {group.items.map((item, j) => (
                  <div key={j} className="flex items-center justify-between">
                    <span className="text-base text-gray-600 dark:text-gray-400">{item.label}</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg">
                      {item.target}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
