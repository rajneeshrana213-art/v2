
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { useEffect, useState } from "react";
import client from "@/lib/api/client";
import { useRouter } from "next/router";
import {
    CheckCircle2,
    XCircle,
    ChevronLeft,
    Save,
    Search,
    User,
    AlertCircle
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";
import { Loader } from "@/components/ui/feedback/Loader";
import { decodeId } from "@/lib/utils/hashId";

export default function MarkAttendancePage() {
    const router = useRouter();
    const { classId: encodedClassId } = router.query;
    const classId = encodedClassId ? decodeId(encodedClassId as string) : undefined;
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [attendance, setAttendance] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (classId) {
            fetchStudents();
        }
    }, [classId]);

    const fetchStudents = async () => {
        try {
            const res = await client.get(`/v1/dashboard/teacher/attendance/students?classId=${classId}`);
            setStudents(res.data);
            // Initialize everyone as present by default (convenient for teacher)
            const initial: Record<string, boolean> = {};
            res.data.forEach((s: any) => initial[s.id] = true);
            setAttendance(initial);
        } catch (error) {
            console.error("Failed to fetch students", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleAttendance = (studentId: string) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: !prev[studentId]
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const data = {
                classId,
                students: students.map(s => ({
                    studentId: s.id,
                    present: attendance[s.id]
                }))
            };
            await client.post("/v1/dashboard/teacher/attendance/submit", data);
            toast.success("Attendance marked successfully");
            router.push("/dashboard/teacher/attendance");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to mark attendance");
        } finally {
            setSaving(false);
        }
    };

    const filteredStudents = students.filter(s =>
        s.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.rollNo.includes(searchTerm)
    );

    const presentCount = Object.values(attendance).filter(v => v).length;
    const absentCount = students.length - presentCount;

    return (
        <>
            <Head>
                <title>Mark Attendance - LearnXChain</title>
            </Head>
            <DashboardLayout role="teacher">
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/teacher/attendance">
                            <button className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Record Attendance</h1>
                            <p className="text-sm text-gray-500">Roll call</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 p-4 rounded-2xl">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name or roll no..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 dark:bg-gray-800 pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none dark:border-white/5"
                            />
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Total</p>
                                <p className="text-lg font-bold">{students.length}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] uppercase tracking-wider text-emerald-500 font-bold">Present</p>
                                <p className="text-lg font-bold text-emerald-600">{presentCount}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] uppercase tracking-wider text-rose-500 font-bold">Absent</p>
                                <p className="text-lg font-bold text-rose-600">{absentCount}</p>
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={saving || loading}
                                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 transition-all"
                            >
                                {saving ? (
                                    <>
                                        <Loader size="sm" variant="white" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        Submit Attendance
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex h-40 items-center justify-center">
                            <Loader size="lg" />
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900 overflow-hidden">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/2">
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Roll No</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Student Name</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-400">Status</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-400">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                    {filteredStudents.map((student) => (
                                        <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-indigo-500/10 transition-colors">
                                            <td className="px-6 py-4 font-mono text-sm">{student.rollNo}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                                                        {student.user.profilePic ? (
                                                            <img src={student.user.profilePic} alt="" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <User className="h-4 w-4 text-gray-400" />
                                                        )}
                                                    </div>
                                                    <span className="font-medium">{student.user.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {attendance[student.id] ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                        Present
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
                                                        <XCircle className="h-3.5 w-3.5" />
                                                        Absent
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => toggleAttendance(student.id)}
                                                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${attendance[student.id]
                                                        ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
                                                        : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                                        }`}
                                                >
                                                    Mark {attendance[student.id] ? "Absent" : "Present"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {filteredStudents.length === 0 && !loading && (
                        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-white/10">
                            <AlertCircle className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No students found for this class.</p>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </>
    );
}
