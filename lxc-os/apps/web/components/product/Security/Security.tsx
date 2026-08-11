import { motion } from "framer-motion";
import { Shield, Lock, FileText, Key } from "lucide-react";

const securityFeatures = [
  {
    icon: Key,
    title: "Role-Based Access Control",
    description: "Granular permissions ensure users only access data and features relevant to their role.",
    color: "text-[#0057C8]"
  },
  {
    icon: Lock,
    title: "Encrypted Data",
    description: "End-to-end encryption for data at rest and in transit, protecting sensitive information.",
    color: "text-[#5CDD2B]"
  },
  {
    icon: FileText,
    title: "Comprehensive Audit Logs",
    description: "Track every action with detailed audit trails for compliance and security monitoring.",
    color: "text-[#1A9FFF]"
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Industry-standard security protocols and regular security audits to protect your data.",
    color: "text-[#0057C8]"
  }
];

export default function ProductSecurity() {
  return (
    <section className="relative py-28 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800/50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 87, 200, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 87, 200, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0057C8]/5 dark:bg-[#0057C8]/20 text-[#0057C8] dark:text-[#1A9FFF] mb-6 text-sm font-medium">
              <Shield className="w-4 h-4" />
              <span>Security & Compliance</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Enterprise-Grade Security
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              Your school's data is protected with industry-leading security measures.
              We follow strict compliance standards and continuously monitor for threats
              to ensure your information stays safe.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium">
                SOC 2 Compliant
              </span>
              <span className="px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium">
                GDPR Ready
              </span>
              <span className="px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium">
                99.9% Uptime
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-1 lg:order-2"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              {securityFeatures.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="group p-6 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:border-[#0057C8]/40 dark:hover:border-[#0057C8]/40 transition-all duration-300 hover:shadow-lg dark:hover:shadow-[#0057C8]/10"
                  >
                    <div className="w-12 h-12 rounded-lg bg-[#0057C8]/10 dark:bg-[#0057C8]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Icon className={`w-6 h-6 ${feature.color}`} />
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
          </motion.div>
        </div>
      </div>
    </section>
  );
}
