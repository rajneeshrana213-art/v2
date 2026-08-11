import * as React from "react";
import { cn } from "@/lib/utils";

export interface TopbarProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  className?: string;
}

export function Topbar({
  title,
  subtitle,
  leftContent,
  rightContent,
  className,
}: TopbarProps) {
  return (
    <div
      className={cn(
        "border-b border-white/10 bg-slate-950/70 backdrop-blur-2xl",
        "shadow-[0_1px_0_0_rgba(148,163,184,0.15)]",
        className
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {leftContent}
          {(title || subtitle) && (
            <div className="min-w-0">
              {title && (
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-sm font-semibold tracking-tight text-slate-50 sm:text-base">
                    {title}
                  </h1>
                  <span className="h-5 w-px bg-slate-700/70" />
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300 ring-1 ring-emerald-500/40">
                    Realtime
                  </span>
                </div>
              )}
              {subtitle && (
                <p className="mt-0.5 truncate text-xs text-slate-400">
                  {subtitle}
                </p>
              )}
            </div>
          )}
        </div>

        {rightContent && (
          <div className="flex shrink-0 items-center gap-2">{rightContent}</div>
        )}
      </div>
    </div>
  );
}


