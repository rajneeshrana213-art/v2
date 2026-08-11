import { motion } from "framer-motion";
import { Users, UserCheck, GraduationCap, Shield } from "lucide-react";

const roles = [
  {
    icon: Shield,
    title: "Administrators",
    description: "Complete control and oversight with powerful analytics and management tools.",
    color: "from-[#0057C8] to-[#1A9FFF]"
  },
  {
    icon: GraduationCap,
    title: "Teachers",
    description: "Streamlined workflows for attendance, grading, and student communication.",
    color: "from-[#1A9FFF] to-[#0057C8]"
  },
  {
    icon: UserCheck,
    title: "Parents",
    description: "Real-time updates on attendance, grades, fees, and school communications.",
    color: "from-[#5CDD2B] to-[#4BBD22]"
  },
  {
    icon: Users,
    title: "Students",
    description: "Access schedules, assignments, grades, and resources in one place.",
    color: "from-[#FFC555] to-[#FF8C00]"
  }
];

export default function ProductWorkflow() {
  return (
    <section className="relative py-28 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0057C8]/5 dark:bg-[#0057C8]/20 text-[#0057C8] dark:text-[#1A9FFF] mb-6 text-sm font-medium">
            <span>User Experience</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Built for Real School Workflows
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Admins, teachers, parents, and students — everyone works
            from the same source of truth with role-specific interfaces
            designed for efficiency and ease of use.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role, i) => {
            const Icon = role.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group relative p-6 rounded-2xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300 hover:shadow-xl dark:hover:shadow-indigo-500/10"
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${role.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`} />
                
                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${role.color} p-0.5 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <div className="w-full h-full rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center">
                      <Icon className="w-7 h-7 text-gray-800 dark:text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#0057C8] dark:group-hover:text-[#1A9FFF] transition-colors">
                    {role.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {role.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
