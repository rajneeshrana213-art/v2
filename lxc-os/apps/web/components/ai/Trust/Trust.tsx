"use client";
import { motion } from "framer-motion";

const trustPoints = [
  {
    icon: "🔍",
    title: "No black-box decisions",
    description: "Every AI recommendation comes with clear reasoning and evidence",
  },
  {
    icon: "📖",
    title: "Explainable predictions",
    description: "Understand why the AI made each prediction with detailed explanations",
  },
  {
    icon: "👁️",
    title: "Role-based visibility",
    description: "Access controls ensure data privacy and appropriate information sharing",
  },
  {
    icon: "🔒",
    title: "Secure & compliant data handling",
    description: "Enterprise-grade security with full compliance to education data regulations",
  },
];

export default function AITrust() {
  return (
    <section className="py-28 bg-white dark:bg-[#0E1117] transition-colors duration-300 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-transparent to-purple-50/50 dark:from-indigo-950/20 dark:via-transparent dark:to-purple-950/20" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-sm font-semibold mb-6"
            >
              Trust & Transparency
            </motion.span>

            <h2 className="font-[var(--font-grotesk)] text-4xl md:text-5xl  text-gray-900 dark:text-white mb-6 leading-tight">
              Responsible AI by Design
            </h2>

            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Our AI assists humans — it never replaces judgment. We believe in transparent,
              ethical AI that empowers educators to make better decisions.
            </p>

            {/* Trust badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200/50 dark:border-indigo-800/50"
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">🛡️</div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Built for Education
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-base">
                    Designed with student privacy and educational best practices at the core.
                    Fully compliant with FERPA, COPPA, and GDPR regulations.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right side - Trust points */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            {trustPoints.map((point, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02, x: 8 }}
                className="group p-6 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300 cursor-pointer backdrop-blur-sm shadow-sm hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <motion.div
                    className="text-3xl flex-shrink-0"
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    {point.icon}
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {point.title}
                    </h3>
                    <p className="text-base text-gray-600 dark:text-gray-400">
                      {point.description}
                    </p>
                  </div>
                  <motion.div
                    className="text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={{ x: -10 }}
                    whileHover={{ x: 0 }}
                  >
                    ✓
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

