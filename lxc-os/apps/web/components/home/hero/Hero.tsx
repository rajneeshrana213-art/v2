import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, Brain, GraduationCap, Users, TrendingUp, Shield, BookOpen, Bell, BarChart3, CheckCircle2, Zap } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useState, useEffect } from "react";

// Animated counter hook
function useCounter(end: number, duration: number = 2000, delay: number = 0) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      let start = 0;
      const step = end / (duration / 16);
      const timer = setInterval(() => {
        start += step;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }, delay);
    return () => clearTimeout(timeout);
  }, [end, duration, delay]);
  return count;
}

// Live notification data
const notifications = [
  { icon: "📊", text: "Rit AI detected 12 students at-risk in Class 9A", time: "Just now", color: "text-[#FFC555]" },
  { icon: "✅", text: "Fee collection 94% complete for March", time: "2 min ago", color: "text-[#5CDD2B]" },
  { icon: "🧠", text: "Smart timetable optimized for 8 sections", time: "5 min ago", color: "text-[#0057C8]" },
  { icon: "🔗", text: "3 certificates verified on blockchain", time: "8 min ago", color: "text-[#1A9FFF]" },
  { icon: "📈", text: "Attendance improved 12% this month", time: "15 min ago", color: "text-[#55CFFF]" },
];

export default function Hero() {
  const { theme } = useTheme();
  const [activeNotification, setActiveNotification] = useState(0);
  const students = useCounter(250, 2000, 600);
  const schools = useCounter(500, 2000, 800);
  const attendance = useCounter(97, 1500, 1000);

  // Cycle through notifications
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveNotification((prev) => (prev + 1) % notifications.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-gray-50 via-white to-[#0057C8]/5 dark:from-[#000000] dark:via-[#0D1B2A] dark:to-[#0057C8]/10">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating orbs */}
        <motion.div
          animate={{ x: [0, 60, 0], y: [0, 40, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[-200px] top-1/3 h-[500px] w-[500px] rounded-full bg-[#0057C8]/15 dark:bg-[#0057C8]/20 blur-[140px]"
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, -40, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-[-180px] top-1/2 h-[500px] w-[500px] rounded-full bg-[#1A9FFF]/12 dark:bg-[#1A9FFF]/18 blur-[140px]"
        />
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-1/2 bottom-0 h-[400px] w-[600px] rounded-full bg-[#5CDD2B]/8 dark:bg-[#5CDD2B]/12 blur-[120px]"
        />

        {/* Grid overlay */}
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

        {/* Animated connection lines */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.08] dark:opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <motion.line
            x1="15%" y1="20%" x2="45%" y2="60%"
            stroke="url(#lineGrad)" strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: [0, 1, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.line
            x1="85%" y1="25%" x2="55%" y2="65%"
            stroke="url(#lineGrad)" strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: [0, 1, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0057C8" />
              <stop offset="100%" stopColor="#1A9FFF" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative mx-auto flex max-w-7xl flex-col px-6 pt-28 pb-16 sm:pt-32 lg:pt-36 lg:pb-24 z-10">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.2fr),minmax(0,1fr)]">

          {/* Left: Copy */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#0057C8]/20 dark:border-[#0057C8]/30 bg-white/80 dark:bg-white/5 backdrop-blur-xl px-5 py-2.5 text-sm font-semibold shadow-lg shadow-[#0057C8]/10"
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles size={16} className="text-[#0057C8] dark:text-[#1A9FFF]" />
              </motion.div>
              <span className="bg-gradient-to-r from-[#0057C8] to-[#1A9FFF] dark:from-[#1A9FFF] dark:to-[#55CFFF] bg-clip-text text-transparent">
                India&apos;s #1{" "}
                <Link 
                  href="https://chat.learnxchain.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                >
                  Rit AI
                </Link>{" "}
                School Operating System
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
              className="text-[3.2rem] leading-[1.1] font-bold tracking-tight sm:text-6xl lg:text-7xl"
            >
              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
                Your School,{" "}
              </span>
              <br />
              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
                Powered by{" "}
              </span>
              <motion.span
                className="relative inline-block"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
              >
                <Link 
                  href="https://chat.learnxchain.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="cursor-pointer group/rit"
                >
                  <span className="bg-gradient-to-r from-[#0057C8] via-[#1A9FFF] to-[#5CDD2B] dark:from-[#1A9FFF] dark:via-[#55CFFF] dark:to-[#5CDD2B] bg-clip-text text-transparent group-hover/rit:opacity-80 transition-opacity">
                    RIT AI
                  </span>
                </Link>
                <motion.div
                  className="absolute -bottom-1 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-[#0057C8] via-[#1A9FFF] to-[#5CDD2B]"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  style={{ transformOrigin: "left" }}
                />
              </motion.span>
            </motion.h1>

            {/* Feature pills row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 flex flex-wrap gap-2 justify-center lg:justify-start"
            >
              {[
                { icon: Brain, label: "Smart Analytics", color: "text-[#0057C8] dark:text-[#1A9FFF] bg-[#0057C8]/5 dark:bg-[#0057C8]/10 border-[#0057C8]/20 dark:border-[#0057C8]/20" },
                { icon: Shield, label: "Blockchain Trust", color: "text-[#5CDD2B] dark:text-[#5CDD2B] bg-[#5CDD2B]/5 dark:bg-[#5CDD2B]/10 border-[#5CDD2B]/20 dark:border-[#5CDD2B]/20" },
                { icon: Zap, label: "Auto Workflows", color: "text-[#1A9FFF] dark:text-[#55CFFF] bg-[#1A9FFF]/5 dark:bg-[#1A9FFF]/10 border-[#1A9FFF]/20 dark:border-[#1A9FFF]/20" },
              ].map((pill, i) => (
                <motion.div
                  key={pill.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-sm ${pill.color}`}
                >
                  <pill.icon size={13} />
                  {pill.label}
                </motion.div>
              ))}
            </motion.div>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 max-w-xl text-lg text-gray-600 dark:text-gray-300 leading-relaxed"
            >
              From{" "}
              <span className="font-semibold text-gray-900 dark:text-white">admissions to analytics</span>,{" "}
              <span className="font-semibold text-gray-900 dark:text-white">fees to attendance</span> — manage
              everything with Rit AI intelligence and blockchain transparency. Built for{" "}
              <span className="text-[#0057C8] dark:text-[#1A9FFF] font-semibold">India&apos;s schools</span>.
            </motion.p>

            {/* Live stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8 flex items-center gap-6 justify-center lg:justify-start"
            >
              {[
                { value: `${schools}+`, label: "Schools", icon: GraduationCap },
                { value: `${students}K+`, label: "Students", icon: Users },
                { value: `${attendance}%`, label: "Uptime", icon: TrendingUp },
              ].map((stat, i) => (
                <div key={stat.label} className="text-center lg:text-left">
                  <div className="flex items-center gap-1.5 justify-center lg:justify-start">
                    <stat.icon size={16} className="text-[#0057C8] dark:text-[#1A9FFF]" />
                    <span className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-[#0057C8] to-[#1A9FFF] dark:from-[#1A9FFF] dark:to-[#55CFFF] bg-clip-text text-transparent">
                      {stat.value}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{stat.label}</span>
                </div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center lg:justify-start"
            >
              <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }} className="relative">
                <motion.div
                  className="absolute inset-0 rounded-xl bg-[#0057C8]/60 blur-xl opacity-50"
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <Link
                  href="/book-demo"
                  className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#0057C8] to-[#1A9FFF] px-7 py-3.5 text-base font-semibold text-white shadow-xl shadow-[#0057C8]/30 transition-all hover:shadow-2xl hover:shadow-[#0057C8]/50"
                >
                  <span className="relative z-10">Book a 20-min Demo</span>
                  <ArrowRight size={18} className="relative z-10 transition-transform group-hover:translate-x-1" />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[#004BB0] to-[#1589E0]"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/product"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200/60 dark:border-white/15 bg-white/80 dark:bg-white/5 backdrop-blur-xl px-7 py-3.5 text-base font-semibold text-gray-800 dark:text-gray-100 transition-all hover:bg-white dark:hover:bg-white/10 shadow-sm"
                >
                  <span>Explore Platform</span>
                  <ArrowRight size={16} className="opacity-50 group-hover:opacity-100 transition-opacity group-hover:translate-x-0.5" />
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Right: Live Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 50, rotateY: -5 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 80 }}
            className="relative hidden lg:block"
            style={{ perspective: "1200px" }}
          >
            {/* Main Dashboard Card */}
            <div className="relative rounded-3xl border border-gray-200/60 dark:border-white/10 bg-white/95 dark:bg-[#0C1018]/95 backdrop-blur-2xl shadow-2xl shadow-indigo-500/10 overflow-hidden">
              {/* Dashboard Header */}
              <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    LearnXChain Dashboard
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Live</span>
                </div>
              </div>

              {/* Dashboard Body */}
              <div className="p-5 space-y-4">
                {/* Metrics Row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Today's Attendance", value: "97.2%", change: "+4.1%", icon: Users, color: "from-[#0057C8] to-[#1A9FFF]", iconColor: "text-[#0057C8]" },
                    { label: "Fee Collection", value: "₹8.4L", change: "+12%", icon: BarChart3, color: "from-[#5CDD2B] to-[#1A9FFF]", iconColor: "text-[#5CDD2B]" },
                    { label: "AI Score", value: "94/100", change: "Excellent", icon: Brain, color: "from-[#1A9FFF] to-[#55CFFF]", iconColor: "text-[#1A9FFF]" },
                  ].map((metric, i) => (
                    <motion.div
                      key={metric.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + i * 0.15 }}
                      className="rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/80 dark:bg-white/[0.03] p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{metric.label}</span>
                        <metric.icon size={14} className={metric.iconColor} />
                      </div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">{metric.value}</div>
                      <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">{metric.change}</div>
                    </motion.div>
                  ))}
                </div>

                {/* AI Insights Panel */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="rounded-2xl border border-[#0057C8]/15 dark:border-[#0057C8]/15 bg-gradient-to-r from-[#0057C8]/5 via-[#1A9FFF]/5 to-[#0057C8]/5 dark:from-[#0057C8]/10 dark:via-[#1A9FFF]/5 dark:to-[#0057C8]/10 p-4"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 rounded-lg bg-[#0057C8]/10 dark:bg-[#0057C8]/20">
                      <Brain size={14} className="text-[#0057C8] dark:text-[#1A9FFF]" />
                    </div>
                    <span className="text-xs font-bold text-[#0057C8] dark:text-[#1A9FFF] uppercase tracking-wider">RIT AI Insights</span>
                    <motion.div
                      className="ml-auto px-2 py-0.5 rounded-full bg-[#0057C8]/10 dark:bg-[#0057C8]/20 text-[10px] font-bold text-[#0057C8] dark:text-[#1A9FFF]"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      LIVE
                    </motion.div>
                  </div>

                  {/* Notification Feed */}
                  <div className="space-y-2">
                    {notifications.slice(0, 3).map((notif, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{
                          opacity: activeNotification === i ? 1 : 0.5,
                          x: 0,
                          scale: activeNotification === i ? 1 : 0.98,
                        }}
                        transition={{ duration: 0.3 }}
                        className={`flex items-start gap-2 p-2 rounded-xl transition-all ${activeNotification === i ? "bg-white/80 dark:bg-white/5 shadow-sm" : ""}`}
                      >
                        <span className="text-sm mt-0.5">{notif.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{notif.text}</p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500">{notif.time}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Bottom Modules Row */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { icon: BookOpen, label: "Academics", color: "text-[#0057C8] dark:text-[#1A9FFF] bg-[#0057C8]/5 dark:bg-[#0057C8]/10" },
                    { icon: Users, label: "Students", color: "text-[#1A9FFF] dark:text-[#55CFFF] bg-[#1A9FFF]/5 dark:bg-[#1A9FFF]/10" },
                    { icon: Bell, label: "Notices", color: "text-[#FFC555] dark:text-[#FFC555] bg-[#FFC555]/5 dark:bg-[#FFC555]/10" },
                    { icon: Shield, label: "Blockchain", color: "text-[#5CDD2B] dark:text-[#5CDD2B] bg-[#5CDD2B]/5 dark:bg-[#5CDD2B]/10" },
                  ].map((mod, i) => (
                    <motion.div
                      key={mod.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.4 + i * 0.1 }}
                      className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl ${mod.color} cursor-default`}
                    >
                      <mod.icon size={16} />
                      <span className="text-[10px] font-semibold">{mod.label}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating Badge - Blockchain Verified */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 1.6, type: "spring" }}
              className="absolute -bottom-4 -left-6 z-20"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-[#0C1018] border border-[#5CDD2B]/30 dark:border-[#5CDD2B]/20 shadow-xl shadow-[#5CDD2B]/10 backdrop-blur-xl"
              >
                <CheckCircle2 size={16} className="text-[#5CDD2B]" />
                <div>
                  <p className="text-[10px] font-bold text-[#4BBD22] dark:text-[#5CDD2B] uppercase tracking-wider">Blockchain Verified</p>
                  <p className="text-[9px] text-gray-500 dark:text-gray-400">All records tamper-proof</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Floating Badge - AI Active */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 1.8, type: "spring" }}
              className="absolute -top-3 -right-4 z-20"
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-[#0C1018] border border-[#0057C8]/20 dark:border-[#0057C8]/20 shadow-xl shadow-[#0057C8]/10 backdrop-blur-xl"
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <Brain size={16} className="text-[#0057C8] dark:text-[#1A9FFF]" />
                </motion.div>
                <div>
                  <p className="text-[10px] font-bold text-[#0057C8] dark:text-[#1A9FFF] uppercase tracking-wider">RIT AI Active</p>
                  <p className="text-[9px] text-gray-500 dark:text-gray-400">22 modules running</p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
