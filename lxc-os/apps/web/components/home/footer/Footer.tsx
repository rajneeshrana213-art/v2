import Link from "next/link";
import { motion } from "framer-motion";
import {
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";

const footerLinks = {
  product: [
    { label: "Academics", href: "/product#academics" },
    { label: "RIT AI", href: "https://chat.learnxchain.com" },
    { label: "Blockchain", href: "/product#blockchain" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Modules", href: "/product#modules" },
    { label: "Book Demo", href: "/book-demo" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Solutions", href: "/solutions" },
    { label: "Our Services", href: "/services" },
    { label: "Projects", href: "/projects" },
    { label: "Resources", href: "/resources" },
    { label: "Contact", href: "/contact" },
    { label: "Careers", href: "/careers" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "Account Deletion", href: "/profile" },
    { label: "Sitemap", href: "/sitemap" },
  ],
};

const socialLinks = [
  {
    icon: Twitter,
    href: "https://twitter.com/learnxchain",
    label: "Twitter",
  },
  {
    icon: Linkedin,
    href: "https://linkedin.com/company/learnxchain",
    label: "LinkedIn",
  },
  {
    icon: Facebook,
    href: "https://facebook.com/learnxchain",
    label: "Facebook",
  },
  {
    icon: Instagram,
    href: "https://instagram.com/learnxchain",
    label: "Instagram",
  },
  {
    icon: Youtube,
    href: "https://youtube.com/@learnxchain",
    label: "YouTube",
  },
];

export default function Footer({ simplified = false }: { simplified?: boolean }) {
  return (
    <footer className="relative overflow-hidden border-t border-gray-200/40 dark:border-white/[0.06] bg-gradient-to-br from-gray-50 via-white to-[#0057C8]/5 dark:from-[#000000] dark:via-[#0D1B2A] dark:to-[#000000]">
      {/* Animated Background */}
      {!simplified && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ x: [0, 40, 0], y: [0, 25, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-[-150px] top-0 h-[400px] w-[400px] rounded-full bg-[#0057C8]/10 dark:bg-[#0057C8]/15 blur-[140px]"
          />
          <motion.div
            animate={{ x: [0, -35, 0], y: [0, -20, 0], scale: [1, 1.12, 1] }}
            transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-[-150px] bottom-0 h-[400px] w-[400px] rounded-full bg-[#1A9FFF]/8 dark:bg-[#1A9FFF]/12 blur-[140px]"
          />
          <div
            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0, 87, 200, 0.15) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 87, 200, 0.15) 1px, transparent 1px)
              `,
              backgroundSize: "48px 48px",
            }}
          />
        </div>
      )}

      <div className="relative mx-auto max-w-7xl px-6 sm:px-8 py-16 sm:py-20">
        {/* Main Footer Content */}
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5 group mb-6">
              <div className="relative h-10 w-10 flex-shrink-0">
                <Image
                  src="/logo.png"
                  alt="LearnXChain Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                Learn
                <span className="text-[#5CDD2B]">X</span>
                Chain
              </span>
            </Link>

            <p className="mb-6 text-sm text-gray-600 dark:text-gray-400 max-w-md leading-relaxed">
              India&apos;s Intelligent School Operating System. Transforming
              education with{" "}
              <span className="font-semibold text-[#0057C8] dark:text-[#1A9FFF]">
                RIT AI
              </span>{" "}
              and{" "}
              <span className="font-semibold text-[#5CDD2B] dark:text-[#5CDD2B]">
                Blockchain
              </span>{" "}
              technology.
            </p>

            {/* Social Links */}
            <div className="flex gap-2 mb-8">
              {socialLinks.map((social, i) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={i}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="rounded-lg border border-gray-200/40 dark:border-white/[0.06] bg-white/60 dark:bg-white/[0.03] p-2.5 text-gray-500 dark:text-gray-400 hover:text-[#0057C8] dark:hover:text-[#1A9FFF] hover:border-[#0057C8]/20 dark:hover:border-[#0057C8]/30 transition-all duration-200"
                    aria-label={social.label}
                  >
                    <Icon className="h-4 w-4" />
                  </motion.a>
                );
              })}
            </div>

            {/* Newsletter */}
            <div>
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
                Stay Updated
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 rounded-lg border border-gray-200/40 dark:border-white/[0.06] bg-white/60 dark:bg-white/[0.03] px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0057C8]/30 dark:focus:ring-[#0057C8]/30 transition-all"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-lg bg-gradient-to-r from-[#0057C8] to-[#1A9FFF] px-4 py-2.5 text-white shadow-md shadow-[#0057C8]/15 hover:shadow-lg hover:shadow-[#0057C8]/25 transition-all"
                >
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="mb-5 text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              Product
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.product.map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.href}
                    target={link.label === "RIT AI" ? "_blank" : undefined}
                    rel={link.label === "RIT AI" ? "noopener noreferrer" : undefined}
                    className="group flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-[#0057C8] dark:hover:text-[#1A9FFF] transition-colors duration-200"
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="mb-5 text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              Company
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-[#0057C8] dark:hover:text-[#1A9FFF] transition-colors duration-200"
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Legal */}
          <div>
            <h4 className="mb-5 text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              Contact
            </h4>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#0057C8] dark:text-[#1A9FFF]" />
                <span className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  48 and 49 Common Light East, Guru Angad Nagar, Laxmi Nagar,
                  New Delhi, Delhi, India, 110092
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 flex-shrink-0 text-[#0057C8] dark:text-[#1A9FFF]" />
                <a
                  href="mailto:contact@learnxchain.com"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#0057C8] dark:hover:text-[#1A9FFF] transition-colors duration-200"
                >
                  contact@learnxchain.com
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 flex-shrink-0 text-[#0057C8] dark:text-[#1A9FFF]" />
                <a
                  href="tel:+917015290569"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#0057C8] dark:hover:text-[#1A9FFF] transition-colors duration-200"
                >
                  +91 7015290569
                </a>
              </li>
            </ul>

            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              Legal
            </h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.href}
                    className="text-xs text-gray-500 dark:text-gray-500 hover:text-[#0057C8] dark:hover:text-[#1A9FFF] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200/40 dark:border-white/[0.06] pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © <span suppressHydrationWarning>{new Date().getFullYear()}</span> LearnXChain Technologies Pvt. Ltd.  
            </p>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
              {/* <span>Made with</span>
              <span className="text-red-500">❤️</span>
              <span>for Indian Schools</span> */}
              <span>All rights reserved. Version 1.0.5</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
