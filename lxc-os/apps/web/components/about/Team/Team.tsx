"use client";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import Image from "next/image";
import { Linkedin, Instagram, ArrowUpRight } from "lucide-react";
import React, { MouseEvent } from "react";

// Importing local team assets
import rajneeshImage from "@/assets/team/rajneesh Rana founder .jpg";
import bikyImage from "@/assets/team/biky  Dev CTO.png";
import aryanImage from "@/assets/team/aryan Designted partner and director.jpg";
import vishalImage from "@/assets/team/vishal sharma CMO &nDesgnated partnet and director.jpeg";
import rohitImage from "@/assets/team/team3.jpg";

const teamMembers = [
  {
    name: "Rajneesh Rana",
    role: "Founder, Product Design & AI",
    image: rajneeshImage,
    description: "Visionary driving the technical and aesthetic future of LXC.",
    socials: {
      linkedin: "https://www.linkedin.com/in/rajneeshrana0/",
      instagram: "https://www.instagram.com/rajneeshrana0/"
    }
  },
  {
    name: "Aryan",
    role: "Designated Partner & Director",
    image: aryanImage,
    description: "Strategic leader executing company vision and scaling operations.",
    socials: {
      linkedin: "https://www.linkedin.com/in/aryan-sharma-a27b3322a/",
      instagram: "https://www.instagram.com/sharmaaryan0191/"
    }
  },
  {
    name: "Vishal Sharma",
    role: "Chief Marketing Officer (CMO)",
    image: vishalImage,
    description: "Vishal is a marketing genius who has helped Lxc to grow.",
    socials: {
      linkedin: "https://www.linkedin.com/in/vishalsharma072/",
      instagram: "https://www.instagram.com/learnxchain0/"
    }
  },
  {
    name: "Rohit Kumar Indra ",
    role: "Chief Operating Officer (COO)",
    image: rohitImage,
    description: "Chief Operating Officer (COO).",
    socials: {
      linkedin: "hhttps://www.linkedin.com/in/rohit-kumar-0301s333/",
      instagram: "https://www.instagram.com/imrohit_03s/"
    }
  },
  {
    name: "Biky Dev",
    role: "Chief Technology Officer (CTO)",
    image: bikyImage,
    description: "Architect behind the LXC engine, ensuring robust infrastructure.",
    socials: {
      linkedin: "https://www.linkedin.com/in/dev-biky/",
      instagram: "https://www.instagram.com/dev.biky/"
    }
  },
  
];

// Interactive Card Component
function TeamCard({ member, index }: { member: any; index: number }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: MouseEvent<HTMLDivElement>) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay: index * 0.15, ease: [0.21, 0.47, 0.32, 0.98] }}
      onMouseMove={handleMouseMove}
      className="group relative h-full rounded-[2.5rem] bg-white dark:bg-[#0C1018] border border-gray-200 dark:border-white/10 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden"
    >
      {/* Dynamic Hover Spotlight */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(0, 87, 200, 0.15),
              transparent 80%
            )
          `,
        }}
      />

      <div className="relative p-6 sm:p-8 h-full flex flex-col z-10">
        {/* Profile Image & Background Glow */}
        <div className="relative w-full aspect-[4/5] rounded-[2rem] overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent z-10" />
          <Image
            src={member.image}
            alt={member.name}
            fill
            className="object-cover object-center filter group-hover:scale-105 transition-all duration-700 ease-in-out"
          />

          {/* Social Links Overlay */}
          <div className="absolute bottom-6 left-6 right-6 z-20 flex items-center justify-between">
            <div className="flex gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
              {member.socials.linkedin && (
                <a href={member.socials.linkedin} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-white/20 hover:bg-white/40 hover:scale-110 backdrop-blur-md text-white transition-all border border-white/20">
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {member.socials.instagram && (
                <a href={member.socials.instagram} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-white/20 hover:bg-white/40 hover:scale-110 backdrop-blur-md text-white transition-all border border-white/20">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
            </div>

            <a href={member.socials.linkedin || "#"} target={member.socials.linkedin ? "_blank" : "_self"} rel={member.socials.linkedin ? "noopener noreferrer" : ""} className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100 hover:bg-[#0057C8] hover:text-white ease-out">
              <ArrowUpRight className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Content */}
        <div className="mt-auto relative z-20">
          <h4 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#0057C8] group-hover:to-[#1A9FFF] dark:group-hover:from-[#1A9FFF] dark:group-hover:to-[#5CDD2B] transition-all duration-300">
            {member.name}
          </h4>
          <p className="text-sm font-bold text-[#0057C8] dark:text-[#1A9FFF] mb-4 uppercase tracking-widest">
            {member.role}
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            {member.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function AboutTeam() {
  return (
    <section className="relative py-32 bg-transparent overflow-hidden transition-colors duration-300">
      <div className="max-w-[90rem] mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-end gap-10 mb-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="h-px w-12 bg-[#0057C8]" />
              <span className="text-sm font-bold uppercase tracking-widest text-[#0057C8] dark:text-[#1A9FFF]">
                Leadership
              </span>
            </div>
            <h3 className="font-[var(--font-grotesk)] text-3xl md:text-5xl lg:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-[1.2] tracking-tight">
              The minds behind taking <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0057C8] via-[#1A9FFF] to-[#5CDD2B] dark:from-[#1A9FFF] dark:via-[#1A9FFF] dark:to-[#5CDD2B]">education to the next level.</span>
            </h3>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl font-light">
              We aren't just building software. We're forging a new paradigm for institutional intelligence in India.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <a href="/contact" className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gray-900 dark:bg-[#0057C8] text-white dark:text-white font-bold overflow-hidden transition-transform hover:scale-105 shadow-xl shadow-[#0057C8]/20">
              <div className="absolute inset-0 bg-gradient-to-r from-[#0057C8] to-[#1A9FFF] translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10 group-hover:text-white transition-colors duration-300">Join the Mission</span>
              <ArrowUpRight className="relative z-10 w-5 h-5 group-hover:text-white transition-colors duration-300" />
            </a>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member, i) => (
            <TeamCard key={i} member={member} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
