
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
import { ChevronLeft, CheckCircle2, XCircle, User, Users, GraduationCap, Home, HeartPulse, Calendar, Mail, Phone, MapPin, AlertCircle, Info, CheckCircle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import client from "@/lib/api/client";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/forms/input";
import Loader from '@/components/ui/feedback/Loader';
import { decodeId } from "@/lib/utils/hashId";

export default function RegistrationRequestDetailPage() {
    const router = useRouter();
    const { id: rawId } = router.query;
    const id = rawId ? decodeId(rawId as string) : undefined;
    const [request, setRequest] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [isRejecting, setIsRejecting] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);

    useEffect(() => {
        if (id) {
            fetchRequest();
        }
    }, [id]);

    const fetchRequest = async () => {
        try {
            setLoading(true);
            const response = await client.get(`/v1/admin/core/registration/requests/${id}`);
            setRequest(response.data);
        } catch (err: any) {
            toast.error("Failed to load request details");
            router.push('/dashboard/admin/students/registrations');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        try {
            setProcessing(true);
            await client.post(`/v1/admin/core/registration/requests/${id}/approve`);
            toast.success("Registration approved and student created!");
            setShowApproveModal(false);
            fetchRequest();
        } catch (err: any) {
            toast.error(err.response?.data?.error || err.message || "Approval failed");
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!rejectReason) {
            toast.error("Please provide a reason for rejection");
            return;
        }

        try {
            setProcessing(true);
            await client.post(`/v1/admin/core/registration/requests/${id}/reject`, { reason: rejectReason });
            toast.success("Registration request rejected");
            setIsRejecting(false);
            fetchRequest();
        } catch (err: any) {
            toast.error(err.response?.data?.error || err.message || "Rejection failed");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout role="admin">
                <div className="flex h-[70vh] items-center justify-center">
                    <Loader className="" />
                </div>
            </DashboardLayout>
        );
    }

    if (!request) return null;

    const data = request.formData;

    return (
        <DashboardLayout role="admin">
            <Head>
                <title>Request Detail - {data.name}</title>
            </Head>

            <div className="space-y-8 pb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col">
                        <button
                            onClick={() => router.push('/dashboard/admin/students/registrations')}
                            className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-indigo-600 transition-colors uppercase tracking-widest mb-2"
                        >
                            <ChevronLeft className="h-3 w-3" /> Back to Queue
                        </button>
                        <div className="flex items-center gap-4">
                            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                {data.name}
                            </h1>
                            <Badge
                                tone={request.status === "PENDING" ? "warning" : request.status === "APPROVED" ? "success" : "danger"}
                                variant="soft"
                                className="font-black uppercase tracking-widest text-[10px] px-4 py-1.5"
                            >
                                {request.status}
                            </Badge>
                        </div>
                    </div>

                    {request.status === "PENDING" && (
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                className="gap-2 border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-900/10 text-rose-600 font-bold px-6 shadow-sm shadow-rose-100"
                                onClick={() => setIsRejecting(true)}
                                disabled={processing}
                            >
                                <XCircle className="h-4 w-4" /> Reject Submission
                            </Button>
                            <Button
                                className="gap-2 bg-indigo-600 hover:bg-indigo-700 font-bold px-8 shadow-xl shadow-indigo-500/20"
                                onClick={() => setShowApproveModal(true)}
                                disabled={processing}
                            >
                                <CheckCircle2 className="h-4 w-4" /> Approve & Register Student
                            </Button>
                        </div>
                    )}
                </div>

                <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
                    <DialogContent className="max-w-md rounded-[2.5rem] p-8">
                        <DialogHeader>
                            <div className="h-16 w-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-3xl flex items-center justify-center mb-6">
                                <CheckCircle className="h-8 w-8 text-indigo-600" />
                            </div>
                            <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                                Confirm Approval
                            </DialogTitle>
                            <DialogDescription className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-4">
                                Are you sure you want to approve <span className="text-indigo-600 font-bold">{data.name}</span>'s registration?
                                This will automatically:
                                <ul className="mt-4 space-y-2">
                                    <li className="flex items-start gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-600 mt-1.5" />
                                        <span>Create a student record</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-600 mt-1.5" />
                                        <span>Create a parent account</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-600 mt-1.5" />
                                        <span>Send login credentials via email</span>
                                    </li>
                                </ul>
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-8 flex gap-3">
                            <Button
                                variant="ghost"
                                onClick={() => setShowApproveModal(false)}
                                className="flex-1 font-bold text-slate-500 rounded-2xl h-12"
                                disabled={processing}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleApprove}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 font-bold text-white rounded-2xl h-12 shadow-xl shadow-indigo-500/20"
                                disabled={processing}
                            >
                                {processing ? <Loader className="" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                                Confirm & Register
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {isRejecting && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="border-none shadow-xl bg-rose-50 dark:bg-rose-950/20 border-l-4 border-l-rose-500 rounded-3xl p-6">
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-2 text-rose-600 font-black uppercase tracking-widest text-xs">
                                    <AlertCircle className="h-4 w-4" /> Rejection Reason
                                </div>
                                <Input
                                    placeholder="Enter reason for rejection (this will be sent to the student)..."
                                    value={rejectReason}
                                    onChange={(e: any) => setRejectReason(e.target.value)}
                                    className="bg-white border-rose-100 dark:bg-slate-900 ring-rose-50"
                                />
                                <div className="flex items-center gap-2 justify-end">
                                    <Button variant="ghost" className="text-gray-500 font-bold" onClick={() => setIsRejecting(false)}>Cancel</Button>
                                    <Button className="bg-rose-600 hover:bg-rose-700 font-bold" onClick={handleReject} disabled={processing}>Confirm Rejection</Button>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                )}

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Primary Details */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            <Card className="border-none shadow-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-[2.5rem] p-8">
                                <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 mb-6 flex items-center gap-2">
                                    <User className="h-4 w-4" /> Student Info
                                </h3>
                                <div className="space-y-6">
                                    <DetailRow icon={Mail} label="Email" value={data.email} />
                                    <DetailRow icon={Phone} label="Phone" value={data.phone} />
                                    <DetailRow
                                        icon={Calendar}
                                        label="Date of Birth"
                                        value={data.dateOfBirth ? new Date(data.dateOfBirth).toLocaleDateString() : "—"}
                                    />
                                    <DetailRow icon={Info} label="Blood Group" value={data.bloodType} />
                                    <DetailRow icon={Info} label="Gender" value={data.sex} />
                                </div>
                            </Card>

                            <Card className="border-none shadow-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-[2.5rem] p-8">
                                <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 mb-6 flex items-center gap-2">
                                    <GraduationCap className="h-4 w-4" /> Academic Intent
                                </h3>
                                <div className="space-y-6">
                                    <DetailRow label="Requested Class" value={data.className || "Class ID: " + data.classId} />
                                    <DetailRow label="Academic Year" value={data.academicYear} />
                                    <DetailRow label="Admission No" value="Will be auto-generated" />
                                </div>
                            </Card>
                        </div>

                        <Card className="border-none shadow-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-[2.5rem] p-10">
                            <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 mb-8 flex items-center gap-2">
                                <Users className="h-4 w-4" /> Family & Guardians
                            </h3>
                            <div className="space-y-8">
                                <div className="p-8 rounded-3xl bg-indigo-50/50 dark:bg-indigo-950/20 ring-1 ring-indigo-100 dark:ring-indigo-900">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-3">
                                            <div className="h-1 w-6 bg-indigo-600 rounded-full" />
                                            <h4 className="text-xs font-black uppercase tracking-widest text-indigo-600">Primary Parent / Guardian</h4>
                                        </div>
                                        <span className="text-[10px] font-black bg-indigo-600 text-white px-3 py-1 rounded-full uppercase tracking-widest">Primary Contact</span>
                                    </div>
                                    <div className="grid md:grid-cols-3 gap-8">
                                        <DetailRow label="Name" value={data.guardianName} />
                                        <DetailRow label="Phone" value={data.guardianPhone} />
                                        <DetailRow label="Email" value={data.guardianEmail} />
                                        <DetailRow label="Relation to Student" value={data.guardianRelation} />
                                    </div>
                                </div>

                                <div className="p-6 rounded-2xl bg-amber-50/30 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                                    <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase tracking-widest">
                                        Note: This contact will be used for the parent account and all automated communications.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Secondary Details */}
                    <div className="space-y-8">
                        <Card className="border-none shadow-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-[2.5rem] p-8">
                            <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 mb-6 flex items-center gap-2">
                                <Home className="h-4 w-4" /> Address
                            </h3>
                            <div className="space-y-6">
                                <DetailRow icon={MapPin} label="Full Address" value={data.currentAddress} />
                                <div className="grid grid-cols-2 gap-4">
                                    <DetailRow label="City" value={data.city} />
                                    <DetailRow label="State" value={data.state} />
                                    <DetailRow label="Pincode" value={data.pincode} />
                                </div>
                            </div>
                        </Card>

                        <Card className="border-none shadow-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/20 rounded-[2.5rem] p-8">
                            <h3 className="text-xs font-black uppercase tracking-widest text-rose-600 mb-6 flex items-center gap-2">
                                <HeartPulse className="h-4 w-4" /> Health Disclosure
                            </h3>
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">Medical Condition</span>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{data.medicalCondition || "None Reported"}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">Allergies</span>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{data.allergies || "None Reported"}</p>
                                </div>
                            </div>
                        </Card>

                        {request.adminRemark && (
                            <Card className="border-none shadow-xl bg-gray-50 dark:bg-gray-800/50 rounded-[2.5rem] p-8">
                                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                                    <Info className="h-4 w-4" /> Admin Remark
                                </h3>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 italic">"{request.adminRemark}"</p>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function DetailRow({ label, value, icon: Icon }: { label: string, value: string, icon?: any }) {
    return (
        <div className="flex flex-col gap-1.5 min-w-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                {Icon && <Icon className="h-3 w-3" />}
                {label}
            </span>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate" title={value}>{value || "—"}</p>
        </div>
    );
}

