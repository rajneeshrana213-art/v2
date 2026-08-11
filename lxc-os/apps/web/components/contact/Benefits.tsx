"use client";

import { motion } from "framer-motion";
import {
  Clock,
  Users,
  Target,
  Zap,
  Shield,
  HeadphonesIcon,
  Sparkles,
} from "lucide-react";

const benefits = [
  {
    icon: Clock,
    title: "Quick Setup",
    description: "Get started in minutes with our streamlined onboarding process",
    color: "from-[#0057C8] to-[#1A9FFF]",
  },
  {
    icon: Users,
    title: "Expert Guidance",
    description: "Work with our education specialists who understand your needs",
    color: "from-[#1A9FFF] to-[#5CDD2B]",
  },
  {
    icon: Target,
    title: "Tailored Solution",
    description: "Customized demo focused on your school's specific requirements",
    color: "from-[#5CDD2B] to-[#FFC555]",
  },
  {
    icon: Zap,
    title: "Fast Response",
    description: "Get a response within 24 hours and schedule your demo quickly",
    color: "from-[#FFC555] to-[#0057C8]",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your information is kept confidential and secure",
    color: "from-[#0057C8] to-[#1A9FFF]",
  },
  {
    icon: HeadphonesIcon,
    title: "Ongoing Support",
    description: "Get continuous support even after the demo and implementation",
    color: "from-[#1A9FFF] to-[#5CDD2B]",
  },
];

export default function Benefits() {
  return (
    <section className="py-24 bg-transparent">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0057C8]/5 dark:bg-[#0057C8]/10 border border-[#0057C8]/20 mb-6 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-[#0057C8] dark:text-[#1A9FFF]" />
            <span className="text-sm font-bold text-[#0057C8] dark:text-[#1A9FFF]">
              Why Choose Us
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent font-[var(--font-grotesk)]">
            What to Expect
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto font-medium">
            Experience the power of LearnXChain with our comprehensive demo
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative p-8 rounded-2xl bg-white/60 dark:bg-[#0C1018] border-2 border-gray-100 dark:border-white/5 hover:border-[#0057C8]/50 dark:hover:border-[#0057C8]/50 transition-all shadow-sm hover:shadow-xl backdrop-blur-md"
            >
              <div className="relative z-10">
                <div
                  className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${benefit.color} mb-4 shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <benefit.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#0057C8] dark:group-hover:text-[#1A9FFF] transition-colors">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
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
