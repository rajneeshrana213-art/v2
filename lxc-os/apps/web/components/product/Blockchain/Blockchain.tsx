import { motion } from "framer-motion";
import { Shield, Lock, Eye, FileCheck, Link2 } from "lucide-react";

const blockchainFeatures = [
  {
    icon: Lock,
    title: "Immutable Records",
    description: "Once recorded, data cannot be altered or deleted, ensuring permanent audit trails.",
    color: "text-[#0057C8]"
  },
  {
    icon: Eye,
    title: "Fully Auditable",
    description: "Complete transparency with every transaction and record verifiable by authorized parties.",
    color: "text-[#5CDD2B]"
  },
  {
    icon: FileCheck,
    title: "Verifiable Certificates",
    description: "Issue and verify academic certificates with cryptographic proof of authenticity.",
    color: "text-[#1A9FFF]"
  },
  {
    icon: Link2,
    title: "Transparent Transactions",
    description: "Every fee payment and financial transaction is recorded on the blockchain for trust.",
    color: "text-[#FFC555]"
  }
];

export default function ProductBlockchain() {
  return (
    <section className="relative py-28 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800/50 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#5CDD2B]/10 via-[#4BBD22]/5 to-transparent dark:from-[#5CDD2B]/20 dark:via-[#4BBD22]/10" />
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
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#5CDD2B]/10 dark:bg-[#5CDD2B]/20 text-[#4BBD22] dark:text-[#5CDD2B] mb-6 text-sm font-medium">
              <Shield className="w-4 h-4" />
              <span>Blockchain Technology</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Trust, Backed by Blockchain
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              Every record is immutable, auditable, and verifiable — from fees
              to certificates. Build unshakeable trust with blockchain-backed
              transparency that ensures data integrity and prevents tampering.
            </p>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-[#5CDD2B]/10 to-[#4BBD22]/5 dark:from-[#5CDD2B]/20 dark:to-[#4BBD22]/20 border border-[#5CDD2B]/20 dark:border-[#5CDD2B]/30">
              <Shield className="w-6 h-6 text-[#5CDD2B] dark:text-[#5CDD2B]" />
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-semibold">Enterprise-Grade Security</span> - Built on proven blockchain infrastructure.
              </p>
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
              {blockchainFeatures.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="group p-6 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:border-[#5CDD2B]/40 dark:hover:border-[#5CDD2B]/40 transition-all duration-300 hover:shadow-lg dark:hover:shadow-[#5CDD2B]/10"
                  >
                    <div className="w-12 h-12 rounded-lg bg-[#5CDD2B]/10 dark:bg-[#5CDD2B]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
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
