import { motion } from "framer-motion";
import { 
  UserPlus, 
  ClipboardCheck, 
  CreditCard, 
  Users, 
  Bus, 
  BarChart3 
} from "lucide-react";

const modules = [
  {
    title: "Admissions & Enrollment",
    description: "Streamline student onboarding with automated workflows, document verification, and seamless enrollment processes.",
    icon: UserPlus,
    color: "from-[#0057C8] to-[#1A9FFF]",
    bgColor: "bg-[#0057C8]/10 dark:bg-[#0057C8]/20"
  },
  {
    title: "Attendance & Exams",
    description: "Track attendance in real-time and manage comprehensive exam systems with automated scheduling and grading.",
    icon: ClipboardCheck,
    color: "from-[#5CDD2B] to-[#4BBD22]",
    bgColor: "bg-[#5CDD2B]/10 dark:bg-[#5CDD2B]/20"
  },
  {
    title: "Fee Collection & Accounting",
    description: "Automated fee management with payment gateways, receipts, and comprehensive financial reporting.",
    icon: CreditCard,
    color: "from-[#1A9FFF] to-[#0057C8]",
    bgColor: "bg-[#1A9FFF]/10 dark:bg-[#1A9FFF]/20"
  },
  {
    title: "HR & Payroll",
    description: "Complete human resource management with payroll automation, leave management, and performance tracking.",
    icon: Users,
    color: "from-[#0057C8] to-[#1A9FFF]",
    bgColor: "bg-[#0057C8]/10 dark:bg-[#0057C8]/20"
  },
  {
    title: "Transport & Hostel",
    description: "Manage transportation routes, vehicle tracking, and hostel facilities with integrated communication systems.",
    icon: Bus,
    color: "from-[#FFC555] to-[#FFD700]",
    bgColor: "bg-[#FFC555]/10 dark:bg-[#FFC555]/20"
  },
  {
    title: "Reports & Analytics",
    description: "Comprehensive dashboards with real-time insights, custom reports, and data visualization for informed decisions.",
    icon: BarChart3,
    color: "from-[#1A9FFF] to-[#5CDD2B]",
    bgColor: "bg-[#1A9FFF]/10 dark:bg-[#1A9FFF]/20"
  }
];

export default function ProductModules() {
  return (
    <section className="relative py-28 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800/50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0057C8]/5 dark:bg-[#0057C8]/20 text-[#0057C8] dark:text-[#1A9FFF] mb-6 text-sm font-medium">
            <span>Integrated Modules</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Deeply Integrated Modules
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Every module works seamlessly together, sharing data and workflows
            to create a unified school management experience.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, i) => {
            const Icon = module.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group relative p-8 rounded-2xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:border-[#0057C8]/30 dark:hover:border-[#0057C8]/30 transition-all duration-300 hover:shadow-xl dark:hover:shadow-[#0057C8]/10 overflow-hidden"
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${module.color} p-0.5 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <div className="w-full h-full rounded-xl bg-white dark:bg-gray-800/50 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-gray-800 dark:text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-[#0057C8] dark:group-hover:text-[#1A9FFF] transition-colors">
                    {module.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {module.description}
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
