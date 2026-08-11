import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, Zap } from "lucide-react";

const stats = [
    { value: "10+", label: "Projects Delivered" },
    { value: "5+", label: "Happy Clients" },
    { value: "8+", label: "Service Areas" },
    { value: "98%", label: "Client Satisfaction" },
];

export default function ServicesHero() {
    return (
        <section className="relative min-h-[90vh] w-full flex items-center justify-center overflow-hidden bg-transparent pt-32 pb-20">
            {/* Animated Background Elements */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#0057C8]/20 via-[#1A9FFF]/10 to-transparent dark:from-[#0057C8]/10 dark:via-[#1A9FFF]/5 dark:to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-[#1A9FFF]/20 via-[#5CDD2B]/10 to-transparent dark:from-[#1A9FFF]/10 dark:via-[#5CDD2B]/5 dark:to-transparent" />

                <motion.div
                    animate={{
                        x: [0, 100, 0],
                        y: [0, 50, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute left-1/4 top-1/4 h-[600px] w-[600px] rounded-full bg-gradient-to-r from-[#0057C8]/40 to-[#1A9FFF]/40 blur-[100px] dark:from-[#0057C8]/30 dark:to-[#1A9FFF]/30"
                />
                <motion.div
                    animate={{
                        x: [0, -80, 0],
                        y: [0, -60, 0],
                        scale: [1, 1.3, 1],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute right-1/4 bottom-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-r from-[#1A9FFF]/35 to-[#5CDD2B]/35 blur-[120px] dark:from-[#1A9FFF]/25 dark:to-[#5CDD2B]/25"
                />
            </div>

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)]" />

            <div className="relative z-10 text-center max-w-5xl px-6 py-20">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0057C8]/5 dark:bg-[#0057C8]/20 border border-[#0057C8]/20 dark:border-[#0057C8]/30 mb-8"
                >
                    <Sparkles className="w-4 h-4 text-[#0057C8] dark:text-[#1A9FFF]" />
                    <span className="text-sm font-semibold text-[#0057C8] dark:text-[#1A9FFF] tracking-wide uppercase">
                        End-to-End Digital Services
                    </span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6"
                >
                    <span className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-gray-200 bg-clip-text text-transparent">
                        We Build
                    </span>
                    <br />
                    <span className="bg-gradient-to-r from-[#0057C8] via-[#1A9FFF] to-[#5CDD2B] dark:from-[#1A9FFF] dark:via-[#55CFFF] dark:to-[#5CDD2B] bg-clip-text text-transparent">
                        Digital Futures
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed"
                >
                    From cutting-edge <span className="font-semibold text-[#0057C8] dark:text-[#1A9FFF]">AI solutions</span> to{" "}
                    <span className="font-semibold text-[#1A9FFF] dark:text-[#5CDD2B]">blockchain architecture</span> — we craft world-class digital products that transform businesses.
                </motion.p>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
                >
                    <Link href="/contact">
                        <motion.button
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#0057C8] to-[#1A9FFF] text-white font-semibold text-lg shadow-xl shadow-[#0057C8]/20 hover:shadow-[#0057C8]/40 transition-all duration-300"
                        >
                            <Zap className="w-5 h-5" />
                            Start Your Project
                            <ArrowRight className="w-5 h-5" />
                        </motion.button>
                    </Link>
                    <Link href="#our-work">
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-sm text-gray-800 dark:text-gray-200 font-semibold text-lg hover:border-[#0057C8]/30 dark:hover:border-[#0057C8]/40 transition-all duration-300"
                        >
                            View Our Work
                            <ArrowRight className="w-5 h-5 opacity-60" />
                        </motion.button>
                    </Link>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-3xl mx-auto"
                >
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                            className="text-center"
                        >
                            <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-[#0057C8] to-[#1A9FFF] dark:from-[#1A9FFF] dark:to-[#5CDD2B] bg-clip-text text-transparent mb-1">
                                {stat.value}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">{stat.label}</div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
