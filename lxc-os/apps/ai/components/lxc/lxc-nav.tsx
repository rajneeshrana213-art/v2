'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Home, BookOpen, BarChart2, Compass, Gamepad2, Brain, Zap, Globe } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const navItems = [
  { href: '/lxc', icon: Home, label: 'होम', labelEn: 'Hub' },
  { href: '/lxc/study-plan', icon: BookOpen, label: 'पढ़ाई योजना', labelEn: 'Study Plan' },
  { href: '/lxc/performance', icon: BarChart2, label: 'प्रदर्शन', labelEn: 'Performance' },
  { href: '/lxc/career', icon: Compass, label: 'करियर', labelEn: 'Career' },
  { href: '/lxc/gamification', icon: Gamepad2, label: 'गेमिफिकेशन', labelEn: 'Achievements' },
  { href: '/lxc/bharat', icon: Zap, label: 'भारत मोड', labelEn: 'Bharat Mode' },
];

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
  { code: 'ur', label: 'Urdu - اردو' },
];

export function LXCNav() {
  const pathname = usePathname();
  const [selectedLang, setSelectedLang] = useState('en');
  const { status: authStatus } = useAuth();
  const isAuthenticated = authStatus === 'authenticated';

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

    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${cookieDomain};`;
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;";

    if (langCode !== 'en') {
      document.cookie = `googtrans=/en/${langCode}; path=/;`;
      document.cookie = `googtrans=/en/${langCode}; path=/; domain=${cookieDomain};`;
      document.cookie = `googtrans=/en/${langCode}; path=/; domain=localhost;`;
    }

    window.location.reload();
  };

  return (
    <nav className="bg-[#0d1a2d] border-b border-white/10">

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-1.5 gap-4">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-1">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 mr-4 shrink-0 py-2">
              <div className="w-7 h-7 rounded-lg bg-linear-to-br from-[#1a6fd8] to-[#5cc21a] flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-white hidden sm:block">LXC</span>
            </Link>

            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const href = isAuthenticated ? item.href : (item.href === '/lxc' ? '/lxc' : '/login');
              return (
                <Link
                  key={item.href}
                  href={href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium shrink-0 transition-all ${
                    isActive
                      ? 'bg-[#1a6fd8] text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="hidden sm:block">{item.labelEn}</span>
                </Link>
              );
            })}
          </div>

          {/* Premium Google Translator Dropdown Selection */}
          <div className="flex items-center shrink-0 pr-1">
            <div className="relative flex items-center gap-2 bg-white/5 border border-white/10 hover:border-white/20 transition-all rounded-lg px-2.5 py-1.5 shadow-sm">
              <Globe className="w-3.5 h-3.5 text-white/50" />
              <select
                value={selectedLang}
                onChange={(e) => changeLanguage(e.target.value)}
                className="bg-transparent text-white/95 text-xs font-semibold focus:outline-none cursor-pointer pr-1"
                style={{
                  colorScheme: 'dark',
                  background: 'none',
                  border: 'none',
                }}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-[#0d1a2d] text-white">
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
