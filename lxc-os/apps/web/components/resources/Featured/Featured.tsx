"use client";
import { motion } from "framer-motion";
import Link from "next/link";

const featuredArticles = [
  {
    title: "The Future School OS",
    description: "A deep dive into how LearnXChain combines AI, automation, and trust infrastructure to revolutionize education.",
    category: "Product",
    readTime: "8 min read",
    date: "Jan 15, 2024",
    gradient: "from-[#0057C8] to-[#1A9FFF]",
    slug: "the-future-school-os"
  },
  {
    title: "AI-Driven Decision Systems",
    description: "How AI-driven decision systems are reducing dropouts and improving outcomes in Indian schools by 40%.",
    category: "AI",
    readTime: "12 min read",
    date: "Jan 10, 2024",
    gradient: "from-[#1A9FFF] to-[#5CDD2B]",
    slug: "ai-driven-decision-systems"
  },
  {
    title: "Building Trust with Blockchain",
    description: "Exploring how blockchain technology creates transparency and builds parent trust in fee management.",
    category: "Technology",
    readTime: "10 min read",
    date: "Jan 5, 2024",
    gradient: "from-[#5CDD2B] to-[#0057C8]",
    slug: "building-trust-with-blockchain"
  }
];

export default function ResourcesFeatured() {
  return (
    <section className="bg-transparent py-28 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-[var(--font-grotesk)] text-4xl md:text-5xl  text-gray-900 dark:text-white mb-4">
            Featured Insights
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium">
            Deep dives into the future of education technology
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredArticles.map((article, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative cursor-pointer"
            >
              <Link href={`/resources/${article.slug}`}>
                <div className="relative h-full rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0C1018] backdrop-blur-sm overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-[#0057C8]/50 dark:hover:border-[#0057C8]/50">
                  {/* Gradient accent */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${article.gradient}`} />
                  
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1 text-xs font-bold bg-[#0057C8]/5 dark:bg-[#0057C8]/10 text-[#0057C8] dark:text-[#1A9FFF] rounded-full border border-[#0057C8]/20">
                        {article.category}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {article.readTime}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-[#0057C8] dark:group-hover:text-[#1A9FFF] transition-colors">
                      {article.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
                      {article.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {article.date}
                      </span>
                      <motion.div
                        className="flex items-center text-[#0057C8] dark:text-[#1A9FFF] font-bold text-sm"
                        whileHover={{ x: 4 }}
                      >
                        Read more
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </motion.div>
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

