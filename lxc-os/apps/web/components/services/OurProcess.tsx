import { motion } from "framer-motion";

const steps = [
    {
        step: "01",
        icon: "🔍",
        title: "Discovery & Strategy",
        description:
            "We start with a deep-dive into your business goals, technical requirements, and market opportunity. Our team crafts a strategic roadmap.",
        gradient: "from-[#0057C8] to-[#1A9FFF]",
        outputs: ["Requirements Analysis", "Tech Stack Selection", "Project Roadmap"],
    },
    {
        step: "02",
        icon: "🎨",
        title: "Design & Architecture",
        description:
            "Our designers and architects collaborate to create stunning UI/UX designs and a robust technical architecture built for scale.",
        gradient: "from-[#1A9FFF] to-[#5CDD2B]",
        outputs: ["UI/UX Designs", "System Architecture", "API Contracts"],
    },
    {
        step: "03",
        icon: "⚡",
        title: "Agile Development",
        description:
            "We ship in sprints using agile methodology — with continuous integration, automated testing, and weekly demos to keep you in the loop.",
        gradient: "from-[#5CDD2B] to-[#0057C8]",
        outputs: ["Sprint Deliverables", "Code Reviews", "CI/CD Pipeline"],
    },
    {
        step: "04",
        icon: "🧪",
        title: "QA & Testing",
        description:
            "Rigorous quality assurance — from unit tests to load testing — ensures your product is production-grade before a single user sees it.",
        gradient: "from-[#0057C8] to-[#FFC555]",
        outputs: ["Test Coverage", "Performance Reports", "Security Audit"],
    },
    {
        step: "05",
        icon: "🚀",
        title: "Launch & Deploy",
        description:
            "We handle a zero-downtime deployment to your preferred cloud infrastructure with monitoring, alerting, and auto-scaling configured.",
        gradient: "from-[#FFC555] to-[#1A9FFF]",
        outputs: ["Cloud Deployment", "Monitoring Setup", "Go-Live Support"],
    },
    {
        step: "06",
        icon: "🔄",
        title: "Growth & Support",
        description:
            "Post-launch, we provide dedicated support, continuous iteration, and data-driven improvements to help your product grow.",
        gradient: "from-[#5CDD2B] to-[#0057C8]",
        outputs: ["24/7 Support", "Feature Iterations", "Analytics Insights"],
    },
];

export default function OurProcess() {
    return (
        <section className="relative py-24 overflow-hidden bg-transparent">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-4 py-1.5 text-sm font-bold uppercase tracking-widest text-[#5CDD2B] dark:text-[#5CDD2B] bg-[#5CDD2B]/5 dark:bg-[#5CDD2B]/10 rounded-full border border-[#5CDD2B]/20 dark:border-[#5CDD2B]/20 mb-4">
                        How We Work
                    </span>
                    <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4">
                        Our{" "}
                        <span className="bg-gradient-to-r from-[#0057C8] to-[#1A9FFF] dark:from-[#1A9FFF] dark:to-[#5CDD2B] bg-clip-text text-transparent">
                            Process
                        </span>
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        A proven, battle-tested development process that delivers results on time and on budget.
                    </p>
                </motion.div>

                {/* Process Steps */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {steps.map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                            whileHover={{ y: -4 }}
                            className="relative rounded-2xl border border-gray-200/60 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-sm p-7 group hover:shadow-xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/5 transition-all duration-300"
                        >


                            {/* Icon + Step number badge */}
                            <div className="flex items-start gap-4 mb-4">
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-2xl shadow-lg flex-shrink-0`}>
                                    {step.icon}
                                </div>
                                <div>
                                    <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-gradient-to-r ${step.gradient} text-white mb-2 shadow-sm`}>
                                        Step {step.step}
                                    </span>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{step.title}</h3>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-5">{step.description}</p>

                            {/* Outputs */}
                            <div className="space-y-2">
                                {step.outputs.map((output, j) => (
                                    <div key={j} className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${step.gradient} flex-shrink-0`} />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{output}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
