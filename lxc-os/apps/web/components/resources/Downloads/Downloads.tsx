"use client";
import { motion } from "framer-motion";
import Link from "next/link";

const downloads = [
  {
    title: "School Digitization Checklist",
    format: "PDF",
    size: "2.4 MB",
    icon: "📋",
    description: "A comprehensive checklist to guide your school's digital transformation journey.",
    downloads: "1.2k"
  },
  {
    title: "AI Readiness Framework",
    format: "PDF",
    size: "3.1 MB",
    icon: "🤖",
    description: "Evaluate and improve your school's readiness for AI integration with this detailed framework.",
    downloads: "890"
  },
  {
    title: "Fee Transparency Policy Template",
    format: "DOCX",
    size: "156 KB",
    icon: "📄",
    description: "A ready-to-use policy template for implementing fee transparency in your school.",
    downloads: "2.1k"
  },
  {
    title: "Parent Communication Playbook",
    format: "PDF",
    size: "4.2 MB",
    icon: "📱",
    description: "Best practices and templates for effective parent communication in the digital age.",
    downloads: "1.5k"
  }
];

export default function ResourcesDownloads() {
  return (
    <section className="bg-transparent py-28 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-[var(--font-grotesk)] text-4xl md:text-5xl  text-gray-900 dark:text-white mb-4 font-bold">
            Downloads & Toolkits
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium">
            Free resources to help you succeed
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {downloads.map((download, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group"
            >
              <Link href="#">
                <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0C1018] backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-xl hover:border-[#0057C8]/50 dark:hover:border-[#0057C8]/50">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                      {download.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-[#0057C8] dark:group-hover:text-[#1A9FFF] transition-colors">
                          {download.title}
                        </h3>
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-[#0057C8]/5 dark:bg-[#0057C8]/10 text-[#0057C8] dark:text-[#1A9FFF] rounded border border-[#0057C8]/20 uppercase">
                          {download.format}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                        {download.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 font-medium">
                          <span>{download.size}</span>
                          <span>•</span>
                          <span>{download.downloads} downloads</span>
                        </div>
                        <motion.div
                          className="flex items-center text-[#0057C8] dark:text-[#1A9FFF] font-bold text-sm"
                          whileHover={{ x: 4 }}
                        >
                          Download
                          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

