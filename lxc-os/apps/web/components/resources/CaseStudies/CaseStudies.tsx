"use client";
import { motion } from "framer-motion";
import Link from "next/link";

const caseStudies = [
  {
    title: "Tier-3 School Turnaround",
    school: "Greenwood Public School",
    location: "Mumbai, Maharashtra",
    results: [
      { metric: "Fee Collection", value: "+28%", color: "text-[#5CDD2B]" },
      { metric: "Parent Satisfaction", value: "+45%", color: "text-[#1A9FFF]" },
      { metric: "Admin Efficiency", value: "+35%", color: "text-[#0057C8]" }
    ],
    description: "How a tier-3 school transformed its operations and improved fee collection by 28% using LearnXChain's integrated platform.",
    gradient: "from-[#0057C8] to-[#1A9FFF]"
  },
  {
    title: "Urban Chain School",
    school: "Metro Education Group",
    location: "Delhi NCR",
    results: [
      { metric: "Admin Workload", value: "-40%", color: "text-[#FFC555]" },
      { metric: "Processing Time", value: "-60%", color: "text-[#0057C8]" },
      { metric: "Cost Savings", value: "+30%", color: "text-[#5CDD2B]" }
    ],
    description: "A chain of 15 schools reduced admin workload by 40% and improved operational efficiency across all campuses.",
    gradient: "from-[#1A9FFF] to-[#5CDD2B]"
  },
  {
    title: "Rural School Digitization",
    school: "Village Education Trust",
    location: "Rajasthan",
    results: [
      { metric: "Digital Adoption", value: "100%", color: "text-[#1A9FFF]" },
      { metric: "Parent Engagement", value: "+85%", color: "text-[#5CDD2B]" },
      { metric: "Transparency", value: "100%", color: "text-[#0057C8]" }
    ],
    description: "First-time digital transparency for parents in rural areas, building trust and improving communication.",
    gradient: "from-[#5CDD2B] to-[#0057C8]"
  }
];

export default function ResourcesCaseStudies() {
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
            Success Stories
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium">
            Real results from schools using LearnXChain
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {caseStudies.map((study, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -12, scale: 1.02 }}
              className="group relative"
            >
              <Link href="#">
                <div className="relative h-full rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0C1018] backdrop-blur-sm overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-[#0057C8]/50 dark:hover:border-[#0057C8]/50">
                  {/* Gradient header */}
                  <div className={`h-2 bg-gradient-to-r ${study.gradient}`} />
                  
                  <div className="p-8">
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#0057C8] dark:group-hover:text-[#1A9FFF] transition-colors">
                        {study.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 font-medium">
                        {study.school}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                        {study.location}
                      </p>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                      {study.description}
                    </p>

                    {/* Results */}
                    <div className="space-y-3 mb-6 bg-gray-50/50 dark:bg-white/5 p-4 rounded-xl">
                      {study.results.map((result, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                            {result.metric}
                          </span>
                          <span className={`text-lg font-bold ${result.color}`}>
                            {result.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    <motion.div
                      className="flex items-center text-[#0057C8] dark:text-[#1A9FFF] font-bold text-sm"
                      whileHover={{ x: 4 }}
                    >
                      Read full case study
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.div>
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

