'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/lib/hooks/use-theme';
import { useAuth } from '@/lib/auth-context';
import { useUserProfileStore } from '@/lib/store/user-profile';
import {
  Sun, Moon, Monitor, ChevronDown, ChevronRight,
  Home, LayoutDashboard, CreditCard, LogOut, User,
} from 'lucide-react';

/**
 * Shared landing navbar — identical to the one in LandingPage.tsx.
 * Used across About, Contact, Privacy Policy, Terms, and Refund Policy pages
 * so the navbar stays consistent site-wide.
 */
export function LandingNav() {
  const { theme, setTheme } = useTheme();
  const { user, status: authStatus, logout } = useAuth();
  const isAuthenticated = authStatus === 'authenticated';

  const avatar = useUserProfileStore((s) => s.avatar) ||
    `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user?.name || 'Student')}&backgroundColor=0057C8&textColor=ffffff`;
  const nickname = useUserProfileStore((s) => s.nickname);

  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  const authUrls = { login: '/login', register: '/login' };

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuOpen && userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (themeOpen && themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setThemeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen, themeOpen]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full bg-transparent pointer-events-none transition-all duration-300">
      <nav className={`
        pointer-events-auto flex items-center justify-center transition-all duration-300 ease-in-out
        ${isScrolled
          ? 'mt-4 w-[90%] max-w-7xl h-14 bg-white/70 dark:bg-[#050d17]/70 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/25 px-8 rounded-full'
          : 'w-full h-16 bg-transparent border-none rounded-none'
        }
      `}>
        <div className={`w-full flex items-center justify-between h-full ${isScrolled ? 'px-0' : 'max-w-360 px-6 sm:px-8 md:px-10 lg:px-12 mx-auto'}`}>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer select-none">
            <img
              src="/logo.svg"
              className="w-11 h-11 md:w-12 md:h-12 shrink-0 transition-transform duration-300 group-hover:scale-110"
              alt="RIT AI Logo"
            />
            <span className="hidden sm:inline text-xl md:text-2xl font-black tracking-tight bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent group-hover:from-[#0057C8] group-hover:to-[#1A9FFF] dark:group-hover:from-[#1A9FFF] dark:group-hover:to-[#55CFFF] transition-all duration-300 font-syne">
              RIT <span className="bg-linear-to-r from-[#0057C8] to-[#5CDD2B] bg-clip-text text-transparent">AI</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1.5 min-[385px]:gap-3 md:gap-7 text-xs md:text-sm font-semibold select-none">
            <Link href="/" className="group flex items-center gap-1 sm:gap-1.5 text-slate-600 hover:text-[#0057C8] dark:text-white/70 dark:hover:text-[#1A9FFF] transition-all hover:-translate-y-[0.5px] duration-150 py-1 sm:py-1.5">
              <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 dark:text-slate-500 group-hover:text-[#0057C8] dark:group-hover:text-[#1A9FFF] transition-colors" />
              <span className="hidden min-[385px]:inline">Home</span>
            </Link>

            <Link
              href="/lxc"
              className="group flex items-center gap-1.5 text-slate-600 hover:text-[#0057C8] dark:text-white/70 dark:hover:text-[#1A9FFF] transition-all hover:-translate-y-[0.5px] duration-150 py-1 sm:py-1.5"
            >
              <LayoutDashboard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 dark:text-slate-500 group-hover:text-[#0057C8] dark:group-hover:text-[#1A9FFF] transition-colors" />
              <span className="hidden min-[385px]:inline">Plus<span className="hidden sm:inline"> Dashboard</span></span>
            </Link>

            {!isAuthenticated && (
              <Link href="/pricing" className="group flex items-center gap-1.5 text-slate-600 hover:text-[#0057C8] dark:text-white/70 dark:hover:text-[#1A9FFF] transition-all hover:-translate-y-[0.5px] duration-150 py-1 sm:py-1.5">
                <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 dark:text-slate-500 group-hover:text-[#0057C8] dark:group-hover:text-[#1A9FFF] transition-colors" />
                <span className="hidden min-[385px]:inline">Pricing</span>
              </Link>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Theme Selector */}
            <div className="relative" ref={themeMenuRef}>
              <button
                onClick={() => setThemeOpen(!themeOpen)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 hover:text-[#0057C8] dark:text-white/50 dark:hover:text-[#1A9FFF] hover:bg-slate-100 dark:hover:bg-white/5 hover:border-[#0057C8]/30 dark:hover:border-[#1A9FFF]/30 transition-all focus:outline-none"
              >
                {mounted && theme === 'light' && <Sun className="w-4 h-4" />}
                {mounted && theme === 'dark' && <Moon className="w-4 h-4" />}
                {mounted && theme === 'system' && <Monitor className="w-4 h-4" />}
                {!mounted && <div className="w-4 h-4" />}
              </button>
              {themeOpen && (
                <div className="absolute top-full mt-2 right-0 bg-white dark:bg-[#0c1824] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-50 min-w-35 animate-in fade-in slide-in-from-top-2 duration-150">
                  <button onClick={() => { setTheme('light'); setThemeOpen(false); }} className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-white/10 flex items-center gap-2 ${theme === 'light' ? 'text-[#0057C8] font-semibold' : 'text-slate-600 dark:text-white/70'}`}>
                    <Sun className="w-4 h-4" /> Light
                  </button>
                  <button onClick={() => { setTheme('dark'); setThemeOpen(false); }} className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-white/10 flex items-center gap-2 ${theme === 'dark' ? 'text-[#1A9FFF] font-semibold' : 'text-slate-600 dark:text-white/70'}`}>
                    <Moon className="w-4 h-4" /> Dark
                  </button>
                  <button onClick={() => { setTheme('system'); setThemeOpen(false); }} className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-white/10 flex items-center gap-2 ${theme === 'system' ? 'text-[#0057C8] font-semibold' : 'text-slate-600 dark:text-white/70'}`}>
                    <Monitor className="w-4 h-4" /> System
                  </button>
                </div>
              )}
            </div>

            {!isAuthenticated ? (
              <>
                {/* Get Started — Desktop */}
                <Link href={authUrls.login} className="hidden md:flex">
                  <div className="relative group/btn cursor-pointer">
                    <div className="absolute inset-0 bg-linear-to-r from-[#0057C8] to-[#1A9FFF] rounded-full blur-md opacity-60 group-hover/btn:opacity-85 transition-opacity duration-300" />
                    <button className="relative rounded-full px-6 py-2.5 bg-linear-to-r from-[#0057C8] to-[#1A9FFF] hover:from-[#004BB0] hover:to-[#1589E0] text-white font-bold text-sm tracking-wide transition-all shadow-[0_4px_12px_rgba(0,87,200,0.3)] hover:shadow-[0_6px_18px_rgba(0,87,200,0.4)] flex items-center gap-1 hover:scale-[1.03] active:scale-95 duration-200 cursor-pointer">
                      <span>Get Started</span>
                      <ChevronRight className="w-4 h-4 shrink-0" />
                    </button>
                  </div>
                </Link>

                {/* Get Started — Mobile */}
                <Link href={authUrls.login} className="flex md:hidden">
                  <div className="relative group/btn cursor-pointer">
                    <div className="absolute inset-0 bg-linear-to-r from-[#0057C8] to-[#1A9FFF] rounded-full blur-md opacity-60 group-hover/btn:opacity-85 transition-opacity duration-300" />
                    <button className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-linear-to-r from-[#0057C8] to-[#1A9FFF] hover:from-[#004BB0] hover:to-[#1589E0] text-white flex items-center justify-center transition-all shadow-[0_4px_12px_rgba(0,87,200,0.3)] hover:scale-[1.05] active:scale-95 duration-200 cursor-pointer">
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                    </button>
                  </div>
                </Link>
              </>
            ) : (
              /* User Profile Dropdown */
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-all focus:outline-none"
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-gray-800 shrink-0 shadow-sm">
                    <img src={avatar} alt="User Avatar" className="w-full h-full object-cover" />
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute top-full mt-2.5 right-0 w-64 bg-white/95 dark:bg-[#0c1824]/95 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl backdrop-blur-xl p-4 flex flex-col gap-3.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500">Logged in as</span>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{nickname || user?.name || 'Student'}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400/70 truncate">{user?.email || ''}</span>
                    </div>
                    <div className="w-full h-px bg-slate-100 dark:bg-white/5" />
                    <Link
                      href="/lxc"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-[#0057C8] dark:hover:text-[#1A9FFF] transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 shrink-0" />
                      <span>Go to Dashboard</span>
                    </Link>
                    <Link
                      href="/lxc/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-[#0057C8] dark:hover:text-[#1A9FFF] transition-colors"
                    >
                      <User className="w-4 h-4 shrink-0" />
                      <span>Profile Settings</span>
                    </Link>
                    <div className="w-full h-px bg-slate-100 dark:bg-white/5" />
                    <button
                      onClick={() => { setUserMenuOpen(false); logout(); }}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors w-full text-left"
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}
