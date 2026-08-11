import * as React from "react";
import { cn } from "@/lib/utils";

export interface SidebarNavItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  badge?: React.ReactNode;
}

export interface SidebarProps {
  items: SidebarNavItem[];
  activeKey?: string;
  onItemClick?: (item: SidebarNavItem) => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function Sidebar({
  items,
  activeKey,
  onItemClick,
  header,
  footer,
  className,
}: SidebarProps) {
  return (
    <div
      className={cn(
        "flex h-full min-h-screen w-64 flex-col border-r border-white/10 bg-slate-950/60 px-4 py-4 shadow-[0_0_0_1px_rgba(148,163,184,0.25)] backdrop-blur-2xl",
        "bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.25),_transparent_55%)]",
        className
      )}
    >
      {header && <div className="mb-4">{header}</div>}

      <nav className="flex-1 space-y-1">
        {items.map((item) => {
          const isActive = item.key === activeKey;

          const content = (
            <div
              className={cn(
                "group flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium",
                "transition-all duration-200",
                "text-slate-200/85 hover:text-white",
                "hover:bg-slate-800/70 hover:shadow-[0_8px_24px_rgba(15,23,42,0.7)] hover:-translate-y-[1px]",
                isActive &&
                  "bg-gradient-to-r from-indigo-500/90 via-indigo-500 to-indigo-400 text-white shadow-[0_18px_45px_rgba(79,70,229,0.55)]"
              )}
            >
              {item.icon && (
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg border border-white/5 bg-slate-900/80 text-slate-300 shadow-sm",
                    "group-hover:border-indigo-400/60 group-hover:bg-indigo-500/10 group-hover:text-white",
                    isActive &&
                      "border-transparent bg-indigo-400/15 text-white shadow-md shadow-indigo-500/40"
                  )}
                >
                  {item.icon}
                </span>
              )}
              <span className="truncate">{item.label}</span>
              {item.badge && (
                <span className="ml-auto shrink-0 text-xs text-indigo-200">
                  {item.badge}
                </span>
              )}
            </div>
          );

          if (item.href) {
            return (
              <a
                key={item.key}
                href={item.href}
                onClick={(e) => {
                  if (onItemClick) {
                    e.preventDefault();
                    onItemClick(item);
                  }
                }}
              >
                {content}
              </a>
            );
          }

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onItemClick?.(item)}
              className="w-full text-left"
            >
              {content}
            </button>
          );
        })}
      </nav>

      {footer && <div className="mt-4 pt-4 border-t border-white/5">{footer}</div>}
    </div>
  );
}


