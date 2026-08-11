'use client';

import Link from 'next/link';

export function LandingFooter() {
  const socialLinks = {
    instagram: 'https://instagram.com/learnxchain0/',
    linkedin: 'https://www.linkedin.com/company/learnxchain/?viewAsMember=true',
    x: 'https://x.com/academicspro0',
    youtube: 'https://www.youtube.com/@learnxchain',
  };

  return (
    <footer className="bg-slate-100 dark:bg-[#050d17] border-t border-slate-200 dark:border-white/10 w-full relative z-10">
      {/* Main footer row */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-6 flex flex-col lg:flex-row items-center justify-between gap-6">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <img
            src="/logo.svg"
            className="w-8 h-8 shrink-0 opacity-90 group-hover:opacity-100 transition-opacity"
            alt="RIT AI Logo"
          />
          <span className="text-base font-black tracking-tight text-slate-800 dark:text-white/85 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
            RIT <span className="bg-linear-to-r from-[#0057C8] to-[#5CDD2B] bg-clip-text text-transparent">AI</span>
          </span>
        </Link>

        {/* Nav Links */}
        <nav className="flex flex-wrap items-center justify-center gap-1 text-[13px] text-slate-500 dark:text-white/50 font-semibold select-none">
          {[
            { label: 'About', href: '/about' },
            { label: 'Contact us', href: '/contact' },
            { label: 'Pricing', href: '/pricing' },
            { label: 'Privacy Policy', href: '/privacy-policy' },
            { label: 'Terms and Conditions', href: '/terms' },
            { label: 'Cancellation and Refund Policy', href: '/refund-policy' },
          ].map((link, i, arr) => (
            <span key={link.label} className="flex items-center">
              <Link
                href={link.href}
                className="px-3 py-1 hover:text-[#0057C8] dark:hover:text-[#1A9FFF] transition-colors duration-200"
              >
                {link.label}
              </Link>
              {i < arr.length - 1 && (
                <span className="text-slate-300 dark:text-white/15 select-none font-light">|</span>
              )}
            </span>
          ))}
        </nav>

        {/* Social Icons */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Instagram */}
          <a
            href={socialLinks.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-[#0c1824] hover:bg-[#0057C8]/10 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 hover:border-[#0057C8]/30 dark:hover:border-white/20 text-slate-500 dark:text-white/50 hover:text-[#0057C8] dark:hover:text-white transition-all duration-200 shadow-xs"
          >
            <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>

          {/* X / Twitter */}
          <a
            href={socialLinks.x}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X (Twitter)"
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-[#0c1824] hover:bg-[#0057C8]/10 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 hover:border-[#0057C8]/30 dark:hover:border-white/20 text-slate-500 dark:text-white/50 hover:text-[#0057C8] dark:hover:text-white transition-all duration-200 shadow-xs"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.258 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
            </svg>
          </a>

          {/* LinkedIn */}
          <a
            href={socialLinks.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-[#0c1824] hover:bg-[#0057C8]/10 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 hover:border-[#0057C8]/30 dark:hover:border-white/20 text-slate-500 dark:text-white/50 hover:text-[#0057C8] dark:hover:text-[#1A9FFF] transition-all duration-200 shadow-xs"
          >
            <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>

          {/* YouTube */}
          <a
            href={socialLinks.youtube}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-[#0c1824] hover:bg-[#0057C8]/10 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 hover:border-[#0057C8]/30 dark:hover:border-white/20 text-slate-500 dark:text-white/50 hover:text-[#0057C8] dark:hover:text-[#1A9FFF] transition-all duration-200 shadow-xs"
          >
            <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </a>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="border-t border-slate-200 dark:border-white/5 py-4">
        <p className="text-center text-[12px] text-slate-400 dark:text-white/30 font-medium tracking-wide italic">
          Copyright © 2026 LearnXChain Technologies Pvt. Ltd. | All rights reserved
        </p>
      </div>
    </footer>
  );
}
