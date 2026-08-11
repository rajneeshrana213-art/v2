import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "soft" | "solid" | "outline";
  accent?: "indigo" | "emerald" | "violet" | "amber" | "sky" | "rose";
  interactive?: boolean;
}

const accentMap: Record<
  NonNullable<CardProps["accent"]>,
  { ring: string; border: string; bgSoft: string; bgSolid: string }
> = {
  indigo: {
    ring: "ring-indigo-500/50",
    border: "border-indigo-500/20",
    bgSoft:
      "bg-gradient-to-br from-indigo-500/5 via-indigo-500/0 to-purple-500/5",
    bgSolid:
      "bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-500 text-white",
  },
  emerald: {
    ring: "ring-emerald-500/50",
    border: "border-emerald-500/20",
    bgSoft:
      "bg-gradient-to-br from-emerald-500/5 via-emerald-500/0 to-teal-500/5",
    bgSolid:
      "bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 text-white",
  },
  violet: {
    ring: "ring-violet-500/50",
    border: "border-violet-500/20",
    bgSoft:
      "bg-gradient-to-br from-violet-500/5 via-violet-500/0 to-fuchsia-500/5",
    bgSolid:
      "bg-gradient-to-br from-violet-600 via-violet-500 to-fuchsia-500 text-white",
  },
  amber: {
    ring: "ring-amber-500/40",
    border: "border-amber-500/20",
    bgSoft:
      "bg-gradient-to-br from-amber-500/5 via-amber-500/0 to-orange-500/5",
    bgSolid:
      "bg-gradient-to-br from-amber-600 via-amber-500 to-orange-500 text-slate-950",
  },
  sky: {
    ring: "ring-sky-500/40",
    border: "border-sky-500/20",
    bgSoft:
      "bg-gradient-to-br from-sky-500/5 via-sky-500/0 to-cyan-500/5",
    bgSolid:
      "bg-gradient-to-br from-sky-600 via-sky-500 to-cyan-500 text-slate-950",
  },
  rose: {
    ring: "ring-rose-500/40",
    border: "border-rose-500/20",
    bgSoft:
      "bg-gradient-to-br from-rose-500/5 via-rose-500/0 to-pink-500/5",
    bgSolid:
      "bg-gradient-to-br from-rose-600 via-rose-500 to-pink-500 text-white",
  },
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = "soft",
      accent = "indigo",
      interactive = true,
      ...props
    },
    ref
  ) => {
    const accentStyles = accentMap[accent];

    const base =
      "relative overflow-hidden rounded-2xl border bg-white/80 p-4 text-sm shadow-sm backdrop-blur-xl transition-all duration-300 dark:bg-gray-900/80";

    const variants: Record<NonNullable<CardProps["variant"]>, string> = {
      soft: cn(
        "border-gray-200/80 dark:border-white/10",
        accentStyles.bgSoft
      ),
      solid: cn(
        "border-transparent",
        accentStyles.bgSolid,
        "shadow-md shadow-black/10"
      ),
      outline: cn(
        "border-gray-200/80 dark:border-white/15",
        "bg-gradient-to-br from-gray-50/60 via-gray-950/0 to-gray-900/10 dark:from-gray-900/80 dark:via-gray-950/0 dark:to-gray-950/80"
      ),
    };

    const hover = interactive
      ? "hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/5 dark:hover:shadow-black/30 hover:ring-1 " +
      accentStyles.ring
      : "";

    return (
      <div
        ref={ref}
        className={cn(base, variants[variant], hover, className)}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

export interface CardHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  subtle?: boolean;
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, subtle, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "mb-3 flex items-start justify-between gap-3",
        subtle && "mb-2 text-xs text-gray-500 dark:text-gray-400",
        className
      )}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-sm font-semibold tracking-tight text-gray-900 dark:text-gray-50",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-xs text-gray-500 dark:text-gray-400 leading-relaxed",
      className
    )}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-3", className)} {...props} />
));
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-2", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";


