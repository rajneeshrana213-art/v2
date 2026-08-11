import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import {
    Trophy,
    Medal,
    Zap,
    GraduationCap,
    TrendingUp,
    Search,
    User,
    Crown,
    Star
} from "lucide-react";
import client from "@/lib/api/client";
import { toast } from "react-toastify";
import Link from "next/link";
import { Loader } from "@/components/ui/feedback/Loader";

const LeaderboardPage = () => {
    const [activeType, setActiveType] = useState<"class" | "global">("class");
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const res = await client.get(`/v1/dashboard/student/leaderboard?type=${activeType}`);
            setLeaderboard(res.data);
        } catch (error) {
            toast.error("Failed to load leaderboard");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
    }, [activeType]);

    const Podium = ({ items }: { items: any[] }) => {
        const top3 = [items[1], items[0], items[2]]; // Order: 2nd, 1st, 3rd

        return (
            <div className="flex items-end justify-center gap-4 mb-20 mt-10">
                {/* 2nd Place */}
                {top3[0] && (
                    <div className="flex flex-col items-center">
                        <div className="relative mb-4">
                            <div className="h-20 w-20 bg-gray-100 rounded-3xl flex items-center justify-center border-4 border-gray-200">
                                <User className="h-10 w-10 text-gray-400" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-gray-400 text-white h-8 w-8 rounded-xl flex items-center justify-center font-black shadow-lg">2</div>
                        </div>
                        <div className="h-32 w-32 bg-white rounded-t-3xl border-t-4 border-x-4 border-gray-100 flex flex-col items-center justify-center p-4">
                            <p className="font-bold text-gray-900 text-center truncate w-full">{top3[0].student.user.name}</p>
                            <span className="text-gray-400 text-xs font-black uppercase tracking-tighter mt-1">{activeType === "class" ? top3[0].academicScore.toFixed(1) : top3[0].enhancementScore.toFixed(0)}</span>
                        </div>
                    </div>
                )}

                {/* 1st Place */}
                {top3[1] && (
                    <div className="flex flex-col items-center scale-110 -translate-y-4">
                        <div className="relative mb-6">
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 animate-bounce">
                                <Crown className="h-10 w-10 text-amber-500 fill-amber-500" />
                            </div>
                            <div className="h-28 w-28 bg-amber-50 rounded-[2.5rem] flex items-center justify-center border-4 border-amber-300 shadow-2xl shadow-amber-100">
                                <User className="h-14 w-14 text-amber-600" />
                            </div>
                            <div className="absolute -bottom-3 -right-3 bg-amber-500 text-white h-10 w-10 rounded-2xl flex items-center justify-center font-black shadow-xl shadow-amber-200 text-xl border-2 border-white">1</div>
                        </div>
                        <div className="h-44 w-40 bg-white rounded-t-[2.5rem] border-t-8 border-x-4 border-amber-200 flex flex-col items-center justify-center p-4 shadow-xl shadow-amber-50 relative z-20">
                            <p className="font-black text-gray-900 text-center text-lg leading-tight mb-1">{top3[1].student.user.name}</p>
                            <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1">
                                <Star className="h-3 w-3 fill-amber-700" />
                                {activeType === "class" ? top3[1].academicScore.toFixed(1) : top3[1].enhancementScore.toFixed(0)}
                            </div>
                        </div>
                    </div>
                )}

                {/* 3rd Place */}
                {top3[2] && (
                    <div className="flex flex-col items-center">
                        <div className="relative mb-4">
                            <div className="h-20 w-20 bg-amber-50/30 rounded-3xl flex items-center justify-center border-4 border-amber-100">
                                <User className="h-10 w-10 text-amber-200" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-amber-200 text-amber-700 h-8 w-8 rounded-xl flex items-center justify-center font-black shadow-lg">3</div>
                        </div>
                        <div className="h-24 w-32 bg-white rounded-t-3xl border-t-4 border-x-4 border-gray-50 flex flex-col items-center justify-center p-4">
                            <p className="font-bold text-gray-700 text-center truncate w-full">{top3[2].student.user.name}</p>
                            <span className="text-gray-400 text-xs font-black uppercase tracking-tighter mt-1">{activeType === "class" ? top3[2].academicScore.toFixed(1) : top3[2].enhancementScore.toFixed(0)}</span>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <DashboardLayout role="student">
            <div className="p-6 max-w-6xl mx-auto pb-20">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tighter">Hall of Fame</h1>
                    <p className="text-gray-400 text-lg font-medium">Compete with your peers and reach the top spot!</p>
                </div>

                {/* Switcher */}
                <div className="flex justify-center mb-12">
                    <div className="p-2 bg-gray-100 rounded-[2rem] flex gap-2">
                        <button
                            onClick={() => setActiveType("class")}
                            className={`flex items-center gap-3 px-8 py-4 rounded-full font-black text-lg transition-all ${activeType === "class"
                                ? "bg-white text-indigo-600 shadow-2xl shadow-gray-200"
                                : "text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            <GraduationCap className="h-6 w-6" />
                            Academic Rank
                        </button>
                        <button
                            onClick={() => setActiveType("global")}
                            className={`flex items-center gap-3 px-8 py-4 rounded-full font-black text-lg transition-all ${activeType === "global"
                                ? "bg-white text-indigo-600 shadow-2xl shadow-gray-200"
                                : "text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            <Zap className="h-6 w-6" />
                            Enhancement Rank
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader size="lg" />
                    </div>
                ) : (
                    <>
                        {leaderboard.length > 0 && <Podium items={leaderboard} />}

                        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl overflow-hidden">
                            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                                <h2 className="text-2xl font-black text-gray-900">Leaderboard Standings</h2>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search student..."
                                        className="bg-white border border-gray-200 rounded-2xl py-2 pl-12 pr-6 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                    />
                                </div>
                            </div>

                            <div className="divide-y divide-gray-50">
                                {leaderboard.map((item, index) => (
                                    <div key={item.id} className={`flex items-center gap-6 p-6 transition-colors hover:bg-gray-50/50 ${index < 3 ? "bg-gray-50/30" : ""}`}>
                                        <div className="w-12 text-center text-xl font-black text-gray-300">
                                            #{index + 1}
                                        </div>
                                        <div className="h-14 w-14 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 border border-gray-50">
                                            <User className="h-7 w-7" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xl font-black text-gray-900">{item.student.user.name}</p>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{activeType === "class" ? "Student" : "Global Explorer"}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-black text-gray-900 mb-1">
                                                {activeType === "class" ? item.academicScore.toFixed(1) : item.enhancementScore.toFixed(0)}
                                            </div>
                                            <div className="flex items-center justify-end gap-1.5 text-xs font-black uppercase tracking-tighter text-gray-400">
                                                <TrendingUp className="h-3 w-3" />
                                                POINTS
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {leaderboard.length === 0 && (
                                    <div className="p-20 text-center text-gray-400 italic">
                                        Leaderboard is being calculated. Check back soon!
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                <div className="mt-12 bg-indigo-50/50 rounded-[2.5rem] p-10 border border-indigo-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-black text-indigo-900 mb-2">How it works?</h3>
                        <p className="text-indigo-700/70 max-w-xl font-medium">
                            {activeType === "class"
                                ? "Your academic rank is calculated based on Exams (40%), Assignments (25%), Homework (15%), Attendance (10%), and Teacher Eval (10%)."
                                : "Your enhancement rank is earned through Quizzes (70%) and Newspaper Article reading (30%). Go to the hub to earn more!"}
                        </p>
                    </div>
                    <Link href="/dashboard/student/enhancement">
                        <button className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-indigo-200 hover:scale-105 transition-transform flex items-center gap-2">
                            I want more XP
                            <Zap className="h-5 w-5 fill-white" />
                        </button>
                    </Link>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default LeaderboardPage;
