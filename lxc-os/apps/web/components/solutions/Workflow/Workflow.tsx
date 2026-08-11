"use client";
import { motion } from "framer-motion";
import { Activity, Brain, Link2, BarChart3, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Activity,
    title: "Student Activity",
    description: "Real-time data collection",
    gradient: "from-[#0057C8] to-[#1A9FFF]",
    bgGradient: "from-[#0057C8]/5 to-[#1A9FFF]/5 dark:from-[#0057C8]/20 dark:to-[#1A9FFF]/20"
  },
  {
    icon: Brain,
    title: "Smart Processing",
    description: "AI-powered analysis",
    gradient: "from-[#1A9FFF] to-[#0057C8]",
    bgGradient: "from-[#1A9FFF]/5 to-[#0057C8]/5 dark:from-[#1A9FFF]/20 dark:to-[#0057C8]/20"
  },
  {
    icon: Link2,
    title: "AI + Blockchain",
    description: "Secure & transparent",
    gradient: "from-[#5CDD2B] to-[#4BBD22]",
    bgGradient: "from-[#5CDD2B]/5 to-[#4BBD22]/5 dark:from-[#5CDD2B]/20 dark:to-[#4BBD22]/20"
  },
  {
    icon: BarChart3,
    title: "Actionable Insights",
    description: "Data-driven decisions",
    gradient: "from-[#FFC555] to-[#FF8C00]",
    bgGradient: "from-[#FFC555]/5 to-[#FF8C00]/5 dark:from-[#FFC555]/20 dark:to-[#FF8C00]/20"
  }
];

export default function SolutionsWorkflow() {
  return (
    <section className="py-28 bg-white/50 dark:bg-transparent">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-[var(--font-grotesk)] text-4xl sm:text-5xl  mb-4 bg-gradient-to-r from-gray-900 via-[#0057C8] to-gray-900 dark:from-white dark:via-[#1A9FFF] dark:to-white bg-clip-text text-transparent">
            How LearnXChain Works
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Data flows from classrooms to dashboards automatically —
            no duplication, no confusion.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection line for desktop */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-[#0057C8] via-[#5CDD2B] to-[#FFC555] opacity-20 dark:opacity-30 -translate-y-1/2" />

          <div className="grid gap-8 md:grid-cols-4 relative">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group relative"
              >
                <div className="relative rounded-2xl border border-gray-200/50 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-sm p-8 shadow-sm hover:shadow-xl transition-all duration-300 text-center">
                  {/* Background gradient on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.bgGradient} opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300 -z-10`} />
                  
                  {/* Icon */}
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${step.gradient} mb-4 shadow-sm`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-gray-900 dark:text-white font-semibold text-xl mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>

                  {/* Arrow for mobile */}
                  {i < steps.length - 1 && (
                    <div className="md:hidden flex justify-center mt-6">
                      <ArrowRight className="w-6 h-6 text-gray-400 dark:text-gray-500 rotate-90" />
                    </div>
                  )}

                  {/* Arrow for desktop */}
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 z-10">
                      <ArrowRight className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

