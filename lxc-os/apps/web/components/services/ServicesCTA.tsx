import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Mail, Phone, MessageSquare, Zap } from "lucide-react";

const contactOptions = [
    {
        icon: MessageSquare,
        label: "Chat with Us",
        desc: "Get a response in under 2 hours",
        href: "/contact",
        color: "from-[#0057C8] to-[#1A9FFF]",
    },
    {
        icon: Mail,
        label: "Send Email",
        desc: "contact@learnxchain.com",
        href: "mailto:contact@learnxchain.com",
        color: "from-[#5CDD2B] to-[#4BBD22]",
    },
    {
        icon: Phone,
        label: "Call Us",
        desc: "+91 7015290569",
        href: "tel:+917015290569",
        color: "from-[#1A9FFF] to-[#0057C8]",
    },
];

export default function ServicesCTA() {
    return (
        <section className="relative py-28 overflow-hidden bg-transparent">

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-white/10 backdrop-blur-sm border border-gray-200 dark:border-white/20 mb-8 shadow-sm"
                >
                    <Zap className="w-4 h-4 text-[#5CDD2B] dark:text-[#5CDD2B]" />
                    <span className="text-sm font-semibold text-gray-800 dark:text-white/90 tracking-wide">
                        Ready to build something incredible?
                    </span>
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-6 leading-tight"
                >
                    Let's Build Your
                    <br />
                    <span className="text-[#FFC555] dark:text-[#FFC555]">Next Big Thing</span>
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-xl text-gray-600 dark:text-white/70 max-w-2xl mx-auto mb-12"
                >
                    From idea to launch — we're your end-to-end digital partner. Get a free consultation and project estimate today.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
                >
                    <Link href="/book-demo">
                        <motion.button
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto rounded-2xl bg-[#0057C8] dark:bg-white text-white dark:text-[#0057C8] font-bold text-lg shadow-xl shadow-[#0057C8]/20 dark:shadow-none hover:shadow-2xl transition-all"
                        >
                            Book Free Consultation
                            <ArrowRight className="w-5 h-5" />
                        </motion.button>
                    </Link>
                    <Link href="/contact">
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto rounded-2xl border-2 border-[#0057C8]/20 dark:border-white/30 bg-white/50 dark:bg-transparent text-[#0057C8] dark:text-white font-semibold text-lg hover:bg-[#0057C8]/5 dark:hover:bg-white/10 transition-all backdrop-blur-sm"
                        >
                            Contact Us
                        </motion.button>
                    </Link>
                </motion.div>

                {/* Contact Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto"
                >
                    {contactOptions.map((opt, i) => {
                        const Icon = opt.icon;
                        return (
                            <motion.a
                                key={i}
                                href={opt.href}
                                whileHover={{ y: -4, scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                className="flex flex-col items-center gap-3 rounded-2xl bg-white dark:bg-white/10 backdrop-blur-sm border border-gray-200 dark:border-white/20 shadow-lg dark:shadow-none p-5 hover:bg-gray-50 dark:hover:bg-white/15 transition-all group"
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${opt.color} flex items-center justify-center shadow-inner`}>
                                    <Icon className="w-5 h-5 text-white" />
                                </div>
                                <div className="text-center">
                                    <div className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-[#0057C8] dark:group-hover:text-white transition-colors">{opt.label}</div>
                                    <div className="text-sm text-gray-500 dark:text-white/60">{opt.desc}</div>
                                </div>
                            </motion.a>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}
