"use client";
import { motion } from "framer-motion";
import { Clock, Target, DollarSign, Handshake, Presentation, FileText, Users, Shield } from "lucide-react";

const benefits = [
  {
    icon: Clock,
    title: "30–45 Minute Walkthrough",
    description: "Comprehensive live demonstration tailored to your needs",
    color: "from-[#0057C8] to-[#1A9FFF]"
  },
  {
    icon: Target,
    title: "Use-Case Specific Tips",
    description: "Personalized suggestions based on your school's unique requirements",
    color: "from-[#5CDD2B] to-[#1A9FFF]"
  },
  {
    icon: DollarSign,
    title: "Transparent Pricing",
    description: "Clear, customized pricing with no hidden costs",
    color: "from-[#FFC555] to-[#FF8A00]"
  },
  {
    icon: Handshake,
    title: "No Pressure Sales",
    description: "Focus on education and understanding, not pushing products",
    color: "from-[#0057C8] to-[#5CDD2B]"
  },
  {
    icon: Presentation,
    title: "Interactive Q&A Session",
    description: "Ask questions and get immediate answers from our experts",
    color: "from-[#1A9FFF] to-[#5CDD2B]"
  },
  {
    icon: FileText,
    title: "Custom Implementation Plan",
    description: "Receive a detailed roadmap for your school's onboarding",
    color: "from-[#0057C8] to-[#1A9FFF]"
  },
  {
    icon: Users,
    title: "Meet Your Support Team",
    description: "Connect with the dedicated team that will support your school",
    color: "from-[#FFC555] to-[#FF8A00]"
  },
  {
    icon: Shield,
    title: "Security & Compliance",
    description: "Learn about our data security and compliance measures",
    color: "from-[#5CDD2B] to-[#1A9FFF]"
  }
];

export default function DemoExpect() {
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
            What You'll Get
          </h2>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium">
            Everything included in your personalized demo experience
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#0057C8]/20 to-[#1A9FFF]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl blur-2xl" />
              
              <div className="relative h-full rounded-3xl border-2 border-gray-100 dark:border-white/5 bg-white/60 dark:bg-[#0C1018] backdrop-blur-xl p-6 hover:border-[#0057C8]/30 dark:hover:border-[#0057C8]/30 transition-all duration-300 shadow-xl shadow-gray-200/20 dark:shadow-none">
                <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-r ${benefit.color} mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                  <benefit.icon className="h-5 w-5 text-white" />
                </div>
                
                <h3 className="text-lg font-[var(--font-grotesk)] font-bold text-gray-900 dark:text-white mb-2">
                  {benefit.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed font-medium">
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

