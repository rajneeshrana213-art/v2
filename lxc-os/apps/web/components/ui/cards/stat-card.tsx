import * as React from "react";
import { cn } from "@/lib/utils";
import { DashboardCard } from "./card";
import { Badge } from "@/components/ui/badge";

export interface StatCardTrend {
  label?: string;
  value?: number | string;
  direction?: "up" | "down" | "neutral";
}

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: StatCardTrend;
  hint?: string;
  accent?: "indigo" | "emerald" | "violet" | "amber" | "sky" | "rose";
  onClick?: () => void;
  className?: string;
}

const trendColorMap: Record<
  NonNullable<StatCardTrend["direction"]>,
  string
> = {
  up: "text-emerald-400 bg-emerald-500/10 ring-emerald-500/40",
  down: "text-rose-400 bg-rose-500/10 ring-rose-500/40",
  neutral: "text-slate-300 bg-slate-600/20 ring-slate-500/40",
};

export function StatCard({
  label,
  value,
  icon,
  trend,
  hint,
  accent = "indigo",
  onClick,
  className,
}: StatCardProps) {
  const clickable = typeof onClick === "function";

  return (
    <button
      type={clickable ? "button" : "button"}
      onClick={onClick}
      className={cn(
        "group text-left",
        !clickable && "cursor-default",
        className
      )}
    >
      <DashboardCard
        accent={accent}
        variant="soft"
        interactive={clickable}
        className={cn(
          "relative overflow-hidden",
          "before:pointer-events-none before:absolute before:inset-x-6 before:top-[-80px] before:h-40 before:rounded-full before:bg-gradient-to-b before:from-white/5 before:via-white/0 before:to-transparent before:opacity-0 before:transition-opacity before:duration-500 group-hover:before:opacity-100"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              {label}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold tracking-tight text-slate-50">
                {value}
              </span>
            </div>
          </div>

          {icon && (
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-slate-950/70 text-slate-200 shadow-[0_18px_60px_rgba(15,23,42,0.9)]",
                "group-hover:-translate-y-0.5 group-hover:border-indigo-400/60 group-hover:bg-indigo-500/10 group-hover:text-white group-hover:shadow-[0_22px_65px_rgba(79,70,229,0.9)]",
                "transition-all duration-300"
              )}
            >
              {icon}
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 text-xs">
          {trend && typeof trend.value !== "undefined" && (
            <div
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1",
                trendColorMap[trend.direction ?? "neutral"]
              )}
            >
              {trend.direction === "up" && <span>▲</span>}
              {trend.direction === "down" && <span>▼</span>}
              {trend.direction === "neutral" && <span>◆</span>}
              <span>{trend.value}</span>
              {trend.label && (
                <span className="text-[10px] text-slate-300/80">
                  {trend.label}
                </span>
              )}
            </div>
          )}

          {hint && (
            <Badge
              variant="soft"
              tone="info"
              className="ml-auto bg-slate-900/60 text-[10px] text-slate-300"
            >
              {hint}
            </Badge>
          )}
        </div>
      </DashboardCard>
    </button>
  );
}


