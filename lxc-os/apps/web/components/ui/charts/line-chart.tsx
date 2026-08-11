import * as React from "react";
import { cn } from "@/lib/utils";

export interface LineChartPoint {
  label: string;
  value: number;
}

export interface LineChartProps {
  data: LineChartPoint[];
  height?: number;
  className?: string;
}

export function LineChart({ data, height = 160, className }: LineChartProps) {
  const width = 400;

  const values = data.map((d) => d.value);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  const points = data.map((point, index) => {
    const x =
      data.length === 1 ? width / 2 : (index / (data.length - 1)) * width;
    const y = height - ((point.value - min) / range) * (height - 20) - 10;
    return { x, y };
  });

  const pathD = points
    .map((p, index) => `${index === 0 ? "M" : "L"} ${p.x},${p.y}`)
    .join(" ");

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 p-4 shadow-sm backdrop-blur-xl",
        "bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.28),_transparent_60%)]",
        className
      )}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-40 w-full overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id="lineGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="50%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
          <linearGradient
            id="areaGradient"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="rgba(129,140,248,0.48)" />
            <stop offset="100%" stopColor="rgba(15,23,42,0.2)" />
          </linearGradient>
        </defs>

        {/* Grid */}
        <g className="stroke-slate-700/70">
          <line x1="0" y1={height - 10} x2={width} y2={height - 10} />
          <line x1="0" y1={10} x2={width} y2={10} className="opacity-40" />
        </g>

        {/* Area */}
        {points.length > 1 && (
          <path
            d={`${pathD} L ${points[points.length - 1].x},${height - 10} L ${
              points[0].x
            },${height - 10} Z`}
            fill="url(#areaGradient)"
            className="opacity-70"
          />
        )}

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth={2.2}
          strokeLinecap="round"
          className="drop-shadow-[0_0_18px_rgba(129,140,248,0.9)]"
        />

        {/* Points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r={3}
              className="fill-slate-900 stroke-indigo-400"
              strokeWidth={1.4}
            />
          </g>
        ))}
      </svg>

      {data.length > 0 && (
        <div className="mt-2 flex items-center justify-between gap-3 text-[10px] text-slate-400">
          {data.map((d, i) => (
            <div key={i} className="min-w-0 text-center">
              <div className="truncate">{d.label}</div>
              <div className="mt-0.5 font-semibold text-slate-100/90">
                {d.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


