import type { Metadata } from 'next';
import Sidebar from '@/components/lxc/Sidebar';

export const metadata: Metadata = {
  title: 'LearnXChain — Student Growth OS',
  description: 'AI Student Growth Operating System powered by Rit AI — Made for Bharat',
};

export default function LXCLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-slate-50 dark:bg-[#070c16] text-slate-900 dark:text-white flex font-sans selection:bg-[#1a6fd8]/30 selection:text-white transition-colors duration-300 w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden w-full min-w-0">
        {children}
      </div>
    </div>
  );
}
