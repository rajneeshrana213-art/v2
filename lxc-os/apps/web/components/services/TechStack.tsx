import { motion } from "framer-motion";
import Link from "next/link";

const technologies = [
  {
    category: "Frontend",
    icon: "🖥️",
    color: "from-[#0057C8] to-[#1A9FFF]",
    techs: ["React", "Next.js", "Vue.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "Framer Motion", "Storybook"],
  },
  {
    category: "Backend",
    icon: "⚙️",
    color: "from-[#1A9FFF] to-[#5CDD2B]",
    techs: ["Node.js", "Python", "Go", "FastAPI", "NestJS", "GraphQL", "REST APIs", "gRPC", "Prisma", "tRPC"],
  },
  {
    category: "AI & ML",
    icon: "🤖",
    color: "from-[#0057C8] to-[#1A9FFF]",
    techs: ["TensorFlow", "PyTorch", "LangChain", "OpenAI GPT-4", "HuggingFace", "Vertex AI", "Llama 3", "Stable Diffusion", "FAISS", "Pinecone"],
  },
  {
    category: "Blockchain",
    icon: "⛓️",
    color: "from-[#5CDD2B] to-[#4BBD22]",
    techs: ["Solidity", "Ethereum", "Solana", "Polygon", "Hardhat", "Foundry", "Web3.js", "Ethers.js", "Hyperledger", "The Graph", "IPFS"],
  },
  {
    category: "Mobile",
    icon: "📱",
    color: "from-[#FFC555] to-[#FF8C00]",
    techs: ["React Native", "Flutter", "Expo", "Swift", "Kotlin", "Firebase", "OneSignal", "App Store", "Play Store"],
  },
  {
    category: "Cloud & DevOps",
    icon: "☁️",
    color: "from-[#0057C8] to-[#1A9FFF]",
    techs: ["AWS", "GCP", "Azure", "Docker", "Kubernetes", "Terraform", "GitHub Actions", "ArgoCD", "Nginx", "Vercel", "CI/CD"],
  },
  {
    category: "Database",
    icon: "🗄️",
    color: "from-[#1A9FFF] to-[#0057C8]",
    techs: ["PostgreSQL", "MongoDB", "MySQL", "Redis", "Elasticsearch", "ClickHouse", "Supabase", "Firebase", "PlanetScale", "Neon"],
  },
  {
    category: "Design & UI",
    icon: "🎨",
    color: "from-[#1A9FFF] to-[#5CDD2B]",
    techs: ["Figma", "Adobe XD", "Principle", "Lottie", "After Effects", "Blender", "Spline 3D", "Rive"],
  },
  {
    category: "Security",
    icon: "🔒",
    color: "from-slate-700 to-gray-900",
    techs: ["OWASP", "Burp Suite", "Vault", "Auth0", "OAuth 2.0", "JWT", "SSL/TLS", "Penetration Testing"],
  },
  {
    category: "Analytics & Monitoring",
    icon: "📊",
    color: "from-[#5CDD2B] to-[#0057C8]",
    techs: ["Prometheus", "Grafana", "Sentry", "Datadog", "PostHog", "Mixpanel", "Segment", "Amplitude"],
  },
];

const whyUs = [
  { icon: "⚡", title: "Fast Delivery", desc: "Agile sprints, on-time every time" },
  { icon: "🔒", title: "Security First", desc: "Enterprise-grade security built in" },
  { icon: "📈", title: "Scale Ready", desc: "Architecture that grows with you" },
  { icon: "🤝", title: "Dedicated Team", desc: "Your partners, not just vendors" },
  { icon: "💡", title: "Innovation Led", desc: "Latest tech, battle-tested patterns" },
  { icon: "🌍", title: "Global Standards", desc: "ISO & GDPR compliant by default" },
  { icon: "🎯", title: "Results Focused", desc: "We measure impact, not just output" },
  { icon: "🔄", title: "Agile Process", desc: "Weekly sprints & transparent demos" },
];

export default function TechStack() {
  return (
    <section className="relative py-24 overflow-hidden bg-transparent">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tech Stack Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 text-sm font-bold uppercase tracking-widest text-[#1A9FFF] dark:text-[#1A9FFF] bg-[#1A9FFF]/5 dark:bg-[#1A9FFF]/10 rounded-full border border-[#1A9FFF]/20 dark:border-[#1A9FFF]/30 mb-4">
            Technology
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4">
            Our{" "}
            <span className="bg-gradient-to-r from-[#0057C8] to-[#1A9FFF] dark:from-[#1A9FFF] dark:to-[#5CDD2B] bg-clip-text text-transparent">
              Tech Stack
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            We use the best tools across every layer of the stack — from pixel-perfect frontends to robust cloud infrastructure.
          </p>
        </motion.div>

        {/* Tech Grid — 2 cols on md, 3 on lg, 5 on xl */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-24">
          {technologies.map((tech, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-gray-200/60 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-sm p-5 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300"
            >
              {/* Category Header */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">{tech.icon}</span>
                <div className={`inline-flex items-center px-2.5 py-1 rounded-full bg-gradient-to-r ${tech.color} text-white text-sm font-bold`}>
                  {tech.category}
                </div>
              </div>

              {/* Tech pills */}
              <div className="flex flex-wrap gap-1.5">
                {tech.techs.map((t, j) => (
                  <motion.span
                    key={j}
                    whileHover={{ scale: 1.08 }}
                    className="px-2 py-1 rounded-md bg-gray-100 dark:bg-white/5 border border-gray-200/60 dark:border-white/8 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-default transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-700 dark:hover:text-indigo-300"
                  >
                    {t}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Why Us */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">
            Why{" "}
            <span className="bg-gradient-to-r from-[#0057C8] to-[#1A9FFF] dark:from-[#1A9FFF] dark:to-[#5CDD2B] bg-clip-text text-transparent">
              Choose Us?
            </span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            We don't just deliver code — we deliver outcomes that move your business forward.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 mb-12">
          {whyUs.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
              whileHover={{ y: -4 }}
              className="flex flex-col items-center text-center rounded-2xl border border-gray-200/60 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-sm p-4 hover:border-indigo-300/60 dark:hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300"
            >
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="font-bold text-sm text-gray-900 dark:text-white mb-1 leading-tight">{item.title}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 leading-snug">{item.desc}</div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link href="/contact">
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#0057C8] to-[#1A9FFF] text-white font-semibold shadow-xl shadow-[#0057C8]/20 hover:shadow-[#0057C8]/40 transition-all"
            >
              Discuss Your Tech Needs
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
