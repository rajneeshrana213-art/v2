import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react";

const clients = [
  {
    name: "TechEdu India",
    industry: "EdTech",
    logo: "🎓",
    color: "from-[#0057C8] to-[#1A9FFF]",
    desc: "AI-powered learning management system",
  },
  {
    name: "FinVault",
    industry: "FinTech",
    logo: "💳",
    color: "from-[#5CDD2B] to-[#4BBD22]",
    desc: "Blockchain payment gateway",
  },
  {
    name: "MediSync",
    industry: "HealthTech",
    logo: "🏥",
    color: "from-[#1A9FFF] to-[#0057C8]",
    desc: "Healthcare data platform",
  },
  {
    name: "AgroChain",
    industry: "AgriTech",
    logo: "🌾",
    color: "from-[#FFC555] to-[#FF8C00]",
    desc: "Farm-to-fork traceability system",
  },
  {
    name: "RetailNext",
    industry: "Retail",
    logo: "🛒",
    color: "from-[#0057C8] to-[#1A9FFF]",
    desc: "Omnichannel retail platform",
  },
  {
    name: "LogiTrack",
    industry: "Logistics",
    logo: "🚚",
    color: "from-[#1A9FFF] to-[#5CDD2B]",
    desc: "AI-driven supply chain optimizer",
  },
  {
    name: "EduMasters",
    industry: "Education",
    logo: "📚",
    color: "from-[#0057C8] to-[#1A9FFF]",
    desc: "Online skill platform",
  },
  {
    name: "PropTech360",
    industry: "Real Estate",
    logo: "🏠",
    color: "from-[#FFC555] to-[#0057C8]",
    desc: "Smart property marketplace",
  },
];

const testimonials = [
  {
    quote:
      "LearnXChain transformed our entire tech stack within 3 months. The AI integration they built outperformed every expectation we had. Their team is exceptional — fast, communicative, and deeply technical.",
    author: "Rohit Sharma",
    role: "CTO, TechEdu India",
    avatar: "RS",
    rating: 5,
    tag: "AI Development",
  },
  {
    quote:
      "Their blockchain team delivered a DeFi protocol that processes $2M+ monthly. Exceptional quality, on time, every time. They handled every challenge with professionalism and creativity.",
    author: "Priya Mehta",
    role: "Founder, FinVault",
    avatar: "PM",
    rating: 5,
    tag: "Blockchain",
  },
  {
    quote:
      "The UI/UX design they created for our app boosted our user retention by 45%. They truly understand both design and business — a rare combination in a development team.",
    author: "Arjun Kapoor",
    role: "Product Lead, RetailNext",
    avatar: "AK",
    rating: 5,
    tag: "UI/UX Design",
  },
  {
    quote:
      "We went from zero to a fully deployed healthcare app in just 10 weeks with React Native. The quality was production-grade from day one. Highly recommended for any mobile project.",
    author: "Dr. Anita Verma",
    role: "CEO, MediSync",
    avatar: "AV",
    rating: 5,
    tag: "App Development",
  },
  {
    quote:
      "Our e-commerce platform now handles 50K+ orders per month with zero downtime. The architecture they designed has scaled beyond what we imagined. Outstanding work.",
    author: "Suresh Nair",
    role: "COO, PropTech360",
    avatar: "SN",
    rating: 5,
    tag: "Web Development",
  },
  {
    quote:
      "The digital marketing campaigns tripled our qualified leads in 2 months. Their data-driven approach and creative strategy made a massive difference to our bottom line.",
    author: "Kavya Reddy",
    role: "Marketing Head, LogiTrack",
    avatar: "KR",
    rating: 5,
    tag: "Digital Marketing",
  },
];

export default function OurClients() {
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % testimonials.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, next]);

  // Handle responsive visible indices
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // Check on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getVisibleIndices = () => {
    const len = testimonials.length;
    if (isMobile) {
      // On mobile, only show the current active card
      return [current];
    }
    // On md and above, show 3 cards (prev, current, next)
    return [
      (current - 1 + len) % len,
      current,
      (current + 1) % len,
    ];
  };

  const visibleIndices = getVisibleIndices();

  return (
    <section className="relative py-24 overflow-hidden bg-transparent">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 text-sm font-bold uppercase tracking-widest text-[#1A9FFF] dark:text-[#1A9FFF] bg-[#1A9FFF]/5 dark:bg-[#1A9FFF]/10 rounded-full border border-[#1A9FFF]/20 dark:border-[#1A9FFF]/30 mb-4">
            Our Clients
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4">
            Trusted by{" "}
            <span className="bg-gradient-to-r from-[#1A9FFF] to-[#5CDD2B] dark:from-[#1A9FFF] dark:to-[#5CDD2B] bg-clip-text text-transparent">
              Innovators
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            We partner with forward-thinking companies across industries to build their digital future.
          </p>
        </motion.div>

        {/* Client Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-20">
          {clients.map((client, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="relative group flex flex-col items-center gap-3 rounded-2xl border border-gray-200/60 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-sm p-5 text-center hover:border-indigo-300/60 dark:hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${client.color} flex items-center justify-center text-2xl shadow-lg`}>
                {client.logo}
              </div>
              <div>
                <div className="font-bold text-sm text-gray-900 dark:text-white">{client.name}</div>
                <div className="text-sm text-[#0057C8] dark:text-[#1A9FFF] font-medium">{client.industry}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{client.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ─── Testimonials Slider ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">What Our Clients Say</h3>
        </motion.div>

        <div
          className="relative"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Slider Viewport */}
          <div className="overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {visibleIndices.map((idx, position) => {
                const t = testimonials[idx];
                const isCenter = position === 1;
                return (
                  <motion.div
                    key={`${idx}-${current}`}
                    initial={{ opacity: 0, y: 20, scale: 0.97 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: isCenter ? 1.02 : 0.97,
                    }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className={`relative rounded-2xl border bg-white/80 dark:bg-white/5 backdrop-blur-sm p-7 transition-all duration-300 ${isCenter
                      ? "border-[#0057C8]/30 dark:border-[#0057C8]/40 shadow-xl shadow-[#0057C8]/10 dark:shadow-[#0057C8]/15"
                      : "border-gray-200/60 dark:border-white/10 opacity-70"
                      }`}
                  >
                    {/* Tag */}
                    <span className="inline-block px-2.5 py-1 text-sm font-semibold rounded-full bg-[#0057C8]/5 dark:bg-[#0057C8]/20 text-[#0057C8] dark:text-[#1A9FFF] border border-[#0057C8]/20 dark:border-[#0057C8]/30 mb-4">
                      {t.tag}
                    </span>

                    <Quote className="w-8 h-8 text-[#0057C8]/30 dark:text-[#1A9FFF]/20 mb-3" />

                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 italic text-sm">
                      "{t.quote}"
                    </p>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0057C8] to-[#1A9FFF] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {t.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-gray-900 dark:text-white">{t.author}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{t.role}</div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Nav Buttons */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={prev}
              className="w-11 h-11 rounded-full border border-gray-200/70 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-sm flex items-center justify-center text-gray-600 dark:text-gray-300 hover:border-indigo-400 dark:hover:border-indigo-500/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`rounded-full transition-all duration-300 ${i === current
                    ? "w-7 h-2.5 bg-gradient-to-r from-[#0057C8] to-[#1A9FFF]"
                    : "w-2.5 h-2.5 bg-gray-300 dark:bg-white/20 hover:bg-gray-400 dark:hover:bg-white/40"
                    }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={next}
              className="w-11 h-11 rounded-full border border-gray-200/70 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-sm flex items-center justify-center text-gray-600 dark:text-gray-300 hover:border-indigo-400 dark:hover:border-indigo-500/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Progress bar */}
          <div className="flex justify-center mt-4">
            <div className="w-48 h-1 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#0057C8] to-[#1A9FFF] rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${((current + 1) / testimonials.length) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
