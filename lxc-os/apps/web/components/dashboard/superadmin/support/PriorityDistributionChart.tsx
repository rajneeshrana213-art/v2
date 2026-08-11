import { useRef, useEffect } from "react";
import Chart from "chart.js/auto";

interface PriorityDistributionChartProps {
    data: Record<string, number>;
}

export function PriorityDistributionChart({ data }: PriorityDistributionChartProps) {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<Chart | null>(null);

    useEffect(() => {
        if (chartRef.current) {
            const ctx = chartRef.current.getContext("2d");
            if (ctx) {
                if (chartInstance.current) {
                    chartInstance.current.destroy();
                }

                // Priority mapping with colors
                const priorityOrder = ['URGENT', 'HIGH', 'MEDIUM', 'LOW'];
                const labels = priorityOrder.filter(p => data[p] !== undefined && data[p] > 0);
                const values = labels.map(p => data[p] || 0);

                if (values.length === 0) {
                    // Show empty state
                    return;
                }

                const isDark = document.documentElement.classList.contains('dark');
                const textColor = isDark ? '#9ca3af' : '#6b7280';

                // Color scheme for priorities
                const backgroundColors = [
                    'rgba(239, 68, 68, 0.8)',  // Red - URGENT
                    'rgba(249, 115, 22, 0.8)', // Orange - HIGH
                    'rgba(234, 179, 8, 0.8)',  // Yellow - MEDIUM
                    'rgba(107, 114, 128, 0.8)', // Gray - LOW
                ];

                const borderColors = [
                    'rgba(239, 68, 68, 1)',
                    'rgba(249, 115, 22, 1)',
                    'rgba(234, 179, 8, 1)',
                    'rgba(107, 114, 128, 1)',
                ];

                // Map colors to priorities
                const mappedBgColors = labels.map((label, idx) => {
                    const priorityIdx = priorityOrder.indexOf(label);
                    return backgroundColors[priorityIdx] || backgroundColors[0];
                });

                const mappedBorderColors = labels.map((label, idx) => {
                    const priorityIdx = priorityOrder.indexOf(label);
                    return borderColors[priorityIdx] || borderColors[0];
                });

                chartInstance.current = new Chart(ctx, {
                    type: "doughnut",
                    data: {
                        labels,
                        datasets: [
                            {
                                label: "Tickets",
                                data: values,
                                backgroundColor: mappedBgColors,
                                borderColor: mappedBorderColors,
                                borderWidth: 2,
                                hoverOffset: 8
                            },
                        ],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'right',
                                labels: {
                                    usePointStyle: true,
                                    color: textColor,
                                    font: {
                                        size: 12
                                    },
                                    padding: 15,
                                    generateLabels: (chart) => {
                                        const data = chart.data;
                                        if (data.labels && data.datasets) {
                                            return data.labels.map((label, i) => {
                                                const dataset = data.datasets[0];
                                                const value = Array.isArray(dataset.data) ? dataset.data[i] : 0;
                                                return {
                                                    text: `${label}: ${value}`,
                                                    fillStyle: Array.isArray(dataset.backgroundColor) 
                                                        ? dataset.backgroundColor[i] as string 
                                                        : '#000',
                                                    strokeStyle: Array.isArray(dataset.borderColor) 
                                                        ? dataset.borderColor[i] as string 
                                                        : '#000',
                                                    lineWidth: 2,
                                                    hidden: false,
                                                    index: i
                                                };
                                            });
                                        }
                                        return [];
                                    }
                                }
                            },
                            tooltip: {
                                backgroundColor: isDark ? 'rgba(17, 24, 39, 0.95)' : 'rgba(17, 24, 39, 0.9)',
                                titleColor: '#f9fafb',
                                bodyColor: '#e5e7eb',
                                padding: 12,
                                cornerRadius: 8,
                                callbacks: {
                                    label: (context) => {
                                        const label = context.label || '';
                                        const value = context.parsed || 0;
                                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0) as number;
                                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                                        return `${label}: ${value} (${percentage}%)`;
                                    }
                                }
                            }
                        },
                        cutout: '65%',
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
            chartInstance.current.options.plugins!.legend!.labels!.color = textColor;
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
        <div className="relative h-full w-full overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-orange-500/20 dark:border-white/10 dark:bg-gray-900 dark:hover:border-orange-500/30">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Priority Distribution</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Tickets by priority level</p>
                </div>
            </div>
            {total > 0 ? (
                <div className="h-[300px] w-full flex items-center justify-center">
                    <canvas ref={chartRef} />
                </div>
            ) : (
                <div className="h-[300px] w-full flex items-center justify-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">No priority data available</p>
                </div>
            )}
        </div>
    );
}

