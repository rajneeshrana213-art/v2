import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth, ROLE_DASHBOARDS } from "@/lib/context/AuthContext";

const navLinks = [
  { href: "/product", label: "Product" },
  { href: "/solutions", label: "Solutions" },
  { href: "https://chat.learnxchain.com", label: "RIT AI" },
  { href: "/services", label: "Our Services" },
  { href: "/about", label: "About Us" },
  { href: "/resources", label: "Resources" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar({ simplified = false }: { simplified?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme, mounted } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => {
    if (!router?.pathname) return false;
    return router.pathname === path || router.pathname.startsWith(path + "/");
  };

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          width: '100%'
        }}
        className={`w-full transition-all duration-500 ${scrolled
          ? theme === 'dark'
            ? simplified 
              ? "bg-[#0B0E14] border-b border-white/10" 
              : "bg-[#0B0E14]/70 backdrop-blur-xl border-b border-white/10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] dark:shadow-[#0057C8]/20"
            : simplified
              ? "bg-white border-b border-gray-200"
              : "bg-white/80 backdrop-blur-xl border-b border-gray-200/30 shadow-[0_20px_50px_-12px_rgba(0,87,200,0.15)]"
          : theme === 'dark'
            ? simplified
              ? "bg-[#0B0E14] border-b border-white/5"
              : "bg-[#0B0E14]/30 backdrop-blur-md border-b border-white/5"
            : simplified
              ? "bg-white border-b border-gray-200/20"
              : "bg-white/20 backdrop-blur-md border-b border-gray-200/20"
          }`}
      >
        {/* Gradient overlay for extra depth */}
        {!simplified && (
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/20 to-transparent dark:from-[#0057C8]/5 dark:via-transparent dark:to-transparent pointer-events-none" />
        )}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* LOGO - Left */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0 relative z-10"
            >
              <Link href="/" className="flex items-center gap-3 group">
                <motion.div
                  className="relative h-12 w-12 flex-shrink-0"
                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  {!simplified && (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0057C8]/20 to-[#1A9FFF]/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                  )}
                  <div className="relative h-12 w-12">
                    <Image
                      src="/logo.png"
                      alt="LearnXChain Logo"
                      width={48}
                      height={48}
                      className="object-contain relative z-10"
                      priority
                    />
                  </div>
                </motion.div>
                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent tracking-tight group-hover:from-[#0057C8] group-hover:to-[#1A9FFF] dark:group-hover:from-[#1A9FFF] dark:group-hover:to-[#55CFFF] transition-all duration-300">
                  Learn<span className="text-[#5CDD2B]">X</span>Chain
                </span>
              </Link>
            </motion.div>

            {/* NAV LINKS - Center */}
            <div className="hidden lg:flex items-center justify-center flex-1">
              <nav className={`flex items-center gap-1 rounded-full px-2 py-2 border shadow-[0_10px_40px_-10px_rgba(0,87,200,0.2)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] ${
                simplified 
                  ? "bg-white dark:bg-gray-900 border-gray-200 dark:border-white/20"
                  : "bg-white/70 dark:bg-black/60 backdrop-blur-md border-gray-200/50 dark:border-white/10"
              }`}>
                {navLinks.map((link, index) => {
                  const active = isActive(link.href);
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 + 0.2 }}
                      className="relative"
                    >
                      <Link
                        href={link.href}
                        target={link.href.startsWith("http") ? "_blank" : undefined}
                        rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                        className={`relative group px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-lg ${active
                          ? "text-white"
                          : "text-gray-600 dark:text-gray-300 hover:text-[#0057C8] dark:hover:text-[#1A9FFF]"
                          }`}
                      >
                        <span className="relative z-10">{link.label}</span>
                        {active && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 bg-gradient-to-r from-[#0057C8] to-[#1A9FFF] rounded-lg shadow-md shadow-[#0057C8]/20"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                        <motion.span
                          className="absolute inset-0 bg-[#0057C8]/5 dark:bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
                        />
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>
            </div>

            {/* ACTIONS - Right */}
            <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
              {/* Enhanced Theme Toggle */}
              <motion.button
                onClick={toggleTheme}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                className={`relative p-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-300 shadow-sm hover:shadow-md ${
                  simplified
                    ? "bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 border-gray-200 dark:border-white/20"
                    : "bg-gray-100/50 dark:bg-white/5 hover:bg-gray-200/50 dark:hover:bg-white/10 border-gray-200/50 dark:border-white/10 backdrop-blur-sm"
                }`}
                aria-label="Toggle theme"
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: theme === 'dark' ? 0 : 180 }}
                  transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                >
                  {theme === 'light' ? (
                    <motion.svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </motion.svg>
                  ) : (
                    <motion.svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </motion.svg>
                  )}
                </motion.div>
                {!simplified && (
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#0057C8]/10 to-[#1A9FFF]/10 opacity-0 hover:opacity-100 transition-opacity"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.button>


              {mounted && (
                isAuthenticated && user ? (
                  <Link href={ROLE_DASHBOARDS[user.role] || '/dashboard'}>
                      <motion.div 
                      whileHover={{ scale: 1.02 }} 
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center gap-2 justify-center rounded-xl text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md text-[#5CDD2B] hover:text-[#4BBD22] bg-[#5CDD2B]/10 hover:bg-[#5CDD2B]/20 border border-[#5CDD2B]/20 px-5 py-2.5 backdrop-blur-sm"
                    >
                      Dashboard
                    </motion.div>
                  </Link>
                ) : (
                  <Link href="/login">
                      <motion.div 
                      whileHover={{ scale: 1.02 }} 
                      whileTap={{ scale: 0.98 }}
                      className={`inline-flex items-center gap-2 justify-center text-sm font-medium border px-5 py-2.5 rounded-xl transition-all duration-300 shadow-[0_10px_20px_-5px_rgba(0,87,200,0.15)] dark:shadow-[0_10px_20px_-5px_rgba(0,0,0,0.4)] hover:shadow-[0_20px_40px_-10px_rgba(0,87,200,0.25)] dark:hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.6)] hover:-translate-y-0.5 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white ${
                        simplified
                          ? "bg-white dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20 border-gray-200 dark:border-white/20"
                          : "bg-white/80 dark:bg-white/10 hover:bg-white/95 dark:hover:bg-white/20 border-gray-200/50 dark:border-white/10 backdrop-blur-sm"
                      }`}
                    >
                      Login
                    </motion.div>
                  </Link>
                )
              )}

              <Link href="/book-demo">
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[#0057C8] to-[#1A9FFF] rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <div 
                    className="relative bg-gradient-to-r from-[#0057C8] to-[#1A9FFF] hover:from-[#004BB0] hover:to-[#1589E0] text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow-[0_10px_25px_-5px_rgba(0,87,200,0.4)] hover:shadow-[0_20px_40px_-10px_rgba(0,87,200,0.6)] transition-all duration-300 border-0 flex items-center justify-center cursor-pointer"
                  >
                    <span className="relative z-10">Book Free Demo</span>
                  </div>
                </motion.div>
              </Link>
            </div>

            {/* MOBILE MENU BUTTON */}
            <div className="lg:hidden flex items-center gap-2 relative z-[80]">
              {mounted && (
                <motion.button
                  onClick={toggleTheme}
                  whileTap={{ scale: 0.9 }}
                  className={`p-2.5 rounded-xl transition-all duration-300 border-2 backdrop-blur-md shadow-lg ${mobileMenuOpen
                    ? theme === 'dark'
                      ? 'text-white bg-white/30 border-white/40 hover:bg-white/35'
                      : 'text-gray-900 bg-white border-gray-400 hover:bg-gray-50'
                    : theme === 'dark'
                      ? 'text-white bg-white/15 border-white/25 hover:bg-white/20'
                      : 'text-gray-700 bg-white/90 border-gray-200 hover:bg-white'
                    }`}
                  aria-label="Toggle theme"
                >
                  {theme === 'light' ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                </motion.button>
              )}
              <motion.button
                whileTap={{ scale: 0.95 }}
                className={`p-2.5 rounded-xl transition-all duration-300 border-2 backdrop-blur-md shadow-lg ${mobileMenuOpen
                  ? (mounted && theme === 'dark')
                    ? 'text-white bg-white/30 border-white/40 hover:bg-white/35'
                    : 'text-gray-900 bg-white border-gray-400 hover:bg-gray-50'
                  : (mounted && theme === 'dark')
                    ? 'text-white bg-white/15 border-white/25 hover:bg-white/20'
                    : 'text-gray-700 bg-white/90 border-gray-200 hover:bg-white'
                  }`}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                <motion.div
                  animate={mobileMenuOpen ? "open" : "closed"}
                  className="w-6 h-6 flex flex-col justify-center gap-1.5"
                >
                  <motion.span
                    className="w-full h-0.5 bg-current rounded-full origin-center"
                    variants={{
                      closed: { rotate: 0, y: 0 },
                      open: { rotate: 45, y: 6 },
                    }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.span
                    className="w-full h-0.5 bg-current rounded-full"
                    variants={{
                      closed: { opacity: 1, scale: 1 },
                      open: { opacity: 0, scale: 0 },
                    }}
                    transition={{ duration: 0.2 }}
                  />
                  <motion.span
                    className="w-full h-0.5 bg-current rounded-full origin-center"
                    variants={{
                      closed: { rotate: 0, y: 0 },
                      open: { rotate: -45, y: -6 },
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU - Outside nav for proper z-index stacking */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className={`fixed inset-0 backdrop-blur-sm z-[60] lg:hidden ${theme === 'dark' ? 'bg-black/40' : 'bg-black/20'
                }`}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`fixed top-20 right-0 bottom-0 w-80 max-w-[85vw] backdrop-blur-xl border-l shadow-2xl z-[70] lg:hidden overflow-y-auto ${theme === 'dark'
                ? 'bg-[#0B0E14]/98 border-white/10'
                : 'bg-white/95 border-gray-200/50'
                }`}
            >
              <div className="px-6 py-8 space-y-2">
                {navLinks.map((link, index) => {
                  const active = isActive(link.href);
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={link.href}
                        target={link.href.startsWith("http") ? "_blank" : undefined}
                        rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block px-4 py-3.5 text-base font-semibold rounded-xl transition-all duration-300 ${active
                          ? "text-white bg-gradient-to-r from-[#0057C8] to-[#1A9FFF] shadow-md shadow-[#0057C8]/20"
                          : theme === 'dark'
                            ? "text-gray-300 hover:text-[#1A9FFF] hover:bg-white/10"
                            : "text-gray-700 hover:text-[#0057C8] hover:bg-[#0057C8]/5"
                          }`}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  );
                })}
                <div className={`pt-6 space-y-3 border-t mt-4 ${theme === 'dark' ? 'border-white/10' : 'border-gray-200/50'
                  }`}>
                  {/* Theme Toggle Button */}
                  <motion.button
                    onClick={toggleTheme}
                    whileTap={{ scale: 0.95 }}
                    className={`w-full flex items-center justify-center gap-3 px-4 py-3.5 text-base font-medium rounded-xl transition-all duration-300 ${theme === 'dark'
                      ? 'text-gray-200 bg-white/5 border-white/10 hover:bg-white/10'
                      : 'text-gray-700 bg-gray-100/50 border-gray-200/50 hover:bg-gray-200/50'
                      }`}
                  >
                    {theme === 'light' ? (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                        <span>Dark Mode</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span>Light Mode</span>
                      </>
                    )}
                  </motion.button>
                  {mounted && (
                    isAuthenticated && user ? (
                      <Link
                        href={ROLE_DASHBOARDS[user.role] || '/dashboard'}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block px-4 py-3.5 text-center text-base font-semibold rounded-xl transition-all duration-300 ${theme === 'dark'
                          ? 'text-[#5CDD2B] bg-[#5CDD2B]/10 border-[#5CDD2B]/20 hover:bg-[#5CDD2B]/20'
                          : 'text-[#4BBD22] bg-[#5CDD2B]/5 border-[#5CDD2B]/20 hover:bg-[#5CDD2B]/10'
                          }`}
                      >
                        Dashboard
                      </Link>
                    ) : (
                      <Link
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block px-4 py-3.5 text-center text-base font-semibold rounded-xl transition-all duration-300 ${theme === 'dark'
                          ? 'text-gray-200 bg-white/5 border-white/10 hover:bg-white/10'
                          : 'text-gray-700 bg-gray-100/50 border-gray-200/50 hover:bg-gray-200/50'
                          }`}
                      >
                        Login
                      </Link>
                    )
                  )}
                  <Link
                    href="/book-demo"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3.5 text-center text-base font-semibold text-white bg-gradient-to-r from-[#0057C8] to-[#1A9FFF] hover:from-[#004BB0] hover:to-[#1589E0] rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Book Free Demo
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
