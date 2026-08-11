"use client";
import { motion } from "framer-motion";
import { Building2, UserCog, GraduationCap, Users, CheckCircle2 } from "lucide-react";

const roles = [
  {
    icon: Building2,
    title: "School Owners",
    gradient: "from-[#0057C8] to-[#1A9FFF]",
    color: "text-[#0057C8] dark:text-[#1A9FFF]",
    bgGradient: "from-[#0057C8]/5 to-[#1A9FFF]/5 dark:from-[#0057C8]/20 dark:to-[#1A9FFF]/20",
    points: [
      "Fee transparency & leakage control",
      "Profit & growth visibility",
      "Audit-ready compliance"
    ]
  },
  {
    icon: UserCog,
    title: "Principals & Admins",
    gradient: "from-[#1A9FFF] to-[#0057C8]",
    color: "text-[#0057C8] dark:text-[#1A9FFF]",
    bgGradient: "from-[#1A9FFF]/5 to-[#0057C8]/5 dark:from-[#1A9FFF]/20 dark:to-[#0057C8]/20",
    points: [
      "Centralized operations",
      "AI-powered reports",
      "Staff & student performance tracking"
    ]
  },
  {
    icon: GraduationCap,
    title: "Teachers",
    gradient: "from-[#5CDD2B] to-[#4BBD22]",
    color: "text-[#5CDD2B] dark:text-[#5CDD2B]",
    bgGradient: "from-[#5CDD2B]/5 to-[#4BBD22]/5 dark:from-[#5CDD2B]/20 dark:to-[#4BBD22]/20",
    points: [
      "Smart attendance & grading",
      "Reduced manual work",
      "Student insights"
    ]
  },
  {
    icon: Users,
    title: "Parents",
    gradient: "from-[#1A9FFF] to-[#5CDD2B]",
    color: "text-[#1A9FFF] dark:text-[#5CDD2B]",
    bgGradient: "from-[#1A9FFF]/5 to-[#5CDD2B]/5 dark:from-[#1A9FFF]/20 dark:to-[#5CDD2B]/20",
    points: [
      "Live progress visibility",
      "Transparent fees",
      "Direct communication"
    ]
  }
];

export default function SolutionsByRole() {
  return (
    <section className="py-28 bg-white/50 dark:bg-transparent">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-[var(--font-grotesk)] text-4xl sm:text-5xl mb-4 bg-gradient-to-r from-gray-900 via-[#0057C8] to-gray-900 dark:from-white dark:via-[#1A9FFF] dark:to-white bg-clip-text text-transparent">
            Solutions for Every Stakeholder
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Tailored solutions that address the unique needs of each role in your school ecosystem
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {roles.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group relative rounded-2xl border border-gray-200/50 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-sm p-8 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              {/* Background gradient on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${r.bgGradient} opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300 -z-10`} />
              
              {/* Icon */}
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${r.bgGradient} mb-4`}>
                <r.icon className={`w-6 h-6 ${r.color}`} />
              </div>

              <h3 className="text-gray-900 dark:text-white font-semibold text-xl mb-4">{r.title}</h3>
              <ul className="space-y-3">
                {r.points.map((p, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                  >
                    <CheckCircle2 className={`w-4 h-4 ${r.color} flex-shrink-0 mt-0.5`} />
                    <span>{p}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

