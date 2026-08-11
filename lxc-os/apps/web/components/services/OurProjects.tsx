"use client";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";

import { projects } from "@/lib/projectsData";

export default function OurProjects() {
    const latestProjects = [...projects].slice(-6);
    const featuredProjects = latestProjects.filter((p) => p.featured);
    const restProjects = latestProjects.filter((p) => !p.featured);

    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (featuredProjects.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % featuredProjects.length);
        }, 5000); // Auto-slide every 5 seconds
        return () => clearInterval(interval);
    }, [featuredProjects.length]);

    const featuredProject = featuredProjects[currentIndex];

    return (
        <section id="our-work" className="relative py-24 overflow-hidden bg-transparent">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-4 py-1.5 text-sm font-bold uppercase tracking-widest text-[#0057C8] dark:text-[#1A9FFF] bg-[#0057C8]/5 dark:bg-[#0057C8]/10 rounded-full border border-[#0057C8]/20 dark:border-[#0057C8]/30 mb-4">
                        Our Portfolio
                    </span>
                    <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4">
                        Featured{" "}
                        <span className="bg-gradient-to-r from-[#0057C8] to-[#1A9FFF] dark:from-[#1A9FFF] dark:to-[#5CDD2B] bg-clip-text text-transparent">
                            Projects
                        </span>
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Real-world solutions we've built for real businesses. Each project tells a story of innovation.
                    </p>
                </motion.div>

                {/* Featured Project */}
                {featuredProject && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="relative rounded-3xl overflow-hidden mb-8 group min-h-[450px]"
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.8 }}
                                className="absolute inset-0"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${featuredProject.gradient} opacity-90`} />
                                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_80%_50%,rgba(255,255,255,0.1),transparent)]" />

                                <div className="relative p-10 sm:p-14 flex flex-col lg:flex-row items-start lg:items-center gap-10 h-full">
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-3 mb-4">
                                            <span className="px-3 py-1 rounded-full bg-white/20 text-white/90 text-sm font-bold uppercase tracking-wider">
                                                Featured Project
                                            </span>
                                            <span className="px-3 py-1 rounded-full bg-white/20 text-white/90 text-sm font-semibold">
                                                {featuredProject.category}
                                            </span>
                                            {featuredProject.link && (
                                                <a href={featuredProject.link} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer" title="Visit Project">
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            )}
                                        </div>
                                        <h3 className="text-3xl sm:text-4xl font-black text-white mb-4">{featuredProject.title}</h3>
                                        <p className="text-white/80 text-lg leading-relaxed mb-6 max-w-xl">{featuredProject.description}</p>
                                        <div className="flex flex-wrap gap-2 mb-8">
                                            {featuredProject.tags.map((tag, i) => (
                                                <span key={i} className="px-3 py-1.5 rounded-lg bg-white/15 text-white text-sm font-medium backdrop-blur-sm">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        <Link href="/contact">
                                            <motion.button
                                                whileHover={{ scale: 1.05, y: -2 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#0057C8] font-semibold text-sm shadow-lg hover:shadow-xl transition-all"
                                            >
                                                Build Something Like This
                                                <ArrowRight className="w-4 h-4" />
                                            </motion.button>
                                        </Link>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 lg:min-w-[280px]">
                                        {featuredProject.stats.map((stat, i) => (
                                            <div key={i} className="text-center rounded-2xl bg-white/15 backdrop-blur-sm p-5">
                                                <div className="text-2xl font-black text-white mb-1">{stat.value}</div>
                                                <div className="text-sm text-white/70 font-medium">{stat.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* Rest of Projects */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {restProjects.map((project, i) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                            whileHover={{ y: -6 }}
                            className="group relative rounded-2xl border border-gray-200/60 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-sm overflow-hidden hover:shadow-xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/5 transition-all duration-300"
                        >
                            {/* Gradient top bar */}
                            <div className={`h-1.5 w-full bg-gradient-to-r ${project.gradient}`} />

                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <span className={`px-2.5 py-1 rounded-lg text-sm font-semibold border ${project.categoryBg} ${project.categoryColor} ${project.categoryBorder}`}>
                                        {project.category}
                                    </span>
                                    {project.link ? (
                                        <a href={project.link} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="w-5 h-5 text-gray-400 hover:text-[#0057C8] transition-colors cursor-pointer" />
                                        </a>
                                    ) : (
                                        <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-[#0057C8] transition-colors" />
                                    )}
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{project.title}</h3>
                                <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{project.description}</p>

                                <div className="flex flex-wrap gap-1.5 mb-5">
                                    {project.tags.map((tag, j) => (
                                        <span key={j} className="px-2 py-1 rounded-md bg-gray-100 dark:bg-white/5 text-sm font-medium text-gray-600 dark:text-gray-400">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
                                    {project.stats.map((stat, k) => (
                                        <div key={k} className="text-center">
                                            <div className={`text-lg font-black ${project.categoryColor}`}>{stat.value}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* View All CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12"
                >
                    <Link href="/projects">
                        <motion.button
                            whileHover={{ scale: 1.04, y: -2 }}
                            whileTap={{ scale: 0.96 }}
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-[#0057C8] dark:bg-[#0057C8] text-white font-semibold text-base shadow-lg shadow-[#0057C8]/30 hover:bg-[#0057C8]/90 transition-all hover:shadow-xl"
                        >
                            View All Projects
                            <ArrowRight className="w-5 h-5" />
                        </motion.button>
                    </Link>
                    <Link href="/contact">
                        <motion.button
                            whileHover={{ scale: 1.04, y: -2 }}
                            whileTap={{ scale: 0.96 }}
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border border-[#0057C8]/20 dark:border-[#0057C8]/30 bg-[#0057C8]/5 dark:bg-[#0057C8]/10 text-[#0057C8] dark:text-[#1A9FFF] font-semibold text-base hover:bg-[#0057C8]/10 dark:hover:bg-[#0057C8]/20 transition-all"
                        >
                            Start Your Project
                        </motion.button>
                    </Link>
                </motion.div>
            </div >
        </section >
    );
}
