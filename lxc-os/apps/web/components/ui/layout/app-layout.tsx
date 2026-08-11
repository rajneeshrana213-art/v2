import * as React from "react";
import { cn } from "@/lib/utils";

export interface AppLayoutProps {
    sidebar?: React.ReactNode;
    topbar?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}

export function AppLayout({
    sidebar,
    topbar,
    children,
    className,
}: AppLayoutProps) {
    return (
        <div
            className={cn(
                "flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50",
                "bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.18),_transparent_55%),_radial-gradient(circle_at_bottom,_rgba(56,189,248,0.15),_transparent_55%)]",
                className
            )}
        >
            {sidebar && (
                <aside className="hidden border-r border-white/10 bg-slate-950/40/40 backdrop-blur-xl lg:block">
                    {sidebar}
                </aside>
            )}

            <div className="flex min-h-screen flex-1 flex-col">
                {topbar && <header className="sticky top-0 z-30">{topbar}</header>}

                <main className="flex-1">
                    <div className="mx-auto flex max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}


