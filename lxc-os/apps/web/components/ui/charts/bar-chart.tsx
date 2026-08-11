
import * as React from "react";
import { cn } from "@/lib/utils";

export interface BarChartItem {
    label: string;
    value: number;
    color?: string;
}

export interface BarChartProps {
    data: BarChartItem[];
    height?: number;
    className?: string;
}

export function BarChart({ data, height = 200, className }: BarChartProps) {
    const max = Math.max(...data.map((d) => d.value), 1);

    return (
        <div className={cn("space-y-4", className)}>
            {data.map((item, index) => (
                <div key={index} className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-medium">
                        <span className="text-gray-500 dark:text-gray-400">{item.label}</span>
                        <span className="text-gray-900 dark:text-white">{item.value}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                        <div
                            className={cn(
                                "h-full rounded-full transition-all duration-500",
                                item.color || "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]"
                            )}
                            style={{ width: `${(item.value / max) * 100}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
