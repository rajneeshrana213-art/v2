import { useRef, useEffect } from "react";
import Chart from "chart.js/auto";

interface RevenueChartProps {
    data: {
        month: string;
        revenue: number;
    }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<Chart | null>(null);

    useEffect(() => {
        if (chartRef.current) {
            const ctx = chartRef.current.getContext("2d");
            if (ctx) {
                if (chartInstance.current) {
                    chartInstance.current.destroy();
                }

                const labels = data.map((d) => {
                    const [year, month] = d.month.split('-');
                    const date = new Date(parseInt(year), parseInt(month) - 1);
                    return date.toLocaleDateString('default', { month: 'short', year: 'numeric' });
                });
                const values = data.map((d) => d.revenue);

                // Gradient for the chart
                const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                gradient.addColorStop(0, 'rgba(99, 102, 241, 0.5)'); // Indigo
                gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

                chartInstance.current = new Chart(ctx, {
                    type: "line",
                    data: {
                        labels,
                        datasets: [
                            {
                                label: "Monthly Revenue",
                                data: values,
                                backgroundColor: gradient,
                                borderColor: "rgba(99, 102, 241, 1)",
                                borderWidth: 2,
                                fill: true,
                                tension: 0.4,
                                pointRadius: 4,
                                pointHoverRadius: 6,
                                pointBackgroundColor: "rgba(99, 102, 241, 1)",
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
                                titleColor: '#f9fafb',
                                bodyColor: '#e5e7eb',
                                padding: 12,
                                cornerRadius: 8,
                                displayColors: false,
                                callbacks: {
                                    label: (context) => {
                                        return new Intl.NumberFormat('en-IN', {
                                            style: 'currency',
                                            currency: 'INR',
                                            maximumFractionDigits: 0,
                                        }).format(context.parsed.y || 0);
                                    }
                                }
                            }
                        },
                        scales: {
                            x: {
                                grid: {
                                    display: false,
                                },
                                ticks: {
                                    color: '#6b7280',
                                    font: {
                                        size: 11
                                    }
                                }
                            },
                            y: {
                                beginAtZero: true,
                                grid: {
                                    color: 'rgba(107, 114, 128, 0.1)',
                                },
                                ticks: {
                                    color: '#6b7280',
                                    font: {
                                        size: 11
                                    },
                                    callback: (value) => {
                                        if (typeof value === 'number') {
                                            if (value >= 1000000) return `₹${(value / 1000000).toFixed(1)}M`;
                                            if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
                                            return `₹${value}`;
                                        }
                                        return value;
                                    }
                                }
                            }
                        }
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
        <div className="relative h-full w-full overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-indigo-500/20 dark:border-white/10 dark:bg-gray-900 dark:hover:border-indigo-500/30">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Revenue Overview</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Monthly revenue trends</p>
                </div>
            </div>
            <div className="h-[300px] w-full">
                <canvas ref={chartRef} />
            </div>
        </div>
    );
}
