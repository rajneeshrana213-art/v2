"use client";
import { motion } from "framer-motion";

const milestones = [
  {
    year: "2023",
    title: "Foundation",
    description: "Identified core problems in Indian school operations",
    status: "completed"
  },
  {
    year: "2024",
    title: "Architecture",
    description: "Built an end-to-end School OS architecture",
    status: "completed"
  },
  {
    year: "2024",
    title: "AI Integration",
    description: "Integrated AI for prediction & insights",
    status: "completed"
  },
  {
    year: "2024",
    title: "Blockchain",
    description: "Designed blockchain-backed trust systems",
    status: "completed"
  },
  {
    year: "2025+",
    title: "Scale",
    description: "Scaling towards a national education infrastructure",
    status: "in-progress"
  }
];

export default function AboutJourney() {
  return (
    <section className="relative py-24 md:py-32 bg-transparent overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-sm font-semibold text-[#0057C8] dark:text-[#1A9FFF] uppercase tracking-wider mb-4">
            Our Journey
          </h2>
          <h3 className="font-[var(--font-grotesk)] text-4xl md:text-5xl  text-gray-900 dark:text-white mb-4">
            Our Journey So Far
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium">
            Building the future of education, one milestone at a time
          </p>
        </motion.div>

        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#0057C8] via-[#1A9FFF] to-[#5CDD2B] dark:from-[#0057C8] dark:via-[#1A9FFF] dark:to-[#5CDD2B] transform md:-translate-x-1/2" />

          <div className="space-y-12">
            {milestones.map((milestone, i) => {
              const isEven = i % 2 === 0;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                  className={`relative flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-12 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  {/* Timeline Dot */}
                  <div className={`relative z-10 flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br ${milestone.status === 'completed' ? 'from-[#0057C8] to-[#1A9FFF]' : 'from-[#1A9FFF] to-[#5CDD2B]'} shadow-lg flex items-center justify-center border-4 border-white dark:border-[#0A0E14] ml-0 md:ml-0 group`}>
                    {milestone.status === 'completed' ? (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                    )}
                  </div>

                  {/* Content Card */}
                  <div className={`flex-1 w-full ${isEven ? 'md:text-left md:pl-8' : 'md:text-right md:pr-8'} md:max-w-[45%]`}>
                    <motion.div
                      whileHover={{ scale: 1.02, y: -4 }}
                      className="bg-white dark:bg-[#0C1018] rounded-xl p-6 border border-gray-200 dark:border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 group"
                    >
                      <div className={`flex items-center gap-4 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse md:justify-end'}`}>
                        <span className="text-xs font-semibold text-[#0057C8] dark:text-[#1A9FFF] uppercase tracking-wider whitespace-nowrap">
                          {milestone.year}
                        </span>
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-[#0057C8] dark:group-hover:text-[#1A9FFF] transition-colors">
                          {milestone.title}
                        </h4>
                      </div>
                      <p className={`mt-3 text-gray-600 dark:text-gray-300 leading-relaxed ${isEven ? 'text-left' : 'md:text-right'}`}>
                        {milestone.description}
                      </p>
                    </motion.div>
                  </div>

                  {/* Spacer for desktop alternate layout */}
                  <div className="hidden md:block flex-1 md:max-w-[45%]" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

