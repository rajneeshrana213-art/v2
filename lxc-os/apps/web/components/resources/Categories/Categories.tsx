"use client";
import { motion } from "framer-motion";
import { useState } from "react";

const categories = [
  { name: "School Operations", icon: "🏫", color: "from-[#0057C8] to-[#1A9FFF]" },
  { name: "AI in Education", icon: "🤖", color: "from-[#1A9FFF] to-[#5CDD2B]" },
  { name: "Blockchain & Trust", icon: "🔗", color: "from-[#5CDD2B] to-[#0057C8]" },
  { name: "Compliance & Policy", icon: "📋", color: "from-[#0057C8] to-[#FFC555]" },
  { name: "Growth & Admissions", icon: "📈", color: "from-[#FFC555] to-[#5CDD2B]" },
  { name: "Product Updates", icon: "✨", color: "from-[#5CDD2B] to-[#1A9FFF]" }
];

export default function ResourcesCategories() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="bg-transparent py-24 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-[var(--font-grotesk)] text-4xl md:text-5xl  text-gray-900 dark:text-white mb-4">
            Browse by Category
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium">
            Discover resources tailored to your needs
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              onHoverStart={() => setHoveredIndex(i)}
              onHoverEnd={() => setHoveredIndex(null)}
              whileHover={{ y: -8, scale: 1.02 }}
              className="relative group cursor-pointer"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300`} />
              <div
                className={`relative rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0C1018] backdrop-blur-sm p-6 transition-all duration-300 ${
                  hoveredIndex === i
                    ? "shadow-2xl border-[#0057C8]/50 dark:border-[#0057C8]/50"
                    : "shadow-md hover:shadow-xl"
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`text-4xl transform transition-transform duration-300 ${
                    hoveredIndex === i ? "scale-110 rotate-12" : ""
                  }`}>
                    {category.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {category.name}
                  </h3>
                </div>
                <div className="flex items-center text-sm text-[#0057C8] dark:text-[#1A9FFF] font-bold">
                  Explore
                  <motion.svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    animate={{ x: hoveredIndex === i ? 4 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </motion.svg>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

