"use client";
import { motion } from "framer-motion";
import { FileText, Calendar, Eye, Rocket, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: FileText,
    title: "Tell us about your school",
    description: "Fill out a quick form with your school details, size, and challenges",
    color: "from-[#0057C8] to-[#1A9FFF]"
  },
  {
    icon: Calendar,
    title: "We schedule a live walkthrough",
    description: "Our team will reach out to schedule a convenient time for your demo",
    color: "from-[#5CDD2B] to-[#1A9FFF]"
  },
  {
    icon: Eye,
    title: "See your real use-cases",
    description: "Experience personalized demonstrations of features relevant to your needs",
    color: "from-[#FFC555] to-[#FF8A00]"
  },
  {
    icon: Rocket,
    title: "Get next steps & plan",
    description: "Receive a customized implementation roadmap and pricing details",
    color: "from-[#0057C8] to-[#5CDD2B]"
  }
];

export default function DemoProcess() {
  return (
    <section className="bg-transparent py-28 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl sm:text-5xl font-[var(--font-grotesk)] font-bold text-gray-900 dark:text-white mb-4">
            How the Demo Works
          </h2>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium">
            A simple, streamlined process to get you started
          </p>
        </motion.div>

        <div className="relative">
          {/* Connecting line for desktop */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-[#0057C8]/20 via-[#1A9FFF]/20 to-[#5CDD2B]/20 dark:from-[#0057C8]/30 dark:via-[#1A9FFF]/30 dark:to-[#5CDD2B]/30" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="relative"
              >
                {/* Step number badge */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                    {i + 1}
                  </div>
                </div>

                <div className="relative rounded-3xl border-2 border-gray-100 dark:border-white/5 bg-white/60 dark:bg-[#0C1018] backdrop-blur-xl p-8 pt-12 hover:border-[#0057C8]/30 dark:hover:border-[#0057C8]/30 transition-all duration-300 group shadow-xl shadow-gray-200/20 dark:shadow-none h-full">
                  {/* Icon */}
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${step.color} mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                    <step.icon className="h-6 w-6 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-[var(--font-grotesk)] font-bold text-gray-900 dark:text-white mb-3">
                    {step.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm font-medium">
                    {step.description}
                  </p>

                  {/* Arrow for desktop (except last item) */}
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-12 -right-4 z-10">
                      <ArrowRight className="h-6 w-6 text-[#0057C8]/50 dark:text-[#1A9FFF]/50" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

