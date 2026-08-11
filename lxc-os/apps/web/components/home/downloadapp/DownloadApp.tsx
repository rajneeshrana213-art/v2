import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Download, Star, Users, Smartphone } from "lucide-react";

// Import app screenshots
import app1 from "@/assets/app/1.webp";
import app2 from "@/assets/app/2.webp";
import app3 from "@/assets/app/3.webp";
import app4 from "@/assets/app/4.webp";
import app5 from "@/assets/app/5.webp";
import app6 from "@/assets/app/6.webp";
import app7 from "@/assets/app/7.webp";
import app8 from "@/assets/app/8.webp";

const screenshots = [app1, app2, app3, app4, app5, app6, app7, app8];

const PLAY_STORE_URL =
    "https://play.google.com/store/apps/details?id=com.learnxchain.lxc&hl=en_IN";

const appFeatures = [
    "Real-time attendance & notifications",
    "Fee payments & receipts",
    "AI-powered student analytics",
    "Homework & exam schedules",
    "Parent-teacher communication",
    "Blockchain-verified certificates",
];

export default function DownloadApp() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    // Auto-scroll every 3 seconds
    const nextSlide = useCallback(() => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % screenshots.length);
    }, []);



    useEffect(() => {
        const timer = setInterval(nextSlide, 3500);
        return () => clearInterval(timer);
    }, [nextSlide]);

    const slideVariants = {
        enter: (dir: number) => ({
            x: dir > 0 ? 300 : -300,
            opacity: 0,
            scale: 0.8,
        }),
        center: {
            x: 0,
            opacity: 1,
            scale: 1,
        },
        exit: (dir: number) => ({
            x: dir > 0 ? -300 : 300,
            opacity: 0,
            scale: 0.8,
        }),
    };

    return (
        <section className="relative py-24 sm:py-32 overflow-hidden bg-gradient-to-br from-gray-50 via-white to-[#0057C8]/5 dark:from-[#000000] dark:via-[#0D1B2A] dark:to-[#000000]">
            {/* Animated Background — matching hero */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ x: [0, 60, 0], y: [0, 40, 0], scale: [1, 1.15, 1] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute right-[-200px] top-1/3 h-[500px] w-[500px] rounded-full bg-[#0057C8]/15 dark:bg-[#0057C8]/20 blur-[140px]"
                />
                <motion.div
                    animate={{ x: [0, -50, 0], y: [0, -40, 0], scale: [1, 1.2, 1] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute left-[-180px] bottom-1/4 h-[500px] w-[500px] rounded-full bg-[#1A9FFF]/12 dark:bg-[#1A9FFF]/18 blur-[140px]"
                />
                <div
                    className="absolute inset-0 opacity-[0.06] dark:opacity-[0.04]"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(0, 87, 200, 0.15) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0, 87, 200, 0.15) 1px, transparent 1px)
                        `,
                        backgroundSize: '48px 48px',
                    }}
                />
            </div>

            <div className="relative mx-auto max-w-7xl px-6 sm:px-8">
                <div className="grid items-center gap-12 lg:gap-20 lg:grid-cols-[1fr,minmax(0,1.1fr)]">
                    {/* Left: Phone Mockup with Screenshot Scroller */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="relative flex justify-center"
                    >
                        {/* Screenshot Container */}
                        <div className="relative w-[260px] sm:w-[280px]">
                            <div className="relative aspect-[9/19.5] overflow-hidden rounded-3xl bg-white dark:bg-gray-900 shadow-2xl shadow-indigo-500/20 border border-gray-200/50 dark:border-white/10">
                                {screenshots.map((src, i) => (
                                    <motion.div
                                        key={i}
                                        animate={{ opacity: i === currentIndex ? 1 : 0 }}
                                        transition={{ duration: 0.6, ease: "easeInOut" }}
                                        className="absolute inset-0"
                                        style={{ zIndex: i === currentIndex ? 1 : 0 }}
                                    >
                                        <Image
                                            src={src}
                                            alt={`App screenshot ${i + 1}`}
                                            fill
                                            className="object-cover"
                                            priority={i < 2}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Floating Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.6, type: "spring" }}
                            className="absolute -top-2 -right-2 sm:right-4 z-30"
                        >
                            <motion.div
                                animate={{ y: [0, -6, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-[#0C1018] border border-[#5CDD2B]/30 dark:border-[#5CDD2B]/20 shadow-xl backdrop-blur-xl"
                            >
                                <div className="flex -space-x-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={12}
                                            className="text-yellow-400 fill-yellow-400"
                                        />
                                    ))}
                                </div>
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                                    4.8 Rating
                                </span>
                            </motion.div>
                        </motion.div>

                        {/* Floating Downloads Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.8, type: "spring" }}
                            className="absolute -bottom-2 -left-2 sm:left-4 z-30"
                        >
                            <motion.div
                                animate={{ y: [0, -5, 0] }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 1,
                                }}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-[#0C1018] border border-[#0057C8]/20 dark:border-[#0057C8]/30 shadow-xl backdrop-blur-xl"
                            >
                                <Users size={14} className="text-[#0057C8] dark:text-[#1A9FFF]" />
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                                    50K+ Downloads
                                </span>
                            </motion.div>
                        </motion.div>
                    </motion.div>

                    {/* Right: Content */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-center lg:text-left"
                    >
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#0057C8]/20 dark:border-[#0057C8]/30 bg-[#0057C8]/5 dark:bg-[#0057C8]/10 px-4 py-2 text-sm font-semibold"
                        >
                            <Smartphone size={16} className="text-[#0057C8] dark:text-[#1A9FFF]" />
                            <span className="text-[#0057C8] dark:text-[#1A9FFF]">
                                Available on Google Play
                            </span>
                        </motion.div>

                        {/* Heading */}
                        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
                            <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
                                Your School in
                            </span>
                            <br />
                            <span className="bg-gradient-to-r from-[#0057C8] via-[#1A9FFF] to-[#5CDD2B] dark:from-[#1A9FFF] dark:via-[#55CFFF] dark:to-[#5CDD2B] bg-clip-text text-transparent">
                                Your Pocket
                            </span>
                        </h2>

                        {/* Description */}
                        <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl mb-8">
                            Stay connected to your school from anywhere. Track attendance, pay
                            fees, view results, and get AI-powered insights — all from the{" "}
                            <span className="font-semibold text-gray-900 dark:text-white">
                                LearnXChain Mobile App
                            </span>
                            .
                        </p>

                        {/* Feature list */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
                            {appFeatures.map((feature, i) => (
                                <motion.div
                                    key={feature}
                                    initial={{ opacity: 0, x: -10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.3 + i * 0.08 }}
                                    className="flex items-center gap-2.5"
                                >
                                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r from-[#0057C8] to-[#1A9FFF] flex items-center justify-center">
                                        <svg
                                            className="w-3 h-3 text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={3}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </div>
                                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                                        {feature}
                                    </span>
                                </motion.div>
                            ))}
                        </div>

                        {/* Download Button */}
                        <motion.div
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            className="inline-block"
                        >
                            <a
                                href={PLAY_STORE_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl bg-gray-900 dark:bg-white px-8 py-4 shadow-xl hover:shadow-2xl transition-all duration-300"
                            >
                                {/* Google Play icon */}
                                <svg
                                    viewBox="0 0 512 512"
                                    className="w-8 h-8 flex-shrink-0"
                                >
                                    <path
                                        d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"
                                        fill="currentColor"
                                        className="text-white dark:text-gray-900"
                                    />
                                </svg>
                                <div className="text-left">
                                    <div className="text-[10px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                        Get it on
                                    </div>
                                    <div className="text-lg font-bold text-white dark:text-gray-900 -mt-0.5">
                                        Google Play
                                    </div>
                                </div>
                                <Download
                                    size={20}
                                    className="text-gray-400 dark:text-gray-500 group-hover:text-white dark:group-hover:text-gray-900 transition-colors ml-2"
                                />
                            </a>
                        </motion.div>

                        {/* Stats row */}
                        <div className="mt-8 flex items-center gap-8 justify-center lg:justify-start">
                            {[
                                { value: "50K+", label: "Downloads" },
                                { value: "4.8★", label: "Rating" },
                                { value: "10K/mo", label: "Active Users" },
                            ].map((stat) => (
                                <div key={stat.label} className="text-center lg:text-left">
                                    <div className="text-xl font-black bg-gradient-to-r from-[#0057C8] to-[#1A9FFF] dark:from-[#1A9FFF] dark:to-[#55CFFF] bg-clip-text text-transparent">
                                        {stat.value}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
