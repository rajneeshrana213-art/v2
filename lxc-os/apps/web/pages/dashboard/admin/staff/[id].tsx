
import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import {
    Card,
    CardContent,
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
    Briefcase,
    Building2,
    ChevronLeft,
    Edit,
    FileText,
    Clock,
    Globe,
    Check,
    X,
    AlertCircle,
    MoreHorizontal,
    CreditCard,
    ShieldCheck
} from "lucide-react";
import client from "@/lib/api/client";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Loader } from "@/components/ui/feedback/Loader";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { decodeId, encodeId } from "@/lib/utils/hashId";

export default function StaffDetailsPage() {
    const router = useRouter();
    const { id: rawId } = router.query;
    const id = rawId ? decodeId(rawId as string) : undefined;
    const [staff, setStaff] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchStaffDetails();
    }, [id]);

    const fetchStaffDetails = async () => {
        try {
            setLoading(true);
            console.log(`[StaffDetailsPage] Fetching details for ID: ${id}`);
            const response = await client.get(`/v1/dashboard/admin/staff/${id}`);
            console.log(`[StaffDetailsPage] API Response:`, response.data);
            if (response.data.success) {
                setStaff(response.data.data);
            }
        } catch (err: any) {
            console.error(`[StaffDetailsPage] Fetch Error:`, err.response || err);
            toast.error(err.response?.data?.error || "Failed to load staff details");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus: string) => {
        try {
            await client.put(`/v1/dashboard/admin/staff/${id}`, { status: newStatus });
            setStaff((prev: any) => ({ ...prev, status: newStatus }));
            toast.success(`Staff status updated to ${newStatus}`);
        } catch (err: any) {
            toast.error(err.message || "Failed to update status");
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

    if (!staff) return (
        <DashboardLayout role="admin">
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
                <AlertCircle className="h-12 w-12 text-rose-500" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Staff Member Not Found</h2>
                <Button onClick={() => router.push("/dashboard/admin/staff")}>Back to Directory</Button>
            </div>
        </DashboardLayout>
    );

    const getRoleBadgeColor = (role: string) => {
        switch (role?.toLowerCase()) {
            case 'account': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'transport': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'hostel': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'library': return 'bg-violet-100 text-violet-700 border-violet-200';
            case 'driver': return 'bg-rose-100 text-rose-700 border-rose-200';
            case 'academics': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <>
            <Head>
                <title>{staff.name} - Profile | LearnXChain</title>
            </Head>
            <DashboardLayout role="admin">
                <div className="space-y-6 max-w-7xl mx-auto pb-10">
                    <div className="flex items-center justify-between">
                        <Button variant="ghost" className="gap-2" onClick={() => router.push("/dashboard/admin/staff")}>
                            <ChevronLeft className="h-4 w-4" /> Back to Staff
                        </Button>
                        <div className="flex items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-2 border-indigo-200 dark:border-gray-800 hover:bg-indigo-50 dark:hover:bg-gray-800">
                                        <MoreHorizontal className="h-4 w-4" /> Change Status
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 rounded-xl p-2 shadow-2xl border-none bg-white dark:bg-gray-900">
                                    <DropdownMenuItem className="rounded-lg text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50 dark:focus:bg-emerald-950/30 transition-colors cursor-pointer" onClick={() => handleStatusUpdate("Active")}>
                                        <Check className="mr-2 h-4 w-4" /> Mark Active
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="rounded-lg text-amber-600 focus:text-amber-600 focus:bg-amber-50 dark:focus:bg-amber-950/30 transition-colors cursor-pointer" onClick={() => handleStatusUpdate("Inactive")}>
                                        <X className="mr-2 h-4 w-4" /> Mark Inactive
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Button size="sm" className="gap-2 bg-indigo-600" onClick={() => id && router.push(`/dashboard/admin/staff/register?edit=${encodeId(id)}`)}>
                                <Edit className="h-4 w-4" /> Edit Record
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-1 space-y-6">
                            <Card className="border-none shadow-2xl bg-white dark:bg-gradient-to-br dark:from-indigo-600 dark:to-violet-700 text-gray-900 dark:text-white overflow-hidden">
                                <CardContent className="p-8 flex flex-col items-center text-center">
                                    <div className="relative group">
                                        <div className="h-32 w-32 rounded-[2.5rem] bg-indigo-50 dark:bg-white/20 backdrop-blur-md flex items-center justify-center text-5xl font-extrabold border-4 border-white dark:border-white/30 shadow-xl overflow-hidden mb-6 text-indigo-600 dark:text-white transition-all group-hover:scale-105">
                                            {staff.profilePic ? (
                                                <img src={staff.profilePic} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                staff.name.charAt(0)
                                            )}
                                        </div>
                                        <Badge className={`absolute -bottom-2 right-0 border-4 border-white dark:border-indigo-600 text-[10px] uppercase font-bold px-3 py-1 shadow-lg ${staff.status?.toLowerCase() === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                                            {staff.status || "Active"}
                                        </Badge>
                                    </div>
                                    <h2 className="text-2xl font-black tracking-tight uppercase">{staff.name}</h2>
                                    <p className="text-gray-500 dark:text-indigo-100/70 text-[10px] font-black uppercase tracking-widest mt-1 mb-4">@{staff.userName}</p>

                                    <div className="grid grid-cols-2 gap-4 w-full pt-6 border-t border-gray-100 dark:border-white/10">
                                        <div className="text-center">
                                            <p className="text-[10px] text-gray-400 dark:text-indigo-100/50 uppercase font-black tracking-widest mb-1">Role</p>
                                            <p className="font-bold text-sm capitalize">{staff.role}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] text-gray-400 dark:text-indigo-100/50 uppercase font-black tracking-widest mb-1">Sex</p>
                                            <p className="font-bold text-sm">{staff.sex}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-lg border-none">
                                <CardHeader>
                                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-gray-400">Primary Contact</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-gray-800 flex items-center justify-center text-indigo-600">
                                            <Phone className="h-4 w-4" />
                                        </div>
                                        <span className="font-medium text-gray-700 dark:text-gray-300">{staff.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-gray-800 flex items-center justify-center text-indigo-600">
                                            <Mail className="h-4 w-4" />
                                        </div>
                                        <span className="font-medium text-gray-700 dark:text-gray-300 truncate">{staff.email}</span>
                                    </div>
                                    <div className="flex items-start gap-3 text-sm">
                                        <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-gray-800 flex items-center justify-center text-indigo-600 shrink-0">
                                            <MapPin className="h-4 w-4" />
                                        </div>
                                        <span className="font-medium text-gray-700 dark:text-gray-300">{staff.address}, {staff.city}, {staff.state} - {staff.pincode}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                            <Card className="shadow-lg border-none">
                                <CardHeader className="border-b border-gray-50 dark:border-gray-800">
                                    <CardTitle className="text-lg font-bold">Profile Information</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Tabs defaultValue="overview" className="w-full">
                                        <TabsList className="bg-transparent border-b border-gray-50 dark:border-gray-800 w-full justify-start rounded-none h-12 p-0 gap-8 px-6">
                                            <TabsTrigger value="overview" className="data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 border-b-2 border-transparent rounded-none px-0 h-12 text-sm font-bold bg-transparent shadow-none">Overview</TabsTrigger>
                                            {staff.role === 'hostel' && <TabsTrigger value="hostel" className="data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 border-b-2 border-transparent rounded-none px-0 h-12 text-sm font-bold bg-transparent shadow-none">Hostel Details</TabsTrigger>}
                                            {staff.role === 'driver' && <TabsTrigger value="transport" className="data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 border-b-2 border-transparent rounded-none px-0 h-12 text-sm font-bold bg-transparent shadow-none">Transport</TabsTrigger>}
                                        </TabsList>

                                        <TabsContent value="overview" className="p-6 space-y-6">
                                            <div className="grid gap-6 md:grid-cols-2">
                                                <DetailItem icon={ShieldCheck} label="Account Status" value={staff.status || "Active"} />
                                                <DetailItem icon={Calendar} label="Date Registered" value={new Date(staff.createdAt).toLocaleDateString()} />
                                                <DetailItem icon={Clock} label="Blood Type" value={staff.bloodType || "N/A"} />
                                                <DetailItem icon={Globe} label="Country" value={staff.country || "India"} />
                                            </div>
                                        </TabsContent>

                                        {staff.role === 'hostel' && (
                                            <TabsContent value="hostel" className="p-6 space-y-6">
                                                <div className="grid gap-6 md:grid-cols-2">
                                                    <DetailItem icon={Building2} label="Hostel Name" value={staff.hostelName || "N/A"} />
                                                    <DetailItem icon={User} label="Capacity" value={staff.capacity?.toString() || "N/A"} />
                                                </div>
                                            </TabsContent>
                                        )}

                                        {staff.role === 'driver' && (
                                            <TabsContent value="transport" className="p-6 space-y-6">
                                                <div className="grid gap-6 md:grid-cols-2">
                                                    <DetailItem icon={FileText} label="License Number" value={staff.license || "N/A"} />
                                                    <DetailItem icon={Briefcase} label="Bus ID" value={staff.busId || "N/A"} />
                                                </div>
                                            </TabsContent>
                                        )}
                                    </Tabs>
                                </CardContent>
                            </Card>
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
