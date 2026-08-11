"use client";
import { motion } from "framer-motion";

const cultureValues = [
  {
    title: "Mission over shortcuts",
    description: "We choose the right path, not the easy one",
    color: "from-[#0057C8] to-[#1A9FFF]"
  },
  {
    title: "Long-term thinking",
    description: "We build for decades, not quarters",
    color: "from-[#1A9FFF] to-[#5CDD2B]"
  },
  {
    title: "High ownership, low ego",
    description: "We take responsibility and stay humble",
    color: "from-[#5CDD2B] to-[#0057C8]"
  },
  {
    title: "Building for Bharat first",
    description: "Every feature serves Indian schools' real needs",
    color: "from-[#0057C8] to-[#FFC555]"
  }
];

export default function AboutCulture() {
  return (
    <section className="relative py-24 md:py-32 bg-transparent overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-sm font-semibold text-[#0057C8] dark:text-[#1A9FFF] uppercase tracking-wider mb-4">
            Our Culture
          </h2>
          <h3 className="font-[var(--font-grotesk)] text-4xl md:text-5xl  text-gray-900 dark:text-white mb-4">
            How We Work
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium">
            The principles that shape our everyday decisions and actions
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cultureValues.map((value, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative"
            >
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${value.color} rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300 dark:opacity-30 dark:group-hover:opacity-50`} />
              <div className="relative bg-white dark:bg-[#0C1018] rounded-2xl p-8 border border-gray-200 dark:border-white/10 shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                <div className={`w-12 h-1 rounded-full bg-gradient-to-r ${value.color} mb-6 group-hover:w-full transition-all duration-300`} />
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-[#0057C8] dark:group-hover:text-[#1A9FFF] transition-colors">
                  {value.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm flex-grow">
                  {value.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

