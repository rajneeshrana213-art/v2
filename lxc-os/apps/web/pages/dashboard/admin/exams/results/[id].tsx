
import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/forms/input";
import { ChevronLeft, Save, Users, Trophy, CheckCircle2, Clock, Search, Award, AlertTriangle, FileText } from 'lucide-react';
import client from "@/lib/api/client";
import { toast } from "react-toastify";
import Link from "next/link";
import { Loader } from '@/components/ui/feedback/Loader';
import { decodeId } from "@/lib/utils/hashId";

interface StudentResult {
    id: string; // studentId
    admissionNo: string;
    user: {
        name: string;
        profilePic: string | null;
    };
    results: {
        id: string;
        score: number;
    }[];
    currentScore?: number; // local state for input
}

interface ExamInfo {
    id: string;
    title: string;
    totalMarks: number;
    passMark: number;
    class: { name: string };
    subject: { name: string };
}

export default function ExamResultsPage() {
    const router = useRouter();
    const { id: rawId } = router.query;
    const id = rawId ? decodeId(rawId as string) : undefined;
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [students, setStudents] = useState<StudentResult[]>([]);
    const [examInfo, setExamInfo] = useState<ExamInfo | null>(null);
    const [scores, setScores] = useState<{ [studentId: string]: string }>({});

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [examRes, studentsRes] = await Promise.all([
                client.get(`/v1/admin/exams/${id}`),
                client.get(`/v1/admin/exams/${id}/students`)
            ]);

            setExamInfo(examRes.data.data);
            const studentData = studentsRes.data.data;
            setStudents(studentData);

            // Initialize local scores state
            const initialScores: { [key: string]: string } = {};
            studentData.forEach((s: StudentResult) => {
                if (s.results && s.results.length > 0) {
                    initialScores[s.id] = s.results[0].score.toString();
                } else {
                    initialScores[s.id] = "";
                }
            });
            setScores(initialScores);
        } catch (error: any) {
            toast.error("Failed to load exam or student data");
            router.push("/dashboard/admin/exams");
        } finally {
            setLoading(false);
        }
    };

    const handleScoreChange = (studentId: string, val: string) => {
        // Validation: only allow numbers and within total marks
        if (val !== "" && (isNaN(parseInt(val)) || parseInt(val) > (examInfo?.totalMarks || 100))) {
            return;
        }
        setScores(prev => ({ ...prev, [studentId]: val }));
    };

    const handleSaveResults = async () => {
        try {
            setSaving(true);
            const resultsToSave = Object.entries(scores)
                .filter(([_, score]) => score !== "")
                .map(([studentId, score]) => {
                    const student = students.find(s => s.id === studentId);
                    return {
                        studentId,
                        score,
                        resultId: student?.results?.[0]?.id
                    };
                });

            await client.post(`/v1/admin/exams/${id}/results`, { results: resultsToSave });
            toast.success("Results saved successfully");
            fetchData();
        } catch (error: any) {
            toast.error("Failed to save results");
        } finally {
            setSaving(false);
        }
    };

    const columns: ColumnDef<StudentResult>[] = [
        {
            key: "user",
            header: "Student Name",
            render: (user) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400">
                        {user.profilePic ? (
                            <img src={user.profilePic} alt="" className="h-10 w-10 rounded-xl object-cover" />
                        ) : (
                            user.name[0]
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{user.name}</span>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Verified Identity</span>
                    </div>
                </div>
            )
        },
        {
            key: "admissionNo",
            header: "Admission ID",
            render: (val) => (
                <Badge tone="accent" variant="soft" className="font-mono text-[10px] font-black uppercase tracking-widest px-2 py-0.5">
                    {val}
                </Badge>
            )
        },
        {
            key: "status",
            header: "Evaluation",
            render: (_, row) => {
                const score = parseInt(scores[row.id]);
                if (!scores[row.id]) return <Badge tone="warning" variant="soft" className="text-[9px] uppercase font-black">Not Entered</Badge>;
                const isPass = score >= (examInfo?.passMark || 0);
                return (
                    <Badge tone={isPass ? "success" : "danger"} variant="soft" className="text-[9px] uppercase font-black">
                        {isPass ? "Qualified" : "Failed"}
                    </Badge>
                );
            }
        },
        {
            key: "id",
            header: "Score Entry",
            align: "right",
            render: (studentId) => (
                <div className="flex items-center justify-end gap-3">
                    <div className="relative w-24 group">
                        <input
                            type="number"
                            value={scores[studentId] || ""}
                            onChange={(e) => handleScoreChange(studentId, e.target.value)}
                            className="w-full h-10 px-3 pr-8 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-slate-900/60 text-sm font-black text-indigo-600 dark:text-indigo-400 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 hover:border-indigo-400 outline-none transition-all text-right"
                            placeholder="0"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-black text-gray-400 uppercase pointer-events-none">Pts</span>
                    </div>
                    <span className="text-xs font-bold text-gray-400">/ {examInfo?.totalMarks}</span>
                </div>
            )
        }
    ];

    if (loading) {
        return (
            <DashboardLayout role="admin">
                <div className="flex h-[80vh] items-center justify-center">
                    <Loader size="xl" variant="primary" />
                </div>
            </DashboardLayout>
        );
    }

    const studentsEntered = Object.values(scores).filter(s => s !== "").length;
    const completionPercent = students.length > 0 ? (studentsEntered / students.length) * 100 : 0;

    return (
        <DashboardLayout role="admin">
            <Head>
                <title>Enter Results | {examInfo?.title} | LearnXChain</title>
            </Head>

            <div className="space-y-8 pb-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/40 dark:bg-slate-900/40 p-8 rounded-[40px] border border-white/20 dark:border-white/5 backdrop-blur-xl shadow-sm">
                    <div className="flex items-center gap-6">
                        <Link href="/dashboard/admin/exams">
                            <button className="h-12 w-12 rounded-2xl bg-white dark:bg-slate-950 border border-gray-100 dark:border-white/10 flex items-center justify-center shadow-sm hover:shadow-md transition-all text-gray-600 dark:text-gray-400">
                                <ChevronLeft className="h-6 w-6" />
                            </button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-2 mb-1.5">
                                <Badge tone="accent" variant="soft" className="font-black text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full">Assessment Pipeline</Badge>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">• {examInfo?.class.name}</span>
                            </div>
                            <h1 className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white leading-tight">
                                Result Entry: <span className="text-indigo-600 dark:text-indigo-400">{examInfo?.subject.name}</span>
                            </h1>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Submitting performance data for {examInfo?.title}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-white dark:bg-slate-950 p-3 rounded-3xl border border-gray-50 dark:border-white/10 shadow-sm">
                        <div className="h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center relative">
                            <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                            <div className="absolute -top-1 -right-1 h-5 w-5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-950 flex items-center justify-center text-[8px] font-black text-white">
                                {studentsEntered}
                            </div>
                        </div>
                        <div className="pr-6 border-r border-gray-100 dark:border-white/5">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Entry Status</p>
                            <p className="text-lg font-black text-gray-900 dark:text-white leading-none">
                                {completionPercent.toFixed(0)}<span className="text-xs text-indigo-500">%</span>
                            </p>
                            <p className="text-[10px] font-bold text-emerald-500 mt-1 uppercase">Ready to Commit</p>
                        </div>
                        <Button
                            onClick={handleSaveResults}
                            disabled={saving}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 h-12 rounded-2xl transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
                        >
                            {saving ? <Loader size="sm" variant="white" /> : <Save className="h-4 w-4 mr-3" />}
                            Commit Results
                        </Button>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-12">
                    {/* Stats/Info Column */}
                    <div className="lg:col-span-3 space-y-6">
                        <Card className="rounded-[32px] border-none bg-indigo-600 text-white overflow-hidden shadow-xl shadow-indigo-500/20">
                            <CardHeader className="pb-2">
                                <Trophy className="h-8 w-8 text-indigo-200 mb-2" />
                                <CardTitle className="text-lg font-black tracking-tight">Exam Protocol</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Grading Scale</p>
                                    <p className="text-2xl font-black">0 - {examInfo?.totalMarks} <span className="text-xs font-medium text-indigo-200">Points</span></p>
                                </div>
                                <div className="h-px bg-white/10 w-full" />
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Pass Threshold</p>
                                        <p className="text-xl font-black text-emerald-400">{examInfo?.passMark} <span className="text-[10px] uppercase">Pts</span></p>
                                    </div>
                                    <div className="p-2 bg-white/10 rounded-xl">
                                        <Award className="h-5 w-5 text-indigo-200" />
                                    </div>
                                </div>
                            </CardContent>
                            <div className="bg-indigo-700/50 p-4 text-[10px] font-bold text-center uppercase tracking-widest text-indigo-200">
                                Institutional Standard Applied
                            </div>
                        </Card>

                        <div className="rounded-[32px] bg-white/60 dark:bg-slate-900/40 border border-gray-100 dark:border-white/5 p-6 backdrop-blur-xl">
                            <h4 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-4">Quick Batch Actions</h4>
                            <div className="space-y-3">
                                <Button variant="outline" className="w-full justify-start h-12 rounded-2xl border-gray-100 dark:border-white/5 font-bold text-xs hover:bg-gray-50 dark:hover:bg-white/5 px-4 transition-all">
                                    <div className="h-6 w-6 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center mr-3">
                                        <CheckCircle2 className="h-4 w-4" />
                                    </div>
                                    Auto-fill Full Marks
                                </Button>
                                <Button variant="outline" className="w-full justify-start h-12 rounded-2xl border-gray-100 dark:border-white/5 font-bold text-xs hover:bg-gray-50 dark:hover:bg-white/5 px-4 transition-all text-amber-600">
                                    <div className="h-6 w-6 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 flex items-center justify-center mr-3">
                                        <AlertTriangle className="h-4 w-4" />
                                    </div>
                                    Reset All Values
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Table Column */}
                    <div className="lg:col-span-9">
                        <Card className="rounded-[40px] border-none shadow-xl shadow-indigo-500/5 bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl overflow-hidden">
                            <CardHeader className="p-8 border-b border-gray-100 dark:border-white/5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-xl font-black tracking-tight">Student Roster</CardTitle>
                                        <CardDescription className="text-xs font-medium uppercase tracking-widest text-gray-400 mt-1">Roll Call & Evaluation Deck</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Search student..."
                                                className="h-10 pl-9 pr-4 rounded-xl border border-gray-100 dark:border-white/10 bg-white/80 dark:bg-slate-950 text-xs font-bold w-48 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <DataTable
                                    columns={columns}
                                    data={students}
                                    dense={false}
                                    className="border-none shadow-none rounded-none bg-transparent"
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
