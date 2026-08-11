import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const services = [
    {
        id: "ai-development",
        icon: "🤖",
        gradient: "from-[#0057C8] to-[#1A9FFF]",
        bgLight: "bg-[#0057C8]/5",
        bgDark: "dark:bg-[#0057C8]/10",
        borderLight: "border-[#0057C8]/20",
        borderDark: "dark:border-[#0057C8]/20",
        textColor: "text-[#0057C8] dark:text-[#1A9FFF]",
        title: "AI Development",
        subtitle: "Intelligent Solutions",
        description:
            "Custom AI models, LLM integrations, computer vision, NLP pipelines, predictive analytics, and intelligent automation tailored for your business.",
        features: ["LLM & GPT Integration", "Computer Vision", "ML Model Training", "AI Automation Pipelines", "Predictive Analytics"],
        badge: "Most Popular",
    },
    {
        id: "blockchain",
        icon: "⛓️",
        gradient: "from-[#5CDD2B] to-[#4BBD22]",
        bgLight: "bg-[#5CDD2B]/5",
        bgDark: "dark:bg-[#5CDD2B]/10",
        borderLight: "border-[#5CDD2B]/20",
        borderDark: "dark:border-[#5CDD2B]/20",
        textColor: "text-[#5CDD2B] dark:text-[#5CDD2B]",
        title: "Blockchain Development",
        subtitle: "Web3 & DeFi",
        description:
            "Smart contracts, DApps, NFT platforms, DeFi protocols, tokenization, and enterprise blockchain solutions on Ethereum, Solana, and more.",
        features: ["Smart Contracts", "NFT Marketplaces", "DeFi Protocols", "Web3 Integration", "Token Development"],
        badge: "Trending",
    },
    {
        id: "custom-software",
        icon: "⚙️",
        gradient: "from-[#0057C8] to-[#1A9FFF]",
        bgLight: "bg-[#0057C8]/5",
        bgDark: "dark:bg-[#0057C8]/10",
        borderLight: "border-[#0057C8]/20",
        borderDark: "dark:border-[#0057C8]/20",
        textColor: "text-[#0057C8] dark:text-[#1A9FFF]",
        title: "Custom Software Build",
        subtitle: "Enterprise Solutions",
        description:
            "End-to-end custom software development — from requirements analysis to deployment — built to scale with your business needs.",
        features: ["ERP Systems", "SaaS Products", "API Development", "Microservices", "Cloud Architecture"],
        badge: null,
    },
    {
        id: "web-development",
        icon: "🌐",
        gradient: "from-[#1A9FFF] to-[#0057C8]",
        bgLight: "bg-[#1A9FFF]/5",
        bgDark: "dark:bg-[#1A9FFF]/10",
        borderLight: "border-[#1A9FFF]/20",
        borderDark: "dark:border-[#1A9FFF]/20",
        textColor: "text-[#1A9FFF] dark:text-[#0057C8]",
        title: "Website Development",
        subtitle: "Web Excellence",
        description:
            "High-performance, SEO-optimized websites. From landing pages to complex portals — we craft experiences that convert and engage.",
        features: ["Next.js / React", "E-commerce Stores", "CMS Integration", "Performance Optimization", "SEO-Ready"],
        badge: null,
    },
    {
        id: "app-development",
        icon: "📱",
        gradient: "from-[#FFC555] to-[#FF8C00]",
        bgLight: "bg-[#FFC555]/5",
        bgDark: "dark:bg-[#FFC555]/10",
        borderLight: "border-[#FFC555]/20",
        borderDark: "dark:border-[#FFC555]/20",
        textColor: "text-[#FFC555] dark:text-[#FFC555]",
        title: "App Development",
        subtitle: "Mobile & Cross-Platform",
        description:
            "Native iOS & Android apps, cross-platform solutions with React Native and Flutter — beautiful, fast, and feature-rich mobile experiences.",
        features: ["React Native", "Flutter", "iOS & Android", "App Store Launch", "Push Notifications"],
        badge: null,
    },
    {
        id: "ui-ux",
        icon: "🎨",
        gradient: "from-[#1A9FFF] to-[#5CDD2B]",
        bgLight: "bg-[#1A9FFF]/5",
        bgDark: "dark:bg-[#1A9FFF]/10",
        borderLight: "border-[#1A9FFF]/20",
        borderDark: "dark:border-[#1A9FFF]/20",
        textColor: "text-[#1A9FFF] dark:text-[#5CDD2B]",
        title: "UI/UX Design",
        subtitle: "Design that Converts",
        description:
            "User-centered design that blends aesthetics with function. We create intuitive interfaces that delight users and drive business outcomes.",
        features: ["Design Systems", "Wireframing", "Prototyping", "User Research", "Figma Design"],
        badge: "Award-Winning",
    },
    {
        id: "digital-marketing",
        icon: "📣",
        gradient: "from-[#5CDD2B] to-[#0057C8]",
        bgLight: "bg-[#5CDD2B]/5",
        bgDark: "dark:bg-[#5CDD2B]/10",
        borderLight: "border-[#5CDD2B]/20",
        borderDark: "dark:border-[#5CDD2B]/20",
        textColor: "text-[#5CDD2B] dark:text-[#0057C8]",
        title: "Digital Marketing",
        subtitle: "Growth & Visibility",
        description:
            "Data-driven digital marketing strategies: SEO, PPC, social media, content marketing, and growth hacking to amplify your brand.",
        features: ["SEO & SEM", "Social Media Ads", "Content Strategy", "Email Marketing", "Analytics & Reporting"],
        badge: null,
    },
    {
        id: "consulting",
        icon: "🧠",
        gradient: "from-[#0057C8] to-[#FFC555]",
        bgLight: "bg-[#0057C8]/5",
        bgDark: "dark:bg-[#0057C8]/10",
        borderLight: "border-[#0057C8]/20",
        borderDark: "dark:border-[#0057C8]/20",
        textColor: "text-[#0057C8] dark:text-[#FFC555]",
        title: "Tech Consulting",
        subtitle: "Strategy & Advisory",
        description:
            "Strategic technology consulting to help you navigate digital transformation, architecture decisions, and technology road-mapping.",
        features: ["Tech Roadmapping", "Architecture Review", "Digital Transformation", "Team Augmentation", "CTO Advisory"],
        badge: "Premium",
    },
    {
        id: "sustainable-textiles",
        icon: "🌱",
        gradient: "from-[#5CDD2B] to-[#4BBD22]",
        bgLight: "bg-[#5CDD2B]/5",
        bgDark: "dark:bg-[#5CDD2B]/10",
        borderLight: "border-[#5CDD2B]/20",
        borderDark: "dark:border-[#5CDD2B]/20",
        textColor: "text-[#5CDD2B] dark:text-[#5CDD2B]",
        title: "Sustainable Textiles & Export",
        subtitle: "Circular Fashion Leader",
        description:
            "Transforming textile waste into high-grade, sustainable yarn and apparel, with a focus on recycled cashmere and GRS-certified luxury garments.",
        features: ["100% Cashmere Export", "Recycled Cashmere", "Wool Recycled", "Aramid Yarns Waste", "Circular Fashion Leadership"],
        badge: "Sustainable",
    },
];

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function ServicesGrid() {
    return (
        <section id="services" className="relative py-24 overflow-hidden bg-transparent">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-4 py-1.5 text-sm font-bold uppercase tracking-widest text-[#0057C8] dark:text-[#1A9FFF] bg-[#0057C8]/5 dark:bg-[#0057C8]/20 rounded-full border border-[#0057C8]/20 dark:border-[#0057C8]/30 mb-4">
                        What We Offer
                    </span>
                    <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4">
                        Our{" "}
                        <span className="bg-gradient-to-r from-[#0057C8] to-[#1A9FFF] dark:from-[#1A9FFF] dark:to-[#5CDD2B] bg-clip-text text-transparent">
                            Services
                        </span>
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        A full spectrum of technology services to help your business thrive in the digital era.
                    </p>
                </motion.div>

                {/* Services Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                    {services.map((service) => (
                        <motion.div
                            key={service.id}
                            variants={cardVariants}
                            whileHover={{ y: -6, scale: 1.01 }}
                            className={`relative group rounded-2xl border ${service.borderLight} ${service.borderDark} ${service.bgLight} ${service.bgDark} p-6 overflow-hidden cursor-pointer transition-all duration-300`}
                        >
                            {/* Badge */}
                            {service.badge && (
                                <span className={`absolute top-4 right-4 px-2.5 py-1 text-sm font-bold rounded-full bg-gradient-to-r ${service.gradient} text-white`}>
                                    {service.badge}
                                </span>
                            )}

                            {/* Hover glow */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 transition-opacity duration-300 rounded-2xl`} />

                            {/* Icon */}
                            <div className="text-4xl mb-4">{service.icon}</div>

                            {/* Title */}
                            <div className="mb-3">
                                <span className={`text-sm font-semibold uppercase tracking-wider ${service.textColor} mb-1 block`}>
                                    {service.subtitle}
                                </span>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{service.title}</h3>
                            </div>

                            {/* Description */}
                            <p className="text-base text-gray-600 dark:text-gray-400 mb-4 xl:min-h-[100px] leading-relaxed">{service.description}</p>

                            {/* Features */}
                            <ul className="space-y-1.5 mb-5">
                                {service.features.map((f, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                        <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${service.gradient} flex-shrink-0`} />
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            {/* CTA */}
                            <Link href="/contact">
                                <motion.div
                                    className={`inline-flex items-center gap-1.5 text-base font-semibold ${service.textColor} group/btn`}
                                    whileHover={{ x: 4 }}
                                >
                                    Get Started
                                    <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover/btn:translate-x-1" />
                                </motion.div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
