'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Plus,
  Bug,
  LogIn,
  LogOut,
  User,
  HelpCircle,
  Sun,
  Moon,
  Bell,
  ChevronRight,
  Globe,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/hooks/use-theme';
import { useUserProfileStore } from '@/lib/store/user-profile';
import { loadStudentData, type LXCStudentData } from '@/lib/lxc/student-store';

const LANGUAGES = [
  { code: 'en', label: 'English - EN' },
  { code: 'hi', label: 'Hindi - हिंदी' },
  { code: 'pa', label: 'Punjabi - ਪੰਜਾਬੀ' },
  { code: 'gu', label: 'Gujarati - ગુજરાતી' },
  { code: 'mr', label: 'Marathi - मराठी' },
  { code: 'bn', label: 'Bengali - বাংলা' },
  { code: 'ta', label: 'Tamil - தமிழ்' },
  { code: 'te', label: 'Telugu - తెలుగు' },
  { code: 'kn', label: 'Kannada - ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam - മലയാളം' },
  { code: 'ur', label: 'Urdu - उर्दू' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const storeAvatar = useUserProfileStore((s) => s.avatar);
  const storeNickname = useUserProfileStore((s) => s.nickname);
  const [studentData, setStudentData] = useState<LXCStudentData | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');
  const { status: authStatus, user, logout } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isAuthenticated = authStatus === 'authenticated';

  useEffect(() => {
    setStudentData(loadStudentData());
  }, []);

  useEffect(() => {
    // Parse googtrans cookie if exists
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };

    const cookieVal = getCookie('googtrans');
    if (cookieVal) {
      const lang = cookieVal.split('/').pop();
      if (lang) setSelectedLang(lang);
    }
  }, []);

  const changeLanguage = (langCode: string) => {
    setSelectedLang(langCode);
    const domain = window.location.hostname.replace('chat.', '');
    const cookieDomain = domain.startsWith('.') ? domain : `.${domain}`;

    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${cookieDomain};`;
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;';

    if (langCode !== 'en') {
      document.cookie = `googtrans=/en/${langCode}; path=/;`;
      document.cookie = `googtrans=/en/${langCode}; path=/; domain=${cookieDomain};`;
      document.cookie = `googtrans=/en/${langCode}; path=/; domain=localhost;`;
    }
    window.location.reload();
  };

  const isActiveHome = pathname === '/lxc';
  const isActivePricing = pathname === '/pricing';
  const isActiveBug = pathname === '/lxc/bugrazier';
  const isActiveProfile = pathname === '/lxc/profile';

  const displayName = storeNickname || user?.name || studentData?.profile?.name || 'Student';
  const displayEmail = user?.email || 'student@learnxchain.com';
  const avatarUrl = storeAvatar || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
    displayName
  )}&backgroundColor=1a6fd8&textColor=ffffff`;

  return (
    <aside className="w-20 hidden md:flex flex-col items-center justify-between py-6 border-r border-slate-200 dark:border-white/5 bg-white dark:bg-[#090f1d] shrink-0 transition-colors duration-300 h-full">
      <div className="flex flex-col items-center gap-6 w-full">
        {/* Logo Icon */}
        <Link href="/" className="cursor-pointer">
          <img
            src="/logo.svg"
            className="w-9 h-9 shrink-0 transition-transform duration-300 hover:scale-105"
            alt="LXC Logo"
          />
        </Link>

        <div className="w-8 h-px bg-slate-200 dark:bg-white/10" />

        {/* Sidebar Icons */}
        <div className="flex flex-col items-center gap-5 w-full">
          <Link
            href="/lxc"
            className="flex flex-col items-center justify-center w-full group"
            title="Home"
          >
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                isActiveHome
                  ? 'text-[#3b8eef] bg-[#1a6fd8]/10 border border-[#3b8eef]/30 shadow-md shadow-[#3b8eef]/5'
                  : 'text-slate-400 dark:text-white/50 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <Home className="w-5 h-5" />
            </div>
            <span
              className={`text-[10px] mt-1 select-none ${
                isActiveHome
                  ? 'font-extrabold text-[#3b8eef]'
                  : 'font-bold text-slate-400 dark:text-white/40'
              }`}
            >
              Home
            </span>
          </Link>

        

          <Link
            href="/lxc/bugrazier"
            className="flex flex-col items-center justify-center w-full group"
            title="Bug"
          >
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                isActiveBug
                  ? 'text-[#1a6fd8] bg-[#1a6fd8]/10 border border-[#1a6fd8]/20 shadow-md shadow-[#1a6fd8]/5'
                  : 'text-slate-400 dark:text-white/50 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <Bug className="w-5 h-5" />
            </div>
            <span
              className={`text-[10px] mt-1 select-none ${
                isActiveBug
                  ? 'font-extrabold text-[#1a6fd8]'
                  : 'font-bold text-slate-400 dark:text-white/40'
              }`}
            >
              Bug
            </span>
          </Link>
        </div>
      </div>

      {/* Profile / Account Trigger */}
      <div className="relative">
        <div
          className={`w-10 h-10 rounded-full overflow-hidden border bg-slate-100 dark:bg-white/5 flex items-center justify-center transition-all cursor-pointer ${
            isActiveProfile
              ? 'border-[#1a6fd8] dark:border-[#3b8eef] ring-2 ring-[#1a6fd8]/20 shadow-md'
              : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
          }`}
        >
          {isAuthenticated ? (
            <button
              onClick={() => setShowProfileMenu((prev) => !prev)}
              title="Profile Settings"
              className="w-full h-full cursor-pointer"
            >
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            </button>
          ) : (
            <Link
              href="/login"
              className="text-slate-400 dark:text-white/60 hover:text-slate-800 dark:hover:text-white flex items-center justify-center w-full h-full cursor-pointer"
              title="Sign In"
            >
              <LogIn className="w-5 h-5" />
            </Link>
          )}
        </div>

        {/* Profile Dropdown Menu */}
        {showProfileMenu && isAuthenticated && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
            <div className="absolute left-20 bottom-0 w-72 bg-white dark:bg-[#0c1524] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-2.5 z-50 flex flex-col text-left transition-colors duration-300">
              {/* Profile Header */}
              <Link
                href="/lxc/profile"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-3 p-3 border-b border-slate-200 dark:border-white/10 hover:bg-slate-100/50 dark:hover:bg-white/5 transition-all cursor-pointer text-left w-full"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {displayName}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-white/40 truncate">
                    {displayEmail}
                  </p>
                </div>
              </Link>

              {/* Menu Options */}
              <div className="flex flex-col gap-0.5 p-1">
                <Link
                  href="/lxc/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 dark:text-white/70 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-left w-full cursor-pointer"
                >
                  <User className="w-4 h-4 text-slate-400 dark:text-white/40" />
                  <span>My Profile</span>
                </Link>

                <Link
                  href="/lxc/bugrazier"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 dark:text-white/70 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-left w-full cursor-pointer"
                >
                  <Bug className="w-4 h-4 text-slate-400 dark:text-white/40" />
                  <span>Buganizer</span>
                </Link>

                <Link
                  href="/lxc/troubleshoot"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 dark:text-white/70 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-left w-full cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 text-slate-400 dark:text-white/40" />
                  <span>Troubleshooting</span>
                </Link>

                {resolvedTheme === 'dark' ? (
                  <button
                    onClick={() => setTheme('light')}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 dark:text-white/70 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-left w-full cursor-pointer"
                  >
                    <Sun className="w-4 h-4 text-slate-400 dark:text-white/40" />
                    <span>Light Mode</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setTheme('dark')}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 dark:text-white/70 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-left w-full cursor-pointer"
                  >
                    <Moon className="w-4 h-4 text-slate-400 dark:text-white/40" />
                    <span>Dark Mode</span>
                  </button>
                )}

                <button className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 dark:text-white/70 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all w-full">
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4 text-slate-400 dark:text-white/40" />
                    <span>Notification</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-white/30" />
                </button>

                <div className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 dark:text-white/70 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all w-full">
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-slate-400 dark:text-white/40" />
                    <span>Language</span>
                  </div>
                  <select
                    value={selectedLang}
                    onChange={(e) => changeLanguage(e.target.value)}
                    className="bg-transparent text-slate-800 dark:text-white/95 text-xs font-semibold focus:outline-none cursor-pointer pr-1"
                    style={{
                      colorScheme: resolvedTheme === 'dark' ? 'dark' : 'light',
                      background: 'none',
                      border: 'none',
                    }}
                  >
                    {LANGUAGES.map((lang) => (
                      <option
                        key={lang.code}
                        value={lang.code}
                        className="bg-white dark:bg-[#0c1524] text-slate-900 dark:text-white"
                      >
                        {lang.label.split(' - ')[0]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="h-px bg-slate-200 dark:bg-white/10 my-1.5" />

                <button
                  onClick={() => {
                    logout();
                    setShowProfileMenu(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all text-left w-full cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
