import { useRef, useEffect } from "react";
import Chart from "chart.js/auto";

interface EmployeeGrowthChartProps {
    data: { month: string; count: number }[];
}

export function EmployeeGrowthChart({ data }: EmployeeGrowthChartProps) {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<Chart | null>(null);

    useEffect(() => {
        if (chartRef.current) {
            const ctx = chartRef.current.getContext("2d");
            if (ctx) {
                if (chartInstance.current) {
                    chartInstance.current.destroy();
                }

                const labels = data.map(d => {
                    const [year, month] = d.month.split('-');
                    const date = new Date(parseInt(year), parseInt(month) - 1);
                    return date.toLocaleDateString('default', { month: 'short', year: 'numeric' });
                });
                const values = data.map(d => d.count);

                chartInstance.current = new Chart(ctx, {
                    type: "line",
                    data: {
                        labels,
                        datasets: [
                            {
                                label: "New Employees",
                                data: values,
                                backgroundColor: (context) => {
                                    const ctx = context.chart.ctx;
                                    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                                    gradient.addColorStop(0, "rgba(99, 102, 241, 0.5)"); // Indigo
                                    gradient.addColorStop(1, "rgba(99, 102, 241, 0.0)");
                                    return gradient;
                                },
                                borderColor: 'rgba(99, 102, 241, 1)',
                                borderWidth: 2,
                                fill: true,
                                tension: 0.4,
                                pointBackgroundColor: 'rgba(99, 102, 241, 1)',
                                pointBorderColor: '#fff',
                                pointBorderWidth: 2,
                                pointRadius: 4,
                                pointHoverRadius: 6,
                            },
                        ],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false,
                            },
                            tooltip: {
                                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                                padding: 12,
                                cornerRadius: 8,
                                callbacks: {
                                    title: (context) => context[0].label,
                                    label: (context) => `New Employees: ${context.parsed.y}`
                                }
                            }
                        },
                        scales: {
                            x: {
                                grid: {
                                    display: false,
                                },
                                border: {
                                    display: false
                                },
                                ticks: {
                                    color: '#9ca3af',
                                    font: {
                                        size: 11
                                    }
                                }
                            },
                            y: {
                                beginAtZero: true,
                                grid: {
                                    color: 'rgba(156, 163, 175, 0.1)',
                                },
                                border: {
                                    display: false
                                },
                                ticks: {
                                    color: '#9ca3af',
                                    precision: 0,
                                    font: {
                                        size: 11
                                    }
                                }
                            }
                        },
                        interaction: {
                            intersect: false,
                            mode: 'index',
                        },
                    },
                });
            }
        }

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [data]);

    return (
        <div className="relative h-full w-full flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-indigo-500/20 dark:border-white/10 dark:bg-gray-900 dark:hover:border-indigo-500/30">
            <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 shrink-0">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Employee Growth</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">New employee registrations over time</p>
                </div>
                {data.length > 0 && (
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="flex items-center text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-full whitespace-nowrap">
                            +{data[data.length - 1].count} this month
                        </span>
                    </div>
                )}
            </div>
            <div className="flex-1 relative w-full min-h-0 pb-2">
                <canvas ref={chartRef} />
            </div>
        </div>
    );
}
