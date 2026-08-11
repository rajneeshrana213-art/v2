
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { useEffect, useState } from "react";
import client from "@/lib/api/client";
import {
    User,
    ChevronLeft,
    Mail,
    Phone,
    Home,
    Calendar,
    IdCard,
    School,
    ShieldCheck,
    MapPin,
    Lock,
    TrendingUp
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Loader } from "@/components/ui/feedback/Loader";

export default function StudentProfilePage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await client.get("/v1/dashboard/student");
                setData(res.data?.personalInfo);
            } catch (error) {
                console.error("Failed to fetch profile data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    return (
        <>
            <Head>
                <title>My Profile - LearnXChain</title>
            </Head>
            <DashboardLayout role="student">
                <div className="space-y-8 pb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/student">
                            <button className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Profile</h1>
                            <p className="text-sm text-gray-500">Your official school records.</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex h-40 items-center justify-center">
                            <Loader size="lg" />
                        </div>
                    ) : (
                        <div className="grid gap-8 lg:grid-cols-3">
                            {/* Left Column: Avatar & Basic Info */}
                            <div className="lg:col-span-1 space-y-6">
                                <div className="rounded-3xl border border-gray-100 bg-white p-8 text-center dark:border-white/5 dark:bg-gray-900 shadow-sm">
                                    <div className="relative mx-auto h-32 w-32 mb-6">
                                        <div className="h-full w-full rounded-3xl bg-indigo-50 flex items-center justify-center overflow-hidden dark:bg-indigo-900/20">
                                            {data?.profilePic ? (
                                                <img src={data.profilePic} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <User className="h-12 w-12 text-indigo-400" />
                                            )}
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 p-2 bg-emerald-500 rounded-xl border-4 border-white dark:border-gray-900 shadow-lg">
                                            <ShieldCheck className="h-4 w-4 text-white" />
                                        </div>
                                    </div>
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">{data?.name}</h2>
                                    <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-1 uppercase tracking-tighter">Student ID: {data?.id?.substring(0, 8)}</p>

                                    <div className="mt-8 grid grid-cols-2 gap-4 border-t border-gray-50 dark:border-white/5 pt-8">
                                        <div className="text-center">
                                            <p className="text-[10px] uppercase font-bold text-gray-400">Class</p>
                                            <p className="font-black text-gray-900 dark:text-gray-100">{data?.class || "N/A"}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] uppercase font-bold text-gray-400">Roll No</p>
                                            <p className="font-black text-gray-900 dark:text-gray-100">{data?.rollNo || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Card */}
                                <div className="rounded-3xl border border-gray-100 bg-white p-6 dark:border-white/5 dark:bg-gray-900">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        Contact Information
                                    </h3>
                                    <div className="space-y-4">
                                        <ProfileItem icon={Mail} label="Email Address" value={data?.email || "Not provided"} />
                                        <ProfileItem icon={Phone} label="Phone Number" value={data?.phone || "Not provided"} />
                                        <ProfileItem icon={Home} label="Current Residence" value="Registered Address" />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Detailed Records */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="rounded-3xl border border-gray-100 bg-white p-8 dark:border-white/5 dark:bg-gray-900 shadow-sm">
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-8 border-b border-gray-50 dark:border-white/5 pb-4">
                                        Academic Records
                                    </h3>

                                    <div className="grid gap-y-8 sm:grid-cols-2">
                                        <div className="space-y-6">
                                            <ProfileDetail label="Admission Date" value={data?.admissionDate ? format(new Date(data.admissionDate), "MMMM d, yyyy") : "N/A"} icon={Calendar} />
                                            <ProfileDetail label="Enrollment Year" value="2025-2026" icon={IdCard} />
                                            <ProfileDetail label="School Name" value="LearnXChain Global School" icon={School} />
                                        </div>
                                        <div className="space-y-6">
                                            <ProfileDetail label="House/Section" value="N/A" icon={ShieldCheck} />
                                            <ProfileDetail label="Status" value="ACTIVE" icon={TrendingUp} color="text-emerald-500" />
                                            <ProfileDetail label="Campus Location" value="Main Campus" icon={MapPin} />
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-3xl border border-gray-100 bg-amber-50/30 p-8 dark:border-amber-900/10 dark:bg-amber-950/5">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl dark:bg-amber-900/30 dark:text-amber-400 flex-shrink-0">
                                            <Lock className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-amber-900 dark:text-amber-400 uppercase tracking-tighter">Read-Only Mode</h4>
                                            <p className="text-sm text-amber-800/70 dark:text-amber-400/60 mt-1">
                                                Student profile information is managed by the school administration. To request updates to your records, please contact the admin office.
                                            </p>
                                        </div>
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

function ProfileItem({ icon: Icon, label, value }: any) {
    return (
        <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-xl bg-gray-50 flex items-center justify-center dark:bg-gray-800">
                <Icon className="h-4 w-4 text-gray-400" />
            </div>
            <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
        </div>
    );
}

function ProfileDetail({ label, value, icon: Icon, color }: any) {
    return (
        <div className="flex items-start gap-4">
            <div className="p-2.5 bg-gray-50 rounded-xl dark:bg-gray-800">
                <Icon className="h-5 w-5 text-gray-400" />
            </div>
            <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-0.5">{label}</p>
                <p className={`text-base font-black ${color || "text-gray-900 dark:text-white"}`}>{value}</p>
            </div>
        </div>
    );
}
