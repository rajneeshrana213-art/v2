"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  {
    q: "Do you provide demos?",
    a: "Yes, we offer guided demos tailored to your school. Our team will walk you through all features and answer any questions you have.",
  },
  {
    q: "Is LearnXChain affordable for small schools?",
    a: "Absolutely! Our pricing is designed specifically for Tier 2 & Tier 3 schools in India. We offer flexible plans that scale with your school's needs.",
  },
  {
    q: "Do you support onboarding?",
    a: "We provide complete onboarding and training. Our team will help you set up the system, train your staff, and ensure a smooth transition.",
  },
  {
    q: "How long does implementation take?",
    a: "Typically, implementation takes 2-4 weeks depending on your school's size and requirements. We'll work with you to minimize disruption to your operations.",
  },
  {
    q: "What kind of support do you offer?",
    a: "We offer 24/7 support via email, phone, and chat. Our support team is trained to help with any technical issues or questions you might have.",
  },
  {
    q: "Can I customize the platform for my school?",
    a: "Yes! LearnXChain is highly customizable. We can adapt features, workflows, and branding to match your school's unique needs and requirements.",
  },
];

export default function ContactFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-transparent">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0057C8]/5 dark:bg-[#0057C8]/10 border border-[#0057C8]/20 mb-6 backdrop-blur-md">
            <HelpCircle className="w-4 h-4 text-[#0057C8] dark:text-[#1A9FFF]" />
            <span className="text-sm font-bold text-[#0057C8] dark:text-[#1A9FFF]">
              Common Questions
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent font-[var(--font-grotesk)]">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto font-medium">
            Everything you need to know about booking a demo
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="rounded-xl border-2 border-gray-100 dark:border-white/5 bg-white/60 dark:bg-[#0C1018] overflow-hidden hover:border-[#0057C8]/50 dark:hover:border-[#0057C8]/50 transition-all backdrop-blur-md"
            >
              <button
                onClick={() => toggleFAQ(i)}
                className="w-full p-6 flex items-center justify-between text-left group"
              >
                <h4 className="text-lg font-bold text-gray-900 dark:text-white pr-4 group-hover:text-[#0057C8] dark:group-hover:text-[#1A9FFF] transition-colors">
                  {faq.q}
                </h4>
                <motion.div
                  animate={{ rotate: openIndex === i ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-[#0057C8] dark:group-hover:text-[#1A9FFF] transition-colors" />
                </motion.div>
              </button>
              <motion.div
                initial={false}
                animate={{
                  height: openIndex === i ? "auto" : 0,
                  opacity: openIndex === i ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6">
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                    {faq.a}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

