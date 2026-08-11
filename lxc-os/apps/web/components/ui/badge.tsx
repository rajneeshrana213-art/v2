import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "solid" | "soft" | "outline";
  tone?:
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "accent";
}

const toneMap: Record<
  NonNullable<BadgeProps["tone"]>,
  { base: string; border?: string; text?: string }
> = {
  neutral: {
    base: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
  },
  success: {
    base: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300",
  },
  warning: {
    base: "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300",
  },
  danger: {
    base: "bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-300",
  },
  info: {
    base: "bg-sky-100 text-sky-800 dark:bg-sky-500/10 dark:text-sky-300",
  },
  accent: {
    base: "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-300",
  },
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "soft", tone = "accent", ...props }, ref) => {
    const _tone = (tone as any) || "accent";
    const toneConfig = toneMap[_tone as keyof typeof toneMap] || toneMap.accent;

    const variants: Record<NonNullable<BadgeProps["variant"]>, string> = {
      soft: toneConfig.base,
      solid: cn(
        "text-white",
        tone === "accent" && "bg-indigo-600 dark:bg-indigo-500",
        tone === "success" && "bg-emerald-600 dark:bg-emerald-500",
        tone === "warning" && "bg-amber-500 dark:bg-amber-400 text-slate-950",
        tone === "danger" && "bg-rose-600 dark:bg-rose-500",
        tone === "info" && "bg-sky-600 dark:bg-sky-500",
        tone === "neutral" && "bg-gray-900 dark:bg-gray-100 dark:text-gray-900"
      ),
      outline: cn(
        "border bg-transparent",
        tone === "accent" &&
        "border-indigo-500/60 text-indigo-700 dark:border-indigo-400/70 dark:text-indigo-300",
        tone === "success" &&
        "border-emerald-500/60 text-emerald-700 dark:border-emerald-400/70 dark:text-emerald-300",
        tone === "warning" &&
        "border-amber-500/60 text-amber-700 dark:border-amber-400/70 dark:text-amber-300",
        tone === "danger" &&
        "border-rose-500/60 text-rose-700 dark:border-rose-400/70 dark:text-rose-300",
        tone === "info" &&
        "border-sky-500/60 text-sky-700 dark:border-sky-400/70 dark:text-sky-300",
        tone === "neutral" &&
        "border-gray-400/60 text-gray-700 dark:border-gray-500/60 dark:text-gray-200"
      ),
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";


