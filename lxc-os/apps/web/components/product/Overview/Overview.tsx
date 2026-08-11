import { motion } from "framer-motion";
import { Check, Layers, Settings, Users } from "lucide-react";

const features = [
  {
    icon: Layers,
    title: "Academic Operations",
    color: "text-[#0057C8]",
    bgColor: "bg-[#0057C8]/10 dark:bg-[#0057C8]/20"
  },
  {
    icon: Settings,
    title: "Finance & Fees",
    color: "text-[#5CDD2B]",
    bgColor: "bg-[#5CDD2B]/10 dark:bg-[#5CDD2B]/20"
  },
  {
    icon: Users,
    title: "Parent–Teacher Communication",
    color: "text-[#1A9FFF]",
    bgColor: "bg-[#1A9FFF]/10 dark:bg-[#1A9FFF]/20"
  },
  {
    icon: Check,
    title: "AI Decision Engine",
    color: "text-[#0057C8]",
    bgColor: "bg-[#0057C8]/10 dark:bg-[#0057C8]/20"
  },
  {
    icon: Layers,
    title: "Blockchain Records",
    color: "text-[#FFC555]",
    bgColor: "bg-[#FFC555]/10 dark:bg-[#FFC555]/20"
  }
];

export default function ProductOverview() {
  return (
    <section className="relative py-28 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0057C8]/5 dark:bg-[#0057C8]/20 text-[#0057C8] dark:text-[#1A9FFF] mb-6 text-sm font-medium">
              <span>Platform Overview</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              One Platform. Total Control.
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              From admissions to alumni, LearnXChain manages the entire
              lifecycle of a school with intelligence and transparency.
            </p>
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              Experience seamless integration across all modules with real-time synchronization
              and intelligent automation that adapts to your school's unique workflow.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }}
            className="space-y-4"
          >
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="group flex items-center gap-4 p-5 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:border-[#0057C8]/40 dark:hover:border-[#0057C8]/40 transition-all duration-300 hover:shadow-lg dark:hover:shadow-[#0057C8]/10"
                >
                  <div className={`${feature.bgColor} p-3 rounded-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-5 h-5 ${feature.color}`} />
                  </div>
                  <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {feature.title}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
