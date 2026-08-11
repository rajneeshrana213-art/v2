"use client";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import React from "react";

interface Project {
    id: number;
    title: string;
    category: string;
    description: string;
    gradient: string;
    categoryBg: string;
    categoryColor: string;
    categoryBorder: string;
    link?: string;
}

interface ProjectMarqueeProps {
    projects: Project[];
    direction?: "left" | "right";
    speed?: number;
}

const ProjectCard = ({ project }: { project: Project }) => {
    return (
        <div className="flex-shrink-0 w-[280px] sm:w-[300px] mx-3">
            <div className="group relative rounded-2xl border border-gray-200/60 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-md overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/5 transition-all duration-500">
                {/* Gradient Accent */}
                <div className={`h-1 w-full bg-gradient-to-r ${project.gradient}`} />

                <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${project.categoryBg} ${project.categoryColor} ${project.categoryBorder}`}>
                            {project.category}
                        </span>
                        {project.link && (
                            <a
                                href={project.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 transition-all duration-300"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        )}
                    </div>

                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                        {project.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2 text-sm">
                        {project.description}
                    </p>

                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-1 group-hover:translate-y-0">
                        View Case Study
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ProjectMarquee = ({ projects, direction = "left", speed = 40 }: ProjectMarqueeProps) => {
    // Duplicate projects to ensure infinite look
    const duplicatedProjects = [...projects, ...projects, ...projects, ...projects, ...projects];

    return (
        <div className="relative flex overflow-hidden py-6 select-none w-full">
            {/* Enhanced Blur Overlays */}
            <div className="absolute inset-y-0 left-0 w-24 sm:w-40 bg-gradient-to-r from-white dark:from-[#0A0E14] via-white/80 dark:via-[#0A0E14]/80 to-transparent z-10 pointer-events-none backdrop-blur-[2px]" />
            <div className="absolute inset-y-0 right-0 w-24 sm:w-40 bg-gradient-to-l from-white dark:from-[#0A0E14] via-white/80 dark:via-[#0A0E14]/80 to-transparent z-10 pointer-events-none backdrop-blur-[2px]" />

            <motion.div
                className="flex"
                animate={{
                    x: direction === "left" ? ["0%", "-20%"] : ["-20%", "0%"],
                }}
                transition={{
                    duration: speed,
                    ease: "linear",
                    repeat: Infinity,
                }}
            >
                {duplicatedProjects.map((project, index) => (
                    <ProjectCard key={`${project.id}-${index}`} project={project} />
                ))}
            </motion.div>
        </div>
    );
};
