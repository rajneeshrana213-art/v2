import { useRef, useEffect } from "react";
import Chart from "chart.js/auto";

interface ResolutionTimeChartProps {
    data: {
        date: string;
        avgHours: number;
    }[];
}

export function ResolutionTimeChart({ data }: ResolutionTimeChartProps) {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<Chart | null>(null);

    useEffect(() => {
        if (chartRef.current && data.length > 0) {
            const ctx = chartRef.current.getContext("2d");
            if (ctx) {
                if (chartInstance.current) {
                    chartInstance.current.destroy();
                }

                const labels = data.map((d) => {
                    const date = new Date(d.date);
                    return date.toLocaleDateString('default', { month: 'short', day: 'numeric' });
                });
                const values = data.map((d) => d.avgHours);

                const isDark = document.documentElement.classList.contains('dark');
                const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(107, 114, 128, 0.1)';
                const textColor = isDark ? '#9ca3af' : '#6b7280';

                // Gradient for area chart
                const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                gradient.addColorStop(0, 'rgba(168, 85, 247, 0.4)'); // Purple
                gradient.addColorStop(1, 'rgba(168, 85, 247, 0)');

                chartInstance.current = new Chart(ctx, {
                    type: "line",
                    data: {
                        labels,
                        datasets: [
                            {
                                label: "Avg Resolution Time (hours)",
                                data: values,
                                backgroundColor: gradient,
                                borderColor: "rgba(168, 85, 247, 1)",
                                borderWidth: 3,
                                fill: true,
                                tension: 0.4,
                                pointRadius: 4,
                                pointHoverRadius: 6,
                                pointBackgroundColor: "rgba(168, 85, 247, 1)",
                                pointBorderColor: "#fff",
                                pointBorderWidth: 2,
                            },
                        ],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: true,
                                position: 'top',
                                labels: {
                                    color: textColor,
                                    font: {
                                        size: 12
                                    },
                                    usePointStyle: true,
                                    padding: 15
                                }
                            },
                            tooltip: {
                                backgroundColor: isDark ? 'rgba(17, 24, 39, 0.95)' : 'rgba(17, 24, 39, 0.9)',
                                titleColor: '#f9fafb',
                                bodyColor: '#e5e7eb',
                                padding: 12,
                                cornerRadius: 8,
                                displayColors: true,
                                callbacks: {
                                    label: (context) => {
                                        const value = context.parsed.y || 0;
                                        return `Avg Resolution: ${value.toFixed(1)} hours`;
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
                                    color: textColor,
                                    font: {
                                        size: 11
                                    },
                                    maxTicksLimit: 10
                                }
                            },
                            y: {
                                beginAtZero: true,
                                grid: {
                                    color: gridColor,
                                },
                                ticks: {
                                    color: textColor,
                                    font: {
                                        size: 11
                                    },
                                    callback: (value) => {
                                        if (typeof value === 'number') {
                                            return `${value}h`;
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

    const handleDarkModeChange = () => {
        if (chartInstance.current && data.length > 0) {
            const isDark = document.documentElement.classList.contains('dark');
            const textColor = isDark ? '#9ca3af' : '#6b7280';
            const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(107, 114, 128, 0.1)';

            chartInstance.current.options.plugins!.legend!.labels!.color = textColor;
            chartInstance.current.options.scales!.x!.ticks!.color = textColor;
            chartInstance.current.options.scales!.y!.ticks!.color = textColor;
            chartInstance.current.options.scales!.y!.grid!.color = gridColor;
            chartInstance.current.update();
        }
    };

    useEffect(() => {
        const observer = new MutationObserver(handleDarkModeChange);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });
        return () => observer.disconnect();
    }, [data]);

    return (
        <div className="relative h-full w-full overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-purple-500/20 dark:border-white/10 dark:bg-gray-900 dark:hover:border-purple-500/30">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Resolution Time Trends</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Average resolution time over the last 30 days</p>
                </div>
            </div>
            <div className="h-[300px] w-full">
                <canvas ref={chartRef} />
            </div>
        </div>
    );
}

