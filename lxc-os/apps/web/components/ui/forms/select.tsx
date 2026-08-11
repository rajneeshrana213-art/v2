import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  description?: string;
  error?: string;
  options?: SelectOption[];
  placeholder?: string;
  containerClassName?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, description, error, options, className, containerClassName, id, children, ...props },
    ref
  ) => {
    const selectId = id ?? props.name;
    const hasError = Boolean(error);

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="flex items-center gap-1 text-xs font-medium text-slate-200"
          >
            <span>{label}</span>
          </label>
        )}

        <div
          className={cn(
            "group relative flex items-center rounded-xl border bg-white dark:bg-slate-900/60 text-sm text-gray-900 dark:text-slate-100 shadow-sm backdrop-blur-xl",
            "transition-all duration-200",
            "border-gray-200 dark:border-white/10 focus-within:border-indigo-400/80 focus-within:ring-2 focus-within:ring-indigo-500/50",
            "hover:border-indigo-400/60 hover:bg-gray-50 dark:hover:bg-slate-900/80",
            hasError &&
            "border-rose-500/70 focus-within:border-rose-400/90 focus-within:ring-2 focus-within:ring-rose-500/60",
            containerClassName
          )}
        >
          <select
            id={selectId}
            ref={ref}
            className={cn(
              "w-full bg-transparent text-xs text-gray-900 dark:text-slate-100 outline-none appearance-none px-3 py-2 pr-10",
              "disabled:cursor-not-allowed disabled:text-slate-500",
              className
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  className="bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                >
                  {opt.label}
                </option>
              ))
              : children}
          </select>

          <span className="absolute right-3 pointer-events-none flex h-5 w-5 items-center justify-center text-[10px] text-slate-400 group-focus-within:text-indigo-300">
            ▼
          </span>
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

Select.displayName = "Select";


