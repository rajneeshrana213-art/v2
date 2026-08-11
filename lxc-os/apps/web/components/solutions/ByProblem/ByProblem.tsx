"use client";
import { motion } from "framer-motion";
import { X, Check, ArrowRight } from "lucide-react";

const problems = [
  {
    problem: "Manual & fragmented operations",
    solution: "One unified school operating system",
    gradient: "from-[#FFC555]/10 to-[#FF8C00]/10 dark:from-[#FFC555]/20 dark:to-[#FF8C00]/20",
    solutionGradient: "from-[#0057C8]/10 to-[#1A9FFF]/10 dark:from-[#0057C8]/20 dark:to-[#1A9FFF]/20"
  },
  {
    problem: "Fee disputes & mistrust",
    solution: "Blockchain-backed fee records",
    gradient: "from-[#FFC555]/10 to-[#FF8C00]/10 dark:from-[#FFC555]/20 dark:to-[#FF8C00]/20",
    solutionGradient: "from-[#5CDD2B]/10 to-[#4BBD22]/10 dark:from-[#5CDD2B]/20 dark:to-[#4BBD22]/20"
  },
  {
    problem: "Student dropouts",
    solution: "AI-based early risk prediction",
    gradient: "from-[#FFC555]/10 to-[#FF8C00]/10 dark:from-[#FFC555]/20 dark:to-[#FF8C00]/20",
    solutionGradient: "from-[#1A9FFF]/10 to-[#0057C8]/10 dark:from-[#1A9FFF]/20 dark:to-[#0057C8]/20"
  },
  {
    problem: "No decision visibility",
    solution: "Real-time dashboards & analytics",
    gradient: "from-[#FFC555]/10 to-[#FF8C00]/10 dark:from-[#FFC555]/20 dark:to-[#FF8C00]/20",
    solutionGradient: "from-[#0057C8]/10 to-[#5CDD2B]/10 dark:from-[#0057C8]/20 dark:to-[#5CDD2B]/20"
  }
];

export default function SolutionsByProblem() {
  return (
    <section className="py-28 bg-transparent">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-[var(--font-grotesk)] text-4xl sm:text-5xl  mb-4 bg-gradient-to-r from-gray-900 via-[#0057C8] to-gray-900 dark:from-white dark:via-[#1A9FFF] dark:to-white bg-clip-text text-transparent">
            Problems We Eliminate
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Transforming challenges into opportunities with intelligent solutions
          </p>
        </motion.div>

        <div className="space-y-6">
          {problems.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              className="group flex flex-col md:flex-row items-center justify-between gap-6 rounded-2xl border border-gray-200/50 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-sm p-6 md:p-8 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              {/* Problem */}
              <div className={`flex-1 flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r ${p.gradient} w-full md:w-auto`}>
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#FFC555]/10 dark:bg-[#FFC555]/20 flex items-center justify-center">
                  <X className="w-5 h-5 text-[#FFC555] dark:text-[#FFC555]" />
                </div>
                <div className="text-gray-900 dark:text-gray-100 font-medium text-lg">{p.problem}</div>
              </div>

              {/* Arrow */}
              <ArrowRight className="w-6 h-6 text-gray-400 dark:text-gray-500 flex-shrink-0 rotate-90 md:rotate-0" />

              {/* Solution */}
              <div className={`flex-1 flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r ${p.solutionGradient} w-full md:w-auto`}>
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#5CDD2B]/10 dark:bg-[#5CDD2B]/20 flex items-center justify-center">
                  <Check className="w-5 h-5 text-[#5CDD2B] dark:text-[#5CDD2B]" />
                </div>
                <div className="text-gray-900 dark:text-gray-100 font-semibold text-lg">{p.solution}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

