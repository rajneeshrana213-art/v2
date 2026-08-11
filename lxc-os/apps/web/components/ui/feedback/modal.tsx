import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  showCloseIcon?: boolean;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  showCloseIcon = true,
}: ModalProps) {
  const dialogRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (open) {
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl transition-opacity"
        onClick={onClose}
      />

      <div
        ref={dialogRef}
        className={cn(
          "relative z-10 w-full rounded-2xl border bg-white/90 dark:bg-slate-950/90 p-5 shadow-2xl backdrop-blur-2xl sm:p-6 transition-all duration-200",
          "border-gray-200 dark:border-white/10",
          "text-gray-900 dark:text-slate-50",
          "shadow-xl dark:shadow-[0_24px_80px_rgba(15,23,42,0.95)]",
          "dark:bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.3),_transparent_60%)]",
          size === "sm" && "max-w-sm",
          size === "md" && "max-w-lg",
          size === "lg" && "max-w-2xl",
          size === "xl" && "max-w-4xl",
          size === "2xl" && "max-w-6xl"
        )}
      >
        {(title || description || showCloseIcon) && (
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              {title && (
                <h2 className="text-sm font-semibold tracking-tight text-gray-900 dark:text-slate-50">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">{description}</p>
              )}
            </div>

            {showCloseIcon && (
              <Button
                variant="ghost"
                type="button"
                onClick={onClose}
                className="h-7 w-7 rounded-full border bg-gray-100 dark:bg-slate-900/60 p-0 text-xs text-gray-500 dark:text-slate-400 border-gray-200 dark:border-white/10 hover:border-rose-400/70 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-200"
              >
                ✕
              </Button>
            )}
          </div>
        )}

        {children && (
          <div className="space-y-3 text-sm text-gray-700 dark:text-slate-200">{children}</div>
        )}

        {footer && (
          <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-gray-100 dark:border-white/10 pt-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}


