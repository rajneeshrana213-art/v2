import React from 'react';

interface LoaderProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    variant?: 'primary' | 'white';
}

/**
 * Reusable Loader component based on a premium minimal spinning arc design.
 */
export const Loader: React.FC<LoaderProps> = ({
    size = 'md',
    className = '',
    variant = 'primary'
}) => {
    const sizeMap = {
        sm: { box: 24, stroke: 1.2, r1: 10, r2: 7, r3: 4 },
        md: { box: 40, stroke: 1.5, r1: 17, r2: 12, r3: 7 },
        lg: { box: 64, stroke: 2, r1: 28, r2: 20, r3: 12 },
        xl: { box: 96, stroke: 2.5, r1: 42, r2: 30, r3: 18 },
    };

    const currentSize = sizeMap[size];
    const center = currentSize.box / 2;

    const colors = {
        primary: {
            main: '#4f46e5',
            glow: 'rgba(79, 70, 229, 0.4)',
            track: 'rgba(79, 70, 229, 0.05)'
        },
        white: {
            main: '#ffffff',
            glow: 'rgba(255, 255, 255, 0.3)',
            track: 'rgba(255, 255, 255, 0.05)'
        }
    };

    const theme = colors[variant];

    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            <style jsx>{`
        .arc-1 { animation: orbit-1 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
        .arc-2 { animation: orbit-2 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
        .arc-3 { animation: orbit-3 1.0s cubic-bezier(0.4, 0, 0.2, 1) infinite; }

        @keyframes orbit-1 {
          0% { stroke-dasharray: 1, 200; stroke-dashoffset: 0; transform: rotate(0deg); }
          50% { stroke-dasharray: 80, 200; stroke-dashoffset: -30; }
          100% { stroke-dasharray: 1, 200; stroke-dashoffset: -180; transform: rotate(360deg); }
        }
        @keyframes orbit-2 {
          0% { stroke-dasharray: 1, 200; stroke-dashoffset: 0; transform: rotate(120deg); }
          50% { stroke-dasharray: 40, 200; stroke-dashoffset: -15; }
          100% { stroke-dasharray: 1, 200; stroke-dashoffset: -100; transform: rotate(480deg); }
        }
        @keyframes orbit-3 {
          0% { stroke-dasharray: 1, 200; stroke-dashoffset: 0; transform: rotate(240deg); }
          50% { stroke-dasharray: 20, 200; stroke-dashoffset: -10; }
          100% { stroke-dasharray: 1, 200; stroke-dashoffset: -60; transform: rotate(600deg); }
        }
      `}</style>

            <div className="relative">
                <svg
                    width={currentSize.box}
                    height={currentSize.box}
                    viewBox={`0 0 ${currentSize.box} ${currentSize.box}`}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="overflow-visible"
                >
                    <defs>
                        <filter id={`glow-${variant}`} x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="1.5" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    {/* Layer 1: Outer Arc */}
                    <circle
                        cx={center}
                        cy={center}
                        r={currentSize.r1}
                        stroke={theme.main}
                        strokeWidth={currentSize.stroke}
                        strokeLinecap="round"
                        className="arc-1 origin-center"
                        style={{ filter: `drop-shadow(0 0 2px ${theme.glow})`, opacity: 0.9 }}
                    />

                    {/* Layer 2: Middle Arc */}
                    <circle
                        cx={center}
                        cy={center}
                        r={currentSize.r2}
                        stroke={theme.main}
                        strokeWidth={currentSize.stroke * 0.8}
                        strokeLinecap="round"
                        className="arc-2 origin-center"
                        style={{ filter: `drop-shadow(0 0 1.5px ${theme.glow})`, opacity: 0.6 }}
                    />

                    {/* Layer 3: Inner Arc */}
                    <circle
                        cx={center}
                        cy={center}
                        r={currentSize.r3}
                        stroke={theme.main}
                        strokeWidth={currentSize.stroke * 0.6}
                        strokeLinecap="round"
                        className="arc-3 origin-center"
                        style={{ filter: `drop-shadow(0 0 1px ${theme.glow})`, opacity: 0.4 }}
                    />
                </svg>
            </div>
        </div>
    );
};

export default Loader;
