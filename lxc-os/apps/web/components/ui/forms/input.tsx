import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { label, description, error, leftIcon, rightIcon, className, containerClassName, id, ...props },
    ref
  ) => {
    const inputId = id ?? props.name;
    const hasError = Boolean(error);

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="flex items-center gap-1 text-xs font-medium text-gray-700 dark:text-slate-200"
          >
            <span>{label}</span>
          </label>
        )}

        <div
          className={cn(
            "group relative flex items-center rounded-xl border bg-white dark:bg-slate-900/60 px-3 py-2 text-sm text-gray-900 dark:text-slate-100 shadow-sm backdrop-blur-xl",
            "transition-all duration-200",
            "border-gray-200 dark:border-white/10 focus-within:border-indigo-400/80 focus-within:ring-2 focus-within:ring-indigo-500/50",
            "hover:border-indigo-400/60 hover:bg-gray-50 dark:hover:bg-slate-900/80",
            hasError &&
            "border-rose-500/70 focus-within:border-rose-400/90 focus-within:ring-2 focus-within:ring-rose-500/60",
            containerClassName
          )}
        >
          {leftIcon && (
            <div className="mr-2 flex h-5 w-5 items-center justify-center text-xs text-slate-400 group-focus-within:text-indigo-300">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            className={cn(
              "flex-1 bg-transparent text-xs text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none",
              "disabled:cursor-not-allowed disabled:text-slate-500",
              (leftIcon || rightIcon) && "min-w-0",
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="ml-2 flex h-5 w-5 items-center justify-center text-xs text-slate-400 group-focus-within:text-indigo-300">
              {rightIcon}
            </div>
          )}
        </div>

        {(description || error) && (
          <p
            className={cn(
              "text-[11px]",
              hasError ? "text-rose-300" : "text-slate-400"
            )}
          >
            {hasError ? error : description}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";


