import * as React from "react";
import { cn } from "@/lib/utils";

export type ToastVariant = "default" | "success" | "error" | "warning" | "info";

export interface ToastProps {
  id?: string | number;
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: ToastVariant;
  icon?: React.ReactNode;
  onClose?: () => void;
  duration?: number;
}

const variantClasses: Record<ToastVariant, string> = {
  default:
    "border-white/15 bg-slate-950/85 text-slate-50 shadow-[0_18px_60px_rgba(15,23,42,0.9)]",
  success:
    "border-emerald-400/40 bg-emerald-500/10 text-emerald-50 shadow-[0_18px_50px_rgba(16,185,129,0.55)]",
  error:
    "border-rose-400/40 bg-rose-500/10 text-rose-50 shadow-[0_18px_50px_rgba(244,63,94,0.65)]",
  warning:
    "border-amber-400/40 bg-amber-500/10 text-amber-50 shadow-[0_18px_50px_rgba(245,158,11,0.55)]",
  info: "border-sky-400/40 bg-sky-500/10 text-sky-50 shadow-[0_18px_50px_rgba(56,189,248,0.55)]",
};

export function Toast({
  title,
  description,
  variant = "default",
  icon,
  onClose,
  duration,
}: ToastProps) {
  React.useEffect(() => {
    // No automatic dismissal as per user request
  }, [duration, onClose]);

  return (
    <div
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 text-xs backdrop-blur-2xl",
        "bg-[radial-gradient(circle_at_top,_rgba(248,250,252,0.18),_transparent_55%)]",
        variantClasses[variant]
      )}
    >
      {icon && (
        <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/20 text-[13px]">
          {icon}
        </div>
      )}

      <div className="min-w-0 flex-1">
        {title && (
          <p className="truncate text-[13px] font-semibold leading-tight">
            {title}
          </p>
        )}
        {description && (
          <p className="mt-0.5 text-[11px] text-slate-200/80">
            {description}
          </p>
        )}
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] text-slate-300/80 hover:bg-white/10 hover:text-white"
        >
          ✕
        </button>
      )}
    </div>
  );
}


