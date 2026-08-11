
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
import { Button } from "@/components/ui/button";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    User,
    Phone,
    Mail,
    MapPin,
    Calendar,
    CreditCard,
    History,
    GraduationCap,
    Users,
    ChevronLeft,
    Edit,
    AlertCircle,
    FileText,
    Clock,
    Wallet
} from "lucide-react";
import { Loader } from "@/components/ui/feedback/Loader";
import client from "@/lib/api/client";
// import { toast } from "sonner";

import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { decodeId, encodeId } from "@/lib/utils/hashId";

export default function StudentDetailsPage() {
    const router = useRouter();
    const { id: rawId } = router.query;
    const id = rawId ? decodeId(rawId as string) : undefined;
    const [student, setStudent] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchStudentDetails();
    }, [id]);

    const fetchStudentDetails = async () => {
        try {
            setLoading(true);
            const response = await client.get(`/v1/dashboard/admin/students/${id}`);
            setStudent(response.data.data);
        } catch (err: any) {
            toast.error(err.message || "Failed to load student details");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout role="admin">
                <div className="flex items-center justify-center h-[50vh]">
                    <Loader size="lg" />
                </div>
            </DashboardLayout>
        );
    }

    if (!student) return null;

    return (
        <>
            <Head>
                <title>{student.user.name} - Profile | LearnXChain</title>
            </Head>
            <DashboardLayout role="admin">
                <div className="space-y-6 max-w-7xl mx-auto pb-10">
                    {/* Header Action Bar */}
                    <div className="flex items-center justify-between">
                        <Button variant="ghost" className="gap-2" onClick={() => router.back()}>
                            <ChevronLeft className="h-4 w-4" /> Back to Students
                        </Button>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="gap-2" onClick={() => toast.info("Printing profile...")}>
                                <FileText className="h-4 w-4" /> Export Profile
                            </Button>
                            <Button size="sm" className="gap-2 bg-indigo-600" onClick={() => id && router.push(`/dashboard/admin/students/register?edit=${encodeId(id)}`)}>
                                <Edit className="h-4 w-4" /> Edit Record
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Left Sidebar - Profile Summary */}
                        <div className="lg:col-span-1 space-y-6">
                            <Card className="border-none shadow-xl bg-white dark:bg-gradient-to-br dark:from-indigo-600 dark:to-violet-700 text-gray-900 dark:text-white overflow-hidden">
                                <CardContent className="p-8 flex flex-col items-center text-center">
                                    <div className="relative group">
                                        <div className="h-32 w-32 rounded-3xl bg-indigo-50 dark:bg-white/20 backdrop-blur-md flex items-center justify-center text-5xl font-extrabold border-4 border-indigo-100 dark:border-white/30 shadow-2xl overflow-hidden mb-6 text-indigo-600 dark:text-white">
                                            {student.user.profilePic ? (
                                                <img src={student.user.profilePic} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                student.user.name.charAt(0)
                                            )}
                                        </div>
                                        <Badge className="absolute -bottom-2 right-0 bg-emerald-500 border-2 border-white text-[10px] uppercase font-bold px-3 py-1">
                                            {student.status}
                                        </Badge>
                                    </div>
                                    <h2 className="text-2xl font-bold tracking-tight">{student.user.name}</h2>
                                    <p className="text-gray-500 dark:text-indigo-100/70 text-sm font-medium mb-4">{student.admissionNo}</p>

                                    <div className="grid grid-cols-2 gap-4 w-full pt-6 border-t border-gray-100 dark:border-white/10">
                                        <div className="text-center">
                                            <p className="text-xs text-gray-400 dark:text-indigo-100/50 uppercase font-bold tracking-widest mb-1">Class</p>
                                            <p className="font-bold">{student.class?.name ?? "—"}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-gray-400 dark:text-indigo-100/50 uppercase font-bold tracking-widest mb-1">Roll No</p>
                                            <p className="font-bold">{student.rollNo}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-lg border-none">
                                <CardHeader>
                                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-gray-400">Quick Contact</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-gray-800 flex items-center justify-center text-indigo-600">
                                            <Phone className="h-4 w-4" />
                                        </div>
                                        <span className="font-medium text-gray-700 dark:text-gray-300">{student.user.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-gray-800 flex items-center justify-center text-indigo-600">
                                            <Mail className="h-4 w-4" />
                                        </div>
                                        <span className="font-medium text-gray-700 dark:text-gray-300 truncate">{student.user.email}</span>
                                    </div>
                                    <div className="flex items-start gap-3 text-sm">
                                        <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-gray-800 flex items-center justify-center text-indigo-600 shrink-0">
                                            <MapPin className="h-4 w-4" />
                                        </div>
                                        <span className="font-medium text-gray-700 dark:text-gray-300">{student.currentAddress}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-lg border-none bg-emerald-500/5 border border-emerald-500/10">
                                <CardHeader>
                                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                                        <Wallet className="h-4 w-4" /> Financial Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium mb-1">Total Outstanding (Dues)</p>
                                            <p className="text-3xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tighter">
                                                ₹{(student.pendingFees / 1).toLocaleString()}
                                            </p>
                                        </div>
                                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-xs font-bold uppercase tracking-widest py-6" onClick={() => toast.success("Payment link sent to parent!")}>
                                            Request Settlement
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            <Tabs defaultValue="overview" className="w-full">
                                <TabsList className="bg-transparent border-b border-gray-100 dark:border-gray-800 w-full justify-start rounded-none h-12 p-0 gap-8">
                                    <TabsTrigger value="overview" className="data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 border-b-2 border-transparent rounded-none px-0 h-12 text-sm font-bold bg-transparent shadow-none">Overview</TabsTrigger>
                                    <TabsTrigger value="finance" className="data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 border-b-2 border-transparent rounded-none px-0 h-12 text-sm font-bold bg-transparent shadow-none">Fees & Ledger</TabsTrigger>
                                    <TabsTrigger value="academic" className="data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 border-b-2 border-transparent rounded-none px-0 h-12 text-sm font-bold bg-transparent shadow-none">Academic Records</TabsTrigger>
                                    <TabsTrigger value="documents" className="data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 border-b-2 border-transparent rounded-none px-0 h-12 text-sm font-bold bg-transparent shadow-none">Documents</TabsTrigger>
                                </TabsList>

                                <TabsContent value="overview" className="pt-6 space-y-6">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <DetailItem icon={Calendar} label="Date of Birth" value={new Date(student.dateOfBirth).toLocaleDateString()} />
                                        <DetailItem icon={User} label="Gender" value={student.user.sex} />
                                        <DetailItem icon={AlertCircle} label="Blood Type" value={student.user.bloodType} />
                                        <DetailItem icon={User} label="Religion" value={student.Religion || "N/A"} />
                                    </div>

                                    <Card className="shadow-lg border-none bg-indigo-50/30 dark:bg-gray-800/30">
                                        <CardHeader>
                                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                                <Users className="h-5 w-5 text-indigo-600" /> Parent / Guardian Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid gap-6 md:grid-cols-2">
                                            <div className="space-y-4">
                                                <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                                    <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mb-2">Guardian Profile</p>
                                                    <p className="font-bold text-gray-900 dark:text-gray-100">{student.guardianName}</p>
                                                    <p className="text-sm text-gray-500 mb-2">{student.guardianRelation}</p>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-xs text-gray-500 flex items-center gap-1"><Phone className="h-3 w-3" /> {student.guardianPhone}</span>
                                                        <span className="text-xs text-gray-500 flex items-center gap-1"><Mail className="h-3 w-3" /> {student.guardianEmail}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                                    <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mb-2">Father's Info</p>
                                                    <p className="font-bold text-gray-900 dark:text-gray-100">{student.fatherName}</p>
                                                    <p className="text-sm text-gray-500">Phone: {student.fatherPhone}</p>
                                                </div>
                                                <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                                    <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mb-2">Mother's Info</p>
                                                    <p className="font-bold text-gray-900 dark:text-gray-100">{student.motherName}</p>
                                                    <p className="text-sm text-gray-500">Phone: {student.motherPhone}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="finance" className="pt-6 space-y-6">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        {student.studentFeePlans.map((plan: any) => (
                                            <div key={plan.id} className="group relative overflow-hidden rounded-[32px] border border-white/40 bg-white/60 p-1 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:scale-[1.02] hover:shadow-indigo-500/10 dark:border-white/10 dark:bg-gray-900/60">
                                                <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br from-indigo-500/10 to-violet-500/10 blur-3xl transition-all duration-700 group-hover:bg-indigo-500/20" />

                                                <div className="relative space-y-4 rounded-[28px] bg-white/80 p-6 dark:bg-gray-950/80">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-lg shadow-indigo-500/30">
                                                                <CreditCard className="h-6 w-6" />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-base font-black tracking-tight text-gray-900 dark:text-white">
                                                                    {plan.feeStructure?.name || "Standard Fee Plan"}
                                                                </h3>
                                                                <div className="flex items-center gap-2">
                                                                    <Badge variant="outline" className="border-indigo-100 bg-indigo-50/50 text-[10px] font-bold text-indigo-600 dark:border-indigo-900/30 dark:bg-indigo-950/20 dark:text-indigo-400">
                                                                        {plan.academicYear?.year || "N/A"} Session
                                                                    </Badge>
                                                                    <span className="h-1 w-1 rounded-full bg-indigo-200" />
                                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Active Plan</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="relative space-y-2.5 pt-2">
                                                        {plan.feeHeadAmounts.map((head: any) => (
                                                            <div key={head.id} className="flex items-center justify-between rounded-xl border border-gray-50 bg-gray-50/30 p-3 transition-colors hover:bg-gray-50 dark:border-white/5 dark:bg-white/5 dark:hover:bg-white/10">
                                                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{head.feeHead.name}</span>
                                                                <span className="text-sm font-black text-gray-900 dark:text-gray-100">₹{head.amount.toLocaleString()}</span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="mt-4 flex items-center justify-between rounded-2xl bg-indigo-600 p-4 text-white shadow-lg shadow-indigo-600/20">
                                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Total Structure Amount</span>
                                                        <span className="text-xl font-black">
                                                            ₹{plan.feeHeadAmounts.reduce((sum: number, h: any) => sum + h.amount, 0).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <Card className="shadow-lg border-none mt-6">
                                        <CardHeader className="flex flex-row items-center justify-between">
                                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                                <History className="h-5 w-5 text-indigo-600" /> Recent Activity (Ledger)
                                            </CardTitle>
                                            <Button variant="ghost" size="sm" className="text-xs text-indigo-600 font-bold" onClick={() => toast.info("Full ledger view loading...")}>View Full Statements</Button>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {student.financeLedger.length > 0 ? (
                                                    student.financeLedger.map((entry: any) => (
                                                        <div key={entry.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-800">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-8 w-8 rounded-full bg-indigo-50 dark:bg-gray-800 flex items-center justify-center text-indigo-600">
                                                                    <Clock className="h-4 w-4" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{entry.description || entry.transactionType}</p>
                                                                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-tighter">{new Date(entry.createdAt).toLocaleString()}</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">₹{entry.amount.toLocaleString()}</p>
                                                                <Badge variant="soft" tone="info" className="text-[10px] lowercase py-0">{entry.referenceTable || "ledger"}</Badge>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-10">
                                                        <p className="text-sm text-gray-500">No recent transactions found.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="academic" className="pt-6">
                                    <Card className="shadow-lg border-none">
                                        <CardContent className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                                            <GraduationCap className="h-16 w-16 text-gray-100 dark:text-gray-800" />
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest">No Examinations Found</p>
                                                <p className="text-xs text-gray-500">No academic results have been published for this student in the current session.</p>
                                            </div>
                                            <Button variant="outline" size="sm" className="font-bold border-indigo-100 bg-indigo-50/50 text-indigo-600">Sync from Results Module</Button>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="documents" className="pt-6">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <DocumentCard title="Medical Certificate" status="VERIFIED" date="Jan 12, 2025" />
                                        <DocumentCard title="Transfer Certificate" status="VERIFIED" date="Jan 12, 2025" />
                                        <DocumentCard title="Address Proof" status="PENDING" date="N/A" />
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}

function DetailItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
    return (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">{label}</p>
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{value}</p>
            </div>
        </div>
    );
}

function DocumentCard({ title, status, date }: { title: string; status: "VERIFIED" | "PENDING" | "REJECTED"; date: string }) {
    return (
        <div className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                    <FileText className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{title}</p>
                    <p className="text-[10px] text-gray-500 font-medium">Uploaded: {date}</p>
                </div>
            </div>
            <Badge className={status === "VERIFIED" ? "bg-emerald-500" : "bg-amber-500 text-[10px]"}>
                {status}
            </Badge>
        </div>
    );
}
