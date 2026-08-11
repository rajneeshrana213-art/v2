"use client";

import { motion } from "framer-motion";
import { MapPin, Mail, Clock } from "lucide-react";

const info = [
  {
    icon: MapPin,
    title: "Location",
    content: "India",
    description: "Serving schools across Bharat",
    color: "text-[#FFC555]",
    bgColor: "bg-[#FFC555]/10",
  },
  {
    icon: Mail,
    title: "Email",
    content: "support@learnxchain.com",
    description: "We respond within 24 hours",
    color: "text-[#0057C8] dark:text-[#1A9FFF]",
    bgColor: "bg-[#0057C8]/10",
  },
  {
    icon: Clock,
    title: "Response Time",
    content: "Within 24 hours",
    description: "Monday to Friday, 9 AM - 6 PM IST",
    color: "text-[#5CDD2B]",
    bgColor: "bg-[#5CDD2B]/10",
  },
];

export default function ContactLocations() {
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
            Get in Touch
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto font-medium">
            We're here to help you every step of the way
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {info.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group text-center p-8 rounded-2xl bg-white/60 dark:bg-[#0C1018] border-2 border-gray-100 dark:border-white/5 hover:border-[#0057C8]/50 dark:hover:border-[#0057C8]/50 transition-all shadow-sm hover:shadow-xl backdrop-blur-md"
            >
              <div
                className={`inline-flex p-4 rounded-full ${item.bgColor} mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300`}
              >
                <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#0057C8] dark:group-hover:text-[#1A9FFF] transition-colors">
                {item.title}
              </h3>
              <p className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">
                {item.content}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

