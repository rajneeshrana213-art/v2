import { motion } from "framer-motion";
import {
  School,
  Users,
  Shield,
  Layers,
  TrendingUp,
  Globe,
  Award,
  Clock,
} from "lucide-react";
import { useState, useEffect } from "react";

// Animated counter
function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    let current = 0;
    const step = value / 60;
    const timer = setInterval(() => {
      current += step;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value, started]);

  return (
    <motion.span
      onViewportEnter={() => setStarted(true)}
      viewport={{ once: true }}
    >
      {count.toLocaleString()}{suffix}
    </motion.span>
  );
}

const mainStats = [
  {
    value: 500,
    suffix: "+",
    label: "Schools Onboarded",
    subtext: "Across 12 states in India",
    icon: School,
    gradient: "from-[#0057C8] to-[#1A9FFF]",
    lightBg: "bg-[#0057C8]/5 dark:bg-[#0057C8]/10",
    iconColor: "text-[#0057C8] dark:text-[#1A9FFF]",
  },
  {
    value: 300,
    suffix: "K+",
    label: "Students Managed",
    subtext: "From KG to Class 12",
    icon: Users,
    gradient: "from-[#1A9FFF] to-[#0057C8]",
    lightBg: "bg-[#1A9FFF]/5 dark:bg-[#1A9FFF]/10",
    iconColor: "text-[#1A9FFF] dark:text-[#55CFFF]",
  },
  {
    value: 99,
    suffix: ".9%",
    label: "Uptime Guarantee",
    subtext: "Enterprise-grade reliability",
    icon: Shield,
    gradient: "from-[#5CDD2B] to-[#0057C8]",
    lightBg: "bg-[#5CDD2B]/5 dark:bg-[#5CDD2B]/10",
    iconColor: "text-[#4BBD22] dark:text-[#5CDD2B]",
  },
  {
    value: 28,
    suffix: "+",
    label: "Smart Modules",
    subtext: "AI-powered automation",
    icon: Layers,
    gradient: "from-[#0057C8] to-[#5CDD2B]",
    lightBg: "bg-[#0057C8]/5 dark:bg-[#0057C8]/10",
    iconColor: "text-[#0057C8] dark:text-[#1A9FFF]",
  },
];

const highlights = [
  { icon: Globe, text: "12+ Indian states covered" },
  { icon: Award, text: "ISO 27001 certified platform" },
  { icon: TrendingUp, text: "40% avg efficiency boost" },
  { icon: Clock, text: "24/7 dedicated support" },
];

export default function Stats() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-[#0057C8]/5 dark:from-[#000000] dark:via-[#0D1B2A] dark:to-[#000000] py-24 sm:py-28">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[-200px] top-1/3 h-[500px] w-[500px] rounded-full bg-[#0057C8]/15 dark:bg-[#0057C8]/20 blur-[140px]"
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, -30, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-[-200px] bottom-1/4 h-[500px] w-[500px] rounded-full bg-[#1A9FFF]/12 dark:bg-[#1A9FFF]/18 blur-[140px]"
        />
        <div
          className="absolute inset-0 opacity-[0.06] dark:opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 87, 200, 0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 87, 200, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 sm:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#0057C8]/20 dark:border-[#0057C8]/30 bg-white/80 dark:bg-white/5 backdrop-blur-xl px-5 py-2.5 text-sm font-semibold shadow-lg shadow-[#0057C8]/10"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[#0057C8] dark:text-[#1A9FFF]">
              Live Platform Metrics
            </span>
          </motion.div>

          <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
            Trusted by{" "}
            <span className="bg-gradient-to-r from-[#0057C8] via-[#1A9FFF] to-[#5CDD2B] dark:from-[#1A9FFF] dark:via-[#55CFFF] dark:to-[#5CDD2B] bg-clip-text text-transparent">
              Thousands
            </span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Real-time numbers from schools transforming education across India
            with{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              LearnXChain
            </span>
            .
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-12">
          {mainStats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: i * 0.1,
                  type: "spring",
                  stiffness: 100,
                }}
                whileHover={{ y: -6 }}
                className="group relative"
              >
                <div className="relative h-full rounded-2xl border border-gray-200/70 dark:border-white/[0.06] bg-white/90 dark:bg-white/[0.03] backdrop-blur-xl p-6 transition-all duration-300 hover:border-[#0057C8]/30 dark:hover:border-[#0057C8]/30 hover:shadow-xl hover:shadow-[#0057C8]/10 dark:hover:shadow-[#0057C8]/10">
                  {/* Glow */}
                  <div
                    className={`absolute -inset-px rounded-2xl bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-[0.06] dark:group-hover:opacity-[0.12] transition-opacity duration-300`}
                  />

                  {/* Icon + Label row */}
                  <div className="relative flex items-center gap-3 mb-4">
                    <div
                      className={`rounded-xl ${stat.lightBg} p-2.5 transition-transform duration-300 group-hover:scale-110`}
                    >
                      <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {stat.label}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        {stat.subtext}
                      </div>
                    </div>
                  </div>

                  {/* Value */}
                  <div className="relative">
                    <div
                      className={`text-4xl sm:text-5xl font-black bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
                    >
                      <AnimatedNumber
                        value={stat.value}
                        suffix={stat.suffix}
                      />
                    </div>

                    {/* Mini progress bar */}
                    <div className="mt-3 h-1 w-full rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "100%" }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + i * 0.15, duration: 1.2, ease: "easeOut" }}
                        className={`h-full rounded-full bg-gradient-to-r ${stat.gradient}`}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom highlights row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
        >
          {highlights.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
            >
              <item.icon
                size={15}
                className="text-[#0057C8] dark:text-[#1A9FFF]"
              />
              <span className="font-medium">{item.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
