"use client";
import { motion } from "framer-motion";
import Link from "next/link";

const communityFeatures = [
  {
    title: "Community Forum",
    description: "Connect with other school leaders and share best practices",
    icon: "💬",
    members: "2.5k+",
    color: "from-[#0057C8] to-[#1A9FFF]"
  },
  {
    title: "Monthly Webinars",
    description: "Learn from experts and industry leaders",
    icon: "🎓",
    members: "500+",
    color: "from-[#1A9FFF] to-[#5CDD2B]"
  },
  {
    title: "Resource Library",
    description: "Access exclusive resources and templates",
    icon: "📚",
    members: "1.8k+",
    color: "from-[#5CDD2B] to-[#0057C8]"
  }
];

export default function ResourcesCommunity() {
  return (
    <section className="bg-transparent py-28 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-[var(--font-grotesk)] text-4xl md:text-5xl  text-gray-900 dark:text-white mb-4">
            Learn Together
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium">
            Join school leaders, educators, and technologists shaping the future of education
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {communityFeatures.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group"
            >
              <div className="relative rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0C1018] backdrop-blur-sm p-8 transition-all duration-300 hover:shadow-xl hover:border-[#0057C8]/50 dark:hover:border-[#0057C8]/50">
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color}`} />
                <div className="text-5xl mb-4 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#0057C8] dark:group-hover:text-[#1A9FFF] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm leading-relaxed font-medium">
                  {feature.description}
                </p>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-bold text-[#0057C8] dark:text-[#1A9FFF]">{feature.members}</span>
                  <span className="ml-2 font-medium">active members</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-center"
        >
          <Link href="https://whatsapp.com/channel/0029VbC2gmM0AgW5pOgpTS2u" target="_blank" rel="noopener noreferrer">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-[#0057C8] to-[#1A9FFF] text-white font-bold rounded-xl shadow-lg shadow-[#0057C8]/25 hover:shadow-xl transition-all duration-300"
            >
              Join Community
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

