import { motion } from "framer-motion";
import { Brain, TrendingDown, GraduationCap, DollarSign, BarChart } from "lucide-react";

const aiFeatures = [
  {
    icon: TrendingDown,
    title: "Dropout Risk Prediction",
    description: "Identify at-risk students early with AI-powered analytics that analyze patterns and predict potential dropouts.",
    gradient: "from-[#FFC555] to-[#FF8C00]"
  },
  {
    icon: GraduationCap,
    title: "Academic Performance Forecasting",
    description: "Predict student performance trends and provide actionable insights to improve learning outcomes.",
    gradient: "from-[#0057C8] to-[#1A9FFF]"
  },
  {
    icon: DollarSign,
    title: "Fee Default Detection",
    description: "Proactively identify payment risks and automate follow-ups to reduce financial defaults.",
    gradient: "from-[#5CDD2B] to-[#4BBD22]"
  },
  {
    icon: BarChart,
    title: "Automated Insights & Reports",
    description: "Generate comprehensive reports automatically with AI-driven insights and recommendations.",
    gradient: "from-[#1A9FFF] to-[#0057C8]"
  }
];

export default function ProductAI() {
  return (
    <section className="relative py-28 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0057C8]/5 via-[#1A9FFF]/5 to-transparent dark:from-[#0057C8]/10 dark:via-[#1A9FFF]/10" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0057C8]/5 dark:bg-[#0057C8]/20 text-[#0057C8] dark:text-[#1A9FFF] mb-6 text-sm font-medium">
              <Brain className="w-4 h-4" />
              <span>AI Intelligence</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              AI That Thinks for Schools
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              Leverage the power of artificial intelligence to make data-driven decisions,
              predict outcomes, and automate complex processes that would otherwise require
              extensive manual analysis.
            </p>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-[#0057C8]/5 to-[#1A9FFF]/5 dark:from-[#0057C8]/10 dark:to-[#1A9FFF]/10 border border-[#0057C8]/20 dark:border-[#0057C8]/30">
              <Brain className="w-6 h-6 text-[#0057C8] dark:text-[#1A9FFF]" />
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-semibold">Powered by Advanced ML Models</span> - Continuously learning and improving from your school's data.
              </p>
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6">
            {aiFeatures.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="group p-6 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:border-[#0057C8]/30 dark:hover:border-[#0057C8]/30 transition-all duration-300 hover:shadow-lg dark:hover:shadow-[#0057C8]/10"
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} p-0.5 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <div className="w-full h-full rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-gray-800 dark:text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
