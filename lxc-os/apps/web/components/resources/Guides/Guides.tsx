"use client";
import { motion } from "framer-motion";
import Link from "next/link";

const guides = [
  {
    title: "How to Digitize School Operations Step-by-Step",
    description: "A comprehensive guide to transforming your school's operations with digital tools and automation.",
    icon: "📘",
    steps: "12 steps",
    difficulty: "Beginner",
    slug: "how-to-digitize-school-operations-step-by-step"
  },
  {
    title: "AI Readiness Checklist for School Leaders",
    description: "Evaluate your school's readiness for AI integration with this detailed checklist and action plan.",
    icon: "✅",
    steps: "25 items",
    difficulty: "Intermediate",
    slug: "ai-readiness-checklist-for-school-leaders"
  },
  {
    title: "Reducing Fee Leakage with Technology",
    description: "Learn proven strategies to minimize fee leakage and improve financial transparency using technology.",
    icon: "💰",
    steps: "8 strategies",
    difficulty: "Advanced",
    slug: "reducing-fee-leakage-with-technology"
  },
  {
    title: "Building Parent Trust in the Digital Era",
    description: "Essential strategies for establishing and maintaining trust with parents through transparent communication.",
    icon: "🤝",
    steps: "10 strategies",
    difficulty: "Intermediate",
    slug: "building-parent-trust-in-the-digital-era"
  }
];

export default function ResourcesGuides() {
  return (
    <section className="bg-transparent py-28 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-[var(--font-grotesk)] text-4xl md:text-5xl  text-gray-900 dark:text-white mb-4">
            Practical Guides
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium">
            Step-by-step guides to help you succeed
          </p>
        </motion.div>

        <div className="space-y-6">
          {guides.map((guide, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ x: 8, scale: 1.01 }}
              className="group"
            >
              <Link href={`/resources/${guide.slug}`}>
                <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0C1018] backdrop-blur-sm p-8 transition-all duration-300 hover:shadow-xl hover:border-[#0057C8]/50 dark:hover:border-[#0057C8]/50">
                  <div className="flex items-start gap-6">
                    <div className="text-5xl transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                      {guide.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-[#0057C8] dark:group-hover:text-[#1A9FFF] transition-colors">
                          {guide.title}
                        </h3>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                        {guide.description}
                      </p>
                      <div className="flex items-center gap-4">
                        <span className="px-3 py-1 text-xs font-bold bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-full border border-gray-200 dark:border-white/10">
                          {guide.steps}
                        </span>
                        <span className="px-3 py-1 text-xs font-bold bg-[#0057C8]/5 dark:bg-[#0057C8]/10 text-[#0057C8] dark:text-[#1A9FFF] rounded-full border border-[#0057C8]/20">
                          {guide.difficulty}
                        </span>
                        <motion.div
                          className="flex items-center text-[#0057C8] dark:text-[#1A9FFF] font-bold text-sm ml-auto"
                          whileHover={{ x: 4 }}
                        >
                          View guide
                          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

