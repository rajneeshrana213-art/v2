'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    UserPlus,
    CreditCard,
    Bus,
    BookOpen,
    FileText,
    Briefcase,
    Users,
    BookMarked,
    Calendar,
    MessageCircle,
    Award,
    BarChart3,
    CheckCircle2,
} from 'lucide-react';

const STEP_MS = 740;

const lifecycleSteps = [
    { id: 'admission', title: 'Admission', desc: 'Registration & enquiry', icon: UserPlus },
    { id: 'fees', title: 'Fees', desc: 'Collection & tracking', icon: CreditCard },
    { id: 'transport', title: 'Transport', desc: 'Commute & hostel', icon: Bus },
    { id: 'library', title: 'Library', desc: 'Digital resources', icon: BookMarked },
    { id: 'timetable', title: 'Timetable', desc: 'Smart scheduling', icon: Calendar },
    { id: 'academic', title: 'Academic', desc: 'Attendance & learning', icon: BookOpen },
    { id: 'exams', title: 'Exams', desc: 'Tests & results', icon: FileText },
    { id: 'grievance', title: 'Grievance', desc: 'Support & resolution', icon: MessageCircle },
    { id: 'certificates', title: 'Certificates', desc: 'Digital issuance', icon: Award },
    { id: 'placement', title: 'Placement', desc: 'Career excellence', icon: Briefcase },
    { id: 'analytics', title: 'Analytics', desc: 'Institutional insights', icon: BarChart3 },
    { id: 'alumni', title: 'Alumni', desc: 'Lifelong connections', icon: Users },
];

// Snake layout: Row 0 LTR [0->3], Row 1 RTL displayed as [7,6,5,4], Row 2 LTR [8->11]
const DISPLAY_ROWS: number[][] = [
    [0, 1, 2, 3],
    [7, 6, 5, 4],
    [8, 9, 10, 11],
];

// Col 3 center ~89.5%, Col 0 center ~10.5%
const TURN_PCT = ['89.5%', '10.5%'];

function connActive(isRTL: boolean, rowSteps: number[], colIdx: number, active: number): boolean {
    return isRTL ? active === rowSteps[colIdx + 1] : active === rowSteps[colIdx];
}

const StudentLifecycle = () => {
    const [active, setActive] = useState(-1);
    const [cycles, setCycles] = useState(0);
    const [flipping, setFlipping] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setActive(0), 900);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        if (active < 0) return;
        const t = setTimeout(() => {
            if (active >= lifecycleSteps.length - 1) {
                setFlipping(true);
                setTimeout(() => {
                    setFlipping(false);
                    setCycles(c => c + 1);
                    setActive(0);
                }, 1000);
            } else {
                setActive(a => a + 1);
            }
        }, STEP_MS);
        return () => clearTimeout(t);
    }, [active]);

    return (
        <section className="relative overflow-hidden py-20 sm:py-28
            bg-gradient-to-br from-gray-50 via-white to-gray-100
            dark:from-[#05070B] dark:via-[#070B11] dark:to-[#05070B]">

            {/* CSS keyframes */}
            <style>{`
                @keyframes lxcLTR {
                    0%   { left: -6%;  opacity: 0; }
                    10%  { opacity: 1; }
                    90%  { opacity: 1; }
                    100% { left: 106%; opacity: 0; }
                }
                @keyframes lxcRTL {
                    0%   { left: 106%; opacity: 0; }
                    10%  { opacity: 1; }
                    90%  { opacity: 1; }
                    100% { left: -6%;  opacity: 0; }
                }
                @keyframes lxcDOWN {
                    0%   { top: -6%;  opacity: 0; }
                    10%  { opacity: 1; }
                    90%  { opacity: 1; }
                    100% { top: 106%; opacity: 0; }
                }
                @keyframes lxcRING {
                    0%   { box-shadow: 0 0 0 0   rgba(0, 87, 200, 0.55); }
                    70%  { box-shadow: 0 0 0 10px rgba(0, 87, 200, 0);   }
                    100% { box-shadow: 0 0 0 0   rgba(0, 87, 200, 0);   }
                }
            `}</style>

            {/* Dot-grid background */}
            <div className="absolute inset-0 pointer-events-none opacity-60 dark:opacity-30"
                style={{
                    backgroundImage: 'radial-gradient(circle, rgba(0, 87, 200, 0.15) 1px, transparent 1px)',
                    backgroundSize: '30px 30px',
                }} />

            {/* Ambient blobs */}
            <motion.div
                animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-20 left-1/4 w-[450px] h-[450px] rounded-full blur-[130px] pointer-events-none
                    bg-[#0057C8]/10 dark:bg-[#0057C8]/20"
            />
            <motion.div
                animate={{ x: [0, -25, 0], y: [0, 18, 0] }}
                transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-20 right-1/4 w-[380px] h-[380px] rounded-full blur-[110px] pointer-events-none
                    bg-[#5CDD2B]/10 dark:bg-[#5CDD2B]/15"
            />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">

                {/* Header */}
                <motion.div
                    className="text-center mb-14"
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.55 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 text-xs font-bold tracking-[0.16em] uppercase
                        bg-[#0057C8]/5 border border-[#0057C8]/20 text-[#0057C8]
                        dark:bg-[#0057C8]/20 dark:border-[#0057C8]/30 dark:text-[#1A9FFF]">
                        Student Journey
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-4
                        text-gray-900 dark:text-white">
                        Student Lifecycle -{' '}
                        <span className="text-[#0057C8] dark:text-[#1A9FFF]">Admission to Alumni</span>
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg max-w-xl mx-auto">
                        Experience the complete journey with LearnXChain's integrated ecosystem.
                    </p>
                </motion.div>

                {/* Flow Diagram */}
                <div className="select-none">
                    {DISPLAY_ROWS.map((rowSteps, rowIdx) => {
                        const isRTL = rowIdx === 1;
                        const hasTurn = rowIdx < DISPLAY_ROWS.length - 1;

                        return (
                            <div key={rowIdx}>
                                {/* Node + Connector Row */}
                                <div className="flex items-center">
                                    {rowSteps.map((stepIdx, colIdx) => {
                                        const step = lifecycleSteps[stepIdx];
                                        const Icon = step.icon;
                                        const isActive = active === stepIdx;
                                        const isDone = active > stepIdx;
                                        const hasConn = colIdx < rowSteps.length - 1;
                                        const connLit = hasConn && connActive(isRTL, rowSteps, colIdx, active);

                                        return (
                                            <React.Fragment key={step.id}>
                                                {/* NODE CARD */}
                                                <div className="flex-[4] min-w-0 py-3 flex justify-center">
                                                    <motion.div
                                                        className={`relative w-full max-w-[164px] rounded-2xl border-2 p-4 text-center
                                                            transition-all duration-300 cursor-default overflow-visible
                                                            ${isActive
                                                                ? 'border-[#0057C8] bg-[#0057C8]/5 dark:bg-[#0057C8]/10 shadow-xl shadow-[#0057C8]/10 dark:shadow-[#0057C8]/20'
                                                                : isDone
                                                                    ? 'border-[#5CDD2B]/30 dark:border-[#5CDD2B]/20 bg-[#5CDD2B]/5 dark:bg-[#5CDD2B]/5'
                                                                    : 'border-gray-200/80 dark:border-white/[0.07] bg-white/90 dark:bg-white/[0.025] hover:border-[#0057C8]/30 dark:hover:border-[#0057C8]/40'
                                                            }`}
                                                        style={isActive ? { animation: 'lxcRING 1.6s ease-out infinite' } : undefined}
                                                        animate={flipping ? { rotateY: [0, 180, 360] } : {}}
                                                        transition={{ duration: 0.5, delay: (stepIdx % 4) * 0.07 }}
                                                    >
                                                        {/* Step badge */}
                                                        <div className={`absolute -top-3 -right-2.5 z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center
                                                            text-[12px] font-black transition-all duration-300
                                                            ${isActive
                                                                ? 'bg-[#0057C8] border-[#0057C8] text-white shadow-md shadow-[#0057C8]/30'
                                                                : isDone
                                                                    ? 'bg-white dark:bg-[#0A0F14] border-[#5CDD2B] dark:border-[#5CDD2B] text-[#4BBD22] dark:text-[#5CDD2B]'
                                                                    : 'bg-white dark:bg-[#0A0F14] border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-600'
                                                            }`}>
                                                            {isDone
                                                                ? <CheckCircle2 size={12} className="text-emerald-500 dark:text-emerald-400" />
                                                                : stepIdx + 1
                                                            }
                                                        </div>

                                                        {/* Icon */}
                                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3
                                                            transition-all duration-300
                                                            ${isActive
                                                                ? 'bg-[#0057C8] shadow-lg shadow-[#0057C8]/20'
                                                                : isDone
                                                                    ? 'bg-[#5CDD2B]/10 dark:bg-[#5CDD2B]/20'
                                                                    : 'bg-gray-100 dark:bg-white/[0.05]'
                                                            }`}>
                                                            <Icon
                                                                size={22}
                                                                className={`transition-colors duration-300
                                                                    ${isActive
                                                                        ? 'text-white'
                                                                        : isDone
                                                                            ? 'text-[#4BBD22] dark:text-[#5CDD2B]'
                                                                            : 'text-gray-400 dark:text-gray-600'
                                                                    }`}
                                                            />
                                                        </div>

                                                        {/* Title */}
                                                        <p className={`text-[13.5px] font-bold leading-snug transition-colors duration-300
                                                            ${isActive ? 'text-[#0057C8] dark:text-[#1A9FFF]'
                                                                : isDone ? 'text-gray-700 dark:text-gray-400'
                                                                    : 'text-gray-400 dark:text-gray-600'}`}>
                                                            {step.title}
                                                        </p>

                                                        {/* Desc */}
                                                        <p className={`text-[11px] mt-0.5 leading-snug hidden md:block transition-colors duration-300
                                                            ${(isActive || isDone)
                                                                ? 'text-gray-400 dark:text-gray-600'
                                                                : 'text-gray-300 dark:text-gray-800'}`}>
                                                            {step.desc}
                                                        </p>
                                                    </motion.div>
                                                </div>

                                                {/* HORIZONTAL CONNECTOR */}
                                                {hasConn && (
                                                    <div className="flex-[1] min-w-[16px] flex items-center" style={{ paddingBottom: 2 }}>
                                                        <div className="relative w-full overflow-hidden" style={{ height: 2 }}>
                                                            {/* Base track */}
                                                            <div className="absolute inset-0 rounded-full bg-gray-200 dark:bg-white/10" />
                                                            {/* Active glow */}
                                                            <div
                                                                className="absolute inset-0 rounded-full transition-opacity duration-300"
                                                                style={{
                                                                    opacity: connLit ? 1 : 0,
                                                                    background: `linear-gradient(${isRTL ? '270deg' : '90deg'}, transparent, #0057C8, transparent)`,
                                                                }}
                                                            />
                                                            {/* Flowing particle */}
                                                            <div style={{
                                                                position: 'absolute',
                                                                top: '50%',
                                                                marginTop: -4,
                                                                width: 8,
                                                                height: 8,
                                                                borderRadius: '50%',
                                                                background: '#5CDD2B',
                                                                boxShadow: '0 0 6px #5CDD2B, 0 0 12px rgba(92,221,43,0.35)',
                                                                animation: `${isRTL ? 'lxcRTL' : 'lxcLTR'} ${STEP_MS * 0.9}ms ease-in-out infinite`,
                                                            }} />
                                                        </div>
                                                        {/* Arrowhead */}
                                                        <div
                                                            className={`flex-shrink-0 w-0 h-0 transition-opacity duration-300 ${connLit ? 'opacity-100' : 'opacity-20'}`}
                                                            style={{
                                                                borderTop: '4px solid transparent',
                                                                borderBottom: '4px solid transparent',
                                                                ...(isRTL
                                                                    ? { borderRight: '6px solid #0057C8' }
                                                                    : { borderLeft: '6px solid #0057C8' }
                                                                ),
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </div>

                                {/* VERTICAL TURN CONNECTOR */}
                                {hasTurn && (
                                    <div className="relative" style={{ height: 56 }}>
                                        <div
                                            style={{
                                                position: 'absolute',
                                                left: TURN_PCT[rowIdx],
                                                top: 0,
                                                bottom: 0,
                                                transform: 'translateX(-50%)',
                                                width: 16,
                                            }}
                                        >
                                            {/* Track */}
                                            <div className="absolute left-1/2 -translate-x-1/2 w-0.5 h-full rounded-full overflow-hidden
                                                bg-gray-200 dark:bg-white/10">
                                                {/* Down particle */}
                                                <div style={{
                                                    position: 'absolute',
                                                    left: '50%',
                                                    marginLeft: -4,
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: '50%',
                                                    background: '#0057C8',
                                                    boxShadow: '0 0 6px rgba(0,87,200,0.8)',
                                                    animation: `lxcDOWN ${STEP_MS * 0.9}ms ease-in-out infinite`,
                                                }} />
                                            </div>
                                            {/* Top dot */}
                                            <div className="absolute left-1/2 -translate-x-1/2 -top-1.5 w-3 h-3 rounded-full bg-[#0057C8]"
                                                style={{ boxShadow: '0 0 8px rgba(0,87,200,0.6)' }} />
                                            {/* Bottom dot */}
                                            <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 rounded-full bg-[#0057C8]"
                                                style={{ boxShadow: '0 0 8px rgba(0,87,200,0.6)' }} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Status badge */}
                    <motion.div
                        key={`${cycles}-${String(flipping)}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center gap-4 pt-10"
                    >
                        <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
                        <div className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold border
                            transition-all duration-300
                            ${flipping
                                ? 'bg-[#5CDD2B]/5 border-[#5CDD2B]/20 text-[#4BBD22] dark:bg-[#5CDD2B]/10 dark:border-[#5CDD2B]/30 dark:text-[#5CDD2B]'
                                : 'bg-[#0057C8]/5 border-[#0057C8]/20 text-[#0057C8] dark:bg-[#0057C8]/10 dark:border-[#0057C8]/30 dark:text-[#1A9FFF]'
                            }`}>
                            {flipping
                                ? 'Cycle Complete - Syncing'
                                : cycles > 0
                                    ? `${cycles} Cycle${cycles !== 1 ? 's' : ''} Completed`
                                    : 'Journey in Progress...'}
                        </div>
                        <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
                    </motion.div>
                </div>
            </div>

            {/* Bottom accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-px
                bg-gradient-to-r from-transparent via-[#0057C8]/50 to-transparent" />
        </section>
    );
};

export default StudentLifecycle;
