import { useRef, useEffect } from "react";
import Chart from "chart.js/auto";

interface StatusDistributionChartProps {
    data: Record<string, number>;
}

export function StatusDistributionChart({ data }: StatusDistributionChartProps) {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<Chart | null>(null);

    useEffect(() => {
        if (chartRef.current) {
            const ctx = chartRef.current.getContext("2d");
            if (ctx) {
                if (chartInstance.current) {
                    chartInstance.current.destroy();
                }

                // Status mapping with colors
                const statusOrder = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
                const labels = statusOrder.filter(s => data[s] !== undefined);
                const values = labels.map(s => data[s] || 0);

                if (values.length === 0 || values.every(v => v === 0)) {
                    return;
                }

                const isDark = document.documentElement.classList.contains('dark');
                const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(107, 114, 128, 0.1)';
                const textColor = isDark ? '#9ca3af' : '#6b7280';

                // Color scheme for statuses
                const backgroundColors = [
                    'rgba(59, 130, 246, 0.8)',  // Blue - OPEN
                    'rgba(234, 179, 8, 0.8)',   // Yellow - IN_PROGRESS
                    'rgba(34, 197, 94, 0.8)',   // Green - RESOLVED
                    'rgba(107, 114, 128, 0.8)', // Gray - CLOSED
                ];

                const borderColors = [
                    'rgba(59, 130, 246, 1)',
                    'rgba(234, 179, 8, 1)',
                    'rgba(34, 197, 94, 1)',
                    'rgba(107, 114, 128, 1)',
                ];

                // Map colors to statuses
                const mappedBgColors = labels.map((label) => {
                    const statusIdx = statusOrder.indexOf(label);
                    return backgroundColors[statusIdx] || backgroundColors[0];
                });

                const mappedBorderColors = labels.map((label) => {
                    const statusIdx = statusOrder.indexOf(label);
                    return borderColors[statusIdx] || borderColors[0];
                });

                chartInstance.current = new Chart(ctx, {
                    type: "bar",
                    data: {
                        labels: labels.map(l => l.replace('_', ' ')),
                        datasets: [
                            {
                                label: "Tickets",
                                data: values,
                                backgroundColor: mappedBgColors,
                                borderColor: mappedBorderColors,
                                borderWidth: 2,
                                borderRadius: 8,
                                borderSkipped: false,
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
                                backgroundColor: isDark ? 'rgba(17, 24, 39, 0.95)' : 'rgba(17, 24, 39, 0.9)',
                                titleColor: '#f9fafb',
                                bodyColor: '#e5e7eb',
                                padding: 12,
                                cornerRadius: 8,
                                displayColors: true,
                                callbacks: {
                                    label: (context) => {
                                        const value = context.parsed.y || 0;
                                        // Chart.js datasets can contain numbers, tuples or nulls - handle them safely
                                        const rawData = context.dataset.data as Array<number | [number, number] | null>;
                                        const total = rawData.reduce((sum: number, item) => {
                                            if (Array.isArray(item)) {
                                                // Use the second value in tuple if present
                                                return sum + (item[1] ?? 0);
                                            }
                                            if (typeof item === "number") {
                                                return sum + item;
                                            }
                                            return sum;
                                        }, 0);
                                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                                        return `${context.label}: ${value} (${percentage}%)`;
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
                                    }
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
                                    stepSize: 1,
                                    precision: 0
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
        if (chartInstance.current) {
            const isDark = document.documentElement.classList.contains('dark');
            const textColor = isDark ? '#9ca3af' : '#6b7280';
            const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(107, 114, 128, 0.1)';

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

    const total = Object.values(data).reduce((sum, val) => sum + (val || 0), 0);

    return (
        <div className="relative h-full w-full overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-green-500/20 dark:border-white/10 dark:bg-gray-900 dark:hover:border-green-500/30">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Status Distribution</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Tickets by current status</p>
                </div>
            </div>
            {total > 0 ? (
                <div className="h-[300px] w-full">
                    <canvas ref={chartRef} />
                </div>
            ) : (
                <div className="h-[300px] w-full flex items-center justify-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">No status data available</p>
                </div>
            )}
        </div>
    );
}

