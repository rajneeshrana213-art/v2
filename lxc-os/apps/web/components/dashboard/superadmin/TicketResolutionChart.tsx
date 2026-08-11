import { useRef, useEffect } from "react";
import Chart from "chart.js/auto";

interface TicketResolutionChartProps {
    stats: Record<string, number>;
}

export function TicketResolutionChart({ stats }: TicketResolutionChartProps) {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<Chart | null>(null);

    useEffect(() => {
        if (chartRef.current) {
            const ctx = chartRef.current.getContext("2d");
            if (ctx) {
                if (chartInstance.current) {
                    chartInstance.current.destroy();
                }

                const labels = Object.keys(stats);
                const values = Object.values(stats);

                // Colors for different statuses
                const backgroundColors = [
                    'rgba(99, 102, 241, 0.7)', // Indigo
                    'rgba(34, 197, 94, 0.7)',  // Green
                    'rgba(239, 68, 68, 0.7)',  // Red
                    'rgba(234, 179, 8, 0.7)',  // Yellow
                    'rgba(107, 114, 128, 0.7)', // Gray
                ];

                const borderColors = [
                    'rgba(99, 102, 241, 1)',
                    'rgba(34, 197, 94, 1)',
                    'rgba(239, 68, 68, 1)',
                    'rgba(234, 179, 8, 1)',
                    'rgba(107, 114, 128, 1)',
                ];

                chartInstance.current = new Chart(ctx, {
                    type: "doughnut",
                    data: {
                        labels,
                        datasets: [
                            {
                                label: "Tickets",
                                data: values,
                                backgroundColor: backgroundColors,
                                borderColor: borderColors,
                                borderWidth: 1,
                                hoverOffset: 4
                            },
                        ],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: {
                                    usePointStyle: true,
                                    color: '#9ca3af', // Gray-400
                                    font: {
                                        size: 12
                                    }
                                }
                            },
                            tooltip: {
                                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                                padding: 12,
                                cornerRadius: 8,
                            }
                        },
                        cutout: '70%',
                    },
                });
            }
        }

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [stats]);

    return (
        <div className="relative h-full w-full flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-indigo-500/20 dark:border-white/10 dark:bg-gray-900 dark:hover:border-indigo-500/30">
            <div className="mb-4 shrink-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Ticket Resolution</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Distribution of support tickets by status</p>
            </div>
            <div className="flex-1 relative w-full min-h-0 pb-2">
                <canvas ref={chartRef} />
            </div>
        </div>
    );
}
