import { motion } from "framer-motion";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Ignite",
    subtitle: "For growing schools",
    highlight: false,
    gradient: "from-[#1A9FFF] to-[#55CFFF]",
    iconColor: "text-[#1A9FFF] dark:text-[#55CFFF]",
    lightBg: "bg-[#1A9FFF]/5 dark:bg-[#1A9FFF]/10",
    borderHover: "hover:border-[#1A9FFF]/20 dark:hover:border-[#1A9FFF]/30",
    features: [
      "Up to 300 students",
      "Academics & Attendance",
      "Fees & Parent App",
      "Basic AI Insights",
      "Email + WhatsApp Alerts",
    ],
  },
  {
    name: "Momentum",
    subtitle: "Most Popular",
    highlight: true,
    gradient: "from-[#0057C8] to-[#1A9FFF]",
    iconColor: "text-[#0057C8] dark:text-[#1A9FFF]",
    lightBg: "bg-[#0057C8]/5 dark:bg-[#0057C8]/10",
    borderHover: "hover:border-[#0057C8]/20 dark:hover:border-[#0057C8]/30",
    features: [
      "Up to 700 students",
      "Everything in Ignite",
      "Advanced AI Reports",
      "Teacher Performance Analytics",
      "Priority Support",
    ],
  },
  {
    name: "Zenith",
    subtitle: "Enterprise",
    highlight: false,
    isEnterprise: true,
    gradient: "from-[#FFC555] to-[#0057C8]",
    iconColor: "text-[#E6B044] dark:text-[#FFC555]",
    lightBg: "bg-[#FFC555]/5 dark:bg-[#FFC555]/10",
    borderHover: "hover:border-[#FFC555]/20 dark:hover:border-[#FFC555]/30",
    features: [
      "1000+ students",
      "Everything in Momentum",
      "White-label Solutions",
      "Custom Integrations",
      "Dedicated Account Manager",
      "24/7 Priority Support",
    ],
  },
];

export default function Pricing() {
  return (
    <section
      id="pricing"
      className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-[#0057C8]/5 dark:from-[#000000] dark:via-[#0D1B2A] dark:to-[#000000] py-24 sm:py-32"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[-200px] top-1/4 h-[500px] w-[500px] rounded-full bg-[#0057C8]/15 dark:bg-[#0057C8]/20 blur-[140px]"
        />
        <motion.div
          animate={{ x: [0, -45, 0], y: [0, -30, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-[-200px] bottom-1/3 h-[500px] w-[500px] rounded-full bg-[#1A9FFF]/12 dark:bg-[#1A9FFF]/18 blur-[140px]"
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
            <Sparkles
              size={14}
              className="text-[#0057C8] dark:text-[#1A9FFF]"
            />
            <span className="text-[#0057C8] dark:text-[#1A9FFF]">
              Transparent Pricing
            </span>
          </motion.div>

          <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
            Simple Pricing.
            <br />
            <span className="bg-gradient-to-r from-[#0057C8] via-[#1A9FFF] to-[#5CDD2B] dark:from-[#1A9FFF] dark:via-[#55CFFF] dark:to-[#5CDD2B] bg-clip-text text-transparent">
              Built for India.
            </span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            No hidden costs. No per-feature traps.{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              Investor-backed pricing model.
            </span>
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: i * 0.1,
                type: "spring",
                stiffness: 100,
              }}
              whileHover={{ y: -6 }}
              className={`group relative ${plan.highlight ? "lg:-mt-4 lg:mb-4" : ""}`}
            >
              {/* Popular Badge */}
              {plan.highlight && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10"
                >
                  <div className="rounded-full bg-gradient-to-r from-[#0057C8] to-[#1A9FFF] px-4 py-1.5 text-xs font-bold text-white shadow-xl shadow-[#0057C8]/30">
                    MOST POPULAR
                  </div>
                </motion.div>
              )}

              {/* Card */}
              <div
                className={`relative h-full rounded-2xl border ${plan.highlight
                    ? "border-[#0057C8]/40 dark:border-[#0057C8]/30 ring-1 ring-[#0057C8]/10"
                    : "border-gray-200/70 dark:border-white/[0.06]"
                  } bg-white/90 dark:bg-white/[0.03] backdrop-blur-xl p-7 transition-all duration-300 ${plan.borderHover} hover:shadow-xl hover:shadow-indigo-500/5 dark:hover:shadow-indigo-500/10`}
              >
                {/* Glow */}
                <div
                  className={`absolute -inset-px rounded-2xl bg-gradient-to-br ${plan.gradient} opacity-0 group-hover:opacity-[0.05] dark:group-hover:opacity-[0.1] transition-opacity duration-300`}
                />

                {/* Header */}
                <div className="relative mb-5">
                  <div className="flex items-center justify-between">
                    <h3
                      className={`text-2xl font-bold ${plan.iconColor}`}
                    >
                      {plan.name}
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                      {plan.subtitle}
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div className="relative mb-6 pb-6 border-b border-gray-100 dark:border-white/[0.04]">
                  <div className="text-3xl font-extrabold text-gray-900 dark:text-white">
                    Contact Us
                  </div>
                  <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                    Get a customized quote for your school
                  </p>
                </div>

                {/* Features */}
                <ul className="relative mb-7 space-y-3">
                  {plan.features.map((feature, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05 + 0.2 }}
                      className="flex items-center gap-3"
                    >
                      <div className="flex-shrink-0 rounded-full bg-[#5CDD2B]/10 dark:bg-[#5CDD2B]/15 p-0.5">
                        <Check className="h-3.5 w-3.5 text-[#4BBD22] dark:text-[#5CDD2B]" />
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </motion.li>
                  ))}
                </ul>

                {/* CTA Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative"
                >
                  <Link
                    href="/book-demo"
                    className={`flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold transition-all duration-300 ${plan.highlight
                        ? "bg-gradient-to-r from-[#0057C8] to-[#1A9FFF] text-white shadow-lg shadow-[#0057C8]/20 hover:shadow-xl hover:shadow-[#0057C8]/40"
                        : plan.isEnterprise
                          ? "bg-gradient-to-r from-[#FFC555] to-[#E6B044] text-white shadow-lg shadow-[#FFC555]/20 hover:shadow-xl hover:shadow-[#FFC555]/40"
                          : "bg-gray-900 dark:bg-white/10 text-white shadow-lg hover:shadow-xl hover:bg-gray-800 dark:hover:bg-white/15"
                      }`}
                  >
                    <span>
                      {plan.isEnterprise ? "Book Demo" : "Start Free Trial"}
                    </span>
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </Link>
                </motion.div>

                {/* Bottom line */}
                <motion.div
                  className={`absolute bottom-0 left-6 right-6 h-[2px] rounded-full bg-gradient-to-r ${plan.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Flexible plans tailored to your school&apos;s needs. No hidden
            costs.
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
            Need a custom plan?{" "}
            <Link
              href="/contact"
              className="text-[#0057C8] dark:text-[#1A9FFF] hover:underline font-semibold"
            >
              Contact us
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
