
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { useEffect, useState } from "react";
import client from "@/lib/api/client";
import { useRouter } from "next/router";
import {
    ChevronLeft,
    User,
    ShieldCheck,
    MapPin,
    Phone,
    Mail,
    Calendar,
    CreditCard,
    Building,
    ArrowRight
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import ChildSelector from "@/components/dashboard/parent/ChildSelector";
import { toast } from "react-toastify";
import { Loader } from "@/components/ui/feedback/Loader";
import { decodeId, encodeId } from "@/lib/utils/hashId";

export default function childProfile() {
    const router = useRouter();
    const queryId = router.query.studentId as string;
    const [studentId, setStudentId] = useState<string | null>(queryId ? decodeId(queryId) : null);
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (queryId) setStudentId(decodeId(queryId));
    }, [queryId]);

    useEffect(() => {
        if (!studentId) return;

        const fetchProfile = async () => {
            setLoading(true);
            try {
                const res = await client.get(`/v1/dashboard/parent/overview?studentId=${studentId}`);
                setData(res.data.studentInfo);
                // We added studentInfo to overview earlier
            } catch (error) {
                console.error("Failed to fetch profile data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [studentId]);

    return (
        <>
            <Head>
                <title>Child Profile - LearnXChain</title>
            </Head>
            <DashboardLayout role="parent">
                <div className="space-y-8 pb-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard/parent">
                                <button className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-black text-gray-900 dark:text-white">Official Student Record</h1>
                                <p className="text-sm text-gray-500 font-medium tracking-tighter uppercase">Verified school profile & identification</p>
                            </div>
                        </div>
                        <ChildSelector
                            selectedId={studentId}
                            onSelect={(id) => {
                                setStudentId(id);
                                router.push(`/dashboard/parent/profile?studentId=${encodeId(id)}`, undefined, { shallow: true });
                            }}
                        />
                    </div>

                    {!studentId || loading ? (
                        <div className="flex h-40 items-center justify-center">
                            <Loader size="lg" />
                        </div>
                    ) : (
                        <div className="grid gap-8 lg:grid-cols-3">
                            {/* Identity Card */}
                            <div className="lg:col-span-1 space-y-6">
                                <div className="relative overflow-hidden rounded-[3rem] bg-gray-900 p-8 text-white">
                                    <div className="absolute top-0 right-0 p-8 opacity-10">
                                        <ShieldCheck className="h-32 w-32" />
                                    </div>

                                    <div className="relative z-10 flex flex-col items-center text-center">
                                        <div className="h-24 w-24 rounded-[2rem] border-4 border-gray-800 bg-gray-800 p-1 mb-6 shadow-2xl">
                                            {data?.profilePic ? (
                                                <img src={data.profilePic} alt="" className="h-full w-full object-cover rounded-[1.7rem]" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center bg-gray-700 rounded-[1.7rem]">
                                                    <User className="h-10 w-10 text-gray-500" />
                                                </div>
                                            )}
                                        </div>
                                        <h2 className="text-2xl font-black">{data?.name}</h2>
                                        <p className="text-amber-500 font-black uppercase tracking-[0.2em] text-xs mt-1">Class {data?.class}</p>

                                        <div className="mt-8 w-full space-y-4 text-left">
                                            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                                                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-300 uppercase tracking-widest">Roll Number</span>
                                                <span className="text-sm font-black tracking-tight">{data?.rollNo || "N/A"}</span>
                                            </div>
                                            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                                                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-300 uppercase tracking-widest">Admission No</span>
                                                <span className="text-sm font-black tracking-tight">XC-{(studentId as string)?.substring(0, 6).toUpperCase()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-[2.5rem] border border-gray-100 bg-white p-6 dark:border-white/5 dark:bg-gray-900">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        Quick Contact
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-xl bg-gray-50 dark:bg-white/2">
                                                <Phone className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">Emergency Phone</p>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">{data?.phone || "Not Registered"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-xl bg-gray-50 dark:bg-white/2">
                                                <Mail className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">Profile Email</p>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">{data?.email || "No Email Linked"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Institutional Data */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <ProfileDetailCard
                                        icon={Building}
                                        title="School Name"
                                        value={data?.schoolName || "LearnXChain Academy"}
                                        label="Official Enrollment Institution"
                                    />
                                    <ProfileDetailCard
                                        icon={Calendar}
                                        title="Academic Year"
                                        value="2025-2026"
                                        label="Current Session"
                                    />
                                    <ProfileDetailCard
                                        icon={ShieldCheck}
                                        title="Account Status"
                                        value="Active"
                                        label="Verified Institutional Access"
                                        status="success"
                                    />
                                    <ProfileDetailCard
                                        icon={CreditCard}
                                        title="Bus Route"
                                        value="Route #14 (St. Mary's)"
                                        label="Transport Enrollment"
                                    />
                                </div>

                                <div className="rounded-[2.5rem] border border-gray-100 bg-white p-8 dark:border-white/5 dark:bg-gray-900">
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6">Parent Controls</h3>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <button
                                            onClick={() => toast.info("Profile update requests are automatically sent to the school administration. Please contact support for urgent changes.")}
                                            className="flex items-center justify-between p-4 rounded-3xl border border-gray-100 hover:border-indigo-500 transition-all text-left dark:border-white/5 dark:hover:border-indigo-500 group"
                                        >
                                            <div>
                                                <p className="text-sm font-black text-gray-900 dark:text-white">Request Profile Update</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Correct typos in name or DOB</p>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                                        </button>
                                        <button
                                            onClick={() => toast.info("To update emergency contacts, please visit the primary profile settings or contact the school office.")}
                                            className="flex items-center justify-between p-4 rounded-3xl border border-gray-100 hover:border-indigo-500 transition-all text-left dark:border-white/5 dark:hover:border-indigo-500 group"
                                        >
                                            <div>
                                                <p className="text-sm font-black text-gray-900 dark:text-white">Emergency Contact</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Update primary phone number</p>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </>
    );
}

function ProfileDetailCard({ icon: Icon, title, value, label, status }: any) {
    return (
        <div className="group rounded-[2.5rem] border border-gray-100 bg-white p-8 transition-all hover:bg-gray-50 dark:border-white/5 dark:bg-gray-900 dark:hover:bg-white/2">
            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:bg-white/5 transition-colors">
                <Icon className="h-6 w-6" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">{title}</p>
            <h4 className={`text-xl font-black ${status === 'success' ? 'text-emerald-500' : 'text-gray-900 dark:text-white'}`}>{value}</h4>
            <p className="mt-4 text-[10px] font-bold text-gray-400 tracking-tight">{label}</p>
        </div>
    );
}
