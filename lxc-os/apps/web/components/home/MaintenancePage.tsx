import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';

// Rolling Odometer Digit Component
const RollingDigit = React.memo(({ value }: { value: number }) => {
    return (
        <div className="relative h-14 md:h-24 w-10 md:w-16 overflow-hidden bg-white/40 border border-white/60 backdrop-blur-xl rounded-xl shadow-inner flex flex-col items-center">
            <motion.div
                animate={{ y: `-${value * 10}%` }}
                transition={{
                    type: "tween",
                    duration: 0.6,
                    ease: "easeInOut"
                }}
                className="flex flex-col"
            >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <div
                        key={num}
                        className="h-14 md:h-24 flex items-center justify-center shrink-0"
                    >
                        <span className="text-3xl md:text-6xl font-semibold text-slate-800 tabular-nums">
                            {num}
                        </span>
                    </div>
                ))}
            </motion.div>

            {/* Optical Overlay for "Bike Meter" depth */}
            <div className="absolute inset-0 pointer-events-none rounded-xl"
                style={{
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.05) 100%)'
                }}
            />
        </div>
    );
});

RollingDigit.displayName = 'RollingDigit';

const CountdownItem = React.memo(({ value, label }: { value: number; label: string }) => {
    const d1 = Math.floor(value / 10);
    const d2 = value % 10;

    return (
        <div className="flex flex-col items-center">
            <div className="flex gap-1 md:gap-2">
                {/* Support for hundreds/thousands if needed, but here simple two-digit logic */}
                {value >= 100 && (
                    <RollingDigit value={Math.floor(value / 100)} />
                )}
                <RollingDigit value={d1 % 10} />
                <RollingDigit value={d2} />
            </div>
            <span className="mt-4 text-[10px] md:text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                {label}
            </span>
        </div>
    );
});

CountdownItem.displayName = 'CountdownItem';

const MaintenancePage = () => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const startDate = new Date('2026-03-01T00:00:00').getTime();
        const targetDate = new Date('2026-04-01T00:00:00').getTime();

        const updateTimer = () => {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance < 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                setProgress(100);
                return;
            }

            setTimeLeft({
                days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((distance % (1000 * 60)) / 1000),
            });

            const totalGrace = targetDate - startDate;
            const elapsed = now - startDate;
            const calculatedProgress = Math.min(Math.max((elapsed / totalGrace) * 100, 0), 100);
            setProgress(calculatedProgress);
        };

        updateTimer();
        const timer = setInterval(updateTimer, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-900 relative overflow-hidden font-sans selection:bg-indigo-100">
            <Head>
                <title>Launching Soon | LearnXChain 2026</title>
                <meta name="description" content="A new era of decentralized learning begins April 1st." />
            </Head>

            {/* Modern Light Background Architecture */}
            <div className="fixed inset-0 -z-10 bg-slate-50">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.08)_0%,transparent_50%)]" />
                <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,rgba(168,85,247,0.08)_0%,transparent_50%)]" />

                {/* Floating Meshes */}
                <motion.div
                    animate={{ scale: [1, 1.05, 1], x: [0, 20, 0] }}
                    transition={{ duration: 15, repeat: Infinity }}
                    className="absolute top-1/4 -left-[10%] w-[600px] h-[600px] bg-indigo-100/40 blur-[120px] rounded-full"
                />

                <div className="absolute inset-0 opacity-[0.3]"
                    style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/micro-carbon.png")' }} />
            </div>

            <main className="relative z-10 w-full max-w-5xl px-6 py-12 flex flex-col items-center">
                {/* Evolution Label */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10 px-5 py-2 rounded-full bg-white border border-slate-200 shadow-sm flex items-center gap-3"
                >
                    <div className="relative">
                        <span className="flex h-2 w-2 rounded-full bg-indigo-500" />
                        <span className="absolute inset-0 rounded-full bg-indigo-400 animate-ping" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                        System Synchronization Active
                    </span>
                </motion.div>

                {/* Simplified Hero Content */}
                <div className="text-center mb-16 space-y-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-2xl md:text-5xl font-medium tracking-tight text-slate-800"
                    >
                        New Session, New Beginning
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-slate-400 text-sm md:text-lg font-medium max-w-xl mx-auto"
                    >
                        Evolving our platform for the next generation. <br className="hidden md:block" />
                        Launch arriving on <span className="text-indigo-600 font-semibold text-base md:text-xl">April 1st, 2026</span>
                    </motion.p>
                </div>

                {/* Sequential Rolling Odometer Timer */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-wrap justify-center gap-4 md:gap-12 mb-20"
                >
                    <CountdownItem value={timeLeft.days} label="Days" />
                    <CountdownItem value={timeLeft.hours} label="Hours" />
                    <CountdownItem value={timeLeft.minutes} label="Mins" />
                    <CountdownItem value={timeLeft.seconds} label="Secs" />
                </motion.div>

                {/* Progress Bar Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="w-full max-w-3xl space-y-6"
                >
                    <div className="flex justify-between items-center px-2">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Migration Progress</span>
                            <span className="text-xs font-bold text-slate-800">LearnXChain Build 2.0</span>
                        </div>
                        <motion.span
                            key={Math.round(progress)}
                            initial={{ scale: 1.2, color: '#4f46e5' }}
                            animate={{ scale: 1, color: '#1e293b' }}
                            className="text-xl md:text-3xl font-black text-slate-800"
                        >
                            {Math.round(progress)}%
                        </motion.span>
                    </div>

                    <div className="h-6 w-full bg-slate-200/50 rounded-2xl overflow-hidden p-1.5 border border-slate-200 shadow-inner">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 2, ease: "circOut" }}
                            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-xl relative overflow-hidden"
                        >
                            {/* Stripe Animation */}
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:32px_32px] animate-[stripes_1s_linear_infinite]" />

                            {/* Glow Tip */}
                            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/30 blur-sm" />
                        </motion.div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 opacity-50">
                        {["Security Audit", "UX Refinement", "AI Integration", "Database Migration"].map(tag => (
                            <span key={tag} className="text-[9px] font-black uppercase tracking-widest text-slate-600">
                                &bull; {tag}
                            </span>
                        ))}
                    </div>
                </motion.div>

                {/* Branding Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="mt-24 pt-10 border-t border-slate-200 w-full text-center"
                >
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.4em] mb-4">
                        Trusted by School's Worldwide
                    </p>
                    <div className="flex items-center justify-center gap-10 grayscale opacity-40 hover:opacity-70 transition-all">
                        <div className="h-6 w-12 bg-slate-400 rounded-lg" />
                        <div className="h-6 w-12 bg-slate-400 rounded-lg" />
                        <div className="h-6 w-12 bg-slate-400 rounded-lg" />
                    </div>
                </motion.div>
            </main>

            <style jsx global>{`
        @keyframes stripes {
          from { background-position: 0 0; }
          to { background-position: 32px 0; }
        }
        body {
          background-color: #f8fafc;
        }
      `}</style>
        </div>
    );
};

export default MaintenancePage;
