
import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface RealtimeLatencyChartProps {
    currentLatency: number;
}

export function RealtimeLatencyChart({ currentLatency }: RealtimeLatencyChartProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<Chart | null>(null);
    const dataPointsRef = useRef<number[]>(new Array(30).fill(0));

    useEffect(() => {
        // Update data
        dataPointsRef.current.push(currentLatency);
        dataPointsRef.current.shift();

        // Update chart if exists
        if (chartRef.current) {
            chartRef.current.data.datasets[0].data = dataPointsRef.current;
            chartRef.current.update('none'); // 'none' mode for perf
        }
    }, [currentLatency]);

    useEffect(() => {
        if (!canvasRef.current) return;

        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        // Gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.5)'); // Indigo 500
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

        chartRef.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels: new Array(30).fill(''),
                datasets: [{
                    label: 'API Latency (ms)',
                    data: dataPointsRef.current,
                    borderColor: '#6366f1',
                    backgroundColor: gradient,
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: true,
                        mode: 'index',
                        intersect: false,
                    }
                },
                scales: {
                    x: {
                        display: false,
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        display: true,
                        beginAtZero: true,
                        suggestedMax: 100,
                        grid: {
                            color: 'rgba(156, 163, 175, 0.1)',
                        },
                        ticks: {
                            color: '#9ca3af',
                            font: {
                                size: 10
                            }
                        },
                        border: {
                            display: false
                        }
                    }
                }
            }
        });

        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
                chartRef.current = null;
            }
        };
    }, []);

    return (
        <div className="h-64 w-full">
            <canvas ref={canvasRef} />
        </div>
    );
}
