
import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    User,
    Mail,
    Phone,
    MapPin,
    ArrowLeft,
    GraduationCap,
    Calendar,
    BadgeCheck,
    Briefcase,
} from "lucide-react";
import client from "@/lib/api/client";
import { toast } from "react-toastify";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Loader } from "@/components/ui/feedback/Loader";
import { decodeId, encodeId } from "@/lib/utils/hashId";

interface ParentProfile {
    id: string;
    user: {
        name: string;
        email: string;
        phone: string;
        profilePic: string | null;
        address: string;
        city: string;
        state: string;
        country: string;
        pincode: string;
        bloodType: string;
        sex: string;
    };
    students: {
        id: string;
        admissionNo: string;
        rollNo: string;
        user: {
            name: string;
            profilePic: string | null;
        };
        class: {
            name: string;
        };
    }[];
    createdAt: string;
}

export default function ParentProfilePage() {
    const router = useRouter();
    const { id: rawId } = router.query;
    const id = rawId ? decodeId(rawId as string) : undefined;
    const [parent, setParent] = useState<ParentProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchParentProfile();
        }
    }, [id]);

    const fetchParentProfile = async () => {
        try {
            setLoading(true);
            const response = await client.get(`/v1/admin/parents/${id}`);
            setParent(response.data.data);
        } catch (err: any) {
            toast.error(err.message || "Failed to load parent profile");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout role="admin">
                <div className="flex h-[60vh] items-center justify-center">
                    <Loader size="lg" />
                </div>
            </DashboardLayout>
        );
    }

    if (!parent) {
        return (
            <DashboardLayout role="admin">
                <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Parent not found</h2>
                    <Button onClick={() => router.back()}>Go Back</Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <>
            <Head>
                <title>{parent.user.name}'s Profile - LearnXChain</title>
            </Head>
            <DashboardLayout role="admin">
                <div className="space-y-6">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="gap-2 -ml-2 text-gray-500 hover:text-indigo-600"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back to Directory
                    </Button>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Parent Identity Card */}
                        <div className="lg:col-span-1 space-y-6">
                            <Card className="overflow-hidden border-none shadow-xl bg-white dark:bg-gradient-to-b dark:from-indigo-600 dark:to-indigo-800 text-gray-900 dark:text-white">
                                <CardContent className="pt-8 pb-8 flex flex-col items-center text-center">
                                    <div className="relative group">
                                        <div className="h-32 w-32 rounded-[2rem] bg-indigo-50 dark:bg-white/20 backdrop-blur-md p-1 border-2 border-indigo-100 dark:border-white/50 shadow-2xl overflow-hidden mb-4">
                                            {parent.user.profilePic ? (
                                                <img src={parent.user.profilePic} alt="" className="h-full w-full object-cover rounded-[1.8rem]" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-4xl font-black bg-white dark:bg-white text-indigo-700 dark:text-indigo-700 rounded-[1.8rem]">
                                                    {parent.user.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <h2 className="text-2xl font-black tracking-tight mb-1 uppercase text-gray-900 dark:text-white">{parent.user.name}</h2>
                                    <Badge className="bg-indigo-50 dark:bg-white/20 hover:bg-indigo-100 dark:hover:bg-white/30 text-indigo-600 dark:text-white border-2 border-transparent dark:border-none backdrop-blur-sm px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                                        Parent ID: {parent.id.slice(-8).toUpperCase()}
                                    </Badge>

                                    <div className="w-full mt-8 grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 dark:bg-white/10 rounded-2xl p-3 backdrop-blur-sm text-left">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white/60 mb-1">Status</p>
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                                                <span className="text-xs font-bold uppercase text-gray-900 dark:text-white">Active</span>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-white/10 rounded-2xl p-3 backdrop-blur-sm text-left">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white/60 mb-1">Joined</p>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-3 w-3 text-indigo-600 dark:text-indigo-300" />
                                                <span className="text-xs font-bold text-gray-900 dark:text-white">{new Date(parent.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-sm dark:bg-gray-900/50 backdrop-blur-sm overflow-hidden">
                                <CardHeader className="bg-gray-50/50 dark:bg-gray-800/50 border-b dark:border-white/5">
                                    <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                        <BadgeCheck className="h-4 w-4 text-indigo-600" />
                                        Contact Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-6">
                                    <div className="flex gap-4">
                                        <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                                            <Mail className="h-5 w-5 text-indigo-600" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Email Address</p>
                                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{parent.user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="h-10 w-10 shrink-0 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                                            <Phone className="h-5 w-5 text-emerald-600" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Phone Number</p>
                                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{parent.user.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="h-10 w-10 shrink-0 rounded-xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center">
                                            <MapPin className="h-5 w-5 text-rose-600" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Postal Address</p>
                                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-snug">
                                                {parent.user.address}, {parent.user.city}, {parent.user.state}, {parent.user.country} - {parent.user.pincode}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="h-10 w-10 shrink-0 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                                            <User className="h-5 w-5 text-amber-600" />
                                        </div>
                                        <div className="grid grid-cols-2 w-full gap-4">
                                            <div className="space-y-0.5">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Gender</p>
                                                <p className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase">{parent.user.sex}</p>
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Blood</p>
                                                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{parent.user.bloodType}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Children Information */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                                    <GraduationCap className="h-6 w-6 text-indigo-600" />
                                    Children Linked ({parent.students.length})
                                </h3>
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2">
                                {parent.students.map((student, idx) => (
                                    <motion.div
                                        key={student.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                    >
                                        <Card
                                            className="group hover:shadow-xl transition-all cursor-pointer border-none shadow-sm dark:bg-gray-900/50 backdrop-blur-sm overflow-hidden"
                                            onClick={() => router.push(`/dashboard/admin/students/${encodeId(student.id)}`)}
                                        >
                                            <CardContent className="p-0">
                                                <div className="bg-gray-50/50 dark:bg-gray-800/50 p-6 flex flex-col items-center text-center border-b dark:border-white/5">
                                                    <div className="h-20 w-20 rounded-2xl bg-white shadow-lg p-1 group-hover:scale-110 transition-transform mb-4">
                                                        {student.user.profilePic ? (
                                                            <img src={student.user.profilePic} alt="" className="h-full w-full object-cover rounded-[1rem]" />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center text-2xl font-black bg-indigo-50 text-indigo-600 rounded-[1rem]">
                                                                {student.user.name.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <h4 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-tight">{student.user?.name}</h4>
                                                    {student.class?.name && (
                                                        <Badge variant="soft" tone="info" className="mt-2 font-black uppercase tracking-widest text-[10px] px-3">
                                                            {student.class.name}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="p-4 grid grid-cols-2 gap-2 bg-white/50 dark:bg-gray-900/50">
                                                    <div className="bg-gray-50/50 dark:bg-gray-800/50 p-3 rounded-xl">
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Adm. No</p>
                                                        <p className="text-xs font-black text-gray-900 dark:text-gray-100">{student.admissionNo}</p>
                                                    </div>
                                                    <div className="bg-gray-50/50 dark:bg-gray-800/50 p-3 rounded-xl">
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Roll No</p>
                                                        <p className="text-xs font-black text-gray-900 dark:text-gray-100">{student.rollNo}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}

                                {parent.students.length === 0 && (
                                    <div className="sm:col-span-2 p-12 text-center bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                                        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">No children connected to this parent profile</p>
                                    </div>
                                )}
                            </div>

                            {/* Additional Info / Operations Area */}
                            <Card className="border-none shadow-sm dark:bg-gray-900/50 backdrop-blur-sm mt-8">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="h-5 w-5 text-indigo-600" />
                                        <CardTitle className="text-sm font-black uppercase tracking-widest">Administrative Actions</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex flex-wrap items-center gap-3 space-y-0">
                                    <Button variant="outline" className="h-10 rounded-xl font-bold uppercase text-[10px] tracking-widest">
                                        Send Notification
                                    </Button>
                                    <Button variant="outline" className="h-10 rounded-xl font-bold uppercase text-[10px] tracking-widest">
                                        View Attendance Logs
                                    </Button>
                                    <Button variant="outline" className="h-10 rounded-xl font-bold uppercase text-[10px] tracking-widest">
                                        Fee Summary
                                    </Button>
                                    <Button variant="outline" className="h-10 rounded-xl font-bold uppercase text-[10px] tracking-widest text-rose-600 border-rose-100 hover:bg-rose-50">
                                        Reset Password
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}
