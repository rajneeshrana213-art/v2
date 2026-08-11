"use client";

import { motion } from "framer-motion";
import { Users, HelpCircle, Handshake } from "lucide-react";

const ways = [
  {
    icon: Users,
    title: "Sales & Demos",
    desc: "Talk to our team about onboarding your school and see how LearnXChain can transform your operations.",
    color: "from-[#0057C8] to-[#1A9FFF]",
  },
  {
    icon: HelpCircle,
    title: "Support",
    desc: "Get help with existing LearnXChain setup. Our support team is here 24/7 to assist you.",
    color: "from-[#1A9FFF] to-[#5CDD2B]",
  },
  {
    icon: Handshake,
    title: "Partnerships",
    desc: "Collaborate with us to scale education across India and make quality education accessible to all.",
    color: "from-[#5CDD2B] to-[#FFC555]",
  },
];

export default function ContactWays() {
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
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent font-[var(--font-grotesk)]">
            How Can We Help?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto font-medium">
            Choose the option that best fits your needs
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {ways.map((way, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative rounded-2xl border-2 border-gray-100 dark:border-white/5 bg-white/60 dark:bg-[#0C1018] p-8 hover:border-[#0057C8]/50 dark:hover:border-[#0057C8]/50 transition-all shadow-sm hover:shadow-xl backdrop-blur-md"
            >
              <div
                className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${way.color} mb-4 shadow-lg group-hover:scale-110 transition-transform`}
              >
                <way.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-[#0057C8] dark:group-hover:text-[#1A9FFF] transition-colors">
                {way.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                {way.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

