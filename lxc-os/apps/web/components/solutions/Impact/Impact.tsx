"use client";
import { motion } from "framer-motion";
import { TrendingDown, DollarSign, Users } from "lucide-react";

const impacts = [
  {
    icon: TrendingDown,
    value: "40%",
    label: "Admin workload reduced",
    gradient: "from-[#0057C8] to-[#1A9FFF]",
    color: "text-[#0057C8] dark:text-[#1A9FFF]",
    bgGradient: "from-[#0057C8]/5 to-[#1A9FFF]/5 dark:from-[#0057C8]/20 dark:to-[#1A9FFF]/20"
  },
  {
    icon: DollarSign,
    value: "25%",
    label: "Fee collection improvement",
    gradient: "from-[#5CDD2B] to-[#4BBD22]",
    color: "text-[#5CDD2B] dark:text-[#5CDD2B]",
    bgGradient: "from-[#5CDD2B]/5 to-[#4BBD22]/5 dark:from-[#5CDD2B]/20 dark:to-[#4BBD22]/20"
  },
  {
    icon: Users,
    value: "30%",
    label: "Dropout risk reduced",
    gradient: "from-[#1A9FFF] to-[#0057C8]",
    color: "text-[#1A9FFF] dark:text-[#0057C8]",
    bgGradient: "from-[#1A9FFF]/5 to-[#0057C8]/5 dark:from-[#1A9FFF]/20 dark:to-[#0057C8]/20"
  }
];

export default function SolutionsImpact() {
  return (
    <section className="py-28 bg-transparent">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-[var(--font-grotesk)] text-4xl sm:text-5xl  mb-4 bg-gradient-to-r from-gray-900 via-[#0057C8] to-gray-900 dark:from-white dark:via-[#1A9FFF] dark:to-white bg-clip-text text-transparent">
            Proven Impact
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Measurable results that transform school operations
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {impacts.map((impact, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3 } }}
              className="group relative rounded-2xl border border-gray-200/50 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-sm p-8 shadow-sm hover:shadow-xl transition-all duration-300 text-center"
            >
              {/* Background gradient on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${impact.bgGradient} opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300 -z-10`} />
              
              {/* Icon */}
              <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${impact.bgGradient} mb-6`}>
                <impact.icon className={`w-8 h-8 ${impact.color}`} />
              </div>

              {/* Value */}
              <motion.h3
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 + 0.2, type: "spring" }}
                className={`text-5xl sm:text-6xl font-bold mb-4 bg-gradient-to-br ${impact.gradient} bg-clip-text text-transparent`}
              >
                {impact.value}
              </motion.h3>

              {/* Label */}
              <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">{impact.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

