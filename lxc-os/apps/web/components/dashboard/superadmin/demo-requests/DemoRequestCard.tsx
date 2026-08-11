import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
    Calendar,
    Clock,
    Mail,
    Phone,
    Users,
    School,
    HelpCircle,
    ChevronDown,
    ChevronUp,
    MapPin
} from 'lucide-react';

export interface DemoRequest {
    id: string;
    name: string;
    email: string;
    school: string; // Creates JSON string: "School Name | {JSON}"
    dateTime: string;
    createdAt: string;
}

interface ParsedSchoolData {
    schoolName: string;
    phone?: string;
    studentCount?: string;
    board?: string;
    problem?: string;
    demoType?: string;
    preferredDate?: string;
    preferredTime?: string;
}

interface DemoRequestCardProps {
    request: DemoRequest;
    isPast?: boolean;
}

export const DemoRequestCard: React.FC<DemoRequestCardProps> = ({ request, isPast = false }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Parse school data
    let schoolData: ParsedSchoolData = { schoolName: request.school };
    try {
        if (request.school.includes('|')) {
            const parts = request.school.split('|');
            const name = parts[0].trim();
            const jsonStr = parts.slice(1).join('|').trim();
            const parsed = JSON.parse(jsonStr);
            schoolData = {
                schoolName: name,
                ...parsed
            };
        }
    } catch (e) {
        console.error("Failed to parse school data", e);
    }

    const date = new Date(request.createdAt);
    const formattedDate = format(date, 'MMM d, yyyy');
    const formattedTime = format(date, 'h:mm a');

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`
        relative overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-300
        ${isPast
                    ? 'bg-gray-50/50 border-gray-200 dark:bg-gray-800/30 dark:border-gray-700/50 grayscale-[0.5] hover:grayscale-0'
                    : 'bg-white/90 border-indigo-100 dark:bg-gray-900/80 dark:border-indigo-500/20 shadow-lg shadow-indigo-500/5 hover:shadow-indigo-500/10 hover:border-indigo-500/30'
                }
      `}
        >
            <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`
              h-12 w-12 rounded-xl flex items-center justify-center text-lg font-bold
              ${isPast
                                ? 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                                : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                            }
            `}>
                            {request.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">
                                {request.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <School size={14} />
                                {schoolData.schoolName}
                            </p>
                        </div>
                    </div>
                    <div className={`
            px-3 py-1 rounded-full text-xs font-medium border
            ${isPast
                            ? 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20'
                        }
          `}>
                        {isPast ? 'Completed' : 'Upcoming'}
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                        <Mail size={16} className="text-indigo-500 shrink-0" />
                        <span className="truncate">{request.email}</span>
                    </div>

                    {schoolData.phone && (
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                            <Phone size={16} className="text-indigo-500 shrink-0" />
                            <span>{schoolData.phone}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                        <Calendar size={16} className="text-indigo-500 shrink-0" />
                        <span>Requested: {formattedDate} at {formattedTime}</span>
                    </div>

                    {(schoolData.preferredDate || schoolData.preferredTime) && (
                        <div className="flex items-center gap-3 text-sm font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg border border-amber-100 dark:border-amber-900/30">
                            <Clock size={16} className="shrink-0" />
                            <span>Preferred: {schoolData.preferredDate} {schoolData.preferredTime ? `- ${schoolData.preferredTime}` : ''}</span>
                        </div>
                    )}
                </div>

                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-4 w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors border-t border-gray-100 dark:border-gray-800 pt-3"
                >
                    {isExpanded ? 'Show Less' : 'Show Details'}
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-gray-50/50 dark:bg-gray-800/20 border-t border-gray-100 dark:border-gray-800"
                    >
                        <div className="p-5 space-y-4 text-sm">
                            <div className="grid grid-cols-2 gap-4">
                                {schoolData.studentCount && (
                                    <div className="space-y-1">
                                        <span className="text-xs text-gray-500 uppercase tracking-wider">Students</span>
                                        <div className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-200">
                                            <Users size={14} className="text-indigo-500" />
                                            {schoolData.studentCount}
                                        </div>
                                    </div>
                                )}
                                {schoolData.demoType && (
                                    <div className="space-y-1">
                                        <span className="text-xs text-gray-500 uppercase tracking-wider">Type</span>
                                        <div className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-200">
                                            <School size={14} className="text-indigo-500" />
                                            {schoolData.demoType}
                                        </div>
                                    </div>
                                )}
                                {schoolData.board && (
                                    <div className="space-y-1 col-span-2">
                                        <span className="text-xs text-gray-500 uppercase tracking-wider">Board</span>
                                        <div className="font-medium text-gray-700 dark:text-gray-200">
                                            {schoolData.board}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {schoolData.problem && (
                                <div className="space-y-1 pt-2 border-t border-gray-200 dark:border-gray-700 border-dashed">
                                    <span className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                        <HelpCircle size={12} />
                                        Specific Problem/Requirement
                                    </span>
                                    <p className="text-gray-700 dark:text-gray-300 italic">
                                        "{schoolData.problem}"
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
