'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  MessageSquare,
  Trophy,
  Star,
  User,
  LogOut,
  Compass,
  CheckSquare,
  Menu,
  X,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarItem {
  name: string;
  href: string;
  icon: any;
  description: string;
}

const navigationItems: SidebarItem[] = [
  {
    name: 'Overview',
    href: '/dashboard/forum',
    icon: Compass,
    description: 'Dashboard & statistics',
  },
  {
    name: 'Browse Doubts',
    href: '/dashboard/forum/doubts',
    icon: MessageSquare,
    description: 'Solve student questions',
  },
  {
    name: 'My Answers',
    href: '/dashboard/forum/my-answers',
    icon: CheckSquare,
    description: 'History of your replies',
  },
  {
    name: 'Leaderboard',
    href: '/dashboard/forum/leaderboard',
    icon: Trophy,
    description: 'Top forum contributors',
  },
  {
    name: 'Reward Coins',
    href: '/dashboard/forum/coins',
    icon: Star,
    description: 'Gamification & transactions',
  },
  {
    name: 'Profile & Level',
    href: '/dashboard/forum/profile',
    icon: User,
    description: 'Reputation & fields',
  },
];

export default function ForumDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const activeItem = navigationItems.find((item) => pathname === item.href) || navigationItems[0];

  return (
    <div className="min-h-screen bg-[#080710] text-white flex font-sans overflow-x-hidden selection:bg-purple-500/30 selection:text-purple-200">
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-900/20 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/15 blur-[150px] pointer-events-none" />

      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-72 shrink-0 border-r border-white/5 bg-[#0d0c15]/60 backdrop-blur-xl sticky top-0 h-screen p-6 justify-between z-30">
        <div className="space-y-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 px-2 group">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center bg-violet-600/10 border border-violet-500/20 group-hover:border-violet-500/50 transition-all duration-300">
              <Zap className="w-5 h-5 text-violet-400 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-purple-100 to-purple-400 bg-clip-text text-transparent">
              LXC <span className="text-violet-400">Forum</span>
            </span>
          </Link>

          {/* Navigation links */}
          <nav className="space-y-1.5">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-600/35 to-purple-600/20 border-l-2 border-violet-500 text-white shadow-[0_4px_20px_rgba(139,92,246,0.15)]'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 transition-transform group-hover:scale-105 ${
                      isActive ? 'text-violet-400' : 'text-white/50 group-hover:text-violet-300'
                    }`}
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{item.name}</span>
                    <span className="text-[10px] text-white/40 leading-none mt-0.5 font-light group-hover:text-white/60 transition-colors">
                      {item.description}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile footer section */}
        <div className="border-t border-white/5 pt-4 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm border border-white/10 shadow-inner select-none">
              {user?.name?.[0]?.toUpperCase() || 'F'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold truncate leading-tight">{user?.name || 'Forum Expert'}</p>
              <p className="text-[10px] text-violet-400 font-semibold tracking-wider uppercase mt-0.5">Forum Contributor</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-sm font-semibold"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header / Sidebar Drawer toggle */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="lg:hidden flex items-center justify-between px-6 h-16 border-b border-white/5 bg-[#0d0c15]/80 backdrop-blur-md sticky top-0 z-40">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-violet-400" />
            <span className="font-extrabold text-lg">LXC Forum</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 bg-white/5 border border-white/10 rounded-lg text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {/* Mobile Navigation Drawer Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-black z-40 lg:hidden"
              />

              {/* Sidebar content */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 bottom-0 left-0 w-80 bg-[#0d0c15] border-r border-white/10 z-50 p-6 flex flex-col justify-between lg:hidden"
              >
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-extrabold">LXC Forum</span>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-1.5 bg-white/5 rounded-lg border border-white/10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <nav className="space-y-1.5">
                    {navigationItems.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
                            isActive
                              ? 'bg-gradient-to-r from-violet-600/30 to-purple-600/10 border-l-2 border-violet-500 text-white'
                              : 'text-white/60 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <item.icon className="w-5 h-5 text-violet-400" />
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold">{item.name}</span>
                            <span className="text-[10px] text-white/40">{item.description}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </nav>
                </div>

                <div className="border-t border-white/5 pt-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center font-bold text-white text-sm">
                      {user?.name?.[0]?.toUpperCase() || 'F'}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{user?.name || 'Forum Expert'}</p>
                      <p className="text-[10px] text-violet-400 font-bold uppercase mt-0.5">Forum Contributor</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-sm font-bold transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Desktop Header bar info */}
        <div className="hidden lg:flex items-center justify-between px-8 py-5 border-b border-white/5 backdrop-blur-md bg-[#080710]/50 sticky top-0 z-20">
          <div>
            <h2 className="text-lg font-black tracking-wide text-white/90">
              {activeItem.name}
            </h2>
            <p className="text-xs text-white/40 font-light mt-0.5">
              {activeItem.description}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs font-semibold text-violet-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>SSO Authenticated</span>
            </div>
            <div className="text-xs text-white/40 font-mono">
              Port: <span className="text-purple-400">5000 (AI)</span> &rarr; <span className="text-purple-400">3000 (Web)</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-5xl w-full mx-auto relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
}
