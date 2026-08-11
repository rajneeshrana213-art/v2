"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Quote, Star, MessageSquare, ThumbsUp, School } from "lucide-react";
import Image from "next/image";

const testimonials = [
  {
    name: "R. Sharma",
    role: "School Director",
    location: "Rajasthan",
    quote:
      "LearnXChain brought transparency to our fees and clarity to academics. Parents trust us more now.",
    image:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=RSharma&backgroundColor=b6e3f4,c0aede,d1d4f9",
    rating: 5,
    school: "Delhi Public School",
  },
  {
    name: "S. Verma",
    role: "Principal",
    location: "Uttar Pradesh",
    quote:
      "This feels like a system built for Indian schools, not copied from abroad. The offline-first approach works perfectly in our area.",
    image:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=SVerma&backgroundColor=ffd5dc,ffdfbf,d1d4f9",
    rating: 5,
    school: "St. Mary's Academy",
  },
  {
    name: "A. Khan",
    role: "School Owner",
    location: "Maharashtra",
    quote:
      "AI reports helped us identify weak students early. This alone paid for the software. The ROI is incredible.",
    image:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=AKhan&backgroundColor=b6e3f4,ffd5dc,c0aede",
    rating: 5,
    school: "Bright Future School",
  },
  {
    name: "P. Patel",
    role: "Principal",
    location: "Gujarat",
    quote:
      "The blockchain transparency feature eliminated all fee disputes. Parents can see every transaction, and trust has increased significantly.",
    image:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=PPatel&backgroundColor=ffdfbf,d1d4f9,b6e3f4",
    rating: 5,
    school: "Gujarat International School",
  },
  {
    name: "K. Reddy",
    role: "School Director",
    location: "Telangana",
    quote:
      "From manual Excel sheets to AI-powered insights - the transformation has been remarkable. Our teachers love the automated reports.",
    image:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=KReddy&backgroundColor=c0aede,ffd5dc,ffdfbf",
    rating: 5,
    school: "Hyderabad Public School",
  },
];

const stats = [
  { label: "5.0", sublabel: "Average Rating", icon: Star },
  { label: "500+", sublabel: "Happy Schools", icon: School },
  { label: "98%", sublabel: "Satisfaction Rate", icon: ThumbsUp },
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-[#0057C8]/5 dark:from-[#000000] dark:via-[#0D1B2A] dark:to-[#000000] py-24 sm:py-32">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[-200px] top-1/4 h-[500px] w-[500px] rounded-full bg-[#0057C8]/15 dark:bg-[#0057C8]/20 blur-[140px]"
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, -30, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
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

      <div className="relative mx-auto max-w-6xl px-6 sm:px-8">
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
            <MessageSquare
              size={14}
              className="text-[#0057C8] dark:text-[#1A9FFF]"
            />
            <span className="text-[#0057C8] dark:text-[#1A9FFF]">
              What Schools Say
            </span>
          </motion.div>

          <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
            Trusted by Real Schools.
            <br />
            <span className="bg-gradient-to-r from-[#0057C8] via-[#1A9FFF] to-[#5CDD2B] dark:from-[#1A9FFF] dark:via-[#55CFFF] dark:to-[#5CDD2B] bg-clip-text text-transparent">
              Real Results.
            </span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            See what school leaders across India are saying about{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              LearnXChain
            </span>
          </p>
        </motion.div>

        {/* Testimonial Card */}
        <div className="relative mx-auto max-w-3xl">
          <div className="relative rounded-2xl border border-gray-200/70 dark:border-white/[0.06] bg-white/90 dark:bg-white/[0.03] backdrop-blur-xl p-8 sm:p-10 shadow-xl shadow-indigo-500/5 min-h-[340px] sm:min-h-[320px] flex items-center">
            {/* Glow */}
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-[#0057C8] to-[#1A9FFF] opacity-[0.03] dark:opacity-[0.06]" />

            {/* Quote Icon */}
            <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
              <div className="rounded-xl bg-[#0057C8]/5 dark:bg-[#0057C8]/10 p-3">
                <Quote className="h-5 w-5 text-[#0057C8] dark:text-[#1A9FFF]" />
              </div>
            </div>

            {/* Content — crossfade like the app screenshots */}
            <div className="relative w-full">
              {testimonials.map((t, i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: i === currentIndex ? 1 : 0 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="absolute inset-0 flex flex-col items-center justify-center text-center gap-6"
                  style={{
                    zIndex: i === currentIndex ? 1 : 0,
                    pointerEvents: i === currentIndex ? "auto" : "none",
                  }}
                >
                  {/* Stars */}
                  <div className="flex gap-0.5">
                    {[...Array(t.rating)].map((_, j) => (
                      <Star
                        key={j}
                        className="h-4 w-4 fill-[#FFC555] text-[#FFC555]"
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-lg sm:text-xl font-medium leading-relaxed text-gray-800 dark:text-gray-200 max-w-2xl">
                    &ldquo;{t.quote}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-[#0057C8]/20 dark:border-[#0057C8]/30">
                      <Image
                        src={t.image}
                        alt={t.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {t.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t.role} • {t.school}, {t.location}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Progress dots */}
          <div className="mt-8 flex justify-center gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className="group"
                aria-label={`Go to testimonial ${index + 1}`}
              >
                <div
                  className={`h-1.5 rounded-full transition-all duration-400 ${index === currentIndex
                      ? "w-8 bg-gradient-to-r from-[#0057C8] to-[#1A9FFF] dark:from-[#1A9FFF] dark:to-[#55CFFF]"
                      : "w-1.5 bg-gray-300 dark:bg-gray-600 group-hover:bg-gray-400 dark:group-hover:bg-gray-500"
                    }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-3"
        >
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + i * 0.1 }}
                whileHover={{ y: -4 }}
                className="group rounded-2xl border border-gray-200/70 dark:border-white/[0.06] bg-white/90 dark:bg-white/[0.03] backdrop-blur-xl p-6 text-center transition-all duration-300 hover:border-[#0057C8]/30 dark:hover:border-[#0057C8]/20 hover:shadow-lg hover:shadow-[#0057C8]/5"
              >
                <div className="inline-flex rounded-xl bg-[#0057C8]/5 dark:bg-[#0057C8]/10 p-2.5 mb-3">
                  <Icon className="h-5 w-5 text-[#0057C8] dark:text-[#1A9FFF]" />
                </div>
                <div className="text-3xl font-extrabold bg-gradient-to-r from-[#0057C8] to-[#1A9FFF] dark:from-[#1A9FFF] dark:to-[#55CFFF] bg-clip-text text-transparent">
                  {stat.label}
                </div>
                <div className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {stat.sublabel}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
