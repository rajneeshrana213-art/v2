'use client';

import { xpToNextLevel } from '@/lib/lxc/student-store';
import { Star, Zap } from 'lucide-react';

interface XPBarProps {
  totalXP: number;
  level: number;
  streak: number;
  compact?: boolean;
}

export function XPBar({ totalXP, level, streak, compact = false }: XPBarProps) {
  const { current, needed, progress } = xpToNextLevel(totalXP);

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-yellow-400">
          <Star className="w-4 h-4 fill-yellow-400" />
          <span className="text-sm font-bold">Lv.{level}</span>
        </div>
        <div className="flex items-center gap-1 text-orange-400">
          <Zap className="w-4 h-4 fill-orange-400" />
          <span className="text-sm font-bold">{streak}🔥</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-20 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#1a6fd8] to-[#5cc21a] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-white/50">{totalXP} XP</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
            <Star className="w-4 h-4 text-white fill-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-yellow-400">Level {level}</p>
            <p className="text-xs text-white/50">{totalXP} XP total</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-white/50">Next level</p>
          <p className="text-sm font-semibold text-white">
            {current}/{needed} XP
          </p>
        </div>
      </div>
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#1a6fd8] to-[#5cc21a] rounded-full transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>
      {streak > 0 && (
        <p className="text-xs text-orange-400 mt-2 text-center">
          🔥 {streak} दिन की स्ट्रीक — Keep it up!
        </p>
      )}
    </div>
  );
}
