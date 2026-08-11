"use client";
import { motion } from "framer-motion";
import { Target, Workflow, DollarSign, MessageCircle, CheckCircle2 } from "lucide-react";

const reasons = [
  {
    icon: Target,
    title: "Perfect Fit Assessment",
    description: "Understand how LearnXChain fits your school's unique needs and workflows",
    color: "from-[#0057C8] to-[#1A9FFF]"
  },
  {
    icon: Workflow,
    title: "Real Workflows",
    description: "See actual system workflows in action, not just slides or presentations",
    color: "from-[#5CDD2B] to-[#1A9FFF]"
  },
  {
    icon: DollarSign,
    title: "Transparent Pricing",
    description: "Get clear, customized pricing based on your school's scale and requirements",
    color: "from-[#FFC555] to-[#FF8A00]"
  },
  {
    icon: MessageCircle,
    title: "Direct Q&A",
    description: "Ask real operational questions and get expert answers from our team",
    color: "from-[#0057C8] to-[#5CDD2B]"
  }
];

export default function DemoWhy() {
  return (
    <section className="bg-transparent py-28 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-[var(--font-grotesk)] font-bold text-gray-900 dark:text-white mb-4">
            Why Schools Book a Demo
          </h2>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium">
            Discover how LearnXChain can transform your school's operations
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {reasons.map((reason, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="group relative"
            >
              <div className="relative rounded-3xl border-2 border-gray-100 dark:border-white/5 bg-white/60 dark:bg-[#0C1018] backdrop-blur-xl p-8 sm:p-10 hover:border-[#0057C8]/30 dark:hover:border-[#0057C8]/30 transition-all duration-300 shadow-xl shadow-gray-200/20 dark:shadow-none overflow-hidden">
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${reason.color} mb-6 shadow-lg`}>
                  <reason.icon className="h-6 w-6 text-white" />
                </div>
                
                <h3 className="text-2xl font-[var(--font-grotesk)] font-bold text-gray-900 dark:text-white mb-4">
                  {reason.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                  {reason.description}
                </p>

                <div className="mt-8 flex items-center text-[#0057C8] dark:text-[#1A9FFF] text-xs font-bold uppercase tracking-widest">
                  <CheckCircle2 size={16} className="mr-2" />
                  <span>Included in demo</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

